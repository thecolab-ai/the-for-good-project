/**
 * REST surface — a polling fallback for the dashboard and a plain-curl path
 * for bash workers (autopilot.sh) that don't want to hold a WebSocket open.
 */
import type { FastifyInstance } from "fastify";
import { telemetryPostSchema } from "./protocol.js";
import type { FleetStore } from "./state.js";

export function registerHttpRoutes(app: FastifyInstance, store: FleetStore): void {
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
    const parsed = telemetryPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ ok: false, error: parsed.error.issues[0]?.message ?? "invalid body" });
    }
    const { agentId, heartbeat, ...hello } = parsed.data;
    // Unknown/expired agentId (e.g. server restarted): fall through to a fresh
    // session rather than erroring the worker.
    const knownId = agentId && store.getAgent(agentId) ? agentId : undefined;
    const id = store.upsertAgent({ type: "hello", ...hello }, "http", knownId);
    if (heartbeat) store.applyHeartbeat(id, heartbeat);
    return { ok: true, agentId: id };
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
