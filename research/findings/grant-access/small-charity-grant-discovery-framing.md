---
title: "Small NZ charities face a fragmented grant-discovery problem worth researching"
domain: "grant-access"
issue: "#2"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5"
date: "2026-07-02"
status: "draft"
---

# Small NZ charities face a fragmented grant-discovery problem worth researching

## Executive answer

- The affected population is large enough to justify a research stream: Charities Services reported 29,208 registered charities in 2024/2025, 122,608 charity officers, and about 170,000 volunteers contributing around 1.4 million hours each week; Stats NZ's latest non-profit institutions satellite account, from 2018, separately estimated about 115,000 non-profit institutions and 159 million formal volunteering hours in New Zealand. [Charities Services sector snapshot 2024/2025](https://www.charities.govt.nz/__data/assets/pdf_file/0017/102617/Charities-Sector-Snapshot-2024_2025.pdf); [Stats NZ non-profit institutions satellite account 2018](https://www.stats.govt.nz/reports/non-profit-institutions-satellite-account-2018/)
- Small charities are a substantial share of that population: Charities Services says Tier 4 reporting is for small charities with simple financial activity and annual operating payments under $140,000, and a live Charities Services OData JSON count on 2 July 2026 returned 14,204 registered latest-return records with `ReportingTier eq 'Tier4'`. [Charities Services Tier 4 reporting](https://www.charities.govt.nz/reporting-standards/tier-4); [Charities Services OData query](http://www.odata.charities.govt.nz/GrpOrgLatestReturns?$format=json&$filter=RegistrationStatus%20eq%20%27Registered%27%20and%20ReportingTier%20eq%20%27Tier4%27&$select=Id&$inlinecount=allpages&$top=1)
- The grant landscape is demonstrably fragmented across government, class 4 gaming societies, councils, philanthropic trusts, search products, and sector-specific lists; no single public official machine-readable grants catalogue was found in this discovery pass. [Community Matters](https://www.communitymatters.govt.nz/); [DIA Class 4 grants data](https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data); [Creative New Zealand other funding sources](https://creativenz.govt.nz/funding-and-support/all-opportunities/other-sources-of-funding-and-support)
- Existing tools already try to solve discovery and matching, including Generosity NZ/givUS, GEM Local, and Fundsorter, which is evidence that the workflow pain is recognised by market and sector actors. [Generosity NZ](https://generosity.org.nz/); [GEM Local](https://www.gemlocal.co.nz/); [Fundsorter](https://www.fundsorter.com/)
- The stream has been fanned out into four research questions: opportunity/funder mapping, small-charity workflow pain, machine-readable data availability, and whether missed or under-applied funding can be measured. [Issue #45](https://github.com/thecolab-ai/the-for-good-project/issues/45); [Issue #46](https://github.com/thecolab-ai/the-for-good-project/issues/46); [Issue #47](https://github.com/thecolab-ai/the-for-good-project/issues/47); [Issue #48](https://github.com/thecolab-ai/the-for-good-project/issues/48)

**Overall confidence:** Medium - the scale of charities and the existence of fragmented sources are well supported, but the strongest claims about missed eligible grants and under-application still need primary user research or funder-side data.

## Evidence

### Who is affected

Charities Services' 2024/2025 sector snapshot says New Zealand had 29,208 registered charities, 122,608 charity officers involved in governance and running charities, and about 170,000 volunteers contributing about 1.4 million hours each week. [Charities Services sector snapshot 2024/2025](https://www.charities.govt.nz/__data/assets/pdf_file/0017/102617/Charities-Sector-Snapshot-2024_2025.pdf)

The same snapshot says the charitable sector's 2024/2025 income included $4.28 billion from the combined category "grants and other funding"; this shows that non-donation, non-fee funding is material, but it does not isolate grants-only income. [Charities Services sector snapshot 2024/2025](https://www.charities.govt.nz/__data/assets/pdf_file/0017/102617/Charities-Sector-Snapshot-2024_2025.pdf)

Charities Services defines Tier 4 reporting as a small-charity tier for charities with simple financial activity, cash-based accounting, no public accountability, and annual operating payments under $140,000. [Charities Services Tier 4 reporting](https://www.charities.govt.nz/reporting-standards/tier-4)

The Charities Services open-data page says the OData service contains data about charities, their officers and annual returns, is free, does not require registration, and can be queried in formats including Atom, JSON and CSV. [Charities Services open data](https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data)

Using that OData service, a live count on 2 July 2026 returned 29,331 records where `RegistrationStatus eq 'Registered'`; this differs slightly from the 2024/2025 snapshot because it is a later live register query, not the published 2024/2025 snapshot. [Charities Services OData registered count](http://www.odata.charities.govt.nz/Organisations?$filter=RegistrationStatus%20eq%20%27Registered%27&$select=OrganisationId&$inlinecount=allpages&$top=1)

Using the latest-return view in the same OData service, live JSON counts on 2 July 2026 returned 14,204 registered records with `ReportingTier eq 'Tier4'` and 10,826 with `ReportingTier eq 'Tier3'`; this is an indicative current-register count, changed during review from earlier same-day Atom-query captures, and should be re-run in any later research finding. [Tier 4 OData count](http://www.odata.charities.govt.nz/GrpOrgLatestReturns?$format=json&$filter=RegistrationStatus%20eq%20%27Registered%27%20and%20ReportingTier%20eq%20%27Tier4%27&$select=Id&$inlinecount=allpages&$top=1); [Tier 3 OData count](http://www.odata.charities.govt.nz/GrpOrgLatestReturns?$format=json&$filter=RegistrationStatus%20eq%20%27Registered%27%20and%20ReportingTier%20eq%20%27Tier3%27&$select=Id&$inlinecount=allpages&$top=1)

### What is already being done

Community Matters is a Department of Internal Affairs community funding hub for Lottery, Crown and Trust funding, and its home page lists multiple organisation funds such as COGS, the Community and Volunteering Capability Fund, the Ethnic Communities Development Fund, the Lottery Fund, the Racing Safety Development Fund, and the Safer Communities Fund. [Community Matters](https://www.communitymatters.govt.nz/)

The Community Organisation Grants Scheme page says COGS provides government-funded grants to voluntary and not-for-profit organisations working in local communities, uses 37 Local Distribution Committees, and requires eligible organisations to have less than $2 million annual operating expenditure for each of the past two years. [Community Matters COGS](https://www.communitymatters.govt.nz/community-organisations-grants-scheme)

DIA publishes class 4 grants data for gaming-machine societies and says high-quality data on community grant funding supports decision-making, is intended to be ongoing and annual, and is available through Granted.govt.nz and a data.govt.nz dataset. [DIA Class 4 grants data](https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data); [Granted.govt.nz](https://www.granted.govt.nz/); [data.govt.nz class 4 grants dataset](https://catalogue.data.govt.nz/dataset/b6b7f1cc-bfa4-4c7a-81e8-8a03f2983cae)

Creative New Zealand's "other sources" page is explicitly not comprehensive, but it lists Generosity NZ, government ministries and agencies, and local government pages across many councils, which is direct evidence that seekers may need to move across multiple source types. [Creative New Zealand other funding sources](https://creativenz.govt.nz/funding-and-support/all-opportunities/other-sources-of-funding-and-support)

Generosity NZ describes itself as the largest digital search facility for funding information in Aotearoa and says givUS lists resource schemes for communities, volunteer organisations and clubs; Creative New Zealand and Philanthropy New Zealand both point fundseekers to Generosity NZ/givUS. [Generosity NZ](https://generosity.org.nz/); [Creative New Zealand Generosity NZ databases](https://creativenz.govt.nz/funding-and-support/all-opportunities/other-sources-of-funding-and-support); [Philanthropy NZ fundseekers](https://www.philanthropy.org.nz/fundseeker)

GEM Local describes itself as a grants calendar database for small New Zealand charitable and community organisations, says it provides customised grants calendars, funder records, deadline alerts and writing resources, and says it is designed for New Zealand charities with annual revenue below $1 million. [GEM Local](https://www.gemlocal.co.nz/)

Fundsorter says it provides AI-powered grant matching and application drafting for organisations across Aotearoa, and its site reported 3,361 funding opportunities and 1,650 funders when accessed on 2 July 2026. [Fundsorter](https://www.fundsorter.com/)

Fundsorter's current funding-landscape page says its data measures numbers of contestable opportunities rather than dollars available or granted and does not include non-public funding opportunities; an earlier Fundsorter analysis republished by Hui E! said Fundsorter had analysed almost 2,000 contestable grant funding opportunities across 37 broad categories. This older figure should not be combined with Fundsorter's current homepage counter because the pages appear to describe different snapshots. [Fundsorter funding landscape](https://www.fundsorter.com/funding-landscape); [Hui E! on Fundsorter analysis](https://huie.org.nz/funding-in-aotearoa-what-does-the-data-tell-us/)

Specialised pathways also matter. Te Puni Kokiri's Tupu.nz funding search says there are more than 40 funds, grants and investment opportunities for whanau to develop or progress whenua Maori, Charities Services' Te Ao Maori funding page points to several Te Puni Kokiri funds for Maori organisations, and the Ministry for Pacific Peoples describes a Pacific Languages Community Fund for community groups in Aotearoa. This discovery pass did not map those Maori, iwi, hapu, whanau or Pacific pathways in depth, so solution design should not assume one generic small-charity workflow covers them. [Tupu.nz Maori land funding search](https://www.tupu.nz/en/kokiri/search-for-funding-opportunities/); [Charities Services Te Ao Maori funding](https://www.charities.govt.nz/teaomaoripages/funding); [Ministry for Pacific Peoples Pacific Languages Community Fund](https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-languages-community-fund/)

### What is not yet established

In this discovery pass, I did not find a public official source that quantifies how many eligible small charities miss grants because they do not discover them, so the missed-grants claim should remain a hypothesis until tested with seeker-side and funder-side evidence. [Issue #2](https://github.com/thecolab-ai/the-for-good-project/issues/2); [Issue #48](https://github.com/thecolab-ai/the-for-good-project/issues/48)

I did not find a single public official machine-readable catalogue of all NZ grant opportunities and eligibility rules; the official machine-readable data found in this pass covers charities themselves and class 4 grants, not all open grant opportunities across councils, philanthropic trusts, central government and private funders. [Charities Services open data](https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data); [DIA Class 4 grants data](https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data); [Community Matters](https://www.communitymatters.govt.nz/)

## Surprising or load-bearing claims

The first two rows rely partly on Charities Services register data because that is the authoritative public source for registered-charity counts and reporting tiers; where a second source traces to the same register rather than to an independent origin, the confidence is kept at Medium or the limitation is stated in the table.

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| The population potentially affected is large, with tens of thousands of registered charities and a large volunteer/officer base. | [Charities Services sector snapshot](https://www.charities.govt.nz/__data/assets/pdf_file/0017/102617/Charities-Sector-Snapshot-2024_2025.pdf) | [Stats NZ's older, broader non-profit institutions account](https://www.stats.govt.nz/reports/non-profit-institutions-satellite-account-2018/) | Medium |
| Small charities are a large enough segment to research separately. | [Charities Services Tier 4 definition](https://www.charities.govt.nz/reporting-standards/tier-4) | [Live Charities Services OData Tier 4 count, same register origin](http://www.odata.charities.govt.nz/GrpOrgLatestReturns?$format=json&$filter=RegistrationStatus%20eq%20%27Registered%27%20and%20ReportingTier%20eq%20%27Tier4%27&$select=Id&$inlinecount=allpages&$top=1) | Medium |
| Grant-discovery sources are fragmented rather than concentrated in one public official catalogue. | [Community Matters lists DIA-administered Lottery, Crown and Trust funding](https://www.communitymatters.govt.nz/) | [Creative New Zealand points users to Generosity NZ, central-government sources and many council pages](https://creativenz.govt.nz/funding-and-support/all-opportunities/other-sources-of-funding-and-support) | Medium |
| Current machine-readable official data is partial, not a full opportunity/eligibility catalogue. | [Charities Services open-data documentation](https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data) | [DIA Class 4 grants-data page](https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data) | Medium |
| "Small charities miss grants they are eligible for" is plausible but not yet proven. | [GEM Local states small charities need a customised grants calendar and alerts](https://www.gemlocal.co.nz/) | [Fundsorter frames its tool around finding funding users did not know existed](https://www.fundsorter.com/) | Low; both are vendor leads, not independent proof |

## What would change this conclusion

- A comprehensive official NZ grant-opportunity catalogue with eligibility criteria, deadlines, funder metadata and update cadence would weaken the conclusion that the landscape lacks a public machine-readable source.
- A representative survey or interviews showing that small charities do not experience grant discovery as a material barrier would weaken the case for this stream.
- Funder-side data showing very low rates of eligible-but-non-applicant organisations, or showing that most funds are heavily oversubscribed by appropriate applicants, would weaken the missed-grants hypothesis.
- A validated cross-source dataset connecting charity characteristics, grant eligibility rules, applications and awards would allow stronger claims about under-application than this discovery pass can make.
- I could not verify the dollar value of under-applied or missed grant funding, the number of funders with public eligibility criteria, or whether commercial search tools have near-complete coverage; those require dedicated research or access to non-public product/funder data.
- Human review is needed before solution design because small charities, funders, Maori organisations, iwi, hapu, whanau, Pacific organisations, rural groups and volunteer-led groups may experience discovery barriers differently.

## Follow-up questions opened from this discovery

- [#45](https://github.com/thecolab-ai/the-for-good-project/issues/45): How many grant funders and grant opportunities operate in NZ, and where do their eligibility criteria, deadlines and decision rules actually live?
- [#46](https://github.com/thecolab-ai/the-for-good-project/issues/46): What do small NZ charities and community groups currently use to find grants, and where does that workflow break down?
- [#47](https://github.com/thecolab-ai/the-for-good-project/issues/47): Which NZ grants data sources are machine-readable now, what fields do they expose, and what would need to be assembled manually?
- [#48](https://github.com/thecolab-ai/the-for-good-project/issues/48): Can missed or under-applied grant funding for eligible small charities be measured from public or funder-side data?

## Sources

1. Charities Services. "The charitable sector's year in numbers 2024/2025." Accessed 2 July 2026. https://www.charities.govt.nz/__data/assets/pdf_file/0017/102617/Charities-Sector-Snapshot-2024_2025.pdf
2. Charities Services. "Tier 4 reporting." Updated June 2026. Accessed 2 July 2026. https://www.charities.govt.nz/reporting-standards/tier-4
3. Charities Services. "Open data." Accessed 2 July 2026. https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data
4. Charities Services OData. Registered organisations count query. Accessed 2 July 2026. http://www.odata.charities.govt.nz/Organisations?$filter=RegistrationStatus%20eq%20%27Registered%27&$select=OrganisationId&$inlinecount=allpages&$top=1
5. Charities Services OData. Registered Tier 4 latest-return count query. Accessed 2 July 2026. http://www.odata.charities.govt.nz/GrpOrgLatestReturns?$format=json&$filter=RegistrationStatus%20eq%20%27Registered%27%20and%20ReportingTier%20eq%20%27Tier4%27&$select=Id&$inlinecount=allpages&$top=1
6. Charities Services OData. Registered Tier 3 latest-return count query. Accessed 2 July 2026. http://www.odata.charities.govt.nz/GrpOrgLatestReturns?$format=json&$filter=RegistrationStatus%20eq%20%27Registered%27%20and%20ReportingTier%20eq%20%27Tier3%27&$select=Id&$inlinecount=allpages&$top=1
7. Community Matters. "Community funding hub." Accessed 2 July 2026. https://www.communitymatters.govt.nz/
8. Community Matters. "Community Organisation Grants Scheme." Accessed 2 July 2026. https://www.communitymatters.govt.nz/community-organisations-grants-scheme
9. Department of Internal Affairs. "Class 4 Grants Data." Accessed 2 July 2026. https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data
10. Creative New Zealand. "Other sources of funding and support." Accessed 2 July 2026. https://creativenz.govt.nz/funding-and-support/all-opportunities/other-sources-of-funding-and-support
11. Generosity NZ. "Funding Grants Schemes Scholarships Awards and more." Accessed 2 July 2026. https://generosity.org.nz/
12. Philanthropy New Zealand. "Fundseekers." Accessed 2 July 2026. https://www.philanthropy.org.nz/fundseeker
13. GEM Local. "Finding the grants that are a right fit for your organisation." Accessed 2 July 2026. https://www.gemlocal.co.nz/
14. Fundsorter. "Grant Funding, Sorted." Accessed 2 July 2026. https://www.fundsorter.com/
15. Fundsorter. "Funding Landscape." Accessed 2 July 2026. https://www.fundsorter.com/funding-landscape
16. Hui E! Community Aotearoa. "Funding in Aotearoa - what does the data tell us?" Accessed 2 July 2026. https://huie.org.nz/funding-in-aotearoa-what-does-the-data-tell-us/
17. Stats NZ. "Non-profit institutions satellite account: 2018." Accessed 2 July 2026. https://www.stats.govt.nz/reports/non-profit-institutions-satellite-account-2018/
18. Granted.govt.nz. "Explore Pokie data." Accessed 2 July 2026. https://www.granted.govt.nz/
19. data.govt.nz. "Grants from Gaming Machine Profits." Accessed 2 July 2026. https://catalogue.data.govt.nz/dataset/b6b7f1cc-bfa4-4c7a-81e8-8a03f2983cae
20. Tupu.nz. "Search for funding opportunities." Accessed 2 July 2026. https://www.tupu.nz/en/kokiri/search-for-funding-opportunities/
21. Charities Services. "Te tono putea - Funding." Accessed 2 July 2026. https://www.charities.govt.nz/teaomaoripages/funding
22. Ministry for Pacific Peoples. "Pacific Languages Community Fund." Accessed 2 July 2026. https://www.mpp.govt.nz/programmes-and-funding/pacific-languages/pacific-languages-community-fund/
23. GitHub. "Issue #2: [Discover] Small NZ charities miss grants they're eligible for." Accessed 2 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/2
24. GitHub. "Issue #45: research: Map NZ grant funders and eligibility-source locations." Created 2 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/45
25. GitHub. "Issue #46: research: How small NZ charities find grants and where the workflow fails." Created 2 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/46
26. GitHub. "Issue #47: research: Audit machine-readable NZ grants data and schema gaps." Created 2 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/47
27. GitHub. "Issue #48: research: Measure whether eligible small charities under-apply for grants." Created 2 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/48
