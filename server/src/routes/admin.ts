/**
 * Admin routes (Implementer E).
 *
 * index.ts registers this ONLY when config.adminToken is set (unset = 404 by
 * non-registration) and orchestration is connected. Every route requires
 * `Authorization: Bearer <ADMIN_TOKEN>` — constant-time compare
 * (crypto.timingSafeEqual over equal-length sha256 digests), 401 on failure,
 * and the presented token is NEVER logged (the server's request serializer
 * already strips headers; nothing here touches them either).
 */
import { createHash, timingSafeEqual } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { config } from "../config.js";
import { runFullSync, runIncrementalSync } from "../github/sync.js";
import {
  AGENT_TIERS,
  bearerToken,
  listRegisteredAgents,
  mintAgentToken,
  revokeAgentToken,
} from "../orchestrator/auth.js";
import { enqueueCommand, FLEET_TARGET } from "../orchestrator/control.js";
import { listAssignments, releaseAssignment } from "../orchestrator/dispatch.js";
import type { Orchestrator } from "../orchestrator/stores.js";
import { COMMAND_KINDS } from "../protocol.js";
import type { FleetStore } from "../state.js";

const handleField = z.string().min(1).max(64);

const mintBodySchema = z.object({
  handle: handleField,
  tier: z.enum(AGENT_TIERS),
  note: z.string().max(300).optional(),
});

const revokeBodySchema = z.object({
  handle: handleField,
  /** Revoke one specific token (see the registry listing) instead of all. */
  tokenId: z.string().regex(/^[0-9a-f]{12}$/).optional(),
});

const commandBodySchema = z
  .object({
    handle: handleField.optional(),
    all: z.boolean().optional(),
    kind: z.enum(COMMAND_KINDS),
    reason: z.string().max(300).optional(),
  })
  .refine((b) => Boolean(b.all) !== Boolean(b.handle), {
    message: "provide exactly one of `handle` or `all: true`",
  });

const leaseReleaseBodySchema = z.object({
  issue: z.number().int().positive(),
  revertLabels: z.boolean().optional(),
});

const syncBodySchema = z.object({ full: z.boolean().optional() });

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/** Constant-time admin check: equal-length digests through timingSafeEqual —
 *  neither token length nor content leaks through timing. */
function adminAuthed(req: FastifyRequest): boolean {
  const presented = bearerToken(req);
  const expected = config.adminToken;
  if (!presented || !expected) return false;
  return timingSafeEqual(sha256(presented), sha256(expected));
}

function badRequest(reply: FastifyReply, error: z.ZodError): FastifyReply {
  return reply.code(400).send({ ok: false, error: error.issues[0]?.message ?? "invalid body" });
}

export function registerAdminRoutes(
  app: FastifyInstance,
  store: FleetStore,
  orch: Orchestrator,
): void {
  // Shared gate. Never log or echo the presented token.
  const requireAdmin = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!adminAuthed(req)) {
      await reply.code(401).send({ ok: false, error: "unauthorized" });
    }
  };
  const guarded = { preHandler: requireAdmin };

  /** Mint (or re-mint) an agent token. The plaintext appears in this response
   *  ONCE and is never stored or logged (registry keeps only the sha256). */
  // Mint is ADDITIVE: each call issues one more independently-revocable
  // token for the handle (one per machine/runner). tokenId names it in
  // listings and targeted revokes.
  app.post("/api/v1/admin/agents", guarded, async (req, reply) => {
    const parsed = mintBodySchema.safeParse(req.body);
    if (!parsed.success) return badRequest(reply, parsed.error);
    const { token, tokenId } = await mintAgentToken(orch, parsed.data);
    return { ok: true, handle: parsed.data.handle, tier: parsed.data.tier, token, tokenId };
  });

  // Revoke every live token for the handle, or — with tokenId — just one.
  app.post("/api/v1/admin/agents/revoke", guarded, async (req, reply) => {
    const parsed = revokeBodySchema.safeParse(req.body);
    if (!parsed.success) return badRequest(reply, parsed.error);
    const revoked = await revokeAgentToken(orch, parsed.data.handle, parsed.data.tokenId);
    if (!revoked) {
      return reply.code(404).send({ ok: false, error: "no live token matched that handle/tokenId" });
    }
    return { ok: true, handle: parsed.data.handle, ...(parsed.data.tokenId ? { tokenId: parsed.data.tokenId } : {}) };
  });

  /** Registry listing — RegisteredAgent rows only, never token hashes. */
  app.get("/api/v1/admin/agents", guarded, async () => {
    return { ok: true, agents: await listRegisteredAgents(orch) };
  });

  /** Enqueue a control command for one handle or the whole fleet. */
  app.post("/api/v1/admin/commands", guarded, async (req, reply) => {
    const parsed = commandBodySchema.safeParse(req.body);
    if (!parsed.success) return badRequest(reply, parsed.error);
    const { all, handle, kind, reason } = parsed.data;
    const target = all ? FLEET_TARGET : handle;
    if (!target) return badRequest(reply, new z.ZodError([])); // unreachable (refine)
    const command = await enqueueCommand(orch, target, kind, reason, "admin");
    store.addEvent(
      "command",
      target === FLEET_TARGET ? `fleet command: ${kind}` : `command: ${kind} → @${target}`,
      target === FLEET_TARGET ? {} : { handle: target },
    );
    return { ok: true, target, command };
  });

  /** Assignments audit trail; `?active=1` narrows to live leases. */
  app.get<{ Querystring: { active?: string } }>(
    "/api/v1/admin/assignments",
    guarded,
    async (req) => {
      const raw = req.query.active;
      const active = raw === undefined ? undefined : raw === "1" || raw === "true";
      return { ok: true, assignments: await listAssignments(orch, { active }) };
    },
  );

  /** Force-release an issue's lease (outcome "admin-released"). */
  app.post("/api/v1/admin/lease/release", guarded, async (req, reply) => {
    const parsed = leaseReleaseBodySchema.safeParse(req.body);
    if (!parsed.success) return badRequest(reply, parsed.error);
    const released = await releaseAssignment(orch, store, {
      issue: parsed.data.issue,
      outcome: "admin-released",
      revertLabels: parsed.data.revertLabels,
    });
    if (!released) {
      return reply.code(404).send({ ok: false, error: "no active assignment for that issue" });
    }
    return { ok: true, issue: parsed.data.issue };
  });

  /** Trigger a mirror sync pass now (full or incremental). */
  app.post("/api/v1/admin/sync", guarded, async (req, reply) => {
    if (!orch.gh) return reply.code(503).send({ ok: false, error: "no github token" });
    const parsed = syncBodySchema.safeParse(req.body ?? {});
    if (!parsed.success) return badRequest(reply, parsed.error);
    const result = parsed.data.full ? await runFullSync(orch) : await runIncrementalSync(orch);
    return { ok: true, full: Boolean(parsed.data.full), ...result };
  });
}
