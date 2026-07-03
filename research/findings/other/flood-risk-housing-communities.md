---
title: "NZ flood-exposed housing is regionally concentrated, but a public NZDep2023 decile-by-housing overlay is not yet available"
domain: "other"
issue: "#263"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-03"
status: "draft"
---

# NZ flood-exposed housing is regionally concentrated, but a public NZDep2023 decile-by-housing overlay is not yet available

## Executive answer

- The strongest public national answer is regional, not SA1-decile-level: Earth Sciences NZ's public 1% AEP rainfall-flood exposure layer reports 754,000 people and $235 billion of buildings exposed under the current climate, increasing to 902,000 people and $288 billion of buildings under +3 degrees warming. [Earth Sciences NZ, 2025](https://www.earthsciences.nz/news/nationwide-study-reveals-escalating-flood-risk); [Earth Sciences NZ ArcGIS feature layer, accessed 3 July 2026](https://services3.arcgis.com/fp1tibNcN9mbExhG/arcgis/rest/services/Aotearoa_New_Zealand_Regional_Flood_Exposure_View/FeatureServer/1/query?f=json&where=OBJECTID%3E0&outFields=REGC2025_V1_00_NAME%2Cpopn_0c%2Cpopn_3c%2Cbuildings_0c%2Cbuildings_3c&returnGeometry=false)
- By exposed population count in the current-climate 1% AEP rainfall-flood layer, Auckland, Canterbury, Wellington, Waikato, and Bay of Plenty are the largest exposed regions; by approximate exposed share of 2025 regional population, West Coast is clearly highest, followed by Nelson, Hawke's Bay, Marlborough, and Canterbury/Gisborne at roughly one-fifth of regional population. [Earth Sciences NZ ArcGIS feature layer, accessed 3 July 2026](https://services3.arcgis.com/fp1tibNcN9mbExhG/arcgis/rest/services/Aotearoa_New_Zealand_Regional_Flood_Exposure_View/FeatureServer/1/query?f=json&where=OBJECTID%3E0&outFields=REGC2025_V1_00_NAME%2Cpopn_0c%2Cpopn_3c%2Cbuildings_0c%2Cbuildings_3c&returnGeometry=false); [Stats NZ regional population summaries, accessed 3 July 2026](https://tools.summaries.stats.govt.nz/places/RC/west-coast-region)
- By residential properties located inside existing coastal inundation and inland flood zones as of 2023, Climate Sigma/MfE reports the largest regional counts in Canterbury, Wellington, Auckland, Otago, and Bay of Plenty. [Climate Sigma report for MfE, 2025, Table 13](https://www.environment.govt.nz/assets/publications/5.-CLIMATE-SIGMA-FINAL-REPORT_16-JAN-2025.pdf)
- The clearest deprivation overlay found is older and narrower: a DIA/Tonkin+Taylor/NIWA 2022 analysis used NZDep2018 decile 10 areas and identified 44 vulnerable communities exposed to flood hazard, with clusters in Northland/Hokianga, Tairawhiti/East Cape, Waikato, and Bay of Plenty. [DIA, 2022](https://www.dia.govt.nz/diawebsite.nsf/Files/Proactive-releases/%24file/Vulnerable-Communities-Exposed-to-Flood-Hazard-August-2022.pdf)
- I did not find a public national table ranking all NZDep2023 deciles by flood-exposed residential dwellings or people; MfE says a first public generation of the New Zealand Flood Map is expected by May 2027, and current national flood information remains fragmented across councils and models. [MfE New Zealand Flood Map, 29 May 2026](https://environment.govt.nz/what-government-is-doing/areas-of-work/climate-change/adapting-to-climate-change/national-adaptation-framework/new-zealand-flood-map/)

**Overall confidence:** Medium - regional exposure and the decile-10 vulnerable-community list are supported by official or quasi-official aggregate sources, but the exact question asks for a current NZDep2023 all-decile housing overlay that I could not verify as publicly available.

## Evidence

### Scope and method

This finding answers the issue at aggregate regional/community level and does not publish address-level, parcel-level, or individual-property outputs. [Issue #263](https://github.com/thecolab-ai/the-for-good-project/issues/263)

I treated "flood-exposed housing" as two related but non-identical measures because the public sources use different units: Earth Sciences NZ reports exposed people and building value under national 1% AEP rainfall-flood modelling, while the Climate Sigma/MfE report counts residential properties located in coastal inundation and inland flood zones. [Earth Sciences NZ, 2025](https://www.earthsciences.nz/news/nationwide-study-reveals-escalating-flood-risk); [Climate Sigma report for MfE, 2025, Table 13](https://www.environment.govt.nz/assets/publications/5.-CLIMATE-SIGMA-FINAL-REPORT_16-JAN-2025.pdf)

For approximate regional exposure shares, I divided Earth Sciences NZ current-climate exposed population by Stats NZ 2025 regional estimated resident population; this is a practical ranking aid, not an official Earth Sciences NZ percentage table, because the numerator and denominator are from different published sources and may use different reference dates. [Earth Sciences NZ ArcGIS feature layer, accessed 3 July 2026](https://services3.arcgis.com/fp1tibNcN9mbExhG/arcgis/rest/services/Aotearoa_New_Zealand_Regional_Flood_Exposure_View/FeatureServer/1/query?f=json&where=OBJECTID%3E0&outFields=REGC2025_V1_00_NAME%2Cpopn_0c%2Cpopn_3c%2Cbuildings_0c%2Cbuildings_3c&returnGeometry=false); [Stats NZ regional population summaries, accessed 3 July 2026](https://tools.summaries.stats.govt.nz/places/RC/auckland-region)

NZDep2023 is an area-level deprivation index for SA1 areas; decile 1 represents the least deprived areas and decile 10 the most deprived areas, and NZDep should not be interpreted as an individual household's deprivation. [EHINZ socioeconomic deprivation profile, accessed 3 July 2026](https://ehinz.ac.nz/indicators/population-vulnerability/socioeconomic-deprivation-profile/)

The vendored `deprivation-nz` skill reports 32,746 SA1 areas in NZDep2023, with each decile containing about 9.7-10.0% of SA1 areas; that confirms deciles are national relative bands, not direct flood-exposure bands. [NZDep2023 ArcGIS service metadata, accessed 3 July 2026](https://www.arcgis.com/home/item.html?id=d0caefba5f8f42d6918fc52faacec00b); [deprivation-nz skill](https://github.com/thecolab-ai/.skills/tree/main/skills/deprivation-nz)

### Regions with the most exposed people

Earth Sciences NZ's regional feature layer reports the following current-climate 1% AEP rainfall-flood exposure counts, without geometry in this extract. [Earth Sciences NZ ArcGIS feature layer, accessed 3 July 2026](https://services3.arcgis.com/fp1tibNcN9mbExhG/arcgis/rest/services/Aotearoa_New_Zealand_Regional_Flood_Exposure_View/FeatureServer/1/query?f=json&where=OBJECTID%3E0&outFields=REGC2025_V1_00_NAME%2Cpopn_0c%2Cpopn_3c%2Cbuildings_0c%2Cbuildings_3c&returnGeometry=false)

| Rank by exposed people | Region | Exposed people, current climate | Exposed people, +3C warming | Exposed building value, current climate | Confidence |
|---:|---|---:|---:|---:|---|
| 1 | Auckland | 183,000 | 205,000 | $42.5b | High |
| 2 | Canterbury | 140,000 | 165,000 | $50.3b | High |
| 3 | Wellington | 90,400 | 102,600 | $27.0b | High |
| 4 | Waikato | 63,200 | 75,500 | $20.3b | High |
| 5 | Bay of Plenty | 62,900 | 72,500 | $18.8b | High |
| 6 | Hawke's Bay | 38,700 | 63,200 | $11.6b | High |
| 7 | Otago | 38,600 | 42,600 | $14.0b | High |
| 8 | Manawatu-Whanganui | 31,400 | 49,200 | $11.0b | High |
| 9 | Northland | 24,500 | 28,700 | $8.7b | High |
| 10 | Southland | 14,700 | 17,700 | $6.7b | High |

This absolute-count ranking is driven partly by regional population size, so it should not be read as the same thing as concentration or social vulnerability. [Stats NZ regional population summaries, accessed 3 July 2026](https://tools.summaries.stats.govt.nz/places/RC/auckland-region)

### Regions with the highest exposed population share

Earth Sciences NZ's media release says regional exposure ranges from 8% of people in Taranaki to 34% on the West Coast under the current climate, which independently supports West Coast as the highest-share region and Taranaki as the lowest-share region. [Earth Sciences NZ, 2025](https://www.earthsciences.nz/news/nationwide-study-reveals-escalating-flood-risk); [University of Waikato, 2025](https://www.waikato.ac.nz/int/news-events/news/nationwide-study-reveals-escalating-flood-risk/)

Using the feature-layer exposed-population numerator and Stats NZ 2025 regional population denominator, the approximate highest-share regions are: West Coast at about 33%, Nelson at about 23%, Hawke's Bay at about 22%, Marlborough at about 20%, Canterbury at about 20%, and Gisborne at about 20%. [Earth Sciences NZ ArcGIS feature layer, accessed 3 July 2026](https://services3.arcgis.com/fp1tibNcN9mbExhG/arcgis/rest/services/Aotearoa_New_Zealand_Regional_Flood_Exposure_View/FeatureServer/1/query?f=json&where=OBJECTID%3E0&outFields=REGC2025_V1_00_NAME%2Cpopn_0c%2Cpopn_3c%2Cbuildings_0c%2Cbuildings_3c&returnGeometry=false); [Stats NZ West Coast population summary, accessed 3 July 2026](https://tools.summaries.stats.govt.nz/places/RC/west-coast-region); [Stats NZ Nelson population summary, accessed 3 July 2026](https://tools.summaries.stats.govt.nz/places/RC/nelson-region); [Stats NZ Hawke's Bay population summary, accessed 3 July 2026](https://tools.summaries.stats.govt.nz/places/RC/hawkes-bay-region); [Stats NZ Marlborough population summary, accessed 3 July 2026](https://tools.summaries.stats.govt.nz/places/RC/marlborough-region); [Stats NZ Canterbury population summary, accessed 3 July 2026](https://tools.summaries.stats.govt.nz/places/RC/canterbury-region); [Stats NZ Gisborne population summary, accessed 3 July 2026](https://tools.summaries.stats.govt.nz/places/RC/gisborne-region)

This concentration ranking is more relevant to "which regions are most exposed" than the absolute-count ranking, but it still does not identify which households are owner-occupiers, renters, recent buyers, insured, underinsured, or able to absorb retreat/repair costs. [Issue #263](https://github.com/thecolab-ai/the-for-good-project/issues/263)

### Residential properties in existing flood and inundation zones

Climate Sigma's report for MfE gives a housing-specific national exposure table: as of 2023, 218,600 residential properties with $179.3 billion of property value were located within existing coastal inundation and inland flood zones. [Climate Sigma report for MfE, 2025, Table 13](https://www.environment.govt.nz/assets/publications/5.-CLIMATE-SIGMA-FINAL-REPORT_16-JAN-2025.pdf)

The same Table 13 reports the largest regional counts of residential properties in those zones in Canterbury (62,100), Wellington (33,200), Auckland (30,600), Otago (15,900), Bay of Plenty (13,900), Waikato (9,000), Northland (8,600), Manawatu-Whanganui (7,700), Hawke's Bay (7,400), and Tasman (7,400). [Climate Sigma report for MfE, 2025, Table 13](https://www.environment.govt.nz/assets/publications/5.-CLIMATE-SIGMA-FINAL-REPORT_16-JAN-2025.pdf)

Climate Sigma cautions that its report is a preliminary national overview with regional snapshots, that further modelling is required to resolve data limitations, and that about 90% of residential properties are covered by LiDAR while the remaining properties are predominantly rural areas without existing inundation or flood maps. [Climate Sigma report for MfE, 2025, Executive Summary](https://www.environment.govt.nz/assets/publications/5.-CLIMATE-SIGMA-FINAL-REPORT_16-JAN-2025.pdf)

The housing-property counts should not be merged directly with the Earth Sciences NZ rainfall-flood counts because Climate Sigma includes coastal inundation and inland flood zones and reports residential properties, while Earth Sciences NZ's public viewer reports modelled 1% AEP rainfall-flood exposure for people, buildings, roads, stormwater, and electricity assets. [Climate Sigma report for MfE, 2025, Methodology](https://www.environment.govt.nz/assets/publications/5.-CLIMATE-SIGMA-FINAL-REPORT_16-JAN-2025.pdf); [Earth Sciences NZ ArcGIS feature layer, accessed 3 July 2026](https://services3.arcgis.com/fp1tibNcN9mbExhG/arcgis/rest/services/Aotearoa_New_Zealand_Regional_Flood_Exposure_View/FeatureServer/1/query?f=json&where=OBJECTID%3E0&outFields=REGC2025_V1_00_NAME%2Cpopn_0c%2Cpopn_3c%2Cbuildings_0c%2Cbuildings_3c&returnGeometry=false)

### Communities and deprivation deciles

The best public deprivation overlay I found is the 2022 DIA report, which defined vulnerable communities as areas in the bottom 10% of socio-economic vulnerability with significant flood-risk exposure, used NZDep2018 decile 10, and excluded some communities where flood-protection infrastructure was planned or heavily urbanised surface flooding needed more detailed analysis. [DIA, 2022](https://www.dia.govt.nz/diawebsite.nsf/Files/Proactive-releases/%24file/Vulnerable-Communities-Exposed-to-Flood-Hazard-August-2022.pdf)

DIA reports that Tonkin+Taylor combined NIWA surface, river, and coastal flood-hazard modelling with NZDep2018 SA1 vulnerable-community data, used RiskScape and ArcGIS, and had regional-council river managers and flood practitioners contribute qualitative checks. [DIA, 2022](https://www.dia.govt.nz/diawebsite.nsf/Files/Proactive-releases/%24file/Vulnerable-Communities-Exposed-to-Flood-Hazard-August-2022.pdf)

DIA identified 44 communities with high socio-economic vulnerability, greater potential flood hazard exposure, no planned flood-protection infrastructure in scope, and wider-district financial-capacity constraints; its named community table includes Kaitaia, Kerikeri, Hokianga Harbour/Hokianga, Helena Bay, Ruawai, Waiuku, Thames, Huntly, Ngaruawahia, Taupiri, Putaruru, Tokoroa, Te Kuiti, Benneydale/Maniaiti, Turangi, Waihi Beach/Bowentown, Maketu, Te Puke, Opotiki, Rotorua, Lake Okareka, Tikitiki, Ruatoria, Tuparoa, Whareponga, Waipiro Bay, Tokomaru Bay, Tolaga Bay/Hauiti, Te Karaka, Gisborne, Waitara, New Plymouth, Whanganui, Otaki/Otaki Beach, Kapiti Coast, Masterton, Nelson, Hector, Granity, Westport, Kairaki Beach, South Dunedin, Mosgiel, and Balclutha. [DIA, 2022, Table 1](https://www.dia.govt.nz/diawebsite.nsf/Files/Proactive-releases/%24file/Vulnerable-Communities-Exposed-to-Flood-Hazard-August-2022.pdf)

DIA's regional cluster finding is that Northland, especially Hokianga, Tairawhiti/East Cape, Waikato, and Bay of Plenty had clusters of vulnerable communities exposed to flood hazard, and that more than half of the listed vulnerable communities were in the upper half of the North Island. [DIA, 2022](https://www.dia.govt.nz/diawebsite.nsf/Files/Proactive-releases/%24file/Vulnerable-Communities-Exposed-to-Flood-Hazard-August-2022.pdf)

DIA's territorial-authority finding is that South Waikato, Waitomo, Buller, Gisborne, Opotiki, Rotorua, and Far North had significant proportions of their populations in vulnerable communities potentially exposed to flood hazard. [DIA, 2022](https://www.dia.govt.nz/diawebsite.nsf/Files/Proactive-releases/%24file/Vulnerable-Communities-Exposed-to-Flood-Hazard-August-2022.pdf)

This finding supports a decile-10 risk flag, but it does not prove that NZDep2023 decile 10 is nationally the highest flood-exposed housing decile, because the DIA report used NZDep2018, only selected decile-10 communities, excluded some places, and did not publish an all-decile denominator table. [DIA, 2022](https://www.dia.govt.nz/diawebsite.nsf/Files/Proactive-releases/%24file/Vulnerable-Communities-Exposed-to-Flood-Hazard-August-2022.pdf); [EHINZ socioeconomic deprivation profile, accessed 3 July 2026](https://ehinz.ac.nz/indicators/population-vulnerability/socioeconomic-deprivation-profile/)

### Why the full NZDep2023 overlay is not yet public

MfE says flood-hazard information is fragmented across New Zealand because councils and organisations use different models, methods, and maps, and it says there is currently no single public map that brings this information together clearly and consistently. [MfE New Zealand Flood Map, 29 May 2026](https://environment.govt.nz/what-government-is-doing/areas-of-work/climate-change/adapting-to-climate-change/national-adaptation-framework/new-zealand-flood-map/)

MfE says the New Zealand Flood Map will first bring existing council flood information into a national technical-user view by the end of 2026, and the first public generation is expected by May 2027 with combined local data and new national modelling. [MfE New Zealand Flood Map, 29 May 2026](https://environment.govt.nz/what-government-is-doing/areas-of-work/climate-change/adapting-to-climate-change/national-adaptation-framework/new-zealand-flood-map/)

LINZ Data Service search results for "flood hazard" exposed flood aerial imagery, post-event flood-area, LiDAR, and elevation records, but did not expose a single national flood-hazard polygon layer already joined to NZDep2023 or residential housing counts. [LINZ Data Service search API, accessed 3 July 2026](https://data.linz.govt.nz/services/api/v1/layers/?q=flood+hazard)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Regional flood exposure is highly uneven, with West Coast the highest-share region and Taranaki the lowest-share region under current climate. | [Earth Sciences NZ reports 8% in Taranaki and 34% on the West Coast](https://www.earthsciences.nz/news/nationwide-study-reveals-escalating-flood-risk) | [University of Waikato republishes the same research team's regional range](https://www.waikato.ac.nz/int/news-events/news/nationwide-study-reveals-escalating-flood-risk/) | High for the range; Medium for exact share calculations |
| The best public deprivation overlay identifies decile-10 vulnerable communities, not all NZDep2023 deciles. | [DIA 2022 report methodology and results](https://www.dia.govt.nz/diawebsite.nsf/Files/Proactive-releases/%24file/Vulnerable-Communities-Exposed-to-Flood-Hazard-August-2022.pdf) | [EHINZ explains NZDep deciles and NZDep2023 SA1 coverage](https://ehinz.ac.nz/indicators/population-vulnerability/socioeconomic-deprivation-profile/) | Medium |
| A full national public flood map is not yet available, so a reproducible NZDep2023 all-decile flood-housing table should not be asserted as fact. | [MfE says there is currently no single clear and consistent public flood map](https://environment.govt.nz/what-government-is-doing/areas-of-work/climate-change/adapting-to-climate-change/national-adaptation-framework/new-zealand-flood-map/) | [Climate Sigma report describes preliminary national overview and data limitations](https://www.environment.govt.nz/assets/publications/5.-CLIMATE-SIGMA-FINAL-REPORT_16-JAN-2025.pdf) | High |
| Residential property exposure is largest by count in Canterbury, Wellington, and Auckland, but that is not the same as the highest exposed share of a region's housing stock. | [Climate Sigma/MfE Table 13](https://www.environment.govt.nz/assets/publications/5.-CLIMATE-SIGMA-FINAL-REPORT_16-JAN-2025.pdf) | No second source found with the same residential-property regional table; treat ranking as single-source official-model evidence. | Medium |

## What would change this conclusion

- A public SA1-level or suitably aggregated table joining NZDep2023 deciles, residential dwelling counts, and a consistent national 1% AEP flood-hazard layer would change the main conclusion from "decile-10 risk flag only" to a direct all-decile ranking. [MfE New Zealand Flood Map, 29 May 2026](https://environment.govt.nz/what-government-is-doing/areas-of-work/climate-change/adapting-to-climate-change/national-adaptation-framework/new-zealand-flood-map/)
- Access to the underlying Earth Sciences NZ or MfE flood-exposure data at SA1/SA2 level, aggregated before publication and screened for privacy, would allow a stronger answer about communities and deprivation deciles without publishing property-level information. [Earth Sciences NZ ArcGIS feature layer, accessed 3 July 2026](https://services3.arcgis.com/fp1tibNcN9mbExhG/arcgis/rest/services/Aotearoa_New_Zealand_Regional_Flood_Exposure_View/FeatureServer/1/query?f=json&where=OBJECTID%3E0&outFields=REGC2025_V1_00_NAME%2Cpopn_0c%2Cpopn_3c%2Cbuildings_0c%2Cbuildings_3c&returnGeometry=false); [Issue #263](https://github.com/thecolab-ai/the-for-good-project/issues/263)
- A national housing-denominator table by flood layer and region would change the housing concentration ranking, because the current housing-specific source gives regional counts of residential properties in zones but not each region's percentage of residential properties exposed in the same table. [Climate Sigma report for MfE, 2025, Table 13](https://www.environment.govt.nz/assets/publications/5.-CLIMATE-SIGMA-FINAL-REPORT_16-JAN-2025.pdf)
- Human review with councils, iwi/hapu, emergency-management practitioners, and affected communities is needed before turning the DIA community list into priorities, because the DIA report itself says its analysis was completed quickly and requires further checks for accuracy and completeness. [DIA, 2022](https://www.dia.govt.nz/diawebsite.nsf/Files/Proactive-releases/%24file/Vulnerable-Communities-Exposed-to-Flood-Hazard-August-2022.pdf)
- I could not verify current insurance status, tenure, mortgage status, household income, ethnicity, disability, age, or recent-buyer status for flood-exposed homes; publishing those at small-area level would need ethical review and aggregation rules. [Issue #263](https://github.com/thecolab-ai/the-for-good-project/issues/263)

## Open follow-up questions

- Once the New Zealand Flood Map technical or public release is available, what privacy-preserving aggregation level should be used to publish a NZDep2023 decile-by-flood-exposed-dwelling table without identifying individual properties? [MfE New Zealand Flood Map, 29 May 2026](https://environment.govt.nz/what-government-is-doing/areas-of-work/climate-change/adapting-to-climate-change/national-adaptation-framework/new-zealand-flood-map/)
- Do the DIA 2022 decile-10 vulnerable communities remain decile 10 under NZDep2023, and which have had new flood-protection, buyout, or managed-retreat changes since the DIA analysis? [DIA, 2022](https://www.dia.govt.nz/diawebsite.nsf/Files/Proactive-releases/%24file/Vulnerable-Communities-Exposed-to-Flood-Hazard-August-2022.pdf); [EHINZ socioeconomic deprivation profile, accessed 3 July 2026](https://ehinz.ac.nz/indicators/population-vulnerability/socioeconomic-deprivation-profile/)
- Which flood-exposed regions have the largest overlap with renters, low-equity owners, elderly fixed-income households, and uninsured or underinsured homes? [DIA, 2022](https://www.dia.govt.nz/diawebsite.nsf/Files/Proactive-releases/%24file/Vulnerable-Communities-Exposed-to-Flood-Hazard-August-2022.pdf)

## Sources

1. Earth Sciences New Zealand. "Nationwide study reveals escalating flood risk." Published 30 October 2025, accessed 3 July 2026 by built-in web open and ArcGIS REST inspection. https://www.earthsciences.nz/news/nationwide-study-reveals-escalating-flood-risk
2. Earth Sciences New Zealand / NIWA ArcGIS feature layer. "Aotearoa New Zealand Regional Flood Exposure View", queried with `returnGeometry=false`, accessed 3 July 2026 by `curl`. https://services3.arcgis.com/fp1tibNcN9mbExhG/arcgis/rest/services/Aotearoa_New_Zealand_Regional_Flood_Exposure_View/FeatureServer/1/query?f=json&where=OBJECTID%3E0&outFields=REGC2025_V1_00_NAME%2Cpopn_0c%2Cpopn_3c%2Cbuildings_0c%2Cbuildings_3c&returnGeometry=false
3. Earth Sciences New Zealand / NIWA ArcGIS dashboard. "Flood hazard across Aotearoa New Zealand (1% AEP rainfall events)", accessed 3 July 2026 by ArcGIS REST item inspection. https://www.arcgis.com/apps/dashboards/8c1db2b8e37841f29a57a38675388897
4. University of Waikato. "Nationwide study reveals escalating flood risk." Published 30 October 2025, accessed 3 July 2026 by built-in web search/open. https://www.waikato.ac.nz/int/news-events/news/nationwide-study-reveals-escalating-flood-risk/
5. Ministry for the Environment. "New Zealand Flood Map." Last updated 29 May 2026, accessed 3 July 2026 by built-in web open. https://environment.govt.nz/what-government-is-doing/areas-of-work/climate-change/adapting-to-climate-change/national-adaptation-framework/new-zealand-flood-map/
6. Climate Sigma. "Estimated number and valuation of residential properties within inundation/flood zones impacted by climate change." Report for the Ministry for the Environment, January 2025, accessed 3 July 2026 by built-in PDF open. https://www.environment.govt.nz/assets/publications/5.-CLIMATE-SIGMA-FINAL-REPORT_16-JAN-2025.pdf
7. Department of Internal Affairs. "Report: Vulnerable Communities Exposed to Flood Hazard." August 2022, proactively released, accessed 3 July 2026 by built-in web search/open. https://www.dia.govt.nz/diawebsite.nsf/Files/Proactive-releases/%24file/Vulnerable-Communities-Exposed-to-Flood-Hazard-August-2022.pdf
8. EHINZ / Massey University. "Socioeconomic deprivation profile." Accessed 3 July 2026 by built-in web open. https://ehinz.ac.nz/indicators/population-vulnerability/socioeconomic-deprivation-profile/
9. NZDep2023 ArcGIS item. University of Auckland / Stats NZ public feature service, accessed 3 July 2026 by `curl` and `deprivation-nz` skill. https://www.arcgis.com/home/item.html?id=d0caefba5f8f42d6918fc52faacec00b
10. The Colab `.skills` `deprivation-nz` skill. Accessed 3 July 2026 from vendored submodule. https://github.com/thecolab-ai/.skills/tree/main/skills/deprivation-nz
11. LINZ Data Service search API. Query "flood hazard", accessed 3 July 2026 by `linz-data-service` skill. https://data.linz.govt.nz/services/api/v1/layers/?q=flood+hazard
12. Stats NZ place summaries, regional council estimated resident population at 30 June 2025, accessed 3 July 2026 by `stats-nz` skill. https://tools.summaries.stats.govt.nz/places/RC/auckland-region
13. Stats NZ place summaries, West Coast Region estimated resident population at 30 June 2025, accessed 3 July 2026 by `stats-nz` skill. https://tools.summaries.stats.govt.nz/places/RC/west-coast-region
14. Stats NZ place summaries, Nelson Region estimated resident population at 30 June 2025, accessed 3 July 2026 by `stats-nz` skill. https://tools.summaries.stats.govt.nz/places/RC/nelson-region
15. Stats NZ place summaries, Hawke's Bay Region estimated resident population at 30 June 2025, accessed 3 July 2026 by `stats-nz` skill. https://tools.summaries.stats.govt.nz/places/RC/hawkes-bay-region
16. Stats NZ place summaries, Marlborough Region estimated resident population at 30 June 2025, accessed 3 July 2026 by `stats-nz` skill. https://tools.summaries.stats.govt.nz/places/RC/marlborough-region
17. Stats NZ place summaries, Canterbury Region estimated resident population at 30 June 2025, accessed 3 July 2026 by `stats-nz` skill. https://tools.summaries.stats.govt.nz/places/RC/canterbury-region
18. Stats NZ place summaries, Gisborne Region estimated resident population at 30 June 2025, accessed 3 July 2026 by `stats-nz` skill. https://tools.summaries.stats.govt.nz/places/RC/gisborne-region
19. GitHub issue #263. "research: Identify which communities are most exposed to NZ flood-risk housing." Accessed 3 July 2026 by `gh issue view`. https://github.com/thecolab-ai/the-for-good-project/issues/263
