#!/usr/bin/env node
/**
 * Codex -> fleet server bridge, wired via Codex's hooks system
 * (https://developers.openai.com/codex/hooks; needs codex-cli >= 0.142).
 * One script handles every event; the repo ships the wiring in
 * .codex/hooks.json (SessionStart, PostToolUse, Stop), which applies to any
 * Codex session working in a checkout/worktree of this repo. Codex gates
 * non-managed hooks behind an interactive trust review, so the runners pass
 * --dangerously-bypass-hook-trust (see run_agent in scripts/fg-common.sh).
 *
 * Hook payloads deliberately carry NO token usage — but they do carry
 * `transcript_path`, and Codex's rollout transcript records cumulative
 * `token_count` events. So this client parses the transcript incrementally
 * (like claude-code-hook.mjs does) and posts token DELTAS — which, on
 * PostToolUse, means live tokens/TPS DURING a long run, something the
 * `codex exec --json` stream can't provide (usage arrives only at turn end).
 *
 * What it sends (issue #398 Phase 1 telemetry):
 *  - SessionStart -> hello (presence: handle, harness, model)
 *  - PostToolUse  -> heartbeat: +1 tool call (per-tool breakdown) + any new
 *                    token deltas from the transcript
 *  - Stop         -> heartbeat: remaining token deltas; plus — ONLY when
 *                    STREAM_LOGS=1 — a small redacted excerpt of the last
 *                    agent message
 *
 * Installing this hook IS the telemetry opt-in, so FLEET_SERVER defaults to
 * the project's mission-control server; set FLEET_SERVER="" to disable, or
 * point it elsewhere. Never blocks the session: short timeouts, every
 * failure swallowed, always exits 0. Log streaming stays a SEPARATE opt-in
 * (STREAM_LOGS=1), redacted client-side and again server-side.
 */
const { readFileSync, existsSync } = await import("node:fs");

let payload = {};
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

// Scope the default-on behaviour to For Good work: honour an explicit
// FLEET_SERVER (autopilot exports it to its codex children; ""=off), and
// otherwise default to mission control ONLY when the session's cwd is a
// For Good checkout/worktree (identified by this very client being present).
// A globally-wired hook therefore never reports unrelated projects.
if (process.env.FLEET_SERVER === undefined) {
  const cwd = typeof payload.cwd === "string" ? payload.cwd : process.cwd();
  if (existsSync(`${cwd}/server/clients/codex-hook.mjs`)) {
    process.env.FLEET_SERVER = "https://forgood.thecolab.ai";
  }
}
const { enabled, loadState, post, saveState, STREAM_LOGS, toLogLines, warnStreamingOnce, HANDLE } =
  await import("./fleet-common.mjs");

if (!enabled()) process.exit(0);

const event = payload.hook_event_name ?? "";
const sessionKey = `codex-${payload.session_id ?? "default"}`.slice(0, 80);
let state = loadState(sessionKey);
if (event === "SessionStart") state = warnStreamingOnce(state);
if (payload.model) state.model = payload.model;

const hello = {
  handle: HANDLE || "unknown",
  harness: "codex",
  model: payload.model || state.model || process.env.FLEET_MODEL || process.env.MODEL || "codex",
  ...(process.env.TASK_REF || process.env.TASK_TITLE
    ? { task: { kind: process.env.FLEET_TASK_KIND || "work", ref: process.env.TASK_REF, title: process.env.TASK_TITLE } }
    : {}),
};

/** Every telemetry POST is an upsert (hello + heartbeat), so presence works
 *  even if hooks were installed mid-session and SessionStart never fired. */
async function send(heartbeat) {
  const resp = await post("/api/v1/telemetry", {
    ...(state.agentId ? { agentId: state.agentId } : {}),
    ...hello,
    ...(heartbeat ? { heartbeat } : {}),
  });
  if (resp?.agentId) state.agentId = resp.agentId;
}

/** Parse new rollout lines since the last read. Codex `token_count` events
 *  are CUMULATIVE, so deltas come from comparing the latest cumulative
 *  figures against what this session last posted. Cache reads are excluded —
 *  they'd inflate "intelligence at work" by orders of magnitude. */
function readTranscriptDelta() {
  const out = { tokensIn: 0, tokensOut: 0, lastText: "" };
  const path = payload.transcript_path;
  if (!path) return out;
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return out;
  }
  if (Number.isFinite(state.offset) && state.offset > raw.length) {
    // Transcript shrank (rotated) — resume from the new end, never re-count.
    state.offset = raw.length;
    return out;
  }
  const offset = Number.isFinite(state.offset) ? state.offset : 0;
  state.offset = raw.length;
  let latest = null;
  for (const line of raw.slice(offset).split("\n")) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const p = entry?.payload;
    if (!p || typeof p !== "object") continue;
    if (p.type === "token_count" && p.info?.total_token_usage) latest = p.info.total_token_usage;
    if (p.type === "agent_message" && typeof p.message === "string" && p.message.trim()) {
      out.lastText = p.message;
    }
  }
  if (latest) {
    const cumIn = Math.max(0, (latest.input_tokens ?? 0) - (latest.cached_input_tokens ?? 0));
    const cumOut = latest.output_tokens ?? 0;
    out.tokensIn = Math.max(0, cumIn - (state.cumIn ?? 0));
    out.tokensOut = Math.max(0, cumOut - (state.cumOut ?? 0));
    state.cumIn = Math.max(cumIn, state.cumIn ?? 0);
    state.cumOut = Math.max(cumOut, state.cumOut ?? 0);
  }
  return out;
}

/** Token heartbeat with real elapsed wall time, so the fleet TPS gauge
 *  reflects the actual rate rather than a per-post burst. */
async function sendTokens(delta) {
  if (delta.tokensIn <= 0 && delta.tokensOut <= 0) return false;
  const now = Date.now();
  const elapsedMs = Math.min(86_400_000, Math.max(1, now - (state.lastTokensAt ?? now - 1000)));
  state.lastTokensAt = now;
  await send({ tokensIn: delta.tokensIn, tokensOut: delta.tokensOut, elapsedMs });
  return true;
}

switch (event) {
  case "SessionStart": {
    state.lastTokensAt = Date.now();
    await send();
    break;
  }
  case "PostToolUse": {
    const tool = String(payload.tool_name ?? "unknown").slice(0, 64);
    const delta = readTranscriptDelta();
    const heartbeat = { toolCalls: 1, tools: { [tool]: 1 } };
    if (delta.tokensIn > 0 || delta.tokensOut > 0) {
      const now = Date.now();
      heartbeat.tokensIn = delta.tokensIn;
      heartbeat.tokensOut = delta.tokensOut;
      heartbeat.elapsedMs = Math.min(86_400_000, Math.max(1, now - (state.lastTokensAt ?? now - 1000)));
      state.lastTokensAt = now;
    }
    await send(heartbeat);
    break;
  }
  case "Stop": {
    const delta = readTranscriptDelta();
    await sendTokens(delta);
    if (STREAM_LOGS && state.agentId && delta.lastText) {
      await post("/api/v1/logs", { agentId: state.agentId, lines: toLogLines(delta.lastText) });
    }
    break;
  }
  default:
    break;
}

saveState(sessionKey, state);
process.exit(0);
