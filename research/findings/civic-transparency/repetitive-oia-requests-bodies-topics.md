---
title: "NZ OIA volume is concentrated in a few agencies; the publicly visible repeat requests cluster around spending, staffing, contracts, and briefings"
domain: "civic-transparency"
issue: "#201"
confidence: "Medium"
author: "adam91holt"
agent: "claude"
model: "claude-opus-4-8[1m]"
date: "2026-07-03"
status: "draft"
---

# NZ OIA volume is concentrated in a few agencies; the publicly visible repeat requests cluster around spending, staffing, contracts, and briefings

## Executive answer

- **Central-government OIA volume is extraordinarily concentrated.** In calendar 2025, the ~104 agencies that report to the Public Service Commission (PSC) completed **151,619 OIA requests**; **New Zealand Police alone completed 64,058 (≈42%)**, and Police + the Natural Hazards Commission (former EQC) + the Department of Corrections together accounted for **~66%** ([PSC OIA statistics, Jul–Dec 2025 & Jan–Jun 2025 datasets](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics); my parse of the two workbooks — reproduced independently by the PR reviewer). PSC stats **exclude local councils** (they operate under LGOIMA and report separately).
- **Hypothesis (flagged, not proven): the three volume leaders may skew to individualised / operational record requests rather than public-interest policy requests.** The only de-identified signal I have is that they barely appear in the public FYI archive relative to their official volume — Police 64k/yr official vs **2,076 total on FYI**, Corrections 17k/yr vs 471, whereas the Ministry of Health (a policy ministry) has ~2,000/yr official and a *similar* **2,064 on FYI** ([PSC data](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics); [FYI authority list](https://fyi.org.nz/body/list/all)). That gap is **consistent with** an operational/personal-record tilt, but it is **not measured** and has other plausible causes (requester and channel behaviour, FYI's own guidance/moderation, or those agencies disclosing via their own logs rather than FYI). Treat this as a lead to test against agency request-*type* breakdowns, not a conclusion — see "What would change this conclusion."
- **On the public FYI archive** (34,487 requests across 703 active bodies), the most-requested authorities are **NZ Police, Ministry of Health, MBIE, University of Otago, ACC**, plus heavy council representation (Auckland Council/Transport, Wellington, Christchurch) that is invisible in PSC stats ([FYI authority list](https://fyi.org.nz/body/list/all); per-authority counts preserved in the [committed sample](../../data/oia-title-sample/sample-2026-07-03.json)).
- **The recurring *topics*** (from a **committed, reproducible 795-title FYI sample**, [data note](../../data/oia-title-sample/README.md)) cluster around **spending/budgets, roading/transport, education, policy/advice, health/waitlists, correspondence/meetings, statistics ("number of…"), staffing/headcount, contracts/consultants, and ministerial briefings** — the administrative-accountability staples. **44%** of sampled titles match ≥1 such cluster ([committed sample](../../data/oia-title-sample/sample-2026-07-03.json)).
- **"Repetitive" is real but its *magnitude* is not pinnable from public title metadata alone (Low confidence on any rate).** In the committed sample, only **~2%** of titles have a strict-normalised form (years/numbers stripped) that recurs ≥2× — far below the un-auditable "~23%" my earlier, uncommitted, larger scrape reported; I have **withdrawn that figure** (see data note). The cleanest, *verifiable* repetition signal is **cross-body campaigns**: e.g. the identical title "Use of small desk fans" sent to **≥6 different agencies** ([FYI search](https://fyi.org.nz/search/desk%20fans/newest)). True semantic duplication needs the request *bodies*, which contain personal data and were not touched.

**Overall confidence:** Medium overall — the *which-bodies* volume picture is High (primary PSC data, independently reproduced by the reviewer); the *which-topics* picture is Medium (reproducible ~44% themed-share, committed sample); the *individualised-request tilt* and any precise *repetition rate* are **Low** (inferred / not pinnable from committable public metadata).

## Evidence

### Method and data provenance (read this first — it bounds every number below)

All figures use **aggregate, de-identified public metadata only**. Two sources:

1. **PSC OIA statistics** — the official half-yearly collection of OIA requests *completed* by central-government agencies. I downloaded the consolidated `v_OIAStatisticsAllDataResults` CSV and the per-period Excel workbooks (Jan–Jun 2025, Jul–Dec 2025) from the [PSC OIA statistics page](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics) ([Wayback snapshot](https://web.archive.org/web/20260226192108/https://www.publicservice.govt.nz/guidance/official-information/oia-statistics)). Rows labelled `Agency Type Totals` (category roll-ups) were excluded from per-agency rankings.
2. **fyi.org.nz** — the public OIA request archive (an [Alaveteli](https://fyi.org.nz/help/api) instance run by the NZ Council for Civil Liberties). I scraped only **per-authority request counts** and **request titles** (public, shown on every listing page). **No request bodies, no requester names, no correspondence were collected or stored.** Personal names of apparently-private individuals are redacted in the preserved titles; public-interest named matters are retained (same rule as the sibling council finding). The FYI title analysis is **committed and reproducible**: the script [`scripts/research/fyi-oia-title-sample.mjs`](../../../scripts/research/fyi-oia-title-sample.mjs) regenerates it, and the raw sample (every sampled title, with FYI request IDs, plus the cluster/recurrence/cross-body tallies) is preserved in [`research/data/oia-title-sample/`](../../data/oia-title-sample/README.md) so a reviewer can audit the numbers rather than trust a scrape.

**Honesty note.** The finding's *first* run used a larger, authority-concentrated title sample that was **not checked into the PR** (its "n = 3,869" and "~23% near-duplicate rate"). Reconstructing those exact titles from memory would be fabrication, so I have **replaced them with a smaller, fully-committed re-run** (10 top bodies × up to 6 listing pages ≈ 795 unique titles, accessed 3 July 2026) and report what that committed sample actually yields. FYI pages are mutable and default to most-recent order, so this is a dated, reproducible-as-of-access record, not a frozen fixture.

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

### A hypothesis (flagged): the volume leaders may skew to operational / personal-record requests

A plausible reading is that the three volume leaders field mostly **individualised or operational record requests** — the kind an individual makes about *their own* matter (a crash report, a criminal-history/vetting check, a claim file, a prisoner's own records), not the policy/accountability questions the "open by default" idea targets. **This is a hypothesis, not a measured result.** The only de-identified signal I have is the gap between official volume and public-archive presence:

| Agency | PSC official (2025, per year) | FYI archive (all-time) | FYI as % of official/yr |
|---|---|---|---|
| New Zealand Police | 64,058 | 2,076 | ~3% |
| Department of Corrections | 17,024 | 471 | ~3% |
| Ministry of Health (Manatū Hauora, policy ministry) | ~2,000 | 2,064 | ~100%+ |

Police receive ~30× Health's official volume yet a *similar* number of public FYI requests ([PSC data](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics); [FYI authority list](https://fyi.org.nz/body/list/all)). This is **consistent with** an operational/personal-record tilt, but the FYI ratio does **not** measure request-type composition, and low FYI representation has other plausible causes: requester and channel behaviour, FYI's own guidance or moderation about personal-information requests, agency-specific advice, or those agencies disclosing through their own logs rather than via FYI. The finding cannot distinguish these from the ratio alone. What would settle it is an agency request-*type* breakdown (many agencies internally tag "personal information" vs "policy/other" OIA requests) — see "What would change this conclusion."

**Tentative implication for the stream (contingent on the hypothesis holding):** *if* the tilt is real, "open by default" candidates are better sought among the *policy/administrative* request stream (best seen on FYI and in agency disclosure logs) than among the raw PSC volume — otherwise one might wrongly conclude the answer is "publish crash reports and prisoner files," which are inherently personal. This implication weakens if those agencies in fact field large volumes of *policy* requests that simply never reach FYI.

### Which bodies dominate the *public* archive (FYI)

FYI corpus = **34,487 requests** across 703 active authorities (≈34.5k is also the ceiling implied by the highest request ID observed, ~34,400). Top authorities ([FYI authority list](https://fyi.org.nz/body/list/all), scraped 2026-07-03; the ten bolded/top counts below were re-verified against each authority page and are preserved in the [committed sample](../../data/oia-title-sample/sample-2026-07-03.json)):

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

### Which *topics* recur (title clustering, committed n = 795 sampled titles)

Sample: the ten highest-volume FYI authorities (Police, Health, MBIE, Otago, ACC, Justice, Auckland Transport, Auckland Council, Education, Wellington) at up to six listing pages each, plus a site-wide "recent" slice, accessed 3 July 2026 — **795 unique titles, every one preserved with its FYI request ID** in the [committed sample](../../data/oia-title-sample/sample-2026-07-03.json) and regenerable via [`scripts/research/fyi-oia-title-sample.mjs`](../../../scripts/research/fyi-oia-title-sample.mjs). Keyword clusters over **titles only** (non-exclusive; a title can match several; the exact regexes are in the script):

| Topic cluster | Titles | Share |
|---|---|---|
| Roading / transport / speed | 61 | 7.7% |
| Spending / expenditure / budgets | 54 | 6.8% |
| Education / school / student | 54 | 6.8% |
| Policy / guidelines / advice | 53 | 6.7% |
| Health / hospital / clinical / waitlist | 45 | 5.7% |
| Correspondence / emails / meetings / minutes | 37 | 4.7% |
| Statistics / "number of…" / data | 26 | 3.3% |
| Immigration / visa | 26 | 3.3% |
| Complaints / investigations / misconduct | 25 | 3.1% |
| Contracts / procurement / consultants | 23 | 2.9% |
| Staffing / headcount / restructure | 15 | 1.9% |
| Ministerial briefings / Cabinet / advice-to-minister | 11 | 1.4% |

**44%** of titles match ≥1 cluster ([committed sample](../../data/oia-title-sample/sample-2026-07-03.json)). The health/transport/education weighting partly reflects the sample (top authorities include Health, NZTA-adjacent transport bodies, and a university); the **domain-neutral accountability staples** — spending, staffing/headcount, correspondence, policy/advice, statistics, contracts/consultants, ministerial briefings — are the categories that recur *across* body types and are the natural "publish-proactively" candidates. This matches the sibling council-data finding, which independently found council-data demand clustering on "rates, project costs, contracts, decisions, and service performance" ([research/findings/civic-transparency/council-data-questions.md](council-data-questions.md)). Treat the per-cluster shares as **rank-order indicative**, not precise — a different body mix or access date would shift them.

### How *repetitive* is it? (Low confidence on any rate)

Two de-identified measures from titles, both computed in the committed sample:

- **Strict normalised-title recurrence — low, and honestly withdrawn from the headline.** Lower-casing and replacing years/numbers with placeholders, only **~2% (17/795)** of sampled titles share a normalised form that appears ≥2× ([committed sample](../../data/oia-title-sample/sample-2026-07-03.json)). This is **far below the "~23%"** my *first, uncommitted, larger* scrape reported; because that scrape was never checked in and I cannot reproduce ~23% from any committable sample, **I have withdrawn the 23% figure.** The honest statement is that strict title-level near-duplication in a committable sample is *low*, and the true rate is not pinnable from titles alone.
- **Cross-body campaign requests — the strongest, cleanest, and *verifiable* signal.** Within the committed sample, 5 normalised titles recur across ≥2 sampled bodies (e.g. "CCTV and ANPR Cameras" across Auckland Transport, Auckland Council, and Wellington). The clearest *verified* campaign is surfaced by full-text search: the **identical title "Use of small desk fans"** appears under at least **six different agencies** — MBIE, Ministry of Justice, Ministry of Education, MSD, Oranga Tamariki, and Ministry of Health — on the first page of results ([FYI search: "desk fans"](https://fyi.org.nz/search/desk%20fans/newest)). These counts are **lower bounds** (a per-body sample and a first search page under-count campaign spread).

  *Note on earlier campaign claims:* my first draft also asserted a comms/PR-staff-headcount campaign to "≥10 agencies" and a public-sector-board-diversity stocktake to "≥9 agencies." I could **not** re-verify those specific counts from the public search at review time, so I have **removed them** rather than leave unaudited numbers. FYI search does show a real cross-body *board-appointments* campaign by a single requester spanning several regulatory boards and ministers, but I am not attaching a precise agency count to it.

**A defensible definition of "repetitive":** a request is repetitive to the degree that a de-identified normalisation of its *title* (and, with the #200 pipeline, its redacted *body*) matches other requests — either **(a) the same body answering the same question in successive periods** (temporal repetition) or **(b) the same question sent to many bodies** (cross-body/campaign repetition). Both are visible in public title metadata; the fraction that are true semantic duplicates (same information need, different wording) can only be pinned down from request bodies, which carry personal data. Hence the honest position: strict title-level near-duplication in the committed sample is *low (~2%)*, specific cross-body campaigns are real and verifiable, and the overall repetition magnitude is **unknown-but-plausibly-higher** once wording variation and body text are accounted for — hence **Low** confidence on any single rate.

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 / corroboration | Confidence |
|---|---|---|---|
| NZ Police is **by far the single largest** OIA-receiving agency | [PSC OIA statistics datasets](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics) (primary; my parse: 64,058 of 151,619) | *The qualitative "largest by far" is corroborated:* [Police report OIA stats separately](https://www.police.govt.nz/police-latest-oia-statistics) precisely because their volume dwarfs others, and RNZ notes [Police & Corrections top OIA complaints/volume](https://www.rnz.co.nz/news/national/323503/police,-corrections-have-most-oia-complaints). **The precise ≈42% share is single-sourced (PSC workbooks only)** — neither second source states it. | High for "largest"; ≈42% flagged single-source (PSC) |
| Three bodies (Police, EQC/Natural Hazards Commission, Corrections) field **~two-thirds** of central-govt OIA volume | [PSC data](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics) (my parse: 66%; the two workbook totals were **independently reproduced by the PR reviewer**) | *Direction only:* RNZ on a PSC release says "[Corrections and Toka Tū Ake EQC received the most requests… over 5000 each](https://www.rnz.co.nz/news/national/497922/more-than-20-000-official-information-requests-so-far-this-year-with-oranga-tamariki-responding-the-slowest)" — corroborating the *concentration/ranking* but **not the 66% number**, and that release *excludes* Police. **The exact ~66% is single-sourced (PSC primary).** | High for concentration; exact ~66% flagged single-source (PSC) |
| **Hypothesis (flagged, not a conclusion):** the volume leaders skew to individualised/operational rather than public-interest policy requests | Official-vs-FYI ratio (~3% for Police/Corrections vs ~100% for MoH) computed from [PSC data](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics) + [FYI](https://fyi.org.nz/body/list/all) | *Single inferred line of evidence; the FYI ratio does not measure request type and has alternative causes (see the hypothesis section). No source directly supports it.* | **Low** — inferred, one-sourced, explicitly flagged |
| A verifiable **cross-body campaign** exists: identical title "Use of small desk fans" sent to **≥6 agencies** | [FYI search results for "desk fans"](https://fyi.org.nz/search/desk%20fans/newest) (MBIE, Justice, Education, MSD, Oranga Tamariki, Health on page 1) | The same six requests are independently visible on each agency's own FYI page; preserved in the [committed sample](../../data/oia-title-sample/sample-2026-07-03.json) | High (directly observable, two views) |
| Accountability topics account for ~**44%** of sampled titles; strict title near-duplication is ~**2%** | [Committed 795-title sample](../../data/oia-title-sample/sample-2026-07-03.json) + [reproducible script](../../../scripts/research/fyi-oia-title-sample.mjs) | *Single source (my own committed sample). Direction of the topic mix is corroborated by [council-data-questions.md](council-data-questions.md); the exact shares are one-sourced.* The earlier "~23%" is **withdrawn** (unreproducible). | **Low** — single-sourced, sample-dependent, flagged |

## What would change this conclusion

- **A full-corpus title/body analysis instead of the committed 795-title sample.** My topic shares come from a ten-body, six-page sample; a complete, evenly-weighted pull of all ~34,500 FYI requests (and per-council disclosure logs) could shift the topic mix and the repetition rate materially. Treat the topic percentages as *rank-order indicative*, not precise. In particular, a denser/full pull is the way to establish a *defensible* near-duplicate rate — my committable sample gives only ~2%, and the withdrawn "~23%" from the uncommitted first run could not be reproduced.
- **Access to redacted request bodies (the #200 pipeline).** True semantic-duplicate detection needs bodies, which I deliberately did not touch. If bodies were safely de-identified and clustered, the "repetitive" share would likely rise above the title-only ~2% — but by how much is unverified.
- **The individualised-vs-public-interest split is inferred, not measured.** I infer it from the official-vs-FYI volume ratio; I could **not** verify from a source what proportion of Police/EQC/Corrections OIAs are personal-record requests. An agency breakdown of request *types* (many agencies internally tag "personal information" vs "policy" requests) would confirm or refute it. If those agencies actually field large volumes of *policy* requests that simply never reach FYI, the "look elsewhere for open-by-default candidates" recommendation weakens.
- **PSC coverage gaps.** PSC stats exclude local government (LGOIMA), Parliament, the courts, and some smaller bodies; the consolidated CSV also showed duplicated values for 2015–2016 half-years (a data-quality artifact I excluded). A council-side LGOIMA volume analysis is a separate, unbuilt piece.
- **Needs a human / domain check:** whether a given recurring category (e.g. comms-staff headcount, ministerial briefings, contract registers) is *legally and practically* publishable proactively is a judgement for agency OIA/privacy staff and a steward — not something metadata alone decides.

## Open follow-up questions

- **Council/LGOIMA repetitive-request analysis.** Councils are absent from PSC data but heavily represented on FYI; which councils and which categories (rates, consents, project costs, CCOs) repeat most? (Complements [council-data-questions.md](council-data-questions.md).)
- **Request-type composition of the volume leaders.** Can Police/Corrections/EQC OIA volumes be decomposed into personal-record vs policy requests from any published source? This is the load-bearing unverified point above.
- **Temporal repetition within a single body.** Cross-body campaigns are verifiable (desk fans → ≥6 agencies); the "same body, same question every quarter/year" measure (e.g. recurring spend/headcount requests to MBIE) needs a per-body time series — a good next pull, and the likeliest place a higher near-duplicate rate would show up.
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
10. Committed FYI title sample and reproducible sampler — `research/data/oia-title-sample/sample-2026-07-03.json` and `scripts/research/fyi-oia-title-sample.mjs` (this PR). Accessed 2026-07-03.
11. fyi.org.nz — full-text search, "desk fans" (cross-body campaign evidence). https://fyi.org.nz/search/desk%20fans/newest — accessed 2026-07-03.
