---
title: "In a Papakura 25-SKU snapshot, PAK'nSAVE was cheapest on basket total and most items, but not every item"
domain: "other"
issue: "#698"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-07"
status: "draft"
---

# In a Papakura 25-SKU snapshot, PAK'nSAVE was cheapest on basket total and most items, but not every item

## Executive answer

- I compared a fixed 25-SKU basket across PAK'nSAVE Papakura (`store_id=230`), New World Papakura (`307`), and Woolworths Papakura (`118`) using Grocer.nz current per-store price files; Grocer.nz's public app listing describes Grocer as a tool to compare grocery prices across New Zealand supermarkets, and the `grocer-nz` skill documents the public base catalogue and per-store parquet price files used here [Google Play: Grocer](https://play.google.com/store/apps/details?id=nz.grocer.twa&hl=en_US), [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).
- On effective price, defined here as the minimum of `original_price_cent`, `sale_price_cent`, `club_price_cent`, and `online_price_cent` when present, PAK'nSAVE had the lowest basket total: **$134.13**, versus **$149.78** at New World and **$156.72** at Woolworths [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).
- PAK'nSAVE was also the cheapest banner on **21 of 25 SKUs (84%)**; New World was cheapest on **4 of 25 (16%)**, all four through either a lower produce price or a club/effective price, and Woolworths was cheapest on none of these 25 SKUs [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).
- PAK'nSAVE's advantage was broad rather than only a few loss-leaders: its average winning margin was **70 cents** on the 21 SKUs it won, while its average loss was **80 cents** on the 4 SKUs it lost; the single largest PAK'nSAVE win was tomatoes at **$2.80/kg** under the next cheapest store, but removing that one item still leaves PAK'nSAVE with 20 item wins and the lowest basket total [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).
- The result is a same-region, same-snapshot test, not proof of a national or permanent "lowest food prices" claim. PAK'nSAVE itself says its Top 50 Price Check compares advertised prices for commonly shopped items against comparable Woolworths stores and warns that local pricing, day, advertised specials, and discounts can differ [PAK'nSAVE Top 50 Price Check](https://www.paknsave.co.nz/pricecheck).

**Overall confidence:** Medium - the basket arithmetic is reproducible from exact public Grocer current-price files, but it is one region, one snapshot, one hand-built basket, and it relies on Grocer's public price data rather than retailer checkout receipts.

## Evidence

### Scope and method

This finding answers a narrow question: on the same Grocer current-price snapshot for one Papakura trio, did PAK'nSAVE beat New World and Woolworths on a fixed basket total and on item-level win share [Issue #698](https://github.com/thecolab-ai/the-for-good-project/issues/698).

The store trio was fixed before calculating the result: PAK'nSAVE Papakura (`store_id=230`), New World Papakura (`307`), and Woolworths Papakura (`118`). The `grocer-nz` store lookup returned those public store IDs for Papakura stores, and the current-price rows for the fixed basket came from Grocer's public per-store parquet files [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md), [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

I used 25 exact Grocer product IDs with current rows in all three stores: 10 produce SKUs and 15 packaged grocery SKUs. Product names, brands, sizes, and units came from Grocer's public base catalogue, while the price rows came from the three per-store current-price files [Grocer public base catalogue](https://assets-prod.grocer.nz/public/base_v3.duckdb.br), [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

All 75 product-store rows used in the effective-price calculation had `updated_at` timestamps on 2026-07-01 in the Grocer data; the three per-store price files returned HTTP 200 to `curl -I` on 2026-07-07 and had CDN `last-modified` dates on 2026-07-06 [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

The effective-price comparison uses `least(coalesce(sale_price_cent), coalesce(club_price_cent), coalesce(online_price_cent), coalesce(original_price_cent))`, matching the `grocer-nz` skill's documented conservative effective-price rule; multibuy was not used because the skill notes say multibuy needs human interpretation because quantity matters [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).

### Basket result

| Banner | Basket total, effective price | Item wins | Item-win share |
|---|---:|---:|---:|
| PAK'nSAVE Papakura | $134.13 | 21 / 25 | 84% |
| New World Papakura | $149.78 | 4 / 25 | 16% |
| Woolworths Papakura | $156.72 | 0 / 25 | 0% |

The table above is a direct sum of one unit of each fixed basket SKU at each store, using cents from Grocer's three public per-store price files; it is not weighted by household expenditure or purchase frequency [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

On original shelf price only, excluding sale, club, and online fields, PAK'nSAVE's result was stronger: **$134.13** versus **$159.78** at New World and **$160.78** at Woolworths, with PAK'nSAVE cheapest on 24 of 25 SKUs and New World cheapest on one SKU, imported navel oranges [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

### Per-SKU winners

| Product ID | SKU | PAK'nSAVE | New World | Woolworths | Cheapest banner |
|---:|---|---:|---:|---:|---|
| 11 | Bananas Yellow Fair Trade 850g, per kg | $3.29 | $3.79 | $3.75 | PAK'nSAVE |
| 13 | Carrots Loose, per kg | $1.69 | $2.29 | $1.95 | PAK'nSAVE |
| 24 | Cauliflower Whole, each | $3.99 | $4.99 | $4.50 | PAK'nSAVE |
| 30 | Onions Brown, per kg | $1.49 | $1.99 | $1.69 | PAK'nSAVE |
| 39 | Potatoes Loose Washed White, per kg | $2.99 | $3.49 | $3.45 | PAK'nSAVE |
| 42 | Loose Red Tomatoes, per kg | $5.99 | $8.79 | $8.99 | PAK'nSAVE |
| 45 | Imported Navel Oranges, per kg | $4.49 | $3.99 | $5.90 | New World |
| 72 | Chelsea White Sugar 1.5kg | $2.99 | $3.59 | $3.85 | PAK'nSAVE |
| 73 | Broccoli Head, each | $1.99 | $2.29 | $2.50 | PAK'nSAVE |
| 77 | Telegraph Cucumber, each | $4.49 | $5.49 | $5.50 | PAK'nSAVE |
| 81 | Kiwifruit Green Loose, per kg | $2.99 | $4.99 | $3.50 | PAK'nSAVE |
| 4081 | Anchor Butter 500g | $9.99 | $9.29 | $10.40 | New World |
| 4085 | Tip Top Supersoft White Toast 700g | $3.97 | $4.37 | $4.37 | PAK'nSAVE |
| 5452 | Anchor Milk Blue Top 2L | $5.79 | $6.04 | $6.04 | PAK'nSAVE |
| 6403 | Sanitarium Weet-Bix 1.2kg | $8.19 | $9.49 | $8.96 | PAK'nSAVE |
| 6655 | Coca Cola Classic 1.5L | $2.69 | $3.49 | $4.99 | PAK'nSAVE |
| 6728 | Dilmah Tagless Tea Bags 100pk | $5.79 | $6.29 | $6.50 | PAK'nSAVE |
| 7785 | Mainland Tasty Cheddar 1kg | $18.69 | $19.89 | $19.89 | PAK'nSAVE |
| 14775 | Better Eggs Free Range Size 8 10pk | $8.99 | $10.49 | $11.15 | PAK'nSAVE |
| 18590 | Nescafe Classic Fine Blend Instant Coffee 100g | $7.39 | $5.99 | $10.29 | New World |
| 19348 | John West Tuna in Springwater 185g | $3.79 | $3.19 | $3.89 | New World |
| 20042 | Edmonds Standard Grade Flour 1.5kg | $3.19 | $3.79 | $3.79 | PAK'nSAVE |
| 21916 | Fortune Jasmine Rice 5kg | $14.69 | $15.99 | $15.25 | PAK'nSAVE |
| 23717 | Wattie's Baked Beans Regular 420g | $1.99 | $2.79 | $2.63 | PAK'nSAVE |
| 29242 | Diamond Penne Pasta 500g | $2.59 | $2.99 | $2.99 | PAK'nSAVE |

The per-SKU table is a compact publication of the fixed basket only, not a republication of Grocer's underlying per-store files; all prices are effective cents converted to dollars from the same three public Grocer price files [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

### Broad or concentrated?

PAK'nSAVE's net line-by-line margin against the best non-PAK'nSAVE competitor was **$11.52** across the basket: $14.72 of wins on 21 SKUs offset by $3.20 of losses on 4 SKUs [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

The largest single PAK'nSAVE win was tomatoes at $2.80 below the next cheapest store; that one row explains about 19% of PAK'nSAVE's gross item-level wins, so it matters, but it does not dominate the result [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

The five largest PAK'nSAVE wins were tomatoes ($2.80), eggs ($1.50), cheddar ($1.20), cucumber ($1.00), and Coca-Cola ($0.80), totalling $7.40, or about half of PAK'nSAVE's gross item-level wins; the remaining 16 PAK'nSAVE-winning SKUs still contributed $7.32 of gross wins, so the advantage was not only one or two headline specials [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

The four New World wins show why a "cheapest basket" result can still hide individual item exceptions: New World beat PAK'nSAVE on oranges by $0.50, butter by $0.70 through club price, instant coffee by $1.40 through club price, and tuna by $0.60 through club price [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| In this fixed Papakura basket, PAK'nSAVE was cheapest on both basket total and item-win share. | [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [New World prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Woolworths prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet) | No independent price dataset was available for the exact same stores/SKUs/date; this is a reproducible single-dataset calculation. | Medium |
| PAK'nSAVE's advantage was broad rather than driven only by one or two loss-leaders. | Same Grocer per-store price files and the 25-SKU fixed basket above | No independent source exists for this derived concentration calculation; it is a transparent arithmetic test from the same source data. | Medium |
| Effective-price comparisons can change item winners compared with original shelf price because New World and Woolworths rows include club or sale fields on some SKUs. | [grocer-nz skill notes on current-price fields and effective price](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md) | [Grocer New World Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet) and [Grocer Woolworths Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet) | Medium |
| This result should not be generalised to national, permanent, or all-basket cheapest claims. | [PAK'nSAVE Top 50 Price Check caveats on local price/day/special differences](https://www.paknsave.co.nz/pricecheck) | The current finding's own scope: one Papakura trio, one basket, one Grocer snapshot from the cited per-store files | High |

## What would change this conclusion

- A repeat run on a different date could change item winners because PAK'nSAVE says pricing at a local store or on a different day may differ, and the Grocer price files are current snapshot assets rather than fixed official price lists [PAK'nSAVE Top 50 Price Check](https://www.paknsave.co.nz/pricecheck), [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).
- A larger random or household-weighted basket could change the win share and concentration result; this basket is deliberately small, exact-SKU, and unweighted [Grocer public base catalogue](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).
- Checkout receipts or retailer-owned price feeds for the same stores and products would improve confidence, because this finding relies on Grocer's public current-price rows rather than a completed shop [Google Play: Grocer](https://play.google.com/store/apps/details?id=nz.grocer.twa&hl=en_US), [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).
- A shopper without access to loyalty pricing would see a different comparison on the four New World item wins that use club fields; the shelf-only sensitivity in this finding already shows PAK'nSAVE winning 24 of 25 SKUs when sale, club, and online fields are excluded [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).
- I could not verify Grocer.nz's upstream collection method, stock status at the time a shopper would check out, or whether every effective price was available to every shopper without account, loyalty, or fulfilment conditions; a human checkout audit would be needed for that stronger claim [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).

## Open follow-up questions

- Does PAK'nSAVE's 84% item-win share hold across other same-region trios such as Wellington, Christchurch, or smaller provincial centres?
- How does the result change for a basket built from PAK'nSAVE's published Top 50 list, using exact comparable private-label substitutions where needed [PAK'nSAVE Top 50 Price Check](https://www.paknsave.co.nz/pricecheck)?
- How often do New World or Woolworths loyalty prices reverse PAK'nSAVE item wins across common staples?

## Sources

1. PAK'nSAVE. "Top 50 Price Check." Accessed 2026-07-07 using built-in web open. https://www.paknsave.co.nz/pricecheck
2. Google Play. "Grocer." Accessed 2026-07-07 using built-in web open. https://play.google.com/store/apps/details?id=nz.grocer.twa&hl=en_US
3. The Colab `.skills` `grocer-nz` skill notes. Accessed 2026-07-07. https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md
4. Grocer public base catalogue. Accessed 2026-07-07 with `grocer-nz` CLI and `curl -I` HTTP 200. https://assets-prod.grocer.nz/public/base_v3.duckdb.br
5. Grocer public per-store current prices for PAK'nSAVE Papakura, `public_prices_230.parquet`. Accessed 2026-07-07 with `grocer-nz` CLI and `curl -I` HTTP 200. https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet
6. Grocer public per-store current prices for New World Papakura, `public_prices_307.parquet`. Accessed 2026-07-07 with `grocer-nz` CLI and `curl -I` HTTP 200. https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet
7. Grocer public per-store current prices for Woolworths Papakura, `public_prices_118.parquet`. Accessed 2026-07-07 with `grocer-nz` CLI and `curl -I` HTTP 200. https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet
