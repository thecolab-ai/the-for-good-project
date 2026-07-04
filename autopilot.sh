#!/usr/bin/env bash
#
# autopilot.sh — ONE command that keeps both sides of the queue moving.
#
# Run only produce (start_work.sh) and you flood the review queue; run only
# review (review_work.sh) and nothing new gets made. autopilot alternates —
# it REVIEWS other people's PRs, then does ONE piece of work, then repeats —
# so research and review stay balanced instead of one starving the other.
# It's what you tell everyone to run: one script, both jobs.
#
# It is NOT a merge of the two runners: it's a thin conductor that calls the
# existing, tested start_work.sh / review_work.sh with MAX=1 POLL_SECONDS=0 (do
# one item, exit instead of polling) and owns only the alternation, the ratio,
# the idle back-off, and pulling latest main each cycle. All the real behaviour
# — claiming, status labels, worktrees, the PR, the merge gate — still lives in
# those scripts, unchanged. See docs/adr/0015-autopilot-alternates-review-and-work.md.
#
# THE INTEGRITY RULE STILL HOLDS: an adversarial review may not be by the PR's
# author. So run the REVIEW side under a DISTINCT identity via REVIEW_GITHUB_TOKEN
# (a second account / bot PAT with write) — work runs as your normal gh identity,
# review runs as the token's identity. Without REVIEW_GITHUB_TOKEN it runs
# WORK-ONLY and warns (reviewing your own PRs is a no-op the gate rejects).
#
# Usage:
#   REVIEW_GITHUB_TOKEN=<bot-pat> ./autopilot.sh            # balanced (claude)
#   REVIEW_GITHUB_TOKEN=<bot-pat> ./autopilot.sh codex      # use codex
#   REVIEW_GITHUB_TOKEN=<bot-pat> REVIEW_PER_WORK=3 ./autopilot.sh
#   ./autopilot.sh                                          # work-only (no token)
#   MAX_CYCLES=5 ./autopilot.sh                             # stop after 5 cycles
#   PULL=0 ./autopilot.sh                                   # don't auto-pull main
#
# Args: [claude|codex|hermes] [--model <name>]   (forwarded to both runners)
# Env:  REVIEW_GITHUB_TOKEN  REVIEW_PER_WORK(=2)  POLL_SECONDS(=120)
#       MAX_CYCLES(=0)  PULL(=1)  MAIN_BRANCH(=main)  + everything the runners read
set -euo pipefail
cd "$(dirname "$0")"
source "scripts/fg-common.sh"

REVIEW_PER_WORK="${REVIEW_PER_WORK:-2}"   # review passes per work pass — bias to review; it's the bottleneck
POLL_SECONDS="${POLL_SECONDS:-120}"       # idle wait between cycles when the whole queue is empty
MAX_CYCLES="${MAX_CYCLES:-0}"             # 0 = run forever
PULL="${PULL:-1}"                         # git-pull latest main each cycle (0 to disable)
MAIN_BRANCH="${MAIN_BRANCH:-main}"

# Fingerprint this script so we can hot-reload it if a pull changes autopilot.sh
# itself (see the exec below). $PWD is the script dir — we cd'd here above.
SELF="$PWD/$(basename "$0")"
self_hash() { sha1sum "$SELF" 2>/dev/null | cut -d' ' -f1 || true; }
SELF_HASH="$(self_hash)"

trap 'rule; warn "autopilot stopping."; exit 130' INT TERM

if [ -z "${REVIEW_GITHUB_TOKEN:-}" ]; then
  warn "REVIEW_GITHUB_TOKEN is not set — running WORK-ONLY (no review passes)."
  warn "To balance the queue, set REVIEW_GITHUB_TOKEN to a DISTINCT GitHub identity with write access."
fi

# Run ONE runner pass and report whether it actually DID something. The runners
# exit 0 whether they processed an item OR found an empty queue, so we can't use
# the exit code alone — instead detect the empty-queue sentinel line each runner
# prints (review_work.sh: "No open PRs needing review."; start_work.sh: "Queue
# empty — no rework…"). Returns 0 = did work, 1 = idle (or errored).
run_pass() {  # $@ = command to run
  local out rc; out="$(mktemp)"
  set +e; "$@" 2>&1 | tee "$out"; rc=${PIPESTATUS[0]}; set -e
  if grep -qE "No open PRs needing review\.|Queue empty — no rework" "$out"; then
    rm -f "$out"; return 1
  fi
  rm -f "$out"
  [ "$rc" -eq 0 ]
}

cycle=0
while :; do
  cycle=$((cycle + 1))
  rule; info "${c_bold}autopilot cycle $cycle${c_reset}  (review×${REVIEW_PER_WORK} → work×1)"

  # Pull latest main each cycle so operators automatically pick up script and
  # pipeline improvements without a manual git pull. git swaps files by atomic
  # rename, so the RUNNING autopilot keeps executing its current (open) inode —
  # no mid-run corruption — while the runner subprocesses launched below read the
  # freshly-updated code immediately.
  if [ "$PULL" = 1 ]; then
    if git fetch --quiet origin "$MAIN_BRANCH" 2>/dev/null && git merge --ff-only --quiet FETCH_HEAD 2>/dev/null; then
      log "Pulled latest origin/$MAIN_BRANCH."
      # If the pull updated autopilot.sh ITSELF, hot-reload onto the new version
      # by re-exec'ing at the top of the cycle — so autopilot-level improvements
      # apply with no manual restart. The hash guard makes this fire only on a
      # real change (the re-exec'd process re-fingerprints the current file), so
      # there's no exec loop.
      if [ "$(self_hash)" != "$SELF_HASH" ]; then
        info "autopilot.sh changed on origin/$MAIN_BRANCH — reloading onto the new version…"
        exec "$SELF" "$@"
      fi
    else
      warn "Couldn't fast-forward to origin/$MAIN_BRANCH (local changes / not on $MAIN_BRANCH / offline) — staying on current code."
    fi
  fi

  did_something=0

  # Review side (distinct identity), review-first so we drain before adding.
  if [ -n "${REVIEW_GITHUB_TOKEN:-}" ]; then
    for _ in $(seq 1 "$REVIEW_PER_WORK"); do
      info "review pass…"
      run_pass env MAX=1 POLL_SECONDS=0 ./review_work.sh "$@" && did_something=1
    done
  fi

  # Work side (your normal identity).
  info "work pass…"
  run_pass env MAX=1 POLL_SECONDS=0 ./start_work.sh "$@" && did_something=1

  if [ "$MAX_CYCLES" != 0 ] && [ "$cycle" -ge "$MAX_CYCLES" ]; then
    ok "Reached MAX_CYCLES=$MAX_CYCLES — stopping."; break
  fi

  # Both queues were empty this cycle — nap before looking again.
  if [ "$did_something" = 0 ]; then
    log "Nothing to review or work right now. Sleeping ${POLL_SECONDS}s… (Ctrl-C to stop)"
    sleep "$POLL_SECONDS"
  fi
done
