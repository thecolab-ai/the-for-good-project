/**
 * For Good fleet server — coordination + telemetry for the worker fleet
 * (issue #398, Phase 1: telemetry in, presence, TPS, watcher presence).
 *
 * Deliberately an OPTIONAL accelerator: GitHub stays the source of truth and
 * autopilot degrades gracefully to the pull model when this server is absent.
 */
import Fastify from "fastify";
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

const SWEEP_INTERVAL_MS = 10_000;

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

  await app.register(cors, {
    origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",").map((s) => s.trim()),
  });
  await app.register(websocket, {
    options: { maxPayload: config.maxMessageBytes },
  });

  registerHttpRoutes(app, store);
  registerAgentSocket(app, store);
  registerWatchSocket(app, store);

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

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, "shutting down");
    clearInterval(sweeper);
    if (saver) clearInterval(saver);
    store.save();
    store.close();
    await app.close();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  await app.listen({ port: config.port, host: config.host });
  app.log.info(
    { logStream: config.allowLogStream, broadcastLogs: config.broadcastLogs, watcherGeo: config.watcherGeo, historyDb: Boolean(config.historyDbFile) },
    "fleet server up",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
