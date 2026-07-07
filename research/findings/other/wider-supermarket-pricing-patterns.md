---
title: "A wider 61-SKU, four-region Grocer sample supports promotion-cycling and price-gap screens, but weakens any blanket cross-chain lockstep claim"
domain: "other"
issue: "#749"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-08"
status: "draft"
---

# A wider 61-SKU, four-region Grocer sample supports promotion-cycling and price-gap screens, but weakens any blanket cross-chain lockstep claim

## Executive answer

- I tested a category-stratified public Grocer.nz sample of 61 packaged grocery/household SKUs across 12 stores in four urban clusters: Papakura, Lower Hutt, Christchurch, and Dunedin. The selected stores cover Woolworths, New World, and PAK'nSAVE in each cluster; the sample excludes fresh produce, alcohol, and pets because the issue is about comparable SKU price patterns and those categories raise stronger product-comparability or age-restriction concerns [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md); [Grocer public base database](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).
- The earlier Papakura promotion-cycling pattern is directionally representative for this wider sample: across 732 observed store-SKU histories from 2024-07-01 to 2026-07-01, the median product/store spent 78.1% of weighted days below 95% of its own observed maximum price, and the exact maximum price was charged for a median 15.7% of weighted days [Grocer product-history files, URL form](https://assets-prod.grocer.nz/public/price_history_v3/price_history_3571.parquet).
- The earlier cross-chain "alternation" pattern exists beyond Coca-Cola/Papakura, but it is not universal and should not be described as lockstep: among 242 calculable Woolworths-vs-New World product-region pairs, the median daily price correlation was -0.01, 46 pairs met a strict negative-correlation alternation screen, no pair had correlation above +0.7, and exact floor/ceiling matches were minority events [Grocer product-history files, URL form](https://assets-prod.grocer.nz/public/price_history_v3/price_history_7132.parquet).
- The same-day price-gap pattern also generalises, though the extreme examples should stay examples rather than category claims: in current rows for the 61 SKUs across the 12 stores, the median all-store max/min effective-price ratio was 1.44x; 47 of 61 SKUs had at least a 1.25x all-store gap, 20 had at least 1.5x, and 5 had at least 2.0x [Grocer current price files, URL form](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).
- Threshold implication: use `>50% below 95% of max` and `<25% exact-max support` only as broad internal screens, because they catch common pricing behaviour in this sample. For a reference-pricing method that is worth human review, the wider sample supports stricter thresholds such as product-median `>80% below 95% of max`, product-median `<10% exact-max support`, all-store current gap `>=1.5x`, or strict alternation defined by correlation `< -0.3` plus balanced cheap-chain leadership and frequent leader switches. None of these is a legal threshold, and no named retailer/product claim should be published without the actual consumer-facing "was", "now", "special", or equivalent representation [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/); [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act).

**Overall confidence:** Medium - the arithmetic is reproducible from public Grocer assets and the sample is materially wider than the earlier Papakura findings, but this is still a deterministic public-data sample, not a random national audit, not transaction data, and not proof of what any shelf ticket or website represented to shoppers.

## Evidence

### Question answered and sample design

I answered the narrow empirical question: whether the Papakura promotion-cycling, cross-chain alternation, and same-day price-gap patterns remain visible when the basket is expanded to 50+ SKUs across several regions, and what project screening thresholds that wider sample supports [issue #749](https://github.com/thecolab-ai/the-for-good-project/issues/749).

The `grocer-nz` skill documents Grocer public static assets: a base DuckDB catalogue, per-store current-price parquet files, and per-product history parquet files; the current-price rows include component price fields while the history rows are leaner and expose timestamp, store, and price [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md); [grocer-nz API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md).

I selected 12 enabled stores in four clusters: Woolworths Papakura (`118`), New World Papakura (`307`), PAK'nSAVE Papakura (`230`), Woolworths Lower Hutt (`76`), New World Hutt City (`319`), PAK'nSAVE Lower Hutt (`254`), Woolworths Moorhouse Ave (`93`), New World Durham Street (`411`), PAK'nSAVE Moorhouse (`237`), Woolworths Dunedin Central (`37`), New World Centre City (`351`), and PAK'nSAVE Dunedin (`267`) [Grocer public base database](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).

The 61-SKU sample is category-stratified from products with current rows in all 12 selected stores and observed price history in at least 10 of the 12 stores: Baby & Toddler (`4`), Chilled (`10`), Drinks (`10`), Frozen (`9`), Health & Body (`6`), Household & Cleaning (`8`), and Pantry (`14`) [Grocer public base database](https://assets-prod.grocer.nz/public/base_v3.duckdb.br); [Grocer current price files, URL form](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

For each product/store history, I sorted rows by `updated_at`, treated each `price_cent` as staying in force until the next observed row for the same product/store, clipped intervals to 2024-07-01 through 2026-07-01, and weighted price shares by elapsed days rather than raw row counts; this matches the earlier promotion-cycling method and avoids over-weighting stores/products with more frequent observations [staples promotion-cycling finding](staples-promo-cycling.md); [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).

I used UTC day bucketing for the wider script because the issue is about pattern scale and thresholds, not exact local sale-day attribution; a future publication-ready example should repeat the calculation with New Zealand local dates because the earlier Papakura cross-chain finding showed date bucketing can shift event counts [supermarket cross-chain finding](supermarket-cross-chain-price-lockstep.md); [grocer-nz API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md).

### Promotion cycling is common at scale

Across 732 product/store histories with at least one in-window observation, the median history had 716 in-window observations, 16 distinct observed prices, and a maximum same-product/store observation gap of 4.8 days; this means most sample histories were dense enough for broad pattern screening, but one sparse history had a 468.5-day gap: product `371` at PAK'nSAVE Lower Hutt (`254`). The next-largest observed gap was 141.25 days, so long-gap examples should be checked before using a product/store history as a publication-ready example [Grocer product-history files, product 371](https://assets-prod.grocer.nz/public/price_history_v3/price_history_371.parquet); [Grocer product-history files, URL form](https://assets-prod.grocer.nz/public/price_history_v3/price_history_3571.parquet).

The main promotion-cycling result is stronger than the old Papakura warning allowed: 595 of 732 store-SKU histories spent more than half their weighted days below 95% of their own observed maximum price, and 443 of 732 spent more than two-thirds of weighted days below that near-ceiling band [Grocer product-history files, URL form](https://assets-prod.grocer.nz/public/price_history_v3/price_history_3571.parquet).

At product level, 54 of 61 SKUs had a median-across-stores below-95%-of-max share above 50%, 32 of 61 were above two-thirds, 28 of 61 were above 75%, 22 of 61 were above 80%, and 6 of 61 were above 90% [Grocer product-history files, URL form](https://assets-prod.grocer.nz/public/price_history_v3/price_history_3571.parquet).

The exact maximum price was less common than the broad near-ceiling band: 520 of 732 store-SKU histories had exact-maximum support below 25% of weighted days, 278 of 732 were below 10%, and 46 of 61 products had product-median exact-maximum support below 25% [Grocer product-history files, URL form](https://assets-prod.grocer.nz/public/price_history_v3/price_history_3571.parquet).

This supports the old finding's direction but not over-claiming: "the high observed price is often not the time-weighted usual price" is broadly supported, while "every special is suspect" is not supported because below-ceiling cycling is normal in the sample and history rows do not preserve shelf-ticket wording [staples promotion-cycling finding](staples-promo-cycling.md); [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/).

Compact product-level examples from the wider sample:

| Product ID | Category | SKU | Store histories | Median below 95% max | Median exact-max support |
|---:|---|---|---:|---:|---:|
| `7132` | Baby & Toddler | Huggies Ultra Dry Bulk Boys Size 6 nappies 30 pack | 12 | 67% | 16% |
| `4` | Drinks | Pump Spring Water Pure 750ml | 12 | 97% | 3% |
| `3571` | Chilled | Vitasoy UHT Soy Milky Regular 1L | 12 | 66% | 12% |
| `3414` | Frozen | McCain Peas 1kg | 12 | 61% | 21% |
| `8` | Health & Body | Nivea Rich Nourishing Body Lotion 400ml | 12 | 62% | 6% |
| `5395` | Household & Cleaning | Persil Laundry Powder Ultimate 1kg | 12 | 78% | 16% |
| `72` | Pantry | Chelsea White Sugar 1.5kg | 12 | 73% | 10% |

All rows in the table are derived from Grocer product-history files using the documented URL form `https://assets-prod.grocer.nz/public/price_history_v3/price_history_<product_id>.parquet`, with exact product IDs shown in the first column [Grocer product-history example, product 7132](https://assets-prod.grocer.nz/public/price_history_v3/price_history_7132.parquet).

### Cross-chain alternation is real but not universal

For cross-chain timing, I compared Woolworths and New World daily forward-filled price series inside each of the four clusters, giving 244 product-region pairs and 242 pairs with a calculable Pearson correlation [Grocer product-history files, URL form](https://assets-prod.grocer.nz/public/price_history_v3/price_history_7132.parquet).

The wider sample does not support a blanket "lockstep" claim: median Woolworths-vs-New World correlation was -0.01, the middle 50% of correlations ran from -0.22 to +0.16, the lowest correlation was -0.70, and the highest was only +0.59 [Grocer product-history files, URL form](https://assets-prod.grocer.nz/public/price_history_v3/price_history_7132.parquet).

Exact price floors and ceilings were not usually shared: 26 of 244 product-region pairs had matching observed floors and 76 of 244 had matching observed ceilings [Grocer product-history files, URL form](https://assets-prod.grocer.nz/public/price_history_v3/price_history_7132.parquet).

I defined a strict alternation screen as: daily correlation below -0.3, at least 180 days where one chain was at least 5% cheaper than the other, each chain leading on at least 30% of those gap days, and at least 20 cheap-chain leader switches across the two-year window; 46 of 242 calculable product-region pairs met that screen [Grocer product-history files, URL form](https://assets-prod.grocer.nz/public/price_history_v3/price_history_7132.parquet).

Strict alternation examples include Huggies Ultra Dry nappies in Papakura and Lower Hutt, Pump water in Christchurch and Dunedin, and Anchor Uno yoghurt in Papakura and Lower Hutt; these are descriptive price-history patterns only and do not establish why the chains moved that way [Grocer product-history files, product 7132](https://assets-prod.grocer.nz/public/price_history_v3/price_history_7132.parquet); [Grocer product-history files, product 4](https://assets-prod.grocer.nz/public/price_history_v3/price_history_4.parquet).

| Product ID | Region | SKU | Correlation | WW/NW cheap-leader share | Leader switches |
|---:|---|---|---:|---:|---:|
| `7132` | Auckland/Papakura | Huggies Ultra Dry Bulk Boys Size 6 nappies 30 pack | -0.70 | 51% / 49% | 84 |
| `7132` | Wellington/Lower Hutt | Huggies Ultra Dry Bulk Boys Size 6 nappies 30 pack | -0.70 | 52% / 48% | 84 |
| `4` | Dunedin | Pump Spring Water Pure 750ml | -0.58 | 47% / 53% | 78 |
| `4` | Christchurch | Pump Spring Water Pure 750ml | -0.57 | 47% / 53% | 78 |
| `4064` | Auckland/Papakura | Anchor Uno Squeezie Smooth Strawberry Yoghurt 100g | -0.54 | 55% / 45% | 74 |
| `20959` | Auckland/Papakura | Huggies Baby Wipes Unscented 240 pack | -0.53 | 53% / 47% | 80 |

The practical threshold supported by this result is not "same-week movement" by itself, because the broad cheap-leader switch screen was too permissive; for review triage, the stricter screen above is a better threshold than the earlier single-SKU narrative because it demands both negative co-movement and balanced alternation [supermarket cross-chain finding](supermarket-cross-chain-price-lockstep.md); [Grocer product-history files, URL form](https://assets-prod.grocer.nz/public/price_history_v3/price_history_7132.parquet).

### Same-day price gaps persist across regions

For current price gaps, I used the lowest available current component price among original, sale, club, and online fields for each product/store, matching the `grocer-nz` skill's effective-price rule; multibuy fields were not collapsed into single-unit prices because quantity-dependent offers need separate interpretation [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).

Across the 61 SKUs, the median all-store current max/min effective-price ratio was 1.44x, the mean was 1.49x, the middle 50% ran from 1.27x to 1.65x, and the maximum was 2.71x [Grocer current price files, URL form](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

The price-gap thresholds supported by the sample are: `>=1.25x` as a broad "worth showing shoppers" gap because it caught 47 of 61 SKUs; `>=1.5x` as a stronger education/regulator-triage threshold because it caught 20 of 61 SKUs; and `>=2.0x` as an exceptional example threshold because it caught only 5 of 61 SKUs [Grocer current price files, URL form](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

The same pattern appears inside regions rather than only across distant stores: using the maximum within-cluster ratio for each SKU, the median max regional ratio was 1.41x, 47 of 61 SKUs had a regional gap of at least 1.25x, 19 had at least 1.5x, and 5 had at least 2.0x [Grocer current price files, URL form](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

Top current-gap examples in this sample:

| Product ID | Category | SKU | Selected-store min | Selected-store max | All-store ratio | Max regional ratio |
|---:|---|---|---:|---:|---:|---:|
| `3100` | Household & Cleaning | Bic Clic 2000 Retractable Medium Point Blue Pens 3 pack | $1.99 | $5.39 | 2.71x | 2.11x |
| `3571` | Chilled | Vitasoy UHT Soy Milky Regular 1L | $2.49 | $5.39 | 2.16x | 2.16x |
| `197` | Pantry | Cadbury Dairy Milk Black Forest block 180g | $3.49 | $6.99 | 2.00x | 2.00x |
| `204` | Pantry | Cadbury Dairy Milk Caramello block 180g | $3.49 | $6.99 | 2.00x | 2.00x |
| `205` | Pantry | Cadbury Dairy Milk Chocolate block 180g | $3.49 | $6.99 | 2.00x | 2.00x |
| `8` | Health & Body | Nivea Rich Nourishing Body Lotion 400ml | $6.99 | $12.79 | 1.83x | 1.83x |
| `318` | Health & Body | Atkins Endulge Caramel Nut Chew 5 pack | $9.59 | $17.49 | 1.82x | 1.82x |
| `20953` | Baby & Toddler | Huggies Baby Wipes Fragrance Free 80 pack | $3.49 | $6.25 | 1.79x | 1.50x |

All rows in this table are derived from the 12 selected Grocer current-price store files using the documented URL form `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_<store_id>.parquet`, and are current-row observations rather than audited shelf labels [Grocer current price file example, Woolworths Papakura](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

### Threshold values supported for the reference-pricing method

The Commerce Commission says price representations must be clear, accurate, and unambiguous; it says "usual", "was", "normal", or "everyday" comparisons can mislead if the claimed usual price was never charged, deliberately inflated, one of many common prices, out of date, or very rarely the real selling price; and it says a routinely promotional price can become the usual selling price [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/).

Consumer Protection separately says the Fair Trading Act covers incorrect or misleading prices, fake discounts, misleading was/now promotions, and false or unsubstantiated claims, but the Act's application to a specific representation depends on the representation and context rather than a price-history metric alone [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act); [Fair Trading Act 1986](https://www.legislation.govt.nz/act/public/1986/121/en/latest/whole.html).

The wider sample therefore supports these project thresholds:

| Pattern | Internal screen | Review-ready threshold | Why this threshold |
|---|---:|---:|---|
| High observed price rarely charged | Product/store exact maximum charged `<25%` of weighted days | Product-median exact maximum `<10%`, or `<25%` plus captured "was/usual/everyday" representation | `<25%` is common enough to screen broadly; `<10%` is rarer and better for human review. |
| Continual below-ceiling cycling | Product/store below 95% of max `>50%` of weighted days | Product-median below 95% of max `>80%`, or `>66%` plus captured representation | `>50%` catches most store-SKUs, so it is too broad for publication; `>80%` captures 22 of 61 products and is a stronger triage cut. |
| Cross-chain alternation | WW-vs-NW correlation `<0` plus cheap-chain switches | Correlation `<-0.3`, at least 180 gap days, each chain cheap at least 30% of gap days, and at least 20 leader switches | The stricter screen caught 46 of 242 calculable pairs and avoids calling every frequent sale cycle "alternation." |
| Current price gap | All-store or regional max/min effective-price ratio `>=1.25x` | `>=1.5x` for education/regulator triage; `>=2.0x` for exceptional examples | `>=1.25x` is common, `>=1.5x` is material but not rare, and `>=2.0x` is unusual in this sample. |
| Publication-ready reference-pricing example | Any screen above | Captured shelf/online representation, exact product/store/date, dense history, component current-price fields where relevant, second-review reproduction, and legal/terms review | Grocer history cannot show what consumers were told, and price-history patterns are not legal findings. |

These thresholds should replace the earlier uncalibrated method values only as project triage thresholds; they are not Commerce Commission safe harbours, they are not legal advice, and they should not be used to allege misleading conduct without representation evidence [supermarket pricing-method finding](supermarket-pricing-method.md); [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| The Papakura promotion-cycling result generalises directionally: most wider-sample store-SKU histories spent most weighted days below their own near-ceiling band. | [Grocer product-history files, URL form](https://assets-prod.grocer.nz/public/price_history_v3/price_history_3571.parquet) | This finding's reproducible calculation over 732 store-SKU histories; no independent second-party source exists for the derived statistic. | Medium |
| The broader sample weakens a blanket cross-chain lockstep story: median WW-vs-NW correlation was near zero, no pair exceeded +0.7, and strict alternation appeared in a minority of pairs. | [Grocer product-history files, product 7132](https://assets-prod.grocer.nz/public/price_history_v3/price_history_7132.parquet) | [Grocer product-history files, product 4](https://assets-prod.grocer.nz/public/price_history_v3/price_history_4.parquet) plus the same reproducible calculation across all sampled products. | Medium |
| Same-day price gaps remain visible at scale, with a 1.44x median current all-store max/min ratio and 20 of 61 SKUs at or above 1.5x. | [Grocer current price files, URL form](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet) | This finding's reproducible calculation over 12 selected current-price store files; no independent second-party source exists for the exact derived statistic. | Medium |
| A routinely promotional price can become the usual selling price, but history rows alone cannot prove a misleading "was/now" representation. | [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/) | [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act) and [grocer-nz API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md) | High for the legal/data-shape distinction; Medium for applying it to this project method |
| The recommended numeric thresholds are project screens, not NZ legal thresholds. | [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/) | [Fair Trading Act 1986](https://www.legislation.govt.nz/act/public/1986/121/en/latest/whole.html) | High |

## What would change this conclusion

- A random or fully enumerated national product/store sample could change the threshold values because this sample is deterministic, category-stratified, and limited to products stocked across the selected 12 stores [Grocer public base database](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).
- Transaction-level or checkout data could change the "usual price" interpretation because Grocer history measures observed listed prices rather than quantities sold or prices paid by shoppers [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).
- Historical component-price fields would improve promotion classification because Grocer history rows do not preserve whether a price was original, sale, club, online, or multibuy; current rows expose those fields, but historical rows used here do not [grocer-nz API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md).
- Saved shelf tickets, website captures, retailer promotion feeds, or Commerce Commission findings could turn a price-history signal into a representation-specific assessment; without those, this finding should not be read as alleging any Fair Trading Act breach [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/); [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act).
- A legal review or written permission from Grocer could change what the project may safely republish, because the earlier data-audit finding treated bulk republication rights as unresolved and this finding intentionally republishes only derived statistics and compact examples [grocer-nz data-audit finding](grocer-nz-data-audit.md).
- I could not independently verify Grocer's upstream collection method, exact update schedule, or whether each current row exactly matched the in-store shelf label at the time a shopper visited [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).

## Open follow-up questions

- Should the next method version require New Zealand local-day bucketing for all event-timing screens, or only for publication-ready examples?
- Which sample frame is most defensible for a regulator brief: category-stratified common SKUs, Stats NZ food-price-index items that can be mapped to Grocer IDs, or all products with dense histories?
- Can the project obtain permission or legal advice for publishing derived Grocer.nz analysis tables without republishing bulk rows?

## Sources

1. The Colab `.skills` `grocer-nz` skill notes, accessed 2026-07-08. https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md
2. The Colab `.skills` `grocer-nz` API notes, accessed 2026-07-08. https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md
3. Grocer public base database, accessed 2026-07-08 via `grocer-nz` skill. https://assets-prod.grocer.nz/public/base_v3.duckdb.br
4. Grocer public current-price files for selected store IDs, URL form `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_<store_id>.parquet`, accessed 2026-07-08 via `grocer-nz` skill. Example: https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet
5. Grocer public product-history files for sampled product IDs, URL form `https://assets-prod.grocer.nz/public/price_history_v3/price_history_<product_id>.parquet`, accessed 2026-07-08 via `grocer-nz` skill. Sampled IDs: `4`, `6`, `8`, `72`, `166`, `172`, `192`, `193`, `194`, `195`, `197`, `198`, `200`, `201`, `203`, `204`, `205`, `216`, `219`, `230`, `255`, `264`, `269`, `277`, `289`, `290`, `298`, `299`, `303`, `318`, `371`, `3100`, `3409`, `3410`, `3412`, `3414`, `3417`, `3420`, `3423`, `3424`, `3427`, `3571`, `3574`, `3575`, `3601`, `3906`, `3920`, `4064`, `4066`, `4073`, `4074`, `5389`, `5390`, `5392`, `5394`, `5395`, `5397`, `6964`, `7132`, `20953`, `20959`. Example: https://assets-prod.grocer.nz/public/price_history_v3/price_history_7132.parquet
6. Commerce Commission. "Pricing your products or services", accessed 2026-07-08 using built-in web open. https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/
7. Consumer Protection. "Fair Trading Act", accessed 2026-07-08 using built-in web open. https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act
8. Consumer Protection. "Misleading prices or advertising", accessed 2026-07-08. https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising
9. Fair Trading Act 1986, New Zealand Legislation, latest version accessed 2026-07-08 using built-in web open. https://www.legislation.govt.nz/act/public/1986/121/en/latest/whole.html
10. The For Good Project. "Evidence-threshold method for supermarket reference-pricing", accessed 2026-07-08. https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/supermarket-pricing-method.md
11. The For Good Project. "In a two-store staples basket, the exact high 'regular' price was rarely the modal charged price", accessed 2026-07-08. https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/staples-promo-cycling.md
12. The For Good Project. "Woolworths and Foodstuffs Papakura stores rarely share exact price floors/ceilings...", accessed 2026-07-08. https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/supermarket-cross-chain-price-lockstep.md
13. The For Good Project. "Grocer NZ exposes useful public price data, but not a safe bulk republication licence", accessed 2026-07-08. https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/grocer-nz-data-audit.md
