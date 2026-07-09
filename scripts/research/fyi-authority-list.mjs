#!/usr/bin/env node
// fyi-authority-list.mjs — reproducible FYI.org.nz full authority-list aggregation.
//
// Backs the corpus-wide FYI claims in
//   research/findings/civic-transparency/repetitive-oia-requests-bodies-topics.md
//   (total request count, active-authority count, top-N authorities and their
//    shares of the FYI corpus)
// so a reviewer can regenerate those numbers instead of trusting an uncommitted
// scrape. It is the corpus-level companion to fyi-oia-title-sample.mjs (which
// preserves a per-body TITLE sample); this script preserves only the public
// per-authority request COUNT shown on fyi.org.nz/body/list/all.
//
// It fetches ONLY public, de-identified metadata: each authority's display name,
// slug, and the "N requests made" count on the paginated all-authorities index.
// It never fetches request titles, bodies, correspondence, or requester names.
// (FYI lists some ministers as "authorities" you can request from — those are
// public office-holders acting in role, published openly by FYI, not private
// individuals.)
//
// Every fetch goes through the repo's ADR-0006 fetch ladder (scripts/fetch.mjs).
//
// Usage:
//   node scripts/research/fyi-authority-list.mjs > research/data/oia-title-sample/authority-list-2026-07-03.json
//
// The FYI list is mutable, so a later run will not be byte-identical; it is a
// dated, reproducible-as-of-access record.

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const FETCH = path.join(here, "..", "fetch.mjs");
const DATE = process.env.SAMPLE_DATE || "2026-07-03";
const MAX_PAGES = +(process.env.MAX_PAGES || 60); // runaway backstop; ~32 pages as of access

function fetchUrl(url) {
  const r = spawnSync("node", [FETCH, "--quiet", url], {
    encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
    // Each all-authorities index page is ~55 KB (100 rows); the fetch ladder
    // clips at MAX_CHARS (default 20 KB), which would drop ~two-thirds of each
    // page. Raise it so every row survives.
    env: { ...process.env, MAX_CHARS: process.env.MAX_CHARS || "200000" },
  });
  if (r.status !== 0 || !r.stdout || r.stdout.length < 500) return null;
  if (r.stdout.includes("…[truncated — raise MAX_CHARS]")) {
    process.stderr.write(`WARN truncated page, raise MAX_CHARS: ${url}\n`);
  }
  return r.stdout;
}

function decode(s) {
  return s
    .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#8217;/g, "’").replace(/&#8216;/g, "‘")
    .replace(/&#8211;/g, "–").replace(/&#8212;/g, "—")
    .replace(/&nbsp;/g, " ").replace(/&#[0-9]+;/g, " ").trim();
}

// Each authority row: <a href="/body/<slug>"><name></a> … "<N> requests made".
const ROW_RE = /<a href="\/body\/([a-z0-9_]+)">([^<]+)<\/a>\s*<\/span>[\s\S]*?([0-9][0-9,]*)\s+requests?\s+made/g;

function parsePage(html) {
  const out = [];
  let m;
  while ((m = ROW_RE.exec(html)) !== null) {
    out.push({ slug: m[1], name: decode(m[2]), count: parseInt(m[3].replace(/,/g, ""), 10) });
  }
  return out;
}

const bySlug = new Map();
let pagesFetched = 0;
for (let p = 1; p <= MAX_PAGES; p++) {
  const url = p === 1 ? "https://fyi.org.nz/body/list/all" : `https://fyi.org.nz/body/list/all?page=${p}`;
  const html = fetchUrl(url);
  if (!html) { process.stderr.write(`MISS page ${p}\n`); break; }
  pagesFetched = p;
  const rows = parsePage(html);
  let fresh = 0;
  for (const r of rows) if (!bySlug.has(r.slug)) { bySlug.set(r.slug, r); fresh++; }
  process.stderr.write(`page ${p}: ${rows.length} rows, ${fresh} new (cum ${bySlug.size})\n`);
  if (fresh === 0) break; // ran off the end of the alphabetical index
}

const all = [...bySlug.values()];
const active = all.filter((b) => b.count > 0).sort((a, b) => b.count - a.count);
const totalRequests = active.reduce((s, b) => s + b.count, 0);
const sumTop = (n) => active.slice(0, n).reduce((s, b) => s + b.count, 0);
const share = (n) => +(100 * sumTop(n) / totalRequests).toFixed(1);

const report = {
  meta: {
    generated: DATE,
    source: "fyi.org.nz/body/list/all (paginated authority index; per-authority request COUNTS only, no titles or bodies)",
    pagesFetched,
    note: "FYI is mutable and the index is alphabetical/paginated; dated, reproducible-as-of-access.",
  },
  corpus: {
    bodiesListed: all.length,
    activeBodies: active.length,
    totalRequests,
    top10Requests: sumTop(10), top10Share: share(10),
    top20Requests: sumTop(20), top20Share: share(20),
  },
  // Full active-authority list (count > 0), so every derived number above and the
  // finding's top-20 table are auditable line-by-line.
  authorities: active.map((b) => ({ slug: b.slug, name: b.name, count: b.count })),
};

process.stdout.write(JSON.stringify(report, null, 2) + "\n");
