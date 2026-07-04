/**
 * Live fleet connection — the watcher side of the fleet server (issue #398).
 *
 * Types here MIRROR server/src/protocol.ts (server -> watcher direction);
 * update both together. The dashboard degrades gracefully: no server
 * configured or reachable -> the Live page falls back to the GitHub snapshot
 * feed exactly as before.
 */
import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Protocol mirror

export interface TaskInfo {
  kind: "work" | "review" | "frame" | "synth" | "idle";
  ref?: string;
  title?: string;
}

export interface SessionCounters {
  tokensIn: number;
  tokensOut: number;
  toolCalls: number;
  tools: Record<string, number>;
  fetchesOk: number;
  fetchesError: number;
  skills: Record<string, number>;
  errors: number;
  tasksCompleted: number;
  prsOpened: number;
  reviewsCompleted: number;
}

export interface AgentPresence {
  id: string;
  handle: string;
  harness: string;
  model: string;
  transport: "ws" | "http";
  connectedAt: string;
  lastSeen: string;
  task: TaskInfo | null;
  session: SessionCounters;
  tps: number;
  lastTps: number;
  lastTpsAt: string | null;
}

export interface RoughLocation {
  city?: string;
  country?: string;
  lat?: number;
  lon?: number;
}

export interface WatcherSummary {
  count: number;
  locations: Array<RoughLocation & { id: string; connectedAt: string }>;
}

export interface FleetMetrics {
  tps: number;
  lastTps: number;
  lastTpsAt: string | null;
  tpsByModel: Record<string, number>;
  tpsByHarness: Record<string, number>;
  activeAgents: number;
  watcherCount: number;
  totals: SessionCounters;
  serverTime: string;
}

export interface EventItem {
  id: string;
  at: string;
  kind:
    | "agent_online"
    | "agent_offline"
    | "task_started"
    | "pr_opened"
    | "review_done"
    | "task_done"
    | "watcher_joined";
  text: string;
  handle?: string;
  harness?: string;
  ref?: string;
}

export interface FleetSnapshot {
  agents: AgentPresence[];
  watchers: WatcherSummary;
  fleet: FleetMetrics;
  events: EventItem[];
}

type ServerMessage =
  | { type: "snapshot"; state: FleetSnapshot }
  | { type: "agents"; agents: AgentPresence[] }
  | { type: "fleet"; fleet: FleetMetrics }
  | { type: "watchers"; watchers: WatcherSummary }
  | { type: "event"; event: EventItem }
  | { type: "log"; agentId: string; handle: string; lines: string[] }
  | { type: "pong" };

// ---------------------------------------------------------------------------
// Server URL resolution

/** Where's the fleet server? Priority: localStorage override (lets anyone
 *  point the deployed site at a server) -> build-time env -> localhost in dev.
 *  null = not configured; the page runs GitHub-feed-only. */
export function liveServerUrl(): string | null {
  let fromStorage: string | null = null;
  try {
    fromStorage = localStorage.getItem("forgood.liveServer");
  } catch {
    /* storage blocked */
  }
  const fromEnv = import.meta.env.VITE_LIVE_SERVER_URL as string | undefined;
  const url = fromStorage || fromEnv || (import.meta.env.DEV ? "http://localhost:8787" : null);
  return url ? url.replace(/\/+$/, "") : null;
}

function toWsUrl(httpUrl: string): string {
  return httpUrl.replace(/^http/, "ws") + "/ws/watch";
}

// ---------------------------------------------------------------------------
// The hook

export type LiveStatus = "unconfigured" | "connecting" | "online" | "offline";

export interface TpsPoint {
  t: number;
  tps: number;
  byHarness: Record<string, number>;
}

export interface HistoryTotals {
  tokensIn: number;
  tokensOut: number;
  toolCalls: number;
  tasksCompleted: number;
  prsOpened: number;
  reviewsCompleted: number;
  samples: number;
  firstAt: string | null;
  lastAt: string | null;
}

export interface LiveFleet {
  status: LiveStatus;
  agents: AgentPresence[];
  fleet: FleetMetrics | null;
  watchers: WatcherSummary;
  events: EventItem[];
  /** Fleet TPS over time, one point per server tick (~2s), for the pulse chart. */
  tpsHistory: TpsPoint[];
  /** Durable TPS buckets from the history DB, survives refresh/restart. */
  historicalTps: TpsPoint[];
  historyTotals: HistoryTotals | null;
  /** Short per-agent TPS trails for the card sparklines. */
  agentTrails: Record<string, number[]>;
}

const MAX_TPS_POINTS = 90; // ~3 minutes of 2s ticks
const MAX_TRAIL_POINTS = 30;
const MAX_EVENTS = 100;
const RECONNECT_BASE_MS = 2000;
const RECONNECT_MAX_MS = 30_000;

const EMPTY: LiveFleet = {
  status: "unconfigured",
  agents: [],
  fleet: null,
  watchers: { count: 0, locations: [] },
  events: [],
  tpsHistory: [],
  historicalTps: [],
  historyTotals: null,
  agentTrails: {},
};

export function useLiveFleet(): LiveFleet {
  const [state, setState] = useState<LiveFleet>(EMPTY);
  const attempts = useRef(0);

  useEffect(() => {
    const base = liveServerUrl();
    if (!base) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${base}/api/v1/history/tps?minutes=1440&bucketSeconds=60`);
        if (!res.ok) return;
        const json = (await res.json()) as {
          buckets?: Array<{ at: string; tps: number; byHarness?: Record<string, number> }>;
          totals?: HistoryTotals | null;
        };
        const historicalTps = (json.buckets ?? []).map((b) => ({
          t: new Date(b.at).getTime(),
          tps: b.tps,
          byHarness: b.byHarness ?? {},
        }));
        setState((prev) => ({ ...prev, historicalTps, historyTotals: json.totals ?? null }));
      } catch {
        /* history is optional */
      }
    };

    const apply = (msg: ServerMessage) => {
      setState((prev) => {
        switch (msg.type) {
          case "snapshot": {
            const trails: Record<string, number[]> = {};
            for (const a of msg.state.agents) trails[a.id] = [a.tps];
            return {
              ...prev,
              status: "online",
              agents: msg.state.agents,
              fleet: msg.state.fleet,
              watchers: msg.state.watchers,
              events: msg.state.events.slice(0, MAX_EVENTS),
              agentTrails: trails,
            };
          }
          case "agents": {
            const trails = { ...prev.agentTrails };
            for (const a of msg.agents) {
              trails[a.id] = [...(trails[a.id] ?? []), a.tps].slice(-MAX_TRAIL_POINTS);
            }
            for (const id of Object.keys(trails)) {
              if (!msg.agents.some((a) => a.id === id)) delete trails[id];
            }
            return { ...prev, agents: msg.agents, agentTrails: trails };
          }
          case "fleet": {
            const point: TpsPoint = {
              t: new Date(msg.fleet.serverTime).getTime(),
              tps: msg.fleet.tps,
              byHarness: msg.fleet.tpsByHarness,
            };
            return {
              ...prev,
              fleet: msg.fleet,
              tpsHistory: [...prev.tpsHistory, point].slice(-MAX_TPS_POINTS),
            };
          }
          case "watchers":
            return { ...prev, watchers: msg.watchers };
          case "event":
            return { ...prev, events: [msg.event, ...prev.events].slice(0, MAX_EVENTS) };
          default:
            return prev;
        }
      });
    };

    const connect = () => {
      if (closed) return;
      setState((prev) => ({ ...prev, status: attempts.current === 0 ? "connecting" : prev.status }));
      try {
        ws = new WebSocket(toWsUrl(base));
      } catch {
        scheduleReconnect();
        return;
      }
      ws.onopen = () => {
        attempts.current = 0;
      };
      ws.onmessage = (e) => {
        try {
          apply(JSON.parse(e.data as string) as ServerMessage);
        } catch {
          /* ignore malformed frame */
        }
      };
      ws.onclose = () => {
        if (closed) return;
        setState((prev) => ({ ...prev, status: "offline" }));
        scheduleReconnect();
      };
      ws.onerror = () => ws?.close();
    };

    const scheduleReconnect = () => {
      attempts.current += 1;
      const delay = Math.min(RECONNECT_BASE_MS * 2 ** Math.min(attempts.current, 4), RECONNECT_MAX_MS);
      reconnectTimer = setTimeout(connect, delay);
    };

    connect();
    void fetchHistory();
    const historyTimer = setInterval(() => void fetchHistory(), 30_000);
    return () => {
      closed = true;
      clearInterval(historyTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []);

  return state;
}

// ---------------------------------------------------------------------------
// Formatting helpers for the live views

export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return `${Math.round(n * 10) / 10}`;
}
