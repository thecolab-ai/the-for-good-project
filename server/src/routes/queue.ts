/**
 * Public read routes over the mirror (Implementer D — the mirror is public
 * GitHub data, no auth):
 *  - GET /api/v1/queue — ordered available issues (the exact dispatch
 *    ordering via orchestrator/dispatch.listQueue, read-only). Optional
 *    `?stages=research,ideate` filter (non-dispatchable stages match
 *    nothing — discover can never appear here, ADR-0014).
 *  - GET /api/v1/board — counts by "status: *" label over open issues +
 *    open issue/PR counts.
 *  - GET /api/v1/issues/open — the runners' queue snapshot (ADR-0018):
 *    byte-compatible with fg-common's fetch_open_issues() GitHub read
 *    ([{number, createdAt, labels:[{name}], assignees:[{login}]}]), served
 *    from the mirror so a fleet loop costs ZERO GitHub budget. 503 when the
 *    mirror is stale (sync hasn't advanced recently) — runners then fall
 *    back to the direct GitHub read rather than trusting stale data.
 *
 * index.ts registers this only when orchestration is connected (otherwise
 * the paths answer 503 "orchestration disabled").
 */
import type { FastifyInstance } from "fastify";
import { config } from "../config.js";
import { IpRateLimiter } from "../guards.js";
import { listQueue } from "../orchestrator/dispatch.js";
import type { Orchestrator } from "../orchestrator/stores.js";
import type { FleetStore } from "../state.js";

const STATUS_PREFIX = "status: ";

/** How stale sync_state.lastIncrementalAt may be before the snapshot route
 *  refuses to serve (runners fall back to GitHub). Sync runs every
 *  syncIntervalSeconds (default 60s), so 10 missed passes = stale. */
const SNAPSHOT_STALE_FACTOR = 10;

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

  // Who is working on what, right now — the dashboard's "active claims"
  // panel. Active assignments joined with the mirror's issue titles (PR
  // titles for kind:"review" rows) and the LIVE Redis lease TTL (a lease
  // near zero with an active doc = a worker gone quiet; the sweeper will
  // reap it). All public data: the same labels/assignees GitHub shows, plus
  // timing.
  app.get("/api/v1/work/active", async (req, reply) => {
    if (!limiter.allow(req.ip)) return reply.code(429).send({ ok: false, error: "slow down" });
    const active = await orch.db
      .collection<{
        _id: unknown;
        kind?: "work" | "review";
        issueNumber: number;
        handle: string;
        harness?: string;
        model?: string;
        tier: string;
        claimedAt: string;
        renewedAt: string;
      }>("assignments")
      .find(
        { active: true },
        { projection: { kind: 1, issueNumber: 1, handle: 1, harness: 1, model: 1, tier: 1, claimedAt: 1, renewedAt: 1 } },
      )
      .sort({ claimedAt: 1 })
      .toArray();
    // Review assignments' issueNumber is a PR number — titles come from the
    // pulls mirror; work titles from issues. One number space, so two maps.
    const workNumbers = active.filter((a) => a.kind !== "review").map((a) => a.issueNumber);
    const reviewNumbers = active.filter((a) => a.kind === "review").map((a) => a.issueNumber);
    const titles = new Map<number, { title?: string; labels?: string[] }>(
      (
        await orch.db
          .collection<{ _id: number; title?: string; labels?: string[] }>("issues")
          .find({ _id: { $in: workNumbers } }, { projection: { title: 1, labels: 1 } })
          .toArray()
      ).map((i) => [i._id, i]),
    );
    const prTitles = new Map<number, { title?: string }>(
      (
        await orch.db
          .collection<{ _id: number; title?: string }>("pulls")
          .find({ _id: { $in: reviewNumbers } }, { projection: { title: 1 } })
          .toArray()
      ).map((p) => [p._id, p]),
    );
    const work = await Promise.all(
      active.map(async (a) => {
        const kind = a.kind ?? "work";
        const key = kind === "review" ? `lease:review:${a.issueNumber}` : `lease:issue:${a.issueNumber}`;
        const ttl = await orch.redis.ttl(key).catch(() => -2);
        const issue = kind === "review" ? prTitles.get(a.issueNumber) : titles.get(a.issueNumber);
        const labels = kind === "review" ? [] : ((titles.get(a.issueNumber)?.labels ?? []) as string[]);
        const stage = labels.find((l) => l.startsWith("stage: "))?.slice(7) ?? null;
        return {
          issue: a.issueNumber,
          kind,
          title: issue?.title ?? null,
          stage,
          handle: a.handle,
          harness: a.harness ?? null,
          model: a.model ?? null,
          claimedAt: a.claimedAt,
          renewedAt: a.renewedAt,
          /** -1/-2 = lease missing (expiring/reaped); dashboards show stalled. */
          leaseSecondsLeft: ttl,
        };
      }),
    );
    return { ok: true, count: work.length, work };
  });

  // The runners' whole-queue snapshot (ADR-0018). Shape is BYTE-COMPATIBLE
  // with fg-common's fetch_open_issues() so every downstream jq filter
  // (rework_issues, issues_with_status, pick_available) works unchanged —
  // update both together. Served only while the mirror is demonstrably
  // fresh: the reconciling sync must have completed within
  // SNAPSHOT_STALE_FACTOR sync intervals, otherwise 503 and the runner
  // falls back to its direct GitHub read. Webhooks alone are NOT enough
  // here — without a completed backfill sync the mirror may be missing
  // issues entirely, and an incomplete snapshot would silently hide work.
  app.get("/api/v1/issues/open", async (req, reply) => {
    if (!limiter.allow(req.ip)) return reply.code(429).send({ ok: false, error: "slow down" });
    const sync = await orch.db
      .collection<{ lastIncrementalAt?: string }>("sync_state")
      .findOne({ _id: "sync" } as never);
    const staleMs = config.syncIntervalSeconds * SNAPSHOT_STALE_FACTOR * 1000;
    const last = sync?.lastIncrementalAt ? Date.parse(sync.lastIncrementalAt) : NaN;
    if (!Number.isFinite(last) || Date.now() - last > staleMs) {
      return reply.code(503).send({ ok: false, error: "mirror stale — use the direct GitHub read" });
    }
    const open = await orch.db
      .collection<{ number: number; createdAt: string; labels: string[]; assignees: string[] }>("issues")
      .find({ state: "open" }, { projection: { number: 1, createdAt: 1, labels: 1, assignees: 1 } })
      .toArray();
    return {
      ok: true,
      generatedAt: sync?.lastIncrementalAt,
      issues: open.map((i) => ({
        number: i.number,
        createdAt: i.createdAt,
        labels: (i.labels ?? []).map((name) => ({ name })),
        assignees: (i.assignees ?? []).map((login) => ({ login })),
      })),
    };
  });
}
