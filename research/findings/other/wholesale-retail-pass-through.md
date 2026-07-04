---
title: "The 2024 dry-year wholesale spike shows only small measured pass-through into advertised household energy tariffs; the larger 2025-26 bill rise is mostly lines plus repricing"
domain: "other"
issue: "#429"
confidence: "Medium"
author: "The For Good Project"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-04"
status: "draft"
---

# The 2024 dry-year wholesale spike shows only small measured pass-through into advertised household energy tariffs; the larger 2025-26 bill rise is mostly lines plus repricing

## Executive answer

- The measurable national pass-through from the August 2024 dry-year wholesale spike into MBIE's advertised residential **Energy and Other Component** was small and lagged: from the pre-spike 15 May 2024 QSDEP snapshot to 15 February 2025 it rose **0.97c/kWh**, which is only about **2.1-2.8%** of the **34.5-45.1c/kWh** wholesale swing implied by Benmore's August 2024 spike versus August 2023 or November 2024 baselines. [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download); [EA EMI Final Energy Prices](https://www.emi.ea.govt.nz/Wholesale/Datasets/DispatchAndPricing/FinalEnergyPrices)
- The larger advertised household price step arrived around the annual 1 April 2025 pricing reset: by 15 May 2025 the national QSDEP total retail price was up **4.55c/kWh** from 15 May 2024, split into **+2.48c/kWh lines** and **+2.08c/kWh energy-and-other**. [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download); [MBIE electricity cost and price monitoring](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring)
- By 15 May 2026, the same advertised national retail price was up **7.33c/kWh** from 15 May 2024, split into **+4.10c/kWh lines** and **+3.24c/kWh energy-and-other**. [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download)
- On MBIE's QSDEP modelled 8,000 kWh/year household, those 15 May 2024 to 15 May 2026 changes are about **+$587/year** total, of which **+$328/year** is lines and **+$259/year** is energy-and-other; this is a modelled advertised-tariff bill, not what every household actually paid. [MBIE electricity cost and price monitoring](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring); [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download)
- The best quantified answer is therefore: **immediate pass-through was near zero; visible energy-component pass-through was about 1c/kWh within six months and about 2-3c/kWh after 9-21 months, while lines charges added about 2.5c/kWh in 2025 and 4.1c/kWh by 2026.** I cannot prove how much of the energy-and-other increase was caused by the 2024 dry-year spike, because public data does not show retailer hedge costs, internal transfer prices, or plan uptake by household. [EA, retail power prices and supply security](https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/); [MBIE electricity cost and price monitoring](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring)

**Overall confidence:** Medium - the QSDEP and wholesale calculations are reproducible from public data, and the timing is clear, but the causal split between dry-year wholesale costs, hedge repricing, retailer margin, and other energy-cost changes cannot be identified from public datasets.

## Evidence

### Scope and method

I answered a narrower question than a full retailer pass-through model: how much moved in public household-facing price series after the August 2024 wholesale shock, and with what lag. MBIE's QSDEP is the best public series for this because it monitors publicly advertised residential tariffs on 15 February, 15 May, 15 August and 15 November, quotes average prices for a modelled 8,000 kWh/year consumer, publishes lines and energy components, and says retailer-specific QSDEP information has not been published since the 15 May 2014 release. [MBIE electricity cost and price monitoring](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring)

The wholesale denominator is the 2024 dry-year spike already quantified in stream finding #279: Benmore averaged **$475.69/MWh** in August 2024, **$130.69/MWh** in August 2023, and **$24.20/MWh** in November 2024, so the August 2024 shock was **34.5c/kWh** above the prior-August comparison and **45.1c/kWh** above the wet-November comparison. [EA EMI Final Energy Prices](https://www.emi.ea.govt.nz/Wholesale/Datasets/DispatchAndPricing/FinalEnergyPrices); [dry-year spot-price finding #279](https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/dry-year-spot-price-spikes-quantified.md)

The pass-through numerator is the national `Total New Zealand` QSDEP change from the 15 May 2024 pre-spike snapshot, using the `Energy and Other Component` as the closest public proxy for retail energy, metering and retailer costs excluding lines. [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download); [MBIE electricity cost and price monitoring](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring)

This is an advertised-tariff estimate rather than a household-bill panel: the Electricity Authority's regional power prices dashboard warns that actual prices and monthly bills vary by retail plan and household consumption, and that average fixed and variable tariffs may not represent an actual plan being offered. [EA regional power prices](https://www.ea.govt.nz/data-and-insights/charts-and-dashboards/regional-power-prices/)

### National QSDEP movement after the August 2024 spike

The national advertised residential retail price barely moved in the August 2024 snapshot itself: from 15 May 2024 to 15 August 2024, QSDEP total retail rose **0.24c/kWh**, lines were flat, and energy-and-other rose **0.24c/kWh**. [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download)

By 15 February 2025, about six months after the August 2024 spike, national QSDEP total retail was up **0.96c/kWh** from 15 May 2024, still almost entirely in energy-and-other because the lines component had not yet stepped up. [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download)

The main step came in the 15 May 2025 snapshot, after the 1 April network-pricing year: national QSDEP total retail rose from **34.71c/kWh** in May 2024 to **39.26c/kWh** in May 2025, with lines rising from **12.72c/kWh** to **15.19c/kWh** and energy-and-other rising from **21.99c/kWh** to **24.06c/kWh**. [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download)

By 15 May 2026, national QSDEP total retail reached **42.04c/kWh**, with lines at **16.82c/kWh** and energy-and-other at **25.23c/kWh**, so the two-year change from May 2024 was **+7.33c/kWh total**, **+4.10c/kWh lines**, and **+3.24c/kWh energy-and-other**. [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download)

| QSDEP snapshot | Retail c/kWh | Lines c/kWh | Energy and other c/kWh | Energy-and-other change from May 2024 | Approx. pass-through vs 34.5-45.1c/kWh wholesale swing |
|---|---:|---:|---:|---:|---:|
| 15 May 2024 | 34.71 | 12.72 | 21.99 | 0.00 | 0.0% |
| 15 Aug 2024 | 34.95 | 12.72 | 22.23 | +0.24 | 0.5-0.7% |
| 15 Nov 2024 | 35.36 | 12.72 | 22.64 | +0.65 | 1.4-1.9% |
| 15 Feb 2025 | 35.67 | 12.72 | 22.95 | +0.97 | 2.1-2.8% |
| 15 May 2025 | 39.26 | 15.19 | 24.06 | +2.08 | 4.6-6.0% |
| 15 May 2026 | 42.04 | 16.82 | 25.23 | +3.24 | 7.2-9.4% |

The same table should not be read as a proof that dry-year wholesale costs caused all of the energy-and-other increase, because MBIE's component also includes retailer costs, metering and margin, while the Electricity Authority says normal households buy fixed retail plans and retailers absorb volatile wholesale risk through hedging. [MBIE electricity cost and price monitoring](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring); [EA, retail power prices and supply security](https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/)

### Lines charges were the larger measurable bill component in 2025-26

The Commerce Commission says distribution and transmission costs make up just over 30% of the average power bill, that those costs started rising in 2025, and that they are likely to keep rising until at least 2030. [Commerce Commission lines-charge explainer](https://www.comcom.govt.nz/regulated-industries/electricity-lines/understanding-why-changes-to-lines-charges-may-impact-your-electricity-bill/)

The QSDEP national series shows that lines charges landed mechanically in the annual tariff reset: the national lines component was essentially flat from May 2024 through February 2025, then rose **2.48c/kWh** in May 2025 and **4.10c/kWh** by May 2026 versus May 2024. [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download)

On MBIE's 8,000 kWh/year modelled QSDEP household, the May 2024 to May 2026 lines increase equals about **$328/year**, and the energy-and-other increase equals about **$259/year**; the total advertised-tariff increase equals about **$587/year** before accounting for household-specific consumption, discounts, trust distributions, or fixed-term plan rates. [MBIE electricity cost and price monitoring](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring); [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download)

Regional variation is large: across the 42 QSDEP towns/cities, the May 2024 to May 2026 median retail increase was **7.0c/kWh** or **19.8%**, the median lines increase was **4.0c/kWh** or **32.6%**, and the median energy-and-other increase was **3.0c/kWh** or **13.4%**. [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download)

The regional spread means a national pass-through percentage is only a summary: from May 2024 to May 2026, Westport's QSDEP retail price rose **3.2c/kWh** while Dunedin's rose **9.4c/kWh**, and Masterton's lines component rose **7.1c/kWh** while Westport's rose **0.5c/kWh**. [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download)

### Why the lag estimate is 6-9 months, not immediate

The Electricity Authority's consumer explainer says households and smaller businesses do not pay wholesale spot directly, retailers absorb risk from volatile spot prices, and sustained higher wholesale prices can later lead retailers to choose higher fixed prices. [EA, retail power prices and supply security](https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/)

The observed QSDEP timing matches that mechanism: the August 2024 spike appears as only **0.24c/kWh** in the August 2024 advertised energy-and-other component, **0.65c/kWh** by November 2024, **0.97c/kWh** by February 2025, and **2.08c/kWh** by May 2025. [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download); [EA, retail power prices and supply security](https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/)

I therefore treat the first visible energy-component pass-through as a **six-month lag of about 1c/kWh**, with the larger advertised repricing occurring at the **nine-month / next-April reset**; that is a measured timing statement, not a proof that the 2024 dry year caused every later energy-and-other cent. [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download); [EA, retail power prices and supply security](https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| The immediate advertised household energy-tariff pass-through from the August 2024 wholesale spike was tiny: +0.24c/kWh by August 2024 and +0.97c/kWh by February 2025, versus a 34.5-45.1c/kWh wholesale swing. | [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download) | [EA EMI Final Energy Prices](https://www.emi.ea.govt.nz/Wholesale/Datasets/DispatchAndPricing/FinalEnergyPrices) | Medium |
| The larger 2025-26 advertised household increase was more lines than energy: +4.10c/kWh lines and +3.24c/kWh energy-and-other from May 2024 to May 2026. | [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download) | [Commerce Commission says lines costs started rising in 2025 and will likely keep rising to at least 2030](https://www.comcom.govt.nz/regulated-industries/electricity-lines/understanding-why-changes-to-lines-charges-may-impact-your-electricity-bill/) | Medium |
| A precise causal wholesale-to-retail pass-through model cannot be produced from public data because retailer-specific QSDEP prices are no longer published and household plan uptake is not public. | [MBIE says retailer-specific QSDEP information has not been published since 15 May 2014](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring) | [EA says households are on retailer plans and retailers absorb spot risk through hedging](https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/) | High |
| The lag is visible in the data: little movement in August-November 2024, roughly 1c/kWh by February 2025, and the larger reset in May 2025. | [MBIE QSDEP via Figure.NZ](https://figure.nz/table/ryd5zyqL6bEc9VWp/download) | [EA explains sustained spot-price pressure passes through later through fixed-price retail decisions](https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/) | Medium |

## What would change this conclusion

- A public regulator release of the 2026 retailer price-increase responses, with retailer, network, plan type, customer counts, hedge cost and component attribution, would allow a causal pass-through estimate rather than the bounded observed estimate above.
- A historical Powerswitch or Billy tariff extract with plan uptake or ICP weights would allow named-retailer pass-through by region; MBIE's public QSDEP does not publish retailer-specific information after 15 May 2014.
- Audited retailer hedge books or internal transfer-price disclosures would show whether the 2025-26 energy-and-other increase was mainly dry-year hedging cost, retailer margin, metering, or other cost recovery.
- Household-level bill panels would change the bill-impact estimate because QSDEP is a modelled advertised-tariff series for 8,000 kWh/year, while actual bills vary by usage, plan, discounts, trust distributions, fixed-term pricing, and billing period.
- I could not verify ASX forward-curve history in a clean public CSV during this task; the finding therefore uses observed wholesale spot and observed advertised tariff components rather than a forward-price pass-through regression.
- A human electricity-market specialist should review the causal wording before this is used in public advocacy, because pass-through through hedges and fixed-plan repricing is commercially and technically complex.

## Open follow-up questions

- Can the Electricity Authority publish the retailer responses behind its 2026 price-increase review in an aggregated table with component attribution and market-share weights?
- Can Consumer NZ/Powerswitch or Billy publish historical tariff data with retailer, network region, tariff type, date and market-share/ICP weights?
- What share of the 2025-26 `Energy and Other Component` increase is metering, retail operating cost, wholesale hedge cost, and retailer margin?

## Sources

1. MBIE. "Electricity cost and price monitoring." Accessed 4 July 2026. Plain `curl`/Python fetch from this environment returned an Incapsula challenge, but the built-in WebFetch opened the page and confirmed the QSDEP and sales-based methodology. https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/energy-prices/electricity-cost-and-price-monitoring
2. Figure.NZ / MBIE. "Energy - Quarterly domestic electricity prices by town or city Feb 2004-May 2026" downloadable CSV. Accessed 4 July 2026 by `curl -L`, HTTP 200. Used for all QSDEP component calculations. https://figure.nz/table/ryd5zyqL6bEc9VWp/download
3. Electricity Authority EMI. "Final Energy Prices" dataset. Accessed 4 July 2026 via the vendored `nz-electricity` skill and underlying EMI monthly CSVs; used for Benmore August 2023, August 2024 and November 2024 wholesale averages. https://www.emi.ea.govt.nz/Wholesale/Datasets/DispatchAndPricing/FinalEnergyPrices
4. The For Good Project. "In a dry year, NZ wholesale spot prices jump roughly ten- to twentyfold - but households feel it lagged and buffered, not in real time" (#279 finding). Accessed 4 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/dry-year-spot-price-spikes-quantified.md
5. Electricity Authority. "Retail power prices and power supply security." Accessed 4 July 2026; used for the regulator's explanation that households do not pay spot directly and retail pass-through is lagged through fixed-price retail decisions. https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/
6. Commerce Commission. "Understanding why changes to lines charges may impact your electricity bill." Accessed 4 July 2026 by `curl -L`, HTTP 200, and built-in WebFetch. https://www.comcom.govt.nz/regulated-industries/electricity-lines/understanding-why-changes-to-lines-charges-may-impact-your-electricity-bill/
7. Electricity Authority. "Regional power prices." Accessed 4 July 2026 by `curl -L`, HTTP 200; used only for caveats that actual bills vary by plan and consumption, and that averages may not represent an actual plan. https://www.ea.govt.nz/data-and-insights/charts-and-dashboards/regional-power-prices/
