---
title: "Public data can quantify Canterbury and Waikato dairy-consent expiry exposure, but not a six-region production denominator"
domain: "civic-transparency"
issue: "#863"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-08"
status: "draft"
---

# Public data can quantify Canterbury and Waikato dairy-consent expiry exposure, but not a six-region production denominator

## Executive answer

- A six-region, dairy-specific denominator for water-take, discharge, irrigation volume and linked milk production is not yet publicly computable from the layers found: ECan publishes rich water-take and dairy-effluent layers, Waikato publishes an explicitly dairy-classified seasonal allocation layer, and Southland, Bay of Plenty, Otago and Northland publish or expose broader resource-consent location layers with materially different field depth [data.govt.nz ECan groundwater](https://catalogue.data.govt.nz/dataset/groundwater-take-active-consented-activities6), [data.govt.nz ECan surface water](https://catalogue.data.govt.nz/dataset/surface-water-take-active-consented-activities3), [data.govt.nz ECan dairy effluent](https://catalogue.data.govt.nz/dataset/effluent-dairy-discharge-active-consented-activities3), [data.govt.nz Waikato allocation](https://catalogue.data.govt.nz/dataset/allocated-water-take-seasonal-water-allocation), [data.govt.nz Southland consents](https://catalogue.data.govt.nz/dataset/southland-current-resource-consents3), [data.govt.nz BOPRC consents](https://catalogue.data.govt.nz/dataset/resource-consents12), [data.govt.nz Otago consents](https://catalogue.data.govt.nz/dataset/orc-resource-consents26), [data.govt.nz Northland point consents](https://catalogue.data.govt.nz/dataset/resource-consents-point4).
- In Canterbury, ECan's dairy-effluent layer is dairy-specific: 200 distinct consent numbers, 218,786 consented animals and 401,789 m3 of parseable numeric storage volume expire by 2031; 371 distinct consent numbers, 403,117 consented animals and 648,943 m3 of parseable numeric storage volume expire by 2036, based on the live ArcGIS REST layer on 2026-07-08 [ECan dairy-effluent ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/5).
- Canterbury water-take exposure can be counted only as a pasture-irrigation proxy, not a dairy total, because the ECan groundwater and surface-water take layers expose `IrrigationOf = Pasture` but not a dairy land-use classifier in the public fields inspected on 2026-07-08 [ECan groundwater ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/4), [ECan surface-water ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/14).
- Using that Canterbury pasture proxy, 1,102 distinct water-take consent numbers, 2.524 billion m3 of annual or estimated allocation, and 601,653 ha of irrigated area expire by 2031; 3,075 distinct consent numbers, 5.238 billion m3 and 1.238 million ha expire by 2036, but these are feature-layer sums and may double-count multi-point consents [ECan groundwater ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/4), [ECan surface-water ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/14).
- Waikato's layer is the cleanest dairy water denominator found: records where `PRIMARYINDUSTRYPURPOSE` or `SECONDARYINDUSTRYPURPOSE` contains dairy show 2,374 distinct IRIS IDs, 211.9 million m3/year of net annual derived allocation and 25,495 ha of proposed irrigated area expiring by 2031; 2,495 distinct IRIS IDs, 235.1 million m3/year and 29,244 ha expire by 2036 [Waikato ArcGIS seasonal allocation layer](https://services.arcgis.com/2bzQ0Ix3iO7MItUa/arcgis/rest/services/WDP_ALLOC_IRIS_WATER_TAKE_SEASONAL/FeatureServer/0).

**Overall confidence:** Medium - the Canterbury and Waikato computations are reproducible from official live ArcGIS layers, but Canterbury water-take is only a pasture proxy, row-level sums can overstate consent-level totals, and four target regions still need field-level cleaning before they can be joined.

## Evidence

### Scope and method

This finding answers issue #863 by testing whether public regional layers can produce a denominator for dairy-related consent exposure by 31 December 2031 and 31 December 2036, using data.govt.nz CKAN metadata through the vendored `data-govt-nz` skill and direct ArcGIS REST JSON queries to the official regional layers on 2026-07-08 [data.govt.nz API source for ECan groundwater](https://catalogue.data.govt.nz/api/3/action/package_show?id=groundwater-take-active-consented-activities6), [data.govt.nz API source for Waikato](https://catalogue.data.govt.nz/api/3/action/package_show?id=allocated-water-take-seasonal-water-allocation). The calculation counted both feature rows and distinct consent identifiers because ECan's own layer notes say more than one location point may be associated with a single consent [data.govt.nz ECan groundwater notes](https://catalogue.data.govt.nz/dataset/groundwater-take-active-consented-activities6).

The output does not publish consent-holder names, coordinates, farm identifiers or individual consent records; it reports aggregated counts and summed fields from public layers only [ECan dairy-effluent ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/5), [Waikato ArcGIS seasonal allocation layer](https://services.arcgis.com/2bzQ0Ix3iO7MItUa/arcgis/rest/services/WDP_ALLOC_IRIS_WATER_TAKE_SEASONAL/FeatureServer/0).

### Canterbury: dairy effluent is explicit, water take is a pasture proxy

ECan's dairy-effluent layer is explicitly about storage and discharge of dairy effluent to water or land, and its public fields include `Expires`, `ConsentedAnimalNumbers`, `ActualAnimalNumbers` and `StorageVolume_m3` [data.govt.nz ECan dairy effluent](https://catalogue.data.govt.nz/dataset/effluent-dairy-discharge-active-consented-activities3), [ECan dairy-effluent ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/5). The live layer contained 1,366 feature rows and 976 distinct consent numbers on 2026-07-08; 264 rows / 200 distinct consent numbers expired by 2031 and 461 rows / 371 distinct consent numbers expired by 2036 [ECan dairy-effluent ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/5). Because `StorageVolume_m3` is exposed as a string field and includes `d`-suffixed values such as `12d`, `50d` and `120d`, the storage totals below sum only parseable numeric values and exclude those ambiguous entries: 24 rows in the full layer, 5 rows in the 2031 subset and 13 rows in the 2036 subset [ECan dairy-effluent ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/5).

| Canterbury dairy-effluent layer | Feature rows | Distinct consent numbers | Consented animals | Actual animals | Storage volume (m3) |
|---|---:|---:|---:|---:|---:|
| All active layer rows | 1,366 | 976 | 1,238,323 | 760,145 | 4,674,885 |
| Expiring by 2031 | 264 | 200 | 218,786 | 138,343 | 401,789 |
| Expiring by 2036 | 461 | 371 | 403,117 | 240,198 | 648,943 |

ECan's groundwater-take and surface-water-take layers include expiry, rate, volume and irrigation fields, but the public purpose values inspected distinguish `Pasture`, `Cropping`, `Vineyard`, `Market Garden` and similar uses rather than dairy specifically [ECan groundwater ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/4), [ECan surface-water ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/14). Treating `IrrigationOf = Pasture` as a dairy-adjacent upper-bound proxy, rather than as a dairy total, produces these expiry sums from the live layers on 2026-07-08 [ECan groundwater ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/4), [ECan surface-water ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/14):

| Canterbury pasture water-take proxy | Feature rows | Distinct consent numbers | Annual/estimated allocation (m3/year) | Max rate sum | Max volume sum (m3) | Irrigation area (ha) |
|---|---:|---:|---:|---:|---:|---:|
| Groundwater pasture, expiring by 2031 | 1,496 | 814 | 701,529,817 | 114,205.5 | 70,515,489 | 219,125 |
| Surface-water pasture, expiring by 2031 | 624 | 295 | 1,822,437,805 | 197,138.2 | 25,083,005 | 382,528 |
| Combined pasture proxy, expiring by 2031 | 2,120 | 1,102 | 2,523,967,622 | 311,343.7 | 95,598,494 | 601,653 |
| Groundwater pasture, expiring by 2036 | 4,389 | 2,482 | 2,160,037,004 | 335,328.9 | 214,639,244 | 645,724 |
| Surface-water pasture, expiring by 2036 | 1,241 | 604 | 3,077,535,434 | 345,063.0 | 100,650,087 | 591,874 |
| Combined pasture proxy, expiring by 2036 | 5,630 | 3,075 | 5,237,572,438 | 680,391.9 | 315,289,331 | 1,237,598 |

The Canterbury production proxy cannot be linked to those consent rows from the public fields alone, but DairyNZ/LIC reports North Canterbury at 877 herds, 698,455 cows and 325.178 million kg milksolids, and South Canterbury at 307 herds, 242,128 cows and 108.996 million kg milksolids in 2024/25 [DairyNZ/LIC NZ Dairy Statistics 2024/25, tables 3.1 and 3.2](https://www.dairynz.co.nz/media/oglesqfm/nz-dairy-statistics-24-25.pdf). Combining those two DairyNZ/LIC regions gives a coarse Canterbury dairy proxy of 1,184 herds, 940,583 cows and 434.175 million kg milksolids, but it is a regional production context rather than a consent-linked production estimate [DairyNZ/LIC NZ Dairy Statistics 2024/25, tables 3.1 and 3.2](https://www.dairynz.co.nz/media/oglesqfm/nz-dairy-statistics-24-25.pdf).

### Waikato: explicit dairy-purpose water allocation can be counted

The Waikato seasonal allocation layer includes `EXPIRYDATE`, primary and secondary industry-purpose fields, water-use fields, maximum annual/daily/rate fields, proposed irrigated area and dairy-shed adjustment fields [data.govt.nz Waikato allocation](https://catalogue.data.govt.nz/dataset/allocated-water-take-seasonal-water-allocation), [Waikato ArcGIS seasonal allocation layer](https://services.arcgis.com/2bzQ0Ix3iO7MItUa/arcgis/rest/services/WDP_ALLOC_IRIS_WATER_TAKE_SEASONAL/FeatureServer/0). Filtering rows where `PRIMARYINDUSTRYPURPOSE` or `SECONDARYINDUSTRYPURPOSE` contains "dairy" produced 3,648 feature rows and 2,847 distinct IRIS IDs on 2026-07-08 [Waikato ArcGIS seasonal allocation layer](https://services.arcgis.com/2bzQ0Ix3iO7MItUa/arcgis/rest/services/WDP_ALLOC_IRIS_WATER_TAKE_SEASONAL/FeatureServer/0).

| Waikato dairy-purpose allocation | Feature rows | Distinct IRIS IDs | Net annual derived allocation (m3/year) | Net daily derived allocation (m3/day) | Net rate (m3/s) | Proposed irrigated area (ha) |
|---|---:|---:|---:|---:|---:|---:|
| All dairy-purpose layer rows | 3,648 | 2,847 | 280,855,307 | 2,012,088 | 27.8635 | 33,014 |
| Expiring by 2031 | 3,047 | 2,374 | 211,920,324 | 1,565,329 | 20.5168 | 25,495 |
| Expiring by 2036 | 3,185 | 2,495 | 235,126,489 | 1,720,840 | 22.6626 | 29,244 |

The Waikato production context is large but not consent-row-linked: DairyNZ/LIC reports Waikato at 3,029 herds, 1,084,686 cows and 429.057 million kg milksolids in 2024/25 [DairyNZ/LIC NZ Dairy Statistics 2024/25, tables 3.1 and 3.2](https://www.dairynz.co.nz/media/oglesqfm/nz-dairy-statistics-24-25.pdf).

### The other four starting regions are findable, but not yet comparable

Southland has a current resource-consents layer updated overnight from IRIS, with public fields including `IRISID`, `Type`, `Subtype`, `Details`, `StartDate`, `ExpiryDate`, `Primary_` and `Status`, so it is a plausible next layer for text-classifying water takes and dairy discharges but not a ready volume denominator [data.govt.nz Southland consents](https://catalogue.data.govt.nz/dataset/southland-current-resource-consents3), [Environment Southland ArcGIS consents layer](https://maps.es.govt.nz/server/rest/services/Public/Consents/MapServer/2). DairyNZ/LIC reports Southland at 983 herds, 601,434 cows and 273.027 million kg milksolids in 2024/25, which supplies a regional production context but not a consent-level join [DairyNZ/LIC NZ Dairy Statistics 2024/25, tables 3.1 and 3.2](https://www.dairynz.co.nz/media/oglesqfm/nz-dairy-statistics-24-25.pdf).

Bay of Plenty has BOPRC resource-consent layers on data.govt.nz, including a dataset described as all current, expired and lapsed consents with point locations, but the layer metadata found during this pass did not expose a clean water-volume and dairy-purpose schema comparable to Waikato's seasonal allocation service [data.govt.nz BOPRC consents](https://catalogue.data.govt.nz/dataset/resource-consents12). DairyNZ/LIC reports Bay of Plenty at 447 herds, 164,528 cows and 61.431 million kg milksolids in 2024/25 [DairyNZ/LIC NZ Dairy Statistics 2024/25, tables 3.1 and 3.2](https://www.dairynz.co.nz/media/oglesqfm/nz-dairy-statistics-24-25.pdf).

Otago has an ORC resource-consents layer updated nightly from its consent-management system, and the public fields inspected include `ConsentNumber`, `ConsentType`, `ConsentStatus`, `ConsentExpiryDate` and `PurposeActivity`, which can support text mining for dairy/water terms but does not by itself provide a normalised allocation-volume table [data.govt.nz Otago consents](https://catalogue.data.govt.nz/dataset/orc-resource-consents26), [ORC ArcGIS consents layer](https://services6.arcgis.com/ALxeDxaeNjQo1Mf0/arcgis/rest/services/ORC_Resource_Consents/FeatureServer). DairyNZ/LIC reports Otago at 433 herds, 265,647 cows and 114.455 million kg milksolids in 2024/25 [DairyNZ/LIC NZ Dairy Statistics 2024/25, tables 3.1 and 3.2](https://www.dairynz.co.nz/media/oglesqfm/nz-dairy-statistics-24-25.pdf).

Northland has point, line and polygon resource-consent layers on data.govt.nz, and the point layer exposes activity type, activity subtype and current status, but the fields inspected on the point layer did not expose expiry date, allocation volume or dairy-specific purpose [data.govt.nz Northland point consents](https://catalogue.data.govt.nz/dataset/resource-consents-point4), [Northland point consents ArcGIS layer](https://services2.arcgis.com/J8errK5dyxu7Xjf7/arcgis/rest/services/Resource_Consents_/FeatureServer/0). DairyNZ/LIC reports Northland at 667 herds, 225,881 cows and 77.038 million kg milksolids in 2024/25 [DairyNZ/LIC NZ Dairy Statistics 2024/25, tables 3.1 and 3.2](https://www.dairynz.co.nz/media/oglesqfm/nz-dairy-statistics-24-25.pdf).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| A six-region dairy-specific denominator is not directly computable from the public layers found because schemas vary by council and not all expose dairy classifiers, expiry and volume together. | [data.govt.nz Waikato allocation](https://catalogue.data.govt.nz/dataset/allocated-water-take-seasonal-water-allocation) | [data.govt.nz Northland point consents](https://catalogue.data.govt.nz/dataset/resource-consents-point4) | Medium |
| Canterbury water-take totals should be treated as a pasture proxy rather than a dairy total. | [ECan groundwater ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/4) | [ECan surface-water ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/14) | Medium |
| Waikato is currently the best public water-allocation denominator among the starting regions because it combines expiry date, volume/rate fields and explicit dairy industry-purpose fields. | [data.govt.nz Waikato allocation](https://catalogue.data.govt.nz/dataset/allocated-water-take-seasonal-water-allocation) | [Waikato ArcGIS seasonal allocation layer](https://services.arcgis.com/2bzQ0Ix3iO7MItUa/arcgis/rest/services/WDP_ALLOC_IRIS_WATER_TAKE_SEASONAL/FeatureServer/0) | High |
| The computed Canterbury and Waikato exposure should not be described as production-at-risk, because DairyNZ/LIC publishes regional production totals rather than consent-row production joins. | [DairyNZ/LIC NZ Dairy Statistics 2024/25](https://www.dairynz.co.nz/media/oglesqfm/nz-dairy-statistics-24-25.pdf) | [ECan dairy-effluent ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/5) | High |

## What would change this conclusion

- A council-published or LAWA/EMAR-style national table joining consent ID, expiry date, water-allocation volume/rate, discharge/nutrient fields, use purpose, land use and dairy production proxy would change the conclusion from "partial regional denominator" to "national denominator" [data.govt.nz Waikato allocation](https://catalogue.data.govt.nz/dataset/allocated-water-take-seasonal-water-allocation).
- A public Canterbury join between ECan water-take consent IDs and dairy-effluent, parcel land-use, Agribase-like farm class, irrigation-scheme membership or processor production would replace the broad `Pasture` proxy with a dairy-specific estimate [data.govt.nz ECan groundwater](https://catalogue.data.govt.nz/dataset/groundwater-take-active-consented-activities6), [data.govt.nz ECan dairy effluent](https://catalogue.data.govt.nz/dataset/effluent-dairy-discharge-active-consented-activities3).
- Field-level interpretation from regional council consent officers would materially improve confidence because the public services use different identifiers, date semantics, point/area geometry choices, and volume fields across councils [data.govt.nz Southland consents](https://catalogue.data.govt.nz/dataset/southland-current-resource-consents3), [data.govt.nz Otago consents](https://catalogue.data.govt.nz/dataset/orc-resource-consents26).
- I could not verify farm-level or processor-level milk production linked to consent IDs, consent renewal outcomes, consent-condition tightening, actual annual water use, whether ECan `StorageVolume_m3` values with a `d` suffix encode another unit or notation, or whether feature-row volume sums should be de-duplicated by consent, take point or allocation component for each council [ECan dairy-effluent ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/5), [ECan groundwater ArcGIS layer](https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/4), [Waikato ArcGIS seasonal allocation layer](https://services.arcgis.com/2bzQ0Ix3iO7MItUa/arcgis/rest/services/WDP_ALLOC_IRIS_WATER_TAKE_SEASONAL/FeatureServer/0).

## Open follow-up questions

- Can Southland's `Type`, `Subtype`, `Details`, `Primary_`, `ExpiryDate` and `Status` fields be reliably classified into dairy water-take, dairy effluent and non-dairy categories without exposing consent-holder details [Environment Southland ArcGIS consents layer](https://maps.es.govt.nz/server/rest/services/Public/Consents/MapServer/2)?
- Can ORC's `PurposeActivity` text and `ConsentExpiryDate` be joined to water-allocation or irrigated-area fields, or does Otago require a separate LGOIMA/data request for allocation volumes [data.govt.nz Otago irrigated areas](https://catalogue.data.govt.nz/dataset/otago-irrigated-areas1), [data.govt.nz Otago consents](https://catalogue.data.govt.nz/dataset/orc-resource-consents26)?
- Is there a maintained BOPRC current-consent service with expiry, activity purpose and allocation-volume fields behind the public viewer, and can it distinguish dairy farm water take from other agricultural takes [data.govt.nz BOPRC consents](https://catalogue.data.govt.nz/dataset/resource-consents12)?
- Do Northland's line or polygon consent layers expose expiry and volume fields absent from the point layer inspected here [data.govt.nz Northland line consents](https://catalogue.data.govt.nz/dataset/resource-consents-line4), [data.govt.nz Northland polygon consents](https://catalogue.data.govt.nz/dataset/resource-consents-polygon4)?

## Sources

1. data.govt.nz, *Groundwater Take (Active) - Consented Activities*, accessed 2026-07-08 - https://catalogue.data.govt.nz/dataset/groundwater-take-active-consented-activities6
2. Environment Canterbury ArcGIS REST, *Consented Activities - Groundwater Take (Active)*, accessed 2026-07-08 - https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/4
3. data.govt.nz, *Surface Water Take (Active) - Consented Activities*, accessed 2026-07-08 - https://catalogue.data.govt.nz/dataset/surface-water-take-active-consented-activities3
4. Environment Canterbury ArcGIS REST, *Consented Activities - Surface Water Take (Active)*, accessed 2026-07-08 - https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/14
5. data.govt.nz, *Effluent Dairy Discharge (Active) - Consented Activities*, accessed 2026-07-08 - https://catalogue.data.govt.nz/dataset/effluent-dairy-discharge-active-consented-activities3
6. Environment Canterbury ArcGIS REST, *Consented Activities - Effluent Dairy Discharge (Active)*, accessed 2026-07-08 - https://gis.ecan.govt.nz/arcgis/rest/services/Public/Resource_Consents_Active/MapServer/5
7. data.govt.nz, *Allocated Water Take - Seasonal Water Allocation*, accessed 2026-07-08 - https://catalogue.data.govt.nz/dataset/allocated-water-take-seasonal-water-allocation
8. Waikato Regional Council / Co-Lab ArcGIS REST, *ALLOC_IRIS_WATER_TAKE_SEASONAL*, accessed 2026-07-08 - https://services.arcgis.com/2bzQ0Ix3iO7MItUa/arcgis/rest/services/WDP_ALLOC_IRIS_WATER_TAKE_SEASONAL/FeatureServer/0
9. data.govt.nz, *Southland Current Resource Consents*, accessed 2026-07-08 - https://catalogue.data.govt.nz/dataset/southland-current-resource-consents3
10. Environment Southland ArcGIS REST, *Current Resource Consents*, accessed 2026-07-08 - https://maps.es.govt.nz/server/rest/services/Public/Consents/MapServer/2
11. data.govt.nz, *Resource Consents* (Bay of Plenty Regional Council), accessed 2026-07-08 - https://catalogue.data.govt.nz/dataset/resource-consents12
12. data.govt.nz, *ORC Resource Consents*, accessed 2026-07-08 - https://catalogue.data.govt.nz/dataset/orc-resource-consents26
13. Otago Regional Council ArcGIS REST, *ORC Resource Consents*, accessed 2026-07-08 - https://services6.arcgis.com/ALxeDxaeNjQo1Mf0/arcgis/rest/services/ORC_Resource_Consents/FeatureServer
14. data.govt.nz, *Resource Consents (Point)* (Northland Regional Council), accessed 2026-07-08 - https://catalogue.data.govt.nz/dataset/resource-consents-point4
15. Northland Regional Council ArcGIS REST, *Resource Consents (Point)*, accessed 2026-07-08 - https://services2.arcgis.com/J8errK5dyxu7Xjf7/arcgis/rest/services/Resource_Consents_/FeatureServer/0
16. data.govt.nz, *Resource Consents (Line)* (Northland Regional Council), accessed 2026-07-08 - https://catalogue.data.govt.nz/dataset/resource-consents-line4
17. data.govt.nz, *Resource Consents (Polygon)* (Northland Regional Council), accessed 2026-07-08 - https://catalogue.data.govt.nz/dataset/resource-consents-polygon4
18. data.govt.nz, *Otago Irrigated Areas*, accessed 2026-07-08 - https://catalogue.data.govt.nz/dataset/otago-irrigated-areas1
19. DairyNZ and LIC, *New Zealand Dairy Statistics 2024/25*, accessed 2026-07-08 - https://www.dairynz.co.nz/media/oglesqfm/nz-dairy-statistics-24-25.pdf
