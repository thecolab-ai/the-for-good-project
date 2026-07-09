/**
 * Control-plane tests (Implementer E): enqueue→pop exactly-once semantics,
 * fleet-wide drain delivered once per handle, Mongo `commands` bookkeeping,
 * the telemetry-heartbeat command piggyback, and the admin routes
 * (constant-time token gate, mint/revoke/list, commands, assignments,
 * lease release, sync trigger).
 *
 * Real Redis + Mongo via fgtest-* containers (skipped when docker is
 * unavailable); GitHub is never touched (no token → orch.gh undefined).
 */
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import Fastify from "fastify";
import { dockerAvailable, startMongo, startRedis } from "./helpers/containers.mjs";

// Must be set BEFORE ../dist/config.js is evaluated (all dist imports below
// are dynamic for exactly this reason): the admin routes compare presented
// bearers against config.adminToken.
const ADMIN_TOKEN = "fg-test-admin-token";
process.env.ADMIN_TOKEN = ADMIN_TOKEN;
delete process.env.GITHUB_TOKEN; // orch.gh must be undefined (sync → 503)
delete process.env.STATE_FILE;
delete process.env.HISTORY_DB_FILE;

const { config } = await import("../dist/config.js");
const { connectOrchestrator, FLEET_COMMAND_KEY, FLEET_COMMAND_SEEN_KEY, commandKey } =
  await import("../dist/orchestrator/stores.js");
const { enqueueCommand, popCommands, FLEET_TARGET } = await import("../dist/orchestrator/control.js");
const { mintAgentToken } = await import("../dist/orchestrator/auth.js");
const { registerAdminRoutes } = await import("../dist/routes/admin.js");
const { registerHttpRoutes } = await import("../dist/http.js");
const { FleetStore } = await import("../dist/state.js");

const docker = await dockerAvailable();

/** @type {import("../dist/orchestrator/stores.js").Orchestrator | undefined} */
let orch;
let redis;
let mongo;

before(async () => {
  if (!docker) return;
  [redis, mongo] = await Promise.all([startRedis(), startMongo()]);
  orch = await connectOrchestrator({
    ...config,
    redisUrl: redis.url,
    mongoUrl: mongo.url,
    mongoDb: "forgood_control_test",
    githubToken: undefined,
  });
});

after(async () => {
  await orch?.close().catch(() => undefined);
  await redis?.stop();
  await mongo?.stop();
});

/** Run the test body only when docker (and therefore orch) is available. */
const maybe = (name, fn) =>
  test(name, async (t) => {
    if (!docker) {
      t.skip("docker unavailable");
      return;
    }
    await fn(t);
  });

/** Reset the fleet-wide command between tests so pops don't bleed across. */
async function clearFleetCommand() {
  await orch.redis.del(FLEET_COMMAND_KEY, FLEET_COMMAND_SEEN_KEY);
}

// ---------------------------------------------------------------------------
// enqueueCommand / popCommands

maybe("per-handle commands supersede (latest wins), exactly-once per CONSUMER", async (t) => {
  t.after(() => orch.redis.del(commandKey("alice"), `${commandKey("alice")}:seen`));
  const first = await enqueueCommand(orch, "alice", "pause", "maintenance window", "admin");
  const second = await enqueueCommand(orch, "alice", "resume", undefined, "admin");
  assert.ok(first.id && first.issuedAt, "commands carry id + issuedAt");
  assert.notEqual(first.id, second.id);

  const got = await popCommands(orch, "alice");
  assert.deepEqual(
    got.map((c) => c.kind),
    ["resume"],
    "supersede semantics: the LATEST command wins (pause→resume delivers resume)",
  );
  assert.equal(got[0].reason, undefined);

  assert.deepEqual(await popCommands(orch, "alice"), [], "second pop is empty (exactly-once per consumer)");

  // A handle can run several concurrent consumers (one minted token shared
  // across machines/harnesses) — each hears the command exactly once, so a
  // drain reaches every runner, not just whichever heartbeats first.
  const secondRunner = await popCommands(orch, "alice", "runner-2");
  assert.deepEqual(secondRunner.map((c) => c.kind), ["resume"], "a second consumer still hears it");
  assert.deepEqual(await popCommands(orch, "alice", "runner-2"), [], "…exactly once");

  assert.deepEqual(await popCommands(orch, "bob"), [], "other handles see nothing");
});

maybe("fleet-wide drain is delivered exactly once per handle+consumer", async (t) => {
  t.after(clearFleetCommand);

  const stop = await enqueueCommand(orch, FLEET_TARGET, "stop", "fleet drain", "admin");
  const ttl = await orch.redis.ttl(FLEET_COMMAND_KEY);
  assert.ok(ttl > 0 && ttl <= 3600, `a one-shot drain expires (ttl ${ttl}) — it can't kill a runner weeks later`);

  const h1 = await popCommands(orch, "fleet-h1");
  assert.equal(h1.length, 1);
  assert.equal(h1[0].kind, "stop");
  assert.equal(h1[0].id, stop.id);
  assert.deepEqual(await popCommands(orch, "fleet-h1"), [], "same consumer never gets it twice");

  // A SECOND consumer under the same handle (two runners, one token) must
  // also hear the drain — first-heartbeat-wins would leave the other running.
  const h1b = await popCommands(orch, "fleet-h1", "second-runner");
  assert.equal(h1b.length, 1, "a second runner under the same handle hears the drain too");
  assert.equal(h1b[0].id, stop.id);

  const h2 = await popCommands(orch, "fleet-h2");
  assert.equal(h2.length, 1, "every other handle still gets it once");
  assert.equal(h2[0].id, stop.id);

  // A new fleet command replaces the old one and resets the seen set.
  const resume = await enqueueCommand(orch, FLEET_TARGET, "resume", undefined, "admin");
  assert.equal(await orch.redis.ttl(FLEET_COMMAND_KEY), -1, "pause/resume represent STATE and persist");
  const h1Again = await popCommands(orch, "fleet-h1");
  assert.equal(h1Again.length, 1);
  assert.equal(h1Again[0].id, resume.id);
  assert.equal(h1Again[0].kind, "resume");
});

maybe("a fleet command never reaches a handle minted after it was issued", async (t) => {
  t.after(clearFleetCommand);

  await enqueueCommand(orch, FLEET_TARGET, "stop", "old drain", "admin");
  // Mint the newcomer strictly AFTER the drain was issued.
  await new Promise((resolve) => setTimeout(resolve, 20));
  await mintAgentToken(orch, { handle: "post-drain-newcomer", tier: "standard" });

  assert.deepEqual(
    await popCommands(orch, "post-drain-newcomer"),
    [],
    "a contributor enrolled after the drain must not be one-shot-killed by it",
  );
  // Handles that predate the command (unregistered = legacy/test) still drain.
  const legacy = await popCommands(orch, "pre-drain-handle");
  assert.equal(legacy.length, 1);
  assert.equal(legacy[0].kind, "stop");
});

maybe("per-handle and fleet-wide commands combine in one pop", async (t) => {
  t.after(clearFleetCommand);

  await enqueueCommand(orch, "combo", "pause", undefined, "admin");
  const fleet = await enqueueCommand(orch, FLEET_TARGET, "stop", undefined, "admin");

  const got = await popCommands(orch, "combo");
  assert.deepEqual(
    got.map((c) => c.kind).sort(),
    ["pause", "stop"],
  );
  assert.ok(got.some((c) => c.id === fleet.id));
  assert.deepEqual(await popCommands(orch, "combo"), []);
});

maybe("mongo commands collection records issue + delivery", async () => {
  const cmd = await enqueueCommand(orch, "carol", "abort", "rework", "admin");

  const beforeDoc = await orch.db.collection("commands").findOne({ _id: new ObjectId(cmd.id) });
  assert.ok(beforeDoc, "command doc inserted on enqueue");
  assert.equal(beforeDoc.target, "carol");
  assert.equal(beforeDoc.kind, "abort");
  assert.equal(beforeDoc.reason, "rework");
  assert.equal(beforeDoc.issuedBy, "admin");
  assert.deepEqual(beforeDoc.deliveredTo, []);
  assert.equal(beforeDoc.deliveredAt, undefined);

  await popCommands(orch, "carol");
  const afterDoc = await orch.db.collection("commands").findOne({ _id: new ObjectId(cmd.id) });
  assert.deepEqual(afterDoc.deliveredTo, ["carol"]);
  assert.ok(afterDoc.deliveredAt, "deliveredAt stamped on delivery");
});

maybe("malformed stored commands are dropped, a valid re-issue survives", async (t) => {
  t.after(() => orch.redis.del(commandKey("dave"), `${commandKey("dave")}:seen`));
  await orch.redis.set(commandKey("dave"), "not json at all");
  assert.deepEqual(await popCommands(orch, "dave"), [], "garbage is dropped, not thrown");

  await orch.redis.set(commandKey("dave"), JSON.stringify({ nope: true }));
  assert.deepEqual(await popCommands(orch, "dave", "c2"), [], "schema-invalid JSON is dropped");

  await enqueueCommand(orch, "dave", "pause", undefined, "admin");
  const got = await popCommands(orch, "dave", "c3");
  assert.equal(got.length, 1);
  assert.equal(got[0].kind, "pause");
  assert.deepEqual(await popCommands(orch, "dave", "c3"), []);
});

// ---------------------------------------------------------------------------
// Telemetry heartbeat piggyback (registerHttpRoutes + orch)

/** Boot a bare fastify app with the given registrars; caller closes it. */
async function bootApp(register) {
  const app = Fastify();
  const store = new FleetStore();
  register(app, store);
  await app.ready();
  return { app, store };
}

const TELEMETRY_BODY = { handle: "self-reported", harness: "claude", model: "test-model" };

maybe("unauthenticated telemetry heartbeat gets no commands key", async (t) => {
  const { app, store } = await bootApp((a, s) => registerHttpRoutes(a, s, orch));
  t.after(async () => {
    await app.close();
    store.close();
  });

  const res = await app.inject({ method: "POST", url: "/api/v1/telemetry", payload: TELEMETRY_BODY });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.ok, true);
  assert.ok(body.agentId);
  assert.ok(!("commands" in body), "pre-orchestration response shape, byte-identical");
});

maybe("invalid bearer token behaves exactly like no token", async (t) => {
  const { app, store } = await bootApp((a, s) => registerHttpRoutes(a, s, orch));
  t.after(async () => {
    await app.close();
    store.close();
  });

  const res = await app.inject({
    method: "POST",
    url: "/api/v1/telemetry",
    payload: TELEMETRY_BODY,
    headers: { authorization: "Bearer fgt_definitely_not_real" },
  });
  assert.equal(res.statusCode, 200, "telemetry never 401s — fail-open");
  assert.ok(!("commands" in res.json()));
});

maybe("authed telemetry heartbeat drains pending commands exactly once", async (t) => {
  const { app, store } = await bootApp((a, s) => registerHttpRoutes(a, s, orch));
  t.after(async () => {
    await app.close();
    store.close();
  });

  const { token } = await mintAgentToken(orch, { handle: "hb-agent", tier: "standard" });
  const authed = { authorization: `Bearer ${token}` };

  // Nothing pending → commands present but empty (deterministic for runners).
  let res = await app.inject({
    method: "POST",
    url: "/api/v1/telemetry",
    payload: TELEMETRY_BODY,
    headers: authed,
  });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json().commands, []);

  // Enqueue for the REGISTRY handle (not the self-reported hello handle).
  await enqueueCommand(orch, "hb-agent", "pause", "hold", "admin");
  res = await app.inject({
    method: "POST",
    url: "/api/v1/telemetry",
    payload: TELEMETRY_BODY,
    headers: authed,
  });
  const commands = res.json().commands;
  assert.equal(commands.length, 1);
  assert.equal(commands[0].kind, "pause");
  assert.equal(commands[0].reason, "hold");

  // Exactly-once: the next heartbeat is empty again.
  res = await app.inject({
    method: "POST",
    url: "/api/v1/telemetry",
    payload: TELEMETRY_BODY,
    headers: authed,
  });
  assert.deepEqual(res.json().commands, []);
});

// ---------------------------------------------------------------------------
// Admin routes

maybe("admin routes 401 without / with a wrong bearer token", async (t) => {
  const { app, store } = await bootApp((a, s) => registerAdminRoutes(a, s, orch));
  t.after(async () => {
    await app.close();
    store.close();
  });

  for (const headers of [
    {},
    { authorization: "Bearer wrong-token" },
    { authorization: `Bearer ${ADMIN_TOKEN}x` },
    { authorization: ADMIN_TOKEN }, // not Bearer-shaped
  ]) {
    const res = await app.inject({ method: "GET", url: "/api/v1/admin/agents", headers });
    assert.equal(res.statusCode, 401, `expected 401 for ${JSON.stringify(headers)}`);
    assert.equal(res.json().ok, false);
  }
});

maybe("admin mint → list (no hashes) → revoke → revoke again 404", async (t) => {
  const { app, store } = await bootApp((a, s) => registerAdminRoutes(a, s, orch));
  t.after(async () => {
    await app.close();
    store.close();
  });
  const authed = { authorization: `Bearer ${ADMIN_TOKEN}` };

  let res = await app.inject({
    method: "POST",
    url: "/api/v1/admin/agents",
    payload: { handle: "minted-agent", tier: "standard", note: "test mint" },
    headers: authed,
  });
  assert.equal(res.statusCode, 200);
  const { token } = res.json();
  assert.equal(typeof token, "string");
  assert.ok(token.length > 0, "plaintext token returned once");

  res = await app.inject({ method: "GET", url: "/api/v1/admin/agents", headers: authed });
  assert.equal(res.statusCode, 200);
  const agents = res.json().agents;
  const minted = agents.find((a) => a.handle === "minted-agent");
  assert.ok(minted, "minted handle listed");
  assert.equal(minted.tier, "standard");
  for (const agent of agents) {
    assert.ok(!("tokenHash" in agent), "registry listing never exposes hashes");
    assert.ok(!("token" in agent));
  }

  res = await app.inject({
    method: "POST",
    url: "/api/v1/admin/agents/revoke",
    payload: { handle: "minted-agent" },
    headers: authed,
  });
  assert.equal(res.statusCode, 200);

  res = await app.inject({
    method: "POST",
    url: "/api/v1/admin/agents/revoke",
    payload: { handle: "minted-agent" },
    headers: authed,
  });
  assert.equal(res.statusCode, 404, "already-revoked handle → 404");

  res = await app.inject({
    method: "POST",
    url: "/api/v1/admin/agents",
    payload: { handle: "minted-agent", tier: "bogus-tier" },
    headers: authed,
  });
  assert.equal(res.statusCode, 400, "invalid tier rejected");
});

maybe("admin commands route enqueues per-handle and fleet-wide", async (t) => {
  t.after(clearFleetCommand);
  const { app, store } = await bootApp((a, s) => registerAdminRoutes(a, s, orch));
  t.after(async () => {
    await app.close();
    store.close();
  });
  const authed = { authorization: `Bearer ${ADMIN_TOKEN}` };

  // Per-handle.
  let res = await app.inject({
    method: "POST",
    url: "/api/v1/admin/commands",
    payload: { handle: "cmd-target", kind: "stop", reason: "wrap up" },
    headers: authed,
  });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().target, "cmd-target");
  assert.equal(res.json().command.kind, "stop");
  const got = await popCommands(orch, "cmd-target");
  assert.equal(got.length, 1);
  assert.equal(got[0].kind, "stop");

  // Fleet-wide.
  res = await app.inject({
    method: "POST",
    url: "/api/v1/admin/commands",
    payload: { all: true, kind: "pause" },
    headers: authed,
  });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().target, FLEET_TARGET);
  const fleetGot = await popCommands(orch, "cmd-other");
  assert.equal(fleetGot.length, 1);
  assert.equal(fleetGot[0].kind, "pause");

  // The public feed hears about admin commands.
  const events = store.snapshot().events.filter((e) => e.kind === "command");
  assert.equal(events.length, 2);

  // Validation: both / neither / bad kind → 400.
  for (const payload of [
    { handle: "x", all: true, kind: "pause" },
    { kind: "pause" },
    { handle: "x", kind: "self-destruct" },
  ]) {
    res = await app.inject({ method: "POST", url: "/api/v1/admin/commands", payload, headers: authed });
    assert.equal(res.statusCode, 400, `expected 400 for ${JSON.stringify(payload)}`);
  }
});

maybe("admin lease release → 404 when no active assignment", async (t) => {
  const { app, store } = await bootApp((a, s) => registerAdminRoutes(a, s, orch));
  t.after(async () => {
    await app.close();
    store.close();
  });

  const res = await app.inject({
    method: "POST",
    url: "/api/v1/admin/lease/release",
    payload: { issue: 999_999, revertLabels: false },
    headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  assert.equal(res.statusCode, 404);
});

maybe("admin sync → 503 when no github token configured", async (t) => {
  const { app, store } = await bootApp((a, s) => registerAdminRoutes(a, s, orch));
  t.after(async () => {
    await app.close();
    store.close();
  });

  const res = await app.inject({
    method: "POST",
    url: "/api/v1/admin/sync",
    payload: { full: true },
    headers: { authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  assert.equal(res.statusCode, 503);
  assert.match(res.json().error, /github token/i);
});
