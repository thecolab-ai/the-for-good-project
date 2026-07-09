#!/usr/bin/env node
/**
 * Codex CLI -> fleet server bridge, wired via Codex's `notify` hook.
 * In ~/.codex/config.toml:
 *
 *   notify = ["node", "/path/to/the-for-good-project/server/clients/codex-notify.mjs"]
 *
 * Codex invokes it with one JSON argument per event (currently
 * `agent-turn-complete`, carrying the turn's last assistant message). We turn
 * that into presence + a heartbeat, and — ONLY when STREAM_LOGS=1 — a small
 * redacted excerpt of the assistant's message for the dashboard feed.
 *
 * No-ops instantly unless FLEET_SERVER is set. Never blocks Codex: every
 * network call is fire-and-forget with a short timeout.
 *
 * Telemetry is coarser than the Claude Code hook client: Codex's notify only
 * fires per turn, so there are no per-tool-call counts or token deltas here.
 */
import { enabled, loadState, post, saveState, STREAM_LOGS, toLogLines, warnStreamingOnce, HANDLE } from "./fleet-common.mjs";

if (!enabled()) process.exit(0);

let event = {};
try {
  event = JSON.parse(process.argv[2] ?? "{}");
} catch {
  process.exit(0);
}

// Codex payload keys are kebab-case; be liberal in what we accept.
const get = (obj, ...keys) => keys.map((k) => obj?.[k]).find((v) => v !== undefined);
const type = get(event, "type") ?? "";
if (type && type !== "agent-turn-complete") process.exit(0);

const sessionKey = `codex-${get(event, "conversation-id", "conversation_id", "turn-id", "turn_id") ?? "default"}`.slice(0, 80);
let state = loadState(sessionKey);
state = warnStreamingOnce(state);

const hello = {
  handle: HANDLE || "unknown",
  harness: "codex",
  model: process.env.FLEET_MODEL || process.env.MODEL || "codex",
  ...(process.env.TASK_REF || process.env.TASK_TITLE
    ? { task: { kind: "work", ref: process.env.TASK_REF, title: process.env.TASK_TITLE } }
    : {}),
};

// Hello-only upsert: refreshes presence without a no-op heartbeat frame.
const resp = await post("/api/v1/telemetry", {
  ...(state.agentId ? { agentId: state.agentId } : {}),
  // Stable per-session key so the server dedups first/raced posts (#398).
  session: sessionKey,
  ...hello,
});
if (resp?.agentId) state.agentId = resp.agentId;

const lastMessage = get(event, "last-assistant-message", "last_assistant_message");
if (STREAM_LOGS && state.agentId && typeof lastMessage === "string" && lastMessage.trim()) {
  await post("/api/v1/logs", { agentId: state.agentId, lines: toLogLines(lastMessage) });
}

saveState(sessionKey, state);
process.exit(0);
