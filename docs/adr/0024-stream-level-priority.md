# ADR-0024: Priority is a stream-level decision inherited by children

- **Status:** proposed (ratified on merge by the human maintainer; agents do not
  self-ratify pipeline changes)
- **Date:** 2026-07-03 (renumbered 0013 → 0024 on 2026-07-09; see "Renumbering" below)
- **Deciders:** @adam91holt (human maintainer), via #164; drafted by an agent
- **Discussion:** [#164](https://github.com/thecolab-ai/the-for-good-project/issues/164),
  PR [#169](https://github.com/thecolab-ai/the-for-good-project/pull/169)
- **Relates to:** [ADR-0013](0013-pipeline-guardrails.md) (pipeline guardrails — the
  `HIGH_PRIORITY_CAP` this ADR's propagation is designed to work with, #293)

## Context

The work queue originally treated `priority: high` as an issue-level label:
`start_work.sh` picks labelled issues first, then oldest-created. That was
simple, but it conflated two decisions. Maintainers need to decide which whole
problems get scarce contributor and token capacity; agents then need to decide
which child inside that problem is the next best pickup.

The flaw showed up when `triage-task` scored #151 and #152. They are siblings
in Stream #4, so a per-issue priority comparison between them is meaningless:
they share the same strategic priority. The real within-stream choice is about
dependency, value, tractability, and token cost.

Since this PR was first opened, ADR-0013 landed the other half of the design.
`fg-common.sh` now bounds the jump-queue to `HIGH_PRIORITY_CAP` (default 5)
**streams**, and counts streams rather than issues *specifically* so that the
propagation proposed here can mark a whole stream high without exhausting the
cap. The two decisions are complementary: ADR-0013 bounds how much "high" can
exist; this ADR decides at which level it is set.

## Decision

We will treat `priority: high` as a **stream-root property**. A steward or
maintainer sets it on the Discover/root issue. `stream-sync.yml` propagates the
label to children in that stream and removes it from children when it is
removed from the root. The existing runner sort remains label-driven; once
children inherit the root label, a prioritised stream's pickup-able issues
jump the queue as a group — bounded by `HIGH_PRIORITY_CAP` streams.

We will make `triage-task` stream-first: `queue` mode ranks streams against
each other, then reports the next best child inside each stream. Within a
chosen stream, children are ranked by dependency and value-per-token, not by a
separate priority axis. Siblings inherit the same priority by construction.

Considered and rejected: keeping priority per issue (too easy to prioritise a
single child while ignoring the stream), adding numeric priority tiers now
(more label taxonomy before the binary model is proven), and writing a new
queue selector script (unneeded while the inherited label makes the existing
sort do the right thing).

## Ratification & routing

This changes pipeline behaviour (`stream-sync.yml`), label semantics
(`priority: high`), and contributor selection guidance (`triage-task`). Per
[`docs/AUTOMATION.md`](../AUTOMATION.md) and `scripts/review_work.sh`, that class of
change is **reviewed and merged by a human maintainer**:

- an adversarial agent review of this PR is a correctness check only, and does
  **not** ratify it;
- ratification is the maintainer's deliberate merge;
- accordingly this PR carries the `review: human-only` label, applied by a
  maintainer, which makes `review_work.sh` and `merge_ready.sh` skip it.

Nothing in the diff self-adopts: the status above stays `proposed`, and the
`triage-task` rubric carries its own ratification guard treating the stream-first
model as advice until a human approves it.

## Renumbering

This ADR was originally drafted as 0013. While the PR sat open, `main` merged a
different ADR-0013 (pipeline guardrails), and `docs/STREAMS.md` now cites
`ADR-0013` meaning *that* one. Two ADRs sharing a number is exactly the silent
re-litigation this directory exists to prevent, so it was renumbered to the next
free slot, 0024. The `Date` above is kept at the original decision date, per the
"numbered and immutable" rule — the number changed because it was never validly
claimed, not because the decision did.

## Consequences

- Prioritising a problem now moves the whole stream through the existing queue
  machinery instead of queue-jumping one isolated issue, and `HIGH_PRIORITY_CAP`
  keeps "high" scarce enough to mean something.
- **A child can no longer be prioritised on its own.** `stream-sync.yml` reconciles
  every child against its root on the next issue event, so a `priority: high` set by
  hand on a child inside a stream is *removed*. This is the intended semantics, but
  it is a live behaviour change: any currently-prioritised child of an unprioritised
  root will lose the label once this merges. Issues outside any stream are untouched
  (the workflow exits before reconciling when it can resolve no stream).
- `stream-sync.yml` has more label bookkeeping to maintain, including removal
  propagation when a root is deprioritised, and now also runs on `unlabeled`
  events — roughly doubling the number of (token-free) bookkeeping runs.
- The triage rubric becomes clearer: priority is strategic and stream-level;
  within-stream ordering is tactical.
- We accept that `priority: high` remains binary for now.

## What would change this decision

The original tripwire — "too many streams labelled high and the queue stops being
meaningfully ordered" — has since been answered by ADR-0013's cap rather than by
priority tiers. What would reopen this: maintainers routinely wanting to prioritise
one child against its siblings (which the propagation actively prevents, and which
would argue for tiers or a per-issue override); or the `unlabeled` bookkeeping runs
becoming a rate-limit problem on the Actions token, which would push reconciliation
onto a schedule instead of an event.
