/**
 * Orchestration store connect layer (pull-claim v1).
 *
 * Redis holds hot/expiring state (issue leases, command delivery queues);
 * MongoDB holds durable state (the GitHub mirror, webhook deliveries, the
 * agent token registry, the assignments audit trail, sync state). GitHub
 * remains the durable source of truth for work — the mirror only exists so
 * dispatch can order the queue without burning API quota, and it converges
 * back to GitHub via webhooks + the interval sync job.
 *
 * Fail-open by design: with REDIS_URL/MONGO_URL unset, `connectOrchestrator`
 * returns undefined and the server behaves exactly as before (telemetry
 * only). If they're set but unreachable, this throws — index.ts catches,
 * logs, and boots without orchestration.
 */
import { Redis } from "ioredis";
import { MongoClient, type Db } from "mongodb";
import { config } from "../config.js";
import { GitHubApi } from "../github/gh-api.js";

export interface Orchestrator {
  redis: Redis; // ioredis
  db: Db; // mongodb Db
  gh?: GitHubApi; // present when githubToken set
  close(): Promise<void>;
}

/** Redis key for an issue's claim lease (`SET NX EX leaseTtlSeconds`). */
export function leaseKey(issue: number): string {
  return `lease:issue:${issue}`;
}

/** Redis key holding one handle's current command (JSON, or unset). */
export function commandKey(handle: string): string {
  return `cmd:${handle}`;
}

/** Redis SET of consumers that already received the handle's command. */
export function commandSeenKey(handle: string): string {
  return `cmd:${handle}:seen`;
}

/** Redis key holding the current fleet-wide command (JSON, or unset). */
export const FLEET_COMMAND_KEY = "fleet:cmd";
/** Redis SET of handles that already received the fleet-wide command. */
export const FLEET_COMMAND_SEEN_KEY = "fleet:cmd:seen";

/** Cap for the webhook_deliveries capped collection (bytes / documents). */
const WEBHOOK_DELIVERIES_CAP_BYTES = 100 * 1024 * 1024;
const WEBHOOK_DELIVERIES_CAP_DOCS = 50_000;

/**
 * Connect both stores and ensure indexes. Returns undefined when
 * orchestration is not configured (redisUrl/mongoUrl unset); throws when it
 * is configured but a store is unreachable.
 */
export async function connectOrchestrator(cfg = config): Promise<Orchestrator | undefined> {
  if (!cfg.redisUrl || !cfg.mongoUrl) return undefined;

  const redis = new Redis(cfg.redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    connectTimeout: 5000,
  });
  // Without a listener ioredis prints "[ioredis] Unhandled error event" on
  // every reconnect blip. Individual commands still reject to their callers
  // (maxRetriesPerRequest), which is where failures are actually handled.
  redis.on("error", () => undefined);
  const mongo = new MongoClient(cfg.mongoUrl, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await redis.connect();
    await mongo.connect();
  } catch (err) {
    redis.disconnect();
    await mongo.close().catch(() => undefined);
    throw err;
  }

  const db = mongo.db(cfg.mongoDb);
  await ensureIndexes(db);

  const gh = cfg.githubToken ? new GitHubApi(cfg) : undefined;

  return {
    redis,
    db,
    gh,
    async close(): Promise<void> {
      redis.disconnect();
      await mongo.close().catch(() => undefined);
    },
  };
}

async function ensureIndexes(db: Db): Promise<void> {
  // webhook_deliveries: capped (bounded disk, insertion-ordered) with dedupe
  // via _id = X-GitHub-Delivery (duplicate inserts fail, which IS the dedupe).
  // createCollection throws NamespaceExists (code 48) once it exists — fine.
  await db
    .createCollection("webhook_deliveries", {
      capped: true,
      size: WEBHOOK_DELIVERIES_CAP_BYTES,
      max: WEBHOOK_DELIVERIES_CAP_DOCS,
    })
    .catch((err: unknown) => {
      if ((err as { codeName?: string }).codeName !== "NamespaceExists") throw err;
    });

  await Promise.all([
    db.collection("issues").createIndex({ state: 1, labels: 1 }),
    db.collection("issues").createIndex({ updatedAt: -1 }),
    db.collection("assignments").createIndex({ issueNumber: 1, active: 1 }),
    db.collection("assignments").createIndex({ handle: 1 }),
    db.collection("agents_registry").createIndex({ handle: 1 }, { unique: true }),
    // Not in the spec's index list but every token verification is a lookup
    // by tokenHash — cheap, idempotent, and saves a collection scan per claim.
    db.collection("agents_registry").createIndex({ tokenHash: 1 }),
  ]);
}
