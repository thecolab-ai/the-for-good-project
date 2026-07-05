/**
 * For Good fleet server — coordination + telemetry for the worker fleet
 * (issue #398, Phase 1: telemetry in, presence, TPS, watcher presence;
 * pull-claim orchestration when REDIS_URL + MONGO_URL are configured).
 *
 * GitHub stays the durable source of truth. Telemetry remains an OPTIONAL
 * accelerator and orchestration is fail-open: with the stores unconfigured
 * (or unreachable at boot) the server behaves exactly as before, and the
 * orchestration routes answer 503 "orchestration disabled".
 */
import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import websocket from "@fastify/websocket";
import { existsSync } from "node:fs";
import path from "node:path";
import { config } from "./config.js";
import { registerAgentSocket } from "./agent-ws.js";
import { registerWatchSocket } from "./watch-ws.js";
import { registerHttpRoutes } from "./http.js";
import { FleetStore } from "./state.js";
import { HistoryStore } from "./history.js";
import { subscribeAuthPurge } from "./orchestrator/auth.js";
import { connectOrchestrator, type Orchestrator } from "./orchestrator/stores.js";
import { sweepExpiredLeases } from "./orchestrator/dispatch.js";
import { runBootSync, runFullSync, runIncrementalSync } from "./github/sync.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { registerDispatchRoutes } from "./routes/dispatch.js";
import { registerQueueRoutes } from "./routes/queue.js";
import { registerWebhookRoutes } from "./routes/webhooks.js";

const SWEEP_INTERVAL_MS = 10_000;
const LEASE_SWEEP_INTERVAL_MS = 60_000;

/** ±10% jitter so multiple deployments don't sync in lockstep. */
function jittered(baseMs: number): number {
  return Math.round(baseMs * (0.9 + Math.random() * 0.2));
}

/** Self-rescheduling jittered timer that never lets the callback throw out
 *  of the interval. Returns a stop function. */
function every(baseMs: number, run: () => Promise<unknown>, onError: (err: unknown) => void): () => void {
  let timer: NodeJS.Timeout | null = null;
  let stopped = false;
  const schedule = () => {
    timer = setTimeout(() => {
      run()
        .catch(onError)
        .finally(() => {
          if (!stopped) schedule();
        });
    }, jittered(baseMs));
    timer.unref?.();
  };
  schedule();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

/** When orchestration is off, the orchestration paths still exist and say so
 *  (503) rather than 404ing — the fail-open contract runner scripts rely on. */
function registerOrchestrationDisabled(app: FastifyInstance): void {
  const disabled = { ok: false, error: "orchestration disabled" };
  const paths = [
    { method: "POST" as const, url: "/api/v1/agents/enroll" },
    { method: "POST" as const, url: "/api/v1/work/claim" },
    { method: "POST" as const, url: "/api/v1/work/renew" },
    { method: "POST" as const, url: "/api/v1/work/release" },
    { method: "GET" as const, url: "/api/v1/queue" },
    { method: "GET" as const, url: "/api/v1/board" },
  ];
  // Webhook/admin surfaces stay 404 unless their secrets are configured —
  // matching the enabled-path behaviour where unset secret = route absent.
  if (config.webhookSecret) paths.push({ method: "POST" as const, url: "/api/v1/webhooks/github" });
  if (config.adminToken) {
    paths.push(
      { method: "POST" as const, url: "/api/v1/admin/agents" },
      { method: "POST" as const, url: "/api/v1/admin/agents/revoke" },
      { method: "GET" as const, url: "/api/v1/admin/agents" },
      { method: "POST" as const, url: "/api/v1/admin/commands" },
      { method: "GET" as const, url: "/api/v1/admin/assignments" },
      { method: "POST" as const, url: "/api/v1/admin/lease/release" },
      { method: "POST" as const, url: "/api/v1/admin/sync" },
    );
  }
  for (const { method, url } of paths) {
    app.route({ method, url, handler: async (_req, reply) => reply.code(503).send(disabled) });
  }
}

async function main(): Promise<void> {
  const history = config.historyDbFile ? new HistoryStore(config.historyDbFile) : undefined;
  const store = new FleetStore(config.stateFile, history);

  const app = Fastify({
    // The privacy contract says client IPs are NEVER logged — Fastify's
    // default request serializer would emit remoteAddress (the real viewer IP
    // once trustProxy resolves X-Forwarded-For), so scrub request logs down
    // to method + url and log nothing per-response.
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      serializers: {
        req: (req) => ({ method: req.method, url: req.url }),
      },
    },
    disableRequestLogging: true,
    trustProxy: config.trustProxy,
    bodyLimit: config.maxMessageBytes,
  });

  // Belt-and-braces error redaction: no route may leak an internal error
  // message (upstream API paths, driver errors) in a 5xx body — log it
  // server-side and answer generically. 4xx (validation, body limits) keep
  // their messages: those describe the CLIENT's request, not our internals.
  app.setErrorHandler((err: unknown, req, reply) => {
    const e = err as { statusCode?: unknown; message?: unknown };
    const status = typeof e.statusCode === "number" ? e.statusCode : 500;
    if (status >= 500) {
      req.log.error({ err }, "request failed");
      return reply.code(500).send({ ok: false, error: "internal error" });
    }
    const message = typeof e.message === "string" ? e.message : "request failed";
    return reply.code(status).send({ ok: false, error: message });
  });

  await app.register(cors, {
    origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",").map((s) => s.trim()),
  });
  await app.register(websocket, {
    options: { maxPayload: config.maxMessageBytes },
  });

  // Orchestration stores — fail-open: configured-but-unreachable logs an
  // error and boots telemetry-only rather than crashing the server.
  let orch: Orchestrator | undefined;
  try {
    orch = await connectOrchestrator();
  } catch (err) {
    app.log.error({ err }, "orchestration stores unreachable — continuing without orchestration");
  }

  // Out-of-process revokes (fleet-admin.mjs) publish here so a compromised
  // token dies NOW, not after the verify cache's 30s TTL.
  let stopAuthPurge: (() => void) | undefined;
  if (orch) {
    stopAuthPurge = await subscribeAuthPurge(orch).catch((err) => {
      app.log.warn({ err }, "auth purge subscription failed — CLI revokes take up to 30s locally");
      return undefined;
    });
  }

  registerHttpRoutes(app, store, orch);
  registerAgentSocket(app, store, orch);
  registerWatchSocket(app, store);

  if (orch) {
    registerDispatchRoutes(app, store, orch);
    registerQueueRoutes(app, store, orch);
    if (config.webhookSecret) registerWebhookRoutes(app, store, orch);
    if (config.adminToken) registerAdminRoutes(app, store, orch);
  } else {
    registerOrchestrationDisabled(app);
  }

  // Optionally host the built web dashboard on the same origin, so one URL
  // (e.g. https://forgood.thecolab.ai) is both the site and the telemetry
  // endpoint. The dashboard is a client-routed SPA: unknown GET paths outside
  // the API/WS surface fall back to index.html; API 404s stay JSON.
  if (config.staticDir) {
    const root = path.resolve(config.staticDir);
    const indexHtml = path.join(root, "index.html");
    if (!existsSync(indexHtml)) {
      app.log.warn({ staticDir: root }, "STATIC_DIR has no index.html — serving API only");
    } else {
      await app.register(fastifyStatic, { root });
      app.setNotFoundHandler((req, reply) => {
        const url = req.raw.url ?? "";
        if (req.method === "GET" && !url.startsWith("/api/") && !url.startsWith("/ws/")) {
          return reply.type("text/html").sendFile("index.html");
        }
        return reply.code(404).send({ ok: false, error: "not found" });
      });
      app.log.info({ staticDir: root }, "serving web dashboard");
    }
  }

  const sweeper = setInterval(() => {
    store.sweepAgents();
    store.sweepWatchers();
  }, SWEEP_INTERVAL_MS);

  const saver = config.stateFile ? setInterval(() => store.save(), config.stateSaveSeconds * 1000) : null;

  // Orchestration timers. The lease sweeper runs whenever the stores are up
  // (it only needs Redis+Mongo, and handles a missing GitHub token itself);
  // the mirror sync jobs additionally need the GitHub client.
  const orchTimers: Array<() => void> = [];
  if (orch) {
    const o = orch;
    orchTimers.push(
      every(LEASE_SWEEP_INTERVAL_MS, () => sweepExpiredLeases(o, store), (err) =>
        app.log.warn({ err }, "lease sweep failed"),
      ),
    );
    if (o.gh) {
      // Boot sync (full when the mirror is empty) — fire and forget.
      runBootSync(o).catch((err) => app.log.warn({ err }, "boot sync failed"));
      orchTimers.push(
        every(config.syncIntervalSeconds * 1000, () => runIncrementalSync(o), (err) =>
          app.log.warn({ err }, "incremental sync failed"),
        ),
        every(config.syncFullIntervalSeconds * 1000, () => runFullSync(o), (err) =>
          app.log.warn({ err }, "full sync failed"),
        ),
      );
    } else {
      app.log.warn("orchestration up without GITHUB_TOKEN — mirror sync + claims disabled");
    }
  }

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, "shutting down");
    clearInterval(sweeper);
    if (saver) clearInterval(saver);
    for (const stop of orchTimers) stop();
    stopAuthPurge?.();
    store.save();
    store.close();
    await app.close();
    await orch?.close().catch(() => undefined);
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  await app.listen({ port: config.port, host: config.host });
  app.log.info(
    {
      logStream: config.allowLogStream,
      broadcastLogs: config.broadcastLogs,
      watcherGeo: config.watcherGeo,
      historyDb: Boolean(config.historyDbFile),
      orchestration: Boolean(orch),
      github: Boolean(orch?.gh),
      webhooks: Boolean(orch && config.webhookSecret),
      admin: Boolean(orch && config.adminToken),
    },
    "fleet server up",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
