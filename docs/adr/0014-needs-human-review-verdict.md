# ADR-0014: A third review verdict — NEEDS_HUMAN — for governance calls an agent must not ratify

- **Status:** proposed (ratified by the human maintainer who reviews and merges this PR)
- **Date:** 2026-07-03
- **Deciders:** human maintainer (on merge); drafted by an agent on behalf of @mcinteerj
- **Discussion:** [#198](https://github.com/thecolab-ai/the-for-good-project/issues/198)

## Context

`review_work.sh` had exactly two verdicts: `PASS` (approve, maybe auto-merge)
and `NEEDS_WORK` (request changes and flip the linked issue to
`status: changes-requested`, so the AUTHOR's next `start_work.sh` loop picks the
rework up).

The standard review prompt also carries a GOVERNANCE GUARD: a PR that changes
how the project itself works — the pipeline, gates, review/merge rules, an ADR's
status, or label taxonomy — needs a HUMAN MAINTAINER decision, not an agent
approval (`docs/AUTOMATION.md`, `review_work.sh` header). With only two verdicts,
the guard told reviewers to lean `NEEDS_WORK`. But `NEEDS_WORK` routes the PR to
an *agent* rework loop, and an agent cannot ratify a governance change. So
governance PRs ping-ponged — reviewed NEEDS_WORK, "reworked", reviewed
NEEDS_WORK again — instead of reaching a maintainer. This was observed on
#125 and #169.

## Decision

Add an additive third verdict, `NEEDS_HUMAN`, for a change that is *sound* but
needs human ratification:

- Post the review as a plain **comment** — never `--request-changes` (that is
  what triggers the agent-rework routing).
- Park the merge check `for-good/adversarial-review` at **`pending`** with
  description "Awaiting human maintainer". Pending blocks merge for automation
  while a human maintainer can still merge, and — because this script only ever
  sets that context to `success`/`failure`/`pending` — a `pending` on it is an
  unambiguous NEEDS_HUMAN park marker, so a later review loop **skips** the PR
  instead of re-reviewing it (no wasted tokens) or misreading it as the author's
  turn.
- Do **not** flip the linked issue: it stays `status: in-review`, waiting for a
  maintainer rather than an agent.

Both review prompts describe when to use it. The standard prompt's GOVERNANCE
GUARD now steers governance-but-sound to `NEEDS_HUMAN` and reserves `NEEDS_WORK`
for an actual author-fixable defect.

**Fail-closed compatibility:** an unparsed or unrecognised verdict still falls
through to today's `NEEDS_WORK` behaviour, so a garbled review can never park a
PR as "awaiting human" by accident.

Considered and rejected: leaving the merge check fully unset for NEEDS_HUMAN
(the loop would then re-review every pass, burning tokens on a PR that is only
waiting for a human); a dedicated `status: needs-human` label instead of the
pending check (more label taxonomy for a state the check already expresses, and
it would not by itself block the merge gate).

## Consequences

- Governance / pipeline / automation-contract PRs reach a human maintainer
  instead of ping-ponging through agent rework.
- The merge gate is honoured: a NEEDS_HUMAN PR cannot auto-merge while the check
  is `pending`; a maintainer merges it deliberately.
- `review_work.sh` carries one more terminal state to reason about. The park is
  keyed on the `pending` state of its own review context; if another tool ever
  writes `pending` to `for-good/adversarial-review`, that assumption would need
  revisiting.
- This is itself a change to an automation contract, so per
  `docs/adr/README.md` it is recorded here and, per `docs/AUTOMATION.md`,
  ratified by the human maintainer who merges it — the implementing PR carries
  `review: human-only`.
