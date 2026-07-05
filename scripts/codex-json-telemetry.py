#!/usr/bin/env python3
"""Bridge `codex exec --json` events into human logs + fleet token telemetry.

Codex's notify hook is turn-level only and does not expose token deltas, but
`codex exec --json` emits `turn.completed` events with usage. This filter keeps
runner output readable while sending those usage deltas to the fleet server.
"""
from __future__ import annotations

import glob
import json
import os
import sys
import threading
import urllib.error
import urllib.request
import time
from pathlib import Path
from typing import Any


def env(name: str, default: str = "") -> str:
    return os.environ.get(name, default)


FLEET_SERVER = env("FLEET_SERVER").rstrip("/")
AGENT_ID_FILE = env("FLEET_AGENT_ID_FILE")
HANDLE = env("FLEET_HANDLE") or env("HANDLE") or env("USER") or "unknown"
HARNESS = env("AGENT") or "codex"
MODEL = env("FLEET_MODEL") or env("MODEL") or "codex"
TASK_KIND = env("FLEET_TASK_KIND") or "work"
TASK_REF = env("TASK_REF")
TASK_TITLE = env("TASK_TITLE") or "codex turn"
STREAM_LOGS = env("STREAM_LOGS") == "1"
# Cloudflare's bot protection 403s python-urllib's default user-agent (curl
# passes), silently eating every token post to the tunnelled fleet server —
# any honest custom UA gets through.
USER_AGENT = "forgood-fleet-telemetry/1.0 (+https://github.com/thecolab-ai/the-for-good-project)"


def hooks_own_telemetry() -> bool:
    """True when the codex fleet hook (server/clients/codex-hook.mjs) is wired
    into the Codex config — it then owns token/tool telemetry (with live
    mid-run deltas from the transcript), and this bridge must not double-post.
    The bridge keeps printing human-readable output and streaming logs.
    Override with FG_CODEX_BRIDGE_TELEMETRY=1 to force bridge posts anyway."""
    if env("FG_CODEX_BRIDGE_TELEMETRY") == "1":
        return False
    codex_home = Path(env("CODEX_HOME") or Path.home() / ".codex")
    for cfg in (
        codex_home / "hooks.json",
        codex_home / "config.toml",
        Path.cwd() / ".codex" / "hooks.json",
        Path.cwd() / ".codex" / "config.toml",
    ):
        try:
            if "codex-hook.mjs" in cfg.read_text(encoding="utf-8"):
                return True
        except OSError:
            continue
    return False


HOOKS_OWN_TELEMETRY = hooks_own_telemetry()
START_MONO = time.monotonic()

# ---------------------------------------------------------------------------
# Live token streaming. The exec --json stream only reports usage at
# turn.completed — for a 30-minute run that is one burst every 30 minutes and
# the dashboard reads "no tokens flowing". But Codex continuously appends
# cumulative `token_count` events to its rollout transcript, so a background
# poller tails the transcript (located from `thread.started`'s thread id) and
# posts token DELTAS every few seconds — a real live feed.

TRANSCRIPT_POLL_S = float(env("FG_TOKEN_POLL_SECONDS") or 5)
_cum_lock = threading.Lock()
_cum_in = 0  # fresh input (input - cached) already posted
_cum_out = 0
_last_post_mono = START_MONO
_transcript_path: str | None = None
_transcript_offset = 0
_thread_id = ""


def _find_transcript() -> str | None:
    global _transcript_path
    if _transcript_path or not _thread_id:
        return _transcript_path
    home = env("CODEX_HOME") or str(Path.home() / ".codex")
    hits = glob.glob(f"{home}/sessions/*/*/*/rollout-*-{_thread_id}.jsonl")
    if hits:
        _transcript_path = max(hits)
    return _transcript_path


def _post_cumulative(fresh_in: int, out_tok: int) -> None:
    """Post only the movement since the last post, with real elapsed wall
    time so the fleet TPS gauge reflects an actual rate."""
    global _cum_in, _cum_out, _last_post_mono
    with _cum_lock:
        d_in = max(0, fresh_in - _cum_in)
        d_out = max(0, out_tok - _cum_out)
        if d_in == 0 and d_out == 0:
            return
        _cum_in = max(_cum_in, fresh_in)
        _cum_out = max(_cum_out, out_tok)
        now = time.monotonic()
        elapsed_ms = max(1, int((now - _last_post_mono) * 1000))
        _last_post_mono = now
    post_telemetry({"tokensIn": d_in, "tokensOut": d_out, "elapsedMs": elapsed_ms})


def _read_transcript_once() -> None:
    global _transcript_offset
    path = _find_transcript()
    if not path:
        return
    try:
        with open(path, encoding="utf-8", errors="replace") as f:
            f.seek(_transcript_offset)
            chunk = f.read()
            end = f.tell()
    except OSError:
        return
    # Never consume a partial trailing line — the writer may be mid-append.
    nl = chunk.rfind("\n")
    if nl < 0:
        return
    _transcript_offset = end - (len(chunk) - nl - 1)
    latest = None
    for line in chunk[: nl + 1].splitlines():
        if '"token_count"' not in line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        usage = ((obj.get("payload") or {}).get("info") or {}).get("total_token_usage")
        if isinstance(usage, dict):
            latest = usage
    if latest:
        fresh = max(0, int(latest.get("input_tokens") or 0) - int(latest.get("cached_input_tokens") or 0))
        _post_cumulative(fresh, int(latest.get("output_tokens") or 0))


def _transcript_poller() -> None:
    while True:
        time.sleep(TRANSCRIPT_POLL_S)
        try:
            _read_transcript_once()
        except Exception:  # noqa: BLE001 — telemetry must never kill the pipe
            pass


def start_token_stream(thread_id: str) -> None:
    global _thread_id
    if not thread_id or _thread_id:
        return
    _thread_id = thread_id
    threading.Thread(target=_transcript_poller, daemon=True, name="fg-token-poll").start()


def read_agent_id() -> str:
    if not AGENT_ID_FILE:
        return ""
    try:
        return Path(AGENT_ID_FILE).read_text(encoding="utf-8").strip()
    except OSError:
        return ""


def write_agent_id(agent_id: str) -> None:
    if not AGENT_ID_FILE or not agent_id:
        return
    try:
        Path(AGENT_ID_FILE).write_text(agent_id, encoding="utf-8")
    except OSError:
        pass


def post_telemetry(heartbeat: dict[str, Any]) -> None:
    if not FLEET_SERVER or HOOKS_OWN_TELEMETRY:
        return
    # Only send a heartbeat when there is real movement. This prevents no-op
    # malformed events from refreshing presence as fake activity.
    numeric_total = sum(int(v or 0) for v in heartbeat.values() if isinstance(v, int))
    if numeric_total == 0 and not heartbeat.get("tools"):
        return

    body: dict[str, Any] = {
        "handle": HANDLE,
        "harness": HARNESS,
        "model": MODEL,
        "version": "codex-json-telemetry",
        "task": {"kind": TASK_KIND},
        "heartbeat": heartbeat,
    }
    if TASK_REF:
        body["task"]["ref"] = TASK_REF[:32]
    if TASK_TITLE:
        body["task"]["title"] = TASK_TITLE[:300]
    agent_id = read_agent_id()
    if agent_id:
        body["agentId"] = agent_id

    data = json.dumps(body, separators=(",", ":")).encode("utf-8")
    req = urllib.request.Request(
        f"{FLEET_SERVER}/api/v1/telemetry",
        data=data,
        headers={"content-type": "application/json", "user-agent": USER_AGENT},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=3) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
            if isinstance(payload, dict) and isinstance(payload.get("agentId"), str):
                write_agent_id(payload["agentId"])
    except (OSError, urllib.error.URLError, json.JSONDecodeError):
        # Telemetry must never break a worker.
        return


def post_logs(lines: list[str]) -> None:
    if not FLEET_SERVER or not STREAM_LOGS or not lines:
        return
    agent_id = read_agent_id()
    if not agent_id:
        return
    data = json.dumps({"agentId": agent_id, "lines": [line[:2000] for line in lines[-20:]]}, separators=(",", ":")).encode("utf-8")
    req = urllib.request.Request(
        f"{FLEET_SERVER}/api/v1/logs",
        data=data,
        headers={"content-type": "application/json", "user-agent": USER_AGENT},
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=3).close()
    except (OSError, urllib.error.URLError):
        return


def print_item(item: dict[str, Any]) -> list[str]:
    lines: list[str] = []
    typ = item.get("type")
    if typ == "agent_message":
        text = item.get("text")
        if isinstance(text, str) and text.strip():
            print(text, flush=True)
            lines.extend([line for line in text.splitlines() if line.strip()])
    elif typ in {"tool_call", "function_call", "command_execution", "mcp_tool_call", "web_search"}:
        # Modern codex emits command_execution / mcp_tool_call / web_search
        # items (the legacy tool_call/function_call names never fire), so this
        # is also the mid-run presence heartbeat — without it a long codex run
        # looks offline on the dashboard between turn boundaries.
        if typ == "command_execution":
            name = "shell"
            detail = str(item.get("command") or "")[:120]
        elif typ == "mcp_tool_call":
            name = str(item.get("tool") or item.get("server") or "mcp")[:64]
            detail = ""
        elif typ == "web_search":
            name = "web_search"
            detail = str(item.get("query") or "")[:120]
        else:
            name = str(item.get("name") or item.get("command") or item.get("tool") or "unknown")[:64]
            detail = ""
        line = f"[codex tool] {name}{': ' + detail if detail else ''}"
        print(line, flush=True)
        lines.append(line)
        post_telemetry({"toolCalls": 1, "tools": {name: 1}})
    elif typ in {"tool_call_output", "function_call_output"}:
        text = item.get("text") or item.get("output")
        if isinstance(text, str) and text.strip():
            out = text.rstrip()
            print(out, flush=True)
            lines.extend([line for line in out.splitlines() if line.strip()][-20:])
    return lines


def main() -> int:
    for raw in sys.stdin:
        raw = raw.strip()
        if not raw:
            continue
        try:
            event = json.loads(raw)
        except json.JSONDecodeError:
            print(raw, flush=True)
            continue

        typ = event.get("type")
        if typ == "thread.started":
            start_token_stream(str(event.get("thread_id") or ""))
        elif typ == "item.completed" and isinstance(event.get("item"), dict):
            post_logs(print_item(event["item"]))
        elif typ == "turn.completed" and isinstance(event.get("usage"), dict):
            # Same cumulative ledger as the transcript poller, so the two
            # sources can never double-count — this just settles any tail the
            # last poll hadn't seen yet.
            usage = event["usage"]
            ti = int(usage.get("input_tokens") or 0)
            to = int(usage.get("output_tokens") or 0)
            cached = int(usage.get("cached_input_tokens") or 0)
            reasoning = int(usage.get("reasoning_output_tokens") or 0)
            _post_cumulative(max(0, ti - cached), to)
            print(
                f"[codex usage] total_input={ti} cached={cached} total_output={to} reasoning={reasoning}",
                flush=True,
            )
        elif typ == "error":
            print(f"[codex error] {event.get('message') or event}", file=sys.stderr, flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
