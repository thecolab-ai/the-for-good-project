---
title: "NZ investors may support better founder discovery infrastructure, but public evidence favours screened formats and curated directory maintenance over fully open rooms"
domain: "grant-access"
issue: "#144"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-03"
status: "draft"
---

# NZ investors may support better founder discovery infrastructure, but public evidence favours screened formats and curated directory maintenance over fully open rooms

## Executive answer

- I found no public NZ source showing that angel networks, funds or government investors would participate in a fully open "all founders meet all investors" room at scale; the stronger public evidence points the other way, toward screened opportunities, due diligence, trusted networks and confidentiality as core investor-side needs. [AANZ standards](https://www.angelassociation.co.nz/our-standards/), [Enterprise Angels AngelEquity](https://www.enterpriseangels.co.nz/angelequity/), [MBIE baseline review](https://www.mbie.govt.nz/dmsdocument/2264-baseline-review-angel-investment-report-pdf)
- Existing NZ practice is not closed in the sense of "no public front door": AANZ has a searchable member directory and says its site helps founders find pitch nights and connect with investors, NZGCP publishes a startup funding list and invites additions, MoneyHub publishes a founder-facing angel directory, and What Founders Want publishes founder directories including a "Get Funded" directory. [AANZ members](https://www.angelassociation.co.nz/members/), [AANZ homepage](https://www.angelassociation.co.nz/), [NZGCP funding list](https://www.nzgcp.co.nz/start-up-resources/funding), [MoneyHub angel directory](https://www.moneyhub.co.nz/how-to-raise-money-from-angel-investors.html), [What Founders Want directories](https://whatfounderswant.com/the-directories)
- The gap is maintenance and matchability, not absence: the public lists are human-readable and curated, and I found no open, machine-readable NZ funder dataset with structured stage, cheque-size, sector, region, contact route, wholesale-investor status, update cadence and API access. [AANZ members](https://www.angelassociation.co.nz/members/), [NZGCP funding list](https://www.nzgcp.co.nz/start-up-resources/funding), [Crunchbase API docs](https://data.crunchbase.com/docs/using-the-api)
- Wholesale-investor rules are a real design constraint for any marketplace that routes offers or deal materials, because wholesale offers have fewer protections than regulated retail offers and eligible investors must self-certify relevant experience with professional confirmation; a directory of funders is lower risk than a public deal-pitch marketplace, but legal review is required before exposing pitches or enabling investor targeting. [FMA wholesale rules release](https://www.fma.govt.nz/news/all-releases/media-releases/court-case-provides-clarity-around-wholesale-investor-rules/), [FMA thematic review](https://www.fma.govt.nz/library/reports-and-papers/thematic-wholesale-investor/), [Icehouse Ventures wholesale/eligible investor process](https://help.icehouseventures.co.nz/knowledge/how-do-i-complete-a-wholesale-investor-declaration-or-eligibility-certificate-through-icehouse-ventures)
- The most credible freshness model is hybrid: start with curated seed data from public directories and government/peak-body lists, let funders claim or submit updates through a structured form, require visible "last verified" dates, and allow API/export access; overseas models support this split between self-service updates, curator/government stewardship and API-fed data. [NZGCP funding list](https://www.nzgcp.co.nz/start-up-resources/funding), [Startup Estonia database](https://investinestonia.com/estonian-startup-database-with-nearly-1000-startups-is-now-live/), [Crunchbase API docs](https://data.crunchbase.com/docs/using-the-api), [OpenVC investor database](https://www.openvc.app/investor-database)

**Overall confidence:** Medium - public sources are strong on current practice and legal constraints, but weak on actual willingness. Investor-side interviews are required before treating this as build-ready.

## Evidence

### Current NZ practice points to screened access, not fully open rooms

AANZ describes itself as the national organisation for those actively involved in early-stage venture capital and says it connects entrepreneurs and investors through events, resources and fundraising support. [AANZ homepage](https://www.angelassociation.co.nz/)

AANZ says it offers regular networking events and educational sessions, and that its website has a searchable member database for finding pitch nights and connecting with investors who share relevant interests and goals. [AANZ homepage](https://www.angelassociation.co.nz/)

AANZ's members page says its members include angel networks, venture-capital providers, equity-crowdfunding platforms and investor-led tech incubators. [AANZ members](https://www.angelassociation.co.nz/members/)

AANZ's standards say investors look for credible entrepreneurs with international-growth aspirations, well-defined product/customer/market, and investment-presentation processes; they also state that no investor should rely on due diligence completion as proof of future success. [AANZ standards](https://www.angelassociation.co.nz/our-standards/)

Enterprise Angels' founder-facing page describes Pitch Night as a way to introduce investment-ready businesses to its membership as prospective opportunities, which is a screened format rather than an open all-comers format. [Enterprise Angels raise](https://www.enterpriseangels.co.nz/raise/)

Enterprise Angels' AngelEquity page says a handpicked screening committee meets before pitch nights to evaluate companies the Enterprise Angels team has selected, and its risk warning says facilitated offers are for wholesale investors who make their own investment decisions and understand the risks. [Enterprise Angels AngelEquity](https://www.enterpriseangels.co.nz/angelequity/)

AANZ's listed Angel HQ event was explicitly a "handful" of early-stage founders pitching, followed by networking, which is compatible with curated deal flow plus informal networking rather than an all-founders/all-investors room. [AANZ Angel HQ Investment Evening](https://www.angelassociation.co.nz/members-event/angel-hq-investment-evening-2/)

The 2007 Ministry of Economic Development baseline review found that NZ angel investors most commonly identified deals through networking, that broad networking generated deal flow, and that people, co-investors, investment readiness and due diligence were central to investor decisions. [MBIE baseline review](https://www.mbie.govt.nz/dmsdocument/2264-baseline-review-angel-investment-report-pdf)

The same baseline review said angel investors reported spending a significant share of time educating entrepreneurs, that many entrepreneurs could not adequately prepare basic investment materials, and that most active angel investors were not keen to share information about actual deals with each other while being willing to share knowledge and processes. [MBIE baseline review](https://www.mbie.govt.nz/dmsdocument/2264-baseline-review-angel-investment-report-pdf)

Those sources support a Medium-confidence inference that investor-side resistance to open rooms would likely include deal-quality filtering, time cost, investment-readiness burden, and confidentiality around actual deals. [MBIE baseline review](https://www.mbie.govt.nz/dmsdocument/2264-baseline-review-angel-investment-report-pdf), [Enterprise Angels AngelEquity](https://www.enterpriseangels.co.nz/angelequity/), [AANZ standards](https://www.angelassociation.co.nz/our-standards/)

I did not find a public NZ source where investors directly reject open rooms because of "adverse selection"; the nearest public evidence is the repeated use of screening committees, investment-ready language and filtered pitch events, so adverse selection should be treated as an interview hypothesis rather than a proven investor quote. [Enterprise Angels raise](https://www.enterpriseangels.co.nz/raise/), [Enterprise Angels AngelEquity](https://www.enterpriseangels.co.nz/angelequity/)

### Directories exist, but they are not an open machine-readable funder layer

AANZ has a member listing that represents angel networks, venture providers, equity-crowdfunding platforms and investor-led tech incubators. [AANZ members](https://www.angelassociation.co.nz/members/)

NZGCP publishes a "Funding" page for high-growth technology startups, lists incubators, grants, angel investment, venture capital and private equity options, and explicitly says users can contact NZGCP to add more funding options to the list. [NZGCP funding list](https://www.nzgcp.co.nz/start-up-resources/funding)

MoneyHub publishes a "New Zealand Angel Investment Directory and How to Raise Money" guide, marks it updated 9 November 2025, and frames it from the founder perspective. [MoneyHub angel directory](https://www.moneyhub.co.nz/how-to-raise-money-from-angel-investors.html)

What Founders Want says NZ founders run into scattered information across agencies, PDFs and insider networks; its directory page includes a "Get Funded" directory for capital providers, with claimed filters by stage, capital type and geography. [What Founders Want directories](https://whatfounderswant.com/the-directories)

These lists are useful seed sources, but in public form they do not expose a downloadable schema, stable API, automated verification status, or structured fields sufficient for matching by stage, cheque size, sector, region, contact route and investor eligibility rules. [AANZ members](https://www.angelassociation.co.nz/members/), [NZGCP funding list](https://www.nzgcp.co.nz/start-up-resources/funding), [MoneyHub angel directory](https://www.moneyhub.co.nz/how-to-raise-money-from-angel-investors.html), [What Founders Want directories](https://whatfounderswant.com/the-directories)

NZGCP's invitation to "connect with us to add more funding options" is evidence that at least one public-sector actor accepts curated additions, but it is not evidence that funders would self-maintain a third-party open directory or agree to machine-readable redistribution. [NZGCP funding list](https://www.nzgcp.co.nz/start-up-resources/funding)

NZGCP's 2021 annual report says its Aspire Fund implemented a streamlined and semi-automated screening process that reduced review of opportunities outside mandate or not applicable to NZGCP/Aspire; that supports the need for structured mandate fields if a directory is meant to reduce wasted applications. [NZGCP 2021 annual report](https://www.nzgcp.co.nz/assets/Media/NZGCP-2021-Annual-Report.pdf)

The same annual report says NZGCP works with AANZ and other industry stakeholders on market development, standards, data and early-stage investment education, which makes NZGCP/AANZ plausible stewards or data partners for a curated directory but does not prove willingness to own one. [NZGCP 2021 annual report](https://www.nzgcp.co.nz/assets/Media/NZGCP-2021-Annual-Report.pdf)

### Wholesale-investor rules constrain marketplace design

The FMA says wholesale offers do not have the same protections as regulated retail offers and are aimed at experienced investors, often with large sums to invest. [FMA wholesale rules release](https://www.fma.govt.nz/news/all-releases/media-releases/court-case-provides-clarity-around-wholesale-investor-rules/)

The FMA says eligible investors are a group of wholesale investors who must certify that they have appropriate experience to invest in wholesale offers, with certificates confirmed by an accountant, lawyer or financial adviser. [FMA wholesale rules release](https://www.fma.govt.nz/news/all-releases/media-releases/court-case-provides-clarity-around-wholesale-investor-rules/)

The FMA summarises all-offer wholesale categories as investment businesses, habitual/experienced investors meeting activity criteria, "large" investors with net assets or turnover exceeding $5 million for the last two completed financial years, and government agencies; transaction-specific routes include eligible-investor status and $750,000 minimum investment thresholds. [FMA wholesale rules release](https://www.fma.govt.nz/news/all-releases/media-releases/court-case-provides-clarity-around-wholesale-investor-rules/)

The FMA's 2025 release also says it has seen increased complaints and concerns about wholesale offers, will continue to work with MBIE on policy settings, and remains concerned about retail investments dressed up as wholesale investments. [FMA wholesale rules release](https://www.fma.govt.nz/news/all-releases/media-releases/court-case-provides-clarity-around-wholesale-investor-rules/)

The FMA's earlier thematic review similarly says it found increased complaints and concerns about wholesale offers and provides guidance for offerors and certificate-confirmers. [FMA thematic review](https://www.fma.govt.nz/library/reports-and-papers/thematic-wholesale-investor/)

Icehouse Ventures' public investor process says new investors must complete a valid Wholesale Investor Declaration or Eligibility Certificate before becoming eligible to invest, and existing investors are asked to renew every two years. [Icehouse Ventures wholesale/eligible investor process](https://help.icehouseventures.co.nz/knowledge/how-do-i-complete-a-wholesale-investor-declaration-or-eligibility-certificate-through-icehouse-ventures)

These sources do not ban a public directory of funders, but they strongly argue against a naive open marketplace that lets any founder publicly market offers to any investor without eligibility checks, warnings, moderation and legal advice. [FMA wholesale rules release](https://www.fma.govt.nz/news/all-releases/media-releases/court-case-provides-clarity-around-wholesale-investor-rules/), [Icehouse Ventures wholesale/eligible investor process](https://help.icehouseventures.co.nz/knowledge/how-do-i-complete-a-wholesale-investor-declaration-or-eligibility-certificate-through-icehouse-ventures)

### Directory freshness models

The Startup Estonia database is a useful overseas comparison because it is described as a continuous cooperation project between startups and government agencies, with startups able to update profiles regularly, new startups able to add themselves, and financial results updated quarterly from other databases. [Invest in Estonia on Startup Estonia database](https://investinestonia.com/estonian-startup-database-with-nearly-1000-startups-is-now-live/)

Crunchbase is a different model: its API is a read-only REST service for approved developers and requires paid API access for the full API, so it shows how API-fed private-market data can be distributed while still being centrally controlled. [Crunchbase API docs](https://data.crunchbase.com/docs/using-the-api)

OpenVC says its investor database uses verified, continuously updated investor data and lets founders filter investor targets; this supports the user expectation that investor directories need verification and recency signals, though it is a vendor claim rather than an audited public dataset. [OpenVC investor database](https://www.openvc.app/investor-database)

The maintenance implication for NZ is that a self-serve-only directory is unlikely to stay trustworthy unless each entry has an accountable owner and visible last-verified date; a curator-only directory risks going stale unless funders have a low-friction update route; and an API-fed directory is realistic only where upstream sources already expose reliable structured data. [Invest in Estonia on Startup Estonia database](https://investinestonia.com/estonian-startup-database-with-nearly-1000-startups-is-now-live/), [Crunchbase API docs](https://data.crunchbase.com/docs/using-the-api), [NZGCP funding list](https://www.nzgcp.co.nz/start-up-resources/funding)

The pragmatic first version would therefore be a curated public schema seeded from AANZ, NZGCP, MoneyHub and What Founders Want, with funder-submitted corrections, mandatory "last verified" dates, a narrow field set, CSV/JSON export, and a policy that deal materials are out of scope until wholesale-investor and financial-promotion legal review is complete. [AANZ members](https://www.angelassociation.co.nz/members/), [NZGCP funding list](https://www.nzgcp.co.nz/start-up-resources/funding), [MoneyHub angel directory](https://www.moneyhub.co.nz/how-to-raise-money-from-angel-investors.html), [What Founders Want directories](https://whatfounderswant.com/the-directories), [FMA wholesale rules release](https://www.fma.govt.nz/news/all-releases/media-releases/court-case-provides-clarity-around-wholesale-investor-rules/)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| NZ investor-side public practice favours screened deal flow and due diligence over an all-comers format. | [Enterprise Angels describes selected companies and a handpicked screening committee](https://www.enterpriseangels.co.nz/angelequity/) | [MBIE baseline review describes deal identification, investment readiness, due diligence and time spent educating entrepreneurs](https://www.mbie.govt.nz/dmsdocument/2264-baseline-review-angel-investment-report-pdf) | Medium - strong for current practice, Low for predicting willingness to try a new open format |
| A public funder directory is feasible as an information layer, but a deal marketplace needs wholesale-investor controls and legal review. | [FMA says wholesale offers have fewer protections and eligible investors require certification/confirmation](https://www.fma.govt.nz/news/all-releases/media-releases/court-case-provides-clarity-around-wholesale-investor-rules/) | [Icehouse requires wholesale declarations or eligibility certificates before investors can invest](https://help.icehouseventures.co.nz/knowledge/how-do-i-complete-a-wholesale-investor-declaration-or-eligibility-certificate-through-icehouse-ventures) | High for the legal constraint; Medium for the product-design implication pending legal advice |
| Directory freshness is more likely with hybrid self-serve plus curated verification than with either a static list or unmoderated self-service. | [Startup Estonia combines regular profile updates, new self-identification and quarterly database updates](https://investinestonia.com/estonian-startup-database-with-nearly-1000-startups-is-now-live/) | [NZGCP already invites additions to its funding list but keeps the list curated](https://www.nzgcp.co.nz/start-up-resources/funding) | Medium - supported by comparable models, but not tested with NZ funders |
| There is no public evidence that NZ investors would maintain a third-party open, machine-readable funder directory. | [NZGCP accepts additions to its own curated list](https://www.nzgcp.co.nz/start-up-resources/funding) | [AANZ publishes a human-readable member listing](https://www.angelassociation.co.nz/members/) | Low - this is an evidence-gap claim from desk research, not proof of unwillingness |

## What would change this conclusion

- Primary interviews with AANZ, at least three regional angel networks, two VC/seed funds, NZGCP/NZTE or MBIE, and active solo angels could overturn the participation conclusion if investors say they would attend open founder/investor rooms under clear rules.
- A live NZ programme that already runs all-founder/all-investor matching with documented investor attendance, founder conversion and repeat participation would raise confidence that open formats can work locally.
- Written commitments from funders to claim, update and permit reuse of structured directory entries would change the directory conclusion from "plausible with stewardship" to "supply side validated".
- Legal advice on whether a directory can safely include investor contact details, investment theses and founder-pitch routing without creating regulated-offer or financial-advice problems would materially change the product boundary.
- I could not verify investor-side willingness, reasons for non-participation, acceptable update burden, or appetite for machine-readable redistribution from public sources alone; this issue needs a human with investor-side authority before any solution moves through G1/G2.

## Open follow-up questions

- What minimum field set would NZ funders agree to keep current: stage, cheque range, sector, region, contact route, eligibility criteria, portfolio examples, lead/follow preference, response SLA, or wholesale-investor restrictions?
- Would an open format work better as office hours, structured speed-networking, anonymous founder profiles, screened thematic rooms, or open directory plus warm-routing through regional networks?
- Which parts of a founder-investor marketplace require legal controls under the FMC Act: public funder data, founder profiles, pitch decks, deal rooms, investor contact, syndicate formation, or expressions of interest?

## Sources

1. Angel Association New Zealand. Homepage. Accessed 3 July 2026 by WebSearch/WebFetch after curl returned HTTP 200. https://www.angelassociation.co.nz/
2. Angel Association New Zealand. "Members." Accessed 3 July 2026 by curl and WebSearch/WebFetch. https://www.angelassociation.co.nz/members/
3. Angel Association New Zealand. "Our Standards." Accessed 3 July 2026 by WebSearch/WebFetch. https://www.angelassociation.co.nz/our-standards/
4. Angel Association New Zealand. "Angel HQ Investment Evening." Accessed 3 July 2026 by WebSearch/WebFetch. https://www.angelassociation.co.nz/members-event/angel-hq-investment-evening-2/
5. Enterprise Angels. "Raise Capital." Accessed 3 July 2026 by WebSearch/WebFetch; raw curl was Cloudflare-blocked, so the citation was not treated as dead. https://www.enterpriseangels.co.nz/raise/
6. Enterprise Angels. "AngelEquity." Accessed 3 July 2026 by WebSearch/WebFetch. https://www.enterpriseangels.co.nz/angelequity/
7. Ministry of Business, Innovation and Employment. "Baseline Review of Angel Investment in New Zealand." Accessed 3 July 2026 by WebSearch/WebFetch; curl returned an HTML page rather than the PDF, so the built-in fetch text was used. https://www.mbie.govt.nz/dmsdocument/2264-baseline-review-angel-investment-report-pdf
8. NZGCP. "Funding." Accessed 3 July 2026 by WebSearch/WebFetch; raw curl to another NZGCP page produced a Cloudflare challenge, so blocked raw fetches were not treated as dead. https://www.nzgcp.co.nz/start-up-resources/funding
9. NZGCP. "2021 Annual Report." Accessed 3 July 2026 by WebSearch/WebFetch. https://www.nzgcp.co.nz/assets/Media/NZGCP-2021-Annual-Report.pdf
10. MoneyHub. "New Zealand Angel Investment Directory and How to Raise Money." Accessed 3 July 2026 by WebSearch/WebFetch. https://www.moneyhub.co.nz/how-to-raise-money-from-angel-investors.html
11. What Founders Want. "The Directories." Accessed 3 July 2026 by WebSearch/WebFetch. https://whatfounderswant.com/the-directories
12. Financial Markets Authority. "Court case provides clarity around wholesale investor rules." Published 19 September 2025; accessed 3 July 2026 by WebSearch/WebFetch. https://www.fma.govt.nz/news/all-releases/media-releases/court-case-provides-clarity-around-wholesale-investor-rules/
13. Financial Markets Authority. "Thematic review of use of the wholesale investor exclusion." Accessed 3 July 2026 by WebSearch/WebFetch. https://www.fma.govt.nz/library/reports-and-papers/thematic-wholesale-investor/
14. Icehouse Ventures. "How do I complete a Wholesale Investor Declaration or Eligibility Certificate?" Accessed 3 July 2026 by WebSearch/WebFetch. https://help.icehouseventures.co.nz/knowledge/how-do-i-complete-a-wholesale-investor-declaration-or-eligibility-certificate-through-icehouse-ventures
15. Invest in Estonia. "Estonian Startup Database with nearly 1,000 startups is now live." Accessed 3 July 2026 by WebSearch/WebFetch. https://investinestonia.com/estonian-startup-database-with-nearly-1000-startups-is-now-live/
16. Crunchbase. "Using the API." Accessed 3 July 2026 by WebSearch/WebFetch. https://data.crunchbase.com/docs/using-the-api
17. OpenVC. "Free Investor Database for Startups." Accessed 3 July 2026 by WebSearch/WebFetch. https://www.openvc.app/investor-database
