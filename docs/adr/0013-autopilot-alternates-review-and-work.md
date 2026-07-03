# ADR-0013: autopilot.sh alternates review and work to keep the queue balanced

- **Status:** proposed (a human maintainer ratifies on merge — agents do not self-ratify runner-architecture changes, per `docs/AUTOMATION.md`)
- **Date:** 2026-07-03
- **Deciders:** human maintainer (on merge); drafted by an agent on behalf of @adam91holt
- **Discussion:** [PR #220](https://github.com/thecolab-ai/the-for-good-project/pull/220)

## Context

The pipeline has two runners by design: `start_work.sh` *produces* work (opens
PRs) and `review_work.sh` *adversarially reviews* it before it can merge. The
integrity rule (ADR-0001, enforced by `review_work.sh` and branch protection)
requires that a review be done by a **different identity than the PR author**,
so production and review cannot be the same runner under the same identity.

In practice contributors overwhelmingly run the *produce* side — it's the
visible, satisfying half — so PRs accumulate `status: in-review` faster than
anyone reviews them. The research side races ahead, the review side starves, and
the merge queue clogs. Recruiting reviewers helps but relies on humans choosing
the less glamorous job; nothing in the tooling nudges a single operator to keep
both sides moving.

Folding the two runners into one script was considered and rejected (see
Alternatives): it cannot review its own output either, so it does not remove the
need for a second identity — it only hides it, at the cost of one large stateful
script.

## Decision

Add **`autopilot.sh`**, a thin conductor that keeps both sides moving from one
command:

1. **Alternate, review-first, with a ratio.** Each cycle runs
   `REVIEW_PER_WORK` review passes (default **2**, biased toward review because
   it is the bottleneck) then **one** work pass, so the queue drains before more
   is added. `REVIEW_PER_WORK` and an idle `POLL_SECONDS` are env-tunable;
   `MAX_CYCLES` bounds a run.
2. **Compose, don't merge.** autopilot only owns the alternation and ratio. It
   invokes the existing `start_work.sh` / `review_work.sh` with
   `MAX=1 POLL_SECONDS=0` (do one item, exit rather than poll). All real
   behaviour — claiming, status labels, worktrees, the PR, the merge gate —
   stays in those scripts and `scripts/fg-common.sh`, unchanged. No new status
   labels, queue-contract changes, or gate changes are introduced.
3. **Preserve the integrity rule explicitly.** The review side runs under a
   **distinct identity** via `REVIEW_GITHUB_TOKEN`; the work side runs as the
   operator's normal `gh` identity. If `REVIEW_GITHUB_TOKEN` is unset, autopilot
   runs **work-only and warns** — it never attempts to review as the author,
   which the gate would reject anyway.

## Consequences

- A single operator can keep production and review balanced instead of only
  adding to the backlog; raising `REVIEW_PER_WORK` biases harder toward drain.
- **autopilot does not remove the need for ≥2 identities in the system.** One
  machine cannot review its own PRs, so a solo operator still produces PRs no
  one can merge. autopilot multiplies the throughput of a crew of reviewers; it
  is not a substitute for one. This is a property of the integrity rule, not a
  bug to fix here.
- The runners remain independently runnable and testable; autopilot adds no
  coupling between them beyond what already exists via `fg-common.sh`.
- Because it changes how the runners are *operated* (not what they do), it is
  recorded here and ratified by a human maintainer, per `docs/AUTOMATION.md`.

## Alternatives considered

- **Fuse the two runners into one alternating script.** Rejected: it still
  cannot review its own output (same identity), so it doesn't remove the
  second-identity requirement; it trades clean separation for one large
  stateful script.
- **A GitHub Action that reviews on a schedule.** Rejected for now: reviewing
  needs a non-author identity with write access and agent CLI budget; keeping
  review on contributors' own machines/tokens matches ADR-0005's execution
  model and avoids centralising token spend. Revisit if a funded bot identity
  exists.
- **Do nothing / rely on recruiting reviewers.** Rejected as insufficient
  alone: it depends on humans repeatedly choosing the less-rewarding half, which
  is exactly the behaviour that created the imbalance.
