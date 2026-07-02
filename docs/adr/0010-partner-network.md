# ADR-0010: Track the partner / SME / advisory network in the open, behind a consent gate

- **Status:** proposed (ratified by the human maintainer who reviews and merges the implementing PR)
- **Date:** 2026-07-03
- **Deciders:** human maintainer (on merge); drafted by an agent at the maintainer's request
- **Discussion:** [issue #123](https://github.com/thecolab-ai/the-for-good-project/issues/123)

## Context

The demand side of the project is forming: connectors are offering introductions to
regulators, agencies, funders and NFPs who could tell us the right questions to ask,
act as early use cases, and influence adoption — the demand-pull / broker mechanism
the gap analysis called for and the stakeholder-feedback loop of issue #30. That trust
network needs to be tracked and grown *in the open*, like everything else here.

But it tracks real people at real organisations, and the Constitution's Article III
(protect people) does not bend: no personal or identifying data. The tension between
"build in the open" and "protect people" forces an explicit disclosure rule rather
than ad-hoc judgement per record. A second constraint: resource-scarce organisations
have often never been asked "what problem would you want solved if capacity were
free?", so the mechanism must make that question easy and low-pressure — a lightweight
registry and a plain-language ask, not process weight. Third: the repo already has
working conventions (markdown + frontmatter, labels, ADRs, skills); new machinery
would need to justify itself against a markdown file and a label.

## Decision

We will track the partner network in three layers, each with one job, plus a skill:

1. **Registry** — one markdown file per organisation/relationship in
   [`partners/`](../../partners/README.md), with role-based frontmatter and a
   **consent gate**: `consent: private` (default — role + sector only, no org, no
   name) → `org-named` (organisation may be named; still no individual's name) →
   `fully-public` (a named individual may appear *because they explicitly said yes*).
   Escalating a record's visibility is a deliberate, logged act, never a default.
2. **Pipeline** — GitHub labels `partner` and `sme`, with relationship stage carried
   in each record's `status:` frontmatter (exploring → intro-made → in-conversation
   → committed → active). A CRM in GitHub, no new tooling.
3. **Conversation** — GitHub Discussions categories ("Partners & advisory",
   "Questions from the field") for the talking; the registry holds the settled state.
   Enabling Discussions is a repo setting, flagged for a maintainer.

A **`manage-partner` skill** (`.claude/skills/manage-partner/SKILL.md`) makes the
consent gate mechanical for agents: it writes/updates records at the stated consent
level, refuses personal names below `fully-public`, redaction-checks drafts, and
drafts name-free outward artifacts (partner charter, call-prep brief).

Options considered and rejected: a private CRM or spreadsheet outside the repo
(rejected — breaks build-in-the-open and hides the demand-side mechanism the project
is trying to demonstrate); keeping everything fully anonymous forever (rejected —
partners who *want* to stand behind the work publicly are part of its credibility;
consent makes that possible safely); a dedicated Project board as the primary
pipeline (deferred — labels + frontmatter carry the state today; a board can be
layered on without a new decision).

## Consequences

Easier: growing the trust network transparently; onboarding a new partner (copy the
template, default private); agents handling partner records safely without per-case
judgement; showing prospective partners exactly how they'll be treated before they
commit. Harder: records at `private` are deliberately vague, so readers can't always
tell who is involved — that opacity is the accepted cost of the default; and every
visibility escalation needs an explicit consent trail, which adds friction by design.

We explicitly accept that a public registry of relationship stages could feel
exposing to a partner even at `org-named` — the promise in each record (nothing
published about them without sign-off, freedom to walk away) is the mitigation, and
it must be honoured over any transparency instinct.

Tripwire: if a real personal name or contact detail ever lands in `partners/` without
a recorded `fully-public` consent, or if the registry goes stale while the real
network grows elsewhere (e.g. a private doc), this structure has failed and should be
revisited.
