# ADR-0025: An issue that keeps failing to produce a PR is parked `status: blocked`, not re-released forever

- **Status:** proposed (ratified on merge by the human maintainer, who directed this
  fix on 2026-07-09; agents do not self-ratify pipeline changes)
- **Date:** 2026-07-09
- **Deciders:** @adam91holt (human maintainer); drafted by an agent (Claude Opus 4.8,
  "Fable") acting on his direct instructions (#766)
- **Relates to:** ADR-0021 (author-agnostic rework reconcile — the *other* loop #766
  documented), ADR-0006 (fetch proxy / browser ladder — the residential proxy reduces
  the *trigger* this backoff guards against), #728, #521, #766

## Context

`start_work.sh`'s `finish_issue` had exactly two outcomes for a claimed issue: a PR was
opened (→ `status: in-review`), or none was (→ back to `status: available`, assignee
removed). The second path had no memory. An issue whose sources can't be fetched from the
current egress — a WAF / IP-reputation block, not a defect in the issue — fails the same
way on every claim, and being released straight to `available` it is re-claimable within
seconds. We observed this live: **#728** fired "the agent finished without opening a PR —
releasing this back to available" **11 times** (12:04→13:55Z on 2026-07-07) before a PR
finally appeared, and **#521** did it 5 times as recently as 2026-07-08. Each cycle is a
full agent run — pure token burn, zero net progress, and it can spin indefinitely while
the egress block persists.

This is symptom 2 of #766. (Symptom 1 — the review↔rework ping-pong — is a separate,
lower-urgency defect: its park-for-human cap is self-limiting in practice and its worst
trigger is the same egress block, addressed by ADR-0006's proxy work. It is left as a
documented note on #766, not fixed here.)

## Decision

`finish_issue`'s no-PR path gains a **per-issue empty-attempt counter with a cap**
(`EMPTY_ATTEMPT_CAP`, default 3). The count is **derived from GitHub**, not local state:
each empty release carries a hidden marker (`<!-- fg-empty-attempt -->`) in its issue
comment, and the count is how many such markers the issue already carries — so it
survives across separate `start_work.sh` runs and across different runner identities
(the same property #766 demanded for the review-round cap). Below the cap the issue is
released to `available` as before (with the marker and the running tally); **at** the cap
it is parked **`status: blocked`** — which the runners already skip (they only pick up
`available`) — with a comment explaining that the sources are likely unreachable from
this egress and that a maintainer should return it to `available` once that is resolved.

The counting + verdict are two **pure helpers in `fg-common.sh`**
(`empty_attempt_count`, `empty_attempt_verdict`) so they are unit-tested without gh
(`scripts/test-fg-common-backoff.sh`).

**Deliberate exception to the "human-set only" `status: blocked` label.** That label's
description reads "Human-set only: waiting on something. Runners ignore it." This is the
one automated path allowed to set it, and it is set for exactly that meaning — the issue
*is* waiting on something (egress / the fetch proxy) — so the label's semantics hold. A
human still owns the un-block: nothing automated moves it back to `available`.

It is deliberately narrow and fails safe:
- **Counting is all-time, not since-last-success.** Over-counting only parks a
  chronically-failing issue one attempt sooner — the safe direction — and a completed
  issue closes rather than re-entering this path, so stale markers are a non-issue in
  practice.
- **Malformed/empty comment payloads count as 0** (`empty_attempt_count` coerces any
  non-integer to 0), so a transient `gh` hiccup never spuriously blocks an issue.
- **Only the fresh-claim no-PR path** is touched. The rework-with-no-open-PR release and
  every other lifecycle transition are unchanged.

Alternatives considered: `do-not-automate` instead of `status: blocked` (rejected —
heavier, and `blocked` already means exactly "waiting on something, runners ignore");
a timed cooldown that re-opens the issue automatically (rejected — the block is not
time-based, it clears when the egress problem is fixed, which only a human knows);
tracking attempts in local runner state (rejected — it must survive across runs and
identities, which only a GitHub-derived count does).

## Consequences

- One blocked issue can no longer spin the fleet: after `EMPTY_ATTEMPT_CAP` empty claims
  it leaves the available loop until a human intervenes.
- A new tunable, `EMPTY_ATTEMPT_CAP` (default 3), and one new automated writer of
  `status: blocked` — bounded, GitHub-derived, `DRY_RUN`-inspectable.
- Honest limit: this stops the *spin*; it does not *fix* the underlying fetch failure.
  The residential proxy (ADR-0006) reduces how often issues reach the cap at all; the
  backoff is the safety net for when they still do.

## What would change this decision

The egress blocks disappearing entirely (would make empty attempts rare enough that the
counter rarely fires — harmless, but the cap could be raised); a move to fetching every
source through a reliable proxy by default (would shift the trigger upstream); or
evidence that legitimate mid-work issues hit the cap (would tighten the count to
since-last-success or require a distinct "genuinely unworkable" signal).
