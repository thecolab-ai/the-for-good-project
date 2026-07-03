#!/usr/bin/env bash
# Unit tests for the pure-jq queue logic in scripts/fg-common.sh:
#   - issues_with_status: the HIGH_PRIORITY_CAP jump-queue is bounded by
#     STREAM, and high items beyond the cap fall back to age order (#293)
#   - active_streams: which streams count as active for the
#     MAX_ACTIVE_STREAMS backlog gate (#292)
# Everything runs against synthetic fetch_open_issues snapshots — no gh, no
# network.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export HIGH_PRIORITY_CAP=2
source "$ROOT/scripts/fg-common.sh"

fail() { echo "FAIL: $*" >&2; exit 1; }

issue() {  # $1 number, $2 createdAt, $3.. labels
  local n="$1" at="$2"; shift 2
  local labels; labels="$(printf '%s\n' "$@" | jq -R '{name: .}' | jq -s .)"
  jq -n --argjson n "$n" --arg at "$at" --argjson l "$labels" \
    '{number: $n, createdAt: $at, labels: $l, assignees: []}'
}

# --- #293: capped, stream-grouped jump-queue -------------------------------
# Four high items across three streams (stream 1 has TWO high items — e.g.
# #164-style propagation), plus an old normal issue. With cap=2 only the two
# OLDEST high streams (1 and 2) jump — all their high items, in age order —
# then everything else falls back to plain age order.
snap="$(jq -s . \
  <(issue 11 "2026-01-02T00:00:00Z" "status: available" "priority: high" "stream:1") \
  <(issue 21 "2026-01-03T00:00:00Z" "status: available" "priority: high" "stream:2") \
  <(issue 12 "2026-01-05T00:00:00Z" "status: available" "priority: high" "stream:1") \
  <(issue 31 "2026-01-04T00:00:00Z" "status: available" "priority: high" "stream:3") \
  <(issue 5  "2026-01-01T00:00:00Z" "status: available") \
  <(issue 9  "2026-01-01T00:00:00Z" "status: available" "priority: high" "do-not-automate") \
)"
got="$(issues_with_status available "$snap" | tr '\n' ' ' | sed 's/ $//')"
want="11 21 12 5 31"
[ "$got" = "$want" ] || fail "capped jump-queue order: want '$want', got '$got'"

# Same snapshot, status filter still applies.
got="$(issues_with_status claimed "$snap" | tr '\n' ' ' | sed 's/ $//')"
[ -z "$got" ] || fail "no claimed issues expected, got '$got'"

# --- #292: active streams ---------------------------------------------------
#  - root 100: available only, no open children  → NOT active (backlog)
#  - root 200: claimed                            → active
#  - root 300: needs-synthesis, drained           → NOT active
#  - stream 400: root closed/not open, but an open child carries stream:400
#                                                 → active via child work
snap="$(jq -s . \
  <(issue 100 "2026-01-01T00:00:00Z" "stage: discover" "status: available" "stream:100") \
  <(issue 200 "2026-01-01T00:00:00Z" "stage: discover" "status: claimed" "stream:200") \
  <(issue 300 "2026-01-01T00:00:00Z" "stage: discover" "status: needs-synthesis" "stream:300") \
  <(issue 401 "2026-01-02T00:00:00Z" "stage: research" "status: in-review" "stream:400") \
)"
got="$(active_streams "$snap" | sort -n | tr '\n' ' ' | sed 's/ $//')"
want="200 400"
[ "$got" = "$want" ] || fail "active_streams: want '$want', got '$got'"

echo "fg-common queue tests passed"
