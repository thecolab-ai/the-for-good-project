# OIA volume/title data — auditable data note

This directory holds the raw, preserved data behind
[`research/findings/civic-transparency/repetitive-oia-requests-bodies-topics.md`](../../findings/civic-transparency/repetitive-oia-requests-bodies-topics.md),
so a reviewer can audit every number directly instead of trusting a scrape. Three
artifacts back the finding's three quantitative claims.

## Files

- **`psc-oia-2025-totals.csv`** — **central-government volume.** Per-agency count of
  OIA requests *completed* in calendar 2025, parsed from the two public PSC
  workbooks (`OIA-statistics-Jan-Jun-2025-FInal.xlsx` + `OIA-statistics-Jul-Dec-2025.xlsx`).
  Columns: agency, Jan–Jun completed, Jul–Dec completed, 2025 total, share of total.
  It sums to **151,619** across 111 agencies (Police 64,058; top-3 = 66%). It is the
  "OIA requests completed" column (col C) of each workbook's *Timeliness & publication*
  and *Police & NZDF – time & pub* sheets, category roll-up rows excluded — so it is
  checkable line-by-line against the public workbooks. (The repo has no XLSX
  dependency, so this table is committed as the reproducible calculation rather than a
  runnable script; the parse method is stated in the finding's provenance section.)
- **`authority-list-2026-07-03.json`** — **full FYI corpus.** Every active FYI
  authority (count > 0) with its request count, plus derived corpus totals
  (**34,487** requests across **703** active bodies; top-10 = 35.9%, top-20 = 53.4%).
  Backs the corpus-wide FYI claims and the top-20 authority table in the finding.
  Regenerate: `node scripts/research/fyi-authority-list.mjs > research/data/oia-title-sample/authority-list-2026-07-03.json`.
- **`sample-2026-07-03.json`** — **FYI title sample.** For each of the ten
  highest-volume FYI authorities it preserves the FYI "N requests" count, the
  authority URL, and the sampled request titles (with FYI request IDs); plus a
  site-wide "recent" slice, the topic-cluster tally, the normalised-title
  recurrence groups, and the cross-body groups. Every title is preserved verbatim
  so the coding is inspectable. Regenerate (defaults reproduce the committed snapshot —
  10 bodies × 6 pages + 4 recent pages):
  `node scripts/research/fyi-oia-title-sample.mjs > research/data/oia-title-sample/sample-2026-07-03.json`.

Both FYI scripts fetch through the repo's ADR-0006 fetch ladder (`scripts/fetch.mjs`).

## What was and wasn't collected

**Public, de-identified metadata only:** per-authority request *counts* and request
*titles* (both shown openly on every FYI listing page). **No request bodies, no
correspondence, no requester names** were fetched or stored. Personal names of
apparently-private individuals are redacted in the committed titles (see the
`REDACT_NAMES` list in the script — currently two individuals facing charges /
named bare); public-interest named matters (public appointees, well-known public
cases, already-anonymised court references) are retained, matching the rule used in
the sibling council finding's Appendix A.

## Honesty note on reproducibility

The finding's *original* run sampled a larger, authority-concentrated set of titles
that was **not checked into the PR**, so its headline "~23% near-duplicate rate" and
"n = 3,869" could not be audited. Reconstructing those exact titles from memory would
be fabrication, which the method forbids. This snapshot instead **re-runs a smaller,
fully-preserved sample on 3 July 2026** (10 bodies × up to 6 listing pages ≈ 795
unique titles, plus a recent slice) and reports what that committed sample actually
yields. FYI authority pages are mutable and default to most-recent order, so a later
run will not be byte-identical — this is a dated, reproducible-as-of-access record,
not a frozen fixture.

## Headline numbers in this snapshot (n = 795 unique titles)

| Measure | Value | Notes |
|---|---|---|
| Titles matching ≥1 accountability topic cluster | **43.6%** | keyword clusters, non-exclusive |
| Titles whose *strict-normalised* form (years/numbers stripped, punctuation dropped) recurs ≥2× **within the sample** | **2.1%** (17/795) | far below the original uncommitted run's ~23%; strict normalisation + a 10-body sample catches few near-duplicates |
| Cross-body groups (same normalised title under ≥2 sampled bodies) | **5** | incl. `CCTV and ANPR Cameras` across 3 councils |

The strongest, cleanest repetition signal is **cross-body campaigns**, best surfaced
by full-text search rather than a per-body sample. One verified example: the exact
title **"Use of small desk fans"** appears under at least six different agencies
(MBIE, Justice, Education, MSD, Oranga Tamariki, Health) on the first page of
[`fyi.org.nz/search/desk fans/newest`](https://fyi.org.nz/search/desk%20fans/newest).
