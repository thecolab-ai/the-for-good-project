---
title: "New Zealand has no single register of grant funders: 1,200+ grant schemes exist across at least ~150 institutional funders, and eligibility criteria live almost entirely in unstructured web pages and two paid databases"
domain: "grant-access"
issue: "#5"
confidence: "Medium"
author: "mcinteerj (via Claude agent)"
date: "2026-07-02"
status: "draft"
---

# New Zealand has no single register of grant funders: 1,200+ grant schemes exist across at least ~150 institutional funders, and eligibility criteria live almost entirely in unstructured web pages and two paid databases

## Executive answer

- **There is no official count or register of grant funders in New Zealand.** The best available proxies are the two commercial aggregators: givUS, which lists "over 1,200 grants and schemes for communities" [DOC, Other funding organisations](https://www.doc.govt.nz/get-involved/funding/other-funding-organisations/), and Fundsorter, whose matching algorithm covers "nearly 3,000 funding opportunities" [Philanthropy New Zealand, Fundseeker page](https://www.philanthropy.org.nz/fundseeker). (Opportunities ≠ funders: one funder can run many schemes.)
- **The countable institutional categories add to roughly 150 funders as a floor:** 32 Class 4 (pokie) gaming societies with websites listed by DIA [DIA, List of Society Websites](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-List-of-Society-Websites), 12 statutory community trusts [CommunityNet Aotearoa](https://community.net.nz/resources/nz-navigator-trust/community-trusts), 18 community foundations [Community Foundations of Aotearoa NZ](https://communityfoundations.org.nz/), 18 energy trusts in ETNZ [ETNZ, Our Members](https://www.etnz.org.nz/our-members/), and 78 councils [LGNZ](https://www.lgnz.co.nz/local-government-in-nz/councils-in-aotearoa/), plus central government funds (the Lottery Grants Board alone allocated $311m for 2026/27 across 7 distribution committees [Community Matters, LGB Allocations](https://www.communitymatters.govt.nz/lottery-grants-board-committee-allocations)). The long tail — hundreds of private/family charitable trusts, many administered by trust companies like Perpetual Guardian and Public Trust — has no authoritative public count [Kate Frykberg, A brief guide to the philanthropic sector](https://kate.frykberg.co.nz/2021/04/13/a-brief-guide-to-the-philanthropic-sector-and-grant-seeking-in-aotearoa-nz/).
- **Eligibility/criteria data is almost entirely unstructured.** It lives on individual funder websites and PDFs, and in two paid products: givUS (subscription; free public access via most council libraries) [Generosity NZ, givUS](https://generosity.org.nz/giv-us) and Fundsorter (from $20/month) [Fundsorter](https://www.fundsorter.com/). **No open, machine-readable dataset of grant eligibility criteria exists** (Medium confidence — proving a negative; see limits).
- **What IS machine-readable is grants *distributed*, not eligibility:** DIA publishes Class 4 grant distribution data as an open dataset [data.govt.nz, Class 4 grants data](https://catalogue.data.govt.nz/dataset/class-4-grants-data) surfaced through [Granted.govt.nz](https://www.granted.govt.nz/), and the Charities Register offers an open data service (OData API, CC BY 3.0 NZ) covering all ~28,000 registered charities' filings [Charities Services, Open data](https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data/); [DIA, Charities Act overview](https://www.dia.govt.nz/charitiesact-overview).
- **Implication for a grant-matching tool** (the decision this informs): assembling eligibility data means scraping/curating funder websites or licensing aggregator data — there is no open dataset to build on. The open distribution data is still valuable: it shows who actually funds what, which can validate or even substitute for stated eligibility criteria.

**Overall confidence:** Medium — the category counts and data-format findings are well-sourced and current (High), but the total funder count is inherently a floor estimate, and the headline scheme counts (1,200+ / ~3,000) are vendor figures repeated by secondary sources rather than independently audited (Low–Medium).

## Evidence

### There is no single register or count

New Zealand's funding landscape is described by the Centre for Social Impact as coming from "eight main types of sources": community trusts, energy trusts, government and council funds, community foundations, gaming trusts, family and individual trusts and foundations, corporate foundations, and licensing trusts [Centre for Social Impact, Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide). No government agency maintains a register of grant *funders* (the Charities Register covers charities generally, and grantmakers are not separately flagged as such in a dedicated public register). Total philanthropic and grant spend is estimated at $3.8 billion a year by JBWere's New Zealand Support Report, as cited by Philanthropy New Zealand [Philanthropy NZ, What we do](https://www.philanthropy.org.nz/what-we-do).

### Countable categories (verified counts, July 2026)

| Category | Count | Source |
|---|---|---|
| Class 4 gaming societies (grant-distributing, with websites listed by DIA) | 32 | [DIA, List of Society Websites](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-List-of-Society-Websites) — count verified by enumerating the page's list, 2 July 2026 |
| Statutory community trusts (1988 trustee-bank origin) | 12 | [CommunityNet Aotearoa](https://community.net.nz/resources/nz-navigator-trust/community-trusts); [Trust Waikato, Community Trusts history](https://trustwaikato.co.nz/about-us/our-history/community-trusts-history/) |
| Community foundations | 18 | [Community Foundations of Aotearoa NZ](https://communityfoundations.org.nz/) ("There are 18 Community Foundations across Aotearoa New Zealand") |
| Energy trusts (ETNZ members) | 18 | [ETNZ, Our Members](https://www.etnz.org.nz/our-members/) — member list counted 2 July 2026; not all energy trusts are grantmakers, and some non-members exist |
| Councils (11 regional + 61 territorial + 6 unitary) | 78 | [LGNZ, Councils in Aotearoa](https://www.lgnz.co.nz/local-government-in-nz/councils-in-aotearoa/) — most run community grant schemes, but this needs per-council verification (see follow-ups) |
| Lottery distribution committees | 7 (6 regional + 1 national) | [Community Matters, LGB Allocations](https://www.communitymatters.govt.nz/lottery-grants-board-committee-allocations) |

The Lottery Grants Board "has allocated $311,030,630.00 to the lottery distribution committees for the 2026/27 financial year" [Community Matters, LGB Allocations](https://www.communitymatters.govt.nz/lottery-grants-board-committee-allocations). The Centre for Social Impact estimates government and council funds distribute "nearly $400 million each year" to community organisations [Centre for Social Impact, Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide).

### The long tail: private trusts and foundations

Private and family trusts/foundations (e.g. Tindall Foundation, JR McKenzie Trust, Todd Foundation, NEXT Foundation) are a major category with no public count [Community Foundations NZ, A brief guide to the philanthropic sector](https://communityfoundations.org.nz/latest-news/a-brief-guide-to-the-philanthropic-sector). Many smaller charitable trusts are administered by commercial trust companies — Public Trust runs a "Grantseeker's Portal — a search tool for the grant-making trusts they administer" [Centre for Social Impact, Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide); Perpetual Guardian similarly manages many [Kate Frykberg, A brief guide](https://kate.frykberg.co.nz/2021/04/13/a-brief-guide-to-the-philanthropic-sector-and-grant-seeking-in-aotearoa-nz/). In 2018 JBWere estimated trust-and-foundation giving at almost $300 million/year, ~8% of total philanthropy [Philanthropy NZ, Trust and foundation giving](https://www.philanthropy.org.nz/trust-and-foundation-giving).

### Where eligibility data lives, by format

**Unstructured web pages and PDFs (the default).** Each funder publishes criteria on its own site in its own format. DIA notes that for pokie grants, "application forms are available from societies" individually [DIA, Funding for Community Groups](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-Funding-For-Community-Groups). Government funds are described scheme-by-scheme on Community Matters (e.g. [Lottery Community](https://www.communitymatters.govt.nz/lottery-community)).

**Paid aggregators (the only consolidated sources).**
- **givUS** (Generosity New Zealand): "New Zealand's primary source of information about funding for community organisations and contains over 1200 resource schemes" [Wheelhouse, givUS](https://wheelhouse.org.nz/funding-assistance/givus/); DOC independently describes it as "access to over 1,200 grants and schemes" [DOC, Other funding organisations](https://www.doc.govt.nz/get-involved/funding/other-funding-organisations/). Palmerston North City Council describes it as "a searchable database that will give you the best matches for funding you may be eligible for, along with closing dates, application requirements and contact details" [Palmerston North City Council, Generosity New Zealand database](https://www.pncc.govt.nz/council-city/community-funding/generosity-new-zealand-database/). Subscription-based; "most council libraries subscribe to givUS on behalf of ratepayers, which enables FREE public access" [Generosity NZ, givUS](https://generosity.org.nz/giv-us). Not open data; no public API found.
- **Fundsorter**: a paid matching service ("From $20/month") whose "algorithm analyses over 50 factors across nearly 3,000 funding opportunities" [Fundsorter](https://www.fundsorter.com/); [Philanthropy NZ, Fundseeker page](https://www.philanthropy.org.nz/fundseeker). The Centre for Social Impact describes it as "a paid service that helps charities find and apply for strategically aligned contestable grant funding opportunities" [CSI, Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide). Not open data; no public API found.

**Open, machine-readable data (distribution-side only).**
- **Class 4 (pokie) grants data**: DIA states "the data is available on Granted.govt.nz which provides easy access to class 4 'pokie' grants distribution data right down to a local level. The dataset can be found as an excel file" on the data.govt.nz catalogue [DIA, Gambling statistics class 4 grants data](https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data); [data.govt.nz, Class 4 grants data](https://catalogue.data.govt.nz/dataset/class-4-grants-data) (URL verified live, 2 July 2026). This covers grants *made* (recipient, amount, purpose), not eligibility criteria.
- **Charities Register open data**: "The open data service is intended to be used by software developers who wish to write applications making use of the data from the Charities Register", with a data dictionary and entity-relationship diagram published, licensed CC BY 3.0 NZ [Charities Services, Open data](https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data/). There are "around 28,000" registered charities [DIA, Charities Act overview](https://www.dia.govt.nz/charitiesact-overview). Grantmaking funders that are registered charities file annual returns here (including grants paid), so this is the best open source for *identifying* funders and their scale — but again, not their eligibility criteria.

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| No open, machine-readable dataset of NZ grant eligibility criteria exists; the only consolidated eligibility sources are two paid products | [givUS — subscription product](https://generosity.org.nz/giv-us) | [Fundsorter — paid product](https://www.fundsorter.com/); searches of data.govt.nz and funder/aggregator sites found no open eligibility dataset | Medium — a negative claim; a dataset could exist unfound |
| givUS lists 1,200+ schemes (best proxy for total discretionary grant schemes) | [DOC](https://www.doc.govt.nz/get-involved/funding/other-funding-organisations/) | [Wheelhouse](https://wheelhouse.org.nz/funding-assistance/givus/); [Te Papa](https://www.tepapa.govt.nz/learn/for-museums-and-galleries/how-guides/running-museum/funding-and-sponsorship) — note: all likely restate the vendor's own figure, so these are not fully independent | Medium |
| Class 4 grant distribution data is fully open and machine-readable | [DIA gambling statistics](https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data) | [data.govt.nz catalogue entry](https://catalogue.data.govt.nz/dataset/class-4-grants-data) | High |
| 32 grant-distributing gaming societies (DIA website list) | [DIA List of Society Websites](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-List-of-Society-Websites) — deterministic count of listed sites | Corroborated by the same list naming Lion Foundation, NZCT, Pub Charity etc.; note this lists societies *with websites*, licensed-society totals may differ slightly | High (for the list); Medium (as "all societies") |
| Lottery Grants Board allocated $311m for 2026/27 | [Community Matters, LGB Allocations](https://www.communitymatters.govt.nz/lottery-grants-board-committee-allocations) | Single official primary source — second source not found for this year's figure | High (official primary) |

## What would change this conclusion

- **Discovery of an open eligibility dataset** — e.g. an academic compilation, a council open-data release, or a Generosity NZ/Philanthropy NZ data export — would overturn the central "no open data" finding. I checked data.govt.nz, DIA, Charities Services, and the two aggregators' public pages, but not exhaustively (e.g. no OIA requests, no direct contact with Generosity NZ).
- **Vendor figures verified or corrected**: the 1,200+ (givUS) and ~3,000 (Fundsorter) figures are the vendors' own claims. Direct confirmation of scheme counts, coverage overlap, and update cadence from the vendors would firm up (or shrink) the landscape estimate.
- **Un-enumerated categories**: I did not count licensing trusts, corporate foundations, iwi/hapū funders, or the private-trust long tail. A Charities Register data pull (annual-return "grants paid" fields) could produce a defensible funder count and would materially improve on my ~150 floor.
- **Council schemes unverified per-council**: "78 councils" is a ceiling for council funders — I did not verify that every council runs a grant scheme, nor count schemes per council.
- **Could not verify**: whether givUS/Fundsorter license their data for reuse; whether Granted.govt.nz has an API (only the Excel dataset is confirmed); current licensed Class 4 society totals vs. the DIA website list.
- **No contact was made with any organisation** — this is desk research only.

## Open follow-up questions

- What would a Charities Register open-data pull show about how many registered charities report making grants, and at what scale? (Directly buildable — the API is open.)
- Do Generosity NZ or Fundsorter license their scheme data, and at what cost? Would either partner with a public-good project?
- How many of the 78 councils run contestable community grant schemes, and in what format are their criteria published?
- Is the Class 4 distribution data (who funds what, where) rich enough to *infer* de facto eligibility for a matching tool, bypassing stated criteria?
- How many licensing trusts, corporate foundations, and iwi/hapū funders distribute grants, and where are their criteria published?

## Sources

1. Department of Conservation. "Other funding organisations." Accessed 2 July 2026. https://www.doc.govt.nz/get-involved/funding/other-funding-organisations/
2. Philanthropy New Zealand. "Fundseeker." Accessed 2 July 2026. https://www.philanthropy.org.nz/fundseeker
3. Department of Internal Affairs. "List of Society Websites." Accessed 2 July 2026. https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-List-of-Society-Websites
4. CommunityNet Aotearoa. "Community Trusts." Accessed 2 July 2026. https://community.net.nz/resources/nz-navigator-trust/community-trusts
5. Trust Waikato. "Community Trusts history." Accessed 2 July 2026. https://trustwaikato.co.nz/about-us/our-history/community-trusts-history/
6. Community Foundations of Aotearoa New Zealand. Homepage. Accessed 2 July 2026. https://communityfoundations.org.nz/
7. Energy Trusts of New Zealand. "Our Members." Accessed 2 July 2026. https://www.etnz.org.nz/our-members/
8. Local Government New Zealand. "Councils in Aotearoa New Zealand." Accessed 2 July 2026. https://www.lgnz.co.nz/local-government-in-nz/councils-in-aotearoa/
9. Community Matters (DIA). "Lottery Grants Board Allocations." Accessed 2 July 2026. https://www.communitymatters.govt.nz/lottery-grants-board-committee-allocations
10. Community Matters (DIA). "Lottery Community." Accessed 2 July 2026. https://www.communitymatters.govt.nz/lottery-community
11. Kate Frykberg. "A brief guide to the philanthropic sector and grant-seeking in Aotearoa NZ." 13 April 2021. Accessed 2 July 2026. https://kate.frykberg.co.nz/2021/04/13/a-brief-guide-to-the-philanthropic-sector-and-grant-seeking-in-aotearoa-nz/
12. Centre for Social Impact. "Funding guide." Accessed 2 July 2026. https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide
13. Philanthropy New Zealand. "What we do." Accessed 2 July 2026. https://www.philanthropy.org.nz/what-we-do
14. Philanthropy New Zealand. "Trust and foundation giving." Accessed 2 July 2026. https://www.philanthropy.org.nz/trust-and-foundation-giving
15. Community Foundations NZ. "A brief guide to the philanthropic sector." Accessed 2 July 2026. https://communityfoundations.org.nz/latest-news/a-brief-guide-to-the-philanthropic-sector
16. Generosity New Zealand. "givUS." Accessed 2 July 2026. https://generosity.org.nz/giv-us
17. The Wheelhouse. "givUS." Accessed 2 July 2026. https://wheelhouse.org.nz/funding-assistance/givus/
18. Te Papa. "Funding and sponsorship." Accessed 2 July 2026. https://www.tepapa.govt.nz/learn/for-museums-and-galleries/how-guides/running-museum/funding-and-sponsorship
19. Palmerston North City Council. "Generosity New Zealand database." Accessed 2 July 2026. https://www.pncc.govt.nz/council-city/community-funding/generosity-new-zealand-database/
20. Fundsorter. Homepage. Accessed 2 July 2026. https://www.fundsorter.com/
21. Department of Internal Affairs. "Gambling statistics class 4 grants data." Accessed 2 July 2026. https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data
22. data.govt.nz catalogue. "Class 4 grants data." Accessed 2 July 2026. https://catalogue.data.govt.nz/dataset/class-4-grants-data
23. Granted.govt.nz. Accessed 2 July 2026. https://www.granted.govt.nz/
24. Charities Services. "Open data." Accessed 2 July 2026. https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data/
25. Department of Internal Affairs. "Overview of the charitable sector and the Charities Act." Accessed 2 July 2026. https://www.dia.govt.nz/charitiesact-overview
26. Department of Internal Affairs. "Funding for Community Groups." Accessed 2 July 2026. https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-Funding-For-Community-Groups
