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
      headers: { "content-type": "application/json" },
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
// Client-side redaction — mirrors server/src/redact.ts (the server redacts
// again; this keeps secrets from ever leaving the machine). Harm-reduction,
// not a guarantee: the real protection is that log streaming is default-off.

const REDACTED = "[redacted]";
const PATTERNS = [
  /\bgh[pousr]_[A-Za-z0-9_]{16,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{16,}\b/g,
  /\bsk-[A-Za-z0-9_-]{16,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\baws_secret_access_key\s*[=:]\s*\S+/gi,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}\b/g,
  /\b(?:bearer|basic)\s+[A-Za-z0-9._~+/=-]{16,}/gi,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g,
  /\b[A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIALS?|API_?KEY|PRIVATE_?KEY)[A-Z0-9_]*"?\s*[=:]\s*("[^"]*"|'[^']*'|\S+)/gi,
];

// URL userinfo credentials ("postgres://user:s3cr3t@host") — keep the scheme
// and user, scrub the password.
const URL_CREDS = /\b([a-z][a-z0-9+.-]*:\/\/[^\s/:@]+):([^\s/@]+)@/gi;

export function redact(text) {
  let out = String(text).replace(URL_CREDS, `$1:${REDACTED}@`);
  for (const re of PATTERNS) out = out.replace(re, REDACTED);
  return out;
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
