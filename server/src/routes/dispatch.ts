/**
 * Agent-facing work routes (Implementer D).
 *
 * All require `Authorization: Bearer fgt_...` verified via
 * orchestrator/auth.verifyAgentToken (401 otherwise):
 *  - POST /api/v1/agents/enroll — UNAUTHENTICATED TOFU enrollment (ADR-0017):
 *    body enrollRequestSchema; 200 {ok,token,handle,tier:"standard"} exactly
 *    once per handle; 409 ever after (revocations stick — operator re-mints);
 *    403 when AUTO_ENROLL=0. Rate-limited per IP like every agent route.
 *  - POST /api/v1/work/claim   — body claimRequestSchema. 200
 *    {ok:true, issue: ClaimedIssue, assignmentId, leaseTtlSeconds, handle}
 *    (handle = the registry identity the claim was made for — the runner
 *    settles cross-population assignee races against THIS, not its local
 *    `gh` login, which may differ for bot-handle tokens);
 *    {ok:true, issue:null} when the queue is empty; 503 when no github
 *    token; 429 {ok:false, retryAfterSeconds} on GitHub rate-limit.
 *    kind:"review" (ADR-0019) answers {ok:true, review: ClaimedReview, ...}
 *    / {ok:true, review:null} instead, same statuses otherwise.
 *  - POST /api/v1/work/renew   — body {issue}. 404 when this handle has no
 *    active assignment on the issue (for reviews, `issue` = the PR number).
 *  - POST /api/v1/work/release — body releaseRequestSchema. done = mark
 *    inactive + DEL lease, labels untouched; abandoned = revert labels too.
 *    kind:"review" releases never touch labels for either outcome.
 *
 * index.ts registers this only when orchestration is connected (otherwise
 * the paths answer 503 "orchestration disabled").
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { config } from "../config.js";
import { GitHubApiError } from "../github/gh-api.js";
import { IpRateLimiter } from "../guards.js";
import { bearerToken, enrollAgent, verifyAgentToken, type AgentIdentity } from "../orchestrator/auth.js";
import {
  claimNext,
  claimNextReview,
  claimNextRework,
  releaseAssignment,
  renewLease,
  type ClaimResult,
  type ClaimReviewResult,
  type ClaimReworkResult,
} from "../orchestrator/dispatch.js";
import type { Orchestrator } from "../orchestrator/stores.js";
import { claimRequestSchema, enrollRequestSchema, releaseRequestSchema } from "../protocol.js";
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

  // TOFU auto-enrollment (ADR-0017): a runner's first contact mints its own
  // standard-tier token, so "just run autopilot.sh" works with no operator
  // hand-out. Unauthenticated by design — the handle is self-reported
  // assumed-trust identity (same as telemetry's hello.handle); the strict
  // login-shape schema keeps arbitrary strings out of the registry, the
  // unique index makes first-contact wins atomic, a revoked or existing
  // handle is NEVER re-issued here, and per-IP rate limiting bounds abuse.
  app.post("/api/v1/agents/enroll", async (req, reply) => {
    if (await rateLimited(req, reply)) return reply;
    if (!config.autoEnroll) {
      return reply.code(403).send({ ok: false, error: "auto-enrollment disabled — ask the operator for a token" });
    }
    const parsed = enrollRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: parsed.error.issues[0]?.message ?? "invalid body" });
    }
    const minted = await enrollAgent(orch, {
      handle: parsed.data.handle,
      note: `auto-enrolled${parsed.data.harness ? ` (${parsed.data.harness})` : ""}`,
    });
    if (!minted) {
      return reply.code(409).send({
        ok: false,
        error:
          "handle already enrolled — copy its stored ~/.forgood token to this machine, or ask the operator to mint an additional token",
      });
    }
    store.addEvent("agent_online", `@${parsed.data.handle} enrolled with the fleet server`, {
      handle: parsed.data.handle,
      ...(parsed.data.harness ? { harness: parsed.data.harness } : {}),
    });
    return { ok: true, token: minted.token, handle: parsed.data.handle, tier: "standard" };
  });

  app.post("/api/v1/work/claim", async (req, reply) => {
    if (await rateLimited(req, reply)) return reply;
    const identity = await authenticate(req, reply);
    if (!identity) return reply;
    // A bare POST (no body) is a valid "claim anything" request.
    const parsed = claimRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: parsed.error.issues[0]?.message ?? "invalid body" });
    }
    const ctx = {
      handle: identity.handle,
      tier: identity.tier,
      ...(parsed.data.stages ? { stages: parsed.data.stages } : {}),
      ...(parsed.data.harness ? { harness: parsed.data.harness } : {}),
      ...(parsed.data.model ? { model: parsed.data.model } : {}),
      ...(parsed.data.agentId ? { agentId: parsed.data.agentId } : {}),
    };
    let result: ClaimResult | ClaimReviewResult | ClaimReworkResult;
    try {
      result =
        parsed.data.kind === "review"
          ? await claimNextReview(orch, store, ctx)
          : parsed.data.kind === "rework"
            ? await claimNextRework(orch, store, ctx)
            : await claimNext(orch, store, ctx);
    } catch (err) {
      // Never serialize upstream error messages to the client — they embed
      // the GitHub API path and upstream error text. Log server-side only.
      req.log.error({ err }, "claim failed");
      if (err instanceof GitHubApiError) {
        return reply.code(502).send({ ok: false, error: "github upstream error" });
      }
      return reply.code(500).send({ ok: false, error: "internal error" });
    }
    // kind:"review" responses carry `review`, kind:"rework" carry `rework`,
    // where work carries `issue` — same statuses, so a runner's
    // queue-empty/error handling is one path. Every response ECHOES the kind it
    // executed, so a runner can detect a server that silently dropped an unknown
    // kind (deploy skew — the pre-ADR-0019 schema stripped `kind` and ran a
    // WORK claim).
    const emptyPayload =
      parsed.data.kind === "review"
        ? { review: null }
        : parsed.data.kind === "rework"
          ? { rework: null }
          : { issue: null };
    switch (result.status) {
      case "claimed":
        return {
          ok: true,
          kind: parsed.data.kind,
          ...("review" in result
            ? { review: result.review }
            : "rework" in result
              ? { rework: result.rework }
              : { issue: result.issue }),
          assignmentId: result.assignmentId,
          leaseTtlSeconds: result.leaseTtlSeconds,
          handle: identity.handle,
        };
      case "empty":
        return { ok: true, kind: parsed.data.kind, ...emptyPayload };
      case "capped":
        // Shaped like empty (issue:null / review:null) so every runner just
        // falls into its queue-empty path; the reason lets an operator see why.
        return { ok: true, kind: parsed.data.kind, ...emptyPayload, reason: "active-claim-cap" };
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
    // renewLease answers the GRANTED TTL (review leases run longer than work
    // leases), or null when this handle holds nothing active on the number.
    const grantedTtl = await renewLease(orch, identity.handle, parsed.data.issue);
    if (grantedTtl === null) {
      return reply.code(404).send({ ok: false, error: "no active assignment for this handle+issue" });
    }
    return { ok: true, leaseTtlSeconds: grantedTtl };
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
      kind: parsed.data.kind,
      handle: identity.handle,
      ...(parsed.data.prNumber ? { prNumber: parsed.data.prNumber } : {}),
    });
    if (!released) {
      return reply.code(404).send({ ok: false, error: "no active assignment for this handle+issue" });
    }
    return { ok: true };
  });
}
