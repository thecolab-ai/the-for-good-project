#!/usr/bin/env bash
# Unit/smoke tests for the fleet pull-claim client helpers in
# scripts/fg-common.sh (spec bullet 8 — runner integration):
#   - fleet_claim_enabled: hard OFF unless FLEET_SERVER + FLEET_TOKEN +
#     FLEET_CLAIM=1 are ALL set (default runs keep the exact label flow)
#   - fleet_claim: emits {issue, leaseTtlSeconds, handle} on ok:true+issue, sends the
#     bearer + request body, and returns 1 on empty-queue / non-JSON / server
#     down (the label-claim fallback contract)
#   - fleet_release: sends done-with-prNumber vs abandoned payloads and
#     swallows server failures
#   - fleet_renew: fire-and-forget, always returns 0
#   - fleet_pop_commands: drains the stash once, and REFUSES a stash file we
#     don't own (the control hop is unauthenticated — a foreign /tmp file
#     must never drive stop/pause)
# Runs against a tiny python3 stub HTTP server on 127.0.0.1 — no gh, no
# network, no real fleet server.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT/scripts/fg-common.sh"

fail() { echo "FAIL: $*" >&2; exit 1; }
pass() { echo "ok: $*"; }

TMP="$(mktemp -d "${TMPDIR:-/tmp}/fg-fleet-test.XXXXXX")"
STUB_PID=""
cleanup() {
  [ -n "$STUB_PID" ] && kill "$STUB_PID" 2>/dev/null || true
  rm -rf "$TMP" 2>/dev/null || true
}
trap cleanup EXIT

# --- stub fleet server ------------------------------------------------------
# Behaviour keyed on the request path + a mode file the test flips. Every
# request (path + body + auth header) is appended to $TMP/requests.log.
PORT_FILE="$TMP/port"
MODE_FILE="$TMP/mode"; printf 'claim' > "$MODE_FILE"
LOG_FILE="$TMP/requests.log"; : > "$LOG_FILE"
python3 - "$PORT_FILE" "$MODE_FILE" "$LOG_FILE" <<'PY' &
import json, sys
from http.server import BaseHTTPRequestHandler, HTTPServer

port_file, mode_file, log_file = sys.argv[1:]

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        n = int(self.headers.get("content-length", 0))
        body = self.rfile.read(n).decode() if n else ""
        auth = self.headers.get("authorization", "")
        with open(log_file, "a") as f:
            f.write(json.dumps({"path": self.path, "body": body, "auth": auth}) + "\n")
        mode = open(mode_file).read().strip()
        if self.path == "/api/v1/agents/enroll":
            if mode == "enroll409":
                raw = json.dumps({"ok": False, "error": "handle already enrolled"}).encode()
                self.send_response(409)
            else:
                raw = json.dumps({"ok": True, "token": "fgt_" + "ab" * 16,
                                  "handle": "testuser", "tier": "standard"}).encode()
                self.send_response(200)
            self.send_header("content-type", "application/json")
            self.send_header("content-length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)
            return
        if mode == "empty":
            payload = {"ok": True, "issue": None}
        elif mode == "garbage":
            self.send_response(200); self.end_headers()
            self.wfile.write(b"this is not json"); return
        else:
            payload = {
                "ok": True,
                "issue": {"number": 123, "title": "stub issue", "labels": ["status: claimed"],
                          "body": "", "htmlUrl": "https://github.com/example/repo/issues/123",
                          "stage": "research", "stream": None},
                "assignmentId": "abc123",
                "leaseTtlSeconds": 300,
                "handle": "work-bot",
            }
        raw = json.dumps(payload).encode()
        self.send_response(200)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)
    def log_message(self, *a):
        pass

srv = HTTPServer(("127.0.0.1", 0), Handler)
with open(port_file, "w") as f:
    f.write(str(srv.server_address[1]))
srv.serve_forever()
PY
STUB_PID=$!
for _ in $(seq 1 50); do [ -s "$PORT_FILE" ] && break; sleep 0.1; done
[ -s "$PORT_FILE" ] || fail "stub server never started"
STUB_URL="http://127.0.0.1:$(cat "$PORT_FILE")"

# --- fleet_claim_enabled gating ---------------------------------------------
unset FLEET_SERVER FLEET_TOKEN FLEET_CLAIM 2>/dev/null || true
fleet_claim_enabled && fail "fleet_claim_enabled must be OFF with nothing set"
FLEET_SERVER="$STUB_URL"; fleet_claim_enabled && fail "server alone must not enable"
FLEET_TOKEN="fgt_0123456789abcdef0123456789abcdef"
fleet_claim_enabled && fail "server+token without FLEET_CLAIM=1 must not enable"
FLEET_CLAIM=0; fleet_claim_enabled && fail "FLEET_CLAIM=0 must not enable"
FLEET_CLAIM=1
fleet_claim_enabled || fail "server+token+FLEET_CLAIM=1 must enable"
export FLEET_SERVER FLEET_TOKEN FLEET_CLAIM
pass "fleet_claim_enabled gating (default off, all three required)"

# Disabled → every helper is a no-op with the documented return code.
( FLEET_CLAIM=0 fleet_claim ) && fail "fleet_claim must return 1 when disabled"
( FLEET_CLAIM=0 fleet_renew 1 ) || fail "fleet_renew must return 0 when disabled"
( FLEET_CLAIM=0 fleet_release 1 done ) || fail "fleet_release must return 0 when disabled"
pass "disabled helpers no-op with the right return codes"

# --- fleet_claim happy path ---------------------------------------------------
resp="$(AGENT=claude MODEL=test-model fleet_claim "research,ideate")" \
  || fail "fleet_claim should succeed against the stub"
[ "$(printf '%s' "$resp" | jq -r '.issue.number')" = "123" ] \
  || fail "fleet_claim must emit .issue (got: $resp)"
[ "$(printf '%s' "$resp" | jq -r '.leaseTtlSeconds')" = "300" ] \
  || fail "fleet_claim must pass the server's leaseTtlSeconds through (got: $resp)"
[ "$(printf '%s' "$resp" | jq -r '.handle')" = "work-bot" ] \
  || fail "fleet_claim must pass the server's claim handle through — race settlement compares against it (got: $resp)"
req="$(tail -1 "$LOG_FILE")"
[ "$(printf '%s' "$req" | jq -r .path)" = "/api/v1/work/claim" ] || fail "claim path"
printf '%s' "$req" | jq -e '.auth == "Bearer fgt_0123456789abcdef0123456789abcdef"' >/dev/null \
  || fail "claim must send the bearer token"
printf '%s' "$req" | jq -e '.body | fromjson | .stages == ["research","ideate"] and .harness == "claude" and .model == "test-model"' >/dev/null \
  || fail "claim body must carry stages/harness/model (got: $req)"
pass "fleet_claim emits {issue, leaseTtlSeconds, handle} and sends the right request"

# --- fleet_claim fallback contract -------------------------------------------
printf 'empty' > "$MODE_FILE"
fleet_claim && fail "empty queue must return 1 (label-claim fallback)"
printf 'garbage' > "$MODE_FILE"
fleet_claim && fail "non-JSON response must return 1"
printf 'claim' > "$MODE_FILE"
( FLEET_SERVER="http://127.0.0.1:9" fleet_claim ) && fail "server down must return 1"
pass "fleet_claim returns 1 on empty/garbage/down (fallback contract)"

# --- fleet_release payloads ---------------------------------------------------
fleet_release 123 done 456 || fail "fleet_release done must return 0"
req="$(tail -1 "$LOG_FILE")"
[ "$(printf '%s' "$req" | jq -r .path)" = "/api/v1/work/release" ] || fail "release path"
printf '%s' "$req" | jq -e '.body | fromjson | .issue == 123 and .outcome == "done" and .prNumber == 456' >/dev/null \
  || fail "release done payload (got: $req)"
fleet_release 123 abandoned || fail "fleet_release abandoned must return 0"
req="$(tail -1 "$LOG_FILE")"
printf '%s' "$req" | jq -e '.body | fromjson | .outcome == "abandoned" and (has("prNumber") | not)' >/dev/null \
  || fail "release abandoned payload (got: $req)"
( FLEET_SERVER="http://127.0.0.1:9" fleet_release 123 done ) || fail "release must swallow server failures"
pass "fleet_release sends done/abandoned payloads and swallows failures"

# --- fleet_renew ---------------------------------------------------------------
fleet_renew 123 || fail "fleet_renew must return 0"
req="$(tail -1 "$LOG_FILE")"
[ "$(printf '%s' "$req" | jq -r .path)" = "/api/v1/work/renew" ] || fail "renew path"
printf '%s' "$req" | jq -e '.body | fromjson | .issue == 123' >/dev/null || fail "renew payload"
( FLEET_SERVER="http://127.0.0.1:9" fleet_renew 123 ) || fail "renew must swallow server failures"
pass "fleet_renew is fire-and-forget"

# --- fleet_pop_commands: drain-once + ownership guard --------------------------
FLEET_CMDS_FILE="$TMP/cmds"
printf 'pause\nresume\n' > "$FLEET_CMDS_FILE"
got="$(fleet_pop_commands | tr '\n' ' ' | sed 's/ $//')"
[ "$got" = "pause resume" ] || fail "fleet_pop_commands must drain the stash (got '$got')"
[ -s "$FLEET_CMDS_FILE" ] && fail "stash must be truncated after draining"
got="$(fleet_pop_commands)"
[ -z "$got" ] || fail "second pop must be empty"

# Unset / missing file → silent no-op.
( FLEET_CMDS_FILE="" fleet_pop_commands ) || fail "no stash file must be a no-op"
( FLEET_CMDS_FILE="$TMP/nonexistent" fleet_pop_commands ) || fail "missing stash must be a no-op"

# Ownership guard: a root-owned (or any foreign) file must be REFUSED, not
# obeyed. We can't chown as an unprivileged user, so simulate with a
# directory (not a regular file) and, when available, a foreign-owned file.
mkdir "$TMP/dir-stash"
got="$(FLEET_CMDS_FILE="$TMP/dir-stash" fleet_pop_commands)"
[ -z "$got" ] || fail "a non-regular-file stash must be refused"
foreign="$(find /proc/1 -maxdepth 1 -name status 2>/dev/null | head -1 || true)"
if [ -n "$foreign" ] && [ ! -O "$foreign" ]; then
  got="$(FLEET_CMDS_FILE="$foreign" fleet_pop_commands)"
  [ -z "$got" ] || fail "a stash owned by another user must be refused"
  pass "fleet_pop_commands: drain-once + refuses foreign/non-regular stashes"
else
  pass "fleet_pop_commands: drain-once + refuses non-regular stashes (no foreign file available to test ownership)"
fi

# --- fleet_ensure_token: TOFU auto-enroll (ADR-0017) ---------------------------
# No FLEET_TOKEN anywhere → first contact enrolls, stores the token 0600,
# and later runs reuse the stored file without re-enrolling.
unset FLEET_TOKEN
export FLEET_TOKEN_FILE="$TMP/fleet-token"
ME="testuser"
enrolls_before="$(grep -c '/api/v1/agents/enroll' "$LOG_FILE" || true)"
fleet_claim_enabled || fail "auto-enroll must resolve a token with no FLEET_TOKEN set"
[ "$FLEET_TOKEN" = "fgt_$(printf 'ab%.0s' 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16)" ] \
  || fail "FLEET_TOKEN must hold the enrolled token (got: ${FLEET_TOKEN:-unset})"
req="$(grep '/api/v1/agents/enroll' "$LOG_FILE" | tail -1)"
printf '%s' "$req" | jq -e '.body | fromjson | .handle == "testuser"' >/dev/null \
  || fail "enroll must send the gh identity as the handle (got: $req)"
[ -f "$FLEET_TOKEN_FILE" ] || fail "enrolled token must be stored"
[ "$(stat -c %a "$FLEET_TOKEN_FILE")" = "600" ] || fail "stored token must be 0600 (got $(stat -c %a "$FLEET_TOKEN_FILE"))"
pass "fleet_ensure_token enrolls on first contact and stores the token 0600"

# Stored token is reused — no second enroll request.
unset FLEET_TOKEN
fleet_claim_enabled || fail "stored token must be reused"
[ -n "$FLEET_TOKEN" ] || fail "FLEET_TOKEN must be loaded from the stored file"
enrolls_after="$(grep -c '/api/v1/agents/enroll' "$LOG_FILE" || true)"
[ "$enrolls_after" = "$((enrolls_before + 1))" ] \
  || fail "exactly ONE enroll request expected across both runs (got $enrolls_after)"
pass "stored token reused without re-enrolling"

# A symlinked token file is REFUSED (never read), and an enroll refusal (409:
# handle taken/revoked) falls back to the label path rather than looping.
unset FLEET_TOKEN
rm -f "$FLEET_TOKEN_FILE"; ln -s /etc/hostname "$FLEET_TOKEN_FILE"
printf 'enroll409' > "$MODE_FILE"
fleet_claim_enabled && fail "409 enrollment must disable fleet claiming (label-path fallback)"
[ -z "${FLEET_TOKEN:-}" ] || fail "a symlinked token file must never be read (got: $FLEET_TOKEN)"
rm -f "$FLEET_TOKEN_FILE"
printf 'claim' > "$MODE_FILE"
pass "symlinked token file refused; enroll 409 falls back to the label path"

echo "ALL FLEET CLIENT TESTS PASSED"
