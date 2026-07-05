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
import type { ClaimedIssue } from "../protocol.js";
import type { FleetStore } from "../state.js";
import type { AgentTier } from "./auth.js";
import { leaseKey, type Orchestrator } from "./stores.js";

const AVAILABLE_LABEL = "status: available";
const CLAIMED_LABEL = "status: claimed";
const DO_NOT_AUTOMATE_LABEL = "do-not-automate";
const HIGH_PRIORITY_LABEL = "priority: high";
const STAGE_PREFIX = "stage: ";
const STREAM_PREFIX = "stream:";
/** The stages dispatch may ever serve — discover is excluded by construction
 *  (ADR-0014 capability floor; frame_work.sh owns discover roots). */
const DISPATCHABLE_STAGES = ["research", "ideate", "build"] as const;

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
  issueNumber: number;
  handle: string;
  tier: AgentTier;
  agentId?: string;
  harness?: string;
  model?: string;
  claimedAt: string;
  renewedAt: string;
  active: boolean;
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
  /** Queue empty — the route answers `{ok:true, issue:null}`. */
  | { status: "empty" }
  /** GitHub rate-limited mid-claim — the route answers 429. */
  | { status: "rate-limited"; retryAfterSeconds: number }
  /** Orchestration up but no githubToken — the route answers 503. */
  | { status: "disabled"; reason: string };

export type ReleaseOutcome = "done" | "abandoned" | "lease-expired" | "admin-released";

const nowIso = () => new Date().toISOString();

function issuesCol(orch: Orchestrator): Collection<IssueDoc> {
  return orch.db.collection<IssueDoc>("issues");
}

function assignmentsCol(orch: Orchestrator): Collection<AssignmentDoc> {
  return orch.db.collection<AssignmentDoc>("assignments");
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

async function delLeaseIfOwned(orch: Orchestrator, issue: number, assignmentId: string): Promise<void> {
  await orch.redis.eval(RELEASE_LEASE_LUA, 1, leaseKey(issue), assignmentId);
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
    let step = 0;
    try {
      await gh.addLabels(n, [CLAIMED_LABEL]);
      step = 1;
      const removedAvailable = await gh.removeLabel(n, AVAILABLE_LABEL);
      if (!removedAvailable) {
        // 404 removing "status: available" IS the label-path collision
        // signal: a rival (label-path worker, or a human) took the issue
        // while the mirror was stale. The rival owns "status: claimed" now —
        // leave it in place (we added it idempotently), never touch
        // assignees (we haven't written any), free the lease, next candidate.
        await delLeaseIfOwned(orch, n, idStr).catch(() => undefined);
        continue;
      }
      step = 2;
      await gh.addAssignees(n, [ctx.handle]);
    } catch (err) {
      if (err instanceof GitHubApiError && err.isRateLimit) {
        await delLeaseIfOwned(orch, n, idStr).catch(() => undefined);
        return { status: "rate-limited", retryAfterSeconds: err.retryAfterSeconds ?? 60 };
      }
      if (err instanceof GitHubApiError && (err.code === "assignee-ignored" || err.status === 403)) {
        // Misconfiguration, not a per-issue failure: the handle isn't
        // assignable on the repo, or the bot token lacks write access
        // (a permission 403 — isRateLimit already excluded the quota case).
        // Undo, free the lease, and ABORT the claim rather than burning one
        // failing GitHub write per candidate across the whole queue.
        if (step >= 1) await gh.removeLabel(n, CLAIMED_LABEL).catch(() => undefined);
        if (step >= 2) await gh.addLabels(n, [AVAILABLE_LABEL]).catch(() => undefined);
        await delLeaseIfOwned(orch, n, idStr).catch(() => undefined);
        return {
          status: "disabled",
          reason:
            err.code === "assignee-ignored"
              ? "handle not assignable on the repo (missing repo access?)"
              : "github token lacks write access",
        };
      }
      if (err instanceof GitHubApiError && err.status >= 400 && err.status < 500) {
        // Best-effort undo of any partial write (while still holding the
        // lease — see above), then try the next candidate.
        if (step >= 1) await gh.removeLabel(n, CLAIMED_LABEL).catch(() => undefined);
        if (step >= 2) await gh.addLabels(n, [AVAILABLE_LABEL]).catch(() => undefined);
        await delLeaseIfOwned(orch, n, idStr).catch(() => undefined);
        continue;
      }
      await delLeaseIfOwned(orch, n, idStr).catch(() => undefined);
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
    };
    const labels = candidate.labels.filter((l) => l !== AVAILABLE_LABEL);
    if (!labels.includes(CLAIMED_LABEL)) labels.push(CLAIMED_LABEL);
    const assignees = candidate.assignees.includes(ctx.handle)
      ? candidate.assignees
      : [...candidate.assignees, ctx.handle];
    try {
      await assignmentsCol(orch).insertOne(assignment);
      await issuesCol(orch).updateOne({ _id: n }, { $set: { labels, assignees, updatedAt: now } });
    } catch (err) {
      await assignmentsCol(orch).deleteOne({ _id: assignmentId }).catch(() => undefined);
      await revertClaimLabels(orch, n, ctx.handle).catch(() => undefined);
      await delLeaseIfOwned(orch, n, idStr).catch(() => undefined);
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

/** Compare-and-EXPIRE: extend the lease only while it still belongs to this
 *  assignment — never extend a rival's lease or a sweeper's takeover
 *  sentinel. Atomic, so there is no GET→EXPIRE gap to race through. */
const RENEW_LEASE_LUA =
  'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("expire", KEYS[1], ARGV[2]) else return 0 end';

async function expireLeaseIfOwned(
  orch: Orchestrator,
  issue: number,
  owner: string,
): Promise<boolean> {
  const extended = (await orch.redis.eval(
    RENEW_LEASE_LUA,
    1,
    leaseKey(issue),
    owner,
    String(config.leaseTtlSeconds),
  )) as number;
  return extended === 1;
}

/** Extend the lease for this handle's active assignment on the issue.
 *  Returns false when there is no such active assignment — 404. */
export async function renewLease(orch: Orchestrator, handle: string, issue: number): Promise<boolean> {
  const assignments = assignmentsCol(orch);
  const doc = await assignments.findOne({ issueNumber: issue, handle, active: true });
  if (!doc) return false;

  const key = leaseKey(issue);
  const idStr = doc._id.toHexString();
  const extended = await expireLeaseIfOwned(orch, issue, idStr);
  if (!extended) {
    // The lease key expired but the sweeper hasn't released the claim yet —
    // re-take it for this assignment. NX so neither a rival's re-claim nor a
    // sweeper's takeover sentinel (sweep:<id>, set atomically in place of a
    // bare exists() check) is ever stolen: exactly one of {renew, sweep} wins.
    const retaken = await orch.redis.set(key, idStr, "EX", config.leaseTtlSeconds, "NX");
    if (retaken !== "OK") return false;
    // If the sweeper released the assignment between our findOne and the
    // re-take, don't resurrect an orphan lease.
    const stillActive = await assignments.findOne({ _id: doc._id, active: true });
    if (!stillActive) {
      await delLeaseIfOwned(orch, issue, idStr);
      return false;
    }
  }
  await assignments.updateOne({ _id: doc._id }, { $set: { renewedAt: nowIso() } });
  return true;
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
  await delLeaseIfOwned(orch, assignment.issueNumber, opts.leaseValue ?? assignment._id.toHexString());
  let reverted = false;
  if (opts.revert) {
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
 * match the assignment); admin release passes `handle: undefined`.
 * Returns false when no matching active assignment exists — 404.
 */
export async function releaseAssignment(
  orch: Orchestrator,
  store: FleetStore,
  opts: {
    issue: number;
    outcome: ReleaseOutcome;
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
    opts.outcome === "done"
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
      const issue = await issuesCol(orch).findOne(
        { _id: doc.issueNumber },
        { projection: { labels: 1, assignees: 1 } },
      );
      if (
        !issue ||
        !(issue.labels ?? []).includes(CLAIMED_LABEL) ||
        !(issue.assignees ?? []).includes(doc.handle)
      ) {
        continue; // no longer claimed by this handle — let the lease lapse
      }
      const extended = await expireLeaseIfOwned(orch, doc.issueNumber, doc._id.toHexString());
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
          leaseKey(doc.issueNumber),
          sentinel,
          "EX",
          SWEEP_SENTINEL_TTL_SECONDS,
          "NX",
        );
        if (took !== "OK") continue; // a lease exists (live, or just re-taken by renew)
        const { finished, reverted } = await finishAssignment(orch, doc, "lease-expired", {
          revert: true,
          leaseValue: sentinel,
        });
        if (!finished) {
          await delLeaseIfOwned(orch, doc.issueNumber, sentinel).catch(() => undefined);
          continue;
        }
        expired++;
        store.addEvent(
          "claim",
          reverted
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
