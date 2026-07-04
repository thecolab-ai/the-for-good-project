#!/usr/bin/env node
/**
 * Claude Code -> fleet server bridge, wired via Claude Code's hooks system.
 * One script handles every event; see claude-settings.example.json for the
 * settings.json wiring (SessionStart, PostToolUse, Stop, SessionEnd).
 *
 * What it sends (issue #398 Phase 1 telemetry):
 *  - SessionStart  -> hello (presence: handle, harness, model)
 *  - PostToolUse   -> heartbeat: +1 tool call, per-tool breakdown, and
 *                     fetch ok/error for WebFetch/WebSearch
 *  - Stop          -> heartbeat: token DELTAS read from the session
 *                     transcript since the last Stop; plus — ONLY when
 *                     STREAM_LOGS=1 — a small redacted excerpt of the
 *                     assistant's latest message for the dashboard feed
 *  - SessionEnd    -> goodbye
 *
 * No-ops instantly unless FLEET_SERVER is set, and never blocks the session:
 * short timeouts, every failure swallowed, always exits 0.
 */
import { readFileSync } from "node:fs";
import {
  enabled,
  loadState,
  post,
  saveState,
  STREAM_LOGS,
  toLogLines,
  warnStreamingOnce,
  HANDLE,
} from "./fleet-common.mjs";

if (!enabled()) process.exit(0);

// Read the hook payload from stdin.
let payload = {};
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const event = payload.hook_event_name ?? "";
const sessionKey = `claude-${payload.session_id ?? "default"}`.slice(0, 80);
let state = loadState(sessionKey);
if (event === "SessionStart") state = warnStreamingOnce(state);

const hello = {
  handle: HANDLE || "unknown",
  harness: "claude",
  // SessionStart's payload carries the model id; later events fall back to
  // whatever the state file captured, then env.
  model:
    payload.model || state.model || process.env.FLEET_MODEL || process.env.ANTHROPIC_MODEL || "claude",
  ...(process.env.TASK_REF || process.env.TASK_TITLE
    ? { task: { kind: process.env.TASK_KIND || "work", ref: process.env.TASK_REF, title: process.env.TASK_TITLE } }
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

/** Parse new transcript lines since the last read; return token deltas and
 *  the latest assistant text (for the opt-in log stream). */
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
    // Transcript shrank (truncated/rotated) — re-parsing from 0 would
    // double-count every prior token into this delta. Skip this tick and
    // resume counting from the new end.
    state.offset = raw.length;
    return out;
  }
  const offset = Number.isFinite(state.offset) ? state.offset : 0;
  state.offset = raw.length;
  for (const line of raw.slice(offset).split("\n")) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    if (entry.type !== "assistant") continue;
    const usage = entry.message?.usage;
    if (usage) {
      // Cache reads are excluded: they'd inflate "intelligence at work" by
      // orders of magnitude. Fresh input + cache writes + output only.
      out.tokensIn += (usage.input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0);
      out.tokensOut += usage.output_tokens ?? 0;
    }
    const text = (entry.message?.content ?? [])
      .filter((c) => c?.type === "text" && c.text)
      .map((c) => c.text)
      .join("\n");
    if (text.trim()) out.lastText = text;
  }
  return out;
}

if (payload.model) state.model = payload.model;

switch (event) {
  case "SessionStart": {
    await send();
    break;
  }
  case "PostToolUse": {
    const tool = String(payload.tool_name ?? "unknown").slice(0, 64);
    const heartbeat = { toolCalls: 1, tools: { [tool]: 1 } };
    if (tool === "WebFetch" || tool === "WebSearch") {
      const failed =
        payload.tool_response?.is_error === true ||
        (typeof payload.tool_response === "string" && /^error/i.test(payload.tool_response));
      heartbeat[failed ? "fetchesError" : "fetchesOk"] = 1;
    }
    await send(heartbeat);
    break;
  }
  case "Stop": {
    const delta = readTranscriptDelta();
    await send({ tokensIn: delta.tokensIn, tokensOut: delta.tokensOut });
    if (STREAM_LOGS && state.agentId && delta.lastText) {
      await post("/api/v1/logs", { agentId: state.agentId, lines: toLogLines(delta.lastText) });
    }
    break;
  }
  case "SessionEnd": {
    if (state.agentId) await post("/api/v1/goodbye", { agentId: state.agentId });
    break;
  }
  default:
    break;
}

saveState(sessionKey, state);
process.exit(0);
