/**
 * /ws/agent — the worker-facing socket. Protocol: the client sends `hello`
 * within 10s of connecting, then `heartbeat` / `task` / `log` messages.
 * Identity is assumed-trust for now (auth is parked per the decision on #398);
 * the transport is designed so a challenge step can slot in after `hello`.
 */
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { WebSocket } from "ws";
import { config } from "./config.js";
import { roughLocate } from "./geo.js";
import { originAllowed, RateLimiter } from "./guards.js";
import { agentMessageSchema } from "./protocol.js";
import { redactLines } from "./redact.js";
import type { FleetStore } from "./state.js";

const HELLO_TIMEOUT_MS = 10_000;
const PING_INTERVAL_MS = 25_000;

export function registerAgentSocket(app: FastifyInstance, store: FleetStore): void {
  app.get("/ws/agent", { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
    if (!originAllowed(req)) {
      socket.close(4403, "origin not allowed");
      return;
    }
    let agentId: string | null = null;
    let alive = true;
    const limiter = new RateLimiter();

    const helloTimer = setTimeout(() => {
      if (!agentId) socket.close(4000, "no hello");
    }, HELLO_TIMEOUT_MS);

    const pinger = setInterval(() => {
      if (!alive) {
        socket.terminate();
        return;
      }
      alive = false;
      socket.ping();
    }, PING_INTERVAL_MS);

    socket.on("pong", () => {
      alive = true;
      if (agentId) store.touchAgent(agentId);
    });

    socket.on("message", (data, isBinary) => {
      if (isBinary || !limiter.allow()) return;
      const raw = data.toString();
      if (raw.length > config.maxMessageBytes) return;

      let msg;
      try {
        msg = agentMessageSchema.parse(JSON.parse(raw));
      } catch {
        socket.send(JSON.stringify({ type: "error", error: "invalid message" }));
        return;
      }
      alive = true;

      switch (msg.type) {
        case "hello": {
          // City-level only; req.ip is read once here and never stored (#398).
          const location = config.watcherGeo ? roughLocate(req.ip) : null;
          const id = store.upsertAgent(msg, "ws", agentId ?? undefined, location);
          if (!id) {
            socket.send(JSON.stringify({ type: "error", error: "fleet full" }));
            socket.close(1013, "fleet full");
            return;
          }
          agentId = id;
          clearTimeout(helloTimer);
          socket.send(JSON.stringify({ type: "welcome", agentId }));
          break;
        }
        case "heartbeat": {
          if (!agentId) return;
          const { type: _type, ...hb } = msg;
          store.applyHeartbeat(agentId, hb);
          break;
        }
        case "task": {
          if (agentId) store.updateTask(agentId, msg.task);
          break;
        }
        case "log": {
          if (!agentId) return;
          if (!config.allowLogStream) {
            socket.send(JSON.stringify({ type: "error", error: "log streaming disabled on this server" }));
            return;
          }
          const rec = store.getAgent(agentId);
          if (rec) store.appendLogs(agentId, rec.handle, redactLines(msg.lines));
          store.touchAgent(agentId);
          break;
        }
        case "bye": {
          if (agentId) store.markAgentOffline(agentId, "disconnected");
          agentId = null;
          socket.close(1000, "bye");
          break;
        }
      }
    });

    socket.on("close", () => {
      clearTimeout(helloTimer);
      clearInterval(pinger);
      if (agentId) store.markAgentOffline(agentId, "disconnected");
    });

    socket.on("error", () => socket.terminate());
  });
}
