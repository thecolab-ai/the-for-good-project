/**
 * Wire protocol for the fleet server (#398, Phase 1 — telemetry + presence).
 *
 * Two kinds of client:
 *  - AGENTS (autopilot workers) connect to /ws/agent — or POST to
 *    /api/v1/telemetry from plain bash — and stream heartbeats: counts and
 *    rates, never content (except the opt-in, redacted log stream).
 *  - WATCHERS (dashboard viewers) connect to /ws/watch and receive a snapshot
 *    followed by live updates. Watchers are presence too: we take a rough
 *    city-level location from their IP, then discard the IP. The IP is never
 *    stored and never sent to anyone.
 *
 * The web dashboard keeps a mirror of the server->watcher types in
 * web/src/lib/live.ts — update both together.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared shapes

export const HARNESSES = ["claude", "codex", "hermes"] as const;

export const taskInfoSchema = z.object({
  kind: z.enum(["work", "review", "frame", "synth", "idle"]).default("work"),
  /** Issue/PR reference like "#123" — public data only. */
  ref: z.string().max(32).optional(),
  title: z.string().max(300).optional(),
});
export type TaskInfo = z.infer<typeof taskInfoSchema>;

const count = z.number().int().min(0).max(1_000_000_000);
const countMap = z.record(z.string().max(64), count);

// ---------------------------------------------------------------------------
// Agent -> server messages

export const helloSchema = z.object({
  type: z.literal("hello"),
  /** Public GitHub handle. Identity is assumed-trust for now (auth parked). */
  handle: z.string().min(1).max(64),
  harness: z.string().min(1).max(32),
  model: z.string().min(1).max(128),
  task: taskInfoSchema.optional(),
  version: z.string().max(64).optional(),
});
export type Hello = z.infer<typeof helloSchema>;

/**
 * All counters are DELTAS since the previous heartbeat, so workers don't have
 * to track what the server has seen. Counts and rates only — no content.
 */
export const heartbeatSchema = z.object({
  type: z.literal("heartbeat"),
  task: taskInfoSchema.optional(),
  tokensIn: count.optional(),
  tokensOut: count.optional(),
  toolCalls: count.optional(),
  /** Per-tool call counts, e.g. { bash: 3, edit: 1, webfetch: 2 }. */
  tools: countMap.optional(),
  fetchesOk: count.optional(),
  fetchesError: count.optional(),
  /** Per-skill invocation counts (Colab skills). */
  skills: countMap.optional(),
  errors: count.optional(),
  tasksCompleted: count.optional(),
  prsOpened: count.optional(),
  reviewsCompleted: count.optional(),
});
export type Heartbeat = z.infer<typeof heartbeatSchema>;

export const taskUpdateSchema = z.object({
  type: z.literal("task"),
  task: taskInfoSchema,
});

/** Opt-in only (STREAM_LOGS=1 worker-side AND ALLOW_LOG_STREAM=1 server-side).
 *  Redacted before send; the server redacts AGAIN as defence in depth. */
export const logSchema = z.object({
  type: z.literal("log"),
  lines: z.array(z.string().max(2000)).max(50),
});

export const byeSchema = z.object({ type: z.literal("bye") });

export const agentMessageSchema = z.discriminatedUnion("type", [
  helloSchema,
  heartbeatSchema,
  taskUpdateSchema,
  logSchema,
  byeSchema,
]);
export type AgentMessage = z.infer<typeof agentMessageSchema>;

/** HTTP fallback body for curl-based workers: hello fields + optional
 *  heartbeat fields in one POST. `agentId` keeps the session stable across
 *  posts — the server issues one on the first post if omitted. */
export const telemetryPostSchema = z.object({
  agentId: z.string().uuid().optional(),
  handle: z.string().min(1).max(64),
  harness: z.string().min(1).max(32),
  model: z.string().min(1).max(128),
  version: z.string().max(64).optional(),
  task: taskInfoSchema.optional(),
  heartbeat: heartbeatSchema.omit({ type: true }).optional(),
});
export type TelemetryPost = z.infer<typeof telemetryPostSchema>;

// ---------------------------------------------------------------------------
// Server-side state shapes (broadcast to watchers)

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
  /** Current tokens/sec for this agent over the sliding window. */
  tps: number;
}

export interface RoughLocation {
  city?: string;
  region?: string;
  country?: string;
  /** Rounded to ~0.1 degree (≈11 km) — deliberately imprecise. */
  lat?: number;
  lon?: number;
}

export interface WatcherSummary {
  count: number;
  locations: Array<RoughLocation & { id: string; connectedAt: string }>;
}

export interface FleetMetrics {
  /** Fleet-wide tokens/sec over the sliding window. */
  tps: number;
  tpsByModel: Record<string, number>;
  tpsByHarness: Record<string, number>;
  activeAgents: number;
  watcherCount: number;
  totals: SessionCounters;
  serverTime: string;
}

export type EventKind =
  | "agent_online"
  | "agent_offline"
  | "task_started"
  | "pr_opened"
  | "review_done"
  | "task_done"
  | "watcher_joined";

export interface EventItem {
  id: string;
  at: string;
  kind: EventKind;
  /** Human-readable one-liner, safe for public display. */
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

// ---------------------------------------------------------------------------
// Server -> watcher messages

export type ServerMessage =
  | { type: "snapshot"; state: FleetSnapshot }
  | { type: "agents"; agents: AgentPresence[] }
  | { type: "fleet"; fleet: FleetMetrics }
  | { type: "watchers"; watchers: WatcherSummary }
  | { type: "event"; event: EventItem }
  | { type: "log"; agentId: string; handle: string; lines: string[] }
  | { type: "pong" };
