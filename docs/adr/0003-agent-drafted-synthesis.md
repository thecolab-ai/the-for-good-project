# ADR-0003: Agents draft the G1 synthesis; humans keep the decision

- **Status:** accepted (supersedes ADR-0001's decision №5, which deferred this)
- **Date:** 2026-07-02
- **Deciders:** Adam (maintainer)
- **Discussion:** [#52](https://github.com/thecolab-ai/the-for-good-project/issues/52)

## Context

ADR-0001 automated the G1 *trigger* (a drained stream flags its root
`status: needs-synthesis`) but deliberately deferred agent-drafted synthesis,
with a tripwire: revisit if streams pile up at G1. Streams are now fanning out
faster than humans read (bounded fan-out is live and in use), and the rollup —
re-reading every merged finding and compressing it into a plain-language
overview — is exactly the tedious, volume-shaped work the "agents grind,
humans steer" split assigns to agents. The judgement (is this meaningful?
which direction?) must not move.

## Decision

We will add **`synthesize_work.sh`**: an agent runner (same shape and helpers
as `start_work.sh` / `review_work.sh`) that, for each root flagged
`needs-synthesis`, reads every **merged** finding in the stream (found on disk
in a fresh worktree, mapped via each finding's `issue:` frontmatter against
the stream's issue list) and drafts `streams/<n>-<slug>.md` **as a PR**. The
script — never the agent — then moves the root to `status:
awaiting-direction` and comments with the draft link.

Judgement stays human, structurally, not by convention:

- The draft's *Where this is heading* section is a literal
  `TODO(steward)` placeholder; the agent may add clearly non-binding
  `Signal:` bullets, nothing more.
- The PR links `Part of #<root>` (a root never closes via PR, ADR-0001/#40),
  and the agent cannot merge it — G1 is passed only by the steward's edits,
  direction decision, and merge.
- Confidence marks flow through unchanged — a Low-confidence finding may not
  become a confident takeaway.
- Zero merged findings → no draft; the script asks a human on the root
  instead of producing a hollow overview.
- Re-synthesis updates the existing overview, preserving the steward, the
  feedback log, and dated direction history.

Considered and rejected: keeping synthesis fully manual (the G1 queue becomes
the bottleneck the tripwire predicted); letting the agent propose a direction
recommendation (too easy for a steward to rubber-stamp — signals only); a
scheduled Action that runs synthesis automatically (deferred — human-invoked
keeps token spend on contributors' own machines and the cadence deliberate).

## Consequences

- G1 latency drops from "steward writes a doc" to "steward edits a draft" —
  the gate stays human but stops being a writing chore.
- A new failure surface: a plausible-but-wrong draft a tired steward waves
  through. Mitigations: the overview PR still requires adversarial review
  like any PR, and takeaways must link their findings with carried
  confidence, making overreach checkable line-by-line.
- Tripwire: if stewards routinely merge drafts *unedited* with the TODO
  replaced by one-word decisions, the gate has become ceremonial — revisit
  (panel review for sensitive domains, or slow the cadence).
