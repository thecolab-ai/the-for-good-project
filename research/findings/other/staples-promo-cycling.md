---
title: "In a two-store staples basket, the exact high 'regular' price was rarely the modal charged price"
domain: "other"
issue: "#695"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-07"
status: "draft"
---

# In a two-store staples basket, the exact high "regular" price was rarely the modal charged price

## Executive answer

- I tested 15 packaged staple SKUs at Woolworths Papakura (`store_id=118`) and New World Papakura (`store_id=307`) over the two-year window 2024-07-01 to 2026-07-01, using Grocer.nz public product-history rows and weighting each observed price by the time until the next observed price. Grocer.nz history rows expose `updated_at`, `store_id`, and `price_cent`, and the `grocer-nz` skill documents those history files as public per-product parquet assets with prices in New Zealand cents [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).
- The basket result is directionally strong: the exact maximum observed price was charged for less than 50% of weighted store-days for all 15 SKUs, and the basket averaged 67.3% of weighted store-days below the SKU/store "near-ceiling" band, defined here as below 95% of that store's observed maximum price in the window [Grocer product-history assets listed in Sources 7-21](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet).
- The stronger "special is the default state" claim holds for most, but not all, of this basket: 12 of 15 SKUs spent more weighted time below the near-ceiling band than at/near it; Mainland Tasty Cheddar 1kg, Fortune Basmati Rice 5kg, and Coca-Cola 1.5L were exceptions where the near-ceiling band was common even though the exact max price itself was not modal [Grocer product-history assets listed in Sources 7-21](https://assets-prod.grocer.nz/public/price_history_v3/price_history_7785.parquet).
- The Fair Trading Act concern is not that high prices are unlawful by themselves; it is that a "was", "usual", "normal", "everyday", or "special" comparison can mislead if the reference price was out of date, rarely real, one of many common prices, or if the promotional price has become the usual selling price [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/); [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act).
- This is a price-history signal, not a legal finding. The history rows do not preserve shelf-ticket text, current "was/now" representations, club-card status, or checkout receipts, so a lawyer or the Commerce Commission would need representation evidence before anyone alleged a Fair Trading Act breach [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md); [Fair Trading Act 1986](https://www.legislation.govt.nz/act/public/1986/121/en/latest/).

**Overall confidence:** Medium - the arithmetic is reproducible from public Grocer.nz history assets and most product/store histories are dense, but Grocer history is irregular snapshot data, not transaction data, and it cannot prove what a retailer displayed as "was", "now", "special", or "usual" on a given shelf or website page.

## Evidence

### Data frame and weighting method

I fixed the basket before calculating the final result: 15 packaged SKUs, no variable-weight produce, across Woolworths Papakura (`118`) and New World Papakura (`307`) for 2024-07-01 to 2026-07-01. The stores are public Grocer store IDs for Papakura stores, and the chosen product IDs are Grocer product IDs from the public base catalogue [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md); [Grocer public base database](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).

For each product/store, I sorted history rows by `updated_at`, treated each `price_cent` as the price in force until the next row for the same product/store, clipped the interval to the two-year window, and summed weighted days by price. This is necessary because Grocer.nz history rows are irregular snapshots rather than daily observations; equal-row counting would over-weight periods when the upstream data changed or was refreshed more often [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).

I used two related but separate measures. "At/near ceiling" means price was at least 95% of that product/store's maximum observed price in the two-year window; "on special / below ceiling" means it was below that 95% band. "Exact max" means the single highest observed cent price across the two stores for that SKU, used as a proxy for the high "was" or regular anchor; it is a signal only, not proof that the retailer used that exact price in a displayed "was/now" claim [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/); [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).

### Per-SKU results

All rows below are time-weighted calculations from the 15 public Grocer product-history files listed in Sources 7-21, accessed on 2026-07-07; I am not republishing the underlying bulk rows [Grocer product-history asset example, Coca-Cola product 6655](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet).

| Product ID | SKU | Below 95% ceiling | At/near ceiling | Distinct price points | Modal price | Max price | Verdict |
|---:|---|---:|---:|---:|---:|---:|---|
| 6655 | Coca Cola Classic Soft Drink Bottle 1.5L | 49.9% | 50.1% | 29 | $4.79 (47.6%) | $4.99 (2.4%) | Near-ceiling band was common, but the exact max was rarely charged. |
| 5452 | Anchor Milk Blue Top 2L | 95.9% | 4.1% | 27 | $5.44 (21.9%) | $6.04 (0.3%) | Ceiling band was rare; max looks like a high anchor. |
| 4085 | Tip Top Supersoft White Toast 700g | 61.8% | 38.2% | 13 | $4.09 (37.8%) | $4.38 (3.0%) | More time below ceiling than at/near it. |
| 4081 | Anchor Butter 500g | 86.7% | 13.3% | 43 | $9.89 (9.6%) | $11.00 (5.6%) | Ceiling band was rare; max looks like a high anchor. |
| 72 | Chelsea White Sugar 1.5kg | 56.2% | 43.8% | 33 | $4.69 (23.0%) | $4.89 (10.2%) | More time below ceiling than at/near it. |
| 20042 | Edmonds Standard Grade Flour 1.5kg | 60.3% | 39.7% | 21 | $3.79 (61.0%) | $4.10 (1.4%) | Modal price sat well below the basket max. |
| 6403 | Sanitarium Weet-Bix 1.2kg | 84.8% | 15.2% | 27 | $8.79 (27.7%) | $9.49 (14.7%) | Ceiling band was rare; max looks like a high anchor. |
| 7785 | Mainland Tasty Cheddar Cheese 1kg | 13.2% | 86.8% | 18 | $19.89 (60.3%) | $20.49 (2.9%) | Near-ceiling band was common, but the exact max was rarely charged. |
| 14775 | Better Eggs Free Range Eggs Size 8 10pk | 65.4% | 34.6% | 34 | $12.49 (23.3%) | $12.49 (23.3%) | More time below ceiling than at/near it. |
| 23717 | Wattie's Baked Beans Regular 420g | 89.0% | 11.0% | 29 | $2.79 (29.3%) | $2.99 (11.0%) | Ceiling band was rare; max looks like a high anchor. |
| 29242 | Diamond Pasta Penne 500g | 74.9% | 25.1% | 16 | $2.79 (42.6%) | $2.99 (21.3%) | More time below ceiling than at/near it. |
| 28304 | Fortune Every Day Basmati Rice 5kg | 43.3% | 56.7% | 20 | $16.29 (21.5%) | $16.95 (18.7%) | Near-ceiling band was common, but exact max was not modal. |
| 19348 | John West Tuna Chunk Style in Springwater 185g | 79.8% | 20.2% | 17 | $3.69 (32.7%) | $3.89 (20.2%) | Ceiling band was rare; max looks like a high anchor. |
| 18590 | Nescafe Classic Fine Blend Instant Coffee 100g | 68.4% | 31.6% | 37 | $10.29 (31.6%) | $10.29 (31.6%) | More time below ceiling than at/near it, although modal and max coincide. |
| 31203 | EarthSmart Recycled Toilet Tissue Long Rolls 2 Ply 6 pack | 79.3% | 20.7% | 14 | $6.79 (47.8%) | $7.19 (20.7%) | Ceiling band was rare; max looks like a high anchor. |

Basket summary: the exact maximum price was charged less than half the time for 15 of 15 SKUs; the near-ceiling band was below half the time for 12 of 15 SKUs; and the average SKU spent 67.3% of weighted store-days below the 95%-of-ceiling band [Grocer product-history assets listed in Sources 7-21](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet).

Coverage was generally dense: 13 of 15 SKUs had more than 1,300 in-window observations across the two stores, and most maximum same-product/store observation gaps were under 25 days. The exceptions were Fortune Basmati Rice, with 1,128 in-window observations and a maximum same-product/store gap of 44.3 days, and Wattie's Baked Beans, with 1,368 observations but an 80.4-day New World gap; those two product-level results should be read with more caution than the densest rows [Grocer product-history files for Fortune Basmati Rice and Wattie's Baked Beans](https://assets-prod.grocer.nz/public/price_history_v3/price_history_28304.parquet).

### Fair Trading Act relevance

The Fair Trading Act 1986 prohibits misleading or deceptive conduct in trade, unsubstantiated representations, and false or misleading representations about price, but the Act does not make a high supermarket price or ordinary price increase unlawful by itself [Fair Trading Act 1986](https://www.legislation.govt.nz/act/public/1986/121/en/latest/); [Consumer Protection, misleading prices or advertising](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising).

Commerce Commission pricing guidance is directly relevant to this pattern because it says discount comparisons often use "usual", "was", "normal", or "everyday" prices, and can mislead if the claimed usual price was never charged, deliberately inflated, one of many common selling prices, out of date, or very rarely the real selling price. The same guidance says that when businesses routinely sell products at a promotional price, the promotional price becomes the usual selling price [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/).

Consumer Protection's Fair Trading Act guidance independently frames misleading "was/now" promotions and fake discounts as examples of Fair Trading Act risk, and says misleading conduct does not require proof that the trader intended to mislead [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act).

This basket therefore supports a narrow evidence claim: for these 15 SKUs in these two stores, the highest observed price was usually not the time-weighted modal price, and in most cases the product spent more time below the near-ceiling band than at/near it. It does not prove that any specific current shelf ticket or online promotion was misleading, because Grocer history rows do not record the displayed wording, consumer impression, retailer substantiation, or checkout price paid [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md); [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| In this basket, the exact maximum observed price was charged less than half the weighted time for every SKU. | [Grocer product-history assets, product files listed in Sources 7-21](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet) | No independent source exists for this derived calculation; it is reproducible from public Grocer history rows and the method above. | Medium |
| A routinely promotional price can become the usual selling price, making "was/now" or "usual" comparisons legally sensitive. | [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/) | [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act) | High |
| The history data can show price-pattern signals, but cannot prove a Fair Trading Act breach without the actual representation and context. | [grocer-nz skill notes on history schema](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md) | [Fair Trading Act 1986](https://www.legislation.govt.nz/act/public/1986/121/en/latest/) and [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/) | Medium-High |

## What would change this conclusion

- A transaction-level dataset showing actual checkout prices and quantities could change the modal-price conclusion, because Grocer history measures listed price snapshots rather than purchases [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).
- Saved shelf tickets, website captures, or retailer promotion feeds for the same stores, products, and dates could show whether the highest observed price was actually used as a displayed "was", "usual", "normal", "everyday", or "special" reference price [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/).
- A different basket, region, store pair, or inclusion of PAK'nSAVE and Fresh Choice could change the basket-level count; this finding only covers Woolworths Papakura and New World Papakura for the fixed 15-SKU packaged basket.
- A different "near ceiling" threshold would move some borderline rows. For example, Coca-Cola 1.5L was at/near ceiling for 50.1% of weighted store-days using the 95% threshold, but the exact $4.99 max was charged for only 2.4% of weighted store-days.
- I could not verify Grocer.nz's upstream collection method, exact update schedule, or whether every price row reflects shelf, online, club-card, or other price status; the history schema is too lean for that [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).
- This finding is not legal advice. A lawyer, the Commerce Commission, or a court would need the actual consumer-facing representation and retailer evidence before deciding whether any specific "was/now" or "special" claim breached the Fair Trading Act [Fair Trading Act 1986](https://www.legislation.govt.nz/act/public/1986/121/en/latest/); [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act).

## Open follow-up questions

- Does the same pattern hold for PAK'nSAVE Papakura and Fresh Choice Papakura, or for a non-Papakura urban/rural store pair?
- How sensitive are the results to 90%, 95%, and exact-maximum definitions of "regular" or "near ceiling"?
- Can a privacy-safe shelf-ticket or online-page capture workflow link displayed "was/now" claims to the same product/store/date without republishing bulk Grocer data?

## Sources

1. The Colab `.skills` `grocer-nz` skill notes, accessed 2026-07-07. https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md
2. Grocer public base database, accessed 2026-07-07. https://assets-prod.grocer.nz/public/base_v3.duckdb.br
3. Commerce Commission. "Pricing your products or services", accessed 2026-07-07 using built-in web open. https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/
4. Consumer Protection. "Fair Trading Act", accessed 2026-07-07 using built-in web open. https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act
5. Consumer Protection. "Misleading prices or advertising", accessed 2026-07-07. https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising
6. Fair Trading Act 1986, New Zealand Legislation, latest version accessed 2026-07-07 using built-in web open. https://www.legislation.govt.nz/act/public/1986/121/en/latest/
7. Grocer public product-history file for product `6655`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet
8. Grocer public product-history file for product `5452`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet
9. Grocer public product-history file for product `4085`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_4085.parquet
10. Grocer public product-history file for product `4081`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_4081.parquet
11. Grocer public product-history file for product `72`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_72.parquet
12. Grocer public product-history file for product `20042`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_20042.parquet
13. Grocer public product-history file for product `6403`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_6403.parquet
14. Grocer public product-history file for product `7785`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_7785.parquet
15. Grocer public product-history file for product `14775`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_14775.parquet
16. Grocer public product-history file for product `23717`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_23717.parquet
17. Grocer public product-history file for product `29242`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_29242.parquet
18. Grocer public product-history file for product `28304`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_28304.parquet
19. Grocer public product-history file for product `19348`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_19348.parquet
20. Grocer public product-history file for product `18590`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_18590.parquet
21. Grocer public product-history file for product `31203`, accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_31203.parquet
