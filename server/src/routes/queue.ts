/**
 * Public read routes over the mirror (Implementer D — the mirror is public
 * GitHub data, no auth):
 *  - GET /api/v1/queue — ordered available issues (the exact dispatch
 *    ordering via orchestrator/dispatch.listQueue, read-only). Optional
 *    `?stages=research,ideate` filter (non-dispatchable stages match
 *    nothing — discover can never appear here, ADR-0014).
 *  - GET /api/v1/board — counts by "status: *" label over open issues +
 *    open issue/PR counts.
 *
 * index.ts registers this only when orchestration is connected (otherwise
 * the paths answer 503 "orchestration disabled").
 */
import type { FastifyInstance } from "fastify";
import { IpRateLimiter } from "../guards.js";
import { listQueue } from "../orchestrator/dispatch.js";
import type { Orchestrator } from "../orchestrator/stores.js";
import type { FleetStore } from "../state.js";

const STATUS_PREFIX = "status: ";

export function registerQueueRoutes(
  app: FastifyInstance,
  store: FleetStore,
  orch: Orchestrator,
): void {
  void store; // public mirror reads never touch telemetry state

  // These are unauthenticated and each hit runs real Mongo work (an open-
  // issue scan + candidate ordering), so they get the same per-IP budget the
  // telemetry/logs routes carry — unbudgeted plain-HTTP routes are a free
  // flood path.
  const limiter = new IpRateLimiter();

  app.get<{ Querystring: { stages?: string } }>("/api/v1/queue", async (req, reply) => {
    if (!limiter.allow(req.ip)) return reply.code(429).send({ ok: false, error: "slow down" });
    const raw = req.query.stages;
    const stages = raw
      ? raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;
    const issues = await listQueue(orch, stages);
    return { ok: true, count: issues.length, issues };
  });

  app.get("/api/v1/board", async (req, reply) => {
    if (!limiter.allow(req.ip)) return reply.code(429).send({ ok: false, error: "slow down" });
    const open = await orch.db
      .collection<{ labels: string[] }>("issues")
      .find({ state: "open" }, { projection: { labels: 1 } })
      .toArray();
    const statuses: Record<string, number> = {};
    for (const issue of open) {
      for (const label of issue.labels ?? []) {
        if (!label.startsWith(STATUS_PREFIX)) continue;
        const status = label.slice(STATUS_PREFIX.length);
        statuses[status] = (statuses[status] ?? 0) + 1;
      }
    }
    const openPrs = await orch.db.collection("pulls").countDocuments({ state: "open" });
    return { ok: true, statuses, openIssues: open.length, openPrs };
  });
}
