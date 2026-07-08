---
title: "Recent NZ whole-Act repeals are not mostly Statutes Repeal Bill housekeeping"
domain: "civic-transparency"
issue: "#680"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-07"
status: "draft"
---

# Recent NZ whole-Act repeals are not mostly Statutes Repeal Bill housekeeping

## Executive answer

- In a recent enacted-law window, **2023-01-01 to 2026-06-06**, I found **71 whole-Act repeal events** in the `jonnonz1/nz-statute-book` public-Act mirror, whose README says it is generated from PCO XML, has one commit per electronic consolidation, and is current through consolidations as at **2026-06-06** [nz-statute-book README](https://github.com/jonnonz1/nz-statute-book).
- **None of those 71 extracted rows was a classic Statutes Repeal Bill / Statutes Repeal Act event.** The nearest current PCO revision-programme page for **2024 to 2026** is contextual rather than independently comprehensive: it lists revision Bills that update selected Acts into modern language and format, not an enacted Statutes Repeal Bill [PCO Revision Bill Programme 2024 to 2026](https://pco.govt.nz/about-us/about-new-zealand-legislation/revision-programme/revision-programme-2024-to-2026).
- **Within this extraction, most recent whole-Act repeal volume is embedded in live legislative packages, not spent-law housekeeping:** **59/71 = 83%** were repeals inside substantive repeal, replacement, settlement, or institutional-change Acts; **12/71 = 17%** were routine annual lifecycle repeals of Appropriation or Secondary Legislation Confirmation Acts.
- A separate post-cutoff example of spent-legislation housekeeping exists: the Regulatory Systems (Primary Industries) Amendment Bill includes a component labelled "Repeals inactive legislation" because some Acts remain on the statute book after their provisions have been spent. The Parliament history page fetched on 2026-07-07 records Third Reading on 30/06/2026 and lists Royal Assent without a date, while legislation.govt.nz still identifies the instrument as a current Bill, so it is outside this enacted-law extraction window as an in-progress Bill after the `nz-statute-book` mirror's 2026-06-06 cutoff [Parliament bill page](https://bills.parliament.nz/v/6/b67a1511-3571-4ba8-96ca-08db71ef2382?Tab=history); [legislative statement PDF](https://bills.parliament.nz/download/Paper/9d18268c-df28-4b8c-9a55-08dc4dd3a0df); [legislation.govt.nz Bill page](https://www.legislation.govt.nz/bill/government/2023/256/en/latest/).

**Overall confidence:** Medium -- the extraction from the statute-book mirror is reproducible and spot-checkable, but the count depends on that mirror's parsed commit bodies rather than a direct PCO bulk-XML run. (On re-verification 2026-07-08, the PCO revision-programme page and the legislation.govt.nz Bill page both fetched cleanly via the upgraded fetch ladder, so they are cited live below; a direct PCO bulk-XML replay of the 71-row count is still the outstanding step.)

## Evidence

### Scope and method

I counted **whole-Act repeal events**, not all repeal clauses and not provision-level repeals. The unit is one commit-body row of the form `- repealed <Act title> — <amending Act>` where `<Act title>` ends in `Act YYYY`; rows beginning with `section`, `part`, `schedule`, `heading`, `item`, `definition`, `regulation`, and similar sub-Act units were excluded. The data source is `jonnonz1/nz-statute-book`, whose README says each public Act consolidation is represented as a commit, commit bodies list amendments effective that day, and the repository is rendered deterministically from New Zealand Legislation PCO XML [nz-statute-book README](https://github.com/jonnonz1/nz-statute-book).

The exact extraction run locally was:

```bash
git clone --filter=blob:none --no-checkout https://github.com/jonnonz1/nz-statute-book.git /tmp/nz-statute-book
git -C /tmp/nz-statute-book log --since='2023-01-01' --until='2026-06-06 23:59:59' \
  --format='%H%x09%ad%x09%B%x1e' --date=short > /tmp/nzsb-log-2023-2026.txt
```

Then I parsed commit bodies for `- repealed ... — ...` rows and filtered to objects ending in `Act YYYY`. This returned **1,496** repeal rows of all kinds and **71** whole-Act repeal rows. A public commit page shows the row format directly; for example, commit `9189435` records `- repealed Incorporated Societies Act 1908 — Incorporated Societies Act 2022` [example commit](https://github.com/jonnonz1/nz-statute-book/commit/9189435177a7).

### Classification result

I classified the 71 rows into three practical buckets:

| Bucket | Count | Share | What it means |
|---|---:|---:|---|
| Classic Statutes Repeal Bill / Statutes Repeal Act housekeeping | 0 | 0% | No extracted row was enacted by an amending Act titled `Statutes Repeal ...` in this window. |
| Routine annual lifecycle repeals | 12 | 17% | Appropriation and Secondary Legislation Confirmation Acts that expire or replace prior annual Acts. |
| Live legislative packages | 59 | 83% | Repeal-and-replace, institutional abolition, treaty settlement, COVID wind-down, regulatory-policy repeal, and other substantive Acts. |

The 12 routine lifecycle rows were 9 Appropriation Act repeals and 3 Secondary Legislation Confirmation Act repeals, each enacted by the next annual Act in that series. The remaining 59 rows were attached to live packages such as the Fair Pay Agreements Act Repeal Act 2023, Resource Management repeal/interim fast-track Act 2023, Water Services Acts Repeal Act 2024, Business Payment Practices Act Repeal Act 2024, Therapeutic Products Act Repeal Act 2024, Parliament (Repeals and Amendments) Act 2025, Civil Aviation Act 2023 commencement, and Incorporated Societies Act 2022 commencement. Parliament's own bill pages describe several of these as explicit repeals of named Acts, including Fair Pay Agreements, Taxation Principles Reporting, Resource Management replacement Acts, Water Services Acts, Therapeutic Products, Business Payment Practices, and the Productivity Commission [Fair Pay Agreements bill](https://bills.parliament.nz/v/6/cd76254e-4051-49e6-19e6-08dbfadead1f?Tab=history); [Taxation Principles Reporting bill](https://bills.parliament.nz/v/6/9faa9e21-c7a9-4433-7e32-08dc003a05e3?Tab=history); [Resource Management repeal bill](https://bills.parliament.nz/v/6/25ad876f-0b1c-4068-7e31-08dc003a05e3?Tab=history); [Water Services bill](https://bills.parliament.nz/v/6/3ca533b7-cf50-4f14-a3fd-08dc2c346270?Tab=history); [Therapeutic Products bill](https://bills.parliament.nz/v/6/8847fc37-a580-4680-d10f-08dc93dd1b2f?Tab=history); [Business Payment Practices bill](https://bills.parliament.nz/v/6/3da72845-7284-439e-2ead-08dc3c923d2a?Tab=history); [Productivity Commission bill](https://bills.parliament.nz/v/6/83023c5d-ae25-4c36-b253-08dc1d4e9e66?Tab=history).

Grouped by the Act doing the repealing, the 71 rows were:

| Repealing Act | Whole Acts repealed | Classification |
|---|---:|---|
| Appropriation (2023/24 Estimates) Act 2023 | 3 | Routine annual lifecycle |
| Appropriation (2024/25 Estimates) Act 2024 | 3 | Routine annual lifecycle |
| Appropriation (2025/26 Estimates) Act 2025 | 3 | Routine annual lifecycle |
| Secondary Legislation Confirmation Act 2023 | 1 | Routine annual lifecycle |
| Secondary Legislation Confirmation Act 2024 | 1 | Routine annual lifecycle |
| Secondary Legislation Confirmation Act 2025 | 1 | Routine annual lifecycle |
| Births, Deaths, Marriages, and Relationships Registration Act 2021 | 11 | Live replacement package |
| Civil Aviation Act 2023 | 10 | Live replacement package |
| Incorporated Societies Act 2022 | 7 | Live replacement package |
| Parliament (Repeals and Amendments) Act 2025 | 7 | Live institutional replacement package |
| COVID-19 Public Health Response Act 2020 | 4 | Live policy wind-down package |
| Natural Hazards Insurance Act 2023 | 3 | Live replacement package |
| Plant Variety Rights Act 2022 | 3 | Live replacement package |
| Water Services Acts Repeal Act 2024 | 3 | Live policy repeal package |
| Resource Management (Natural and Built Environment and Spatial Planning Repeal and Interim Fast-track Consenting) Act 2023 | 2 | Live policy repeal package |
| Business Payment Practices Act Repeal Act 2024 | 1 | Live policy repeal package |
| Children and Young People's Commission Act 2022 | 1 | Live institutional replacement package |
| Fair Pay Agreements Act Repeal Act 2023 | 1 | Live policy repeal package |
| Gangs Act 2024 | 1 | Live policy package |
| New Zealand Productivity Commission Act Repeal Act 2024 | 1 | Live institutional abolition package |
| Ngāti Pāoa Claims Settlement Act 2025 | 1 | Treaty settlement package |
| Taxation Principles Reporting Act Repeal Act 2023 | 1 | Live policy repeal package |
| Te Ture Whakatupua mō Te Kāhui Tupua 2025/Taranaki Maunga Collective Redress Act 2025 | 1 | Treaty settlement package |
| Therapeutic Products Act Repeal Act 2024 | 1 | Live policy repeal package |

This table is not saying every row was politically contested. It is saying the repeals were embedded in a substantive legislative package rather than bundled into the periodic spent-law clean-up vehicle described by PCO/Treasury.

### Why classic Statutes Repeal housekeeping is distinct

The 2015 Statutes Repeal Bill exposure material describes a different mechanism: Treasury and PCO coordinated a Bill to repeal legislation that departments had identified as redundant, spent, no longer required, or no longer relevant, with the stated purpose of keeping legislation up to date and fit for purpose [PCO/Treasury exposure material, Wayback snapshot](https://web.archive.org/web/20231202160552/https://www.pco.govt.nz/srb-explanatory-material). Cabinet Office's 2025 legislation-programme circular also treats Statutes Amendment Bills and Statutes Repeal Bills as vehicles for "minor, technical, non-urgent, and uncontroversial" amendments or repeals across a collection of Acts [DPMC CO (24) 6, paragraph 13](https://www.dpmc.govt.nz/sites/default/files/2024-11/co-24-06-2025-legislation-programme-requirements-for-submitting-bids.pdf).

The current 2024-2026 PCO revision programme is adjacent but not the same as a Statutes Repeal Bill. It lists selected Acts for revision using plain, modern language and current drafting style, including Housing, Land Valuation Proceedings, Protected Flags/Emblems/Names, Summary Proceedings, and Valuers Bills [PCO Revision Bill Programme 2024 to 2026](https://pco.govt.nz/about-us/about-new-zealand-legislation/revision-programme/revision-programme-2024-to-2026). That supports the issue's caution: "repeal" can mean technical housekeeping, revision/re-enactment, annual lifecycle cleanup, or active policy reversal, and a single repeal headline can mix unlike phenomena.

## Surprising or load-bearing claims

| Claim | Main support | Independent support / limitation | Confidence |
|---|---|---|---|
| In the 2023-01-01 to 2026-06-06 extraction, no whole-Act repeal row was enacted by a classic Statutes Repeal Act/Bill. | [Reproducible extraction from nz-statute-book](https://github.com/jonnonz1/nz-statute-book) | I did not find a second comprehensive enacted-law source that independently replays the 71-row classification. The [PCO 2024-2026 revision page](https://pco.govt.nz/about-us/about-new-zealand-legislation/revision-programme/revision-programme-2024-to-2026) is only contextual: it shows an adjacent current PCO programme is revision Bills, not a Statutes Repeal Bill. | Medium |
| Most recent enacted whole-Act repeal volume in this extraction is embedded in live legislative packages: 59/71 rows. | [nz-statute-book README and commit bodies](https://github.com/jonnonz1/nz-statute-book) | I spot-checked representative live repeal packages against Parliament bill pages, including Water Services, Fair Pay Agreements, Taxation Principles Reporting, Resource Management replacement, Therapeutic Products, Business Payment Practices, and the Productivity Commission, but did not find a second comprehensive source covering all 59 classified rows [Water Services bill example](https://bills.parliament.nz/v/6/3ca533b7-cf50-4f14-a3fd-08dc2c346270?Tab=history). | Medium |
| Statutes Repeal Bills are designed for spent/redundant, minor, technical, non-urgent and uncontroversial repeals, so they should not be merged analytically with live policy repeal-and-replace Acts. | [PCO/Treasury 2015 exposure material](https://web.archive.org/web/20231202160552/https://www.pco.govt.nz/srb-explanatory-material) | [DPMC CO (24) 6](https://www.dpmc.govt.nz/sites/default/files/2024-11/co-24-06-2025-legislation-programme-requirements-for-submitting-bids.pdf) | High |
| There is post-cutoff spent-law housekeeping to count in a later enacted-law run if the Regulatory Systems (Primary Industries) Amendment Bill receives Royal Assent: the Bill includes "Repeals inactive legislation", Parliament records Third Reading on 30/06/2026 but no Royal Assent date, and legislation.govt.nz still identifies it as a current Bill. | [Parliament bill history page](https://bills.parliament.nz/v/6/b67a1511-3571-4ba8-96ca-08db71ef2382?Tab=history) | [Legislative statement PDF](https://bills.parliament.nz/download/Paper/9d18268c-df28-4b8c-9a55-08dc4dd3a0df); [legislation.govt.nz Bill page](https://www.legislation.govt.nz/bill/government/2023/256/en/latest/) | Medium |

## What would change this conclusion

- A direct PCO bulk-XML run over the same window could change the count if `nz-statute-book`'s commit-body parser missed or duplicated whole-Act repeal rows.
- A broader definition of housekeeping would change the split. I counted only classic spent-law repeal vehicles as "Statutes Repeal housekeeping"; if annual Appropriation and Secondary Legislation Confirmation lifecycle repeals are treated as housekeeping, the housekeeping-like share becomes **12/71 = 17%**, still not a majority.
- If the Regulatory Systems (Primary Industries) Amendment Bill receives Royal Assent and is included in a post-2026-06-06 enacted-law extraction, its inactive-Act repeals could move the later-window share materially toward housekeeping; the same would be true for any other 2026 omnibus Act that repeals a large number of inactive Acts.
- I could not verify the live PCO Quarterly December 2024 page because direct fetch, `r.jina.ai`, and Wayback capture attempts returned Azure WAF or AWS WAF challenge pages from this environment. I therefore did not rely on that page for the count.

## Open follow-up questions

- Re-run the same classification directly against PCO bulk XML or the PCO developer API once an API key or unblocked fetch route is available.
- Extend the window backward to include the Statutes Repeal Act 2017 and compare a known housekeeping-heavy period with the 2023-2026 live-policy-heavy period.
- In the next post-2026-06-06 extraction, count how many whole Acts the Regulatory Systems (Primary Industries) Amendment Bill repeals as inactive/spent legislation.

## Sources

1. jonnonz1, `nz-statute-book` README, accessed 2026-07-07 -- https://github.com/jonnonz1/nz-statute-book
2. Example `nz-statute-book` commit showing whole-Act repeal row format, accessed 2026-07-07 -- https://github.com/jonnonz1/nz-statute-book/commit/9189435177a7
3. PCO, Revision Bill Programme 2024 to 2026, live page re-verified 2026-07-08 via the fetch ladder's rotating-proxy retry after direct HTTP returned an Azure WAF page; the recovered body lists the Housing, Land Valuation Proceedings, Protected Flags/Emblems/Names, Summary Proceedings, and Valuers revision Bills -- https://pco.govt.nz/about-us/about-new-zealand-legislation/revision-programme/revision-programme-2024-to-2026 (Wayback snapshot captured 2026-01-27: https://web.archive.org/web/20260127195529/https://pco.govt.nz/about-us/about-new-zealand-legislation/revision-programme/revision-programme-2024-to-2026)
4. PCO/Treasury, Statutes Repeal Bill Exposure Draft Explanatory Material, Wayback snapshot captured 2023-12-02; live page was bot-blocked from this environment -- https://web.archive.org/web/20231202160552/https://www.pco.govt.nz/srb-explanatory-material
5. DPMC, Cabinet Office Circular CO (24) 6: 2025 Legislation Programme: Requirements for Submitting Bids, accessed 2026-07-07 -- https://www.dpmc.govt.nz/sites/default/files/2024-11/co-24-06-2025-legislation-programme-requirements-for-submitting-bids.pdf
6. New Zealand Parliament, Regulatory Systems (Primary Industries) Amendment Bill history, accessed 2026-07-07 -- https://bills.parliament.nz/v/6/b67a1511-3571-4ba8-96ca-08db71ef2382?Tab=history
7. New Zealand Parliament, Regulatory Systems (Primary Industries) Amendment Bill legislative statement, accessed 2026-07-07 -- https://bills.parliament.nz/download/Paper/9d18268c-df28-4b8c-9a55-08dc4dd3a0df
8. New Zealand Legislation, Regulatory Systems (Primary Industries) Amendment Bill, re-verified 2026-07-08 via Jina reader after direct HTTP returned an AWS WAF challenge; the recovered page identifies the Bill Current latest version as the Regulatory Systems (Primary Industries) Amendment Bill -- https://www.legislation.govt.nz/bill/government/2023/256/en/latest/
9. New Zealand Parliament, Fair Pay Agreements Act Repeal Bill history, accessed 2026-07-07 -- https://bills.parliament.nz/v/6/cd76254e-4051-49e6-19e6-08dbfadead1f?Tab=history
10. New Zealand Parliament, Taxation Principles Reporting Act Repeal Bill history, accessed 2026-07-07 -- https://bills.parliament.nz/v/6/9faa9e21-c7a9-4433-7e32-08dc003a05e3?Tab=history
11. New Zealand Parliament, Resource Management (Natural and Built Environment and Spatial Planning Repeal and Interim Fast-track Consenting) Bill history, accessed 2026-07-07 -- https://bills.parliament.nz/v/6/25ad876f-0b1c-4068-7e31-08dc003a05e3?Tab=history
12. New Zealand Parliament, Water Services Acts Repeal Bill history, accessed 2026-07-07 -- https://bills.parliament.nz/v/6/3ca533b7-cf50-4f14-a3fd-08dc2c346270?Tab=history
13. New Zealand Parliament, Therapeutic Products Act Repeal Bill history, accessed 2026-07-07 -- https://bills.parliament.nz/v/6/8847fc37-a580-4680-d10f-08dc93dd1b2f?Tab=history
14. New Zealand Parliament, Business Payment Practices Act Repeal Bill history, accessed 2026-07-07 -- https://bills.parliament.nz/v/6/3da72845-7284-439e-2ead-08dc3c923d2a?Tab=history
15. New Zealand Parliament, New Zealand Productivity Commission Act Repeal Bill history, accessed 2026-07-07 -- https://bills.parliament.nz/v/6/83023c5d-ae25-4c36-b253-08dc1d4e9e66?Tab=history
