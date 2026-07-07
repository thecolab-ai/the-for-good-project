#!/usr/bin/env bash
#
# reap.sh — release stale work back to the pool so nothing stays stuck on a
# worker who wandered off. Run it on a cron, or by hand.
#
#   ./reap.sh              # free anything past its TTL
#   DRY_RUN=1 ./reap.sh    # show what it would free, change nothing
#
# Four cases:
#   - CLAIMED but no PR opened within CLAIM_TTL  → back to `status: available`.
#   - CHANGES-REQUESTED but untouched within REWORK_TTL → unassigned, so any
#     worker's start_work.sh can pick the rework up (it keeps the label).
#   - TWO OR MORE `status:` labels at once (#289) → reconciled to the most
#     recent one and flagged (the single-status invariant's backstop).
#   - NEEDS-SYNTHESIS but still assigned after CLAIM_TTL → unassigned (a
#     synthesize_work.sh runner claims the root while drafting and releases
#     it when done; a lingering assignment means it crashed, and other
#     runners refuse to contest a live claim — ADR-0012).
#   - CHANGES-REQUESTED but its PR lives on a FORK → the PR is closed and the
#     issue released to `available` (ADR-0020 §5: we don't take outside fork
#     branches into the automated pipeline for now — only a fork PR's author
#     can push its rework, so it can never be adopted). Opt out with
#     CLOSE_FORK_REWORKS=0.
#
# Env: CLAIM_TTL REWORK_TTL CLOSE_FORK_REWORKS DRY_RUN FOR_GOOD_REPO REPO_DIR
set -euo pipefail
cd "$(dirname "$0")/.."
source "scripts/fg-common.sh"
DRY_RUN="${DRY_RUN:-0}"
CLOSE_FORK_REWORKS="${CLOSE_FORK_REWORKS:-1}"   # 1 = close fork-origin changes-requested PRs + release the issue (ADR-0020 §5)

hrs() { echo $(( ${1:-0} / 3600 )); }

# 1) Claimed but never delivered a PR → back to available.
reap_claims() {
  local n who
  for n in $(gh issue list --repo "$REPO" --state open --label "status: claimed" \
      --json number,updatedAt --limit 100 \
      --jq "[.[] | select((.updatedAt|fromdateiso8601) < (now - $CLAIM_TTL))] | .[].number"); do
    if [ -n "$(pr_for_issue "$n")" ]; then log "#$n is claimed but has a PR — leaving it."; continue; fi
    if [ "$DRY_RUN" = 1 ]; then info "[dry-run] would release claimed #$n → available"; continue; fi
    who="$(gh issue view "$n" --repo "$REPO" --json assignees --jq '.assignees[].login' 2>/dev/null | head -1 || true)"
    set_status_label "$n" "available" "claimed" 2>/dev/null || true
    [ -n "$who" ] && gh issue edit "$n" --repo "$REPO" --remove-assignee "$who" >/dev/null 2>&1 || true
    gh issue comment "$n" --repo "$REPO" --body "⏱ Claimed with no PR for over $(hrs "$CLAIM_TTL")h — released back to **available** for anyone to pick up." >/dev/null 2>&1 || true
    ok "Released claimed #$n → available"
  done
}

# 2) Rework sent back but untouched → unassign so any worker can take it.
reap_reworks() {
  local n a who
  for n in $(gh issue list --repo "$REPO" --state open --label "status: changes-requested" \
      --json number,updatedAt,assignees --limit 100 \
      --jq "[.[] | select((.assignees|length)>0) | select((.updatedAt|fromdateiso8601) < (now - $REWORK_TTL))] | .[].number"); do
    if [ "$DRY_RUN" = 1 ]; then info "[dry-run] would free stale rework #$n (unassign)"; continue; fi
    who="$(gh issue view "$n" --repo "$REPO" --json assignees --jq '.assignees[].login' 2>/dev/null || true)"
    for a in $who; do gh issue edit "$n" --repo "$REPO" --remove-assignee "$a" >/dev/null 2>&1 || true; done
    gh issue comment "$n" --repo "$REPO" --body "⏱ Rework untouched for over $(hrs "$REWORK_TTL")h — unassigned and released to the pool; any worker's \`start_work.sh\` (or \`synthesize_work.sh\` for a synthesis draft — ADR-0011, or \`frame_work.sh\` for a discover framing — ADR-0014) can pick it up." >/dev/null 2>&1 || true
    ok "Freed stale rework #$n (unassigned)"
  done
}

# 3) Single-status invariant (#289 / ADR-0013): an issue must never hold two
#    "status: " labels at once — that soup misroutes runners and the website.
#    Runners now set status atomically and issue-status.yml reconciles on the
#    fly; this sweep is the backstop that catches anything that still slips
#    through (manual edits, older automation). Most-recent label (by the
#    issue's timeline) wins; the conflict is flagged on the issue.
reap_status_conflicts() {
  local n present keep
  for n in $(gh issue list --repo "$REPO" --state open --json number,labels --limit 100 \
      --jq '.[] | select(([.labels[].name | select(startswith("status: "))] | length) > 1) | .number'); do
    present="$(gh issue view "$n" --repo "$REPO" --json labels \
        --jq '.labels[].name | select(startswith("status: "))' 2>/dev/null || true)"
    [ -z "$present" ] && continue
    # Last "labeled" timeline event among the statuses it still carries = the
    # most recent transition. Falls back to the first carried status if the
    # timeline can't be read.
    keep="$(gh api "repos/$OWNER/$NAME/issues/$n/timeline" --paginate \
        --jq '.[] | select(.event=="labeled") | .label.name | select(startswith("status: "))' 2>/dev/null \
      | grep -Fxf <(printf '%s\n' "$present") | tail -1 || true)"
    [ -z "$keep" ] && keep="$(printf '%s\n' "$present" | head -1)"
    if [ "$DRY_RUN" = 1 ]; then
      info "[dry-run] #$n holds conflicting statuses ($(printf '%s' "$present" | tr '\n' ' ')) — would keep '$keep'"
      continue
    fi
    if set_status_label "$n" "${keep#status: }" 2>/dev/null; then
      gh issue comment "$n" --repo "$REPO" --body "⚠️ This issue held more than one \`status:\` label at once ($(printf '%s' "$present" | sed 's/^/\`/; s/$/\`/' | tr '\n' ' ')) — contradictory state that misroutes automation. Kept **\`$keep\`** (the most recent transition) and stripped the rest. (#289)" >/dev/null 2>&1 || true
      ok "Reconciled #$n → $keep (held: $(printf '%s' "$present" | tr '\n' ' '))"
    else
      warn "Couldn't reconcile conflicting statuses on #$n"
    fi
  done
}

# 4) Synthesis claim from a crashed runner → unassign so another runner can
#    take the root (synthesize_one skips roots with someone else's live
#    assignment, so a dead runner's claim would otherwise wedge the stream).
reap_synthesis_claims() {
  local n a who
  for n in $(gh issue list --repo "$REPO" --state open --label "status: needs-synthesis" \
      --json number,updatedAt,assignees --limit 100 \
      --jq "[.[] | select((.assignees|length)>0) | select((.updatedAt|fromdateiso8601) < (now - $CLAIM_TTL))] | .[].number"); do
    if [ "$DRY_RUN" = 1 ]; then info "[dry-run] would free stale synthesis claim on #$n (unassign)"; continue; fi
    who="$(gh issue view "$n" --repo "$REPO" --json assignees --jq '.assignees[].login' 2>/dev/null || true)"
    for a in $who; do gh issue edit "$n" --repo "$REPO" --remove-assignee "$a" >/dev/null 2>&1 || true; done
    gh issue comment "$n" --repo "$REPO" --body "⏱ A synthesis run claimed this root over $(hrs "$CLAIM_TTL")h ago and never finished — unassigned so any \`synthesize_work.sh\` runner can take it." >/dev/null 2>&1 || true
    ok "Freed stale synthesis claim on #$n (unassigned)"
  done
}

# 5) A changes-requested PR that lives on a FORK can never be adopted (only its
#    author can push its branch) and — per the maintainer's direction (#656) —
#    we are not taking outside fork branches into the automated pipeline for
#    now. Close the PR with an explanatory comment and release the issue to
#    `available` so a fresh worker picks it up clean on a same-repo branch (the
#    recorded review stays on the closed PR as reference). Left alone: a
#    `review: human-only` PR (a human maintainer's), and — critically — a
#    `synthesis/*` or `discover/*` fork PR: those reworks route to
#    synthesize_work.sh / frame_work.sh under their capability floors (ADR-0011
#    / ADR-0014), and a discover root must never be flipped to `available` by a
#    generic cron. Those are surfaced for a human instead of auto-closed.
reap_fork_reworks() {
  [ "$CLOSE_FORK_REWORKS" = 1 ] || return 0
  local n pr owner branch labels who a
  for n in $(gh issue list --repo "$REPO" --state open --label "status: changes-requested" \
      --json number --limit 100 --jq '.[].number'); do
    pr="$(pr_for_issue "$n" || true)"; [ -z "$pr" ] && continue
    owner="$(gh pr view "$pr" --repo "$REPO" --json headRepositoryOwner --jq .headRepositoryOwner.login 2>/dev/null || true)"
    # Empty owner = couldn't read (rate limit / transient) — fail closed, skip.
    [ -n "$owner" ] || continue
    [ "$owner" = "$OWNER" ] && continue   # same-repo branch — adoptable, leave it
    # NEVER auto-close a synthesis/framing fork PR: those belong to
    # synthesize_work.sh / frame_work.sh (ADR-0011 / ADR-0014), and closing a
    # framing PR would flip a stream ROOT to `available`. Flag for a human.
    branch="$(gh pr view "$pr" --repo "$REPO" --json headRefName --jq .headRefName 2>/dev/null || true)"
    case "$branch" in
      synthesis/*|discover/*)
        warn "#$n's fork PR #$pr is a ${branch%%/*} branch on a fork ($owner) — leaving it for a human (belongs to $([ "${branch%%/*}" = synthesis ] && echo synthesize_work.sh || echo frame_work.sh))."
        continue ;;
    esac
    labels="$(gh pr view "$pr" --repo "$REPO" --json labels --jq '[.labels[].name]|join(",")' 2>/dev/null || true)"
    case ",$labels," in *",review: human-only,"*) log "#$n's fork PR #$pr is review: human-only — leaving it for a human."; continue ;; esac
    if [ "$DRY_RUN" = 1 ]; then info "[dry-run] would close fork PR #$pr ($owner) and release #$n → available"; continue; fi
    gh pr comment "$pr" --repo "$REPO" --body "🔁 Closing this fork PR: the project isn't taking outside fork branches into the automated pipeline right now — a changes-requested fork PR can't be adopted by another worker (only its author can push its branch), so it stalls (ADR-0020 §5, #656). The linked issue #$n is being released back to **available** for a maintainer-identity worker to pick up clean; this review stays here as reference. To contribute through the fleet, run as a maintainer identity with push access." >/dev/null 2>&1 || true
    gh pr close "$pr" --repo "$REPO" >/dev/null 2>&1 || { warn "Couldn't close fork PR #$pr — skipping #$n."; continue; }
    set_status_label "$n" "available" "changes-requested" "claimed" "in-review" 2>/dev/null || true
    who="$(gh issue view "$n" --repo "$REPO" --json assignees --jq '.assignees[].login' 2>/dev/null || true)"
    for a in $who; do gh issue edit "$n" --repo "$REPO" --remove-assignee "$a" >/dev/null 2>&1 || true; done
    gh issue comment "$n" --repo "$REPO" --body "♻️ The fork PR #$pr addressing this was closed (no outside fork branches in the automated pipeline for now — ADR-0020 §5). Released back to **available** for a fresh same-repo attempt; the prior review on #$pr is reference." >/dev/null 2>&1 || true
    ok "Closed fork PR #$pr ($owner) and released #$n → available"
  done
}

main() {
  preflight
  info "reap.sh · repo=$REPO · claim-ttl=$(hrs "$CLAIM_TTL")h · rework-ttl=$(hrs "$REWORK_TTL")h$([ "$CLOSE_FORK_REWORKS" = 1 ] && printf " · close-fork-reworks")$([ "$DRY_RUN" = 1 ] && printf " · DRY_RUN")"
  reap_claims
  reap_reworks
  reap_status_conflicts
  reap_synthesis_claims
  reap_fork_reworks
  ok "Reap complete."
}
main "$@"
