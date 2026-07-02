---
title: "Grocer NZ exposes useful public price data, but not a safe bulk republication licence"
domain: "other"
issue: "#74"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-02"
status: "draft"
---

# Grocer NZ exposes useful public price data, but not a safe bulk republication licence

## Executive answer

- The `grocer-nz` skill reads Grocer's public CDN and public frontend search service: `base_v3.duckdb.br`, per-store current-price parquet files, per-product history parquet files, and the `products` Meilisearch index [Grocer skill notes, 2026-05-31](https://github.com/thecolab-ai/.skills/tree/main/skills/grocer-nz).
- A live run on 2026-07-02 found 473 stores in the base catalogue, 465 enabled stores, 6 vendor labels, 108,990 products, 109,855 barcode rows, and 714 collections in `base_v3.duckdb.br`; the CDN served that base file with `Last-Modified: Wed, 01 Jul 2026 18:21:50 GMT` and `Cache-Control: ... max-age=28800`, so treat counts as point-in-time [Grocer base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).
- Enabled-store coverage in the live base catalogue was Woolworths 181, New World 148, Fresh Choice 77, PAK'nSAVE 57, Super Value 1, and The Warehouse 1; this is Grocer coverage, not proof that every NZ grocery store or every retailer SKU is present [Grocer base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).
- Current price files expose store/product timestamps plus original, sale, club, online, and multibuy price fields; history files are leaner and expose only timestamp, store, and price for a requested product [Grocer API notes, 2026-05-31](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md).
- The For Good Project can safely publish small quoted examples, aggregate analysis, methods, source URLs, access dates, and citations; it should not republish Grocer's bulk parquet/DuckDB data, a derivative bulk extract, or retailer-naming allegations without legal review and exact product/store/date evidence, because Grocer's terms disclaim price accuracy and do not grant a redistribution licence, while retailer terms also restrict website/service reuse [Grocer terms](https://grocer.nz/terms-of-service), [Foodstuffs online shopping terms](https://www.clubplus.co.nz/terms/online-shopping), [Woolworths NZ terms](https://www.woolworths.co.nz/info/terms-and-conditions/online-shopping-website-and-app).

**Overall confidence:** Medium — the technical data-shape and current counts are high-confidence point-in-time observations from live public assets, but the reuse-rights conclusion is a conservative non-legal assessment because no explicit Grocer or retailer bulk-data licence was found.

## Evidence

### What the skill exposes

The skill documents four public Grocer data surfaces: `https://assets-prod.grocer.nz/public/base_v3.duckdb.br`, current price files at `prices_per_store_v3/public_prices_<store_id>.parquet`, history files at `price_history_v3/price_history_<product_id>.parquet`, and the public Meilisearch `products` index at `https://meilisearch.grocer.nz` [Grocer API notes, 2026-05-31](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md).

The base DuckDB schema includes `public_meta`, `public_vendors`, `public_stores`, `public_products`, `public_barcodes`, `public_prices`, `public_collections`, `public_collection_members`, `public_collection_hierarchy`, and `public_price_history`; the skill uses the base catalogue plus external parquet files for current prices and per-product history [Grocer API notes, 2026-05-31](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md), [Grocer base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).

Product metadata fields are `id`, `name`, `brand`, `unit`, `size`, and `redirected_to`; store metadata fields are `id`, `vendor_id`, `name`, and `is_enabled`; vendor metadata fields are `id` and `name` [Grocer API notes, 2026-05-31](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md).

Current price fields are `updated_at`, `store_id`, `product_id`, `original_price_cent`, `sale_price_cent`, `club_price_cent`, `online_price_cent`, `multibuy_price_cent`, `multibuy_quantity`, `club_multibuy_price_cent`, and `club_multibuy_quantity`; prices are stored in NZ cents, so `550` means NZ$5.50 [Grocer API notes, 2026-05-31](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md).

The observed per-product history parquet schema is materially narrower than current prices: `updated_at`, `store_id`, and `price_cent`, with product id inferred from the file path by the skill [Grocer API notes, 2026-05-31](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md).

### Coverage and update evidence

On 2026-07-02, a local read-only DuckDB query of `base_v3.duckdb.br` found 473 stores, 465 enabled stores, 6 vendors, 108,990 products, 109,855 barcode rows, 714 collections, 325,107 collection-member rows, and 713 collection-hierarchy rows [Grocer base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).

The enabled-store counts by vendor in that same run were: Fresh Choice 77, New World 148, PAK'nSAVE 57, Super Value 1, The Warehouse 1, and Woolworths 181 [Grocer base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).

The base catalogue's `public_meta.updated_at` value was `2026-07-01T20:21:43.101870+02:00`; the CDN response for the base asset also carried `Last-Modified: Wed, 01 Jul 2026 18:21:50 GMT`, `Cache-Control: public, no-transform, s-maxage=57600, max-age=28800`, and `cf-cache-status: HIT` when checked on 2026-07-02 [Grocer base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).

The PAK'nSAVE Papakura current-price file (`store_id=230`) contained 11,650 product rows with `updated_at` values from `2026-06-28T19:02:01.387000+02:00` to `2026-07-01T19:04:01.365000+02:00`; the CDN response for that file reported `Last-Modified: Wed, 01 Jul 2026 18:22:42 GMT` and `Cache-Control: ... max-age=28800` when checked on 2026-07-02 [Grocer PAK'nSAVE Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet).

Three other Papakura-area current-price files showed different row counts and promotion-field patterns: Woolworths Papakura (`store_id=118`) had 15,621 product rows, 14,160 rows with `sale_price_cent`, and 1,462 rows with `club_price_cent`; New World Papakura (`store_id=307`) had 13,157 product rows and 2,923 rows with `club_price_cent`; Fresh Choice Papakura (`store_id=206`) had 5,995 product rows and 1,431 rows with `sale_price_cent` [Grocer Woolworths Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [Grocer New World Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Fresh Choice Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet).

The App Store and Google Play listings both describe Grocer as a New Zealand grocery price comparison app that can compare prices across stores and view price history, which independently matches the observed skill surfaces [Apple App Store, accessed 2026-07-02](https://apps.apple.com/us/app/grocer/id1643813830), [Google Play, accessed 2026-07-02](https://play.google.com/store/apps/details?hl=en_US&id=nz.grocer.twa).

### History depth and caveats

For product `5461` (Anchor Milk Lite 98.5% Fat Free 2L), the history file contained 491,602 rows across 388 store ids, with dates from `2022-06-14T13:00:00+02:00` to `2026-06-29T03:00:00+02:00` in the live 2026-07-02 run [Grocer history file for product 5461](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5461.parquet).

History depth is product-specific, not a universal four-year guarantee: the skill documentation warns that historical availability varies and that some products or stores have no history parquet or no rows for a selected store [Grocer skill notes, 2026-05-31](https://github.com/thecolab-ai/.skills/tree/main/skills/grocer-nz).

Some history rows may not join back to a current enabled store name; in the `5461` run, the largest unmatched bucket had 6,614 rows with no joined store name, so historical analysis should report unmatched or retired store ids instead of silently dropping them [Grocer history file for product 5461](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5461.parquet), [Grocer base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).

Current product coverage is per-store and per-retailer rather than universal: among four Papakura stores, product `1` appeared in 2 stores, product `4` appeared in 4 stores, and product `5461` appeared in 3 stores in the live 2026-07-02 query [Grocer PAK'nSAVE Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer Woolworths Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [Grocer New World Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Fresh Choice Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet).

Grocer's own terms say the service collects and displays retailer pricing information, but also say prices may vary by location and time and that Grocer cannot guarantee all displayed prices are accurate [Grocer terms](https://grocer.nz/terms-of-service).

### Reuse and republication limits

Grocer's public terms, last updated 2025-04-08 in the bundled frontend asset, describe price comparison as the service purpose and include no explicit licence allowing third parties to copy, redistribute, mirror, or publish bulk extracts of the DuckDB/parquet data [Grocer terms](https://grocer.nz/terms-of-service).

Grocer's terms prohibit attempting unauthorised access and interfering with or disrupting the service, so any use should stay within documented public asset reads, low-volume reproducible analysis, and normal citation rather than attempting to bypass sign-in, rate limits, or private Pro/user-list features [Grocer terms](https://grocer.nz/terms-of-service).

Foodstuffs' online shopping terms say New World, PAK'nSAVE, and Four Square online shopping services let users search for and purchase groceries, that use of those services is governed by the terms, that the systems and intellectual-property rights supporting the services are owned or controlled by Foodstuffs entities, and that online shopping requires Club+ registration [Foodstuffs online shopping terms](https://www.clubplus.co.nz/terms/online-shopping).

Foodstuffs' terms also warn that the checkout order value is only estimated and the final value may change because of variable-weight items, substitutions, missing items, or special requests; that is relevant because downstream analysis should not present Grocer rows as a final transaction price for every shop [Foodstuffs online shopping terms](https://www.clubplus.co.nz/terms/online-shopping).

Woolworths NZ's online shopping, website, and app terms apply to its New Zealand websites and mobile apps, and search-result text from the official terms page says Woolworths may cancel orders for errors in a product price or description and that amended orders update to current website prices rather than preserving earlier prices [Woolworths NZ terms](https://www.woolworths.co.nz/info/terms-and-conditions/online-shopping-website-and-app).

MBIE's copyright guidance says copyright protects expression rather than mere information, ideas, schemes, or methods, while Data.govt.nz's NZGOAL guidance notes that database and dataset reuse can raise copyright, licensing, and access-control issues and is not legal advice; together, these support a conservative distinction between citing facts/analysis and republishing a compiled database [MBIE copyright guidance](https://www.mbie.govt.nz/business-and-employment/business/intellectual-property/copyright/copyright-protection-in-new-zealand), [Data.govt.nz NZGOAL guidance note 4](https://www.data.govt.nz/manage-data/policies/nzgoal/guidance-note-4).

Recommended citation/provenance for later work: "Grocer.nz public price data, accessed YYYY-MM-DD, source asset `<exact CDN URL>`, queried with `thecolab-ai/.skills` `grocer-nz` skill at commit `aa2b19e02c2f8345bb0ab4dcaec99fb8cd0babf5`; prices in NZ cents; store/product ids retained; analysis code and access date published; no bulk data redistributed" [Grocer skill notes](https://github.com/thecolab-ai/.skills/tree/main/skills/grocer-nz), [Grocer base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Grocer exposes current per-store prices and historical per-product prices through public data surfaces. | [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md) | [Apple App Store feature listing](https://apps.apple.com/us/app/grocer/id1643813830) and [Google Play feature listing](https://play.google.com/store/apps/details?hl=en_US&id=nz.grocer.twa) | High |
| The live base catalogue had 465 enabled stores and 108,990 products on 2026-07-02. | [Grocer base asset](https://assets-prod.grocer.nz/public/base_v3.duckdb.br) | No independent source found for Grocer's exact internal counts; this is a reproducible live query result, not independently published metadata. | Medium |
| Some individual product histories reach back to 2022, but this is not guaranteed for every product/store. | [Product 5461 history file](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5461.parquet) | [Grocer skill notes warning that history varies](https://github.com/thecolab-ai/.skills/tree/main/skills/grocer-nz) | Medium |
| Bulk republication should not proceed without permission or legal review. | [Grocer terms have no bulk-data licence and disclaim accuracy](https://grocer.nz/terms-of-service) | [Foodstuffs terms reserve service/IP control](https://www.clubplus.co.nz/terms/online-shopping), [MBIE copyright guidance](https://www.mbie.govt.nz/business-and-employment/business/intellectual-property/copyright/copyright-protection-in-new-zealand) | Medium |

## What would change this conclusion

- A written licence or public statement from Grocer permitting bulk reuse, redistribution, or sublicensing of the DuckDB/parquet assets would change the republication conclusion.
- A written permission or open-data/API licence from Foodstuffs, Woolworths NZ, The Warehouse, or another upstream retailer covering downstream price-data reuse would reduce the current retailer-terms risk.
- A full crawl of all enabled per-store current-price files and a systematic sample of many product-history files would improve coverage and history-depth confidence beyond the bounded live checks used here.
- A legal opinion from a New Zealand IP/contract lawyer would be needed before publishing a bulk derivative database, a retailer leaderboard, or allegations about misleading specials.
- I could not verify Grocer's upstream data-collection method, exact scrape/update schedule, treatment of delisted products, or whether every public CDN file is intentionally licensed for third-party analytical reuse.

## Open follow-up questions

- Which representative basket products have robust history across all major vendors, and which should be excluded because their Grocer history is too sparse?
- How should downstream analyses treat club/member-only prices, multibuy prices, online-only prices, and variable-weight items?
- What exact legal threshold should The For Good Project apply before naming a retailer in a public claim about promotional or reference-pricing behaviour?

## Sources

1. Grocer public base database, `https://assets-prod.grocer.nz/public/base_v3.duckdb.br`, accessed 2026-07-02.
2. Grocer public PAK'nSAVE Papakura current-price file, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet`, accessed 2026-07-02.
3. Grocer public Woolworths Papakura current-price file, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet`, accessed 2026-07-02.
4. Grocer public New World Papakura current-price file, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet`, accessed 2026-07-02.
5. Grocer public Fresh Choice Papakura current-price file, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet`, accessed 2026-07-02.
6. Grocer public product-history file for product `5461`, `https://assets-prod.grocer.nz/public/price_history_v3/price_history_5461.parquet`, accessed 2026-07-02.
7. The Colab `.skills` `grocer-nz` skill and API notes, https://github.com/thecolab-ai/.skills/tree/main/skills/grocer-nz, accessed 2026-07-02.
8. Grocer Terms of Service, https://grocer.nz/terms-of-service, accessed 2026-07-02.
9. Grocer Privacy Policy, https://grocer.nz/privacy-policy, accessed 2026-07-02.
10. Grocer App Store listing, https://apps.apple.com/us/app/grocer/id1643813830, accessed 2026-07-02.
11. Grocer Google Play listing, https://play.google.com/store/apps/details?hl=en_US&id=nz.grocer.twa, accessed 2026-07-02.
12. Foodstuffs Supermarkets Online Shopping Terms and Conditions, https://www.clubplus.co.nz/terms/online-shopping, accessed 2026-07-02.
13. Woolworths NZ Online Shopping, Website and App Terms and Conditions, https://www.woolworths.co.nz/info/terms-and-conditions/online-shopping-website-and-app, accessed 2026-07-02.
14. MBIE, "Copyright protection in New Zealand", https://www.mbie.govt.nz/business-and-employment/business/intellectual-property/copyright/copyright-protection-in-new-zealand, accessed 2026-07-02.
15. Data.govt.nz, "NZGOAL Guidance Note 4: Databases and datasets", https://www.data.govt.nz/manage-data/policies/nzgoal/guidance-note-4, accessed 2026-07-02.
