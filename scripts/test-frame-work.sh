#!/usr/bin/env bash
# Unit tests for frame_work.sh's deterministic fan-out engine (ADR-0014):
#   - spawn_children: FANOUT_MAX cap, title normalisation + dedupe, non-array
#     side-file rejection, the rc=2 fail-closed dedupe-read contract, and the
#     stream-label fallback on a failed create
#   - restore_root_posture: researching / needs-synthesis / in-review split,
#     and the leave-alone contract on a transient read failure
# gh is stubbed on PATH (same approach as test-fg-common-preflight.sh); the
# runner is sourced with FG_TEST_SOURCE_ONLY=1 so main never runs. No network.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/fg-frame-test.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$TMP/bin"
export GH_LOG="$TMP/gh.log"

# gh stub: canned answers driven by env vars, mutating calls recorded to GH_LOG.
cat >"$TMP/bin/gh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
args="$*"
case "${1:-} ${2:-}" in
  "issue list")
    case "$args" in
      *"--json title"*)   # spawn_children's dedupe read
        [ "${GH_TITLES_FAIL:-0}" = 1 ] && exit 1
        [ -n "${GH_TITLES:-}" ] && printf '%s\n' "$GH_TITLES"
        exit 0 ;;
      *"--state open"*)   # stream_child_counts: open children
        [ "${GH_KIDS_FAIL:-0}" = 1 ] && exit 1
        echo "${GH_OPEN_KIDS:-0}"; exit 0 ;;
      *"--state all"*)    # stream_child_counts: all children
        [ "${GH_KIDS_FAIL:-0}" = 1 ] && exit 1
        echo "${GH_ALL_KIDS:-0}"; exit 0 ;;
    esac
    echo "unexpected gh issue list: $args" >&2; exit 64 ;;
  "issue create")
    echo "CREATE $args" >> "$GH_LOG"
    # GH_CREATE_FAIL=stream → only the attempt carrying a stream label fails
    # (exercises the label-fallback retry); =all → every attempt fails.
    case "${GH_CREATE_FAIL:-}" in
      all) exit 1 ;;
      stream) case "$args" in *"stream:"*) exit 1 ;; esac ;;
    esac
    exit 0 ;;
  "issue view")           # set_status_label/clear_status_label's keep-read
    echo '["stage: discover","stream:9"]'; exit 0 ;;
  "api -X")               # the atomic label PUT — the label set arrives on stdin
    body="$(cat 2>/dev/null || true)"
    echo "PUT $args BODY $body" >> "$GH_LOG"; exit 0 ;;
esac
echo "unexpected gh: $args" >&2; exit 64
EOF
chmod +x "$TMP/bin/gh"
export PATH="$TMP/bin:$PATH"

fail() { echo "FAIL: $*" >&2; exit 1; }

cd "$ROOT"
export FG_TEST_SOURCE_ONLY=1
# frame_work.sh cd's to its own dir and sources fg-common; main is skipped.
source ./frame_work.sh
ME="test-framer"   # normally set by preflight

# --- spawn_children: cap + normalisation + dedupe ---------------------------
FANOUT_MAX=2
f="$TMP/children.json"
cat >"$f" <<'JSON'
[{"title": "research: question one?", "why": "w1\nsecond line"},
 {"title": "no prefix two", "why": "w2"},
 {"title": "research: dropped by the cap", "why": "w3"}]
JSON
: > "$GH_LOG"; export GH_TITLES=""
spawn_children 9 "$f" 42 >/dev/null || fail "spawn_children returned nonzero on the happy path"
[ "$CHILDREN_CREATED" = 2 ] || fail "cap: expected 2 created, got $CHILDREN_CREATED"
grep -q "CREATE .*research: question one?" "$GH_LOG" || fail "first child not created"
grep -q "CREATE .*research: no prefix two" "$GH_LOG" || fail "research: prefix not added to bare title"
grep -q "dropped by the cap" "$GH_LOG" && fail "FANOUT_MAX did not cap the fan-out"
grep -q "CREATE .*Part of #9. Stream: #9." "$GH_LOG" || fail "child body must lead with Part of #<root>. Stream: #<root>."
grep -q "w1 second line" "$GH_LOG" || fail "newlines in 'why' were not flattened"

# Dedupe: an existing stream title (any case / repeated research: prefixes)
# suppresses the child.
FANOUT_MAX=6
: > "$GH_LOG"; export GH_TITLES="Research: RESEARCH: question   one?"
spawn_children 9 "$f" 42 >/dev/null || fail "spawn_children (dedupe) returned nonzero"
[ "$CHILDREN_CREATED" = 2 ] || fail "dedupe: expected 2 created (1 duplicate dropped), got $CHILDREN_CREATED"
grep -q "question one?" "$GH_LOG" && fail "duplicate title was still created"

# --- spawn_children: junk side-files never spawn -----------------------------
: > "$GH_LOG"
echo 'not json' > "$f"
spawn_children 9 "$f" 42 >/dev/null || fail "non-JSON side-file must be a clean no-op"
[ "$CHILDREN_CREATED" = 0 ] || fail "non-JSON side-file spawned children"
echo '{"title": "an object, not an array"}' > "$f"
spawn_children 9 "$f" 42 >/dev/null || fail "non-array side-file must be a clean no-op"
[ "$CHILDREN_CREATED" = 0 ] || fail "non-array side-file spawned children"
[ -s "$GH_LOG" ] && fail "junk side-files must not touch gh issue create"

# --- spawn_children: dedupe read failure fails CLOSED (rc 2, zero spawned) ---
cat >"$f" <<'JSON'
[{"title": "research: fine question", "why": "w"}]
JSON
: > "$GH_LOG"
rc=0; GH_TITLES_FAIL=1 spawn_children 9 "$f" 42 >/dev/null || rc=$?
[ "$rc" = 2 ] || fail "dedupe-read failure: expected rc 2, got $rc"
[ -s "$GH_LOG" ] && fail "dedupe-read failure must spawn nothing"

# --- spawn_children: create failure falls back to a label-less retry ---------
: > "$GH_LOG"
GH_CREATE_FAIL=stream spawn_children 9 "$f" 42 >/dev/null || fail "label-fallback path returned nonzero"
[ "$CHILDREN_CREATED" = 1 ] || fail "label-fallback: expected 1 created, got $CHILDREN_CREATED"
grep -q "CREATE .*stream:9" "$GH_LOG" || fail "labelled create attempt missing"
grep -qE "CREATE (.*[^:])?--label stage: research --label status: available --body" "$GH_LOG" \
  || fail "label-less fallback create attempt missing"
: > "$GH_LOG"
GH_CREATE_FAIL=all spawn_children 9 "$f" 42 >/dev/null || fail "total create failure must still return 0"
[ "$CHILDREN_CREATED" = 0 ] || fail "total create failure: expected 0 created, got $CHILDREN_CREATED"

# --- restore_root_posture: the three postures + fail-closed read -------------
: > "$GH_LOG"
GH_OPEN_KIDS=3 GH_ALL_KIDS=6 GH_TITLES="" restore_root_posture 9 || fail "open children: restore failed"
grep -q "PUT" "$GH_LOG" || fail "open children: no label PUT recorded"
grep -q "status:" "$GH_LOG" && fail "open children must clear every status label (researching posture)"

: > "$GH_LOG"
GH_OPEN_KIDS=0 GH_ALL_KIDS=6 restore_root_posture 9 || fail "drained stream: restore failed"
grep -q "needs-synthesis" "$GH_LOG" || fail "drained stream must restore needs-synthesis (not in-review)"

: > "$GH_LOG"
GH_OPEN_KIDS=0 GH_ALL_KIDS=0 restore_root_posture 9 || fail "no children: restore failed"
grep -q "in-review" "$GH_LOG" || fail "fan-out-never-happened must park at in-review"

: > "$GH_LOG"
rc=0; GH_KIDS_FAIL=1 restore_root_posture 9 || rc=$?
[ "$rc" = 1 ] || fail "transient child-count failure: expected rc 1, got $rc"
[ -s "$GH_LOG" ] && fail "transient child-count failure must not touch the status"

echo "frame_work tests passed"
