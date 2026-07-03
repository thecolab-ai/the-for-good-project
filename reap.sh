#!/usr/bin/env bash
#
# reap.sh — release stale work back to the pool so nothing stays stuck on a
# worker who wandered off. Run it on a cron, or by hand.
#
#   ./reap.sh              # free anything past its TTL
#   DRY_RUN=1 ./reap.sh    # show what it would free, change nothing
#
# Three cases:
#   - CLAIMED but no PR opened within CLAIM_TTL  → back to `status: available`.
#   - CHANGES-REQUESTED but untouched within REWORK_TTL → unassigned, so any
#     worker's start_work.sh can pick the rework up (it keeps the label).
#   - NEEDS-SYNTHESIS but still assigned after CLAIM_TTL → unassigned (a
#     synthesize_work.sh runner claims the root while drafting and releases
#     it when done; a lingering assignment means it crashed, and other
#     runners refuse to contest a live claim — ADR-0012).
#
# Env: CLAIM_TTL REWORK_TTL DRY_RUN FOR_GOOD_REPO REPO_DIR
set -euo pipefail
cd "$(dirname "$0")"
source "scripts/fg-common.sh"
DRY_RUN="${DRY_RUN:-0}"

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
    gh issue comment "$n" --repo "$REPO" --body "⏱ Rework untouched for over $(hrs "$REWORK_TTL")h — unassigned and released to the pool; any worker's \`start_work.sh\` (or \`synthesize_work.sh\`, for a synthesis draft) can pick it up." >/dev/null 2>&1 || true
    ok "Freed stale rework #$n (unassigned)"
  done
}

# 3) Synthesis claim from a crashed runner → unassign so another runner can
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

main() {
  preflight
  info "reap.sh · repo=$REPO · claim-ttl=$(hrs "$CLAIM_TTL")h · rework-ttl=$(hrs "$REWORK_TTL")h$([ "$DRY_RUN" = 1 ] && printf " · DRY_RUN")"
  reap_claims
  reap_reworks
  reap_synthesis_claims
  ok "Reap complete."
}
main "$@"
