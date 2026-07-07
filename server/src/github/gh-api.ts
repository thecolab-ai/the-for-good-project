/**
 * Tiny typed GitHub REST client (Implementer B).
 *
 *  - Plain `fetch` against `cfg.githubApiUrl` (overridable so tests hit the
 *    mock server in test/helpers/mock-github.mjs — tests NEVER call
 *    api.github.com), `Authorization: Bearer <githubToken>` when set.
 *  - List methods follow Link-header pagination internally and return the
 *    accumulated items, bounded by `maxPages` (default cfg.maxSyncPages).
 *  - Non-2xx responses throw `GitHubApiError` with the HTTP status and the
 *    remaining rate limit parsed from `x-ratelimit-remaining` /
 *    `retry-after`, so callers (dispatch, sync) can distinguish
 *    rate-limiting (`err.isRateLimit`) from a plain 4xx.
 */
import { config } from "../config.js";

const API_VERSION = "2022-11-28";
const USER_AGENT = "forgood-fleet-server";

/** Raw GitHub label/user fragments — only the fields we consume. */
export interface GhLabel { name: string }
export interface GhUser { login: string }

/** Raw REST issue item (subset). Items from `GET /issues` that carry a
 *  `pull_request` key are PRs in disguise — sync routes them to `pulls`. */
export interface GhIssue {
  number: number;
  title: string;
  state: "open" | "closed";
  labels: GhLabel[];
  assignees: GhUser[];
  body?: string | null;
  user: GhUser | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
  pull_request?: unknown;
}

/** Raw REST pull-request item (subset). */
export interface GhPull {
  number: number;
  title: string;
  state: "open" | "closed";
  draft: boolean;
  labels: GhLabel[];
  user: GhUser | null;
  html_url: string;
  /** PR description. Rework dispatch (ADR-0020) reads it to resolve the worked
   *  issue from a `Closes` / `Part of #n` link. `GET /pulls/{n}` returns it;
   *  the pulls LIST endpoint also carries it but the mirror doesn't store it. */
  body?: string | null;
  head: { ref: string; sha: string; repo: { full_name: string } | null };
  base: { ref: string };
  merged?: boolean;
  merged_at?: string | null;
  created_at: string;
  updated_at: string;
}

/** Raw REST pull-request review item (subset of
 *  `GET /repos/{repo}/pulls/{n}/reviews`). REST reports `state` in UPPER
 *  CASE ("APPROVED", "CHANGES_REQUESTED", "COMMENTED", "DISMISSED",
 *  "PENDING"); webhook payloads use lower case — callers normalise. */
export interface GhReview {
  user: GhUser | null;
  state: string;
  commit_id: string;
  submitted_at?: string | null;
}

export interface ListIssuesOpts {
  /** ISO timestamp — only items updated at or after this instant. */
  since?: string;
  state?: "open" | "closed" | "all";
  /** Page cap for the pagination iterator; default config.maxSyncPages. */
  maxPages?: number;
  sort?: "updated" | "created";
  perPage?: number;
}

export interface ListPullsOpts {
  state?: "open" | "closed" | "all";
  maxPages?: number;
  perPage?: number;
}

/** Thrown on any non-2xx GitHub response (and on typed 2xx anomalies —
 *  see `code`). */
export class GitHubApiError extends Error {
  readonly status: number;
  /** Parsed from `x-ratelimit-remaining` when present. */
  readonly rateLimitRemaining?: number;
  /** Parsed from `retry-after` / `x-ratelimit-reset` when present. */
  readonly retryAfterSeconds?: number;
  /** Typed condition for callers that must react to a specific anomaly:
   *  "assignee-ignored" = GitHub answered 2xx but silently dropped a
   *  requested assignee (the login lacks repo access). */
  readonly code?: "assignee-ignored";

  constructor(
    message: string,
    opts: {
      status: number;
      rateLimitRemaining?: number;
      retryAfterSeconds?: number;
      code?: "assignee-ignored";
    },
  ) {
    super(message);
    this.name = "GitHubApiError";
    this.status = opts.status;
    this.rateLimitRemaining = opts.rateLimitRemaining;
    this.retryAfterSeconds = opts.retryAfterSeconds;
    this.code = opts.code;
  }

  /** True for 403/429 responses that are rate-limiting rather than a
   *  permission problem (remaining === 0, or explicit 429). */
  get isRateLimit(): boolean {
    return this.status === 429 || (this.status === 403 && this.rateLimitRemaining === 0);
  }
}

/** Config slice the client needs — pass `config` (default) or a test stand-in. */
export type GitHubApiConfig = Pick<
  typeof config,
  "githubToken" | "githubRepo" | "githubApiUrl" | "maxSyncPages"
>;

function headerNum(headers: Headers, name: string): number | undefined {
  const raw = headers.get(name);
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** `retry-after` is seconds-to-wait; `x-ratelimit-reset` is an epoch second. */
function retryAfterSeconds(headers: Headers): number | undefined {
  const retryAfter = headerNum(headers, "retry-after");
  if (retryAfter !== undefined) return Math.max(0, Math.ceil(retryAfter));
  const reset = headerNum(headers, "x-ratelimit-reset");
  if (reset !== undefined) return Math.max(0, Math.ceil(reset - Date.now() / 1000));
  return undefined;
}

/** Extract the rel="next" URL from a GitHub Link header, if any. */
function nextLink(link: string | null): string | undefined {
  if (!link) return undefined;
  for (const part of link.split(",")) {
    const m = /<([^>]+)>\s*;\s*rel="next"/.exec(part.trim());
    if (m) return m[1];
  }
  return undefined;
}

export class GitHubApi {
  constructor(readonly cfg: GitHubApiConfig = config) {}

  private headers(hasBody: boolean): Record<string, string> {
    const h: Record<string, string> = {
      accept: "application/vnd.github+json",
      "x-github-api-version": API_VERSION,
      "user-agent": USER_AGENT,
    };
    if (this.cfg.githubToken) h.authorization = `Bearer ${this.cfg.githubToken}`;
    if (hasBody) h["content-type"] = "application/json";
    return h;
  }

  private repoUrl(path: string): string {
    return `${this.cfg.githubApiUrl}/repos/${this.cfg.githubRepo}${path}`;
  }

  /** One HTTP round trip. Throws GitHubApiError on any non-2xx; the caller
   *  must consume the returned Response's body. */
  private async request(method: string, url: string, body?: unknown): Promise<Response> {
    const res = await fetch(url, {
      method,
      headers: this.headers(body !== undefined),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let message = `GitHub ${method} ${new URL(url).pathname} -> ${res.status}`;
      try {
        const parsed = JSON.parse(text) as { message?: string };
        if (parsed?.message) message += `: ${parsed.message}`;
      } catch {
        /* non-JSON error body — status alone is enough */
      }
      throw new GitHubApiError(message, {
        status: res.status,
        rateLimitRemaining: headerNum(res.headers, "x-ratelimit-remaining"),
        retryAfterSeconds: retryAfterSeconds(res.headers),
      });
    }
    return res;
  }

  /** A write call whose response body we don't need (but must drain). */
  private async write(method: string, url: string, body?: unknown): Promise<void> {
    const res = await this.request(method, url, body);
    await res.arrayBuffer().catch(() => undefined);
  }

  /** Follow `Link: rel="next"` until exhausted or `maxPages` fetched. */
  private async listPaginated<T>(firstUrl: string, maxPages: number): Promise<T[]> {
    const cap = Math.max(1, maxPages);
    const items: T[] = [];
    let url: string | undefined = firstUrl;
    let pages = 0;
    while (url && pages < cap) {
      const res = await this.request("GET", url);
      const page = (await res.json()) as T[];
      items.push(...page);
      pages += 1;
      url = nextLink(res.headers.get("link"));
    }
    return items;
  }

  /** `GET /repos/{repo}/issues` — includes PR-shaped items (`pull_request` key). */
  async listIssues(opts: ListIssuesOpts = {}): Promise<GhIssue[]> {
    const q = new URLSearchParams();
    q.set("state", opts.state ?? "open");
    q.set("per_page", String(opts.perPage ?? 100));
    if (opts.since) q.set("since", opts.since);
    if (opts.sort) {
      q.set("sort", opts.sort);
      q.set("direction", "desc");
    }
    return this.listPaginated<GhIssue>(
      `${this.repoUrl("/issues")}?${q.toString()}`,
      opts.maxPages ?? this.cfg.maxSyncPages,
    );
  }

  /** `GET /repos/{repo}/pulls`. */
  async listPulls(opts: ListPullsOpts = {}): Promise<GhPull[]> {
    const q = new URLSearchParams();
    q.set("state", opts.state ?? "open");
    q.set("per_page", String(opts.perPage ?? 100));
    return this.listPaginated<GhPull>(
      `${this.repoUrl("/pulls")}?${q.toString()}`,
      opts.maxPages ?? this.cfg.maxSyncPages,
    );
  }

  /** `GET /repos/{repo}/pulls/{n}/reviews` — a PR's submitted reviews, oldest
   *  first. Used by review dispatch's lazy review-state fetch (the pulls LIST
   *  endpoint doesn't carry reviews, so the mirror fetches them on demand,
   *  once per head SHA). */
  async listPullReviews(pr: number, opts: { maxPages?: number; perPage?: number } = {}): Promise<GhReview[]> {
    const q = new URLSearchParams();
    q.set("per_page", String(opts.perPage ?? 100));
    return this.listPaginated<GhReview>(
      `${this.repoUrl(`/pulls/${pr}/reviews`)}?${q.toString()}`,
      opts.maxPages ?? this.cfg.maxSyncPages,
    );
  }

  /** `GET /repos/{repo}/issues/{n}` — one issue, live. Used where GitHub (the
   *  durable truth) must be consulted rather than the possibly-stale mirror,
   *  e.g. before reverting claim labels. */
  async getIssue(issue: number): Promise<GhIssue> {
    const res = await this.request("GET", this.repoUrl(`/issues/${issue}`));
    return (await res.json()) as GhIssue;
  }

  /** `GET /repos/{repo}/pulls/{n}` — one pull request, live. Review dispatch
   *  verifies a lease-winning candidate is still OPEN before handing it out:
   *  a lost `pull_request closed` webhook inside the sync interval would
   *  otherwise dispatch a merged/closed PR for a full (wasted) agent review. */
  async getPull(pr: number): Promise<GhPull> {
    const res = await this.request("GET", this.repoUrl(`/pulls/${pr}`));
    return (await res.json()) as GhPull;
  }

  /** `POST /repos/{repo}/issues/{n}/labels` body `{labels}`. */
  async addLabels(issue: number, labels: string[]): Promise<void> {
    await this.write("POST", this.repoUrl(`/issues/${issue}/labels`), { labels });
  }

  /** `DELETE /repos/{repo}/issues/{n}/labels/{name}`. Returns true when the
   *  label was removed; false when GitHub answered 404 (label already absent)
   *  — callers for whom "wasn't there" is a race signal (a rival already took
   *  the claim) check the return value; undo/cleanup callers ignore it. */
  async removeLabel(issue: number, name: string): Promise<boolean> {
    try {
      await this.write(
        "DELETE",
        this.repoUrl(`/issues/${issue}/labels/${encodeURIComponent(name)}`),
      );
      return true;
    } catch (err) {
      if (err instanceof GitHubApiError && err.status === 404) return false;
      throw err;
    }
  }

  /** `POST /repos/{repo}/issues/{n}/assignees` body `{assignees}`.
   *  GitHub silently IGNORES logins without repo access (2xx with the
   *  assignee simply absent), so parse the response and throw a typed
   *  "assignee-ignored" error when a requested login didn't land — a
   *  misconfigured handle must fail loudly, not produce a claim whose
   *  assignee never existed. */
  async addAssignees(issue: number, assignees: string[]): Promise<void> {
    const res = await this.request("POST", this.repoUrl(`/issues/${issue}/assignees`), {
      assignees,
    });
    let landed: string[] | null = null;
    try {
      const body = (await res.json()) as { assignees?: Array<{ login?: string }> };
      if (Array.isArray(body?.assignees)) landed = body.assignees.map((a) => a?.login ?? "");
    } catch {
      /* unparseable body — nothing to verify against */
    }
    if (landed) {
      const missing = assignees.filter((a) => !landed.includes(a));
      if (missing.length > 0) {
        throw new GitHubApiError(
          `GitHub silently ignored assignee(s) on #${issue} — the handle likely lacks repo access`,
          { status: res.status, code: "assignee-ignored" },
        );
      }
    }
  }

  /** `DELETE /repos/{repo}/issues/{n}/assignees` body `{assignees}`. */
  async removeAssignees(issue: number, assignees: string[]): Promise<void> {
    await this.write("DELETE", this.repoUrl(`/issues/${issue}/assignees`), { assignees });
  }
}
