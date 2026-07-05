/**
 * /ws/watch — the dashboard-facing socket. On connect the watcher gets a full
 * snapshot, then live deltas as the store changes, plus a periodic `fleet`
 * tick so the TPS gauge moves even between agent heartbeats.
 *
 * Watchers are presence too: we resolve a rough city-level location from the
 * connecting IP (offline lookup), then the IP is discarded — it is never
 * stored, logged, or sent to any client.
 */
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { WebSocket } from "ws";
import { config } from "./config.js";
import { describeLocation, roughLocate } from "./geo.js";
import { originAllowed } from "./guards.js";
import type { ServerMessage } from "./protocol.js";
import type { FleetStore } from "./state.js";

const PING_INTERVAL_MS = 25_000;
const FLEET_TICK_MS = 2_000;

export function registerWatchSocket(app: FastifyInstance, store: FleetStore): void {
  const sockets = new Set<WebSocket>();

  const fanout = (msg: ServerMessage) => {
    if (msg.type === "log" && !config.broadcastLogs) return;
    const payload = JSON.stringify(msg);
    for (const socket of sockets) {
      if (socket.readyState === socket.OPEN) socket.send(payload);
    }
  };
  store.on("message", fanout);

  // Periodic fleet tick: keeps the TPS gauge sliding down as buckets age out,
  // not just jumping on heartbeats.
  const ticker = setInterval(() => {
    if (sockets.size > 0) fanout({ type: "fleet", fleet: store.fleetMetrics() });
  }, FLEET_TICK_MS);

  app.addHook("onClose", () => {
    clearInterval(ticker);
    store.off("message", fanout);
  });

  app.get("/ws/watch", { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
    if (!originAllowed(req)) {
      socket.close(4403, "origin not allowed");
      return;
    }
    // req.ip honours X-Forwarded-For when trustProxy is on. Used once, here,
    // for the rough lookup — never retained.
    const location = config.watcherGeo ? roughLocate(req.ip) : null;
    const watcher = store.addWatcher(location);
    sockets.add(socket);

    // Ephemeral: watcher joins are fun live but would crowd real fleet events
    // out of the capped, persisted feed.
    if (location?.city || location?.country) {
      store.ephemeralEvent("watcher_joined", `someone from ${describeLocation(location)} is watching`, {});
    }

    socket.send(JSON.stringify({ type: "snapshot", state: store.snapshot() } satisfies ServerMessage));

    let alive = true;
    const cleanupWatcher = () => {
      clearInterval(pinger);
      sockets.delete(socket);
      store.removeWatcher(watcher.id);
    };

    const pinger = setInterval(() => {
      if (!alive) {
        cleanupWatcher();
        socket.terminate();
        return;
      }
      alive = false;
      socket.ping();
    }, PING_INTERVAL_MS);

    socket.on("pong", () => {
      alive = true;
      store.touchWatcher(watcher.id);
    });

    socket.on("message", (data, isBinary) => {
      alive = true;
      store.touchWatcher(watcher.id);
      // Watchers are read-only; the only accepted message is a keepalive ping.
      if (!isBinary && data.toString().includes('"ping"')) {
        socket.send(JSON.stringify({ type: "pong" } satisfies ServerMessage));
      }
    });

    socket.on("close", cleanupWatcher);

    socket.on("error", () => {
      cleanupWatcher();
      socket.terminate();
    });
  });
}
