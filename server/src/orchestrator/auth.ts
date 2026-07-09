/**
 * Agent token registry (Implementer C owns the implementation).
 *
 * Server-minted bearer tokens (`fgt_<32 hex>`) tied to a GitHub handle + a
 * trust tier, stored in Mongo `agents_registry` as a sha256 hex `tokenHash`
 * — NEVER the plaintext. One registry doc PER TOKEN: a handle may hold any
 * number of live tokens (one per machine/runner), minted additively and
 * revoked individually (by tokenId) or handle-wide. Only TOFU self-enrollment
 * is exactly-once per handle (partial unique index over autoEnrolled docs).
 * Lookup is by tokenHash; a doc with `revokedAt` set never verifies.
 *
 * Security notes:
 *  - Plaintext tokens exist only in the mint response — they are never
 *    stored, cached, or logged (the cache is keyed by hash).
 *  - Hash comparison after lookup uses crypto.timingSafeEqual.
 *  - Verification results are cached in-memory for a short TTL to keep the
 *    per-heartbeat cost off Mongo. The in-process mint/revoke handlers purge
 *    the local cache directly. Out-of-process mints/revokes (fleet-admin.mjs,
 *    or another server process) do NOT reach this cache — they publish the
 *    handle on the AUTH_PURGE_CHANNEL Redis channel instead, which
 *    subscribeAuthPurge() (index.ts) turns into a local purge. Without that
 *    signal (Redis down mid-revoke), a revoked token can keep verifying here
 *    for up to VERIFY_CACHE_TTL_MS (30s).
 */
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { FastifyRequest } from "fastify";
import type { Orchestrator } from "./stores.js";

/** Redis pub/sub channel carrying handles whose cached verifications must be
 *  dropped (out-of-band mint/revoke — e.g. fleet-admin.mjs). */
export const AUTH_PURGE_CHANNEL = "auth:purge";

export const AGENT_TIERS = ["framer", "trusted", "standard"] as const;
export type AgentTier = (typeof AGENT_TIERS)[number];

/** The verified identity behind a bearer token. */
export interface AgentIdentity {
  handle: string;
  tier: AgentTier;
}

/** Registry row as exposed to admins — never includes tokenHash. */
export interface RegisteredAgent {
  handle: string;
  /** Short non-secret id (hash prefix) for listing + targeted revocation. */
  tokenId: string;
  tier: AgentTier;
  note?: string;
  createdAt: string;
  revokedAt?: string;
}

/** Mongo doc shape for `agents_registry` — ONE DOC PER TOKEN (a handle may
 *  hold any number of independently-revocable tokens, e.g. one per machine;
 *  internal — hash never leaves). */
interface RegistryDoc {
  handle: string;
  tokenHash: string;
  /** First 12 hex of tokenHash — non-secret listing/revocation id. */
  tokenId: string;
  tier: AgentTier;
  note?: string;
  /** Set on TOFU self-enrollment docs — the partial unique index on these
   *  is what makes first-contact minting exactly-once per handle. */
  autoEnrolled?: boolean;
  createdAt: Date;
  revokedAt?: Date | null; // written as $unset (missing); null allowed so the
  // `revokedAt: null` filter (matches missing OR null) typechecks.
}

const TOKEN_PREFIX = "fgt_";
const TOKEN_RANDOM_BYTES = 16; // -> 32 hex chars: fgt_<32hex>
const TOKEN_PATTERN = /^fgt_[0-9a-f]{32}$/;

/** Positive verification cache: sha256(token) -> identity, short TTL. */
const VERIFY_CACHE_TTL_MS = 30_000;
const VERIFY_CACHE_MAX = 512;
const verifyCache = new Map<string, { identity: AgentIdentity; expiresAt: number }>();

function cachePut(tokenHash: string, identity: AgentIdentity): void {
  if (verifyCache.size >= VERIFY_CACHE_MAX) {
    // Evict expired entries first; if none, drop the oldest insertion.
    const now = Date.now();
    for (const [key, entry] of verifyCache) {
      if (entry.expiresAt <= now) verifyCache.delete(key);
    }
    if (verifyCache.size >= VERIFY_CACHE_MAX) {
      const oldest = verifyCache.keys().next().value;
      if (oldest !== undefined) verifyCache.delete(oldest);
    }
  }
  verifyCache.set(tokenHash, { identity, expiresAt: Date.now() + VERIFY_CACHE_TTL_MS });
}

function cacheGet(tokenHash: string): AgentIdentity | null {
  const entry = verifyCache.get(tokenHash);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    verifyCache.delete(tokenHash);
    return null;
  }
  return entry.identity;
}

/** Drop cached verifications for a handle (mint/revoke changed its truth). */
function cachePurgeHandle(handle: string): void {
  for (const [key, entry] of verifyCache) {
    if (entry.identity.handle === handle) verifyCache.delete(key);
  }
}

/** sha256 hex of a plaintext token — the only form ever persisted. */
function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Constant-time equality for two same-purpose hex digests. */
function safeHashEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function registry(orch: Orchestrator) {
  return orch.db.collection<RegistryDoc>("agents_registry");
}

/** Extract the `Authorization: Bearer <token>` value, or undefined. */
export function bearerToken(req: FastifyRequest): string | undefined {
  const header = req.headers.authorization;
  if (!header) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1];
}

/**
 * Mint a token for a handle: generates `fgt_<random>`, INSERTS a new registry
 * doc — a handle may hold any number of live tokens (one per machine/runner),
 * each independently revocable by its tokenId — and returns the PLAINTEXT
 * token, shown once, never stored or logged.
 */
export async function mintAgentToken(
  orch: Orchestrator,
  opts: { handle: string; tier: AgentTier; note?: string },
): Promise<{ token: string; tokenId: string }> {
  const handle = opts.handle.trim();
  if (!handle) throw new Error("handle required");
  if (!AGENT_TIERS.includes(opts.tier)) throw new Error(`invalid tier: ${String(opts.tier)}`);

  const token = TOKEN_PREFIX + randomBytes(TOKEN_RANDOM_BYTES).toString("hex");
  const tokenHash = hashToken(token);
  const tokenId = tokenHash.slice(0, 12);

  await registry(orch).insertOne({
    handle,
    tokenHash,
    tokenId,
    tier: opts.tier,
    createdAt: new Date(),
    ...(opts.note !== undefined ? { note: opts.note } : {}),
  });

  // Cached identities for this handle may carry a stale tier — refresh.
  cachePurgeHandle(handle);

  return { token, tokenId };
}

/** TOFU auto-enrollment: mint a standard-tier token for a handle on FIRST
 *  contact, exactly once (unique {handle:1} index arbitrates racers). Returns
 *  null when the handle already has a registry doc — live OR revoked: a
 *  revocation must stick, and a lost token is an operator reset
 *  (admin route / fleet-admin.mjs re-mint), never a self-service re-issue,
 *  otherwise anyone could rotate a rival's token by re-enrolling their
 *  handle. Squatting an unclaimed handle is possible by construction
 *  (self-reported identity, assumed trust — ADR-0017); it is visible in the
 *  registry listing and revocable. */
export async function enrollAgent(
  orch: Orchestrator,
  opts: { handle: string; note?: string },
): Promise<{ token: string } | null> {
  const handle = opts.handle.trim();
  if (!handle) throw new Error("handle required");

  // ANY existing doc for the handle — live, revoked, operator-minted —
  // refuses self-enrollment: an already-provisioned or revoked identity is
  // an operator conversation, and a squatter must not TOFU a handle whose
  // owner already holds operator-minted tokens. The check-then-insert race
  // is closed by the partial unique index over autoEnrolled docs.
  if ((await registry(orch).countDocuments({ handle }, { limit: 1 })) > 0) return null;

  const token = TOKEN_PREFIX + randomBytes(TOKEN_RANDOM_BYTES).toString("hex");
  const tokenHash = hashToken(token);
  try {
    await registry(orch).insertOne({
      handle,
      tokenHash,
      tokenId: tokenHash.slice(0, 12),
      tier: "standard",
      autoEnrolled: true,
      createdAt: new Date(),
      note: opts.note ?? "auto-enrolled",
    });
  } catch (err) {
    // Duplicate auto-enroll (E11000 on the partial index) = a racer won.
    if (err instanceof Error && "code" in err && (err as { code?: number }).code === 11000) return null;
    throw err;
  }
  cachePurgeHandle(handle);
  return { token };
}

/** Revoke tokens (sets revokedAt): all of a handle's live tokens, or — with
 *  `tokenId` — exactly one of them (per-machine revocation). Returns false
 *  when nothing live matched. */
export async function revokeAgentToken(
  orch: Orchestrator,
  handle: string,
  tokenId?: string,
): Promise<boolean> {
  const result = await registry(orch).updateMany(
    // `revokedAt: null` matches both "missing" and "explicit null".
    { handle, revokedAt: null, ...(tokenId ? { tokenId } : {}) },
    { $set: { revokedAt: new Date() } },
  );
  cachePurgeHandle(handle);
  return result.matchedCount > 0;
}

/** List registry entries for `GET /api/v1/admin/agents` — no hashes. */
export async function listRegisteredAgents(orch: Orchestrator): Promise<RegisteredAgent[]> {
  // tokenHash is fetched ONLY to derive tokenId for docs minted before the
  // field existed — it is never returned.
  const docs = await registry(orch)
    .find({}, { projection: { _id: 0 } })
    .sort({ handle: 1, createdAt: 1 })
    .toArray();
  return docs.map((doc) => ({
    handle: doc.handle,
    tokenId: doc.tokenId ?? doc.tokenHash.slice(0, 12),
    tier: doc.tier,
    ...(doc.note !== undefined ? { note: doc.note } : {}),
    createdAt: new Date(doc.createdAt).toISOString(),
    ...(doc.revokedAt ? { revokedAt: new Date(doc.revokedAt).toISOString() } : {}),
  }));
}

/**
 * Verify a presented bearer token against the registry (sha256 the token,
 * look up by tokenHash, reject revoked). Returns null for missing/bad/
 * revoked tokens — callers turn that into a 401.
 */
export async function verifyAgentToken(
  orch: Orchestrator,
  token: string | undefined,
): Promise<AgentIdentity | null> {
  if (!token || !TOKEN_PATTERN.test(token)) return null;

  const tokenHash = hashToken(token);

  const cached = cacheGet(tokenHash);
  if (cached) return cached;

  const doc = await registry(orch).findOne({ tokenHash });
  if (!doc || doc.revokedAt) return null;
  // The query already matched on tokenHash; re-check in constant time so no
  // code path ever compares secret material with variable-time equality.
  if (!safeHashEqual(doc.tokenHash, tokenHash)) return null;
  if (!AGENT_TIERS.includes(doc.tier)) return null;

  const identity: AgentIdentity = { handle: doc.handle, tier: doc.tier };
  cachePut(tokenHash, identity);
  return identity;
}

/**
 * Subscribe to AUTH_PURGE_CHANNEL so out-of-process revokes/mints
 * (fleet-admin.mjs while this server is running) invalidate the local verify
 * cache immediately instead of after VERIFY_CACHE_TTL_MS. Uses a dedicated
 * duplicated connection (a subscribed ioredis connection can't run normal
 * commands). Returns a stop function that closes the subscription.
 */
export async function subscribeAuthPurge(orch: Orchestrator): Promise<() => void> {
  const sub = orch.redis.duplicate();
  sub.on("error", () => undefined);
  await sub.subscribe(AUTH_PURGE_CHANNEL);
  sub.on("message", (channel: string, handle: string) => {
    if (channel === AUTH_PURGE_CHANNEL && handle) cachePurgeHandle(handle);
  });
  return () => {
    sub.disconnect();
  };
}

/** Test hook: reset the in-memory verification cache. */
export function _clearVerifyCache(): void {
  verifyCache.clear();
}
