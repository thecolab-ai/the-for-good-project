#!/usr/bin/env node
// archive-cite.mjs — capture (or find) a Wayback Machine snapshot for a URL.
//
// ADR-0006 §3 (archive on cite): when a finding cites a fragile, bot-protected,
// or date-stamped source, also capture a web-archive snapshot so the citation
// stays verifiable and the reader has a stable copy. This prints the snapshot
// URL on stdout (paste it next to the live link in the finding); progress and
// errors go to stderr, so it composes in a pipeline.
//
// By default it REUSES a recent existing snapshot if one is <180 days old, and
// only asks the Wayback Machine to capture a fresh one otherwise — capture is
// slow and rate-limited, so we don't re-snapshot needlessly.
//
// Usage:
//   node scripts/archive-cite.mjs "<url>"
//   node scripts/archive-cite.mjs --fresh "<url>"      # force a new capture
//   node scripts/archive-cite.mjs --max-age-days 30 "<url>"
//
// Exit codes: 0 = a snapshot URL was printed; 1 = no snapshot (capture failed
// and none existed). A capture failure is usually Wayback rate-limiting, not a
// problem with your URL — try again shortly.

const args = process.argv.slice(2);
const fresh = args.includes("--fresh");
const maxAgeIdx = args.indexOf("--max-age-days");
const MAX_AGE_DAYS = maxAgeIdx >= 0 ? Number(args[maxAgeIdx + 1]) : 180;
const url = args.find((a) => /^https?:\/\//.test(a));

if (!url) {
  console.error('usage: node scripts/archive-cite.mjs [--fresh] [--max-age-days N] "<http(s) url>"');
  process.exit(2);
}

const snapAge = (ts) => {
  // Wayback timestamp: YYYYMMDDhhmmss (UTC). Return age in days, or Infinity.
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(ts || "");
  if (!m) return Infinity;
  const [, y, mo, d, h, mi, s] = m;
  const when = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
  return (Date.now() - when) / 86400000;
};

// Most-recent existing snapshot. Uses the CDX API (deterministic) with a retry,
// then falls back to the availability API — which is convenient but flaky, so
// it's the backup, not the primary.
async function existing() {
  // CDX: newest 200-status capture. Rows: [urlkey, timestamp, original, ...].
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(
        `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&filter=statuscode:200&limit=-1`,
        { signal: AbortSignal.timeout(20000) }
      );
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 1) {
        const [, ts, original] = rows[rows.length - 1];
        return { url: `https://web.archive.org/web/${ts}/${original}`, ts };
      }
      break; // valid empty result — no snapshot exists
    } catch {
      /* transient — retry once, then fall through */
    }
  }
  try {
    const res = await fetch(
      `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(20000) }
    );
    const snap = (await res.json())?.archived_snapshots?.closest;
    if (snap?.available && snap.url) return { url: snap.url.replace(/^http:/, "https:"), ts: snap.timestamp };
  } catch {
    /* fall through to capture */
  }
  return null;
}

async function capture() {
  // Save Page Now (no-auth): GET /save/<url> triggers a capture and points at the
  // resulting snapshot via the Content-Location header. It can take 10–60s.
  try {
    const res = await fetch(`https://web.archive.org/save/${url}`, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "for-good-project/archive-cite (+https://github.com/thecolab-ai/the-for-good-project)" },
      signal: AbortSignal.timeout(75000),
    });
    const loc = res.headers.get("content-location");
    if (loc) return `https://web.archive.org${loc}`;
    // Some responses land directly on the snapshot URL.
    if (/web\.archive\.org\/web\/\d+/.test(res.url)) return res.url.replace(/^http:/, "https:");
  } catch (e) {
    console.error(`  capture failed: ${e?.name || e}`);
  }
  return null;
}

const found = await existing();
if (found && !fresh && snapAge(found.ts) <= MAX_AGE_DAYS) {
  console.error(`✓ reusing snapshot from ${Math.round(snapAge(found.ts))}d ago`);
  console.log(found.url);
  process.exit(0);
}

console.error(fresh ? "requesting a fresh capture…" : "no recent snapshot — requesting a capture…");
const fresh_url = await capture();
if (fresh_url) {
  console.error("✓ captured");
  console.log(fresh_url);
  process.exit(0);
}

// Capture failed — fall back to any existing snapshot, even an older one.
if (found) {
  console.error(`! capture failed; falling back to existing snapshot (${Math.round(snapAge(found.ts))}d old)`);
  console.log(found.url);
  process.exit(0);
}

console.error("✗ no snapshot available and capture failed (Wayback may be rate-limiting) — try again shortly.");
process.exit(1);
