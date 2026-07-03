# ADR-0012: Blocking unknowns loop back to research automatically — bounded — before the G1 human gate

- **Status:** accepted (merged by the human maintainer)
- **Date:** 2026-07-03
- **Deciders:** human maintainer (on merge); drafted by an agent at the maintainer's direction

## Context

Every synthesis has a "What we're not sure about yet" section, and today
those unknowns just sit there: the stream parks at `awaiting-direction`, and
if the steward wants the gaps closed they must hand-write research issues and
wait for another full round before deciding anything. In practice that means
the human gate is spent on the *weakest* version of the synthesis — the first
draft — when the machines could have resolved much of the uncertainty
themselves. The maintainer's direction: when synthesis surfaces unknowns, the
AI should go find them out, as much as possible within reason, **before** a
human looks at it.

This changes what G1 receives and adds an automated loop to the pipeline, so
per `docs/adr/README.md` it needs a decision record; it deliberately extends
(does not break) ADR-0001/0003's "agents grind, humans steer": research was
always agent territory — what changes is that a synthesis can now *trigger*
research without a steward's go-deeper decision, inside hard bounds.

## Decision

1. **The synthesis agent proposes; the script disposes.** Alongside the
   overview draft, the agent writes unknowns that *genuinely block or
   materially weaken its conclusions* (never nice-to-knows; zero is the
   common, correct answer) to an uncommitted side-file
   (`.fg-followups.json`). `synthesize_work.sh` — not the agent — opens them
   as chunky `stage: research` / `status: available` issues in the stream.
   Considered instead: the agent opening issues directly (rejected — agents
   never manage labels/issues, ADR-0001); a `status: proposed` steward-flip
   gate (rejected by the maintainer — the point is resolving unknowns before
   the human looks).
2. **The loop is hard-bounded.** Per stream: at most `FOLLOWUP_ROUNDS`
   (default **2**) automatic research→synthesis rounds, at most
   `FOLLOWUP_PER_ROUND` (default **3**) issues per round, deduped against
   the stream's 200 newest issue titles (`research:` prefixes and case
   normalised away). Round counting rides on an HTML marker in each spawned
   issue's body and FAILS CLOSED: if the script cannot read the stream's
   issues (for the round count or the dedupe list) it spawns nothing.
   The runner claims the root while synthesising, so concurrent runners
   cannot double a round. `FOLLOWUP_ROUNDS=0` disables the loop.
3. **The human gate moves to the end of the loop, not away.** When follow-ups
   are spawned the root does *not* park at `awaiting-direction` — it returns
   to researching posture; the drain gate re-flags `needs-synthesis` when
   they close (now also stripping any stale `awaiting-direction`), and the
   re-synthesis integrates the answers. Only when a synthesis reports no
   blocking unknowns — or the round cap is hit, with the leftovers called out
   to the steward — does the root park at `awaiting-direction`. G1 itself is
   unchanged: no ideate/build work before the steward's decision, and the
   steward can kill any line of inquiry by closing its issue.

## Consequences

- The steward reads the strongest synthesis the machines could reach, and
  "go deeper" is only needed for questions beyond the automatic bounds.
- Worst-case automatic spend per stream is bounded:
  `FOLLOWUP_ROUNDS × FOLLOWUP_PER_ROUND` directly-spawned research issues
  (default 6) plus the re-syntheses — noting spawned issues sit at fan-out
  depth 1 and may themselves split once under the existing depth cap
  (docs/STREAMS.md), so the true ceiling is that of any depth-1 research
  issue. Each follow-up carries a visible round marker and an explicit
  "close this to stop it" note.
- A stream re-drained while its previous draft PR is still open gets that PR
  **updated in place** (head replaced with a main-based commit) rather than a
  colliding new branch — so the steward always reviews the draft that
  integrated the latest round's answers.
- A stream's wall-clock time to reach the human gate grows by up to two full
  research rounds; acceptable because the gate was previously spent asking
  for exactly that work.
- Title-match dedupe is crude: a rephrased duplicate slips through, costing
  one redundant finding. Tripwire: if re-syntheses keep proposing
  near-duplicate questions, or streams routinely exhaust the cap without the
  synthesis converging, revisit — tighten the "blocking" bar in the prompt or
  lower `FOLLOWUP_ROUNDS`.
