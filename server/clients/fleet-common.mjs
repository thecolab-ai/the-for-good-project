/**
 * Shared plumbing for the harness hook clients (Claude Code hooks, Codex
 * notify). Self-contained: Node >= 18 stdlib only, no npm install needed —
 * these scripts run inside contributors' harness sessions.
 *
 * Fail-open by design: if FLEET_SERVER is unset or unreachable, every call
 * no-ops fast and exits 0. Telemetry must never block or break real work —
 * GitHub stays the source of truth (#398).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { redactText } from "./redact-patterns.mjs";

export const FLEET_SERVER = (process.env.FLEET_SERVER ?? "").replace(/\/+$/, "");
export const STREAM_LOGS = process.env.STREAM_LOGS === "1";
export const HANDLE = process.env.FLEET_HANDLE || process.env.HANDLE || "";
export const POST_TIMEOUT_MS = 3000;

export function enabled() {
  return FLEET_SERVER.length > 0;
}

/** POST JSON to the fleet server; swallow every failure. Returns parsed body or null. */
export async function post(path, body) {
  if (!enabled()) return null;
  try {
    const res = await fetch(`${FLEET_SERVER}${path}`, {
      method: "POST",
      // Cloudflare's bot protection 403s default/absent client user-agents on
      // the tunnelled production server; an honest custom UA passes.
      headers: {
        "content-type": "application/json",
        "user-agent": "forgood-fleet-telemetry/1.0 (+https://github.com/thecolab-ai/the-for-good-project)",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(POST_TIMEOUT_MS),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Per-session state (agentId + transcript read offset), so each one-shot hook
// invocation can resume where the previous one left off.

function stateDir() {
  const dir = join(tmpdir(), "fg-fleet");
  try {
    mkdirSync(dir, { recursive: true });
  } catch {
    /* best effort */
  }
  return dir;
}

export function loadState(sessionKey) {
  try {
    return JSON.parse(readFileSync(join(stateDir(), `${sessionKey}.json`), "utf8"));
  } catch {
    return {};
  }
}

export function saveState(sessionKey, state) {
  try {
    writeFileSync(join(stateDir(), `${sessionKey}.json`), JSON.stringify(state));
  } catch {
    /* best effort */
  }
}

// ---------------------------------------------------------------------------
// Client-side redaction — the pattern library is shared with the server
// (./redact-patterns.mjs), so both sides always scrub identically. This pass
// keeps secrets from ever leaving the machine; the server redacts again.
// Harm-reduction, not a guarantee: the real protection is that log streaming
// is default-off.

export function redact(text) {
  return redactText(text);
}

/** Trim a block of session text into a small, redacted set of lines. */
export function toLogLines(text, maxLines = 12, maxLen = 500) {
  return redact(text)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(-maxLines)
    .map((l) => (l.length > maxLen ? `${l.slice(0, maxLen)}…` : l));
}

/** One-time loud consent warning when log streaming is on (issue #398). */
export function warnStreamingOnce(state) {
  if (!STREAM_LOGS || state.warned) return state;
  process.stderr.write(
    `[fleet] STREAM_LOGS=1 — your session transcript excerpts will be streamed to ${FLEET_SERVER}. ` +
      `Redaction is best-effort, NOT a guarantee; don't run this on a machine with sensitive material.\n`,
  );
  return { ...state, warned: true };
}
