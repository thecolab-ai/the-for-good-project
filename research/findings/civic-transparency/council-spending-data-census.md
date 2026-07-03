---
title: "Limited desk scan of national NZ council finance datasets and three council open-data portals"
domain: "civic-transparency"
issue: "#22"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-03"
status: "draft"
---

# Limited desk scan of national NZ council finance datasets and three council open-data portals

## Scope and status

This is a **limited desk scan, not a completed 78-council census.** Issue #22 asks, across all NZ territorial and regional councils, which publish machine-readable spending/budget/procurement data, in what formats, how current, and under what licence. Answering that fully needs a council-by-council table for all 78 local authorities. This pass covers the **national aggregators** (Stats NZ, DIA, MBIE/GETS) plus **portal checks of only three councils — Auckland, Wellington and Christchurch.** It should be read as a starting inventory and a method for the full census, **not** as a national answer, and it does **not** on its own answer or close #22. [Issue #22](https://github.com/thecolab-ai/the-for-good-project/issues/22)

## Executive answer

- **Scope caveat first:** the negative/comparative claims below are limited to the national official datasets, data.govt.nz-visible sources, and the Auckland/Wellington/Christchurch portals actually checked. They are **not** a national audit of all 78 councils. [Issue #22](https://github.com/thecolab-ai/the-for-good-project/issues/22)
- New Zealand has 78 local authorities: 11 regional councils and 67 territorial authorities, according to the Local Government Commission. [Local Government Commission](https://www.lgc.govt.nz/about-us/about-local-government-in-new-zealand/)
- For **all-council** machine-readable finance data, this pass directly verified central-government aggregations: Stats NZ publishes local authority income and expenditure as CSV/XLSX, and DIA's Local Councils site publishes LTP financial tables for all councils through 2018-28 as CSV/XLSX. This is not evidence that council portals nationally lack equivalent or better data. [Stats NZ, March 2026 quarter](https://www.stats.govt.nz/information-releases/local-authority-statistics-march-2026-quarter/) [DIA Local Councils download page](http://www.localcouncils.govt.nz/lgip.nsf/wpg_url/Resources-Download-Data-Index) [DIA LTP downloads](http://www.localcouncils.govt.nz/lgip.nsf/wpg_URL/Resources-Download-Data-Local-Authority-Long-Term-Plans?OpenDocument)
- The three council open-data portals checked (Auckland, Wellington, Christchurch) present themselves primarily as geospatial portals. [Auckland Council Open Data](https://data-aucklandcouncil.opendata.arcgis.com/) [Data.govt.nz WCC case study](https://data.govt.nz/catalogue-guide/showcase/wellington-city-council-geospatial-open-data) [Christchurch geospatial services](https://ccc.govt.nz/environment/land/geospatial-services)
- Within those three portals I found two council-published, spending-adjacent machine-readable datasets, of differing quality: Christchurch City Council's ArcGIS "Capital Works Programme (OpenData)" with project, activity, budget-band and date fields (item metadata modified 22 January 2024, CC BY 4.0); and Wellington City Council's ArcGIS-hosted Excel "FundingDataWCCbyfund" grants workbook — but the WCC item is **stale (item metadata modified 30 April 2018, sample rows from FY2012/13) and its own metadata states no licence**, so it is a weak, dated example rather than a current spending source. [Christchurch ArcGIS item metadata](https://www.arcgis.com/sharing/rest/content/items/a96f3f9e87c84608b164557d87874ecb?f=json) [WCC FundingDataWCCbyfund item metadata](https://www.arcgis.com/sharing/rest/content/items/eef4e55911fe40e39a9ec0c0d2640479?f=json)
- Procurement is partly machine-readable through MBIE's GETS award-notice CSV files, updated quarterly, but this is a central GETS publication, not a complete council-spending ledger. [MBIE procurement open data](https://www.mbie.govt.nz/cross-government-functions/new-zealand-government-procurement-and-property/open-data) [NZ Government Procurement data and reporting](https://www.procurement.govt.nz/data-and-reporting/)

**Overall confidence:** Medium for the existence/format claims about the named datasets and three checked portals (directly sourced); **Low** for any comparative/negative claim about what council portals do not publish nationally, because the corpus searched is three portals plus central sources, not a full audit.

## Evidence

### Scope and method

This finding answers a **narrowed** version of issue #22: which official, publicly discoverable NZ council finance/spending/procurement datasets are currently machine-readable across the national aggregators, and what a portal check of three major councils (Auckland, Wellington, Christchurch) reveals. The full #22 census — a table for all 78 authorities — is **not** completed here and is listed as the primary follow-up. [Issue #22](https://github.com/thecolab-ai/the-for-good-project/issues/22)

I treated "machine-readable" as CSV, XLS/XLSX, ArcGIS REST/Feature Service, API, or direct downloadable structured data, because data.govt.nz describes open data formats such as Excel and CSV for local councils, and Stats NZ's data tools publish data in Excel, CSV and other table formats. [Data.govt.nz local councils showcase](https://data.govt.nz/catalogue-guide/showcase/local-councils) [Data.govt.nz Infoshare showcase](https://data.govt.nz/catalogue-guide/showcase/infoshare)

I treated "spending/budget/procurement" as three distinct categories: actual/aggregate income and expenditure, forecast budget/LTP financials, and procurement/tender award data, because the official sources separate local authority statistics, long-term-plan financial tables, and GETS award notices. [Stats NZ, March 2026 quarter](https://www.stats.govt.nz/information-releases/local-authority-statistics-march-2026-quarter/) [DIA LTP downloads](http://www.localcouncils.govt.nz/lgip.nsf/wpg_URL/Resources-Download-Data-Local-Authority-Long-Term-Plans?OpenDocument) [MBIE procurement open data](https://www.mbie.govt.nz/cross-government-functions/new-zealand-government-procurement-and-property/open-data)

**On PDF prevalence:** an earlier draft headline claimed council spending data is "mostly PDF-based". This pass did not audit council annual plans / LTPs / annual reports for PDF-vs-CSV/API prevalence and has no source counting formats across councils, so that claim has been removed. Whether spending data is predominantly PDF-published remains an open question for the full census.

### National datasets covering all or many councils

Each row's factual cells are supported by the source(s) in the final column.

| Publisher | Council coverage | Data type | Format | Currency checked | Licence/open terms | Granularity | Confidence | Row sources |
|---|---|---|---|---|---|---|---|---|
| Stats NZ | All territorial and regional councils in aggregate local authority statistics | Actual income and expenditure for core non-trading activities | CSV and XLSX on the release page; Infoshare time series | March 2026 quarter release, published 10 June 2026 | Stats NZ site footer states content is CC BY 4.0 unless indicated otherwise | Aggregate category/time-series data, not line-item spending | High (existence/format) | [Stats NZ release](https://www.stats.govt.nz/information-releases/local-authority-statistics-march-2026-quarter/) |
| DIA Local Councils | All councils' LTP financial tables, as collected by DIA | Forecast LTP financials: balance sheet, funding impact statements, statement of financial performance, cash flow, benchmarks | Excel workbooks and CSV for 2018-28; older LTP tables in Excel | Current downloadable LTP series on the page stops at 2018-28 | Local Councils page displays CC BY 3.0 NZ | Forecast financial tables, not transactions | High (existence/format) | [DIA download index](http://www.localcouncils.govt.nz/lgip.nsf/wpg_url/Resources-Download-Data-Index) [DIA LTP downloads](http://www.localcouncils.govt.nz/lgip.nsf/wpg_URL/Resources-Download-Data-Local-Authority-Long-Term-Plans?OpenDocument) |
| MBIE / NZ Government Procurement | Agencies that publish award notices on GETS, including councils when they use GETS | Procurement award notices | CSV files plus XLSX schema | MBIE page says current file covers 1 July 2019 to 24 February 2025 and is updated quarterly; page last updated 3 March 2026 | Crown copyright page; no separate open licence found on the MBIE data page during this review | Tender/award notices, not all procurement spend and not invoices | Medium | [MBIE open data](https://www.mbie.govt.nz/cross-government-functions/new-zealand-government-procurement-and-property/open-data) [NZ Govt Procurement](https://www.procurement.govt.nz/data-and-reporting/) |
| data.govt.nz catalogue/showcase | Describes Local Councils and Infoshare rather than adding a separate finance dataset | Catalogue and case-study metadata | Web catalogue pages; linked datasets vary | Local Councils case study last updated 31 August 2017; site footer current to 2026 | data.govt.nz footer says CC BY 4.0 unless indicated otherwise | Metadata and links | Medium | [Local councils showcase](https://data.govt.nz/catalogue-guide/showcase/local-councils) [Infoshare showcase](https://data.govt.nz/catalogue-guide/showcase/infoshare) |

Stats NZ's March 2026 release says local authority statistics provide information on the performance of core non-trading activities of New Zealand's territorial and regional councils, and the same page provides the release as XLSX and CSV. [Stats NZ, March 2026 quarter](https://www.stats.govt.nz/information-releases/local-authority-statistics-march-2026-quarter/)

DIA's Local Councils download page says the Local Authority Financial Statistics are released annually by Stats NZ and report councils' historic financial accounts, while DIA collects long-term-plan forecast financial information and makes it available for download. [DIA Local Councils download page](http://www.localcouncils.govt.nz/lgip.nsf/wpg_url/Resources-Download-Data-Index)

DIA's LTP download page says the downloadable LTP financial tables were compiled from councils' 2006-16, 2009-19, 2012-22, 2015-25 and 2018-28 final long-term plans, and it lists 2018-28 LTP financial data as both XLSX and CSV. [DIA LTP downloads](http://www.localcouncils.govt.nz/lgip.nsf/wpg_URL/Resources-Download-Data-Local-Authority-Long-Term-Plans?OpenDocument)

MBIE's procurement open-data page says award-notice data published by government agencies on GETS is provided as CSV files, with a schema, and covers the period 1 July 2019 to 24 February 2025 plus historic 29 July 2014 to 30 June 2019 files. [MBIE procurement open data](https://www.mbie.govt.nz/cross-government-functions/new-zealand-government-procurement-and-property/open-data)

New Zealand Government Procurement's data-and-reporting page says its GETS dashboard is based on information agencies provide through GETS and warns that the information should not be used to consolidate financial data. [NZ Government Procurement data and reporting](https://www.procurement.govt.nz/data-and-reporting/)

### Council-published datasets found in the three portals checked

The three "not found" rows below record a **manual content-group search** of each portal on 2 July 2026 for the terms `budget`, `spending`, `procurement`, `capital`, `funding`, `grant`. These are negative results from a manual search, not a reproducible API query, so they are marked **Low** confidence and are explicitly a limitation (see "What would change this conclusion"). A dataset published under other filenames, or outside the portal, would be missed.

| Council / portal | Data type found | Format | Currency checked | Licence/open terms | What it can answer | What it cannot answer | Confidence | Row sources |
|---|---|---|---|---|---|---|---|---|
| Christchurch City Council — Capital Works Programme | Capital works programme with construction projects underway and planned, including a banded `Budget` field (e.g. `Under 500k`, `$2m to $20m`) | ArcGIS MapServer/Feature Layer query; ArcGIS Hub downloads typically expose CSV/GeoJSON/KML/shapefile paths | ArcGIS item metadata modified 22 January 2024; service query live on 2 July 2026 | ArcGIS item metadata says CCC Open Data use is CC BY 4.0 | Which capital projects exist, broad budget band, activity, phase and estimated dates | Exact spend to date, supplier, invoice, contract or full operating expenditure | High (existence/fields) | [CCC item metadata](https://www.arcgis.com/sharing/rest/content/items/a96f3f9e87c84608b164557d87874ecb?f=json) [CCC ArcGIS layer fields](https://gis.ccc.govt.nz/arcgis/rest/services/CorporateData/Administrative/MapServer/23?f=pjson) |
| Wellington City Council — FundingDataWCCbyfund | Grants/funding spreadsheet (grants ledger) | ArcGIS item of type Microsoft Excel; downloadable XLSX | Item metadata modified **30 April 2018**; sample rows begin FY2012/13; downloadable on 2 July 2026 — **stale** | ArcGIS item metadata has **no licence field (null)**; WCC's GIS open-data page says WCC online GIS data is CC BY 4.0, but this item's own metadata does not state a licence | Historic funding-pool, organisation, project/event, amount requested, granted amount and decision fields | Current grant spending, general council spending, procurement or contracts | Low (stale, licence unclear) | [WCC item metadata](https://www.arcgis.com/sharing/rest/content/items/eef4e55911fe40e39a9ec0c0d2640479?f=json) [WCC download](https://www.arcgis.com/sharing/rest/content/items/eef4e55911fe40e39a9ec0c0d2640479/data) |
| Auckland Council portal | No spending/budget/procurement dataset surfaced in a manual content-group search for the six terms on 2 July 2026 | Portal provides geospatial open data | Portal live on 2 July 2026 | Site metadata includes `licenseInfo: CC-BY-SA`; individual item licences may vary | Geospatial council-owned datasets | No general spending or budget dataset identified in this manual search | Low (negative, non-reproducible search) | [Auckland Open Data](https://data-aucklandcouncil.opendata.arcgis.com/) |
| Wellington City Council portal | Apart from the stale grants Excel above, no budget/spending/procurement/capital/funding/grant result surfaced in the manual search on 2 July 2026 | Portal provides geospatial open data | Portal live on 2 July 2026 | WCC case study says geospatial data was licensed CC BY 3.0 NZ; current portal text says online WCC GIS data is CC BY 4.0 | Geospatial datasets | No general spending or budget dataset identified in this manual search | Low (negative, non-reproducible search) | [Data.govt.nz WCC case study](https://data.govt.nz/catalogue-guide/showcase/wellington-city-council-geospatial-open-data) [WCC portal terms](https://wellington.govt.nz/wellington-city/maps/open-data-portal-terms-and-conditions) |
| Christchurch City Council portal | Capital works item found; no general spending/procurement item surfaced in the manual search on 2 July 2026 | Spatial open-data portal and ArcGIS services | Portal live on 2 July 2026 | Capital works item metadata says CC BY 4.0 | Capital works programme | No full ledger, procurement or operating-spend dataset identified in this manual search | Low (negative, non-reproducible search) | [Christchurch geospatial services](https://ccc.govt.nz/environment/land/geospatial-services) [CCC item metadata](https://www.arcgis.com/sharing/rest/content/items/a96f3f9e87c84608b164557d87874ecb?f=json) |

Christchurch's Capital Works Programme item describes approximate locations of construction projects underway and planned in Christchurch and says the data includes current and future planned projects across facilities, transport, water supply, wastewater, stormwater, parks and recreation. [Christchurch ArcGIS item metadata](https://www.arcgis.com/sharing/rest/content/items/a96f3f9e87c84608b164557d87874ecb?f=json)

The Christchurch Capital Works ArcGIS service exposes fields named `Project`, `DisplayTitle`, `Activity`, `Comment`, `DisplayPhase`, `Budget`, `EstimatedStart` and `EstimatedFinish`, which makes it structured project-budget data rather than just a map image; the `Budget` value is a banded string such as `Under 500k` or `$2m to $20m`, not an exact figure. [Christchurch ArcGIS REST layer](https://gis.ccc.govt.nz/arcgis/rest/services/CorporateData/Administrative/MapServer/23?f=pjson)

Wellington's `FundingDataWCCbyfund` item is an ArcGIS-hosted Microsoft Excel item owned by `WellingtonCityCouncil` and tagged `Funding`, `Grant`, `WCC`, `Community`, and `Grants`; its item metadata records `modified: 30 April 2018` and no licence value. [WCC FundingDataWCCbyfund item metadata](https://www.arcgis.com/sharing/rest/content/items/eef4e55911fe40e39a9ec0c0d2640479?f=json)

The downloaded WCC workbook contains fields including `Funding Pool Name`, `Financial Year`, `Organisation Name`, `Project/Event Title`, `Amount requested`, `Granted Total Amount`, `Final Decision` and `Status`, so it is machine-readable grant-spending data — but sample rows begin in financial year 2012/13 and the item has not been modified since 2018, so it is a dated historic workbook rather than a current spending source. [WCC FundingDataWCCbyfund download](https://www.arcgis.com/sharing/rest/content/items/eef4e55911fe40e39a9ec0c0d2640479/data)

### What the three checked open-data portals appear to be for

Auckland Council's open-data portal headline says users can explore and download council-owned geospatial datasets. [Auckland Council Open Data](https://data-aucklandcouncil.opendata.arcgis.com/)

Wellington City Council's data.govt.nz case study says WCC began licensing and releasing geospatial data in April 2010, including aerial photographs, historic maps, boundaries, contour lines, building footprints, utility networks, hazard information and council-facility locations. [Data.govt.nz WCC case study](https://data.govt.nz/catalogue-guide/showcase/wellington-city-council-geospatial-open-data)

Christchurch City Council says its Spatial Open Data Portal provides public, authoritative spatial datasets maintained by the council, including council assets, infrastructure, planning rules, heritage and other spatial categories. [Christchurch geospatial services](https://ccc.govt.nz/environment/land/geospatial-services)

For these three councils, the portals are useful infrastructure for geospatial council data, and in this pass they were not a route to full council budgets, spending ledgers or procurement data. This is a statement about the three portals checked on 2 July 2026, not a national conclusion. [Auckland Council Open Data](https://data-aucklandcouncil.opendata.arcgis.com/) [Data.govt.nz WCC case study](https://data.govt.nz/catalogue-guide/showcase/wellington-city-council-geospatial-open-data) [Christchurch geospatial services](https://ccc.govt.nz/environment/land/geospatial-services)

## Surprising or load-bearing claims

Existence claims (that a named dataset exists with named fields) are separated from comparative/negative claims (that something is the "strongest" or "not available"), and confidence is assigned to each separately.

| Claim | Type | Source 1 | Source 2 | Confidence |
|---|---|---|---|---|
| Stats NZ and DIA publish all-council machine-readable finance data (CSV/XLSX). | Existence | [Stats NZ local authority statistics as CSV/XLSX](https://www.stats.govt.nz/information-releases/local-authority-statistics-march-2026-quarter/) | [DIA publishes LTP financial tables as CSV/XLSX](http://www.localcouncils.govt.nz/lgip.nsf/wpg_URL/Resources-Download-Data-Local-Authority-Long-Term-Plans?OpenDocument) | High |
| In this limited pass, the only directly verified all-council machine-readable finance baselines were central aggregations. This does **not** establish that council portals nationally lack equivalent data. | Search result from a limited corpus, not a national comparative conclusion | [Stats NZ proves an all-council central dataset exists](https://www.stats.govt.nz/information-releases/local-authority-statistics-march-2026-quarter/) | [DIA proves all-council LTP tables exist](http://www.localcouncils.govt.nz/lgip.nsf/wpg_URL/Resources-Download-Data-Local-Authority-Long-Term-Plans?OpenDocument); only three council portals were checked | Low |
| The three council open-data portals checked (Auckland/Wellington/Christchurch) are primarily spatial/geospatial. | Existence (about those three) | [Auckland portal says "geospatial datasets"](https://data-aucklandcouncil.opendata.arcgis.com/) | [Christchurch describes a spatial open-data portal](https://ccc.govt.nz/environment/land/geospatial-services) | Medium |
| Procurement open data exists nationally, but it should not be treated as consolidated council financial data. | Existence + sourced caveat | [MBIE publishes GETS award-notice CSVs](https://www.mbie.govt.nz/cross-government-functions/new-zealand-government-procurement-and-property/open-data) | [NZ Government Procurement warns GETS dashboard data should not be used to consolidate financial data](https://www.procurement.govt.nz/data-and-reporting/) | Medium |
| Christchurch's Capital Works Programme dataset exists and exposes `Project`, `Activity`, `Budget` (banded), phase and date fields. | Existence | [Christchurch Capital Works item metadata](https://www.arcgis.com/sharing/rest/content/items/a96f3f9e87c84608b164557d87874ecb?f=json) | [Christchurch ArcGIS REST layer fields](https://gis.ccc.govt.nz/arcgis/rest/services/CorporateData/Administrative/MapServer/23?f=pjson) | High |
| Christchurch's is the *clearest* council-published machine-readable project-budget dataset. | Comparative — only three portals searched | [Christchurch item metadata (proves existence, not "clearest")](https://www.arcgis.com/sharing/rest/content/items/a96f3f9e87c84608b164557d87874ecb?f=json) | No corpus-wide comparison performed — comparative ranking rests on a three-portal sample, flagged | Low |

## What would change this conclusion

- **The full census.** A council-by-council table for all 78 local authorities (format, currency, licence/open terms, searched source and date) would replace this three-portal sample and could overturn every comparative/negative claim above. This is the primary outstanding work for #22.
- A reproducible, corpus-wide portal/website audit — with search terms, query URLs, dates, hit/no-hit results and counterexamples — is needed before any claim like "central aggregation is the strongest baseline" or "Christchurch is clearest" can rise above Low confidence.
- The three portal-level negative rows in the council table are manual, non-reproducible searches for six keywords; a dataset published under other filenames, or outside the open-data portal (e.g. attached to an annual plan/LTP/annual report page), would be missed.
- LGOIMA responses from councils asking specifically for published structured finance exports, chart-of-accounts extracts, supplier payment reports, or procurement registers could show council-published machine-readable spending data is more common than this sample suggests.
- A current DIA replacement for the decommissioned Local Councils website with 2021-31 or 2024-34 LTP financial tables would change the currency assessment for LTP budget data.
- I could not verify a permissive licence on MBIE's GETS CSV files beyond Crown copyright on the page, and the WCC Excel item's own ArcGIS metadata states no licence.
- I did not audit PDF-vs-CSV/API prevalence across council annual plans/LTPs/annual reports, so the question of whether council spending data is "mostly PDF-based" is unresolved.
- I did not contact councils, run OIA/LGOIMA requests, or inspect internal procurement portals; this is a desk review of public, unauthenticated sources.

## Open follow-up questions

- **Complete the #22 census:** build the all-78-council table (regional + territorial), recording for each council the machine-readable finance/spending/procurement datasets found, format, currency, licence, and the searched source URL and date.
- Which councils publish supporting spreadsheets alongside their LTPs, annual plans or annual reports, even if those files are not listed in open-data portals?
- Across councils, is spending/budget data predominantly PDF-published, and what share is CSV/API? (The removed "PDF-based" headline needs a sourced format audit to make or refute.)
- How many councils use GETS consistently enough that MBIE award-notice data can serve as a council procurement proxy?
- Can the DIA Local Councils LTP tables be reconstructed for 2021-31 and 2024-34 from council PDFs or audited annual-plan material?
- Is Christchurch's capital works schema a practical seed for a cross-council capital-project standard?
- What minimum spending dataset would be useful without creating privacy or commercial-sensitivity issues: supplier payments above a threshold, contract award notices, grants, capital projects, or activity-level budget lines?

## Sources

1. Local Government Commission. "About local government in New Zealand." Accessed 2 July 2026. https://www.lgc.govt.nz/about-us/about-local-government-in-new-zealand/
2. Stats NZ. "Local authority statistics: March 2026 quarter." Published 10 June 2026. Accessed 2 July 2026. https://www.stats.govt.nz/information-releases/local-authority-statistics-march-2026-quarter/
3. Stats NZ. "CSV files for download." Accessed 2 July 2026. https://www.stats.govt.nz/large-datasets/csv-files-for-download/
4. Data.govt.nz. "Local councils." Case study updated 31 August 2017. Accessed 2 July 2026. https://data.govt.nz/catalogue-guide/showcase/local-councils
5. Department of Internal Affairs. "Download local government data." Metadata modified 7 August 2023; page notes Local Councils website decommissioning redirect. Accessed 2 July 2026. http://www.localcouncils.govt.nz/lgip.nsf/wpg_url/Resources-Download-Data-Index
6. Department of Internal Affairs. "Local Authority Long-Term Plans." Accessed 2 July 2026. http://www.localcouncils.govt.nz/lgip.nsf/wpg_URL/Resources-Download-Data-Local-Authority-Long-Term-Plans?OpenDocument
7. MBIE. "New Zealand government procurement open data." Last updated 3 March 2026. Accessed 2 July 2026. https://www.mbie.govt.nz/cross-government-functions/new-zealand-government-procurement-and-property/open-data
8. New Zealand Government Procurement. "Data and reporting." Accessed 2 July 2026. https://www.procurement.govt.nz/data-and-reporting/
9. Auckland Council. "Auckland Council Open Data." Accessed 2 July 2026. https://data-aucklandcouncil.opendata.arcgis.com/
10. Data.govt.nz. "Wellington City Council Geospatial Open Data." Last updated February 2014. Accessed 2 July 2026. https://data.govt.nz/catalogue-guide/showcase/wellington-city-council-geospatial-open-data
11. Wellington City Council. "Open data portal terms and conditions." Accessed 2 July 2026. https://wellington.govt.nz/wellington-city/maps/open-data-portal-terms-and-conditions
12. Christchurch City Council. "Geospatial datasets and maps." Accessed 2 July 2026. https://ccc.govt.nz/environment/land/geospatial-services
13. Christchurch City Council Open Data Portal. "Capital Works Programme (OpenData)." Accessed 2 July 2026. https://opendata-christchurchcity.hub.arcgis.com/datasets/ChristchurchCity::capital-works-programme-opendata
14. ArcGIS item metadata. "Capital Works Programme (OpenData)." Item `a96f3f9e87c84608b164557d87874ecb`. Accessed 2 July 2026. https://www.arcgis.com/sharing/rest/content/items/a96f3f9e87c84608b164557d87874ecb?f=json
15. Christchurch City Council ArcGIS REST service. "CapitalProgrammeProjectLocation." Accessed 2 July 2026. https://gis.ccc.govt.nz/arcgis/rest/services/CorporateData/Administrative/MapServer/23?f=pjson
16. ArcGIS item metadata. "FundingDataWCCbyfund." Item `eef4e55911fe40e39a9ec0c0d2640479`. Modified 30 April 2018; licence field null. Accessed 2 July 2026. https://www.arcgis.com/sharing/rest/content/items/eef4e55911fe40e39a9ec0c0d2640479?f=json
17. ArcGIS item download. "FundingDataWCCbyfund." Item `eef4e55911fe40e39a9ec0c0d2640479`. Accessed 2 July 2026. https://www.arcgis.com/sharing/rest/content/items/eef4e55911fe40e39a9ec0c0d2640479/data
18. Data.govt.nz. "Infoshare." Accessed 2 July 2026. https://data.govt.nz/catalogue-guide/showcase/infoshare
