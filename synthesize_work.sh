#!/usr/bin/env bash
#
# synthesize_work.sh — draft a drained stream's G1 overview for human sign-off.
#
# The synthesis-gate Action flags a stream root "status: needs-synthesis" when
# its last child issue closes. This script closes the other half of gate G1
# (docs/STREAMS.md): it runs an AI agent that reads every merged finding in the
# stream and drafts the plain-language overview in streams/ as a PULL REQUEST
# for a human steward to edit and merge. Agents grind, humans steer:
#   - the agent NEVER writes the direction decision (a steward TODO is left);
#   - the agent NEVER merges, closes anything, or opens downstream work;
#   - the SCRIPT owns the status move: needs-synthesis → awaiting-direction.
#
# Usage:
#   ./synthesize_work.sh                  # draft every flagged stream (default agent: claude)
#   ./synthesize_work.sh codex            # use `codex exec` instead
#   ./synthesize_work.sh --model <name>   # override the agent model
#   STREAM=4 ./synthesize_work.sh         # target one stream root
#   MAX=1 ./synthesize_work.sh            # one stream, then stop
#   DRY_RUN=1 ./synthesize_work.sh        # print target + evidence + prompt, touch nothing
#   POLL_SECONDS=0 ./synthesize_work.sh   # exit instead of polling when queue empty
#                                          # (default: poll every 60s and never exit)
#
# Args: [claude|codex|hermes] [--model <name>]   (CLI wins over the AGENT/MODEL env vars)
# Env:  STREAM MAX POLL_SECONDS DRY_RUN AGENT MODEL AGENT_TIMEOUT
#       FOR_GOOD_REPO REPO_DIR
set -euo pipefail
cd "$(dirname "$0")"
source "scripts/fg-common.sh"
RUNS_AGENT=1
parse_agent_args "$@"
trap 'remove_worktree || true' EXIT INT TERM

MAX="${MAX:-0}"
POLL_SECONDS="${POLL_SECONDS:-60}"    # keep polling when queue empty (0 to exit instead)
DRY_RUN="${DRY_RUN:-0}"
ONLY_STREAM="${STREAM:-}"

# Kebab-case slug from a title, e.g. "Small NZ charities miss grants" →
# small-nz-charities-miss-grants (capped so filenames stay sane).
slugify() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/\[[^]]*\]//g; s/[^a-z0-9]+/-/g; s/^-+//; s/-+$//' | cut -c1-50 | sed 's/-$//'
}

# All issue numbers in a stream (any state), root included — one API call.
stream_issue_numbers() {  # $1 = stream number
  gh issue list --repo "$REPO" --state all --label "stream:$1" \
    --json number --limit 200 --jq '.[].number' 2>/dev/null || true
}

# Merged evidence files for a stream, found ON DISK in $2 (the worktree):
# findings/solutions whose frontmatter `issue:` points at any issue in the
# stream. Disk is the source of truth — unmerged work can't appear here.
stream_evidence() {  # $1 = stream number, $2 = repo dir to search
  local n="$1" dir="$2" nums pat f
  nums="$(stream_issue_numbers "$n" | paste -sd'|' -)"
  [ -z "$nums" ] && return 0
  pat="^issue:[[:space:]]*[\"']?#($nums)[\"']?[[:space:]]*$"
  find "$dir/research/findings" "$dir/solutions" -name '*.md' ! -name 'TEMPLATE.md' ! -name 'README.md' 2>/dev/null \
    | while IFS= read -r f; do
        grep -qiE "$pat" "$f" && printf '%s\n' "${f#"$dir/"}"
      done
}

# The stream's overview path: reuse an existing streams/<n>-*.md, else derive
# a fresh slug from the root title (slug stability across re-synthesis).
overview_path() {  # $1 = stream number, $2 = repo dir, $3 = root title
  local existing
  existing="$(find "$2/streams" -maxdepth 1 -name "$1-*.md" 2>/dev/null | head -1)"
  if [ -n "$existing" ]; then printf '%s' "${existing#"$2/"}"; else printf 'streams/%s-%s.md' "$1" "$(slugify "$3")"; fi
}

synthesis_prompt() {  # $1 root, $2 overview path, $3 evidence list, $4 branch, $5 re-synthesis? (0/1)
  local n="$1" path="$2" evidence="$3" branch="$4" resynth="$5"
  local title body domain
  title="$(issue_field "$n" title)"
  body="$(issue_field "$n" body)"
  domain="$(label_field "$(issue_labels "$n")" "domain: ")"
  local today; today="$(date +%Y-%m-%d)"
  local update_note=""
  if [ "$resynth" = 1 ]; then
    update_note="THIS IS A RE-SYNTHESIS: $path already exists. UPDATE it in place —
integrate what the new findings add or change. You MUST preserve, verbatim:
the existing 'steward:' frontmatter value, the entire 'Feedback log' table,
and every dated entry under 'Where this is heading' (append; never rewrite
history). Only the synthesis sections change. You may update the candidate
outcomes under 'What we could do about it' with what the new evidence adds,
but NEVER override the steward's prior edits or decisions there."
  else
    update_note="This is the FIRST synthesis for this stream: create $path from
streams/TEMPLATE.md. Leave 'steward:' blank for a maintainer to claim."
  fi
  cat <<EOF
You are the SYNTHESIS agent for The For Good Project (github.com/$REPO). You
are in a dedicated git worktree at the latest origin/main (detached HEAD).

Stream #$n has finished a round of research — every child issue is closed —
and a human steward must now decide its direction (gate G1, docs/STREAMS.md).
Your job is the tedious half ONLY: read the merged evidence and DRAFT the
plain-language stream overview. The judgement half — is this meaningful, go
deeper / pivot / proceed — belongs to the human and you must leave it to them.

== STREAM ROOT: ISSUE #$n${domain:+ ($domain)} ==
$title

$body
== END ROOT ==

The stream's merged evidence (read each one, in the worktree):
$evidence

$update_note

Write the overview for someone who will NEVER touch GitHub or a CLI — a
charity worker, a funder, a council officer. Follow streams/TEMPLATE.md
exactly. Rules:
- Plain language. No jargon, no repo-speak, no bare issue numbers in prose
  (markdown-link them instead). Keep it under two screens.
- Synthesise ONLY from the evidence files listed above. Every takeaway in
  "What we've learned so far" links to the finding it came from and carries
  that finding's confidence (High/Medium/Low). NEVER launder a Low-confidence
  claim into a confident statement. Never invent or import outside facts.
- "What we're not sure about yet": surface gaps, contradictions BETWEEN
  findings, and load-bearing single-sourced claims across the stream — this
  section is where your cross-document view earns its keep.
- "What we could do about it": draft 2-4 CANDIDATE OUTCOMES derived STRICTLY
  from the merged evidence — no invented facts, no outside solutions imported.
  Each option links the findings that support it (confidence carried) and
  marks effort for a small volunteer team honestly (Small/Medium/Large).
  Present them NEUTRALLY: no ranking, no recommendation, no "we should".
  These are options for the steward — choosing between them (or rejecting
  all of them) is the steward's direction decision, never yours.
- If the evidence is too thin or contradictory for a meaningful synthesis,
  SAY SO plainly in the overview ("needs more research on X") — that is a
  valid and useful draft.
- Under "Where this is heading", write EXACTLY this placeholder (plus, if you
  wish, up to three one-line, clearly non-binding signals the steward may
  weigh, prefixed "Signal:"):
> **TODO(steward): direction decision** — go deeper / pivot / proceed / park.
- Frontmatter: stream: $n, title (plain-language), state: needs-synthesis,
  domain: ${domain:-other}, updated: $today. ${resynth:+Preserve the existing steward value.}
- Do NOT touch ANY file other than $path. Do NOT open issues, close anything,
  change labels, or merge. Direction is not yours to set.

Then, using git and gh (already authenticated):
1. git checkout -b $branch
2. Commit ONLY $path, message: "synthesis: stream #$n overview draft (Part of #$n)"
3. git push -u origin $branch
4. Open the PR:
   gh pr create --title "synthesis: stream #$n — $title" \\
     --body "Part of #$n. Stream: #$n. G1 synthesis draft for a human steward to edit, decide direction, and merge."
   (Use "Part of", NOT "Closes" — the stream root must stay open.)
When finished, print the PR URL.
EOF
}

synthesize_one() {  # $1 = stream root issue number
  local n="$1"
  rule; info "${c_bold}Stream #$n${c_reset} — $(issue_field "$n" title)"

  # Belt & braces: only operate on flagged, open roots.
  local labels; labels="$(issue_labels "$n")"
  case ",$labels," in
    *",status: needs-synthesis,"*) : ;;
    *) warn "#$n is not flagged 'status: needs-synthesis' — skipping."; return 0 ;;
  esac

  if [ "$DRY_RUN" = 1 ]; then
    # Evidence gathering needs a checkout of main; use the clone read-only.
    local ev; ev="$(stream_evidence "$n" "$REPO_DIR")"
    info "[dry-run] stream #$n evidence on disk (from the local clone):"
    log "${ev:-  (none found)}"
    local path; path="$(overview_path "$n" "$REPO_DIR" "$(issue_field "$n" title)")"
    info "[dry-run] would draft: $path · branch synthesis/${path##*/}"
    info "[dry-run] would run $AGENT on the synthesis prompt, open a PR, and move #$n → awaiting-direction"
    return 0
  fi

  make_worktree origin/main

  local title path branch resynth=0 evidence
  title="$(issue_field "$n" title)"
  path="$(overview_path "$n" "$WORKTREE" "$title")"
  [ -f "$WORKTREE/$path" ] && resynth=1
  branch="synthesis/$(basename "$path" .md)"
  evidence="$(stream_evidence "$n" "$WORKTREE")"

  # Zero merged findings → a hollow overview helps nobody. Ask a human.
  if [ -z "$evidence" ]; then
    warn "Stream #$n has no merged findings on disk — leaving 'needs-synthesis' and asking a human."
    gh issue comment "$n" --repo "$REPO" --body "🧐 \`synthesize_work.sh\` found **no merged findings on disk** for stream #$n (children closed without finding files, or their frontmatter \`issue:\` doesn't point at this stream's issues). A human should check whether there's anything to synthesise — leaving **needs-synthesis** in place." >/dev/null || true
    remove_worktree
    return 0
  fi

  info "Evidence ($(printf '%s\n' "$evidence" | wc -l | tr -d ' ') file(s)):"; log "$evidence"
  info "Handing stream #$n to $AGENT (worktree: $WORKTREE)..."
  if run_agent "$(synthesis_prompt "$n" "$path" "$evidence" "$branch" "$resynth")" "$WORKTREE"; then
    ok "Synthesis agent run complete for stream #$n"
  else
    err "Synthesis agent run failed/aborted for stream #$n"
  fi
  remove_worktree

  # Find the draft PR (exact branch first, then the Part-of fallback).
  local pr
  pr="$(gh pr list --repo "$REPO" --state open --head "$branch" --json number --jq '.[0].number // empty' 2>/dev/null || true)"
  [ -z "$pr" ] && pr="$(pr_for_issue "$n" || true)"

  if [ -n "$pr" ]; then
    set_status_label "$n" "awaiting-direction" "needs-synthesis"
    gh issue comment "$n" --repo "$REPO" --body "🧩 Synthesis draft ready in #$pr — a human **steward** now reviews the rollup, fixes any overreach, writes the direction decision (go deeper / pivot / proceed / park), and merges. This is gate **G1** (docs/STREAMS.md); the stream stays parked at **awaiting-direction** until then." >/dev/null || true
    ok "Stream #$n → awaiting-direction (draft PR #$pr)"
  else
    warn "No draft PR found for stream #$n — leaving 'needs-synthesis' for a retry."
  fi
}

main() {
  preflight
  info "synthesize_work.sh · repo=$REPO · agent=$AGENT${ONLY_STREAM:+ · stream=$ONLY_STREAM}$([ "$DRY_RUN" = 1 ] && printf " · DRY_RUN")"
  local done=0
  while :; do
    local roots
    if [ -n "$ONLY_STREAM" ]; then roots="$ONLY_STREAM"; else roots="$(synthesis_issues || true)"; fi
    if [ -z "$roots" ]; then
      if [ -z "$ONLY_STREAM" ] && [ "$POLL_SECONDS" -gt 0 ] && [ "$DRY_RUN" = 0 ]; then
        log "No streams flagged needs-synthesis. Sleeping ${POLL_SECONDS}s... (Ctrl-C to stop)"; sleep "$POLL_SECONDS"; continue
      fi
      rule; ok "No streams waiting for synthesis."; break
    fi
    local n
    for n in $roots; do
      synthesize_one "$n" || true
      done=$((done+1))
      [ "$MAX" -gt 0 ] && [ "$done" -ge "$MAX" ] && { rule; ok "Reached MAX=$MAX. Stopping."; exit 0; }
    done
    [ -n "$ONLY_STREAM" ] && break
    [ "$POLL_SECONDS" -gt 0 ] && [ "$DRY_RUN" = 0 ] || break
    sleep "$POLL_SECONDS"
  done
}
main "$@"
