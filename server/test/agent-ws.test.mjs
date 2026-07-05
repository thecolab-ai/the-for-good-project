/**
 * Agent WebSocket command-push tests (spec/README: the second documented
 * command-delivery channel).
 *
 * Proves the three properties the HTTP-piggyback tests can't:
 *  - a bearer-authed socket receives pending commands as `{type:"command"}`
 *    frames after a heartbeat, exactly once per socket/consumer;
 *  - delivery keys on the VERIFIED token handle — an unauthenticated socket
 *    that hellos as the same handle can neither receive nor consume the
 *    pending command (no spoof-drain of a maintainer's stop);
 *  - an authed heartbeat renews the handle's active lease over WS too.
 *
 * Real Redis + Mongo via fgtest-* containers; no GitHub client involved.
 * Skipped when docker is unavailable.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { ObjectId } from "mongodb";
import Fastify from "fastify";
import websocket from "@fastify/websocket";
import WebSocket from "ws";
import { dockerAvailable, startRedis, startMongo } from "./helpers/containers.mjs";

const docker = await dockerAvailable();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(predicate, { timeoutMs = 5_000, label = "condition" } = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (predicate()) return;
    if (Date.now() > deadline) assert.fail(`timed out waiting for ${label}`);
    await sleep(50);
  }
}

test("agent WS: authed command push, spoof-proof, lease renewal", { skip: docker ? false : "docker unavailable" }, async (t) => {
  const { connectOrchestrator, leaseKey } = await import("../dist/orchestrator/stores.js");
  const { registerAgentSocket } = await import("../dist/agent-ws.js");
  const { mintAgentToken } = await import("../dist/orchestrator/auth.js");
  const { enqueueCommand } = await import("../dist/orchestrator/control.js");
  const { FleetStore } = await import("../dist/state.js");

  const [redis, mongo] = await Promise.all([startRedis(), startMongo()]);
  const orch = await connectOrchestrator({
    redisUrl: redis.url,
    mongoUrl: mongo.url,
    mongoDb: "fgtest_agentws",
    githubToken: undefined,
  });
  assert.ok(orch, "orchestrator connected");

  const store = new FleetStore();
  const app = Fastify({ logger: false });
  await app.register(websocket);
  registerAgentSocket(app, store, orch);
  await app.listen({ port: 0, host: "127.0.0.1" });
  const port = app.server.address().port;
  const wsUrl = `ws://127.0.0.1:${port}/ws/agent`;

  const sockets = [];
  t.after(async () => {
    for (const s of sockets) {
      try {
        s.terminate();
      } catch {
        /* already closed */
      }
    }
    await app.close();
    store.close();
    await orch.close();
    await Promise.all([redis.stop(), mongo.stop()]);
  });

  const HANDLE = "ws-bot";
  const { token } = await mintAgentToken(orch, { handle: HANDLE, tier: "standard" });

  /** Open a socket (optionally bearer-authed), send hello, await welcome. */
  async function openAgent({ authed }) {
    const socket = new WebSocket(wsUrl, authed ? { headers: { authorization: `Bearer ${token}` } } : {});
    sockets.push(socket);
    const frames = [];
    socket.on("message", (data) => {
      try {
        frames.push(JSON.parse(data.toString()));
      } catch {
        /* ignore */
      }
    });
    await once(socket, "open");
    socket.send(JSON.stringify({ type: "hello", handle: HANDLE, harness: "claude", model: "ws-test" }));
    await waitFor(() => frames.some((f) => f.type === "welcome"), { label: "welcome frame" });
    return { socket, frames };
  }

  const authed = await openAgent({ authed: true });
  const spoof = await openAgent({ authed: false });

  // Give the authed socket's fire-and-forget token verification time to land.
  await sleep(300);

  // Seed an active assignment + a claimed mirror doc so the WS heartbeat's
  // renewLeasesForHandle has something real to renew.
  const assignmentId = new ObjectId();
  const now = new Date().toISOString();
  await orch.db.collection("assignments").insertOne({
    _id: assignmentId,
    issueNumber: 777,
    handle: HANDLE,
    tier: "standard",
    claimedAt: now,
    renewedAt: now,
    active: true,
  });
  await orch.db.collection("issues").insertOne({
    _id: 777,
    number: 777,
    title: "ws lease issue",
    state: "open",
    labels: ["status: claimed", "stage: research"],
    assignees: [HANDLE],
    body: "",
    user: "octocat",
    htmlUrl: "https://github.com/example/repo/issues/777",
    createdAt: now,
    updatedAt: now,
  });
  await orch.redis.set(leaseKey(777), assignmentId.toHexString(), "EX", 20);

  // Heartbeat with nothing pending → no command frames.
  authed.socket.send(JSON.stringify({ type: "heartbeat" }));
  await sleep(400);
  assert.ok(!authed.frames.some((f) => f.type === "command"), "no command frame when nothing is pending");
  const renewedTtl = Number(await orch.redis.ttl(leaseKey(777)));
  assert.ok(renewedTtl > 100, `authed WS heartbeat renews the lease (ttl ${renewedTtl})`);

  // Enqueue a stop for the handle; the SPOOF socket (no token, same hello
  // handle) heartbeats first — it must neither receive nor consume it.
  await enqueueCommand(orch, HANDLE, "stop", "ws drain", "admin");
  spoof.socket.send(JSON.stringify({ type: "heartbeat" }));
  await sleep(500);
  assert.ok(
    !spoof.frames.some((f) => f.type === "command"),
    "an unauthenticated socket never receives commands, whatever its hello claims",
  );
  assert.ok(await orch.redis.get(`cmd:${HANDLE}`), "the pending command was NOT consumed by the spoofer");

  // The authed socket's next heartbeat delivers it…
  authed.socket.send(JSON.stringify({ type: "heartbeat" }));
  await waitFor(() => authed.frames.some((f) => f.type === "command"), { label: "command frame" });
  const commandFrames = authed.frames.filter((f) => f.type === "command");
  assert.equal(commandFrames.length, 1);
  assert.equal(commandFrames[0].command.kind, "stop");
  assert.equal(commandFrames[0].command.reason, "ws drain");

  // …exactly once: a further heartbeat re-delivers nothing.
  authed.socket.send(JSON.stringify({ type: "heartbeat" }));
  await sleep(400);
  assert.equal(
    authed.frames.filter((f) => f.type === "command").length,
    1,
    "a command is delivered exactly once per socket",
  );
});
