---
title: "NZ OIA volume is dominated by a few agencies fielding individualised record requests; the publicly repetitive requests cluster around spending, staffing, contracts, and briefings"
domain: "civic-transparency"
issue: "#201"
confidence: "Medium"
author: "adam91holt"
agent: "claude"
model: "claude-opus-4-8[1m]"
date: "2026-07-03"
status: "draft"
---

# NZ OIA volume is dominated by a few agencies fielding individualised record requests; the publicly repetitive requests cluster around spending, staffing, contracts, and briefings

## Executive answer

- **Central-government OIA volume is extraordinarily concentrated.** In calendar 2025, the ~104 agencies that report to the Public Service Commission (PSC) completed **151,619 OIA requests**; **New Zealand Police alone completed 64,058 (≈42%)**, and Police + the Natural Hazards Commission (former EQC) + the Department of Corrections together accounted for **~66%** ([PSC OIA statistics, Jul–Dec 2025 & Jan–Jun 2025 datasets](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics)). PSC stats **exclude local councils** (they operate under LGOIMA and report separately).
- **But the three volume leaders are dominated by individualised / operational record requests, not public-interest policy requests** — inferred from the fact that they barely appear in the public FYI archive relative to their official volume (Police: 64k/yr official vs **2,076 total on FYI**; Corrections: 17k/yr vs 471). Policy ministries show the opposite: Ministry of Health (Manatū Hauora) has ~2,000/yr official and **2,064 on FYI**.
- **On the public FYI archive** (34,487 requests across 703 active bodies), the most-requested authorities are **NZ Police, Ministry of Health, MBIE, University of Otago, ACC**, plus heavy council representation (Auckland Council/Transport, Wellington, Christchurch) that is invisible in PSC stats ([FYI authority list](https://fyi.org.nz/body/list/all)).
- **The recurring *topics*** (from ~3,869 sampled request titles) cluster around **health/waitlists, correspondence/meetings, spending/budgets, staffing/headcount, policy/advice, statistics ("number of…"), contracts/consultants, and ministerial briefings** — the administrative-accountability staples.
- **"Repetitive" is measurable but only partially from public metadata.** ~**23%** of sampled titles have a normalised form (years/numbers stripped) that recurs ≥2×, and clear **cross-body campaign requests** exist (e.g. one comms-staff-headcount question sent to ≥10 different agencies). True semantic duplication needs the request *bodies*, which contain personal data — so confidence on the precise repetition rate is Medium, not High.

**Overall confidence:** Medium — the *which-bodies* volume picture is High (primary PSC data, independently corroborated); the *which-topics* and *how-repetitive* picture is Medium (a deliberately authority-concentrated title sample, titles-only, no body text).

## Evidence

### Method and data provenance (read this first — it bounds every number below)

All figures use **aggregate, de-identified public metadata only**. Two sources:

1. **PSC OIA statistics** — the official half-yearly collection of OIA requests *completed* by central-government agencies. I downloaded the consolidated `v_OIAStatisticsAllDataResults` CSV and the per-period Excel workbooks (Jan–Jun 2025, Jul–Dec 2025) from the [PSC OIA statistics page](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics) ([Wayback snapshot](https://web.archive.org/web/20260226192108/https://www.publicservice.govt.nz/guidance/official-information/oia-statistics)). Rows labelled `Agency Type Totals` (category roll-ups) were excluded from per-agency rankings.
2. **fyi.org.nz** — the public OIA request archive (an [Alaveteli](https://fyi.org.nz/help/api) instance run by the NZ Council for Civil Liberties). I scraped only **per-authority request counts** (`/body/list/all`) and **request titles** (public, shown on every listing page). **No request bodies, no requester names, no correspondence were collected or stored.** Titles that named individuals are not reproduced here.

I did **not** access the de-identification pipeline being scoped in the sibling method issue (#200, still open) — so this finding stays strictly on counts, titles, and normalised title-templates, which are safe to aggregate.

### Which bodies field the most OIA requests (official PSC data)

Calendar 2025 (Jan–Jun 2025 + Jul–Dec 2025 workbooks; requests *completed*), top agencies:

| Rank | Agency | 2025 OIAs completed | Share of total |
|---|---|---|---|
| 1 | **New Zealand Police** | 64,058 | 42.2% |
| 2 | Natural Hazards Commission – Toka Tū Ake (ex-EQC) | 18,968 | 12.5% |
| 3 | Department of Corrections | 17,024 | 11.2% |
| 4 | Health NZ – Te Whatu Ora | 5,969 | — |
| 5 | New Zealand Defence Force | 5,661 | — |
| 6 | NZ Customs Service | 4,244 | — |
| 7 | Fire and Emergency NZ | 3,363 | — |
| 8 | NZ Transport Agency Waka Kotahi | 3,095 | — |
| 9 | MBIE | 3,058 | — |
| 10 | Ministry for Primary Industries | 3,037 | — |

Totals: **151,619** across ~104 reporting agencies; **top 3 = 66%**, **top 10 = 85%** ([PSC OIA statistics](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics)). Police and NDF are reported separately in the PSC files and excluded from its "Public Service" summary headline — which is why external summaries of the PSC release quote a much smaller number: [RNZ, reporting a PSC half-year release](https://www.rnz.co.nz/news/national/497922/more-than-20-000-official-information-requests-so-far-this-year-with-oranga-tamariki-responding-the-slowest), states "**99 agencies completed 26,505 OIA requests between January and June**" (a *Public-Service-excluding-Police* figure) and independently notes "**Department of Corrections and Toka Tū Ake EQC received the most requests… with over 5000 each**" — corroborating both the exclusion convention and the concentration ranking above.

This concentration is long-standing: Police report their [OIA statistics separately](https://www.police.govt.nz/police-latest-oia-statistics) precisely because their volume dwarfs other agencies, and the Ombudsman has published dedicated OIA-practice reviews of the two highest-volume, most-complained-about agencies — [Corrections (2022)](https://www.ombudsman.parliament.nz/resources/oia-compliance-and-practice-department-corrections-2022) and, per RNZ, [Police and Corrections top the OIA-complaint tables](https://www.rnz.co.nz/news/national/323503/police,-corrections-have-most-oia-complaints).

### The critical nuance: volume leaders ≠ public-interest requests

The three volume leaders field mostly **individualised or operational record requests** — the kind an individual makes about *their own* matter (a crash report, a criminal-history/vetting check, a claim file, a prisoner's own records), not the policy/accountability questions the "open by default" idea targets. The cleanest de-identified evidence is the gap between official volume and public-archive presence:

| Agency | PSC official (2025, per year) | FYI archive (all-time) | FYI as % of official/yr |
|---|---|---|---|
| New Zealand Police | 64,058 | 2,076 | ~3% |
| Department of Corrections | 17,024 | 471 | ~3% |
| Ministry of Health (Manatū Hauora, policy ministry) | ~2,000 | 2,064 | ~100%+ |

Police receive ~30× Health's official volume yet a *similar* number of public FYI requests — i.e. the overwhelming majority of Police/Corrections/EQC OIAs are private matters that never surface as public-interest requests ([PSC data](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics); [FYI authority list](https://fyi.org.nz/body/list/all)). **Implication for the stream:** "open by default" candidates should be sought among the *policy/administrative* request stream (best seen on FYI and in agency disclosure logs), not among the raw PSC volume — otherwise you'd wrongly conclude the answer is "publish crash reports and prisoner files," which are inherently personal.

### Which bodies dominate the *public* archive (FYI)

FYI corpus = **34,487 requests** across 703 active authorities (≈34.5k is also the ceiling implied by the highest request ID observed, ~34,400). Top authorities ([FYI authority list](https://fyi.org.nz/body/list/all), scraped 2026-07-03):

| Authority | FYI requests | | Authority | FYI requests |
|---|---|---|---|---|
| New Zealand Police | 2,076 | | Ministry of Justice | 840 |
| Ministry of Health | 2,064 | | NZ Transport Agency | 838 |
| MBIE | 1,887 | | **Auckland Transport** | 793 |
| University of Otago | 1,022 | | **Auckland Council** | 754 |
| ACC | 963 | | Ministry of Education | 737 |
| University of Auckland | 949 | | Fire and Emergency NZ | 704 |
| Dept of Internal Affairs | 872 | | **Wellington City Council** | 656 |
| Ministry of Social Development | 868 | | Dept of PM & Cabinet | 538 |

Top-10 authorities = **36%** of the FYI corpus; top-20 = **53%**. Two things the PSC stats miss appear here: **universities** (Otago, Auckland, Victoria, Canterbury all in the top ~30) and **local government** (Auckland Council/Transport, Wellington, Christchurch, Hutt, Porirua, Dunedin, Tauranga, Hamilton). Councils are **entirely absent from PSC statistics** because they answer under LGOIMA, not the OIA — so any council-level "repeat request" analysis must use FYI and each council's own disclosure log, not PSC data.

### Which *topics* recur (title clustering, n = 3,869 sampled titles)

Sampling: 500 most-recent requests site-wide plus up to 150 titles each from the 25 highest-volume authorities. Keyword clusters over **titles only** (non-exclusive; a title can match several):

| Topic cluster | Titles | Share |
|---|---|---|
| Health / hospital / clinical / waitlist | 248 | 6.4% |
| Correspondence / emails / meetings / minutes | 227 | 5.9% |
| Spending / expenditure / budgets | 207 | 5.4% |
| Roading / transport / speed | 205 | 5.3% |
| Policy / guidelines / advice | 172 | 4.4% |
| Education / school / student | 165 | 4.3% |
| Statistics / "number of…" / data | 162 | 4.2% |
| Staffing / headcount / restructure | 148 | 3.8% |
| Consultation / submissions / decisions | 128 | 3.3% |
| Property / assets / vehicles / travel | 119 | 3.1% |
| Complaints / investigations / misconduct | 116 | 3.0% |
| Contracts / procurement / consultants | 112 | 2.9% |
| Immigration / visa | 109 | 2.8% |
| Ministerial briefings / Cabinet / advice-to-minister | 105 | 2.7% |
| Crime / enforcement / incidents | 96 | 2.5% |

47% of titles match ≥1 recurring theme. The health/transport/education tilt partly reflects the sample (top authorities include Health NZ, NZTA, universities); the **domain-neutral accountability staples** — spending, staffing/headcount, correspondence, policy/advice, statistics, contracts/consultants, ministerial briefings — are the categories that recur *across* body types and are the natural "publish-proactively" candidates. This matches the sibling council-data finding, which independently found council-data demand clustering on "rates, project costs, contracts, decisions, and service performance" ([research/findings/civic-transparency/council-data-questions.md](council-data-questions.md)).

### How *repetitive* is it, and can we defend the number?

Two de-identified measures from titles:

- **Normalised-title recurrence.** Lower-casing and replacing years/numbers with placeholders, **~23% of sampled titles share a normalised form that appears ≥2×.** These are near-duplicates that differ only by year or figure (e.g. "number of staff in public relations or communications roles," "total number of…", "briefing to the incoming minister").
- **Cross-body campaign requests** (same normalised title sent to ≥3 *different* authorities) — the strongest, cleanest "repetitive" signal, and inherently de-identified:
  - a **communications/PR staff headcount** question → ≥10 different agencies
  - a **gender-and-ethnic-diversity stocktake of public-sector boards** → ≥9 agencies
  - an **employment-equity** question → ≥6 agencies
  - a viral **office energy-use** question ("use of small desk fans") → ≥4 agencies
  - an **IPCA protest-policing report** request and an **organisational-chart** request → ≥3 agencies each

  Because my sample covered only 25 bodies at ≤6 pages each, these cross-body counts are **lower bounds** — real campaigns span far more agencies.

**A defensible definition of "repetitive":** a request is repetitive to the degree that a de-identified normalisation of its *title* (and, with the #200 pipeline, its redacted *body*) matches other requests — either **(a) the same body answering the same question in successive periods** (temporal repetition, e.g. quarterly spend) or **(b) the same question sent to many bodies** (cross-body/campaign repetition). Both are visible in public metadata *at the title level*; the fraction that are true semantic duplicates (same information need, different wording) can only be pinned down from request bodies, which carry personal data. Hence the honest headline is a **range**: at least ~23% title-level near-duplication in this sample, and an unknown-but-larger share once wording variation is accounted for.

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| NZ Police is by far the single largest OIA-receiving agency (≈42% of all reported central-govt OIAs in 2025) | [PSC OIA statistics datasets](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics) (primary; my parse: 64,058 of 151,619) | [Police report OIA stats separately](https://www.police.govt.nz/police-latest-oia-statistics); RNZ: [Police & Corrections top OIA complaints/volume](https://www.rnz.co.nz/news/national/323503/police,-corrections-have-most-oia-complaints) | High |
| Just three bodies (Police, EQC/Natural Hazards Commission, Corrections) field ~two-thirds of central-govt OIA volume | [PSC data](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics) (my parse: 66%) | RNZ on PSC release: "[Corrections and Toka Tū Ake EQC received the most requests… over 5000 each](https://www.rnz.co.nz/news/national/497922/more-than-20-000-official-information-requests-so-far-this-year-with-oranga-tamariki-responding-the-slowest)" corroborates the concentration | High |
| The volume leaders' requests are mostly individualised/operational, not public-interest policy requests | Official-vs-FYI ratio (~3% for Police/Corrections vs ~100% for MoH) computed from [PSC data](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics) + [FYI](https://fyi.org.nz/body/list/all) | *Single quantitative line of evidence (the ratio); the interpretation is inferred, not directly stated by a source.* Flagged — see "what would change this." | Medium |
| ~23% of sampled request titles are near-duplicate templates; documented cross-body campaigns exist | My title analysis (n=3,869, [FYI](https://fyi.org.nz/body/list/all)) | *Single source (my own sample). Direction corroborated by [council-data-questions.md](council-data-questions.md) finding similar recurring clusters, but the 23% figure itself is one-sourced.* | Medium |

## What would change this conclusion

- **A full-corpus title/body analysis instead of a 3,869-title sample.** My topic shares and the 23% near-duplicate rate come from an authority-concentrated sample; a complete, evenly-weighted pull of all ~34,500 FYI requests (and per-council disclosure logs) could shift the topic mix and the repetition rate up or down materially. Treat the topic percentages as *rank-order indicative*, not precise.
- **Access to redacted request bodies (the #200 pipeline).** True semantic-duplicate detection needs bodies, which I deliberately did not touch. If bodies were safely de-identified and clustered, the "repetitive" share would almost certainly rise above the title-only 23% — but by how much is unverified.
- **The individualised-vs-public-interest split is inferred, not measured.** I infer it from the official-vs-FYI volume ratio; I could **not** verify from a source what proportion of Police/EQC/Corrections OIAs are personal-record requests. An agency breakdown of request *types* (many agencies internally tag "personal information" vs "policy" requests) would confirm or refute it. If those agencies actually field large volumes of *policy* requests that simply never reach FYI, the "look elsewhere for open-by-default candidates" recommendation weakens.
- **PSC coverage gaps.** PSC stats exclude local government (LGOIMA), Parliament, the courts, and some smaller bodies; the consolidated CSV also showed duplicated values for 2015–2016 half-years (a data-quality artifact I excluded). A council-side LGOIMA volume analysis is a separate, unbuilt piece.
- **Needs a human / domain check:** whether a given recurring category (e.g. comms-staff headcount, ministerial briefings, contract registers) is *legally and practically* publishable proactively is a judgement for agency OIA/privacy staff and a steward — not something metadata alone decides.

## Open follow-up questions

- **Council/LGOIMA repetitive-request analysis.** Councils are absent from PSC data but heavily represented on FYI; which councils and which categories (rates, consents, project costs, CCOs) repeat most? (Complements [council-data-questions.md](council-data-questions.md).)
- **Request-type composition of the volume leaders.** Can Police/Corrections/EQC OIA volumes be decomposed into personal-record vs policy requests from any published source? This is the load-bearing unverified point above.
- **Temporal repetition within a single body.** My cross-body measure is strong; the "same body, same question every quarter/year" measure (e.g. recurring spend/headcount requests to MBIE) needs a per-body time series — a good next pull.
- **Disclosure-log coverage.** Several agencies already publish OIA responses proactively ([MBIE](https://www.mbie.govt.nz/about/open-government-and-official-information/published-official-information-act-requests), [Ministry of Justice](https://www.justice.govt.nz/about/official-information-act-requests/), [IRD](https://www.ird.govt.nz/about-us/publications/responses-to-official-information-act-requests/2025-responses-to-oia-requests), [Treasury](https://www.treasury.govt.nz/publications/other-official-information/responses-oia-requests/official-information-act-oia-statistics), [Stats NZ](https://www.stats.govt.nz/about-us/official-information-act-requests/)) — how much of the *repetitive* topic set is already covered by these logs, and where's the gap?

## Sources

1. Public Service Commission — OIA statistics (datasets: consolidated `v_OIAStatisticsAllDataResults` CSV; `OIA-statistics-Jan-Jun-2025-FInal.xlsx`; `OIA-statistics-Jul-Dec-2025.xlsx`). https://www.publicservice.govt.nz/guidance/official-information/oia-statistics — accessed 2026-07-03 ([archive](https://web.archive.org/web/20260226192108/https://www.publicservice.govt.nz/guidance/official-information/oia-statistics)).
2. fyi.org.nz — authority list with per-body request counts. https://fyi.org.nz/body/list/all — accessed & scraped 2026-07-03.
3. fyi.org.nz — API / structured-data help (Alaveteli JSON/Atom/CSV surfaces). https://fyi.org.nz/help/api — accessed 2026-07-03.
4. New Zealand Police — "Police's Latest OIA Statistics" (Police report OIA stats separately from PSC). https://www.police.govt.nz/police-latest-oia-statistics — accessed 2026-07-03.
5. RNZ — "More than 20,000 official information requests so far this year, with Oranga Tamariki responding the slowest" (reports a PSC Jan–Jun half-year release; 99 agencies / 26,505 requests excluding Police; Corrections & Toka Tū Ake EQC top volume with >5,000 each). https://www.rnz.co.nz/news/national/497922/more-than-20-000-official-information-requests-so-far-this-year-with-oranga-tamariki-responding-the-slowest — accessed 2026-07-03.
6. RNZ — "Police, Corrections have most OIA complaints." https://www.rnz.co.nz/news/national/323503/police,-corrections-have-most-oia-complaints — accessed 2026-07-03.
7. Ombudsman NZ — "OIA compliance and practice in Department of Corrections 2022." https://www.ombudsman.parliament.nz/resources/oia-compliance-and-practice-department-corrections-2022 — accessed 2026-07-03.
8. Agency proactive-release / OIA disclosure logs: MBIE https://www.mbie.govt.nz/about/open-government-and-official-information/published-official-information-act-requests ; Ministry of Justice https://www.justice.govt.nz/about/official-information-act-requests/ ; IRD https://www.ird.govt.nz/about-us/publications/responses-to-official-information-act-requests/2025-responses-to-oia-requests ; The Treasury https://www.treasury.govt.nz/publications/other-official-information/responses-oia-requests/official-information-act-oia-statistics ; Stats NZ https://www.stats.govt.nz/about-us/official-information-act-requests/ — all accessed 2026-07-03.
9. Sibling finding — "NZ council-data demand clusters around rates, project costs, contracts, decisions, and service performance" (research/findings/civic-transparency/council-data-questions.md).
</content>
</invoke>
