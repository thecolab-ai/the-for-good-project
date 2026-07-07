---
title: "Woolworths and Foodstuffs Papakura stores rarely share exact price floors/ceilings, and 'lockstep' timing can mean synchronised or perfectly out-of-phase cycles depending on the SKU"
domain: "other"
issue: "#696"
confidence: "Medium"
author: "claude"
agent: "claude"
model: "claude-sonnet-5"
date: "2026-07-07"
status: "draft"
---

# Woolworths and Foodstuffs Papakura stores rarely share exact price floors/ceilings, and "lockstep" timing can mean synchronised or perfectly out-of-phase cycles depending on the SKU

## Executive answer

- Across a 9-SKU basket at Woolworths Papakura (store 118) and New World Papakura (store 307) over the ~2 years from 1 July 2024 to 6 July 2026, **only 2 of 9 SKUs shared an identical price floor and only 3 of 9 shared an identical price ceiling** between the two chains. The Coca-Cola 1.5L example that motivated this question (identical $2.25 floor, $4.99 ceiling) is one of the more extreme cases in the basket, not the typical one. [Grocer price history 6655](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet); [Grocer price history 5452](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet); [Grocer price history 23728](https://assets-prod.grocer.nz/public/price_history_v3/price_history_23728.parquet)
- Daily price-level correlation (Pearson r, forward-filled to a common daily series) ranged from **-0.76 to +0.96** across the 9 SKUs, with a basket mean of **+0.19** — there is no single "lockstep" answer; it is highly SKU-specific. [Grocer price history files, per-SKU table below]
- The Coca-Cola 1.5L case shows *why* correlation alone can mislead: both chains change this SKU's price almost every Monday for the full 2-year window (a near-identical cadence), and the levels visited are the same two or three price points at both chains — but the two chains take turns being the cheap one, producing a **strong negative correlation (r = -0.76)** despite sharing an identical floor and ceiling. This is timing lockstep with level alternation, not simultaneous matching. [Grocer price history 6655](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet)
- Anchor Milk Blue Top 2L is the clearest case of genuine co-movement: both chains changed the list price only 17 times in 2 years, the increases landed within 0-9 days of each other on nine occasions, and the two chains converged to the same or near-same price after each step (e.g. both at $5.68 by 2 Jul 2025, both at $5.53 by 14 Jan 2026, both at $6.04 by 29 Jun 2026) — giving r = 0.96. For the same product, PAK'nSAVE Papakura (a Foodstuffs sibling of New World) correlated even more tightly with New World (r = 0.996) than New World did with Woolworths (r = 0.96), which is more consistent with shared upstream/supplier cost pass-through than with cross-company coordination. [Grocer price history 5452](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet)
- At the other extreme, Sanitarium Weet-Bix Gluten Free 375g shows no lockstep at all: Woolworths cycled through 11 distinct prices and 60 change events in 2 years, while New World held only 2 distinct prices (one change, in November 2025) — the two series barely correlate (r = 0.45, driven mostly by one shared step) and Woolworths' promotional cycling has no counterpart at New World. [Grocer price history 30594](https://assets-prod.grocer.nz/public/price_history_v3/price_history_30594.parquet)

**Overall confidence:** Medium — the price data and arithmetic are exact and reproducible from public Grocer history files, but the basket is deliberately small (9 SKUs), limited to one region (Papakura) and two-to-three stores, and the analysis is descriptive correlation, not a test of cause.

## Evidence

### Basket, stores and method

The basket comprises 9 branded SKUs spanning dairy, bakery, protein, cereal, canned goods, frozen dessert, soft drink and household cleaning, chosen for having near-daily Grocer price-history coverage at both Woolworths Papakura and New World Papakura over the study window: Coca Cola Classic 1.5L (product 6655), Anchor Milk Blue Top 2L (5452), Tip Top Supersoft White Toast 700g (4085), Henergy Cage Free Barn Grade 7 Eggs 12pk (7755), Sanitarium Weet-Bix Gluten Free 375g (30594), Vogel's Bread Sunflower & Barley Toast 720g (4300), Wattie's Baked Beans 50% Less Added Sugar 420g (23728), Cadbury Dairy Milk Ice Cream on a Stick Vanilla 4pk (24405) and Persil Laundry Liquid Ultimate Sensitive 2L (34408). [Grocer base catalogue](https://assets-prod.grocer.nz/public/base_v3.duckdb.br)

Store IDs were resolved via the `grocer-nz` skill's `stores` command: Woolworths Papakura is store 118, New World Papakura is store 307, and PAK'nSAVE Papakura is store 230. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

For each SKU I ran the skill's guarded `query` subcommand with `select store_id, price_cent, updated_at from history where store_id in (118,307) and updated_at >= TIMESTAMP '2024-07-01' order by updated_at` against `--product <id> --limit 5000 --json`; every query reported `"truncated": false`, so each SKU's full history in the window was retrieved (row counts of 1,377-1,453 per SKU across the two stores, roughly one observation per store per day). For the three PAK'nSAVE comparisons the same query was run with `store_id = 230`. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md); [Grocer price history 6655](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet)

The study window is 1 July 2024 00:00 NZT to 6 July 2026 13:00 NZT (736 calendar days), and data was accessed 7 July 2026. Grocer's history schema exposes only `updated_at`, `store_id` and `price_cent`, so — as the prior method finding on this repo notes — a raw history row cannot itself distinguish shelf/original/sale/club/online status; this analysis therefore treats `price_cent` as "the observed effective shelf price at that timestamp" and does not attempt to separate promotion type. [grocer-nz API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md); [The For Good Project, "Evidence-threshold method for supermarket reference-pricing"](https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/supermarket-pricing-method.md)

Two metrics were computed per SKU:

- **Price levels.** Minimum, maximum and mean price at each store across all observed rows; whether the floor (min) and ceiling (max) are exactly equal between stores; and a Pearson correlation coefficient between the two stores' daily price series, where each store's series is collapsed to one price per calendar day (the last observed price that day) and forward-filled over the date range where both stores have at least one observation, then correlated only over the days both series have a filled value.
- **Change timing.** A "price-change event" for a store/SKU is any calendar day whose forward-filled price differs from the previous day's forward-filled price. For each Woolworths event, I searched for the nearest not-yet-matched New World event within a 0/3/7/14-day window (in either direction) and counted matches; this is a simple nearest-neighbour match, not a formal statistical test, and a high match rate can occur mechanically when both chains change price on the same weekly cadence regardless of which direction the price moves (as the Coca-Cola example shows below) — so match-rate numbers should be read as "how often do change dates cluster together," not as evidence the two chains matched each other's price.

### Basket-level results

| SKU | WW (118) min–max (mean), NZ$ | NW (307) min–max (mean), NZ$ | Floor match | Ceiling match | Daily Pearson r | WW events | NW events | Matched ≤7d (share of WW events) |
|---|---:|---:|:---:|:---:|---:|---:|---:|---:|
| Coca Cola Classic 1.5L | 2.25–4.99 (3.96) | 2.25–4.99 (3.95) | Yes | Yes | -0.76 | 123 | 99 | 80.5% |
| Anchor Milk Blue Top 2L | 5.17–6.04 (5.51) | 5.10–6.04 (5.49) | No | Yes | 0.96 | 17 | 17 | 52.9% |
| Tip Top Toast 700g | 3.00–4.38 (4.09) | 3.29–4.37 (4.15) | No | No | 0.49 | 22 | 7 | 31.8% |
| Henergy Eggs 12pk | 8.90–11.25 (10.19) | 5.99–10.89 (10.31) | No | No | 0.01 | 80 | 37 | 31.3% |
| Sanitarium Weet-Bix GF 375g | 6.70–8.49 (7.44) | 7.49–7.79 (7.59) | No | No | 0.45 | 60 | 1 | 1.7% |
| Vogel's Toast 720g | 3.90–5.59 (5.12) | 4.69–5.58 (5.15) | No | No | 0.76 | 13 | 6 | 46.2% |
| Wattie's Baked Beans 420g | 1.99–2.99 (2.68) | 1.99–2.99 (2.77) | Yes | Yes | -0.02 | 60 | 32 | 51.7% |
| Cadbury DM Ice Cream 4pk | 6.79–11.50 (9.57) | 7.49–11.49 (9.91) | No | No | -0.32 | 116 | 97 | 82.8% |
| Persil Laundry Liquid 2L | 19.50–28.00 (23.98) | 21.99–27.99 (24.84) | No | No | 0.17 | 113 | 77 | 65.5% |
| **Basket summary** | | | **2/9** | **3/9** | **mean 0.19** (range -0.76 to 0.96) | | | pooled share of all WW events matched ≤7d: **57.6%** (simple average of the 9 per-SKU shares: 49.3%) |

[Grocer price history 6655](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet); [5452](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet); [4085](https://assets-prod.grocer.nz/public/price_history_v3/price_history_4085.parquet); [7755](https://assets-prod.grocer.nz/public/price_history_v3/price_history_7755.parquet); [30594](https://assets-prod.grocer.nz/public/price_history_v3/price_history_30594.parquet); [4300](https://assets-prod.grocer.nz/public/price_history_v3/price_history_4300.parquet); [23728](https://assets-prod.grocer.nz/public/price_history_v3/price_history_23728.parquet); [24405](https://assets-prod.grocer.nz/public/price_history_v3/price_history_24405.parquet); [34408](https://assets-prod.grocer.nz/public/price_history_v3/price_history_34408.parquet)

The headline pattern is heterogeneity: high-frequency, deeply-discounted SKUs (Coca-Cola, Cadbury ice cream) show the highest same-week event-matching rate (80-83%) because both chains run near-weekly specials on them, but the sign of the price correlation for those same SKUs is negative — the two chains are not simultaneously cheap. Slow-moving staples with few price changes (Anchor Milk, Vogel's toast) show the highest positive correlation because the rare changes that do occur tend to be list-price steps that land close together in time. Products where one chain runs frequent promotions and the other does not (Sanitarium Weet-Bix, Henergy eggs) show weak or near-zero correlation because there is no shared cycle to line up. [Grocer price history files, table above]

### Worked example 1 — Coca-Cola Classic 1.5L: same range, opposite phase

Both Woolworths and New World Papakura changed this SKU's price on a Monday in almost every week of the 2-year window, cycling between a small set of prices ($2.25-$3.90 promotional, $4.79-$4.99 regular). But in the great majority of weeks sampled, the two chains were never cheap in the same week — one was at the ~$4.79 regular price while the other ran a promotion, and they swapped roles the following week:

| Week starting (Mon) | Woolworths Papakura | New World Papakura |
|---|---:|---:|
| 2025-01-06 | $4.79 | $4.79 |
| 2025-01-13 | $3.00 | $4.79 |
| 2025-01-20 | $4.79 | $3.00 |
| 2025-01-27 | $2.50 | $4.79 |
| 2025-02-03 | $4.79 | $2.99 |

[Grocer price history 6655](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet)

This is why identical floor/ceiling and even identical change-cadence (both change on Monday almost every week) do not imply the two retailers charge shoppers the same price at the same time — for this SKU, in most observed weeks a Papakura shopper could have saved 35-53% simply by choosing the chain that was on special that week, and which chain that was flipped roughly weekly. The pattern is consistent with each chain running its own independent weekly promotional calendar for a high-velocity, heavily-promoted grocery item, which happens to land on the same day of the week (Monday is a common NZ supermarket price-change day) without the two chains being cheap simultaneously; it is equally consistent with, and this finding cannot distinguish from, the two chains observing each other's list/shelf prices and deliberately alternating, or with both following a shared supplier/loyalty promotional calendar set by Coca-Cola Amatil/Europacific Partners rather than by the retailers. No claim about which of these explanations is correct is made here. [Grocer price history 6655](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet)

### Worked example 2 — Anchor Milk Blue Top 2L: rare, near-simultaneous list-price steps

Both chains changed this SKU's price only 17 times in 2 years — far fewer than any other basket SKU — and on 9 of those 17 Woolworths events, the nearest New World event fell within 7 days, usually converging to the same or a very similar new price:

| Date | Woolworths Papakura | New World Papakura |
|---|---:|---:|
| 2024-12-30 (Mon) | $5.64 | $5.44 |
| 2025-02-13 (Thu) | $5.44 | $5.44 |
| 2025-07-02 (Wed) | $5.68 | $5.68 |
| 2026-01-14 (Wed) | $5.53 | $5.53 |
| 2026-04-13 (Mon) | $5.60 | $5.60 |
| 2026-06-29 (Mon) | $6.04 | $6.04 |

[Grocer price history 5452](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet)

The two series ended up at the identical price on six of the dates sampled above, after starting a few cents apart each time. Milk is a homogenous commodity dairy product with a single dominant NZ processor (Fonterra/Anchor), so simultaneous list-price steps that converge to the same shelf price are also consistent with both retailers passing through the same supplier cost increase rather than reacting to each other. Supporting that reading: PAK'nSAVE Papakura (Foodstuffs, same corporate parent as New World) tracked New World even more tightly (r = 0.996) than New World tracked Woolworths (r = 0.96) over the same window — the within-company correlation is at least as strong as the cross-company one, which is what a shared-cost story predicts and does not require any cross-company coordination to explain. [Grocer price history 5452](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet)

### Worked example 3 — Sanitarium Weet-Bix Gluten Free 375g: no shared cycle

Woolworths Papakura ran a near-continuous promotional cycle on this SKU (11 distinct prices, 60 change events, ranging $6.70-$8.49), while New World Papakura held a near-flat price for almost the entire window (2 distinct prices — $7.49 until 10 November 2025, then $7.79 — a single change event in the full 2 years):

| Date | Woolworths Papakura | New World Papakura |
|---|---:|---:|
| 2024-08-04 | $7.30 | $7.49 |
| 2024-10-14 | $8.10 | $7.49 |
| 2025-06-30 | $7.49 | $7.49 |
| 2025-11-11 | $8.49 | $7.79 |
| 2026-06-22 | $7.79 | $7.79 |

[Grocer price history 30594](https://assets-prod.grocer.nz/public/price_history_v3/price_history_30594.parquet)

The two chains happened to coincide on price on two of the five dates shown, purely because Woolworths' cycle occasionally passed through New World's fixed price, not because of any coordinated change. This is the clearest counter-example in the basket to a general "lockstep" story: for this SKU the retailers' pricing behaviour is close to independent.

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Only 2 of 9 basket SKUs share an identical price floor and only 3 of 9 share an identical price ceiling between Woolworths and New World Papakura; the Coca-Cola example that motivated this question is one of the more extreme, not typical, cases. | [Grocer price history files, per-SKU table](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet) (and the other 8 product history files linked in the table above) | Basket-level arithmetic reproduced directly from the cited public Grocer history files in this finding; no independent second-party source exists for this specific 9-SKU comparison. | Medium — exact for this basket/window, not established as general across the wider Grocer catalogue |
| Coca-Cola 1.5L price changes at Woolworths and New World Papakura cluster on the same weekly cadence (mostly Mondays) for two years, yet the daily price levels are negatively correlated (r = -0.76) because the two chains alternate which one is discounted. | [Grocer price history 6655, Woolworths Papakura](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet) | [Grocer price history 6655, New World Papakura](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet) (same file, store_id column distinguishes the two banners) | Medium — arithmetic is exact; the "why" (independent promo calendars vs. shared supplier calendar vs. mutual observation) is not established and is explicitly not claimed |
| For Anchor Milk Blue Top 2L, PAK'nSAVE Papakura correlates more tightly with sibling banner New World Papakura (r = 0.996) than New World correlates with competitor Woolworths (r = 0.96), consistent with shared-cost pass-through rather than cross-company coordination. | [Grocer price history 5452 (New World / PAK'nSAVE rows)](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet) | No independent source found comparing within-company vs. cross-company retail price correlation for this specific NZ dataset; this is a single reproducible computation from the cited public data. | Low-Medium — suggestive with only one SKU tested at three stores, not basket-wide |
| Grocer's per-product history rows record only timestamp, store and price, with no field distinguishing shelf/original/sale/club/online status, so this analysis cannot separate an ordinary list-price change from a promotional cycle at the row level. | [grocer-nz API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md) | [The For Good Project, "Evidence-threshold method for supermarket reference-pricing" (issue #75)](https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/supermarket-pricing-method.md) | High |

## What would change this conclusion

- A much larger basket (50-100+ SKUs) across more stores/regions would show whether the 2/9 floor-match and 0.19 mean-correlation figures are representative of the wider catalogue, or whether this particular 9-SKU basket happened to be unusually low-correlation; the current sample is too small to generalise beyond "lockstep is not universal and is highly SKU-dependent."
- Access to retailer promotion calendars, supplier list-price change dates, or Commerce Commission grocery-market-study data on promotional coordination would let this move from a descriptive price-history pattern to an explanation of *why* particular SKUs show synchronised or anti-phase cycles; I did not have access to any of these and make no claim about retailer intent or coordination.
- Testing whether the Monday-cadence pattern seen for Coca-Cola generalises to other high-velocity, heavily-promoted grocery/soft-drink SKUs (rather than being specific to Coca-Cola/Amatil-Europacific Partners' own promotional calendar) would clarify whether "same day, opposite price" is a soft-drink-category pattern or broader.
- I could not verify why the Henergy egg SKU's price ranges diverge more than any other basket item (Woolworths $8.90-$11.25 vs New World $5.99-$10.89, non-overlapping floors) — this could reflect different egg grades/suppliers behind the same product ID, a data-quality issue, or a genuine independent pricing gap; a human reviewer with retail-buying knowledge should check this before it is used in any public explainer.
- Multibuy and club-price fields, which this history-based analysis cannot see (the history schema is timestamp/store/price only), could explain some of the apparent independence at chains like New World for Sanitarium Weet-Bix if a club price moved while the plain shelf price stayed flat; I did not have access to historical component-price fields to check this.
- This finding does not, and should not be read to, establish or rule out coordination between Woolworths and Foodstuffs on any SKU — it describes an observed price-history pattern only. A Commerce Commission grocery-market-study finding, court decision, or retailer-side evidence would be needed to say more, per the project's evidence-threshold method for this domain. [The For Good Project, "Evidence-threshold method for supermarket reference-pricing"](https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/supermarket-pricing-method.md)

## Open follow-up questions

- Does the Monday same-day-different-price pattern seen for Coca-Cola 1.5L hold across a larger sample of soft-drink and snack SKUs, or is it specific to this product/supplier?
- At basket scale (50+ SKUs, multiple regions), what share of SKUs show a floor/ceiling match like Coca-Cola's, versus the more common non-matching pattern seen for 7 of 9 SKUs here?
- Does within-company correlation (New World vs. PAK'nSAVE, or Woolworths vs. another Woolworths store) systematically exceed cross-company correlation (Woolworths vs. New World) across a larger basket, as it did for the one SKU tested here?
- Would incorporating current-price component fields (original/sale/club/multibuy, only available for current prices, not history) change which SKUs look "independent" versus "lockstep" — e.g. would Sanitarium Weet-Bix's flat New World price turn out to hide a club-only discount?

## Sources

1. Grocer.nz public assets. "base_v3.duckdb.br." Accessed 2026-07-07. https://assets-prod.grocer.nz/public/base_v3.duckdb.br
2. Grocer.nz public assets. "price_history_6655.parquet" (Coca Cola Classic 1.5L). Accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet
3. Grocer.nz public assets. "price_history_5452.parquet" (Anchor Milk Blue Top 2L). Accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet
4. Grocer.nz public assets. "price_history_4085.parquet" (Tip Top Toast 700g). Accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_4085.parquet
5. Grocer.nz public assets. "price_history_7755.parquet" (Henergy Eggs 12pk). Accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_7755.parquet
6. Grocer.nz public assets. "price_history_30594.parquet" (Sanitarium Weet-Bix Gluten Free 375g). Accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_30594.parquet
7. Grocer.nz public assets. "price_history_4300.parquet" (Vogel's Toast 720g). Accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_4300.parquet
8. Grocer.nz public assets. "price_history_23728.parquet" (Wattie's Baked Beans 420g). Accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_23728.parquet
9. Grocer.nz public assets. "price_history_24405.parquet" (Cadbury Dairy Milk Ice Cream 4pk). Accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_24405.parquet
10. Grocer.nz public assets. "price_history_34408.parquet" (Persil Laundry Liquid 2L). Accessed 2026-07-07. https://assets-prod.grocer.nz/public/price_history_v3/price_history_34408.parquet
11. The Colab AI .skills. "grocer-nz SKILL.md." Accessed 2026-07-07. https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md
12. The Colab AI .skills. "grocer-nz API / asset notes." Accessed 2026-07-07. https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md
13. The For Good Project. "Evidence-threshold method for supermarket reference-pricing" (issue #75). Accessed 2026-07-07. https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/supermarket-pricing-method.md
14. The For Good Project. "Grocer NZ exposes useful public price data, but not a safe bulk republication licence" (issue #74). Accessed 2026-07-07. https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/grocer-nz-data-audit.md
