# ADR-0001: Streams + human gates — agents grind, humans steer

- **Status:** accepted (decision №5 — deferral of agent-drafted synthesis — superseded by ADR-0003)
- **Date:** 2026-07-02
- **Deciders:** Adam (maintainer), from the For Good WhatsApp discussion
- **Discussion:** [#30](https://github.com/thecolab-ai/the-for-good-project/issues/30)

## Context

Agents produce research far faster than humans can read it, which creates two
failure modes: (1) a growing pile of words nobody has judged to be meaningful,
and (2) bodies of work that start as one issue and fan out into many, with no
durable identifier tracking the whole. Meanwhile the humans with the most
valuable input — domain experts who will never touch GitHub — had no defined
role and no readable surface.

## Decision

We will organise work into **streams** (a durable thread rooted at one
Discover issue, identified by that issue's number) and require **human gates**
between the stages where judgement is needed:

- **Tracking:** a `stream:<n>` label auto-created and propagated by a GitHub
  Action (`stream-sync.yml`) from `Stream: #n` / `Part of #p` body lines, plus
  a plain-language **overview doc** per stream in `streams/`, owned by a human
  **steward**. Stream *state* lives in the overview doc's frontmatter, not in
  labels. Considered and rejected: GitHub Projects/milestones per stream (more
  friction, not visible to the label-driven automation) and body-convention
  only (not filterable).
- **Gates:** G0 (maintainer triage before research fans out — the existing
  `needs-triage` flow), **G1 (a human must synthesise the stream before any
  ideation)**, **G2 (a human must approve a solution before any build)**.
  Enforcement is structural: agents only work `status: available` issues, and
  only a human may make ideate/build issues available. `status:
  needs-synthesis` / `status: awaiting-direction` mark the human queue.
- **Bounded fan-out:** agents are encouraged to split oversized work into
  *chunky* research sub-issues, depth-limited to two levels below the root
  (root's agent → depth 1; their agents → depth 2; no further). Splitting is
  scope-narrowing — the splitting agent still completes its own issue. Depth
  is computed from the `Part of #…` chain by `start_work.sh`, which tells the
  agent whether fan-out is allowed. Considered and rejected: unlimited fan-out
  (runaway token burn, unreadable streams) and no fan-out (issues answered
  shallowly to fit one PR).
- **Drain trigger:** when the last open child issue in a stream closes,
  automation (`stream-sync.yml`) flags the root `status: needs-synthesis` —
  G1 queues itself; new/reopened child work removes the flag until the stream
  drains again.
- **Roles:** method review (per-finding fact-checking) stays agent-run;
  synthesis & direction review is human-only; non-technical stakeholders give
  feedback against streams (channel: WhatsApp/community bot first — split
  into its own issue).

## Consequences

- Humans stop being framed as slower agents; their contribution is judgement,
  and the site/docs say so explicitly.
- Every ideation and build now has a named human decision behind it — slower
  by design; that latency is the point.
- Costs accepted: steward effort per stream (an unstewarded stream stalls at
  G1 — that's a feature, but it needs visible queues), and one more Action to
  maintain.
- Tripwire: if streams routinely pile up at `needs-synthesis` with no steward,
  revisit — either recruit stewards per domain or let an agent *draft* the
  synthesis for a human to edit (decision explicitly deferred in #30).
