# FYI.org.nz OIA request-title sample — auditable data note

This directory holds the raw, preserved sample behind the FYI title-level analysis in
[`research/findings/civic-transparency/repetitive-oia-requests-bodies-topics.md`](../../findings/civic-transparency/repetitive-oia-requests-bodies-topics.md),
so a reviewer can audit the numbers directly instead of trusting a scrape.

## Files

- **`sample-2026-07-03.json`** — the committed snapshot. For each of the ten
  highest-volume FYI authorities it preserves the FYI "N requests" count, the
  authority URL, and the sampled request titles (with FYI request IDs); plus a
  site-wide "recent" slice, the topic-cluster tally, the normalised-title
  recurrence groups, and the cross-body groups. Every title is preserved verbatim
  so the coding is inspectable.
- **`../../../scripts/research/fyi-oia-title-sample.mjs`** — the script that
  produces it. Run: `node scripts/research/fyi-oia-title-sample.mjs > research/data/oia-title-sample/sample-2026-07-03.json`.
  It fetches through the repo's ADR-0006 fetch ladder (`scripts/fetch.mjs`).

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
