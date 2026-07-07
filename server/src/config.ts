function num(v: string | undefined, fallback: number): number {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function bool(v: string | undefined, fallback: boolean): boolean {
  if (v === undefined || v === "") return fallback;
  return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "yes";
}

export const config = {
  port: num(process.env.PORT, 8787),
  host: process.env.HOST ?? "0.0.0.0",

  // Optional JSON snapshot for lifetime totals + the event feed, so a redeploy
  // doesn't zero the public counters. Presence/TPS state is deliberately
  // ephemeral — it rebuilds from heartbeats within seconds. Unset = no
  // persistence at all.
  stateFile: process.env.STATE_FILE || undefined,
  stateSaveSeconds: num(process.env.STATE_SAVE_SECONDS, 30),
  historyDbFile: process.env.HISTORY_DB_FILE || (process.env.STATE_FILE ? `${process.env.STATE_FILE}.sqlite` : undefined),

  // Serve the built web dashboard (a `vite build --base=/` of ../web) from
  // this directory at "/", with an SPA fallback for its client-side routes.
  // Unset = API/WS only (the pre-hosting behaviour).
  staticDir: process.env.STATIC_DIR || undefined,

  // Comma-separated list of allowed origins, or "*" (default) for any.
  corsOrigin: process.env.CORS_ORIGIN ?? "*",

  // Behind a reverse proxy / load balancer, trust X-Forwarded-For so watcher
  // geo works on the real client IP rather than the proxy's.
  trustProxy: bool(process.env.TRUST_PROXY, true),

  // Rough watcher geolocation (city/country from IP, IP discarded immediately).
  watcherGeo: bool(process.env.WATCHER_GEO, true),

  // Session-log streaming is opt-in at BOTH ends (issue #398): the worker must
  // opt in with STREAM_LOGS=1, and the server must allow it here. Even then,
  // logs only reach the public dashboard if broadcastLogs is ALSO on.
  allowLogStream: bool(process.env.ALLOW_LOG_STREAM, false),
  broadcastLogs: bool(process.env.BROADCAST_LOGS, false),

  // An agent missing heartbeats for this long is considered offline.
  agentTtlSeconds: num(process.env.AGENT_TTL_SECONDS, 90),
  watcherTtlSeconds: num(process.env.WATCHER_TTL_SECONDS, 75),

  // TPS is computed over a sliding window of small buckets.
  tpsWindowSeconds: 60,
  tpsBucketSeconds: 10,

  maxEventFeed: num(process.env.MAX_EVENT_FEED, 200),
  maxLogLines: num(process.env.MAX_LOG_LINES, 500),

  // Per-connection inbound limits — telemetry is small; anything bigger is a bug
  // or abuse. The same per-second budget applies per-IP on the HTTP routes.
  maxMessageBytes: 64 * 1024,
  maxMessagesPerSecond: 20,

  // Hard ceiling on tracked agents — presence is unauthenticated until the
  // parked auth lands, so cap what a flood of hellos can allocate.
  maxAgents: num(process.env.MAX_AGENTS, 500),

  // Coalesce agent-presence broadcasts: heartbeats mark the list dirty and a
  // flush follows within this window, instead of one whole-fleet frame per
  // heartbeat (per-tool-call hooks make those very frequent).
  agentsFlushMs: 750,

  // ------------------------------------------------------------------------
  // Orchestration (pull-claim v1). Everything below is additive and
  // fail-open: with REDIS_URL/MONGO_URL unset the server behaves exactly as
  // before (telemetry only) and the orchestration routes answer 503.
  redisUrl: process.env.REDIS_URL || undefined,
  mongoUrl: process.env.MONGO_URL || undefined,
  mongoDb: process.env.MONGO_DB || "forgood",

  // Bot token used for label writes + the mirror sync job. Dispatch requires
  // it (claim answers 503 "no github token" without it); the mirror can still
  // be fed by webhooks alone.
  githubToken: process.env.GITHUB_TOKEN || undefined,
  githubRepo: process.env.GITHUB_REPO || "thecolab-ai/the-for-good-project",
  // Overridable so tests can point the client at a mock server.
  githubApiUrl: process.env.GITHUB_API_URL || "https://api.github.com",

  // Unset = the GitHub webhook route is not registered (404).
  webhookSecret: process.env.WEBHOOK_SECRET || undefined,
  // Unset = the admin routes are not registered (404).
  adminToken: process.env.ADMIN_TOKEN || undefined,

  // TOFU auto-enrollment: any runner's first contact mints its own
  // standard-tier token (POST /api/v1/agents/enroll), so operators never
  // hand tokens out. Turn off to require operator-minted tokens only.
  autoEnroll: bool(process.env.AUTO_ENROLL, true),
  // Max concurrently-active server claims per handle — bounds how much of
  // the queue one auto-enrolled identity can sit on.
  maxActiveClaims: num(process.env.MAX_ACTIVE_CLAIMS, 3),

  leaseTtlSeconds: num(process.env.LEASE_TTL_SECONDS, 1800),
  // Review-claim leases (kind: "review" dispatch — ADR-0019). Longer than the
  // work lease: one adversarial review round routinely takes an hour.
  reviewLeaseTtlSeconds: num(process.env.REVIEW_LEASE_TTL_SECONDS, 3600),
  // A review claim the runner released `abandoned` (it skipped the PR locally
  // — already passed, author==reviewer, parked, crash) cools down for this
  // long before claimNextReview may serve that PR again. Without it, a PR the
  // mirror deems eligible but every runner skips sits at the head of the
  // oldest-first queue and burns one claim per runner per pass, forever.
  reviewAbandonCooldownSeconds: num(process.env.REVIEW_ABANDON_COOLDOWN_SECONDS, 900),
  // Rework-adoption leases (kind: "rework" dispatch — ADR-0020). A rework is
  // one agent run like a work claim, not the hour a review takes, so it reuses
  // the work-lease value by default.
  reworkLeaseTtlSeconds: num(process.env.REWORK_LEASE_TTL_SECONDS, 1800),
  // How long a `changes-requested` PR must sit idle (no push/review since the
  // last change-request at its head) before a DIFFERENT worker may adopt its
  // rework (#656). Configured in HOURS to match the issue/docs; stored in
  // seconds. Default 6h.
  reworkAdoptSeconds: num(process.env.REWORK_ADOPT_HOURS, 6) * 3600,
  // A rework claim released `abandoned` (the runner skipped it locally — the
  // author pushed a new commit mid-window, a crash, a usage limit) cools down
  // before claimNextRework may re-serve it, exactly like the review cooldown:
  // without it a PR every runner skips pins the head of the oldest-first queue.
  reworkAbandonCooldownSeconds: num(process.env.REWORK_ABANDON_COOLDOWN_SECONDS, 900),
  // Review-round cap before a PR is a human maintainer's (#287). Same env var
  // the shell reads (review_work.sh MAX_REVIEW_ROUNDS) so an operator
  // override can't diverge the server's cap from the runners'.
  maxReviewRounds: num(process.env.MAX_REVIEW_ROUNDS, 10),
  // One-shot fleet drain commands (stop/abort) expire after this long, so a
  // handle minted (or a runner restarted) weeks after a drain is never killed
  // by a months-old command. pause/resume represent STATE and persist.
  fleetCmdTtlSeconds: num(process.env.FLEET_CMD_TTL_SECONDS, 3600),
  syncIntervalSeconds: num(process.env.SYNC_INTERVAL_SECONDS, 60),
  syncFullIntervalSeconds: num(process.env.SYNC_FULL_INTERVAL_SECONDS, 900),
  maxSyncPages: num(process.env.MAX_SYNC_PAGES, 20),
  // Bounded priority jump (ADR-0013): "priority: high" only jumps the queue
  // for the first N distinct streams. Mirrors HIGH_PRIORITY_CAP in
  // scripts/fg-common.sh.
  highPriorityCap: num(process.env.HIGH_PRIORITY_CAP, 5),
} as const;

/** Orchestration is on only when BOTH hot and durable stores are configured.
 *  Dispatch additionally requires `githubToken` (checked at claim time). */
export function orchestrationEnabled(cfg: typeof config = config): boolean {
  return Boolean(cfg.redisUrl && cfg.mongoUrl);
}
