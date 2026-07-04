# ADR-0015: autopilot.sh — one command that alternates review and work

- **Status:** proposed (a human maintainer ratifies on merge — agents do not self-ratify runner-architecture changes)
- **Date:** 2026-07-04
- **Deciders:** human maintainer (on merge); drafted by an agent on behalf of @adam91holt
- **Supersedes:** the abandoned `autopilot` draft in PR #220 (which numbered itself ADR-0013, since taken by the pipeline-guardrails ADR)

## Context

The pipeline has two runners by design: `start_work.sh` *produces* work (opens
PRs) and `review_work.sh` *adversarially reviews* it before it can merge. In
practice contributors overwhelmingly run the produce side, so PRs pile up
`in-review` faster than anyone reviews them — the review queue becomes the
bottleneck. The project wants a single command it can tell everyone to run that
keeps *both* sides moving.

A first attempt (PR #220) was rejected in review for two reasons: (1) it relied
on the runners' exit codes to detect an idle queue, but both `start_work.sh` and
`review_work.sh` exit `0` whether they processed an item or found nothing — so
the idle back-off never fired and, on an empty queue, autopilot would busy-loop
with no sleep (API-rate-limit pressure, log spam); (2) a label-governance issue
now handled separately by the `human-only-guard` (ADR-0013 / #288).

## Decision

Add **`autopilot.sh`**, a thin conductor that keeps both sides moving from one
command:

1. **Alternate, review-first, with a ratio.** Each cycle runs `REVIEW_PER_WORK`
   review passes (default **2**, biased toward review because it is the
   bottleneck) then **one** work pass. `REVIEW_PER_WORK`, an idle `POLL_SECONDS`,
   and `MAX_CYCLES` are env-tunable.
2. **Compose, don't merge.** autopilot only owns the alternation, ratio, idle
   back-off, and the per-cycle pull. It invokes the existing runners with
   `MAX=1 POLL_SECONDS=0` (do one item, exit rather than poll). All real
   behaviour stays in those scripts and `scripts/fg-common.sh`, unchanged.
3. **Correct idle detection.** Because the runners can't be distinguished by
   exit code, autopilot detects the empty-queue sentinel line each one prints
   ("No open PRs needing review." / "Queue empty — no rework…"). Only when a
   whole cycle does nothing does it sleep `POLL_SECONDS`.
4. **Pull latest main each cycle.** So operators automatically pick up script and
   pipeline improvements without a manual `git pull`. git's atomic-rename means
   the running autopilot keeps its open inode (no mid-run corruption) while the
   freshly-launched runner subprocesses read the new code immediately. If the pull
   changes `autopilot.sh` itself, the script **hot-reloads** by re-exec'ing onto
   the new version at the top of the cycle (guarded by a self-hash so it only
   fires on a real change — no exec loop), so autopilot-level improvements apply
   with no manual restart. `PULL=0` disables the per-cycle pull.
5. **Preserve the integrity rule.** The review side runs under a **distinct
   identity** via `REVIEW_GITHUB_TOKEN`; the work side runs as the operator's
   normal `gh` identity. Without the token, autopilot runs **work-only and
   warns** — it never reviews as the author, which the gate would reject anyway.

## Consequences

- A single operator (or the whole crew) can keep production and review balanced
  with one command; raising `REVIEW_PER_WORK` biases harder toward draining
  review.
- **autopilot does not remove the need for ≥2 identities in the system.** One
  machine cannot review its own PRs, so a solo operator still produces PRs no one
  can merge. autopilot multiplies the throughput of a crew of reviewers; it is
  not a substitute for one. This is a property of the integrity rule.
- The per-cycle pull keeps the fleet current with maintainer improvements
  automatically — a nudge to keep `main` always-runnable.
- The runners remain independently runnable and testable; autopilot adds no
  coupling beyond what already exists via `fg-common.sh`.

## Alternatives considered

- **Fuse the two runners into one alternating script.** Rejected: it still can't
  review its own output (same identity), so it doesn't remove the second-identity
  requirement; it trades clean separation for one large stateful script.
- **Give the runners a distinct "nothing to do" exit code.** Cleaner in theory,
  but changes the contract of two actively-evolving scripts. Deferred in favour
  of the self-contained sentinel check in autopilot; revisit if the sentinel
  strings prove fragile.
