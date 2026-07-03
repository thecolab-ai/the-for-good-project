# ADR-0011: Synthesis draft rework belongs to synthesize_work.sh; generic runners must not touch synthesis PRs

- **Status:** proposed (ratified by the human maintainer who reviews and merges the PR)
- **Date:** 2026-07-03
- **Deciders:** human maintainer (on merge); drafted by an agent on behalf of the maintainer

## Context

When an adversarial review sent a synthesis draft PR back (PR #140, stream
#61), the rework never reached the synthesis agent — because
`synthesize_work.sh` had **no rework path at all**: its only queue was
`status: needs-synthesis`, and after opening a draft it parks the root at
`awaiting-direction`. Two compounding gaps:

1. **The hand-off missed the root's real status.** `review_work.sh` flipped
   the worked issue `in-review → changes-requested`, but a synthesis root
   parks at `awaiting-direction` while its draft is reviewed — so the stale
   label stayed on, leaving the root carrying two status labels at once.
2. **The wrong runner did the rework.** With the root at
   `changes-requested`, a generic `start_work.sh` loop picked it up and ran
   the *research* rework prompt — which has none of the synthesis rules
   (steward-preservation, neutral candidate outcomes, evidence-only,
   touch-one-file) — then flipped the root to `in-review`: a status a stream
   root must never hold, and one nothing ever clears, because synthesis PRs
   have no closing ref (ADR-0001) so the merge → `done` path never fires.

These are contracts of the automation scripts, so per `docs/adr/README.md`
the fix needs a decision record ratified by a human maintainer.

## Decision

1. **Synthesis PRs are identified by their head branch, failing CLOSED.**
   `synthesize_work.sh` always creates `synthesis/<slug>`; a shared
   `pr_is_synthesis` helper keys off that prefix and distinguishes "not
   synthesis" from "couldn't read the branch" (gh error) — guards treat the
   unknown case as don't-touch, so a transient API blip can never route a
   synthesis draft back to a generic runner. Considered instead: a label on
   the PR (rejected — agents are forbidden from managing labels, and a label
   can be dropped; the branch name is set by the script itself and immutable
   for the PR's life).
2. **Generic runners refuse synthesis rework.** `start_work.sh` skips
   synthesis PRs (and unknown-branch PRs) in all three rework entry points —
   its own rework queue (unassigning itself so the synthesis runner can
   claim), the TTL-freed unassigned queue, and its reconciler.
3. **`synthesize_work.sh` gains the rework path.** Each loop first reconciles
   (any open `synthesis/*` PR whose *current* latest review requests changes
   but whose root sits `awaiting-direction` — or wedged at `in-review`, the
   poison state a pre-ADR-0011 runner leaves — is flipped to
   `changes-requested`), then works sent-back drafts before drafting new
   overviews — a blocked G1 gate beats new work. Targets are only unassigned
   roots or ones assigned to this runner (an assignment is another runner's
   live claim; contesting it would let the tie-break steal mid-flight work),
   and a draft already reworked after its latest change-request gets its
   status repaired rather than a fresh agent run. The rework runs a
   synthesis-specific prompt (review feedback + the standing synthesis rules:
   steward text preserved verbatim, neutral candidate outcomes, edit only the
   overview file, push to the same branch), and on push the script flips the
   root `changes-requested → awaiting-direction` (also stripping any stray
   `in-review`).
4. **The review hand-off strips the right park status.** `review_work.sh`
   removes `awaiting-direction` when flipping a synthesis PR's root to
   `changes-requested` (and only then — a generic PR that merely body-links a
   parked root must not yank it out of G1), and its comment names the runner
   that will actually pick the rework up.

## Consequences

- A sent-back synthesis draft is now picked up by the synthesis agent, with
  the right prompt and the right status cycle
  (`awaiting-direction → changes-requested → awaiting-direction`), and a
  stream root can no longer be parked at `in-review`.
- Rework priority means one persistent reviewer objection can starve fresh
  synthesis in a single-runner setup; acceptable because the no-new-commits
  case leaves the root `changes-requested` and moves on rather than spinning.
- The branch-prefix convention becomes load-bearing: a hand-opened synthesis
  PR on a differently-named branch falls back to the generic path. Tripwire:
  if that happens in practice, or the reconciler ever ping-pongs a draft
  that's mid-rework, revisit — consider a PR label applied by the script or
  moving the routing into CI.
