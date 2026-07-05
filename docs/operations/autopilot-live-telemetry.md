---
title: Autopilot Live Telemetry Verification
type: operations
issue: '#473'
author: 'codex'
agent: 'codex'
model: 'gpt-5'
date: '2026-07-05'
---

# Autopilot Live Telemetry Verification

Use this when the live fleet dashboard looks quiet and you need to tell whether worker presence, log streaming, and model throughput are actually working.

Set the server URL first:

```bash
export FLEET_SERVER="https://<fleet-server-host>"
```

## What To Check

1. **Fleet state:** `GET /api/v1/state` is the current snapshot endpoint; the route returns `store.snapshot()`, and the snapshot contains `agents`, `watchers`, `fleet`, and `events`. [Confidence: High; source](https://github.com/thecolab-ai/the-for-good-project/blob/main/server/src/http.ts#L19-L20), [implementation](https://github.com/thecolab-ai/the-for-good-project/blob/main/server/src/state.ts#L456-L462).

   ```bash
   curl -fsS "$FLEET_SERVER/api/v1/state"
   ```

   Healthy: expected workers appear in `.agents`, `lastSeen` is recent, and task/counter fields move when runners are doing work. This verifies worker telemetry, not model TPS; `autopilot.sh` posts presence and heartbeat counters through `/api/v1/telemetry` even when token counts are zero. [Confidence: High; source](https://github.com/thecolab-ai/the-for-good-project/blob/main/autopilot.sh#L108-L113), [source](https://github.com/thecolab-ai/the-for-good-project/blob/main/autopilot.sh#L156-L178).

2. **Historical TPS:** `GET /api/v1/history/tps` returns durable TPS buckets and totals when the optional history store has samples, and the dashboard asks for `minutes=1440&bucketSeconds=60`. [Confidence: High; source](https://github.com/thecolab-ai/the-for-good-project/blob/main/server/src/http.ts#L25-L30), [dashboard call](https://github.com/thecolab-ai/the-for-good-project/blob/main/web/src/lib/live.ts#L213-L220).

   ```bash
   curl -fsS "$FLEET_SERVER/api/v1/history/tps?minutes=60&bucketSeconds=60"
   ```

   Healthy: recent buckets have non-zero `tps` only after a worker reports token deltas. The live server adds points to the TPS window only when `tokensIn + tokensOut` is greater than zero, and historical bucket TPS is calculated from `tokensIn + tokensOut` divided by the bucket length. [Confidence: High; live source](https://github.com/thecolab-ai/the-for-good-project/blob/main/server/src/state.ts#L185-L188), [history source](https://github.com/thecolab-ai/the-for-good-project/blob/main/server/src/history.ts#L214-L249).

3. **Per-worker logs:** `GET /api/v1/agents/:agentId/logs` returns retained redacted lines for a known worker and returns `404` for an unknown `agentId`. [Confidence: High; source](https://github.com/thecolab-ai/the-for-good-project/blob/main/server/src/http.ts#L32-L37), [retention source](https://github.com/thecolab-ai/the-for-good-project/blob/main/server/src/state.ts#L437-L451).

   ```bash
   AGENT_ID="<copy an agent id from /api/v1/state>"
   curl -fsS "$FLEET_SERVER/api/v1/agents/$AGENT_ID/logs"
   ```

   Healthy: logs appear only for workers that have opted into streaming and only when the server accepts log streams; `autopilot.sh` skips log posting unless `STREAM_LOGS=1`, and the server rejects `/api/v1/logs` unless log streaming is enabled. [Confidence: High; worker source](https://github.com/thecolab-ai/the-for-good-project/blob/main/autopilot.sh#L116-L145), [server source](https://github.com/thecolab-ai/the-for-good-project/blob/main/server/src/http.ts#L66-L79).

## Telemetry vs TPS

Worker telemetry means presence, current task, counters, and optional redacted logs. Model TPS means token throughput from real model usage. They are related but not equivalent: a worker can be online, polling, finding an empty queue, or skipping an already-reviewed PR while TPS stays at zero. `autopilot.sh` explicitly sends idle heartbeats with zero token counts for queue-empty and review-skip paths, while TPS state changes only when positive token counts arrive. [Confidence: High; idle source](https://github.com/thecolab-ai/the-for-good-project/blob/main/autopilot.sh#L164-L170), [TPS source](https://github.com/thecolab-ai/the-for-good-project/blob/main/server/src/state.ts#L280-L296).

For Codex JSON telemetry, token deltas are posted from `turn.completed` usage events, so TPS should appear only after the worker reaches an actual Codex turn that emits usage data. [Confidence: High; source](https://github.com/thecolab-ai/the-for-good-project/blob/main/scripts/codex-json-telemetry.py#L148-L160). For other agent hooks, apply the same rule: no token delta into `/api/v1/telemetry`, no TPS.

## Quick Diagnosis

- Workers missing from `/api/v1/state`: check that the worker has `FLEET_SERVER` set and can reach the server, because `autopilot.sh` no-ops telemetry when `FLEET_SERVER` is unset. [Confidence: High; source](https://github.com/thecolab-ai/the-for-good-project/blob/main/autopilot.sh#L60-L68).
- Workers present but TPS flat: check whether they are only polling, queue-empty, or review-skipping before assuming model telemetry is broken. [Confidence: High; source](https://github.com/thecolab-ai/the-for-good-project/blob/main/autopilot.sh#L164-L170).
- Logs missing but workers present: check both ends of the log-stream gate, `STREAM_LOGS=1` on the worker and log streaming enabled on the server. [Confidence: High; worker source](https://github.com/thecolab-ai/the-for-good-project/blob/main/autopilot.sh#L116-L145), [server source](https://github.com/thecolab-ai/the-for-good-project/blob/main/server/src/http.ts#L66-L79).

## Confidence & Limits

Overall confidence: High for the documented API behavior because each check is tied to the current route or state implementation. I could not verify a live production fleet response from this worktree, so this document verifies the expected behavior from source code rather than confirming the deployed service is currently healthy.

## What Would Change This Conclusion

A change to `server/src/http.ts`, `server/src/state.ts`, `server/src/history.ts`, `autopilot.sh`, or `scripts/codex-json-telemetry.py` that alters endpoint names, log gates, heartbeat fields, or token accounting would require this runbook to be updated.
