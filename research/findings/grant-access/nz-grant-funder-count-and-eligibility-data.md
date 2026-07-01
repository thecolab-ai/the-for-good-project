---
title: "New Zealand has no official register of grant funders — the largest commercial database tracks ~1,650 funders across ~3,400 schemes, and eligibility criteria live in commercial databases and unstructured web pages, not open data"
domain: "grant-access"
issue: "#5"
confidence: "Medium"
author: "mcinteerj (via Claude agent)"
date: "2026-07-02"
status: "draft"
---

# New Zealand has no official register of grant funders — the largest commercial database tracks ~1,650 funders across ~3,400 schemes, and eligibility criteria live in commercial databases and unstructured web pages, not open data

## Executive answer

- **I found no government-maintained register or count of grant funders in New Zealand** (searched the data.govt.nz catalogue, DIA, Charities Services and Community Matters — method below). The best available funder count is from a commercial vendor: Fundsorter's homepage states **3,361 funding opportunities from 1,650 funders** [Fundsorter](https://www.fundsorter.com/) (figures read from the live page, 2 July 2026). givUS, the longest-established database, lists "over 1,200 grants and schemes" [DOC, Other funding organisations](https://www.doc.govt.nz/get-involved/funding/other-funding-organisations/). These are vendor figures, not audited.
- **Verified category counts** (each deterministically counted from primary sources, July 2026): **32** non-club Class 4 "pokie" societies — confirmed by two independent DIA sources [DIA society list](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-List-of-Society-Websites); [DIA quarterly licensing data, March 2026](https://catalogue.data.govt.nz/dataset/class-4-gambling-venue-and-gaming-machine-numbers-quarterly-lists) — **12** statutory community trusts [CommunityNet Aotearoa](https://community.net.nz/resources/nz-navigator-trust/community-trusts), **18** community foundations [Community Foundations of Aotearoa NZ](https://communityfoundations.org.nz/), and the Lottery Grants Board (one funder distributing $311m in 2026/27 via 7 committees [Community Matters](https://www.communitymatters.govt.nz/lottery-grants-board-committee-allocations)). Larger categories — 78 councils, 18 ETNZ energy trusts, private/family trusts, corporate foundations, licensing trusts, iwi funders — are real but **not verified funder-by-funder as grantmakers**, so no overall "floor" count is claimed here.
- **Consolidated eligibility data exists in six places I identified — three paid databases and three free portals — but none is open or machine-readable.** Paid: givUS (subscription; free public access via most council libraries) [Generosity NZ](https://generosity.org.nz/giv-us), Fundsorter (from $16/month billed annually) [Fundsorter pricing](https://www.fundsorter.com/pricing), and GEMS by Strategic Grants [CSI, Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide). Free, partial-coverage: localcommunity.org.nz (region-searchable funder directory), Perpetual Guardian's Funding Hub and Public Trust's Grantseeker's Portal (each covering only the trusts that company administers) [CSI, Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide).
- **No open, machine-readable dataset of grant eligibility criteria was found** (Medium confidence — negative claim; reproducible search method below). What IS open is *distribution-side* data: Class 4 grants paid [data.govt.nz](https://catalogue.data.govt.nz/dataset/class-4-grants-data), COGS grant records [data.govt.nz search](https://catalogue.data.govt.nz/dataset?q=grants), and the Charities Register open data service — whose schema includes fields that identify grantmakers directly (`PurposeToGiveGrantsAndDonations`, `GrantsAndDonationsMade`; see Evidence) [Charities Services, Open data](https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data/).
- **Implication for a grant-matching tool** (the decision this informs): eligibility data must be scraped/curated from funder websites or licensed from a commercial aggregator. The open data helps differently: the Charities Register can enumerate grantmaking charities and their scale, and distribution datasets show who actually funds what — useful for validating (or inferring) eligibility, not for reading it.

**Overall confidence:** Medium — category counts and the aggregator inventory are well-sourced and current (High); the total funder count rests on one vendor's figure (Low–Medium); the "no open eligibility dataset" conclusion is a negative claim backed by a documented but non-exhaustive search (Medium).

## Evidence

### No official register; what exists instead

I found no government-maintained register of grant funders: searches of the data.govt.nz catalogue (method below) return grant *distribution* datasets, not funder or eligibility registers, and none of DIA's gambling pages, Charities Services' register pages, or Community Matters' funding pages describe one. The funding landscape is described by the Centre for Social Impact as "eight main types of sources": community trusts, energy trusts, government and council funds, community foundations, gaming trusts, family and individual trusts and foundations, corporate foundations, and licensing trusts [Centre for Social Impact, Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide). Total philanthropic and grant spend is estimated at $3.8 billion a year by JBWere's New Zealand Support Report, as cited by Philanthropy New Zealand [Philanthropy NZ, What we do](https://www.philanthropy.org.nz/what-we-do).

The nearest thing to a funder count is Fundsorter's live homepage counter: **"3361 Funding opportunities · 1650 Funders · 186,469 Funding matches"** (read from page source, 2 July 2026) [Fundsorter](https://www.fundsorter.com/). Philanthropy New Zealand's page still describes the same platform as analysing "nearly 3,000 funding opportunities" [Philanthropy NZ, Fundseeker](https://www.philanthropy.org.nz/fundseeker) — the vendor's live figure is treated as current here, the PNZ description as stale. Fundsorter's coverage includes some international funders, so 1,650 slightly overstates the NZ-only count [Fundsorter](https://www.fundsorter.com/).

### Verified category counts (deterministic, July 2026)

| Category | Count | Verification |
|---|---|---|
| Class 4 gaming societies (non-club, i.e. grant-distributing) | **32** | Two independent DIA sources agree: (1) DIA's [List of Society Websites](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-List-of-Society-Websites) — 32 unique society sites, script-counted; (2) DIA's [Quarterly List of Venues and GMs, March 2026 (XLSX)](https://catalogue.data.govt.nz/dataset/class-4-gambling-venue-and-gaming-machine-numbers-quarterly-lists) — exactly 32 unique societies with `Club Type = Non-Club`, operating 805 venues. (The same dataset shows a further 137 club societies — RSAs, chartered and sports clubs — which apply proceeds to their own purposes rather than making external grants.) The two lists differ by 2–3 names at the margins (e.g. TAB New Zealand appears in licensing data but not the website list), so "32" is stable but the membership churns slightly. |
| Statutory community trusts (1988 trustee-bank origin) | **12** | [CommunityNet Aotearoa](https://community.net.nz/resources/nz-navigator-trust/community-trusts); [Trust Waikato, Community Trusts history](https://trustwaikato.co.nz/about-us/our-history/community-trusts-history/) |
| Community foundations | **18** | [Community Foundations of Aotearoa NZ](https://communityfoundations.org.nz/) ("There are 18 Community Foundations across Aotearoa New Zealand") |
| Lottery Grants Board | **1 funder, 7 distribution committees** | [Community Matters, LGB Allocations](https://www.communitymatters.govt.nz/lottery-grants-board-committee-allocations) — $311,030,630 allocated for 2026/27 across 6 regional committees and 1 national committee. Counted as one funder: the committees distribute one board's funds. |

### Categories that exist but are not verified funder-by-funder

These are deliberately **not** rolled into a total, because membership of the category doesn't prove an entity makes grants:

- **Councils:** 78 exist (11 regional, 61 territorial, 6 unitary) [LGNZ](https://www.lgnz.co.nz/local-government-in-nz/councils-in-aotearoa/). Many run contestable community grant schemes, but I did not verify this per-council; 78 is a ceiling for this category, not a count of council grantmakers.
- **Energy trusts:** ETNZ lists 18 member trusts (script-counted from [ETNZ, Our Members](https://www.etnz.org.nz/our-members/), 2 July 2026), but ETNZ is a lines-company-ownership body — not all members make community grants, and non-member energy trusts exist.
- **Private and family trusts/foundations** (e.g. Tindall Foundation, JR McKenzie Trust, Todd Foundation, NEXT Foundation [Community Foundations NZ, A brief guide](https://communityfoundations.org.nz/latest-news/a-brief-guide-to-the-philanthropic-sector)): the largest un-counted long tail. Many are administered by trust companies — Public Trust runs a Grantseeker's Portal for "the grant-making trusts they administer" and Perpetual Guardian runs a Funding Hub for trusts it administers [CSI, Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide). JBWere estimated this giving at ~$300m/year in 2018 [Philanthropy NZ, Trust and foundation giving](https://www.philanthropy.org.nz/trust-and-foundation-giving). A Charities Register data pull could count these properly (see below).
- **Licensing trusts, corporate foundations, iwi/hapū funders:** named as categories by CSI [Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide); not enumerated here.

### Where eligibility data lives: the full inventory found

**Paid, national-coverage databases (3):**

- **givUS** (Generosity New Zealand): "New Zealand's primary source of information about funding for community organisations and contains over 1200 resource schemes" [Wheelhouse](https://wheelhouse.org.nz/funding-assistance/givus/); DOC describes it as "access to over 1,200 grants and schemes" [DOC](https://www.doc.govt.nz/get-involved/funding/other-funding-organisations/). Subscription-based; "most council libraries subscribe to givUS on behalf of ratepayers, which enables FREE public access" [Generosity NZ, givUS](https://generosity.org.nz/giv-us) — CSI notes library access applies "outside Auckland" [CSI, Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide). No public API or data licence found.
- **Fundsorter**: matching + application-drafting service; 3,361 opportunities / 1,650 funders (above). Pricing from $16/month billed annually ($192/yr) for organisations under $40k expenditure, rising to $100–125/month for organisations over $5m (read from the pricing page's plan data, 2 July 2026) [Fundsorter pricing](https://www.fundsorter.com/pricing). No public API or data licence found.
- **GEMS** (Strategic Grants): "a paid subscription service … a sophisticated database and management system that helps organisations identify suitable grants, track applications, and manage reporting" [CSI, Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide); [Strategic Grants, GEMS](https://www.strategicgrants.co.nz/gems/).

**Free, partial-coverage portals (3):**

- **localcommunity.org.nz** — "lists a wide variety of different community funders and can be searched by region" [CSI, Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide); [localcommunity.org.nz](https://www.localcommunity.org.nz/view/communities/) (URL live, 2 July 2026). Free web directory; not machine-readable.
- **Perpetual Guardian Funding Hub** — "lists current and upcoming funding rounds for philanthropic trusts administered by Perpetual Guardian" [CSI, Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide). Covers only PG-administered trusts. (The hub URL returned 403 to automated checks on 2 July 2026 — likely bot protection; description relies on CSI.)
- **Public Trust Grantseeker's Portal** — "a search tool for the grant-making trusts they administer" [CSI, Funding guide](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide); [Public Trust grants search](https://www.publictrust.co.nz/grants/?query=&type=organisation) (URL live, 2 July 2026). Covers only PT-administered trusts.

**Everything else:** individual funder websites and PDFs, one funder at a time — e.g. DIA notes pokie grant "application forms are available from societies" individually [DIA, Funding for Community Groups](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-Funding-For-Community-Groups), and government schemes are described page-by-page on Community Matters (e.g. [Lottery Community](https://www.communitymatters.govt.nz/lottery-community)).

### Search methodology for the "no open eligibility dataset" claim

Reproducible searches run 2 July 2026 against the data.govt.nz CKAN API (`https://catalogue.data.govt.nz/api/3/action/package_search?q=<term>`):

| Query | Datasets returned | Relevant to eligibility? |
|---|---|---|
| `grants` | 264 | No — top results are all distribution/recipient data: council "Grant Applications", DIA "Record of Community Organisation Grants Scheme (COGS) grants", "Lottery Grants Board … grant recipients" series |
| `grant eligibility` | 7 | No — citizenship-by-grant processing status, satellite imagery footprints |
| `grant funders` | 1 | No — a geology dataset |
| `funding schemes` | 3 | No — legal aid projections, Companies Office, Lottery recipients |

Also checked: DIA's gambling data pages [Gambling statistics class 4 grants data](https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data), Charities Services [Open data](https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data/), Community Matters funding pages, and the public pages of all six aggregators/portals above (none advertises an API, export, or open licence). **Exclusions:** single-funder application pages and distribution-only datasets don't count as eligibility datasets. **Limits:** no OIA requests were made; vendors were not contacted; an unlisted or academic dataset could exist unfound.

### What IS open and machine-readable (distribution-side)

- **Class 4 grants data**: "available on Granted.govt.nz which provides easy access to class 4 'pokie' grants distribution data right down to a local level. The dataset can be found as an excel file" [DIA](https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data); CSV/XLSX at [data.govt.nz](https://catalogue.data.govt.nz/dataset/class-4-grants-data) (live, 2 July 2026). Recipient, amount, purpose — not eligibility.
- **COGS grant records**: "Record of Community Organisation Grants Scheme (COGS) grants" published by DIA on data.govt.nz (surfaced by the `grants` search above).
- **Charities Register open data**: "intended to be used by software developers", with a published data dictionary and ERD, licensed CC BY 3.0 NZ [Charities Services, Open data](https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data/); ~28,000 registered charities [DIA, Charities Act overview](https://www.dia.govt.nz/charitiesact-overview). **Grantmakers are identifiable in the schema:** the OData service metadata (`https://www.odata.charities.govt.nz/$metadata`, retrieved 2 July 2026) includes the fields `PurposeToGiveGrantsAndDonations`, `OrganisationGeneratesFundsGrantsDonationsToOthers`, `GrantsAndDonationsMade`, `GrantsPaidWithinNZ`, `GrantsPaidOutsideNZ` and `GrantsOrDonationsPaid_LastYear`. So a funder census is buildable by filtering registered charities on the purpose/activity flags and non-zero grants-paid amounts — with the caveat that it covers only funders that are registered charities (councils, government funds and some statutory bodies would be missed).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| No open, machine-readable dataset of NZ grant eligibility criteria exists | Documented data.govt.nz search (4 queries, method above, 2 July 2026) | All six identified aggregators/portals are commercial or non-machine-readable: [givUS](https://generosity.org.nz/giv-us), [Fundsorter](https://www.fundsorter.com/), [GEMS](https://www.strategicgrants.co.nz/gems/), plus three free portals per [CSI](https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide) | Medium — negative claim; search documented but not exhaustive |
| The largest funder database covers ~1,650 funders / ~3,361 opportunities | [Fundsorter homepage](https://www.fundsorter.com/) (live counter, 2 July 2026) | No independent corroboration found — vendor figure, includes some international funders | Low–Medium — single vendor source, explicitly flagged |
| 32 non-club Class 4 societies distribute pokie grants | [DIA List of Society Websites](https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-List-of-Society-Websites) — 32, script-counted | [DIA Quarterly List of Venues and GMs, March 2026](https://catalogue.data.govt.nz/dataset/class-4-gambling-venue-and-gaming-machine-numbers-quarterly-lists) — 32 unique Non-Club societies, script-counted from the XLSX | High — two independent official sources agree |
| Class 4 grant distribution data is fully open and machine-readable | [DIA gambling statistics](https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data) | [data.govt.nz catalogue entry](https://catalogue.data.govt.nz/dataset/class-4-grants-data) | High |
| Lottery Grants Board allocated $311m for 2026/27 | [Community Matters, LGB Allocations](https://www.communitymatters.govt.nz/lottery-grants-board-committee-allocations) | None found for this year's figure — single official primary source | Medium — official but single-sourced; flagged |
| Grantmaking charities are identifiable in Charities Register open data | [Charities Services, Open data](https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data/) | OData `$metadata` field inspection (fields listed above, retrieved 2 July 2026) | High for the schema fields; Medium for census feasibility (field completeness in filings not yet tested) |

## What would change this conclusion

- **Discovery of an open eligibility dataset** — an academic compilation, a council or DIA release, or a Generosity NZ/PNZ data export — would overturn the central finding. The documented search covers data.govt.nz and the major sector sources, but not OIA requests, direct vendor contact, or academic repositories.
- **Vendor figures verified or corrected**: the 1,650-funder and 1,200+/3,361-scheme figures are vendors' own claims. Vendor confirmation of NZ-only counts, coverage overlap between givUS/Fundsorter/GEMS, and update cadence would materially firm up the landscape estimate.
- **A Charities Register census** (filter on `PurposeToGiveGrantsAndDonations` / `GrantsAndDonationsMade`) could replace the vendor figure with an open, reproducible funder count for the charitable subset — if the fields prove well-populated in practice, which I did not test.
- **Per-council and per-trust verification** could convert the "unverified categories" (78 councils, 18 energy trusts, licensing trusts, corporate foundations, iwi funders) into counted funders.
- **Could not verify**: whether givUS/Fundsorter/GEMS license data for reuse; whether Granted.govt.nz exposes an API (only file downloads confirmed); actual coverage of localcommunity.org.nz; Perpetual Guardian hub content (bot-blocked).
- **No contact was made with any organisation** — desk research only.

## Open follow-up questions

- Run the Charities Register census: how many registered charities have `PurposeToGiveGrantsAndDonations` set or report non-zero `GrantsAndDonationsMade`, and how complete are those fields? (Directly buildable — open OData API.)
- Do Generosity NZ, Fundsorter or Strategic Grants license their scheme data, and would any partner with a public-good project?
- How many of the 78 councils run contestable community grant schemes, and in what format are criteria published?
- Is the open Class 4 + COGS distribution data rich enough to *infer* de facto eligibility (who funds organisations like yours, where), bypassing stated criteria?
- How many licensing trusts, corporate foundations, and iwi/hapū funders make grants, and where are their criteria published?

## Sources

1. Fundsorter. Homepage (live counters: 3,361 opportunities / 1,650 funders / 186,469 matches). Accessed 2 July 2026. https://www.fundsorter.com/
2. Fundsorter. Pricing. Accessed 2 July 2026. https://www.fundsorter.com/pricing
3. Department of Conservation. "Other funding organisations." Accessed 2 July 2026. https://www.doc.govt.nz/get-involved/funding/other-funding-organisations/
4. Philanthropy New Zealand. "Fundseeker." Accessed 2 July 2026. https://www.philanthropy.org.nz/fundseeker
5. Department of Internal Affairs. "List of Society Websites." Accessed 2 July 2026. https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-List-of-Society-Websites
6. data.govt.nz catalogue. "Class 4 Gambling Venue and Gaming Machine Numbers – Quarterly Lists" (March 2026 XLSX). Accessed 2 July 2026. https://catalogue.data.govt.nz/dataset/class-4-gambling-venue-and-gaming-machine-numbers-quarterly-lists
7. CommunityNet Aotearoa. "Community Trusts." Accessed 2 July 2026. https://community.net.nz/resources/nz-navigator-trust/community-trusts
8. Trust Waikato. "Community Trusts history." Accessed 2 July 2026. https://trustwaikato.co.nz/about-us/our-history/community-trusts-history/
9. Community Foundations of Aotearoa New Zealand. Homepage. Accessed 2 July 2026. https://communityfoundations.org.nz/
10. Energy Trusts of New Zealand. "Our Members." Accessed 2 July 2026. https://www.etnz.org.nz/our-members/
11. Local Government New Zealand. "Councils in Aotearoa New Zealand." Accessed 2 July 2026. https://www.lgnz.co.nz/local-government-in-nz/councils-in-aotearoa/
12. Community Matters (DIA). "Lottery Grants Board Allocations." Accessed 2 July 2026. https://www.communitymatters.govt.nz/lottery-grants-board-committee-allocations
13. Community Matters (DIA). "Lottery Community." Accessed 2 July 2026. https://www.communitymatters.govt.nz/lottery-community
14. Centre for Social Impact. "Funding guide." Accessed 2 July 2026. https://www.centreforsocialimpact.org.nz/knowledge-base/funding-guide
15. Philanthropy New Zealand. "What we do." Accessed 2 July 2026. https://www.philanthropy.org.nz/what-we-do
16. Philanthropy New Zealand. "Trust and foundation giving." Accessed 2 July 2026. https://www.philanthropy.org.nz/trust-and-foundation-giving
17. Community Foundations NZ. "A brief guide to the philanthropic sector." Accessed 2 July 2026. https://communityfoundations.org.nz/latest-news/a-brief-guide-to-the-philanthropic-sector
18. Generosity New Zealand. "givUS." Accessed 2 July 2026. https://generosity.org.nz/giv-us
19. Palmerston North City Council. "Generosity New Zealand database." Accessed 2 July 2026. https://www.pncc.govt.nz/council-city/community-funding/generosity-new-zealand-database/
20. The Wheelhouse. "givUS." Accessed 2 July 2026. https://wheelhouse.org.nz/funding-assistance/givus/
21. Strategic Grants. "GEMS." Accessed 2 July 2026. https://www.strategicgrants.co.nz/gems/
22. localcommunity.org.nz. "Communities." Accessed 2 July 2026. https://www.localcommunity.org.nz/view/communities/
23. Public Trust. "Grants search." Accessed 2 July 2026. https://www.publictrust.co.nz/grants/?query=&type=organisation
24. Department of Internal Affairs. "Gambling statistics class 4 grants data." Accessed 2 July 2026. https://www.dia.govt.nz/Gambling-statistics-class-4-grants-data
25. data.govt.nz catalogue. "Class 4 grants data." Accessed 2 July 2026. https://catalogue.data.govt.nz/dataset/class-4-grants-data
26. Granted.govt.nz. Accessed 2 July 2026. https://www.granted.govt.nz/
27. Charities Services. "Open data." Accessed 2 July 2026. https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data/
28. Charities Services OData service. `$metadata` schema. Retrieved 2 July 2026. https://www.odata.charities.govt.nz/$metadata
29. Department of Internal Affairs. "Overview of the charitable sector and the Charities Act." Accessed 2 July 2026. https://www.dia.govt.nz/charitiesact-overview
30. Department of Internal Affairs. "Funding for Community Groups." Accessed 2 July 2026. https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-Funding-For-Community-Groups
31. data.govt.nz CKAN API. Search queries documented in Search methodology. Run 2 July 2026. https://catalogue.data.govt.nz/api/3/action/package_search?q=grants
