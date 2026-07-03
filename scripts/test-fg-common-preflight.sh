#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/fg-preflight-test.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$TMP/bin"

cat >"$TMP/bin/gh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

case "$1 $2" in
  "auth status")
    exit 0
    ;;
  "api user")
    if [ "${GH_API_USER_FAIL:-0}" = 1 ]; then
      echo "gh: Resource not accessible by integration (HTTP 403)" >&2
      exit 1
    fi
    echo "local-user"
    exit 0
    ;;
esac

echo "unexpected gh args: $*" >&2
exit 64
EOF

cat >"$TMP/bin/git" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

if [ "$1" = "rev-parse" ] && [ "${2:-}" = "--show-toplevel" ]; then
  echo "$FAKE_REPO_DIR"
  exit 0
fi

if [ "$1" = "-C" ] && [ "${3:-}" = "remote" ] && [ "${4:-}" = "get-url" ] && [ "${5:-}" = "origin" ]; then
  echo "https://github.com/thecolab-ai/the-for-good-project.git"
  exit 0
fi

echo "unexpected git args: $*" >&2
exit 64
EOF

cat >"$TMP/bin/jq" <<'EOF'
#!/usr/bin/env bash
exit 0
EOF

chmod +x "$TMP/bin/gh" "$TMP/bin/git" "$TMP/bin/jq"

run_preflight() {
  local fail="$1"
  local actions="${2:-}"
  FAKE_REPO_DIR="$ROOT" \
  GH_API_USER_FAIL="$fail" \
  GITHUB_ACTIONS="$actions" \
  PATH="$TMP/bin:$PATH" \
    bash -c 'cd "$1"; source scripts/fg-common.sh; preflight; printf "%s\n" "$ME"' _ "$ROOT"
}

got="$(run_preflight 0 "")"
[ "$got" = "local-user" ] || {
  echo "expected local-user from gh api user, got: $got" >&2
  exit 1
}

got="$(run_preflight 1 "true")"
[ "$got" = "github-actions[bot]" ] || {
  echo "expected github-actions[bot] fallback, got: $got" >&2
  exit 1
}

echo "fg-common preflight tests passed"
