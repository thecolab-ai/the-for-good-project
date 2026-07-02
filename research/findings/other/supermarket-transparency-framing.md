---
title: "Supermarket price transparency should fan out from a data-rights and methodology-first research frame"
domain: "other"
issue: "#61"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5"
date: "2026-07-02"
status: "draft"
---

# Supermarket price transparency should fan out from a data-rights and methodology-first research frame

## Executive answer

- This stream is worth pursuing because grocery prices affect ordinary household budgets at national scale: Stats NZ's 2023 Household Expenditure Statistics put average weekly household food spending at $300, or 18.7 percent of total average weekly household expenditure, and the May 2026 Selected Price Indexes release reported food prices up 3.2 percent over the 12 months to May 2026 [Stats NZ Household Expenditure Statistics](https://www.stats.govt.nz/information-releases/household-expenditure-statistics-year-ended-june-2023/), [Stats NZ Selected Price Indexes: May 2026](https://www.stats.govt.nz/information-releases/selected-price-indexes-may-2026/).
- The first research work should audit coverage, provenance, and reuse rights before any public republication of price data. Stats NZ provides the official aggregate baseline, while Grocer public assets and community API notes show a possible shelf-level research route; neither source removes the need for a rights audit [Stats NZ DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65), [Grocer public base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br), [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md).
- The stream should not try to answer "are specials misleading?" at discover stage. Commerce Commission guidance says price representations must be clear, accurate, and unambiguous, and MBIE Consumer Protection says non-genuine specials or discounts can be misleading, so retailer-naming claims need exact product, store, date, and source evidence plus a conservative method that reports observable price patterns rather than intent [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/), [Consumer Protection](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising).
- The Grocery Commissioner is a plausible owner desk because the Commerce Commission says its grocery work includes "creating pricing and promotional transparency for consumers" and pricing/promotional practices are among its grocery-sector enforcement priorities [Commerce Commission grocery page](https://www.comcom.govt.nz/regulated-industries/grocery/).
- I opened five depth-1 research issues: data coverage/reuse rights (#74), shelf-level basket versus Stats NZ indexes (#76), reference-pricing methodology (#75), NZ law/regulator powers (#78), and the gap left by current shopper tools (#77).

**Overall confidence:** Medium -- the official household-impact, price-index, and regulatory framing is well sourced. The Grocer route is only a tractability lead until coverage, terms, stability, and retailer-safe methodology are checked.

## Evidence

### Who it affects

This is a broad household-budget issue rather than a niche consumer-information problem. Stats NZ's year-ended June 2023 Household Expenditure Statistics reported average weekly household expenditure of $1,598, with food the second-largest main spending group at $300 per week and 18.7 percent of total net expenditure [Stats NZ Household Expenditure Statistics](https://www.stats.govt.nz/information-releases/household-expenditure-statistics-year-ended-june-2023/).

Food spending also rose faster than total household expenditure in that HES period: Stats NZ reported food expenditure up 28.1 percent from the year ended June 2019 to the year ended June 2023, compared with an 18.4 percent increase in overall average weekly household expenditure [Stats NZ Household Expenditure Statistics](https://www.stats.govt.nz/information-releases/household-expenditure-statistics-year-ended-june-2023/).

The pressure is not uniform across households. Stats NZ's Household Living-costs Price Indexes are designed to show inflation experienced by different household groups, including beneficiaries, Maori, income quintiles, expenditure quintiles, and superannuitants; Stats NZ's 2024 HLPI review says high-income and high-expenditure quintiles have relatively lower food weights than other household groups [Stats NZ CPI DataInfo+](https://datainfoplus.stats.govt.nz/Item/nz.govt.stats/8b0860b8-cf63-4f12-a578-8eed8ba69ac3), [Stats NZ HLPI review 2024](https://www.stats.govt.nz/methods/household-living-costs-price-indexes-review-2024/).

### The official baseline is aggregate, not shelf-level

Stats NZ's Selected Price Indexes combine the Food Price Index, rental price indexes, and other monthly price index data into one release; the food group includes fruit and vegetables, meat/poultry/fish, grocery food, non-alcoholic beverages, and restaurant meals/ready-to-eat food [Stats NZ SPI DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65). Stats NZ records that SPI methodology collects about 19,000 prices from 560 retail outlets, and food prices are collected online, by visiting retail outlets, and from sources such as checkout scanner data [Stats NZ SPI DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65).

Stats NZ cautions that weighted average retail prices in SPI releases are not statistically accurate measures of average transaction price levels, though they are reliable indicators of percentage price change [Stats NZ SPI DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65). The older FPI metadata makes the same conceptual point: FPI is primarily a measure of price change rather than price levels or average prices [Stats NZ FPI DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/749d8c27-1bed-45fb-b941-a1905aee632f).

That limitation is central to this stream: SPI/FPI is the right official aggregate baseline for price movement, but it is not a substitute for a shopper-facing product/store price history [Stats NZ SPI DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65), [Stats NZ FPI DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/749d8c27-1bed-45fb-b941-a1905aee632f).

### Shelf-level data appears technically researchable, but rights and coverage are unresolved

The public `grocer-nz` API notes in `thecolab-ai/.skills` identify Grocer sources for a base DuckDB file, per-store current price parquet files, per-product price-history parquet files, and a product search index; the public asset paths are under `https://assets-prod.grocer.nz/public/` [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md), [Grocer public base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).

A bounded smoke test recorded in the merged #74 Grocer data audit found PAK'nSAVE Papakura as store `230`, four enabled Papakura-area current-price files, and product/store current price fields including `original_price_cent`, `sale_price_cent`, `club_price_cent`, `online_price_cent`, `multibuy_price_cent`, and `updated_at` [Grocer data audit finding](https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/grocer-nz-data-audit.md), [Grocer PAK'nSAVE Papakura current-price parquet example](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet).

For product-history analysis, the important schema correction is that the per-product history parquet rows are lean: `updated_at`, `store_id`, and `price_cent`. Product id is inferred from the file path, and vendor or store names must be joined from the base DuckDB store/vendor tables rather than read from each history row [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md), [Grocer public price-history example](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet), [Grocer data audit finding](https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/grocer-nz-data-audit.md).

This is only a capability check: it is not evidence that any retailer misled shoppers, inflated a reference price, or behaved unlawfully. It also does not establish that Grocer's public asset route is intentionally stable, licensed for third-party republication, or complete enough for representative NZ claims [Grocer public base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br), [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md).

Grocer's public app listing says the app helps users compare grocery prices across major supermarkets in New Zealand and view price history over time, but that app-store description does not grant a data-republication licence and does not verify the CDN schema [Google Play](https://play.google.com/store/apps/details?hl=en_US&id=nz.grocer.twa). I did not verify the Grocer Terms of Service or Privacy Policy text while preparing this discover artifact, so they are not cited here as sources; rights remain a follow-up issue for #74 and any future build.

### There is a regulator/public-interest route, but it must stay evidence-led

The Commerce Commission's 2022 grocery market study page says the final report found competition was not working well for consumers and recommended changes to improve grocery price, quality, range, and service outcomes [Commerce Commission market study](https://www.comcom.govt.nz/regulated-industries/projects/market-study-into-retail-grocery-sector/). The Commission's current grocery page says the Grocery Industry Competition Act 2023 made it the grocery-sector regulator, that Pierre van Heerden was appointed as the first Grocery Commissioner on 13 July 2023, and that its work includes pricing/promotional transparency for consumers [Commerce Commission grocery page](https://www.comcom.govt.nz/regulated-industries/grocery/).

The same Commerce Commission grocery page says its grocery responsibilities sit alongside Fair Trading Act and Commerce Act enforcement, with priorities including pricing and promotional practices [Commerce Commission grocery page](https://www.comcom.govt.nz/regulated-industries/grocery/). I infer from those sources that the Commission/Grocery Commissioner route is plausible for a later policy brief, but only after research defines a defensible evidence threshold.

### Existing shopper tools reduce duplication risk but do not remove the public-interest gap

Consumer NZ reported in December 2025 that Grocer.nz, Grosave, and Price Pulse all aim to help supermarket shoppers compare prices, and it described Grocer.nz as regularly updated, covering major supermarkets including Fresh Choice and Super Value, and offering price-comparison history limits by tier [Consumer NZ](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand).

Consumer NZ also described Price Pulse as offering product-level basket information with a six-month price history and comparisons with nearby supermarkets, while noting that Price Pulse covers Woolworths, PAK'nSAVE, and New World rather than every grocery retailer [Consumer NZ](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand).

I infer from the Consumer NZ tool survey, the Commerce Commission's transparency remit, and the unresolved data-rights position that a For Good output should not start as "another grocery price app". The narrower public-interest gap to research is a cited method, representative product histories, education about reference pricing, and regulator/newsroom-ready evidence packages that avoid bulk redistributing third-party data without permission [Consumer NZ](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand), [Commerce Commission grocery page](https://www.comcom.govt.nz/regulated-industries/grocery/), [Grocer data audit finding](https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/grocer-nz-data-audit.md).

## Surprising or load-bearing claims

| Claim | Support | Independence / confidence |
|---|---|---|
| Food price transparency affects a broad NZ household budget category. | Stats NZ reports food as $300/week and 18.7 percent of average weekly household expenditure in 2023, and the May 2026 SPI release reports food prices up 3.2 percent over 12 months [Stats NZ Household Expenditure Statistics](https://www.stats.govt.nz/information-releases/household-expenditure-statistics-year-ended-june-2023/), [Stats NZ Selected Price Indexes: May 2026](https://www.stats.govt.nz/information-releases/selected-price-indexes-may-2026/). | High for scale; both are Stats NZ, so single-origin official statistics rather than independent corroboration. |
| The official monthly food-price baseline is designed for price-change measurement, not direct shelf-level or average transaction price claims. | Stats NZ SPI and FPI metadata both say the indexes measure price change and warn against treating weighted average prices as average transaction price levels [Stats NZ SPI DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65), [Stats NZ FPI DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/749d8c27-1bed-45fb-b941-a1905aee632f). | High for Stats NZ's own design intent; same-origin official metadata, explicitly not two independent origins. |
| This stream has a plausible regulator owner because the Commerce Commission regulates groceries and lists pricing/promotional transparency and practices in its grocery work. | Commerce Commission grocery and market-study pages document the regulator role, transparency work, enforcement context, and market-study rationale [Commerce Commission grocery page](https://www.comcom.govt.nz/regulated-industries/grocery/), [Commerce Commission market study](https://www.comcom.govt.nz/regulated-industries/projects/market-study-into-retail-grocery-sector/). | Medium-High; same-origin regulator sources, so the claim is flagged as single-origin. |
| Grocer public assets can support bounded product/store price-history research, but not public data republication without a rights audit. | Public assets and API notes support technical tractability; the Google Play listing supports the consumer-facing app purpose, but not schema or republication rights [Grocer public base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br), [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md), [Google Play](https://play.google.com/store/apps/details?hl=en_US&id=nz.grocer.twa). | Medium for technical tractability; Low for rights/stability until #74-style rights review is accepted. Not two independent sources for the exact schema. |
| Retailer-naming promotion claims need a conservative evidence threshold because misleading price representations are regulated under Fair Trading Act/consumer guidance. | Commerce Commission pricing guidance and MBIE Consumer Protection guidance both warn against unclear, inaccurate, ambiguous, or non-genuine price promotions [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/), [Consumer Protection](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising). | High; two different agency sources. |

## What would change this conclusion

- A data-rights audit could find that Grocer or retailer terms prohibit the planned reuse; that would push the stream toward methodology-only publication, aggregate summaries, or regulator/private handoff rather than public product-level extracts.
- A coverage audit could find that Grocer history is too sparse, biased by store/product availability, or too short for defensible promotion-cycle measurement; that would narrow the stream to education and policy rather than quantitative claims.
- A legal review could require a stricter threshold for any example involving named retailers, especially where the public might infer intent or illegality from price-movement patterns.
- I did not verify Grocer's Terms of Service or Privacy Policy in this discover artifact; rights claims should rely on #74 and any later legal/permission work, not this framing memo.
- I did not verify whether Grocer's public asset availability is intentionally stable, how often each parquet file updates, or whether history depth varies materially by product/store; issue #74 covers that.
- I did not contact Stats NZ, the Commerce Commission, Grocer, retailers, Consumer NZ, or any household shoppers; lived-experience and regulator/legal authority are needed before this becomes an external artifact.

## Open follow-up questions

- #74 -- Audit Grocer NZ grocery price data coverage, history depth, and reuse rights.
- #76 -- Compare representative shelf-level grocery prices with Stats NZ food price indexes.
- #75 -- Define a defensible method for detecting supermarket reference-pricing and promotion cycles.
- #78 -- Map NZ law and regulator powers for misleading supermarket pricing and promotions.
- #77 -- Identify the supermarket transparency gap left by current NZ shopper tools.

## Sources

1. Stats NZ, "Household expenditure statistics: Year ended June 2023", released 5 March 2024, accessed 2026-07-02. https://www.stats.govt.nz/information-releases/household-expenditure-statistics-year-ended-june-2023/
2. Stats NZ, "Selected price indexes: May 2026", released 16 June 2026, accessed 2026-07-02. https://www.stats.govt.nz/information-releases/selected-price-indexes-may-2026/
3. Stats NZ DataInfo+, "Selected Price Indexes", accessed 2026-07-02. https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65
4. Stats NZ DataInfo+, "Food Price Index", accessed 2026-07-02. https://datainfoplus.stats.govt.nz/item/nz.govt.stats/749d8c27-1bed-45fb-b941-a1905aee632f
5. Stats NZ DataInfo+, "Consumers Price Index", accessed 2026-07-02. https://datainfoplus.stats.govt.nz/Item/nz.govt.stats/8b0860b8-cf63-4f12-a578-8eed8ba69ac3
6. Stats NZ, "Household living-costs price indexes review: 2024", accessed 2026-07-02. https://www.stats.govt.nz/methods/household-living-costs-price-indexes-review-2024/
7. Commerce Commission, "Grocery", accessed 2026-07-02. https://www.comcom.govt.nz/regulated-industries/grocery/
8. Commerce Commission, "Market study into the grocery sector", accessed 2026-07-02. https://www.comcom.govt.nz/regulated-industries/projects/market-study-into-retail-grocery-sector/
9. Commerce Commission, "Pricing your products or services", accessed 2026-07-02. https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/
10. Consumer Protection, "Misleading prices or advertising", accessed 2026-07-02. https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising
11. Grocer public base DuckDB asset, accessed 2026-07-02. https://assets-prod.grocer.nz/public/base_v3.duckdb.br
12. Grocer public PAK'nSAVE Papakura current price parquet example, accessed 2026-07-02. https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet
13. Grocer public product 5452 price-history parquet example, accessed 2026-07-02. https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet
14. The Colab `.skills` `grocer-nz` API notes, accessed 2026-07-02. https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md
15. The For Good Project, "Grocer NZ exposes useful public price data, but not a safe bulk republication licence", accessed 2026-07-02. https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/grocer-nz-data-audit.md
16. Google Play, "Grocer", accessed 2026-07-02. https://play.google.com/store/apps/details?hl=en_US&id=nz.grocer.twa
17. Consumer NZ, "The 3 best grocery price comparison tools in New Zealand", 12 December 2025, accessed 2026-07-02. https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand
