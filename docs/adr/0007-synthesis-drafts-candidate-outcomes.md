# ADR-0007: Synthesis drafts candidate outcomes; the direction stays human

- **Status:** accepted (amends ADR-0003)
- **Date:** 2026-07-02
- **Deciders:** Adam (maintainer)
- **Discussion:** —

## Context

ADR-0003 gave the G1 rollup to an agent but rejected agent-proposed direction
recommendations — too easy for a steward to rubber-stamp — allowing only
non-binding `Signal:` bullets. In practice the draft leaves the steward with a
summary but no decision-ready material: the gate becomes "invent options from
scratch", which is slower than the writing chore it replaced and pushes tired
stewards toward exactly the rubber-stamping ADR-0003 feared. A *set* of
neutral options, each linking its supporting findings with carried confidence,
is different in kind from a single recommendation: it is checkable
line-by-line in adversarial review, and it widens the steward's view instead
of narrowing it.

## Decision

We will have the synthesis draft include a **"What we could do about it"**
section: 2–4 candidate outcomes derived strictly from the merged evidence,
each stating what it is, who it would help, honest effort for a small
volunteer team (Small/Medium/Large), its supporting findings (linked,
confidence carried), and what would need to be true for it to work. The gate
G1 question becomes "pick, edit, or reject these options and set direction" —
the decision itself stays 100% human.

Still forbidden, structurally as before: **ranking** the options,
**recommending** one, **opening** ideate/build issues, and **writing** the
direction — *Where this is heading* remains a literal `TODO(steward)` (plus,
unchanged, up to three non-binding `Signal:` bullets). On re-synthesis the
options may be updated for new evidence, but the steward's prior edits and
decisions are never overridden.

Considered and rejected: leaving the draft as takeaways-only (the status quo
this amends — stewards got a summary but no decision-ready material); letting
the agent rank or shortlist the options (a ranking is a recommendation with
extra steps).

## Consequences

- G1 gets faster *and* harder to rubber-stamp: the steward reacts to concrete,
  falsifiable options rather than a blank direction line.
- A new overreach surface: an option whose evidence links don't actually
  support it. Mitigation: same as takeaways — carried confidence and per-line
  finding links make it checkable in the overview PR's adversarial review.
- Tripwire: if stewards consistently pick option 1 unedited, the options have
  become a de-facto recommendation and the gate is ceremonial again — revisit
  (shuffle presentation, cap at fewer options, or drop the section).
