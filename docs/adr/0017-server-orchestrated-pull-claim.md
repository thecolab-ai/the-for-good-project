# ADR-0017: The fleet server arbitrates work claims for enrolled agents (pull-claim v1)

- **Status:** proposed (ratified on merge by the human maintainer, who directed this design
  in a live session on 2026-07-05, the same pattern as ADR-0016; agents do not self-ratify
  pipeline changes)
- **Date:** 2026-07-05
- **Deciders:** @adam91holt (human maintainer); drafted by an agent (Claude Fable 5) acting
  on his direct instructions
- **Relates to:** #398 (fleet coordination server), ADR-0013 (pipeline guardrails, incl. the
  high-priority cap), ADR-0014 (discover capability floor), ADR-0015 (autopilot), ADR-0016
  (telemetry defaults — whose "optional accelerator" framing this ADR explicitly amends)

## Context

Claiming an issue today is a **read-then-write race**. `next_available()` in
`scripts/fg-common.sh` sorts the open queue with jq, then `claim_issue` writes the
`status: claimed` label and assignee — two GitHub calls with nothing atomic between them.
Two runners polling at the same moment pick the same issue and both "win"; the loser's work
is wasted tokens. The failure mode scales with exactly the thing we want more of: concurrent
workers. Related gaps: an abandoned claim blocks its issue until `reap.sh`'s 30-minute cron
sweeps it, and a maintainer who needs the fleet to stand down (a bad deploy, a GitHub
incident, a misbehaving prompt) has no lever short of killing processes box by box.

Meanwhile the fleet server exists and every autopilot worker already reports to it by
default (ADR-0016). It is the one place that sees the whole fleet — which makes it the
natural arbiter — but #398's standing invariant, restated in ADR-0016 and the server README,
is that the server is an **optional accelerator**: GitHub holds the state, workers function
identically when the server is down. Any orchestration design has to reconcile those two
facts, and has to keep working for the majority population — humans and non-enrolled
fork-based agents — who will keep claiming via labels.

## Decision

We will make the fleet server a **pull-claim orchestrator** for *enrolled* agents, additive
and fail-open at every layer:

1. **Pull, not push.** An enrolled agent asks `POST /api/v1/work/claim`; the server picks
   the next eligible issue using the *same ordering* as `next_available()` (including the
   `HIGH_PRIORITY_CAP` stream-counted priority bound, ADR-0013), takes an **atomic Redis
   lease** (`SET NX EX`), writes the same `status: claimed` label + assignee via a bot
   token, and returns the issue. If the GitHub write fails, the lease is released and the
   claim fails — the server never holds a claim GitHub doesn't show. Push assignment is
   deliberately deferred: pull keeps agents in control of their own pacing, needs no server
   model of agent capacity, and drops out cleanly when the server is down.
2. **This amends the "optional accelerator" invariant — deliberately.** For enrolled agents
   the server is now the *arbiter of who gets an issue*: a real coordination role, not just
   observation. What survives unchanged, and remains non-negotiable: **GitHub stays the
   durable source of truth.** Every durable fact still lands on GitHub as the same
   labels/assignees humans and non-enrolled contributors rely on; the server's MongoDB
   mirror (fed by HMAC-verified webhooks plus a reconciling interval sync) is a rebuildable
   cache, never authoritative; and every server failure falls back to today's label path.
   Server claiming is the **default** in `autopilot.sh` (`FLEET_CLAIM=1`; opt out with
   `FLEET_CLAIM=0`) precisely because that fallback is total — a fleet with the server
   unplugged is slower and racier, never stuck.
3. **Auth is a server-minted token registry with trust tiers, and standard-tier tokens
   self-mint on first contact (TOFU auto-enrollment).** Nobody hands tokens out: a
   runner's first contact calls `POST /api/v1/agents/enroll` with its self-reported GitHub
   login, the server mints a `standard`-tier token exactly once per handle (a unique index
   arbitrates racers), and the runner stores it under `~/.forgood/` (0600). Only the
   SHA-256 hash is stored server-side, and revocation is immediate and *sticky*: a revoked
   or already-enrolled handle is never re-issued by enrollment — recovery is an operator
   re-mint (`fleet-admin.mjs` / admin route), otherwise anyone could rotate a rival's
   token by re-enrolling their handle. The accepted trade-off is **first-contact handle
   squatting** (identity is assumed-trust, exactly like telemetry's `hello.handle` and the
   label path's claim comments): squatting is visible in the registry, revocable, bounded
   by a per-handle active-claim cap (`MAX_ACTIVE_CLAIMS`, default 3) and per-IP rate
   limits — and the adversarial review gate remains the merge-time defence regardless of
   who claimed. `AUTO_ENROLL=0` turns self-enrollment off (operator-minted tokens only).
   Elevated tiers (`framer` / `trusted`) are still operator-minted decisions, mirroring
   the `trusted-reviewers.json` allow-lists. GitHub device-flow auth (designed in #398)
   stays deferred — it proves account control, which assumed-trust deliberately doesn't
   require, at the cost of an OAuth app plus an interactive step per enrolment. One
   mechanical consequence: GitHub silently drops assignees without repo access, so an
   auto-enrolled outside contributor's claim proceeds **without** an assignee
   (`assigneeSet:false` on the assignment; the label + lease still carry the claim) —
   the same situation the label path has always had for fork contributors.
4. **Redis and Mongo split by lifetime.** Redis holds hot, expiring, atomicity-critical
   state: leases and command-delivery queues. MongoDB holds durable-but-rebuildable state:
   the issue/PR mirror, webhook deliveries, the agent registry, the assignments audit
   trail, sync bookkeeping. Neither is a source of truth; both can be dropped and rebuilt
   (the registry excepted — it's the one collection worth a volume, and it is tiny).
5. **Leases replace the label race — and `reap.sh` — for enrolled agents.** A lease lives
   `LEASE_TTL_SECONDS` (default 1800), auto-renews on authed telemetry heartbeats (only
   while the issue still shows as claimed by the handle — a lost `release` must lapse, not
   be heartbeat-renewed forever), and a 60-second sweeper reverts a dead claim's labels
   (back to `status: available`, assignee removed — but only if the issue still carries
   `status: claimed` on GitHub, the same guard `reap.sh` has, so an issue that already
   moved on to in-review with a live PR is never re-queued) and records `lease-expired`.
   Abandoned work frees in minutes instead of `reap.sh`'s cron cadence. `reap.sh` stays,
   unchanged, for the label path.
6. **Discover roots are never dispatched** (ADR-0014 preserved): dispatch excludes
   `stage: discover` unconditionally in v1 — even for `framer`-tier tokens.
   `frame_work.sh` keeps its own claiming path and capability floor.
7. **A minimal control plane:** `pause` (stop claiming, keep heartbeating, await `resume`),
   `resume`, `stop` (finish the current task, release `done`, exit the loop), `abort`
   (release `abandoned` — labels reverted — and exit ASAP). Commands are piggybacked on
   telemetry heartbeat responses and pushed over the agent WebSocket. **Known v1
   limitation:** `abort` is delivered at the same checkpoints as `stop` (between phases /
   on heartbeat) — it cannot kill a model mid-turn; that's v2.
8. **Runner integration is default-off.** `start_work.sh` and `autopilot.sh` change
   behaviour only when `FLEET_CLAIM=1` and `FLEET_TOKEN` are set; without them the flow is
   byte-for-byte today's. Every `fleet_*` call is best-effort with the label path as
   fallback.

Alternatives considered: GitHub-native atomic claiming (there isn't one — label writes have
no compare-and-swap, and read-after-write checks burn rate limit while staying racy); a
lock file in the repo (write contention and PR noise on the very resource we're
de-contending); push assignment (deferred, see 1); device-flow auth (deferred, see 3);
requiring enrolment for all runners (rejected — it would break the fork-and-contribute
model that needs no maintainer action at all).

## Consequences

Easier: double-claims become impossible *among enrolled agents*; abandoned enrolled claims
free in ≤ TTL + 60s; a maintainer can pause or drain the whole fleet with one command; the
queue and board are readable at one URL without burning GitHub rate limit; every assignment
leaves an audit row. Harder / accepted costs: the server grows real state and two more
containers to operate; a bot token with triage rights lives in the server's environment;
the enrolled claim path depends on server + Redis + Mongo + GitHub all being up (mitigated:
fallback to the label path is automatic). One honest limit: the lease arbitrates only among
enrolled agents — an enrolled claim can still race a *label-path* claim across the
mirror-vs-reality window (webhook loss, covered by the 60s incremental sync), and unlike
the old race this collision needs explicit settlement, because the enrolled claimant
doesn't run `claim_issue`. Two mechanisms provide it: the server treats a 404 on removing
`status: available` mid-claim as "a rival already took it" and skips the candidate, and
the enrolled runner still runs the same deterministic co-assignee tie-break
(`resolve_claim_race`) as every label-path racer before starting work — the labels remain
the cross-population signal. As with every runner contract here, enforcement is cooperative — a
token holder could still claim via raw labels; the audit trail is what makes that visible.

## What would change this decision

Evidence that fail-open is broken in practice (a server outage measurably *stalling*
enrolled agents instead of degrading them to the label path) would force a re-simplify;
persistent mirror drift causing wrong dispatch would force webhooks-plus-sync to be
rethought; the fleet outgrowing pull (idle agents polling while a maintainer wants targeted
routing) would un-defer push assignment; multiple server replicas would revisit the
single-Redis lease design; and a GitHub-native atomic claim primitive appearing would
delete most of this machinery.
