#!/usr/bin/env node
// fetch.mjs — the ADR-0006 fetch ladder in one command.
//
// Fetching a source (to read it, or to verify a citation) should never be raw
// `curl`: a big share of the official NZ sites we cite return 403 to non-browser
// clients or 404 to curl while resolving fine in a real browser (ADR-0006). This
// runs the browser side of the ladder and tells you HOW it fetched:
//
//   1. plain HTTP        (fast; a browser-shaped User-Agent)
//   2. agent-browser     (real Chrome: JS, redirects, cookies, most WAFs)
//   3. cloak-fetch.mjs   (stealth Chromium: the gates the others can't clear)
//
// If your agent harness has a built-in WebFetch/WebSearch tool, try THAT between
// plain curl and reaching for this script — it's more capable than curl and needs
// no browser. This is a subprocess and can't call that tool, so it only runs curl +
// the browser rungs; the WebFetch rung is yours to run (see AGENTS.md).
//
// It also CLASSIFIES a failure the way the review gate must (ADR-0006 §2):
//   - 404/410 everywhere, browser included  → genuinely DEAD (a real defect)
//   - 403 / bot-challenge / timeout / block  → likely TOOLING/IP, NOT a citation
//     defect. Never flag a citation dead on this alone.
//
// Usage:
//   node scripts/fetch.mjs "<url>"
//   node scripts/fetch.mjs --archive "<url>"   # on success, also snapshot to Wayback
//   node scripts/fetch.mjs --quiet "<url>"     # body only, no "fetched via" header
//   MAX_CHARS=40000 node scripts/fetch.mjs "<url>"
//
// Exit codes: 0 = fetched; 3 = blocked (tooling/IP — retry/escalate, do NOT call
// dead); 4 = genuinely dead (404). Non-zero is deliberately actionable.

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const MAX = Number(process.env.MAX_CHARS || 20000);
const args = process.argv.slice(2);
const archive = args.includes("--archive");
const quiet = args.includes("--quiet");
const url = args.find((a) => /^https?:\/\//.test(a));

if (!url) {
  console.error('usage: node scripts/fetch.mjs [--archive] [--quiet] "<http(s) url>"');
  process.exit(2);
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/125.0 Safari/537.36";

// Markers that mean "a bot wall rendered, not the real page" — treat as blocked,
// NOT as a successful read. Missing one of these is dangerous: it lets a
// challenge page pass as the real source (ADR-0006's mirror risk). These are
// specific enough not to fire on a legitimate page that merely mentions a CDN.
const CHALLENGE = /just a moment|checking your browser|cf-browser-verification|cf[-_]chl|incapsula|_incapsula_|access denied|enable javascript to|attention required|are you a human|unusual traffic|performing security verification|verify(?:ing)? you are (?:not a bot|human)|verifies you are not a bot|protect against malicious bots|ray id:|ddos protection by|request unsuccessful/i;

const clip = (s) => (s.length > MAX ? s.slice(0, MAX) + "\n…[truncated — raise MAX_CHARS]" : s);
const clean = (s) => (s || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();

// Enough real text to count as a successful fetch (a challenge page is short).
const looksReal = (text) => clean(text).length >= 200 && !CHALLENGE.test(text);

// ---- Rung 1: plain HTTP ----------------------------------------------------
async function httpRung() {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,*/*" },
      signal: AbortSignal.timeout(20000),
    });
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/pdf")) {
      // A PDF is real content but not text — hand off to the browser rungs which
      // render it, rather than dumping bytes.
      return { ok: false, status: res.status, note: "pdf — needs a rendering fetch" };
    }
    const body = await res.text();
    if (res.ok && looksReal(body)) return { ok: true, status: res.status, text: body };
    if (res.status === 404 || res.status === 410)
      return { ok: false, status: res.status, dead: true };
    return { ok: false, status: res.status, blocked: true };
  } catch (e) {
    return { ok: false, status: 0, blocked: true, note: e?.name || String(e) };
  }
}

// ---- Rung 2: agent-browser (real Chrome) -----------------------------------
function agentBrowserRung() {
  const run = (a) => spawnSync("agent-browser", a, { encoding: "utf8", timeout: 60000 });
  const probe = run(["--version"]);
  if (probe.error) return { ok: false, unavailable: true, note: "agent-browser not installed" };
  try {
    const opened = run(["open", url]);
    run(["wait", "3500"]); // let a JS/redirect bot-challenge auto-settle before reading
    // `get text body` returns the rendered body text.
    const got = run(["get", "text", "body"]);
    run(["close", "--all"]);
    const text = (got.stdout || "").trim();
    if (got.status === 0 && looksReal(text)) return { ok: true, text };
    // Detect a real "not found" page rendered in the browser.
    const combined = `${opened.stdout || ""}\n${text}`;
    if (/404|not found|page (you|isn'?t|cannot be found)/i.test(combined) && text.length < 1200)
      return { ok: false, dead: true };
    return { ok: false, blocked: true };
  } catch (e) {
    return { ok: false, blocked: true, note: e?.message || String(e) };
  }
}

// ---- Rung 3: cloak-fetch.mjs (stealth Chromium) ----------------------------
function cloakRung() {
  const r = spawnSync("node", [path.join(here, "cloak-fetch.mjs"), url], {
    encoding: "utf8",
    timeout: 90000,
    env: { ...process.env, MAX_CHARS: String(MAX) },
  });
  if (r.status === 0 && looksReal(r.stdout || "")) return { ok: true, text: r.stdout };
  if (/cloakbrowser isn't installed/i.test(r.stderr || ""))
    return { ok: false, unavailable: true, note: "cloakbrowser not installed" };
  return { ok: false, blocked: true, note: (r.stderr || "").trim().split("\n")[0] };
}

// ---- Wayback snapshot (shared with archive-cite.mjs) -----------------------
function snapshot() {
  const r = spawnSync("node", [path.join(here, "archive-cite.mjs"), url], {
    encoding: "utf8",
    timeout: 90000,
  });
  return (r.stdout || "").trim();
}

// ---- Drive the ladder ------------------------------------------------------
const ladder = [
  ["plain HTTP", httpRung],
  ["agent-browser (real Chrome)", agentBrowserRung],
  ["cloak-fetch (stealth Chromium)", cloakRung],
];

let sawDead = false;
const tried = [];

for (const [name, run] of ladder) {
  const r = await run();
  if (r.ok) {
    let snap = "";
    if (archive) snap = snapshot();
    if (!quiet) {
      console.log(`# fetched via ${name}`);
      if (snap) console.log(`# archived: ${snap}`);
      console.log("");
    }
    console.log(clip(clean(r.text)));
    process.exit(0);
  }
  if (r.dead) sawDead = true;
  tried.push(`${name}: ${r.unavailable ? "unavailable" : r.dead ? "404/dead" : "blocked"}${r.status ? ` (HTTP ${r.status})` : ""}${r.note ? ` — ${r.note}` : ""}`);
}

// Every rung failed. Classify per ADR-0006 §2.
console.error(`✗ Could not fetch ${url}`);
for (const t of tried) console.error(`  - ${t}`);
if (sawDead) {
  console.error(
    "\nClassification: DEAD — 404/not-found even in a real browser. This is a genuine dead-link defect."
  );
  process.exit(4);
}
console.error(
  "\nClassification: BLOCKED (tooling / IP) — 403 / bot-challenge / timeout, NOT a citation defect.\n" +
    "Do NOT flag the citation dead on this. Try a Wayback snapshot (node scripts/archive-cite.mjs \"" +
    url +
    "\"), residential egress, or a normal browser."
);
process.exit(3);
