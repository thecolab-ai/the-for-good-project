---
title: "Council spending is public in New Zealand, but not yet legible enough for citizen accountability"
domain: "civic-transparency"
issue: "#3"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-02"
status: "draft"
---

# Council spending is public in New Zealand, but not yet legible enough for citizen accountability

## Executive answer

- This is a real civic-transparency problem worth researching: Local Government New Zealand says Aotearoa New Zealand has 78 territorial, regional and unitary councils, and Stats NZ's provisional national population estimate was 5,361,300 residents at 31 March 2026. [LGNZ, Councils in Aotearoa New Zealand](https://www.lgnz.co.nz/local-government-in-nz/councils-in-aotearoa/); [Stats NZ, population indicator](https://www.stats.govt.nz/indicators/population-of-nz/)
- The core information is legally and administratively public: the Local Government Act 2002 requires local authorities to prepare planning and reporting documents including annual reports, and the Ombudsman's LGOIMA guidance says local-government agencies must process official-information requests, including timeframes and release decisions. [Local Government Act 2002, section 98 and Schedule 10](https://www.legislation.govt.nz/act/public/2002/84/en/latest/); [Ombudsman, LGOIMA guide](https://www.ombudsman.parliament.nz/resources/lgoima-local-government-agencies-guide-processing-requests-and-conducting-meetings)
- Public does not automatically mean legible: MCERT's 2025 council-performance page says people want to know where rates are going, says councils have been planning and reporting differently, and warns that even its standardised council-profile data cannot guarantee identical council definitions or accounting practices. [MCERT, Council performance](https://www.mcert.govt.nz/our-work/local-government/council-performance/)
- Existing official data gives useful baselines but does not settle the transaction-level question: Stats NZ's current annual local-authority financial-statistics CSV package covers the year ended June 2025, while MCERT's July 2025 council-profile data release covers demographics, rates revenue, debt, and operating and capital expenditure. [Stats NZ CSV catalogue result, local authority financial statistics year ended June 2025](https://www.stats.govt.nz/assets/Uploads/Local-authority-financial-statistics/Local-authority-financial-statistics-Year-ended-June-2025/Download-data/local-authority-financial-statistics-year-ended-june-2025.zip); [MCERT, Council performance](https://www.mcert.govt.nz/our-work/local-government/council-performance/)
- This discover pass fans the stream out into five research questions: supply-side spending-data availability, demand from residents and journalists, the official council-performance baseline now published by MCERT, prior civic-tech efforts, and cross-council comparability. [Issue #13](https://github.com/thecolab-ai/the-for-good-project/issues/13); [Issue #15](https://github.com/thecolab-ai/the-for-good-project/issues/15); [Issue #16](https://github.com/thecolab-ai/the-for-good-project/issues/16); [Issue #17](https://github.com/thecolab-ai/the-for-good-project/issues/17); [Issue #50](https://github.com/thecolab-ai/the-for-good-project/issues/50)

**Overall confidence:** Medium - the problem framing is well supported by official sources, but the central operational claims about what councils publish, how usable it is, and what questions citizens actually ask need the child research findings before they should drive a build decision.

## Evidence

### Problem statement

New Zealand's local-government system is large enough that spending legibility matters nationally: LGNZ says local government is made up of 78 territorial, regional and unitary councils, and its summary says territorial authorities provide services such as roads, water reticulation, sewerage and refuse collection, libraries, parks, recreation services, local regulations, community and economic development, and town planning. [LGNZ, Councils in Aotearoa New Zealand](https://www.lgnz.co.nz/local-government-in-nz/councils-in-aotearoa/)

The resident population affected by local-government decisions is national in scale: a live Stats NZ helper query on 2 July 2026 returned a provisional national estimated resident population of 5,361,300 for 31 March 2026, sourced to Stats NZ's population indicator. [Stats NZ, population indicator](https://www.stats.govt.nz/indicators/population-of-nz/)

Council financial information is formally public through statutory reporting: the Local Government Act 2002 says a local authority must prepare and adopt an annual report for each financial year containing the information required by Schedule 10, and Schedule 10 requires audited financial statements and an audited funding impact statement. [Local Government Act 2002, section 98 and Schedule 10](https://www.legislation.govt.nz/act/public/2002/84/en/latest/)

LGOIMA is a fallback when published material does not answer a resident's question: the Ombudsman's local-government guide says it helps local-government agencies recognise and respond to official-information requests and covers processing requirements including timeframes, transfers, extensions, urgency, consultation, release decisions, publication, and access to meetings, agendas, reports and minutes. [Ombudsman, LGOIMA guide](https://www.ombudsman.parliament.nz/resources/lgoima-local-government-agencies-guide-processing-requests-and-conducting-meetings)

The Ombudsman's official-information calculator page says public-sector agencies are generally obliged to respond to OIA and LGOIMA requests as soon as reasonably practicable and no later than 20 working days after receiving the request, unless a valid extension applies. [Ombudsman, official information calculators](https://www.ombudsman.parliament.nz/agency-assistance/official-information-calculators)

### Why legibility is still unresolved

MCERT states the legibility problem directly in its council-performance page: it says people want to know where their rates are going and how their council compares with others, but that assessing council performance can be difficult because each council plans and reports differently. [MCERT, Council performance](https://www.mcert.govt.nz/our-work/local-government/council-performance/)

MCERT's first council-performance release is useful but not a substitute for the stream's research question: MCERT says the council profiles and comparison tables span demographics, rates revenue, debt, and operating and capital expenditure, and says all underpinning data is available as a spreadsheet and CSV. [MCERT, Council performance](https://www.mcert.govt.nz/our-work/local-government/council-performance/)

MCERT also flags important comparability limits: it says officials tried to source data consistently and accommodate different council categorisations, but cannot guarantee that all councils apply the same definitions or accounting practices when reporting metrics such as staffing levels or capital expenditure by activity group; it also recommends generally drawing comparisons only between councils within a group. [MCERT, Council performance](https://www.mcert.govt.nz/our-work/local-government/council-performance/)

Stats NZ provides a current machine-readable official baseline for annual local-authority finances: the Stats NZ large-datasets catalogue returned the "Local authority financial statistics: Year ended June 2025 - CSV" ZIP package when queried through the repo's Stats NZ helper on 2 July 2026. [Stats NZ CSV package](https://www.stats.govt.nz/assets/Uploads/Local-authority-financial-statistics/Local-authority-financial-statistics-Year-ended-June-2025/Download-data/local-authority-financial-statistics-year-ended-june-2025.zip)

The latest Stats NZ annual-release page says local authority financial statistics provide information on the annual performance of core non-trading activities of all New Zealand territorial and regional councils, and the page links the June 2025 CSV download. [Stats NZ, Local authority financial statistics: Year ended June 2025](https://www.stats.govt.nz/information-releases/local-authority-financial-statistics-year-ended-june-2025/)

The latest Stats NZ quarterly-release page says local authority statistics provide information on the performance of core non-trading activities of New Zealand's territorial and regional councils, which supports using Stats NZ as a baseline while still leaving open whether citizen questions need more granular project, supplier, decision, or transaction records. [Stats NZ, Local authority statistics: March 2026 quarter](https://www.stats.govt.nz/information-releases/local-authority-statistics-march-2026-quarter/)

### What is already being done

Stats NZ's annual local-authority financial-statistics release provides official machine-readable financial data, so any future civic tool should build from or reconcile against that baseline rather than scrape PDFs as the first step. [Stats NZ, Local authority financial statistics: Year ended June 2025](https://www.stats.govt.nz/information-releases/local-authority-financial-statistics-year-ended-june-2025/)

MCERT's council-performance work provides another official baseline: MCERT says the first release focuses on financial performance, later releases cover broader asset-management, service-delivery, and governance metrics, and the current page provides profiles and CSV/XLSX data underpinning the results. [MCERT, Council performance](https://www.mcert.govt.nz/our-work/local-government/council-performance/)

FYI.org.nz is existing civic infrastructure for public information requests: its about page says it helps people make Official Information Act requests and then publishes requests and responses online, and its authority listing includes a "Local and regional councils" category. [FYI.org.nz, About](https://fyi.org.nz/help/about); [FYI.org.nz, Authorities](https://fyi.org.nz/body/list/all)

The stream should also account for existing non-government comparison efforts, while treating their framing carefully: the Ratepayers' Report website says the report is produced annually by the Taxpayers' Union so New Zealanders can compare local councils, and the Taxpayers' Union describes its mission as lower taxes, less waste and more accountability, while Figure.NZ publishes charts from local-authority statistics. [Ratepayers' Report](https://ratepayersreport.nz/); [Taxpayers' Union, mission](https://www.taxpayers.org.nz/our_mission); [Figure.NZ, operating expenditure of local authorities](https://figure.nz/chart/okcV4PqsEUxjxWQy-nHozrMb2KSVsSfqn)

International prior art is relevant but should be treated as context, not a direct transplant: the UK Local Government Transparency Code says local authorities must publish expenditure over GBP500, including supplier and transaction information, and the Local Government Association also summarises the code as requiring English local authorities to publish expenditure over GBP500; New Zealand's current official baselines identified in this pass are aggregate council-finance and profile datasets, not a verified transaction-level local-government disclosure norm. [UK Department for Levelling Up, Housing and Communities, Local Government Transparency Code 2015](https://www.gov.uk/government/publications/local-government-transparency-code-2015); [Local Government Association, Local government transparency code](https://www.local.gov.uk/our-support/research-and-data/data-standards-and-transparency/local-government-transparency-code); [Stats NZ, Local authority financial statistics: Year ended June 2025](https://www.stats.govt.nz/information-releases/local-authority-financial-statistics-year-ended-june-2025/); [MCERT, Council performance](https://www.mcert.govt.nz/our-work/local-government/council-performance/)

### Scope chosen for this discover issue

This issue is a stream-root discover issue, and the project stream rules say a stream root stays open for the life of the stream and discover framing PRs should use "Part of #<root>" rather than "Closes #<root>". [The For Good Project, Streams](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md)

The issue thread already opened four research children from the first discover comment: #13 on supply-side council spending data, #15 on what residents and journalists ask, #16 on the 2025 council-performance metrics and gaps, and #17 on prior NZ and international civic-tech efforts. [Issue #3 comment](https://github.com/thecolab-ai/the-for-good-project/issues/3#issuecomment-4860810722); [Issue #13](https://github.com/thecolab-ai/the-for-good-project/issues/13); [Issue #15](https://github.com/thecolab-ai/the-for-good-project/issues/15); [Issue #16](https://github.com/thecolab-ai/the-for-good-project/issues/16); [Issue #17](https://github.com/thecolab-ai/the-for-good-project/issues/17)

This PR adds the missing chunky research child, #50, on whether existing accounting or reporting standards make cross-council spending comparison feasible, because the issue-thread discover comment identified comparability as a researchable question but did not open it as a standalone child issue. [Issue #3 discover comment](https://github.com/thecolab-ai/the-for-good-project/issues/3#issuecomment-4860803083); [Issue #50](https://github.com/thecolab-ai/the-for-good-project/issues/50)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| New Zealand local-government finance is national-scale context, not a niche single-council context. | [LGNZ says there are 78 councils and describes council service roles](https://www.lgnz.co.nz/local-government-in-nz/councils-in-aotearoa/) | [Stats NZ population indicator shows a provisional national resident population of 5,361,300 at 31 March 2026](https://www.stats.govt.nz/indicators/population-of-nz/) | High |
| The issue is substantially about legibility and comparability, not whether any public reporting exists. | [Local Government Act 2002 annual-report requirements](https://www.legislation.govt.nz/act/public/2002/84/en/latest/) | [MCERT says each council plans and reports differently and warns definitions/accounting practices may differ](https://www.mcert.govt.nz/our-work/local-government/council-performance/) | Medium |
| Existing official machine-readable baselines do not by themselves settle whether citizens can answer project-, supplier-, or transaction-level spending questions. | [Stats NZ annual local-authority financial-statistics release](https://www.stats.govt.nz/information-releases/local-authority-financial-statistics-year-ended-june-2025/) | [MCERT council profiles span demographics, rates revenue, debt, and operating/capital expenditure, with comparability caveats](https://www.mcert.govt.nz/our-work/local-government/council-performance/) | Medium |
| An English transaction-level disclosure model exists internationally. | [UK Local Government Transparency Code 2015](https://www.gov.uk/government/publications/local-government-transparency-code-2015) | [Local Government Association summary of the transparency code](https://www.local.gov.uk/our-support/research-and-data/data-standards-and-transparency/local-government-transparency-code) | Medium |
| This discovery pass did not verify an equivalent NZ local-government transaction-level disclosure norm; it verified aggregate official baselines instead. | [Stats NZ annual local-authority financial-statistics release](https://www.stats.govt.nz/information-releases/local-authority-financial-statistics-year-ended-june-2025/) | [MCERT council profiles and comparison tables](https://www.mcert.govt.nz/our-work/local-government/council-performance/) | Low |

## What would change this conclusion

- A completed all-council census showing that most New Zealand councils already publish machine-readable project-, supplier-, or transaction-level spending under clear open-data terms would weaken the claim that the central barrier is legibility; the census should explicitly test large-council portal counterexamples such as Auckland Council Open Data, Wellington City Council's open-data portal, and Christchurch City Council's spatial open-data portal. [Auckland Council Open Data](https://data-aucklandcouncil.opendata.arcgis.com/search); [Wellington City Council open data portal](https://wellington.govt.nz/wellington-city/maps/open-data-portal-terms-and-conditions/gis-data); [Christchurch City Council Open Data Portal](https://opendata-christchurchcity.hub.arcgis.com/)
- A demand-side finding showing that residents and local journalists rarely ask questions that published financial reports cannot already answer would weaken the case for a civic-transparency stream.
- A standards finding showing that councils already share a detailed chart of accounts or activity schema suitable for cross-council comparison would shift the stream from data-normalisation research toward interface and storytelling.
- A legal or policy change requiring standardised supplier or transaction-level local-government spending disclosure would materially change the feasibility and ethics of any build proposal.
- Water-services restructuring could also change what "council spending" means: DIA says Local Water Done Well required councils to develop Water Services Delivery Plans by 3 September 2025, including future delivery arrangements and baseline information about water-services operations, assets, revenue, expenditure, pricing, projected capital expenditure, and financing. [DIA, Local Water Done Well legislation and process](https://www.dia.govt.nz/Water-Services-Policy-legislation-and-process)
- I could not verify, in this discover pass, how many of the 78 councils publish open spending datasets beyond statutory reports, which spending questions are most common in LGOIMA/media evidence, whether existing council accounting structures allow robust cross-council comparisons below high-level categories, or how water-services delivery changes will affect future council-spending comparisons.
- Human steward judgement is needed at G1 before ideation because even a technically feasible transparency tool could mislead if it compares councils without accounting for population and ratepayer base, service scope, growth, disaster recovery, asset life cycle, revenue sources, rating approaches, geography, history, community expectations, and delivery-model differences that MCERT warns affect results. [MCERT, Council performance](https://www.mcert.govt.nz/our-work/local-government/council-performance/)

## Open follow-up questions

- [#13](https://github.com/thecolab-ai/the-for-good-project/issues/13): Which New Zealand councils publish spending or financial data beyond statutory PDFs, in what formats, at what granularity, and under what licences?
- [#15](https://github.com/thecolab-ai/the-for-good-project/issues/15): What do residents and local journalists actually ask about council spending, and how often can those questions be answered from published material?
- [#16](https://github.com/thecolab-ai/the-for-good-project/issues/16): What do MCERT's 2025 council-performance metrics cover, in what format and cadence, and which citizen questions remain unanswered?
- [#17](https://github.com/thecolab-ai/the-for-good-project/issues/17): What NZ and international civic-tech efforts on council spending legibility exist or have been tried, and what should this stream build on or avoid?
- [#50](https://github.com/thecolab-ai/the-for-good-project/issues/50): Can New Zealand council spending be compared across councils from existing accounting or reporting standards, or would a mapping layer be required?

## Sources

1. Local Government New Zealand. "Councils in Aotearoa New Zealand." Accessed 2 July 2026. https://www.lgnz.co.nz/local-government-in-nz/councils-in-aotearoa/
2. Stats NZ. "Population of NZ." Last updated 18 May 2026. Accessed 2 July 2026. https://www.stats.govt.nz/indicators/population-of-nz/
3. New Zealand Legislation. "Local Government Act 2002." Accessed 2 July 2026. https://www.legislation.govt.nz/act/public/2002/84/en/latest/
4. Office of the Ombudsman. "The LGOIMA for local government agencies: A guide to processing requests and conducting meetings." Last updated 4 June 2025. Accessed 2 July 2026. https://www.ombudsman.parliament.nz/resources/lgoima-local-government-agencies-guide-processing-requests-and-conducting-meetings
5. Office of the Ombudsman. "Official information calculators." Accessed 2 July 2026. https://www.ombudsman.parliament.nz/agency-assistance/official-information-calculators
6. Ministry of Cities, Environment, Regions and Transport. "Council performance." Includes data release for council profiles - July 2025. Accessed 2 July 2026. https://www.mcert.govt.nz/our-work/local-government/council-performance/
7. Stats NZ. "Local authority financial statistics: Year ended June 2025." Accessed 2 July 2026. https://www.stats.govt.nz/information-releases/local-authority-financial-statistics-year-ended-june-2025/
8. Stats NZ. "Local authority financial statistics: Year ended June 2025 - CSV." Accessed 2 July 2026. https://www.stats.govt.nz/assets/Uploads/Local-authority-financial-statistics/Local-authority-financial-statistics-Year-ended-June-2025/Download-data/local-authority-financial-statistics-year-ended-june-2025.zip
9. Stats NZ. "Local authority statistics: March 2026 quarter." Accessed 2 July 2026. https://www.stats.govt.nz/information-releases/local-authority-statistics-march-2026-quarter/
10. FYI.org.nz. "About." Accessed 2 July 2026. https://fyi.org.nz/help/about
11. FYI.org.nz. "Authorities." Accessed 2 July 2026. https://fyi.org.nz/body/list/all
12. New Zealand Taxpayers' Union. "Ratepayers' Report." Accessed 2 July 2026. https://ratepayersreport.nz/
13. New Zealand Taxpayers' Union. "The People-Powered Mission." Page updated 25 November 2022. Accessed 2 July 2026. https://www.taxpayers.org.nz/our_mission
14. Figure.NZ. "Operating expenditure of all Local Authorities, New Zealand." Accessed 2 July 2026. https://figure.nz/chart/okcV4PqsEUxjxWQy-nHozrMb2KSVsSfqn
15. Department for Levelling Up, Housing and Communities. "Local Government Transparency Code 2015." Accessed 2 July 2026. https://www.gov.uk/government/publications/local-government-transparency-code-2015
16. Local Government Association. "Local government transparency code." Accessed 2 July 2026. https://www.local.gov.uk/our-support/research-and-data/data-standards-and-transparency/local-government-transparency-code
17. Auckland Council. "Auckland Council Open Data." Accessed 2 July 2026. https://data-aucklandcouncil.opendata.arcgis.com/search
18. Wellington City Council. "Open data portal." Accessed 2 July 2026. https://wellington.govt.nz/wellington-city/maps/open-data-portal-terms-and-conditions/gis-data
19. Christchurch City Council. "Christchurch City Council Open Data Portal." Accessed 2 July 2026. https://opendata-christchurchcity.hub.arcgis.com/
20. Department of Internal Affairs. "Water Services Policy: legislation and process." Accessed 2 July 2026. https://www.dia.govt.nz/Water-Services-Policy-legislation-and-process
21. The For Good Project. "Streams, human gates, and where people actually fit." Accessed 2 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md
22. GitHub. "Issue #3: [Discover] Council spending is public but not legible to citizens." Accessed 2 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/3
23. GitHub. "Issue #13: [Research] Which NZ councils publish spending data beyond statutory PDFs, and in what formats?" Accessed 2 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/13
24. GitHub. "Issue #15: [Research] What do residents and local journalists actually ask about council spending?" Accessed 2 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/15
25. GitHub. "Issue #16: [Research] What do the 2025 MCERT council performance metrics cover, and what gaps remain?" Accessed 2 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/16
26. GitHub. "Issue #17: [Research] What NZ and international civic-tech efforts on council spending legibility exist or have been tried?" Accessed 2 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/17
27. GitHub. "Issue #50: research: Can NZ council spending be compared across councils from existing reporting standards?" Created 2 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/50
