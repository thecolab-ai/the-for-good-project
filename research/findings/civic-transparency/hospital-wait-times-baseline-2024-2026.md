---
title: "NZ ED, first-specialist-assessment and elective-treatment wait-time baseline (2024-2026), by district, ethnicity/rurality and specialty"
domain: "civic-transparency"
issue: "#732"
confidence: "High"
author: "claude-agent"
agent: "claude"
model: "claude-sonnet-5"
date: "2026-07-07"
status: "draft"
---

# NZ ED, first-specialist-assessment and elective-treatment wait-time baseline (2024-2026), by district, ethnicity/rurality and specialty

This is research child **#732 of Stream #434**. It answers one question: **what is the current (2024-2026) factual baseline for New Zealand's three hospital-wait government/health targets — shorter stays in ED, shorter wait for first specialist assessment (FSA), and shorter wait for elective treatment — broken down by district, population group and specialty, with quarter names, extraction dates and denominators reconciled across sources?**

## Executive answer

- NZ runs **two overlapping reporting regimes** for the same three wait measures: Health New Zealand's own **"5 health targets"** (effective 1 July 2024, covering ED, FSA, elective treatment, cancer treatment, immunisation) reported on Health NZ's own quarterly cycle, and the Department of the Prime Minister and Cabinet's **whole-of-government "Government Targets"** list, which only carries **two** of the three wait measures in this brief (ED as "Target 1", elective treatment as "Target 2" — FSA is *not* in the cross-government list) and is one quarter more lagged. The two regimes' published percentages agree once you match the actual quarter, but their factsheet headers can mislabel which quarter's data is inside — see Reconciliation below. [Health NZ, Health targets](https://www.healthnz.govt.nz/about-us/what-we-do/planning-and-performance/health-targets) (archived: [Wayback, 23 Mar 2026](https://web.archive.org/web/20260323230539/https://www.healthnz.govt.nz/about-us/what-we-do/planning-and-performance/health-targets)); [DPMC, Government Targets](https://www.dpmc.govt.nz/our-programmes/government-targets) (archived: [Wayback, 31 May 2026](https://web.archive.org/web/20260531195511/https://www.dpmc.govt.nz/our-programmes/government-targets)).
- **National baseline, most recent quarter (Q3 2025/26 = January–March 2026, published ~June 2026, data extracted 6–8 May 2026):** ED shorter-stays **74.4%** within 6 hours (target 95% by 2030, 2025/26 milestone 77%); FSA **61.2%** seen within 4 months (target 95%, milestone 65%); elective treatment **64.9%** treated within 4 months (target 95%, milestone 70%). All three are up on the same quarter a year earlier (74.2%, 58.2%, 57.3% respectively) but all three remain well below their own in-year milestones, let alone the 2030 target. [Health NZ, "5 and 10 years of results" Q3 25/26](https://static.info.content.health.nz/docs/publications/health-targets-5-and-10-years-of-results-q3-25-26.pdf).
- **District spread is large and the ranking differs by measure** — no district is best or worst on all three. For ED, West Coast (95.6%) and South Canterbury (91.8%) lead while Capital and Coast (57.6%) and MidCentral (59.2%) trail. For FSA, Lakes (87.9%) leads and Canterbury (50.8%) trails. For elective treatment, Wairarapa (89.8%) leads and Northland (50.9%) trails. [Health NZ, Results with ethnicity and rurality breakdown, Q3 25/26](https://static.info.content.health.nz/docs/publications/health-targets-results-with-ethnicity-and-rurality-breakdown-q3-25-26.pdf).
- **Population-group breakdown exists for ED, cancer treatment, immunisation and elective treatment (by ethnicity and rural/urban), but not for FSA** — Health NZ's own data-extract documentation states ethnicity is not captured on the FSA waitlist at all. Where it is captured, Māori and Pacific patients trend behind Asian and European/Other patients for elective treatment (Q3 25/26: Māori 62.9%, Pacific 62.9%, Asian 64.7%, Euro/Other 65.8%); for ED the gap is smaller and Asian patients lead (77.2%) with Euro/Other trailing (73.0%). [Health NZ, ethnicity/rurality breakdown Q3 25/26](https://static.info.content.health.nz/docs/publications/health-targets-results-with-ethnicity-and-rurality-breakdown-q3-25-26.pdf); [Health NZ, waitlist detailed data extract Q2 25/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx).
- **Specialty-level data (from Health NZ's raw monthly waitlist extract, month-end December 2025) shows the pressure concentrated in specific specialties, not spread evenly**: Orthopaedics is the worst-performing FSA specialty by a wide margin (43.5% seen within 120 days, 20,876 people overdue of 36,955 on the list — over a sixth of the entire national FSA overdue count). For elective treatment, Plastic Surgery (54.8%) and Orthopaedic Surgery (56.8%, 6,170 overdue — the largest overdue count of any elective specialty) are worst. [Health NZ, waitlist detailed data extract Q2 25/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx) — extraction and computation described below.

**Overall confidence:** High for the quantitative baseline itself — it is triangulated across three independent Health NZ/DPMC publication products (quarterly dashboard factsheets, DPMC Government Targets factsheets, and the raw waitlist extract) that agree to within rounding once quarters are matched. Medium for the *equity* framing specifically (see Surprising claims table) — the ethnicity/rurality breakdown is a single data system reported two ways, not two independent measurement systems, and FSA has no ethnicity breakdown at all.

## Evidence

### The framework and what "baseline" means here

The five health targets — faster cancer treatment, improved childhood immunisation, shorter ED stays, shorter FSA waits, shorter elective-treatment waits — were announced in March 2024 and took effect from 1 July 2024 under the Government Policy Statement on Health 2024–2027, with results published every quarter and a 2030 end-target for each measure. [Health NZ, Health targets](https://www.healthnz.govt.nz/about-us/what-we-do/planning-and-performance/health-targets). Separately, DPMC's whole-of-government "Government Targets" programme (nine targets spanning health, education, justice, welfare and more) carries only two of these as numbered cross-government targets — **Target 1 = shorter ED stays**, **Target 2 = shorter wait for elective treatment** — each with its own quarterly factsheet and a fixed baseline quarter of **September 2023**, pre-dating the 1 July 2024 target framework. FSA has no DPMC Target-programme factsheet; it is tracked only through Health NZ's own health-targets reporting. [DPMC, Target 1 factsheet, quarter ending Dec 2025 (published Mar 2026)](https://www.dpmc.govt.nz/sites/default/files/2026-03/gt-factsheet-target-1-dec25.pdf); [DPMC, Target 2 factsheet, quarter ending Mar 2026 (published Jun 2026)](https://www.dpmc.govt.nz/sites/default/files/2026-06/gt-factsheet-target-2-mar26.pdf).

This finding treats **Health NZ's own quarterly "Health targets performance resources"** as the primary baseline source (it is the most current, covers all three measures, and is the only one with district/ethnicity/rurality/specialty granularity), and uses the DPMC factsheets and NZ media reporting as cross-checks. [Health NZ, Health targets performance resources 2025/26](https://www.healthnz.govt.nz/publications/health-targets-performance-resources-2025-26).

### National quarterly trend, 2024–2026

Source: Health NZ, "Health Targets: 2025/26 Quarter 3 Last 5 years" and "…Last 10 years" trend sheets (chart-derived figures for each financial-year Q3; NZ health-target quarters run Q1 = Jul–Sep, Q2 = Oct–Dec, Q3 = Jan–Mar, Q4 = Apr–Jun). [Health NZ, "5 and 10 years of results" Q3 25/26](https://static.info.content.health.nz/docs/publications/health-targets-5-and-10-years-of-results-q3-25-26.pdf).

| Measure | Q3 21/22 | Q3 22/23 | Q3 23/24 | Q3 24/25 (Jan–Mar 2025) | Q3 25/26 (Jan–Mar 2026) | 2025/26 milestone | 2030 target |
|---|---|---|---|---|---|---|---|
| ED ≤6h | 78.2% | 71.9% | 70.1% | 74.2% | **74.4%** | 77% | 95% |
| FSA <4mo | 73.1% | 67.7% | 59.6% | 58.2% | **61.2%** | 65% | 95% |
| Elective <4mo | 60.9% | 56.4% | 59.3% | 57.3% | **64.9%** | 70% | 95% |

Volumes behind the Q3 25/26 percentages: 333,104 ED attendances (vs 333,642 same quarter prior year); 196,006 people on the FSA waitlist (vs 200,400); 77,941 on the elective-treatment waitlist (vs 82,190) — i.e. waitlist counts are falling even as the four-month-compliance percentage rises, consistent with Health NZ's own comment that "waiting lists peaked in early 2025, but were now reducing." [RNZ, "Government says it's improved on all five of its health targets", 24 Mar 2026](https://www.rnz.co.nz/news/political/590457/government-says-it-s-improved-on-all-five-of-its-health-targets).

**Within-FY2025/26 seasonal pattern (using DPMC/Beehive/RNZ quarterly reporting to fill in the quarters the Health NZ trend chart doesn't label):**

| Measure | Q1 25/26 (Jul–Sep 2025) | Q2 25/26 (Oct–Dec 2025) | Q3 25/26 (Jan–Mar 2026) |
|---|---|---|---|
| ED ≤6h | 68.9% (vs 67.5% Q1 24/25) | 74.2% (vs 72.1% Q2 24/25) | 74.4% (vs 74.2% Q3 24/25) |
| FSA <4mo | — (not separately reported) | 62.2% (vs 60.6% Q2 24/25) | 61.2% (vs 58.2% Q3 24/25) |
| Elective <4mo | 65.9% (referenced as "previous quarter" in the Q2 factsheet) | 64.5% (vs 59.2% Q2 24/25; 51,513 treated vs 46,841) | 64.9% (vs 57.3% Q3 24/25) |

Both DPMC factsheets and RNZ reporting attribute the Q1 (Jul–Sep, NZ winter) dip in ED performance explicitly to "increased winter demand (in line with historical patterns)," with results recovering in Q2/Q3. [DPMC, Target 1 factsheet, Dec 2025](https://www.dpmc.govt.nz/sites/default/files/2026-03/gt-factsheet-target-1-dec25.pdf); [DPMC, Target 2 factsheet, Mar 2026](https://www.dpmc.govt.nz/sites/default/files/2026-06/gt-factsheet-target-2-mar26.pdf).

### District-level results, Q3 2025/26 (Jan–Mar 2026) vs Q3 2024/25 (Jan–Mar 2025)

Source: Health NZ's own district-and-region results table, extracted 6–8 May 2026, all 20 districts and 4 regions. [Health NZ, ethnicity/rurality breakdown Q3 25/26](https://static.info.content.health.nz/docs/publications/health-targets-results-with-ethnicity-and-rurality-breakdown-q3-25-26.pdf).

**ED ≤6h — national 74.4% (Q3 24/25: 74.2%).** Best: West Coast 95.6%, South Canterbury 91.8%, Tairāwhiti 91.3%, Northland 83.9%, Lakes 83.4%. Worst: Capital and Coast 57.6%, MidCentral 59.2%, Waikato 66.5%, Whanganui 69.7%, Counties Manukau 70.5%. By region: Te Waipounamu 79.1%, Northern 74.6%, Te Manawa Taki 74.6%, Central | Te Ikaroa 67.3%.

**FSA <4mo — national 61.2% (Q3 24/25: 58.2%).** Best: Lakes 87.9%, South Canterbury 83.8%, MidCentral 74.8%, Wairarapa 70.5%, Whanganui 69.6%. Worst: Canterbury 50.8%, Southern 53.2%, Hawke's Bay 53.8%, Waikato 55.0%, Nelson Marlborough 55.1%. By region: Central | Te Ikaroa 64.6%, Northern 63.6%, Te Manawa Taki 61.8%, Te Waipounamu 54.0%.

**Elective <4mo — national 64.9% (Q3 24/25: 57.3%).** Best: Wairarapa 89.8%, West Coast 86.0%, MidCentral 81.3%, Lakes 75.5%, Bay of Plenty 75.0%. Worst: Northland 50.9%, Southern 53.3%, Taranaki 55.5%, Nelson Marlborough 58.7%, Whanganui 59.6%. By region: Central | Te Ikaroa 71.2%, Te Manawa Taki 71.2%, Northern 62.0%, Te Waipounamu 60.1%.

No district ranks in the top five *or* bottom five on all three measures — e.g. West Coast is the best ED performer but only mid-table on elective treatment (86.0%, still 4th nationally, so a partial exception), while MidCentral is the worst ED performer (59.2%) but a top-three FSA (74.8%) and elective (81.3%) performer. This is a real pattern, not noise: Health NZ publishes it as three separately-ranked district tables in the same document, and it recurs in the prior quarter's factsheets too (spot-checked against the Q2 25/26 national/district factsheet index). [Health NZ, district and regional factsheets 2025/26](https://www.healthnz.govt.nz/publications/district-and-regional-factsheets-2025-26).

### Population-group breakdown (ethnicity, rural/urban)

Source: same Health NZ document as above. Figures are Q3 25/26 nationally, Māori / Pacific / Asian / European-or-Other / Rural / Urban.

| Measure | Māori | Pacific | Asian | Euro/Other | Rural | Urban |
|---|---|---|---|---|---|---|
| ED ≤6h | 77.0% | 73.5% | 77.2% | 73.0% | 79.2% | 72.9% |
| FSA <4mo | *not published* | *not published* | *not published* | *not published* | *not published* | *not published* |
| Elective <4mo | 62.9% | 62.9% | 64.7% | 65.8% | 64.3% | 65.1% |

**FSA has no ethnicity or rurality breakdown at all** — Health NZ's own waitlist-extract documentation states plainly: "Note that ethnicity is not available for FSA waitlist." [Health NZ, waitlist detailed data extract Q2 25/26, "Contents" sheet](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx). This is a real gap in the baseline, not an oversight in this research: the single largest of the three waitlists (196,006 people) cannot be disaggregated by ethnicity in any Health NZ publication found.

Where ethnicity is published (ED, elective treatment, plus cancer and immunisation), Māori and Pacific patients trend behind Asian and European/Other patients for elective treatment specifically; the ED gap is smaller and runs the other way at the top (Asian highest, Euro/Other lowest). This direction is corroborated independently of the Q3 25/26 figures by the raw waitlist extract (see Specialty section below, which aggregates the same underlying national collections data at the individual-record level for the Dec 2025 month-end: elective treatment by ethnicity was Māori 64.0%, Pacific 61.5%, Asian 64.9%, European/Other 65.6% — same ordering, one month/quarter earlier). It is also consistent with prior reporting on Health NZ's now-discontinued "Equity Adjustor Score" waitlist-prioritisation tool, introduced specifically because "medical professionals in Auckland identified that Māori and Pasifika were disproportionately waiting for surgery compared with other population groups" during Covid-19, and because then-PM Chris Hipkins said there was evidence "Māori, Pasifika, rural people, and those in low-income communities have had to wait longer for clinical care than others." [RNZ, "Health NZ drops tool that factored in ethnicity for waitlists, despite review findings", 1 Aug 2024](https://www.rnz.co.nz/news/political/523825/health-nz-drops-tool-that-factored-in-ethnicity-for-waitlists-despite-review-findings). That article is a genuinely independent source (different origin, predates this quarter's data by 18 months, and documents the same review panel's own finding that it "was unable to determine whether the tools were effective at reducing inequities" — i.e. it is not simply repeating Health NZ's dashboard).

### Specialty-level breakdown

Health NZ's quarterly dashboards do not publish a specialty breakdown directly, but the **"waitlist detailed data extracts"** workbook — a raw, record-level export covering July 2015 to the current month, by measure / district / region / specialty (and, for the elective waitlist only, ethnicity) — does. [Health NZ, waitlist detailed data extract, Q2 25/26 vintage](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx). This research downloaded that workbook and aggregated it nationally by specialty for its latest month-end snapshot (**31 December 2025**, cells with counts of 1–4 are pre-masked by Health NZ as `<5` and were excluded from the aggregation, so totals slightly understate the true national count).

**FSA, worst five specialties by % seen within 120 days (national, 31 Dec 2025):**

| Specialty | Seen <120 days | Total waiting | Overdue | % within 120 days |
|---|---|---|---|---|
| Orthopaedics | 16,079 | 36,955 | 20,876 | 43.5% |
| Immunology | 485 | 990 | 505 | 49.0% |
| Endoscopy | 1,711 | 3,420 | 1,709 | 50.0% |
| Ear, Nose & Throat | 12,995 | 24,355 | 11,360 | 53.4% |
| Ophthalmology | 11,388 | 20,221 | 8,833 | 56.3% |

Best five: Oncology 97.3%, Thoracic 96.2%, Haematology 95.9%, Renal Medicine 93.2%, Infectious Disease 90.6%. National total from this extract: 198,424 waiting, 123,557 within 120 days = 62.3%, closely matching the officially published Q2 25/26 FSA result of 62.2% for the same month-end (a useful internal consistency check between the two publication products). Orthopaedics alone accounts for over a sixth of the entire national FSA overdue count (20,876 of roughly 74,867 nationally overdue).

**Elective treatment, worst five specialty groups (national, 31 Dec 2025):**

| Specialty | Treated <120 days | Total waiting | Overdue | % within 120 days |
|---|---|---|---|---|
| Plastic Surgery (excl. burns) | 2,440 | 4,452 | 2,012 | 54.8% |
| Orthopaedic Surgery | 8,126 | 14,296 | 6,170 | 56.8% |
| Dental Surgery | 3,088 | 5,208 | 2,120 | 59.3% |
| Maxillo-Facial Surgery | 465 | 781 | 316 | 59.5% |
| Otorhinolaryngology (ENT) | 5,733 | 9,284 | 3,551 | 61.8% |

Orthopaedic Surgery has the largest absolute overdue count (6,170) of any elective specialty even though five specialties have a worse percentage. National total from this extract: 77,617 waiting, 50,402 within 120 days = 64.9%, again closely matching the officially published quarter's national result. **Orthopaedics is the most consistently under-pressure specialty across both FSA and elective treatment** — it is the worst or near-worst performer on both waitlists, which is corroborated qualitatively by contemporaneous NZ Herald reporting naming orthopaedics-adjacent specialties (cardiology, plastics, haematology, renal medicine) among those with the fastest-growing referral volumes, though that reporting used September 2023 figures and did not break out orthopaedics specifically, so it is treated here as directional corroboration only, not a matched data point. [NZ Herald, "Overdue wait list for hospital specialist appointments balloons to 60,000"](https://www.nzherald.co.nz/nz/overdue-wait-list-for-hospital-specialist-appointments-balloons-to-60000-the-specialties-under-most-pressure/WRZ3OCCRIFDJ3EKHBVFDNENZFQ/).

District-level specialty cross-tabs are in the same raw extract (e.g. FSA by district, Dec 2025: Canterbury worst at 51.7%, Lakes best at 90.4% — directionally matching the officially published Q3 25/26 district chart, Canterbury 50.8%/Lakes 87.9%, one quarter apart) but are too granular (20 districts × ~20–35 specialties × up to 126 months) to reproduce in full here; the workbook itself is the citable source for anyone needing a specific district/specialty combination.

### Reconciling quarter names, extraction dates and denominators

This was the sharpest edge-case in this research and is worth stating plainly for whoever uses this baseline next:

1. **DPMC factsheet headers can be one quarter out of step with the data inside them.** The Target 1 (ED) factsheet dated "quarter ending December 2025" (published March 2026) actually reports the **September 2025 (Q1 25/26)** result of 68.9% in its "Current" field and narrative text — the header names the publication's nominal reporting quarter, not the quarter of the headline figure, which lags by roughly one quarter. Always read the "Current" field's own parenthetical date, not the factsheet's title/header. [DPMC, Target 1 factsheet](https://www.dpmc.govt.nz/sites/default/files/2026-03/gt-factsheet-target-1-dec25.pdf).
2. **DPMC and Health NZ use different baseline quarters for the same measure.** DPMC's Government Targets programme fixes its baseline at **September 2023** (pre-dating the health-target framework) for its own "how far from target" progress bar; Health NZ's own factsheets cite a different "Baseline" figure (e.g. 69.7% for ED, 61.5% for FSA, 62.2% for elective) that appears to be a full-financial-year baseline sourced from the Health New Zealand Statement of Performance Expectations 2025-26, not a single quarter. The two "baseline" labels are not interchangeable and this research could not fully verify which specific period Health NZ's SOPE baseline covers — flagged as unverified below.
3. **Health NZ's own data caveats note deliberate revision behaviour**: "All historic results from quarter one 2024/25 onwards... reflect the first published result... with the exclusion of the waitlist detailed data extracts which is refreshed to reflect the latest data available." I.e. the quarterly trend-chart figures used above are frozen at first publication, while the raw waitlist extract used for the specialty analysis is live/revised — this is why the extract's national percentages (computed here) are close to but not always identical to the published quarterly percentage for the same nominal period. [Health NZ, Health target data caveats, Q3 2025/26](https://static.info.content.health.nz/docs/publications/health-targets-data-caveats-q3-25-26.pdf).
4. **All three measures are percentages of people/events, not counts of visits**, and the denominator differs by measure: ED is a % of ED attendances; FSA and elective treatment are both stock measures — % of everyone currently on the respective waitlist waiting under four months — not flow measures of how many were newly added or removed that quarter. Waitlist size (196,006 FSA; 77,941 elective, Q3 25/26) is reported alongside the percentage but is a separate figure and moves independently of it.
5. **Four small ED facilities are excluded from the ED national figure** (Clutha Health First, Gore Health Limited, Maniototo, and Wanaka after hours — all run by local trusts, not Health NZ directly), and results may show "slight variations" going forward due to a new patient-management system rollout in Auckland district. [Health NZ, Health target data caveats, Q3 2025/26](https://static.info.content.health.nz/docs/publications/health-targets-data-caveats-q3-25-26.pdf); [DPMC, Target 1 factsheet](https://www.dpmc.govt.nz/sites/default/files/2026-03/gt-factsheet-target-1-dec25.pdf).
6. **Rural/urban classification has known edge cases**: Hutt Valley is classified fully urban and West Coast fully rural under Health NZ's Geographical Classification of Health, so the "opposite" cell for each district is blank in the official tables *except* where patients domiciled elsewhere (e.g. rural Wairarapa patients treated in Hutt Valley) create a small non-zero entry. [Health NZ, Health target data caveats, Q3 2025/26](https://static.info.content.health.nz/docs/publications/health-targets-data-caveats-q3-25-26.pdf).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| FSA (the largest of the three waitlists, ~196,000 people) has no ethnicity or rurality breakdown published anywhere by Health NZ | [Waitlist extract "Contents" sheet](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx) (explicit note) | [Health NZ ethnicity/rurality breakdown Q3 25/26](https://static.info.content.health.nz/docs/publications/health-targets-results-with-ethnicity-and-rurality-breakdown-q3-25-26.pdf) (FSA section has no ethnicity table, unlike ED/elective/cancer/immunisation) | High |
| Māori and Pacific patients trend behind Asian and European/Other patients for elective-treatment wait times | [Health NZ ethnicity/rurality breakdown Q3 25/26](https://static.info.content.health.nz/docs/publications/health-targets-results-with-ethnicity-and-rurality-breakdown-q3-25-26.pdf) | [RNZ, "Health NZ drops tool that factored in ethnicity for waitlists…"](https://www.rnz.co.nz/news/political/523825/health-nz-drops-tool-that-factored-in-ethnicity-for-waitlists-despite-review-findings) (independent origin, describes the same directional pattern from a policy/review angle, 18 months earlier) | Medium — direction is corroborated by an independent source, but exact magnitude relies on one data system, and the independent-review panel itself could not quantify effectiveness of remedial tools |
| Orthopaedics is the single most overloaded specialty in both the FSA and elective-treatment systems | Computed from [Health NZ waitlist detailed data extract Q2 25/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx), national aggregation, 31 Dec 2025 | Cross-checked internally: aggregated national FSA total (62.3%) and elective total (64.9%) from the same extract closely match the independently-published Q2/Q3 25/26 quarterly results (62.2%/64.9%), supporting the extract's reliability, though this is not a second *external* source for the orthopaedics-specific claim | Medium — internally consistent and directionally corroborated by NZ Herald reporting on referral-volume growth, but no second Health-NZ-external source names orthopaedics specifically for this exact period |
| DPMC's Government Targets factsheet header quarter and its "Current" data quarter can differ by a full quarter | [DPMC Target 1 factsheet](https://www.dpmc.govt.nz/sites/default/files/2026-03/gt-factsheet-target-1-dec25.pdf) (header says "quarter ending December 2025", body says "September 2025") | [RNZ, 24 Mar 2026 article](https://www.rnz.co.nz/news/political/590457/government-says-it-s-improved-on-all-five-of-its-health-targets) reporting the Oct–Dec 2025 (Q2) figure of 74.2% around the same publication date the Dec-25-headed DPMC sheet was citing a Sep-25 (Q1) figure of 68.9% — the two publications, dated within days of each other, are reporting different quarters | High |

## What would change this conclusion

- **A direct statement from Health NZ or DPMC clarifying the exact baseline period behind the "Baseline" figures cited in the quarterly factsheets** (69.7% ED / 61.5% FSA / 62.2% elective) would resolve point 2 in the Reconciliation section, which this research could not fully verify — the Statement of Performance Expectations 2025-26 document itself was not located and read in full.
- **A Health NZ publication that adds ethnicity/rurality to the FSA waitlist** would close the single biggest population-group gap in this baseline — currently the largest waitlist of the three has no equity data at all.
- **A specialty-level breakdown published directly by Health NZ** (rather than derived by this research from the raw record-level extract) would let future researchers skip the aggregation step and would also expose district×specialty cells this research did not have space to reproduce.
- If a future quarter's DPMC factsheet is internally consistent (header quarter = body quarter), that would suggest the mislabelling found here was a one-off production error rather than a systematic lag in DPMC's publication cycle — worth a quick check next quarter.

## Open follow-up questions

- District×specialty cross-tabs (e.g. "which district is worst for orthopaedics specifically") are answerable from the same raw waitlist extract but were out of scope for a national/specialty-level baseline — a natural narrower follow-up.
- Whether the orthopaedics backlog is driven more by referral-volume growth or treatment-capacity constraints is a workforce/capacity question, in scope for sibling issue #736 (workforce, bed capacity, ambulance demand and aged-care discharge constraints).
- Trend of the ethnicity gap over time (is it widening or narrowing?) would need the same ethnicity/rurality breakdown document pulled for several historical quarters — this research only pulled Q3 25/26 vs Q3 24/25 as published.

## Sources

1. Health New Zealand | Te Whatu Ora, "Health targets" — https://www.healthnz.govt.nz/about-us/what-we-do/planning-and-performance/health-targets (accessed 2026-07-07; archived https://web.archive.org/web/20260323230539/https://www.healthnz.govt.nz/about-us/what-we-do/planning-and-performance/health-targets)
2. Health NZ, "Health targets performance resources: 2025/26" — https://www.healthnz.govt.nz/publications/health-targets-performance-resources-2025-26 (accessed 2026-07-07)
3. Health NZ, "Health target data caveats: Quarter 3 2025/26" (PDF) — https://static.info.content.health.nz/docs/publications/health-targets-data-caveats-q3-25-26.pdf
4. Health NZ, "Health targets: 5 and 10 years of results, Q3 25/26" (PDF) — https://static.info.content.health.nz/docs/publications/health-targets-5-and-10-years-of-results-q3-25-26.pdf
5. Health NZ, "Q3 2025/26 health target results with ethnicity and rurality breakdown" (PDF) — https://static.info.content.health.nz/docs/publications/health-targets-results-with-ethnicity-and-rurality-breakdown-q3-25-26.pdf
6. Health NZ, "Waitlist detailed data extracts, Q2 25/26 vintage" (XLSX, raw record-level FSA and elective waitlist by district/region/specialty[/ethnicity], Jul 2015–Dec 2025) — https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx
7. Health NZ, "District and regional factsheets 2025/26" — https://www.healthnz.govt.nz/publications/district-and-regional-factsheets-2025-26
8. DPMC, "Government Targets" — https://www.dpmc.govt.nz/our-programmes/government-targets (archived https://web.archive.org/web/20260531195511/https://www.dpmc.govt.nz/our-programmes/government-targets)
9. DPMC, "Factsheet — Target 1 — Shorter stays in emergency departments" (quarter ending Dec 2025, published Mar 2026) — https://www.dpmc.govt.nz/sites/default/files/2026-03/gt-factsheet-target-1-dec25.pdf
10. DPMC, "Factsheet — Target 2 — Shorter wait times for elective treatment" (quarter ending Mar 2026, published Jun 2026) — https://www.dpmc.govt.nz/sites/default/files/2026-06/gt-factsheet-target-2-mar26.pdf
11. RNZ, "Government says it's improved on all five of its health targets", 24 Mar 2026 — https://www.rnz.co.nz/news/political/590457/government-says-it-s-improved-on-all-five-of-its-health-targets
12. RNZ, "Health NZ drops tool that factored in ethnicity for waitlists, despite review findings", 1 Aug 2024 — https://www.rnz.co.nz/news/political/523825/health-nz-drops-tool-that-factored-in-ethnicity-for-waitlists-despite-review-findings
13. NZ Herald, "Overdue wait list for hospital specialist appointments balloons to 60,000; the specialties under most pressure" — https://www.nzherald.co.nz/nz/overdue-wait-list-for-hospital-specialist-appointments-balloons-to-60000-the-specialties-under-most-pressure/WRZ3OCCRIFDJ3EKHBVFDNENZFQ/
