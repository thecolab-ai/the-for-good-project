#!/usr/bin/env bash
# Shared helpers for The For Good Project automation scripts
# (start_work.sh, review_work.sh). Not meant to be run directly.

REPO="${FOR_GOOD_REPO:-thecolab-ai/the-for-good-project}"
OWNER="${REPO%%/*}"
NAME="${REPO##*/}"
AGENT="${AGENT:-claude}"                # claude | codex | hermes  (default claude; env or CLI can override)
MODEL="${MODEL:-}"                       # optional model override
PROVIDER="${PROVIDER:-}"                 # optional provider override (Hermes only)
HERMES_PROFILE="${HERMES_PROFILE:-}"     # optional Hermes profile override
AGENT_TIMEOUT="${AGENT_TIMEOUT:-2400}"   # seconds per agent run (0 = none)
CLAIM_TTL="${CLAIM_TTL:-7200}"           # secs a claimed-but-undelivered issue is held before reap.sh frees it
MAX_ACTIVE_STREAMS="${MAX_ACTIVE_STREAMS:-25}"  # streams worked concurrently before new roots wait in the backlog (#292)
HIGH_PRIORITY_CAP="${HIGH_PRIORITY_CAP:-5}"    # max STREAMS whose 'priority: high' items jump the queue (#293)
CLAIM_SETTLE="${CLAIM_SETTLE:-8}"        # base secs to let racing claimants' assignments settle before the tie-break
REWORK_TTL="${REWORK_TTL:-7200}"         # secs a sent-back rework is held for its author before reap.sh frees it
USAGE_LIMIT_SLEEP="${USAGE_LIMIT_SLEEP:-3600}"  # secs to back off when an agent hits an API usage/rate limit (60 min)
REVIEW_CHECK_CONTEXT="for-good/adversarial-review"
RUNS_AGENT="${RUNS_AGENT:-0}"             # scripts that call run_agent set this to 1

# parse_agent_args "$@" — let callers pass the agent as a positional word
# (claude|codex|hermes) and the model via --model <name> / --model=<name> / -m <name>.
# CLI wins over the AGENT/MODEL env vars. Unknown args are ignored so each
# script can still read its own env-driven options. Call it right after sourcing.
parse_agent_args() {
  while [ $# -gt 0 ]; do
    case "$1" in
      claude|codex|hermes) AGENT="$1"; shift ;;
      --model|-m)     MODEL="${2:-}"; shift 2 || shift ;;
      --model=*)      MODEL="${1#*=}"; shift ;;
      *)              shift ;;
    esac
  done
}

# ---- pretty logging ----
c_reset=$'\e[0m'; c_dim=$'\e[2m'; c_blue=$'\e[34m'; c_green=$'\e[32m'; c_yellow=$'\e[33m'; c_red=$'\e[31m'; c_bold=$'\e[1m'
log()  { printf '%s%s%s\n' "$c_dim" "$*" "$c_reset"; }
info() { printf '%s▸%s %s\n' "$c_blue" "$c_reset" "$*"; }
ok()   { printf '%s✓%s %s\n' "$c_green" "$c_reset" "$*"; }
warn() { printf '%s!%s %s\n' "$c_yellow" "$c_reset" "$*"; }
err()  { printf '%s✗%s %s\n' "$c_red" "$c_reset" "$*" >&2; }
rule() { printf '%s────────────────────────────────────────────────%s\n' "$c_dim" "$c_reset"; }

# ---- fleet server work-claim helpers (server-orchestrated pull-claim) ----
# Opt-in integration with the fleet server's work orchestrator. DEFAULT OFF:
# every function below is a hard no-op unless ALL of FLEET_SERVER, FLEET_TOKEN
# and FLEET_CLAIM=1 are set, so default runs keep the exact label-claim flow.
# The telemetry side (fleet_send / fleet_logs) lives in autopilot.sh; these
# live here so start_work.sh (which has no telemetry helpers) can claim,
# renew and release too.
# Where the auto-enrolled token lives (0600, owner-only). One file per
# server host AND per identity: the server binds every token to one handle,
# and two identities routinely share a box (autopilot's WORK login + the
# distinct REVIEW_GITHUB_TOKEN reviewer). A host-only file made the reviewer
# silently reuse the work identity's token, so the server's author != handle
# review rule was enforced against the wrong account (ADR-0019).
fleet_token_host() { printf '%s' "${FLEET_SERVER:-}" | sed 's|^[a-z]*://||; s|[/:].*$||'; }

fleet_token_file() {
  local host ident
  host="$(fleet_token_host)"
  ident="${ME:-${FLEET_HANDLE:-}}"
  if [ -n "$ident" ]; then
    printf '%s' "${FLEET_TOKEN_FILE:-$HOME/.forgood/fleet-token-${host:-default}-${ident}}"
  else
    printf '%s' "${FLEET_TOKEN_FILE:-$HOME/.forgood/fleet-token-${host:-default}}"
  fi
}

# The pre-identity-keyed path — read once as a migration fallback when this
# identity's enrollment 409s (its token was minted before per-identity files).
fleet_legacy_token_file() {
  local host; host="$(fleet_token_host)"
  printf '%s/.forgood/fleet-token-%s' "$HOME" "${host:-default}"
}

# fleet_ensure_token — resolve FLEET_TOKEN: env var > stored file > TOFU
# auto-enroll against the server (ADR-0017: first contact mints the token,
# so nobody hands tokens out). Returns 1 when no token can be resolved (the
# caller falls back to the label-claim path). The stored file is trusted
# only when it is a regular, non-symlink file we own — same paranoia as the
# command stash: a foreign-writable path must never feed a bearer token.
fleet_ensure_token() {
  [ -n "${FLEET_TOKEN:-}" ] && return 0
  [ -n "${FLEET_SERVER:-}" ] || return 1
  local f; f="$(fleet_token_file)"
  if [ -f "$f" ] && [ ! -L "$f" ] && [ -O "$f" ]; then
    FLEET_TOKEN="$(head -c 256 "$f" 2>/dev/null | tr -d '[:space:]')"
    [ -n "$FLEET_TOKEN" ] && { export FLEET_TOKEN; return 0; }
  fi
  # First contact: enroll this gh identity. 409 = the handle is already
  # enrolled somewhere else (or was revoked) — that's an operator
  # conversation, not something to retry every loop.
  local resp token
  resp="$(curl -sS -m 5 -X POST "$FLEET_SERVER/api/v1/agents/enroll" \
    -H 'content-type: application/json' \
    -d "$(jq -cn --arg h "${ME:-${FLEET_HANDLE:-}}" --arg a "${AGENT:-}" --arg m "${MODEL:-}" '
        {handle: $h}
      + (if $a != "" then {harness: $a[0:32]} else {} end)
      + (if $m != "" then {model: $m[0:128]} else {} end)')" 2>/dev/null)" || return 1
  token="$(printf '%s' "$resp" | jq -r 'select(.ok == true) | .token // empty' 2>/dev/null || true)"
  if [ -z "$token" ]; then
    # 409 "handle already enrolled" + a legacy host-only token file on disk:
    # this identity enrolled before token files were keyed by handle — adopt
    # its stored token once, migrating it to the per-identity path. Skipped
    # when FLEET_TOKEN_FILE pins an explicit path (operator override), and
    # harmless if the legacy file actually belongs to a DIFFERENT identity:
    # the server still authenticates it as its bound handle, and the claim
    # response's `handle` field exposes the mismatch to the runner.
    if [ -z "${FLEET_TOKEN_FILE:-}" ] && printf '%s' "$resp" | grep -qi 'already enrolled'; then
      local legacy; legacy="$(fleet_legacy_token_file)"
      if [ "$legacy" != "$f" ] && [ -f "$legacy" ] && [ ! -L "$legacy" ] && [ -O "$legacy" ]; then
        token="$(head -c 256 "$legacy" 2>/dev/null | tr -d '[:space:]')"
        if [ -n "$token" ]; then
          ( umask 077; mkdir -p "$(dirname "$f")" && printf '%s' "$token" > "$f" ) || true
          FLEET_TOKEN="$token"; export FLEET_TOKEN
          warn "Adopted the legacy host-keyed fleet token for @${ME:-${FLEET_HANDLE:-?}} (migrated to $f)."
          return 0
        fi
      fi
    fi
    warn "fleet enrollment failed for @${ME:-${FLEET_HANDLE:-?}}: $(printf '%s' "$resp" | jq -r '.error // "server unreachable"' 2>/dev/null || echo 'server unreachable') — using the label-claim path."
    return 1
  fi
  ( umask 077; mkdir -p "$(dirname "$f")" && printf '%s' "$token" > "$f" ) || true
  FLEET_TOKEN="$token"; export FLEET_TOKEN
  ok "Enrolled @${ME:-${FLEET_HANDLE:-?}} with the fleet server (token stored in $f)"
  return 0
}

fleet_claim_enabled() {
  [ -n "${FLEET_SERVER:-}" ] && [ "${FLEET_CLAIM:-0}" = "1" ] && fleet_ensure_token
}

# fleet_claim [stages-csv] — ask the server for the next eligible issue. On
# success prints {issue: ClaimedIssue, leaseTtlSeconds} — the issue object is
# {number,title,labels,body,htmlUrl,stage,stream}, and leaseTtlSeconds is the
# server's ACTUAL lease TTL so the caller can derive its renew cadence from
# it (a fixed client-side cadence silently expires every lease when the
# server runs a shorter LEASE_TTL_SECONDS) — and returns 0. The server has
# already taken the lease AND written the claim labels + assignee itself, so
# the caller must NOT run its own label claim.
# Queue empty, non-200, bad JSON or timeout → returns 1 (caller falls back to
# the label-claim path).
fleet_claim() {
  fleet_claim_enabled || return 1
  local stages="${1:-}" agent_id="" body resp
  if [ -n "${FLEET_AGENT_ID_FILE:-}" ]; then
    agent_id="$(cat "$FLEET_AGENT_ID_FILE" 2>/dev/null || true)"
    # claimRequestSchema wants a UUID — never let a stale/garbled stash 400 the claim.
    printf '%s' "$agent_id" | grep -qiE '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' || agent_id=""
  fi
  body="$(jq -cn --arg stages "$stages" --arg harness "${AGENT:-}" \
                 --arg model "${MODEL:-}" --arg agentId "$agent_id" '
      (if $stages  != "" then {stages: ($stages | split(","))} else {} end)
    + (if $harness != "" then {harness: $harness[0:32]} else {} end)
    + (if $model   != "" then {model: $model[0:128]} else {} end)
    + (if $agentId != "" then {agentId: $agentId} else {} end)' 2>/dev/null)" || return 1
  resp="$(curl -sS -m 5 -X POST "$FLEET_SERVER/api/v1/work/claim" \
    -H 'content-type: application/json' \
    -H "authorization: Bearer $FLEET_TOKEN" \
    -d "$body" 2>/dev/null)" || return 1
  printf '%s' "$resp" | jq -e '.ok == true and .issue != null' >/dev/null 2>&1 || return 1
  # handle = the registry identity the server claimed FOR (the token's bound
  # handle). It can differ from the local `gh` login (bot-handle tokens), so
  # race settlement must compare against it, not $ME.
  printf '%s' "$resp" | jq -c '{issue: .issue, leaseTtlSeconds: .leaseTtlSeconds, handle: .handle}'
}

# fleet_renew <issue> — best-effort lease renewal; every failure swallowed.
fleet_renew() {
  fleet_claim_enabled || return 0
  local body
  body="$(jq -cn --arg issue "${1:-}" '{issue: ($issue | tonumber)}' 2>/dev/null)" || return 0
  curl -sS -m 5 -X POST "$FLEET_SERVER/api/v1/work/renew" \
    -H 'content-type: application/json' \
    -H "authorization: Bearer $FLEET_TOKEN" \
    -d "$body" >/dev/null 2>&1 || true
  return 0
}

# fleet_release <issue> <done|abandoned> [pr] — tell the server we're finished
# with a fleet-claimed issue. done = server frees the lease and does NOT touch
# labels (the PR/Actions pipeline owns post-work transitions); abandoned = the
# server reverts labels + assignee too. Best-effort: failures are swallowed —
# the lease TTL and the server-side sweeper backstop a lost release.
fleet_release() {
  fleet_claim_enabled || return 0
  local body
  body="$(jq -cn --arg issue "${1:-}" --arg outcome "${2:-}" --arg pr "${3:-}" '
      {issue: ($issue | tonumber), outcome: $outcome}
    + (if $pr != "" then {prNumber: ($pr | tonumber)} else {} end)' 2>/dev/null)" || return 0
  curl -sS -m 5 -X POST "$FLEET_SERVER/api/v1/work/release" \
    -H 'content-type: application/json' \
    -H "authorization: Bearer $FLEET_TOKEN" \
    -d "$body" >/dev/null 2>&1 || true
  return 0
}

# ---- fleet server review-claim helpers (orchestrated review dispatch) ----
# Same opt-in gate as the work-claim helpers above (FLEET_SERVER + FLEET_TOKEN
# + FLEET_CLAIM=1 — fleet_claim_enabled): reviews reuse the /work/claim and
# /work/release endpoints with kind:"review", so review_work.sh can take ONE
# server-arbitrated PR instead of walking the whole open-PR list. A review
# claim holds NO labels and writes nothing to GitHub — the server-side lease
# alone stops two enrolled reviewers colliding on one PR.

# fleet_claim_review — ask the server for the next PR needing adversarial
# review. On success prints {pr, headSha, author, title, leaseTtlSeconds,
# handle} (jq-shaped from the claim response; `handle` is the registry
# identity the claim was made FOR — the caller must check it against the
# identity that will post the review) and returns 0. Queue empty, non-200,
# bad JSON or timeout → returns 1 (the caller falls back to its own
# client-side PR walk, unchanged). A pre-ADR-0019 server strips the unknown
# `kind` field and executes a WORK claim — see the skew guard inside.
fleet_claim_review() {
  fleet_claim_enabled || return 1
  local agent_id="" body resp
  if [ -n "${FLEET_AGENT_ID_FILE:-}" ]; then
    agent_id="$(cat "$FLEET_AGENT_ID_FILE" 2>/dev/null || true)"
    # claimRequestSchema wants a UUID — never let a stale/garbled stash 400 the claim.
    printf '%s' "$agent_id" | grep -qiE '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' || agent_id=""
  fi
  body="$(jq -cn --arg harness "${AGENT:-}" --arg model "${MODEL:-}" --arg agentId "$agent_id" '
      {kind: "review"}
    + (if $harness != "" then {harness: $harness[0:32]} else {} end)
    + (if $model   != "" then {model: $model[0:128]} else {} end)
    + (if $agentId != "" then {agentId: $agentId} else {} end)' 2>/dev/null)" || return 1
  resp="$(curl -sS -m 5 -X POST "$FLEET_SERVER/api/v1/work/claim" \
    -H 'content-type: application/json' \
    -H "authorization: Bearer $FLEET_TOKEN" \
    -d "$body" 2>/dev/null)" || return 1
  if ! printf '%s' "$resp" | jq -e '.ok == true and .review != null' >/dev/null 2>&1; then
    # DEPLOY-SKEW GUARD: a pre-ADR-0019 server's claim schema silently strips
    # the unknown `kind` field (non-strict zod object) and executes a WORK
    # claim — labelling "status: claimed" + assigning the handle on a REAL
    # issue — while answering {ok:true, issue:{...}}. Detect that shape and
    # release the accidental claim, or the issue strands claimed-by-nobody
    # until the server's lease TTL sweeps it, once per review pass.
    local oops
    oops="$(printf '%s' "$resp" | jq -r 'select(.ok == true) | .issue.number // empty' 2>/dev/null || true)"
    if [ -n "$oops" ]; then
      warn "Fleet server predates kind:review (deploy skew) — releasing the accidental work claim on #$oops."
      fleet_release "$oops" abandoned
    fi
    return 1
  fi
  printf '%s' "$resp" | jq -c '{pr: .review.pr, headSha: .review.headSha, author: .review.author, title: .review.title, leaseTtlSeconds: .leaseTtlSeconds, handle: .handle}'
}

# fleet_release_review <pr> <done|abandoned> — finish a fleet-claimed review.
# done = a verdict was actually posted (PASS and NEEDS_WORK both count — the
# review HAPPENED); abandoned = it didn't (reviewer failure / usage limit /
# interrupt / local skip), so the PR goes straight back into the review
# queue. No label ops either way (review claims never held any). The
# release request's `issue` field carries the PR number (the server's
# release schema reuses it for kind:"review"). Best-effort: failures are
# swallowed — the lease TTL and the server-side sweeper backstop a lost
# release.
fleet_release_review() {
  fleet_claim_enabled || return 0
  local body
  body="$(jq -cn --arg pr "${1:-}" --arg outcome "${2:-}" \
      '{kind: "review", issue: ($pr | tonumber), outcome: $outcome}' 2>/dev/null)" || return 0
  curl -sS -m 5 -X POST "$FLEET_SERVER/api/v1/work/release" \
    -H 'content-type: application/json' \
    -H "authorization: Bearer $FLEET_TOKEN" \
    -d "$body" >/dev/null 2>&1 || true
  return 0
}

# ---- fleet server rework-ADOPTION helpers (ADR-0020, #656) -----------------
# Same opt-in gate as the work/review claim helpers (fleet_claim_enabled). A
# rework claim asks the server for the next STALE changes-requested PR a
# DIFFERENT worker may adopt (idle > REWORK_ADOPT_HOURS, adopter ≠ author ≠
# last reviewer, not synthesis/framing, not a fork, author not online). The
# server takes the lease AND writes the issue labels (changes-requested →
# claimed) + assignee ITSELF, so the caller must NOT run its own claim — it
# just reworks the PR and, on push, flips the issue to in-review.

# fleet_claim_rework — ask the server to adopt the next stale rework. On success
# prints {pr, issue, author, headSha, headRef, title, leaseTtlSeconds, handle}
# and returns 0; queue empty / non-200 / bad JSON / timeout → returns 1. The
# same pre-ADR-0019 deploy-skew guard as fleet_claim_review: an old server
# strips the unknown `kind` and runs a WORK claim, which we detect and release.
fleet_claim_rework() {
  fleet_claim_enabled || return 1
  local agent_id="" body resp
  if [ -n "${FLEET_AGENT_ID_FILE:-}" ]; then
    agent_id="$(cat "$FLEET_AGENT_ID_FILE" 2>/dev/null || true)"
    printf '%s' "$agent_id" | grep -qiE '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' || agent_id=""
  fi
  body="$(jq -cn --arg harness "${AGENT:-}" --arg model "${MODEL:-}" --arg agentId "$agent_id" '
      {kind: "rework"}
    + (if $harness != "" then {harness: $harness[0:32]} else {} end)
    + (if $model   != "" then {model: $model[0:128]} else {} end)
    + (if $agentId != "" then {agentId: $agentId} else {} end)' 2>/dev/null)" || return 1
  resp="$(curl -sS -m 5 -X POST "$FLEET_SERVER/api/v1/work/claim" \
    -H 'content-type: application/json' \
    -H "authorization: Bearer $FLEET_TOKEN" \
    -d "$body" 2>/dev/null)" || return 1
  if ! printf '%s' "$resp" | jq -e '.ok == true and .rework != null' >/dev/null 2>&1; then
    # DEPLOY-SKEW GUARD (same as fleet_claim_review): a server predating
    # kind:"rework" strips the field and runs a WORK claim, stranding a real
    # issue "status: claimed". Detect and release it.
    local oops
    oops="$(printf '%s' "$resp" | jq -r 'select(.ok == true) | .issue.number // empty' 2>/dev/null || true)"
    if [ -n "$oops" ]; then
      warn "Fleet server predates kind:rework (deploy skew) — releasing the accidental work claim on #$oops."
      fleet_release "$oops" abandoned
    fi
    return 1
  fi
  printf '%s' "$resp" | jq -c '{pr: .rework.pr, issue: .rework.issue, author: .rework.author, headSha: .rework.headSha, headRef: .rework.headRef, title: .rework.title, leaseTtlSeconds: .leaseTtlSeconds, handle: .handle}'
}

# fleet_release_rework <issue> <done|abandoned> [pr] — finish an adopted
# rework. `issue` is the WORKED issue number (the rework assignment's number
# space, and its lease key); `pr` the reworked PR. done = the rework was pushed
# (the runner flips the issue to in-review itself); abandoned = it wasn't (the
# author returned mid-window, a crash, a usage limit) → the server reverts the
# issue to changes-requested. Best-effort; the lease TTL + sweeper backstop a
# lost release.
fleet_release_rework() {
  fleet_claim_enabled || return 0
  local body
  body="$(jq -cn --arg issue "${1:-}" --arg outcome "${2:-}" --arg pr "${3:-}" '
      {kind: "rework", issue: ($issue | tonumber), outcome: $outcome}
    + (if $pr != "" then {prNumber: ($pr | tonumber)} else {} end)' 2>/dev/null)" || return 0
  curl -sS -m 5 -X POST "$FLEET_SERVER/api/v1/work/release" \
    -H 'content-type: application/json' \
    -H "authorization: Bearer $FLEET_TOKEN" \
    -d "$body" >/dev/null 2>&1 || true
  return 0
}

# fleet_pop_commands — print (and consume) the control-command KINDS the
# server piggybacked on telemetry responses (pause|resume|stop|abort), one
# per line. fleet_send (autopilot.sh) stashes them into $FLEET_CMDS_FILE as
# it hears them; this drains the stash. No/empty stash → prints nothing,
# always returns 0.
fleet_pop_commands() {
  local f="${FLEET_CMDS_FILE:-}"
  [ -n "$f" ] || return 0
  # Trust only a regular file WE own: this hop is unauthenticated (the token
  # check happens server-side, on the write into the stash), so a foreign or
  # pre-created file in a shared tmp dir must never drive control flow —
  # a planted 'stop'/'pause' line would kill or wedge the autopilot.
  [ -f "$f" ] && [ -O "$f" ] || return 0
  [ -s "$f" ] || return 0
  cat "$f" 2>/dev/null || true
  : > "$f" 2>/dev/null || true
  return 0
}

# ---- preflight ----
preflight() {
  local missing=0
  for bin in git gh jq; do
    command -v "$bin" >/dev/null 2>&1 || { err "missing dependency: $bin"; missing=1; }
  done
  if [ "$RUNS_AGENT" = 1 ]; then
    command -v "$AGENT" >/dev/null 2>&1 || { err "agent '$AGENT' not on PATH (set AGENT=codex|claude|hermes)"; missing=1; }
    if [ "$AGENT_TIMEOUT" != 0 ] && ! command -v timeout >/dev/null 2>&1 && ! command -v gtimeout >/dev/null 2>&1; then
      warn "neither 'timeout' nor 'gtimeout' on PATH — AGENT_TIMEOUT=$AGENT_TIMEOUT will be IGNORED and a hung agent will wedge this runner (macOS: brew install coreutils)."
    fi
  fi
  gh auth status >/dev/null 2>&1 || { err "gh is not authenticated — run: gh auth login"; missing=1; }
  [ "$missing" = 0 ] || exit 1

  # Resolve the repo working directory (a clone of $REPO).
  REPO_DIR="${REPO_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"
  if [ -z "$REPO_DIR" ] || ! git -C "$REPO_DIR" remote get-url origin 2>/dev/null | grep -q "$NAME"; then
    err "Run this from inside a clone of $REPO (or set REPO_DIR to one)."
    exit 1
  fi

  # Route every `gh` call — ours AND the agent's (run_agent inherits this PATH)
  # — through the secret-scrubbing shim, so a token can never reach a public
  # comment/PR body again (PR #585 leaked one and it had to be revoked). The
  # shim only touches the body/title of pr|issue post commands; everything else
  # passes straight through. Idempotent: never prepend twice.
  if [ -x "$REPO_DIR/scripts/fg-secure/gh" ]; then
    case ":$PATH:" in
      *":$REPO_DIR/scripts/fg-secure:"*) ;;
      *) export PATH="$REPO_DIR/scripts/fg-secure:$PATH" ;;
    esac
  fi
  if ! ME="$(gh api user --jq .login 2>/dev/null)"; then
    if [ "${GITHUB_ACTIONS:-}" = "true" ]; then
      ME="github-actions[bot]"
    else
      err "gh is authenticated, but couldn't resolve the current GitHub user."
      exit 1
    fi
  fi
}

# ---- git worktree helpers ----
# Every task (work, rework, review) runs in a fresh, throwaway git worktree so
# the agent can never dirty the user's clone, and always starts from the ref it
# was given — freshly fetched from origin. The clone itself is never touched.
WORKTREE=""

make_worktree() {  # $1 = ref to check out (e.g. origin/main, refs/fg/pr-12); sets $WORKTREE
  git -C "$REPO_DIR" fetch origin --quiet
  local parent; parent="$(mktemp -d "${TMPDIR:-/tmp}/fg-worktree.XXXXXX")"
  WORKTREE="$parent/repo"
  # If `worktree add` fails (bad/missing ref), the dir never gets created —
  # bail loudly and clear WORKTREE so callers never `cd` into a ghost path and
  # run the agent against the wrong tree. Callers invoked with `|| true` disable
  # `set -e` inside the function, so we can't rely on it aborting for us.
  if ! git -C "$REPO_DIR" worktree add --quiet --detach "$WORKTREE" "$1"; then
    err "worktree add failed for ref '$1'"
    rm -rf "$parent" 2>/dev/null || true
    WORKTREE=""
    return 1
  fi
  # `git worktree add` does NOT populate submodules in the new worktree (each
  # worktree tracks its own submodule checkout state) — without this, every
  # agent gets an empty .skills/ and silently loses the NZ data CLIs even when
  # correctly instructed to use them. Best-effort: a missing/offline submodule
  # remote shouldn't fail the whole run, just leave .skills empty as before.
  git -C "$WORKTREE" submodule update --init --quiet 2>/dev/null \
    || warn "couldn't init the .skills submodule in $WORKTREE (offline? leaving it empty)"
}

remove_worktree() {
  [ -n "${WORKTREE:-}" ] || return 0
  git -C "$REPO_DIR" worktree remove --force "$WORKTREE" >/dev/null 2>&1 || true
  rm -rf "$(dirname "$WORKTREE")" 2>/dev/null || true
  git -C "$REPO_DIR" worktree prune >/dev/null 2>&1 || true
  WORKTREE=""
}

# ---- issue/PR helpers ----
issue_labels()  { gh issue view "$1" --repo "$REPO" --json labels --jq '[.labels[].name]|join(",")'; }
issue_field()   { gh issue view "$1" --repo "$REPO" --json "$2" --jq ".$2"; }

# REST snapshot for the whole open issue queue, normalised to the same shape
# `gh issue list --json number,createdAt,labels,assignees` returns. This used
# to be a single GraphQL query per worker cycle; with multiple 30s autopilots it
# silently burned the repository's GraphQL allowance. The REST Issues API costs
# normal core quota, includes the fields we need, and returns PRs too, so filter
# out `.pull_request` entries here.
fetch_open_issues() {
  # Mirror-first (ADR-0018): the fleet server serves this exact snapshot
  # shape from its Mongo mirror — ONE unauthenticated HTTPS call, zero
  # GitHub budget. With every runner loop on every machine drawing from the
  # same per-identity GitHub pools, this read was the fleet's biggest
  # rate-limit tax (and rate-limit stalls have taken the fleet down before —
  # ADR-0016). Fall back to the direct GitHub read whenever the server is
  # absent, stale (it answers 503 rather than serve a stale mirror), or
  # returns anything malformed — a dead server can never stall the fleet.
  # FLEET_SNAPSHOT=0 opts out (direct GitHub only).
  if [ -n "${FLEET_SERVER:-}" ] && [ "${FLEET_SNAPSHOT:-1}" = "1" ]; then
    local resp snap
    if resp="$(curl -sS -m 5 "$FLEET_SERVER/api/v1/issues/open" 2>/dev/null)" \
       && snap="$(printf '%s' "$resp" | jq -ce 'select(.ok == true) | .issues | select(type == "array")' 2>/dev/null)"; then
      printf '%s' "$snap"
      return 0
    fi
  fi
  gh api --paginate "repos/$OWNER/$NAME/issues?state=open&per_page=100" \
    --jq '[.[] | select(.pull_request|not) | {number, createdAt: .created_at, labels: [.labels[] | {name}], assignees: [.assignees[] | {login}]}]'
}

# Numbers of open issues with a given status label, optional STAGE filter.
# Order: issues labelled "priority: high" first, then oldest-created first.
# This is the whole priority system — label an issue "priority: high" to have
# the workers pick it up before the rest of the queue.
#
# BOUNDED (#293 / ADR-0013): "high" only means something while it is scarce.
# The jump-queue honours priority: high for at most HIGH_PRIORITY_CAP
# STREAMS at a time (grouped by stream:<n> label — or the issue's own number
# when it has none — oldest high item first, computed over the whole open
# queue so every runner agrees). High items beyond the cap sort by age like
# everything else. Counting STREAMS (not issues) is deliberate so that
# stream-level priority propagation (#164) can mark a whole stream high
# without eating the entire cap, while blanket-labelling ten streams high
# still cannot make "high" mean "everything".
#
# $2 = optional queue snapshot (from fetch_open_issues). Pass one to check
# several statuses from a SINGLE GraphQL query; omit it and one is fetched.
# $3 = optional stage filter; when omitted the STAGE env var applies (the
# historical behaviour), so callers with a fixed queue (frame_work.sh's
# discover queue) can pin the stage regardless of the caller's environment.
# "do-not-automate" is a human's parking brake: an issue carrying it is
# invisible to EVERY automation queue below, whatever its status. Purely
# restrictive — it can only shrink queues.
issues_with_status() {  # $1 = bare status (e.g. available); $2 = optional snapshot JSON; $3 = optional stage
  local status="$1" snap="${2:-}" stage="${3-${STAGE:-}}"
  [ -n "$snap" ] || snap="$(fetch_open_issues)"
  printf '%s' "$snap" | jq -r --arg status "status: $status" --arg stage "$stage" --argjson cap "$HIGH_PRIORITY_CAP" '
    def names: [.labels[].name];
    def is_high: names | index("priority: high");
    def stream_key: (names | map(select(startswith("stream:")) | ltrimstr("stream:")) | first) // (.number|tostring);
    ([ .[] | select(is_high) | select(names | index("do-not-automate") | not) ]
     | group_by(stream_key) | sort_by(map(.createdAt) | min) | .[:$cap] | [ .[][].number ]) as $jump
    | [ .[]
        | select(names | index($status))
        | select(names | index("do-not-automate") | not)
        | select($stage == "" or (names | index("stage: " + $stage))) ]
    | sort_by(((.number as $n | $jump | index($n)) | not), .createdAt)
    | .[].number'
}

available_issues() { issues_with_status "available" "${1:-}"; }

# Available DISCOVER roots — the framing queue (ADR-0014). Ordered like every
# other queue (bounded priority jump, then age). Pins the stage explicitly, so
# a caller's STAGE env can't widen it: this queue is discover by definition,
# and it is frame_work.sh's alone — start_work.sh never claims discover roots.
discover_roots() { issues_with_status "available" "${1:-}" "discover"; }

# Issues a reviewer sent back that are assigned to *me* — my rework queue.
# $1 = optional queue snapshot (from fetch_open_issues).
rework_issues() {  # $1 = optional snapshot JSON
  local snap="${1:-}"
  [ -n "$snap" ] || snap="$(fetch_open_issues)"
  printf '%s' "$snap" | jq -r --arg me "$ME" "[.[] | select(.labels|map(.name)|index(\"status: changes-requested\")) | select(.labels|map(.name)|index(\"do-not-automate\")|not) | select(.assignees|map(.login)|index(\$me))$( [ -n "${STAGE:-}" ] && printf ' | select(.labels|map(.name)|index("stage: %s"))' "$STAGE" )] | sort_by((.labels|map(.name)|index(\"priority: high\")|not), .createdAt) | .[].number"
}

# Reworks with NO assignee — freed by reap.sh after REWORK_TTL, so any worker
# may take them (oldest first). The author's own reworks stay theirs (above).
# $1 = optional queue snapshot (from fetch_open_issues).
unassigned_reworks() {  # $1 = optional snapshot JSON
  local snap="${1:-}"
  [ -n "$snap" ] || snap="$(fetch_open_issues)"
  printf '%s' "$snap" | jq -r '[.[] | select(.labels|map(.name)|index("status: changes-requested")) | select(.labels|map(.name)|index("do-not-automate")|not) | select((.assignees|length)==0)] | sort_by((.labels|map(.name)|index("priority: high")|not), .createdAt) | .[].number'
}

# Drained stream roots waiting for a G1 synthesis draft.
# $1 = optional queue snapshot (from fetch_open_issues).
synthesis_issues() { issues_with_status "needs-synthesis" "${1:-}"; }

# ACTIVE streams (#292): the producer side scales with agents, the human
# synthesis gate does not — so the number of streams being worked at once is
# bounded by MAX_ACTIVE_STREAMS. A stream counts as active while it is
# consuming producer capacity: it has OPEN CHILD issues, or its root is
# actually being worked (claimed / in-review / changes-requested). A root
# that is merely `status: available` is a G0-approved stream waiting for a
# slot — start_work.sh holds it in the backlog until one frees up. Emits the
# active stream root numbers, one per line, from a fetch_open_issues snapshot.
active_streams() {  # $1 = queue snapshot JSON
  printf '%s' "$1" | jq -r '
    ( [ .[] as $i
        | $i.labels[].name
        | select(startswith("stream:"))
        | ltrimstr("stream:")
        | select(. != ($i.number|tostring)) ]        # open child work → its stream is active
    + [ .[]
        | select([.labels[].name] | index("stage: discover"))
        | select([.labels[].name] | (index("status: claimed") or index("status: in-review") or index("status: changes-requested")))
        | (.number|tostring) ] )                     # a root being worked → active even before children exist
    | unique | .[]'
}

# First value of a "<prefix>..." entry in a comma-joined label list.
label_field() {  # $1 = labels csv, $2 = prefix (e.g. "stage: ", "stream:")
  printf '%s' "$1" | tr ',' '\n' | sed -n "s/^$2//p" | head -1
}

# Depth of an issue in its stream: 0 for a root, else 1 + parent's depth,
# capped at 3 hops. Bounds agent fan-out (docs/STREAMS.md). The parent hop is
# the line-anchored "Split from #m" if present, else "Part of #p" — under the
# flattened linking convention (#291 / ADR-0013) every child's "Part of"
# points at the STREAM ROOT (so roll-up is exact), while "Split from" records
# which issue actually spawned it; depth must follow the SPAWN chain or a
# grandchild that links the root would look depth-1 and fan out forever.
# "Split from" may share the first line with "Part of #root." — the anchor
# allows that one prefix so prose mentions still can't mis-parent an issue.
# FAILS CLOSED: if gh errors mid-walk (rate limit, network), reports the cap
# so fan-out is denied rather than unbounded.
issue_depth() {  # $1 = issue number
  local n="$1" d=0 body parent
  while [ "$d" -lt 3 ]; do
    if ! body="$(gh issue view "$n" --repo "$REPO" --json body --jq .body 2>/dev/null)"; then
      echo 3; return
    fi
    parent="$(printf '%s' "$body" | grep -oiE '^[[:space:]]*(part of[[:space:]]*#[0-9]+\.?[[:space:]]*)?split from[[:space:]]*#[0-9]+' | head -1 | grep -oE '[0-9]+$' || true)"
    [ -z "$parent" ] && parent="$(printf '%s' "$body" | grep -oiE '^[[:space:]]*part of[[:space:]]*#[0-9]+' | head -1 | grep -oE '[0-9]+' || true)"
    [ -z "$parent" ] && break
    d=$((d+1)); n="$parent"
  done
  echo "$d"
}

# The feedback the author needs to act on: the latest change-requesting
# review bodies plus any inline file comments.
review_feedback() {  # $1 = pr number
  gh pr view "$1" --repo "$REPO" --json reviews \
    --jq '[.reviews[] | select(.state=="CHANGES_REQUESTED")][-3:][] | "--- Review by @\(.author.login) ---\n\(.body)\n"' 2>/dev/null || true
  gh api "repos/$OWNER/$NAME/pulls/$1/comments" \
    --jq '.[] | "- \(.path):\(.line // .original_line // 0) @\(.user.login): \(.body)"' 2>/dev/null || true
}

# The open PR (if any) for a given issue number. Closing refs first; falls
# back to a "Part of #n" body search — discover PRs deliberately do NOT close
# their issue (a stream ROOT must stay open for the life of the stream).
# The fallback skips PRs that close some OTHER issue: child PRs carry
# "Part of #<root>" too, and must not be mistaken for the root's framing PR.
# Newest first — default order is oldest-first, which misses the just-opened
# PR once >50 PRs are open.
pr_for_issue() {
  local pr body closes_other
  while IFS=$'\t' read -r pr body; do
    [ -n "$pr" ] || continue
    # If the PR body closes/fixes/resolves a DIFFERENT issue, it is a child PR
    # that may mention "Part of #n" for its stream root; do not mistake it for
    # the root's framing PR.
    closes_other="$(printf '%s' "$body" | grep -oiE '(closes|fixes|resolves)[[:space:]]*#[0-9]+' | grep -oE '[0-9]+' | grep -vx "$1" | head -1 || true)"
    [ -n "$closes_other" ] && continue
    echo "$pr"; return 0
  done < <(gh api --paginate "repos/$OWNER/$NAME/pulls?state=open&per_page=100" \
    --jq ".[] | select((.body // \"\") | test(\"(?i)(closes|fixes|resolves|part of)\\\\s*#$1\\\\b\")) | [.number, (.body // \"\")] | @tsv" 2>/dev/null || true)
  return 0
}

# What KIND of review a PR needs, decided by the paths it changes:
#  - "method"   → touches research/findings/** or solutions/**: the full
#                 adversarial research method (cite everything, two sources, etc.)
#  - "standard" → everything else (docs, tooling, web, analysis, .github,
#                 streams overviews): review like a normal careful maintainer,
#                 NOT against the research citation gate. This stops working
#                 docs and scripts being held to a research-grade bar.
# Fails to "standard" if the file list can't be read (never over-applies the
# heavy gate to something we couldn't classify).
pr_review_kind() {  # $1 = pr number
  local files
  files="$(gh pr view "$1" --repo "$REPO" --json files --jq '.files[].path' 2>/dev/null || true)"
  if printf '%s\n' "$files" | grep -Eq '^(research/findings/|solutions/)'; then
    echo method
  else
    echo standard
  fi
}

# Is a PR a SYNTHESIS DRAFT? synthesize_work.sh always creates its branch as
# synthesis/<slug>, so the head branch is the marker. Synthesis rework belongs
# to synthesize_work.sh ONLY: the generic start_work.sh rework path uses the
# research rework prompt (no steward-preservation rules) and parks the stream
# root at "in-review" — a status a root must never hold, because a synthesis
# PR has no closing ref so nothing ever clears it.
# Returns 0 = synthesis, 1 = not synthesis, 2 = UNKNOWN (gh failed). Callers
# guarding the generic path must fail CLOSED: treat 2 as "don't touch it this
# loop", never as "not synthesis" — or a transient API blip re-opens the very
# routing bug this helper exists to prevent (ADR-0011).
pr_is_synthesis() {  # $1 = pr number
  local head
  head="$(gh pr view "$1" --repo "$REPO" --json headRefName --jq .headRefName 2>/dev/null)" || head=""
  [ -z "$head" ] && return 2
  case "$head" in
    synthesis/*) return 0 ;;
    *) return 1 ;;
  esac
}

# Is a PR a DISCOVER FRAMING? Framing branches are always discover/<slug>
# (frame_work.sh mints them that way, and the old start_work.sh discover
# prompt used "$stage/<slug>" — same shape), so the head branch is the
# marker, exactly like pr_is_synthesis. Framing rework belongs to
# frame_work.sh ONLY (ADR-0014): the capability floor on setting a stream's
# direction applies to REWORK of the framing too, so the general
# start_work.sh loop must hand these off, never feed them its generic
# research rework prompt.
# Returns 0 = framing, 1 = not framing, 2 = UNKNOWN (gh failed). Callers
# guarding the generic path must fail CLOSED on 2: "don't touch it this
# loop", never "not a framing" (same contract as pr_is_synthesis).
pr_is_framing() {  # $1 = pr number
  local head
  head="$(gh pr view "$1" --repo "$REPO" --json headRefName --jq .headRefName 2>/dev/null)" || head=""
  [ -z "$head" ] && return 2
  case "$head" in
    discover/*) return 0 ;;
    *) return 1 ;;
  esac
}

# Issue closed by a PR (first closing ref). Use this ONLY when you specifically
# mean "the issue merging this PR will CLOSE" (e.g. marking it done) — discover
# PRs have no closing ref by design, so this is empty for them.
issue_for_pr() {
  gh api "repos/$OWNER/$NAME/pulls/$1" \
    --jq '(.body // "") | capture("(?i)(?:closes|fixes|resolves)\\s*#(?<n>[0-9]+)").n // empty' 2>/dev/null || true
}

# The issue a PR is WORKING (for routing rework/status back to the author): a
# closing ref if there is one, else the "Closes/Part of #n" link in the PR body.
# Unlike issue_for_pr this resolves DISCOVER PRs, which intentionally do NOT
# close their stream-root issue (it must stay open for the stream's life) and so
# carry only a "Part of #n" link. Use this for status hand-offs.
issue_addressed_by_pr() {  # $1 = pr number
  local n
  n="$(issue_for_pr "$1")"
  [ -n "$n" ] && { echo "$n"; return 0; }
  gh pr view "$1" --repo "$REPO" --json body --jq .body 2>/dev/null \
    | grep -oiE '(closes|fixes|resolves|part of)[[:space:]]*#[0-9]+' \
    | grep -oE '[0-9]+' | head -1
}

# Jittered settle window: after a racy claim, wait long enough that every
# competing claimant's `--add-assignee` is visible to all of them, so the
# deterministic tie-break sees the same assignee set everywhere. The jitter
# keeps two lock-stepped workers from reading at the exact same tick.
claim_settle_secs() { echo $(( CLAIM_SETTLE + (RANDOM % 5) )); }

# resolve_claim_race <issue> — call right after adding @me as assignee to claim
# or adopt an issue. `--add-assignee` is a set-union, not a lock, so two workers
# (different accounts) that both slipped past the pre-check end up co-assigned.
# We settle, then break the tie deterministically: the smallest login wins.
# It's a pure function of the observed assignee set, so every racer computes the
# SAME winner with no coordination. Returns 0 if THIS worker holds the claim;
# otherwise un-assigns @me and returns 1 so the caller yields.
resolve_claim_race() {  # $1 = issue number, $2 = expected claim identity (default: $ME)
  # $2 exists for the fleet path: a server claim is assigned to the handle
  # bound to FLEET_TOKEN, which can differ from the local `gh` login (the
  # docs mint bot-handle tokens). Comparing that claim to $ME would misread
  # every valid fleet claim as a race loss (PR #592 review).
  local n="$1" expected="${2:-$ME}" assignees winner
  sleep "$(claim_settle_secs)"
  assignees="$(gh issue view "$n" --repo "$REPO" --json assignees --jq '[.assignees[].login]|sort|join(" ")')"
  winner="${assignees%% *}"
  if [ -n "$winner" ] && [ "$winner" != "$expected" ]; then
    warn "#$n was claimed concurrently (assignees: $assignees) — @$winner wins, yielding."
    gh issue edit "$n" --repo "$REPO" --remove-assignee "$expected" >/dev/null 2>&1 || true
    return 1
  fi
  return 0
}

# Set an issue's lifecycle status ATOMICALLY (#289 / ADR-0013): compute the
# full label set — everything the issue carries except the "status: "
# namespace, plus the ONE new status — and replace the labels in a single
# PUT call. The previous add-label + N remove-label form (even in one gh
# invocation) applied adds and removes as separate mutations, leaving a
# window where an issue held two status labels at once; interleaved
# concurrent transitions could leave that soup behind permanently.
# A read-modify-write can still race a concurrent edit of OTHER labels
# (rare, self-limiting); the issue-status.yml reconciler and reap.sh's
# conflict sweep converge any residue back to exactly one status label.
# The closed set of statuses lives in .github/labels.yml.
set_status_label() {  # $1 issue, $2 new-status (bare, e.g. in-review), $3.. ignored (legacy)
  local n="$1" new="$2"; shift 2
  local keep
  keep="$(gh issue view "$n" --repo "$REPO" --json labels \
          --jq '[.labels[].name | select(startswith("status: ") | not)]')" || return 1
  printf '%s' "$keep" | jq --arg s "status: $new" '{labels: (. + [$s])}' \
    | gh api -X PUT "repos/$OWNER/$NAME/issues/$n/labels" --input - >/dev/null
}

# Remove EVERY "status: " label, keeping the rest — the "researching" posture
# a stream root holds between its framing fan-out and the drain flagging it
# needs-synthesis (docs/STREAMS.md). Same atomic whole-set PUT as
# set_status_label, so it can't leave a partial label soup behind.
clear_status_label() {  # $1 = issue
  local n="$1" keep
  keep="$(gh issue view "$n" --repo "$REPO" --json labels \
          --jq '[.labels[].name | select(startswith("status: ") | not)]')" || return 1
  printf '%s' "$keep" | jq '{labels: .}' \
    | gh api -X PUT "repos/$OWNER/$NAME/issues/$n/labels" --input - >/dev/null
}

# True if an exit status means the agent was INTERRUPTED by the user (Ctrl-C) or
# killed — the whole runner should stop, not move on to the next item. Note a
# `timeout` (124) is deliberately NOT here: that fails one item but the loop
# should carry on to the next. An agent that catches SIGINT itself and exits
# 130/143 won't trip bash's own INT trap, so callers must check this after every
# run_agent to stop reliably.
was_interrupted() {  # $1 = exit status
  case "$1" in 130|143) return 0 ;; *) return 1 ;; esac
}

# An agent that ran out of API budget (usage cap / provider rate limit) is a
# TEMPORARY tooling condition, NOT a defect in the work — so callers must back
# off and retry later instead of posting a failure or mangling issue/PR state.
# Only the TAIL of the captured output is inspected: a real limit surfaces as a
# fatal message at the very end of the run, so a finding that merely *discusses*
# rate limits in its body won't trip this.
was_usage_limited() {  # $1 = path to captured agent stdout+stderr
  [ -s "${1:-}" ] || return 1
  tail -n 40 "$1" | grep -qiE \
    'usage limit|rate[ _-]?limit|too many requests|\b429\b|quota|overloaded|resource[_ ]exhausted|insufficient_quota|limit reached|try again later|retry after|resets? (at|in)'
}

# ---- agent runner ----
# run_agent <prompt> [dir]  -> streams agent output to stdout; runs in [dir]
# (usually a task worktree), falling back to the clone.
run_agent() {
  local prompt="$1" dir="${2:-$REPO_DIR}" tmo="" t
  # macOS ships no 'timeout'; coreutils installs it as 'gtimeout'.
  if [ "$AGENT_TIMEOUT" != 0 ]; then
    for t in timeout gtimeout; do
      command -v "$t" >/dev/null 2>&1 && { tmo="$t ${AGENT_TIMEOUT}s"; break; }
    done
  fi
  case "$AGENT" in
    codex)
      # The repo ships its own Codex hooks (.codex/config.toml -> the fleet
      # telemetry client, ADR-0016). Codex skips non-trusted hooks silently in
      # exec mode, and trust can only be persisted interactively — so pass the
      # automation bypass, exactly its documented purpose ("automation that
      # already vets hook sources": these hooks are versioned in this repo and
      # the runner already uses --dangerously-bypass-approvals-and-sandbox).
      # Only passed when the checkout actually carries the repo hook config.
      local hook_trust=""
      [ -f "$dir/.codex/hooks.json" ] && hook_trust="--dangerously-bypass-hook-trust"
      if [ -n "${FLEET_SERVER:-}" ] && [ "${CODEX_JSON_TELEMETRY:-1}" = 1 ]; then
        $tmo codex exec --json --cd "$dir" --skip-git-repo-check $hook_trust \
          ${CODEX_FLAGS:---dangerously-bypass-approvals-and-sandbox} \
          ${MODEL:+-m "$MODEL"} "$prompt" \
          | python3 "$REPO_DIR/scripts/codex-json-telemetry.py"
      else
        $tmo codex exec --cd "$dir" --skip-git-repo-check $hook_trust \
          ${CODEX_FLAGS:---dangerously-bypass-approvals-and-sandbox} \
          ${MODEL:+-m "$MODEL"} "$prompt"
      fi
      ;;
    claude)
      # Default the fleet's claude runs to sonnet (maintainer call,
      # 2026-07-05: sonnet for testing) — override with --model / MODEL.
      local claude_model="${MODEL:-sonnet}"
      if [ -n "${FLEET_SERVER:-}" ] && [ "${CLAUDE_JSON_TELEMETRY:-1}" = 1 ]; then
        # stream-json (requires --verbose) emits every assistant message and
        # tool use as it happens WITH per-message token usage — the bridge
        # renders readable progress and posts live tool/token telemetry.
        # Plain -p prints nothing until the very end, so a worker looked hung
        # for the whole run and reported nothing.
        ( cd "$dir" && $tmo claude -p "$prompt" \
          --permission-mode "${CLAUDE_PERMISSION_MODE:-bypassPermissions}" \
          --model "$claude_model" \
          --output-format stream-json --verbose ) \
          | python3 "$REPO_DIR/scripts/claude-json-telemetry.py"
      else
        ( cd "$dir" && $tmo claude -p "$prompt" \
          --permission-mode "${CLAUDE_PERMISSION_MODE:-bypassPermissions}" \
          --model "$claude_model" )
      fi
      ;;
    hermes)
      ( cd "$dir" && $tmo hermes ${HERMES_PROFILE:+--profile "$HERMES_PROFILE"} chat -Q \
        ${HERMES_FLAGS:---yolo --source tool} \
        ${MODEL:+--model "$MODEL"} \
        ${PROVIDER:+--provider "$PROVIDER"} \
        -q "$prompt" )
      ;;
    *) err "unknown AGENT '$AGENT'"; return 2 ;;
  esac
}

# Heal the known framing-PR merge conflict (the index cascade): every framing
# PR appends a row to analysis/README.md's index table, so the moment one
# merges, every other open framing PR goes DIRTY on that one file — reviews
# PASS but the merge strands. If a same-repo PR's ONLY conflict with main is
# analysis/README.md and its side of that file only ADDS full rows, re-resolve
# deterministically (main's version + the branch's added rows), push, and
# print the new head SHA. Anything else — fork head, other conflicted files,
# row edits/removals — return 1 and leave it for a human.
fg_heal_index_conflict() {  # $1 = pr number; prints the new head sha on success
  local pr="$1" headrepo branch rows parent wt newsha
  headrepo="$(gh api "repos/$REPO/pulls/$pr" --jq '.head.repo.full_name' 2>/dev/null || true)"
  [ "$headrepo" = "$REPO" ] || return 1
  branch="$(gh api "repos/$REPO/pulls/$pr" --jq '.head.ref' 2>/dev/null || true)"
  [ -n "$branch" ] || return 1
  git -C "$REPO_DIR" fetch origin --quiet || return 1
  # The branch's README change must be pure row additions.
  if git -C "$REPO_DIR" diff "origin/main...origin/$branch" -- analysis/README.md | grep -q '^-[^-]'; then
    return 1
  fi
  rows="$(git -C "$REPO_DIR" diff "origin/main...origin/$branch" -- analysis/README.md | sed -n 's/^+\(|.*\)$/\1/p')"
  [ -n "$rows" ] || return 1
  parent="$(mktemp -d "${TMPDIR:-/tmp}/fg-heal.XXXXXX")"; wt="$parent/repo"
  git -C "$REPO_DIR" worktree add --quiet --detach "$wt" "origin/$branch" 2>/dev/null \
    || { rm -rf "$parent"; return 1; }
  if ! (
    cd "$wt" || exit 1
    git merge --no-edit origin/main >/dev/null 2>&1 || true
    conflicts="$(git diff --name-only --diff-filter=U)"
    if [ -n "$conflicts" ] && [ "$conflicts" != "analysis/README.md" ]; then exit 1; fi
    if [ -n "$conflicts" ]; then
      git checkout origin/main -- analysis/README.md || exit 1
      printf '%s\n' "$rows" >> analysis/README.md
      git add analysis/README.md
      git -c core.editor=true commit --no-edit >/dev/null 2>&1 || exit 1
    fi
    git push --quiet origin HEAD:"$branch" || exit 1
  ); then
    git -C "$REPO_DIR" worktree remove --force "$wt" 2>/dev/null || true
    rm -rf "$parent" 2>/dev/null || true
    return 1
  fi
  newsha="$(git -C "$wt" rev-parse HEAD 2>/dev/null || true)"
  git -C "$REPO_DIR" worktree remove --force "$wt" 2>/dev/null || true
  rm -rf "$parent" 2>/dev/null || true
  [ -n "$newsha" ] || return 1
  echo "$newsha"
}
