# ADR-0019: The fleet server dispatches PR reviews to enrolled reviewers (kind: review)

- **Status:** proposed (ratified on merge by the human maintainer, who directed this design
  on 2026-07-06 as a follow-up to ADR-0017/0018; agents do not self-ratify pipeline changes)
- **Date:** 2026-07-06
- **Deciders:** @adam91holt (human maintainer); drafted by an agent (Claude Fable 5) acting
  on his direct instructions
- **Relates to:** ADR-0017 (pull-claim orchestration — this extends its pattern from issues
  to PR reviews), ADR-0018 (mirror-backed runner reads — same rate-limit motive), ADR-0015
  (autopilot alternates review and work), ADR-0013 (review-round cap), #398

## Context

Every `review_work.sh` pass **walks the open-PR list client-side**: a paginated pulls read,
then per-PR metadata reads just to decide *skip* — draft? `review: human-only`?
author == reviewer? already reviewed at this head revision? parked at the round cap? Most
of that burn discovers nothing to do, and (ADR-0018) it comes out of the one shared
rate-limit budget per contributor identity. Concurrency is handled by a client-side claim
dance — a `review: claimed` label honoured for a TTL plus a pending-status settle window
with a randomised sleep — which mostly works, but costs GitHub writes per claim and still
lets two reviewers race into the settle window on the same PR.

ADR-0017 already solved exactly this shape of problem for *issue* claims: the fleet server
picks the next eligible candidate from its webhook-fed mirror and takes an atomic Redis
lease. Reviews are the same race with one welcome simplification: **a review holds no
GitHub state while in progress** — no status label, no assignee — so the server has nothing
to write on claim and nothing to revert on expiry.

## Decision

1. **Same pull-claim, second kind.** `POST /api/v1/work/claim` gains
   `kind: "work" | "review"` (default `work`; every response echoes the kind it executed,
   so a runner can detect an older server that silently dropped the field). For
   `kind: review` the server picks the **oldest** eligible open PR from the mirror and
   returns it; the enrolled runner reviews exactly that PR through its existing per-PR
   flow. Eligibility replicates `review_work.sh`'s own selection rules server-side: open,
   not draft, labels exclude `review: human-only` and `do-not-automate`, author ≠ the
   claiming handle (the different-identity rule), under the review-round cap
   (`MAX_REVIEW_ROUNDS` — the same env var the shell reads, so operator overrides can't
   diverge the two; dismissed rounds don't count, matching the shell's GraphQL
   `states:CHANGES_REQUESTED`), and **not already reviewed at the current head SHA** — an
   approving, changes-requesting, or dismissed review carrying `commitId == headSha` means
   either waiting-on-rework or already passed, so the PR is skipped until the author
   pushes; new commits make it eligible again. A **commented-only** review at head does
   *not* count as reviewed: it sets no merge-check status, so the shell's walk would still
   review the PR. Because the mirror can miss a close, the winning candidate is verified
   **still open against live GitHub** (one read per claim) before it is handed out —
   a merged PR must never cost an agent-hour review; the read also self-heals the doc.
2. **The lease is the whole claim.** `lease:review:<pr>` is taken with Redis `SET NX EX`
   (`REVIEW_LEASE_TTL_SECONDS`, default 3600) — **no GitHub writes on claim, none on
   release, none on expiry**, because reviews hold no labels. Leases renew on authed
   telemetry heartbeats like work leases (the claimed-label mirror guard applies only to
   kind `work`); an expired review lease just marks the assignment `lease-expired` and the
   PR drops back into the review queue. Release outcomes: `done` on **any posted verdict**
   — PASS and NEEDS_WORK both mean the review happened — `abandoned` on
   failure/usage-limit/interrupt *or a local skip* (the runner's live checks disagreed with
   the mirror). An abandoned PR **cools down** (`REVIEW_ABANDON_COOLDOWN_SECONDS`, default
   900) before it can be dispatched again: without that, a PR every runner locally skips
   would sit at the head of the deterministic oldest-first queue and burn one claim per
   runner per pass, forever. The walk can still reach a cooling-down PR.
3. **The mirror learns review state lazily.** `pull_request_review` webhooks append
   `{reviewer, state, commitId, at}` to the PR doc (capped at the last 30) and
   `pull_request` synchronize events update `headSha` — but the REST pulls list doesn't
   carry reviews, so the interval sync can't backfill them. When dispatch evaluates a
   candidate with no review data for its current head, it fetches
   `GET /pulls/:n/reviews` **once** and stamps `reviewsFetchedFor: headSha`; the fetch is
   bounded to the first 10 candidates per claim, so a cold mirror costs a bounded, one-time
   read per PR revision instead of every pass forever.
4. **One assignments collection, tagged by kind.** Review claims reuse the `assignments`
   audit trail with `kind: "review"` (existing docs read as `kind: "work"`); for review
   rows `issueNumber` holds the **PR number**. The active-claims view carries `kind` so the
   dashboard badges reviews distinctly.
5. **The runner stays the reviewer; the walk stays the fallback.** The server only picks
   *which* PR — everything about *how* it is reviewed is unchanged: the method-vs-standard
   review kind, prior-round context, the round cap and parking (#287/ADR-0013), the merge
   check, NEEDS_WORK routing. The runner also keeps its client-side claim dance and
   per-PR guards, because the lease arbitrates **only among enrolled reviewers** — a
   non-enrolled reviewer on the label/status path can still race, and the existing dance
   remains the cross-population defence. On claim failure for any reason — queue empty,
   server down, timeout — `review_work.sh` falls through to today's PR-list walk
   byte-for-byte (the ADR-0016/#398 fail-open invariant).
6. **Review claims authenticate as the identity that posts the review.** The stored fleet
   token file is keyed by **host + handle** (`~/.forgood/fleet-token-<host>-<handle>`;
   a legacy host-only token is adopted and migrated once when the handle's re-enroll
   409s), and `review_work.sh` drops any inherited `FLEET_TOKEN` when
   `REVIEW_GITHUB_TOKEN` is set — so on the documented autopilot setup (work identity
   enrolled at startup, reviews under a distinct token) the reviewer enrolls **its own**
   handle rather than silently reusing the work identity's token, which would make the
   server enforce author ≠ handle against the wrong account. Defence in depth: the claim
   response carries `handle`, and the runner abandons the claim (falling back to the walk)
   if it doesn't match the identity it posts reviews as.

Alternatives considered: leasing via the existing `review: claimed` label writes routed
through the server (rejected — keeps the GitHub write cost and the settle-window race this
removes); backfilling all review state on interval sync (rejected — a per-PR REST read per
sync cycle is the exact rate-limit burn ADR-0018 exists to kill; lazy fetch pays it once
per revision, only for candidates); a separate reviews collection (rejected — one
assignments audit trail with a `kind` tag keeps the admin surfaces and sweeper singular).

## Consequences

- Among enrolled reviewers, duplicate reviews of one PR become impossible, and a pass that
  finds nothing to review costs **zero GitHub calls** — selection moves to the mirror.
- No labels means the failure path is trivial: a crashed reviewer's lease lapses and the
  PR is claimable again in ≤ TTL, with nothing on GitHub to clean up.
- The mirror grows review state (`headSha`, `reviews`, `reviewsFetchedFor`) — one more
  shape kept convergent between webhook reduce and sync, covered by tests.
- A stale mirror can hand out a PR that was just reviewed or just pushed to; the runner's
  existing per-PR checks read live GitHub before spending model tokens (including a
  PR-state guard, so a merged/closed PR is never reviewed), so staleness wastes an
  attempt, never produces a wrong verdict (the ADR-0018 posture: the mirror *selects*,
  GitHub *decides*). The abandon cooldown bounds how often one stale PR can waste
  attempts.
- The mirror's skip rules are an **approximation** of the shell's status-check rules, and
  it fails toward *not dispatching*: a PR whose review-entry array sits at its storage cap
  (30) has an unknowable round count and is skipped (the walk still reaches it), and any
  residual divergence resolves through the walk rather than a dispatch loop.
- Honest limit: as with work claims, arbitration covers only the enrolled population —
  mixed fleets still rely on the client-side claim dance, which is why it stays.

## What would change this decision

Evidence the fallback walk is being hit persistently (the server failing as a review
dispatcher in practice); review-state drift the lazy fetch + webhooks fail to converge
(would force sync-side backfill despite its cost); the enrolled share of reviewers
approaching 100% (would let the client-side claim dance retire); or push assignment
arriving for work claims (reviews would follow the same shape).
