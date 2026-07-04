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
} as const;
