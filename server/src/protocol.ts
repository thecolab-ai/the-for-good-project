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

/** A deliberately-imprecise, self-reported location. The server prefers a
 *  city-level lookup from the connection IP (which it then discards) and only
 *  falls back to this when IP geo fails — e.g. a worker behind localhost/CGNAT
 *  or the fleet simulator. Coordinates only; no addresses. */
export const roughLocationSchema = z.object({
  city: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
});

export const helloSchema = z.object({
  type: z.literal("hello"),
  /** Public GitHub handle. Identity is assumed-trust for now (auth parked). */
  handle: z.string().min(1).max(64),
  harness: z.string().min(1).max(32),
  model: z.string().min(1).max(128),
  task: taskInfoSchema.optional(),
  version: z.string().max(64).optional(),
  /** Optional fallback location (used only if IP geo fails). See schema note. */
  location: roughLocationSchema.optional(),
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
  /** Milliseconds covered by this heartbeat's token delta. Used for real TPS. */
  elapsedMs: z.number().int().min(1).max(86_400_000).optional(),
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

/** HTTP log ingestion for hook-based workers (one-shot processes that can't
 *  hold a WebSocket). Same opt-in gates as the WS `log` message. */
export const logPostSchema = z.object({
  agentId: z.string().uuid(),
  lines: z.array(z.string().max(2000)).min(1).max(50),
});

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
  /** Last non-zero token burst observed for this agent, retained for idle display. */
  lastTps: number;
  lastTpsAt: string | null;
  /** Rough, city-level location for the worldwide globe (IP discarded, ~11km). */
  location?: RoughLocation | null;
}

export interface RoughLocation {
  city?: string;
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
  /** Last non-zero fleet throughput burst, retained so idle dashboards don't look dead. */
  lastTps: number;
  lastTpsAt: string | null;
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
  | "watcher_joined"
  // Orchestration (pull-claim v1) — mirrored in web/src/lib/live.ts:
  | "issue_opened"
  | "issue_closed"
  | "pr_merged"
  | "gh_activity"
  | "claim"
  | "command";

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

export interface LogLine {
  at: string;
  line: string;
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

// ---------------------------------------------------------------------------
// Orchestration (pull-claim v1) — server-arbitrated claims + control plane.

export const COMMAND_KINDS = ["pause", "resume", "stop", "abort"] as const;
export type CommandKind = (typeof COMMAND_KINDS)[number];
export const commandSchema = z.object({
  id: z.string(),
  kind: z.enum(COMMAND_KINDS),
  reason: z.string().max(300).optional(),
  issuedAt: z.string(),
});
export type FleetCommand = z.infer<typeof commandSchema>;

/** TOFU auto-enrollment: a runner's FIRST contact mints its token (no
 *  operator hand-out). `handle` is the runner's self-reported GitHub login —
 *  assumed trust, same as telemetry's `hello.handle`; squatting a handle is
 *  visible in the registry and revocable. Strict GitHub-login shape so an
 *  arbitrary string can never become a registry identity (it flows into
 *  GitHub assignee calls). */
export const enrollRequestSchema = z.object({
  handle: z
    .string()
    .max(39)
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, "not a valid GitHub login"),
  harness: z.string().max(32).optional(),
  model: z.string().max(128).optional(),
});
export type EnrollRequest = z.infer<typeof enrollRequestSchema>;

export const claimRequestSchema = z.object({
  stages: z.array(z.enum(["research", "ideate", "build"])).optional(), // default: all three
  harness: z.string().max(32).optional(),
  model: z.string().max(128).optional(),
  agentId: z.string().uuid().optional(),
});
export type ClaimRequest = z.infer<typeof claimRequestSchema>;

export const releaseRequestSchema = z.object({
  issue: z.number().int().positive(),
  outcome: z.enum(["done", "abandoned"]),
  prNumber: z.number().int().positive().optional(),
});
export type ReleaseRequest = z.infer<typeof releaseRequestSchema>;

export interface ClaimedIssue {
  number: number; title: string; labels: string[]; body: string; htmlUrl: string;
  stage: string | null; stream: string | null;
}
// Server->agent WS message (agents only, not watchers):
//   { type: "command", command: FleetCommand }
// /api/v1/telemetry HTTP response gains optional `commands: FleetCommand[]`.
