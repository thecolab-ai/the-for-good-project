---
title: "Orthopaedics FSA waitlist data does not show a positive August 2024 step-change"
domain: "civic-transparency"
issue: "#761"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-08"
status: "draft"
---

# Orthopaedics FSA waitlist data does not show a positive August 2024 step-change

This is research child **#761 of Stream #434**, split from #734. It answers one question: **does Health NZ specialty-level waitlist data show an orthopaedics-specific FSA performance inflection around the August 2024 MSK physiotherapist pathway rollout, compared with the national all-specialty FSA trend?**

## Executive answer

- **No clear positive step-change is visible in the public specialty-level waitlist extract.** In Health NZ's latest detailed waitlist extract found for this work, orthopaedics FSA performance was 49.0% within 120 days at August 2024, 48.4% at September 2024, 47.6% at December 2024, and 43.5% at December 2025; the all-specialty national FSA result was roughly flat over the same period, moving from 61.4% at August 2024 to 62.3% at December 2025 [Health NZ waitlist detailed data extract, Q2 2025/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx).
- **Orthopaedics already tracked below the national FSA line before August 2024, but the gap widened after rollout rather than narrowing.** At quarter month-ends, the orthopaedics-minus-national gap was about -13 percentage points through June/September/December 2024, then widened to -17 to -19 percentage points through June/September/December 2025 in the same Health NZ extract [Health NZ waitlist detailed data extract, Q2 2025/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx).
- **This does not prove the MSK pathway failed.** The public extract is a stock waitlist snapshot by month, district and specialty, not a pathway-exposure dataset; it cannot identify patients seen by physiotherapists, patients diverted from orthopaedic surgeon FSAs, referral inflow, clinical threshold changes, or district-level rollout intensity [Health NZ waitlist detailed data extract, Q2 2025/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx); [Ministry of Health aide-memoire, 2025](https://www.health.govt.nz/system/files/2025-09/08-04-2025-Aide-Memoire-Meeting-with-Physiotherapy-NZ-H2025063929.pdf).
- **The August 2024 date is also not a clean national treatment boundary.** A Beehive release says the MSK orthopaedic pathway was introduced in August 2024 and had completed more than 7,200 FSAs and 9,500 follow-ups by 1 October 2025, but a Ministry aide-memoire says Health NZ had already trialled the pathway in six regions in 2023 and that ongoing rollout varied by region and funding allocation [Beehive, 2025](https://www.beehive.govt.nz/release/health-targets-physiotherapist-boost-will-cut-orthopaedic-wait-times); [Ministry of Health aide-memoire, 2025](https://www.health.govt.nz/system/files/2025-09/08-04-2025-Aide-Memoire-Meeting-with-Physiotherapy-NZ-H2025063929.pdf).

**Overall confidence:** Medium - the arithmetic is reproducible from official Health NZ workbooks and overlapping vintages agree on the key pre-rollout months, but the conclusion is observational and relies on one underlying Health NZ data system rather than an independent evaluation dataset.

## Evidence

### Data used and calculation method

Health NZ's health target is that 95% of patients wait less than four months for a first specialist assessment, and Health NZ publishes quarterly target resources and downloadable data caveats/resources for health-target reporting [Ministry of Health, health targets](https://www.health.govt.nz/monitoring-statistics/system-monitoring/health-targets); [Health NZ performance resources 2025/26](https://www.healthnz.govt.nz/publications/health-targets-performance-resources-2025-26). The detailed waitlist workbook contains an `FSA Waitlist` sheet with `Month End Date`, `Region`, `District`, `Specialty`, `Waiting under 120 days`, and `Total Waiting` fields; the Q2 2025/26 workbook describes its range as July 2015 to December 2025 [Health NZ waitlist detailed data extract, Q2 2025/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx).

I downloaded three Health NZ waitlist-detail workbook vintages: the 2024/25 Q4 workbook linked from the 2024/25 performance resources page, the 2025/26 Q1 workbook linked from the 2025/26 performance resources page, and the Q2 2025/26 workbook named in issue #761 [Health NZ performance resources 2024/25](https://www.healthnz.govt.nz/publications/health-targets-performance-resources-2024-25); [Health NZ performance resources 2025/26](https://www.healthnz.govt.nz/publications/health-targets-performance-resources-2025-26); [Health NZ waitlist detailed data extract, Q2 2025/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx). For each month, I summed `Waiting under 120 days` and `Total Waiting` nationally across all districts; "national FSA" is all specialties combined, and "orthopaedics" is rows where `Specialty = Orthopaedics` [Health NZ waitlist detailed data extract, Q2 2025/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx).

The direct workbook URLs returned HTTP 200 by `curl` on 2026-07-08; the Health NZ HTML index pages returned HTTP 403 to plain `curl`, so the index citations were verified with the built-in web fetch and archived where possible [Health NZ performance resources 2024/25](https://www.healthnz.govt.nz/publications/health-targets-performance-resources-2024-25) (archived: [Wayback, 7 Jul 2026](https://web.archive.org/web/20260707233850/https://www.healthnz.govt.nz/publications/health-targets-performance-resources-2024-25)); [Health NZ performance resources 2025/26](https://www.healthnz.govt.nz/publications/health-targets-performance-resources-2025-26) (archived: [Wayback, 21 Apr 2026](https://web.archive.org/web/20260421062055/https://www.healthnz.govt.nz/publications/health-targets-performance-resources-2025-26)).

### Time series: orthopaedics versus national FSA

The table below uses quarter month-ends from June 2023 through December 2025, plus the August 2024 rollout month, all calculated from the Q2 2025/26 Health NZ workbook [Health NZ waitlist detailed data extract, Q2 2025/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx).

| Month end | National FSA within 120 days | National total waiting | Orthopaedics within 120 days | Orthopaedics total waiting | Orthopaedics gap vs national |
|---|---:|---:|---:|---:|---:|
| 2023-06 | 69.6% | 168,952 | 57.3% | 23,565 | -12.4 pp |
| 2023-09 | 66.3% | 177,500 | 53.5% | 24,973 | -12.8 pp |
| 2023-12 | 63.5% | 186,566 | 51.4% | 26,440 | -12.1 pp |
| 2024-03 | 59.6% | 192,773 | 46.8% | 27,595 | -12.7 pp |
| 2024-06 | 61.5% | 194,253 | 48.2% | 27,567 | -13.3 pp |
| 2024-08 | 61.4% | 193,127 | 49.0% | 28,479 | -12.4 pp |
| 2024-09 | 61.2% | 194,823 | 48.4% | 28,974 | -12.9 pp |
| 2024-12 | 60.6% | 197,164 | 47.6% | 32,364 | -13.0 pp |
| 2025-03 | 57.7% | 200,693 | 43.6% | 34,132 | -14.1 pp |
| 2025-06 | 61.4% | 193,091 | 44.1% | 34,598 | -17.3 pp |
| 2025-09 | 62.4% | 197,833 | 43.2% | 36,158 | -19.2 pp |
| 2025-12 | 62.3% | 198,433 | 43.5% | 36,955 | -18.8 pp |

The immediate before/after comparison also does not show a positive step-change: in the three months before the August 2024 rollout month (May-July 2024), national FSA averaged 61.9% and orthopaedics averaged 48.7%; during August-October 2024, national FSA averaged 61.4% and orthopaedics averaged 48.4%; during September-November 2024, national FSA averaged 61.5% and orthopaedics averaged 48.0% [Health NZ waitlist detailed data extract, Q2 2025/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx). Over June 2023-July 2024, both series were deteriorating at similar simple linear rates (national about -0.68 percentage points/month; orthopaedics about -0.74 percentage points/month); over August 2024-December 2025, the national series was slightly improving (about +0.14 percentage points/month) while orthopaedics was still declining (about -0.35 percentage points/month) [Health NZ waitlist detailed data extract, Q2 2025/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx).

### Vintages and revisions

Health NZ's caveats for health-target reporting state that point-in-time snapshots may differ from other published statistics because of timing, methodology or data-source differences, and the sibling #732 baseline finding records the same caveat for detailed extracts versus first-published quarterly results [Health NZ Q2 2025/26 health-target factsheet](https://static.info.content.health.nz/docs/publications/5%20and%2010yr%20Health%20targets%20factsheets%20Q2%202526.pdf); [#732 baseline finding](hospital-wait-times-baseline-2024-2026.md). The key pre-rollout and rollout-month figures are stable across the workbook vintages I checked: the Q4 2024/25, Q1 2025/26 and Q2 2025/26 extracts all returned 61.5% national / 48.2% orthopaedics for June 2024, 61.4% / 49.0% for August 2024, 61.2% / 48.4% for September 2024, and 60.6% / 47.6% for December 2024 [Health NZ waitlist extract, Q4 2024/25](https://static.info.content.health.nz/docs/publications/Waitlist-detail-extract.xlsx); [Health NZ waitlist extract, Q1 2025/26](https://static.info.content.health.nz/docs/publications/Waitlist-detail-extract-Q1-2025-26.xlsx); [Health NZ waitlist detailed data extract, Q2 2025/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx).

The later months show small revisions between vintages but not a conclusion-changing direction: June 2025 was 62.0% national / 44.4% orthopaedics in the Q1 2025/26 extract and 61.4% / 44.1% in the Q2 2025/26 extract; September 2025 was 62.3% national / 43.1% orthopaedics in the Q1 extract and 62.4% / 43.2% in the Q2 extract [Health NZ waitlist extract, Q1 2025/26](https://static.info.content.health.nz/docs/publications/Waitlist-detail-extract-Q1-2025-26.xlsx); [Health NZ waitlist detailed data extract, Q2 2025/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx).

### Why this is not a causal evaluation

The Beehive release is the public source for the August 2024 launch date and pathway activity count: it says the MSK orthopaedic pathway, introduced in August 2024, had completed more than 7,200 FSAs and more than 9,500 follow-up appointments by 1 October 2025 [Beehive, 2025](https://www.beehive.govt.nz/release/health-targets-physiotherapist-boost-will-cut-orthopaedic-wait-times) (archived: [Wayback, 7 Jul 2026](https://web.archive.org/web/20260707233830/https://www.beehive.govt.nz/release/health-targets-physiotherapist-boost-will-cut-orthopaedic-wait-times)). But a Ministry of Health aide-memoire says Health NZ trialled the MSK pathway in Bay of Plenty, Taranaki, Waikato, Lakes, Wellington and Northland in 2023, and says regional variation affected whether elective-services funding was directed to rollout [Ministry of Health aide-memoire, 2025](https://www.health.govt.nz/system/files/2025-09/08-04-2025-Aide-Memoire-Meeting-with-Physiotherapy-NZ-H2025063929.pdf).

The local Bay of Plenty COTS evidence supports the plausibility of physiotherapist-led triage improving access, but it is not the national post-August-2024 quantitative trend test asked here: the 2024 retrospective audit covered Bay of Plenty patients between September 2020 and September 2021, and the 2025 perspectives paper was a qualitative evaluation of patient, physiotherapist, manager and GP experiences [NZ Journal of Physiotherapy audit article](https://nzjp.org.nz/nzjp/article/view/344); [Stilwell, Reid & Larmer, 2025](https://openrepository.aut.ac.nz/server/api/core/bitstreams/5ceea075-7bcf-4c7e-aeaa-90f8d64ba173/content).

**Interpretation:** the official specialty-level waitlist series is consistent with "orthopaedics continued to be the worst-pressure FSA specialty despite the MSK pathway" and inconsistent with "there was a visible national orthopaedics FSA performance improvement at August 2024." It is not strong enough to distinguish whether the pathway helped but was overwhelmed by demand, was too small or uneven to move the national stock measure, shifted patients into or out of the denominator, or had not had enough time to affect accumulated overdue waits [Health NZ waitlist detailed data extract, Q2 2025/26](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx); [Ministry of Health aide-memoire, 2025](https://www.health.govt.nz/system/files/2025-09/08-04-2025-Aide-Memoire-Meeting-with-Physiotherapy-NZ-H2025063929.pdf).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Orthopaedics did not show a positive national FSA step-change at or after August 2024; it was 49.0% within 120 days in August 2024 and 43.5% in December 2025, while all-specialty FSA moved from 61.4% to 62.3%. | [Health NZ Q2 2025/26 waitlist detailed extract](https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx) | [Health NZ Q4 2024/25](https://static.info.content.health.nz/docs/publications/Waitlist-detail-extract.xlsx) and [Q1 2025/26](https://static.info.content.health.nz/docs/publications/Waitlist-detail-extract-Q1-2025-26.xlsx) extracts match the pre-rollout and rollout-month figures, but they are overlapping vintages of the same Health NZ data system, not independent measurement. | Medium |
| The public August 2024 rollout date is not a clean causal boundary because Health NZ had already trialled the MSK pathway in six regions in 2023. | [Beehive release, 1 Oct 2025](https://www.beehive.govt.nz/release/health-targets-physiotherapist-boost-will-cut-orthopaedic-wait-times) | [Ministry of Health aide-memoire, Apr 2025](https://www.health.govt.nz/system/files/2025-09/08-04-2025-Aide-Memoire-Meeting-with-Physiotherapy-NZ-H2025063929.pdf) | High |
| Physiotherapist-led orthopaedic triage has plausible local evidence, but that evidence does not close this national quantitative gap. | [NZ Journal of Physiotherapy 2024 Bay of Plenty audit](https://nzjp.org.nz/nzjp/article/view/344) | [Stilwell, Reid & Larmer 2025 qualitative perspectives paper](https://openrepository.aut.ac.nz/server/api/core/bitstreams/5ceea075-7bcf-4c7e-aeaa-90f8d64ba173/content) | High |

## What would change this conclusion

- A Health NZ pathway evaluation linking each FSA to provider type, district, referral source, triage route, referral date, appointment date, outcome and rollout timing would be the main evidence needed to test causal impact.
- A district-by-district rollout dataset, especially dates and FTE by district, could test whether early or high-intensity MSK pathway districts improved relative to late or low-intensity districts.
- A referral-inflow series by specialty would clarify whether orthopaedics performance fell because more people entered the waitlist, because fewer people were seen, or because waitlist-management thresholds changed.
- A later detailed extract beyond December 2025 could change the post-rollout conclusion if orthopaedics improves materially after the workforce expansion announced in October 2025.
- I could not verify an independent, non-Health-NZ national specialty-level FSA dataset for orthopaedics; the core trend finding is therefore a calculation from one official data system, cross-checked only against overlapping Health NZ vintages.
- I did not contact Health NZ, physiotherapists, orthopaedic surgeons, district managers, GPs or patients. A human clinical/operational reviewer should check whether the stock waitlist percentage is the right success measure for a pathway that may aim to divert patients, improve assessment quality, or reduce later elective-surgery demand.

## Open follow-up questions

- Did districts named in the 2023 MSK trial show different orthopaedics FSA trends from districts not named in the trial?
- Did the MSK pathway reduce orthopaedic surgeon FSA demand, elective-surgery commitments, or inappropriate referrals even while the total orthopaedics FSA waitlist percentage worsened?
- How many orthopaedics FSA referrals were declined or redirected before entering the FSA waitlist, and did that change after the pathway rollout?

## Sources

1. Ministry of Health, "Health targets," accessed 2026-07-08 by built-in web fetch after plain `curl` to Health NZ pages returned 403 on related Health NZ index pages. https://www.health.govt.nz/monitoring-statistics/system-monitoring/health-targets
2. Health New Zealand | Te Whatu Ora, "Health targets performance resources: 2024/25," accessed 2026-07-08 by built-in web fetch; plain `curl` returned 403, treated as BLOCKED not dead; archived https://web.archive.org/web/20260707233850/https://www.healthnz.govt.nz/publications/health-targets-performance-resources-2024-25. https://www.healthnz.govt.nz/publications/health-targets-performance-resources-2024-25
3. Health New Zealand | Te Whatu Ora, "Health targets performance resources: 2025/26," accessed 2026-07-08 by built-in web fetch; plain `curl` returned 403, treated as BLOCKED not dead; archived https://web.archive.org/web/20260421062055/https://www.healthnz.govt.nz/publications/health-targets-performance-resources-2025-26. https://www.healthnz.govt.nz/publications/health-targets-performance-resources-2025-26
4. Health NZ, "Waitlist detail extract" / waitlist detailed data extract, Q4 2024/25-linked vintage, direct workbook fetched by `curl` HTTP 200 on 2026-07-08. https://static.info.content.health.nz/docs/publications/Waitlist-detail-extract.xlsx
5. Health NZ, "Waitlist detail extract Q1 2025/26," direct workbook fetched by `curl` HTTP 200 on 2026-07-08. https://static.info.content.health.nz/docs/publications/Waitlist-detail-extract-Q1-2025-26.xlsx
6. Health NZ, "Waitlist detailed data extract Q2 2025/26," direct workbook fetched by `curl` HTTP 200 on 2026-07-08. https://static.info.content.health.nz/docs/publications/waitlist-detail-extract-q2-25-26.xlsx
7. Health NZ, "5 and 10yr Health targets factsheets Q2 25/26," direct PDF fetched by `curl` HTTP 200 on 2026-07-08. https://static.info.content.health.nz/docs/publications/5%20and%2010yr%20Health%20targets%20factsheets%20Q2%202526.pdf
8. The For Good Project, sibling finding #732, "NZ ED, first-specialist-assessment and elective-treatment wait-time baseline (2024-2026), by district, ethnicity/rurality and specialty." [hospital-wait-times-baseline-2024-2026.md](hospital-wait-times-baseline-2024-2026.md)
9. Beehive.govt.nz, "Health targets: physiotherapist boost will cut orthopaedic wait times," 1 October 2025, accessed 2026-07-08 by built-in web fetch; archived https://web.archive.org/web/20260707233830/https://www.beehive.govt.nz/release/health-targets-physiotherapist-boost-will-cut-orthopaedic-wait-times. https://www.beehive.govt.nz/release/health-targets-physiotherapist-boost-will-cut-orthopaedic-wait-times
10. Ministry of Health, "Aide-Memoire: Meeting with Physiotherapy New Zealand," H2025063929, 8 April 2025, proactively released September 2025, accessed 2026-07-08 by built-in web fetch. https://www.health.govt.nz/system/files/2025-09/08-04-2025-Aide-Memoire-Meeting-with-Physiotherapy-NZ-H2025063929.pdf
11. Stilwell, J. A., Reid, D., & Larmer, P., "Implementation of an orthopaedic triage service for osteoarthritis in the New Zealand health system: A retrospective audit," *New Zealand Journal of Physiotherapy*, 52(1), 26-34, 2024, accessed 2026-07-08 by built-in web fetch. https://nzjp.org.nz/nzjp/article/view/344
12. Stilwell, J. A., Reid, D., & Larmer, P., "Implementation of an Orthopaedic Triage Service for Osteoarthritis in the New Zealand Public Health System: Patient, Physiotherapist, Manager, and General Practitioner Perspectives," *New Zealand Journal of Physiotherapy*, 2025, accessed 2026-07-08 by built-in web fetch. https://openrepository.aut.ac.nz/server/api/core/bitstreams/5ceea075-7bcf-4c7e-aeaa-90f8d64ba173/content
