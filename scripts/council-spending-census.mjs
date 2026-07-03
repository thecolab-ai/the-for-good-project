#!/usr/bin/env node
// council-spending-census.mjs — the reproducible bounded desk census behind
// research/findings/civic-transparency/council-spending-census-78.md.
//
// For each of the 78 LGNZ councils it fetches, per council:
//   1. the homepage HTML, and
//   2. the root sitemap.xml (following redirects; if that is a sitemap INDEX,
//      it also fetches every child sitemap it references),
// then scans every URL and homepage anchor href/text for the bounded keyword
// list below. It records, per council, an explicit classification —
//   HIT           = at least one keyword matched a URL,
//   NO-HIT        = the root sitemap was fetched & scanned, no keyword matched
//                   (the strong negative — sitemap is the full URL list),
//   PARTIAL       = only the homepage could be scanned (sitemap absent/blocked),
//                   no keyword there — a WEAK negative, not conclusive,
//   BLOCKED       = neither homepage nor sitemap yielded scannable content
//                   (tooling or IP per ADR-0006, NOT evidence of absence),
// the matched keyword groups, the full matched URL set, structured-file URL
// hits, up to a few sample matched URLs, and the HTTP status + byte size of each
// fetch so a "NO-HIT" is auditable and distinct from a blocked fetch.
//
// This is deliberately a FRONT-DOOR census: homepage + root sitemap only. It is
// not a full crawl, a document-library search, or a JS-rendered fetch, and it
// cannot see search-only endpoints, ArcGIS services, or files without matching
// URL tokens. Those limits are stated in the finding.
//
// Implemented fetch path: each fetch tries a direct browser-shaped HTTP request
// first; if that is WAF-blocked (403/405/406/bot-challenge) it retries through the
// r.jina.ai reader proxy, which egresses from a different IP and often returns
// the current page/sitemap. This is not the full ADR-0006 browser ladder. Every
// fetch records HOW it was obtained (direct vs reader) so the artifact is
// auditable and WAF/tooling failures are not counted as "no data".
//
// Usage:
//   node scripts/council-spending-census.mjs councils.tsv > audit.tsv
//     councils.tsv: one "Council Name\thttps://homepage/" per line.
//   node scripts/council-spending-census.mjs councils.tsv --json > audit.json
//
// Deterministic given the same live web responses. Re-run to reproduce; council
// sites change, so commit the raw output artifact alongside the finding.

import { readFileSync } from "node:fs";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/125.0 Safari/537.36";

// The bounded keyword list, grouped exactly as the finding describes. A URL or
// homepage anchor matches a group if it contains any of the group's tokens
// (case-insensitive, hyphen/space/underscore-insensitive).
const GROUPS = {
  "finance/budget": [
    "annual report", "annual-report", "long term plan", "long-term-plan",
    "longtermplan", "ltp", "annual plan", "annual-plan", "budget",
    "finance", "financial",
  ],
  procurement: ["procurement", "tender", "contract", "supplier"],
  spending: ["spending", "expenditure", "rates", "invoice", "payment"],
  "open-data/grants/capital": [
    "open data", "open-data", "opendata", "grant", "capital works",
    "capital-works", "capital programme", "capital-programme",
  ],
};
// A flat token→group map, tokens normalised (lowercase, non-alphanumerics stripped).
const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const TOKEN_GROUP = [];
for (const [group, tokens] of Object.entries(GROUPS))
  for (const t of tokens) TOKEN_GROUP.push([norm(t), group]);

// Bot-wall markers. Includes AWS WAF ("Human Verification" / "confirm you are
// human" / gokuProps / awsWafCookie) because several council sites sit behind it
// and it leaks a short challenge page THROUGH the reader proxy — counting that as
// "fetched, no keyword" would be a false negative, so we must catch it and mark
// the council BLOCKED instead.
const CHALLENGE =
  /just a moment|checking your browser|cf-browser-verification|cf[-_]chl|incapsula|_incapsula_|access denied|enable javascript to|attention required|are you a human|confirm you are human|human verification|complete the security check|security check before continuing|verif(?:y|ies|ying)? (?:that )?you are (?:not a bot|human)|verifies you are not a bot|protect against malicious bots|aws[-_ ]?waf|awswafcookie|gokuprops|unusual traffic|performing security verification|request unsuccessful|ddos protection/i;

const TIMEOUT_MS = 25000;
const MAX_SAMPLES = 5;
const STRUCTURED_EXT = /\.(csv|tsv|xls|xlsx|json|geojson)(?:[?#].*)?$/i;

async function httpGet(url, timeout = TIMEOUT_MS) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html,application/xml,application/xhtml+xml,*/*", "Accept-Language": "en-NZ,en;q=0.9" },
      signal: AbortSignal.timeout(timeout),
    });
    const body = await res.text();
    const bytes = body.length;
    if (res.status === 404 || res.status === 410)
      return { ok: false, status: res.status, dead: true, body: "", bytes };
    if (!res.ok) return { ok: false, status: res.status, blocked: true, body: "", bytes };
    if (CHALLENGE.test(body.slice(0, 4000)) && bytes < 8000)
      return { ok: false, status: res.status, blocked: true, body: "", bytes };
    return { ok: true, status: res.status, body, bytes };
  } catch (e) {
    return { ok: false, status: 0, blocked: true, body: "", bytes: 0, note: e?.name || String(e) };
  }
}

// r.jina.ai reader proxy — fetches from its own egress and returns the rendered
// page / raw sitemap as text. Used only when the direct fetch is WAF-blocked.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function readerGet(url, attempt = 0) {
  try {
    const res = await fetch("https://r.jina.ai/" + url, {
      redirect: "follow",
      headers: { "User-Agent": UA, "X-Return-Format": "text" },
      signal: AbortSignal.timeout(60000),
    });
    const body = await res.text();
    if ((res.status === 429 || res.status === 503) && attempt < 3) {
      await sleep(4000 * (attempt + 1));
      return readerGet(url, attempt + 1);
    }
    if (!res.ok || body.length < 100) return { ok: false, status: res.status, blocked: true, body: "", bytes: body.length };
    // The reader can pass a bot-wall challenge straight through — reject it.
    if (CHALLENGE.test(body.slice(0, 4000)) && body.length < 6000)
      return { ok: false, status: res.status, blocked: true, body: "", bytes: body.length, note: "challenge-page via reader" };
    return { ok: true, status: res.status, body, bytes: body.length };
  } catch (e) {
    if (attempt < 2) {
      await sleep(3000 * (attempt + 1));
      return readerGet(url, attempt + 1);
    }
    return { ok: false, status: 0, blocked: true, body: "", bytes: 0, note: e?.name || String(e) };
  }
}

// Direct first; on a WAF block (not a genuine 404) fall back to the reader proxy.
async function get(url) {
  const direct = await httpGet(url);
  if (direct.ok) return { ...direct, via: "direct" };
  if (direct.dead) return { ...direct, via: "direct" }; // real 404 — don't reader-retry
  const reader = await readerGet(url);
  if (reader.ok) return { ...reader, via: "reader", directStatus: direct.status };
  return { ...direct, via: "direct+reader-failed", readerNote: reader.note || reader.status };
}

// Pull every URL out of a sitemap. Handles both raw XML (<loc>…</loc>) and the
// reader-proxy's flattened text where URLs are glued to ISO timestamps.
function extractLocs(xml) {
  const out = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml))) out.push(m[1].trim());
  if (out.length) return out;
  // Reader mode: no <loc> tags. Split on URL boundaries, strip trailing timestamps.
  for (const part of xml.split(/(?=https?:\/\/)/)) {
    const mm = /^(https?:\/\/[^\s<>"'\])]+)/.exec(part);
    if (!mm) continue;
    let url = mm[1].replace(/(\d{4}-\d{2}-\d{2}T[\d:.]+Z?).*$/, "").replace(/[.,)\]]+$/, "");
    if (url.length > 12) out.push(url);
  }
  return out;
}

// Pull anchor hrefs + link text out of homepage HTML.
function extractAnchors(html, base) {
  const out = [];
  const re = /<a\b[^>]*href=["']([^"'#?]+)[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const text = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    let href = m[1];
    try {
      href = new URL(href, base).href;
    } catch {
      // Keep the raw href; it can still contribute text-token evidence.
    }
    out.push(href + " " + text);
  }
  return out;
}

// Given a set of candidate strings, return matched groups, all matched URLs and
// representative samples. matchedUrls is intentionally complete for review.
function scan(strings) {
  const groups = new Set();
  const samples = new Map(); // group -> [urls]
  const matchedUrls = new Set();
  for (const s of strings) {
    const n = norm(s);
    for (const [tok, group] of TOKEN_GROUP) {
      if (n.includes(tok)) {
        groups.add(group);
        const arr = samples.get(group) || [];
        // Keep the raw URL portion (before the first space) as the sample.
        const url = s.split(/\s/)[0];
        if (/^https?:\/\//.test(url)) {
          matchedUrls.add(url);
        }
        if (/^https?:\/\//.test(url) && arr.length < MAX_SAMPLES && !arr.includes(url)) {
          arr.push(url);
          samples.set(group, arr);
        }
      }
    }
  }
  const matchedUrlList = [...matchedUrls].sort();
  return {
    groups: [...groups],
    samples,
    matchedUrls: matchedUrlList,
    structuredUrlHits: matchedUrlList.filter((u) => STRUCTURED_EXT.test(u)).sort(),
  };
}

async function auditCouncil(name, homepage) {
  const origin = new URL(homepage).origin;
  const notes = [];
  const strings = [];
  let homepageScanned = false;
  let sitemapPresent = false;

  const tag = (r) => (r.ok ? `ok ${r.bytes}b via ${r.via}${r.via === "reader" ? ` (direct was ${r.directStatus})` : ""}` : r.dead ? "DEAD" : "BLOCKED");

  // --- Homepage ---
  // Direct HTML → anchor href+text. Reader (markdown/plain text) → any absolute
  // URLs PLUS the visible link/nav text, because the method scans "URLs AND link
  // text" and the reader's text mode carries the visible labels (e.g. "Rates",
  // "Long Term Plan") even when it strips the hrefs. Scanning only URLs here would
  // wrongly discard a homepage that plainly lists finance/rates/grants links.
  const hp = await get(homepage);
  let hpStrings = [];
  if (hp.ok) {
    hpStrings = hp.via === "reader" ? extractLocs(hp.body) : extractAnchors(hp.body, homepage);
    if (hp.via === "reader") hpStrings = hpStrings.concat(hp.body.split(/\n+/).map((s) => s.trim()).filter((s) => s.length > 2 && s.length < 200));
  }
  notes.push(`homepage ${homepage} -> HTTP ${hp.status} ${tag(hp)}${hp.ok ? ` [${hpStrings.length} link/text lines]` : ""}`);
  if (hp.ok && hpStrings.length > 0) {
    homepageScanned = true;
    strings.push(...hpStrings);
  }

  // --- Root sitemap (+ one level of sitemap index) ---
  const sm = await get(origin + "/sitemap.xml");
  const smLocs = sm.ok ? extractLocs(sm.body) : [];
  // A "successful" fetch that yields ZERO urls is not a real sitemap (empty body,
  // a challenge stub the regex missed, or an HTML error page) — do NOT count it as
  // a scanned sitemap, or a NO-HIT would be a false negative.
  notes.push(`sitemap ${origin}/sitemap.xml -> HTTP ${sm.status} ${tag(sm)}${sm.ok ? ` [${smLocs.length} urls]` : ""}`);
  if (sm.ok && smLocs.length > 0) {
    sitemapPresent = true;
    const locs = smLocs;
    const isIndex = /<sitemapindex/i.test(sm.body) || locs.some((l) => /\.xml($|\?)/i.test(l));
    strings.push(...locs);
    if (isIndex) {
      // Fetch child sitemaps (cap to keep the census bounded & polite).
      const children = locs.filter((l) => /\.xml($|\?)/i.test(l)).slice(0, 30);
      notes.push(`sitemap index: ${children.length} child sitemaps fetched (cap 30)`);
      for (const c of children) {
        const cs = await get(c);
        if (cs.ok) strings.push(...extractLocs(cs.body));
      }
    }
  }

  const { groups, samples, matchedUrls, structuredUrlHits } = scan(strings);

  // Classification, in decreasing evidential strength:
  //   HIT      — a keyword matched (positive; strong regardless of coverage).
  //   NO-HIT   — the root sitemap was fetched & scanned and no keyword matched
  //              (the strong negative: sitemap is the comprehensive URL list).
  //   PARTIAL  — only the homepage could be scanned (sitemap absent/blocked) and
  //              no keyword matched there — a WEAK negative, not conclusive.
  //   BLOCKED  — neither homepage nor sitemap yielded scannable content through
  //              the direct+reader fetch path; tooling, NOT evidence of absence.
  let classification;
  if (groups.length > 0) classification = "HIT";
  else if (sitemapPresent) classification = "NO-HIT";
  else if (homepageScanned) classification = "PARTIAL";
  else classification = "BLOCKED";

  // Flatten a few representative sample URLs across matched groups. A HIT that
  // matched only homepage link/nav TEXT (no absolute URL) falls back to the
  // homepage as its citable source.
  const sampleUrls = [];
  for (const g of groups) for (const u of samples.get(g) || []) if (!sampleUrls.includes(u)) sampleUrls.push(u);
  if (groups.length > 0 && sampleUrls.length === 0) sampleUrls.push(homepage + " (homepage link/nav text)");

  return {
    council: name,
    homepage,
    classification,
    groups,
    urlsScanned: strings.length,
    matchedUrls,
    structuredUrlHits,
    sampleUrls: sampleUrls.slice(0, 6),
    fetchNotes: notes,
  };
}

// ---- main ------------------------------------------------------------------
const file = process.argv[2];
const asJson = process.argv.includes("--json");
if (!file) {
  console.error("usage: node scripts/council-spending-census.mjs councils.tsv [--json]");
  process.exit(2);
}

const rows = readFileSync(file, "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean)
  .map((l) => l.split("\t"))
  .filter((c) => c.length >= 2 && /^https?:\/\//.test(c[1]));

const results = [];
// Sequential with small politeness gap avoided (no Date/random available in some
// harnesses); a bounded concurrency pool keeps it quick without hammering.
const POOL = 4;
let idx = 0;
async function worker() {
  while (idx < rows.length) {
    const i = idx++;
    const [name, url] = rows[i];
    try {
      results[i] = await auditCouncil(name.trim(), url.trim());
    } catch (e) {
      results[i] = { council: name.trim(), homepage: url.trim(), classification: "BLOCKED", groups: [], urlsScanned: 0, matchedUrls: [], structuredUrlHits: [], sampleUrls: [], fetchNotes: [`error: ${e?.message || e}`] };
    }
    console.error(`[${i + 1}/${rows.length}] ${results[i].classification}  ${name.trim()}`);
  }
}
await Promise.all(Array.from({ length: POOL }, worker));

const counts = results.reduce((a, r) => ((a[r.classification] = (a[r.classification] || 0) + 1), a), {});

if (asJson) {
  console.log(JSON.stringify({ generated: "see git commit date", counts, results }, null, 2));
} else {
  console.log("# Bounded homepage + root-sitemap council spending/procurement keyword census");
  console.log("# Method: scripts/council-spending-census.mjs — homepage anchors + root sitemap.xml (index expanded), bounded keyword list.");
  console.log("# Classification: HIT / NO-HIT (sitemap scanned) / PARTIAL (homepage only) / BLOCKED (direct+reader fetch path did not yield scannable content; not evidence of absence).");
  console.log(`# Counts: ${JSON.stringify(counts)}`);
  console.log("#");
  console.log(["council", "classification", "matched_groups", "urls_scanned", "matched_urls", "structured_url_hits", "sample_urls", "fetch_notes"].join("\t"));
  for (const r of results) {
    console.log(
      [
        r.council,
        r.classification,
        r.groups.join("; ") || "-",
        r.urlsScanned,
        r.matchedUrls.join(" ") || "-",
        r.structuredUrlHits.join(" ") || "-",
        r.sampleUrls.join(" ") || "-",
        r.fetchNotes.join(" | "),
      ].join("\t"),
    );
  }
}
console.error(`\nDONE. Counts: ${JSON.stringify(counts)}`);
