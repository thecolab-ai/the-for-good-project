#!/usr/bin/env node
/**
 * fleet-admin.mjs — standalone maintainer CLI for the fleet orchestrator.
 *
 * Talks DIRECTLY to MongoDB / Redis (no fleet server required, no HTTP),
 * so a maintainer can mint tokens or drain the fleet even when the server
 * is down. Uses the same collections/keys as the server (see
 * src/orchestrator/{auth,control,stores}.ts and the pull-claim spec).
 *
 * Environment:
 *   MONGO_URL   (required)                e.g. mongodb://127.0.0.1:27017
 *   MONGO_DB    (default "forgood")
 *   REDIS_URL   (required for `command`)  e.g. redis://127.0.0.1:6379
 *
 * Usage:
 *   node scripts/fleet-admin.mjs mint <handle> --tier <framer|trusted|standard> [--note "..."]
 *       Mint (or re-mint) an agent token. Prints JSON with the PLAINTEXT
 *       token exactly once — it is stored only as a sha256 hash. Re-minting
 *       an existing handle replaces its token and clears any revocation.
 *
 *   node scripts/fleet-admin.mjs list
 *       List registered agents (handle, tier, note, createdAt, revokedAt).
 *       Never prints token hashes.
 *
 *   node scripts/fleet-admin.mjs revoke <handle>
 *       Revoke a handle's token. Exit 2 if unknown or already revoked.
 *       NOTE: takes effect on a RUNNING server immediately when REDIS_URL is
 *       set (an auth:purge pub/sub message clears its verify cache); without
 *       Redis the running server's cache holds the old verdict for up to 30s
 *       (VERIFY_CACHE_TTL_MS).
 *
 *   node scripts/fleet-admin.mjs assignments [--active]
 *       List assignment audit docs (newest first), optionally active only.
 *
 *   node scripts/fleet-admin.mjs command (<handle> | --all) <pause|resume|stop|abort> [--reason "..."] [--by <who>]
 *       Set the sticky control command for one agent (cmd:<handle> +
 *       cmd:<handle>:seen reset) or the whole fleet (--all: fleet:cmd +
 *       fleet:cmd:seen reset), and record it in the Mongo `commands`
 *       collection. stop/abort expire after FLEET_CMD_TTL_SECONDS (3600).
 *
 *   node scripts/fleet-admin.mjs command (<handle> | --all) --clear
 *       Explicitly end a drain/pause: delete the pending command + seen-set.
 *
 * All output is JSON on stdout (script-friendly); errors go to stderr.
 * Exit codes: 0 ok, 1 usage/connection error, 2 operation had no effect.
 *
 * SECURITY: the minted token is printed to stdout by design (shown once);
 * nothing here ever logs or stores plaintext tokens or hashes elsewhere.
 */
import { createHash, randomBytes } from "node:crypto";
import { parseArgs } from "node:util";
import { MongoClient, ObjectId } from "mongodb";
import { Redis } from "ioredis";

const AGENT_TIERS = ["framer", "trusted", "standard"];
const COMMAND_KINDS = ["pause", "resume", "stop", "abort"];
// Keep in sync with src/orchestrator/{stores,control,auth}.ts (this CLI is
// deliberately standalone — it must work without a compiled dist/).
const FLEET_COMMAND_KEY = "fleet:cmd";
const FLEET_COMMAND_SEEN_KEY = "fleet:cmd:seen";
const commandKey = (handle) => `cmd:${handle}`;
const commandSeenKey = (handle) => `cmd:${handle}:seen`;
const AUTH_PURGE_CHANNEL = "auth:purge";
// One-shot drains expire (config.fleetCmdTtlSeconds server-side); mirror the
// default here so CLI-issued stop/abort can't kill a runner weeks later.
const EXPIRING_KINDS = ["stop", "abort"];
const FLEET_CMD_TTL_SECONDS = Number(process.env.FLEET_CMD_TTL_SECONDS || 3600);
const TOKEN_PREFIX = "fgt_";
const TOKEN_RANDOM_BYTES = 16; // fgt_<32hex>
const hashToken = (token) => createHash("sha256").update(token, "utf8").digest("hex");

function usageDie(message) {
  if (message) console.error(`error: ${message}\n`);
  console.error(
    [
      "usage:",
      "  fleet-admin.mjs mint <handle> --tier <framer|trusted|standard> [--note <text>]",
      "  fleet-admin.mjs list",
      "  fleet-admin.mjs revoke <handle>",
      "  fleet-admin.mjs assignments [--active]",
      "  fleet-admin.mjs command (<handle> | --all) <pause|resume|stop|abort> [--reason <text>] [--by <who>]",
      "  fleet-admin.mjs command (<handle> | --all) --clear",
      "",
      "env: MONGO_URL (required), MONGO_DB (default forgood), REDIS_URL (required for `command`;",
      "     recommended for mint/revoke so a running server's verify cache is purged immediately)",
    ].join("\n"),
  );
  process.exit(1);
}

function out(value) {
  console.log(JSON.stringify(value, null, 2));
}

async function withMongo(fn) {
  const url = process.env.MONGO_URL;
  if (!url) usageDie("MONGO_URL is not set");
  const client = new MongoClient(url, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
  await client.connect();
  try {
    return await fn(client.db(process.env.MONGO_DB || "forgood"));
  } finally {
    await client.close().catch(() => undefined);
  }
}

async function withRedis(fn) {
  const url = process.env.REDIS_URL;
  if (!url) usageDie("REDIS_URL is not set (required for `command`)");
  const redis = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 2, connectTimeout: 5000 });
  redis.on("error", () => undefined);
  await redis.connect();
  try {
    return await fn(redis);
  } finally {
    redis.disconnect();
  }
}

/**
 * Best-effort: tell any RUNNING server to drop its cached verifications for
 * this handle (mint replaces the token, revoke kills it — either way the
 * cache is stale). Never fatal: the CLI must still work with everything
 * down, in which case the server-side cache self-expires within 30s.
 */
async function publishAuthPurge(handle) {
  if (!process.env.REDIS_URL) {
    console.error(
      "warning: REDIS_URL not set — a running server keeps its cached verification for up to 30s",
    );
    return;
  }
  try {
    await withRedis((redis) => redis.publish(AUTH_PURGE_CHANNEL, handle));
  } catch (err) {
    console.error(
      `warning: could not publish auth purge (${err?.message ?? err}) — a running server keeps its cached verification for up to 30s`,
    );
  }
}

async function cmdMint(positionals, values) {
  const handle = (positionals[0] ?? "").trim();
  if (!handle) usageDie("mint requires <handle>");
  const tier = values.tier;
  if (!AGENT_TIERS.includes(tier)) usageDie(`--tier must be one of: ${AGENT_TIERS.join(", ")}`);

  // Mirrors mintAgentToken() in src/orchestrator/auth.ts — keep in sync.
  const token = TOKEN_PREFIX + randomBytes(TOKEN_RANDOM_BYTES).toString("hex");
  const tokenHash = hashToken(token);
  await withMongo(async (db) => {
    await db.collection("agents_registry").updateOne(
      { handle },
      {
        $set: {
          handle,
          tokenHash,
          tier,
          createdAt: new Date(),
          ...(values.note !== undefined ? { note: values.note } : {}),
        },
        $unset: { revokedAt: "", ...(values.note === undefined ? { note: "" } : {}) },
      },
      { upsert: true },
    );
  });
  await publishAuthPurge(handle);
  out({ ok: true, handle, tier, token, note: "token shown once — store it now" });
}

async function cmdList() {
  const agents = await withMongo((db) =>
    db
      .collection("agents_registry")
      .find({}, { projection: { _id: 0, tokenHash: 0 } })
      .sort({ handle: 1 })
      .toArray(),
  );
  out({ ok: true, agents });
}

async function cmdRevoke(positionals) {
  const handle = (positionals[0] ?? "").trim();
  if (!handle) usageDie("revoke requires <handle>");
  const revoked = await withMongo(async (db) => {
    const result = await db
      .collection("agents_registry")
      .updateOne({ handle, revokedAt: null }, { $set: { revokedAt: new Date() } });
    return result.matchedCount > 0;
  });
  if (revoked) await publishAuthPurge(handle);
  out({ ok: revoked, handle, ...(revoked ? {} : { error: "unknown handle or already revoked" }) });
  if (!revoked) process.exit(2);
}

async function cmdAssignments(values) {
  const filter = values.active ? { active: true } : {};
  const assignments = await withMongo((db) =>
    db.collection("assignments").find(filter).sort({ claimedAt: -1 }).limit(200).toArray(),
  );
  out({ ok: true, count: assignments.length, assignments });
}

async function cmdCommand(positionals, values) {
  const target = values.all ? "*" : (positionals[0] ?? "").trim();
  if (!target) usageDie("command requires <handle> or --all");

  const cmdKey = target === "*" ? FLEET_COMMAND_KEY : commandKey(target);
  const seenKey = target === "*" ? FLEET_COMMAND_SEEN_KEY : commandSeenKey(target);

  if (values.clear) {
    // Explicitly end a drain/pause: remove the pending command + seen-set.
    await withRedis((redis) => redis.del(cmdKey, seenKey));
    out({ ok: true, target, cleared: true });
    return;
  }

  const kind = values.all ? positionals[0] : positionals[1];
  if (!COMMAND_KINDS.includes(kind)) usageDie(`command kind must be one of: ${COMMAND_KINDS.join(", ")}`);

  // Same audit shape as the server's enqueueCommand (control.ts): the Mongo
  // ObjectId doubles as the wire command id, so recordDelivery can stamp
  // deliveredTo/deliveredAt on CLI-issued commands too.
  const _id = new ObjectId();
  const command = {
    id: _id.toHexString(),
    kind,
    issuedAt: new Date().toISOString(),
    ...(values.reason ? { reason: values.reason } : {}),
  };
  const payload = JSON.stringify(command);

  await withMongo(async (db) => {
    await db.collection("commands").insertOne({
      _id,
      target,
      kind,
      ...(values.reason ? { reason: values.reason } : {}),
      issuedBy: values.by || "fleet-admin",
      issuedAt: command.issuedAt,
      deliveredTo: [],
    });
  });
  await withRedis(async (redis) => {
    // Sticky command + seen-set reset, atomically; one-shot drains expire.
    const multi = redis.multi();
    if (EXPIRING_KINDS.includes(kind)) multi.set(cmdKey, payload, "EX", FLEET_CMD_TTL_SECONDS);
    else multi.set(cmdKey, payload);
    multi.del(seenKey);
    await multi.exec();
  });
  out({ ok: true, target, command });
}

async function main() {
  const [subcommand, ...rest] = process.argv.slice(2);
  if (!subcommand) usageDie();

  const { values, positionals } = parseArgs({
    args: rest,
    allowPositionals: true,
    options: {
      tier: { type: "string" },
      note: { type: "string" },
      reason: { type: "string" },
      by: { type: "string" },
      active: { type: "boolean" },
      all: { type: "boolean" },
      clear: { type: "boolean" },
    },
  });

  switch (subcommand) {
    case "mint":
      return cmdMint(positionals, values);
    case "list":
      return cmdList();
    case "revoke":
      return cmdRevoke(positionals);
    case "assignments":
      return cmdAssignments(values);
    case "command":
      return cmdCommand(positionals, values);
    default:
      usageDie(`unknown subcommand: ${subcommand}`);
  }
}

main().catch((err) => {
  console.error(`error: ${err?.message ?? err}`);
  process.exit(1);
});
