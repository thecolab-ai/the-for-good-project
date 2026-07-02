#!/usr/bin/env bash
# Shared helpers for The For Good Project automation scripts
# (start_work.sh, review_work.sh). Not meant to be run directly.

REPO="${FOR_GOOD_REPO:-thecolab-ai/the-for-good-project}"
OWNER="${REPO%%/*}"
NAME="${REPO##*/}"
AGENT="${AGENT:-codex}"                 # codex | claude
MODEL="${MODEL:-}"                       # optional model override
AGENT_TIMEOUT="${AGENT_TIMEOUT:-2400}"   # seconds per agent run (0 = none)
REVIEW_CHECK_CONTEXT="for-good/adversarial-review"

# ---- pretty logging ----
c_reset=$'\e[0m'; c_dim=$'\e[2m'; c_blue=$'\e[34m'; c_green=$'\e[32m'; c_yellow=$'\e[33m'; c_red=$'\e[31m'; c_bold=$'\e[1m'
log()  { printf '%s%s%s\n' "$c_dim" "$*" "$c_reset"; }
info() { printf '%s▸%s %s\n' "$c_blue" "$c_reset" "$*"; }
ok()   { printf '%s✓%s %s\n' "$c_green" "$c_reset" "$*"; }
warn() { printf '%s!%s %s\n' "$c_yellow" "$c_reset" "$*"; }
err()  { printf '%s✗%s %s\n' "$c_red" "$c_reset" "$*" >&2; }
rule() { printf '%s────────────────────────────────────────────────%s\n' "$c_dim" "$c_reset"; }

# ---- preflight ----
preflight() {
  local missing=0
  for bin in git gh jq; do
    command -v "$bin" >/dev/null 2>&1 || { err "missing dependency: $bin"; missing=1; }
  done
  command -v "$AGENT" >/dev/null 2>&1 || { err "agent '$AGENT' not on PATH (set AGENT=codex|claude)"; missing=1; }
  gh auth status >/dev/null 2>&1 || { err "gh is not authenticated — run: gh auth login"; missing=1; }
  [ "$missing" = 0 ] || exit 1

  # Resolve the repo working directory (a clone of $REPO).
  REPO_DIR="${REPO_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"
  if [ -z "$REPO_DIR" ] || ! git -C "$REPO_DIR" remote get-url origin 2>/dev/null | grep -q "$NAME"; then
    err "Run this from inside a clone of $REPO (or set REPO_DIR to one)."
    exit 1
  fi
  # Guard: these scripts run `git reset --hard` per task, which discards
  # uncommitted changes to TRACKED files. Refuse to run on a dirty clone so we
  # can never silently destroy someone's work (untracked files like node_modules
  # / build output are ignored). Override with ALLOW_DIRTY=1 (git_reset_to_main
  # then stashes rather than discards).
  if [ "${RESETS_TREE:-0}" = 1 ] && [ "${DRY_RUN:-0}" != 1 ] && [ "${ALLOW_DIRTY:-0}" != 1 ] \
     && [ -n "$(git -C "$REPO_DIR" status --porcelain --untracked-files=no)" ]; then
    err "The clone at $REPO_DIR has uncommitted changes to tracked files."
    err "Commit or stash them first — these scripts run 'git reset --hard' and would discard them."
    err "(To proceed anyway, set ALLOW_DIRTY=1; the changes will be stashed, not lost.)"
    exit 1
  fi
  ME="$(gh api user --jq .login)"
}

# ---- git helpers ----
git_reset_to_main() {
  git -C "$REPO_DIR" fetch origin --quiet
  # Safety net: never silently discard uncommitted tracked changes — stash them
  # first (recoverable via `git stash list`) before hard-resetting.
  if [ -n "$(git -C "$REPO_DIR" status --porcelain --untracked-files=no)" ]; then
    local ts; ts="$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo now)"
    if git -C "$REPO_DIR" stash push --quiet -m "fg-auto-stash before reset ($ts)" >/dev/null 2>&1; then
      warn "Stashed uncommitted changes before reset — recover with: git -C "$REPO_DIR" stash list"
    fi
  fi
  git -C "$REPO_DIR" checkout --quiet main 2>/dev/null || git -C "$REPO_DIR" checkout --quiet -b main origin/main
  git -C "$REPO_DIR" reset --hard --quiet origin/main
  git -C "$REPO_DIR" clean -fdq -e node_modules
}

# ---- issue/PR helpers ----
issue_labels()  { gh issue view "$1" --repo "$REPO" --json labels --jq '[.labels[].name]|join(",")'; }
issue_field()   { gh issue view "$1" --repo "$REPO" --json "$2" --jq ".$2"; }

# Numbers of open issues with a given status label, oldest first, optional STAGE filter.
available_issues() {
  gh issue list --repo "$REPO" --state open --label "status: available" \
    --json number,createdAt,labels --limit 100 \
    --jq "[.[] $( [ -n "$STAGE" ] && printf '| select(.labels|map(.name)|index("stage: %s"))' "$STAGE" )] | sort_by(.createdAt) | .[].number"
}

# The open PR (if any) that closes a given issue number, via GraphQL closing refs.
pr_for_issue() {
  gh api graphql -f query="{repository(owner:\"$OWNER\",name:\"$NAME\"){pullRequests(states:OPEN,first:50){nodes{number closingIssuesReferences(first:10){nodes{number}}}}}}" \
    --jq ".data.repository.pullRequests.nodes[] | select(.closingIssuesReferences.nodes|map(.number)|index($1)) | .number" | head -1
}

# Issue closed by a PR (first closing ref).
issue_for_pr() {
  gh api graphql -f query="{repository(owner:\"$OWNER\",name:\"$NAME\"){pullRequest(number:$1){closingIssuesReferences(first:5){nodes{number}}}}}" \
    --jq '.data.repository.pullRequest.closingIssuesReferences.nodes[0].number // empty'
}

set_status_label() {  # $1 issue, $2 new-status (bare, e.g. in-review), $3.. old statuses to remove
  local n="$1" new="$2"; shift 2
  local args=(--add-label "status: $new")
  for old in "$@"; do args+=(--remove-label "status: $old"); done
  gh issue edit "$n" --repo "$REPO" "${args[@]}" >/dev/null
}

# ---- agent runner ----
# run_agent <prompt>  -> streams agent output to stdout (also to caller via tee if needed)
run_agent() {
  local prompt="$1" tmo=""
  if [ "$AGENT_TIMEOUT" != 0 ] && command -v timeout >/dev/null 2>&1; then tmo="timeout ${AGENT_TIMEOUT}s"; fi
  case "$AGENT" in
    codex)
      $tmo codex exec --cd "$REPO_DIR" --skip-git-repo-check \
        ${CODEX_FLAGS:---dangerously-bypass-approvals-and-sandbox} \
        ${MODEL:+-m "$MODEL"} "$prompt"
      ;;
    claude)
      ( cd "$REPO_DIR" && $tmo claude -p "$prompt" \
        --permission-mode "${CLAUDE_PERMISSION_MODE:-bypassPermissions}" \
        ${MODEL:+--model "$MODEL"} )
      ;;
    *) err "unknown AGENT '$AGENT'"; return 2 ;;
  esac
}
