/**
 * Agent-facing work routes (Implementer D).
 *
 * All require `Authorization: Bearer fgt_...` verified via
 * orchestrator/auth.verifyAgentToken (401 otherwise):
 *  - POST /api/v1/work/claim   — body claimRequestSchema. 200
 *    {ok:true, issue: ClaimedIssue, assignmentId, leaseTtlSeconds};
 *    {ok:true, issue:null} when the queue is empty; 503 when no github
 *    token; 429 {ok:false, retryAfterSeconds} on GitHub rate-limit.
 *  - POST /api/v1/work/renew   — body {issue}. 404 when this handle has no
 *    active assignment on the issue.
 *  - POST /api/v1/work/release — body releaseRequestSchema. done = mark
 *    inactive + DEL lease, labels untouched; abandoned = revert labels too.
 *
 * index.ts registers this only when orchestration is connected (otherwise
 * the paths answer 503 "orchestration disabled").
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { config } from "../config.js";
import { GitHubApiError } from "../github/gh-api.js";
import { IpRateLimiter } from "../guards.js";
import { bearerToken, verifyAgentToken, type AgentIdentity } from "../orchestrator/auth.js";
import { claimNext, releaseAssignment, renewLease, type ClaimResult } from "../orchestrator/dispatch.js";
import type { Orchestrator } from "../orchestrator/stores.js";
import { claimRequestSchema, releaseRequestSchema } from "../protocol.js";
import type { FleetStore } from "../state.js";

const renewRequestSchema = z.object({ issue: z.number().int().positive() });

export function registerDispatchRoutes(
  app: FastifyInstance,
  store: FleetStore,
  orch: Orchestrator,
): void {
  // Same per-IP budget as the telemetry/logs routes (http.ts): every plain
  // HTTP route is a free flood path without one, and each claim/renew costs
  // a Mongo lookup even for garbage tokens.
  const limiter = new IpRateLimiter();
  const rateLimited = async (req: FastifyRequest, reply: FastifyReply): Promise<boolean> => {
    if (limiter.allow(req.ip)) return false;
    await reply.code(429).send({ ok: false, error: "slow down" });
    return true;
  };

  /** Verify the bearer token; on failure answer 401 and return null. */
  const authenticate = async (req: FastifyRequest, reply: FastifyReply): Promise<AgentIdentity | null> => {
    const identity = await verifyAgentToken(orch, bearerToken(req));
    if (!identity) {
      await reply.code(401).send({ ok: false, error: "unauthorized" });
      return null;
    }
    return identity;
  };

  app.post("/api/v1/work/claim", async (req, reply) => {
    if (await rateLimited(req, reply)) return reply;
    const identity = await authenticate(req, reply);
    if (!identity) return reply;
    // A bare POST (no body) is a valid "claim anything" request.
    const parsed = claimRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: parsed.error.issues[0]?.message ?? "invalid body" });
    }
    let result: ClaimResult;
    try {
      result = await claimNext(orch, store, {
        handle: identity.handle,
        tier: identity.tier,
        ...(parsed.data.stages ? { stages: parsed.data.stages } : {}),
        ...(parsed.data.harness ? { harness: parsed.data.harness } : {}),
        ...(parsed.data.model ? { model: parsed.data.model } : {}),
        ...(parsed.data.agentId ? { agentId: parsed.data.agentId } : {}),
      });
    } catch (err) {
      // Never serialize upstream error messages to the client — they embed
      // the GitHub API path and upstream error text. Log server-side only.
      req.log.error({ err }, "claim failed");
      if (err instanceof GitHubApiError) {
        return reply.code(502).send({ ok: false, error: "github upstream error" });
      }
      return reply.code(500).send({ ok: false, error: "internal error" });
    }
    switch (result.status) {
      case "claimed":
        return {
          ok: true,
          issue: result.issue,
          assignmentId: result.assignmentId,
          leaseTtlSeconds: result.leaseTtlSeconds,
        };
      case "empty":
        return { ok: true, issue: null };
      case "rate-limited":
        return reply.code(429).send({
          ok: false,
          error: "github rate-limited",
          retryAfterSeconds: result.retryAfterSeconds,
        });
      case "disabled":
        return reply.code(503).send({ ok: false, error: result.reason });
    }
  });

  app.post("/api/v1/work/renew", async (req, reply) => {
    if (await rateLimited(req, reply)) return reply;
    const identity = await authenticate(req, reply);
    if (!identity) return reply;
    const parsed = renewRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: parsed.error.issues[0]?.message ?? "invalid body" });
    }
    const renewed = await renewLease(orch, identity.handle, parsed.data.issue);
    if (!renewed) {
      return reply.code(404).send({ ok: false, error: "no active assignment for this handle+issue" });
    }
    return { ok: true, leaseTtlSeconds: config.leaseTtlSeconds };
  });

  app.post("/api/v1/work/release", async (req, reply) => {
    if (await rateLimited(req, reply)) return reply;
    const identity = await authenticate(req, reply);
    if (!identity) return reply;
    const parsed = releaseRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: parsed.error.issues[0]?.message ?? "invalid body" });
    }
    const released = await releaseAssignment(orch, store, {
      issue: parsed.data.issue,
      outcome: parsed.data.outcome,
      handle: identity.handle,
      ...(parsed.data.prNumber ? { prNumber: parsed.data.prNumber } : {}),
    });
    if (!released) {
      return reply.code(404).send({ ok: false, error: "no active assignment for this handle+issue" });
    }
    return { ok: true };
  });
}
