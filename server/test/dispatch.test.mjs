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
import { startMockGitHub, makeIssue } from "./helpers/mock-github.mjs";

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
    const { connectOrchestrator, leaseKey } = await import("../dist/orchestrator/stores.js");
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
      assert.equal(await dispatch.renewLease(o, "alice", 61), true);
      const ttl = await o.redis.ttl(leaseKey(61));
      assert.ok(ttl > config.leaseTtlSeconds - 60, `TTL refreshed (got ${ttl})`);

      assert.equal(await dispatch.renewLease(o, "bob", 61), false, "not bob's assignment");
      assert.equal(await dispatch.renewLease(o, "alice", 999), false, "no such assignment");
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
      assert.equal(await dispatch.renewLease(o, "alice", 112), true, "expired key is re-taken");
      assert.equal(await o.redis.get(leaseKey(112)), claimed.assignmentId, "re-taken for THIS assignment");
      const ttl = await o.redis.ttl(leaseKey(112));
      assert.ok(ttl > config.leaseTtlSeconds - 60, `re-take carries a fresh TTL (got ${ttl})`);

      // A rival's lease is never stolen or extended.
      await o.redis.set(leaseKey(112), "rival-assignment-id", "EX", 30);
      assert.equal(await dispatch.renewLease(o, "alice", 112), false, "rival's lease is untouchable");
      assert.equal(await o.redis.get(leaseKey(112)), "rival-assignment-id");
      const rivalTtl = await o.redis.ttl(leaseKey(112));
      assert.ok(rivalTtl <= 30, "rival's TTL not extended by our renew");

      // A sweeper mid-takeover (sweep:<id> sentinel) always beats renew:
      // renew must answer false so the agent re-claims instead of silently
      // working a claim the sweeper is releasing.
      await o.redis.set(leaseKey(112), `sweep:${claimed.assignmentId}`, "EX", 30);
      assert.equal(await dispatch.renewLease(o, "alice", 112), false, "sweep sentinel wins the takeover race");
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
      const claimed = await dispatch.claimNext(o, new FleetStore(), {
        handle: "worker-one",
        tier: "standard",
        harness: "codex",
        model: "gpt-x",
      });
      assert.equal(claimed.status, "claimed");

      const app = Fastify();
      apps.push(app);
      registerQueueRoutes(app, new FleetStore(), o);
      const res = await app.inject({ method: "GET", url: "/api/v1/work/active" });
      assert.equal(res.statusCode, 200);
      const body = res.json();
      assert.equal(body.count, 1);
      const [row] = body.work;
      assert.equal(row.issue, 81);
      assert.equal(row.title, "research: X");
      assert.equal(row.stage, "research");
      assert.equal(row.handle, "worker-one");
      assert.equal(row.harness, "codex");
      assert.equal(typeof row.claimedAt, "string");
      assert.ok(row.leaseSecondsLeft > 0, "live lease TTL surfaced");

      // Released work leaves the panel.
      await dispatch.releaseAssignment(o, new FleetStore(), { handle: "worker-one", issue: 81, outcome: "done" });
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
