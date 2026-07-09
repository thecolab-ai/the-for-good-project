import { DatabaseSync } from "node:sqlite";
import type { Heartbeat, SessionCounters, TaskInfo } from "./protocol.js";

export interface TokenSample {
  agentId: string;
  handle: string;
  harness: string;
  model: string;
  task: TaskInfo | null;
  heartbeat: Partial<Omit<Heartbeat, "type">>;
}

export interface TpsBucket {
  at: string;
  tps: number;
  tokensIn: number;
  tokensOut: number;
  toolCalls: number;
  tasksCompleted: number;
  prsOpened: number;
  reviewsCompleted: number;
  byHarness: Record<string, number>;
  byModel: Record<string, number>;
  elapsedMs?: number;
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

const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

export class HistoryStore {
  private readonly db: DatabaseSync;

  constructor(file: string) {
    this.db = new DatabaseSync(file);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      CREATE TABLE IF NOT EXISTS token_samples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        at_ms INTEGER NOT NULL,
        at_iso TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        handle TEXT NOT NULL,
        harness TEXT NOT NULL,
        model TEXT NOT NULL,
        task_kind TEXT,
        task_ref TEXT,
        task_title TEXT,
        tokens_in INTEGER NOT NULL DEFAULT 0,
        tokens_out INTEGER NOT NULL DEFAULT 0,
        elapsed_ms INTEGER NOT NULL DEFAULT 0,
        tool_calls INTEGER NOT NULL DEFAULT 0,
        tasks_completed INTEGER NOT NULL DEFAULT 0,
        prs_opened INTEGER NOT NULL DEFAULT 0,
        reviews_completed INTEGER NOT NULL DEFAULT 0,
        errors INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS fleet_totals (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        updated_at TEXT NOT NULL,
        tokens_in INTEGER NOT NULL DEFAULT 0,
        tokens_out INTEGER NOT NULL DEFAULT 0,
        tool_calls INTEGER NOT NULL DEFAULT 0,
        tasks_completed INTEGER NOT NULL DEFAULT 0,
        prs_opened INTEGER NOT NULL DEFAULT 0,
        reviews_completed INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_token_samples_at ON token_samples(at_ms);
      CREATE INDEX IF NOT EXISTS idx_token_samples_agent_at ON token_samples(agent_id, at_ms);
      CREATE INDEX IF NOT EXISTS idx_token_samples_harness_at ON token_samples(harness, at_ms);
    `);
    try {
      this.db.exec("ALTER TABLE token_samples ADD COLUMN elapsed_ms INTEGER NOT NULL DEFAULT 0");
    } catch {
      // Existing DBs already have the column.
    }
  }

  record(sample: TokenSample): void {
    const hb = sample.heartbeat;
    const tokensIn = num(hb.tokensIn);
    const tokensOut = num(hb.tokensOut);
    const elapsedMs = Math.max(0, num(hb.elapsedMs));
    const toolCalls = num(hb.toolCalls);
    const tasksCompleted = num(hb.tasksCompleted);
    const prsOpened = num(hb.prsOpened);
    const reviewsCompleted = num(hb.reviewsCompleted);
    const errors = num(hb.errors);
    if (tokensIn + tokensOut + toolCalls + tasksCompleted + prsOpened + reviewsCompleted + errors <= 0) return;

    const at = Date.now();
    this.db
      .prepare(`
        INSERT INTO token_samples (
          at_ms, at_iso, agent_id, handle, harness, model, task_kind, task_ref, task_title,
          tokens_in, tokens_out, elapsed_ms, tool_calls, tasks_completed, prs_opened, reviews_completed, errors
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        at,
        new Date(at).toISOString(),
        sample.agentId,
        sample.handle,
        sample.harness,
        sample.model,
        sample.task?.kind ?? null,
        sample.task?.ref ?? null,
        sample.task?.title ?? null,
        tokensIn,
        tokensOut,
        elapsedMs,
        toolCalls,
        tasksCompleted,
        prsOpened,
        reviewsCompleted,
        errors,
      );
  }

  setTotals(totals: SessionCounters): void {
    this.db
      .prepare(`
        INSERT INTO fleet_totals (id, updated_at, tokens_in, tokens_out, tool_calls, tasks_completed, prs_opened, reviews_completed)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          updated_at = excluded.updated_at,
          tokens_in = excluded.tokens_in,
          tokens_out = excluded.tokens_out,
          tool_calls = excluded.tool_calls,
          tasks_completed = excluded.tasks_completed,
          prs_opened = excluded.prs_opened,
          reviews_completed = excluded.reviews_completed
      `)
      .run(
        new Date().toISOString(),
        totals.tokensIn,
        totals.tokensOut,
        totals.toolCalls,
        totals.tasksCompleted,
        totals.prsOpened,
        totals.reviewsCompleted,
      );
  }

  totals(): HistoryTotals {
    const stored = this.db.prepare("SELECT * FROM fleet_totals WHERE id = 1").get() as Record<string, unknown> | undefined;
    if (stored) {
      const sampleRow = this.db.prepare("SELECT COUNT(*) AS samples, MIN(at_iso) AS firstAt, MAX(at_iso) AS lastAt FROM token_samples").get() as Record<string, unknown>;
      return {
        tokensIn: Number(stored.tokens_in ?? 0),
        tokensOut: Number(stored.tokens_out ?? 0),
        toolCalls: Number(stored.tool_calls ?? 0),
        tasksCompleted: Number(stored.tasks_completed ?? 0),
        prsOpened: Number(stored.prs_opened ?? 0),
        reviewsCompleted: Number(stored.reviews_completed ?? 0),
        samples: Number(sampleRow.samples ?? 0),
        firstAt: typeof sampleRow.firstAt === "string" ? sampleRow.firstAt : null,
        lastAt: typeof sampleRow.lastAt === "string" ? sampleRow.lastAt : null,
      };
    }
    const row = this.db
      .prepare(`
        SELECT
          COALESCE(SUM(tokens_in), 0) AS tokensIn,
          COALESCE(SUM(tokens_out), 0) AS tokensOut,
          COALESCE(SUM(tool_calls), 0) AS toolCalls,
          COALESCE(SUM(tasks_completed), 0) AS tasksCompleted,
          COALESCE(SUM(prs_opened), 0) AS prsOpened,
          COALESCE(SUM(reviews_completed), 0) AS reviewsCompleted,
          COUNT(*) AS samples,
          MIN(at_iso) AS firstAt,
          MAX(at_iso) AS lastAt
        FROM token_samples
      `)
      .get() as Record<string, unknown>;
    return {
      tokensIn: Number(row.tokensIn ?? 0),
      tokensOut: Number(row.tokensOut ?? 0),
      toolCalls: Number(row.toolCalls ?? 0),
      tasksCompleted: Number(row.tasksCompleted ?? 0),
      prsOpened: Number(row.prsOpened ?? 0),
      reviewsCompleted: Number(row.reviewsCompleted ?? 0),
      samples: Number(row.samples ?? 0),
      firstAt: typeof row.firstAt === "string" ? row.firstAt : null,
      lastAt: typeof row.lastAt === "string" ? row.lastAt : null,
    };
  }

  tpsHistory(minutes = 60, bucketSeconds = 60): TpsBucket[] {
    const boundedMinutes = Math.max(1, Math.min(60 * 24 * 30, Math.floor(minutes)));
    const boundedBucket = Math.max(10, Math.min(3600, Math.floor(bucketSeconds)));
    const since = Date.now() - boundedMinutes * 60_000;
    const rows = this.db
      .prepare(`
        SELECT
          CAST(at_ms / (? * 1000) AS INTEGER) * ? * 1000 AS bucket_ms,
          harness,
          model,
          SUM(tokens_in) AS tokens_in,
          SUM(tokens_out) AS tokens_out,
          SUM(elapsed_ms) AS elapsed_ms,
          SUM(tool_calls) AS tool_calls,
          SUM(tasks_completed) AS tasks_completed,
          SUM(prs_opened) AS prs_opened,
          SUM(reviews_completed) AS reviews_completed
        FROM token_samples
        WHERE at_ms >= ?
        GROUP BY bucket_ms, harness, model
        ORDER BY bucket_ms ASC
      `)
      .all(boundedBucket, boundedBucket, since) as Array<Record<string, unknown>>;

    const buckets = new Map<number, TpsBucket>();
    for (const row of rows) {
      const bucketMs = Number(row.bucket_ms);
      const tokensIn = Number(row.tokens_in ?? 0);
      const tokensOut = Number(row.tokens_out ?? 0);
      const tokens = tokensIn + tokensOut;
      const elapsedMs = Number(row.elapsed_ms ?? 0);
      const existing = buckets.get(bucketMs) ?? {
        at: new Date(bucketMs).toISOString(),
        tps: 0,
        tokensIn: 0,
        tokensOut: 0,
        toolCalls: 0,
        tasksCompleted: 0,
        prsOpened: 0,
        reviewsCompleted: 0,
        byHarness: {},
        byModel: {},
        elapsedMs: 0,
      };
      existing.elapsedMs = (existing.elapsedMs ?? 0) + elapsedMs;
      existing.tokensIn += tokensIn;
      existing.tokensOut += tokensOut;
      existing.toolCalls += Number(row.tool_calls ?? 0);
      existing.tasksCompleted += Number(row.tasks_completed ?? 0);
      existing.prsOpened += Number(row.prs_opened ?? 0);
      existing.reviewsCompleted += Number(row.reviews_completed ?? 0);
      const harness = String(row.harness ?? "unknown");
      const model = String(row.model ?? "unknown");
      existing.byHarness[harness] = (existing.byHarness[harness] ?? 0) + tokens;
      existing.byModel[model] = (existing.byModel[model] ?? 0) + tokens;
      buckets.set(bucketMs, existing);
    }

    return [...buckets.entries()].map(([, bucket]) => {
      const denominatorSeconds = bucket.elapsedMs && bucket.elapsedMs > 0 ? bucket.elapsedMs / 1000 : boundedBucket;
      return {
        ...bucket,
        tps: Math.round(((bucket.tokensIn + bucket.tokensOut) / denominatorSeconds) * 10) / 10,
        byHarness: Object.fromEntries(Object.entries(bucket.byHarness).map(([k, v]) => [k, Math.round((v / denominatorSeconds) * 10) / 10])),
        byModel: Object.fromEntries(Object.entries(bucket.byModel).map(([k, v]) => [k, Math.round((v / denominatorSeconds) * 10) / 10])),
      };
    });
  }

  close(): void {
    this.db.close();
  }
}
