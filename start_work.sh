#!/usr/bin/env bash
#
# start_work.sh — autonomously work The For Good Project's queue.
#
# Loops: claim the next available issue, run an AI agent (codex or claude) to do
# the work following the project method, then move the issue to "in review" when
# the agent opens a PR. The SCRIPT owns every status transition — the agent just
# does the work and opens the PR — so tracking stays correct no matter which
# agent runs or how it behaves.
#
# Usage:
#   ./start_work.sh                 # work issues until the queue is empty
#   AGENT=claude ./start_work.sh    # use `claude -p` instead of `codex`
#   STAGE=research ./start_work.sh  # only pick up research-stage issues
#   MAX=1 ./start_work.sh           # do a single issue and stop
#   DRY_RUN=1 ./start_work.sh       # show what it would do, touch nothing
#   MODEL=gpt-5.5 ./start_work.sh   # override the agent model
#
# Env: AGENT(codex|claude) MAX STAGE POLL_SECONDS DRY_RUN MODEL AGENT_TIMEOUT
#      FOR_GOOD_REPO REPO_DIR
set -euo pipefail
cd "$(dirname "$0")"
source "scripts/fg-common.sh"

MAX="${MAX:-0}"                       # 0 = no limit
POLL_SECONDS="${POLL_SECONDS:-0}"     # >0 = keep polling when queue empty
DRY_RUN="${DRY_RUN:-0}"
CLAIMED_ISSUE=""

release_on_interrupt() {
  if [ -n "$CLAIMED_ISSUE" ] && [ "$DRY_RUN" = 0 ]; then
    warn "Interrupted mid-issue #$CLAIMED_ISSUE — leaving it 'claimed' for you to resume or release."
  fi
  exit 130
}
trap release_on_interrupt INT TERM

work_prompt() {  # $1 = issue number
  local n="$1"
  local title body labels domain stage
  title="$(gh issue view "$n" --repo "$REPO" --json title --jq .title)"
  body="$(gh issue view "$n" --repo "$REPO" --json body --jq .body)"
  labels="$(issue_labels "$n")"
  domain="$(printf '%s' "$labels" | tr ',' '\n' | sed -n 's/^domain: //p' | head -1)"
  stage="$(printf '%s' "$labels" | tr ',' '\n' | sed -n 's/^stage: //p' | head -1)"
  cat <<EOF
You are an autonomous contributor to The For Good Project
(github.com/$REPO). You are working inside a clone of the repo, on a fresh,
up-to-date 'main' branch. Complete ONE GitHub issue end to end, then open a PR.

== ISSUE #$n ($stage${domain:+, $domain}) ==
$title

$body
== END ISSUE ==

Method — read CONTRIBUTING.md and docs/METHOD.md and follow them exactly:
- Cite every factual claim inline with a real, working source URL.
- Surprising or load-bearing claims need TWO independent sources; if you can
  only find one, say so explicitly.
- Prefer official / current NZ sources (govt, Stats NZ, councils, established
  NGOs, peer-reviewed work) over blogs and secondary reporting.
- Mark overall and per-claim confidence: High / Medium / Low.
- End with "what would change this conclusion" and what you could not verify.
- NEVER fabricate a source, statistic, org, or result. No personal/identifying
  data. If a human with lived experience or authority is needed, say so.

Where the output goes (match the issue's stage):
- research → research/findings/$domain/<slug>.md  using research/TEMPLATE.md
- ideate   → solutions/<slug>.md                   using solutions/TEMPLATE.md
- build    → projects/<slug>/                       (see projects/README.md)
Use a short kebab-case <slug>.

Then, using git and the gh CLI (both are already authenticated):
1. Create a branch named "$stage/<slug>".
2. Commit your work with a message ending "(Closes #$n)".
3. Push the branch to origin.
4. Open a pull request whose body contains "Closes #$n" so it links to the
   issue. Use: gh pr create --fill --body "Closes #$n. <one-line summary>".

IMPORTANT: do NOT touch issue labels or assignees — the runner manages issue
status. Do exactly one issue (#$n). When finished, print the PR URL.
EOF
}

claim_issue() {  # $1 = issue number; returns 0 if we hold the claim
  local n="$1"
  # Re-check it's still available (best-effort lock via the label + assignee).
  local labels; labels="$(issue_labels "$n")"
  case ",$labels," in *",status: available,"*) : ;; *) warn "#$n no longer available — skipping."; return 1 ;; esac
  if [ "$DRY_RUN" = 1 ]; then info "[dry-run] would claim #$n (assign @$ME, status: available → claimed)"; return 0; fi
  gh issue edit "$n" --repo "$REPO" --add-assignee "@me" \
     --add-label "status: claimed" --remove-label "status: available" >/dev/null
  gh issue comment "$n" --repo "$REPO" --body "🤖 @$ME is starting work on this via \`start_work.sh\` (agent: \`$AGENT\`)." >/dev/null
  CLAIMED_ISSUE="$n"
  ok "Claimed #$n"
}

finish_issue() {  # $1 = issue number
  local n="$1" pr
  pr="$(pr_for_issue "$n" || true)"
  if [ -n "$pr" ]; then
    if [ "$DRY_RUN" = 1 ]; then info "[dry-run] would move #$n → in-review (PR #$pr)"; CLAIMED_ISSUE=""; return 0; fi
    set_status_label "$n" "in-review" "claimed" "available"
    # Ask GitHub to merge this PR automatically once the gate is met (a non-author
    # adversarial review passes). Best-effort — needs write access.
    gh pr merge "$pr" --repo "$REPO" --auto --squash >/dev/null 2>&1 \
      && log "  auto-merge enabled on #$pr (merges once a non-author review passes)" \
      || warn "  could not enable auto-merge on #$pr (needs write access) — a reviewer/maintainer can enable it"
    gh issue comment "$n" --repo "$REPO" --body "🔍 Work submitted in #$pr — moving to **in review**. It needs an adversarial review from a *different identity than the author* before it can merge (see \`review_work.sh\`)." >/dev/null
    ok "#$n → in-review (PR #$pr)"
  else
    if [ "$DRY_RUN" = 1 ]; then info "[dry-run] no PR found for #$n — would release back to available"; CLAIMED_ISSUE=""; return 0; fi
    set_status_label "$n" "available" "claimed"
    gh issue edit "$n" --repo "$REPO" --remove-assignee "@me" >/dev/null || true
    gh issue comment "$n" --repo "$REPO" --body "⚠️ The agent finished without opening a PR — releasing this back to **available** for someone else to pick up." >/dev/null
    warn "#$n released (no PR opened)"
  fi
  CLAIMED_ISSUE=""
}

work_one() {  # $1 = issue number
  local n="$1"
  rule; info "${c_bold}Issue #$n${c_reset} — $(issue_field "$n" title)"
  claim_issue "$n" || return 1
  if [ "$DRY_RUN" = 1 ]; then
    info "[dry-run] would run: AGENT=$AGENT on the following prompt:"; log "$(work_prompt "$n" | sed 's/^/    /')"
    finish_issue "$n"; return 0
  fi
  git_reset_to_main
  info "Handing #$n to $AGENT..."
  if run_agent "$(work_prompt "$n")"; then ok "Agent run complete for #$n"; else err "Agent run failed/aborted for #$n"; fi
  finish_issue "$n"
}

main() {
  preflight
  info "start_work.sh · repo=$REPO · agent=$AGENT${STAGE:+ · stage=$STAGE}$([ "$DRY_RUN" = 1 ] && printf " · DRY_RUN")"
  local done=0
  while :; do
    local next; next="$(available_issues | head -1 || true)"
    if [ -z "$next" ]; then
      if [ "$POLL_SECONDS" -gt 0 ] && [ "$DRY_RUN" = 0 ]; then
        log "No available issues. Sleeping ${POLL_SECONDS}s... (Ctrl-C to stop)"; sleep "$POLL_SECONDS"; continue
      fi
      rule; ok "Queue empty — nothing available to work.${STAGE:+ (stage=$STAGE)}"; break
    fi
    work_one "$next" || true
    done=$((done+1))
    if [ "$MAX" -gt 0 ] && [ "$done" -ge "$MAX" ]; then rule; ok "Reached MAX=$MAX issue(s). Stopping."; break; fi
  done
}
main "$@"
