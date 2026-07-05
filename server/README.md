# Fleet server — mission control for the worker fleet

The coordination + telemetry server from [#398](https://github.com/thecolab-ai/the-for-good-project/issues/398). Phase 1: **telemetry in** — workers (autopilot runs) connect and stream presence + heartbeats; the live dashboard connects as a *watcher* and gets the whole fleet in real time — who's online, what they're working on, and a fleet-wide **TPS (tokens/sec)** gauge in the spirit of Bitcoin hash-rate. Phase 2: **pull-claim orchestration** (opt-in, [ADR-0017](../docs/adr/0017-server-orchestrated-pull-claim.md)) — enrolled agents claim work through the server, which arbitrates atomically and writes the same GitHub labels everyone else relies on. See [Orchestration](#orchestration--server-arbitrated-pull-claim-opt-in-adr-0017) below.

**The non-negotiable principle:** GitHub stays the durable source of truth. For telemetry the server is a pure optional accelerator; for *enrolled* agents it now also arbitrates claims (an amendment made deliberately in ADR-0017) — but every durable fact still lands on GitHub as ordinary labels/assignees, the Mongo mirror is a rebuildable cache, and everything is fail-open: workers keep functioning exactly as today when the server is down (telemetry calls no-op on failure; a failed server claim falls back to the label path), and non-enrolled contributors never need this server at all.

## Run it

```bash
docker compose up -d          # server on :8787
```

Production (the fleet's mission control at **https://forgood.thecolab.ai**) runs exactly this
container on the maintainer's box, published on host port 4444 behind a Cloudflare tunnel.
The image also builds `web/` and serves the dashboard at `/` (`STATIC_DIR`), so that one URL
is both the site and the telemetry endpoint. Server-side log streaming is deliberately
enabled there — but every *client* stays opt-in (`STREAM_LOGS=1`); plain telemetry counters
flow from all workers regardless:

```bash
PORT=4444 ALLOW_LOG_STREAM=1 BROADCAST_LOGS=1 docker compose up -d --build
# Cloudflare tunnel: https://forgood.thecolab.ai -> http://localhost:4444
```

`autopilot.sh` points at that URL by default (see its header; `FLEET_SERVER=""` opts out), so
`./autopilot.sh codex` reports telemetry with zero setup.

or without Docker (Node **22+** — the simulator uses the built-in global `WebSocket` client):

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

**In-memory state, no database, no Redis — for telemetry.** Considered and rejected for the telemetry path: every piece of state there is ephemeral by design — presence with 90s TTLs, a 60s sliding token window, a capped event feed. It all rebuilds from heartbeats within seconds of a restart, and #398 explicitly says *"keep it small and stateless where possible (GitHub holds state)"*. The single thing worth keeping across restarts — lifetime totals + the event feed — is snapshotted to `STATE_FILE` on a volume. If we ever scale out, `FleetStore` is the seam: swap in a shared-store implementation behind the same interface.

**Redis + Mongo — for orchestration only (ADR-0017).** Orchestration state is different in kind from telemetry: a claim lease must be **atomic across concurrent claimers** (Redis `SET NX EX` — the whole point is killing the label race), and the GitHub mirror / agent registry / assignments audit are durable-but-rebuildable documents (MongoDB). Both stores are optional: leave `REDIS_URL`/`MONGO_URL` unset and this is exactly the Phase 1 telemetry-only process, with the orchestration routes answering `503 {"ok":false,"error":"orchestration disabled"}`. Neither store is ever the source of truth — GitHub is.

**Auth is parked** (maintainer decision on #398): connecting workers are assumed to be who they claim. The `hello` handshake is shaped so a challenge step (SSH-key signature or GitHub device flow — both designed in the issue) can slot in later without protocol changes. **Known exposure until then:** anyone who can reach the server can report presence/metrics under any handle. Cheap guards bound the blast radius — per-connection and per-IP rate limits, a `MAX_AGENTS` cap, and a WebSocket origin check (when `CORS_ORIGIN` isn't `*`) so a malicious web page can't use a visitor's browser to inject spoofed presence — but the telemetry itself is honour-system until auth lands. GitHub remains the source of truth for anything that matters.

**Watcher privacy:** a watcher's IP is used once, in-process, to derive a rough location (city/country + coordinates rounded to ~11 km) via an offline GeoLite2 lookup (`geoip-lite` — the IP never leaves the process, no third-party geo API). The IP is never stored, never logged (request logging is scrubbed to method + url — Fastify's default serializer would otherwise emit `remoteAddress`), and never sent to any client. Watchers appear to others only as `{ random id, city, country, rough coords, connectedAt }`, and watcher-join notices are broadcast-only — they're never written to the persisted event feed.

**Streamed logs are broadcast-only** — the server retains nothing: no log lines are stored in memory or on disk, they only fan out live to connected watchers (and only when `BROADCAST_LOGS=1`).

**Log streaming needs both ends to agree** (per #398): the worker must opt in (`STREAM_LOGS=1` — every client including `autopilot.sh` defaults OFF; telemetry counters always flow regardless) *and* the server must allow it (`ALLOW_LOG_STREAM=1`, default off; the production server allows it), and even then logs are redacted twice — worker-side and server-side, both from the ONE shared pattern library ([`clients/redact-patterns.mjs`](clients/redact-patterns.mjs)) so the two passes can never drift. Coverage: URL credentials (Postgres/MySQL/MongoDB/Redis/AMQP/any `scheme://user:pass@`), private-key/PGP/age blocks, AWS key ids + secret assignments, GitHub/GitLab/Slack/Discord/Telegram tokens and webhook URLs, OpenAI/Anthropic/HF/Stripe/Google/Azure/SendGrid/Twilio/npm/PyPI/Shopify/DigitalOcean/Databricks/Linear/Notion/Airtable token shapes, JWTs, auth headers, and any `NAME=value` where the name looks secret-bearing (quoted values included) — tested by `npm test` (`test/redact.test.mjs`), which deliberately accepts over-redaction. Logs only reach the public dashboard if `BROADCAST_LOGS=1` is *also* set. Heartbeats carry counts and rates, never content — and redaction remains best-effort harm reduction, not a guarantee.

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

**Codex** (codex-cli ≥ 0.142) — the repo ships hook wiring in [`.codex/hooks.json`](../.codex/hooks.json) → [`clients/codex-hook.mjs`](clients/codex-hook.mjs), which applies to any Codex session working in a checkout/worktree of this repo. Hook payloads carry no token usage, so the client parses Codex's rollout transcript incrementally: `SessionStart` → hello/presence; `PostToolUse` → tool counts **plus live token deltas mid-run** (cache reads excluded); `Stop` → remaining deltas and, only with `STREAM_LOGS=1`, a redacted excerpt of the last agent message. Codex gates non-managed hooks behind an interactive trust review, so the runners pass `--dangerously-bypass-hook-trust` (its documented automation use; the hooks are versioned in this repo). The hook activates only for For Good work — an explicit `FLEET_SERVER`, or a cwd that is a For Good checkout — never for unrelated projects on the same machine.

Older setups: `notify = ["node", ".../clients/codex-notify.mjs"]` in `~/.codex/config.toml` still works but is turn-level only (no per-tool or token telemetry). The `codex exec --json` bridge (`scripts/codex-json-telemetry.py`) remains for runner log streaming/readable output and yields telemetry posting to the hook client automatically when the hook wiring is present.

**Log ingestion endpoint:** hook processes are one-shot, so they POST `{agentId, lines}` to `/api/v1/logs` instead of holding a WebSocket; it 403s unless the server runs with `ALLOW_LOG_STREAM=1`.

### Watchers ← server

**WebSocket** `ws://host:8787/ws/watch` — receive `{ type: "snapshot", state }` on connect, then deltas: `agents` (full presence list), `fleet` (TPS + totals, ticked every 2s), `watchers`, `event`, and optionally `log`. Polling fallback: `GET /api/v1/state`, `GET /api/v1/metrics`, `GET /healthz`.

## Orchestration — server-arbitrated pull-claim (opt-in, ADR-0017)

Enrolled agents claim work with `POST /api/v1/work/claim`: the server picks the next
eligible issue (same ordering as `next_available()` in `scripts/fg-common.sh`, including
the `HIGH_PRIORITY_CAP` stream bound; `stage: discover` is **never** dispatched —
ADR-0014), takes an atomic Redis lease, writes `status: claimed` + the assignee on GitHub
itself, and returns the issue. If the GitHub write fails, the lease is released and the
claim fails — the server never holds a claim GitHub doesn't show. Full rationale:
[ADR-0017](../docs/adr/0017-server-orchestrated-pull-claim.md); runner-side usage:
[docs/AUTOMATION.md § Server-orchestrated claiming](../docs/AUTOMATION.md#server-orchestrated-claiming-opt-in).

Each surface enables independently — unset means that surface is off, everything else
still works:

| Surface | Enabled when | When off |
|---|---|---|
| Orchestration core (stores, leases, mirror, `queue`/`board`) | `REDIS_URL` **and** `MONGO_URL` | routes answer `503 {"ok":false,"error":"orchestration disabled"}` |
| Dispatch claims + mirror sync | + `GITHUB_TOKEN` (bot token with triage/write on the repo) | claim answers 503; mirror can still be fed by webhooks |
| GitHub webhook ingest | + `WEBHOOK_SECRET` | route not registered (404) |
| Admin API | + `ADMIN_TOKEN` | routes not registered (404) |

Stores configured but unreachable at boot = logged error, server boots telemetry-only
(fail-open, never crash-loop).

### Run it

`docker-compose.yml` already ships `redis:7-alpine` + `mongo:7` on the compose network (no
host ports) with `REDIS_URL`/`MONGO_URL` pre-wired (override/disable via
`FLEET_REDIS_URL`/`FLEET_MONGO_URL` — export them EMPTY for a telemetry-only deploy); the
secrets pass through from your environment. The bot token is deliberately named
`FLEET_GITHUB_TOKEN`: an ambient `GITHUB_TOKEN` exported for unrelated gh/CI tooling in
the deploy shell is never silently adopted as the fleet's claim-writing identity.

```bash
FLEET_GITHUB_TOKEN=<bot-pat> \
WEBHOOK_SECRET=$(openssl rand -hex 32) \
ADMIN_TOKEN=$(openssl rand -hex 32) \
docker compose up -d --build
```

Leave any of the three unset and that surface stays disabled — the image still runs
telemetry-only with all of them (and the stores) unset.

### Auto-enrollment (default): runners mint their own token

Nobody hands tokens out for the normal case ([ADR-0017](../docs/adr/0017-server-orchestrated-pull-claim.md)):
a runner's **first contact** calls the unauthenticated enroll route with its own GitHub
login, gets a `standard`-tier token exactly once, and stores it under `~/.forgood/`
(0600). `./autopilot.sh` does this automatically — there is no setup step.

```bash
# What the runner does under the hood, exactly once per handle:
curl -s -X POST $URL/api/v1/agents/enroll -H "$JSON" \
  -d '{"handle":"your-gh-login","harness":"codex"}'
# 200 {ok:true, token:"fgt_…", handle, tier:"standard"} — first contact only
# 409 ever after (incl. after a revoke: revocations STICK; recovery = operator re-mint)
# 403 when the server runs AUTO_ENROLL=0 (operator-minted tokens only)
```

Identity is self-reported assumed trust (same as telemetry's `hello.handle`); squatting a
handle is possible, visible in the registry listing, revocable, and bounded — one handle
holds at most `MAX_ACTIVE_CLAIMS` (default 3) live claims, and the adversarial review gate
still guards every merge. Handles without repo access can't be GitHub assignees (GitHub
silently drops them), so their claims carry `assigneeSet:false` and identity lives in the
lease + assignment record — labels still gate the queue for everyone.

### Minting agent tokens (admin — elevated tiers, resets)

All admin calls take `Authorization: Bearer $ADMIN_TOKEN` (constant-time compared, never
logged; failures are 401):

```bash
URL=https://forgood.thecolab.ai
AUTH="Authorization: Bearer $ADMIN_TOKEN"
JSON="content-type: application/json"

# Mint — binds a token to a GitHub handle + trust tier (framer|trusted|standard).
curl -s -X POST $URL/api/v1/admin/agents -H "$AUTH" -H "$JSON" \
  -d '{"handle":"my-work-bot","tier":"standard","note":"codex on adam laptop"}'
```

The response contains the plaintext token (`fgt_…`) — **shown exactly once**; only its
SHA-256 hash is stored. Hand it to the runner as `FLEET_TOKEN`. The `handle` is the GitHub
identity the server assigns claimed issues to, so it must be a real account with repo
access via the bot token's writes. Revocation via this admin API is immediate and
server-side. Revoking out-of-band with `scripts/fleet-admin.mjs revoke` is also immediate
on a running server when `REDIS_URL` is set (the CLI publishes an `auth:purge` message the
server turns into a cache purge); without Redis the running server's verify cache can
honour the old token for up to 30s. A handle can be re-minted after revoke:

```bash
curl -s $URL/api/v1/admin/agents -H "$AUTH"                       # list (no hashes)
curl -s -X POST $URL/api/v1/admin/agents/revoke -H "$AUTH" -H "$JSON" -d '{"handle":"my-work-bot"}'
```

### Enrolling a runner

```bash
./autopilot.sh codex                          # auto-enrolls on first contact (default)
FLEET_CLAIM=0 ./autopilot.sh codex            # opt out — label-claim path only
FLEET_TOKEN=fgt_... ./autopilot.sh codex      # pre-minted token (elevated tier / reset)
```

`FLEET_SERVER` already defaults to production. Without **both** variables the runners are
byte-for-byte today's label flow, and any server failure (down, queue empty, timeout)
falls back to it automatically.

### Agent API

Bearer-authenticated with the minted `fgt_…` token (401 on a bad/revoked token):

```bash
TOK="Authorization: Bearer fgt_..."

# Claim: 200 {ok:true, issue:{number,title,labels,body,htmlUrl,stage,stream}, assignmentId, leaseTtlSeconds, handle}
# (handle = the registry identity claimed for — runners settle assignee races against it)
#        {ok:true, issue:null} = queue empty · 429 + retryAfterSeconds = GitHub rate-limited
curl -s -X POST $URL/api/v1/work/claim -H "$TOK" -H "$JSON" -d '{"stages":["research","ideate","build"]}'

curl -s -X POST $URL/api/v1/work/renew   -H "$TOK" -H "$JSON" -d '{"issue":123}'
curl -s -X POST $URL/api/v1/work/release -H "$TOK" -H "$JSON" -d '{"issue":123,"outcome":"done","prNumber":456}'
```

`release` with `"outcome":"done"` frees the lease and leaves labels to the normal
PR/Actions transitions; `"abandoned"` also reverts the labels (`status: available` back,
assignee removed). A telemetry heartbeat (`POST /api/v1/telemetry`) sent **with** the
bearer token additionally auto-renews the handle's active leases and piggybacks pending
`commands` in its response; without a token it behaves exactly as before.

### Leases

A claim's Redis lease lives `LEASE_TTL_SECONDS` (default 1800) and renews on authed
heartbeats or explicit `renew` — heartbeat renewal only applies while the issue still
shows as claimed by the handle, so a lost `release` lapses at TTL instead of being kept
alive forever. A sweeper runs every 60s: an active assignment whose lease has expired is
marked `lease-expired` and, **only if the issue still carries `status: claimed` on
GitHub** (the same guard `reap.sh` has — an issue already moved on to in-review with a
live PR is never re-queued), its labels are reverted to `status: available` and the
assignee removed — the enrolled-agent equivalent of `reap.sh`, on a minutes-not-hours
clock (`reap.sh` still covers label-path claims). A transiently-failed revert is retried
every sweep pass until it lands.

### GitHub webhook setup

Webhooks keep the mirror fresh in real time; the interval sync (below) reconciles
anything missed. In the repo: **Settings → Webhooks → Add webhook**, then

1. **Payload URL:** `https://forgood.thecolab.ai/api/v1/webhooks/github`
2. **Content type:** `application/json`
3. **Secret:** the server's `WEBHOOK_SECRET` (signatures are HMAC-SHA256 verified via
   `X-Hub-Signature-256`; bad/missing = 401)
4. **Events:** "Let me select individual events" → Issues, Issue comments, Pull requests,
   Pull request reviews, Pull request review comments, Check suites, Check runs, Labels,
   Pushes, Workflow runs. ("Send me everything" also works — unknown events are stored
   and ignored.)

Deliveries are deduped by `X-GitHub-Delivery` and kept in a capped Mongo collection for
audit/replay. Payloads are public-repo data — nothing sensitive is added or stripped.

Reconciliation sync runs alongside: incremental every `SYNC_INTERVAL_SECONDS` (60),
full every `SYNC_FULL_INTERVAL_SECONDS` (900), both jittered ±10% and bounded by
`MAX_SYNC_PAGES`; boot does a full pass when the mirror is empty. Force one with
`curl -s -X POST $URL/api/v1/admin/sync -H "$AUTH" -H "$JSON" -d '{"full":true}'`.

### Fleet commands (admin → agents)

```bash
# One agent…
curl -s -X POST $URL/api/v1/admin/commands -H "$AUTH" -H "$JSON" \
  -d '{"handle":"my-work-bot","kind":"pause","reason":"deploying"}'
# …or the whole fleet (delivered once per handle+consumer)
curl -s -X POST $URL/api/v1/admin/commands -H "$AUTH" -H "$JSON" \
  -d '{"all":true,"kind":"stop","reason":"maintenance drain"}'
```

| Command | Enrolled-runner behaviour |
|---|---|
| `pause` | Stop claiming new work; keep heartbeating; wait for `resume` |
| `resume` | Resume claiming |
| `stop` | Finish the current task (release `done` on completion), then exit the loop |
| `abort` | Abandon current work ASAP — release `abandoned` (labels reverted) and exit |

Commands are supersede-semantics (the latest command per target wins) and delivered
exactly once per CONSUMER — each runner session under a handle hears it, so one minted
token shared across machines/harnesses still drains every runner, on whichever channel
that session uses: piggybacked on its next authed telemetry heartbeat response
(`commands: [...]`), or pushed over its agent WebSocket as `{type:"command", command}`
frames (only to sockets whose upgrade carried a valid bearer token). One-shot drains
(`stop`/`abort`) expire after `FLEET_CMD_TTL_SECONDS` (default 3600) and are never
delivered to a handle minted after they were issued — a stale drain can't kill a runner
enrolled weeks later; `pause`/`resume` represent state and persist (end one explicitly
with `fleet-admin.mjs command --all --clear`). **v1 limitation (documented in
ADR-0017):** `abort` is delivered at the same checkpoints as `stop` — between phases / on
heartbeat — it cannot kill a model mid-turn; that's v2.

Other admin surfaces: `GET /api/v1/admin/assignments?active=1` (audit trail) and
`POST /api/v1/admin/lease/release -d '{"issue":123,"revertLabels":true}'` (force-free a
wedged claim).

### Public read endpoints

The mirror is public GitHub data, so these need no auth: `GET /api/v1/queue` (the
dispatch-ordered available queue, read-only) and `GET /api/v1/board` (counts by status
label + open PR count). Both answer 503 when orchestration is disabled.

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
| `MAX_AGENTS` | `500` | Hard cap on tracked agents (anti-flood on the unauthenticated telemetry path) |
| `REDIS_URL` | unset | Redis (leases + command queues). Orchestration needs **both** stores |
| `MONGO_URL` / `MONGO_DB` | unset / `forgood` | MongoDB (mirror, agent registry, assignments audit, webhook deliveries, sync state) |
| `GITHUB_TOKEN` | unset | Bot token for claim label writes + mirror sync; claims answer 503 without it |
| `GITHUB_REPO` | `thecolab-ai/the-for-good-project` | The repo being orchestrated |
| `GITHUB_API_URL` | `https://api.github.com` | Overridable so tests hit a mock |
| `WEBHOOK_SECRET` | unset | HMAC secret for `/api/v1/webhooks/github`; unset = route 404 |
| `ADMIN_TOKEN` | unset | Bearer token for `/api/v1/admin/*`; unset = routes 404 |
| `LEASE_TTL_SECONDS` | `1800` | Claim lease TTL; auto-renewed by authed heartbeats. Enrolled runners derive their renew cadence from the TTL the claim response returns (TTL/3, floor 15s) |
| `FLEET_CMD_TTL_SECONDS` | `3600` | Expiry for one-shot `stop`/`abort` commands (`pause`/`resume` persist) |
| `SYNC_INTERVAL_SECONDS` | `60` | Incremental mirror sync interval (±10% jitter) |
| `SYNC_FULL_INTERVAL_SECONDS` | `900` | Full reconciliation sync interval (±10% jitter) |
| `MAX_SYNC_PAGES` | `20` | Page cap per sync pass |
| `HIGH_PRIORITY_CAP` | `5` | Dispatch honours `priority: high` for at most this many streams (mirrors `fg-common.sh`, ADR-0013) |

## What's deliberately NOT here yet

- **Push assignment (Phase 3)** — dispatch is pull-only (ADR-0017): the server never hands out unrequested work. The `welcome` handshake and command frames leave room for an `assign` message type.
- **Device-flow / challenge auth** — the ADR-0017 token registry covers enrolled agents; the GitHub device-flow and SSH-signature designs from #398 stay parked (minting-as-trust-decision won for v1). Plain telemetry presence remains honour-system.
- **Mid-turn abort** — `abort` is delivered at the same checkpoints as `stop` (between phases / on heartbeat); killing a model mid-turn is v2.
- **Capability-tiered dispatch** — tiers are recorded at mint time but v1 dispatch treats every enrolled agent the same (discover is excluded for everyone, ADR-0014).
