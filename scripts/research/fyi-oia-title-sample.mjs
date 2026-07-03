#!/usr/bin/env node
// fyi-oia-title-sample.mjs — reproducible FYI.org.nz OIA request-title sampler.
//
// Backs the title-level analysis in
//   research/findings/civic-transparency/repetitive-oia-requests-bodies-topics.md
// so a reviewer can regenerate the numbers instead of trusting a scrape.
//
// It fetches public FYI listing pages, which can include requester links and short
// snippets as well as counts/titles. It parses and stores only the "N requests"
// count on each FYI authority page and visible request TITLES (with request IDs).
// It does not store request bodies, correspondence, requester names, profile links,
// or snippets. Titles that name an individual are redacted before output (see
// redact()).
//
// Every fetch goes through the repo's ADR-0006 fetch ladder (scripts/fetch.mjs),
// so the provenance of each byte is the same as everywhere else in the repo.
//
// Usage:
//   node scripts/research/fyi-oia-title-sample.mjs > research/data/oia-title-sample/sample-2026-07-03.json
//
// FYI authority pages default to most-recent order and are mutable, so a later
// run will not be byte-identical; it is a dated, reproducible-as-of-access record.

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const FETCH = path.join(here, "..", "fetch.mjs");
const DATE = process.env.SAMPLE_DATE || "2026-07-03";

// Top authorities on FYI (slugs verified against fyi.org.nz/body/<slug>), plus a
// site-wide recent slice. Defaults reproduce the committed sample: 6 pages/body
// (~80 titles) + 4 recent pages (~100).
const BODIES = [
  "new_zealand_police", "ministry_of_health", "mbie", "university_of_otago",
  "acc", "ministry_of_justice", "auckland_transport", "auckland_council",
  "ministry_of_education", "wellington_city_council",
];
const PAGES_PER_BODY = +(process.env.PAGES_PER_BODY || 6);
const RECENT_PAGES = +(process.env.RECENT_PAGES || 4);

function fetchUrl(url) {
  const r = spawnSync("node", [FETCH, "--quiet", url], {
    encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
  });
  if (r.status !== 0 || !r.stdout || r.stdout.length < 500) return null;
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

// Redact personal names of apparently-private individuals from titles (the method
// forbids reproducing identifying data). Public-interest named matters — public
// figures, public appointees, already-public court/case names, procurement
// subjects — are retained, matching the sibling council finding's rule. FYI
// publishes these titles openly; this is a defensive second layer.
//   - PRIVATE (redacted): a named individual facing charges, a bare personal name.
//   - PUBLIC (kept): public appointees, well-known public cases, org/role names.
// The named list is explicit so the redaction is auditable rather than a guess.
const REDACT_NAMES = ["Carl Longshaw", "Jessica Phuang"];
function redact(title) {
  let t = title.replace(/\b(?:Mr|Mrs|Ms)\.? [A-Z][a-z]+(?: [A-Z][a-z]+)?/g, "[name redacted]");
  for (const n of REDACT_NAMES) t = t.split(n).join("[name redacted]");
  return t;
}

const REQ_RE = /<a href="\/request\/(\d+)[^"]*">([^<]+)<\/a>/g;
function parseRequests(html) {
  const out = [];
  const seen = new Set();
  let m;
  while ((m = REQ_RE.exec(html)) !== null) {
    const id = m[1];
    const title = redact(decode(m[2]));
    if (!title || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, title });
  }
  return out;
}

function parseCount(html) {
  const m = html.match(/([0-9][0-9,]*)\s+requests?\b/i);
  return m ? parseInt(m[1].replace(/,/g, ""), 10) : null;
}

// ---- topic clusters (keyword regexes over titles; non-exclusive) ----
const CLUSTERS = [
  ["health/clinical/waitlist", /\b(health|hospital|clinic|patient|waitlist|waiting list|medical|surgery|mental health|vaccine|pharma)/i],
  ["correspondence/meetings/minutes", /\b(correspondence|email|e-mail|communication|meeting|minutes|briefing note|memo)/i],
  ["spending/expenditure/budget", /\b(spend|spending|expenditure|budget|cost|costs|payment|invoice|funding|financial)/i],
  ["staffing/headcount/restructure", /\b(staff|staffing|headcount|head count|fte|employee|restructur|redundanc|salary|salaries|remuneration|payroll|vacan)/i],
  ["policy/guidelines/advice", /\b(policy|policies|guideline|guidance|advice|framework|strategy|procedure)/i],
  ["statistics/number-of/data", /\b(statistic|number of|numbers of|how many|data on|dataset|figures|records of)/i],
  ["contracts/procurement/consultants", /\b(contract|procurement|tender|consultant|supplier|vendor|service level|sla)/i],
  ["ministerial/cabinet/briefing", /\b(minister|ministerial|cabinet|bim|incoming minister|briefing to)/i],
  ["roading/transport/speed", /\b(road|roading|transport|speed|traffic|parking|cycl|bus |rail|vehicle)/i],
  ["education/school/student", /\b(school|student|education|university|ncea|teacher|curriculum|enrol)/i],
  ["complaints/investigations/misconduct", /\b(complaint|investigation|misconduct|conduct|breach|disciplinary|whistleblow)/i],
  ["immigration/visa", /\b(immigration|visa|migrant|residenc[ey]|border|refugee)/i],
];

function normalise(title) {
  return title
    .toLowerCase()
    .replace(/\b(19|20)\d{2}\b/g, "#")        // years
    .replace(/\b\d[\d,\.]*\b/g, "#")           // any number
    .replace(/[^a-z#\s]/g, " ")                 // drop punctuation
    .replace(/\s+/g, " ")
    .trim();
}

// ---- run ----
const bodies = [];
for (const slug of BODIES) {
  const first = fetchUrl(`https://fyi.org.nz/body/${slug}`);
  if (!first) { process.stderr.write(`MISS ${slug}\n`); continue; }
  const count = parseCount(first);
  const reqs = parseRequests(first);
  for (let p = 2; p <= PAGES_PER_BODY; p++) {
    const html = fetchUrl(`https://fyi.org.nz/body/${slug}?page=${p}`);
    if (html) {
      const seen = new Set(reqs.map((r) => r.id));
      for (const r of parseRequests(html)) if (!seen.has(r.id)) reqs.push(r);
    }
  }
  bodies.push({ slug, count, url: `https://fyi.org.nz/body/${slug}`, requests: reqs });
  process.stderr.write(`ok ${slug}: count=${count} titles=${reqs.length}\n`);
}

const recent = [];
const recentSeen = new Set();
for (let p = 1; p <= RECENT_PAGES; p++) {
  const url = p === 1 ? "https://fyi.org.nz/list/recent" : `https://fyi.org.nz/list/recent?page=${p}`;
  const html = fetchUrl(url);
  if (!html) continue;
  for (const r of parseRequests(html)) if (!recentSeen.has(r.id)) { recentSeen.add(r.id); recent.push(r); }
}
process.stderr.write(`recent titles=${recent.length}\n`);

// Analysis over the union of all sampled titles (body-attributed + recent).
const attributed = bodies.flatMap((b) => b.requests.map((r) => ({ ...r, body: b.slug })));
const recentAttr = recent.map((r) => ({ ...r, body: "__recent__" }));
const all = [...attributed, ...recentAttr];
// de-dupe by request id across the whole sample for the topic/recurrence stats
const byId = new Map();
for (const r of all) if (!byId.has(r.id)) byId.set(r.id, r);
const uniq = [...byId.values()];

const clusterTally = CLUSTERS.map(([name, re]) => {
  const n = uniq.filter((r) => re.test(r.title)).length;
  return { cluster: name, titles: n, share: +(100 * n / uniq.length).toFixed(1) };
}).sort((a, b) => b.titles - a.titles);

const themed = uniq.filter((r) => CLUSTERS.some(([, re]) => re.test(r.title))).length;

const normGroups = new Map();
for (const r of uniq) {
  const key = normalise(r.title);
  if (!key) continue;
  if (!normGroups.has(key)) normGroups.set(key, []);
  normGroups.get(key).push(r);
}
const recurring = [...normGroups.entries()].filter(([, rs]) => rs.length >= 2);
const inRecurring = recurring.reduce((s, [, rs]) => s + rs.length, 0);

// cross-body: same normalised title under >= 2 distinct bodies (recent excluded
// from the body count so it can't inflate cross-body spread)
const crossBody = [];
for (const [key, rs] of normGroups) {
  const distinctBodies = new Set(rs.map((r) => r.body).filter((b) => b !== "__recent__"));
  if (distinctBodies.size >= 2) {
    crossBody.push({ normalised: key, bodies: [...distinctBodies], ids: rs.map((r) => r.id), example: rs[0].title });
  }
}

const report = {
  meta: {
    generated: DATE,
    source: "fyi.org.nz public authority/listing pages; output stores counts + request titles only, no requester names/snippets/bodies",
    bodies: BODIES, pagesPerBody: PAGES_PER_BODY, recentPages: RECENT_PAGES,
    note: "FYI pages are mutable and default to most-recent order; dated, reproducible-as-of-access.",
  },
  totals: {
    bodiesFetched: bodies.length,
    uniqueTitles: uniq.length,
    themedTitles: themed,
    themedShare: +(100 * themed / uniq.length).toFixed(1),
    recurringGroups: recurring.length,
    titlesInRecurringGroups: inRecurring,
    recurrenceRate: +(100 * inRecurring / uniq.length).toFixed(1),
    crossBodyGroups: crossBody.length,
  },
  clusterTally,
  crossBody: crossBody.sort((a, b) => b.bodies.length - a.bodies.length),
  recurringExamples: recurring
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20)
    .map(([key, rs]) => ({ normalised: key, n: rs.length, examples: rs.slice(0, 3).map((r) => r.title) })),
  bodies: bodies.map((b) => ({ slug: b.slug, url: b.url, count: b.count, sampledTitles: b.requests })),
  recent,
};

process.stdout.write(JSON.stringify(report, null, 2) + "\n");
