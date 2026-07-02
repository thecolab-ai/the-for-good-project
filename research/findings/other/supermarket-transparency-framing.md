---
title: "Supermarket price transparency should fan out from a data-rights and methodology-first research frame"
domain: "other"
issue: "#61"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-02"
status: "draft"
---

# Supermarket price transparency should fan out from a data-rights and methodology-first research frame

## Executive answer

- This stream is tractable because there is an official aggregate baseline from Stats NZ and a public shelf-level data route through Grocer/current-retailer sources, but the first research task must audit coverage, provenance, and reuse rights before any public republication of price data. Stats NZ's Selected Price Indexes include the full food group and collect about 19,000 prices from 560 retail outlets, while Grocer exposes current per-store price rows and per-product history assets that can be queried without login [Stats NZ DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65), [Grocer public assets](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).
- The stream should not try to answer "are specials misleading?" at discover stage. Commerce Commission guidance says price representations must be clear, accurate, and unambiguous, and MBIE Consumer Protection says non-genuine specials or discounts can be misleading, so retailer-naming claims need exact product, store, date, and source evidence plus a conservative method that reports observable price patterns rather than intent [Commerce Commission](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/), [Consumer Protection](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising).
- The Grocery Commissioner is a plausible owner desk because the Commerce Commission says its grocery work includes "creating pricing and promotional transparency for consumers" and pricing/promotional practices are among its grocery-sector enforcement priorities [Commerce Commission grocery page](https://www.comcom.govt.nz/regulated-industries/grocery/).
- I opened five depth-1 research issues: data coverage/reuse rights (#74), shelf-level basket versus Stats NZ indexes (#76), reference-pricing methodology (#75), NZ law/regulator powers (#78), and the gap left by current shopper tools (#77).

**Overall confidence:** Medium -- the official/regulatory framing is well sourced, and small live data smoke tests show tractability, but terms-of-use, full coverage, and retailer-safe methodology still need dedicated research before public claims.

## Evidence

### The official baseline is aggregate, not shelf-level

Stats NZ's Selected Price Indexes combine the Food Price Index, rental price indexes, and other monthly price index data into one release, and the food group includes fruit and vegetables, meat/poultry/fish, grocery food, non-alcoholic beverages, and restaurant meals/ready-to-eat food [Stats NZ DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65). Stats NZ records that SPI methodology collects about 19,000 prices from 560 retail outlets, and food prices are collected online, by visiting retail outlets, and from sources such as checkout scanner data [Stats NZ DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65).

Stats NZ also cautions that weighted average retail prices in SPI releases are not statistically accurate measures of average transaction price levels, though they are reliable indicators of percentage price change [Stats NZ DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65). That limitation is central to this stream: SPI/FPI is the correct aggregate baseline for price movement, but it is not a substitute for a shopper-facing product/store price history.

The legacy Food Price Index metadata says the FPI measures food price change faced by households over time, is the only CPI commodity group prepared monthly, and is primarily a measure of price change rather than price levels or average prices [Stats NZ FPI DataInfo+](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/749d8c27-1bed-45fb-b941-a1905aee632f). The `.skills/skills/stats-nz` smoke test on 2026-07-02 also showed that the local `fpi` command still resolves the September 2023 FPI CSV, while current monthly food-price work should be cross-checked against Stats NZ's Selected Price Indexes pages and metadata before use [Stats NZ CSV URL returned by skill](https://www.stats.govt.nz/assets/Uploads/Food-price-index/Food-price-index-September-2023/Download-data/food-price-index-september-2023-index-numbers.csv), [Selected Price Indexes metadata](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65).

### Shelf-level data appears technically usable, but rights and coverage are unresolved

The `grocer-nz` skill documentation identifies public Grocer sources for a base DuckDB file, per-store current price parquet files, per-product price-history parquet files, and a product search index; the public asset paths are under `https://assets-prod.grocer.nz/public/` [Grocer public base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br), [Grocer public price-history path pattern](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet). A live smoke test on 2026-07-02 found enabled Papakura stores for Fresh Choice, New World, PAK'nSAVE, and Woolworths through the Grocer store table, and a search for Anchor Blue Top 2L milk returned current per-store fields including `original_price_cent`, `sale_price_cent`, `club_price_cent`, `online_price_cent`, `multibuy_price_cent`, and `updated_at` [Grocer public base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br), [Grocer Papakura current-price parquet example](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet).

The same smoke test found per-product history rows for product `5452` with `updated_at`, `store_id`, `vendor_id`, `store_name`, and `price_cent`, which is enough to study observed price movements over time if coverage and quality checks pass [Grocer public price-history example](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet). This is only a capability check: it is not evidence that any retailer misled shoppers, inflated a reference price, or behaved unlawfully.

Grocer's public app listing says the app helps users compare grocery prices across major supermarkets in New Zealand and view price history over time [Google Play](https://play.google.com/store/apps/details?hl=en_US&id=nz.grocer.twa). Grocer also publishes Terms of Service and Privacy Policy pages, but those pages need a dedicated rights audit before this project republishes any substantial extract or builds a public dataset from the underlying assets [Grocer Terms of Service](https://grocer.nz/terms-of-service), [Grocer Privacy Policy](https://grocer.nz/privacy-policy).

### There is a regulator/public-interest route, but it must stay evidence-led

The Commerce Commission's 2022 grocery market study page says the final report found competition was not working well for consumers and recommended changes to improve grocery price, quality, range, and service outcomes [Commerce Commission market study](https://www.comcom.govt.nz/regulated-industries/projects/market-study-into-retail-grocery-sector/). The Commission's current grocery page says the Grocery Industry Competition Act 2023 made it the grocery-sector regulator, that Pierre van Heerden was appointed as the first Grocery Commissioner on 13 July 2023, and that its work includes pricing/promotional transparency for consumers [Commerce Commission grocery page](https://www.comcom.govt.nz/regulated-industries/grocery/).

The same Commerce Commission grocery page says its grocery responsibilities sit alongside Fair Trading Act and Commerce Act enforcement, with priorities including pricing and promotional practices [Commerce Commission grocery page](https://www.comcom.govt.nz/regulated-industries/grocery/). This makes the Commission/Grocery Commissioner route plausible for a later policy brief, but only after research defines a defensible evidence threshold.

### Existing shopper tools reduce duplication risk but do not remove the public-interest gap

Consumer NZ reported in December 2025 that Grocer.nz, Grosave, and Price Pulse all aim to help supermarket shoppers compare prices, and it described Grocer.nz as regularly updated, covering major supermarkets including Fresh Choice and Super Value, and offering price-comparison history limits by tier [Consumer NZ](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand). Consumer NZ also described Price Pulse as offering product-level basket information with a six-month price history and comparisons with nearby supermarkets [Consumer NZ](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand).

That means a For Good output should not be "another grocery price app" unless later research finds a clear gap. The likely public-interest gap is narrower: a cited methodology, representative product histories, education about reference pricing, and regulator/newsroom-ready evidence packages that avoid bulk redistributing third-party data without permission.

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| The official monthly food-price baseline is designed for price-change measurement, not direct shelf-level or average transaction price claims. | [Stats NZ SPI metadata](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65) | [Stats NZ FPI metadata](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/749d8c27-1bed-45fb-b941-a1905aee632f) | High |
| This stream has a plausible regulator owner because the Commerce Commission now regulates groceries and explicitly lists pricing/promotional transparency and practices in its grocery work. | [Commerce Commission grocery page](https://www.comcom.govt.nz/regulated-industries/grocery/) | [Commerce Commission market study page](https://www.comcom.govt.nz/regulated-industries/projects/market-study-into-retail-grocery-sector/) | High |
| Publicly reachable Grocer assets can support product/store price-history research, but not yet public data republication. | [Grocer public base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br) | [Grocer app listing](https://play.google.com/store/apps/details?hl=en_US&id=nz.grocer.twa) | Medium |
| Retailer-naming promotion claims need a conservative evidence threshold because misleading price representations are regulated under Fair Trading Act/consumer guidance. | [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/) | [Consumer Protection misleading-pricing guidance](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising) | High |

## What would change this conclusion

- A data-rights audit could find that Grocer or retailer terms prohibit the planned reuse; that would push the stream toward methodology-only publication, aggregate summaries, or regulator/private handoff rather than public product-level extracts.
- A coverage audit could find that Grocer history is too sparse, biased by store/product availability, or too short for defensible promotion-cycle measurement; that would narrow the stream to education and policy rather than quantitative claims.
- A legal review could require a stricter threshold for any example involving named retailers, especially where the public might infer intent or illegality from price-movement patterns.
- I could not verify Grocer's full terms-of-service text in a static fetch because the web page is client-rendered in the browser fetcher used here; issue #74 should verify the terms in a rendered browser and, if necessary, seek permission or human legal review before republication.
- I did not verify whether Grocer's public asset availability is intentionally stable, how often each parquet file updates, or whether history depth varies materially by product/store; issue #74 covers that.
- I did not contact Stats NZ, the Commerce Commission, Grocer, retailers, Consumer NZ, or any household shoppers; lived-experience and regulator/legal authority are needed before this becomes an external artifact.

## Open follow-up questions

- #74 -- Audit Grocer NZ grocery price data coverage, history depth, and reuse rights.
- #76 -- Compare representative shelf-level grocery prices with Stats NZ food price indexes.
- #75 -- Define a defensible method for detecting supermarket reference-pricing and promotion cycles.
- #78 -- Map NZ law and regulator powers for misleading supermarket pricing and promotions.
- #77 -- Identify the supermarket transparency gap left by current NZ shopper tools.

## Sources

1. Stats NZ DataInfo+, "Selected Price Indexes", accessed 2026-07-02. https://datainfoplus.stats.govt.nz/item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65
2. Stats NZ DataInfo+, "Food Price Index", accessed 2026-07-02. https://datainfoplus.stats.govt.nz/item/nz.govt.stats/749d8c27-1bed-45fb-b941-a1905aee632f
3. Stats NZ, "Food price index: September 2023 - index numbers - CSV", accessed through `.skills/skills/stats-nz` on 2026-07-02. https://www.stats.govt.nz/assets/Uploads/Food-price-index/Food-price-index-September-2023/Download-data/food-price-index-september-2023-index-numbers.csv
4. Commerce Commission, "Grocery", accessed 2026-07-02. https://www.comcom.govt.nz/regulated-industries/grocery/
5. Commerce Commission, "Market study into the grocery sector", accessed 2026-07-02. https://www.comcom.govt.nz/regulated-industries/projects/market-study-into-retail-grocery-sector/
6. Commerce Commission, "Pricing your products or services", accessed 2026-07-02. https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/
7. Consumer Protection, "Misleading prices or advertising", accessed 2026-07-02. https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising
8. Grocer public base DuckDB asset, accessed via `.skills/skills/grocer-nz` on 2026-07-02. https://assets-prod.grocer.nz/public/base_v3.duckdb.br
9. Grocer public PAK'nSAVE Papakura current price parquet example, accessed via `.skills/skills/grocer-nz` on 2026-07-02. https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet
10. Grocer public product 5452 price-history parquet example, accessed via `.skills/skills/grocer-nz` on 2026-07-02. https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet
11. Grocer, "Terms of Service", accessed 2026-07-02. https://grocer.nz/terms-of-service
12. Grocer, "Privacy Policy", accessed 2026-07-02. https://grocer.nz/privacy-policy
13. Google Play, "Grocer", accessed 2026-07-02. https://play.google.com/store/apps/details?hl=en_US&id=nz.grocer.twa
14. Consumer NZ, "The 3 best grocery price comparison tools in New Zealand", 12 December 2025, accessed 2026-07-02. https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand
