---
title: "An independent re-run of the Charities Register grantmaker census reproduces the count, but its dollar total is a moving, mixed-year figure"
domain: "grant-access"
issue: "#2"
confidence: "Medium"
author: "cristianfilimon13"
agent: "claude"
model: "claude-opus-5-5"
date: "2026-11-24"
status: "draft"
---

# An independent re-run of the Charities Register grantmaker census reproduces the count, but its dollar total is a moving, mixed-year figure

This finding re-tests [`charities-register-grantmaker-census.md`](charities-register-grantmaker-census.md) (#21), whose figures of 5,568 probable grantmakers and NZ$1,210,961,861 the [stream #2 overview](../../../streams/2-small-nz-charities-miss-grants-they-re-eligible-fo.md) marks as "a single unverified data pull". Every number below comes from one committed run of [`scripts/research/charities-register-grantmaker-replication.mjs`](../../../scripts/research/charities-register-grantmaker-replication.mjs), stored in [`research/data/charities-register-grantmaker-replication/run-2026-11-24.json`](../../data/charities-register-grantmaker-replication/run-2026-11-24.json).

## Executive answer

- **The count reproduces.** The published logic, re-run on 24 November 2026, finds **5,629** probable grantmakers, 61 more (+1.1%) than in July. A second path, which picks each entity's latest return from the raw `AnnualReturn` table instead of the `GrpOrgLatestReturns` view, selects the **same 5,629 entities, the same return IDs and the same grant figures**. So the published join is not an artefact. [GrpOrgLatestReturns](https://www.odata.charities.govt.nz/GrpOrgLatestReturns); [AnnualReturn](https://www.odata.charities.govt.nz/AnnualReturn)
- **The dollar total does not stay still.** The same definition now gives **NZ$1.52b**, up NZ$311m (+26%) since July. 2,768 of the 5,629 latest returns, carrying NZ$802m, were modified after the July pull. The "latest return" total also mixes financial years: returns with a 2025 or 2026 year-end hold 97% of it. [GrpOrgLatestReturns](https://www.odata.charities.govt.nz/GrpOrgLatestReturns)
- **The largest funders drop out of the open data for about eight years.** Up to 2015 year-ends, returns report grants in `GrantsPaidWithinNZ` and `GrantsPaidOutsideNZ`. From 2016 year-ends, only `GrantsorDonationsPaid` is filled, and the biggest grantmakers are blank in all four fields. They come back when they file on `GrantsAndDonationsMade`: 109 grantmaker returns use it for 2023 year-ends, and 3,360 for 2025 year-ends. For example, the Health Research Council reports NZ$81.0m for its 2015 year-end, nothing for 2016 to 2024, and NZ$123.6m for 2025. So grant totals for 2016–2024 year-ends undercount large funders, and a multi-year series from these fields measures the form changes, not a change in giving. [AnnualReturn](https://www.odata.charities.govt.nz/AnnualReturn); [OData metadata](https://www.odata.charities.govt.nz/$metadata)
- **A one-year figure is better defined.** Returns with a 2025 year-end give **5,251 probable grantmakers and NZ$1.39b** (broad definition: 10,240 entities, NZ$1.92b). This is the figure to cite, labelled "register-reported, 2025 year-end returns", instead of a latest-return snapshot.
- **The checks for double counting and gaps move the total by single-digit percentages.** Stale latest returns (year-end before 2024): NZ$31m (2.1%). Members filing under a Group that is also counted: at most NZ$28.5m (1.9%). Entities funded mainly by non-government grants, which may be regranting: at most NZ$115m (7.6%). 47 Tier 1 or 2 grantmakers stay invisible because all four fields are empty. The money is concentrated: the top 10 hold 31% of the total and the top 50 hold 59%.

- **Where the funders' own reports can be read, the register figures hold.** Of the top 10 funders, three latest figures match the funder's annual report within 1%, and a fourth matches on an accrual basis. The reports also show that the total includes a Crown entity, an iwi trust and a gaming-machine society, together 12.7% of it, although the original finding says those are excluded.

**Overall confidence:** Medium. Every number is reproducible from the committed script and data, two query paths agree exactly, and the four top-10 figures that could be checked agree with the funders' own reports. It stays Medium because six of the top 10 latest figures could not be checked, and Charities Services does not publish field definitions.

## Evidence

### Method

The script pulls four public entity sets from the Charities Services open-data service: registered [Organisations](https://www.odata.charities.govt.nz/Organisations), registered [Groups](https://www.odata.charities.govt.nz/Groups), registered [GrpOrgLatestReturns](https://www.odata.charities.govt.nz/GrpOrgLatestReturns), and every [AnnualReturn](https://www.odata.charities.govt.nz/AnnualReturn) row from 2007 on. It pulls the returns one year-end year at a time, because an unfiltered `AnnualReturn` request times out on the service. Field names come from the service's [metadata document](https://www.odata.charities.govt.nz/$metadata). The run read 29,334 registered organisations, 292 registered groups, 27,616 latest-return rows and 432,743 annual-return rows.

It applies the original finding's definitions unchanged ([original finding, Evidence section](charities-register-grantmaker-census.md)):

- **Explicit signal**: `PurposeToGiveGrantsAndDonations` or `OrganisationGeneratesFundsGrantsDonationsToOthers` is true, or `MainActivityId` is 2 or 3.
- **Grant spend**: `GrantsPaidWithinNZ + GrantsPaidOutsideNZ + GrantsorDonationsPaid + GrantsAndDonationsMade`.
- **Conservative set**: explicit signal and grant spend above zero on the latest return. **Broad set**: grant spend above zero.

### A. Faithful re-run of the published logic

| Measure | Published, 2 Jul 2026 | Re-run, 24 Nov 2026 | Change |
|---|---|---|---|
| Entities with an explicit signal | 9,740 | 9,728 | −12 |
| Signal entities with no latest return | 724 | 612 | −112 |
| Conservative set, entities | 5,568 | 5,629 | +61 (+1.1%) |
| Conservative set, grant spend | NZ$1,210,961,861 | NZ$1,522,261,720 | +NZ$311,299,859 (+25.7%) |
| Broad set, entities | 10,873 | 11,066 | +193 (+1.8%) |
| Broad set, grant spend | NZ$1,855,868,384 | NZ$2,093,081,600 | +NZ$237,213,216 (+12.8%) |
| Conservative entities reporting NZ$1m or more | 165 | 184 | +19 |

Sources: published column from the [original finding](charities-register-grantmaker-census.md); re-run column from the [GrpOrgLatestReturns](https://www.odata.charities.govt.nz/GrpOrgLatestReturns), [Organisations](https://www.odata.charities.govt.nz/Organisations) and [Groups](https://www.odata.charities.govt.nz/Groups) pulls in the committed data file.

The re-run also confirms two of the original's data-quality checks. No entity in the conservative set reports grant spend above its total expenditure. No row has more than one of the four spend fields above zero, so adding the four fields does not double count within a row. [GrpOrgLatestReturns](https://www.odata.charities.govt.nz/GrpOrgLatestReturns)

### B. Independent path: latest return chosen from the raw table

The script takes every `AnnualReturn` row, keeps the ones that belong to a registered organisation or group, and picks the return with the latest `YearEnded` for each entity. On a tie it takes the highest `AnnualReturnId`. It then applies the same definitions. [AnnualReturn](https://www.odata.charities.govt.nz/AnnualReturn)

Result: 5,629 entities and NZ$1,522,261,720, identical to path A. All 5,629 entities are in both sets, all 5,629 pick the same `AnnualReturnId`, and all 5,629 have the same grant spend. 27,615 registered entities have at least one return. So `GrpOrgLatestReturns` behaves as "the return with the latest year-end per registered entity", and the published join does not drop or duplicate entities. [AnnualReturn](https://www.odata.charities.govt.nz/AnnualReturn); [GrpOrgLatestReturns](https://www.odata.charities.govt.nz/GrpOrgLatestReturns)

### Why the dollar total moved

**New and amended returns since July.** 2,768 of the 5,629 latest returns (NZ$801,966,794) have a `ModifiedOn` date after the July pull. As a check, the script rebuilds the register as it stood in July: it removes every return modified after the pull and picks the latest return again. That gives 5,474 entities and NZ$1,307,610,874. This proxy accounts for about NZ$215m of the NZ$311m change. It cannot be exact: today's registered list misses entities deregistered since July and includes entities registered since then, and an amended return drops out of the proxy entirely. [AnnualReturn](https://www.odata.charities.govt.nz/AnnualReturn)

**A mix of financial years.** The latest return of each entity can end in any year:

| Year-end of latest return | Entities | Grant spend |
|---|---|---|
| 2026 | 2,918 | NZ$661,122,247 |
| 2025 | 2,474 | NZ$817,299,064 |
| 2024 | 166 | NZ$12,613,488 |
| Before 2024 | 71 | NZ$31,226,921 |

Source: [GrpOrgLatestReturns](https://www.odata.charities.govt.nz/GrpOrgLatestReturns) pull, `sensitivity.latestReturnYear` in the data file. Each filing season replaces one year's return with the next, so a latest-return total changes every month even if no funder changes what it gives.

**Three field eras, with a gap for large funders.** Across all returns filed by entities that have an explicit signal and are registered today:

| Year-end | Returns | All four fields empty | `GrantsPaidWithinNZ` | `GrantsPaidOutsideNZ` | `GrantsorDonationsPaid` | `GrantsAndDonationsMade` |
|---|---|---|---|---|---|---|
| 2014 | 5,894 | 12 | NZ$569m | NZ$53m | — | — |
| 2015 | 6,092 | 3 | NZ$646m | NZ$63m | <NZ$1m | — |
| 2016 | 6,383 | 320 | NZ$6m | <NZ$1m | NZ$228m | — |
| 2019 | 6,928 | 361 | — | — | NZ$290m | — |
| 2022 | 7,621 | 431 | — | — | NZ$295m | — |
| 2023 | 7,913 | 423 | — | — | NZ$313m | NZ$24m |
| 2024 | 8,164 | 298 | — | — | NZ$258m | NZ$540m |
| 2025 | 8,259 | 20 | — | — | NZ$84m | NZ$1,307m |

Source: [AnnualReturn](https://www.odata.charities.govt.nz/AnnualReturn) pull, `sensitivity.spendFieldCoverageByYear` in the data file. "—" means no return with that year-end fills the field. Sums are rounded to the nearest million. An entity can file more than one return with the same year-end, and entities deregistered since are not included, so these are not one-return-per-entity totals.

The few returns with all four fields empty carry most of the money. The grant figure for these entities falls from NZ$709m for 2015 year-ends to NZ$234m for 2016 year-ends. It climbs back above NZ$1b only for 2025 year-ends. The top 10 funders show the pattern ([AnnualReturn](https://www.odata.charities.govt.nz/AnnualReturn) pull, `sensitivity.top10[].history`):

- All 10 have blank grant fields on the returns just before their latest figure.
- Six of them report grants up to 2015 year-ends, then nothing until 2023–2025 year-ends.
- The Health Research Council of New Zealand (CC40763) reports NZ$81.0m for 2015, blank fields for 2016 to 2024, and NZ$123.6m for 2025.
- Foundation North Grants Limited (CC38999) reports NZ$38.7m for 2015, blank fields for 2016 to 2023, and NZ$52.1m for 2024.

The 47 grantmakers whose latest return is still blank (44 Tier 2, 3 Tier 1) report NZ$564m in total expenditure between them. That is an upper bound on their missing grants, not an estimate. [GrpOrgLatestReturns](https://www.odata.charities.govt.nz/GrpOrgLatestReturns)

The original finding reports that Charities Services added new fields from XRB reporting standards and Charities Act changes in August 2025, and that it treated older and newer fields separately ([original finding](charities-register-grantmaker-census.md)). The table shows that the data has two breaks, not one: a drop at 2016 year-ends and a recovery from 2023 year-ends. The open data does not say why the 2016 break happens, and the [metadata document](https://www.odata.charities.govt.nz/$metadata) gives no field definitions.

### A fixed-year view

Here the script uses one return per entity: the latest return whose year-end falls in the given calendar year.

| Year-end | Conservative entities | Conservative grant spend | Broad entities | Broad grant spend |
|---|---|---|---|---|
| 2023 | 4,676 | NZ$336,202,387 | 9,127 | NZ$476,325,871 |
| 2024 | 4,963 | NZ$798,134,476 | 9,620 | NZ$1,069,996,396 |
| 2025 | 5,251 | NZ$1,390,777,885 | 10,240 | NZ$1,918,998,801 |

Source: [AnnualReturn](https://www.odata.charities.govt.nz/AnnualReturn) pull, `sensitivity.fixedYears` in the data file. The jump from 2023 to 2025 follows the field change above, so only the 2025 row is close to complete for large funders. Returns are due six months after balance date, so by late November 2026 most 2025 year-end returns should be filed, but late filers can still add to it.

### Sensitivity checks on the conservative set

| Check | Entities | Grant spend | Share of NZ$1.52b |
|---|---|---|---|
| Latest return has a year-end before 2024 (stale) | 71 | NZ$31,226,921 | 2.1% |
| Member organisation sits under a Group that is also in the set | 21 | NZ$28,506,820 | 1.9% |
| Non-government grants are 50% or more of gross income (possible regranting) | 178 | NZ$115,381,492 | 7.6% |
| Top 10 funders | 10 | NZ$466,108,118 | 30.6% |
| Top 50 funders | 50 | NZ$893,755,573 | 58.7% |

Source: [GrpOrgLatestReturns](https://www.odata.charities.govt.nz/GrpOrgLatestReturns), [Organisations](https://www.odata.charities.govt.nz/Organisations) and [Groups](https://www.odata.charities.govt.nz/Groups) pulls, `sensitivity` in the data file.

- **Stale returns.** The largest is a registered entity whose latest return ended in March 2015 and reports NZ$21.2m. A latest-return total counts that money as if it were current.
- **Group overlap.** 42 Groups are in the set, with NZ$153.6m. If a Group return consolidates its members' accounts, the 21 members under those Groups are counted twice. If it does not, there is no overlap. The register fields do not say which, so NZ$28.5m is an upper bound.
- **Regranting.** "Non-government grants" here means `GrantsRevenueFromOtherSources + GeneralGrantsReceived + AllOtherGrantsAndSponsorship`. Government grants are left out because government money is not in the register total, so it cannot be counted twice. Only grants received from other registered charities would double count, and the register has no recipient-level data to separate them. So NZ$115m is an upper bound.

### The top 10 funders checked against their own reports

The script checks the calculation, not the charities' accounts. So the top 10 funders, which hold 30.6% of the conservative total, were checked by hand against the reports they publish.

| Funder (register number) | Register, latest return | Own report | Result | Main source of the money |
|---|---|---|---|---|
| Health Research Council of New Zealand (CC40763) | NZ$123,565,000, year-end 30 Jun 2025 | "Research Grant costs" NZ$123,565,000, year ended 30 June 2025 ([HRC Annual Report 2025](https://www.hrc.govt.nz/sites/default/files/2025-11/HRC_Annual-Report-2025-WEB_0.pdf)) | Exact | The Crown: "Funding from the Crown" NZ$128.9m of NZ$130.5m total income (same report) |
| Foundation North Grants Limited (CC38999) | NZ$72,468,000, year-end 31 Mar 2026 | "Grants and other funding committed to groups" NZ$72,018,000, year ended 31 March 2026 ([Foundation North 2026 Annual Report](https://www.foundationnorth.org.nz/downloads/assets/2069/2026%20Annual%20Report.pdf)) | Register 0.6% higher | Investments: "Gain from investments" NZ$229.6m of NZ$232.2m total revenue (same report) |
| The University of Auckland Foundation (CC10985) | NZ$41,903,000, year-end 31 Dec 2025 | "Distributions and Grants" NZ$41,903,000, for a group that includes the Medical and Health Sciences Foundation ([University of Auckland Foundation Annual Report 2025](https://www.auckland.ac.nz/assets/giving/donors/Annual%20Report%202025.pdf)) | Exact, at group level | "Gifts and Legacies" NZ$33.0m and "Investment Gain" NZ$37.3m (same report) |
| New Zealand Community Trust (CC57090) | NZ$36,334,000, year-end 30 Sep 2025 | Net grants paid NZ$38,244,000. Total "Distribution to the Community", after the change in the grant accrual, NZ$36,334,000 ([NZCT Annual Report 2025](https://static1.squarespace.com/static/67e0a999766e3d4498d90ead/t/697676cd36bdf27db3144808/1769371341613/NZCT_Annual_Report_2025_FINAL.pdf)) | Equals the accrual-basis distribution; 5.0% below net grants paid | Gaming machines: "Gaming machine profit" NZ$93.8m of NZ$94.8m operating revenue (same report) |
| Waikato Raupatu Lands Trust and Group (CC43060) | NZ$32,742,000, year-end 31 Mar 2026 | Own 2026 report not readable as text. For 2025, a secondary source says "the Trust distributed $32.7m to its members"; the register's 2025 figure is NZ$32,674,000 ([TDB Advisory, Iwi Investment Report 2025](https://www.tdb.co.nz/wp-content/uploads/2026/02/TDB-Iwi-Investment-Report-2025.pdf)) | Latest not checked; 2025 agrees with a secondary source | Iwi settlement trust (same TDB report) |
| The Gift Trust (CC40774) | NZ$26,623,363, year-end 31 Mar 2026 | 2026 statements not publicly readable. The 2024 report gives "Gifts paid to charities" NZ$59.9m for 1 April 2023 to 31 March 2024; the register's 2024 figure is NZ$59,853,637 ([The Gift Trust 2024 report](https://drive.google.com/uc?export=download&id=1BAHThYChea283Qo-iQsZXTs4GlTeKY10)) | Latest not checked; 2024 agrees | Gifts from donors, paid on to other charities (same report) |
| Saint John's College Trust Board Group (CC61455) | NZ$23,532,000, year-end 31 Dec 2025 | The latest published report is for 2023, a draft "subject to audit": "Total distributions for 2023 were $23,796,000" ([St John's College Trust Board 2023 report](https://www.sjctb.co.nz/_files/ugd/512db3_fa2129c615684fe58d7f7bdcc018489b.pdf)) | Latest not checked | Not checked |
| The University of Auckland Medical & Health Sciences Foundation (CC30871) | NZ$22,470,000, year-end 31 Dec 2025 | No standalone figure found; the foundation is part of the NZ$41.9m group figure above | Not checked; possibly counted twice | Not checked |
| National Assistance Fund (CC37140) | NZ$57,219,587, year-end 31 Dec 2025 | No public report found | Not checked | Not checked |
| Activate Foundation Trust (CC24620) | NZ$29,251,168, year-end 31 Dec 2025 | No public report found | Not checked | Not checked |

Register column: [GrpOrgLatestReturns](https://www.odata.charities.govt.nz/GrpOrgLatestReturns) pull, `sensitivity.top10` in the data file. Own reports accessed 2026-11-24.

What the check shows:

- **The register figures hold where they can be checked.** Three latest figures match the funder's own report within 1%. A fourth (NZCT) matches its accrual-basis distribution and is 5.0% below its cash grants. Six latest figures could not be checked from public reports.
- **The own reports confirm the gap for large funders.** HRC's 2025 report gives research grant costs of NZ$126,874,000 for the year ended 30 June 2024 (the "Actual 2024" column), but HRC's 2024 register return has no grant figure. St John's College reports NZ$23.8m of distributions for 2023, but its 2023 register return has no grant figure. [AnnualReturn](https://www.odata.charities.govt.nz/AnnualReturn); [HRC Annual Report 2025](https://www.hrc.govt.nz/sites/default/files/2025-11/HRC_Annual-Report-2025-WEB_0.pdf); [St John's College Trust Board 2023 report](https://www.sjctb.co.nz/_files/ugd/512db3_fa2129c615684fe58d7f7bdcc018489b.pdf)
- **One more possible double count.** The University of Auckland Foundation's NZ$41.9m is a group figure that includes the Medical and Health Sciences Foundation, which also reports NZ$22.5m. In the register the two are separate organisations with no Group link, so the Group overlap check cannot catch this. If the second figure is part of the first, NZ$22.5m (1.5%) is counted twice. [Organisations](https://www.odata.charities.govt.nz/Organisations)
- **The total includes Crown, iwi and gaming money.** The original finding says its figures exclude Crown entities and iwi entities ([original finding](charities-register-grantmaker-census.md)). That holds only for funders that are not registered charities. The top 10 includes a Crown entity (HRC, NZ$123.6m, 98.8% Crown funded), an iwi settlement trust (NZ$32.7m) and a gaming-machine society (NZCT, NZ$36.3m). Together they hold 12.7% of the conservative total.
- **Grant spend is not the same as money a small charity can apply for.** HRC's grants are research grants, and the iwi trust distributes to its members. For stream #2, the register total is an upper bound on contestable funding, not an estimate of it.

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| The published conservative count reproduces within 1.1% | [GrpOrgLatestReturns pull](https://www.odata.charities.govt.nz/GrpOrgLatestReturns) | [AnnualReturn pull, independent selection](https://www.odata.charities.govt.nz/AnnualReturn) | High that the calculation reproduces; both sources are the same register |
| The same definition gives NZ$1.52b today against NZ$1.21b in July | [GrpOrgLatestReturns pull](https://www.odata.charities.govt.nz/GrpOrgLatestReturns) | [original finding](charities-register-grantmaker-census.md) for the July figure | High |
| Large funders' grant spend is blank in the open data for 2016 to about 2024 year-ends | [AnnualReturn pull](https://www.odata.charities.govt.nz/AnnualReturn) | [HRC Annual Report 2025](https://www.hrc.govt.nz/sites/default/files/2025-11/HRC_Annual-Report-2025-WEB_0.pdf): NZ$126.9m of research grants for a year the register leaves blank | High for the gap; Medium for its size |
| The total includes Crown, iwi and gaming money (12.7%), which the original finding says it excludes | [GrpOrgLatestReturns pull](https://www.odata.charities.govt.nz/GrpOrgLatestReturns) | [HRC Annual Report 2025](https://www.hrc.govt.nz/sites/default/files/2025-11/HRC_Annual-Report-2025-WEB_0.pdf); [NZCT Annual Report 2025](https://static1.squarespace.com/static/67e0a999766e3d4498d90ead/t/697676cd36bdf27db3144808/1769371341613/NZCT_Annual_Report_2025_FINAL.pdf); [TDB Advisory, Iwi Investment Report 2025](https://www.tdb.co.nz/wp-content/uploads/2026/02/TDB-Iwi-Investment-Report-2025.pdf) | High |
| 2025 year-end returns: 5,251 entities, NZ$1.39b | [AnnualReturn pull](https://www.odata.charities.govt.nz/AnnualReturn) | Only one source | Medium; late filers can still raise it |

## What would change this conclusion

- **If `GrantsAndDonationsMade` and `GrantsorDonationsPaid` measure different things**, for example if one includes transfers to related entities and the other does not, then the four-field sum mixes concepts and the fixed-year total needs a field-by-field split. The [metadata document](https://www.odata.charities.govt.nz/$metadata) gives names and types, not definitions. A Charities Services data dictionary or a direct answer from them would settle it.
- **If the funders' own accounts disagree with the register figures**, the register is a weaker base than this finding assumes. Four of the top 10 latest figures agree with the funders' own reports, and six could not be checked. A check of the 20 sampled entities (`spotCheckSample` in the data file) against their performance reports is still to do. The charity summary pages on charities.govt.nz return HTTP 403 to scripted fetches, so this needs a browser.
- **If Group returns consolidate their members**, up to NZ$28.5m is counted twice. If they do not, there is no overlap.
- **If the July proxy is wrong**, the split of the NZ$311m change between new filings and other causes changes. The proxy cannot rebuild entities registered or deregistered since July.
- **Regranting needs recipient-level data.** The register publishes how much each charity pays out, not to whom, so the regranting check gives only an upper bound.
- **The 47 blind grantmakers** may be overdue, exempt, or reporting grants in another field. Their NZ$564m in expenditure is an upper bound on what the totals miss.

## Open follow-up questions

- The top 10 already includes a Crown entity, an iwi trust and a gaming-machine society. Which of the top 50 get their money from the Crown, gaming machines or iwi settlements? With that split, the register total could be divided by source of money.
- Does the University of Auckland Foundation's register figure include the Medical and Health Sciences Foundation's NZ$22.5m? Its standalone financial statements would answer this.
- Does the 2025 year-end total hold once late filers arrive? A re-run in mid-2027 with the committed script would show it.
- Why do Tier 1 and Tier 2 grant figures disappear from the open data for 2016–2022 year-ends? If the filed performance reports hold the figures, Charities Services could backfill them, and a consistent series would become possible.
- Why are 47 Tier 1 and Tier 2 grantmakers still blank on all grant fields in their latest return?
- Do Group returns consolidate their members' accounts? This decides whether the overlap check is zero or NZ$28.5m.

## Sources

All open-data pulls accessed 2026-11-24 (UTC time in the data file's `meta.accessedAt`). Data: Charities Services, CC BY 3.0 NZ.

1. Charities Services open data, `Organisations` entity set: https://www.odata.charities.govt.nz/Organisations
2. Charities Services open data, `Groups` entity set: https://www.odata.charities.govt.nz/Groups
3. Charities Services open data, `GrpOrgLatestReturns` entity set: https://www.odata.charities.govt.nz/GrpOrgLatestReturns
4. Charities Services open data, `AnnualReturn` entity set: https://www.odata.charities.govt.nz/AnnualReturn
5. Charities Services open data, metadata document: https://www.odata.charities.govt.nz/$metadata
6. Original finding: [`research/findings/grant-access/charities-register-grantmaker-census.md`](charities-register-grantmaker-census.md)
7. Replication script: [`scripts/research/charities-register-grantmaker-replication.mjs`](../../../scripts/research/charities-register-grantmaker-replication.mjs)
8. Replication data: [`research/data/charities-register-grantmaker-replication/run-2026-11-24.json`](../../data/charities-register-grantmaker-replication/run-2026-11-24.json)

Funders' own reports, accessed 2026-11-24:

9. Health Research Council of New Zealand, Annual Report 2025: https://www.hrc.govt.nz/sites/default/files/2025-11/HRC_Annual-Report-2025-WEB_0.pdf
10. Foundation North, 2026 Annual Report: https://www.foundationnorth.org.nz/downloads/assets/2069/2026%20Annual%20Report.pdf
11. University of Auckland Foundation, Annual Report 2025: https://www.auckland.ac.nz/assets/giving/donors/Annual%20Report%202025.pdf
12. New Zealand Community Trust, Annual Report 2025: https://static1.squarespace.com/static/67e0a999766e3d4498d90ead/t/697676cd36bdf27db3144808/1769371341613/NZCT_Annual_Report_2025_FINAL.pdf (archived: https://web.archive.org/web/20260422182825/https://static1.squarespace.com/static/67e0a999766e3d4498d90ead/t/697676cd36bdf27db3144808/1769371341613/NZCT_Annual_Report_2025_FINAL.pdf)
13. The Gift Trust, 2024 annual report (linked from https://thegifttrust.org.nz/about-us/our-history/): https://drive.google.com/uc?export=download&id=1BAHThYChea283Qo-iQsZXTs4GlTeKY10 (a Wayback capture failed on 2026-11-24)
14. St John's College Trust Board, 2023 report (draft, subject to audit; linked from https://www.sjctb.co.nz/reports): https://www.sjctb.co.nz/_files/ugd/512db3_fa2129c615684fe58d7f7bdcc018489b.pdf (archived: https://web.archive.org/web/20260914125916/https://www.sjctb.co.nz/_files/ugd/512db3_fa2129c615684fe58d7f7bdcc018489b.pdf)
15. Secondary source: TDB Advisory, Iwi Investment Report 2025: https://www.tdb.co.nz/wp-content/uploads/2026/02/TDB-Iwi-Investment-Report-2025.pdf
