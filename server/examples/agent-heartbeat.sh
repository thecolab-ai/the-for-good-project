#!/usr/bin/env bash
#
# Minimal curl-based worker client for the fleet server — the shape of what
# autopilot.sh will call each cycle. Pure HTTP: no WebSocket needed, and if the
# server is down every call no-ops (|| true) so the worker never blocks on it.
# GitHub remains the source of truth; this is telemetry only.
#
# Usage:
#   FLEET_SERVER=http://localhost:8787 HANDLE=you HARNESS=claude MODEL=claude-fable-5 \
#     ./agent-heartbeat.sh
set -euo pipefail

FLEET_SERVER="${FLEET_SERVER:-http://127.0.0.1:8787}"
HANDLE="${HANDLE:-$(git config user.name 2>/dev/null || echo unknown)}"
HARNESS="${HARNESS:-claude}"
MODEL="${MODEL:-unknown}"
AGENT_ID_FILE="${AGENT_ID_FILE:-/tmp/fg-agent-id}"

# post <json> — returns the response body, never fails the caller.
post() {
  curl -sS -m 5 -X POST "$FLEET_SERVER/api/v1/telemetry" \
    -H 'content-type: application/json' -d "$1" 2>/dev/null || true
}

AGENT_ID="$(cat "$AGENT_ID_FILE" 2>/dev/null || true)"

# Hello + heartbeat in one post. Counters are DELTAS since the last post.
body=$(cat <<JSON
{
  $( [ -n "$AGENT_ID" ] && printf '"agentId": "%s",' "$AGENT_ID" )
  "handle": "$HANDLE",
  "harness": "$HARNESS",
  "model": "$MODEL",
  "task": { "kind": "work", "ref": "${TASK_REF:-}", "title": "${TASK_TITLE:-}" },
  "heartbeat": {
    "tokensIn": ${TOKENS_IN:-0},
    "tokensOut": ${TOKENS_OUT:-0},
    "toolCalls": ${TOOL_CALLS:-0}
  }
}
JSON
)

resp="$(post "$body")"
# Persist the agentId the server issued so subsequent posts reuse the session.
id="$(printf '%s' "$resp" | sed -n 's/.*"agentId":"\([^"]*\)".*/\1/p')"
[ -n "$id" ] && printf '%s' "$id" > "$AGENT_ID_FILE"
echo "fleet server: ${resp:-unreachable (continuing without telemetry)}"
