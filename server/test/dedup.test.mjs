/**
 * Session-dedup tests (#398): a worker that sends a stable `session` id must
 * land on ONE agent record even when its first posts race (the session-start
 * duplicate that filled /live with the same worker on the same task). No
 * docker/orchestration needed — this is pure telemetry over Fastify inject.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

delete process.env.GITHUB_TOKEN;
delete process.env.STATE_FILE;
delete process.env.HISTORY_DB_FILE;
delete process.env.REDIS_URL;
delete process.env.MONGO_URL;

const Fastify = (await import("fastify")).default;
const { FleetStore, sessionAgentId } = await import("../dist/state.js");
const { registerHttpRoutes } = await import("../dist/http.js");

function bootApp() {
  const store = new FleetStore();
  const app = Fastify();
  registerHttpRoutes(app, store);
  return { app, store };
}

const HELLO = { handle: "race-worker", harness: "claude", model: "claude-opus-4-8", task: { kind: "work", ref: "#123", title: "Do a thing" } };

test("sessionAgentId is deterministic per (handle, session) and a valid UUID", () => {
  const a = sessionAgentId("alice", "sess-1");
  const b = sessionAgentId("alice", "sess-1");
  const c = sessionAgentId("alice", "sess-2");
  const d = sessionAgentId("bob", "sess-1");
  assert.equal(a, b, "same inputs → same id");
  assert.notEqual(a, c, "different session → different id");
  assert.notEqual(a, d, "different handle → different id");
  assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/, "RFC-4122 v5 shape");
});

test("concurrent session-less first posts race → duplicate records (the bug)", async () => {
  const { app } = bootApp();
  const posts = Array.from({ length: 5 }, () =>
    app.inject({ method: "POST", url: "/api/v1/telemetry", payload: HELLO }),
  );
  const ids = (await Promise.all(posts)).map((r) => r.json().agentId);
  assert.equal(new Set(ids).size, 5, "without a session, each raced post mints its own id");
  await app.close();
});

test("concurrent posts sharing a session collapse to ONE record (the fix)", async () => {
  const { app, store } = bootApp();
  const body = { ...HELLO, session: "claude-abc123" };
  const posts = Array.from({ length: 5 }, () =>
    app.inject({ method: "POST", url: "/api/v1/telemetry", payload: body }),
  );
  const ids = (await Promise.all(posts)).map((r) => r.json().agentId);
  assert.equal(new Set(ids).size, 1, "all raced posts resolve to the same agentId");
  assert.equal(ids[0], sessionAgentId(HELLO.handle, "claude-abc123"), "id is the deterministic session id");
  assert.equal(store.listAgents().length, 1, "exactly one record on /live for this worker");
  await app.close();
});

test("a saved agentId still wins over the session derivation (stable across restarts of the derivation)", async () => {
  const { app, store } = bootApp();
  const first = await app.inject({ method: "POST", url: "/api/v1/telemetry", payload: { ...HELLO, session: "s1" } });
  const id = first.json().agentId;
  // Subsequent post echoes the id it saved — must reuse the same record.
  const second = await app.inject({ method: "POST", url: "/api/v1/telemetry", payload: { ...HELLO, session: "s1", agentId: id } });
  assert.equal(second.json().agentId, id);
  assert.equal(store.listAgents().length, 1);
  await app.close();
});
