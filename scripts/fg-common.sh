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
REWORK_TTL="${REWORK_TTL:-7200}"         # secs a sent-back rework is held for its author before reap.sh frees it
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
  ME="$(gh api user --jq .login)"
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
  git -C "$REPO_DIR" worktree add --quiet --detach "$WORKTREE" "$1"
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

# Numbers of open issues with a given status label, optional STAGE filter.
# Order: issues labelled "priority: high" first, then oldest-created first.
# This is the whole priority system — label an issue "priority: high" to have
# the workers pick it up before the rest of the queue.
issues_with_status() {  # $1 = bare status (e.g. available), $2.. extra gh flags
  local status="$1"; shift
  gh issue list --repo "$REPO" --state open --label "status: $status" "$@" \
    --json number,createdAt,labels --limit 100 \
    --jq "[.[] $( [ -n "${STAGE:-}" ] && printf '| select(.labels|map(.name)|index("stage: %s"))' "$STAGE" )] | sort_by((.labels|map(.name)|index(\"priority: high\")|not), .createdAt) | .[].number"
}

available_issues() { issues_with_status "available"; }

# Issues a reviewer sent back that are assigned to *me* — my rework queue.
rework_issues() { issues_with_status "changes-requested" --assignee "@me"; }

# Reworks with NO assignee — freed by reap.sh after REWORK_TTL, so any worker
# may take them (oldest first). The author's own reworks stay theirs (above).
unassigned_reworks() {
  gh issue list --repo "$REPO" --state open --label "status: changes-requested" \
    --json number,assignees,createdAt --limit 100 \
    --jq '[.[] | select((.assignees|length)==0)] | sort_by(.createdAt) | .[].number'
}

# Drained stream roots waiting for a G1 synthesis draft.
synthesis_issues() { issues_with_status "needs-synthesis"; }

# First value of a "<prefix>..." entry in a comma-joined label list.
label_field() {  # $1 = labels csv, $2 = prefix (e.g. "stage: ", "stream:")
  printf '%s' "$1" | tr ',' '\n' | sed -n "s/^$2//p" | head -1
}

# Depth of an issue in its stream: 0 for a root (no line-anchored "Part of #p"
# in the body), else 1 + parent's depth, capped at 3 hops. Bounds agent
# fan-out (docs/STREAMS.md). FAILS CLOSED: if gh errors mid-walk (rate limit,
# network), reports the cap so fan-out is denied rather than unbounded.
issue_depth() {  # $1 = issue number
  local n="$1" d=0 body parent
  while [ "$d" -lt 3 ]; do
    if ! body="$(gh issue view "$n" --repo "$REPO" --json body --jq .body 2>/dev/null)"; then
      echo 3; return
    fi
    parent="$(printf '%s' "$body" | grep -oiE '^[[:space:]]*part of[[:space:]]*#[0-9]+' | head -1 | grep -oE '[0-9]+' || true)"
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
  local pr
  pr="$(gh api graphql -f query="{repository(owner:\"$OWNER\",name:\"$NAME\"){pullRequests(states:OPEN,first:50,orderBy:{field:CREATED_AT,direction:DESC}){nodes{number closingIssuesReferences(first:10){nodes{number}}}}}}" \
    --jq ".data.repository.pullRequests.nodes[] | select(.closingIssuesReferences.nodes|map(.number)|index($1)) | .number" | head -1)"
  [ -n "$pr" ] && { echo "$pr"; return 0; }
  local cands c
  cands="$(gh pr list --repo "$REPO" --state open --search "\"Part of #$1\" in:body" \
    --json number --jq '.[].number' 2>/dev/null || true)"
  for c in $cands; do
    if [ -z "$(issue_for_pr "$c")" ]; then echo "$c"; return 0; fi
  done
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

# Issue closed by a PR (first closing ref). Use this ONLY when you specifically
# mean "the issue merging this PR will CLOSE" (e.g. marking it done) — discover
# PRs have no closing ref by design, so this is empty for them.
issue_for_pr() {
  gh api graphql -f query="{repository(owner:\"$OWNER\",name:\"$NAME\"){pullRequest(number:$1){closingIssuesReferences(first:5){nodes{number}}}}}" \
    --jq '.data.repository.pullRequest.closingIssuesReferences.nodes[0].number // empty'
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

set_status_label() {  # $1 issue, $2 new-status (bare, e.g. in-review), $3.. old statuses to remove
  local n="$1" new="$2"; shift 2
  local args=(--add-label "status: $new")
  for old in "$@"; do args+=(--remove-label "status: $old"); done
  gh issue edit "$n" --repo "$REPO" "${args[@]}" >/dev/null
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
      $tmo codex exec --cd "$dir" --skip-git-repo-check \
        ${CODEX_FLAGS:---dangerously-bypass-approvals-and-sandbox} \
        ${MODEL:+-m "$MODEL"} "$prompt"
      ;;
    claude)
      ( cd "$dir" && $tmo claude -p "$prompt" \
        --permission-mode "${CLAUDE_PERMISSION_MODE:-bypassPermissions}" \
        ${MODEL:+--model "$MODEL"} )
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
