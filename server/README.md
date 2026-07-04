# Fleet server — mission control for the worker fleet

The coordination + telemetry server from [#398](https://github.com/thecolab-ai/the-for-good-project/issues/398), Phase 1: **telemetry in**. Workers (autopilot runs) connect and stream presence + heartbeats; the live dashboard connects as a *watcher* and gets the whole fleet in real time — who's online, what they're working on, and a fleet-wide **TPS (tokens/sec)** gauge in the spirit of Bitcoin hash-rate.

**The non-negotiable principle:** GitHub stays the durable source of truth. This server is an optional accelerator — telemetry and (later) dispatch hints layered on top. Workers must keep functioning exactly as today when it's down, and every client here is written that way (telemetry calls no-op on failure).

## Run it

```bash
docker compose up -d          # server on :8787
```

or without Docker:

```bash
npm install
npm run dev                   # tsx watch, :8787
```

Demo it with fake agents (no real workers needed):

```bash
npm run simulate              # AGENTS=12 SERVER=ws://host:8787 to vary
```

Point the dashboard at it: set `VITE_LIVE_SERVER_URL=http://localhost:8787` when running `web/`, or in the browser `localStorage.setItem("forgood.liveServer", "http://localhost:8787")` on the deployed site.

## Architecture decisions

**TypeScript** — same language as `web/`, so the watcher protocol types are shared by mirror (`src/protocol.ts` ↔ `web/src/lib/live.ts`).

**In-memory state, no database, no Redis.** Considered and rejected for now: every piece of state here is ephemeral by design — presence with 90s TTLs, a 60s sliding token window, a capped event feed. It all rebuilds from heartbeats within seconds of a restart, and #398 explicitly says *"keep it small and stateless where possible (GitHub holds state)"*. Redis would only earn its keep with multiple server replicas, which the fleet's realistic scale (tens of workers/watchers ≪ one Node process's capacity) doesn't justify — and it would double the ops burden of a project whose ethos is "clone it and run one script". The single thing worth keeping across restarts — lifetime totals + the event feed — is snapshotted to `STATE_FILE` on a volume. If we ever scale out, `FleetStore` is the seam: swap in a shared-store implementation behind the same interface.

**Auth is parked** (maintainer decision on #398): connecting workers are assumed to be who they claim. The `hello` handshake is shaped so a challenge step (SSH-key signature or GitHub device flow — both designed in the issue) can slot in later without protocol changes.

**Watcher privacy:** a watcher's IP is used once, in-process, to derive a rough location (city/country + coordinates rounded to ~11 km) via an offline GeoLite2 lookup (`geoip-lite` — the IP never leaves the process, no third-party geo API). The IP is never stored, never logged, and never sent to any client. Watchers appear to others only as `{ random id, city, country, rough coords, connectedAt }`.

**Log streaming is default-OFF at both ends** (per #398): a worker must opt in (`STREAM_LOGS=1`) *and* the server must allow it (`ALLOW_LOG_STREAM=1`), and even then logs are redacted twice (worker-side and server-side, `src/redact.ts`) and only reach the public dashboard if `BROADCAST_LOGS=1` is *also* set. Heartbeats carry counts and rates, never content.

## Protocol

### Workers → server

**WebSocket** `ws://host:8787/ws/agent` — send `hello` within 10s, then heartbeats:

```jsonc
{ "type": "hello", "handle": "adam91holt", "harness": "claude", "model": "claude-fable-5",
  "task": { "kind": "work", "ref": "#231", "title": "School attendance interventions" } }
// server replies: { "type": "welcome", "agentId": "…" }

{ "type": "heartbeat",              // all counters are DELTAS since last heartbeat
  "tokensIn": 3200, "tokensOut": 940,
  "toolCalls": 5, "tools": { "bash": 3, "webfetch": 2 },
  "fetchesOk": 2, "fetchesError": 0,
  "skills": { "child-poverty-nz": 1 },
  "errors": 0, "tasksCompleted": 0, "prsOpened": 0, "reviewsCompleted": 0 }

{ "type": "task", "task": { "kind": "review", "ref": "#405", "title": "…" } }
{ "type": "log", "lines": ["…"] }   // opt-in only, redacted, see above
{ "type": "bye" }
```

**Plain HTTP** (for bash workers — see [`examples/agent-heartbeat.sh`](examples/agent-heartbeat.sh)):

```bash
curl -s -X POST http://host:8787/api/v1/telemetry -H 'content-type: application/json' -d '{
  "agentId": "<from the first response, optional>",
  "handle": "adam91holt", "harness": "claude", "model": "claude-fable-5",
  "task": { "kind": "work", "ref": "#231" },
  "heartbeat": { "tokensIn": 3200, "tokensOut": 940, "toolCalls": 5 }
}'
```

Presence expires ~90s after the last heartbeat; heartbeat every ~30s.

### Harness hooks — plug a real session in ([`clients/`](clients/))

Self-contained Node scripts (no npm install) that bridge a live harness session to the server. Both **no-op instantly unless `FLEET_SERVER` is set**, never block the session (3s timeouts, every failure swallowed, always exit 0), and only stream session *content* when `STREAM_LOGS=1` is also set — with client-side redaction before send and server-side redaction again.

**Claude Code** — merge [`clients/claude-settings.example.json`](clients/claude-settings.example.json) into `~/.claude/settings.json` (or the project's `.claude/settings.local.json`), then run with `FLEET_SERVER` set:

```bash
FLEET_SERVER=http://host:8787 FLEET_HANDLE=<you> claude
# add STREAM_LOGS=1 to also stream redacted session excerpts (loud consent warning printed)
```

Hook events → telemetry: `SessionStart` → hello/presence (model id from the payload); `PostToolUse` → tool-call counts by tool + WebFetch/WebSearch ok/error; `Stop` → token deltas parsed from the session transcript (cache reads excluded so the TPS gauge reflects fresh work) and, when opted in, a redacted excerpt of the assistant's latest message; `SessionEnd` → goodbye. Note the transcript format is internal to Claude Code and can change between versions — the parser fails soft to zero deltas if it does.

**Codex** — point Codex's notify hook at the bridge in `~/.codex/config.toml`:

```toml
notify = ["node", "/path/to/the-for-good-project/server/clients/codex-notify.mjs"]
```

Codex only fires notify per completed turn, so its telemetry is coarser (presence + heartbeat + opt-in excerpt of the last assistant message; no per-tool or token counts). Set `FLEET_SERVER`, `FLEET_HANDLE`, `FLEET_MODEL` in the environment Codex runs in.

**Log ingestion endpoint:** hook processes are one-shot, so they POST `{agentId, lines}` to `/api/v1/logs` instead of holding a WebSocket; it 403s unless the server runs with `ALLOW_LOG_STREAM=1`.

### Watchers ← server

**WebSocket** `ws://host:8787/ws/watch` — receive `{ type: "snapshot", state }` on connect, then deltas: `agents` (full presence list), `fleet` (TPS + totals, ticked every 2s), `watchers`, `event`, and optionally `log`. Polling fallback: `GET /api/v1/state`, `GET /api/v1/metrics`, `GET /healthz`.

## Configuration

| Env | Default | What |
|---|---|---|
| `PORT` / `HOST` | `8787` / `0.0.0.0` | Listen address |
| `STATE_FILE` | unset | JSON snapshot for totals + event feed (compose mounts a volume) |
| `TRUST_PROXY` | `1` | Honour `X-Forwarded-For` for watcher geo behind a proxy |
| `WATCHER_GEO` | `1` | Rough watcher location from IP (IP discarded immediately) |
| `ALLOW_LOG_STREAM` | `0` | Accept opt-in log streams from workers |
| `BROADCAST_LOGS` | `0` | Also forward (redacted) logs to watchers |
| `CORS_ORIGIN` | `*` | Comma-separated allowed origins |
| `AGENT_TTL_SECONDS` | `90` | Presence timeout without a heartbeat |

## What's deliberately NOT here yet

- **Dispatch (Phases 2–3)** — soft hints then push assignment. The watcher/agent split and the `welcome` handshake leave room for a `hint`/`assign` message type.
- **Auth** — parked, designs on file in #398.
- **Autopilot wiring** — `autopilot.sh`/runner integration lands as its own change; `examples/agent-heartbeat.sh` is the shape of it, and the `clients/` hook scripts already cover any Claude Code / Codex session run inside this repo once configured.
