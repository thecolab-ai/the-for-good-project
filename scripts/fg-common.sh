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

# ONE GraphQL query for the whole open-issue queue, normalised to the same
# shape `gh issue list --json number,createdAt,labels,assignees` returns so the
# jq filters below are unchanged. A single poll cycle can fetch this once and
# feed EVERY queue check (available / my rework / unassigned rework) from it,
# instead of firing a separate REST list call per status. Capped at 100 (the
# GraphQL page max) to match the previous --limit 100 behaviour; ordered NEWEST
# first so that if the repo ever exceeds 100 open issues the truncation drops
# the oldest, not the freshly-created available/rework work we most want to see.
# (The jq filters re-sort deterministically, so fetch order doesn't affect the
# result while the queue is under 100 — it only decides which slice survives the
# cap.) labels(first:50) is ample headroom over the ~5 labels an issue carries.
fetch_open_issues() {
  gh api graphql -f query="{repository(owner:\"$OWNER\",name:\"$NAME\"){issues(states:OPEN,first:100,orderBy:{field:CREATED_AT,direction:DESC}){nodes{number createdAt labels(first:50){nodes{name}} assignees(first:10){nodes{login}}}}}}" \
    --jq '[.data.repository.issues.nodes[] | {number, createdAt, labels: [.labels.nodes[] | {name}], assignees: [.assignees.nodes[] | {login}]}]'
}

# Numbers of open issues with a given status label, optional STAGE filter.
# Order: issues labelled "priority: high" first, then oldest-created first.
# This is the whole priority system — label an issue "priority: high" to have
# the workers pick it up before the rest of the queue.
# $2 = optional queue snapshot (from fetch_open_issues). Pass one to check
# several statuses from a SINGLE GraphQL query; omit it and one is fetched.
# "do-not-automate" is a human's parking brake: an issue carrying it is
# invisible to EVERY automation queue below, whatever its status. Purely
# restrictive — it can only shrink queues.
issues_with_status() {  # $1 = bare status (e.g. available); $2 = optional snapshot JSON
  local status="$1" snap="${2:-}"
  [ -n "$snap" ] || snap="$(fetch_open_issues)"
  printf '%s' "$snap" | jq -r "[.[] | select(.labels|map(.name)|index(\"status: $status\")) | select(.labels|map(.name)|index(\"do-not-automate\")|not)$( [ -n "${STAGE:-}" ] && printf ' | select(.labels|map(.name)|index("stage: %s"))' "$STAGE" )] | sort_by((.labels|map(.name)|index(\"priority: high\")|not), .createdAt) | .[].number"
}

available_issues() { issues_with_status "available" "${1:-}"; }

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
resolve_claim_race() {  # $1 = issue number
  local n="$1" assignees winner
  sleep "$(claim_settle_secs)"
  assignees="$(gh issue view "$n" --repo "$REPO" --json assignees --jq '[.assignees[].login]|sort|join(" ")')"
  winner="${assignees%% *}"
  if [ -n "$winner" ] && [ "$winner" != "$ME" ]; then
    warn "#$n was claimed concurrently (assignees: $assignees) — @$winner wins, yielding."
    gh issue edit "$n" --repo "$REPO" --remove-assignee "@me" >/dev/null 2>&1 || true
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
