# ADR-0021: reap routes ANY unaddressed change-request back to `changes-requested`, regardless of author

- **Status:** proposed (ratified on merge by the human maintainer, who directed this
  on 2026-07-07; agents do not self-ratify pipeline changes)
- **Date:** 2026-07-07
- **Deciders:** @adam91holt (human maintainer); drafted by an agent (Claude Opus 4.8,
  "Fable") on his direct instructions
- **Amends:** ADR-0008 (rework hand-off routes by worked issue) — generalises its
  reconcile from the running identity's own PRs to every author
- **Enables:** ADR-0020 (adopt stale rework) — adoption can only see an issue that is
  `status: changes-requested`; this is what puts an absent author's reviewed work there

## Context

ADR-0020 lets an idle worker adopt a stale `changes-requested` PR from an absent
author. But it only *sees* a PR whose worked issue is `status: changes-requested`,
and in practice most sent-back PRs from absent authors never reached that state:
their issues sat in `status: in-review` or `status: claimed` indefinitely. The only
things that flip an issue to `changes-requested` are (a) `review_work.sh` when it
posts NEEDS_WORK, and (b) `start_work.sh`'s `reconcile_rework` — which by design only
touches the *running identity's own* authored PRs (ADR-0008). So when a review is
posted but the flip is lost (a reviewer crash after posting, a human/bot review
outside `review_work.sh`, an author who never runs their own loop), the issue is
stranded: the PR carries an unaddressed change-request, but nothing routes the issue
back, and adoption is blind to it. We hit this live — a backlog of PRs with
`CHANGES_REQUESTED` reviews whose issues were stuck `in-review`/`claimed`, invisible
to both the author (absent) and the adoption path.

## Decision

We add a deterministic, author-agnostic reconcile to `reap.sh` (the periodic
bookkeeping sweep, no model calls). Each run, for every open PR whose **current**
review decision is `CHANGES_REQUESTED` (no commit landed after the last such review —
otherwise it is awaiting *re-review*, not rework), we flip its **worked issue** from
`status: in-review`/`claimed` to `status: changes-requested`. This is exactly
`start_work.sh`'s ADR-0008 reconcile, minus the "only my own PRs" restriction — so an
**absent author's** reviewed work re-enters the rework queue and adoption (ADR-0020),
`take_unassigned_rework`, and the author's own loop can all route it.

It is deliberately narrow and fails closed:
- **Only work issues** (`stage: research | ideate | build`). Stream roots and discover
  issues are never touched — their lifecycle (needs-synthesis / awaiting-direction) is
  not "changes-requested".
- **Skips `synthesis/*` and `discover/*` PRs** (their rework routes to
  `synthesize_work.sh` / `frame_work.sh` under ADR-0011 / ADR-0014), and any PR labelled
  `review: human-only`, and any issue labelled `do-not-automate`.
- **Canonical-PR guarded** (a stale sibling PR must not route the issue — the #305/#307
  protection) and **currency-checked** (a rework pushed after the review is left alone).
- It **flips status only** and keeps the existing assignee (ADR-0008 posture — a
  returning author keeps their window); the existing `reap_reworks` TTL (`REWORK_TTL`)
  still unassigns it later so any worker can take it, and ADR-0020 adoption does not
  require it to be unassigned. Runs **before** the fork-close sweep (ADR-0020 §5) so a
  flipped fork issue is closed + released in the same pass. Opt out with
  `RECONCILE_UNROUTED=0`.

Alternatives considered: doing this in `start_work.sh` for all authors (rejected — it is
periodic bookkeeping, not per-worker, and belongs with the other reap reconciles);
unassigning on flip (rejected — a returning author should keep their window, and
`reap_reworks`/adoption already cover absence); adding a webhook-driven flip (rejected —
`reap.sh` on its 30-min cron is simpler and covers reviews posted by any actor).

## Consequences

- Adoption (ADR-0020) actually drains the backlog: an absent author's reviewed PR now
  reliably reaches `changes-requested` within a reap cycle instead of stranding forever.
- One more author-agnostic reconcile in reap — bounded, deterministic, DRY_RUN-inspectable.
- A PR whose review flip *did* fire normally is a no-op (already `changes-requested`), so
  the sweep is idempotent and cheap.
- Honest limit: this routes work back to `changes-requested`; it does not make the
  eventual rework *succeed*. If the adopting agent produces no fix, the issue re-cycles —
  that is an agent-quality problem, not a routing one.

## What would change this decision

Evidence the reconcile flips issues that were legitimately mid-work (would tighten the
`claimed` case or require no-PR-yet exclusion — though the canonical-PR + currency guards
already gate that); reviews reliably flipping issues at post time across all actors (would
make the sweep redundant); or a move to webhook-driven status routing (would replace the
cron sweep).
