#!/usr/bin/env bash
#
# review_work.sh — adversarially review open PRs before they can merge.
#
# For each open PR that hasn't passed review yet, run an AI agent (codex or
# claude) whose job is to REFUTE the work against the project method, then post
# the review and set the required "for-good/adversarial-review" status check.
# Each review runs in a FRESH GIT WORKTREE of the PR head (freshly fetched), so
# your clone is never touched. On PASS it approves (and can auto-merge); on
# NEEDS_WORK it requests changes AND flips the linked issue to
# "status: changes-requested" so the AUTHOR's next start_work.sh loop picks the
# rework up. A PR already marked NEEDS_WORK at its current revision is skipped
# until the author pushes rework (FORCE=1 to re-review anyway).
#
# INTEGRITY RULE: an adversarial review may NOT be done by the PR's author.
# This script enforces that — it refuses to review a PR authored by the reviewer
# identity, and branch protection additionally requires a non-author approval.
# To review as an agent, run under a DISTINCT identity via REVIEW_GITHUB_TOKEN
# (a bot / second GitHub account, or a GitHub App token, with write access).
#
# Usage:
#   REVIEW_GITHUB_TOKEN=<bot-pat> ./review_work.sh          # review all open PRs
#   REVIEW_GITHUB_TOKEN=<bot-pat> AGENT=claude ./review_work.sh
#   REVIEW_GITHUB_TOKEN=<bot-pat> AUTO_MERGE=1 ./review_work.sh
#   PR=7 ./review_work.sh                                    # a single PR
#   DRY_RUN=1 ./review_work.sh
#
# Env: REVIEW_GITHUB_TOKEN AGENT MODEL AUTO_MERGE PR MAX POLL_SECONDS DRY_RUN
#      AGENT_TIMEOUT FOR_GOOD_REPO REPO_DIR
set -euo pipefail
cd "$(dirname "$0")"
source "scripts/fg-common.sh"
trap 'remove_worktree || true' EXIT INT TERM

DRY_RUN="${DRY_RUN:-0}"
AUTO_MERGE="${AUTO_MERGE:-0}"
POLL_SECONDS="${POLL_SECONDS:-0}"
MAX="${MAX:-0}"
ONLY_PR="${PR:-}"
REVIEW_FILE=""

# Use a distinct reviewer identity if provided (recommended).
if [ -n "${REVIEW_GITHUB_TOKEN:-}" ]; then export GH_TOKEN="$REVIEW_GITHUB_TOKEN"; fi

review_prompt() {  # $1 = PR number
  local pr="$1" title body
  title="$(gh pr view "$pr" --repo "$REPO" --json title --jq .title)"
  body="$(gh pr view "$pr" --repo "$REPO" --json body --jq .body)"
  cat <<EOF
You are a FRESH-CONTEXT ADVERSARIAL REVIEWER for The For Good Project
(github.com/$REPO). You are in a dedicated git worktree of the repo with pull
request #$pr's head checked out (detached HEAD, freshly fetched). Your job is to
REFUTE this work, not to approve it.

PR #$pr — $title
$body

Inspect the change with: git diff origin/main...HEAD  (and read the added files).
Read CONTRIBUTING.md and docs/METHOD.md — judge the PR against that method:

- Every factual claim MUST have an inline citation. Flag any that don't.
- Surprising / load-bearing claims MUST have TWO independent sources. Spot-check
  that the cited URLs resolve and actually SUPPORT the claim — hunt for citations
  that don't say what they're used for.
- Confidence marks (High/Med/Low) must be justified by the evidence, not inflated.
- No fabricated sources/stats/orgs/results. No personal or identifying data.
- Files are in the right place and follow the templates.
- Look for missing counter-evidence and anything a real decision-maker would be
  misled by.

Be fair but hard to convince — someone will make a real decision based on this.

OUTPUT (do exactly this):
1. Write your full review as Markdown to the file ".fg-review.md" in the repo
   root: a short summary, then specific problems (file + line + why), then a
   one-line verdict. Do NOT commit it.
2. As the very LAST line of your response, print exactly one of:
   VERDICT: PASS
   VERDICT: NEEDS_WORK
Do not edit the PR's files, change labels, or merge anything.
EOF
}

open_prs_needing_review() {
  gh pr list --repo "$REPO" --state open --json number,isDraft,headRefOid,author \
    --jq '.[] | select(.isDraft|not) | .number'
}

check_state() {  # $1 = sha  -> success|failure|pending|none
  gh api "repos/$OWNER/$NAME/commits/$1/statuses" \
    --jq "[.[]|select(.context==\"$REVIEW_CHECK_CONTEXT\")][0].state // \"none\"" 2>/dev/null || echo none
}

set_check() {  # $1 sha, $2 state(success|failure), $3 desc, $4 url
  [ "$DRY_RUN" = 1 ] && { info "[dry-run] would set check $REVIEW_CHECK_CONTEXT=$2 on $1"; return 0; }
  gh api -X POST "repos/$OWNER/$NAME/statuses/$1" \
    -f state="$2" -f context="$REVIEW_CHECK_CONTEXT" -f description="$3" -f target_url="$4" >/dev/null 2>&1 \
    || warn "Couldn't set the merge check (needs write access). Your review is recorded — a maintainer's merge_ready.sh will validate it and merge."
}

review_one() {  # $1 = PR number
  local pr="$1"
  local sha author url
  sha="$(gh pr view "$pr" --repo "$REPO" --json headRefOid --jq .headRefOid)"
  author="$(gh pr view "$pr" --repo "$REPO" --json author --jq .author.login)"
  url="$(gh pr view "$pr" --repo "$REPO" --json url --jq .url)"
  rule; info "${c_bold}PR #$pr${c_reset} — $(gh pr view "$pr" --repo "$REPO" --json title --jq .title) ${c_dim}(by @$author)${c_reset}"

  # INTEGRITY: reviewer must differ from the author.
  if [ "$author" = "$ME" ]; then
    err "Reviewer identity (@$ME) is the PR author — an adversarial review must come from a DIFFERENT identity."
    warn "Set REVIEW_GITHUB_TOKEN to a bot / second account (with write access) and re-run. Skipping #$pr."
    return 1
  fi

  if [ "${FORCE:-0}" != 1 ]; then
    local st; st="$(check_state "$sha")"
    if [ "$st" = success ]; then
      ok "#$pr already passed adversarial review — skipping (FORCE=1 to redo)."; return 0
    fi
    if [ "$st" = failure ]; then
      log "#$pr already reviewed at this revision (NEEDS_WORK) — waiting on the author's rework. Skipping (FORCE=1 to redo)."; return 0
    fi
  fi

  if [ "$DRY_RUN" = 1 ]; then
    info "[dry-run] would checkout PR #$pr in a fresh worktree, run $AGENT reviewer, post review as @$ME, set check + approve/request-changes"
    return 0
  fi

  info "Checking out PR #$pr into a fresh worktree..."
  if ! git -C "$REPO_DIR" fetch origin --quiet "+pull/$pr/head:refs/fg/pr-$pr"; then
    err "Could not fetch PR #$pr head — skipping."; return 1
  fi
  make_worktree "refs/fg/pr-$pr"
  REVIEW_FILE="$WORKTREE/.fg-review.md"

  local tmp; tmp="$(mktemp)"
  info "Handing PR #$pr to $AGENT for adversarial review (worktree: $WORKTREE)..."
  run_agent "$(review_prompt "$pr")" "$WORKTREE" 2>&1 | tee "$tmp" || true

  local verdict; verdict="$(grep -Eo 'VERDICT:[[:space:]]*(PASS|NEEDS_WORK)' "$tmp" | tail -1 | grep -Eo 'PASS|NEEDS_WORK' || true)"
  rm -f "$tmp"
  local body_flag=()
  [ -s "$REVIEW_FILE" ] && body_flag=(--body-file "$REVIEW_FILE") || body_flag=(--body "Adversarial review completed; see check status.")

  if [ "$verdict" = PASS ]; then
    ok "Verdict: PASS"
    gh pr review "$pr" --repo "$REPO" --approve "${body_flag[@]}" >/dev/null \
      || gh pr comment "$pr" --repo "$REPO" "${body_flag[@]}" >/dev/null || true
    set_check "$sha" success "Adversarial review passed" "$url"
    if [ "$AUTO_MERGE" = 1 ]; then
      info "AUTO_MERGE=1 — merging #$pr..."
      if gh pr merge "$pr" --repo "$REPO" --squash --delete-branch >/dev/null 2>&1; then
        ok "Merged #$pr"
        local iss; iss="$(issue_for_pr "$pr" || true)"
        [ -n "$iss" ] && { set_status_label "$iss" "done" "in-review" "claimed" "changes-requested"; ok "Issue #$iss → done"; }
      else warn "Could not auto-merge #$pr (branch protection / conflicts) — leaving for a maintainer."; fi
    fi
  else
    [ -z "$verdict" ] && warn "No explicit verdict parsed — failing closed (NEEDS_WORK)."
    warn "Verdict: NEEDS_WORK"
    gh pr review "$pr" --repo "$REPO" --request-changes "${body_flag[@]}" >/dev/null \
      || gh pr comment "$pr" --repo "$REPO" "${body_flag[@]}" >/dev/null || true
    set_check "$sha" failure "Adversarial review found problems" "$url"
    # Route the rework back to the author: flip the linked issue to
    # "changes-requested" so THEIR next start_work.sh loop picks it up.
    local iss; iss="$(issue_for_pr "$pr" || true)"
    if [ -n "$iss" ]; then
      if set_status_label "$iss" "changes-requested" "in-review" 2>/dev/null; then
        gh issue comment "$iss" --repo "$REPO" --body "🔁 Adversarial review of PR #$pr found problems — sending back to @$author for rework (**status: changes-requested**). Their next \`start_work.sh\` loop will pick this up." >/dev/null || true
        ok "Issue #$iss → changes-requested (back to @$author)"
      else
        warn "Couldn't flip issue #$iss to changes-requested (needs triage/write access) — the review itself is recorded."
      fi
    fi
  fi
  remove_worktree
  git -C "$REPO_DIR" update-ref -d "refs/fg/pr-$pr" 2>/dev/null || true
}

main() {
  preflight
  info "review_work.sh · repo=$REPO · agent=$AGENT · reviewer=@$ME$([ "$AUTO_MERGE" = 1 ] && printf " · AUTO_MERGE")$([ "$DRY_RUN" = 1 ] && printf " · DRY_RUN")"
  if [ -z "${REVIEW_GITHUB_TOKEN:-}" ]; then
    warn "No REVIEW_GITHUB_TOKEN set — reviewing as @$ME. PRs you authored will be skipped (reviewer must differ from author)."
  fi
  local done=0
  while :; do
    local prs
    if [ -n "$ONLY_PR" ]; then prs="$ONLY_PR"; else prs="$(open_prs_needing_review || true)"; fi
    if [ -z "$prs" ]; then
      if [ -z "$ONLY_PR" ] && [ "$POLL_SECONDS" -gt 0 ] && [ "$DRY_RUN" = 0 ]; then
        log "No open PRs. Sleeping ${POLL_SECONDS}s..."; sleep "$POLL_SECONDS"; continue
      fi
      rule; ok "No open PRs needing review."; break
    fi
    for pr in $prs; do
      review_one "$pr" || true
      done=$((done+1))
      [ "$MAX" -gt 0 ] && [ "$done" -ge "$MAX" ] && { rule; ok "Reached MAX=$MAX. Stopping."; exit 0; }
    done
    [ -n "$ONLY_PR" ] && break
    [ "$POLL_SECONDS" -gt 0 ] && [ "$DRY_RUN" = 0 ] || break
    sleep "$POLL_SECONDS"
  done
}
main "$@"
