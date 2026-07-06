/**
 * Mock GitHub REST server for orchestration tests — tests NEVER call
 * api.github.com. Point the server (or GitHubApi) at `mock.url` via
 * GITHUB_API_URL.
 *
 * Implements the surface gh-api.ts uses, for ANY `/repos/<owner>/<name>/...`:
 *  - GET    /repos/:repo/issues                (paginated, since/state filter,
 *                                               Link header; includes seeded
 *                                               pulls as PR-shaped items with
 *                                               a `pull_request` key — like
 *                                               the real /issues endpoint)
 *  - GET    /repos/:repo/issues/:n             (single live issue)
 *  - GET    /repos/:repo/pulls                 (paginated, state filter)
 *  - GET    /repos/:repo/pulls/:n              (single live pull)
 *  - GET    /repos/:repo/pulls/:n/reviews      (seeded via makePull's
 *                                               `reviews` / makeReview)
 *  - POST   /repos/:repo/issues/:n/labels      body {labels:[...]} | [...]
 *  - DELETE /repos/:repo/issues/:n/labels/:name
 *  - POST   /repos/:repo/issues/:n/assignees   body {assignees:[...]} —
 *           logins outside `assignableUsers` (when set) are SILENTLY
 *           dropped, matching real GitHub ("Only users with push access can
 *           add assignees... silently ignored otherwise")
 *  - DELETE /repos/:repo/issues/:n/assignees   body {assignees:[...]}
 *
 * Every WRITE call is recorded in `mock.calls` (in order) so tests can
 * assert exactly what label/assignee traffic happened. Failures are
 * injectable per-request via `failOnce()` (e.g. 422 on a label write, or a
 * 403 rate-limit with x-ratelimit-remaining: 0).
 *
 * Usage:
 *   const mock = await startMockGitHub();
 *   mock.seed({ issues: [makeIssue({ number: 1, labels: ["status: available", "stage: research"] })] });
 *   mock.failOnce({ method: "POST", pathIncludes: "/issues/1/labels", status: 422 });
 *   ...assert on mock.calls, mock.getIssue(1).labels...
 *   await mock.close();
 */
import { createServer } from "node:http";

const nowIso = () => new Date().toISOString();

/**
 * Build a GitHub-REST-shaped issue from a friendly spec.
 * `labels`/`assignees` accept plain strings.
 */
export function makeIssue({
  number,
  title = `Issue #${number}`,
  state = "open",
  labels = [],
  assignees = [],
  body = "",
  user = "octocat",
  createdAt = nowIso(),
  updatedAt = createdAt,
  closedAt = null,
} = {}) {
  if (!Number.isInteger(number)) throw new Error("makeIssue: number is required");
  return {
    number,
    title,
    state,
    labels: labels.map((l) => (typeof l === "string" ? { name: l } : l)),
    assignees: assignees.map((a) => (typeof a === "string" ? { login: a } : a)),
    body,
    user: { login: user },
    html_url: `https://github.com/example/repo/issues/${number}`,
    created_at: createdAt,
    updated_at: updatedAt,
    closed_at: closedAt,
  };
}

/** Build a GitHub-REST-shaped pull request from a friendly spec. `reviews`
 *  (makeReview output) back the GET /pulls/:n/reviews endpoint. */
export function makePull({
  number,
  title = `PR #${number}`,
  state = "open",
  draft = false,
  labels = [],
  user = "octocat",
  headRef = `branch-${number}`,
  headSha = `sha-${number}-1`,
  headRepoFullName = "example/repo",
  baseRef = "main",
  merged = false,
  mergedAt = null,
  createdAt = nowIso(),
  updatedAt = createdAt,
  reviews = [],
} = {}) {
  if (!Number.isInteger(number)) throw new Error("makePull: number is required");
  return {
    number,
    title,
    state,
    draft,
    labels: labels.map((l) => (typeof l === "string" ? { name: l } : l)),
    user: { login: user },
    html_url: `https://github.com/example/repo/pull/${number}`,
    head: { ref: headRef, sha: headSha, repo: { full_name: headRepoFullName } },
    base: { ref: baseRef },
    merged,
    merged_at: mergedAt,
    created_at: createdAt,
    updated_at: updatedAt,
    reviews,
  };
}

/** Build a GitHub-REST-shaped submitted review (as `GET /pulls/:n/reviews`
 *  returns them — state in UPPER CASE, unlike webhook payloads). */
export function makeReview({
  reviewer = "reviewer",
  state = "APPROVED",
  commitId,
  submittedAt = nowIso(),
} = {}) {
  if (!commitId) throw new Error("makeReview: commitId is required");
  return {
    user: { login: reviewer },
    state,
    commit_id: commitId,
    submitted_at: submittedAt,
  };
}

/** A pull rendered the way GET /issues renders PRs (with a pull_request key). */
function pullAsIssueItem(pull) {
  return {
    number: pull.number,
    title: pull.title,
    state: pull.state,
    labels: pull.labels,
    assignees: [],
    body: "",
    user: pull.user,
    html_url: pull.html_url,
    created_at: pull.created_at,
    updated_at: pull.updated_at,
    closed_at: pull.state === "closed" ? pull.updated_at : null,
    pull_request: { url: `${pull.html_url}.diff` },
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

class MockGitHub {
  constructor() {
    /** @type {Map<number, object>} REST-shaped issues, mutated by writes. */
    this.issues = new Map();
    /** @type {Map<number, object>} REST-shaped pulls. */
    this.pulls = new Map();
    /** Every write call, in order: { method, path, body, at }. */
    this.calls = [];
    /** Every request (reads included): { method, path }. */
    this.requests = [];
    /** Pending one-shot failures (consumed in FIFO order on match). */
    this.failures = [];
    /** Value returned in x-ratelimit-remaining on ordinary responses. */
    this.rateLimitRemaining = 5000;
    /** @type {Set<string>|null} When set, only these logins can be assigned;
     *  others are SILENTLY dropped (real GitHub behaviour). null = everyone. */
    this.assignableUsers = null;
    this.server = null;
    this.url = "";
  }

  /** Replace fixtures. Accepts raw REST shapes or makeIssue/makePull output. */
  seed({ issues = [], pulls = [] } = {}) {
    this.issues = new Map(issues.map((i) => [i.number, i]));
    this.pulls = new Map(pulls.map((p) => [p.number, p]));
  }

  addIssue(issue) {
    this.issues.set(issue.number, issue);
  }

  addPull(pull) {
    this.pulls.set(pull.number, pull);
  }

  /** Current server-side state of an issue (labels as plain names). */
  getIssue(number) {
    const issue = this.issues.get(number);
    if (!issue) return undefined;
    return {
      ...issue,
      labels: issue.labels.map((l) => l.name),
      assignees: issue.assignees.map((a) => a.login),
    };
  }

  /**
   * Fail the next matching request once, then behave normally.
   * @param {object} spec
   * @param {string} [spec.method]        e.g. "POST"
   * @param {string} [spec.pathIncludes]  substring match on the path
   * @param {number} spec.status          e.g. 422, or 403 for a rate limit
   * @param {object} [spec.body]          JSON body (default {message})
   * @param {object} [spec.headers]       extra headers — for a rate-limit
   *   test pass { "x-ratelimit-remaining": "0", "retry-after": "30" }
   */
  failOnce(spec) {
    if (!Number.isInteger(spec.status)) throw new Error("failOnce: status is required");
    this.failures.push(spec);
  }

  /** Clear recorded calls + pending failures (fixtures untouched). */
  reset() {
    this.calls = [];
    this.requests = [];
    this.failures = [];
  }

  matchFailure(method, path) {
    const idx = this.failures.findIndex(
      (f) =>
        (!f.method || f.method.toUpperCase() === method) &&
        (!f.pathIncludes || path.includes(f.pathIncludes)),
    );
    if (idx === -1) return null;
    return this.failures.splice(idx, 1)[0];
  }

  async handle(req, res) {
    const parsed = new URL(req.url ?? "/", "http://mock");
    const path = parsed.pathname;
    const method = (req.method ?? "GET").toUpperCase();
    this.requests.push({ method, path });

    const send = (status, body, headers = {}) => {
      res.writeHead(status, {
        "content-type": "application/json",
        "x-ratelimit-remaining": String(this.rateLimitRemaining),
        ...headers,
      });
      res.end(JSON.stringify(body));
    };

    const failure = this.matchFailure(method, path);
    if (failure) {
      send(failure.status, failure.body ?? { message: `injected ${failure.status}` }, failure.headers ?? {});
      return;
    }

    // ---- reads ----------------------------------------------------------
    const listIssues = /^\/repos\/[^/]+\/[^/]+\/issues$/.exec(path);
    if (method === "GET" && listIssues) {
      const state = parsed.searchParams.get("state") ?? "open";
      const since = parsed.searchParams.get("since");
      let items = [...this.issues.values(), ...[...this.pulls.values()].map(pullAsIssueItem)];
      if (state !== "all") items = items.filter((i) => i.state === state);
      if (since) items = items.filter((i) => Date.parse(i.updated_at) >= Date.parse(since));
      items.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)); // sort=updated desc
      this.paginate(parsed, items, send);
      return;
    }

    const singleIssue = /^\/repos\/[^/]+\/[^/]+\/issues\/(\d+)$/.exec(path);
    if (method === "GET" && singleIssue) {
      const issue = this.issues.get(Number(singleIssue[1]));
      if (!issue) {
        send(404, { message: "Not Found" });
        return;
      }
      send(200, issue);
      return;
    }

    const listPulls = /^\/repos\/[^/]+\/[^/]+\/pulls$/.exec(path);
    if (method === "GET" && listPulls) {
      const state = parsed.searchParams.get("state") ?? "open";
      let items = [...this.pulls.values()];
      if (state !== "all") items = items.filter((p) => p.state === state);
      items.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
      this.paginate(parsed, items, send);
      return;
    }

    const singlePull = /^\/repos\/[^/]+\/[^/]+\/pulls\/(\d+)$/.exec(path);
    if (method === "GET" && singlePull) {
      const pull = this.pulls.get(Number(singlePull[1]));
      if (!pull) {
        send(404, { message: "Not Found" });
        return;
      }
      send(200, pull);
      return;
    }

    const pullReviews = /^\/repos\/[^/]+\/[^/]+\/pulls\/(\d+)\/reviews$/.exec(path);
    if (method === "GET" && pullReviews) {
      const pull = this.pulls.get(Number(pullReviews[1]));
      if (!pull) {
        send(404, { message: "Not Found" });
        return;
      }
      this.paginate(parsed, pull.reviews ?? [], send);
      return;
    }

    // ---- writes (recorded) ----------------------------------------------
    const labelsPath = /^\/repos\/[^/]+\/[^/]+\/issues\/(\d+)\/labels(?:\/(.+))?$/.exec(path);
    const assigneesPath = /^\/repos\/[^/]+\/[^/]+\/issues\/(\d+)\/assignees$/.exec(path);

    if (labelsPath || assigneesPath) {
      const number = Number((labelsPath ?? assigneesPath)[1]);
      const raw = await readBody(req);
      let body = null;
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          send(400, { message: "invalid JSON" });
          return;
        }
      }
      this.calls.push({ method, path, body, at: nowIso() });

      const issue = this.issues.get(number);
      if (!issue) {
        send(404, { message: "Not Found" });
        return;
      }
      const touch = () => {
        issue.updated_at = nowIso();
      };

      if (labelsPath && method === "POST" && !labelsPath[2]) {
        // GitHub accepts {labels:[...]} or a bare array.
        const labels = Array.isArray(body) ? body : body?.labels;
        if (!Array.isArray(labels) || labels.length === 0) {
          send(422, { message: "Validation Failed" });
          return;
        }
        for (const name of labels) {
          if (!issue.labels.some((l) => l.name === name)) issue.labels.push({ name });
        }
        touch();
        send(200, issue.labels);
        return;
      }

      if (labelsPath && method === "DELETE" && labelsPath[2]) {
        const name = decodeURIComponent(labelsPath[2]);
        const had = issue.labels.some((l) => l.name === name);
        issue.labels = issue.labels.filter((l) => l.name !== name);
        touch();
        if (!had) {
          send(404, { message: "Label does not exist" });
          return;
        }
        send(200, issue.labels);
        return;
      }

      if (assigneesPath && (method === "POST" || method === "DELETE")) {
        const assignees = body?.assignees;
        if (!Array.isArray(assignees)) {
          send(422, { message: "Validation Failed" });
          return;
        }
        if (method === "POST") {
          for (const login of assignees) {
            // Real GitHub SILENTLY ignores assignees without repo access.
            if (this.assignableUsers && !this.assignableUsers.has(login)) continue;
            if (!issue.assignees.some((a) => a.login === login)) issue.assignees.push({ login });
          }
        } else {
          issue.assignees = issue.assignees.filter((a) => !assignees.includes(a.login));
        }
        touch();
        send(method === "POST" ? 201 : 200, issue);
        return;
      }
    }

    send(404, { message: "Not Found" });
  }

  /** per_page/page + a GitHub-style Link header when more pages remain. */
  paginate(parsed, items, send) {
    const perPage = Math.min(Number(parsed.searchParams.get("per_page") ?? 30) || 30, 100);
    const page = Math.max(Number(parsed.searchParams.get("page") ?? 1) || 1, 1);
    const start = (page - 1) * perPage;
    const slice = items.slice(start, start + perPage);
    const lastPage = Math.max(Math.ceil(items.length / perPage), 1);

    const link = [];
    const pageUrl = (p) => {
      const u = new URL(parsed.href);
      u.searchParams.set("page", String(p));
      // Match GitHub: Link URLs are absolute against the API host.
      return `${this.url}${u.pathname}${u.search}`;
    };
    if (page < lastPage) link.push(`<${pageUrl(page + 1)}>; rel="next"`, `<${pageUrl(lastPage)}>; rel="last"`);
    if (page > 1) link.push(`<${pageUrl(page - 1)}>; rel="prev"`, `<${pageUrl(1)}>; rel="first"`);

    send(200, slice, link.length ? { link: link.join(", ") } : {});
  }

  close() {
    return new Promise((resolve) => {
      if (!this.server) return resolve();
      this.server.close(() => resolve());
      // node keeps keep-alive sockets open — don't hang the test run.
      this.server.closeAllConnections?.();
    });
  }
}

/** Start the mock on an ephemeral 127.0.0.1 port. */
export async function startMockGitHub() {
  const mock = new MockGitHub();
  mock.server = createServer((req, res) => {
    mock.handle(req, res).catch((err) => {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ message: String(err) }));
    });
  });
  await new Promise((resolve) => mock.server.listen(0, "127.0.0.1", resolve));
  const addr = mock.server.address();
  mock.url = `http://127.0.0.1:${addr.port}`;
  return mock;
}
