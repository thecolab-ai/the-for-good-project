/**
 * REST surface — a polling fallback for the dashboard and a plain-curl path
 * for bash workers (autopilot.sh) that don't want to hold a WebSocket open.
 */
import type { FastifyInstance } from "fastify";
import { config } from "./config.js";
import { IpRateLimiter } from "./guards.js";
import { logPostSchema, telemetryPostSchema } from "./protocol.js";
import { redactLines } from "./redact.js";
import type { FleetStore } from "./state.js";

export function registerHttpRoutes(app: FastifyInstance, store: FleetStore): void {
  // The WS routes get a per-connection limiter; the plain-HTTP ingestion
  // routes need the same budget per source IP or they're a free flood path.
  const limiter = new IpRateLimiter();
  const rateLimited = (ip: string) => !limiter.allow(ip);
  app.get("/healthz", async () => ({ ok: true, agents: store.listAgents().length }));

  /** Full current state — same shape as the WS `snapshot` message body. */
  app.get("/api/v1/state", async () => store.snapshot());

  /** Just the fleet metrics, cheap to poll for embeds/badges. */
  app.get("/api/v1/metrics", async () => store.fleetMetrics());

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
