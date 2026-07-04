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
import { randomUUID } from "node:crypto";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { config } from "./config.js";
import type {
  AgentPresence,
  EventItem,
  EventKind,
  FleetMetrics,
  FleetSnapshot,
  Heartbeat,
  Hello,
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
  recent: Array<{ t: number; tokens: number }>;
  expiresAt: number;
}

interface WatcherRecord {
  id: string;
  connectedAt: string;
  location: RoughLocation | null;
  expiresAt: number;
}

interface TpsBucket {
  total: number;
  byModel: Record<string, number>;
  byHarness: Record<string, number>;
}

interface PersistedState {
  totals: SessionCounters;
  events: EventItem[];
}

function agentTps(rec: AgentRecord, now: number): number {
  const windowMs = config.tpsWindowSeconds * 1000;
  const tokens = rec.recent.reduce((s, p) => (now - p.t <= windowMs ? s + p.tokens : s), 0);
  return Math.round((tokens / config.tpsWindowSeconds) * 10) / 10;
}

function toPresence(rec: AgentRecord, now: number): AgentPresence {
  const { recent: _recent, expiresAt: _expiresAt, ...presence } = rec;
  return { ...presence, tps: agentTps(rec, now) };
}

const rate = (n: number) => Math.round((n / config.tpsWindowSeconds) * 10) / 10;

/** Emits "message" with a ServerMessage whenever watchers should hear about a
 *  change — the watch hub subscribes and fans out to its sockets. */
export class FleetStore extends EventEmitter {
  private readonly agents = new Map<string, AgentRecord>();
  private readonly watchers = new Map<string, WatcherRecord>();
  /** bucket index (unix seconds / bucket size) -> token counts */
  private readonly tpsBuckets = new Map<number, TpsBucket>();
  private totals: SessionCounters = emptyCounters();
  private events: EventItem[] = [];
  /** Short-lived opt-in log tail per agent, pruned when the agent goes. */
  private readonly logs = new Map<string, Array<{ at: number; line: string }>>();
  private dirty = false;

  constructor(private readonly stateFile?: string) {
    super();
    this.setMaxListeners(0);
    if (stateFile) this.load(stateFile);
  }

  private publish(msg: ServerMessage): void {
    this.emit("message", msg);
  }

  // -------------------------------------------------------------- agents

  upsertAgent(hello: Hello, transport: "ws" | "http", id?: string): string {
    const agentId = id ?? randomUUID();
    const existing = this.agents.get(agentId);
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const rec: AgentRecord = existing ?? {
      id: agentId,
      handle: hello.handle,
      harness: hello.harness,
      model: hello.model,
      transport,
      connectedAt: nowIso,
      lastSeen: nowIso,
      task: hello.task ?? null,
      session: emptyCounters(),
      recent: [],
      expiresAt: 0,
    };
    rec.handle = hello.handle;
    rec.harness = hello.harness;
    rec.model = hello.model;
    rec.lastSeen = nowIso;
    rec.expiresAt = now + config.agentTtlSeconds * 1000;
    if (hello.task) rec.task = hello.task;
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

    const tokens = (hb.tokensIn ?? 0) + (hb.tokensOut ?? 0);
    const windowMs = config.tpsWindowSeconds * 1000;
    rec.recent = rec.recent.filter((p) => now - p.t <= windowMs);
    if (tokens > 0) rec.recent.push({ t: now, tokens });

    if (hb.task) {
      const changed = hb.task.ref !== rec.task?.ref || hb.task.kind !== rec.task?.kind;
      rec.task = hb.task;
      if (changed && (hb.task.ref || hb.task.title)) this.emitTaskEvent(rec, hb.task);
    }

    this.recordThroughput(rec, hb, tokens);
    this.emitMilestones(rec, hb);
    this.publishAgents();
    return rec;
  }

  updateTask(id: string, task: TaskInfo): void {
    const rec = this.agents.get(id);
    if (!rec) return;
    const changed = task.ref !== rec.task?.ref || task.kind !== rec.task?.kind;
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
    this.logs.delete(id);
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

  private publishAgents(): void {
    this.publish({ type: "agents", agents: this.listAgents() });
  }

  // ---------------------------------------------------------- throughput

  private recordThroughput(rec: AgentRecord, hb: Omit<Heartbeat, "type">, tokens: number): void {
    if (tokens > 0) {
      const bucketId = Math.floor(Date.now() / 1000 / config.tpsBucketSeconds);
      let bucket = this.tpsBuckets.get(bucketId);
      if (!bucket) {
        bucket = { total: 0, byModel: {}, byHarness: {} };
        this.tpsBuckets.set(bucketId, bucket);
      }
      bucket.total += tokens;
      bucket.byModel[rec.model] = (bucket.byModel[rec.model] ?? 0) + tokens;
      bucket.byHarness[rec.harness] = (bucket.byHarness[rec.harness] ?? 0) + tokens;
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
    this.dirty = true;
  }

  fleetMetrics(): FleetMetrics {
    const currentBucket = Math.floor(Date.now() / 1000 / config.tpsBucketSeconds);
    const bucketCount = Math.ceil(config.tpsWindowSeconds / config.tpsBucketSeconds);
    let total = 0;
    const byModel: Record<string, number> = {};
    const byHarness: Record<string, number> = {};
    for (let i = 0; i < bucketCount; i++) {
      const bucket = this.tpsBuckets.get(currentBucket - i);
      if (!bucket) continue;
      total += bucket.total;
      for (const [k, v] of Object.entries(bucket.byModel)) byModel[k] = (byModel[k] ?? 0) + v;
      for (const [k, v] of Object.entries(bucket.byHarness)) byHarness[k] = (byHarness[k] ?? 0) + v;
    }
    // Prune buckets that have slid out of every window.
    for (const id of this.tpsBuckets.keys()) {
      if (id < currentBucket - bucketCount * 2) this.tpsBuckets.delete(id);
    }
    return {
      tps: rate(total),
      tpsByModel: Object.fromEntries(Object.entries(byModel).map(([k, v]) => [k, rate(v)])),
      tpsByHarness: Object.fromEntries(Object.entries(byHarness).map(([k, v]) => [k, rate(v)])),
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
    // Only the rough location and a random id leave the server — never an IP,
    // never anything derived from one beyond city/country/rounded coords.
    const locations = [...this.watchers.values()]
      .slice(0, 100)
      .map((rec) => ({ id: rec.id, connectedAt: rec.connectedAt, ...(rec.location ?? {}) }));
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

  recentEvents(limit = 50): EventItem[] {
    return this.events.slice(0, limit);
  }

  // ---------------------------------------------------------------- logs

  appendLogs(agentId: string, handle: string, lines: string[]): void {
    const now = Date.now();
    const tail = this.logs.get(agentId) ?? [];
    tail.unshift(...lines.map((line) => ({ at: now, line })));
    if (tail.length > config.logLinesPerAgent) tail.length = config.logLinesPerAgent;
    this.logs.set(agentId, tail);
    if (config.broadcastLogs) this.publish({ type: "log", agentId, handle, lines });
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

  // -------------------------------------------------- optional persistence

  private load(file: string): void {
    try {
      const parsed = JSON.parse(readFileSync(file, "utf8")) as Partial<PersistedState>;
      if (parsed.totals) this.totals = { ...emptyCounters(), ...parsed.totals };
      if (Array.isArray(parsed.events)) this.events = parsed.events.slice(0, config.maxEventFeed);
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
      const state: PersistedState = { totals: this.totals, events: this.events };
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
