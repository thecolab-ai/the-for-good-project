# ADR-0020: A stale changes-requested PR is adopted by a different worker (kind: rework)

- **Status:** proposed (ratified on merge by the human maintainer, who directed this
  design on 2026-07-07; agents do not self-ratify pipeline changes)
- **Date:** 2026-07-07
- **Deciders:** @adam91holt (human maintainer); drafted by an agent (Claude Opus 4.8,
  "Fable") acting on his direct instructions
- **Amends:** ADR-0008 (rework hand-off routes by worked issue) — this narrows its
  implicit "the PR's **author** reworks their own PR" assumption
- **Relates to:** ADR-0017 (pull-claim orchestration — this adds a third dispatch kind),
  ADR-0019 (orchestrated review dispatch — the pattern this mirrors), ADR-0018
  (mirror-backed runner reads), ADR-0011 / ADR-0014 (synthesis / framing rework routing,
  which this must not disturb), #656

## Context

Rework only advanced when the **PR's original author** re-ran their loop.
`start_work.sh`'s rework queue (`rework_issues`) filters `changes-requested` issues to
those assigned **to the running identity**; the only cross-worker path was
`take_unassigned_rework`, which requires the issue to have first been **unassigned** by
`reap.sh` after `REWORK_TTL` (2h). But `reap.sh` keys that TTL off the issue's
`updatedAt`, which bumps on *every* comment and label edit — so a PR that churned through
review rounds and then had its author go offline may never age out, leaving the author
assigned and the rework frozen. We hit this live: `changes-requested` PRs sat for days,
still assigned to an absent author, while idle enrolled workers with a gated queue had
nothing else to do (#656). Meanwhile that same cross-worker path *silently drops* fork
PRs (only their author can push a same-branch rework), so a fork rework can never be
adopted at all.

The integrity constraint that made this delicate: a reworked PR is re-reviewed, and the
project's whole trust model rests on **author ≠ reviewer** (branch protection + ADR-0019).
Letting "any worker" pick up a rework must not let a reviewer quietly become the author of
the fix they will then re-review, and must not touch the two rework paths that are
deliberately *not* the generic loop's — synthesis drafts (ADR-0011) and discover framings
(ADR-0014).

## Decision

1. **A third pull-claim kind: `rework`.** `POST /api/v1/work/claim` gains
   `kind: "work" | "review" | "rework"` (default `work`; every response echoes the kind it
   executed, so a runner detects an older server that dropped the field, exactly as
   ADR-0019 established). For `kind: rework` the server picks the **oldest** adoptable PR
   from its webhook-fed mirror, atomically leases it, writes the *issue* labels
   (`changes-requested → claimed` + assigns the adopter), and hands the runner the PR + its
   worked issue. The runner reworks that PR through its existing flow and, on push, the
   issue flips back to `in-review` for a fresh adversarial review.

2. **Adoptability, evaluated on the mirror (fails toward *not* adopting).** A PR is
   adoptable when ALL hold:
   - open, not draft; its worked issue carries `status: changes-requested`;
   - the **last review at the current head SHA is `changes_requested`** — a newer commit
     than that review means the author already pushed rework and the PR is awaiting
     re-review, not adoption (the same head-SHA logic ADR-0019 uses, inverted);
   - that changes-request is **older than `REWORK_ADOPT_HOURS` (default 6h)** — the idle
     window, measured as the review's timestamp (which is by construction ≥ the head-commit
     time it judged, so it is the correct "nothing has happened since" clock);
   - the claiming handle is **neither the PR author nor the last reviewer** — the first
     keeps a worker from "adopting" its own frozen PR pointlessly; the second preserves
     author ≠ reviewer, because an adopter becomes the author of the fix and must not be the
     identity that then re-reviews it;
   - the head branch is **not** `synthesis/*` (ADR-0011) or `discover/*` (ADR-0014) — those
     reworks belong to `synthesize_work.sh` / `frame_work.sh` and their guardrails, never
     this generic path;
   - labels exclude `review: human-only` and `do-not-automate`;
   - the head repo is the **main repo, not a fork** — the adopter must be able to push the
     rework to the branch (see 5);
   - **presence-aware:** the PR author is **not currently connected** to the fleet server.
     An author who is online is presumed to be (or about to be) working their own rework;
     adoption targets the *absent* author the bottleneck is about.

3. **The lease + label test-and-set is the claim.** Like a work claim (ADR-0017), the
   server takes `lease:issue:<n>` with Redis `SET NX EX` and then removes
   `status: changes-requested` on GitHub as an atomic test-and-set — the second remover
   404s, so exactly one adopter wins even across a stale mirror or a label-path rival. It
   adds `status: claimed` and assigns the adopter. The worked issue is resolved from the
   winning PR's body (`Closes` / `Part of #n`) read live at claim time — one read that
   doubles as the ADR-0019 liveness check (a merged/closed PR is never handed out).
   Release/expiry **reverts to `status: changes-requested`** (not `available` — the review
   feedback still stands and the PR still exists), removing the adopter's assignee, so a
   crashed adopter's rework simply becomes adoptable again after the lease lapses. Lease
   TTL is `REWORK_LEASE_TTL_SECONDS` (default 1800, the work-lease value — a rework is one
   agent run, not the hour a review takes).

4. **Provenance is recorded.** The adopter comments `🤝 rework adopted by @adopter from
   @author` on the PR, and the rework prompt instructs the agent to set the finding's
   `agent`/`model` frontmatter to the adopter's — so the leaderboard and the finding's
   recorded provenance both track who actually did the fix.

5. **No external fork branches, for now.** A contributor's fork PR can't be adopted
   (only its author can push its branch) and — per the maintainer's direction (#656) — we
   are **not** accepting outside fork branches into the automated pipeline at this stage;
   contributors who want the fleet to carry their work should run as a maintainer identity
   with push access. So `reap.sh` gains a sweep that, for any `changes-requested` issue
   whose PR lives on a fork, **closes the PR with an explanatory comment and releases the
   issue to `status: available`** (the recorded review stays on the closed PR as reference).
   A fresh worker then picks the issue up clean on a same-repo branch. This is the
   deliberate replacement for a "supersede the fork PR" path, which was considered and
   rejected as more machinery than the current no-fork posture warrants.

6. **Opt-in flag, default ON under autopilot.** Adoption is gated by `REWORK_ADOPT` (a
   feature flag) **and** requires server claiming (`FLEET_CLAIM`), so the atomic lease —
   not a label race — always arbitrates it. `autopilot.sh` defaults `REWORK_ADOPT=1`
   (it already defaults `FLEET_CLAIM=1`); a standalone `start_work.sh` stays opt-in. The
   runner tries adoption **only after** its own rework queue and the existing
   `take_unassigned_rework` path — an author's own PR is always theirs first, and a
   TTL-freed unassigned rework is cheaper to take than a presence-checked adoption.
   On any claim failure — flag off, server down, queue empty, timeout — the loop falls
   through to today's behaviour byte-for-byte (the ADR-0016 fail-open invariant).

Alternatives considered: keying adoption off `reap.sh` unassigning the author (rejected —
`updatedAt` never ages out a churned PR, which is the bug); a client-side soft-lock comment
as the atomic claim (rejected — the maintainer directed the stronger server lease, and it
also gives presence-awareness for free); superseding non-editable fork PRs into the main
repo (rejected — see 5, we simply don't take fork branches yet); default-ON everywhere
(rejected — standalone runs stay opt-in so the behaviour is only live where the server
arbitrates it).

## Consequences

- The fleet self-heals the exact live bottleneck: a `changes-requested` PR whose author
  went offline is picked up by a different enrolled worker after 6h and driven to
  re-review, instead of freezing until a human notices.
- Author ≠ reviewer is preserved by construction — the adopter can be neither the author
  nor the last reviewer, so the re-review still lands on a third identity.
- The two protected rework paths (synthesis, framing) are excluded by head-branch prefix,
  the same marker their existing guards use; a mirror that can't classify a branch fails
  toward *not* adopting.
- Fork PRs stop being a silent dead end: they're closed and their issues re-queued, at the
  cost of discarding the fork branch's commits (the review notes survive on the closed PR).
  This is an explicit, maintainer-directed narrowing — outside fork contribution to the
  automated loop is paused, not solved.
- One more dispatch kind and one more revert target (`changes-requested`) in the sweeper —
  more surface kept convergent, covered by tests.
- A stale mirror can hand out a PR the author just pushed to or a reviewer just re-reviewed;
  the runner's **pre-push guard re-reads live GitHub and aborts if a new author commit
  landed since the review** (never clobber an author who quietly came back), so staleness
  wastes an attempt, never overwrites live work.

## What would change this decision

Evidence adoption clobbers returning authors despite the pre-push guard (would tighten the
liveness window); the enrolled share of workers approaching 100% (would let the
`take_unassigned_rework` label path and its `reap.sh` unassign retire); a decision to
accept outside fork branches into the automated pipeline (would revive the supersede path
from 5 instead of close-and-release); or push assignment arriving for work claims (rework
would follow the same shape).
