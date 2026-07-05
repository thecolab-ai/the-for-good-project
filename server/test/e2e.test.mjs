/**
 * End-to-end orchestration test (spec: "Testing" — test/e2e.test.mjs).
 *
 * Boots the REAL compiled server (`node dist/index.js`) as a subprocess on a
 * random port with orchestration ON: ephemeral fgtest-* Redis + Mongo and the
 * mock GitHub seeded with a labeled queue. Then walks the whole enrolled-agent
 * lifecycle over plain HTTP, exactly as a runner would:
 *
 *   admin mint → claim → authed heartbeat renews lease + returns no pending
 *   commands → admin stop command → next heartbeat returns it (exactly once)
 *   → release done → assignment inactive; /api/v1/queue reflects the mirror
 *   throughout, and the label write calls land on the mock in the right order.
 *
 * Then past the single-agent lifecycle:
 *   two CONCURRENT claims race and get DIFFERENT issues (the lease arbiter),
 *   and a GitHub webhook with a valid HMAC signature (invalid → 401) upserts
 *   a brand-new issue into the mirror that the very next claim picks up.
 *
 * The seeded queue is realistic: priority-high + stream labels, a discover
 * root (never dispatched, ADR-0014) and a do-not-automate issue (never
 * dispatched despite being the oldest available research issue).
 *
 * GitHub is ALWAYS the mock (tests never call api.github.com). Skipped when
 * docker is unavailable.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import { once } from "node:events";
import net from "node:net";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { dockerAvailable, startRedis, startMongo } from "./helpers/containers.mjs";
import { startMockGitHub, makeIssue, makePull } from "./helpers/mock-github.mjs";

const execFileP = promisify(execFile);

const ADMIN_TOKEN = "e2e-admin-token-not-secret";
const WEBHOOK_SECRET = "e2e-webhook-secret-not-secret";
const HANDLE = "e2e-worker";
const HANDLE_2 = "e2e-worker-2";
const LEASE_TTL_SECONDS = 120;

/** Ask the kernel for a free port (tiny TOCTOU window — fine for tests). */
function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

/** redis-cli inside the fgtest container — no extra client dep in the test. */
async function redisCli(redis, ...args) {
  const { stdout } = await execFileP("docker", ["exec", redis.name, "redis-cli", ...args]);
  return stdout.trim();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("e2e: mint → claim → heartbeat → stop command → release done → claim race → webhook", async (t) => {
  if (!(await dockerAvailable())) {
    t.skip("docker unavailable");
    return;
  }

  const [redis, mongo, mock] = await Promise.all([startRedis(), startMongo(), startMockGitHub()]);

  // Labeled queue on the mock — the boot full sync builds the mirror from it.
  // Expected dispatch order: 50 (priority-high jump) → 30 (oldest) → 31.
  // 40 is a discover root: NEVER dispatchable (ADR-0014), but on the board.
  // 20 carries do-not-automate: NEVER dispatchable either, despite being the
  // oldest available research issue in the queue.
  mock.seed({
    issues: [
      makeIssue({ number: 20, title: "Parked by a human", labels: ["status: available", "stage: research", "do-not-automate"], createdAt: "2019-01-01T00:00:00Z" }),
      makeIssue({ number: 30, title: "Oldest research question", labels: ["status: available", "stage: research"], createdAt: "2026-01-01T00:00:00Z" }),
      makeIssue({ number: 31, title: "Ideate something", labels: ["status: available", "stage: ideate"], createdAt: "2026-02-01T00:00:00Z" }),
      makeIssue({ number: 40, title: "Discover root", labels: ["status: available", "stage: discover"], createdAt: "2020-01-01T00:00:00Z" }),
      makeIssue({ number: 50, title: "Urgent research", labels: ["status: available", "stage: research", "priority: high", "stream:9"], body: "do the thing", createdAt: "2026-03-01T00:00:00Z" }),
    ],
    pulls: [makePull({ number: 60, state: "open" })],
  });

  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;

  const env = {
    ...process.env,
    PORT: String(port),
    HOST: "127.0.0.1",
    LOG_LEVEL: "warn",
    REDIS_URL: redis.url,
    MONGO_URL: mongo.url,
    MONGO_DB: "fgtest_e2e",
    GITHUB_TOKEN: "e2e-fake-token", // never a real token — GITHUB_API_URL is the mock
    GITHUB_API_URL: mock.url,
    GITHUB_REPO: "example/repo",
    ADMIN_TOKEN,
    WEBHOOK_SECRET,
    LEASE_TTL_SECONDS: String(LEASE_TTL_SECONDS),
    // Keep interval syncs out of the way — boot sync alone seeds the mirror,
    // so mock.calls stays a pure record of the claim/release label traffic.
    SYNC_INTERVAL_SECONDS: "3600",
    SYNC_FULL_INTERVAL_SECONDS: "3600",
  };
  delete env.STATE_FILE;
  delete env.HISTORY_DB_FILE;
  delete env.STATIC_DIR;

  const serverPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));
  const child = spawn(process.execPath, [serverPath], { env, stdio: ["ignore", "pipe", "pipe"] });
  let serverLogs = "";
  child.stdout.on("data", (d) => (serverLogs += d));
  child.stderr.on("data", (d) => (serverLogs += d));

  const http = async (method, path, { body, token } = {}) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    return { status: res.status, body: await res.json() };
  };

  /** POST a GitHub-shaped webhook, HMAC-signed over the raw bytes (or with a
   *  deliberately wrong signature when `signature` is passed). */
  const postWebhook = async (payload, { event = "issues", delivery = randomUUID(), signature } = {}) => {
    const raw = JSON.stringify(payload);
    const sig = signature ?? `sha256=${createHmac("sha256", WEBHOOK_SECRET).update(raw).digest("hex")}`;
    const res = await fetch(`${base}/api/v1/webhooks/github`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-github-event": event,
        "x-github-delivery": delivery,
        "x-hub-signature-256": sig,
      },
      body: raw,
    });
    return { status: res.status, body: await res.json() };
  };

  try {
    // -- readiness: server up AND boot full sync has populated the mirror ----
    const deadline = Date.now() + 45_000;
    for (;;) {
      const ready = await http("GET", "/api/v1/queue").catch(() => null);
      if (ready?.status === 200 && ready.body.ok && ready.body.count === 3) break;
      if (Date.now() > deadline) {
        assert.fail(`server never became ready with a synced mirror.\n--- server logs ---\n${serverLogs}`);
      }
      await sleep(250);
    }

    // -- public queue + board reflect the mirror -----------------------------
    let queue = await http("GET", "/api/v1/queue");
    assert.deepEqual(
      queue.body.issues.map((i) => i.number),
      [50, 30, 31],
      "priority-high jumps, then oldest-first; discover roots and do-not-automate never appear",
    );
    assert.equal(queue.body.issues[0].stage, "research");
    assert.equal(queue.body.issues[0].stream, "9");

    const board = await http("GET", "/api/v1/board");
    assert.equal(board.status, 200);
    assert.deepEqual(board.body.statuses, { available: 5 });
    assert.equal(board.body.openIssues, 5);
    assert.equal(board.body.openPrs, 1);

    // -- admin mint (and its auth gate) --------------------------------------
    const unauthedMint = await http("POST", "/api/v1/admin/agents", {
      body: { handle: HANDLE, tier: "standard" },
    });
    assert.equal(unauthedMint.status, 401, "admin routes reject a missing bearer");

    const mint = await http("POST", "/api/v1/admin/agents", {
      body: { handle: HANDLE, tier: "standard", note: "e2e" },
      token: ADMIN_TOKEN,
    });
    assert.equal(mint.status, 200);
    assert.match(mint.body.token, /^fgt_[0-9a-f]{32}$/, "plaintext token shown once");
    const agentToken = mint.body.token;

    const list = await http("GET", "/api/v1/admin/agents", { token: ADMIN_TOKEN });
    assert.equal(list.body.agents.length, 1);
    assert.equal(list.body.agents[0].handle, HANDLE);
    assert.ok(!JSON.stringify(list.body).includes("tokenHash"), "registry listing never leaks hashes");

    // -- claim ----------------------------------------------------------------
    const badClaim = await http("POST", "/api/v1/work/claim", {
      body: {},
      token: "fgt_" + "0".repeat(32),
    });
    assert.equal(badClaim.status, 401, "an unminted token cannot claim");
    assert.equal(mock.calls.length, 0, "no GitHub writes before a real claim");

    const claim = await http("POST", "/api/v1/work/claim", { body: {}, token: agentToken });
    assert.equal(claim.status, 200);
    assert.equal(claim.body.ok, true);
    assert.equal(claim.body.issue.number, 50, "the priority-high candidate is claimed first");
    assert.equal(claim.body.issue.stage, "research");
    assert.ok(claim.body.issue.labels.includes("status: claimed"));
    assert.equal(typeof claim.body.assignmentId, "string");
    assert.equal(claim.body.leaseTtlSeconds, LEASE_TTL_SECONDS);

    // Label writes hit the mock in the claim-loop order, on the right issue.
    assert.deepEqual(
      mock.calls.map((c) => ({ method: c.method, path: c.path })),
      [
        { method: "POST", path: "/repos/example/repo/issues/50/labels" },
        { method: "DELETE", path: "/repos/example/repo/issues/50/labels/status%3A%20available" },
        { method: "POST", path: "/repos/example/repo/issues/50/assignees" },
      ],
      "add claimed → remove available → assign, in order",
    );
    assert.deepEqual(mock.calls[0].body, { labels: ["status: claimed"] });
    assert.deepEqual(mock.calls[2].body, { assignees: [HANDLE] });

    const ghIssue = mock.getIssue(50);
    assert.ok(ghIssue.labels.includes("status: claimed"));
    assert.ok(!ghIssue.labels.includes("status: available"));
    assert.deepEqual(ghIssue.assignees, [HANDLE]);

    // Redis holds the lease keyed by assignment id.
    assert.equal(await redisCli(redis, "GET", "lease:issue:50"), claim.body.assignmentId);

    // Queue reflects the optimistic mirror update immediately.
    queue = await http("GET", "/api/v1/queue");
    assert.deepEqual(queue.body.issues.map((i) => i.number), [30, 31]);

    // -- heartbeats: unauthed = no orchestration; authed = renew + commands --
    const telemetryBody = { handle: HANDLE, harness: "claude", model: "e2e-model" };

    await redisCli(redis, "EXPIRE", "lease:issue:50", "40");
    const unauthedHb = await http("POST", "/api/v1/telemetry", { body: telemetryBody });
    assert.equal(unauthedHb.status, 200);
    assert.equal(unauthedHb.body.ok, true);
    assert.ok(!("commands" in unauthedHb.body), "no token → exactly the pre-orchestration shape");
    assert.ok(Number(await redisCli(redis, "TTL", "lease:issue:50")) <= 40, "no token → no lease renewal");

    const authedHb = await http("POST", "/api/v1/telemetry", { body: telemetryBody, token: agentToken });
    assert.equal(authedHb.status, 200);
    assert.deepEqual(authedHb.body.commands, [], "authed with nothing pending → empty commands");
    const renewedTtl = Number(await redisCli(redis, "TTL", "lease:issue:50"));
    assert.ok(renewedTtl > 100, `authed heartbeat renews the lease (ttl ${renewedTtl})`);

    // -- admin stop command, delivered on the next heartbeat, exactly once ---
    const cmd = await http("POST", "/api/v1/admin/commands", {
      body: { handle: HANDLE, kind: "stop", reason: "e2e drain" },
      token: ADMIN_TOKEN,
    });
    assert.equal(cmd.status, 200);
    assert.equal(cmd.body.command.kind, "stop");

    const hbWithCmd = await http("POST", "/api/v1/telemetry", { body: telemetryBody, token: agentToken });
    assert.equal(hbWithCmd.body.commands.length, 1);
    const delivered = hbWithCmd.body.commands[0];
    assert.equal(delivered.kind, "stop");
    assert.equal(delivered.reason, "e2e drain");
    assert.equal(typeof delivered.id, "string");
    assert.equal(typeof delivered.issuedAt, "string");

    const hbAfterCmd = await http("POST", "/api/v1/telemetry", { body: telemetryBody, token: agentToken });
    assert.deepEqual(hbAfterCmd.body.commands, [], "a command is delivered exactly once");

    // -- release done ---------------------------------------------------------
    const writesBeforeRelease = mock.calls.length;
    const release = await http("POST", "/api/v1/work/release", {
      body: { issue: 50, outcome: "done", prNumber: 77 },
      token: agentToken,
    });
    assert.equal(release.status, 200);
    assert.equal(release.body.ok, true);

    assert.equal(mock.calls.length, writesBeforeRelease, "done never touches labels — the PR pipeline owns them");
    assert.equal(await redisCli(redis, "EXISTS", "lease:issue:50"), "0", "lease gone");

    const active = await http("GET", "/api/v1/admin/assignments?active=1", { token: ADMIN_TOKEN });
    assert.deepEqual(active.body.assignments, [], "no active assignments after release");

    const all = await http("GET", "/api/v1/admin/assignments", { token: ADMIN_TOKEN });
    assert.equal(all.body.assignments.length, 1);
    const assignment = all.body.assignments[0];
    assert.equal(assignment.issueNumber, 50);
    assert.equal(assignment.handle, HANDLE);
    assert.equal(assignment.active, false);
    assert.equal(assignment.outcome, "done");
    assert.equal(assignment.prNumber, 77);

    const releaseAgain = await http("POST", "/api/v1/work/release", {
      body: { issue: 50, outcome: "done" },
      token: agentToken,
    });
    assert.equal(releaseAgain.status, 404, "double release → 404");

    const renewAfter = await http("POST", "/api/v1/work/renew", {
      body: { issue: 50 },
      token: agentToken,
    });
    assert.equal(renewAfter.status, 404, "renew after release → 404");

    // -- two CONCURRENT claims race and get DIFFERENT issues ------------------
    // The remaining queue is [30, 31]; the Redis lease (SET NX) is the
    // arbiter, so two racing agents must never be handed the same issue.
    const mint2 = await http("POST", "/api/v1/admin/agents", {
      body: { handle: HANDLE_2, tier: "standard", note: "e2e rival" },
      token: ADMIN_TOKEN,
    });
    assert.equal(mint2.status, 200);
    const rivalToken = mint2.body.token;

    const writesBeforeRace = mock.calls.length;
    const [raceA, raceB] = await Promise.all([
      http("POST", "/api/v1/work/claim", { body: {}, token: agentToken }),
      http("POST", "/api/v1/work/claim", { body: {}, token: rivalToken }),
    ]);
    assert.equal(raceA.status, 200);
    assert.equal(raceB.status, 200);
    assert.ok(raceA.body.issue && raceB.body.issue, "both racers get work while the queue has two issues");
    assert.notEqual(
      raceA.body.issue.number,
      raceB.body.issue.number,
      "concurrent claims never hand out the same issue",
    );
    assert.deepEqual(
      [raceA.body.issue.number, raceB.body.issue.number].sort((a, b) => a - b),
      [30, 31],
      "the racers split exactly the two remaining candidates",
    );

    // Per-issue label traffic still lands in claim-loop order (the two
    // requests interleave globally, so assert per issue, not globally).
    for (const n of [30, 31]) {
      assert.deepEqual(
        mock.calls
          .slice(writesBeforeRace)
          .filter((c) => c.path.includes(`/issues/${n}/`))
          .map((c) => ({ method: c.method, path: c.path })),
        [
          { method: "POST", path: `/repos/example/repo/issues/${n}/labels` },
          { method: "DELETE", path: `/repos/example/repo/issues/${n}/labels/status%3A%20available` },
          { method: "POST", path: `/repos/example/repo/issues/${n}/assignees` },
        ],
        `claim-loop write order for #${n}`,
      );
      assert.equal(await redisCli(redis, "EXISTS", `lease:issue:${n}`), "1", `lease held for #${n}`);
      assert.ok(mock.getIssue(n).labels.includes("status: claimed"));
    }

    queue = await http("GET", "/api/v1/queue");
    assert.deepEqual(queue.body.issues, [], "queue drained after the race");
    const emptyClaim = await http("POST", "/api/v1/work/claim", { body: {}, token: agentToken });
    assert.equal(emptyClaim.status, 200);
    assert.equal(emptyClaim.body.issue, null, "empty queue → {ok:true, issue:null}");

    // -- webhook: valid HMAC upserts the mirror; the next claim sees it ------
    const issue70 = makeIssue({
      number: 70,
      title: "Webhook-born research question",
      labels: ["status: available", "stage: research"],
      createdAt: "2026-04-01T00:00:00Z",
    });
    mock.addIssue(issue70); // it exists on "GitHub" — the webhook announces it

    const badSig = await postWebhook(
      { action: "opened", issue: issue70, sender: { login: "octocat" } },
      { signature: `sha256=${"0".repeat(64)}` },
    );
    assert.equal(badSig.status, 401, "a forged signature is rejected");
    queue = await http("GET", "/api/v1/queue");
    assert.deepEqual(queue.body.issues, [], "a rejected delivery never touches the mirror");

    const hook = await postWebhook({ action: "opened", issue: issue70, sender: { login: "octocat" } });
    assert.equal(hook.status, 202, "a valid HMAC delivery is accepted");

    queue = await http("GET", "/api/v1/queue");
    assert.deepEqual(
      queue.body.issues.map((i) => i.number),
      [70],
      "the webhook upsert is claimable without waiting for a sync pass",
    );

    const claim70 = await http("POST", "/api/v1/work/claim", { body: {}, token: agentToken });
    assert.equal(claim70.status, 200);
    assert.equal(claim70.body.issue.number, 70, "a subsequent claim sees the webhook-born issue");
    assert.ok(mock.getIssue(70).labels.includes("status: claimed"));
    assert.deepEqual(mock.getIssue(70).assignees, [HANDLE]);

    // -- final consistency: queue + board reflect everything above -----------
    queue = await http("GET", "/api/v1/queue");
    assert.deepEqual(queue.body.issues, [], "nothing dispatchable is left");
    const finalBoard = await http("GET", "/api/v1/board");
    // available: #20 (do-not-automate) + #40 (discover) — parked, not claimable.
    // claimed: #30 #31 #70 (held) + #50 (released done — labels untouched).
    assert.deepEqual(finalBoard.body.statuses, { available: 2, claimed: 4 });
    assert.equal(finalBoard.body.openIssues, 6);
    assert.equal(finalBoard.body.openPrs, 1);
  } finally {
    child.kill("SIGTERM");
    await Promise.race([once(child, "exit"), sleep(5_000)]);
    if (child.exitCode === null) child.kill("SIGKILL");
    await mock.close();
    await Promise.all([redis.stop(), mongo.stop()]);
  }
});
