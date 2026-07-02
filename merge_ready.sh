#!/usr/bin/env bash
#
# merge_ready.sh — maintainer tool. Merge every PR that has passed review.
#
# The merge decision lives here, not in GitHub's approval gate (which only counts
# write-access reviewers and so deadlocks non-admin contributors). This script
# reads the actual review records and a trust model, and merges the PRs that
# qualify. A maintainer (someone with write) runs it; it does the merging.
#
# A PR is mergeable when it has >= N qualifying reviews, where a review qualifies if:
#   • state is APPROVED, and
#   • the reviewer is NOT the PR author, and
#   • the reviewer is trusted — on the whitelist OR their leaderboard credit
#     (research + review points) is >= min_reviewer_credit.
# Any CHANGES_REQUESTED from a trusted reviewer blocks it. N defaults to 1, and is
# raised for sensitive domains (see .github/trusted-reviewers.json).
#
# Usage:
#   ./merge_ready.sh            # dry run — report each PR's status, merge nothing
#   MERGE=1 ./merge_ready.sh    # actually merge the ones that qualify
#   PR=12 MERGE=1 ./merge_ready.sh
#
# Env: MERGE PR TRUST_WHITELIST MIN_REVIEWER_CREDIT REQUIRED_APPROVALS
#      FOR_GOOD_REPO REPO_DIR
set -euo pipefail
cd "$(dirname "$0")"
source "scripts/fg-common.sh"

MERGE="${MERGE:-0}"
ONLY_PR="${PR:-}"
TRUST_FILE=".github/trusted-reviewers.json"

load_trust() {
  local wl mc ra
  if [ -f "$REPO_DIR/$TRUST_FILE" ]; then
    wl="$(jq -r '.whitelist // [] | join(",")' "$REPO_DIR/$TRUST_FILE")"
    mc="$(jq -r '.min_reviewer_credit // 15' "$REPO_DIR/$TRUST_FILE")"
    ra="$(jq -r '.required_approvals // 1' "$REPO_DIR/$TRUST_FILE")"
  fi
  WHITELIST=",${TRUST_WHITELIST:-$wl},"
  MIN_CREDIT="${MIN_REVIEWER_CREDIT:-${mc:-15}}"
  REQUIRED="${REQUIRED_APPROVALS:-${ra:-1}}"
}

# credit map (login -> total score) from the live snapshot
declare_credit() {
  CREDIT_JSON="{}"
  local url="https://$OWNER.github.io/$NAME/data/snapshot.json"
  CREDIT_JSON="$(curl -fsSL "$url" 2>/dev/null | jq -c '[.leaderboard[] | {(.login): .score}] | add // {}' 2>/dev/null || echo '{}')"
}
credit_of() { echo "$CREDIT_JSON" | jq -r --arg u "$1" '.[$u] // 0'; }

is_trusted() {  # $1 login
  case "$WHITELIST" in *",$1,"*) return 0 ;; esac
  [ "$(credit_of "$1")" -ge "$MIN_CREDIT" ] 2>/dev/null && return 0
  return 1
}

# required approvals for a PR, bumped for sensitive domains
required_for_pr() {  # $1 = pr number
  local base="$REQUIRED" iss dom bump
  iss="$(issue_for_pr "$1" || true)"
  [ -z "$iss" ] && { echo "$base"; return; }
  dom="$(issue_labels "$iss" | tr ',' '\n' | sed -n 's/^domain: //p' | head -1)"
  [ -z "$dom" ] && { echo "$base"; return; }
  bump="$(jq -r --arg d "$dom" '.extra_approvals_for_domains[$d] // empty' "$REPO_DIR/$TRUST_FILE" 2>/dev/null || true)"
  if [ -n "$bump" ] && [ "$bump" -gt "$base" ] 2>/dev/null; then echo "$bump"; else echo "$base"; fi
}

evaluate_pr() {  # $1 = pr number
  local pr="$1" author sha url title labels
  # "review: human-only" PRs sit outside this gate — a maintainer reviews and merges them by hand.
  labels="$(gh pr view "$pr" --repo "$REPO" --json labels --jq '[.labels[].name]|join(",")' 2>/dev/null || true)"
  case ",$labels," in
    *",review: human-only,"*)
      rule; info "${c_bold}PR #$pr${c_reset} — labelled \"review: human-only\": merged by a maintainer by hand, outside this gate. Skipping."; return ;;
  esac
  author="$(gh pr view "$pr" --repo "$REPO" --json author --jq .author.login)"
  sha="$(gh pr view "$pr" --repo "$REPO" --json headRefOid --jq .headRefOid)"
  url="$(gh pr view "$pr" --repo "$REPO" --json url --jq .url)"
  title="$(gh pr view "$pr" --repo "$REPO" --json title --jq .title)"
  local need; need="$(required_for_pr "$pr")"

  # latest review state per reviewer
  local reviews; reviews="$(gh api graphql -f query="{repository(owner:\"$OWNER\",name:\"$NAME\"){pullRequest(number:$pr){reviews(first:100){nodes{author{login} state submittedAt}}}}}" \
    --jq '.data.repository.pullRequest.reviews.nodes | group_by(.author.login) | map(sort_by(.submittedAt) | last) | .[] | [.author.login, .state] | @tsv')"

  local approvers=() blockers=()
  while IFS=$'\t' read -r who state; do
    [ -z "$who" ] && continue
    [ "$who" = "$author" ] && continue
    is_trusted "$who" || continue
    [ "$state" = "APPROVED" ] && approvers+=("$who")
    [ "$state" = "CHANGES_REQUESTED" ] && blockers+=("$who")
  done <<< "$reviews"

  rule; info "${c_bold}PR #$pr${c_reset} — $title ${c_dim}(by @$author)${c_reset}"
  info "  needs $need trusted approval(s) · trusted approvers: ${approvers[*]:-none}${blockers:+ · changes requested by: ${blockers[*]}}"

  if [ "${#blockers[@]}" -gt 0 ]; then warn "  BLOCKED — a trusted reviewer requested changes."; return; fi
  if [ "${#approvers[@]}" -lt "$need" ]; then
    warn "  PENDING — has ${#approvers[@]}/$need trusted adversarial approval(s)."; return
  fi

  ok "  READY — meets the bar (${#approvers[@]}/$need)."
  if [ "$MERGE" != 1 ]; then log "  (dry run — set MERGE=1 to merge)"; return; fi
  # Record the gate check, then merge.
  gh api -X POST "repos/$OWNER/$NAME/statuses/$sha" -f state=success -f context="$REVIEW_CHECK_CONTEXT" \
    -f description="Merged by merge_ready: ${#approvers[@]} trusted review(s)" -f target_url="$url" >/dev/null 2>&1 || true
  if gh pr merge "$pr" --repo "$REPO" --squash --delete-branch >/dev/null 2>&1; then
    ok "  MERGED #$pr"
  else
    err "  merge failed (conflicts / permissions?) — handle manually."
  fi
}

main() {
  preflight
  load_trust
  declare_credit
  info "merge_ready.sh · repo=$REPO · required=$REQUIRED · min_credit=$MIN_CREDIT · $([ "$MERGE" = 1 ] && echo MERGE || echo 'dry run')"
  log "whitelist: ${WHITELIST//,/ }"
  local prs
  if [ -n "$ONLY_PR" ]; then prs="$ONLY_PR"; else
    prs="$(gh pr list --repo "$REPO" --state open --json number,isDraft --jq '.[] | select(.isDraft|not) | .number')"
  fi
  [ -z "$prs" ] && { rule; ok "No open PRs."; return; }
  for pr in $prs; do evaluate_pr "$pr" || true; done
  rule; ok "Done."
}
main "$@"
