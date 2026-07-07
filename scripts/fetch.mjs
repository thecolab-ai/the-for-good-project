#!/usr/bin/env node
// fetch.mjs — the ADR-0006 fetch ladder in one command.
//
// Fetching a source (to read it, or to verify a citation) should never be raw
// `curl`: a big share of the official NZ sites we cite return 403 to non-browser
// clients or 404 to curl while resolving fine in a real browser (ADR-0006). This
// runs the browser side of the ladder and tells you HOW it fetched:
//
//   1. plain HTTP        (fast; a browser-shaped User-Agent)
//   2. rotating proxy    (retry through FETCH_PROXY — a fresh IP per try clears
//                         IP-reputation blocks; only runs if FETCH_PROXY is set)
//   3. cloak-fetch.mjs   (stealth Chromium, JS + cookies + WAFs, also through
//                         FETCH_PROXY — the gates the others can't clear)
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

// A rendered not-found page: a branded 404 still has readable text, so length
// alone can't catch it. Used as a backup when a browser rung can't give us the
// real HTTP status; the short-length guard avoids firing on a long real article
// that merely quotes "page not found".
const NOTFOUND = /\b(?:404 (?:error|not found)|page not found|page (?:you (?:requested|were looking for)|isn'?t here|does not exist|doesn'?t exist|cannot be found|can'?t be found)|this page does not exist|no longer exists|error 404)\b/i;

const clip = (s) => (s.length > MAX ? s.slice(0, MAX) + "\n…[truncated — raise MAX_CHARS]" : s);
const clean = (s) => (s || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();

// Enough real text to count as a successful fetch (a challenge page is short).
const looksReal = (text) => clean(text).length >= 200 && !CHALLENGE.test(text);

// A browser-rendered not-found page (used when no real HTTP status is available).
const looksNotFound = (text) => { const c = clean(text); return NOTFOUND.test(c) && c.length < 1500; };

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

// ---- Rung 2: rotating proxy + retry (ADR-0006) -----------------------------
// A big share of official NZ sources sit behind Incapsula/Cloudflare that block
// by IP reputation. A ROTATING proxy gives a fresh IP per request, so retrying
// through it clears those blocks probabilistically (some rotated IPs are clean).
// Only runs when FETCH_PROXY (or HTTPS_PROXY) is set. curl reads the proxy from
// the ENV — never argv — so the credential never lands in `ps`/shell history.
function proxiedRung() {
  const proxy = process.env.FETCH_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy || "";
  if (!proxy) return { ok: false, unavailable: true, note: "no FETCH_PROXY set" };
  const tries = Math.max(1, Number(process.env.PROXY_RETRIES || 4));
  const env = { ...process.env, ALL_PROXY: proxy, https_proxy: proxy, http_proxy: proxy, HTTPS_PROXY: proxy, HTTP_PROXY: proxy };
  let lastStatus = 0;
  for (let i = 0; i < tries; i++) {
    const r = spawnSync(
      "curl",
      ["-sS", "-L", "-A", UA, "-m", "25", "-H", "Accept: text/html,application/json,*/*", "-w", "\n#HTTP_STATUS:%{http_code}", url],
      { encoding: "utf8", timeout: 30000, maxBuffer: 24 * 1024 * 1024, env },
    );
    const out = r.stdout || "";
    const m = /\n#HTTP_STATUS:(\d+)\s*$/.exec(out);
    const status = m ? Number(m[1]) : 0;
    const body = m ? out.slice(0, m.index) : out;
    lastStatus = status || lastStatus;
    if (status === 404 || status === 410) return { ok: false, status, dead: true };
    if (status >= 200 && status < 400 && looksReal(body))
      return { ok: true, status, text: body, note: `rotating proxy, attempt ${i + 1}/${tries}` };
    // else: blocked/challenge on this IP — the next iteration rotates to a new one
  }
  return { ok: false, status: lastStatus || undefined, blocked: true, note: `${tries} rotated IPs, still blocked/challenged` };
}

// ---- Rung 3: cloak-fetch.mjs (stealth Chromium — through the proxy too) -----
function cloakRung() {
  const r = spawnSync("node", [path.join(here, "cloak-fetch.mjs"), url], {
    encoding: "utf8",
    timeout: 90000,
    env: { ...process.env, MAX_CHARS: String(MAX) },
  });
  const out = r.stdout || "";
  if (/cloakbrowser isn't installed/i.test(r.stderr || ""))
    return { ok: false, unavailable: true, note: "cloakbrowser not installed" };
  // cloak-fetch prints a `# status: <n>` line — the AUTHORITATIVE signal. A branded
  // 404 renders readable text, so we must trust the real HTTP status over looksReal.
  const m = /^# status:\s*(\d+)/m.exec(out);
  const status = m ? Number(m[1]) : 0;
  if (status === 404 || status === 410) return { ok: false, status, dead: true };
  if (r.status === 0 && looksReal(out) && !looksNotFound(out)) return { ok: true, text: out };
  // No status parsed (older cloak) but the page reads as not-found → dead.
  if (looksNotFound(out)) return { ok: false, dead: true };
  return { ok: false, status: status || undefined, blocked: true, note: (r.stderr || "").trim().split("\n")[0] };
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
  ["plain HTTP", httpRung, false],
  ["rotating proxy (retry)", proxiedRung, false],
  ["cloak-fetch (stealth Chromium)", cloakRung, true],
];

// DEAD (exit 4) requires a BROWSER to have rendered a not-found page. A plain-HTTP
// 404 alone is NOT enough — ADR-0006's whole premise is that curl 404s on pages
// that resolve in a browser, so an HTTP-only 404 with no browser confirmation is
// UNVERIFIED (exit 3), never DEAD.
let browserConfirmedDead = false;
let httpDead = false;
const tried = [];

for (const [name, run, isBrowser] of ladder) {
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
  if (r.dead && isBrowser) browserConfirmedDead = true;
  if (r.dead && !isBrowser) httpDead = true;
  tried.push(`${name}: ${r.unavailable ? "unavailable" : r.dead ? "404/not-found" : "blocked"}${r.status ? ` (HTTP ${r.status})` : ""}${r.note ? ` — ${r.note}` : ""}`);
}

// Every rung failed. Classify per ADR-0006 §2.
console.error(`✗ Could not fetch ${url}`);
for (const t of tried) console.error(`  - ${t}`);
if (browserConfirmedDead) {
  console.error(
    "\nClassification: DEAD — a real browser rendered a 404/not-found page. This is a genuine dead-link defect."
  );
  process.exit(4);
}
if (httpDead) {
  // HTTP said 404 but no browser could confirm it (they were unavailable or
  // blocked). This is exactly the case ADR-0006 warns about — do NOT call it dead.
  console.error(
    "\nClassification: UNVERIFIED — plain HTTP returned 404, but no browser rung could confirm it\n" +
      "(browser rungs unavailable or blocked). curl 404s on pages that load in a browser, so this is\n" +
      "NOT a confirmed dead link. Install the browser rungs (npm install && npx cloakbrowser install)\n" +
      `or open it in a normal browser before concluding. Try a snapshot: node scripts/archive-cite.mjs "${url}"`
  );
  process.exit(3);
}
console.error(
  "\nClassification: BLOCKED (tooling / IP) — 403 / bot-challenge / timeout, NOT a citation defect.\n" +
    "Do NOT flag the citation dead on this. Try a Wayback snapshot (node scripts/archive-cite.mjs \"" +
    url +
    "\"), residential egress, or a normal browser."
);
process.exit(3);
