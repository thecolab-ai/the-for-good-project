#!/usr/bin/env bash
# Unit tests for the claim-fail backoff helpers in scripts/fg-common.sh (#766):
#   - empty_attempt_count: how many prior "finished with no PR" markers an issue
#     carries (derived from GitHub comments, so it survives across separate runs
#     and different runner identities)
#   - empty_attempt_verdict: release-to-available vs park-status:blocked at the cap
# Everything runs against synthetic `gh issue view --json comments` payloads —
# no gh, no network.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT/scripts/fg-common.sh"

fail() { echo "FAIL: $*" >&2; exit 1; }
ok()   { printf '  ok   %s\n' "$1"; }

M="$EMPTY_ATTEMPT_MARKER"

# Build a {comments:[{body}...]} payload from the bodies passed as args.
comments() { printf '%s\n' "$@" | jq -R '{body: .}' | jq -s '{comments: .}'; }

echo "empty_attempt_count: counts only marker-bearing comments"

got="$(empty_attempt_count "$(comments)")"
[ "$got" = 0 ] || fail "empty comments: want 0, got '$got'"
ok "no comments → 0"

got="$(empty_attempt_count "$(comments "just a normal review comment" "another one")")"
[ "$got" = 0 ] || fail "no markers: want 0, got '$got'"
ok "comments without the marker → 0"

got="$(empty_attempt_count "$(comments "$M first release" "human chatter" "$M second release")")"
[ "$got" = 2 ] || fail "two markers among chatter: want 2, got '$got'"
ok "two markers mixed with other comments → 2"

# Robustness: junk / missing field / empty string never explodes, always 0.
for junk in '' 'not json' '{}' '{"comments":[]}' '[{"body":"x"}]'; do
  got="$(empty_attempt_count "$junk")"
  [ "$got" = 0 ] || fail "junk payload '$junk': want 0, got '$got'"
done
ok "junk / empty / wrong-shape payloads → 0 (fails safe)"

echo "empty_attempt_verdict: release below the cap, block at/over it (cap 3)"

[ "$(empty_attempt_verdict 1 3)" = release ] || fail "attempt 1/3 should release"
[ "$(empty_attempt_verdict 2 3)" = release ] || fail "attempt 2/3 should release"
[ "$(empty_attempt_verdict 3 3)" = block   ] || fail "attempt 3/3 should block"
[ "$(empty_attempt_verdict 4 3)" = block   ] || fail "attempt 4/3 should block"
ok "verdict crosses to 'block' exactly at the cap"

echo "end-to-end progression: a chronically-failing issue parks on the 3rd empty attempt"
# Simulate the marker accumulating one per failed claim; verdict uses prior+1.
bodies=()
for round in 1 2 3; do
  prior="$(empty_attempt_count "$(comments ${bodies[@]+"${bodies[@]}"})")"
  attempts=$((prior + 1))
  verdict="$(empty_attempt_verdict "$attempts" 3)"
  case "$round" in
    1|2) [ "$verdict" = release ] || fail "round $round (attempt $attempts) should release, got $verdict" ;;
    3)   [ "$verdict" = block   ] || fail "round $round (attempt $attempts) should block, got $verdict" ;;
  esac
  bodies+=("$M empty attempt $attempts")   # this run posts its own marker
done
ok "release, release, block — 2 re-releases then parked (matches #728/#521 pattern)"

echo "ALL PASS"
