/**
 * Pull-claim dispatch (Implementer D) — the heart of orchestration.
 *
 * Ordering replicates `issues_with_status()` in scripts/fg-common.sh
 * (L152–167; `available_issues()` L169 is the `status: available` call this
 * mirrors — the shared comment block L129–151 documents the intent). The jq
 * → TypeScript mapping, clause by clause:
 *
 *  - L156 `def names` — an issue's label names; the mirror stores them as
 *    `labels: string[]` already.
 *  - L157 `def is_high` — carries the exact label "priority: high".
 *  - L158 `def stream_key` — the FIRST label starting "stream:" with the
 *    prefix stripped, else the issue's own number as a string
 *    (`streamKeyOf` below).
 *  - L159–160 `$jump` — computed over the WHOLE open queue (any status, any
 *    stage; only `is_high` and not "do-not-automate" filter it): group the
 *    high issues by stream_key, order groups by their OLDEST high item's
 *    createdAt (`sort_by(map(.createdAt) | min)` — jq compares ISO strings,
 *    so we compare strings too), keep the first HIGH_PRIORITY_CAP groups
 *    (`.[:$cap]`, config.highPriorityCap here), and flatten to issue
 *    numbers. `$jump` is then used purely for MEMBERSHIP (`index($n)`), so
 *    we build a Set.
 *  - L161–164 candidate filter — has the status label ("status: available"
 *    for dispatch), not "do-not-automate", and the stage filter. Dispatch
 *    generalises the shell's single `$stage` to a set: the issue's
 *    "stage: <s>" must be one of the requested stages (default
 *    research/ideate/build). "stage: discover" is NEVER dispatchable
 *    (ADR-0014) — it is not in DISPATCHABLE_STAGES and is excluded even if a
 *    caller asks for it.
 *  - L165 `sort_by(($jump | index($n)) | not), .createdAt)` — jump members
 *    first (false < true), then everything oldest-createdAt first (ISO
 *    string compare, matching jq). Deliberate deviation: jq's stable sort
 *    leaves equal-createdAt issues in snapshot order, which depends on the
 *    GitHub REST response; we tie-break by issue number ascending so every
 *    server orders identically.
 *
 * Claim loop, per candidate in order (spec "Dispatch semantics"):
 *  1. `SET lease:issue:<n> <assignmentId> NX EX leaseTtlSeconds` — miss →
 *     next candidate.
 *  2. GitHub writes: add "status: claimed", remove "status: available", add
 *     assignee = registry handle. A 404 removing "status: available" = a
 *     label-path rival already claimed it → free the lease, next candidate.
 *     Rate-limit → DEL lease, abort 429; permission 403 / silently-ignored
 *     assignee → undo, DEL lease, abort "disabled" (503 — a misconfigured
 *     token/handle must not walk the whole queue); any other 4xx → best-
 *     effort undo of partial writes (BEFORE freeing the lease, which is what
 *     serialises label writers), next candidate; 5xx/network → DEL lease and
 *     rethrow (the route answers a redacted 5xx).
 *  3. Insert the assignment, optimistically update the mirror, emit a
 *     "claim" event to the fleet feed. A store failure here rolls the GitHub
 *     claim back (labels, assignee, lease) and rethrows.
 */
import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import { config } from "../config.js";
import { GitHubApiError } from "../github/gh-api.js";
import { mergeReviewEntriesInto, PULL_REVIEWS_CAP, type PullDoc, type PullReviewEntry } from "../github/sync.js";
import type { ClaimedIssue, ClaimedReview } from "../protocol.js";
import type { FleetStore } from "../state.js";
import type { AgentTier } from "./auth.js";
import { leaseKey, reviewCooldownKey, reviewLeaseKey, type Orchestrator } from "./stores.js";

const AVAILABLE_LABEL = "status: available";
const CLAIMED_LABEL = "status: claimed";
const DO_NOT_AUTOMATE_LABEL = "do-not-automate";
const HIGH_PRIORITY_LABEL = "priority: high";
const STAGE_PREFIX = "stage: ";
const STREAM_PREFIX = "stream:";
/** The stages dispatch may ever serve — discover is excluded by construction
 *  (ADR-0014 capability floor; frame_work.sh owns discover roots). */
const DISPATCHABLE_STAGES = ["research", "ideate", "build"] as const;

// Review dispatch (kind: "review", ADR-0019) — the skip rules replicate
// scripts/review_work.sh; citations name the shell symbol first (grep for
// it) with the line number of THIS branch's file as a secondary hint.
/** review_work.sh HUMAN_ONLY_LABEL (L84): PRs a human maintainer reviews and
 *  merges — never this loop (also skipped in review_one's human-only case,
 *  L434–439). */
const HUMAN_ONLY_LABEL = "review: human-only";
/** review_work.sh REVIEW_CLAIMING_LABEL (L83): a walk-based reviewer is
 *  holding this PR (label-path claim, claim_pr(), L136–170). Dispatch skips
 *  it rather than double-reviewing; the walk's own TTL/stale-takeover
 *  (review_claim_age(), L124–145) frees a crashed walker's label, after
 *  which the PR becomes dispatchable again. */
const REVIEW_CLAIMED_LABEL = "review: claimed";
// The review-round cap is config.maxReviewRounds (env MAX_REVIEW_ROUNDS —
// the SAME env var the shell reads at review_work.sh L86, so an operator
// override can't diverge the two); the cap check itself is in
// claimNextReview, mirroring review_one's round-cap block (L456–470, #287).
/** Lazy review-state fetch budget: at most this many candidates get a
 *  `GET /pulls/{n}/reviews` per claim call (spec "Mirror gains review
 *  state"). Candidates beyond the budget whose review state is unknown are
 *  skipped this pass — the fetches they got persist, so the next claim
 *  starts further down the list. */
const REVIEW_FETCH_BUDGET = 10;

/** Mirror `issues` doc (see the data model in stores.ts / the spec). */
interface IssueDoc {
  _id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  labels: string[];
  assignees: string[];
  body?: string | null;
  user: string | null;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  syncedAt?: string;
}

/** `assignments` audit doc. Dates are ISO strings (JSON-friendly, matching
 *  the mirror docs). harness/model are additive audit context from the claim
 *  request — not in the spec's minimum shape, but public and useful. */
interface AssignmentDoc {
  _id: ObjectId;
  /** What was claimed. Docs from before review dispatch carry no field —
   *  absent = "work" (read via kindOf below). */
  kind?: "work" | "review";
  /** For kind "work" the issue number; for kind "review" the PR NUMBER
   *  (GitHub numbers issues and PRs from one sequence, so the two kinds can
   *  never collide on a number). */
  issueNumber: number;
  handle: string;
  tier: AgentTier;
  agentId?: string;
  harness?: string;
  model?: string;
  claimedAt: string;
  renewedAt: string;
  active: boolean;
  /** False when GitHub silently dropped the assignee (handle without repo
   *  access — normal for auto-enrolled outside contributors). Missing on
   *  docs from before this field existed = assignee was set. */
  assigneeSet?: boolean;
  releasedAt?: string;
  outcome?: ReleaseOutcome;
  prNumber?: number;
  /** Set when a label revert failed transiently (e.g. a GitHub rate-limit
   *  burst at sweep time); the sweeper retries it every pass until it lands. */
  revertPending?: boolean;
}

/** Who is claiming, plus optional filters from claimRequestSchema. */
export interface ClaimContext {
  handle: string;
  tier: AgentTier;
  /** Stage filter; default ["research", "ideate", "build"]. Never discover. */
  stages?: string[];
  harness?: string;
  model?: string;
  agentId?: string;
}

export type ClaimResult =
  | { status: "claimed"; issue: ClaimedIssue; assignmentId: string; leaseTtlSeconds: number }
  /** This handle already holds `maxActiveClaims` active assignments —
   *  bounds how much of the queue one (auto-enrolled) identity can sit on. */
  | { status: "capped" }
  /** Queue empty — the route answers `{ok:true, issue:null}`. */
  | { status: "empty" }
  /** GitHub rate-limited mid-claim — the route answers 429. */
  | { status: "rate-limited"; retryAfterSeconds: number }
  /** Orchestration up but no githubToken — the route answers 503. */
  | { status: "disabled"; reason: string };

/** claimNextReview's result — shaped like ClaimResult with `review` in place
 *  of `issue` (the route maps the statuses identically). */
export type ClaimReviewResult =
  | { status: "claimed"; review: ClaimedReview; assignmentId: string; leaseTtlSeconds: number }
  | { status: "capped" }
  | { status: "empty" }
  | { status: "rate-limited"; retryAfterSeconds: number }
  | { status: "disabled"; reason: string };

export type ReleaseOutcome = "done" | "abandoned" | "lease-expired" | "admin-released";

export type AssignmentKind = "work" | "review";

const nowIso = () => new Date().toISOString();

function issuesCol(orch: Orchestrator): Collection<IssueDoc> {
  return orch.db.collection<IssueDoc>("issues");
}

function pullsCol(orch: Orchestrator): Collection<PullDoc> {
  return orch.db.collection<PullDoc>("pulls");
}

function assignmentsCol(orch: Orchestrator): Collection<AssignmentDoc> {
  return orch.db.collection<AssignmentDoc>("assignments");
}

/** An assignment's kind — docs from before review dispatch default "work". */
function kindOf(doc: Pick<AssignmentDoc, "kind">): AssignmentKind {
  return doc.kind ?? "work";
}

/** Mongo filter clause matching assignments of `kind` (absent = work). */
function kindFilter(kind: AssignmentKind): Record<string, unknown> {
  return kind === "review" ? { kind: "review" } : { kind: { $ne: "review" } };
}

/** The Redis lease key an assignment doc arbitrates on. */
function assignmentLeaseKey(doc: Pick<AssignmentDoc, "kind" | "issueNumber">): string {
  return kindOf(doc) === "review" ? reviewLeaseKey(doc.issueNumber) : leaseKey(doc.issueNumber);
}

/** The lease TTL for an assignment kind. */
function kindLeaseTtl(kind: AssignmentKind): number {
  return kind === "review" ? config.reviewLeaseTtlSeconds : config.leaseTtlSeconds;
}

/** First "stage: <s>" label value, or null (fg-common.sh `label_field`). */
function stageOf(labels: string[]): string | null {
  const label = labels.find((l) => l.startsWith(STAGE_PREFIX));
  return label ? label.slice(STAGE_PREFIX.length) : null;
}

/** First "stream:<n>" label value, or null. */
function streamOf(labels: string[]): string | null {
  const label = labels.find((l) => l.startsWith(STREAM_PREFIX));
  return label ? label.slice(STREAM_PREFIX.length) : null;
}

/** fg-common.sh L158 `stream_key`: the stream label value, else the issue's
 *  own number — so unstreamed high issues each occupy their own cap slot. */
function streamKeyOf(issue: IssueDoc): string {
  return streamOf(issue.labels) ?? String(issue.number);
}

/**
 * Normalise a requested stage filter. No/empty filter → all dispatchable
 * stages. A filter that names only non-dispatchable stages (e.g. "discover")
 * matches nothing — it does NOT silently widen back to the default.
 */
function normalizeStages(stages?: string[]): string[] {
  if (!stages || stages.length === 0) return [...DISPATCHABLE_STAGES];
  return stages.filter((s) => (DISPATCHABLE_STAGES as readonly string[]).includes(s));
}

/** fg-common.sh L159–160: the bounded priority-jump membership set. */
function jumpSet(openIssues: IssueDoc[], cap: number): Set<number> {
  const high = openIssues.filter(
    (i) => i.labels.includes(HIGH_PRIORITY_LABEL) && !i.labels.includes(DO_NOT_AUTOMATE_LABEL),
  );
  const groups = new Map<string, IssueDoc[]>();
  for (const issue of high) {
    const key = streamKeyOf(issue);
    const group = groups.get(key);
    if (group) group.push(issue);
    else groups.set(key, [issue]);
  }
  // jq's group_by(stream_key) sorts groups by key first; the stable
  // sort_by(min createdAt) then means equal-oldest groups tie-break by
  // stream key string order — replicate both.
  const ordered = [...groups.entries()]
    .map(([key, issues]) => ({
      key,
      min: issues.reduce((m, i) => (i.createdAt < m ? i.createdAt : m), issues[0]?.createdAt ?? ""),
      issues,
    }))
    .sort((a, b) => {
      if (a.min !== b.min) return a.min < b.min ? -1 : 1;
      return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    });
  const jump = new Set<number>();
  for (const group of ordered.slice(0, Math.max(cap, 0))) {
    for (const issue of group.issues) jump.add(issue.number);
  }
  return jump;
}

/** The full dispatch ordering over the mirror (fg-common.sh L152–167). */
async function orderedCandidates(orch: Orchestrator, stages?: string[]): Promise<IssueDoc[]> {
  const wanted = normalizeStages(stages);
  if (wanted.length === 0) return [];
  // One query serves both the jump computation (whole open queue) and the
  // candidate filter — the open queue is a few hundred docs at most. Bodies
  // (up to 65k chars each) are deliberately excluded from the full scan and
  // fetched below for the filtered candidate set only, so an unauthenticated
  // GET /api/v1/queue never materializes every open issue body from Mongo.
  const open = await issuesCol(orch)
    .find({ state: "open" }, { projection: { body: 0 } })
    .toArray();
  const jump = jumpSet(open, config.highPriorityCap);

  const candidates = open.filter((i) => {
    if (!i.labels.includes(AVAILABLE_LABEL)) return false;
    if (i.labels.includes(DO_NOT_AUTOMATE_LABEL)) return false;
    const stage = stageOf(i.labels);
    return stage !== null && wanted.includes(stage);
  });

  // L165: jump members first, then oldest-createdAt (ISO string compare like
  // jq); issue number ascending as the deterministic tie-break (see module doc).
  const ordered = candidates.sort((a, b) => {
    const jumpA = jump.has(a.number) ? 0 : 1;
    const jumpB = jump.has(b.number) ? 0 : 1;
    if (jumpA !== jumpB) return jumpA - jumpB;
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
    return a.number - b.number;
  });

  if (ordered.length > 0) {
    const bodies = await issuesCol(orch)
      .find({ _id: { $in: ordered.map((i) => i.number) } }, { projection: { body: 1 } })
      .toArray();
    const byId = new Map(bodies.map((b) => [b._id, b.body ?? ""]));
    for (const c of ordered) c.body = byId.get(c.number) ?? "";
  }
  return ordered;
}

function toClaimedIssue(doc: IssueDoc): ClaimedIssue {
  return {
    number: doc.number,
    title: doc.title,
    labels: doc.labels,
    body: doc.body ?? "",
    htmlUrl: doc.htmlUrl,
    stage: stageOf(doc.labels),
    stream: streamOf(doc.labels),
  };
}

/** Compare-and-delete: free the lease only if it still belongs to this
 *  assignment — never clobber a rival's newer lease on the same issue. */
const RELEASE_LEASE_LUA =
  'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end';

async function delLeaseIfOwned(orch: Orchestrator, key: string, assignmentId: string): Promise<void> {
  await orch.redis.eval(RELEASE_LEASE_LUA, 1, key, assignmentId);
}

/** Claim the next eligible issue for this agent (see module doc for the
 *  ordering + claim-loop contract). `store` receives the "claim" feed event. */
export async function claimNext(
  orch: Orchestrator,
  store: FleetStore,
  ctx: ClaimContext,
): Promise<ClaimResult> {
  const gh = orch.gh;
  if (!gh) return { status: "disabled", reason: "no github token" };

  // Anti-grief bound for auto-enrolled identities (ADR-0017): one handle can
  // hold at most maxActiveClaims live assignments. Checked before any lease
  // is taken so a capped agent costs one Mongo count, nothing else.
  const activeCount = await assignmentsCol(orch).countDocuments({ handle: ctx.handle, active: true });
  if (activeCount >= config.maxActiveClaims) return { status: "capped" };

  const candidates = await orderedCandidates(orch, ctx.stages);
  const ttl = config.leaseTtlSeconds;

  for (const candidate of candidates) {
    const n = candidate.number;
    const assignmentId = new ObjectId();
    const idStr = assignmentId.toHexString();

    // 1. Atomic lease — the arbiter that kills the label-claim race.
    const took = await orch.redis.set(leaseKey(n), idStr, "EX", ttl, "NX");
    if (took !== "OK") continue; // someone else holds it — next candidate

    // 2. GitHub is the durable truth: if the label writes fail, the claim
    //    fails and the lease is released. Undo writes happen BEFORE the lease
    //    is freed — the lease is what serialises label writers per issue, so
    //    a rival's immediate re-claim can never have its fresh
    //    "status: claimed" stripped by our late-arriving undo.
    // Remove "status: available" FIRST: GitHub 404s the second remover, so a
    // successful removal is a test-and-set that arbitrates against label-path
    // workers AND against a stale mirror in one write. A candidate whose live
    // issue already moved on (in-review / changes-requested / closed) 404s
    // before we have written ANYTHING — the previous claimed-first order
    // deposited "status: claimed" on top of whatever status the live issue
    // held whenever the mirror lagged (PR #592 review). The cost is a
    // one-HTTP-call crash window where the issue is briefly status-less; the
    // issue-status reconciler converges that, and it beats corrupting live
    // state on every stale candidate.
    let step = 0;
    let assigneeSet = false;
    try {
      const removedAvailable = await gh.removeLabel(n, AVAILABLE_LABEL);
      if (!removedAvailable) {
        // 404: the live issue is no longer "status: available" — a rival
        // claimed it or the mirror is stale. Nothing was written; free the
        // lease, refresh the mirror doc best-effort, next candidate.
        await delLeaseIfOwned(orch, leaseKey(n), idStr).catch(() => undefined);
        continue;
      }
      step = 1; // available removed — from here, undo means re-adding it
      await gh.addLabels(n, [CLAIMED_LABEL]);
      step = 2; // claimed added — undo removes it too
      try {
        await gh.addAssignees(n, [ctx.handle]);
        assigneeSet = true;
      } catch (err) {
        if (err instanceof GitHubApiError && err.code === "assignee-ignored") {
          // GitHub silently drops assignees without repo access — NORMAL for
          // auto-enrolled outside contributors (they can't be assignees on
          // the label path either). The lease + assignment doc carry the
          // claim identity; the labels still gate the queue. Proceed.
        } else {
          throw err;
        }
      }
    } catch (err) {
      // Best-effort undo of any partial write, on EVERY failure path (while
      // still holding the lease — see above). Available-first means a
      // failure after step 1 leaves the issue status-less if the undo is
      // skipped, and nothing converges a status-less issue — so even the
      // rate-limited and 5xx paths must try (their undo writes may fail too;
      // swallowed, the reconciler is the last resort).
      const undoPartialWrites = async (): Promise<void> => {
        if (step >= 2) await gh.removeLabel(n, CLAIMED_LABEL).catch(() => undefined);
        if (step >= 1) await gh.addLabels(n, [AVAILABLE_LABEL]).catch(() => undefined);
      };
      if (err instanceof GitHubApiError && err.isRateLimit) {
        await undoPartialWrites();
        await delLeaseIfOwned(orch, leaseKey(n), idStr).catch(() => undefined);
        return { status: "rate-limited", retryAfterSeconds: err.retryAfterSeconds ?? 60 };
      }
      if (err instanceof GitHubApiError && err.status === 403) {
        // Misconfiguration, not a per-issue failure: the BOT token lacks
        // write access (a permission 403 — isRateLimit already excluded the
        // quota case; an unassignable HANDLE is handled inline above and
        // never aborts). Undo, free the lease, and ABORT the claim rather
        // than burning one failing GitHub write per candidate across the
        // whole queue.
        await undoPartialWrites();
        await delLeaseIfOwned(orch, leaseKey(n), idStr).catch(() => undefined);
        return { status: "disabled", reason: "github token lacks write access" };
      }
      if (err instanceof GitHubApiError && err.status >= 400 && err.status < 500) {
        // Per-issue 4xx: undo, free the lease, try the next candidate.
        await undoPartialWrites();
        await delLeaseIfOwned(orch, leaseKey(n), idStr).catch(() => undefined);
        continue;
      }
      await undoPartialWrites();
      await delLeaseIfOwned(orch, leaseKey(n), idStr).catch(() => undefined);
      throw err; // 5xx / network — surface to the route; lease is freed
    }

    // 3. Durable audit + optimistic mirror + fleet feed. The GitHub claim is
    //    already committed, so a store failure here must roll the claim back
    //    (labels, assignee, lease) — otherwise the issue strands
    //    "status: claimed" with no lease-backed assignment, invisible to the
    //    sweeper, until reap.sh's hours-scale TTL frees it.
    const now = nowIso();
    const assignment: AssignmentDoc = {
      _id: assignmentId,
      issueNumber: n,
      handle: ctx.handle,
      tier: ctx.tier,
      ...(ctx.agentId ? { agentId: ctx.agentId } : {}),
      ...(ctx.harness ? { harness: ctx.harness } : {}),
      ...(ctx.model ? { model: ctx.model } : {}),
      claimedAt: now,
      renewedAt: now,
      active: true,
      assigneeSet,
    };
    const labels = candidate.labels.filter((l) => l !== AVAILABLE_LABEL);
    if (!labels.includes(CLAIMED_LABEL)) labels.push(CLAIMED_LABEL);
    // Mirror only what GitHub actually holds: an unassignable handle
    // (assigneeSet=false) must not appear in the mirror's assignees, or the
    // renew guard would trust an assignee GitHub never accepted.
    const assignees = !assigneeSet || candidate.assignees.includes(ctx.handle)
      ? candidate.assignees
      : [...candidate.assignees, ctx.handle];
    try {
      await assignmentsCol(orch).insertOne(assignment);
      await issuesCol(orch).updateOne({ _id: n }, { $set: { labels, assignees, updatedAt: now } });
    } catch (err) {
      await assignmentsCol(orch).deleteOne({ _id: assignmentId }).catch(() => undefined);
      await revertClaimLabels(orch, n, ctx.handle).catch(() => undefined);
      await delLeaseIfOwned(orch, leaseKey(n), idStr).catch(() => undefined);
      throw err; // the route answers 5xx honestly — the claim did NOT happen
    }

    store.addEvent("claim", `@${ctx.handle} claimed #${n} — ${candidate.title}`, {
      handle: ctx.handle,
      ...(ctx.harness ? { harness: ctx.harness } : {}),
      ref: `#${n}`,
    });

    return {
      status: "claimed",
      issue: toClaimedIssue({ ...candidate, labels, assignees }),
      assignmentId: idStr,
      leaseTtlSeconds: ttl,
    };
  }

  return { status: "empty" };
}

/** REST review states (UPPER CASE) → mirror entry states. "PENDING" is an
 *  unsubmitted draft, not review state — it maps to nothing and is dropped. */
const REST_REVIEW_STATES: Record<string, PullReviewEntry["state"]> = {
  APPROVED: "approved",
  CHANGES_REQUESTED: "changes_requested",
  COMMENTED: "commented",
  DISMISSED: "dismissed",
};

function toClaimedReview(doc: PullDoc): ClaimedReview {
  return {
    pr: doc.number,
    title: doc.title,
    author: doc.user,
    headSha: doc.headSha,
    htmlUrl: doc.htmlUrl,
    baseRef: doc.baseRef,
    headRef: doc.headRef,
  };
}

/**
 * Claim the next open PR needing an adversarial review (kind: "review",
 * ADR-0019) — claimNext's shape, minus the GitHub label writes: the Redis
 * lease `lease:review:<pr>` is the ONLY claim artifact (reviews hold no
 * labels), so a claim costs zero GitHub writes and at most a few lazy
 * review-state READS plus one liveness read for the winning candidate.
 *
 * Candidate selection approximates review_work.sh's skip rules over the
 * mirror (shell symbols + this branch's line numbers cited inline): open,
 * non-draft PRs (open_prs_needing_review(), L389–392) without
 * "review: human-only" (the jq filter at L391 + review_one's case at
 * L434–439), "do-not-automate", or a walk-based reviewer's "review: claimed"
 * (claim_pr(), L136–170); never authored by the claiming handle (the
 * INTEGRITY check, L441–447); not already reviewed at the current head
 * (the check_state block, L448–455 — see the honest-divergence note at the
 * skip below); under the review-round cap (L456–470, #287); and not inside
 * the post-abandon cooldown (no shell equivalent — it stops a PR every
 * runner locally skips from pinning the head of this deterministic queue).
 * Oldest createdAt first, PR number as the deterministic tie-break. The
 * winning candidate is verified still open against LIVE GitHub before it is
 * handed out — a stale mirror (lost `closed` webhook) must not cost a full
 * agent review of a merged PR.
 */
export async function claimNextReview(
  orch: Orchestrator,
  store: FleetStore,
  ctx: ClaimContext,
): Promise<ClaimReviewResult> {
  const gh = orch.gh;
  if (!gh) return { status: "disabled", reason: "no github token" };

  // Same anti-grief bound as claimNext, over BOTH kinds: one handle holds at
  // most maxActiveClaims live assignments, work and reviews combined.
  const activeCount = await assignmentsCol(orch).countDocuments({ handle: ctx.handle, active: true });
  if (activeCount >= config.maxActiveClaims) return { status: "capped" };

  const open = await pullsCol(orch).find({ state: "open" }).toArray();
  const candidates = open
    .filter(
      (p) =>
        !p.draft &&
        !(p.labels ?? []).includes(HUMAN_ONLY_LABEL) &&
        !(p.labels ?? []).includes(DO_NOT_AUTOMATE_LABEL) &&
        !(p.labels ?? []).includes(REVIEW_CLAIMED_LABEL) &&
        p.user !== ctx.handle,
    )
    .sort((a, b) => {
      if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
      return a.number - b.number;
    });

  // Post-abandon cooldowns, one MGET for the whole candidate page: a PR whose
  // last claim was released `abandoned` (the runner skipped it locally —
  // already passed at head, author == the runner's gh identity, parked) is
  // parked out of dispatch for reviewAbandonCooldownSeconds. Without this,
  // the oldest such PR is re-served to every runner on every pass: claim →
  // local skip → abandon → re-claim, burning a claim + an assignment doc per
  // runner per pass while never converging.
  const cooldowns =
    candidates.length > 0
      ? await orch.redis.mget(candidates.map((c) => reviewCooldownKey(c.number)))
      : [];

  const ttl = config.reviewLeaseTtlSeconds;
  let fetchBudget = REVIEW_FETCH_BUDGET;

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    if (!candidate) continue; // noUncheckedIndexedAccess appeasement — i is in range
    const n = candidate.number;
    if (cooldowns[i] !== null && cooldowns[i] !== undefined) continue; // cooling down after an abandoned claim

    // A partially-upserted doc (sync's /issues fallback path) carries no
    // head SHA yet — "reviewed at this revision" can't be evaluated and the
    // runner can't check the head out. Skip; the next full sync repairs it.
    const headSha = candidate.headSha;
    if (!headSha) continue;

    // Lazy review-state fetch: the REST pulls list never carries reviews, so
    // a doc with NO data for its current head gets one GET /pulls/:n/reviews,
    // persisted with reviewsFetchedFor = headSha (fetch once per revision).
    // Bounded to REVIEW_FETCH_BUDGET candidates per claim call.
    let reviews = candidate.reviews ?? [];
    const hasDataForHead =
      candidate.reviewsFetchedFor === headSha || reviews.some((r) => r.commitId === headSha);
    if (!hasDataForHead) {
      if (fetchBudget <= 0) continue; // state unknown, budget spent — next claim resumes here
      fetchBudget--;
      let fetched;
      try {
        fetched = await gh.listPullReviews(n);
      } catch (err) {
        if (err instanceof GitHubApiError && err.isRateLimit) {
          return { status: "rate-limited", retryAfterSeconds: err.retryAfterSeconds ?? 60 };
        }
        // A read failure on ONE candidate (PR deleted → 404, transient 5xx)
        // must not fail the whole claim: skip it without persisting
        // reviewsFetchedFor, so a later pass retries the fetch.
        console.error(`dispatch: review-state fetch failed for PR #${n}:`, err);
        continue;
      }
      const entries: PullReviewEntry[] = [];
      for (const r of fetched) {
        const state = REST_REVIEW_STATES[(r.state ?? "").toUpperCase()];
        if (!state || !r.user?.login || !r.commit_id) continue;
        entries.push({ reviewer: r.user.login, state, commitId: r.commit_id, at: r.submitted_at ?? nowIso() });
      }
      // Guarded CAS merge (shared with the webhook reducer): a plain $set of
      // a locally-merged array would erase a review a pull_request_review
      // webhook appended between the REST response and this write — and with
      // reviewsFetchedFor stamped, nothing would re-fetch at this head, so
      // the just-reviewed PR would be re-dispatched until the next push.
      const merged = await mergeReviewEntriesInto(pullsCol(orch), n, entries, {
        reviewsFetchedFor: headSha,
      });
      if (merged === null) continue; // doc vanished / hyper-contended — retry next claim
      reviews = merged;
    }

    // Reviewed at this revision? The shell keys this off the per-commit
    // "for-good/adversarial-review" STATUS (check_state block, review_one
    // L448–455): skip on success (passed) or failure (waiting on rework) —
    // the mirror approximates that with review objects. "commented" is
    // deliberately NOT treated as reviewed: an inline-comment review sets no
    // commit status, so the shell's check_state stays "none" and the walk
    // WOULD review the PR — a drive-by comment must not starve it from
    // dispatch. "approved" ≈ status success, "changes_requested" ≈ status
    // failure, and "dismissed" keeps the skip because a dismissal does not
    // clear the failure status at that SHA. A NEW head (rework pushed)
    // carries no matching commitId, so the PR becomes eligible again.
    if (reviews.some((r) => r.commitId === headSha && r.state !== "commented")) continue;

    // Review-round cap (review_one's round-cap block, L456–470, #287):
    // at/over config.maxReviewRounds change-requesting rounds the PR is a
    // human maintainer's — never dispatch an (N+1)th agent round. Dismissed
    // rounds don't count (mergeReviewEntries supersedes a CR entry with its
    // dismissal), matching the shell's GraphQL states:CHANGES_REQUESTED
    // count. When the entry array sits AT its storage cap the true count is
    // unknowable from the mirror (older CR entries may have been evicted) —
    // fail toward parking, exactly like review_rounds() echoing the cap on a
    // gh error: skip the candidate and leave it to the walk.
    if (reviews.length >= PULL_REVIEWS_CAP) continue;
    if (reviews.filter((r) => r.state === "changes_requested").length >= config.maxReviewRounds) continue;

    const assignmentId = new ObjectId();
    const idStr = assignmentId.toHexString();

    // The atomic lease IS the claim — no GitHub writes follow it.
    const took = await orch.redis.set(reviewLeaseKey(n), idStr, "EX", ttl, "NX");
    if (took !== "OK") continue; // another enrolled reviewer holds it — next candidate

    // LIVENESS: verify the winner is still open before handing it out. The
    // mirror can miss a close (lost webhook + claim inside the sync
    // interval); the old walk listed live open PRs so it never dispatched a
    // merged PR — one live read per CLAIM (not per candidate) keeps that
    // property and self-heals the stale doc. Fail-open on non-rate-limit
    // read errors: proceeding is exactly the pre-guard behaviour, and the
    // runner's own state guard (review_one) still catches it.
    try {
      const live = await gh.getPull(n);
      if (live.state !== "open") {
        await pullsCol(orch).updateOne(
          { _id: n },
          {
            $set: {
              state: live.state,
              merged: Boolean(live.merged ?? live.merged_at != null),
              mergedAt: live.merged_at ?? null,
              updatedAt: live.updated_at ?? nowIso(),
            },
          },
        );
        await delLeaseIfOwned(orch, reviewLeaseKey(n), idStr).catch(() => undefined);
        continue;
      }
    } catch (err) {
      if (err instanceof GitHubApiError && err.isRateLimit) {
        await delLeaseIfOwned(orch, reviewLeaseKey(n), idStr).catch(() => undefined);
        return { status: "rate-limited", retryAfterSeconds: err.retryAfterSeconds ?? 60 };
      }
      console.error(`dispatch: liveness check failed for PR #${n} (dispatching anyway):`, err);
    }

    const now = nowIso();
    const assignment: AssignmentDoc = {
      _id: assignmentId,
      kind: "review",
      issueNumber: n, // the PR number — see AssignmentDoc.issueNumber
      handle: ctx.handle,
      tier: ctx.tier,
      ...(ctx.agentId ? { agentId: ctx.agentId } : {}),
      ...(ctx.harness ? { harness: ctx.harness } : {}),
      ...(ctx.model ? { model: ctx.model } : {}),
      claimedAt: now,
      renewedAt: now,
      active: true,
    };
    try {
      await assignmentsCol(orch).insertOne(assignment);
    } catch (err) {
      await delLeaseIfOwned(orch, reviewLeaseKey(n), idStr).catch(() => undefined);
      throw err; // the route answers 5xx honestly — the claim did NOT happen
    }

    store.addEvent("claim", `@${ctx.handle} claimed the review of PR #${n} — ${candidate.title}`, {
      handle: ctx.handle,
      ...(ctx.harness ? { harness: ctx.harness } : {}),
      ref: `#${n}`,
    });

    return {
      status: "claimed",
      review: toClaimedReview(candidate),
      assignmentId: idStr,
      leaseTtlSeconds: ttl,
    };
  }

  return { status: "empty" };
}

/** Compare-and-EXPIRE: extend the lease only while it still belongs to this
 *  assignment — never extend a rival's lease or a sweeper's takeover
 *  sentinel. Atomic, so there is no GET→EXPIRE gap to race through. */
const RENEW_LEASE_LUA =
  'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("expire", KEYS[1], ARGV[2]) else return 0 end';

async function expireLeaseIfOwned(
  orch: Orchestrator,
  key: string,
  owner: string,
  ttlSeconds: number,
): Promise<boolean> {
  const extended = (await orch.redis.eval(
    RENEW_LEASE_LUA,
    1,
    key,
    owner,
    String(ttlSeconds),
  )) as number;
  return extended === 1;
}

/** Extend the lease for this handle's active assignment on the issue (or,
 *  for a kind:"review" assignment, the PR — one number space, so the doc
 *  found by number decides which lease key/TTL applies). Returns the granted
 *  TTL in seconds, or null when there is no such active assignment — 404. */
export async function renewLease(orch: Orchestrator, handle: string, issue: number): Promise<number | null> {
  const assignments = assignmentsCol(orch);
  const doc = await assignments.findOne({ issueNumber: issue, handle, active: true });
  if (!doc) return null;

  const key = assignmentLeaseKey(doc);
  const ttl = kindLeaseTtl(kindOf(doc));
  const idStr = doc._id.toHexString();
  const extended = await expireLeaseIfOwned(orch, key, idStr, ttl);
  if (!extended) {
    // The lease key expired but the sweeper hasn't released the claim yet —
    // re-take it for this assignment. NX so neither a rival's re-claim nor a
    // sweeper's takeover sentinel (sweep:<id>, set atomically in place of a
    // bare exists() check) is ever stolen: exactly one of {renew, sweep} wins.
    const retaken = await orch.redis.set(key, idStr, "EX", ttl, "NX");
    if (retaken !== "OK") return null;
    // If the sweeper released the assignment between our findOne and the
    // re-take, don't resurrect an orphan lease.
    const stillActive = await assignments.findOne({ _id: doc._id, active: true });
    if (!stillActive) {
      await delLeaseIfOwned(orch, key, idStr);
      return null;
    }
  }
  await assignments.updateOne({ _id: doc._id }, { $set: { renewedAt: nowIso() } });
  return ttl;
}

type RevertResult = "reverted" | "skipped" | "failed";

/**
 * Revert the claim labels on GitHub (add "status: available", remove
 * "status: claimed", remove the assignee), then mirror the change — but ONLY
 * while the issue still looks claimed on GitHub (read live; GitHub is the
 * durable truth and the mirror can lag a sync interval). A lost
 * `release done` (fleet_release's curl is best-effort and swallowed) leaves
 * an orphan active assignment on an issue that has ALREADY moved on to
 * in-review with an open PR — flipping that back to "status: available"
 * would re-queue work that's sitting in a live PR (reap.sh has the same
 * only-if-still-claimed guard).
 *
 * Returns "reverted" when the labels were reverted; "skipped" when there is
 * no GitHub client or the issue no longer carries "status: claimed" (nothing
 * to revert — the release was simply lost); "failed" when a GitHub call
 * failed (retryable — see revertPending). On "failed" the mirror is left
 * alone: it mirrors GitHub, not what we wish GitHub said.
 */
async function revertClaimLabels(
  orch: Orchestrator,
  issue: number,
  handle: string,
): Promise<RevertResult> {
  const gh = orch.gh;
  if (!gh) return "skipped";
  let live;
  try {
    live = await gh.getIssue(issue);
  } catch (err) {
    console.error(`dispatch: could not read #${issue} before label revert:`, err);
    return "failed";
  }
  const liveLabels = (live.labels ?? []).map((l) => l.name);
  if (live.state !== "open" || !liveLabels.includes(CLAIMED_LABEL)) return "skipped";
  try {
    await gh.addLabels(issue, [AVAILABLE_LABEL]);
    await gh.removeLabel(issue, CLAIMED_LABEL);
    await gh.removeAssignees(issue, [handle]);
  } catch (err) {
    console.error(`dispatch: label revert failed for #${issue}:`, err);
    return "failed";
  }
  const doc = await issuesCol(orch).findOne({ _id: issue });
  if (!doc) return "reverted";
  const labels = doc.labels.filter((l) => l !== CLAIMED_LABEL);
  if (!labels.includes(AVAILABLE_LABEL)) labels.push(AVAILABLE_LABEL);
  await issuesCol(orch).updateOne(
    { _id: issue },
    { $set: { labels, assignees: doc.assignees.filter((a) => a !== handle), updatedAt: nowIso() } },
  );
  return "reverted";
}

/** Mark one assignment inactive (race-safe on `active: true`), free its
 *  lease, optionally revert labels. `finished: false` means a rival finished
 *  it first; `reverted` reports whether the labels actually went back to
 *  "status: available" (a skipped/failed revert must NOT be announced as
 *  "back in the queue"). A transiently-failed revert sets `revertPending` so
 *  the sweeper retries it every pass instead of losing it forever. Shared by
 *  releaseAssignment and the sweeper (which passes its takeover sentinel as
 *  `leaseValue`). */
async function finishAssignment(
  orch: Orchestrator,
  assignment: AssignmentDoc,
  outcome: ReleaseOutcome,
  opts: { revert: boolean; prNumber?: number; leaseValue?: string },
): Promise<{ finished: boolean; reverted: boolean }> {
  const res = await assignmentsCol(orch).updateOne(
    { _id: assignment._id, active: true },
    {
      $set: {
        active: false,
        releasedAt: nowIso(),
        outcome,
        ...(opts.prNumber ? { prNumber: opts.prNumber } : {}),
      },
    },
  );
  if (res.matchedCount === 0) return { finished: false, reverted: false };
  await delLeaseIfOwned(orch, assignmentLeaseKey(assignment), opts.leaseValue ?? assignment._id.toHexString());
  // An ABANDONED review means the runner claimed the PR and then skipped it
  // locally (already passed at head, author == its posting identity, parked
  // for a human, crash) — mirror state the server couldn't see. Re-serving
  // the PR immediately would hand the deterministic oldest-first queue's
  // head to every runner in a claim → skip → abandon loop, so park it out of
  // dispatch for a cooldown instead (the walk can still reach it).
  // Lease-expired releases deliberately DON'T cool down: the lease TTL
  // itself already spaced that claim out, and a crashed reviewer's PR should
  // re-queue promptly (ADR-0019 "back in the review queue").
  if (kindOf(assignment) === "review" && outcome === "abandoned") {
    await orch.redis
      .set(reviewCooldownKey(assignment.issueNumber), assignment.handle, "EX", config.reviewAbandonCooldownSeconds)
      .catch(() => undefined);
  }
  let reverted = false;
  // Label reverts are a kind:"work" concept only — review claims hold no
  // labels (nothing was written on claim, so there is nothing to revert).
  if (opts.revert && kindOf(assignment) === "work") {
    const result = await revertClaimLabels(orch, assignment.issueNumber, assignment.handle);
    reverted = result === "reverted";
    if (result === "failed") {
      await assignmentsCol(orch)
        .updateOne({ _id: assignment._id }, { $set: { revertPending: true } })
        .catch(() => undefined);
    }
  }
  return { finished: true, reverted };
}

/**
 * Release an assignment. `done`: mark inactive, DEL lease, do NOT touch
 * labels (the PR/Actions pipeline owns post-work transitions). `abandoned` /
 * `lease-expired` / `admin-released` (with revertLabels): add
 * "status: available", remove "status: claimed", remove assignee, DEL lease,
 * mark inactive. `handle` is required for agent-initiated releases (must
 * match the assignment); admin release passes `handle: undefined` (and no
 * `kind`, matching either — the number space is shared, so the doc found by
 * number is unambiguous). Kind "review" releases (`issue` = the PR number)
 * never touch labels for ANY outcome — review claims hold none.
 * Returns false when no matching active assignment exists — 404.
 */
export async function releaseAssignment(
  orch: Orchestrator,
  store: FleetStore,
  opts: {
    issue: number;
    outcome: ReleaseOutcome;
    /** Which kind the caller believes it is releasing; omitted = any. */
    kind?: AssignmentKind;
    handle?: string;
    prNumber?: number;
    /** Admin-release only; agent "abandoned" always reverts. */
    revertLabels?: boolean;
  },
): Promise<boolean> {
  const doc = await assignmentsCol(orch).findOne({
    issueNumber: opts.issue,
    active: true,
    ...(opts.handle ? { handle: opts.handle } : {}),
    ...(opts.kind ? kindFilter(opts.kind) : {}),
  });
  if (!doc) return false;

  const revert =
    opts.outcome === "abandoned" ||
    opts.outcome === "lease-expired" ||
    (opts.outcome === "admin-released" && Boolean(opts.revertLabels));

  const { finished } = await finishAssignment(orch, doc, opts.outcome, {
    revert,
    ...(opts.prNumber ? { prNumber: opts.prNumber } : {}),
  });
  if (!finished) return false;

  const text =
    kindOf(doc) === "review"
      ? opts.outcome === "done"
        ? `@${doc.handle} finished reviewing PR #${opts.issue}`
        : `@${doc.handle}'s review claim on PR #${opts.issue} released (${opts.outcome})`
      : opts.outcome === "done"
        ? `@${doc.handle} finished #${opts.issue}${opts.prNumber ? ` → PR #${opts.prNumber}` : ""}`
        : `@${doc.handle}'s claim on #${opts.issue} released (${opts.outcome})`;
  store.addEvent("claim", text, { handle: doc.handle, ref: `#${opts.issue}` });
  return true;
}

/** Auto-renew active leases for this handle (telemetry heartbeat hook), but
 *  only for assignments the mirror still shows as genuinely claimed by the
 *  handle. A lost `release` (fleet_release's best-effort curl swallowed a
 *  timeout) leaves an orphan active assignment; blind renewal would keep its
 *  lease alive for as long as the agent heartbeats — starving a re-queued
 *  issue from dispatch, and defeating the "TTL + sweeper backstop a lost
 *  release" contract. Compare-and-EXPIRE only — a heartbeat never resurrects
 *  an already-expired lease. Best-effort; never throws. */
export async function renewLeasesForHandle(orch: Orchestrator, handle: string): Promise<void> {
  try {
    const active = await assignmentsCol(orch).find({ handle, active: true }).toArray();
    for (const doc of active) {
      // The claimed-label mirror guard applies ONLY to kind "work" — a review
      // claim writes no labels/assignees anywhere, so there is no mirror
      // state to cross-check; an active review assignment renews while the
      // agent heartbeats (compare-and-EXPIRE on lease:review:<n>, so a lapsed
      // lease is still never resurrected).
      if (kindOf(doc) === "work") {
        const issue = await issuesCol(orch).findOne(
          { _id: doc.issueNumber },
          { projection: { labels: 1, assignees: 1 } },
        );
        // The assignee check only applies when the claim actually set one —
        // auto-enrolled outside contributors can't be assignees on GitHub
        // (assigneeSet:false), so for them "still claimed" is label-only.
        const expectAssignee = doc.assigneeSet !== false;
        if (
          !issue ||
          !(issue.labels ?? []).includes(CLAIMED_LABEL) ||
          (expectAssignee && !(issue.assignees ?? []).includes(doc.handle))
        ) {
          continue; // no longer claimed by this handle — let the lease lapse
        }
      }
      const extended = await expireLeaseIfOwned(
        orch,
        assignmentLeaseKey(doc),
        doc._id.toHexString(),
        kindLeaseTtl(kindOf(doc)),
      );
      if (extended) {
        await assignmentsCol(orch).updateOne({ _id: doc._id }, { $set: { renewedAt: nowIso() } });
      }
    }
  } catch (err) {
    console.error(`dispatch: heartbeat lease renew failed for @${handle}:`, err);
  }
}

/** How long the sweeper's takeover sentinel may live if the sweeper dies
 *  mid-release — the next pass simply retries. */
const SWEEP_SENTINEL_TTL_SECONDS = 120;

/**
 * Lease sweeper (index.ts runs this every 60s): every `assignments` doc with
 * active:true whose `lease:issue:<n>` Redis key is gone → outcome
 * "lease-expired", revert labels (only if the issue still shows
 * "status: claimed" on GitHub — see revertClaimLabels), mark inactive, emit a
 * feed event. The takeover is arbitrated atomically: instead of a bare
 * exists() check (which races renewLease's expired-key re-take), the sweeper
 * claims the absent lease with a short-lived `sweep:<assignmentId>` sentinel
 * via SET NX — exactly one of {sweeper, renew} can win. Also retries reverts
 * that failed transiently on an earlier pass (revertPending). Replaces
 * reap.sh for enrolled agents. Returns the number of assignments expired.
 * Must never throw (log-and-continue inside).
 */
export async function sweepExpiredLeases(orch: Orchestrator, store: FleetStore): Promise<number> {
  let expired = 0;
  try {
    const active = await assignmentsCol(orch).find({ active: true }).toArray();
    for (const doc of active) {
      try {
        const sentinel = `sweep:${doc._id.toHexString()}`;
        const took = await orch.redis.set(
          assignmentLeaseKey(doc),
          sentinel,
          "EX",
          SWEEP_SENTINEL_TTL_SECONDS,
          "NX",
        );
        if (took !== "OK") continue; // a lease exists (live, or just re-taken by renew)
        // Kind "review": no label revert (review claims hold no labels) —
        // the PR simply becomes claimable again once the lease is gone.
        const isReview = kindOf(doc) === "review";
        const { finished, reverted } = await finishAssignment(orch, doc, "lease-expired", {
          revert: !isReview,
          leaseValue: sentinel,
        });
        if (!finished) {
          await delLeaseIfOwned(orch, assignmentLeaseKey(doc), sentinel).catch(() => undefined);
          continue;
        }
        expired++;
        store.addEvent(
          "claim",
          isReview
            ? `review lease expired — PR #${doc.issueNumber} back in the review queue (was @${doc.handle})`
            : reverted
              ? `lease expired — #${doc.issueNumber} is back in the queue (was @${doc.handle})`
              : `lease expired — released @${doc.handle}'s claim on #${doc.issueNumber} (labels left as-is)`,
          { handle: doc.handle, ref: `#${doc.issueNumber}` },
        );
      } catch (err) {
        console.error(`dispatch: lease sweep failed for #${doc.issueNumber}:`, err);
      }
    }

    // Retry pass: reverts that failed transiently (e.g. a GitHub rate-limit
    // burst) — all the GitHub ops involved are idempotent, and a free retry
    // 60s later beats stranding the issue claimed until reap.sh's 2h TTL.
    const pending = await assignmentsCol(orch)
      .find({ active: false, revertPending: true })
      .toArray();
    for (const doc of pending) {
      try {
        const result = await revertClaimLabels(orch, doc.issueNumber, doc.handle);
        if (result === "failed") continue; // try again next pass
        await assignmentsCol(orch).updateOne({ _id: doc._id }, { $unset: { revertPending: "" } });
        if (result === "reverted") {
          store.addEvent(
            "claim",
            `#${doc.issueNumber} is back in the queue (was @${doc.handle}; revert retried)`,
            { handle: doc.handle, ref: `#${doc.issueNumber}` },
          );
        }
      } catch (err) {
        console.error(`dispatch: revert retry failed for #${doc.issueNumber}:`, err);
      }
    }
  } catch (err) {
    console.error("dispatch: lease sweep failed:", err);
  }
  return expired;
}

/** The dispatch ordering, read-only — backs `GET /api/v1/queue`. */
export async function listQueue(orch: Orchestrator, stages?: string[]): Promise<ClaimedIssue[]> {
  const candidates = await orderedCandidates(orch, stages);
  return candidates.map(toClaimedIssue);
}

/** List assignments for `GET /api/v1/admin/assignments` (docs as stored,
 *  minus nothing — assignments hold no secrets), newest claim first. */
export async function listAssignments(
  orch: Orchestrator,
  opts?: { active?: boolean },
): Promise<Record<string, unknown>[]> {
  const filter = opts?.active === undefined ? {} : { active: opts.active };
  const docs = await assignmentsCol(orch).find(filter).sort({ claimedAt: -1 }).toArray();
  return docs.map(({ _id, ...rest }) => ({ id: _id.toHexString(), ...rest }));
}
