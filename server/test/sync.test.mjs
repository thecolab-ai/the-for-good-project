/**
 * GitHub client + mirror sync tests (Implementer B).
 *
 * Coverage (per spec): Link-header pagination, since-filter, issue-vs-PR
 * routing, sync_state advance, page cap — plus rate-limit error surfacing,
 * write endpoints, the removeLabel 404 swallow, the 65k body cap, and the
 * boot-sync full/incremental branch.
 *
 * GitHub is ALWAYS the mock server (test/helpers/mock-github.mjs) — these
 * tests never call api.github.com. The sync tests additionally need real
 * Redis + Mongo via fgtest-* containers and skip when docker is unavailable;
 * the gh-api client tests run everywhere.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

import { dockerAvailable, startRedis, startMongo } from "./helpers/containers.mjs";
import { startMockGitHub, makeIssue, makePull } from "./helpers/mock-github.mjs";
import { GitHubApi, GitHubApiError } from "../dist/github/gh-api.js";
import {
  ISSUE_BODY_CAP,
  runBootSync,
  runFullSync,
  runIncrementalSync,
} from "../dist/github/sync.js";
import { connectOrchestrator } from "../dist/orchestrator/stores.js";

const REPO = "thecolab-ai/the-for-good-project";
const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

const iso = (msAgo) => new Date(Date.now() - msAgo).toISOString();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Client config pointed at a mock instead of api.github.com. */
const ghCfg = (mock, extra = {}) => ({
  githubToken: "test-token",
  githubRepo: REPO,
  githubApiUrl: mock.url,
  maxSyncPages: 20,
  ...extra,
});

const docker = await dockerAvailable();
const skip = docker ? false : "docker unavailable";

// ---------------------------------------------------------------------------
// GitHubApi client (no docker needed — mock only)
// ---------------------------------------------------------------------------

test("gh-api client", async (t) => {
  const mock = await startMockGitHub();
  t.after(() => mock.close());

  await t.test("follows Link-header pagination and accumulates every page", async () => {
    mock.seed({
      issues: Array.from({ length: 250 }, (_, i) =>
        makeIssue({ number: i + 1, updatedAt: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString() }),
      ),
    });
    mock.reset();
    const gh = new GitHubApi(ghCfg(mock));
    const items = await gh.listIssues({ state: "all", perPage: 100 });
    assert.equal(items.length, 250);
    assert.equal(new Set(items.map((i) => i.number)).size, 250, "no page overlap");
    const pageFetches = mock.requests.filter(
      (r) => r.method === "GET" && r.path.endsWith("/issues"),
    );
    assert.equal(pageFetches.length, 3, "250 items at per_page=100 is 3 pages");
  });

  await t.test("maxPages caps pagination — explicit opt and cfg.maxSyncPages default", async () => {
    const gh = new GitHubApi(ghCfg(mock));
    assert.equal((await gh.listIssues({ state: "all", perPage: 100, maxPages: 2 })).length, 200);

    const capped = new GitHubApi(ghCfg(mock, { maxSyncPages: 1 }));
    assert.equal((await capped.listIssues({ state: "all", perPage: 100 })).length, 100);
  });

  await t.test("passes `since` through — server-side filter applies", async () => {
    mock.seed({
      issues: [
        makeIssue({ number: 1, updatedAt: iso(3 * HOUR) }),
        makeIssue({ number: 2, updatedAt: iso(10 * MIN) }),
      ],
    });
    const gh = new GitHubApi(ghCfg(mock));
    const items = await gh.listIssues({ state: "all", since: iso(HOUR) });
    assert.deepEqual(items.map((i) => i.number), [2]);
  });

  await t.test("403 with x-ratelimit-remaining: 0 surfaces as a rate limit", async () => {
    mock.failOnce({
      method: "GET",
      pathIncludes: "/issues",
      status: 403,
      headers: { "x-ratelimit-remaining": "0", "retry-after": "30" },
    });
    const gh = new GitHubApi(ghCfg(mock));
    await assert.rejects(gh.listIssues({ state: "all" }), (err) => {
      assert.ok(err instanceof GitHubApiError, `expected GitHubApiError, got ${err}`);
      assert.equal(err.status, 403);
      assert.equal(err.rateLimitRemaining, 0);
      assert.equal(err.retryAfterSeconds, 30);
      assert.equal(err.isRateLimit, true);
      return true;
    });
  });

  await t.test("a plain 4xx is NOT a rate limit", async () => {
    mock.failOnce({ method: "POST", pathIncludes: "/issues/1/labels", status: 422 });
    const gh = new GitHubApi(ghCfg(mock));
    await assert.rejects(gh.addLabels(1, ["status: claimed"]), (err) => {
      assert.ok(err instanceof GitHubApiError);
      assert.equal(err.status, 422);
      assert.equal(err.isRateLimit, false);
      return true;
    });
  });

  await t.test("label/assignee writes hit the right endpoints with the right bodies", async () => {
    mock.seed({
      issues: [makeIssue({ number: 7, labels: ["status: available"], assignees: [] })],
    });
    mock.reset();
    const gh = new GitHubApi(ghCfg(mock));

    await gh.addLabels(7, ["status: claimed"]);
    await gh.removeLabel(7, "status: available");
    await gh.addAssignees(7, ["alice"]);
    await gh.removeAssignees(7, ["alice"]);

    const suffix = (p) => decodeURIComponent(p.replace(`/repos/${REPO}/issues/7`, ""));
    assert.deepEqual(
      mock.calls.map((c) => `${c.method} ${suffix(c.path)}`),
      ["POST /labels", "DELETE /labels/status: available", "POST /assignees", "DELETE /assignees"],
    );
    assert.deepEqual(mock.calls[0].body, { labels: ["status: claimed"] });
    assert.deepEqual(mock.calls[2].body, { assignees: ["alice"] });

    const state = mock.getIssue(7);
    assert.deepEqual(state.labels, ["status: claimed"]);
    assert.deepEqual(state.assignees, []);
  });

  await t.test("removeLabel swallows a 404 (label already absent) but not other errors", async () => {
    await new GitHubApi(ghCfg(mock)).removeLabel(7, "no-such-label"); // must resolve

    mock.failOnce({ method: "DELETE", pathIncludes: "/labels/", status: 500 });
    await assert.rejects(new GitHubApi(ghCfg(mock)).removeLabel(7, "whatever"), (err) => {
      assert.ok(err instanceof GitHubApiError);
      assert.equal(err.status, 500);
      return true;
    });
  });
});

// ---------------------------------------------------------------------------
// Mirror sync (real Redis + Mongo via fgtest-* containers)
// ---------------------------------------------------------------------------

/** @type {import("./helpers/mock-github.mjs").MockGitHub} */ let syncMock;
/** @type {{url: string, stop(): Promise<void>}} */ let redis;
/** @type {{url: string, stop(): Promise<void>}} */ let mongo;
/** @type {import("../dist/orchestrator/stores.js").Orchestrator} */ let orch;
/** Base config shared by both orchestrator connections in these tests. */ let baseCfg;

before(async () => {
  if (!docker) return;
  syncMock = await startMockGitHub();
  [redis, mongo] = await Promise.all([startRedis(), startMongo()]);
  baseCfg = { redisUrl: redis.url, mongoUrl: mongo.url, mongoDb: "fgtest_sync", ...ghCfg(syncMock) };
  orch = await connectOrchestrator(baseCfg);
  assert.ok(orch, "connectOrchestrator returned undefined despite URLs set");
});

after(async () => {
  await orch?.close();
  await syncMock?.close();
  await Promise.all([redis?.stop(), mongo?.stop()]);
});

test("mirror sync", { skip }, async (t) => {
  const issues = () => orch.db.collection("issues");
  const pulls = () => orch.db.collection("pulls");
  const syncState = () => orch.db.collection("sync_state").findOne({ _id: "sync" });

  await t.test("boot sync on an empty mirror runs a full pass and routes issues vs PRs", async () => {
    syncMock.seed({
      issues: [
        makeIssue({
          number: 1,
          title: "Open issue",
          labels: ["status: available", "stage: research"],
          assignees: ["alice"],
          body: "hello",
          user: "bob",
          createdAt: iso(3 * DAY),
          updatedAt: iso(HOUR),
        }),
        makeIssue({
          number: 2,
          title: "Recently closed",
          state: "closed",
          closedAt: iso(DAY),
          createdAt: iso(10 * DAY),
          updatedAt: iso(DAY),
        }),
        makeIssue({
          number: 3,
          title: "Stale closed",
          state: "closed",
          closedAt: iso(60 * DAY),
          createdAt: iso(90 * DAY),
          updatedAt: iso(60 * DAY),
        }),
        makeIssue({
          number: 4,
          title: "Big body",
          body: "x".repeat(ISSUE_BODY_CAP + 5000),
          createdAt: iso(2 * DAY),
          updatedAt: iso(2 * HOUR),
        }),
      ],
      pulls: [
        makePull({
          number: 10,
          title: "Open PR",
          headRef: "research/foo",
          labels: ["stream: 42"],
          createdAt: iso(2 * DAY),
          updatedAt: iso(30 * MIN),
        }),
        makePull({
          number: 11,
          title: "Merged PR",
          state: "closed",
          merged: true,
          mergedAt: iso(45 * DAY),
          createdAt: iso(50 * DAY),
          updatedAt: iso(45 * DAY),
        }),
      ],
    });

    const result = await runBootSync(orch);
    // Issues 1, 2, 4 — NOT 3 (closed, updated 60d ago, outside the 30-day window).
    assert.equal(result.issuesUpserted, 3);
    // Pull 10 (open) — NOT 11 (closed, stale).
    assert.equal(result.pullsUpserted, 1);

    const issue1 = await issues().findOne({ _id: 1 });
    assert.equal(issue1.number, 1);
    assert.equal(issue1.title, "Open issue");
    assert.equal(issue1.state, "open");
    assert.deepEqual(issue1.labels, ["status: available", "stage: research"]);
    assert.deepEqual(issue1.assignees, ["alice"]);
    assert.equal(issue1.user, "bob");
    assert.equal(issue1.body, "hello");
    assert.ok(issue1.htmlUrl.includes("/issues/1"));
    assert.ok(issue1.createdAt && issue1.updatedAt && issue1.syncedAt);

    assert.equal(await issues().findOne({ _id: 3 }), null, "stale closed issue excluded");
    assert.equal(await issues().findOne({ _id: 10 }), null, "PR never lands in issues");

    const big = await issues().findOne({ _id: 4 });
    assert.equal(big.body.length, ISSUE_BODY_CAP, "body capped at 65k");

    const pull10 = await pulls().findOne({ _id: 10 });
    assert.equal(pull10.title, "Open PR");
    assert.equal(pull10.state, "open");
    assert.equal(pull10.draft, false);
    assert.equal(pull10.merged, false);
    assert.equal(pull10.headRef, "research/foo");
    assert.equal(pull10.headRepoFullName, "example/repo");
    assert.equal(pull10.baseRef, "main");
    assert.deepEqual(pull10.labels, ["stream: 42"]);
    assert.equal(await pulls().findOne({ _id: 11 }), null, "stale closed PR excluded");

    const state = await syncState();
    assert.ok(state.lastFullAt, "full sync stamps lastFullAt");
    assert.equal(state.lastIncrementalAt, state.lastFullAt);
  });

  await t.test("boot sync on a non-empty mirror runs incremental instead", async () => {
    const stateBefore = await syncState();
    await sleep(20);
    const result = await runBootSync(orch);
    // Nothing on the mock was updated in the since window — no writes.
    assert.deepEqual(result, { issuesUpserted: 0, pullsUpserted: 0 });
    const stateAfter = await syncState();
    assert.equal(stateAfter.lastFullAt, stateBefore.lastFullAt, "no new full pass");
    assert.ok(
      Date.parse(stateAfter.lastIncrementalAt) > Date.parse(stateBefore.lastIncrementalAt),
      "incremental watermark advanced",
    );
  });

  await t.test("incremental picks up only items updated since the last pass", async () => {
    const raw = syncMock.issues.get(1);
    raw.title = "Open issue (edited)";
    raw.updated_at = new Date().toISOString();

    const result = await runIncrementalSync(orch);
    assert.equal(result.issuesUpserted, 1, "only the edited issue is in the since window");
    assert.equal(result.pullsUpserted, 0);

    const doc1 = await issues().findOne({ _id: 1 });
    assert.equal(doc1.title, "Open issue (edited)");
    const doc2 = await issues().findOne({ _id: 2 });
    assert.ok(
      Date.parse(doc2.syncedAt) < Date.parse(doc1.syncedAt),
      "untouched issue was not re-upserted",
    );
  });

  await t.test("incremental routes an updated PR to pulls with full /pulls detail", async () => {
    const raw = syncMock.pulls.get(11);
    raw.title = "Merged PR (relabeled)";
    raw.labels = [{ name: "status: in review" }];
    raw.updated_at = new Date().toISOString();

    const result = await runIncrementalSync(orch);
    assert.equal(result.pullsUpserted, 1);

    const doc = await pulls().findOne({ _id: 11 });
    assert.equal(doc.title, "Merged PR (relabeled)");
    assert.equal(doc.state, "closed");
    assert.equal(doc.merged, true, "merged flag comes from the /pulls detail");
    assert.equal(doc.headRef, "branch-11");
    assert.deepEqual(doc.labels, ["status: in review"]);
    assert.equal(await issues().findOne({ _id: 11 }), null, "PR-shaped item never lands in issues");
  });

  await t.test("maxSyncPages caps a whole sync pass", async () => {
    // Fresh db + a client capped at one page; 150 seeded issues → only 100 land.
    syncMock.seed({
      issues: Array.from({ length: 150 }, (_, i) =>
        makeIssue({ number: 1000 + i, createdAt: iso(DAY + i * MIN), updatedAt: iso(HOUR + i * MIN) }),
      ),
    });
    const capped = await connectOrchestrator({
      ...baseCfg,
      mongoDb: "fgtest_sync_capped",
      maxSyncPages: 1,
    });
    try {
      const result = await runFullSync(capped);
      assert.equal(result.issuesUpserted, 100);
      assert.equal(await capped.db.collection("issues").countDocuments(), 100);
    } finally {
      await capped.close();
    }
  });
});
