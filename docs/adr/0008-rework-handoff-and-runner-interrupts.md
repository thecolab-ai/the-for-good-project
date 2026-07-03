# ADR-0008: Rework hand-off routes by worked issue; reviewer crashes retry; runner interrupts stop the run

- **Status:** accepted (merged by the human maintainer)
- **Date:** 2026-07-03
- **Deciders:** human maintainer (on merge); drafted by an agent on behalf of @mcinteerj
- **Discussion:** [PR #109](https://github.com/thecolab-ai/the-for-good-project/pull/109)

## Context

The rework half of the pipeline had silently stalled: seven open PRs carried a
`CHANGES_REQUESTED` review while **zero** open issues carried
`status: changes-requested` — so no author's `start_work.sh` loop ever picked
the rework up. Three independent gaps caused this: (1) the hand-off resolved
the issue via GitHub *closing* refs only, and discover PRs deliberately have
none (`Part of #n`, the stream root stays open — ADR-0001); (2) a reviewer
crash (no review body) set the merge check to `failure`, which the review loop
reads as "author's turn" and skips forever, while the author was never flipped
— a deadlock (PR #55); (3) reviews posted outside `review_work.sh` (a human,
another bot) never trigger the flip at all. Separately, the runners trapped
`INT`/`TERM` with a non-exiting cleanup handler, so Ctrl-C ran cleanup and then
*resumed* the loop.

These are contracts of the automation scripts, so per `docs/adr/README.md`
the fix needs a decision record, and per `docs/AUTOMATION.md` the change
itself is ratified by a human maintainer, not an agent review.

## Decision

We will:

1. **Route status hand-offs by the issue a PR *works*, not the issue it
   *closes*.** A new `issue_addressed_by_pr` resolves a closing ref first,
   else the `Closes`/`Fixes`/`Resolves`/`Part of #n` link in the PR body.
   `issue_for_pr` stays closing-ref-only and remains the function for the
   merge → `done` path, so a discover PR can never wrongly mark its stream
   root done. Considered instead: giving discover PRs a closing ref (rejected
   — the root must stay open, ADR-0001); parsing only `Part of` (rejected —
   authors also write `Closes` in bodies GitHub fails to link cross-fork).
2. **Treat a reviewer crash as a tooling failure, not a PR verdict.** If the
   review agent produces no review body, the merge check is left **unset**
   (merge stays blocked — the check never went green) so a later loop simply
   re-reviews, and at most one diagnostic comment is posted per head SHA.
   Considered instead: keeping `failure` (rejected — deadlocks the PR);
   setting `pending` (rejected — still special-cases the retry path and
   misstates what happened). A review body with a missing/unclear verdict
   still fails closed (NEEDS_WORK).
3. **Self-heal the rework queue.** Each `start_work.sh` loop first reconciles:
   any open PR the runner authored whose *current* latest review is a
   change-request (no commits pushed after it) but whose worked issue still
   sits `in-review` is flipped to `changes-requested`. Skipping
   already-reworked PRs prevents rework↔review ping-pong. This catches all
   three gap classes without depending on who posted the review.
4. **Make interrupts actually stop the run.** `cleanup` runs on `EXIT` only;
   `INT`/`TERM` handlers `exit 130`/`exit 143` (re-firing the `EXIT` trap
   once). Every `run_agent` call site checks `was_interrupted` (exit 130/143)
   and stops the whole runner; an agent `timeout` (124) deliberately fails
   only that item and the loop continues.

## Consequences

- The rework queue becomes self-healing: a missed flip — whatever missed it —
  is repaired on the author's next loop, and Ctrl-C means stop.
- The reconciler adds a few `gh` calls per loop, and a deterministic reviewer
  crash now retries each loop instead of parking the PR; the cost is bounded
  (one diagnostic per head SHA, merge still gated on a green check).
- We accept that body-link parsing (`Part of #n`) is a convention, not a
  GitHub-verified relationship — a typo'd issue number routes the wrong
  issue. The merge → `done` path is unaffected by construction.
- Tripwire: if a PR's review check is observed re-crashing on the same head
  SHA across many loops, or the reconciler ever flips an issue while its PR's
  rework is mid-flight (ping-pong), revisit — add a retry cap or move the
  hand-off into CI.
