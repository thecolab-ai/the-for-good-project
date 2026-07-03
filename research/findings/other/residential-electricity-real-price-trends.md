---
title: "Residential electricity prices have only modestly outpaced CPI nationally, with wide regional variation over 5-10 years"
domain: "other"
issue: "#277"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-03"
status: "draft"
---

# Residential electricity prices have only modestly outpaced CPI nationally, with wide regional variation over 5-10 years

## Executive answer

- Nationally, the Stats NZ CPI electricity component rose 39.0% from March 2016 to March 2026 while all-groups CPI rose 36.8%, so electricity was only 1.6% higher in real CPI-adjusted terms over that 10-year window. [Stats NZ CPI index numbers CSV, March 2026 quarter](https://www.stats.govt.nz/assets/Uploads/Consumers-price-index/Consumers-price-index-March-2026-quarter/Download-data/consumers-price-index-march-2026-quarter-index-numbers.csv)
- Over the 5 years from March 2021 to March 2026, the same Stats NZ series rose 28.0% nominally against 25.4% all-groups CPI inflation, a 2.1% real increase. [Stats NZ CPI index numbers CSV, March 2026 quarter](https://www.stats.govt.nz/assets/Uploads/Consumers-price-index/Consumers-price-index-March-2026-quarter/Download-data/consumers-price-index-march-2026-quarter-index-numbers.csv)
- MBIE's sales-based real residential electricity cost series points the other way for the latest complete annual data: real delivered residential costs fell from 37.66c/kWh in the year ended March 2015 to 34.42c/kWh in the year ended March 2025, an 8.6% real fall, and from 35.89c/kWh in 2020 to 34.42c/kWh in 2025, a 4.1% real fall. [Figure.NZ / MBIE real residential electricity costs](https://figure.nz/chart/OQ6DQ4DNmpmBKANn)
- I completed the requested 5-10 year CPI-adjusted regional trend as a proxy from Figure.NZ's downloadable QSDEP table, which uses MBIE's Quarterly Survey of Domestic Electricity Prices (Report 15 May 2026) raw-data source (43 location rows: 42 towns/cities plus a national aggregate). In that data, CPI-adjusted (all-groups, March quarter) median change in retail price was +5.4% from Feb 2016 to Feb 2026 and +6.6% from Feb 2021 to Feb 2026, with a wide spread from -8.8% to +24.5% and -6.4% to +22.1% respectively. I still could not produce a robust 5-10 year retailer-by-retailer trend. [Figure.NZ QSDEP table: Energy - Quarterly domestic electricity prices by town or city Feb 2004–May 2026](https://figure.nz/table/ryd5zyqL6bEc9VWp/download); [Stats NZ CPI index numbers CSV, March 2026 quarter](https://www.stats.govt.nz/assets/Uploads/Consumers-price-index/Consumers-price-index-March-2026-quarter/Download-data/consumers-price-index-march-2026-quarter-index-numbers.csv); [MBIE electricity cost and price monitoring](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring)
- I also could not produce a robust 5-10 year CPI-adjusted trend by named retailer from public data: MBIE says retailer-specific QSDEP information has not been published since the 15 May 2014 release, and the Electricity Authority says its Powerswitch-derived tariff-type report does not show consumer uptake or market share by plan. [MBIE electricity cost and price monitoring](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring); [Electricity Authority residential tariff type trends](https://www.emi.ea.govt.nz/r/kqy4y)

**Overall confidence:** Medium - the national CPI, MBIE sales-based cost, and EA 2025-26 regional-rate calculations are reproducible from official or official-derived datasets, and the 2016-2026 and 2021-2026 regional trends are now completed from the Figure.NZ QSDEP table using explicit all-groups CPI deflation, but historical 5-10 year retailer-by-retailer trends remain incomplete.

## Evidence

### National real price trend

I used Stats NZ `CPIQ.SE904501` for the electricity CPI component and `CPIQ.SE9A` for all-groups CPI, both from the March 2026 quarter index-number CSV, then calculated real change as `(electricity_index_end / all_groups_index_end) / (electricity_index_start / all_groups_index_start) - 1`. [Stats NZ CPI index numbers CSV, March 2026 quarter](https://www.stats.govt.nz/assets/Uploads/Consumers-price-index/Consumers-price-index-March-2026-quarter/Download-data/consumers-price-index-march-2026-quarter-index-numbers.csv)

| Window | Electricity CPI nominal change | All-groups CPI change | Real electricity change |
|---|---:|---:|---:|
| March 2016 to March 2026 | +39.0% | +36.8% | +1.6% |
| March 2021 to March 2026 | +28.0% | +25.4% | +2.1% |
| March 2019 to March 2026 | +29.2% | +30.5% | -1.0% |
| March 2024 to March 2026 | +19.8% | +5.7% | +13.4% |

The 2024-26 number is the one that looks like a sharp real increase, while the 5-10 year CPI-adjusted picture is close to flat nationally. [Stats NZ CPI index numbers CSV, March 2026 quarter](https://www.stats.govt.nz/assets/Uploads/Consumers-price-index/Consumers-price-index-March-2026-quarter/Download-data/consumers-price-index-march-2026-quarter-index-numbers.csv)

MBIE's sales-based series is a useful cross-check because it is based on actual residential sales revenue divided by kWh supplied, includes discounts and retention payments actually received, and is available only at national level. [MBIE electricity cost and price monitoring](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring)

Figure.NZ's extract of the MBIE sales-based real residential electricity cost series shows these real cents-per-kWh components, adjusted to Q1 2025 prices: 2015 lines 15.7937c/kWh plus energy-and-other 21.8634c/kWh; 2020 lines 15.2131c/kWh plus energy-and-other 20.6795c/kWh; and 2025 lines 13.5055c/kWh plus energy-and-other 20.9151c/kWh. [Figure.NZ / MBIE real residential electricity costs](https://figure.nz/chart/OQ6DQ4DNmpmBKANn)

Those MBIE-derived totals imply a real delivered residential cost of 37.66c/kWh in 2015, 35.89c/kWh in 2020, and 34.42c/kWh in 2025, so real costs were down 8.6% over 2015-25 and down 4.1% over 2020-25. [Figure.NZ / MBIE real residential electricity costs](https://figure.nz/chart/OQ6DQ4DNmpmBKANn)

This difference between CPI and MBIE sales-based measures is not a contradiction: Stats NZ's electricity CPI is a consumer price index component, while MBIE's sales-based cost divides actual residential sales revenue by kWh sold and warns that per-unit cost rises when average demand falls because fixed charges are spread over fewer kWh. [Stats NZ CPI index numbers CSV, March 2026 quarter](https://www.stats.govt.nz/assets/Uploads/Consumers-price-index/Consumers-price-index-March-2026-quarter/Download-data/consumers-price-index-march-2026-quarter-index-numbers.csv); [MBIE electricity cost and price monitoring](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring); [Figure.NZ / MBIE real residential electricity costs](https://figure.nz/chart/OQ6DQ4DNmpmBKANn)

### Regional evidence (5-10 years completed from Figure.NZ MBIE QSDEP table) and January 2025-March 2026 snapshot

The figure table used here explicitly states that the MBIE-sourced data were extracted from the `RawData` sheet of **Quarterly Survey of Domestic Electricity Prices: Report 15 May 2026** and includes 19,350 data points. [Figure.NZ QSDEP table: Energy - Quarterly domestic electricity prices by town or city Feb 2004–May 2026](https://figure.nz/table/ryd5zyqL6bEc9VWp)

Using the QSDEP `Retail` rows for Feb 2016, Feb 2021, and Feb 2026, and deflating with all-groups CPI (`CPIQ.SE9A`) from March-quarter points `2016.03`, `2021.03`, and `2026.03`, I found the following 42-town/city regional real trends:

| Window | Series count | Median real change | Min real change | Max real change |
|---|---:|---:|---:|---:|
| 2016-02 to 2026-02 | 42 | +5.4% | -8.8% | +24.5% |
| 2021-02 to 2026-02 | 42 | +6.6% | -6.4% | +22.1% |

The largest 10-year regional declines were Nelson, Westport, and Balclutha; the largest gains were Oamaru, Cambridge, and Kaiapoi. For the same 5-year window, Westport, Kerikeri, and Nelson declined most while Dunedin, Rangiora, and Kaiapoi rose most. [Figure.NZ QSDEP table: Energy - Quarterly domestic electricity prices by town or city Feb 2004–May 2026](https://figure.nz/table/ryd5zyqL6bEc9VWp/download); [Stats NZ CPI index numbers CSV, March 2026 quarter](https://www.stats.govt.nz/assets/Uploads/Consumers-price-index/Consumers-price-index-March-2026-quarter/Download-data/consumers-price-index-march-2026-quarter-index-numbers.csv)

The Electricity Authority's regional power prices page says the dashboard compares average household electricity use, charges and bills by region over time, and its linked downloadable dataset says the current file provides average power bill changes by region since January 2025 and is updated monthly. [Electricity Authority regional power prices dashboard](https://www.ea.govt.nz/data-and-insights/charts-and-dashboards/regional-power-prices/); [Electricity Authority regional power prices dataset page](https://www.ea.govt.nz/data-and-insights/datasets/retail/regional-power-prices/)

The same EA dashboard notes that all prices include GST except the lines component, that actual prices and bills vary by plan and household consumption, and that the average fixed and variable tariffs are calculated independently and may not represent any actual plan being offered. [Electricity Authority regional power prices dashboard](https://www.ea.govt.nz/data-and-insights/charts-and-dashboards/regional-power-prices/)

I compared January 2025 with March 2026 in the EA `20260331_AveragePowerUseAndCosts.csv` file, converting January 2025 values to March 2026 dollars with all-groups CPI for March 2025 and March 2026; this is an approximation because the EA dataset is monthly but the public Stats NZ CPI series used here is quarterly. [Electricity Authority regional power prices dataset](https://emidatasets.blob.core.windows.net/publicdata/Datasets/Retail/RegionalPowerPrices/20260331_AveragePowerUseAndCosts.csv); [Stats NZ CPI index numbers CSV, March 2026 quarter](https://www.stats.govt.nz/assets/Uploads/Consumers-price-index/Consumers-price-index-March-2026-quarter/Download-data/consumers-price-index-march-2026-quarter-index-numbers.csv)

Across 39 network reporting regions, CPI-adjusted variable rates rose by a median 6.1% for low-user plans and 5.8% for standard-user plans between January 2025 and March 2026; the largest standard-user variable-rate increases were Eastern Bay of Plenty (Horizon Energy) at 17.3%, Rotorua (Unison Networks) at 14.1%, Waipa (Waipa Networks) at 13.2%, and Taupō (Unison Networks) at 13.1%. [Electricity Authority regional power prices dataset](https://emidatasets.blob.core.windows.net/publicdata/Datasets/Retail/RegionalPowerPrices/20260331_AveragePowerUseAndCosts.csv)

Fixed daily charges moved more sharply than variable rates: CPI-adjusted fixed charges rose by a median 29.9% for low-user plans and 15.3% for standard-user plans, with the largest standard-user fixed-charge increases in Wairarapa (Powerco) at 43.4%, Whanganui (Powerco) at 39.8%, and Taranaki (Powerco) at 38.7%. [Electricity Authority regional power prices dataset](https://emidatasets.blob.core.windows.net/publicdata/Datasets/Retail/RegionalPowerPrices/20260331_AveragePowerUseAndCosts.csv)

The January 2025 to March 2026 EA bill totals are less clean as a price measure because the dataset's own notes say monthly bills are affected by consumption and by the billing-period day count; with that caveat, CPI-adjusted total monthly bills moved by a median 2.0% for low-user plans and 0.6% for standard-user plans, with the largest increases in Frankton (Lakelands) low-user at 10.0%, Dunedin (Aurora Energy) standard-user at 9.8%, Central Canterbury (Orion New Zealand) low-user at 9.7%, and Dunedin low-user at 9.6%. [Electricity Authority regional power prices dashboard](https://www.ea.govt.nz/data-and-insights/charts-and-dashboards/regional-power-prices/); [Electricity Authority regional power prices dataset](https://emidatasets.blob.core.windows.net/publicdata/Datasets/Retail/RegionalPowerPrices/20260331_AveragePowerUseAndCosts.csv)

The Commerce Commission says distribution and transmission costs make up just over 30% of the average power bill, that those costs started rising in 2025 and are likely to keep rising until at least 2030, and that the exact impact varies by region and retailer because local network and retailer pricing differs. [Commerce Commission, lines-charge explanation](https://www.comcom.govt.nz/regulated-industries/electricity-lines/understanding-why-changes-to-lines-charges-may-impact-your-electricity-bill/)

The Electricity Authority's April 2026 press release is consistent with the regional-dispersion result: it estimated most households faced average bill increases of about 8% ahead of winter 2026, on top of the previous year's 8%, and said 2026 increases varied across the country and by retailer from 1% to 11%. [Electricity Authority, price-increase press release](https://www.ea.govt.nz/news/press-release/electricity-authority-takes-closer-look-at-price-increases/)

### Retailer-level evidence gap

MBIE's QSDEP is a publicly advertised tariff snapshot collected on 15 February, 15 May, 15 August and 15 November each year for a limited selection of towns and cities, but MBIE states that from the 15 May 2014 QSDEP release it no longer publishes retailer-specific information. [MBIE electricity cost and price monitoring](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring)

The Electricity Authority's residential tariff-type trends report uses Consumer NZ/Powerswitch tariff data, says tariffs in the database supply about 97% of the residential market, but also says the report does not show market share, does not show how many consumers are on each available plan, and that some retailers have not supplied tariffs continuously through time. [Electricity Authority residential tariff type trends](https://www.emi.ea.govt.nz/r/kqy4y)

Billy, the Electricity Authority's current comparison site, can compare plans and retailers for a household, but its public FAQ says Billy relies on information from power companies and cannot guarantee it is accurate or up to date; this makes it a current consumer-comparison tool, not a public 5-10 year retailer price-history dataset. [Billy](https://billy.govt.nz/)

The strongest retailer-level statement I can support from public sources is therefore narrow: recent price increases vary by retailer, and the EA has asked power companies with more than 1% market share for more information, but the public record available for this finding does not identify a complete CPI-adjusted 5-10 year price path for each named retailer. [Electricity Authority, price-increase press release](https://www.ea.govt.nz/news/press-release/electricity-authority-takes-closer-look-at-price-increases/); [MBIE electricity cost and price monitoring](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring); [Electricity Authority residential tariff type trends](https://www.emi.ea.govt.nz/r/kqy4y)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| The 2016-2026 and 2021-2026 regional real retail trends by town/city are completed from Figure.NZ-derived QSDEP data and can be deflated with all-groups CPI from Stats NZ. | [Figure.NZ QSDEP table: Energy - Quarterly domestic electricity prices by town or city Feb 2004–May 2026](https://figure.nz/table/ryd5zyqL6bEc9VWp/download) | [Stats NZ CPI index numbers CSV, March 2026 quarter](https://www.stats.govt.nz/assets/Uploads/Consumers-price-index/Consumers-price-index-March-2026-quarter/Download-data/consumers-price-index-march-2026-quarter-index-numbers.csv) | Medium |
| The exact March 2016-March 2026 and March 2021-March 2026 national real CPI-adjusted calculations are single-source author calculations from Stats NZ's March 2026 CPI CSV; I did not find an independent public source that repeats those exact 2026 all-groups-CPI-adjusted results. | [Stats NZ CPI index numbers CSV](https://www.stats.govt.nz/assets/Uploads/Consumers-price-index/Consumers-price-index-March-2026-quarter/Download-data/consumers-price-index-march-2026-quarter-index-numbers.csv) | No independent source found for the exact calculation; the MBIE/Figure.NZ sales-based real-cost series is a directional cross-check only, not corroboration of the CPI calculation. | Medium |
| MBIE sales-based real residential costs fell between 2015 and 2025 even though the electricity CPI component rose slightly in real terms over 2016-2026. | [Figure.NZ / MBIE real residential electricity costs](https://figure.nz/chart/OQ6DQ4DNmpmBKANn) | [MBIE explains the sales-based method and warns that per-kWh costs depend on demand because fixed charges are spread across kWh](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring) | Medium |
| The 2025-26 regional pressure is concentrated more in fixed daily charges than in variable kWh rates. | [Electricity Authority regional power prices dataset](https://emidatasets.blob.core.windows.net/publicdata/Datasets/Retail/RegionalPowerPrices/20260331_AveragePowerUseAndCosts.csv) | [Commerce Commission says lines costs started rising in 2025 and vary by region and retailer](https://www.comcom.govt.nz/regulated-industries/electricity-lines/understanding-why-changes-to-lines-charges-may-impact-your-electricity-bill/) | Medium |
| A robust 5-10 year retailer-by-retailer real price trend cannot be produced from the public sources used here. | [MBIE says retailer-specific QSDEP information has not been published since 15 May 2014](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring) | [EA's Powerswitch-derived tariff-type report says it does not show consumer uptake and some retailers have not supplied tariff data continuously](https://www.emi.ea.govt.nz/r/kqy4y) | High |

## What would change this conclusion

- A public release of historical retailer-plan prices by region, with plan uptake or ICP weights, would change the retailer-level conclusion. The most likely sources would be Electricity Authority retail monitoring datasets, Consumer NZ/Powerswitch historical tariff data, or a regulator release from the Authority's 2026 requests to power companies.
- A source that publishes retailer-level identifiers and market-share weights for each town/city and quarter in the historical tariff data would convert the current regional trend table into a true retailer-by-retailer real trend.
- Monthly CPI selected-price-index electricity data could refine the January 2025 to March 2026 regional deflator; I used quarterly all-groups CPI because it is directly available from the Stats NZ public CSV.
- A household-level bill panel would change the bill-impact conclusion because it could separate price changes from consumption changes, plan choice, household size, and billing-period day count.
- A legal or consumer-rights interpretation of whether specific retailer increases are justified needs a human policy or regulatory review; this finding only measures public price series and does not assess compliance or fairness.

## Open follow-up questions

- Can the Electricity Authority publish the 2026 power-company responses in a form that supports named retailer, region, and plan-type trend analysis without exposing customer data?
- Can Consumer NZ/Powerswitch provide historical tariff extracts or an aggregated public dataset with retailer, network region, plan type, and date fields?
- How do 2025-26 fixed-charge increases affect low-use households, renters, medically dependent consumers, and households reducing demand through efficiency or solar?
- How different are results if monthly selected price indexes are used instead of quarterly all-groups CPI for short-window regional deflation?

## Sources

1. Stats NZ. "Consumers price index: March 2026 quarter - index numbers - CSV." Accessed 3 July 2026. https://www.stats.govt.nz/assets/Uploads/Consumers-price-index/Consumers-price-index-March-2026-quarter/Download-data/consumers-price-index-march-2026-quarter-index-numbers.csv
2. Ministry of Business, Innovation and Employment. "Electricity cost and price monitoring." Accessed through WebSearch 3 July 2026; plain `curl` and `node scripts/fetch.mjs` were blocked by Incapsula and classified as BLOCKED, not dead. https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring
3. Figure.NZ / Ministry of Business, Innovation and Employment. "Real residential electricity costs in New Zealand." Accessed 3 July 2026. https://figure.nz/chart/OQ6DQ4DNmpmBKANn
4. Electricity Authority. "Regional power prices." Accessed 3 July 2026. https://www.ea.govt.nz/data-and-insights/charts-and-dashboards/regional-power-prices/
5. Electricity Authority. "Regional power prices dataset page." Accessed 3 July 2026. https://www.ea.govt.nz/data-and-insights/datasets/retail/regional-power-prices/
6. Electricity Authority. "20260331_AveragePowerUseAndCosts.csv." Accessed 3 July 2026. https://emidatasets.blob.core.windows.net/publicdata/Datasets/Retail/RegionalPowerPrices/20260331_AveragePowerUseAndCosts.csv
7. Electricity Authority EMI. "Residential tariff type trends." Accessed 3 July 2026. https://www.emi.ea.govt.nz/r/kqy4y
8. Commerce Commission. "Understanding why changes to lines charges may impact your electricity bill." Accessed 3 July 2026. https://www.comcom.govt.nz/regulated-industries/electricity-lines/understanding-why-changes-to-lines-charges-may-impact-your-electricity-bill/
9. Electricity Authority. "Electricity Authority takes closer look at price increases." 28 April 2026. Accessed 3 July 2026. https://www.ea.govt.nz/news/press-release/electricity-authority-takes-closer-look-at-price-increases/
10. Billy / Electricity Authority. "There's power in checking." Accessed 3 July 2026. https://billy.govt.nz/
