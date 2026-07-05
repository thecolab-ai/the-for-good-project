#!/usr/bin/env python3
"""Bridge `codex exec --json` events into human logs + fleet token telemetry.

Codex's notify hook is turn-level only and does not expose token deltas, but
`codex exec --json` emits `turn.completed` events with usage. This filter keeps
runner output readable while sending those usage deltas to the fleet server.
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
HARNESS = env("AGENT") or "codex"
MODEL = env("FLEET_MODEL") or env("MODEL") or "codex"
TASK_KIND = env("FLEET_TASK_KIND") or "work"
TASK_REF = env("TASK_REF")
TASK_TITLE = env("TASK_TITLE") or "codex turn"
STREAM_LOGS = env("STREAM_LOGS") == "1"
START_MONO = time.monotonic()
last_usage_total = 0
last_usage_mono = START_MONO


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
        headers={"content-type": "application/json"},
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
        headers={"content-type": "application/json"},
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
    elif typ in {"tool_call", "function_call"}:
        name = item.get("name") or item.get("command") or item.get("tool") or "unknown"
        if name:
            line = f"[codex tool] {name}"
            print(line, flush=True)
            lines.append(line)
            post_telemetry({"toolCalls": 1, "tools": {str(name)[:64]: 1}})
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
        if typ == "item.completed" and isinstance(event.get("item"), dict):
            post_logs(print_item(event["item"]))
        elif typ == "turn.completed" and isinstance(event.get("usage"), dict):
            global last_usage_total, last_usage_mono
            usage = event["usage"]
            ti = int(usage.get("input_tokens") or 0)
            to = int(usage.get("output_tokens") or 0)
            cached = int(usage.get("cached_input_tokens") or 0)
            reasoning = int(usage.get("reasoning_output_tokens") or 0)
            total = ti + to
            now = time.monotonic()
            elapsed_ms = max(1, int((now - last_usage_mono) * 1000))
            delta_total = max(0, total - last_usage_total)
            if delta_total > 0:
                # Codex reports cumulative turn/session usage. Send only the
                # new token delta and the elapsed wall time since the previous
                # usage sample, otherwise the fleet dashboard treats the whole
                # run as a one-minute burst and prints silly TPS.
                if total > 0:
                    delta_in = max(0, round(delta_total * (ti / total)))
                else:
                    delta_in = 0
                delta_out = max(0, delta_total - delta_in)
                post_telemetry({"tokensIn": delta_in, "tokensOut": delta_out, "elapsedMs": elapsed_ms})
            last_usage_total = max(last_usage_total, total)
            last_usage_mono = now
            print(
                f"[codex usage] total_input={ti} cached={cached} total_output={to} reasoning={reasoning} delta={delta_total} elapsed_ms={elapsed_ms}",
                flush=True,
            )
        elif typ == "error":
            print(f"[codex error] {event.get('message') or event}", file=sys.stderr, flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
