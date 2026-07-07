/**
 * In-memory fleet state. GitHub remains the durable source of truth for work
 * (issues/PRs/labels) — everything here is ephemeral telemetry: presence with
 * TTLs, a sliding window of token buckets for the TPS gauge, and a capped
 * event feed. Presence rebuilds itself from heartbeats within seconds of a
 * restart, so a database would add ops weight for nothing (#398: "keep it
 * small and stateless where possible — GitHub holds state").
 *
 * The only state worth keeping across restarts — lifetime totals and the
 * event feed — is optionally snapshotted to STATE_FILE. If the fleet ever
 * outgrows one server process, swap this class for a shared-store
 * implementation behind the same interface; nothing else needs to change.
 */
import { EventEmitter } from "node:events";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { config } from "./config.js";
import type { HistoryStore } from "./history.js";
import type {
  AgentPresence,
  EventItem,
  EventKind,
  FleetMetrics,
  FleetSnapshot,
  Heartbeat,
  Hello,
  LogLine,
  RoughLocation,
  ServerMessage,
  SessionCounters,
  TaskInfo,
  WatcherSummary,
} from "./protocol.js";

function emptyCounters(): SessionCounters {
  return {
    tokensIn: 0,
    tokensOut: 0,
    toolCalls: 0,
    tools: {},
    fetchesOk: 0,
    fetchesError: 0,
    skills: {},
    errors: 0,
    tasksCompleted: 0,
    prsOpened: 0,
    reviewsCompleted: 0,
  };
}

/** Stored agent record = broadcast presence + a rolling token trail used to
 *  compute the agent's own tokens/sec, + the expiry deadline. */
interface AgentRecord extends Omit<AgentPresence, "tps"> {
  recent: Array<{ t: number; tokens: number; elapsedMs: number }>;
  expiresAt: number;
}

interface WatcherRecord {
  id: string;
  connectedAt: string;
  location: RoughLocation | null;
  expiresAt: number;
}

interface PersistedState {
  totals: SessionCounters;
  events: EventItem[];
  lastTps?: number;
  lastTpsAt?: string | null;
}

/** Deterministic v5-style UUID from a stable seed (handle + the client's own
 *  session id). Concurrent first-contact posts from ONE logical session all
 *  hash to the SAME id, so they upsert one record instead of each minting a
 *  fresh random UUID — the session-start race that duplicated the same worker
 *  on the same task all over /live (#398). Valid UUID shape, so it satisfies
 *  the same schema as a minted id (logs/response echo). */
export function sessionAgentId(handle: string, session: string): string {
  const h = createHash("sha1").update(`fleet-agent\n${handle}\n${session}`).digest();
  const b = h.subarray(0, 16);
  b[6] = ((b[6] ?? 0) & 0x0f) | 0x50; // version 5
  b[8] = ((b[8] ?? 0) & 0x3f) | 0x80; // RFC 4122 variant
  const hex = b.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function sampleTps(tokens: number, elapsedMs: number): number {
  if (tokens <= 0 || elapsedMs <= 0) return 0;
  return Math.round((tokens / (elapsedMs / 1000)) * 10) / 10;
}

function aggregateTps(tokens: number, elapsedMs: number): number {
  return sampleTps(tokens, elapsedMs);
}

function agentTps(rec: AgentRecord, now: number): number {
  const windowMs = config.tpsWindowSeconds * 1000;
  const recent = rec.recent.filter((p) => now - p.t <= windowMs);
  const tokens = recent.reduce((s, p) => s + p.tokens, 0);
  const elapsedMs = recent.reduce((s, p) => s + p.elapsedMs, 0);
  return aggregateTps(tokens, elapsedMs);
}

function toPresence(rec: AgentRecord, now: number): AgentPresence {
  const { recent: _recent, expiresAt: _expiresAt, ...presence } = rec;
  return { ...presence, tps: agentTps(rec, now) };
}

/** Emits "message" with a ServerMessage whenever watchers should hear about a
 *  change — the watch hub subscribes and fans out to its sockets. */
export class FleetStore extends EventEmitter {
  private readonly agents = new Map<string, AgentRecord>();
  private readonly watchers = new Map<string, WatcherRecord>();
  private readonly logs = new Map<string, LogLine[]>();
  private totals: SessionCounters = emptyCounters();
  private events: EventItem[] = [];
  private lastTps = 0;
  private lastTpsAt: string | null = null;
  private dirty = false;
  private agentsFlushTimer: NodeJS.Timeout | null = null;

  constructor(private readonly stateFile?: string, private readonly history?: HistoryStore) {
    super();
    this.setMaxListeners(0);
    if (stateFile) this.load(stateFile);
    this.history?.setTotals(this.totals);
  }

  private publish(msg: ServerMessage): void {
    this.emit("message", msg);
  }

  // -------------------------------------------------------------- agents

  /** Returns null when the fleet is at maxAgents and this would be a NEW
   *  agent — presence is unauthenticated until auth lands, so allocation from
   *  a flood of hellos has to be bounded. */
  upsertAgent(hello: Hello, transport: "ws" | "http", id?: string, location?: RoughLocation | null): string | null {
    const agentId = id ?? randomUUID();
    const existing = this.agents.get(agentId);
    if (!existing && this.agents.size >= config.maxAgents) return null;
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    // Prefer the IP-derived location (already discarded by the caller); fall
    // back to a self-reported one only when IP geo failed (localhost / sim).
    const resolvedLocation = location ?? hello.location ?? null;
    const rec: AgentRecord = existing ?? {
      id: agentId,
      handle: hello.handle,
      harness: hello.harness,
      model: hello.model,
      transport,
      connectedAt: nowIso,
      lastSeen: nowIso,
      task: hello.task ?? null,
      taskSince: hello.task ? nowIso : null,
      session: emptyCounters(),
      lastTps: 0,
      lastTpsAt: null,
      location: resolvedLocation,
      recent: [],
      expiresAt: 0,
    };
    rec.handle = hello.handle;
    rec.harness = hello.harness;
    rec.model = hello.model;
    rec.lastSeen = nowIso;
    rec.expiresAt = now + config.agentTtlSeconds * 1000;
    if (resolvedLocation) rec.location = resolvedLocation;
    if (hello.task) {
      if (hello.task.ref !== rec.task?.ref || hello.task.kind !== rec.task?.kind) rec.taskSince = nowIso;
      rec.task = hello.task;
    }
    this.agents.set(agentId, rec);
    if (!existing) {
      this.addEvent("agent_online", `@${hello.handle} came online (${hello.harness} · ${hello.model})`, {
        handle: hello.handle,
        harness: hello.harness,
      });
      if (hello.task && (hello.task.ref || hello.task.title)) this.emitTaskEvent(rec, hello.task);
    }
    this.publishAgents();
    return agentId;
  }

  getAgent(id: string): AgentRecord | undefined {
    return this.agents.get(id);
  }

  applyHeartbeat(id: string, hb: Omit<Heartbeat, "type">): AgentRecord | null {
    const rec = this.agents.get(id);
    if (!rec) return null;
    const now = Date.now();
    rec.lastSeen = new Date(now).toISOString();
    rec.expiresAt = now + config.agentTtlSeconds * 1000;

    const s = rec.session;
    s.tokensIn += hb.tokensIn ?? 0;
    s.tokensOut += hb.tokensOut ?? 0;
    s.toolCalls += hb.toolCalls ?? 0;
    s.fetchesOk += hb.fetchesOk ?? 0;
    s.fetchesError += hb.fetchesError ?? 0;
    s.errors += hb.errors ?? 0;
    s.tasksCompleted += hb.tasksCompleted ?? 0;
    s.prsOpened += hb.prsOpened ?? 0;
    s.reviewsCompleted += hb.reviewsCompleted ?? 0;
    for (const [tool, n] of Object.entries(hb.tools ?? {})) s.tools[tool] = (s.tools[tool] ?? 0) + n;
    for (const [skill, n] of Object.entries(hb.skills ?? {})) s.skills[skill] = (s.skills[skill] ?? 0) + n;

    // The TPS gauge measures GENERATION speed — output tokens only. Counting
    // input too made the gauge read thousands of tok/s whenever a worker
    // ingested big files/tool output, which nobody reads as "speed". Totals
    // still track both directions.
    const tokens = hb.tokensOut ?? 0;
    const elapsedMs = Math.max(1, hb.elapsedMs ?? config.tpsWindowSeconds * 1000);
    const windowMs = config.tpsWindowSeconds * 1000;
    rec.recent = rec.recent.filter((p) => now - p.t <= windowMs);
    if (tokens > 0) rec.recent.push({ t: now, tokens, elapsedMs });

    if (hb.task) {
      const changed = hb.task.ref !== rec.task?.ref || hb.task.kind !== rec.task?.kind;
      if (changed) rec.taskSince = new Date(now).toISOString();
      rec.task = hb.task;
      if (changed && (hb.task.ref || hb.task.title)) this.emitTaskEvent(rec, hb.task);
    }

    this.recordThroughput(rec, hb, tokens);
    this.history?.record({ agentId: id, handle: rec.handle, harness: rec.harness, model: rec.model, task: rec.task, heartbeat: hb });
    this.emitMilestones(rec, hb);
    this.publishAgents();
    return rec;
  }

  updateTask(id: string, task: TaskInfo): void {
    const rec = this.agents.get(id);
    if (!rec) return;
    const changed = task.ref !== rec.task?.ref || task.kind !== rec.task?.kind;
    if (changed) rec.taskSince = new Date().toISOString();
    rec.task = task;
    rec.lastSeen = new Date().toISOString();
    rec.expiresAt = Date.now() + config.agentTtlSeconds * 1000;
    if (changed && (task.ref || task.title)) this.emitTaskEvent(rec, task);
    this.publishAgents();
  }

  /** Any inbound traffic from a live socket counts as a sign of life. */
  touchAgent(id: string): void {
    const rec = this.agents.get(id);
    if (rec) rec.expiresAt = Date.now() + config.agentTtlSeconds * 1000;
  }

  private emitTaskEvent(rec: AgentRecord, task: TaskInfo): void {
    if (task.kind === "idle") return;
    const verb =
      task.kind === "review" ? "reviewing" : task.kind === "frame" ? "framing" : task.kind === "synth" ? "synthesising" : "working on";
    const what = [task.ref, task.title].filter(Boolean).join(" — ");
    this.addEvent("task_started", `@${rec.handle} started ${verb} ${what}`.trim(), {
      handle: rec.handle,
      harness: rec.harness,
      ref: task.ref,
    });
  }

  private emitMilestones(rec: AgentRecord, hb: Omit<Heartbeat, "type">): void {
    const meta = { handle: rec.handle, harness: rec.harness, ref: rec.task?.ref };
    if (hb.prsOpened) this.addEvent("pr_opened", `@${rec.handle} opened a PR${rec.task?.ref ? ` for ${rec.task.ref}` : ""}`, meta);
    if (hb.reviewsCompleted) this.addEvent("review_done", `@${rec.handle} completed a review${rec.task?.ref ? ` on ${rec.task.ref}` : ""}`, meta);
    if (hb.tasksCompleted) this.addEvent("task_done", `@${rec.handle} finished a task${rec.task?.ref ? ` (${rec.task.ref})` : ""}`, meta);
  }

  markAgentOffline(id: string, reason: "disconnected" | "timed out"): void {
    const rec = this.agents.get(id);
    if (!rec) return;
    this.agents.delete(id);
    this.addEvent("agent_offline", `@${rec.handle} went offline (${reason})`, {
      handle: rec.handle,
      harness: rec.harness,
    });
    this.publishAgents();
  }

  /** Reap agents whose TTL expired (HTTP workers that stopped posting, or WS
   *  drops we never saw). */
  sweepAgents(): void {
    const now = Date.now();
    for (const [id, rec] of this.agents) {
      if (rec.expiresAt < now) this.markAgentOffline(id, "timed out");
    }
  }

  listAgents(): AgentPresence[] {
    const now = Date.now();
    return [...this.agents.values()]
      .map((rec) => toPresence(rec, now))
      .sort((a, b) => a.connectedAt.localeCompare(b.connectedAt));
  }

  /** Is any live agent connected under this GitHub handle? Rework dispatch
   *  (ADR-0020) uses this to skip a PR whose AUTHOR is currently online — an
   *  online author is presumed to be working (or about to work) their own
   *  rework, so adoption targets the absent author the bottleneck is about.
   *  "Live" = present in the agents map and not past its TTL (sweepAgents runs
   *  on a timer, so check expiry here rather than trusting prompt reaping). */
  isHandleOnline(handle: string): boolean {
    const now = Date.now();
    for (const rec of this.agents.values()) {
      if (rec.handle === handle && rec.expiresAt >= now) return true;
    }
    return false;
  }

  /** Coalesced: heartbeats arrive per tool call once the harness hooks are
   *  wired, so publishing the whole fleet per heartbeat would be an
   *  O(agents × watchers) storm. Mark dirty, flush at most once per window. */
  private publishAgents(): void {
    if (this.agentsFlushTimer) return;
    this.agentsFlushTimer = setTimeout(() => {
      this.agentsFlushTimer = null;
      this.publish({ type: "agents", agents: this.listAgents() });
    }, config.agentsFlushMs);
    this.agentsFlushTimer.unref?.();
  }

  // ---------------------------------------------------------- throughput

  private recordThroughput(rec: AgentRecord, hb: Omit<Heartbeat, "type">, tokens: number): void {
    if (tokens > 0) {
      // Per-agent "last burst" rate, shown on a worker card when it goes quiet.
      // The fleet-level lastTps is derived (as a sum) in fleetMetrics().
      const elapsedMs = Math.max(1, hb.elapsedMs ?? config.tpsWindowSeconds * 1000);
      rec.lastTps = sampleTps(tokens, elapsedMs);
      rec.lastTpsAt = new Date().toISOString();
    }
    const t = this.totals;
    t.tokensIn += hb.tokensIn ?? 0;
    t.tokensOut += hb.tokensOut ?? 0;
    t.toolCalls += hb.toolCalls ?? 0;
    t.fetchesOk += hb.fetchesOk ?? 0;
    t.fetchesError += hb.fetchesError ?? 0;
    t.errors += hb.errors ?? 0;
    t.tasksCompleted += hb.tasksCompleted ?? 0;
    t.prsOpened += hb.prsOpened ?? 0;
    t.reviewsCompleted += hb.reviewsCompleted ?? 0;
    for (const [tool, n] of Object.entries(hb.tools ?? {})) t.tools[tool] = (t.tools[tool] ?? 0) + n;
    for (const [skill, n] of Object.entries(hb.skills ?? {})) t.skills[skill] = (t.skills[skill] ?? 0) + n;
    this.history?.setTotals(this.totals);
    this.dirty = true;
  }

  fleetMetrics(): FleetMetrics {
    // Fleet throughput is the SUM of every connected worker's honest tok/s
    // (hash-rate style): concurrent producers add together, so the hero figure
    // equals the total of the per-worker rates shown in the fleet table and the
    // per-harness legend. Each agent's rate is the honest generation-window rate
    // (see agentTps / #560); we just add them up rather than averaging.
    const now = Date.now();
    let tps = 0;
    const byModel: Record<string, number> = {};
    const byHarness: Record<string, number> = {};
    for (const rec of this.agents.values()) {
      const rate = agentTps(rec, now);
      if (rate <= 0) continue;
      tps += rate;
      byModel[rec.model] = (byModel[rec.model] ?? 0) + rate;
      byHarness[rec.harness] = (byHarness[rec.harness] ?? 0) + rate;
    }
    const round1 = (n: number) => Math.round(n * 10) / 10;
    tps = round1(tps);
    for (const [k, v] of Object.entries(byModel)) byModel[k] = round1(v);
    for (const [k, v] of Object.entries(byHarness)) byHarness[k] = round1(v);

    // Remember the last non-zero fleet throughput so the hero can show "last
    // burst" when every worker goes quiet, instead of snapping to zero.
    if (tps > 0) {
      this.lastTps = tps;
      this.lastTpsAt = new Date(now).toISOString();
    }

    return {
      tps,
      lastTps: this.lastTps,
      lastTpsAt: this.lastTpsAt,
      tpsByModel: byModel,
      tpsByHarness: byHarness,
      activeAgents: this.agents.size,
      watcherCount: this.watchers.size,
      totals: this.totals,
      serverTime: new Date().toISOString(),
    };
  }

  // ------------------------------------------------------------ watchers

  addWatcher(location: RoughLocation | null): WatcherRecord {
    const rec: WatcherRecord = {
      id: randomUUID(),
      connectedAt: new Date().toISOString(),
      location,
      expiresAt: Date.now() + config.watcherTtlSeconds * 1000,
    };
    this.watchers.set(rec.id, rec);
    this.publishWatchers();
    return rec;
  }

  touchWatcher(id: string): void {
    const rec = this.watchers.get(id);
    if (rec) rec.expiresAt = Date.now() + config.watcherTtlSeconds * 1000;
  }

  removeWatcher(id: string): void {
    if (this.watchers.delete(id)) this.publishWatchers();
  }

  sweepWatchers(): void {
    const now = Date.now();
    let removed = false;
    for (const [id, rec] of this.watchers) {
      if (rec.expiresAt < now) {
        this.watchers.delete(id);
        removed = true;
      }
    }
    if (removed) this.publishWatchers();
  }

  watcherSummary(): WatcherSummary {
    // Only these explicit fields leave the server about a watcher — never an
    // IP, never anything derived from one beyond city/country/rounded coords.
    const locations = [...this.watchers.values()].slice(0, 100).map((rec) => ({
      id: rec.id,
      connectedAt: rec.connectedAt,
      city: rec.location?.city,
      country: rec.location?.country,
      lat: rec.location?.lat,
      lon: rec.location?.lon,
    }));
    return { count: this.watchers.size, locations };
  }

  private publishWatchers(): void {
    this.publish({ type: "watchers", watchers: this.watcherSummary() });
  }

  // -------------------------------------------------------------- events

  addEvent(kind: EventKind, text: string, meta: { handle?: string; harness?: string; ref?: string | undefined }): EventItem {
    const event: EventItem = {
      id: randomUUID(),
      at: new Date().toISOString(),
      kind,
      text,
      ...(meta.handle ? { handle: meta.handle } : {}),
      ...(meta.harness ? { harness: meta.harness } : {}),
      ...(meta.ref ? { ref: meta.ref } : {}),
    };
    this.events.unshift(event);
    if (this.events.length > config.maxEventFeed) this.events.length = config.maxEventFeed;
    this.dirty = true;
    this.publish({ type: "event", event });
    return event;
  }

  /** Broadcast-only, NOT stored in the capped feed: high-churn notices (like
   *  watcher joins) would otherwise evict real fleet events and persist to
   *  STATE_FILE via the snapshot. Live watchers still see them. */
  ephemeralEvent(kind: EventKind, text: string, meta: { handle?: string; harness?: string }): void {
    this.publish({
      type: "event",
      event: {
        id: randomUUID(),
        at: new Date().toISOString(),
        kind,
        text,
        ...(meta.handle ? { handle: meta.handle } : {}),
        ...(meta.harness ? { harness: meta.harness } : {}),
      },
    });
  }

  recentEvents(limit = 50): EventItem[] {
    return this.events.slice(0, limit);
  }

  // ---------------------------------------------------------------- logs

  /** Retain a small redacted per-agent live stream so dashboard viewers can
   *  click into a worker after a few frames have already gone by. */
  appendLogs(agentId: string, handle: string, lines: string[]): void {
    const now = new Date().toISOString();
    const entries = lines.map((line) => ({ at: now, line })).filter((entry) => entry.line.trim());
    if (!entries.length) return;
    const current = this.logs.get(agentId) ?? [];
    this.logs.set(agentId, [...current, ...entries].slice(-config.maxLogLines));
    if (config.broadcastLogs) this.publish({ type: "log", agentId, handle, lines: entries.map((entry) => entry.line) });
  }

  agentLogs(agentId: string): LogLine[] {
    return this.logs.get(agentId) ?? [];
  }

  // ------------------------------------------------------------ snapshot

  snapshot(): FleetSnapshot {
    return {
      agents: this.listAgents(),
      watchers: this.watcherSummary(),
      fleet: this.fleetMetrics(),
      events: this.recentEvents(),
    };
  }

  historyTotals() {
    return this.history?.totals() ?? null;
  }

  tpsHistory(minutes?: number, bucketSeconds?: number) {
    return this.history?.tpsHistory(minutes, bucketSeconds) ?? [];
  }

  close(): void {
    this.history?.close();
  }

  // -------------------------------------------------- optional persistence

  private load(file: string): void {
    try {
      const parsed = JSON.parse(readFileSync(file, "utf8")) as Partial<PersistedState>;
      if (parsed.totals) this.totals = { ...emptyCounters(), ...parsed.totals };
      if (Array.isArray(parsed.events)) this.events = parsed.events.slice(0, config.maxEventFeed);
      if (typeof parsed.lastTps === "number") this.lastTps = parsed.lastTps;
      if (typeof parsed.lastTpsAt === "string" || parsed.lastTpsAt === null) this.lastTpsAt = parsed.lastTpsAt ?? null;
    } catch {
      // First boot (no file yet) or corrupt snapshot — start fresh; this is
      // vanity-counter state, never correctness state.
    }
  }

  /** Persist lifetime totals + the event feed so a redeploy doesn't zero the
   *  public counters. Called on an interval and on shutdown. */
  save(): void {
    if (!this.stateFile || !this.dirty) return;
    try {
      const state: PersistedState = { totals: this.totals, events: this.events, lastTps: this.lastTps, lastTpsAt: this.lastTpsAt };
      const tmp = `${this.stateFile}.tmp`;
      writeFileSync(tmp, JSON.stringify(state));
      renameSync(tmp, this.stateFile);
      this.dirty = false;
    } catch (err) {
      // Non-fatal: run without persistence rather than crash the fleet feed.
      console.error("state save failed:", err);
    }
  }
}
