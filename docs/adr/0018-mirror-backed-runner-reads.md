# ADR-0018: Runner queue reads come from the fleet server's mirror, not GitHub

- **Status:** proposed (ratified on merge by the human maintainer, who directed this on
  2026-07-06 after repeated rate-limit stalls; agents do not self-ratify pipeline changes)
- **Date:** 2026-07-06
- **Deciders:** @adam91holt (human maintainer); drafted by an agent (Claude Fable 5) acting
  on his direct instructions
- **Relates to:** ADR-0017 (pull-claim orchestration), ADR-0016 (the 2026-07-05 fleet stall
  — set off by a GitHub rate-limit outage), ADR-0013 (pipeline guardrails), #398

## Context

Every runner loop on every machine starts with `fetch_open_issues()` — a paginated GitHub
read of the whole open-issue queue (~3 REST calls at today's queue size) that feeds every
local filter (my-rework, TTL-freed rework, next available). All of a contributor's machines
share their ONE GitHub identity's rate-limit pools (5,000 REST/h, 5,000 GraphQL points/h,
30 search/min), so fleet throughput scales the burn linearly while the budget stays flat.
The fleet has been stalled by exactly this before: the 2026-07-05 incident (ADR-0016) began
with a GitHub rate-limit outage, `fg-common` carries a REST fallback for `gh pr comment`
because the GraphQL pool has been exhausted in hot bursts, and runners back off for an hour
when a pass trips a limit.

Meanwhile ADR-0017 gave the fleet server a MongoDB mirror of exactly this data — fed by
HMAC-verified webhooks within seconds of every label flip, reconciled by an interval sync —
sitting behind one public HTTPS endpoint with no GitHub budget attached.

## Decision

1. **The server serves the runners' queue snapshot.** `GET /api/v1/issues/open`
   (unauthenticated, per-IP rate-limited, public mirror data) returns the open-issue
   snapshot **byte-compatible** with `fetch_open_issues()`'s GitHub read
   (`[{number, createdAt, labels:[{name}], assignees:[{login}]}]`), so every downstream
   `jq` filter works unchanged. The two must be updated together.
2. **Freshness is a hard gate, not advisory.** The route answers **503 unless the
   reconciling sync has completed recently** (within 10 sync intervals — sync itself must
   be running, i.e. the server holds a working bot token). Webhooks alone are not
   sufficient: without a completed backfill the mirror can be missing issues entirely, and
   an incomplete snapshot would silently hide work from the fleet. Stale/incomplete →
   refuse → runners read GitHub directly.
3. **Runners are mirror-first, GitHub-always-fallback.** `fetch_open_issues()` tries the
   server (5s timeout, response validated) and falls back to the direct GitHub read on ANY
   failure — server absent, 503-stale, malformed. `FLEET_SNAPSHOT=0` opts a runner out
   entirely. A dead server can never stall the fleet (the ADR-0016/#398 invariant).
4. **Correctness still rests on GitHub, not the mirror.** The snapshot only *selects*
   candidates; every mutating step re-checks live GitHub state exactly as before
   (`claim_issue` re-reads labels, the server's claim loop test-and-sets the
   `status: available` removal). A stale mirror can waste an attempt, never corrupt state.
5. **The Pages deploy cron drops from every 15 minutes to hourly.** The self-hosted site
   (forgood.thecolab.ai) self-refreshes every 10 minutes on its own host
   (`server/scripts/refresh-web-data.sh`); the GitHub Pages copy is the backup, so hourly
   is plenty and cuts the Actions-side API/minutes load 4×.

## Consequences

- A runner loop that finds nothing to do now costs **zero GitHub API calls**; the fleet's
  per-loop GitHub load no longer scales with machine count. The contributor identity's
  budget is spent only on actual work (claims on the label path, PR pushes, comments).
- The fleet server becomes a read dependency for queue *latency* (never availability):
  if it is down or stale every runner transparently pays the old GitHub price again.
- Webhook-fed selection means a label flip is visible to the whole fleet in seconds —
  faster than the old per-loop polling, not just cheaper.
- One more shape contract to keep in sync (`routes/queue.ts` ↔ `fetch_open_issues()`),
  covered by a route test asserting the exact byte shape.

## What would change this decision

The server growing a second replica (the 503-staleness gate assumes one sync writer); a
GitHub-side change to rate-limit accounting that makes per-loop reads cheap; or evidence
that runners act on stale snapshots in a way the GitHub re-checks fail to catch (that
would force a freshness token or ETag into the claim flow itself).
