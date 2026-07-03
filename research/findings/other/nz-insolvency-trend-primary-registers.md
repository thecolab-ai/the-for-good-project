---
title: "NZ company liquidations have roughly doubled since 2021 and 2026 year-to-date is the highest since 2010, but receiverships and voluntary administrations are small and off their 2024 peaks"
domain: "other"
issue: "#272"
confidence: "High"
author: "claude"
agent: "claude"
model: "claude-opus-4-8"
date: "2026-07-03"
status: "draft"
---

# NZ company liquidations have roughly doubled since 2021 and 2026 year-to-date is the highest since 2010, but receiverships and voluntary administrations are small and off their 2024 peaks

This is the **trend child of Stream #257** (`Part of #257. Stream: #257.`). Its job is the clean, primary-register time series: liquidations, receiverships, and voluntary administrations over time and into 2026, the right denominator for a rate, and a correction of the loose "rising month on month" wording the discover framing flagged. It uses aggregate counts only and names no company, director, appointee, creditor, or employee. It deliberately does **not** cover the who/why/ripple/support questions — those are the other children (#273–#276).

## Executive answer

- **Company liquidations have roughly doubled in four years.** Companies Office annual statistics show liquidations rose from **1,379 in 2021** to **1,550 (2022)**, **1,823 (2023)**, **2,502 (2024)**, and **2,867 in 2025** — the highest calendar-year total since **2010 (3,024)**, though still below the 2008–2010 GFC-era peak (**3,431 in 2009**). [Companies Office annual CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/yearly-company-statistics-since-2001.csv)
- **2026 year-to-date is elevated but not "rising every month."** January–June 2026 liquidations total **1,411**, above the same six months of 2025 (**1,296**), 2024 (**1,131**), and 2023 (**837**) — the highest first-half since 2010. But within 2026 the monthly path is **117 → 285 → 299 → 198 → 253 → 259**: it fell sharply from March to April before recovering, so "continuing to rise month on month" is inaccurate. The safe claim is "year-to-date running above recent years." [Companies Office monthly CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/monthly-company-statistics-since-2001.csv)
- **The rise is a *rate* rise, not just more companies.** Registered companies grew only **6.6%** from 2021 (698,163 at 31 Dec 2021) to 2025 (744,378 at 31 Dec 2025), while liquidations grew **108%**. The liquidation rate roughly doubled, from about **2.0 per 1,000 registered companies (2021)** to about **3.9 per 1,000 (2025)**. Denominator growth explains almost none of the increase. [Companies Office latest company statistics](https://www.companiesoffice.govt.nz/insights-and-articles/latest-company-statistics/); [Companies Office annual CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/yearly-company-statistics-since-2001.csv)
- **The surge is overwhelmingly a *liquidations* story.** Receiverships (185 in 2024, easing to 171 in 2025) and voluntary administrations (73 in 2024, halving to 42 in 2025) are an order of magnitude smaller than liquidations, are volatile, and **both peaked in 2024** — not 2025 or 2026. First-half 2026 receiverships (63) are running below H1 2025 (77) and H1 2024 (73). [Companies Office annual CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/yearly-company-statistics-since-2001.csv); [Companies Office monthly CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/monthly-company-statistics-since-2001.csv)
- **The Insolvency and Trustee Service (Official Assignee) covers only a subset — about a tenth — of liquidations.** ITS publishes month-by-month totals of liquidations the Official Assignee administers since 2013; the OA was appointed liquidator in **10.6%** of NZ liquidations in 2022/23 (**254 companies**), so ITS data is **not** a whole-of-market series and must not be substituted for the Companies Office register counts. [ITS corporate insolvency statistics](https://www.insolvency.govt.nz/about/statistics/corporate-insolvency-statistics); [ITS Statistical Data Report 2022/23](https://www.insolvency.govt.nz/assets/pdf/Statistical-Data-Reports/its-statistical-data-report-2022-23.pdf) ([archived PDF](https://web.archive.org/web/20260201081220/https://www.insolvency.govt.nz/assets/pdf/Statistical-Data-Reports/its-statistical-data-report-2022-23.pdf))

**Overall confidence:** High — the trend, the 2026 year-to-date, the repeated January low, and the rate are read directly from the Companies Office primary CSVs (fetched and summed independently). The ITS subset share is Medium (one report, corroborated by my own sum of the live ITS table).

## Evidence

All Companies Office figures below were fetched with `curl` from the official CSV/HTML endpoints on 3 July 2026 and re-summed independently; the register-stock quarter-end counts were read from the Companies Office "Latest company statistics" page's quarterly commentary.

### The liquidation time series (calendar year, primary register)

| Year | Liquidations | Receiverships | Voluntary administrations |
|---|---|---|---|
| 2019 | 1,768 | 97 | 44 |
| 2020 | 1,447 | 106 | 27 |
| 2021 | 1,379 | 78 | 18 |
| 2022 | 1,550 | 65 | 31 |
| 2023 | 1,823 | 102 | 43 |
| 2024 | 2,502 | 185 | 73 |
| 2025 | 2,867 | 171 | 42 |
| 2026 (Jan–Jun) | 1,411 | 63 | 16 |

Source for every cell: [Companies Office annual CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/yearly-company-statistics-since-2001.csv) (2019–2025) and [Companies Office monthly CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/monthly-company-statistics-since-2001.csv) (2026 first-half, summed from the six monthly rows).

Liquidations fell to a low of **1,379 in 2021**, then rose in every subsequent full year to **2,867 in 2025**. The 2025 total is the highest annual count since **2010 (3,024)** and exceeds 2011 (2,744), but remains below the GFC peak of **3,431 in 2009**. [Companies Office annual CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/yearly-company-statistics-since-2001.csv)

### 2026 year-to-date: above prior years, but not monotonic

First-half (January–June) liquidation totals, summed from the monthly CSV: **837 (2023)**, **1,131 (2024)**, **1,296 (2025)**, **1,411 (2026)**. So 2026 is the highest first-half since 2010 and about **9% above** the same period in 2025. [Companies Office monthly CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/monthly-company-statistics-since-2001.csv)

Within 2026 the monthly sequence is **Jan 117, Feb 285, Mar 299, Apr 198, May 253, Jun 259**. Liquidations *fell 34%* from March to April before recovering — so the discover-issue's "continuing to rise month on month" phrasing overstates the pattern. June 2026 alone recorded **259 liquidations, 19 receiverships, and 3 voluntary administrations**. [Companies Office monthly CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/monthly-company-statistics-since-2001.csv); [Companies Office latest company statistics](https://www.companiesoffice.govt.nz/insights-and-articles/latest-company-statistics/)

**Month-on-month comparisons are the wrong lens for this question.** January starts from a low base every year in the monthly CSV — 41 (2021), 47 (2022), 53 (2023), 63 (2024), 95 (2025), 117 (2026) — and the issue is whether 2026 is elevated against recent years, not whether each month exceeds the last. The right frames are **year-on-year** for a given month or **cumulative year-to-date**, both of which show 2026 above prior years. [Companies Office monthly CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/monthly-company-statistics-since-2001.csv)

### Choosing the denominator: the rate roughly doubled

Raw counts conflate "more failures" with "more companies exist." The matching universe for a *company* liquidation is the stock of registered companies, which the Companies Office reports each quarter: **698,163 (31 Dec 2021)**, **733,219 (31 Dec 2024)**, **744,378 (31 Dec 2025)**, **749,895 (31 Mar 2026)**, and **756,821 (30 Jun 2026)**. [Companies Office latest company statistics](https://www.companiesoffice.govt.nz/insights-and-articles/latest-company-statistics/)

Dividing annual liquidations by the year-end register stock:

| Year | Liquidations | Registered companies (year-end) | Rate per 1,000 |
|---|---|---|---|
| 2021 | 1,379 | 698,163 | ~2.0 |
| 2024 | 2,502 | 733,219 | ~3.4 |
| 2025 | 2,867 | 744,378 | ~3.9 |

The register grew **6.6%** from 2021 to 2025 while liquidations grew **108%**, so the increase is a genuine rise in the *failure rate*, not an artefact of a bigger register. [Companies Office annual CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/yearly-company-statistics-since-2001.csv); [Companies Office latest company statistics](https://www.companiesoffice.govt.nz/insights-and-articles/latest-company-statistics/)

An alternative denominator — Stats NZ's count of economically active **enterprises** (617,330 at February 2025, which includes non-company forms such as sole traders and partnerships) — gives a 2025 rate of about **4.6 per 1,000**. It is a broader "business activity" denominator but a looser match for *company* liquidations, so the register stock is the better primary denominator; the enterprise figure is offered only as a cross-check. [Stats NZ business demography 2025](https://www.stats.govt.nz/information-releases/new-zealand-business-demography-statistics-at-february-2025/)

### Receiverships and voluntary administrations are small and already past their peak

Receiverships and voluntary administrations are appointment types quite distinct from liquidation and are an order of magnitude rarer. Receiverships rose from **78 (2021)** to a peak of **185 (2024)**, then eased to **171 (2025)**; first-half 2026 receiverships total **63**, below H1 2025 (77) and H1 2024 (73). Voluntary administrations rose from **18 (2021)** to **73 (2024)**, then roughly halved to **42 (2025)**; H1 2026 totals just **16**. [Companies Office annual CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/yearly-company-statistics-since-2001.csv); [Companies Office monthly CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/monthly-company-statistics-since-2001.csv)

The implication for the stream: the "insolvency surge" headline is really a **liquidations** surge. Receiverships and voluntary administrations both turned down after 2024, which does not fit a simple "everything is getting worse in 2026" narrative and should temper any single-number framing. [Companies Office annual CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/yearly-company-statistics-since-2001.csv)

### The Insolvency and Trustee Service series is a subset, not the whole

The Insolvency and Trustee Service (ITS, the Official Assignee's office within MBIE) publishes **liquidations that the Official Assignee administers**, month by month by High Court registry since 2013 — explicitly "those liquidations that have been administered by the Insolvency and Trustee Service only." [ITS corporate insolvency statistics](https://www.insolvency.govt.nz/about/statistics/corporate-insolvency-statistics)

The Official Assignee is appointed in only a minority of company liquidations. The ITS report says the Official Assignee can become liquidator by Court appointment or through a special-resolution route connected to the Official Assignee's voting rights in another liquidation; it then reports that **2,389** companies were placed into liquidation in 2022/23 and the Official Assignee was appointed liquidator of **254** of them (**10.6%**). [ITS Statistical Data Report 2022/23](https://www.insolvency.govt.nz/assets/pdf/Statistical-Data-Reports/its-statistical-data-report-2022-23.pdf) ([archived PDF](https://web.archive.org/web/20260201081220/https://www.insolvency.govt.nz/assets/pdf/Statistical-Data-Reports/its-statistical-data-report-2022-23.pdf)) I independently corroborated the scale of this subset: summing the live ITS monthly OA-administered table across the 2022/23 financial year (July 2022 – June 2023) gives **≈251** appointments, close to the report's 254. [ITS monthly ITS-administered liquidations](https://www.insolvency.govt.nz/about/statistics/corporate-insolvency-statistics/monthly-its-administered-liquidations)

Two cautions follow. First, **ITS ≠ total**: the OA-administered series covers only about a tenth of liquidations, so it cannot stand in for the Companies Office whole-of-market count. Second, **the two official sources should not be mixed without a methods note**: ITS reports a whole-of-market figure of 2,389 for the 2022/23 financial year, whereas the Companies Office register series records roughly 1,750–1,800 liquidations across a comparable period when summed from its monthly register CSV. I did not verify the precise reason for that gap, so it remains an unresolved reconciliation problem rather than a reason to prefer one series inside the other. Summing the ITS OA-administered table also shows the subset rising alongside the whole (roughly 251 in FY2022/23 to the high-500s in FY2024/25, on my own aggregation), consistent with the Companies Office trend. [ITS corporate insolvency statistics](https://www.insolvency.govt.nz/about/statistics/corporate-insolvency-statistics); [Companies Office monthly CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/monthly-company-statistics-since-2001.csv)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Liquidations roughly doubled 2021→2025 (1,379 → 2,867); 2025 is the highest calendar year since 2010 and 2026 H1 the highest first-half since 2010. | [Companies Office annual CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/yearly-company-statistics-since-2001.csv) | [Companies Office monthly CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/monthly-company-statistics-since-2001.csv) | High |
| "Rising month on month" is wrong: 2026 liquidations fell 34% March→April before recovering; January starts from a low base in each recent year. | [Companies Office monthly CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/monthly-company-statistics-since-2001.csv) | [Companies Office latest company statistics (June 2026 monthly counts)](https://www.companiesoffice.govt.nz/insights-and-articles/latest-company-statistics/) | High |
| The rise is a rate rise: register stock grew ~6.6% while liquidations grew ~108%, so the rate went from ~2.0 to ~3.9 per 1,000 companies. | [Companies Office latest company statistics (quarterly register stock)](https://www.companiesoffice.govt.nz/insights-and-articles/latest-company-statistics/) | [Companies Office annual CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/yearly-company-statistics-since-2001.csv) | High |
| Receiverships and voluntary administrations are small and both peaked in 2024, not 2025/2026. | [Companies Office annual CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/yearly-company-statistics-since-2001.csv) | [Companies Office monthly CSV](https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/monthly-company-statistics-since-2001.csv) | High |
| The Official Assignee administered about 10.6% of liquidations in 2022/23, so ITS is a subset, not a whole-of-market series. | [ITS Statistical Data Report 2022/23](https://www.insolvency.govt.nz/assets/pdf/Statistical-Data-Reports/its-statistical-data-report-2022-23.pdf) ([archived PDF](https://web.archive.org/web/20260201081220/https://www.insolvency.govt.nz/assets/pdf/Statistical-Data-Reports/its-statistical-data-report-2022-23.pdf)) | My independent sum of the [ITS monthly OA-administered table](https://www.insolvency.govt.nz/about/statistics/corporate-insolvency-statistics/monthly-its-administered-liquidations) (≈251 for FY2022/23) | Medium |

## What would change this conclusion

- **A register revision.** The Companies Office states its statistics are subject to change when register records change (e.g. a liquidation later reversed, or backdated appointments); a large revision to 2024–2026 could move the counts, though it is very unlikely to overturn the ~doubling since 2021. [Companies Office latest company statistics](https://www.companiesoffice.govt.nz/insights-and-articles/latest-company-statistics/)
- **A better within-year denominator.** I used year-end register stock for 2021/2024/2025; I could not directly fetch year-end stock for 2022 and 2023 (only quarter-end snapshots), so the rate table shows endpoints rather than every year. A full annual register-stock series would let a reviewer compute the rate for every year; it would sharpen, not reverse, the finding.
- **The ITS subset share.** The 10.6% figure is from a single 2022/23 ITS report; the live PDF URL returned 404 to my HTTP fetcher, so I verified the report through a Wayback snapshot and corroborated the share by summing the live ITS monthly table. If the OA-appointment share has drifted materially since 2022/23, the "about a tenth" phrasing would need updating — but this does not affect the Companies Office whole-of-market trend, which is the core result. [ITS Statistical Data Report 2022/23 archived PDF](https://web.archive.org/web/20260201081220/https://www.insolvency.govt.nz/assets/pdf/Statistical-Data-Reports/its-statistical-data-report-2022-23.pdf)
- **Could not verify:** exact 2022 and 2023 year-end register stock (used quarter-ends/endpoints instead); the precise methodological reason the ITS whole-of-market count (2,389 for FY2022/23) differs from the Companies Office comparable-period count (~1,750–1,800); and anything about *who* is failing or *why* (out of scope — see #273/#274).
- **A human is not required to trust these counts**, but a data-literate reviewer should re-run the two CSVs (they are ~10 KB each) to confirm the sums before this feeds any decision.

## Open follow-up questions

- Publish a full annual liquidation-rate series (every year 2001–2025) once the year-end register-stock column is extracted from the Companies Office annual data file — a small, mechanical add that would make the rate chart complete.
- Reconcile the ITS whole-of-market count with the Companies Office register series (definitions, dating, scope) so the project has one documented rule for which source to cite for "total liquidations." (Candidate for the sector/size child #273 or a short methods note.)
- The substantive who/why/ripple/support questions are already open as #273 (sectors, regions, sizes), #274 (drivers), #275 (creditor/employee ripple), and #276 (support gap); this trend finding is the denominator/time-series backbone they can normalise against.

## Sources

All sources accessed 3 July 2026. Fetch method: the two Companies Office CSVs and the "Latest company statistics" HTML were fetched with `curl` and parsed/summed locally; the ITS pages were read via WebFetch and `curl` (raw HTML tables parsed locally); the live ITS 2022/23 report PDF URL returned HTTP 404 to `curl`, so I used `node scripts/archive-cite.mjs` and verified the archived PDF with `pdftotext`.

1. Companies Office. "Company statistics for each calendar year since 2001" CSV. https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/yearly-company-statistics-since-2001.csv
2. Companies Office. "Company statistics for each calendar month since 2001" CSV (as at 30 June 2026). https://www.companiesoffice.govt.nz/assets/companies-office/company-statistics/monthly-company-statistics-since-2001.csv
3. Companies Office. "Latest company statistics" (last updated 3 July 2026; quarterly register-stock commentaries and June 2026 monthly counts). https://www.companiesoffice.govt.nz/insights-and-articles/latest-company-statistics/
4. Insolvency and Trustee Service. "Corporate insolvency statistics" (last updated 15 April 2026). https://www.insolvency.govt.nz/about/statistics/corporate-insolvency-statistics
5. Insolvency and Trustee Service. "Monthly ITS administered liquidations." https://www.insolvency.govt.nz/about/statistics/corporate-insolvency-statistics/monthly-its-administered-liquidations
6. Insolvency and Trustee Service. "Insolvency Statistics and Debtor Profile Report, 1 July 2022 to 30 June 2023." https://www.insolvency.govt.nz/assets/pdf/Statistical-Data-Reports/its-statistical-data-report-2022-23.pdf (archived: https://web.archive.org/web/20260201081220/https://www.insolvency.govt.nz/assets/pdf/Statistical-Data-Reports/its-statistical-data-report-2022-23.pdf)
7. Stats NZ. "New Zealand business demography statistics: At February 2025." https://www.stats.govt.nz/information-releases/new-zealand-business-demography-statistics-at-february-2025/
