/**
 * Interval reconciliation sync (Implementer B).
 *
 * Webhooks are the fast path; this job is the truth-repair path. Both write
 * the same mirror doc shapes so they converge — the shapes (and the
 * raw→mirror mappers) are exported from here so reduce.ts can reuse them.
 * Requires orch.gh (a GitHub token) — callers must not invoke these without
 * it; we throw a clear error if they do.
 *
 *  - runIncrementalSync: GET /issues?state=all&since=<lastIncrementalAt-60s
 *    slack>&sort=updated&per_page=100 — items with a `pull_request` key go
 *    to `pulls` (full detail via listPulls; partial upsert as fallback),
 *    others upsert `issues`; bounded by config.maxSyncPages (baked into the
 *    GitHubApi the orchestrator was connected with).
 *  - runFullSync: all open issues+PRs, plus closed ones updated in the last
 *    30 days. Advances sync_state.lastFullAt (and lastIncrementalAt).
 *  - runBootSync: full when the `issues` collection is empty, else
 *    incremental.
 *  - Interval callers (index.ts) wrap in try/catch and add jitter; sync_state
 *    is advanced in a single upsert AFTER a pass succeeds, so a failed pass
 *    never half-writes it and the next pass simply re-covers the window.
 */
import type { Collection } from "mongodb";
import type { Orchestrator } from "../orchestrator/stores.js";
import type { GhIssue, GhPull, GitHubApi } from "./gh-api.js";

/** Mirror caps a stored issue body at 65k chars (spec: "cap 65k"). */
export const ISSUE_BODY_CAP = 65_536;
/** Incremental `since` is backed off by this much to absorb clock skew and
 *  updates that landed mid-pass. */
const INCREMENTAL_SLACK_MS = 60_000;
/** Full sync keeps closed items only if updated within this window. */
const CLOSED_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export interface SyncResult {
  issuesUpserted: number;
  pullsUpserted: number;
}

/** Mirror doc for a real issue (`issues` collection, `_id` = number). */
export interface IssueDoc {
  _id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  labels: string[];
  assignees: string[];
  body?: string;
  user: string | null;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  syncedAt: string;
}

/** One submitted review on a PR, as the mirror stores it. `commitId` is the
 *  head SHA the review was submitted against — review dispatch compares it
 *  with the PR's CURRENT `headSha` to decide "already reviewed at this
 *  revision". `state` is the review's CURRENT state, not event history: a
 *  dismissal supersedes the entry it dismisses (same reviewer+commitId), so
 *  round counting over these entries matches the shell's GraphQL
 *  `reviews(states:CHANGES_REQUESTED)` count, which also excludes DISMISSED
 *  (review_work.sh review_rounds()). */
export interface PullReviewEntry {
  reviewer: string;
  state: "approved" | "changes_requested" | "commented" | "dismissed";
  commitId: string;
  at: string;
}

/** The mirror keeps only the LAST this-many review entries per PR. */
export const PULL_REVIEWS_CAP = 30;

/** Mirror doc for a pull request (`pulls` collection, `_id` = number). */
export interface PullDoc {
  _id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  draft: boolean;
  labels: string[];
  user: string | null;
  htmlUrl: string;
  headRef: string;
  headSha: string;
  headRepoFullName: string | null;
  baseRef: string;
  merged: boolean;
  mergedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  syncedAt: string;
  /** Submitted reviews, capped at the last PULL_REVIEWS_CAP. Fed by
   *  pull_request_review webhooks + review dispatch's lazy fetch; sync never
   *  backfills these (the REST pulls list doesn't carry them) and never
   *  clobbers them (pull upserts $set the listed fields only). */
  reviews?: PullReviewEntry[];
  /** The head SHA the reviews were last fetched for via
   *  `GET /pulls/{n}/reviews` — review dispatch fetches at most once per
   *  head revision. */
  reviewsFetchedFor?: string;
}

/** Fold `incoming` review entries into `existing`: dedupe by
 *  reviewer+commitId keeping the LATEST entry (ties go to `incoming`, so a
 *  dismissal — same reviewer+commitId, same `submitted_at` as the review it
 *  dismisses — SUPERSEDES the changes_requested entry instead of coexisting
 *  with it), order by `at` ascending, cap at the last PULL_REVIEWS_CAP.
 *  Shared by the webhook reducer and review dispatch's lazy fetch so both
 *  persist one shape. State is deliberately NOT part of the key: an entry is
 *  "this reviewer's current standing at this commit", which is what both the
 *  reviewed-at-head skip and the round count need. */
export function mergeReviewEntries(
  existing: PullReviewEntry[] | undefined,
  incoming: PullReviewEntry[],
): PullReviewEntry[] {
  const byKey = new Map<string, PullReviewEntry>();
  for (const entry of [...(existing ?? []), ...incoming]) {
    const key = `${entry.reviewer}\u0000${entry.commitId}`;
    const prior = byKey.get(key);
    if (!prior || prior.at <= entry.at) byKey.set(key, entry);
  }
  return [...byKey.values()]
    .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
    .slice(-PULL_REVIEWS_CAP);
}

/**
 * Merge `incoming` review entries into the PR doc's CURRENT `reviews` array
 * ATOMICALLY (guarded compare-and-set, bounded retries) and return the
 * merged array, or null when the doc doesn't exist / stays contended.
 *
 * Both review-entry writers — the webhook reducer's append and review
 * dispatch's lazy REST fetch — MUST go through this: a plain
 * read → mergeReviewEntries → `$set` clobbers whatever the other writer
 * persisted between the read and the write. Concretely, the lazy fetch used
 * to erase a review a `pull_request_review` webhook appended while the REST
 * response was in flight — and because it also stamped
 * `reviewsFetchedFor: headSha`, nothing ever re-fetched at that head, so the
 * just-reviewed PR looked unreviewed until the next push. The CAS re-reads
 * and re-merges on conflict, so concurrent appends always survive.
 */
export async function mergeReviewEntriesInto(
  pulls: Collection<PullDoc>,
  pr: number,
  incoming: PullReviewEntry[],
  extraSet: Partial<Pick<PullDoc, "reviewsFetchedFor">> = {},
): Promise<PullReviewEntry[] | null> {
  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const doc = await pulls.findOne({ _id: pr }, { projection: { reviews: 1 } });
    if (!doc) return null; // no mirror doc — nothing to merge into
    const merged = mergeReviewEntries(doc.reviews, incoming);
    // The guard matches only while `reviews` still equals what we read
    // (exact array equality via $eq; `$exists: false` when it was absent).
    // A rival write in between → matchedCount 0 → re-read and re-merge.
    const guard: Parameters<typeof pulls.updateOne>[0] =
      doc.reviews === undefined
        ? { _id: pr, reviews: { $exists: false } }
        : { _id: pr, reviews: { $eq: doc.reviews } };
    const res = await pulls.updateOne(guard, { $set: { reviews: merged, ...extraSet } });
    if (res.matchedCount === 1) return merged;
  }
  console.error(`sync: review-entry merge for PR #${pr} stayed contended after 5 attempts`);
  return null;
}

interface SyncStateDoc {
  _id: string;
  lastIncrementalAt?: string;
  lastFullAt?: string;
}

/** Raw REST issue → mirror doc. Exported so webhook reduce converges on the
 *  exact same shape (payload.issue is the same REST shape). */
export function issueDocFromRaw(raw: GhIssue, syncedAt: string): IssueDoc {
  return {
    _id: raw.number,
    number: raw.number,
    title: raw.title,
    state: raw.state,
    labels: (raw.labels ?? []).map((l) => l.name),
    assignees: (raw.assignees ?? []).map((a) => a.login),
    body: typeof raw.body === "string" ? raw.body.slice(0, ISSUE_BODY_CAP) : "",
    user: raw.user?.login ?? null,
    htmlUrl: raw.html_url,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    closedAt: raw.closed_at ?? null,
    syncedAt,
  };
}

/** Raw REST pull → mirror doc. The list endpoint omits `merged`, so fall
 *  back to `merged_at` presence. */
export function pullDocFromRaw(raw: GhPull, syncedAt: string): PullDoc {
  return {
    _id: raw.number,
    number: raw.number,
    title: raw.title,
    state: raw.state,
    draft: Boolean(raw.draft),
    labels: (raw.labels ?? []).map((l) => l.name),
    user: raw.user?.login ?? null,
    htmlUrl: raw.html_url,
    headRef: raw.head?.ref ?? "",
    headSha: raw.head?.sha ?? "",
    headRepoFullName: raw.head?.repo?.full_name ?? null,
    baseRef: raw.base?.ref ?? "",
    merged: Boolean(raw.merged ?? raw.merged_at != null),
    mergedAt: raw.merged_at ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    syncedAt,
  };
}

function requireGh(orch: Orchestrator): GitHubApi {
  if (!orch.gh) throw new Error("mirror sync requires a GitHub token (orch.gh missing)");
  return orch.gh;
}

function issuesCol(orch: Orchestrator): Collection<IssueDoc> {
  return orch.db.collection<IssueDoc>("issues");
}
function pullsCol(orch: Orchestrator): Collection<PullDoc> {
  return orch.db.collection<PullDoc>("pulls");
}
function syncStateCol(orch: Orchestrator): Collection<SyncStateDoc> {
  return orch.db.collection<SyncStateDoc>("sync_state");
}

async function upsertIssues(orch: Orchestrator, docs: IssueDoc[]): Promise<number> {
  if (docs.length === 0) return 0;
  await issuesCol(orch).bulkWrite(
    docs.map((doc) => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })),
    { ordered: false },
  );
  return docs.length;
}

/** Split a PullDoc into filter + $set fields. Pull upserts $set (NOT
 *  replace) so `reviews`/`reviewsFetchedFor` — which only webhooks and the
 *  lazy review fetch write — survive every sync/webhook refresh. Exported so
 *  the webhook reducer's pull upsert stays convergent with sync's. */
export function pullDocUpdate(doc: PullDoc): { filter: { _id: number }; update: { $set: Omit<PullDoc, "_id"> } } {
  const { _id, ...fields } = doc;
  return { filter: { _id }, update: { $set: fields } };
}

async function upsertPulls(orch: Orchestrator, docs: PullDoc[]): Promise<number> {
  if (docs.length === 0) return 0;
  await pullsCol(orch).bulkWrite(
    docs.map((doc) => ({ updateOne: { ...pullDocUpdate(doc), upsert: true } })),
    { ordered: false },
  );
  return docs.length;
}

/**
 * Route a `GET /issues` result set: real issues upsert `issues`; PR-shaped
 * items (a `pull_request` key) are re-fetched with full detail via
 * `GET /pulls?state=all` and upserted into `pulls`. Any PR item the pulls
 * listing didn't cover (e.g. an old closed PR beyond the page cap) gets a
 * partial upsert of the fields the issue item carries — the next full sync
 * repairs the rest.
 */
async function routeAndUpsert(
  orch: Orchestrator,
  gh: GitHubApi,
  items: GhIssue[],
  syncedAt: string,
): Promise<SyncResult> {
  const issueDocs = new Map<number, IssueDoc>();
  const prItems = new Map<number, GhIssue>();
  for (const item of items) {
    if (item.pull_request) prItems.set(item.number, item);
    else issueDocs.set(item.number, issueDocFromRaw(item, syncedAt));
  }

  const issuesUpserted = await upsertIssues(orch, [...issueDocs.values()]);

  let pullsUpserted = 0;
  if (prItems.size > 0) {
    const pulls = await gh.listPulls({ state: "all", perPage: 100 });
    const fullDocs: PullDoc[] = [];
    for (const pull of pulls) {
      if (!prItems.has(pull.number)) continue;
      fullDocs.push(pullDocFromRaw(pull, syncedAt));
      prItems.delete(pull.number);
    }
    pullsUpserted += await upsertPulls(orch, fullDocs);

    for (const item of prItems.values()) {
      await pullsCol(orch).updateOne(
        { _id: item.number },
        {
          $set: {
            number: item.number,
            title: item.title,
            state: item.state,
            labels: (item.labels ?? []).map((l) => l.name),
            user: item.user?.login ?? null,
            htmlUrl: item.html_url,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            syncedAt,
          },
          $setOnInsert: {
            draft: false,
            headRef: "",
            headSha: "",
            headRepoFullName: null,
            baseRef: "",
            merged: false,
            mergedAt: null,
          },
        },
        { upsert: true },
      );
      pullsUpserted += 1;
    }
  }

  return { issuesUpserted, pullsUpserted };
}

/** Incremental since-based pass (every config.syncIntervalSeconds). */
export async function runIncrementalSync(orch: Orchestrator): Promise<SyncResult> {
  const gh = requireGh(orch);
  // The next pass's `since` is this pass's START time (minus slack), so
  // updates landing while we fetch are never skipped.
  const startedAt = new Date().toISOString();

  const state = await syncStateCol(orch).findOne({ _id: "sync" });
  const since = state?.lastIncrementalAt
    ? new Date(Date.parse(state.lastIncrementalAt) - INCREMENTAL_SLACK_MS).toISOString()
    : undefined;

  const items = await gh.listIssues({ state: "all", since, sort: "updated", perPage: 100 });
  const result = await routeAndUpsert(orch, gh, items, startedAt);

  await syncStateCol(orch).updateOne(
    { _id: "sync" },
    { $set: { lastIncrementalAt: startedAt } },
    { upsert: true },
  );
  return result;
}

/** Full reconciliation pass (every config.syncFullIntervalSeconds): all open
 *  issues+PRs, plus closed ones updated in the last 30 days. */
export async function runFullSync(orch: Orchestrator): Promise<SyncResult> {
  const gh = requireGh(orch);
  const startedAt = new Date().toISOString();
  const closedSince = new Date(Date.parse(startedAt) - CLOSED_WINDOW_MS).toISOString();

  const openItems = await gh.listIssues({ state: "open", perPage: 100 });
  const closedItems = await gh.listIssues({
    state: "closed",
    since: closedSince,
    sort: "updated",
    perPage: 100,
  });

  // Dedupe by number (an item can flip state mid-pass); later listing wins.
  const byNumber = new Map<number, GhIssue>();
  for (const item of [...openItems, ...closedItems]) byNumber.set(item.number, item);

  const issueDocs: IssueDoc[] = [];
  const prNumbers = new Set<number>();
  for (const item of byNumber.values()) {
    if (item.pull_request) prNumbers.add(item.number);
    else issueDocs.push(issueDocFromRaw(item, startedAt));
  }
  const issuesUpserted = await upsertIssues(orch, issueDocs);

  const pulls = await gh.listPulls({ state: "all", perPage: 100 });
  const cutoff = Date.parse(closedSince);
  const pullDocs = pulls
    .filter(
      (p) => p.state === "open" || prNumbers.has(p.number) || Date.parse(p.updated_at) >= cutoff,
    )
    .map((p) => pullDocFromRaw(p, startedAt));
  const pullsUpserted = await upsertPulls(orch, pullDocs);

  await syncStateCol(orch).updateOne(
    { _id: "sync" },
    { $set: { lastFullAt: startedAt, lastIncrementalAt: startedAt } },
    { upsert: true },
  );
  return { issuesUpserted, pullsUpserted };
}

/** Boot pass: full if the mirror is empty, else incremental. */
export async function runBootSync(orch: Orchestrator): Promise<SyncResult> {
  requireGh(orch);
  const count = await issuesCol(orch).estimatedDocumentCount();
  return count === 0 ? runFullSync(orch) : runIncrementalSync(orch);
}
