#!/usr/bin/env bash
#
# start_work.sh — autonomously work The For Good Project's queue.
#
# Loops: first pick up any of YOUR work a reviewer sent back (issues labelled
# "status: changes-requested" and assigned to you), otherwise claim the next
# available issue. Each task runs an AI agent (codex, claude, or hermes) in a
# FRESH GIT WORKTREE created from the latest origin/main (or the PR branch, for
# rework), so your clone is never touched and every loop starts from up-to-date
# main. The SCRIPT owns every status transition — the agent just does the work
# and opens (or updates) the PR — so tracking stays correct no matter which
# agent runs or how it behaves.
#
# Usage:
#   ./start_work.sh                 # work the queue with the default agent (claude)
#   ./start_work.sh codex           # use `codex exec` instead
#   ./start_work.sh hermes          # use `hermes chat` instead
#   ./start_work.sh --model <name>  # override the agent model
#   ./start_work.sh codex --model gpt-5.5
#   STAGE=research ./start_work.sh  # only pick up research-stage issues
#   MAX=1 ./start_work.sh           # do a single issue and stop
#   DRY_RUN=1 ./start_work.sh       # show what it would do, touch nothing
#   POLL_SECONDS=0 ./start_work.sh  # exit instead of polling when queue empty
#                                    # (default: poll every 3 min and never exit)
#
# Args: [claude|codex|hermes] [--model <name>]   (CLI wins over the AGENT/MODEL env vars)
# Env:  AGENT MODEL MAX STAGE POLL_SECONDS DRY_RUN AGENT_TIMEOUT
#       PROVIDER HERMES_PROFILE HERMES_FLAGS FOR_GOOD_REPO REPO_DIR
set -euo pipefail
cd "$(dirname "$0")"
source "scripts/fg-common.sh"
RUNS_AGENT=1
parse_agent_args "$@"

MAX="${MAX:-0}"                       # 0 = no limit
POLL_SECONDS="${POLL_SECONDS:-180}"   # keep polling when queue empty every 3 min (0 to exit instead)
DRY_RUN="${DRY_RUN:-0}"
CLAIMED_ISSUE=""

release_on_interrupt() {
  remove_worktree || true
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
  domain="$(label_field "$labels" "domain: ")"
  stage="$(label_field "$labels" "stage: ")"
  local stream; stream="$(label_field "$labels" "stream:")"
  local prov_model
  if [ -n "${MODEL:-}" ]; then prov_model="$MODEL"; else prov_model="the exact model identifier you are running as"; fi
  # Discover issues are stream ROOTS: their PR must NOT close them (the root
  # anchors the stream's lifecycle until the steward ends it). Children close
  # via their PRs as normal — that's what fires the drain→synthesis trigger.
  local link_ref link_why
  if [ "$stage" = "discover" ]; then
    link_ref="Part of"
    link_why="(Use \"Part of\", NOT \"Closes\" — this issue is a stream root and must stay
   open while its stream is worked; see docs/STREAMS.md.)"
  else
    link_ref="Closes"
    link_why="(\"Closes\" is required — the issue closing on merge is what tells the
   stream automation this piece of work is done.)"
  fi
  # Bounded fan-out (docs/STREAMS.md): the agent on a root issue (depth 0) may
  # open sub-issues, an agent on a sub-issue (depth 1) may open one more level,
  # and depth >= 2 may not fan out at all. WHITELIST discover/research only —
  # a missing or nonstandard stage label must fail closed, not open.
  local depth fanout; depth="$(issue_depth "$n")"
  if [ "$stage" != "discover" ] && [ "$stage" != "research" ]; then
    fanout="Do NOT open any sub-issues from this issue — only discover/research work
may fan out; everything else is human-gated (docs/STREAMS.md)."
  elif [ "$depth" -lt 2 ]; then
    fanout="Fan-out is ALLOWED here (this issue is at depth $depth of max 2 in its stream).
If the scope is genuinely too big for ONE high-quality output, split off the
parts you will NOT cover as 2-5 CHUNKY sub-issues — real researchable
questions someone can spend hours on, never micro-tasks:
  gh issue create --repo $REPO --title \"research: <question>\" \\
    --label \"stage: research\" --label \"status: available\" \\
    --body \"Part of #$n.${stream:+ Stream: #$stream.} <the question, why it matters, where to look>\"
Then STILL complete this issue: narrow it to the core question, answer that to
the full method standard, and say in your PR exactly what you split off."
  else
    fanout="Do NOT open any sub-issues — this issue is at the fan-out depth limit
(depth $depth of max 2, see docs/STREAMS.md). If the scope is still too big,
narrow the question explicitly in your PR and list what you left uncovered
under 'what would change this conclusion'; the human steward decides at
synthesis whether more work is spawned."
  fi
  cat <<EOF
You are an autonomous contributor to The For Good Project
(github.com/$REPO). You are working inside a dedicated git worktree of the
repo, checked out at the latest origin/main (detached HEAD) — create your
branch from here. Complete ONE GitHub issue end to end, then open a PR.

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

Fetching sources — escalate fast → heavy (ADR-0006; details in AGENTS.md):
1. curl / quick HTTP — most sources work.
2. Your built-in WebFetch/WebSearch tool — more capable than curl, no browser; try it
   before reaching for a browser (WebSearch can also find a cached/alternate copy).
3. Browser rungs, one command:
     node scripts/fetch.mjs "<url>"            # real Chrome → stealth Chromium
     node scripts/fetch.mjs --archive "<url>"  # also snapshot to Wayback on success
   Prints HOW it fetched; exit 4 = genuinely DEAD (404 even in a browser), exit 3 =
   BLOCKED (403/bot-challenge/timeout — TOOLING or IP, NOT a dead link). It can't call
   your WebFetch tool (it's a subprocess), so run that yourself at step 2.
4. For a fragile or date-stamped source, run  node scripts/archive-cite.mjs "<url>"  and
   cite the snapshot beside the live link.
Never call a citation dead on a blocked (exit 3) response, and always say HOW you fetched.

Where the output goes (match the issue's stage):
- research → research/findings/$domain/<slug>.md  using research/TEMPLATE.md
- ideate   → solutions/<slug>.md                   using solutions/TEMPLATE.md
- build    → projects/<slug>/                       (see projects/README.md)
Use a short kebab-case <slug>.

Splitting big work:
$fanout

Provenance (required): in the output file's frontmatter, set these fields exactly so
we can track what produced it:
- agent: '$AGENT'
- model: '$prov_model'

Then, using git and the gh CLI (both are already authenticated):
1. Create a branch named "$stage/<slug>".
2. Commit your work with a message ending "($link_ref #$n)".
3. Push the branch to origin.
4. Open a pull request whose body contains "$link_ref #$n" so it links to the
   issue. Use: gh pr create --fill --body "$link_ref #$n. <one-line summary>".
   $link_why
${stream:+   The PR body must also contain the exact text  Stream: #$stream  on the same
   line, so the PR stays tracked to its stream.
}
IMPORTANT: do NOT change labels or assignees on EXISTING issues — the runner
manages issue status. (The one exception: labels on NEW sub-issues you create
via the fan-out instruction above.) Do exactly one issue (#$n). Respect the
human gates (docs/STREAMS.md): never open ideate/build follow-up issues, and
never write or edit streams/ overview docs — those are human steward
decisions. When finished, print the PR URL.
EOF
}

rework_prompt() {  # $1 = issue number, $2 = PR number, $3 = branch
  local n="$1" pr="$2" branch="$3" title feedback
  title="$(gh pr view "$pr" --repo "$REPO" --json title --jq .title)"
  feedback="$(review_feedback "$pr")"
  cat <<EOF
You are an autonomous contributor to The For Good Project (github.com/$REPO).
You previously opened PR #$pr ("$title") for issue #$n, and an adversarial
reviewer REQUESTED CHANGES. Your job now is to address that review.

You are inside a dedicated git worktree with the PR branch '$branch' checked
out (detached HEAD at origin/$branch, freshly fetched).

== REVIEW FEEDBACK ==
$feedback
== END REVIEW FEEDBACK ==

Method — read CONTRIBUTING.md and docs/METHOD.md and follow them exactly: real
working citations for every factual claim, TWO independent sources for
surprising or load-bearing claims, honest confidence marks, and NEVER
fabricate a source, statistic, org, or result. Re-verifying citations? Use the
fetch escalation ladder in AGENTS.md (ADR-0006) — a 403/bot-challenge is
tooling, not a dead link.

Do this:
1. Address EVERY point in the feedback. Where you believe the reviewer is
   wrong, leave the work as-is and prepare a short, evidence-backed rebuttal
   for step 4 instead.
2. If main has moved since, rebase onto it first:
   git fetch origin && git rebase origin/main
3. Commit and push to the SAME branch:
   git push origin HEAD:$branch   (add --force-with-lease only if you rebased)
4. Comment on the PR summarising what you changed and any rebuttals:
   gh pr comment $pr --repo $REPO --body "..."

IMPORTANT: do NOT open a new PR, do NOT close anything, and do NOT touch
labels or assignees — the runner manages status. Work only on PR #$pr.
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
    info "[dry-run] would run: AGENT=$AGENT in a fresh origin/main worktree on the following prompt:"; log "$(work_prompt "$n" | sed 's/^/    /')"
    finish_issue "$n"; return 0
  fi
  make_worktree origin/main || { err "Couldn't create worktree for #$n — skipping."; return 1; }
  info "Handing #$n to $AGENT (worktree: $WORKTREE)..."
  set +e; run_agent "$(work_prompt "$n")" "$WORKTREE"; local rc=$?; set -e
  was_interrupted "$rc" && release_on_interrupt   # Ctrl-C the agent → stop the whole run, don't roll to the next issue
  if [ "$rc" -eq 0 ]; then ok "Agent run complete for #$n"; else err "Agent run failed/aborted for #$n (exit $rc)"; fi
  remove_worktree
  finish_issue "$n"
}

rework_one() {  # $1 = issue number with "status: changes-requested", assigned to me
  local n="$1" pr branch
  rule; info "${c_bold}Issue #$n${c_reset} (rework) — $(issue_field "$n" title)"
  pr="$(pr_for_issue "$n" || true)"
  if [ -z "$pr" ]; then
    warn "#$n is 'changes-requested' but has no open PR — releasing back to available."
    if [ "$DRY_RUN" = 0 ]; then
      set_status_label "$n" "available" "changes-requested" "claimed" "in-review"
      gh issue edit "$n" --repo "$REPO" --remove-assignee "@me" >/dev/null || true
    fi
    return 0
  fi
  # A fork PR's branch lives on the contributor's fork, not origin — we can
  # neither check it out as origin/$branch nor push a rework to it (only its
  # author can). Drop it from MY rework queue so the loop doesn't spin on it
  # forever; take_unassigned_rework already skips fork PRs the same way.
  local head_owner
  head_owner="$(gh pr view "$pr" --repo "$REPO" --json headRepositoryOwner --jq .headRepositoryOwner.login 2>/dev/null || true)"
  if [ "$head_owner" != "$OWNER" ]; then
    warn "#$n's PR #$pr lives on a fork ($head_owner) — can't push a rework. Unassigning @me."
    if [ "$DRY_RUN" = 0 ]; then
      gh issue edit "$n" --repo "$REPO" --remove-assignee "@me" >/dev/null || true
    fi
    return 0
  fi
  branch="$(gh pr view "$pr" --repo "$REPO" --json headRefName --jq .headRefName)"
  if [ "$DRY_RUN" = 1 ]; then
    info "[dry-run] would rework PR #$pr (branch $branch) against the review feedback, push, and move #$n → in-review"
    return 0
  fi
  local before after
  before="$(gh pr view "$pr" --repo "$REPO" --json headRefOid --jq .headRefOid)"
  make_worktree "origin/$branch" || { err "Couldn't create worktree for PR #$pr (branch $branch) — leaving #$n for a future loop."; return 1; }
  info "Handing PR #$pr rework to $AGENT (worktree: $WORKTREE)..."
  set +e; run_agent "$(rework_prompt "$n" "$pr" "$branch")" "$WORKTREE"; local rc=$?; set -e
  was_interrupted "$rc" && release_on_interrupt   # Ctrl-C the agent → stop the whole run
  if [ "$rc" -eq 0 ]; then ok "Rework agent run complete for #$n"; else err "Rework agent run failed/aborted for #$n (exit $rc)"; fi
  remove_worktree
  after="$(gh pr view "$pr" --repo "$REPO" --json headRefOid --jq .headRefOid)"
  if [ "$after" != "$before" ]; then
    set_status_label "$n" "in-review" "changes-requested"
    gh issue comment "$n" --repo "$REPO" --body "🔁 Rework pushed to PR #$pr — moving back to **in review** for a fresh adversarial review." >/dev/null || true
    ok "#$n → in-review (rework pushed to PR #$pr)"
  else
    warn "Agent pushed no new commits to PR #$pr — leaving #$n as 'changes-requested' for a future loop."
  fi
}

# Self-heal the rework queue: any open PR I authored that a reviewer sent back
# but whose linked issue is still sitting "in-review" gets flipped to
# "changes-requested" so the queue below actually picks it up. This closes the
# gaps where the normal hand-off never fired: a reviewer crash, a discover PR
# with no closing ref, or a review posted OUTSIDE review_work.sh (a human, or
# another bot). We only act when the change-request is CURRENT — no commits were
# pushed after it — so a freshly reworked PR awaiting re-review is left alone.
reconcile_rework() {
  [ "$DRY_RUN" = 1 ] && return 0
  local prs pr iss labels lastcr headcommit
  prs="$(gh pr list --repo "$REPO" --state open --author "@me" --json number,reviewDecision \
          --jq '.[]|select(.reviewDecision=="CHANGES_REQUESTED")|.number' 2>/dev/null || true)"
  for pr in $prs; do
    lastcr="$(gh pr view "$pr" --repo "$REPO" --json reviews --jq '[.reviews[]|select(.state=="CHANGES_REQUESTED")]|last|.submittedAt // ""' 2>/dev/null || true)"
    [ -z "$lastcr" ] && continue
    headcommit="$(gh pr view "$pr" --repo "$REPO" --json commits --jq '.commits[-1].committedDate // ""' 2>/dev/null || true)"
    # ISO-8601 timestamps compare lexically: a commit newer than the review means
    # it's already been reworked and is awaiting RE-review, not rework — skip it.
    [ -n "$headcommit" ] && [[ "$headcommit" > "$lastcr" ]] && continue
    iss="$(issue_addressed_by_pr "$pr" || true)"
    [ -z "$iss" ] && continue
    labels="$(issue_labels "$iss" 2>/dev/null || true)"
    case ",$labels," in
      *",status: changes-requested,"*) continue ;;   # already routed
      *",status: in-review,"*)
        gh issue edit "$iss" --repo "$REPO" --add-assignee "@me" >/dev/null 2>&1 || true
        set_status_label "$iss" "changes-requested" "in-review" 2>/dev/null \
          && ok "Reconciled #$iss → changes-requested (unrouted review on PR #$pr)" || true ;;
    esac
  done
}

# Take the first UNASSIGNED (TTL-freed) rework whose PR lives on origin — i.e.
# a branch we can actually push the rework to. Fork-branch PRs are skipped (only
# their owner can push). Claims it to @me and echoes its number, else nothing.
take_unassigned_rework() {  # $1 = optional queue snapshot (from fetch_open_issues)
  local n pr owner
  for n in $(unassigned_reworks "${1:-}"); do
    pr="$(pr_for_issue "$n" || true)"; [ -z "$pr" ] && continue
    owner="$(gh pr view "$pr" --repo "$REPO" --json headRepositoryOwner --jq .headRepositoryOwner.login 2>/dev/null || true)"
    [ "$owner" = "$OWNER" ] || continue
    if [ "$DRY_RUN" = 1 ]; then echo "$n"; return 0; fi
    gh issue edit "$n" --repo "$REPO" --add-assignee "@me" >/dev/null 2>&1 || true
    gh issue comment "$n" --repo "$REPO" --body "🤝 @$ME is picking up abandoned rework #$n (freed by TTL)." >/dev/null 2>&1 || true
    echo "$n"; return 0
  done
  return 0
}

main() {
  preflight
  info "start_work.sh · repo=$REPO · agent=$AGENT${STAGE:+ · stage=$STAGE}$([ "$DRY_RUN" = 1 ] && printf " · DRY_RUN")"
  local done=0
  while :; do
    reconcile_rework   # pull in any PRs a reviewer sent back that the hand-off missed
    # ONE GraphQL query snapshots the whole open-issue queue; every check below
    # (my rework → TTL-freed rework → fresh issue) filters it locally instead of
    # firing its own REST list call. A transient failure (rate-limit, 502,
    # network blip) yields an empty snapshot so this cycle just looks empty and
    # we sleep and retry — exactly what the old per-call `|| true` reads did,
    # rather than letting set -e kill the whole runner.
    local snap; snap="$(fetch_open_issues)" || snap='[]'
    # Priority: my own rework → a TTL-freed rework I can push → a fresh issue.
    local next kind=new
    next="$(rework_issues "$snap" | head -1 || true)"
    if [ -n "$next" ]; then
      kind=rework
    else
      next="$(take_unassigned_rework "$snap" || true)"
      if [ -n "$next" ]; then kind=rework; else next="$(available_issues "$snap" | head -1 || true)"; fi
    fi
    if [ -z "$next" ]; then
      if [ "$POLL_SECONDS" -gt 0 ] && [ "$DRY_RUN" = 0 ]; then
        log "No rework for @$ME and no available issues. Sleeping ${POLL_SECONDS}s... (Ctrl-C to stop)"; sleep "$POLL_SECONDS"; continue
      fi
      rule; ok "Queue empty — no rework for @$ME and nothing available.${STAGE:+ (stage=$STAGE)}"; break
    fi
    if [ "$kind" = rework ]; then rework_one "$next" || true; else work_one "$next" || true; fi
    done=$((done+1))
    if [ "$MAX" -gt 0 ] && [ "$done" -ge "$MAX" ]; then rule; ok "Reached MAX=$MAX issue(s). Stopping."; break; fi
  done
}
main "$@"
