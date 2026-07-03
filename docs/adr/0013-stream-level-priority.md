# ADR-0013: Priority is a stream-level decision inherited by children

- **Status:** proposed
- **Date:** 2026-07-03
- **Deciders:** Adam (maintainer) via #164; ratified by the human maintainer who reviews and merges this PR
- **Discussion:** [#164](https://github.com/thecolab-ai/the-for-good-project/issues/164)

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

## Decision

We will treat `priority: high` as a **stream-root property**. A steward or
maintainer sets it on the Discover/root issue. `stream-sync.yml` propagates the
label to children in that stream and removes it from children when it is
removed from the root. The existing runner sort remains label-driven; once
children inherit the root label, a prioritised stream's pickup-able issues
jump the queue as a group.

We will make `triage-task` stream-first: `queue` mode ranks streams against
each other, then reports the next best child inside each stream. Within a
chosen stream, children are ranked by dependency and value-per-token, not by a
separate priority axis. Siblings inherit the same priority by construction.

Considered and rejected: keeping priority per issue (too easy to prioritise a
single child while ignoring the stream), adding numeric priority tiers now
(more label taxonomy before the binary model is proven), and writing a new
queue selector script (unneeded while the inherited label makes the existing
sort do the right thing).

## Consequences

- Prioritising a problem now moves the whole stream through the existing queue
  machinery instead of queue-jumping one isolated issue.
- `stream-sync.yml` has more label bookkeeping to maintain, including removal
  propagation when a root is deprioritised.
- The triage rubric becomes clearer: priority is strategic and stream-level;
  within-stream ordering is tactical.
- We accept that `priority: high` remains binary for now. Tripwire: if too many
  streams are labelled high and the queue stops being meaningfully ordered,
  revisit with a separate ADR for priority tiers or a richer queue selector.
