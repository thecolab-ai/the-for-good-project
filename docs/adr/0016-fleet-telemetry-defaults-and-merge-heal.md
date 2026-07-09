# ADR-0016: fleet telemetry on by default (logs opt-in) + deterministic merge-healing in the runners

- **Status:** proposed (ratified on merge by the human maintainer, who directed each of these
  changes on 2026-07-05 — see Context; agents do not self-ratify pipeline/telemetry changes)
- **Date:** 2026-07-05
- **Deciders:** @adam91holt (human maintainer); drafted by an agent (Claude Fable 5) acting on
  his direct instructions
- **Relates to:** #398 (fleet coordination + telemetry server), ADR-0013 (pipeline guardrails),
  ADR-0015 (autopilot), ADR-0009 (maintainer escalation)

## Context

Two things happened on 2026-07-05:

1. **The fleet stalled end-to-end** (the incident PR #532 repairs): a GitHub API rate-limit
   outage broke the child fan-out on ten freshly framed streams, leaving **zero
   `status: available` issues**; six approved framing PRs stranded unmerged because every
   framing PR appends a row to `analysis/README.md`'s index table and the first sibling to
   merge makes all the rest conflict (the "index cascade"); the framing-rework queue wedged
   behind a fork-headed PR whose branch `frame_work.sh` could never check out; and
   review passes burned their `MAX=1` slot on skips, turning autopilot cycles into no-ops.
   Every one of these was invisible until a human went digging.

2. **Phase 1 of the #398 fleet server went live** at `https://forgood.thecolab.ai` (a
   Cloudflare tunnel to the maintainer's box, `server/` docker-compose on :4444, now also
   serving the built `web/` dashboard at `/`). A telemetry server nobody reports to cannot
   answer "is the fleet stuck?" — which is exactly the question the incident raised.

The maintainer (@adam91holt) directed, in a live session: make the server the default
telemetry target so `./autopilot.sh codex` reports with zero setup; host the dashboard on the
same origin; keep **log streaming opt-in on every client** while plain telemetry counters
always flow; and fix the runner scripts so PASS PRs actually merge unattended.

## Decision

### 1. Telemetry counters default ON, session logs stay opt-in

- `autopilot.sh` defaults `FLEET_SERVER=https://forgood.thecolab.ai`. Every autopilot worker
  reports presence + heartbeat **counters** (handle, harness, model, task kind/ref/title,
  token/tool/task/PR/review/error counts). Opt out with `FLEET_SERVER=""`; point elsewhere
  with `FLEET_SERVER=<url>`.
- Session **log lines** remain strictly opt-in at every client (`STREAM_LOGS=1`;
  `autopilot.sh` defaults `0`), redacted at both ends from the shared pattern library. The
  production server sets `ALLOW_LOG_STREAM=1`/`BROADCAST_LOGS=1` so an opted-in worker's
  stream is visible; a client that has not opted in sends no content, ever.
- Telemetry stays **best-effort by construction**: 3s timeouts, every failure swallowed,
  GitHub remains the source of truth (the #398 non-negotiable is unchanged).
- The deployed dashboard (`web/src/lib/live.ts`) defaults to the production fleet server
  (localStorage / `VITE_LIVE_SERVER_URL` still override; dev still targets localhost).

### 2. The runners heal the known index cascade instead of stranding PASS PRs

- `scripts/fg-common.sh` gains `fg_heal_index_conflict`: for a **same-repo** PR whose ONLY
  conflict with main is `analysis/README.md` and whose side of that file is **pure row
  additions**, re-resolve deterministically (main's version + the branch's added rows), push,
  and return the new head. Fork heads, other conflicted files, or row edits/removals are
  never healed — they stay a human's call.
- `merge_ready.sh` waits (bounded, `MERGE_WAIT`) for a fresh head's mergeability/required
  checks to settle, heals the index cascade at most once, re-stamps the gate check on the
  healed head (the recorded trusted review is unchanged by an index-row re-resolve), and
  names the real merge error instead of swallowing it.
- `review_work.sh`'s `AUTO_MERGE` does the same heal-once-and-retry, carrying its own
  just-issued PASS verdict onto the healed head.

### 3. Queue-fairness fixes in the runners

- `review_work.sh`: skips (already passed / parked / human-only / author==reviewer) no longer
  count toward `MAX` — a pass walks the queue to the first PR that actually needs review.
- `frame_work.sh`: a fork-headed framing PR gets a **one-time** ADR-0009 handoff comment and
  is excluded from burning the pass's `MAX` slot (return 3 = "no work done"); failed reworks
  don't count either. One stuck PR can no longer starve the rework queue behind it.

## Consequences

- "Is the fleet alive and what is it doing?" is answerable at one URL, and the next fan-out
  gap or merge-strand is visible as it happens rather than a day later.
- Workers publish activity metadata by default. That is a real privacy trade, accepted
  deliberately for a public-by-design project: counters only, content never (logs opt-in +
  double redaction), one-variable opt-out, and the server retains no log lines at all.
- A verdict carried over an index-heal means the merged head differs from the reviewed head
  by exactly one appended index row — accepted as equivalent-by-construction; any other
  difference still forces a fresh review.
- If the telemetry server is retired or moved, the default URL in `autopilot.sh` (and the
  dashboard fallback in `web/src/lib/live.ts`) must move with it; nothing else depends on it.

## What would change this decision

Evidence that default-on counters leak more than activity metadata (they would then default
off again), a second replica / real auth landing on the server (revisit #398's parked auth
design), or the index cascade being removed at the source (e.g. a generated index), which
would make the heal path dead code to delete.
