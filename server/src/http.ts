/**
 * REST surface — a polling fallback for the dashboard and a plain-curl path
 * for bash workers (autopilot.sh) that don't want to hold a WebSocket open.
 */
import type { FastifyInstance, FastifyRequest } from "fastify";
import { config } from "./config.js";
import { IpRateLimiter } from "./guards.js";
import { bearerToken, verifyAgentToken } from "./orchestrator/auth.js";
import { popCommands } from "./orchestrator/control.js";
import { renewLeasesForHandle } from "./orchestrator/dispatch.js";
import type { Orchestrator } from "./orchestrator/stores.js";
import { logPostSchema, telemetryPostSchema, type FleetCommand } from "./protocol.js";
import { redactLines } from "./redact.js";
import type { FleetStore } from "./state.js";

/**
 * Orchestration side-channel on the telemetry heartbeat: when the POST
 * carries a valid agent bearer token, auto-renew the handle's active lease
 * and drain its pending FleetCommands into the response. Best-effort and
 * fail-open by design — a bad/missing token or an orchestration hiccup NEVER
 * breaks telemetry (the response just carries no `commands`), and the
 * registry handle (not the self-reported hello handle) is what leases and
 * command queues key on.
 */
async function orchestrationExtras(
  orch: Orchestrator,
  req: FastifyRequest,
  consumerId?: string,
): Promise<FleetCommand[] | undefined> {
  const token = bearerToken(req);
  if (!token) return undefined;
  try {
    const identity = await verifyAgentToken(orch, token);
    if (!identity) return undefined;
    await renewLeasesForHandle(orch, identity.handle).catch(() => undefined);
    // Commands are exactly-once per CONSUMER (the caller's stable session id
    // when it sends one; the handle otherwise) so a handle running several
    // runners has each of them hear a drain — see orchestrator/control.ts.
    return await popCommands(orch, identity.handle, consumerId);
  } catch {
    return undefined;
  }
}

/**
 * `orch` (optional — undefined when orchestration is disabled) lets the
 * telemetry route, when a valid agent bearer token is presented, (a)
 * auto-renew the handle's active lease and (b) piggyback pending
 * FleetCommands on the response (`commands: FleetCommand[]`).
 */
export function registerHttpRoutes(app: FastifyInstance, store: FleetStore, orch?: Orchestrator): void {
  // The WS routes get a per-connection limiter; the plain-HTTP ingestion
  // routes need the same budget per source IP or they're a free flood path.
  const limiter = new IpRateLimiter();
  const rateLimited = (ip: string) => !limiter.allow(ip);
  app.get("/healthz", async () => ({ ok: true, agents: store.listAgents().length }));

  /** Full current state — same shape as the WS `snapshot` message body. */
  app.get("/api/v1/state", async () => store.snapshot());

  /** Just the fleet metrics, cheap to poll for embeds/badges. */
  app.get("/api/v1/metrics", async () => store.fleetMetrics());

  /** Durable historical token/TPS samples from the optional SQLite history DB. */
  app.get<{ Querystring: { minutes?: string; bucketSeconds?: string } }>("/api/v1/history/tps", async (req) => {
    const minutes = req.query.minutes ? Number(req.query.minutes) : undefined;
    const bucketSeconds = req.query.bucketSeconds ? Number(req.query.bucketSeconds) : undefined;
    return { ok: true, buckets: store.tpsHistory(minutes, bucketSeconds), totals: store.historyTotals() };
  });

  /** Recent retained redacted stream lines for a worker detail drawer. */
  app.get<{ Params: { agentId: string } }>("/api/v1/agents/:agentId/logs", async (req, reply) => {
    const rec = store.getAgent(req.params.agentId);
    if (!rec) return reply.code(404).send({ ok: false, error: "unknown agentId" });
    return { ok: true, agentId: rec.id, handle: rec.handle, lines: store.agentLogs(rec.id) };
  });

  /**
   * Curl-friendly worker telemetry: hello fields + optional heartbeat deltas
   * in one POST. First post returns an `agentId`; include it on subsequent
   * posts to keep the session stable. Presence expires by TTL if posts stop.
   */
  app.post("/api/v1/telemetry", async (req, reply) => {
    if (rateLimited(req.ip)) return reply.code(429).send({ ok: false, error: "slow down" });
    const parsed = telemetryPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: parsed.error.issues[0]?.message ?? "invalid body" });
    }
    const { agentId, heartbeat, ...hello } = parsed.data;
    // Unknown/expired agentId (e.g. server restarted): fall through to a fresh
    // session rather than erroring the worker.
    const knownId = agentId && store.getAgent(agentId) ? agentId : undefined;
    const id = store.upsertAgent({ type: "hello", ...hello }, "http", knownId);
    if (!id) return reply.code(503).send({ ok: false, error: "fleet full" });
    if (heartbeat) store.applyHeartbeat(id, heartbeat);
    // Token-authed posts additionally renew leases and drain pending
    // commands; without a token (or orchestration) the response is exactly
    // the pre-orchestration shape.
    if (orch) {
      // The CLIENT-echoed agentId is the consumer identity (stable across a
      // runner's posts); a first post without one falls back to the handle.
      const commands = await orchestrationExtras(orch, req, knownId);
      if (commands) return { ok: true, agentId: id, commands };
    }
    return { ok: true, agentId: id };
  });

  /**
   * Opt-in session-log ingestion for hook-based workers (Claude Code hooks,
   * Codex notify) — one-shot processes that can't hold a WebSocket. Same
   * gates as the WS `log` message: the server must allow it, the worker must
   * have opted in, and lines are redacted AGAIN here as defence in depth.
   */
  app.post("/api/v1/logs", async (req, reply) => {
    if (rateLimited(req.ip)) return reply.code(429).send({ ok: false, error: "slow down" });
    if (!config.allowLogStream) {
      return reply.code(403).send({ ok: false, error: "log streaming disabled on this server" });
    }
    const parsed = logPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: parsed.error.issues[0]?.message ?? "invalid body" });
    }
    const rec = store.getAgent(parsed.data.agentId);
    if (!rec) return reply.code(404).send({ ok: false, error: "unknown agentId" });
    store.appendLogs(rec.id, rec.handle, redactLines(parsed.data.lines));
    store.touchAgent(rec.id);
    return { ok: true };
  });

  /** Clean sign-off for HTTP workers (optional — TTL handles the rest). */
  app.post<{ Body: { agentId?: string } }>("/api/v1/goodbye", async (req) => {
    const agentId = req.body?.agentId;
    if (typeof agentId === "string" && store.getAgent(agentId)) {
      store.markAgentOffline(agentId, "disconnected");
    }
    return { ok: true };
  });
}
