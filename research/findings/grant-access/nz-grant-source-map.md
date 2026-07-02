---
title: "New Zealand grant discovery is a fragmented source-location problem, not a small directory cleanup"
domain: "grant-access"
issue: "#45"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-02"
status: "draft"
---

# New Zealand grant discovery is a fragmented source-location problem, not a small directory cleanup

## Executive answer

- I did not find a single authoritative public register that counts every New Zealand grant funder and every contestable grant opportunity; the most defensible answer is a range, with official sources proving fragmentation and product sources suggesting scale. [Community Matters](https://www.communitymatters.govt.nz/), [DIA Class 4 Grants Data](https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data), [Creative New Zealand, other sources](https://creativenz.govt.nz/funding-and-support/all-opportunities/other-sources-of-funding-and-support), [Fundsorter data notes](https://www.fundsorter.com/data)
- Official public sources already put eligibility and application rules across at least three separate architectures: DIA-administered Lottery, Crown and Trust funding on Community Matters; class 4 gaming-machine societies and Granted.govt.nz; and local council/funder pages linked from Creative New Zealand and council sites. [Community Matters](https://www.communitymatters.govt.nz/), [DIA, Funding for Community Groups](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-Funding-For-Community-Groups), [Creative NZ, Creative Communities Scheme](https://creativenz.govt.nz/funding-and-support/all-opportunities/creative-communities-scheme)
- A cautious lower-bound count from official pages is dozens of source-owning funders before philanthropic trusts are counted: Community Matters lists 13 named funds or fund families in its navigation, DIA lists 32 gaming-machine societies' websites, and Creative NZ's Creative Communities Scheme pushes applications and closing dates to local council websites. [Community Matters COGS page](https://www.communitymatters.govt.nz/community-organisations-grants-scheme), [DIA, List of Society Websites](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-List-of-Society-Websites), [Creative NZ, Creative Communities Scheme](https://creativenz.govt.nz/funding-and-support/all-opportunities/creative-communities-scheme)
- The best public opportunity-count benchmark I found is Fundsorter's commercial dataset: it says it analysed almost 2,000 contestable grant opportunities across 37 broad categories, while Philanthropy New Zealand's fundseeker page describes Fundsorter as analysing over 50 factors across nearly 3,000 funding opportunities. These are useful scale signals, but they are not independent public datasets. [Fundsorter data notes](https://www.fundsorter.com/data), [Philanthropy New Zealand, Fundseekers](https://www.philanthropy.org.nz/fundseeker)
- The eligibility data a small charity needs is not located in one field or one site: eligibility, deadlines, regions, purposes, exclusions, forms and reporting rules live on different fund pages, society websites, council websites, trustee portals and subscription databases. [Community Matters COGS page](https://www.communitymatters.govt.nz/community-organisations-grants-scheme), [DIA, Funding for Community Groups](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-Funding-For-Community-Groups), [Public Trust, grants](https://www.publictrust.co.nz/grants/), [Perpetual Guardian, grants open and upcoming](https://www.perpetualguardian.co.nz/philanthropy/grant-seekers/grants-open-upcoming/)

**Overall confidence:** Medium - confidence is High that source locations are fragmented, Medium on the opportunity-count range, and Low on a deduplicated national funder count because no complete public register was found.

## Evidence

### Official source classes show fragmentation

Community Matters describes itself as "a community funding hub for Lottery, Crown and Trust funding", and its available-funding navigation lists named schemes including COGS, Community and Volunteering Capability Fund, Disarmament Education UN Implementation Fund, Ethnic Communities Development Fund, Lottery Fund, Racing Safety Development Fund, Safer Communities Fund, Norman Kirk Memorial Trust, Viet Nam Veterans and their Families Trust, Winston Churchill Memorial Trust, Chinese Poll Tax Heritage Trust, Pacific Development and Conservation Trust, and Peace and Disarmament Education Trust. [Community Matters](https://www.communitymatters.govt.nz/)

Community Matters centralises some deadline information for funds it administers, but the underlying eligibility rules are still fund-specific: the COGS page gives a 2026 application window, 37 Local Distribution Committees with local priorities, an annual operating-expenditure eligibility threshold, eligible informal groups under $10,000, required documents, funded costs, exclusions and reporting links. [Community Matters, COGS](https://www.communitymatters.govt.nz/community-organisations-grants-scheme)

DIA's class 4 material is a separate source class from Community Matters: DIA says class 4 grants data and applied funds are collected from class 4 societies, made available annually, and exposed through Granted.govt.nz and an Excel dataset. [DIA, Class 4 Grants Data](https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data)

DIA's applicant guidance for gaming-machine grants sends applicants to individual society websites, says application forms are usually available from societies, CABs or venues, and says applicants must apply directly to the society that operates venues in their area and has an authorised purpose matching the organisation's goals. [DIA, Funding for Community Groups](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-Funding-For-Community-Groups)

DIA's list of society websites, last updated September 2025, names 32 gaming-machine societies that operate and distribute grant funding around Aotearoa New Zealand. [DIA, List of Society Websites](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-List-of-Society-Websites)

Class 4 eligibility is partly statutory and partly society-specific: DIA says licensed class 4 corporate societies must apply net proceeds to authorised purposes, including charitable purposes, non-commercial purposes with community benefits, and promoting, controlling and conducting race meetings; DIA also says each society's website outlines its authorised purpose and venue locations. [DIA, Gambling in Pubs and Clubs](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-Gambling-in-Pubs-and-Clubs-%28Class-4%29), [DIA, Funding for Community Groups](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-Funding-For-Community-Groups)

Creative New Zealand explicitly marks its cross-sector funding page as "not a comprehensive list", and that page points users to Generosity NZ, foundations, societies, trusts, government agencies, local government, awards, fellowships, scholarships, residencies and capability-building sources. [Creative NZ, other sources](https://creativenz.govt.nz/funding-and-support/all-opportunities/other-sources-of-funding-and-support)

Creative NZ's own Creative Communities Scheme is a concrete example of eligibility data being split between a national programme page and councils: Creative NZ says the scheme is distributed by city and district councils, supports more than 1,800 projects each year, has local council closing dates that vary, and tells applicants to search their council website for the application form, guide and closing dates. [Creative NZ, Creative Communities Scheme](https://creativenz.govt.nz/funding-and-support/all-opportunities/creative-communities-scheme)

Local-government source fragmentation is structurally large because New Zealand has 67 territorial authorities, and councils are common hosts for local community, arts, events, heritage, environment and wellbeing grant pages. [Stats NZ Map Hub, Territorial Authority dataset](https://maps-by-statsnz.hub.arcgis.com/search?collection=dataset&tags=ta), [DIA, Simplifying Local Government](https://www.dia.govt.nz/simplifying-local-government)

Philanthropic and trustee-administered grants add another layer: Community Foundations NZ says there are 18 Community Foundations across Aotearoa New Zealand, Public Trust's grant search says each trust has specific application criteria and processes, and Perpetual Guardian tells grantseekers to register for its Funding Hub and check 2026 application schedules for open and upcoming grants. [Community Foundations NZ](https://communityfoundations.org.nz/), [Public Trust, grants](https://www.publictrust.co.nz/grants/), [Perpetual Guardian, grants open and upcoming](https://www.perpetualguardian.co.nz/philanthropy/grant-seekers/grants-open-upcoming/)

### Opportunity-count benchmarks

Fundsorter's public data page says it analysed almost 2,000 contestable grant funding opportunities available to New Zealand groups across 37 broad categories; its technical notes say the count measures the number of grant opportunities, not dollars available or granted, excludes non-public funding opportunities such as proactive grantmakers, and may count opportunities in multiple categories where more than one priority applies. [Fundsorter data notes](https://www.fundsorter.com/data)

Philanthropy New Zealand, the peak body for philanthropists, grantmakers, investors and other funders, points fundseekers to Fundsorter and says Fundsorter's algorithm analyses over 50 factors across nearly 3,000 funding opportunities. [Philanthropy New Zealand, Fundseekers](https://www.philanthropy.org.nz/fundseeker)

Generosity NZ is another coverage benchmark, but it is not a public count of funders or opportunities: it describes itself as the largest digital search facility for funding information in Aotearoa, says givUS lists resource schemes for communities, volunteer organisations and clubs, and says its online search tools provide access to $3.9 billion worth of opportunities. [Generosity NZ](https://generosity.org.nz/)

Because the Fundsorter and Philanthropy NZ figures both point to Fundsorter rather than independent enumerations, I treat "roughly 2,000 to nearly 3,000 contestable opportunities" as a Medium-confidence benchmark rather than a verified census. [Fundsorter data notes](https://www.fundsorter.com/data), [Philanthropy New Zealand, Fundseekers](https://www.philanthropy.org.nz/fundseeker)

### Where the data actually lives

| Source class | Approximate count signal | Where eligibility and rules live | Deadline / region / purpose location | Confidence |
|---|---:|---|---|---|
| DIA-administered Community Matters funds | 13 named funds or fund families visible in the Community Matters available-funding navigation | Individual fund pages and the DIA Grant Management System | Community Matters fund pages, funding-date pages, fund-specific records of grants and regional committee pages | High for source location; Medium for count because Lottery contains sub-committees and fund changes |
| Class 4 gaming-machine grants | 32 society websites listed by DIA as at September 2025 | Society websites, society authorised-purpose statements, DIA rules, and Granted.govt.nz data | Society websites for application rules and venue geography; Granted.govt.nz/DIA dataset for past grants | High for source location and society count |
| Creative Communities Scheme and council-administered local grants | 67 territorial authorities nationally; CCS applications go to local councils and closing dates vary | Local council websites, application guides and forms | Council pages for closing dates; Creative NZ for national CCS eligibility frame | High for source location; Low for total local grant-opportunity count |
| Philanthropic trusts, community foundations and trustee-administered funds | 18 Community Foundations; Public Trust and Perpetual Guardian host trust-specific grant searches and schedules | Individual foundation/trustee portals and trust pages | Foundation or trustee portals, often by region, sector, trust deed or application round | Medium for source class; Low for deduplicated count |
| Commercial/subscription discovery tools | Fundsorter says almost 2,000 opportunities; PNZ describes Fundsorter as nearly 3,000 opportunities; Generosity NZ says $3.9 billion worth of opportunities | Proprietary databases and search tools, with public pages exposing only summary coverage | Inside subscription or product interfaces, not fully auditable from public pages | Medium for scale signal; Low as independently verifiable census |

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| New Zealand grant discovery is fragmented across official fund hubs, class 4 society websites, council pages and private databases rather than a single complete public register. | [Creative NZ says its cross-sector list is not comprehensive and links to multiple source types](https://creativenz.govt.nz/funding-and-support/all-opportunities/other-sources-of-funding-and-support) | [DIA says class 4 applicants need to use society websites and apply directly to the relevant society](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-Funding-For-Community-Groups) | High |
| The contestable opportunity count is probably in the low thousands, not merely dozens. | [Fundsorter says it analysed almost 2,000 contestable grant opportunities](https://www.fundsorter.com/data) | [Philanthropy NZ says Fundsorter analyses over 50 factors across nearly 3,000 funding opportunities](https://www.philanthropy.org.nz/fundseeker) | Medium, because both public numbers depend on Fundsorter-derived data |
| Class 4 grant discovery requires looking beyond DIA to individual society websites. | [DIA lists 32 society websites](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-List-of-Society-Websites) | [DIA says each society website outlines authorised purpose and venue locations](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-Funding-For-Community-Groups) | High |
| Council-administered grants create many separate source locations even when the programme has a national frame. | [Creative NZ says CCS is distributed through city and district councils and closing dates vary](https://creativenz.govt.nz/funding-and-support/all-opportunities/creative-communities-scheme) | [Stats NZ describes 67 territorial authorities](https://maps-by-statsnz.hub.arcgis.com/search?collection=dataset&tags=ta) | High |

## What would change this conclusion

- A public, current, deduplicated register of all New Zealand grant funders and contestable opportunities, with source URLs for eligibility, deadlines, regions, purposes and application rules, would change the conclusion from "fragmented source-location problem" to "directory quality and maintenance problem".
- Direct access to Generosity NZ/givUS, Fundsorter, GEM Local, Public Trust, Perpetual Guardian and major foundation datasets would improve or overturn the opportunity-count range, because public product pages expose coverage claims but not auditable records.
- A systematic crawl of all 67 territorial-authority websites, all 32 DIA-listed class 4 society websites, Community Matters fund pages, trustee portals and major philanthropic funders could produce a stronger deduplicated funder count; I did not run that crawl in this finding.
- The class 4 grants dataset on data.govt.nz was blocked by Incapsula during command-line access, although DIA's own page and search index confirm the dataset and Granted.govt.nz exist; a browser-verified download of the Excel file would allow stronger counts of annual applications, approvals, recipient geography and society participation.
- Some eligibility constraints may be embedded in PDFs, online application portals, trust deeds, annual schedules or account-only workflows; those remain unverifiable from public landing pages alone.

## Open follow-up questions

- Which fields would a machine-readable NZ grant-opportunity schema need to represent Community Matters, class 4, council, trustee and philanthropic funders without losing important eligibility nuance?
- How many council-administered grants are currently open across all 67 territorial authorities, and how often do their dates and rules change?
- How many of the DIA-listed class 4 society websites expose application rules in structured HTML versus PDFs, portals or scanned documents?
- What overlap exists between Fundsorter, Generosity NZ/givUS, GEM Local, Community Matters, Public Trust, Perpetual Guardian and council lists?

## Sources

1. Department of Internal Affairs. "Community Matters." Accessed 2 July 2026. https://www.communitymatters.govt.nz/
2. Department of Internal Affairs. "Community Organisation Grants Scheme (COGS)." Accessed 2 July 2026. https://www.communitymatters.govt.nz/community-organisations-grants-scheme
3. Department of Internal Affairs. "Class 4 Grants Data." Accessed 2 July 2026. https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data
4. Department of Internal Affairs. "Funding For Community Groups." Accessed 2 July 2026. https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-Funding-For-Community-Groups
5. Department of Internal Affairs. "List of Society Websites." Last updated September 2025. Accessed 2 July 2026. https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-List-of-Society-Websites
6. Department of Internal Affairs. "Gambling in Pubs and Clubs (Class 4)." Accessed 2 July 2026. https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-Gambling-in-Pubs-and-Clubs-%28Class-4%29
7. Creative New Zealand. "Other sources of funding and support." Accessed 2 July 2026. https://creativenz.govt.nz/funding-and-support/all-opportunities/other-sources-of-funding-and-support
8. Creative New Zealand. "Creative Communities Scheme (CCS)." Accessed 2 July 2026. https://creativenz.govt.nz/funding-and-support/all-opportunities/creative-communities-scheme
9. Stats NZ Map Hub. "Territorial Authority dataset." Accessed 2 July 2026. https://maps-by-statsnz.hub.arcgis.com/search?collection=dataset&tags=ta
10. Department of Internal Affairs. "Simplifying Local Government." Accessed 2 July 2026. https://www.dia.govt.nz/simplifying-local-government
11. Community Foundations NZ. "Community Foundations NZ." Accessed 2 July 2026. https://communityfoundations.org.nz/
12. Public Trust. "Find a Grant or Scholarship." Accessed 2 July 2026. https://www.publictrust.co.nz/grants/
13. Perpetual Guardian. "Grants Open & Upcoming." Accessed 2 July 2026. https://www.perpetualguardian.co.nz/philanthropy/grant-seekers/grants-open-upcoming/
14. Fundsorter. "Data about NZ grant funding." Accessed 2 July 2026. https://www.fundsorter.com/data
15. Philanthropy New Zealand. "Fundseekers." Accessed 2 July 2026. https://www.philanthropy.org.nz/fundseeker
16. Generosity New Zealand. "Funding Grants Schemes Scholarships Awards and more." Accessed 2 July 2026. https://generosity.org.nz/
