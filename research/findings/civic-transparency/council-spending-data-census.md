---
title: "NZ council spending data is mostly aggregate or PDF-based, with few council-published machine-readable spending datasets"
domain: "civic-transparency"
issue: "#22"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-02"
status: "draft"
---

# NZ council spending data is mostly aggregate or PDF-based, with few council-published machine-readable spending datasets

## Executive answer

- New Zealand has 78 local authorities: 11 regional councils and 67 territorial authorities, according to the Local Government Commission. [Local Government Commission](https://www.lgc.govt.nz/about-us/about-local-government-in-new-zealand/)
- The strongest machine-readable baseline for council finances is not council-by-council open data portals; it is central government aggregation: Stats NZ publishes local authority income and expenditure releases as CSV/XLSX, and DIA's Local Councils site publishes LTP financial tables for all councils through 2018-28 as CSV/XLSX. [Stats NZ, March 2026 quarter](https://www.stats.govt.nz/information-releases/local-authority-statistics-march-2026-quarter/) [DIA Local Councils download page](http://www.localcouncils.govt.nz/lgip.nsf/wpg_url/Resources-Download-Data-Index) [DIA LTP downloads](http://www.localcouncils.govt.nz/lgip.nsf/wpg_URL/Resources-Download-Data-Local-Authority-Long-Term-Plans?OpenDocument)
- Council-owned open-data portals checked for Auckland, Wellington and Christchurch are primarily geospatial portals. Auckland's portal says it lets users explore and download council-owned geospatial datasets; WCC's data.govt.nz case study describes geospatial releases; Christchurch describes its portal as a spatial open-data portal. [Auckland Council Open Data](https://data-aucklandcouncil.opendata.arcgis.com/) [Data.govt.nz WCC case study](https://data.govt.nz/catalogue-guide/showcase/wellington-city-council-geospatial-open-data) [Christchurch geospatial services](https://ccc.govt.nz/environment/land/geospatial-services)
- I found two council-published machine-readable datasets that are directly spending-adjacent: Christchurch City Council's ArcGIS "Capital Works Programme (OpenData)" with project, activity, budget-band and date fields, and Wellington City Council's ArcGIS-hosted Excel "FundingDataWCCbyfund" with grants/funding amount fields. [Christchurch Capital Works item](https://opendata-christchurchcity.hub.arcgis.com/datasets/ChristchurchCity::capital-works-programme-opendata) [Christchurch ArcGIS item metadata](https://www.arcgis.com/sharing/rest/content/items/a96f3f9e87c84608b164557d87874ecb?f=json) [WCC FundingDataWCCbyfund item metadata](https://www.arcgis.com/sharing/rest/content/items/eef4e55911fe40e39a9ec0c0d2640479?f=json)
- Procurement is partly machine-readable through MBIE's GETS award-notice CSV files, updated quarterly, but this is a central GETS publication, not a complete council-spending ledger; MBIE says the data covers award notices published by government agencies on GETS for 1 July 2019 to 24 February 2025 plus historic 2014-19 files. [MBIE procurement open data](https://www.mbie.govt.nz/cross-government-functions/new-zealand-government-procurement-and-property/open-data) [NZ Government Procurement data and reporting](https://www.procurement.govt.nz/data-and-reporting/)

**Overall confidence:** Medium - positive claims about the named datasets are directly sourced; the negative conclusion is limited to national official datasets, data.govt.nz-visible sources, and the main council open-data portals checked, not a full manual audit of every council website.

## Evidence

### Scope and method

This finding answers a narrower version of issue #22: which official, publicly discoverable NZ council finance/spending/procurement datasets are currently machine-readable, and what the checked council portals reveal about council-published spending data. [Issue #22](https://github.com/thecolab-ai/the-for-good-project/issues/22)

I treated "machine-readable" as CSV, XLS/XLSX, ArcGIS REST/Feature Service, API, or direct downloadable structured data, because data.govt.nz describes open data formats such as Excel and CSV for local councils, and Stats NZ's Infoshare/data tools publish data in Excel, CSV and other table formats. [Data.govt.nz local councils showcase](https://data.govt.nz/catalogue-guide/showcase/local-councils) [Data.govt.nz Infoshare showcase](https://data.govt.nz/catalogue-guide/showcase/infoshare)

I treated "spending/budget/procurement" as three distinct categories: actual/aggregate income and expenditure, forecast budget/LTP financials, and procurement/tender award data, because the official sources separate local authority statistics, long-term-plan financial tables, and GETS award notices. [Stats NZ, March 2026 quarter](https://www.stats.govt.nz/information-releases/local-authority-statistics-march-2026-quarter/) [DIA LTP downloads](http://www.localcouncils.govt.nz/lgip.nsf/wpg_URL/Resources-Download-Data-Local-Authority-Long-Term-Plans?OpenDocument) [MBIE procurement open data](https://www.mbie.govt.nz/cross-government-functions/new-zealand-government-procurement-and-property/open-data)

### National datasets covering all or many councils

| Publisher | Council coverage | Data type | Format | Currency checked | Licence/open terms | Granularity | Confidence |
|---|---:|---|---|---|---|---|---|
| Stats NZ | All territorial and regional councils in aggregate local authority statistics | Actual income and expenditure for core non-trading activities | CSV and XLSX on the release page; Infoshare time series | March 2026 quarter release, published 10 June 2026; next June 2026 quarter due 7 September 2026 | stats.govt.nz footer says content is CC BY 4.0 unless indicated otherwise | Aggregate category/time-series data, not line-item spending | High |
| DIA Local Councils | All councils' LTP financial tables, as collected by DIA | Forecast LTP financials: balance sheet, funding impact statements, statement of financial performance, cash flow, benchmarks | Excel workbooks and CSV for 2018-28; older LTP tables in Excel | Current downloadable LTP series on the page stops at 2018-28 | Local Councils page displays CC BY 3.0 NZ | Forecast financial tables, not transactions | High |
| MBIE / NZ Government Procurement | Agencies that publish award notices on GETS, including councils when they use GETS | Procurement award notices | CSV files plus XLSX schema | MBIE page says current file covers 1 July 2019 to 24 February 2025 and is updated quarterly; page last updated 3 March 2026 | Crown copyright page; no separate open licence found on the MBIE data page during this review | Tender/award notices, not all procurement spend and not invoices | Medium |
| data.govt.nz catalogue/showcase | Describes Local Councils and Infoshare rather than adding a separate finance dataset | Catalogue and case-study metadata | Web catalogue pages; linked datasets vary | Local Councils case study last updated 31 August 2017; site footer current to 2026 | data.govt.nz footer says CC BY 4.0 unless indicated otherwise | Metadata and links | Medium |

Stats NZ's March 2026 release says local authority statistics provide information on the performance of core non-trading activities of New Zealand's territorial and regional councils, and the same page provides the release as XLSX and CSV. [Stats NZ, March 2026 quarter](https://www.stats.govt.nz/information-releases/local-authority-statistics-march-2026-quarter/)

DIA's Local Councils download page says the Local Authority Financial Statistics are released annually by Stats NZ and report councils' historic financial accounts, while DIA collects long-term-plan forecast financial information and makes it available for download. [DIA Local Councils download page](http://www.localcouncils.govt.nz/lgip.nsf/wpg_url/Resources-Download-Data-Index)

DIA's LTP download page says the downloadable LTP financial tables were compiled from councils' 2006-16, 2009-19, 2012-22, 2015-25 and 2018-28 final long-term plans, and it lists 2018-28 LTP financial data as both XLSX and CSV. [DIA LTP downloads](http://www.localcouncils.govt.nz/lgip.nsf/wpg_URL/Resources-Download-Data-Local-Authority-Long-Term-Plans?OpenDocument)

MBIE's procurement open-data page says award-notice data published by government agencies on GETS is provided as CSV files, with a schema, and covers the period 1 July 2019 to 24 February 2025 plus historic 29 July 2014 to 30 June 2019 files. [MBIE procurement open data](https://www.mbie.govt.nz/cross-government-functions/new-zealand-government-procurement-and-property/open-data)

New Zealand Government Procurement's data-and-reporting page says its GETS dashboard is based on information agencies provide through GETS and warns that the information should not be used to consolidate financial data. [NZ Government Procurement data and reporting](https://www.procurement.govt.nz/data-and-reporting/)

### Council-published datasets found

| Council | Data type found | Format | Currency checked | Licence/open terms | What it can answer | What it cannot answer | Confidence |
|---|---|---|---|---|---|---|---|
| Christchurch City Council | Capital works programme with construction projects underway and planned, including a `Budget` field | ArcGIS MapServer/Feature Layer query; ArcGIS Hub downloads typically expose CSV/GeoJSON/KML/shapefile paths | ArcGIS item metadata modified 22 January 2024; service query live on 2 July 2026 | ArcGIS item metadata says CCC Open Data use is CC BY 4.0 | Which capital projects exist, broad budget band, activity, phase and estimated dates | Exact spend to date, supplier, invoice, contract or full operating expenditure | High |
| Wellington City Council | Grants/funding spreadsheet, item title `FundingDataWCCbyfund` | ArcGIS item of type Microsoft Excel; downloadable XLSX | ArcGIS item metadata modified 30 April 2018; spreadsheet downloadable on 2 July 2026 | ArcGIS item metadata has no licence field; WCC's GIS open-data page says WCC online GIS data is CC BY 4.0, but this Excel item's own metadata does not state a licence | Funding-pool, organisation, project/event, amount requested, granted amount and decision fields | General council spending, procurement, contracts or current completeness | Medium |
| Auckland Council | No spending/budget/procurement dataset found in the Auckland open-data portal content group search for `budget`, `spending`, `procurement`, `capital`, `funding` or `grant` on 2 July 2026 | Portal provides geospatial open data | Portal live on 2 July 2026 | Site metadata includes `licenseInfo: CC-BY-SA`; individual item licences may vary | Geospatial council-owned datasets | No general spending or budget dataset identified in the checked portal search | Medium |
| Wellington City Council open-data portal | Apart from the older grants/funding Excel item above, no budget/spending/procurement/capital/funding/grant result appeared in the portal content group search on 2 July 2026 | Portal provides geospatial open data | Portal live on 2 July 2026; WCC case study last updated February 2014 | WCC case study says geospatial data was licensed CC BY 3.0 NZ; current portal text says online WCC GIS data is CC BY 4.0 | Geospatial datasets | No general spending or budget dataset identified in the checked portal search | Medium |
| Christchurch City Council open-data portal | Capital works item found; no general spending/procurement item found in the portal content group search on 2 July 2026 | Spatial open-data portal and ArcGIS services | Portal live on 2 July 2026 | Capital works item metadata says CC BY 4.0 | Capital works programme | No full ledger, procurement or operating-spend dataset identified in the checked portal search | Medium |

Christchurch's Capital Works Programme item describes approximate locations of construction projects underway and planned in Christchurch and says the data includes current and future planned projects across facilities, transport, water supply, wastewater, stormwater, parks and recreation. [Christchurch ArcGIS item metadata](https://www.arcgis.com/sharing/rest/content/items/a96f3f9e87c84608b164557d87874ecb?f=json)

The Christchurch Capital Works ArcGIS service exposes fields named `Project`, `DisplayTitle`, `Activity`, `Comment`, `DisplayPhase`, `Budget`, `EstimatedStart` and `EstimatedFinish`, which makes it structured project-budget data rather than just a map image. [Christchurch ArcGIS REST layer](https://gis.ccc.govt.nz/arcgis/rest/services/CorporateData/Administrative/MapServer/23?f=pjson)

Wellington's `FundingDataWCCbyfund` item is an ArcGIS-hosted Microsoft Excel item owned by `WellingtonCityCouncil` and tagged `Funding`, `Grant`, `WCC`, `Community`, and `Grants`. [WCC FundingDataWCCbyfund item metadata](https://www.arcgis.com/sharing/rest/content/items/eef4e55911fe40e39a9ec0c0d2640479?f=json)

The downloaded WCC workbook contains fields including `Funding Pool Name`, `Financial Year`, `Organisation Name`, `Project/Event Title`, `Amount requested`, `Granted Total Amount`, `Final Decision` and `Status`, so it is machine-readable grant-spending data, but I could not verify from the item metadata that it is current after 2018. [WCC FundingDataWCCbyfund download](https://www.arcgis.com/sharing/rest/content/items/eef4e55911fe40e39a9ec0c0d2640479/data)

### What the main open-data portals appear to be for

Auckland Council's open-data portal headline says users can explore and download council-owned geospatial datasets. [Auckland Council Open Data](https://data-aucklandcouncil.opendata.arcgis.com/)

Wellington City Council's data.govt.nz case study says WCC began licensing and releasing geospatial data in April 2010, including aerial photographs, historic maps, boundaries, contour lines, building footprints, utility networks, hazard information and council-facility locations. [Data.govt.nz WCC case study](https://data.govt.nz/catalogue-guide/showcase/wellington-city-council-geospatial-open-data)

Christchurch City Council says its Spatial Open Data Portal provides public, authoritative spatial datasets maintained by the council, including council assets, infrastructure, planning rules, heritage and other spatial categories. [Christchurch geospatial services](https://ccc.govt.nz/environment/land/geospatial-services)

This means the main open-data portals are useful infrastructure for geospatial council data, but they are not currently a reliable route to full council budgets, full spending ledgers or full procurement data. [Auckland Council Open Data](https://data-aucklandcouncil.opendata.arcgis.com/) [Data.govt.nz WCC case study](https://data.govt.nz/catalogue-guide/showcase/wellington-city-council-geospatial-open-data) [Christchurch geospatial services](https://ccc.govt.nz/environment/land/geospatial-services)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| The useful all-council machine-readable finance baseline is central aggregation, not council-by-council spending portals. | [Stats NZ publishes local authority statistics as CSV/XLSX](https://www.stats.govt.nz/information-releases/local-authority-statistics-march-2026-quarter/) | [DIA publishes LTP financial tables as CSV/XLSX](http://www.localcouncils.govt.nz/lgip.nsf/wpg_URL/Resources-Download-Data-Local-Authority-Long-Term-Plans?OpenDocument) | High |
| The main checked council open-data portals are primarily spatial/geospatial, not financial-spending portals. | [Auckland portal says "geospatial datasets"](https://data-aucklandcouncil.opendata.arcgis.com/) | [Christchurch describes a spatial open-data portal](https://ccc.govt.nz/environment/land/geospatial-services) | Medium |
| Procurement open data exists nationally, but it should not be treated as consolidated council financial data. | [MBIE publishes GETS award-notice CSVs](https://www.mbie.govt.nz/cross-government-functions/new-zealand-government-procurement-and-property/open-data) | [NZ Government Procurement warns GETS dashboard data should not be used to consolidate financial data](https://www.procurement.govt.nz/data-and-reporting/) | Medium |
| Christchurch has the clearest council-published, machine-readable project-budget dataset found in this pass. | [Christchurch Capital Works item metadata](https://www.arcgis.com/sharing/rest/content/items/a96f3f9e87c84608b164557d87874ecb?f=json) | [Christchurch ArcGIS REST layer fields](https://gis.ccc.govt.nz/arcgis/rest/services/CorporateData/Administrative/MapServer/23?f=pjson) | High |

## What would change this conclusion

- A full manual audit of all 78 council websites, including annual-plan/LTP supporting spreadsheets hidden outside open-data portals, could find more council-published machine-readable budget or spending datasets.
- LGOIMA responses from councils asking specifically for published structured finance exports, chart-of-accounts extracts, supplier payment reports, or procurement registers could overturn the conclusion that council-published machine-readable spending data is rare.
- A current DIA replacement for the decommissioned Local Councils website with 2021-31 or 2024-34 LTP financial tables would change the currency assessment for LTP budget data.
- A council may publish structured finance data under filenames that do not include the searched terms `budget`, `spending`, `procurement`, `capital`, `funding` or `grant`; this review would miss that.
- I could not verify a permissive licence on MBIE's GETS CSV files beyond Crown copyright on the page, and I could not verify a licence on the WCC Excel item's own ArcGIS metadata.
- I did not contact councils, run OIA/LGOIMA requests, or inspect internal procurement portals; this is a desk review of public, unauthenticated sources.

## Open follow-up questions

- Which councils publish supporting spreadsheets alongside their LTPs, annual plans or annual reports, even if those files are not listed in open-data portals?
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
16. ArcGIS item metadata. "FundingDataWCCbyfund." Item `eef4e55911fe40e39a9ec0c0d2640479`. Accessed 2 July 2026. https://www.arcgis.com/sharing/rest/content/items/eef4e55911fe40e39a9ec0c0d2640479?f=json
17. ArcGIS item download. "FundingDataWCCbyfund." Item `eef4e55911fe40e39a9ec0c0d2640479`. Accessed 2 July 2026. https://www.arcgis.com/sharing/rest/content/items/eef4e55911fe40e39a9ec0c0d2640479/data
18. Data.govt.nz. "Infoshare." Accessed 2 July 2026. https://data.govt.nz/catalogue-guide/showcase/infoshare
