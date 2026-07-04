# ADR-0013: Pipeline guardrails — bounded agent loops, one status at a time, and human-held levers

- **Status:** accepted (implemented at the maintainer's direction — issues #287–#293, filed for Fable/maintainers; merged by the human maintainer)
- **Date:** 2026-07-03
- **Deciders:** human maintainer (@adam91holt), via the directive to implement and merge #287–#293; drafted by an agent on his behalf
- **Discussion:** [#287](https://github.com/thecolab-ai/the-for-good-project/issues/287) · [#288](https://github.com/thecolab-ai/the-for-good-project/issues/288) · [#289](https://github.com/thecolab-ai/the-for-good-project/issues/289) · [#290](https://github.com/thecolab-ai/the-for-good-project/issues/290) · [#291](https://github.com/thecolab-ai/the-for-good-project/issues/291) · [#292](https://github.com/thecolab-ai/the-for-good-project/issues/292) · [#293](https://github.com/thecolab-ai/the-for-good-project/issues/293)

## Context

One night of running the pipeline at scale surfaced a family of failures with
one root shape: **agent loops with no bound, and human levers with no
enforcement.** A rework PR was bounced through 4 agent re-review rounds in 40
minutes (#287). The `review: human-only` label — the switch that exempts a PR
from agent review — could be toggled by the very agents it exempts (#288).
Issues ended up carrying two `status:` labels at once, misrouting runners
(#289). Harness artifacts and placeholder citations leaked into published
findings past the validator (#290). Fan-out produced grandchildren linked to
research children instead of stream roots, breaking the roll-up and enabling
depth-3 spawning (#291). ~10 streams' children were all converging on one
human synthesis gate (#292), and 26% of the open queue was `priority: high`,
making the signal meaningless (#293).

The common constraint: the producer side scales with agents; human judgement,
review attention, and the meaning of small curated signals do not. Every
unbounded loop eventually spends its budget degrading one of those.

## Decision

We will bound every agent loop and enforce every human lever:

1. **Review rounds are capped** (`MAX_REVIEW_ROUNDS`, default 10 — initially
   3, raised in #371 when this ADR's own tripwire was hit). At the cap,
   `review_work.sh` parks the PR for a human — merge check `pending`
   ("Awaiting human maintainer"), a one-time summary of unresolved points —
   instead of an (N+1)th agent round. Composes with the `NEEDS_HUMAN` verdict
   (PR #219) which uses the same pending-check hand-off.
2. **Only humans on the `human_maintainers` allow-list**
   (`.github/trusted-reviewers.json`) **may toggle `review: human-only`**;
   `human-only-guard.yml` reverts and records anyone else. Runner prompts
   forbid agents from touching it.
3. **An issue holds exactly one `status:` label.** Transitions replace the
   whole label array in one call; `issue-status.yml` reconciles conflicts
   (most recent wins) and `reap.sh` sweeps and flags any residue.
4. **The validator rejects harness artifacts** — tool-wrapper tags and
   placeholder citations fail CI deterministically.
5. **Fan-out children link the stream root** (`Part of #<root>`), with
   `Split from #<issue>` carrying the spawn edge; depth (≤2) is computed
   along the spawn chain, and `stream-sync.yml` flags mislinked children.
6. **At most `MAX_ACTIVE_STREAMS` (default 5) streams are worked
   concurrently**; further G0-approved roots queue in the backlog. Drained
   streams always reach G1 pre-drafted (`synthesize_work.sh`), and the
   synthesis queue depth is published in the site snapshot.
7. **`priority: high` is a bounded shortlist**: runners honour it for at most
   `HIGH_PRIORITY_CAP` (default 5) streams at a time, counted by stream so
   priority propagation (#164) composes without blanketing the queue.

Alternatives considered: leaving these as documented conventions (they were —
#288, #293 and the one-status rule all existed on paper and all failed in
practice); unbounded agent re-review with smarter prompts (prior-round
context was already injected and #243 still ping-ponged — a cap is the only
guarantee); enforcing fan-out purely in prompts (kept, but paired with
mechanical depth computation and workflow-side flagging, since prompts alone
produced the offenders).

## Consequences

Easier: runaway loops terminate by construction; contradictory issue state
self-heals; a human can trust that `review: human-only`, the high-priority
shortlist and the G1 queue mean what they say. Harder / accepted costs: a
genuinely fast-converging PR may wait for a human after `MAX_REVIEW_ROUNDS`
rounds (`FORCE=1` overrides); new streams wait for a slot even when workers are idle; the
label-array replace can, rarely, race a concurrent edit of unrelated labels
(the reconciler converges it). Tripwires for revisiting: the backlog of
G0-approved roots regularly exceeding the active cap for days (raise the cap
or add stewards), or a pattern of round-cap parks that a human then approves
unchanged (raise `MAX_REVIEW_ROUNDS`).
