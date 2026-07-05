/**
 * Auth registry tests (Implementer C).
 *
 * Coverage (per spec): mint→verify roundtrip, revoke rejects, bad token
 * rejects, hash-not-plaintext stored — plus the fleet-admin.mjs CLI (mint /
 * list / revoke / assignments / command) against the same real stores.
 *
 * Uses real Redis + Mongo via fgtest-* containers; skips when docker is
 * unavailable. Never talks to api.github.com (no gh client is created —
 * githubToken stays unset).
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { dockerAvailable, startRedis, startMongo } from "./helpers/containers.mjs";
import {
  AGENT_TIERS,
  bearerToken,
  mintAgentToken,
  revokeAgentToken,
  listRegisteredAgents,
  subscribeAuthPurge,
  verifyAgentToken,
  _clearVerifyCache,
} from "../dist/orchestrator/auth.js";
import { popCommands } from "../dist/orchestrator/control.js";
import { connectOrchestrator, commandKey, commandSeenKey, FLEET_COMMAND_KEY, FLEET_COMMAND_SEEN_KEY } from "../dist/orchestrator/stores.js";
import { commandSchema } from "../dist/protocol.js";

const execFileP = promisify(execFile);
const CLI = fileURLToPath(new URL("../scripts/fleet-admin.mjs", import.meta.url));
const TOKEN_RE = /^fgt_[0-9a-f]{32}$/;
const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");

const docker = await dockerAvailable();
const skip = docker ? false : "docker unavailable";

/** @type {{url: string, stop(): Promise<void>}} */ let redis;
/** @type {{url: string, stop(): Promise<void>}} */ let mongo;
/** @type {import("../dist/orchestrator/stores.js").Orchestrator} */ let orch;
const MONGO_DB = "fgtest_auth";

before(async () => {
  if (!docker) return;
  [redis, mongo] = await Promise.all([startRedis(), startMongo()]);
  orch = await connectOrchestrator({
    redisUrl: redis.url,
    mongoUrl: mongo.url,
    mongoDb: MONGO_DB,
    githubToken: undefined,
  });
  assert.ok(orch, "connectOrchestrator returned undefined despite URLs set");
});

after(async () => {
  await orch?.close();
  await Promise.all([redis?.stop(), mongo?.stop()]);
});

/** Run fleet-admin.mjs against the test stores; returns parsed stdout JSON. */
async function cli(...args) {
  const { stdout } = await execFileP(process.execPath, [CLI, ...args], {
    env: { ...process.env, MONGO_URL: mongo.url, MONGO_DB, REDIS_URL: redis.url },
    timeout: 30_000,
  });
  return JSON.parse(stdout);
}

// ---------------------------------------------------------------------------
// bearerToken — pure function, no stores needed.
// ---------------------------------------------------------------------------

test("bearerToken extracts the Authorization bearer value", () => {
  const req = (authorization) => ({ headers: authorization === undefined ? {} : { authorization } });
  assert.equal(bearerToken(req("Bearer fgt_abc")), "fgt_abc");
  assert.equal(bearerToken(req("bearer fgt_abc")), "fgt_abc"); // scheme is case-insensitive
  assert.equal(bearerToken(req("  Bearer   spaced-token ")), "spaced-token");
  assert.equal(bearerToken(req(undefined)), undefined);
  assert.equal(bearerToken(req("")), undefined);
  assert.equal(bearerToken(req("Basic dXNlcjpwdw==")), undefined);
  assert.equal(bearerToken(req("Bearer")), undefined); // no token at all
});

// ---------------------------------------------------------------------------
// Registry: mint / verify / revoke / list.
// ---------------------------------------------------------------------------

test("mint→verify roundtrip returns the identity", { skip }, async () => {
  const { token } = await mintAgentToken(orch, { handle: "alice", tier: "standard", note: "test agent" });
  assert.match(token, TOKEN_RE, "token must be fgt_<32 hex>");

  const identity = await verifyAgentToken(orch, token);
  assert.deepEqual(identity, { handle: "alice", tier: "standard" });

  // Second verify is served from the TTL cache — must be identical.
  assert.deepEqual(await verifyAgentToken(orch, token), { handle: "alice", tier: "standard" });
});

test("stored doc holds sha256 hash, never the plaintext token", { skip }, async () => {
  const { token } = await mintAgentToken(orch, { handle: "hasheddie", tier: "trusted" });
  const doc = await orch.db.collection("agents_registry").findOne({ handle: "hasheddie" });
  assert.ok(doc, "registry doc missing");
  assert.equal(doc.tokenHash, sha256(token));
  assert.ok(!JSON.stringify(doc).includes(token), "plaintext token leaked into the registry doc");
});

test("bad tokens reject", { skip }, async () => {
  assert.equal(await verifyAgentToken(orch, undefined), null);
  assert.equal(await verifyAgentToken(orch, ""), null);
  assert.equal(await verifyAgentToken(orch, "not-a-token"), null);
  assert.equal(await verifyAgentToken(orch, "fgt_short"), null); // wrong shape
  assert.equal(await verifyAgentToken(orch, "ghp_" + "a".repeat(32)), null); // wrong prefix
  // Well-formed but never minted:
  assert.equal(await verifyAgentToken(orch, "fgt_" + "0".repeat(32)), null);
});

test("revoke rejects the token immediately (cache purged)", { skip }, async () => {
  const { token } = await mintAgentToken(orch, { handle: "bob", tier: "standard" });
  assert.ok(await verifyAgentToken(orch, token), "sanity: verifies before revoke");

  assert.equal(await revokeAgentToken(orch, "bob"), true);
  assert.equal(await verifyAgentToken(orch, token), null, "revoked token must not verify");

  // Second revoke and unknown handle both report no-op.
  assert.equal(await revokeAgentToken(orch, "bob"), false);
  assert.equal(await revokeAgentToken(orch, "nobody-here"), false);
});

test("re-mint after revoke: new token verifies, old stays dead", { skip }, async () => {
  const first = await mintAgentToken(orch, { handle: "carol", tier: "framer" });
  await revokeAgentToken(orch, "carol");

  const second = await mintAgentToken(orch, { handle: "carol", tier: "framer" });
  assert.notEqual(second.token, first.token);
  assert.deepEqual(await verifyAgentToken(orch, second.token), { handle: "carol", tier: "framer" });
  assert.equal(await verifyAgentToken(orch, first.token), null, "pre-revoke token must stay dead");

  // Exactly one doc per handle (unique {handle:1} index → re-mint replaces).
  const count = await orch.db.collection("agents_registry").countDocuments({ handle: "carol" });
  assert.equal(count, 1);
});

test("re-mint without revoke replaces the old token", { skip }, async () => {
  const first = await mintAgentToken(orch, { handle: "dave", tier: "standard" });
  assert.ok(await verifyAgentToken(orch, first.token), "sanity: first token verifies");
  const second = await mintAgentToken(orch, { handle: "dave", tier: "standard" });
  assert.equal(await verifyAgentToken(orch, first.token), null, "replaced token must stop verifying");
  assert.ok(await verifyAgentToken(orch, second.token));
});

test("listRegisteredAgents exposes no hashes and ISO dates", { skip }, async () => {
  await mintAgentToken(orch, { handle: "eve", tier: "trusted", note: "listed" });
  await mintAgentToken(orch, { handle: "mallory", tier: "standard" });
  await revokeAgentToken(orch, "mallory");

  const agents = await listRegisteredAgents(orch);
  assert.ok(agents.length >= 2);
  for (const agent of agents) {
    assert.ok(!("tokenHash" in agent), "tokenHash must never be listed");
    assert.ok(!("_id" in agent), "_id must not be listed");
    assert.ok(AGENT_TIERS.includes(agent.tier));
    assert.ok(!Number.isNaN(Date.parse(agent.createdAt)), "createdAt must be an ISO date string");
  }
  const eve = agents.find((a) => a.handle === "eve");
  assert.equal(eve?.note, "listed");
  assert.equal(eve?.revokedAt, undefined);
  const mallory = agents.find((a) => a.handle === "mallory");
  assert.ok(mallory?.revokedAt && !Number.isNaN(Date.parse(mallory.revokedAt)));
});

test("mint validates tier and handle", { skip }, async () => {
  await assert.rejects(() => mintAgentToken(orch, { handle: "frank", tier: "root" }), /invalid tier/);
  await assert.rejects(() => mintAgentToken(orch, { handle: "   ", tier: "standard" }), /handle required/);
});

// ---------------------------------------------------------------------------
// fleet-admin.mjs CLI — same stores, out-of-process.
// ---------------------------------------------------------------------------

test("CLI mint → server verify roundtrip; list hides hashes", { skip }, async () => {
  const minted = await cli("mint", "cli-agent", "--tier", "standard", "--note", "via cli");
  assert.equal(minted.ok, true);
  assert.match(minted.token, TOKEN_RE);
  assert.deepEqual(await verifyAgentToken(orch, minted.token), { handle: "cli-agent", tier: "standard" });

  const listed = await cli("list");
  assert.equal(listed.ok, true);
  const row = listed.agents.find((a) => a.handle === "cli-agent");
  assert.ok(row, "CLI list must include the minted handle");
  assert.equal(row.tokenHash, undefined, "CLI list must not print hashes");
  assert.ok(!JSON.stringify(listed).includes(minted.token), "CLI list must not leak plaintext tokens");
});

test("CLI revoke rejects the token (after local cache expiry)", { skip }, async () => {
  const minted = await cli("mint", "cli-revoked", "--tier", "trusted");
  assert.ok(await verifyAgentToken(orch, minted.token), "sanity: verifies before revoke");

  const revoked = await cli("revoke", "cli-revoked");
  assert.equal(revoked.ok, true);

  // The CLI revokes in ANOTHER process, so this process's positive TTL cache
  // (30s) can't be purged by it — that's the documented staleness bound.
  // Clear it to model the cache expiring, then the token must be dead.
  _clearVerifyCache();
  assert.equal(await verifyAgentToken(orch, minted.token), null);

  // Second revoke exits 2.
  await assert.rejects(() => cli("revoke", "cli-revoked"), (err) => err.code === 2);
});

test("CLI command <handle> sets a schema-valid sticky command on cmd:<handle>", { skip }, async () => {
  const res = await cli("command", "worker-1", "stop", "--reason", "maintenance window");
  assert.equal(res.ok, true);

  const raw = await orch.redis.get(commandKey("worker-1"));
  assert.ok(raw, "cmd:<handle> holds the command");
  const parsed = commandSchema.parse(JSON.parse(raw));
  assert.equal(parsed.kind, "stop");
  assert.equal(parsed.reason, "maintenance window");
  const ttl = await orch.redis.ttl(commandKey("worker-1"));
  assert.ok(ttl > 0 && ttl <= 3600, `CLI stop/abort expire like server-issued ones (ttl ${ttl})`);

  const doc = await orch.db.collection("commands").findOne({ target: "worker-1", kind: "stop" });
  assert.ok(doc, "command must be recorded in Mongo");
  assert.equal(doc.issuedBy, "fleet-admin");
  assert.deepEqual(doc.deliveredTo, [], "server-shaped audit doc: deliveredTo starts empty");
  assert.equal(doc._id.toHexString(), parsed.id, "the Mongo ObjectId doubles as the wire id");

  // Delivery bookkeeping works for CLI-issued commands too (recordDelivery
  // matches on the ObjectId _id — a UUID id field would silently never match).
  const got = await popCommands(orch, "worker-1");
  assert.equal(got.length, 1);
  assert.equal(got[0].id, parsed.id);
  const delivered = await orch.db.collection("commands").findOne({ target: "worker-1", kind: "stop" });
  assert.deepEqual(delivered.deliveredTo, ["worker-1"], "CLI-issued commands get deliveredTo stamped");
  assert.ok(delivered.deliveredAt, "…and deliveredAt");

  // `command --clear` explicitly ends a pending command.
  await cli("command", "worker-1", "--clear");
  assert.equal(await orch.redis.exists(commandKey("worker-1"), commandSeenKey("worker-1")), 0);
});

test("CLI command --all sets fleet:cmd and clears fleet:cmd:seen", { skip }, async () => {
  await orch.redis.sadd(FLEET_COMMAND_SEEN_KEY, "already-seen-handle");

  const res = await cli("command", "--all", "pause", "--by", "adam91holt");
  assert.equal(res.ok, true);
  assert.equal(res.target, "*");

  const raw = await orch.redis.get(FLEET_COMMAND_KEY);
  const parsed = commandSchema.parse(JSON.parse(raw));
  assert.equal(parsed.kind, "pause");
  assert.equal(await orch.redis.exists(FLEET_COMMAND_SEEN_KEY), 0, "seen-set must be cleared on a new fleet command");

  const doc = await orch.db.collection("commands").findOne({ target: "*", kind: "pause" });
  assert.equal(doc?.issuedBy, "adam91holt");
  await orch.redis.del(FLEET_COMMAND_KEY);
});

test("CLI revoke purges a RUNNING server's verify cache via auth:purge pub/sub", { skip }, async () => {
  // Simulate the running server: subscribe exactly like index.ts does.
  const stop = await subscribeAuthPurge(orch);
  try {
    const minted = await cli("mint", "cli-pubsub-revoked", "--tier", "standard");
    assert.deepEqual(await verifyAgentToken(orch, minted.token), {
      handle: "cli-pubsub-revoked",
      tier: "standard",
    }); // now cached in-process

    await cli("revoke", "cli-pubsub-revoked");

    // No _clearVerifyCache() here — the pub/sub purge alone must kill the
    // cached verification well before the 30s TTL (poll for delivery).
    const deadline = Date.now() + 5_000;
    let identity = await verifyAgentToken(orch, minted.token);
    while (identity && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      identity = await verifyAgentToken(orch, minted.token);
    }
    assert.equal(identity, null, "CLI revoke takes effect on the running server immediately");
  } finally {
    stop();
  }
});

test("CLI rejects bad input without touching stores", { skip }, async () => {
  await assert.rejects(() => cli("mint", "x", "--tier", "root"), (err) => err.code === 1);
  await assert.rejects(() => cli("command", "worker-1", "explode"), (err) => err.code === 1);
  await assert.rejects(() => cli("bogus-subcommand"), (err) => err.code === 1);
});
