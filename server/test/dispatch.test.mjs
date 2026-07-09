/**
 * Dispatch tests (Implementer D) — pull-claim ordering, the claim loop,
 * renew/release, the lease sweeper, and the work/queue/board routes.
 *
 * Real Redis + Mongo via ephemeral fgtest-* containers; GitHub is ALWAYS the
 * mock server (tests never call api.github.com). Skipped when docker is
 * unavailable.
 *
 * NOTE: the "work routes" subtest depends on Implementer C's auth
 * (mintAgentToken / verifyAgentToken) being implemented — with the scaffold
 * stubs it fails loudly rather than silently passing.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { dockerAvailable, startRedis, startMongo } from "./helpers/containers.mjs";
import { startMockGitHub, makeIssue, makePull, makeReview } from "./helpers/mock-github.mjs";

// Must be set BEFORE dist/config.js is imported (config reads env at import
// time) — hence the dynamic imports inside the test body.
process.env.HIGH_PRIORITY_CAP = "2";
const ADMIN_TOKEN = "dispatch-test-admin-token";
process.env.ADMIN_TOKEN = ADMIN_TOKEN;

/** Mirror-doc shape (see the data model) from the same friendly spec that
 *  seeds the mock — keeps mirror and mock GitHub state in lockstep. */
function mirrorIssue({
  number,
  title = `Issue #${number}`,
  state = "open",
  labels = [],
  assignees = [],
  body = "",
  createdAt = "2026-01-01T00:00:00Z",
}) {
  return {
    _id: number,
    number,
    title,
    state,
    labels,
    assignees,
    body,
    user: "octocat",
    htmlUrl: `https://github.com/example/repo/issues/${number}`,
    createdAt,
    updatedAt: createdAt,
    syncedAt: createdAt,
  };
}

/** Mirror `pulls`-doc shape from the same friendly spec that seeds the mock
 *  (see mirrorIssue). `reviews`/`reviewsFetchedFor` are the MIRROR fields;
 *  `restReviews` (makeReview output) seeds the mock's reviews endpoint. */
function mirrorPull({
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
  createdAt = "2026-01-01T00:00:00Z",
  reviews,
  reviewsFetchedFor,
}) {
  return {
    _id: number,
    number,
    title,
    state,
    draft,
    labels,
    user,
    htmlUrl: `https://github.com/example/repo/pull/${number}`,
    headRef,
    headSha,
    headRepoFullName,
    baseRef,
    merged: false,
    mergedAt: null,
    createdAt,
    updatedAt: createdAt,
    syncedAt: createdAt,
    ...(reviews ? { reviews } : {}),
    ...(reviewsFetchedFor ? { reviewsFetchedFor } : {}),
  };
}

/**
 * Ordering fixture (HIGH_PRIORITY_CAP=2). Streams by oldest high item:
 * 103 (#6, jan 1), 102 (#4, jan 2), "5" (#5, jan 3), 100 (#1, jan 5),
 * 101 (#3, jan 6) → jump = issues of the first two streams = {6, 4}.
 * #6 is high but CLAIMED — it still occupies a cap slot (the shell computes
 * the jump over the whole open queue, any status). #7 is high but
 * do-not-automate and predates everything — it must NOT take a slot.
 * Candidates = available ∧ ¬do-not-automate ∧ stage ∈ {research,ideate,build}:
 * jump members first ([4]), then oldest-createdAt:
 * #2 (jan 1), #5 (jan 3), #10 (jan 4), #1 (jan 5), #3 (jan 6).
 */
const ORDERING_SPECS = [
  { number: 1, labels: ["status: available", "stage: research", "priority: high", "stream:100"], createdAt: "2026-01-05T00:00:00Z" },
  { number: 2, labels: ["status: available", "stage: research"], createdAt: "2026-01-01T00:00:00Z" },
  { number: 3, labels: ["status: available", "stage: research", "priority: high", "stream:101"], createdAt: "2026-01-06T00:00:00Z" },
  { number: 4, labels: ["status: available", "stage: research", "priority: high", "stream:102"], createdAt: "2026-01-02T00:00:00Z" },
  { number: 5, labels: ["status: available", "stage: research", "priority: high"], createdAt: "2026-01-03T00:00:00Z" },
  { number: 6, labels: ["status: claimed", "stage: research", "priority: high", "stream:103"], createdAt: "2026-01-01T00:00:00Z" },
  { number: 7, labels: ["status: available", "stage: research", "priority: high", "do-not-automate"], createdAt: "2020-01-01T00:00:00Z" },
  { number: 8, labels: ["status: available", "stage: discover"], createdAt: "2020-01-01T00:00:00Z" },
  { number: 9, labels: ["status: available"], createdAt: "2020-01-01T00:00:00Z" },
  { number: 10, labels: ["status: available", "stage: ideate"], createdAt: "2026-01-04T00:00:00Z" },
];
const ORDERING_EXPECTED = [4, 2, 5, 10, 1, 3];

test("dispatch (real redis+mongo, mock github)", async (t) => {
  if (!(await dockerAvailable())) {
    t.skip("docker unavailable");
    return;
  }

  const [redis, mongo, mock] = await Promise.all([startRedis(), startMongo(), startMockGitHub()]);
  /** @type {import("../dist/orchestrator/stores.js").Orchestrator | undefined} */
  let orch;
  const apps = [];

  try {
    const { config } = await import("../dist/config.js");
    const { connectOrchestrator, leaseKey, reviewLeaseKey, reviewCooldownKey, reworkCooldownKey } = await import("../dist/orchestrator/stores.js");
    const dispatch = await import("../dist/orchestrator/dispatch.js");
    const { FleetStore } = await import("../dist/state.js");

    assert.equal(config.highPriorityCap, 2, "HIGH_PRIORITY_CAP env must reach config before import");

    orch = await connectOrchestrator({
      ...config,
      redisUrl: redis.url,
      mongoUrl: mongo.url,
      mongoDb: "fgtest_dispatch",
      githubToken: "fgtest-token",
      githubRepo: "example/repo",
      githubApiUrl: mock.url,
    });
    assert.ok(orch, "orchestrator connects");
    assert.ok(orch.gh, "github client present when token set");
    const o = orch;

    /** Reset stores + mock and seed both from one spec list. */
    async function seed(specs) {
      await o.redis.flushdb();
      await o.db.collection("issues").deleteMany({});
      await o.db.collection("assignments").deleteMany({});
      await o.db.collection("pulls").deleteMany({});
      mock.reset();
      mock.assignableUsers = null;
      mock.seed({ issues: specs.map((s) => makeIssue(s)) });
      if (specs.length) await o.db.collection("issues").insertMany(specs.map(mirrorIssue));
    }

    const activeAssignment = (issueNumber) =>
      o.db.collection("assignments").findOne({ issueNumber, active: true });
    const anyAssignment = (issueNumber) => o.db.collection("assignments").findOne({ issueNumber });

    // ---------------------------------------------------------- ordering

    await t.test("ordering: bounded priority jump over streams, then oldest-first", async () => {
      await seed(ORDERING_SPECS);
      const queue = await dispatch.listQueue(o);
      assert.deepEqual(
        queue.map((i) => i.number),
        ORDERING_EXPECTED,
        "jump = first HIGH_PRIORITY_CAP streams by oldest high item (claimed high issues still occupy slots, do-not-automate never does), then oldest-createdAt",
      );
      // ClaimedIssue shape + stage/stream extraction.
      const first = queue[0];
      assert.equal(first.stage, "research");
      assert.equal(first.stream, "102");
      assert.equal(first.body, "");
      assert.ok(first.htmlUrl.endsWith("/issues/4"));
      assert.ok(Array.isArray(first.labels));
      // Excluded classes never appear.
      const numbers = new Set(queue.map((i) => i.number));
      assert.ok(!numbers.has(7), "do-not-automate excluded");
      assert.ok(!numbers.has(8), "stage: discover excluded (ADR-0014)");
      assert.ok(!numbers.has(9), "no stage label = not dispatchable under the default filter");
      assert.ok(!numbers.has(6), "non-available never a candidate");
    });

    await t.test("stage filter", async () => {
      await seed(ORDERING_SPECS);
      assert.deepEqual((await dispatch.listQueue(o, ["ideate"])).map((i) => i.number), [10]);
      assert.deepEqual(
        (await dispatch.listQueue(o, ["research"])).map((i) => i.number),
        [4, 2, 5, 1, 3],
      );
      assert.deepEqual(
        await dispatch.listQueue(o, ["discover"]),
        [],
        "asking only for a non-dispatchable stage matches nothing (never widens to the default)",
      );
    });

    // -------------------------------------------------------- claim loop

    await t.test("claimNext: lease → labels → assignment → mirror → event", async () => {
      await seed([
        { number: 21, labels: ["status: available", "stage: research", "stream:9"], createdAt: "2026-02-01T00:00:00Z", body: "Part of #9" },
        { number: 22, labels: ["status: available", "stage: research"], createdAt: "2026-02-02T00:00:00Z" },
      ]);
      const store = new FleetStore();

      const result = await dispatch.claimNext(o, store, {
        handle: "alice",
        tier: "standard",
        harness: "claude",
        model: "claude-fable-5",
      });
      assert.equal(result.status, "claimed");
      assert.equal(result.issue.number, 21, "oldest first");
      assert.equal(result.issue.stage, "research");
      assert.equal(result.issue.stream, "9");
      assert.equal(result.issue.body, "Part of #9");
      assert.equal(result.leaseTtlSeconds, config.leaseTtlSeconds);
      assert.ok(result.issue.labels.includes("status: claimed"));
      assert.ok(!result.issue.labels.includes("status: available"));

      // GitHub writes, in order: remove available (the test-and-set) →
      // add claimed → assign. Available-first means a stale candidate is
      // skipped before anything is written (PR #592 review).
      const writes = mock.calls.filter((c) => c.path.includes("/issues/21/"));
      assert.equal(writes.length, 3);
      assert.equal(writes[0].method, "DELETE");
      assert.ok(decodeURIComponent(writes[0].path).includes("/issues/21/labels/status: available"));
      assert.equal(writes[1].method, "POST");
      assert.ok(writes[1].path.endsWith("/issues/21/labels"));
      const added = Array.isArray(writes[1].body) ? writes[1].body : writes[1].body.labels;
      assert.deepEqual(added, ["status: claimed"]);
      assert.equal(writes[2].method, "POST");
      assert.ok(writes[2].path.endsWith("/issues/21/assignees"));
      assert.deepEqual(writes[2].body.assignees, ["alice"]);

      // Mock GitHub final state.
      const ghIssue = mock.getIssue(21);
      assert.ok(ghIssue.labels.includes("status: claimed"));
      assert.ok(!ghIssue.labels.includes("status: available"));
      assert.deepEqual(ghIssue.assignees, ["alice"]);

      // Redis lease holds the assignment id with a real TTL.
      assert.equal(await o.redis.get(leaseKey(21)), result.assignmentId);
      const ttl = await o.redis.ttl(leaseKey(21));
      assert.ok(ttl > 0 && ttl <= config.leaseTtlSeconds);

      // Assignment audit doc.
      const assignment = await activeAssignment(21);
      assert.ok(assignment);
      assert.equal(assignment._id.toHexString(), result.assignmentId);
      assert.equal(assignment.handle, "alice");
      assert.equal(assignment.tier, "standard");
      assert.equal(assignment.active, true);

      // Optimistic mirror update.
      const mirror = await o.db.collection("issues").findOne({ _id: 21 });
      assert.ok(mirror.labels.includes("status: claimed"));
      assert.ok(!mirror.labels.includes("status: available"));
      assert.deepEqual(mirror.assignees, ["alice"]);

      // Fleet feed event.
      const event = store.recentEvents().find((e) => e.kind === "claim");
      assert.ok(event, "claim event emitted");
      assert.equal(event.handle, "alice");
      assert.equal(event.ref, "#21");

      // Next claim gets the next issue; then the queue is empty.
      const second = await dispatch.claimNext(o, store, { handle: "bob", tier: "standard" });
      assert.equal(second.status, "claimed");
      assert.equal(second.issue.number, 22);
      const third = await dispatch.claimNext(o, store, { handle: "carol", tier: "standard" });
      assert.equal(third.status, "empty");
    });

    await t.test("concurrent claims get distinct issues", async () => {
      await seed(
        [31, 32, 33].map((n, i) => ({
          number: n,
          labels: ["status: available", "stage: research"],
          createdAt: `2026-03-0${i + 1}T00:00:00Z`,
        })),
      );
      const store = new FleetStore();
      const results = await Promise.all(
        ["alice", "bob", "carol"].map((handle) =>
          dispatch.claimNext(o, store, { handle, tier: "standard" }),
        ),
      );
      for (const r of results) assert.equal(r.status, "claimed");
      const claimed = results.map((r) => r.issue.number).sort((a, b) => a - b);
      assert.deepEqual(claimed, [31, 32, 33], "the Redis NX lease arbitrates — no double-claims");
    });

    await t.test("4xx on a label write → lease freed, next candidate", async () => {
      await seed([
        { number: 41, labels: ["status: available", "stage: research"], createdAt: "2026-04-01T00:00:00Z" },
        { number: 42, labels: ["status: available", "stage: research"], createdAt: "2026-04-02T00:00:00Z" },
      ]);
      mock.failOnce({ method: "POST", pathIncludes: "/issues/41/labels", status: 422 });
      const result = await dispatch.claimNext(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(result.status, "claimed");
      assert.equal(result.issue.number, 42, "fell through to the next candidate");
      assert.equal(await o.redis.exists(leaseKey(41)), 0, "failed candidate's lease released");
      const gh41 = mock.getIssue(41);
      assert.ok(gh41.labels.includes("status: available"), "failed candidate untouched");
      assert.ok(!gh41.labels.includes("status: claimed"));
      assert.equal(await anyAssignment(41), null, "no assignment recorded for the failed candidate");
    });

    await t.test("rate limit aborts the claim with retryAfterSeconds", async () => {
      await seed([
        { number: 51, labels: ["status: available", "stage: research"], createdAt: "2026-05-01T00:00:00Z" },
        { number: 52, labels: ["status: available", "stage: research"], createdAt: "2026-05-02T00:00:00Z" },
      ]);
      mock.failOnce({
        method: "POST",
        pathIncludes: "/issues/51/labels",
        status: 403,
        headers: { "x-ratelimit-remaining": "0", "retry-after": "30" },
      });
      const result = await dispatch.claimNext(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(result.status, "rate-limited", "403 with remaining=0 is a rate limit, not a fallthrough");
      assert.equal(result.retryAfterSeconds, 30);
      assert.equal(await o.redis.exists(leaseKey(51)), 0, "lease released on abort");
      assert.equal(await anyAssignment(51), null);
    });

    await t.test("4xx on the available-label DELETE (first write) → nothing written, next candidate", async () => {
      await seed([
        { number: 41, labels: ["status: available", "stage: research"], createdAt: "2026-04-01T00:00:00Z" },
        { number: 42, labels: ["status: available", "stage: research"], createdAt: "2026-04-02T00:00:00Z" },
      ]);
      mock.failOnce({ method: "DELETE", pathIncludes: "/issues/41/labels/", status: 422 });
      const result = await dispatch.claimNext(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(result.status, "claimed");
      assert.equal(result.issue.number, 42, "fell through to the next candidate");
      const gh41 = mock.getIssue(41);
      assert.ok(gh41.labels.includes("status: available"), "available never removed");
      assert.ok(!gh41.labels.includes("status: claimed"), "the DELETE is the FIRST write — nothing else was attempted");
      assert.deepEqual(gh41.assignees, [], "assignee never written");
      assert.equal(await o.redis.exists(leaseKey(41)), 0, "lease released");
      assert.equal(await anyAssignment(41), null);
    });

    await t.test("4xx on the assignee POST → both undo branches (claimed removed, available restored)", async () => {
      await seed([
        { number: 41, labels: ["status: available", "stage: research"], createdAt: "2026-04-01T00:00:00Z" },
        { number: 42, labels: ["status: available", "stage: research"], createdAt: "2026-04-02T00:00:00Z" },
      ]);
      mock.failOnce({ method: "POST", pathIncludes: "/issues/41/assignees", status: 422 });
      const result = await dispatch.claimNext(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(result.status, "claimed");
      assert.equal(result.issue.number, 42);
      const gh41 = mock.getIssue(41);
      assert.ok(gh41.labels.includes("status: available"), "step>=1 undo re-added 'status: available'");
      assert.ok(!gh41.labels.includes("status: claimed"), "step>=2 undo removed 'status: claimed'");
      assert.deepEqual(gh41.assignees, []);
      assert.equal(await o.redis.exists(leaseKey(41)), 0);
      assert.equal(await anyAssignment(41), null);
      // Undo requests were issued in order, after the two forward writes
      // (the injected assignee failure itself is not recorded by the mock):
      // remove available → add claimed → [assignee fails] → remove claimed →
      // re-add available.
      assert.deepEqual(
        mock.calls.filter((c) => c.path.includes("/issues/41/")).map((c) => ({ method: c.method, path: c.path })),
        [
          { method: "DELETE", path: "/repos/example/repo/issues/41/labels/status%3A%20available" },
          { method: "POST", path: "/repos/example/repo/issues/41/labels" },
          { method: "DELETE", path: "/repos/example/repo/issues/41/labels/status%3A%20claimed" },
          { method: "POST", path: "/repos/example/repo/issues/41/labels" },
        ],
      );
    });

    await t.test("stale mirror: live issue moved to in-review → skipped with NOTHING written (no label soup)", async () => {
      // PR #592 review, problem 1: the mirror still says "status: available"
      // but the live issue has moved on (in-review with a PR up, no rival
      // "status: claimed" present). The claimed-first order used to deposit
      // "status: claimed" on top of "status: in-review" and leave it there.
      await seed([
        { number: 47, labels: ["status: available", "stage: research"], createdAt: "2026-04-01T00:00:00Z" },
        { number: 48, labels: ["status: available", "stage: research"], createdAt: "2026-04-02T00:00:00Z" },
      ]);
      mock.addIssue(
        makeIssue({
          number: 47,
          labels: ["status: in-review", "stage: research"],
          assignees: ["worker-done"],
          createdAt: "2026-04-01T00:00:00Z",
        }),
      );
      const result = await dispatch.claimNext(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(result.status, "claimed");
      assert.equal(result.issue.number, 48, "stale candidate skipped");
      const gh47 = mock.getIssue(47);
      assert.deepEqual(
        gh47.labels.sort(),
        ["stage: research", "status: in-review"],
        "the in-review issue's labels are COMPLETELY untouched",
      );
      assert.deepEqual(gh47.assignees, ["worker-done"], "assignees untouched");
      assert.deepEqual(
        mock.calls.filter((c) => c.path.includes("/issues/47/")).map((c) => ({ method: c.method, path: c.path })),
        [{ method: "DELETE", path: "/repos/example/repo/issues/47/labels/status%3A%20available" }],
        "exactly ONE write attempted: the failed available-removal test-and-set",
      );
      assert.equal(await o.redis.exists(leaseKey(47)), 0, "lease released");
      assert.equal(await anyAssignment(47), null);
    });

    await t.test("lost label-path race (available already gone) → skip, rival's claim preserved", async () => {
      await seed([
        { number: 45, labels: ["status: available", "stage: research"], createdAt: "2026-04-01T00:00:00Z" },
        { number: 46, labels: ["status: available", "stage: research"], createdAt: "2026-04-02T00:00:00Z" },
      ]);
      // GitHub truth: a label-path worker already claimed #45 (mirror is stale).
      mock.addIssue(
        makeIssue({
          number: 45,
          labels: ["status: claimed", "stage: research"],
          assignees: ["rival"],
          createdAt: "2026-04-01T00:00:00Z",
        }),
      );
      const result = await dispatch.claimNext(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(result.status, "claimed");
      assert.equal(result.issue.number, 46, "the raced candidate is skipped, not double-claimed");
      const gh45 = mock.getIssue(45);
      assert.ok(gh45.labels.includes("status: claimed"), "the rival's claim label is never touched — we wrote nothing");
      assert.ok(!gh45.labels.includes("status: available"), "'status: available' is NOT restored over the rival");
      assert.deepEqual(gh45.assignees, ["rival"], "rival stays the sole assignee");
      assert.equal(await o.redis.exists(leaseKey(45)), 0, "lease released for the next arbiter");
      assert.equal(await anyAssignment(45), null);
    });

    await t.test("store failure after the GitHub writes → claim rolled back, error surfaces", async () => {
      await seed([{ number: 47, labels: ["status: available", "stage: research"] }]);
      // orch whose assignments.insertOne always fails — GitHub writes succeed
      // first, so the rollback (labels, assignee, lease) must run.
      const failingDb = {
        collection(name) {
          const col = o.db.collection(name);
          if (name !== "assignments") return col;
          return new Proxy(col, {
            get(target, prop) {
              if (prop === "insertOne") return () => Promise.reject(new Error("mongo down"));
              const value = target[prop];
              return typeof value === "function" ? value.bind(target) : value;
            },
          });
        },
      };
      const failingOrch = { ...o, db: failingDb };
      await assert.rejects(
        () => dispatch.claimNext(failingOrch, new FleetStore(), { handle: "alice", tier: "standard" }),
        /mongo down/,
      );
      const gh47 = mock.getIssue(47);
      assert.ok(gh47.labels.includes("status: available"), "labels rolled back on GitHub");
      assert.ok(!gh47.labels.includes("status: claimed"));
      assert.deepEqual(gh47.assignees, [], "assignee rolled back");
      assert.equal(await o.redis.exists(leaseKey(47)), 0, "lease released");
      assert.equal(await anyAssignment(47), null, "no half-recorded assignment");
    });

    await t.test("unassignable handle (auto-enrolled outsider) → claim PROCEEDS without an assignee", async () => {
      // ADR-0017 auto-enrollment: outside contributors can't be assignees on
      // GitHub (it silently drops logins without repo access) — that must
      // not block their claim; the lease + assignment doc carry identity.
      await seed([
        { number: 48, labels: ["status: available", "stage: research"], createdAt: "2026-04-01T00:00:00Z" },
      ]);
      mock.assignableUsers = new Set(["someone-else"]); // GitHub silently ignores "alice"
      const result = await dispatch.claimNext(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(result.status, "claimed", "the drop is normal, not a failure");
      assert.equal(result.issue.number, 48);
      const gh48 = mock.getIssue(48);
      assert.ok(gh48.labels.includes("status: claimed"), "labels claimed as usual");
      assert.ok(!gh48.labels.includes("status: available"));
      assert.deepEqual(gh48.assignees, [], "no phantom assignee on GitHub");
      const assignment = await activeAssignment(48);
      assert.equal(assignment.assigneeSet, false, "the doc records that no assignee landed");
      const mirror = await o.db.collection("issues").findOne({ _id: 48 });
      assert.deepEqual(mirror.assignees, [], "the mirror only holds what GitHub accepted");

      // The renew guard must not demand an assignee GitHub never accepted:
      // an authed heartbeat still extends this lease.
      await o.redis.expire(leaseKey(48), 5);
      await dispatch.renewLeasesForHandle(o, "alice");
      const ttl = await o.redis.ttl(leaseKey(48));
      assert.ok(ttl > 5, `assignee-less claim must still renew (ttl=${ttl})`);
    });

    await t.test("active-claim cap: one handle cannot sit on the whole queue", async () => {
      const specs = Array.from({ length: config.maxActiveClaims + 2 }, (_, i) => ({
        number: 60 + i,
        labels: ["status: available", "stage: research"],
        createdAt: `2026-04-0${i + 1}T00:00:00Z`,
      }));
      await seed(specs);
      for (let i = 0; i < config.maxActiveClaims; i++) {
        const r = await dispatch.claimNext(o, new FleetStore(), { handle: "greedy", tier: "standard" });
        assert.equal(r.status, "claimed", `claim ${i + 1}/${config.maxActiveClaims} under the cap`);
      }
      const capped = await dispatch.claimNext(o, new FleetStore(), { handle: "greedy", tier: "standard" });
      assert.equal(capped.status, "capped", "claim over the cap is refused");
      // The cap is per-handle: another agent still gets work.
      const other = await dispatch.claimNext(o, new FleetStore(), { handle: "modest", tier: "standard" });
      assert.equal(other.status, "claimed");
      // Releasing frees headroom.
      const first = await activeAssignment(60);
      await dispatch.releaseAssignment(o, new FleetStore(), {
        handle: "greedy",
        issue: 60,
        outcome: "done",
      });
      assert.ok(first, "sanity: #60 was greedy's");
      const after = await dispatch.claimNext(o, new FleetStore(), { handle: "greedy", tier: "standard" });
      assert.equal(after.status, "claimed", "released claim restores headroom");
    });

    await t.test("permission 403 (not rate limit) → claim aborts 'disabled', queue not walked", async () => {
      await seed([
        { number: 48, labels: ["status: available", "stage: research"], createdAt: "2026-04-01T00:00:00Z" },
        { number: 49, labels: ["status: available", "stage: research"], createdAt: "2026-04-02T00:00:00Z" },
      ]);
      mock.failOnce({
        method: "POST",
        pathIncludes: "/issues/48/labels",
        status: 403,
        headers: { "x-ratelimit-remaining": "42" }, // NOT a rate limit
      });
      const result = await dispatch.claimNext(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(result.status, "disabled");
      assert.match(result.reason, /write access/);
      assert.equal(await o.redis.exists(leaseKey(48)), 0);
      assert.equal(
        mock.calls.filter((c) => c.path.includes("/issues/49/")).length,
        0,
        "a no-write token does not burn one failing write per candidate",
      );
    });

    // ----------------------------------------------------- renew/release

    await t.test("renewLease extends only the owner's active assignment", async () => {
      await seed([{ number: 61, labels: ["status: available", "stage: research"] }]);
      const store = new FleetStore();
      const claimed = await dispatch.claimNext(o, store, { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");

      // Age the lease so a successful renew is observable.
      await o.redis.expire(leaseKey(61), 5);
      assert.equal(await dispatch.renewLease(o, "alice", 61), config.leaseTtlSeconds, "renew answers the granted TTL");
      const ttl = await o.redis.ttl(leaseKey(61));
      assert.ok(ttl > config.leaseTtlSeconds - 60, `TTL refreshed (got ${ttl})`);

      assert.equal(await dispatch.renewLease(o, "bob", 61), null, "not bob's assignment");
      assert.equal(await dispatch.renewLease(o, "alice", 999), null, "no such assignment");
    });

    await t.test("renewLeasesForHandle refreshes heartbeating agents, never throws", async () => {
      await seed([{ number: 111, labels: ["status: available", "stage: research"] }]);
      const claimed = await dispatch.claimNext(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");
      await o.redis.expire(leaseKey(111), 5);
      await dispatch.renewLeasesForHandle(o, "alice");
      const ttl = await o.redis.ttl(leaseKey(111));
      assert.ok(ttl > config.leaseTtlSeconds - 60, `TTL refreshed by heartbeat hook (got ${ttl})`);
      await dispatch.renewLeasesForHandle(o, "nobody"); // must not throw
    });

    await t.test("renewLease re-takes an expired lease (NX-guarded), never a rival's or a sweep sentinel", async () => {
      await seed([{ number: 112, labels: ["status: available", "stage: research"] }]);
      const claimed = await dispatch.claimNext(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");

      // Key expired, assignment still active → re-take succeeds.
      await o.redis.del(leaseKey(112));
      assert.equal(await dispatch.renewLease(o, "alice", 112), config.leaseTtlSeconds, "expired key is re-taken");
      assert.equal(await o.redis.get(leaseKey(112)), claimed.assignmentId, "re-taken for THIS assignment");
      const ttl = await o.redis.ttl(leaseKey(112));
      assert.ok(ttl > config.leaseTtlSeconds - 60, `re-take carries a fresh TTL (got ${ttl})`);

      // A rival's lease is never stolen or extended.
      await o.redis.set(leaseKey(112), "rival-assignment-id", "EX", 30);
      assert.equal(await dispatch.renewLease(o, "alice", 112), null, "rival's lease is untouchable");
      assert.equal(await o.redis.get(leaseKey(112)), "rival-assignment-id");
      const rivalTtl = await o.redis.ttl(leaseKey(112));
      assert.ok(rivalTtl <= 30, "rival's TTL not extended by our renew");

      // A sweeper mid-takeover (sweep:<id> sentinel) always beats renew:
      // renew must answer false so the agent re-claims instead of silently
      // working a claim the sweeper is releasing.
      await o.redis.set(leaseKey(112), `sweep:${claimed.assignmentId}`, "EX", 30);
      assert.equal(await dispatch.renewLease(o, "alice", 112), null, "sweep sentinel wins the takeover race");
      assert.equal(await o.redis.get(leaseKey(112)), `sweep:${claimed.assignmentId}`, "sentinel untouched");
    });

    await t.test("renewLeasesForHandle never resurrects an expired lease", async () => {
      await seed([{ number: 113, labels: ["status: available", "stage: research"] }]);
      const claimed = await dispatch.claimNext(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");
      const doc = await activeAssignment(113);
      const renewedAtBefore = doc.renewedAt;
      await o.redis.del(leaseKey(113));
      await dispatch.renewLeasesForHandle(o, "alice");
      assert.equal(await o.redis.exists(leaseKey(113)), 0, "a heartbeat must never resurrect an expired lease");
      const after = await activeAssignment(113);
      assert.equal(after.renewedAt, renewedAtBefore, "renewedAt untouched when nothing was renewed");
    });

    await t.test("heartbeat renewal skips assignments the mirror no longer shows as claimed (lost release)", async () => {
      await seed([{ number: 114, labels: ["status: available", "stage: research"] }]);
      const claimed = await dispatch.claimNext(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");
      // Simulate a lost `release abandoned`: the shell already reverted the
      // labels on GitHub and the mirror followed, but the release POST was
      // swallowed — the assignment is an orphan the heartbeat must NOT feed.
      await o.db.collection("issues").updateOne(
        { _id: 114 },
        { $set: { labels: ["status: available", "stage: research"], assignees: [] } },
      );
      await o.redis.expire(leaseKey(114), 5);
      await dispatch.renewLeasesForHandle(o, "alice");
      const ttl = await o.redis.ttl(leaseKey(114));
      assert.ok(ttl <= 5, `orphan assignment's lease NOT renewed by heartbeats (ttl ${ttl})`);
      // ...so it lapses and the sweeper releases the orphan naturally.
      await o.redis.del(leaseKey(114));
      await dispatch.sweepExpiredLeases(o, new FleetStore());
      const after = await anyAssignment(114);
      assert.equal(after.active, false);
      assert.equal(after.outcome, "lease-expired");
    });

    await t.test("release done: labels untouched, assignment closed, lease gone", async () => {
      await seed([{ number: 71, labels: ["status: available", "stage: research"] }]);
      const store = new FleetStore();
      const claimed = await dispatch.claimNext(o, store, { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");
      mock.reset(); // count only post-claim GitHub traffic

      assert.equal(
        await dispatch.releaseAssignment(o, store, { issue: 71, outcome: "done", handle: "alice", prNumber: 123 }),
        true,
      );
      assert.equal(mock.calls.length, 0, "done NEVER touches labels — the PR pipeline owns post-work transitions");
      const gh71 = mock.getIssue(71);
      assert.ok(gh71.labels.includes("status: claimed"), "claimed label stays for the PR pipeline");
      assert.equal(await o.redis.exists(leaseKey(71)), 0);
      const assignment = await anyAssignment(71);
      assert.equal(assignment.active, false);
      assert.equal(assignment.outcome, "done");
      assert.equal(assignment.prNumber, 123);
      assert.ok(assignment.releasedAt);

      assert.equal(
        await dispatch.releaseAssignment(o, store, { issue: 71, outcome: "done", handle: "alice" }),
        false,
        "second release finds no active assignment",
      );
    });

    await t.test("release abandoned: labels + assignee reverted", async () => {
      await seed([{ number: 81, labels: ["status: available", "stage: research"] }]);
      const store = new FleetStore();
      const claimed = await dispatch.claimNext(o, store, { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");
      mock.reset();

      assert.equal(
        await dispatch.releaseAssignment(o, store, { issue: 81, outcome: "abandoned", handle: "alice" }),
        true,
      );
      const gh81 = mock.getIssue(81);
      assert.ok(gh81.labels.includes("status: available"), "back in the queue");
      assert.ok(!gh81.labels.includes("status: claimed"));
      assert.deepEqual(gh81.assignees, [], "assignee removed");
      const assignment = await anyAssignment(81);
      assert.equal(assignment.active, false);
      assert.equal(assignment.outcome, "abandoned");
      const mirror = await o.db.collection("issues").findOne({ _id: 81 });
      assert.ok(mirror.labels.includes("status: available"), "mirror reverted too");
      assert.deepEqual(mirror.assignees, []);
      assert.equal(await o.redis.exists(leaseKey(81)), 0);
    });

    await t.test("release requires the owning handle", async () => {
      await seed([{ number: 91, labels: ["status: available", "stage: research"] }]);
      const store = new FleetStore();
      const claimed = await dispatch.claimNext(o, store, { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");
      assert.equal(
        await dispatch.releaseAssignment(o, store, { issue: 91, outcome: "abandoned", handle: "bob" }),
        false,
      );
      assert.ok(await activeAssignment(91), "alice's assignment untouched");
    });

    // ------------------------------------------------------------ sweeper

    await t.test("sweeper: gone lease → lease-expired, labels reverted, event", async () => {
      await seed([{ number: 101, labels: ["status: available", "stage: research"] }]);
      const store = new FleetStore();
      const claimed = await dispatch.claimNext(o, store, { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");
      mock.reset();

      // Sweep with the lease still alive: nothing happens.
      assert.equal(await dispatch.sweepExpiredLeases(o, store), 0);
      assert.ok(await activeAssignment(101));

      // Simulate TTL expiry deterministically.
      await o.redis.del(leaseKey(101));
      assert.equal(await dispatch.sweepExpiredLeases(o, store), 1);

      const assignment = await anyAssignment(101);
      assert.equal(assignment.active, false);
      assert.equal(assignment.outcome, "lease-expired");
      const gh101 = mock.getIssue(101);
      assert.ok(gh101.labels.includes("status: available"), "reverted on GitHub");
      assert.ok(!gh101.labels.includes("status: claimed"));
      assert.deepEqual(gh101.assignees, []);
      const event = store
        .recentEvents()
        .find((e) => e.kind === "claim" && e.text.includes("lease expired"));
      assert.ok(event, "expiry surfaces on the fleet feed");
      assert.equal(event.ref, "#101");

      assert.equal(await dispatch.sweepExpiredLeases(o, store), 0, "idempotent");
    });

    await t.test("sweeper never re-queues an issue that moved on (lost release, live PR)", async () => {
      await seed([{ number: 102, labels: ["status: available", "stage: research"] }]);
      const store = new FleetStore();
      const claimed = await dispatch.claimNext(o, store, { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");

      // Simulate the lost-release scenario: the shell opened a PR and moved
      // the issue to in-review on GitHub (whole-set label PUT), but the
      // `fleet_release done` curl timed out — the assignment stays active.
      mock.addIssue(
        makeIssue({
          number: 102,
          labels: ["status: in-review", "stage: research"],
          assignees: ["alice"],
        }),
      );
      await o.db.collection("issues").updateOne(
        { _id: 102 },
        { $set: { labels: ["status: in-review", "stage: research"] } },
      );
      mock.reset();

      await o.redis.del(leaseKey(102)); // lease finally expires
      assert.equal(await dispatch.sweepExpiredLeases(o, store), 1, "orphan assignment IS released");

      const assignment = await anyAssignment(102);
      assert.equal(assignment.active, false);
      assert.equal(assignment.outcome, "lease-expired");
      const gh102 = mock.getIssue(102);
      assert.ok(!gh102.labels.includes("status: available"), "an in-review issue is NEVER flipped back to available");
      assert.ok(gh102.labels.includes("status: in-review"), "the PR pipeline's status survives");
      assert.deepEqual(gh102.assignees, ["alice"], "assignee left for the PR pipeline");
      const requeued = store
        .recentEvents()
        .find((e) => e.kind === "claim" && e.text.includes("back in the queue"));
      assert.equal(requeued, undefined, "no 'back in the queue' announcement for a skipped revert");
      const queue = await dispatch.listQueue(o);
      assert.ok(!queue.some((i) => i.number === 102), "the issue is not re-dispatched");
    });

    await t.test("sweeper retries a transiently-failed revert on the next pass (revertPending)", async () => {
      await seed([{ number: 103, labels: ["status: available", "stage: research"] }]);
      const store = new FleetStore();
      const claimed = await dispatch.claimNext(o, store, { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");
      mock.reset();

      await o.redis.del(leaseKey(103));
      // The revert's GitHub writes 500 for the whole first sweep pass (e.g. a
      // rate-limit burst at sweep time) — including the same-pass retry.
      mock.failOnce({ method: "POST", pathIncludes: "/issues/103/labels", status: 500 });
      mock.failOnce({ method: "POST", pathIncludes: "/issues/103/labels", status: 500 });
      assert.equal(await dispatch.sweepExpiredLeases(o, store), 1, "assignment still released");

      let assignment = await anyAssignment(103);
      assert.equal(assignment.active, false);
      assert.equal(assignment.outcome, "lease-expired");
      assert.equal(assignment.revertPending, true, "failed revert is marked for retry, not lost");
      assert.ok(mock.getIssue(103).labels.includes("status: claimed"), "labels still stuck after the failure");

      // Next sweep pass heals it — 60s, not reap.sh's 2h.
      assert.equal(await dispatch.sweepExpiredLeases(o, store), 0, "no NEW expiries");
      assignment = await anyAssignment(103);
      assert.equal(assignment.revertPending, undefined, "retry marker cleared");
      const gh103 = mock.getIssue(103);
      assert.ok(gh103.labels.includes("status: available"), "revert retried and landed");
      assert.ok(!gh103.labels.includes("status: claimed"));
      assert.deepEqual(gh103.assignees, []);
      const healed = store
        .recentEvents()
        .find((e) => e.kind === "claim" && e.text.includes("revert retried"));
      assert.ok(healed, "the queue announcement fires only once the revert lands");
    });

    await t.test("admin-released: revertLabels flag honoured both ways", async () => {
      // revertLabels: true → labels + assignee reverted (force-free a wedged claim).
      await seed([{ number: 104, labels: ["status: available", "stage: research"] }]);
      const store = new FleetStore();
      let claimed = await dispatch.claimNext(o, store, { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");
      assert.equal(
        await dispatch.releaseAssignment(o, store, { issue: 104, outcome: "admin-released", revertLabels: true }),
        true,
      );
      const gh104 = mock.getIssue(104);
      assert.ok(gh104.labels.includes("status: available"), "force-free put the issue back in the queue");
      assert.ok(!gh104.labels.includes("status: claimed"));
      assert.deepEqual(gh104.assignees, []);
      assert.equal(await o.redis.exists(leaseKey(104)), 0);
      let assignment = await anyAssignment(104);
      assert.equal(assignment.active, false);
      assert.equal(assignment.outcome, "admin-released");
      const mirror = await o.db.collection("issues").findOne({ _id: 104 });
      assert.ok(mirror.labels.includes("status: available"), "mirror reverted too");

      // revertLabels: false → lease/assignment cleared, labels untouched.
      await seed([{ number: 105, labels: ["status: available", "stage: research"] }]);
      claimed = await dispatch.claimNext(o, store, { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");
      mock.reset();
      assert.equal(
        await dispatch.releaseAssignment(o, store, { issue: 105, outcome: "admin-released", revertLabels: false }),
        true,
      );
      assert.equal(mock.calls.length, 0, "no GitHub writes without revertLabels");
      assert.ok(mock.getIssue(105).labels.includes("status: claimed"), "labels left alone");
      assert.equal(await o.redis.exists(leaseKey(105)), 0, "lease still freed");
      assignment = await anyAssignment(105);
      assert.equal(assignment.active, false);
      assert.equal(assignment.outcome, "admin-released");
    });

    // ---------------------------------------------------- review dispatch

    /** Reset stores + mock and seed PULL fixtures from one spec list.
     *  `restReviews` (makeReview output) seeds the mock's reviews endpoint;
     *  `reviews`/`reviewsFetchedFor` seed the MIRROR doc. */
    async function seedPulls(specs) {
      await o.redis.flushdb();
      await o.db.collection("issues").deleteMany({});
      await o.db.collection("assignments").deleteMany({});
      await o.db.collection("pulls").deleteMany({});
      mock.reset();
      mock.assignableUsers = null;
      mock.seed({
        pulls: specs.map(({ restReviews, reviews, reviewsFetchedFor, ...s }) =>
          makePull({ ...s, reviews: restReviews ?? [] })),
      });
      if (specs.length) await o.db.collection("pulls").insertMany(specs.map(mirrorPull));
    }

    const reviewsFetches = (pr) =>
      mock.requests.filter((r) => r.method === "GET" && r.path.endsWith(`/pulls/${pr}/reviews`)).length;

    await t.test("claimNextReview: eligibility replicates review_work.sh, claim is lease-only", async () => {
      const at = (d) => `2026-06-0${d}T00:00:00Z`;
      await seedPulls([
        // All of these predate #208 — each would be claimed first if eligible.
        { number: 201, user: "alice", createdAt: at(1) }, // author == reviewer
        { number: 202, labels: ["review: human-only"], createdAt: at(1) },
        { number: 203, draft: true, createdAt: at(1) },
        { number: 204, createdAt: at(1), reviews: [
          { reviewer: "bob", state: "approved", commitId: "sha-204-1", at: at(2) },
        ] }, // approved at current head
        { number: 205, createdAt: at(1), reviews: [
          { reviewer: "bob", state: "changes_requested", commitId: "sha-205-1", at: at(2) },
        ] }, // waiting on rework at current head
        { number: 206, labels: ["do-not-automate"], createdAt: at(1) },
        { number: 207, labels: ["review: claimed"], createdAt: at(1) }, // a walk-based reviewer holds it
        { number: 208, title: "research: finding X", createdAt: at(3), reviewsFetchedFor: "sha-208-1" },
      ]);
      const store = new FleetStore();

      const result = await dispatch.claimNextReview(o, store, {
        handle: "alice",
        tier: "standard",
        harness: "claude",
        model: "claude-fable-5",
      });
      assert.equal(result.status, "claimed");
      assert.deepEqual(result.review, {
        pr: 208,
        title: "research: finding X",
        author: "octocat",
        headSha: "sha-208-1",
        htmlUrl: "https://github.com/example/repo/pull/208",
        baseRef: "main",
        headRef: "branch-208",
      });
      assert.equal(result.leaseTtlSeconds, config.reviewLeaseTtlSeconds);

      // The lease IS the claim: zero GitHub writes, and no review fetches
      // were needed (204/205 carry data at head; the rest never got that far).
      assert.equal(mock.calls.length, 0, "review claims never write labels/assignees");
      assert.equal(await o.redis.get(reviewLeaseKey(208)), result.assignmentId);
      const ttl = await o.redis.ttl(reviewLeaseKey(208));
      assert.ok(ttl > 0 && ttl <= config.reviewLeaseTtlSeconds);

      const assignment = await activeAssignment(208);
      assert.ok(assignment);
      assert.equal(assignment.kind, "review");
      assert.equal(assignment.handle, "alice");

      const event = store.recentEvents().find((e) => e.kind === "claim");
      assert.ok(event, "claim event emitted");
      assert.ok(event.text.includes("review of PR #208"), event.text);

      // Everything else stays excluded: the queue is now empty for bob too
      // (208 is leased; 201 is bob-eligible by authorship? no — 201's author
      // is alice, so for BOB it becomes eligible: prove author-exclusion is
      // per-claimant by bob claiming 201).
      const bob = await dispatch.claimNextReview(o, new FleetStore(), { handle: "bob", tier: "standard" });
      assert.equal(bob.status, "claimed");
      assert.equal(bob.review.pr, 201, "author exclusion applies per claiming handle");

      const carol = await dispatch.claimNextReview(o, new FleetStore(), { handle: "carol", tier: "standard" });
      assert.equal(carol.status, "empty", "human-only/draft/reviewed-at-head/do-not-automate/walk-claimed all excluded");
    });

    await t.test("claimNextReview: rework (new head) makes a changes-requested PR eligible again", async () => {
      // Reviewed at the OLD head, then the author pushed sha-210-2: the
      // mirror's reviewsFetchedFor still points at the old head, so dispatch
      // re-fetches once and finds no review at the CURRENT head.
      await seedPulls([
        {
          number: 210,
          headSha: "sha-210-2",
          createdAt: "2026-06-01T00:00:00Z",
          reviews: [{ reviewer: "bob", state: "changes_requested", commitId: "sha-210-1", at: "2026-06-02T00:00:00Z" }],
          reviewsFetchedFor: "sha-210-1",
          restReviews: [makeReview({ reviewer: "bob", state: "CHANGES_REQUESTED", commitId: "sha-210-1" })],
        },
      ]);
      const result = await dispatch.claimNextReview(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(result.status, "claimed");
      assert.equal(result.review.pr, 210);
      assert.equal(result.review.headSha, "sha-210-2");
      assert.equal(reviewsFetches(210), 1, "the new head triggered exactly one re-fetch");
      const doc = await o.db.collection("pulls").findOne({ _id: 210 });
      assert.equal(doc.reviewsFetchedFor, "sha-210-2", "fetch marker moved to the new head");
    });

    await t.test("lazy review fetch: once per head, persisted, never re-fetched", async () => {
      // The mirror doc has NO review data (fresh sync — the pulls list
      // carries none), but GitHub knows the PR was approved at its head.
      await seedPulls([
        {
          number: 220,
          createdAt: "2026-06-01T00:00:00Z",
          restReviews: [
            makeReview({ reviewer: "bob", state: "APPROVED", commitId: "sha-220-1", submittedAt: "2026-06-02T00:00:00Z" }),
            makeReview({ reviewer: "bob", state: "PENDING", commitId: "sha-220-1" }), // draft — dropped
          ],
        },
      ]);

      const first = await dispatch.claimNextReview(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(first.status, "empty", "the fetch revealed an approval at head — not claimable");
      assert.equal(reviewsFetches(220), 1);
      const doc = await o.db.collection("pulls").findOne({ _id: 220 });
      assert.equal(doc.reviewsFetchedFor, "sha-220-1");
      assert.deepEqual(doc.reviews, [
        { reviewer: "bob", state: "approved", commitId: "sha-220-1", at: "2026-06-02T00:00:00Z" },
      ], "REST states normalised, PENDING dropped, persisted in mirror shape");

      const second = await dispatch.claimNextReview(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(second.status, "empty");
      assert.equal(reviewsFetches(220), 1, "reviewsFetchedFor prevents a re-fetch at the same head");
    });

    await t.test("two concurrent review claims get distinct PRs", async () => {
      await seedPulls([
        { number: 231, createdAt: "2026-06-01T00:00:00Z", reviewsFetchedFor: "sha-231-1" },
        { number: 232, createdAt: "2026-06-02T00:00:00Z", reviewsFetchedFor: "sha-232-1" },
      ]);
      const results = await Promise.all(
        ["alice", "bob"].map((handle) =>
          dispatch.claimNextReview(o, new FleetStore(), { handle, tier: "standard" }),
        ),
      );
      for (const r of results) assert.equal(r.status, "claimed");
      assert.deepEqual(
        results.map((r) => r.review.pr).sort((a, b) => a - b),
        [231, 232],
        "the Redis NX review lease arbitrates — no double-reviews",
      );
    });

    await t.test("review release done/abandoned: assignment closed, ZERO GitHub writes", async () => {
      await seedPulls([
        { number: 241, createdAt: "2026-06-01T00:00:00Z", reviewsFetchedFor: "sha-241-1" },
        { number: 242, createdAt: "2026-06-02T00:00:00Z", reviewsFetchedFor: "sha-242-1" },
      ]);
      const store = new FleetStore();
      const first = await dispatch.claimNextReview(o, store, { handle: "alice", tier: "standard" });
      assert.equal(first.review.pr, 241);
      const second = await dispatch.claimNextReview(o, store, { handle: "alice", tier: "standard" });
      assert.equal(second.review.pr, 242);
      mock.reset(); // count only post-claim GitHub traffic

      // done — the review happened (PASS or NEEDS_WORK both count).
      assert.equal(
        await dispatch.releaseAssignment(o, store, { issue: 241, outcome: "done", kind: "review", handle: "alice" }),
        true,
      );
      // abandoned — reviewer crashed/usage-limited; the PR just re-queues.
      assert.equal(
        await dispatch.releaseAssignment(o, store, { issue: 242, outcome: "abandoned", kind: "review", handle: "alice" }),
        true,
      );
      assert.equal(mock.calls.length, 0, "neither outcome touches labels — review claims hold none");
      assert.deepEqual(mock.requests, [], "no GitHub traffic at all (not even the revert's live read)");

      for (const [pr, outcome] of [[241, "done"], [242, "abandoned"]]) {
        const doc = await anyAssignment(pr);
        assert.equal(doc.active, false);
        assert.equal(doc.outcome, outcome);
        assert.equal(await o.redis.exists(reviewLeaseKey(pr)), 0, `lease freed for PR #${pr}`);
      }

      assert.equal(
        await dispatch.releaseAssignment(o, store, { issue: 241, outcome: "done", kind: "review", handle: "alice" }),
        false,
        "second release finds no active review assignment",
      );
      // A done-release alone does NOT mark the PR reviewed — the POSTED
      // review does, arriving as a pull_request_review webhook. Simulate
      // that for #241; #242 was abandoned (no review posted), so it — and
      // only it — is claimable again once its abandon COOLDOWN lapses (an
      // abandon usually means the runner skipped the PR locally, so serving
      // it again immediately would just loop).
      await o.db.collection("pulls").updateOne(
        { _id: 241 },
        { $set: { reviews: [{ reviewer: "alice", state: "approved", commitId: "sha-241-1", at: "2026-06-03T00:00:00Z" }] } },
      );
      const cooled = await dispatch.claimNextReview(o, new FleetStore(), { handle: "bob", tier: "standard" });
      assert.equal(cooled.status, "empty", "an abandoned PR cools down before re-dispatch");
      await o.redis.del(reviewCooldownKey(242)); // cooldown lapses, deterministically
      const reclaim = await dispatch.claimNextReview(o, new FleetStore(), { handle: "bob", tier: "standard" });
      assert.equal(reclaim.status, "claimed");
      assert.equal(reclaim.review.pr, 242, "the abandoned PR re-queues after the cooldown; the reviewed one is skipped");
    });

    await t.test("sweeper: expired review lease → inactive, no label writes, review-queue event", async () => {
      await seedPulls([{ number: 251, createdAt: "2026-06-01T00:00:00Z", reviewsFetchedFor: "sha-251-1" }]);
      const store = new FleetStore();
      const claimed = await dispatch.claimNextReview(o, store, { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");
      mock.reset();

      // Lease still alive → nothing happens.
      assert.equal(await dispatch.sweepExpiredLeases(o, store), 0);
      assert.ok(await activeAssignment(251));

      await o.redis.del(reviewLeaseKey(251)); // TTL expiry, deterministically
      assert.equal(await dispatch.sweepExpiredLeases(o, store), 1);

      const assignment = await anyAssignment(251);
      assert.equal(assignment.active, false);
      assert.equal(assignment.outcome, "lease-expired");
      assert.equal(assignment.revertPending, undefined, "no revert is ever pending for a review");
      assert.equal(mock.calls.length, 0, "no label writes");
      assert.deepEqual(mock.requests, [], "no GitHub reads either — nothing to revert");
      const event = store
        .recentEvents()
        .find((e) => e.kind === "claim" && e.text.includes("review lease expired"));
      assert.ok(event, "expiry surfaces on the fleet feed");
      assert.ok(event.text.includes("PR #251"), event.text);
      assert.equal(event.ref, "#251");

      assert.equal(await dispatch.sweepExpiredLeases(o, store), 0, "idempotent");
    });

    await t.test("renewLeasesForHandle extends an active review lease (no claimed-label guard)", async () => {
      await seedPulls([{ number: 261, createdAt: "2026-06-01T00:00:00Z", reviewsFetchedFor: "sha-261-1" }]);
      const claimed = await dispatch.claimNextReview(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");
      // No `issues` mirror doc exists for #261 (it's a PR) — the kind:"work"
      // claimed-label guard would let this lease lapse; review renewal must not.
      await o.redis.expire(reviewLeaseKey(261), 5);
      await dispatch.renewLeasesForHandle(o, "alice");
      const ttl = await o.redis.ttl(reviewLeaseKey(261));
      assert.ok(ttl > 5, `active review lease renewed by heartbeat hook (ttl=${ttl})`);
      assert.ok(ttl <= config.reviewLeaseTtlSeconds, "renewed with the REVIEW TTL");

      // Compare-and-EXPIRE only: an expired review lease is never resurrected.
      await o.redis.del(reviewLeaseKey(261));
      await dispatch.renewLeasesForHandle(o, "alice");
      assert.equal(await o.redis.exists(reviewLeaseKey(261)), 0);

      // renewLease (the /work/renew path) answers the review TTL by kind.
      await dispatch.sweepExpiredLeases(o, new FleetStore()); // release the lapsed claim
      const reclaimed = await dispatch.claimNextReview(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(reclaimed.status, "claimed");
      assert.equal(await dispatch.renewLease(o, "alice", 261), config.reviewLeaseTtlSeconds);
    });

    await t.test("abandoned review release parks the PR behind a dispatch cooldown", async () => {
      // A PR the mirror deems eligible but every runner locally skips
      // (already passed at head, author == the runner's posting identity,
      // parked) is abandoned back to the FRONT of the oldest-first queue —
      // without a cooldown it pins every enrolled reviewer's claim forever.
      await seedPulls([
        { number: 281, createdAt: "2026-06-01T00:00:00Z", reviewsFetchedFor: "sha-281-1" },
        { number: 282, createdAt: "2026-06-02T00:00:00Z", reviewsFetchedFor: "sha-282-1" },
      ]);
      const store = new FleetStore();
      const first = await dispatch.claimNextReview(o, store, { handle: "alice", tier: "standard" });
      assert.equal(first.review.pr, 281, "oldest first");
      await dispatch.releaseAssignment(o, store, { issue: 281, outcome: "abandoned", kind: "review", handle: "alice" });

      const ttl = await o.redis.ttl(reviewCooldownKey(281));
      assert.ok(
        ttl > 0 && ttl <= config.reviewAbandonCooldownSeconds,
        `abandon sets cooldown:review:<pr> with the configured TTL (got ${ttl})`,
      );

      // The very next claim — from ANY handle — skips the cooled-down PR.
      const second = await dispatch.claimNextReview(o, new FleetStore(), { handle: "bob", tier: "standard" });
      assert.equal(second.review.pr, 282, "cooled-down PR is not re-served; the queue advances");
      await dispatch.releaseAssignment(o, new FleetStore(), { issue: 282, outcome: "abandoned", kind: "review", handle: "bob" });
      const drained = await dispatch.claimNextReview(o, new FleetStore(), { handle: "carol", tier: "standard" });
      assert.equal(drained.status, "empty", "both abandoned PRs are cooling down");

      // Cooldown lapses → dispatchable again.
      await o.redis.del(reviewCooldownKey(281));
      const again = await dispatch.claimNextReview(o, new FleetStore(), { handle: "carol", tier: "standard" });
      assert.equal(again.review.pr, 281, "the PR returns to dispatch once the cooldown lapses");

      // A lease EXPIRY (crashed reviewer) deliberately does NOT cool down:
      // the PR should promptly re-queue (ADR-0019).
      await o.redis.del(reviewLeaseKey(281));
      await dispatch.sweepExpiredLeases(o, new FleetStore());
      assert.equal(await o.redis.exists(reviewCooldownKey(281)), 0, "lease-expired sets no cooldown");
      const requeued = await dispatch.claimNextReview(o, new FleetStore(), { handle: "dave", tier: "standard" });
      assert.equal(requeued.review.pr, 281, "an expired lease re-queues immediately");
    });

    await t.test("lazy fetch persist survives a concurrent webhook review append (CAS)", async () => {
      // The race: dispatch snapshots the doc, calls GET /pulls/:n/reviews,
      // and a pull_request_review webhook lands BETWEEN the REST response
      // and the persist. A plain $set of the locally-merged array erased the
      // webhook's entry — and with reviewsFetchedFor stamped, nothing ever
      // re-fetched at that head, so the just-reviewed PR was re-dispatched.
      const { reduceWebhook } = await import("../dist/github/reduce.js");
      await seedPulls([{ number: 291, createdAt: "2026-06-01T00:00:00Z" }]); // no review data → lazy fetch
      const raw = makePull({ number: 291, headSha: "sha-291-1", createdAt: "2026-06-01T00:00:00Z" });

      const orig = o.gh.listPullReviews.bind(o.gh);
      o.gh.listPullReviews = async (...args) => {
        const out = await orig(...args); // REST answers (empty list)…
        await reduceWebhook(o, {
          // …and the webhook for a review submitted at head reduces before
          // dispatch persists its merge.
          event: "pull_request_review",
          action: "submitted",
          payload: {
            action: "submitted",
            pull_request: raw,
            review: { user: { login: "carol" }, state: "approved", commit_id: "sha-291-1", submitted_at: "2026-06-02T00:00:00Z" },
            sender: { login: "carol" },
          },
        });
        return out;
      };
      try {
        const result = await dispatch.claimNextReview(o, new FleetStore(), { handle: "alice", tier: "standard" });
        assert.equal(result.status, "empty", "the merged state shows carol's review at head — not claimable");
      } finally {
        delete o.gh.listPullReviews;
      }

      const doc = await o.db.collection("pulls").findOne({ _id: 291 });
      assert.deepEqual(
        doc.reviews,
        [{ reviewer: "carol", state: "approved", commitId: "sha-291-1", at: "2026-06-02T00:00:00Z" }],
        "the concurrently-appended webhook entry SURVIVES the lazy-fetch persist",
      );
      assert.equal(doc.reviewsFetchedFor, "sha-291-1", "fetch marker still stamped");

      const second = await dispatch.claimNextReview(o, new FleetStore(), { handle: "bob", tier: "standard" });
      assert.equal(second.status, "empty", "second claim skips the reviewed PR");
      assert.equal(reviewsFetches(291), 1, "…without re-fetching at the same head");
    });

    await t.test("a commented-only review at head does not block dispatch (shell parity)", async () => {
      // review_work.sh keys reviewed-at-revision off the merge-check STATUS
      // (check_state, success|failure) — an inline-comment review sets no
      // status, so the walk reviews the PR. Dispatch must not starve it.
      await seedPulls([
        // Oldest: dismissed at head — stays skipped (a dismissal does not
        // clear the shell's failure status at that SHA).
        { number: 301, createdAt: "2026-06-01T00:00:00Z", reviewsFetchedFor: "sha-301-1", reviews: [
          { reviewer: "bob", state: "dismissed", commitId: "sha-301-1", at: "2026-06-02T00:00:00Z" },
        ] },
        // Commented at head — including by the PR AUTHOR — still needs review.
        { number: 302, createdAt: "2026-06-02T00:00:00Z", reviewsFetchedFor: "sha-302-1", reviews: [
          { reviewer: "bob", state: "commented", commitId: "sha-302-1", at: "2026-06-03T00:00:00Z" },
          { reviewer: "octocat", state: "commented", commitId: "sha-302-1", at: "2026-06-04T00:00:00Z" },
        ] },
      ]);
      const result = await dispatch.claimNextReview(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(result.status, "claimed");
      assert.equal(result.review.pr, 302, "commented-only head is claimable; dismissed-at-head is not");
      const none = await dispatch.claimNextReview(o, new FleetStore(), { handle: "bob", tier: "standard" });
      assert.equal(none.status, "empty", "the dismissed-at-head PR stays skipped");
    });

    await t.test("round cap: dismissals lower the count; an entry array at its cap is not trusted", async () => {
      const { reduceWebhook } = await import("../dist/github/reduce.js");
      // #311 sits AT the round cap (10 CR rounds at old heads, none at the
      // current head) → not dispatched.
      const crEntries = Array.from({ length: config.maxReviewRounds }, (_, i) => ({
        reviewer: `rev-${i}`,
        state: "changes_requested",
        commitId: "sha-311-1",
        at: `2026-06-0${(i % 8) + 1}T00:00:00Z`,
      }));
      await seedPulls([
        { number: 311, headSha: "sha-311-2", createdAt: "2026-06-01T00:00:00Z", reviewsFetchedFor: "sha-311-2", reviews: crEntries },
      ]);
      const capped = await dispatch.claimNextReview(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(capped.status, "empty", "at the round cap the PR is a human's — never dispatched");

      // A maintainer dismisses one stale changes-request (the #307 unwedge):
      // the webhook's dismissal SUPERSEDES that CR entry, the count drops
      // under the cap, and the PR becomes dispatchable at its new head —
      // instead of the mirror counting dismissed rounds forever.
      await reduceWebhook(o, {
        event: "pull_request_review",
        action: "dismissed",
        payload: {
          action: "dismissed",
          pull_request: makePull({ number: 311, headSha: "sha-311-2", createdAt: "2026-06-01T00:00:00Z" }),
          review: { user: { login: "rev-0" }, state: "dismissed", commit_id: "sha-311-1", submitted_at: "2026-06-01T00:00:00Z" },
          sender: { login: "maintainer" },
        },
      });
      const doc = await o.db.collection("pulls").findOne({ _id: 311 });
      assert.equal(
        doc.reviews.filter((r) => r.state === "changes_requested").length,
        config.maxReviewRounds - 1,
        "the dismissal replaced the CR entry rather than coexisting with it",
      );
      const freed = await dispatch.claimNextReview(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(freed.status, "claimed");
      assert.equal(freed.review.pr, 311, "dismissal releases the PR back to dispatch");
      await dispatch.releaseAssignment(o, new FleetStore(), { issue: 311, outcome: "done", kind: "review", handle: "alice" });

      // #312's entry array sits AT the storage cap (PULL_REVIEWS_CAP): older
      // CR entries may have been evicted, so the mirror's CR count is a
      // floor, not the truth. Fail toward parking (skip; the walk still
      // reaches it) — matching review_rounds() echoing the cap on error.
      const manyEntries = Array.from({ length: 30 }, (_, i) => ({
        reviewer: `r-${i}`,
        state: i < 8 ? "changes_requested" : "approved", // visible CRs UNDER the round cap
        commitId: "sha-312-1",
        at: `2026-06-${String((i % 27) + 1).padStart(2, "0")}T00:00:00Z`,
      }));
      await seedPulls([
        { number: 312, headSha: "sha-312-2", createdAt: "2026-06-01T00:00:00Z", reviewsFetchedFor: "sha-312-2", reviews: manyEntries },
      ]);
      const untrusted = await dispatch.claimNextReview(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(untrusted.status, "empty", "a capped entry array is an unreliable rounds source — skipped");
    });

    await t.test("stale mirror: a merged PR is never dispatched; the live check heals the doc", async () => {
      // The pull_request `closed` webhook was lost and a reviewer claims
      // inside the sync interval: the mirror still says open. The old walk
      // listed LIVE open PRs so this could never happen — the live check on
      // the lease winner restores that property.
      await seedPulls([
        { number: 321, createdAt: "2026-06-01T00:00:00Z", reviewsFetchedFor: "sha-321-1" },
        { number: 322, createdAt: "2026-06-02T00:00:00Z", reviewsFetchedFor: "sha-322-1" },
      ]);
      // GitHub truth: #321 was merged by hand.
      mock.addPull(makePull({
        number: 321,
        state: "closed",
        merged: true,
        mergedAt: "2026-06-03T00:00:00Z",
        createdAt: "2026-06-01T00:00:00Z",
      }));
      const result = await dispatch.claimNextReview(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(result.status, "claimed");
      assert.equal(result.review.pr, 322, "the merged PR is skipped, the next candidate serves");
      assert.equal(await o.redis.exists(reviewLeaseKey(321)), 0, "the probe lease on the merged PR was freed");
      const healed = await o.db.collection("pulls").findOne({ _id: 321 });
      assert.equal(healed.state, "closed", "mirror self-healed from the live read");
      assert.equal(healed.merged, true);
      assert.equal(await anyAssignment(321), null, "no assignment recorded for the merged PR");
    });

    // ---------------------------------------------------- rework dispatch
    // (ADR-0020 — adopt a stale changes-requested PR from an absent author)

    /** Seed a rework scenario: PULL fixtures (mirror + mock, body carries the
     *  `Closes #issue` link the winner is resolved from) AND the linked ISSUE
     *  fixtures (mirror + mock, carrying `status: changes-requested`). */
    async function seedReworks(pullSpecs, issueSpecs) {
      await o.redis.flushdb();
      await o.db.collection("issues").deleteMany({});
      await o.db.collection("assignments").deleteMany({});
      await o.db.collection("pulls").deleteMany({});
      mock.reset();
      mock.assignableUsers = null;
      mock.seed({
        issues: issueSpecs.map((s) => makeIssue(s)),
        pulls: pullSpecs.map(({ restReviews, reviews, reviewsFetchedFor, ...s }) =>
          makePull({ ...s, reviews: restReviews ?? [] })),
      });
      if (issueSpecs.length) await o.db.collection("issues").insertMany(issueSpecs.map(mirrorIssue));
      if (pullSpecs.length) await o.db.collection("pulls").insertMany(pullSpecs.map(mirrorPull));
    }

    const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();
    const IDLE = hoursAgo(10); // older than the 6h default → adoptable
    const FRESH = hoursAgo(1); // within 6h → NOT idle enough

    // A single clean adoptable candidate (PR 460 → issue 234), plus a bag of
    // UNCONDITIONALLY ineligible ones — each predates it and would win if
    // eligible, and each is ineligible for ANY claimant (author/last-reviewer
    // exclusion is claimant-specific and is tested separately). All authored by
    // "carol", reviewed by "bob", so no claimant below (alice/erin) is ever the
    // author or reviewer of these.
    const cleanRework = (over = {}) => ({
      pulls: [
        { number: 443, user: "carol", headSha: "sha-443-1", body: "Closes #243", createdAt: "2026-06-01T00:00:00Z",
          reviewsFetchedFor: "sha-443-1", reviews: [{ reviewer: "bob", state: "changes_requested", commitId: "sha-443-1", at: FRESH }] }, // not idle
        { number: 444, user: "carol", headSha: "sha-444-1", headRef: "synthesis/x", body: "Part of #244", createdAt: "2026-06-01T00:00:00Z",
          reviewsFetchedFor: "sha-444-1", reviews: [{ reviewer: "bob", state: "changes_requested", commitId: "sha-444-1", at: IDLE }] }, // synthesis
        { number: 445, user: "carol", headSha: "sha-445-1", headRef: "discover/x", body: "Part of #245", createdAt: "2026-06-01T00:00:00Z",
          reviewsFetchedFor: "sha-445-1", reviews: [{ reviewer: "bob", state: "changes_requested", commitId: "sha-445-1", at: IDLE }] }, // framing
        { number: 446, user: "carol", headSha: "sha-446-1", headRepoFullName: "someforker/repo", body: "Closes #246", createdAt: "2026-06-01T00:00:00Z",
          reviewsFetchedFor: "sha-446-1", reviews: [{ reviewer: "bob", state: "changes_requested", commitId: "sha-446-1", at: IDLE }] }, // fork
        { number: 447, user: "carol", headSha: "sha-447-1", labels: ["review: human-only"], body: "Closes #247", createdAt: "2026-06-01T00:00:00Z",
          reviewsFetchedFor: "sha-447-1", reviews: [{ reviewer: "bob", state: "changes_requested", commitId: "sha-447-1", at: IDLE }] }, // human-only
        { number: 448, user: "carol", headSha: "sha-448-2", body: "Closes #248", createdAt: "2026-06-01T00:00:00Z",
          reviewsFetchedFor: "sha-448-2", reviews: [{ reviewer: "bob", state: "changes_requested", commitId: "sha-448-1", at: IDLE }] }, // author pushed since review (new head)
        { number: 449, user: "carol", headSha: "sha-449-1", body: "Closes #249", createdAt: "2026-06-01T00:00:00Z",
          reviewsFetchedFor: "sha-449-1", reviews: [{ reviewer: "bob", state: "approved", commitId: "sha-449-1", at: IDLE }] }, // approved at head
        { number: 450, user: "carol", headSha: "sha-450-1", labels: ["do-not-automate"], body: "Closes #250", createdAt: "2026-06-01T00:00:00Z",
          reviewsFetchedFor: "sha-450-1", reviews: [{ reviewer: "bob", state: "changes_requested", commitId: "sha-450-1", at: IDLE }] }, // do-not-automate
        // The clean winner — newest createdAt so it only wins once all the
        // older ones are correctly excluded.
        { number: 460, user: "dave", headSha: "sha-460-1", body: "Closes #234", title: "research: finding Y", createdAt: "2026-06-09T00:00:00Z",
          reviewsFetchedFor: "sha-460-1", reviews: [{ reviewer: "bob", state: "changes_requested", commitId: "sha-460-1", at: IDLE }], ...over },
      ],
      issues: [
        { number: 243, labels: ["status: changes-requested"] },
        { number: 246, labels: ["status: changes-requested"] },
        { number: 247, labels: ["status: changes-requested"] },
        { number: 248, labels: ["status: changes-requested"] },
        { number: 249, labels: ["status: changes-requested"] },
        { number: 250, labels: ["status: changes-requested"] },
        { number: 234, labels: ["status: changes-requested"], title: "research: finding Y" },
      ],
    });

    await t.test("claimNextRework: adopts an idle stale rework, moves labels, skips every ineligible", async () => {
      const { pulls, issues } = cleanRework();
      await seedReworks(pulls, issues);
      const store = new FleetStore();

      const result = await dispatch.claimNextRework(o, store, {
        handle: "alice", tier: "standard", harness: "claude", model: "claude-opus-4-8",
      });
      assert.equal(result.status, "claimed");
      assert.deepEqual(result.rework, {
        pr: 460, issue: 234, title: "research: finding Y", author: "dave",
        headSha: "sha-460-1", htmlUrl: "https://github.com/example/repo/pull/460", headRef: "branch-460",
      });
      assert.equal(result.leaseTtlSeconds, config.reworkLeaseTtlSeconds);

      // Issue 234 moved changes-requested → claimed + adopter assigned.
      const liveIssue = await mock.getIssue(234);
      const names = liveIssue.labels;
      assert.ok(names.includes("status: claimed") && !names.includes("status: changes-requested"), names.join(","));
      assert.ok(liveIssue.assignees.includes("alice"), "adopter assigned");

      // Lease on the ISSUE (reused work lease), assignment kind "rework" w/ PR.
      assert.equal(await o.redis.get(leaseKey(234)), result.assignmentId);
      const assignment = await activeAssignment(234);
      assert.equal(assignment.kind, "rework");
      assert.equal(assignment.handle, "alice");
      assert.equal(assignment.prNumber, 460);

      // Mirror optimistically updated.
      const mirror = await o.db.collection("issues").findOne({ _id: 234 });
      assert.ok(mirror.labels.includes("status: claimed") && !mirror.labels.includes("status: changes-requested"));

      const event = store.recentEvents().find((e) => e.kind === "claim");
      assert.ok(event && event.text.includes("adopted rework of PR #460") && event.text.includes("from @dave"), event?.text);

      // Nothing else is adoptable now (all the others are unconditionally
      // ineligible, and 460 is now leased).
      const again = await dispatch.claimNextRework(o, new FleetStore(), { handle: "erin", tier: "standard" });
      assert.equal(again.status, "empty", "idle/synthesis/framing/fork/human-only/new-head/approved/dna all excluded");
    });

    await t.test("claimNextRework: excludes the PR's OWN author and its last reviewer (per claimant)", async () => {
      // One adoptable PR authored by @dave, last-reviewed by @bob. It is
      // adoptable by a THIRD party, but never by dave (author) or bob (reviewer)
      // — that's what keeps author ≠ reviewer after the fix is re-reviewed.
      await seedReworks(
        [{ number: 480, user: "dave", headSha: "sha-480-1", body: "Closes #280", createdAt: "2026-06-01T00:00:00Z",
           reviewsFetchedFor: "sha-480-1", reviews: [{ reviewer: "bob", state: "changes_requested", commitId: "sha-480-1", at: IDLE }] }],
        [{ number: 280, labels: ["status: changes-requested"] }],
      );
      const asAuthor = await dispatch.claimNextRework(o, new FleetStore(), { handle: "dave", tier: "standard" });
      assert.equal(asAuthor.status, "empty", "the author can't adopt their own frozen PR");
      const asReviewer = await dispatch.claimNextRework(o, new FleetStore(), { handle: "bob", tier: "standard" });
      assert.equal(asReviewer.status, "empty", "the last reviewer can't adopt (would re-review their own fix)");
      const asThird = await dispatch.claimNextRework(o, new FleetStore(), { handle: "erin", tier: "standard" });
      assert.equal(asThird.status, "claimed", "a third identity adopts it");
      assert.equal(asThird.rework.pr, 480);
    });

    await t.test("claimNextRework: an ONLINE author is skipped; an OFFLINE author is adopted", async () => {
      const { pulls, issues } = cleanRework();
      await seedReworks(pulls, issues);
      const store = new FleetStore();
      // Bring @dave (author of PR 460) online in this store.
      store.upsertAgent({ type: "hello", handle: "dave", harness: "claude", model: "x" }, "http");

      const skipped = await dispatch.claimNextRework(o, store, { handle: "alice", tier: "standard" });
      assert.equal(skipped.status, "empty", "author online → not adopted (they're presumed to be reworking it)");

      // Offline store → adopted.
      const adopted = await dispatch.claimNextRework(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(adopted.status, "claimed");
      assert.equal(adopted.rework.pr, 460);
    });

    await t.test("claimNextRework: the lease stops two adopters colliding on one PR", async () => {
      const { pulls, issues } = cleanRework();
      await seedReworks(pulls, issues);
      const results = await Promise.all([
        dispatch.claimNextRework(o, new FleetStore(), { handle: "alice", tier: "standard" }),
        dispatch.claimNextRework(o, new FleetStore(), { handle: "erin", tier: "standard" }),
      ]);
      const claimed = results.filter((r) => r.status === "claimed");
      assert.equal(claimed.length, 1, "exactly one adopter wins the single candidate");
      assert.equal(claimed[0].rework.pr, 460);
    });

    await t.test("rework release done: labels left claimed (runner flips to in-review itself), lease gone", async () => {
      const { pulls, issues } = cleanRework();
      await seedReworks(pulls, issues);
      const claim = await dispatch.claimNextRework(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(claim.status, "claimed");
      const ok = await dispatch.releaseAssignment(o, new FleetStore(), {
        issue: 234, outcome: "done", kind: "rework", handle: "alice", prNumber: 460,
      });
      assert.equal(ok, true);
      const live = await mock.getIssue(234);
      const names = live.labels;
      assert.ok(names.includes("status: claimed"), "done never reverts — the runner owns the → in-review flip");
      assert.equal(await o.redis.exists(leaseKey(234)), 0, "lease freed");
      const a = await anyAssignment(234);
      assert.equal(a.active, false);
      assert.equal(a.outcome, "done");
    });

    await t.test("rework release abandoned: reverts to changes-requested, assignee removed, cools down", async () => {
      const { pulls, issues } = cleanRework();
      await seedReworks(pulls, issues);
      const claim = await dispatch.claimNextRework(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(claim.status, "claimed");
      const ok = await dispatch.releaseAssignment(o, new FleetStore(), {
        issue: 234, outcome: "abandoned", kind: "rework", handle: "alice", prNumber: 460,
      });
      assert.equal(ok, true);
      const live = await mock.getIssue(234);
      const names = live.labels;
      assert.ok(names.includes("status: changes-requested") && !names.includes("status: claimed"),
        "abandon reverts to changes-requested (NOT available), so the PR/feedback still stands");
      assert.ok(!live.assignees.includes("alice"), "adopter unassigned");
      assert.equal(await o.redis.exists(leaseKey(234)), 0, "lease freed");
      // Cooldown parks it out of re-adoption immediately.
      assert.equal(await o.redis.exists(reworkCooldownKey(234)), 1, "cooldown set");
      const again = await dispatch.claimNextRework(o, new FleetStore(), { handle: "erin", tier: "standard" });
      assert.equal(again.status, "empty", "cooling down → not re-served");
    });

    await t.test("sweeper: an expired rework lease reverts the issue to changes-requested", async () => {
      const { pulls, issues } = cleanRework();
      await seedReworks(pulls, issues);
      const claim = await dispatch.claimNextRework(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(claim.status, "claimed");
      await o.redis.del(leaseKey(234)); // simulate a crashed adopter's lapsed lease
      const expired = await dispatch.sweepExpiredLeases(o, new FleetStore());
      assert.ok(expired >= 1);
      const live = await mock.getIssue(234);
      const names = live.labels;
      assert.ok(names.includes("status: changes-requested") && !names.includes("status: claimed"),
        "sweeper reverts a rework to changes-requested, not available");
      const a = await anyAssignment(234);
      assert.equal(a.active, false);
      assert.equal(a.outcome, "lease-expired");
    });

    await t.test("claimNextRework: a do-not-automate ISSUE is never adopted (label lives on the issue, not the PR)", async () => {
      await seedReworks(
        [{ number: 490, user: "dave", headSha: "sha-490-1", body: "Closes #290", createdAt: "2026-06-01T00:00:00Z",
           reviewsFetchedFor: "sha-490-1", reviews: [{ reviewer: "bob", state: "changes_requested", commitId: "sha-490-1", at: IDLE }] }],
        [{ number: 290, labels: ["status: changes-requested", "do-not-automate"] }],
      );
      const result = await dispatch.claimNextRework(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(result.status, "empty", "do-not-automate on the worked issue blocks adoption");
    });

    await t.test("claimNextRework: lazy-fetches review state when the mirror lacks it at head", async () => {
      // No mirror `reviews`/`reviewsFetchedFor` — only the mock's REST reviews.
      // Dispatch must fetch once to discover the idle changes-request at head.
      await seedReworks(
        [{ number: 470, user: "dave", headSha: "sha-470-1", body: "Closes #270", createdAt: "2026-06-01T00:00:00Z",
           restReviews: [makeReview({ reviewer: "bob", state: "CHANGES_REQUESTED", commitId: "sha-470-1", submittedAt: IDLE })] }],
        [{ number: 270, labels: ["status: changes-requested"] }],
      );
      const result = await dispatch.claimNextRework(o, new FleetStore(), { handle: "alice", tier: "standard" });
      assert.equal(result.status, "claimed");
      assert.equal(result.rework.pr, 470);
      const doc = await o.db.collection("pulls").findOne({ _id: 470 });
      assert.equal(doc.reviewsFetchedFor, "sha-470-1", "fetch marker persisted");
    });

    // ------------------------------------------------------------- routes

    const Fastify = (await import("fastify")).default;
    const { registerQueueRoutes } = await import("../dist/routes/queue.js");
    const { registerDispatchRoutes } = await import("../dist/routes/dispatch.js");

    await t.test("public queue + board routes", async () => {
      await seed(ORDERING_SPECS);
      await o.db.collection("pulls").insertMany([
        { _id: 501, number: 501, state: "open" },
        { _id: 502, number: 502, state: "closed" },
      ]);
      const app = Fastify();
      apps.push(app);
      registerQueueRoutes(app, new FleetStore(), o);

      const queueRes = await app.inject({ method: "GET", url: "/api/v1/queue" });
      assert.equal(queueRes.statusCode, 200);
      const queueBody = queueRes.json();
      assert.equal(queueBody.ok, true);
      assert.equal(queueBody.count, ORDERING_EXPECTED.length);
      assert.deepEqual(queueBody.issues.map((i) => i.number), ORDERING_EXPECTED);

      const staged = await app.inject({ method: "GET", url: "/api/v1/queue?stages=ideate" });
      assert.deepEqual(staged.json().issues.map((i) => i.number), [10]);

      const boardRes = await app.inject({ method: "GET", url: "/api/v1/board" });
      assert.equal(boardRes.statusCode, 200);
      const board = boardRes.json();
      assert.equal(board.ok, true);
      // ORDERING_SPECS: 9 open issues carry "status: available", 1 "status: claimed".
      assert.equal(board.statuses.available, 9);
      assert.equal(board.statuses.claimed, 1);
      assert.equal(board.openIssues, 10);
      assert.equal(board.openPrs, 1);
    });

    await t.test("active-work route: who works on what, for how long, lease health", async () => {
      await seed([
        { number: 81, title: "research: X", labels: ["status: available", "stage: research"], createdAt: "2026-05-01T00:00:00Z" },
        { number: 82, title: "research: Y", labels: ["status: available", "stage: ideate"], createdAt: "2026-05-02T00:00:00Z" },
      ]);
      // A review claim shows up alongside work claims, badged by `kind` and
      // titled from the PULLS mirror (its number is a PR number).
      await o.db.collection("pulls").insertMany([
        mirrorPull({ number: 89, title: "feat: Z", createdAt: "2026-05-03T00:00:00Z", reviewsFetchedFor: "sha-89-1" }),
      ]);
      mock.addPull(makePull({ number: 89, title: "feat: Z" }));

      const claimed = await dispatch.claimNext(o, new FleetStore(), {
        handle: "worker-one",
        tier: "standard",
        harness: "codex",
        model: "gpt-x",
      });
      assert.equal(claimed.status, "claimed");
      const reviewClaimed = await dispatch.claimNextReview(o, new FleetStore(), {
        handle: "reviewer-two",
        tier: "standard",
        harness: "claude",
      });
      assert.equal(reviewClaimed.status, "claimed");

      const app = Fastify();
      apps.push(app);
      registerQueueRoutes(app, new FleetStore(), o);
      const res = await app.inject({ method: "GET", url: "/api/v1/work/active" });
      assert.equal(res.statusCode, 200);
      const body = res.json();
      assert.equal(body.count, 2);
      const row = body.work.find((w) => w.kind === "work");
      assert.equal(row.issue, 81);
      assert.equal(row.title, "research: X");
      assert.equal(row.stage, "research");
      assert.equal(row.handle, "worker-one");
      assert.equal(row.harness, "codex");
      assert.equal(typeof row.claimedAt, "string");
      assert.ok(row.leaseSecondsLeft > 0, "live lease TTL surfaced");
      const reviewRow = body.work.find((w) => w.kind === "review");
      assert.ok(reviewRow, "review claims appear with kind: review");
      assert.equal(reviewRow.issue, 89, "`issue` carries the PR number");
      assert.equal(reviewRow.title, "feat: Z", "title joined from the pulls mirror");
      assert.equal(reviewRow.stage, null);
      assert.equal(reviewRow.handle, "reviewer-two");
      assert.ok(reviewRow.leaseSecondsLeft > 0, "review lease TTL read from lease:review:<n>");

      // Released claims leave the panel (each kind independently).
      await dispatch.releaseAssignment(o, new FleetStore(), { handle: "worker-one", issue: 81, outcome: "done" });
      const afterWork = await app.inject({ method: "GET", url: "/api/v1/work/active" });
      assert.equal(afterWork.json().count, 1);
      await dispatch.releaseAssignment(o, new FleetStore(), {
        handle: "reviewer-two",
        issue: 89,
        outcome: "done",
        kind: "review",
      });
      const after = await app.inject({ method: "GET", url: "/api/v1/work/active" });
      assert.equal(after.json().count, 0);
    });

    await t.test("open-issues snapshot route: fetch_open_issues shape, stale mirror → 503", async () => {
      await seed([
        {
          number: 91,
          labels: ["status: available", "stage: research", "priority: high"],
          assignees: ["worker-a"],
          createdAt: "2026-06-01T00:00:00Z",
        },
        { number: 92, labels: ["status: claimed"], createdAt: "2026-06-02T00:00:00Z" },
      ]);
      const app = Fastify();
      apps.push(app);
      registerQueueRoutes(app, new FleetStore(), o);
      const syncState = o.db.collection("sync_state");

      // No sync has ever completed → the mirror may be INCOMPLETE (webhooks
      // only cover touched issues) → refuse, runners fall back to GitHub.
      await syncState.deleteMany({});
      let res = await app.inject({ method: "GET", url: "/api/v1/issues/open" });
      assert.equal(res.statusCode, 503, "no completed sync = untrusted mirror");

      // Stale sync → 503 too.
      await syncState.updateOne(
        { _id: "sync" },
        { $set: { lastIncrementalAt: new Date(Date.now() - 3_600_000).toISOString() } },
        { upsert: true },
      );
      res = await app.inject({ method: "GET", url: "/api/v1/issues/open" });
      assert.equal(res.statusCode, 503, "stale sync = untrusted mirror");

      // Fresh sync → the snapshot, byte-compatible with fetch_open_issues():
      // labels as [{name}], assignees as [{login}], createdAt present.
      const freshAt = new Date().toISOString();
      await syncState.updateOne({ _id: "sync" }, { $set: { lastIncrementalAt: freshAt } });
      res = await app.inject({ method: "GET", url: "/api/v1/issues/open" });
      assert.equal(res.statusCode, 200);
      const body = res.json();
      assert.equal(body.ok, true);
      assert.equal(body.generatedAt, freshAt);
      const i91 = body.issues.find((i) => i.number === 91);
      assert.deepEqual(i91, {
        number: 91,
        createdAt: "2026-06-01T00:00:00Z",
        labels: [
          { name: "status: available" },
          { name: "stage: research" },
          { name: "priority: high" },
        ],
        assignees: [{ login: "worker-a" }],
      });
      assert.ok(body.issues.some((i) => i.number === 92), "ALL open issues included, not just available");
    });

    await t.test("work routes (needs Implementer C's auth)", async () => {
      const auth = await import("../dist/orchestrator/auth.js");
      await seed([{ number: 121, labels: ["status: available", "stage: research"] }]);
      const app = Fastify();
      apps.push(app);
      registerDispatchRoutes(app, new FleetStore(), o);

      // No/garbage token → 401 before any dispatch work happens.
      const anon = await app.inject({ method: "POST", url: "/api/v1/work/claim", payload: {} });
      assert.equal(anon.statusCode, 401);
      const badTok = await app.inject({
        method: "POST",
        url: "/api/v1/work/claim",
        headers: { authorization: "Bearer fgt_bogus" },
        payload: {},
      });
      assert.equal(badTok.statusCode, 401);

      const { token } = await auth.mintAgentToken(o, { handle: "routebot", tier: "standard" });
      const authz = { authorization: `Bearer ${token}` };

      const claim = await app.inject({
        method: "POST",
        url: "/api/v1/work/claim",
        headers: authz,
        payload: { stages: ["research"], harness: "claude" },
      });
      assert.equal(claim.statusCode, 200);
      const claimBody = claim.json();
      assert.equal(claimBody.ok, true);
      assert.equal(claimBody.issue.number, 121);
      assert.ok(claimBody.assignmentId);
      assert.equal(claimBody.leaseTtlSeconds, config.leaseTtlSeconds);

      const badBody = await app.inject({
        method: "POST",
        url: "/api/v1/work/claim",
        headers: authz,
        payload: { stages: ["frobnicate"] },
      });
      assert.equal(badBody.statusCode, 400, "claimRequestSchema rejects unknown stages");

      const renew = await app.inject({
        method: "POST",
        url: "/api/v1/work/renew",
        headers: authz,
        payload: { issue: 121 },
      });
      assert.equal(renew.statusCode, 200);
      assert.equal(renew.json().leaseTtlSeconds, config.leaseTtlSeconds);

      const release = await app.inject({
        method: "POST",
        url: "/api/v1/work/release",
        headers: authz,
        payload: { issue: 121, outcome: "done", prNumber: 7 },
      });
      assert.equal(release.statusCode, 200);

      const renewGone = await app.inject({
        method: "POST",
        url: "/api/v1/work/renew",
        headers: authz,
        payload: { issue: 121 },
      });
      assert.equal(renewGone.statusCode, 404, "released assignment can't be renewed");

      const emptyClaim = await app.inject({
        method: "POST",
        url: "/api/v1/work/claim",
        headers: authz,
        payload: {},
      });
      assert.equal(emptyClaim.statusCode, 200);
      assert.equal(emptyClaim.json().issue, null, "empty queue is ok:true, issue:null");
    });

    await t.test("work routes, kind review: claim/renew/release round-trip", async () => {
      const auth = await import("../dist/orchestrator/auth.js");
      await seedPulls([
        { number: 271, title: "research: Y", createdAt: "2026-06-01T00:00:00Z", reviewsFetchedFor: "sha-271-1" },
      ]);
      const app = Fastify();
      apps.push(app);
      registerDispatchRoutes(app, new FleetStore(), o);
      const { token } = await auth.mintAgentToken(o, { handle: "reviewbot", tier: "standard" });
      const authz = { authorization: `Bearer ${token}` };

      const claim = await app.inject({
        method: "POST",
        url: "/api/v1/work/claim",
        headers: authz,
        payload: { kind: "review", harness: "claude" },
      });
      assert.equal(claim.statusCode, 200);
      const claimBody = claim.json();
      assert.equal(claimBody.ok, true);
      assert.equal(claimBody.issue, undefined, "review claims carry `review`, not `issue`");
      assert.deepEqual(claimBody.review, {
        pr: 271,
        title: "research: Y",
        author: "octocat",
        headSha: "sha-271-1",
        htmlUrl: "https://github.com/example/repo/pull/271",
        baseRef: "main",
        headRef: "branch-271",
      });
      assert.ok(claimBody.assignmentId);
      assert.equal(claimBody.leaseTtlSeconds, config.reviewLeaseTtlSeconds);
      assert.equal(claimBody.handle, "reviewbot");

      // Renew answers the REVIEW TTL (kind resolved from the assignment).
      const renew = await app.inject({
        method: "POST",
        url: "/api/v1/work/renew",
        headers: authz,
        payload: { issue: 271 },
      });
      assert.equal(renew.statusCode, 200);
      assert.equal(renew.json().leaseTtlSeconds, config.reviewLeaseTtlSeconds);

      // Empty review queue answers review:null (the runner's fall-through).
      const emptyClaim = await app.inject({
        method: "POST",
        url: "/api/v1/work/claim",
        headers: authz,
        payload: { kind: "review" },
      });
      assert.equal(emptyClaim.statusCode, 200);
      assert.equal(emptyClaim.json().review, null, "empty review queue is ok:true, review:null");

      // Releasing with the WRONG kind must not find the review assignment.
      const wrongKind = await app.inject({
        method: "POST",
        url: "/api/v1/work/release",
        headers: authz,
        payload: { issue: 271, outcome: "done" }, // kind defaults to "work"
      });
      assert.equal(wrongKind.statusCode, 404, "a review assignment is not releasable as kind work");

      const release = await app.inject({
        method: "POST",
        url: "/api/v1/work/release",
        headers: authz,
        payload: { kind: "review", issue: 271, outcome: "done" },
      });
      assert.equal(release.statusCode, 200);
      assert.equal(await o.redis.exists(reviewLeaseKey(271)), 0);

      const renewGone = await app.inject({
        method: "POST",
        url: "/api/v1/work/renew",
        headers: authz,
        payload: { issue: 271 },
      });
      assert.equal(renewGone.statusCode, 404, "released review can't be renewed");
    });

    await t.test("enroll route: TOFU mint once, 409 after, strict handle shape, config-off → 403", async () => {
      const { config: cfg } = await import("../dist/config.js");
      const auth = await import("../dist/orchestrator/auth.js");
      await seed([]);
      const app = Fastify();
      apps.push(app);
      registerDispatchRoutes(app, new FleetStore(), o);

      const first = await app.inject({
        method: "POST",
        url: "/api/v1/agents/enroll",
        payload: { handle: "route-enrollee", harness: "claude" },
      });
      assert.equal(first.statusCode, 200);
      const body = first.json();
      assert.equal(body.ok, true);
      assert.match(body.token, /^fgt_[0-9a-f]{32}$/, "a real usable token comes back exactly once");
      assert.equal(body.tier, "standard", "auto-enrollment never grants above standard");
      assert.deepEqual(
        await auth.verifyAgentToken(o, body.token),
        { handle: "route-enrollee", tier: "standard" },
        "the minted token verifies for claims/heartbeats",
      );

      const dup = await app.inject({
        method: "POST",
        url: "/api/v1/agents/enroll",
        payload: { handle: "route-enrollee" },
      });
      assert.equal(dup.statusCode, 409, "second contact never re-issues");
      assert.ok(!dup.body.includes("fgt_"), "no token material on the refusal path");

      // The handle flows into GitHub assignee calls — only a real GitHub
      // login shape may enter the registry.
      for (const bad of ["-lead", "trail-", "dou--ble", "a b", "x".repeat(40), "we/inject", ""]) {
        const r = await app.inject({ method: "POST", url: "/api/v1/agents/enroll", payload: { handle: bad } });
        assert.equal(r.statusCode, 400, `handle ${JSON.stringify(bad)} must be rejected`);
      }

      cfg.autoEnroll = false;
      try {
        const off = await app.inject({
          method: "POST",
          url: "/api/v1/agents/enroll",
          payload: { handle: "someone-new" },
        });
        assert.equal(off.statusCode, 403, "AUTO_ENROLL=0 = operator-minted tokens only");
      } finally {
        cfg.autoEnroll = true;
      }
    });

    await t.test("claim route: 429 rate-limited, redacted 502 on GitHub 5xx, 503 without a github token", async () => {
      const auth = await import("../dist/orchestrator/auth.js");
      await seed([{ number: 131, labels: ["status: available", "stage: research"] }]);
      const app = Fastify();
      apps.push(app);
      registerDispatchRoutes(app, new FleetStore(), o);
      const { token } = await auth.mintAgentToken(o, { handle: "routebot2", tier: "standard" });
      const authz = { authorization: `Bearer ${token}` };

      // GitHub rate limit → 429 + retryAfterSeconds passthrough.
      mock.failOnce({
        method: "POST",
        pathIncludes: "/issues/131/labels",
        status: 403,
        headers: { "x-ratelimit-remaining": "0", "retry-after": "30" },
      });
      const limited = await app.inject({ method: "POST", url: "/api/v1/work/claim", headers: authz, payload: {} });
      assert.equal(limited.statusCode, 429);
      assert.deepEqual(limited.json(), { ok: false, error: "github rate-limited", retryAfterSeconds: 30 });

      // GitHub 5xx → generic 502; upstream path/message never leaks; state clean.
      mock.failOnce({ method: "POST", pathIncludes: "/issues/131/labels", status: 500 });
      const upstream = await app.inject({ method: "POST", url: "/api/v1/work/claim", headers: authz, payload: {} });
      assert.equal(upstream.statusCode, 502);
      assert.deepEqual(upstream.json(), { ok: false, error: "github upstream error" });
      assert.ok(!upstream.body.includes("/repos/"), "no internal API path in the response body");
      assert.ok(!upstream.body.includes("example/repo"), "no repo path in the response body");
      assert.equal(await o.redis.exists(leaseKey(131)), 0, "lease freed on the 5xx path");
      assert.equal(await anyAssignment(131), null);
      assert.ok(mock.getIssue(131).labels.includes("status: available"), "candidate untouched");

      // Orchestration up but no GitHub token → 503.
      const noGh = Fastify();
      apps.push(noGh);
      registerDispatchRoutes(noGh, new FleetStore(), { ...o, gh: undefined });
      const disabled = await noGh.inject({ method: "POST", url: "/api/v1/work/claim", headers: authz, payload: {} });
      assert.equal(disabled.statusCode, 503);
      assert.deepEqual(disabled.json(), { ok: false, error: "no github token" });
    });

    await t.test("admin lease release route: happy path passes revertLabels through", async () => {
      const { registerAdminRoutes } = await import("../dist/routes/admin.js");
      await seed([{ number: 141, labels: ["status: available", "stage: research"] }]);
      const store = new FleetStore();
      const claimed = await dispatch.claimNext(o, store, { handle: "alice", tier: "standard" });
      assert.equal(claimed.status, "claimed");

      const app = Fastify();
      apps.push(app);
      registerAdminRoutes(app, store, o);
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/admin/lease/release",
        headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
        payload: { issue: 141, revertLabels: true },
      });
      assert.equal(res.statusCode, 200);
      assert.equal(res.json().ok, true);
      const gh141 = mock.getIssue(141);
      assert.ok(gh141.labels.includes("status: available"), "force-free reverted the labels via the route");
      assert.ok(!gh141.labels.includes("status: claimed"));
      assert.deepEqual(gh141.assignees, []);
      assert.equal(await o.redis.exists(leaseKey(141)), 0);
      const assignment = await anyAssignment(141);
      assert.equal(assignment.outcome, "admin-released");
    });

    await t.test("public queue route is rate limited per IP", async () => {
      await seed([{ number: 151, labels: ["status: available", "stage: research"] }]);
      const app = Fastify();
      apps.push(app);
      registerQueueRoutes(app, new FleetStore(), o);
      const statuses = [];
      for (let i = 0; i < 40; i++) {
        const res = await app.inject({ method: "GET", url: "/api/v1/queue" });
        statuses.push(res.statusCode);
      }
      assert.equal(statuses[0], 200, "first request serves normally");
      assert.ok(statuses.includes(429), "a flood from one IP hits the 429 budget");
      const limited = statuses.filter((s) => s === 429).length;
      assert.ok(limited >= 10, `most of the flood was refused (got ${limited} 429s)`);
    });
  } finally {
    for (const app of apps) await app.close().catch(() => undefined);
    await orch?.close().catch(() => undefined);
    await Promise.all([redis.stop(), mongo.stop(), mock.close()]);
  }
});
