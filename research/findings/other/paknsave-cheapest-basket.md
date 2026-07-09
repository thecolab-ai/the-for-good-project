---
title: "In a Papakura 25-SKU current-price check, PAK'nSAVE had the lowest basket total but not every item"
domain: "other"
issue: "#698"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-07"
status: "draft"
---

# In a Papakura 25-SKU current-price check, PAK'nSAVE had the lowest basket total but not every item

## Executive answer

- I compared a fixed 25-SKU basket across PAK'nSAVE Papakura (`store_id=230`), New World Papakura (`307`), and Woolworths Papakura (`118`) using Grocer.nz current per-store price files refreshed on 2026-07-07. Grocer's app listing describes it as a New Zealand supermarket price-comparison app, and the vendored `grocer-nz` skill documents the public base catalogue and per-store current-price parquet files used here [Google Play: Grocer](https://play.google.com/store/apps/details?id=nz.grocer.twa&hl=en_US), [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).
- On effective price, defined here as the minimum of `original_price_cent`, `sale_price_cent`, `club_price_cent`, and `online_price_cent` when present, PAK'nSAVE had the lowest basket total: **$141.29**, versus **$150.82** at Woolworths and **$153.48** at New World [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet).
- PAK'nSAVE was cheapest on **16 of 25 SKUs (64%)**; Woolworths was cheapest on **5 of 25 (20%)** after sale prices on several rows, and New World was cheapest on **4 of 25 (16%)** [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet).
- PAK'nSAVE's whole-basket lead over the next cheapest whole basket was **$9.53**. On a stricter line-by-line test against the best non-PAK'nSAVE competitor for each SKU, its net margin was only **$3.46**: **$10.73** of positive margins offset by **$7.27** of losses [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet).
- This is a same-suburb current-price check, not proof of a national or permanent "lowest food prices" claim. PAK'nSAVE's own Top 50 Price Check says price comparisons can vary by local store, comparison day, advertised specials, and discounts; the Grocer files used here are mutable current assets rather than fixed dated releases [PAK'nSAVE Top 50 Price Check](https://www.paknsave.co.nz/pricecheck), [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).

**Overall confidence:** Medium - the refreshed basket arithmetic is reproducible from public Grocer current-price files at the time of access, and the exact SKU-level extract is published below, but the upstream files are mutable current assets and I did not find an independent price dataset for the exact same stores, SKUs, and timestamp.

## Evidence

### Scope and method

This finding answers a narrow question: in one current Grocer price check for one Papakura trio, did PAK'nSAVE beat nearby New World and Woolworths stores on a fixed basket total and item-level win share [Issue #698](https://github.com/thecolab-ai/the-for-good-project/issues/698).

The store trio was fixed before calculating the result: PAK'nSAVE Papakura (`store_id=230`), New World Papakura (`307`), and Woolworths Papakura (`118`). The `grocer-nz` store lookup documents those public store IDs for Papakura, and the current-price rows for the fixed basket came from Grocer's public per-store parquet files [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md), [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

I used 25 exact Grocer product IDs with current rows in all three stores: 10 produce SKUs and 15 packaged grocery SKUs. Product names, brands, sizes, and units came from Grocer's public base catalogue, while the price rows came from the three per-store current-price files [Grocer public base catalogue](https://assets-prod.grocer.nz/public/base_v3.duckdb.br), [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

The effective-price comparison uses `least(coalesce(sale_price_cent), coalesce(club_price_cent), coalesce(online_price_cent), coalesce(original_price_cent))`, matching the `grocer-nz` skill's documented conservative effective-price rule; multibuy was not used because the skill notes say multibuy needs human interpretation because quantity matters [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).

I refreshed the Grocer files with the vendored `grocer-nz` CLI on 2026-07-07. `curl -I -L` returned HTTP 200 for the base catalogue and all three per-store files; the price-file `last-modified` headers were 2026-07-06 18:22:55 GMT for Woolworths, 2026-07-06 18:23:31 GMT for PAK'nSAVE, and 2026-07-06 18:23:36 GMT for New World [Grocer public base catalogue](https://assets-prod.grocer.nz/public/base_v3.duckdb.br), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet).

The 75 product-store rows were not all a same-day product timestamp. In the refreshed files, the basket rows' `updated_at` ranges were: Woolworths, 2026-07-06T19:46:27.294000+02:00 to 2026-07-06T19:50:51.603000+02:00; PAK'nSAVE, 2026-07-06T19:04:29.164000+02:00 to 2026-07-06T19:04:32.903000+02:00; and New World, 2026-07-05T19:07:31.062000+02:00 to 2026-07-06T19:08:00.405000+02:00 [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet).

### Basket result

| Banner | Basket total, effective price | Item wins | Item-win share |
|---|---:|---:|---:|
| PAK'nSAVE Papakura | $141.29 | 16 / 25 | 64% |
| Woolworths Papakura | $150.82 | 5 / 25 | 20% |
| New World Papakura | $153.48 | 4 / 25 | 16% |

The table above is a direct sum of one unit of each fixed basket SKU at each store, using cents from Grocer's three public per-store price files; it is not weighted by household expenditure or purchase frequency [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet).

On original shelf price only, excluding sale, club, and online fields, PAK'nSAVE's lead was larger: **$141.29** versus **$161.08** at New World and **$161.79** at Woolworths. In that shelf-only sensitivity, PAK'nSAVE was cheapest on 22 SKUs, New World on two SKUs, and Woolworths on one SKU [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).

### Per-SKU extract

| Product ID | SKU | PAK'nSAVE | New World | Woolworths | Cheapest banner |
|---:|---|---:|---:|---:|---|
| 11 | Bananas Yellow Fair Trade 850g, per kg | $3.29 | $3.79 | $3.75 | PAK'nSAVE |
| 13 | Carrots Loose, per kg | $1.99 | $1.69 | $1.95 | New World |
| 24 | Cauliflower Whole, each | $3.99 | $4.99 | $4.80 | PAK'nSAVE |
| 30 | Onions Brown, per kg | $1.49 | $1.79 | $1.69 | PAK'nSAVE |
| 39 | Potatoes Loose Washed White, per kg | $2.99 | $3.39 | $3.45 | PAK'nSAVE |
| 42 | Loose Red Tomatoes, per kg | $8.99 | $9.99 | $8.75 | Woolworths |
| 45 | Imported Navel Oranges, per kg | $3.49 | $4.99 | $4.80 | PAK'nSAVE |
| 72 | Chelsea White Sugar 1.5kg | $2.99 | $4.69 | $3.40 | PAK'nSAVE |
| 73 | Broccoli Head, each | $1.89 | $1.79 | $1.25 | Woolworths |
| 77 | Telegraph Cucumber, each | $4.49 | $5.49 | $5.95 | PAK'nSAVE |
| 81 | Kiwifruit Green Loose, per kg | $4.99 | $5.49 | $5.50 | PAK'nSAVE |
| 4081 | Anchor Butter 500g | $8.99 | $10.49 | $9.30 | PAK'nSAVE |
| 4085 | Tip Top Supersoft White Toast 700g | $3.97 | $4.37 | $4.37 | PAK'nSAVE |
| 5452 | Anchor Milk Blue Top 2L | $5.85 | $6.04 | $6.04 | PAK'nSAVE |
| 6403 | Sanitarium Weet-Bix 1.2kg | $8.19 | $7.99 | $8.96 | New World |
| 6655 | Coca Cola Classic 1.5L | $3.99 | $4.99 | $2.49 | Woolworths |
| 6728 | Dilmah Tagless Tea Bags 100pk | $6.29 | $7.49 | $7.49 | PAK'nSAVE |
| 7785 | Mainland Tasty Cheddar 1kg | $18.69 | $19.89 | $19.89 | PAK'nSAVE |
| 14775 | Better Eggs Free Range Size 8 10pk | $9.49 | $9.49 | $8.80 | Woolworths |
| 18590 | Nescafe Classic Fine Blend Instant Coffee 100g | $9.19 | $5.99 | $10.29 | New World |
| 19348 | John West Tuna in Springwater 185g | $3.79 | $3.89 | $3.49 | Woolworths |
| 20042 | Edmonds Standard Grade Flour 1.5kg | $3.19 | $2.99 | $3.00 | New World |
| 21916 | Fortune Jasmine Rice 5kg | $14.69 | $15.99 | $15.99 | PAK'nSAVE |
| 23717 | Wattie's Baked Beans Regular 420g | $1.79 | $2.79 | $2.63 | PAK'nSAVE |
| 29242 | Diamond Penne Pasta 500g | $2.59 | $2.99 | $2.79 | PAK'nSAVE |

This per-SKU table is a compact extract of the fixed basket only, not a republication of Grocer's full per-store files. All prices are effective cents converted to dollars from the same three public Grocer price files [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet).

### Broad or concentrated?

PAK'nSAVE's whole-basket lead over Woolworths, the next cheapest whole basket in this current-price check, was **$9.53**. The line-by-line margin test is tighter because it compares PAK'nSAVE with whichever non-PAK'nSAVE store is cheapest for each individual SKU: on that basis, PAK'nSAVE's net margin was **$3.46**, made up of **$10.73** of positive margins on 16 winning SKUs offset by **$7.27** of losses on nine SKUs [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet).

The largest single PAK'nSAVE win was imported navel oranges at **$1.31/kg** below the next cheapest store, followed by rice at **$1.30**, cheddar at **$1.20**, tea at **$1.20**, and cucumber at **$1.00**. Those five rows totalled **$5.01**, or about 47% of PAK'nSAVE's positive line-by-line margins [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet).

The largest PAK'nSAVE loss was instant coffee, where New World's effective price was **$3.20** lower. The other PAK'nSAVE losses were Coca-Cola (**$1.50** lower at Woolworths), eggs (**$0.69** lower at Woolworths), broccoli (**$0.64** lower at Woolworths), tuna and carrots (**$0.30** lower), tomatoes (**$0.24** lower), and flour and Weet-Bix (**$0.20** lower) [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| In this fixed Papakura current-price check, PAK'nSAVE was cheapest on the basket total but not on every item. | [Grocer PAK'nSAVE Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [Woolworths prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [New World prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet) | No independent price dataset was available for the exact same stores/SKUs/timestamp; this is a transparent single-dataset calculation from public current files. | Medium |
| Effective-price comparisons can change item winners compared with original shelf price because New World and Woolworths rows include sale or club fields on some SKUs. | [grocer-nz skill notes on current-price fields and effective price](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md) | The refreshed [New World](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet) and [Woolworths](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet) price files include lower club or sale fields for several basket rows. | Medium |
| PAK'nSAVE's advantage in this basket was broad enough to survive several item losses, but it was not as dominant under effective pricing as under shelf-only pricing. | Same Grocer per-store price files and the 25-SKU fixed basket above | No independent source exists for this derived concentration calculation; it is an arithmetic test from the same source data. | Medium |
| This result should not be generalised to national, permanent, or all-basket cheapest claims. | [PAK'nSAVE Top 50 Price Check caveats on local price/day/special differences](https://www.paknsave.co.nz/pricecheck) | The current finding's own scope: one Papakura trio, one basket, and mutable Grocer current-price files | High |

## What would change this conclusion

- A repeat run on a different date could change item winners because PAK'nSAVE says pricing at a local store or on a different day may differ, and the Grocer price files are current snapshot assets rather than fixed official price lists [PAK'nSAVE Top 50 Price Check](https://www.paknsave.co.nz/pricecheck), [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).
- A larger random or household-weighted basket could change the win share and concentration result; this basket is deliberately small, exact-SKU, and unweighted [Grocer public base catalogue](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).
- Checkout receipts or retailer-owned price feeds for the same stores and products would improve confidence, because this finding relies on Grocer's public current-price rows rather than a completed shop [Google Play: Grocer](https://play.google.com/store/apps/details?id=nz.grocer.twa&hl=en_US), [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).
- A shopper without access to loyalty pricing, online pricing, or advertised sale conditions could see a different comparison; the shelf-only sensitivity in this finding shows PAK'nSAVE winning by a wider margin when sale, club, and online fields are excluded [Grocer New World Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [Grocer Woolworths Papakura prices](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet).
- I could not verify Grocer.nz's upstream collection method, stock status at the time a shopper would check out, or whether every effective price was available to every shopper without account, loyalty, fulfilment, or store-selection conditions; a human checkout audit would be needed for that stronger claim [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).

## Open follow-up questions

- Does PAK'nSAVE's basket-total lead hold across other same-region trios such as Wellington, Christchurch, or smaller provincial centres?
- How does the result change for a basket built from PAK'nSAVE's published Top 50 list, using exact comparable private-label substitutions where needed [PAK'nSAVE Top 50 Price Check](https://www.paknsave.co.nz/pricecheck)?
- How often do New World or Woolworths loyalty and sale prices reverse PAK'nSAVE item wins across common staples?

## Sources

1. PAK'nSAVE. "Top 50 Price Check." Accessed 2026-07-07 using built-in web open. https://www.paknsave.co.nz/pricecheck
2. Google Play. "Grocer." Accessed 2026-07-07 using built-in web open. https://play.google.com/store/apps/details?id=nz.grocer.twa&hl=en_US
3. The Colab `.skills` `grocer-nz` skill notes. Accessed 2026-07-07. https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md
4. Grocer public base catalogue. Accessed 2026-07-07 with `grocer-nz` CLI `--refresh` and `curl -I -L` HTTP 200. https://assets-prod.grocer.nz/public/base_v3.duckdb.br
5. Grocer public per-store current prices for PAK'nSAVE Papakura, `public_prices_230.parquet`. Accessed 2026-07-07 with `grocer-nz` CLI `--refresh` and `curl -I -L` HTTP 200. https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet
6. Grocer public per-store current prices for New World Papakura, `public_prices_307.parquet`. Accessed 2026-07-07 with `grocer-nz` CLI `--refresh` and `curl -I -L` HTTP 200. https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet
7. Grocer public per-store current prices for Woolworths Papakura, `public_prices_118.parquet`. Accessed 2026-07-07 with `grocer-nz` CLI `--refresh` and `curl -I -L` HTTP 200. https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet
