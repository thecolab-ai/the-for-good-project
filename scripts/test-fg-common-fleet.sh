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
#   - fleet_claim_review: claims with kind:"review", emits {pr, headSha,
#     author, title, leaseTtlSeconds}, and returns 1 on empty-queue /
#     non-JSON / server down (the PR-walk fallback contract, ADR-0019)
#   - fleet_release_review: sends kind:"review" done/abandoned payloads
#     (issue = the PR number) and swallows server failures
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
        elif mode == "review":
            payload = {
                "ok": True,
                "review": {"pr": 456, "title": "stub PR", "author": "someauthor",
                           "headSha": "0123456789abcdef0123456789abcdef01234567",
                           "htmlUrl": "https://github.com/example/repo/pull/456",
                           "baseRef": "main", "headRef": "research/stub"},
                "assignmentId": "rev123",
                "leaseTtlSeconds": 3600,
                "handle": "review-bot",
            }
        elif mode == "review-empty":
            payload = {"ok": True, "review": None}
        elif mode == "rework":
            payload = {
                "ok": True,
                "rework": {"pr": 456, "issue": 234, "title": "stub PR", "author": "someauthor",
                           "headSha": "0123456789abcdef0123456789abcdef01234567",
                           "htmlUrl": "https://github.com/example/repo/pull/456",
                           "headRef": "research/stub"},
                "assignmentId": "rw123",
                "leaseTtlSeconds": 1800,
                "handle": "rework-bot",
            }
        elif mode == "rework-empty":
            payload = {"ok": True, "rework": None}
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

# --- fleet_claim_review (kind: "review", ADR-0019) ------------------------------
# Disabled → documented no-op return codes (same contract as the work helpers).
( FLEET_CLAIM=0 fleet_claim_review ) && fail "fleet_claim_review must return 1 when disabled"
( FLEET_CLAIM=0 fleet_release_review 1 done ) || fail "fleet_release_review must return 0 when disabled"
pass "disabled review helpers no-op with the right return codes"

printf 'review' > "$MODE_FILE"
resp="$(AGENT=claude MODEL=test-model fleet_claim_review)" \
  || fail "fleet_claim_review should succeed against the stub"
[ "$(printf '%s' "$resp" | jq -r '.pr')" = "456" ] \
  || fail "fleet_claim_review must emit .pr (got: $resp)"
[ "$(printf '%s' "$resp" | jq -r '.handle')" = "review-bot" ] \
  || fail "fleet_claim_review must emit .handle — the caller checks it against the posting identity (got: $resp)"
[ "$(printf '%s' "$resp" | jq -r '.headSha')" = "0123456789abcdef0123456789abcdef01234567" ] \
  || fail "fleet_claim_review must emit .headSha (got: $resp)"
[ "$(printf '%s' "$resp" | jq -r '.author')" = "someauthor" ] \
  || fail "fleet_claim_review must emit .author (got: $resp)"
[ "$(printf '%s' "$resp" | jq -r '.title')" = "stub PR" ] \
  || fail "fleet_claim_review must emit .title (got: $resp)"
[ "$(printf '%s' "$resp" | jq -r '.leaseTtlSeconds')" = "3600" ] \
  || fail "fleet_claim_review must pass leaseTtlSeconds through (got: $resp)"
req="$(tail -1 "$LOG_FILE")"
[ "$(printf '%s' "$req" | jq -r .path)" = "/api/v1/work/claim" ] || fail "review claim path"
printf '%s' "$req" | jq -e '.auth == "Bearer fgt_0123456789abcdef0123456789abcdef"' >/dev/null \
  || fail "review claim must send the bearer token"
printf '%s' "$req" | jq -e '.body | fromjson | .kind == "review" and .harness == "claude" and .model == "test-model" and (has("stages") | not)' >/dev/null \
  || fail "review claim body must carry kind:review + harness/model, no stages (got: $req)"
pass "fleet_claim_review emits {pr, headSha, author, title, leaseTtlSeconds} and sends kind:review"

# Fallback contract: empty review queue / garbage / server down → rc 1 (PR walk).
printf 'review-empty' > "$MODE_FILE"
fleet_claim_review && fail "empty review queue must return 1 (PR-walk fallback)"
printf 'garbage' > "$MODE_FILE"
fleet_claim_review && fail "non-JSON review claim response must return 1"
printf 'review' > "$MODE_FILE"
( FLEET_SERVER="http://127.0.0.1:9" fleet_claim_review ) && fail "server down must return 1"
pass "fleet_claim_review returns 1 on empty/garbage/down (PR-walk fallback contract)"

# DEPLOY-SKEW GUARD: a pre-ADR-0019 server strips the unknown `kind` and
# executes a WORK claim ({ok:true, issue:{...}}, labels already written on a
# real issue). fleet_claim_review must release that accidental claim
# (abandoned → the server reverts the labels) and still return 1.
printf 'claim' > "$MODE_FILE"
fleet_claim_review && fail "a work-shaped claim response must return 1 (old server)"
req="$(tail -1 "$LOG_FILE")"
[ "$(printf '%s' "$req" | jq -r .path)" = "/api/v1/work/release" ] \
  || fail "skew guard must release the accidental work claim (last request: $req)"
printf '%s' "$req" | jq -e '.body | fromjson | .issue == 123 and .outcome == "abandoned"' >/dev/null \
  || fail "skew release must abandon the claimed issue so its labels revert (got: $req)"
pass "old-server skew: accidental work claim is released abandoned, rc 1 (walk fallback)"

# --- fleet_release_review payloads ----------------------------------------------
fleet_release_review 456 done || fail "fleet_release_review done must return 0"
req="$(tail -1 "$LOG_FILE")"
[ "$(printf '%s' "$req" | jq -r .path)" = "/api/v1/work/release" ] || fail "review release path"
printf '%s' "$req" | jq -e '.body | fromjson | .kind == "review" and .issue == 456 and .outcome == "done"' >/dev/null \
  || fail "review release done payload — issue carries the PR number (got: $req)"
fleet_release_review 456 abandoned || fail "fleet_release_review abandoned must return 0"
req="$(tail -1 "$LOG_FILE")"
printf '%s' "$req" | jq -e '.body | fromjson | .kind == "review" and .issue == 456 and .outcome == "abandoned"' >/dev/null \
  || fail "review release abandoned payload (got: $req)"
( FLEET_SERVER="http://127.0.0.1:9" fleet_release_review 456 done ) || fail "review release must swallow server failures"
printf 'claim' > "$MODE_FILE"
pass "fleet_release_review sends kind:review done/abandoned payloads and swallows failures"

# --- fleet_claim_rework (kind: "rework", ADR-0020) ------------------------------
# Disabled → documented no-op return codes (same contract as the other helpers).
( FLEET_CLAIM=0 fleet_claim_rework ) && fail "fleet_claim_rework must return 1 when disabled"
( FLEET_CLAIM=0 fleet_release_rework 234 done 456 ) || fail "fleet_release_rework must return 0 when disabled"
pass "disabled rework helpers no-op with the right return codes"

printf 'rework' > "$MODE_FILE"
resp="$(AGENT=claude MODEL=test-model fleet_claim_rework)" \
  || fail "fleet_claim_rework should succeed against the stub"
[ "$(printf '%s' "$resp" | jq -r '.pr')" = "456" ] || fail "fleet_claim_rework must emit .pr (got: $resp)"
[ "$(printf '%s' "$resp" | jq -r '.issue')" = "234" ] || fail "fleet_claim_rework must emit .issue (got: $resp)"
[ "$(printf '%s' "$resp" | jq -r '.author')" = "someauthor" ] || fail "fleet_claim_rework must emit .author (got: $resp)"
[ "$(printf '%s' "$resp" | jq -r '.headSha')" = "0123456789abcdef0123456789abcdef01234567" ] || fail "fleet_claim_rework must emit .headSha (got: $resp)"
[ "$(printf '%s' "$resp" | jq -r '.headRef')" = "research/stub" ] || fail "fleet_claim_rework must emit .headRef (got: $resp)"
[ "$(printf '%s' "$resp" | jq -r '.leaseTtlSeconds')" = "1800" ] || fail "fleet_claim_rework must pass leaseTtlSeconds through (got: $resp)"
[ "$(printf '%s' "$resp" | jq -r '.handle')" = "rework-bot" ] || fail "fleet_claim_rework must emit .handle (got: $resp)"
req="$(tail -1 "$LOG_FILE")"
[ "$(printf '%s' "$req" | jq -r .path)" = "/api/v1/work/claim" ] || fail "rework claim path"
printf '%s' "$req" | jq -e '.body | fromjson | .kind == "rework" and .harness == "claude" and .model == "test-model" and (has("stages") | not)' >/dev/null \
  || fail "rework claim body must carry kind:rework + harness/model, no stages (got: $req)"
pass "fleet_claim_rework emits {pr, issue, author, headSha, headRef, leaseTtlSeconds, handle} and sends kind:rework"

# Fallback contract: empty adopt queue / garbage / server down → rc 1 (skip adoption).
printf 'rework-empty' > "$MODE_FILE"
fleet_claim_rework && fail "empty rework queue must return 1 (skip adoption)"
printf 'garbage' > "$MODE_FILE"
fleet_claim_rework && fail "non-JSON rework claim response must return 1"
printf 'rework' > "$MODE_FILE"
( FLEET_SERVER="http://127.0.0.1:9" fleet_claim_rework ) && fail "server down must return 1"
pass "fleet_claim_rework returns 1 on empty/garbage/down (skip-adoption fallback contract)"

# DEPLOY-SKEW GUARD: a pre-ADR-0020 server strips the unknown `kind` and runs a
# WORK claim ({ok:true, issue:{...}}). fleet_claim_rework must release that
# accidental claim (abandoned) and return 1.
printf 'claim' > "$MODE_FILE"
fleet_claim_rework && fail "a work-shaped claim response must return 1 (old server)"
req="$(tail -1 "$LOG_FILE")"
[ "$(printf '%s' "$req" | jq -r .path)" = "/api/v1/work/release" ] \
  || fail "skew guard must release the accidental work claim (last request: $req)"
printf '%s' "$req" | jq -e '.body | fromjson | .issue == 123 and .outcome == "abandoned"' >/dev/null \
  || fail "skew release must abandon the claimed issue (got: $req)"
pass "old-server skew: accidental work claim is released abandoned, rc 1"

# --- fleet_release_rework payloads ----------------------------------------------
fleet_release_rework 234 done 456 || fail "fleet_release_rework done must return 0"
req="$(tail -1 "$LOG_FILE")"
[ "$(printf '%s' "$req" | jq -r .path)" = "/api/v1/work/release" ] || fail "rework release path"
printf '%s' "$req" | jq -e '.body | fromjson | .kind == "rework" and .issue == 234 and .prNumber == 456 and .outcome == "done"' >/dev/null \
  || fail "rework release done payload — issue is the worked issue, prNumber the PR (got: $req)"
fleet_release_rework 234 abandoned || fail "fleet_release_rework abandoned must return 0"
req="$(tail -1 "$LOG_FILE")"
printf '%s' "$req" | jq -e '.body | fromjson | .kind == "rework" and .issue == 234 and .outcome == "abandoned"' >/dev/null \
  || fail "rework release abandoned payload (got: $req)"
( FLEET_SERVER="http://127.0.0.1:9" fleet_release_rework 234 done 456 ) || fail "rework release must swallow server failures"
printf 'claim' > "$MODE_FILE"
pass "fleet_release_rework sends kind:rework done/abandoned payloads and swallows failures"

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

# --- per-identity token files: two identities, one box (ADR-0019) --------------
# The stored token is keyed by host AND handle: autopilot's WORK login and the
# distinct REVIEW_GITHUB_TOKEN reviewer must never share a bearer token, or the
# server's author != handle review rule is enforced against the wrong account.
unset FLEET_TOKEN FLEET_TOKEN_FILE
HOME_SAVE="$HOME"; export HOME="$TMP/home"; mkdir -p "$HOME"
ME="worker-id"
fleet_claim_enabled || fail "worker identity must auto-enroll"
worker_file="$(fleet_token_file)"
case "$worker_file" in
  *"-worker-id") : ;;
  *) fail "token file must be keyed by identity (got $worker_file)" ;;
esac
[ -f "$worker_file" ] || fail "worker token must be stored at its per-identity path"
unset FLEET_TOKEN
ME="reviewer-id"
reviewer_file="$(fleet_token_file)"
[ "$reviewer_file" != "$worker_file" ] || fail "distinct identities must not share a token file"
fleet_claim_enabled || fail "reviewer identity must enroll its OWN token"
[ -f "$reviewer_file" ] || fail "reviewer token must be stored at its own per-identity path"
pass "two identities on one host get two token files (no cross-identity reuse)"

# Migration: an identity enrolled before per-identity keying 409s on
# re-enroll — its legacy host-only token is adopted once and migrated.
unset FLEET_TOKEN
ME="legacy-id"
rm -f "$(fleet_token_file)"
legacy_file="$(fleet_legacy_token_file)"
mkdir -p "$(dirname "$legacy_file")"
( umask 077; printf 'fgt_legacy0123456789abcdef01234567' > "$legacy_file" )
printf 'enroll409' > "$MODE_FILE"
fleet_claim_enabled || fail "enroll 409 with a legacy host-only token on disk must adopt it"
[ "$FLEET_TOKEN" = "fgt_legacy0123456789abcdef01234567" ] \
  || fail "adopted token must come from the legacy file (got ${FLEET_TOKEN:-unset})"
[ -f "$(fleet_token_file)" ] || fail "legacy token must be migrated to the per-identity path"
printf 'claim' > "$MODE_FILE"
export HOME="$HOME_SAVE"
unset ME FLEET_TOKEN
pass "legacy host-only token adopted + migrated on enroll 409 (single-identity continuity)"

echo "ALL FLEET CLIENT TESTS PASSED"
