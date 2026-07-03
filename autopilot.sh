#!/usr/bin/env bash
#
# autopilot.sh — keep BOTH sides of the queue moving from one command.
#
# The problem this solves: run only start_work.sh and you flood the review
# queue; run only review_work.sh and nothing new gets produced. autopilot
# alternates — it REVIEWS other people's PRs, then does ONE piece of work, then
# repeats — so research and review stay balanced instead of one starving the
# other.
#
# It does NOT merge the two loops into one script. It's a thin conductor that
# calls the existing, already-tested runners with MAX=1 / POLL_SECONDS=0 (do one
# item, exit instead of polling) and owns only the alternation + the ratio. All
# the real behaviour — claiming, status labels, worktrees, the PR, the merge
# gate — still lives in start_work.sh / review_work.sh / fg-common.sh, unchanged.
#
# THE INTEGRITY RULE STILL HOLDS: an adversarial review may not be by the PR's
# author. review_work.sh refuses self-authored PRs and branch protection
# requires a non-author approval. So run the REVIEW side under a DISTINCT
# identity via REVIEW_GITHUB_TOKEN (a second account / bot PAT with write) —
# work runs as your normal gh identity, review runs as the token's identity.
# Without REVIEW_GITHUB_TOKEN, autopilot still WORKS the queue but SKIPS review
# and warns — because reviewing as the author is a no-op the gate would reject.
#
# Usage:
#   REVIEW_GITHUB_TOKEN=<bot-pat> ./autopilot.sh                 # balanced (claude)
#   REVIEW_GITHUB_TOKEN=<bot-pat> ./autopilot.sh codex           # use codex
#   REVIEW_GITHUB_TOKEN=<bot-pat> REVIEW_PER_WORK=3 ./autopilot.sh
#   ./autopilot.sh                                               # work-only (no token)
#   MAX_CYCLES=5 ./autopilot.sh                                  # stop after 5 cycles
#
# Args: [claude|codex|hermes] [--model <name>]   (forwarded to both runners)
# Env:  REVIEW_GITHUB_TOKEN  REVIEW_PER_WORK(=2)  POLL_SECONDS(=120)
#       MAX_CYCLES(=0, unlimited)  + everything start_work.sh / review_work.sh read
set -euo pipefail
cd "$(dirname "$0")"
source "scripts/fg-common.sh"

REVIEW_PER_WORK="${REVIEW_PER_WORK:-2}"   # review passes per work pass — bias to review; it's the bottleneck
POLL_SECONDS="${POLL_SECONDS:-120}"       # idle wait between cycles when the whole queue is empty
MAX_CYCLES="${MAX_CYCLES:-0}"             # 0 = run forever

trap 'rule; warn "autopilot stopping."; exit 130' INT TERM

if [ -z "${REVIEW_GITHUB_TOKEN:-}" ]; then
  warn "REVIEW_GITHUB_TOKEN is not set — running WORK-ONLY (no review passes)."
  warn "To balance the queue, set REVIEW_GITHUB_TOKEN to a DISTINCT GitHub identity with write access."
fi

cycle=0
while :; do
  cycle=$((cycle + 1))
  rule; info "${c_bold}autopilot cycle $cycle${c_reset}  (review×${REVIEW_PER_WORK} → work×1)"

  did_something=0

  # --- review side (distinct identity), review-first so we drain before adding ---
  if [ -n "${REVIEW_GITHUB_TOKEN:-}" ]; then
    for _ in $(seq 1 "$REVIEW_PER_WORK"); do
      info "review pass…"
      if MAX=1 POLL_SECONDS=0 ./review_work.sh "$@"; then did_something=1; fi
    done
  fi

  # --- work side (your normal identity) ---
  info "work pass…"
  if MAX=1 POLL_SECONDS=0 ./start_work.sh "$@"; then did_something=1; fi

  if [ "$MAX_CYCLES" != 0 ] && [ "$cycle" -ge "$MAX_CYCLES" ]; then
    ok "Reached MAX_CYCLES=$MAX_CYCLES — stopping."; break
  fi

  # Both queues were empty this cycle — nap before looking again.
  if [ "$did_something" = 0 ]; then
    log "Nothing to review or work right now. Sleeping ${POLL_SECONDS}s… (Ctrl-C to stop)"
    sleep "$POLL_SECONDS"
  fi
done
