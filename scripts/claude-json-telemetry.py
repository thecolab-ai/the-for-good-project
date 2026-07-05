#!/usr/bin/env python3
"""Bridge `claude -p --output-format stream-json` into human logs + live fleet
telemetry.

Plain `claude -p` buffers everything and prints only the final result — a
worker looks hung for the whole run ("Handing #NNN to claude…" then silence)
and reports nothing. The stream-json feed emits every assistant message and
tool use as it happens, WITH per-message token usage — so this filter renders
readable progress lines and posts live tool/token telemetry to the fleet
server (issue #398), no transcript tailing needed.

Symmetric with scripts/codex-json-telemetry.py; wired by run_agent in
scripts/fg-common.sh whenever FLEET_SERVER is set.
"""
from __future__ import annotations

import json
import os
import sys
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
HARNESS = env("AGENT") or "claude"
MODEL = env("FLEET_MODEL") or env("MODEL") or "claude"
TASK_KIND = env("FLEET_TASK_KIND") or "work"
TASK_REF = env("TASK_REF")
TASK_TITLE = env("TASK_TITLE") or "claude turn"
STREAM_LOGS = env("STREAM_LOGS") == "1"
# Cloudflare's bot protection 403s default client user-agents on the
# tunnelled fleet server — an honest custom UA passes.
USER_AGENT = "forgood-fleet-telemetry/1.0 (+https://github.com/thecolab-ai/the-for-good-project)"

# Generation-time clock: reset on EVERY stream event, so the elapsed time
# attributed to an assistant message runs from the previous event (usually the
# tool result going back in) to the message completing — i.e. API latency +
# actual generation. Charging wall-clock-since-last-post instead diluted a
# 30-token message after a 60s bash run down to ~0.5 tok/s, which is not what
# anyone means by "speed".
_last_event_mono = time.monotonic()

# The stream's per-message usage.output_tokens is a message-START stub (often
# literally 1) — only the final `result` event carries the real output total.
# So per message we ESTIMATE output from the content we just printed (live
# TPS), keep a ledger of what we've posted, and settle the exact remainder
# when `result` arrives. Input-side numbers on assistant events are real.
_est_out_posted = 0


def estimate_output_tokens(message: dict[str, Any]) -> int:
    chars = 0
    for block in message.get("content") or []:
        if not isinstance(block, dict):
            continue
        if block.get("type") == "text":
            chars += len(str(block.get("text") or ""))
        elif block.get("type") == "tool_use":
            try:
                chars += len(json.dumps(block.get("input") or {})) + 20
            except (TypeError, ValueError):
                chars += 40
    return max(3, round(chars / 4))


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
    if not FLEET_SERVER:
        return
    numeric_total = sum(int(v or 0) for v in heartbeat.values() if isinstance(v, int))
    if numeric_total == 0 and not heartbeat.get("tools"):
        return
    body: dict[str, Any] = {
        "handle": HANDLE,
        "harness": HARNESS,
        "model": MODEL,
        "version": "claude-json-telemetry",
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
        return  # telemetry must never break a worker


def post_logs(lines: list[str]) -> None:
    if not FLEET_SERVER or not STREAM_LOGS or not lines:
        return
    agent_id = read_agent_id()
    if not agent_id:
        return
    data = json.dumps(
        {"agentId": agent_id, "lines": [line[:2000] for line in lines[-20:]]},
        separators=(",", ":"),
    ).encode("utf-8")
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


def post_tokens(tokens_in: int, tokens_out: int, elapsed_ms: int) -> None:
    """Per-message usage deltas over the message's own generation window.
    Cache reads are excluded by the caller."""
    if tokens_in <= 0 and tokens_out <= 0:
        return
    post_telemetry({"tokensIn": tokens_in, "tokensOut": tokens_out, "elapsedMs": max(1, elapsed_ms)})


def handle_assistant(message: dict[str, Any], elapsed_ms: int) -> None:
    lines: list[str] = []
    for block in message.get("content") or []:
        if not isinstance(block, dict):
            continue
        if block.get("type") == "text" and str(block.get("text") or "").strip():
            text = str(block["text"])
            print(text, flush=True)
            lines.extend(line for line in text.splitlines() if line.strip())
        elif block.get("type") == "tool_use":
            name = str(block.get("name") or "unknown")[:64]
            detail = ""
            tool_input = block.get("input")
            if isinstance(tool_input, dict):
                detail = str(tool_input.get("command") or tool_input.get("url") or tool_input.get("query") or "")[:120]
            line = f"[claude tool] {name}{': ' + detail if detail else ''}"
            print(line, flush=True)
            lines.append(line)
            post_telemetry({"toolCalls": 1, "tools": {name: 1}})
    usage = message.get("usage")
    if isinstance(usage, dict):
        global _est_out_posted
        # Cache reads excluded — fresh input + cache writes + output only,
        # matching the claude-code hook client and the dashboard's meaning of
        # "intelligence at work".
        tokens_in = int(usage.get("input_tokens") or 0) + int(usage.get("cache_creation_input_tokens") or 0)
        tokens_out = estimate_output_tokens(message)
        _est_out_posted += tokens_out
        post_tokens(tokens_in, tokens_out, elapsed_ms)
    post_logs(lines)


def main() -> int:
    global MODEL, _last_event_mono
    for raw in sys.stdin:
        raw = raw.strip()
        if not raw:
            continue
        try:
            event = json.loads(raw)
        except json.JSONDecodeError:
            print(raw, flush=True)
            continue
        now = time.monotonic()
        elapsed_ms = int((now - _last_event_mono) * 1000)
        _last_event_mono = now
        typ = event.get("type")
        if typ == "system" and event.get("subtype") == "init":
            if event.get("model"):
                MODEL = str(event["model"])
            print(f"[claude session] model={MODEL} session={event.get('session_id', '')[:8]}", flush=True)
        elif typ == "assistant" and isinstance(event.get("message"), dict):
            handle_assistant(event["message"], elapsed_ms)
        elif typ == "result":
            usage = event.get("usage")
            if isinstance(usage, dict):
                iterations = usage.get("iterations")
                if isinstance(iterations, list) and iterations:
                    actual_out = sum(int(it.get("output_tokens") or 0) for it in iterations if isinstance(it, dict))
                else:
                    actual_out = int(usage.get("output_tokens") or 0)
                settle = actual_out - _est_out_posted
                if settle > 0:
                    post_tokens(0, settle, elapsed_ms)
            cost = event.get("total_cost_usd")
            print(
                f"[claude result] {event.get('subtype', '')} turns={event.get('num_turns', '?')}"
                f"{f' cost=${cost:.4f}' if isinstance(cost, (int, float)) else ''}",
                flush=True,
            )
            text = str(event.get("result") or "")
            if text.strip() and event.get("is_error"):
                print(text, flush=True)
        elif typ == "error":
            print(f"[claude error] {event.get('message') or event}", file=sys.stderr, flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
