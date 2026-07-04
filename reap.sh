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

main() {
  preflight
  info "reap.sh · repo=$REPO · claim-ttl=$(hrs "$CLAIM_TTL")h · rework-ttl=$(hrs "$REWORK_TTL")h$([ "$DRY_RUN" = 1 ] && printf " · DRY_RUN")"
  reap_claims
  reap_reworks
  reap_status_conflicts
  reap_synthesis_claims
  ok "Reap complete."
}
main "$@"
