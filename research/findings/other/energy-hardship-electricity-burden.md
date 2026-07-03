---
title: "Electricity burden is highest for low-income NZ households, but public data does not show it by deprivation decile"
domain: "other"
issue: "#282"
confidence: "Medium"
author: "The For Good Project"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-03"
status: "draft"
---

# Electricity burden is highest for low-income NZ households, but public data does not show it by deprivation decile

## Executive answer

- I could not verify a public table showing electricity spending as a proportion of household income by NZDep deprivation decile; NZDep2023 is an area-level deprivation index, while the public household-energy burden evidence I found is by household income decile or quintile [NZDep2023 skill notes](https://github.com/thecolab-ai/.skills/tree/main/skills/deprivation-nz); [Stats NZ, 2017](https://www.stats.govt.nz/assets/Uploads/Retirement-of-archive-website-project-files/Reports/Investigating-different-measures-of-energy-hardship-in-New-Zealand/Download-data/Investigating-different-measures-of-energy-hardship-in-New-Zealand.pdf).
- On the closest verified measure, income decile, the burden is steeply regressive: a 2024 Public Health Communication Centre analysis of Household Economic Survey data reports electricity expenditure at 7.7% of total household income for the lowest-income decile and 1.3% for the highest-income decile [PHCC, 2024](https://www.phcc.org.nz/briefing/energy-poverty-lowest-income-households-pay-more-aotearoa).
- The full income-decile series reported in that PHCC figure is: decile 1 7.7%, decile 2 5.0%, decile 3 4.6%, decile 4 3.4%, decile 5 2.9%, decile 6 2.4%, decile 7 2.0%, decile 8 1.7%, decile 9 1.4%, and decile 10 1.3% [PHCC figure image, 2024](https://www.phcc.org.nz/sites/default/files/2024-11/energy_poverty_2.png).
- Disconnection risk is real and now better measured: the Electricity Authority says its Jan-Oct 2025 dashboard data showed an average 810 postpay disconnections per month and an average 27,000 prepay disconnections per month, affecting about 10,000 prepay customers per month, about 35% of prepay customers [Electricity Authority, 2025](https://www.ea.govt.nz/news/general-news/strengthening-visibility-of-disconnections-in-the-retail-electricity-market/).
- MSD hardship data shows continuing electricity/gas payment pressure: in the March 2026 quarter, MSD's national benefit fact-sheet workbook records 8,220 hardship-assistance payments for "Electricity and Gas", worth $4.77 million, within 581,133 total hardship-assistance payments worth $177.9 million [MSD benefit statistics page, 2026](https://www.msd.govt.nz/about-msd-and-our-work/publications-resources/statistics/benefit/index.html); [MSD March 2026 workbook](https://www.msd.govt.nz/documents/about-msd-and-our-work/publications-resources/statistics/benefit/2026/quarterly-benefit-fact-sheets-national-benefit-tables-march-2026.xlsx).

**Overall confidence:** Medium - the income-decile and disconnection findings are supported by credible official or expert sources, but the exact deprivation-decile answer is not publicly available in the sources checked.

## Evidence

### The requested deprivation-decile table was not publicly verifiable

NZDep2023 ranks small areas from decile 1 least deprived to decile 10 most deprived, and the local `deprivation-nz` skill notes that NZDep is area-level and should not be treated as individual or household income data [NZDep2023 skill notes](https://github.com/thecolab-ai/.skills/tree/main/skills/deprivation-nz). Stats NZ's 2017 energy-hardship report used the Household Economic Survey for household-level energy costs and noted HES has a relatively small sample size that limits cross-sectional analysis [Stats NZ, 2017](https://www.stats.govt.nz/assets/Uploads/Retirement-of-archive-website-project-files/Reports/Investigating-different-measures-of-energy-hardship-in-New-Zealand/Download-data/Investigating-different-measures-of-energy-hardship-in-New-Zealand.pdf). That same report says it mostly used income quintiles because of HES sample-size limits and included only one income-decile example to illustrate differences in energy-hardship measures by decile [Stats NZ, 2017](https://www.stats.govt.nz/assets/Uploads/Retirement-of-archive-website-project-files/Reports/Investigating-different-measures-of-energy-hardship-in-New-Zealand/Download-data/Investigating-different-measures-of-energy-hardship-in-New-Zealand.pdf).

The most recent public Stats NZ household expenditure release I checked is the year-ended June 2023 release; Stats NZ says it provides Household Economic Survey expenditure statistics and that the next household expenditure statistics release is expected in early 2027 [Stats NZ, 2024](https://www.stats.govt.nz/information-releases/household-expenditure-statistics-year-ended-june-2023/). I did not find a public Stats NZ table in that release that cross-tabulates electricity expenditure, household income, and NZDep decile [Stats NZ, 2024](https://www.stats.govt.nz/information-releases/household-expenditure-statistics-year-ended-june-2023/).

### Income-decile evidence shows a steep burden gradient

The best public decile evidence I found is income decile, not deprivation decile: PHCC's 2024 briefing, authored by University of Otago Wellington public-health researchers, says it uses Household Economic Survey information to estimate energy poverty in 2019 [PHCC, 2024](https://www.phcc.org.nz/briefing/energy-poverty-lowest-income-households-pay-more-aotearoa). PHCC reports that the poorest households spend over 7.5% of total household income on electricity while the wealthiest 10% spend 1.3% [PHCC, 2024](https://www.phcc.org.nz/briefing/energy-poverty-lowest-income-households-pay-more-aotearoa). The underlying published figure gives the following income-decile percentages [PHCC figure image, 2024](https://www.phcc.org.nz/sites/default/files/2024-11/energy_poverty_2.png):

| Household income decile | Electricity expenditure as % of total income |
|---|---:|
| 1 - lowest income | 7.7% |
| 2 | 5.0% |
| 3 | 4.6% |
| 4 | 3.4% |
| 5 | 2.9% |
| 6 | 2.4% |
| 7 | 2.0% |
| 8 | 1.7% |
| 9 | 1.4% |
| 10 - highest income | 1.3% |

Stats NZ's earlier official energy-hardship report supports the same direction of inequality: for households in the lowest disposable-income quintile, domestic energy as a percentage of expenditure rose from 4.3% to 6.0% between 1988 and 2015/16, compared with 2.0% to 2.5% for the highest quintile [Stats NZ, 2017](https://www.stats.govt.nz/assets/Uploads/Retirement-of-archive-website-project-files/Reports/Investigating-different-measures-of-energy-hardship-in-New-Zealand/Download-data/Investigating-different-measures-of-energy-hardship-in-New-Zealand.pdf). Stats NZ also reported that, in 2015/16, around one in 17 households paid 10% or more of before-tax income on domestic energy, rising to around one in 10 after housing costs [Stats NZ, 2017](https://www.stats.govt.nz/assets/Uploads/Retirement-of-archive-website-project-files/Reports/Investigating-different-measures-of-energy-hardship-in-New-Zealand/Download-data/Investigating-different-measures-of-energy-hardship-in-New-Zealand.pdf).

### Disconnections are concentrated in prepay counts

The Electricity Authority says retailers may disconnect a customer for non-payment only after complying with the Consumer Care Obligations, and its dashboard counts domestic and small-business customers disconnected each month for non-payment [Electricity Authority dashboard, 2026](https://www.ea.govt.nz/data-and-insights/charts-and-dashboards/disconnections-for-non-payment/). The dashboard documentation says each count in the "Number of disconnections" tab is a disconnection event, and that some customers, especially prepay customers, can be disconnected multiple times in a month [Electricity Authority dashboard, 2026](https://www.ea.govt.nz/data-and-insights/charts-and-dashboards/disconnections-for-non-payment/).

For Jan-Oct 2025, the Authority's published summary says postpay accounts averaged 810 disconnections per month, affecting less than 0.1% of postpay customers, while prepay accounts averaged 27,000 disconnections per month, affecting about 10,000 prepay customers, about 35% of prepay customers, with 58% disconnected more than once [Electricity Authority, 2025](https://www.ea.govt.nz/news/general-news/strengthening-visibility-of-disconnections-in-the-retail-electricity-market/). The same summary says 44% of postpay disconnections and 94% of prepay disconnections, where duration was available, lasted less than one day [Electricity Authority, 2025](https://www.ea.govt.nz/news/general-news/strengthening-visibility-of-disconnections-in-the-retail-electricity-market/). The Authority cautions that the dashboard excludes data from retailers with fewer than 1,000 domestic and small-business ICPs on 1 January 2025 and from retailers with a current extension or exemption [Electricity Authority dashboard, 2026](https://www.ea.govt.nz/data-and-insights/charts-and-dashboards/disconnections-for-non-payment/).

Consumer NZ provides independent survey context rather than administrative counts: in January 2024 it estimated 40,000 households had been disconnected in the previous year because they could not pay their power bill, and it said one in five households had trouble paying their monthly power bill [Consumer NZ, 2024](https://www.consumer.org.nz/home-and-living/home-energy/electricity-disconnection-an-unregulated-threat-for-households). In September 2025, Consumer NZ reported that 20% of respondents had difficulty paying a power bill in the previous year, 7% had taken out a loan to cover a power bill, one in 10 sought government assistance to keep the lights on, and 15% of current prepay users said they had been disconnected because they did not have enough money to top up [Consumer NZ, 2025](https://www.consumer.org.nz/home-and-living/home-energy/power-poverty-persists).

### MSD hardship assistance corroborates payment stress, not disconnections

Work and Income describes a Special Needs Grant as a one-off payment for an essential or emergency cost that a person cannot pay another way [Work and Income, 2026](https://www.workandincome.govt.nz/products/a-z-benefits/special-needs-grant.html). MSD's March 2026 Benefit Fact Sheets snapshot reports 581,133 hardship-assistance payments worth $177.9 million in the March 2026 quarter, and says hardship assistance includes Special Needs Grants, Benefit Advances, and Recoverable Assistance Payments for people with immediate needs [MSD, March 2026 snapshot](https://msd.govt.nz/documents/about-msd-and-our-work/publications-resources/statistics/benefit/2026/benefit-fact-sheet-snapshot-march-2026.pdf).

The national Excel workbook behind MSD's March 2026 benefit statistics records 8,220 "Electricity and Gas" hardship-assistance payments in the March 2026 quarter, worth $4,767,931 [MSD March 2026 workbook](https://www.msd.govt.nz/documents/about-msd-and-our-work/publications-resources/statistics/benefit/2026/quarterly-benefit-fact-sheets-national-benefit-tables-march-2026.xlsx). This does not measure all households in energy hardship, because it only counts approved MSD hardship assistance and does not count households that did not apply, were ineligible, borrowed privately, under-heated, or self-disconnected without receiving MSD support [MSD benefit statistics page, 2026](https://www.msd.govt.nz/about-msd-and-our-work/publications-resources/statistics/benefit/index.html); [Consumer NZ, 2025](https://www.consumer.org.nz/home-and-living/home-energy/power-poverty-persists).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Public evidence supports an income-decile burden gradient, but I could not verify electricity burden by NZDep deprivation decile. | [PHCC income-decile HES analysis](https://www.phcc.org.nz/briefing/energy-poverty-lowest-income-households-pay-more-aotearoa) | [Stats NZ on HES limits and income deciles/quintiles](https://www.stats.govt.nz/assets/Uploads/Retirement-of-archive-website-project-files/Reports/Investigating-different-measures-of-energy-hardship-in-New-Zealand/Download-data/Investigating-different-measures-of-energy-hardship-in-New-Zealand.pdf) | Medium |
| Lowest-income households spend many times the share of income on electricity that highest-income households spend. | [PHCC figure: 7.7% vs 1.3%](https://www.phcc.org.nz/sites/default/files/2024-11/energy_poverty_2.png) | [Stats NZ quintile trend: 6.0% vs 2.5% of expenditure in 2015/16](https://www.stats.govt.nz/assets/Uploads/Retirement-of-archive-website-project-files/Reports/Investigating-different-measures-of-energy-hardship-in-New-Zealand/Download-data/Investigating-different-measures-of-energy-hardship-in-New-Zealand.pdf) | Medium |
| Disconnection counts are now dominated by prepay events, and repeated prepay disconnections affect a substantial share of prepay customers. | [Electricity Authority Jan-Oct 2025 summary](https://www.ea.govt.nz/news/general-news/strengthening-visibility-of-disconnections-in-the-retail-electricity-market/) | [Consumer NZ 2025 prepay survey context](https://www.consumer.org.nz/home-and-living/home-energy/power-poverty-persists) | Medium |
| MSD electricity/gas hardship grants show payment stress but undercount energy hardship. | [MSD March 2026 workbook](https://www.msd.govt.nz/documents/about-msd-and-our-work/publications-resources/statistics/benefit/2026/quarterly-benefit-fact-sheets-national-benefit-tables-march-2026.xlsx) | [Consumer NZ 2025 private borrowing/government-assistance survey context](https://www.consumer.org.nz/home-and-living/home-energy/power-poverty-persists) | Medium |

## What would change this conclusion

- A Stats NZ, MBIE, Electricity Authority, or peer-reviewed table linking household electricity expenditure and household income to NZDep decile would replace the income-decile proxy and could show whether area deprivation adds or changes the gradient.
- Access to HES microdata through Stats NZ's approved research channels could test electricity burden by NZDep decile, ethnicity, tenure, household composition, and region with proper confidence intervals.
- A public export of the Electricity Authority disconnections dashboard, including months after October 2025 and regional or retailer-level aggregates, could update the disconnection count and test whether prepay concentration persists.
- A linked administrative dataset combining disconnections, prepay status, MSD hardship payments, and deprivation geography would show how many disconnections occur among high-deprivation households, but that would require privacy-preserving governance and is not available from public aggregate sources.
- Lived-experience and frontline budgeting-service input is needed to interpret whether short prepay disconnections are low-harm budget management, hidden hardship, or both; the aggregate sources cannot determine household circumstances.

## Open follow-up questions

- Can MBIE or Stats NZ publish an aggregate, privacy-preserving HES table of household energy burden by NZDep decile, tenure, ethnicity, and household type?
- How do prepay disconnections vary by region, deprivation, retailer, and season once the Electricity Authority dashboard adds regional detail?
- How many households receive MSD electricity/gas hardship assistance repeatedly, and what proportion are also on prepay plans?

## Sources

1. Stats NZ. *Household expenditure statistics: Year ended June 2023*. Released 5 March 2024, accessed 3 July 2026. https://www.stats.govt.nz/information-releases/household-expenditure-statistics-year-ended-june-2023/
2. Stats NZ. *Investigating different measures of energy hardship in New Zealand*. September 2017, accessed 3 July 2026. https://www.stats.govt.nz/assets/Uploads/Retirement-of-archive-website-project-files/Reports/Investigating-different-measures-of-energy-hardship-in-New-Zealand/Download-data/Investigating-different-measures-of-energy-hardship-in-New-Zealand.pdf
3. O'Sullivan K, Chen Z, Fyfe C, Pierse N. "Energy poverty: The lowest-income households pay more in Aotearoa." Public Health Communication Centre, 13 November 2024, accessed 3 July 2026. https://www.phcc.org.nz/briefing/energy-poverty-lowest-income-households-pay-more-aotearoa
4. PHCC. Figure 2 image, "Electricity expenditure as a percentage of total income", 2024, accessed 3 July 2026. https://www.phcc.org.nz/sites/default/files/2024-11/energy_poverty_2.png
5. Electricity Authority. "Disconnections for non-payment" dashboard, accessed 3 July 2026. https://www.ea.govt.nz/data-and-insights/charts-and-dashboards/disconnections-for-non-payment/
6. Electricity Authority. "Strengthening visibility of disconnections in the retail electricity market", 15 December 2025, accessed 3 July 2026. https://www.ea.govt.nz/news/general-news/strengthening-visibility-of-disconnections-in-the-retail-electricity-market/
7. Consumer NZ. "Electricity disconnection: an unregulated threat for households", 24 January 2024, accessed 3 July 2026. https://www.consumer.org.nz/home-and-living/home-energy/electricity-disconnection-an-unregulated-threat-for-households
8. Consumer NZ. "Struggling with your power bill? You're not alone", 9 September 2025, accessed 3 July 2026. https://www.consumer.org.nz/home-and-living/home-energy/power-poverty-persists
9. MSD. Benefit statistics page, accessed 3 July 2026. https://www.msd.govt.nz/about-msd-and-our-work/publications-resources/statistics/benefit/index.html
10. MSD. *Benefit Fact Sheets Snapshot: March 2026 Quarter*, accessed 3 July 2026. https://msd.govt.nz/documents/about-msd-and-our-work/publications-resources/statistics/benefit/2026/benefit-fact-sheet-snapshot-march-2026.pdf
11. MSD. *Quarterly Benefit Fact Sheets: National benefit tables, March 2026* workbook, accessed 3 July 2026. https://www.msd.govt.nz/documents/about-msd-and-our-work/publications-resources/statistics/benefit/2026/quarterly-benefit-fact-sheets-national-benefit-tables-march-2026.xlsx
12. Work and Income. "Special Needs Grant", accessed 3 July 2026. https://www.workandincome.govt.nz/products/a-z-benefits/special-needs-grant.html
13. The Colab `.skills` `deprivation-nz` skill notes, accessed from vendored submodule on 3 July 2026. https://github.com/thecolab-ai/.skills/tree/main/skills/deprivation-nz
14. The Colab `.skills` issue #121, "Skill request: energy-hardship-nz - MBIE and HES electricity hardship measures", opened 3 July 2026. https://github.com/thecolab-ai/.skills/issues/121
