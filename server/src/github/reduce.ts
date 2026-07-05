/**
 * Webhook reducer (Implementer A).
 *
 * Given a verified, deduped webhook delivery, upsert the Mongo mirror
 * (`issues` / `pulls` from payload.issue / payload.pull_request — SAME doc
 * shape as sync writes, so both paths converge on identical documents) and
 * describe an optional item for the public live feed.
 *
 * Convergence is by construction: the canonical raw→mirror mappers
 * (`issueDocFromRaw` / `pullDocFromRaw`) live in sync.ts and are imported
 * here — webhook and sync writes share one mapping.
 *
 * Events handled: issues, issue_comment, pull_request, pull_request_review,
 * pull_request_review_comment, check_suite, check_run, label, push,
 * workflow_run, ping. Unknown events: the route stores the delivery and
 * responds 202; reduce is a no-op returning null.
 *
 * Feed policy: keep the public stream meaningful, not a raw event firehose.
 * Opened/closed/reopened issues and PRs, merges, comments and reviews make
 * the feed; label churn, check runs and workflow noise update the mirror
 * only (they'd otherwise evict real events from the capped feed).
 */
import type { EventKind } from "../protocol.js";
import type { Orchestrator } from "../orchestrator/stores.js";
import type { GhIssue, GhPull, GhUser } from "./gh-api.js";
import { issueDocFromRaw, pullDocFromRaw, type IssueDoc, type PullDoc } from "./sync.js";

/** A verified webhook delivery, as handed over by routes/webhooks.ts. */
export interface WebhookDelivery {
  /** X-GitHub-Event header. */
  event: string;
  /** payload.action when present. */
  action?: string;
  /** Full parsed JSON payload (public repo data). */
  payload: Record<string, unknown>;
}

/**
 * What the live feed should show for a delivery, if anything. The route
 * turns this into an EventItem via store.addEvent (which assigns id/at and
 * broadcasts). kind is one of the orchestration EventKinds — issue_opened,
 * issue_closed, pr_merged, or gh_activity for comments/reviews/checks —
 * plus the pre-existing pr_opened for freshly opened PRs.
 */
export interface ReducedEvent {
  kind: EventKind;
  /** Human-readable one-liner, safe for public display. */
  text: string;
  handle?: string;
  /** Issue/PR reference like "#123". */
  ref?: string;
}

// ---------------------------------------------------------------------------
// Payload plumbing

/** Loose view over the webhook payload — everything optional, checked. */
interface WebhookPayload {
  action?: unknown;
  issue?: (GhIssue & { pull_request?: unknown }) | null;
  pull_request?: GhPull | null;
  sender?: GhUser | null;
  review?: { state?: unknown } | null;
  check_suite?: { conclusion?: unknown; head_branch?: unknown } | null;
  ref?: unknown;
  commits?: unknown;
  repository?: { default_branch?: unknown } | null;
}

function truncate(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** "@alice " when we know the actor, "" when we don't. */
function actorPrefix(sender: string | undefined): string {
  return sender ? `@${sender} ` : "";
}

function feed(kind: EventKind, text: string, sender: string | undefined, num: number | undefined): ReducedEvent {
  return {
    kind,
    text,
    ...(sender ? { handle: sender } : {}),
    ...(Number.isInteger(num) ? { ref: `#${num}` } : {}),
  };
}

async function upsertIssue(orch: Orchestrator, raw: GhIssue | null | undefined): Promise<void> {
  if (!raw || !Number.isInteger(raw.number)) return;
  // The issues mirror holds REAL issues only — PR-shaped items (a comment on
  // a PR arrives as an "issue" carrying a pull_request key) are skipped; the
  // pulls mirror is fed by pull_request events and sync.
  if (raw.pull_request) return;
  await orch.db
    .collection<IssueDoc>("issues")
    .replaceOne({ _id: raw.number }, issueDocFromRaw(raw, new Date().toISOString()), { upsert: true });
}

async function upsertPull(orch: Orchestrator, raw: GhPull | null | undefined): Promise<void> {
  if (!raw || !Number.isInteger(raw.number)) return;
  await orch.db
    .collection<PullDoc>("pulls")
    .replaceOne({ _id: raw.number }, pullDocFromRaw(raw, new Date().toISOString()), { upsert: true });
}

// ---------------------------------------------------------------------------
// Reduce

/** Upsert the mirror from the delivery and return the feed item (or null
 *  when the event isn't feed-worthy). Must tolerate partial payloads. */
export async function reduceWebhook(orch: Orchestrator, delivery: WebhookDelivery): Promise<ReducedEvent | null> {
  const p = delivery.payload as WebhookPayload;
  const action = delivery.action ?? (typeof p.action === "string" ? p.action : undefined);
  const sender = typeof p.sender?.login === "string" ? p.sender.login : undefined;

  switch (delivery.event) {
    case "issues":
      return reduceIssues(orch, action, p, sender);
    case "issue_comment": {
      await upsertIssue(orch, p.issue);
      if (action !== "created" || !p.issue || !Number.isInteger(p.issue.number)) return null;
      const isPr = Boolean(p.issue.pull_request);
      return feed(
        "gh_activity",
        `${actorPrefix(sender)}commented on ${isPr ? "PR" : "issue"} #${p.issue.number}: ${truncate(p.issue.title ?? "")}`,
        sender,
        p.issue.number,
      );
    }
    case "pull_request":
      return reducePullRequest(orch, action, p, sender);
    case "pull_request_review": {
      await upsertPull(orch, p.pull_request);
      if (action !== "submitted" || !p.pull_request || !Number.isInteger(p.pull_request.number)) return null;
      const state = typeof p.review?.state === "string" ? p.review.state : "";
      const verb =
        state === "approved"
          ? "approved"
          : state === "changes_requested"
            ? "requested changes on"
            : "reviewed";
      return feed(
        "gh_activity",
        `${actorPrefix(sender)}${verb} PR #${p.pull_request.number}: ${truncate(p.pull_request.title ?? "")}`,
        sender,
        p.pull_request.number,
      );
    }
    case "pull_request_review_comment": {
      await upsertPull(orch, p.pull_request);
      if (action !== "created" || !p.pull_request || !Number.isInteger(p.pull_request.number)) return null;
      return feed(
        "gh_activity",
        `${actorPrefix(sender)}commented on a review of PR #${p.pull_request.number}`,
        sender,
        p.pull_request.number,
      );
    }
    case "check_suite": {
      // No mirror change (payload has no issue/pull). Surface failures only.
      const conclusion = typeof p.check_suite?.conclusion === "string" ? p.check_suite.conclusion : "";
      if (action !== "completed" || (conclusion !== "failure" && conclusion !== "timed_out")) return null;
      const branch = typeof p.check_suite?.head_branch === "string" ? p.check_suite.head_branch : "unknown branch";
      return { kind: "gh_activity", text: `Checks failed on ${branch}` };
    }
    case "push": {
      // Default-branch pushes only — per-PR branch pushes would drown the feed.
      const defaultBranch =
        typeof p.repository?.default_branch === "string" ? p.repository.default_branch : "main";
      if (p.ref !== `refs/heads/${defaultBranch}`) return null;
      const n = Array.isArray(p.commits) ? p.commits.length : 0;
      if (n === 0) return null;
      return feed(
        "gh_activity",
        `${actorPrefix(sender)}pushed ${n} commit${n === 1 ? "" : "s"} to ${defaultBranch}`,
        sender,
        undefined,
      );
    }
    // Handled-but-quiet: recognised events with nothing for mirror or feed.
    case "check_run":
    case "label":
    case "workflow_run":
    case "ping":
      return null;
    default:
      // Unknown events: the route already stored the delivery; nothing to do.
      return null;
  }
}

async function reduceIssues(
  orch: Orchestrator,
  action: string | undefined,
  p: WebhookPayload,
  sender: string | undefined,
): Promise<ReducedEvent | null> {
  const issue = p.issue;
  if (!issue || !Number.isInteger(issue.number)) return null;

  if (action === "deleted") {
    await orch.db.collection<IssueDoc>("issues").deleteOne({ _id: issue.number });
    return null;
  }

  // Every other action (opened/edited/labeled/assigned/closed/...) refreshes
  // the mirror — label churn is exactly what dispatch needs to see quickly.
  await upsertIssue(orch, issue);

  const title = truncate(issue.title ?? "");
  switch (action) {
    case "opened":
      return feed("issue_opened", `${actorPrefix(sender)}opened issue #${issue.number}: ${title}`, sender, issue.number);
    case "reopened":
      return feed("issue_opened", `${actorPrefix(sender)}reopened issue #${issue.number}: ${title}`, sender, issue.number);
    case "closed":
      return feed("issue_closed", `${actorPrefix(sender)}closed issue #${issue.number}: ${title}`, sender, issue.number);
    default:
      return null;
  }
}

async function reducePullRequest(
  orch: Orchestrator,
  action: string | undefined,
  p: WebhookPayload,
  sender: string | undefined,
): Promise<ReducedEvent | null> {
  const pull = p.pull_request;
  if (!pull || !Number.isInteger(pull.number)) return null;

  await upsertPull(orch, pull);

  const title = truncate(pull.title ?? "");
  switch (action) {
    case "opened":
      return feed("pr_opened", `${actorPrefix(sender)}opened PR #${pull.number}: ${title}`, sender, pull.number);
    case "reopened":
      return feed("gh_activity", `${actorPrefix(sender)}reopened PR #${pull.number}: ${title}`, sender, pull.number);
    case "closed": {
      const merged = pull.merged === true || typeof pull.merged_at === "string";
      if (merged) {
        return feed("pr_merged", `${actorPrefix(sender)}merged PR #${pull.number}: ${title}`, sender, pull.number);
      }
      return feed("gh_activity", `${actorPrefix(sender)}closed PR #${pull.number} without merging`, sender, pull.number);
    }
    default:
      return null;
  }
}
