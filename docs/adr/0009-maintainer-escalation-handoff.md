# ADR-0009: Agents hand off write-gated actions to maintainers via a documented escalation path

- **Status:** proposed (ratified by the human maintainer who reviews and merges PR #112)
- **Date:** 2026-07-03
- **Deciders:** human maintainer (on merge); drafted by an agent on behalf of @mcinteerj
- **Discussion:** [PR #112](https://github.com/thecolab-ai/the-for-good-project/pull/112), [issue #111](https://github.com/thecolab-ai/the-for-good-project/issues/111)

## Context

Most contributors (human and agent) have no write or triage rights on this repo — by
design. `AGENTS.md` already routes the common cases (claim by comment, PR from a fork),
but some actions are write-gated no matter how they're routed: syncing a status label the
automation missed, pushing rework to an upstream PR branch, dismissing a stale review,
running `merge_ready.sh`. When an agent hit one of these there was no documented next
step, producing three bad outcomes observed in practice: silent stalls (work done but
never lands), 403 retry loops, or improvised workarounds. PR #109's rework (pushed to a
fork with a fetch one-liner) and issue #111 (a consolidated `maintainer:` tracking issue)
improvised a working pattern; this ADR makes it standing procedure. Because `AGENTS.md`
is the binding operating manual for agents, adopting the pattern is a workflow decision
and per `docs/adr/README.md` needs a decision record ratified by a human, not an agent
review.

## Decision

We will document, in `AGENTS.md`, a three-step escalation for write-gated actions:

1. **Comment on the affected PR/issue** stating exactly what's needed, with copy-paste
   commands; unpushable rework goes to the contributor's fork first so landing it is a
   `git fetch … && git merge --ff-only && git push` one-liner.
2. **Open a `maintainer:` tracking issue** tagging a maintainer when the actions span
   several threads or risk getting lost (shape: issue #111).
3. **Sign as agent-on-behalf-of** the human contributor, then move on to other available
   work — the escalation is the handoff, not a wait state.

Options considered and rejected: granting write to whitelisted trusted reviewers
(rejected here — a real option, but an access-policy decision for maintainers to take
separately, not something this docs PR should smuggle in); leaving it undocumented
(rejected — the failure modes above recur); a bot that relays fork commits automatically
(rejected for now — more automation surface than the volume justifies; revisit if
escalation issues become frequent).

## Consequences

- Blocked work becomes visible and one-paste landable instead of stalling in an agent's
  session; maintainer effort per escalation drops to seconds.
- A named maintainer (@adam91holt) is baked into the doc and must be updated if
  maintainership changes — accepted cost, cheaper than an indirection layer today.
- More `maintainer:` issues and on-behalf-of comments in the tracker — accepted as the
  price of legibility.
- Tripwire: if escalation issues arrive faster than maintainers clear them, or the same
  contributor escalates the same class of action repeatedly, that's the signal to revisit
  the rejected options (targeted write access, or relay automation) rather than scaling
  this process.
