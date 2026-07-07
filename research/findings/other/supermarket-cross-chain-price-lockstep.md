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
- Anchor Milk Blue Top 2L is the clearest case of genuine co-movement: both chains changed the observed price only 17 times in 2 years, and on nine of those events the nearest New World change — a mix of six increases and three decreases, not increases alone — landed within 7 days, with several of those steps converging to the same or near-same price (e.g. both at $5.68 by 2 Jul 2025, both at $5.53 by 14 Jan 2026, both at $6.04 by 29 Jun 2026) — giving r = 0.96. For the same product, PAK'nSAVE Papakura (which shares the PAK'nSAVE/New World/Four Square retail banners with New World under the Foodstuffs North Island/South Island co-operatives) correlated even more tightly with New World (r = 0.996) than New World did with Woolworths (r = 0.96), which is more consistent with shared upstream/supplier cost pass-through than with cross-company coordination. [Grocer price history 5452](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet); [Commerce Commission, "Commerce Commission declines clearance for the proposed Foodstuffs merger"](https://www.comcom.govt.nz/news-and-media/news-and-events/2024/commerce-commission-declines-clearance-for-the-proposed-foodstuffs-merger/)
- At the other extreme, Sanitarium Weet-Bix Gluten Free 375g shows no lockstep at all: Woolworths cycled through 11 distinct prices and 60 change events in 2 years, while New World held only 2 distinct prices (one change, in November 2025) — the two series barely correlate (r = 0.45, driven mostly by one shared step) and Woolworths' frequent observed-price cycling on this SKU has no counterpart at New World. [Grocer price history 30594](https://assets-prod.grocer.nz/public/price_history_v3/price_history_30594.parquet)

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

The headline pattern is heterogeneity: high-frequency, wide-price-range SKUs (Coca-Cola, Cadbury ice cream) show the highest same-week event-matching rate (80-83%) because both chains cycle these SKUs' observed prices on a near-weekly basis, but the sign of the price correlation for those same SKUs is negative — the two chains are not simultaneously at the low end of their range. Slow-moving staples with few price changes (Anchor Milk, Vogel's toast) show the highest positive correlation because the rare changes that do occur tend to be observed-price steps that land close together in time. SKUs where one chain's observed price cycles frequently and the other's does not (Sanitarium Weet-Bix, Henergy eggs) show weak or near-zero correlation because there is no shared cycle to line up. As noted above, the history rows cannot establish whether any of these observed-price movements are discounts, list-price changes, club prices, or another mechanism — "cycling" here describes the price series only. [Grocer price history files, table above]

### Worked example 1 — Coca-Cola Classic 1.5L: same range, opposite phase

Both Woolworths and New World Papakura changed this SKU's observed price on a Monday in almost every week of the 2-year window, cycling between a small set of price points ($2.25-$3.90 low, $4.79-$4.99 high — the history rows cannot establish whether the low points are discounted/club prices or a separate regular-price tier). But in the great majority of weeks sampled, the two chains were never at their low price in the same week — one was at the ~$4.79 high price while the other was at a low price, and they swapped roles the following week:

| Week starting (Mon) | Woolworths Papakura | New World Papakura |
|---|---:|---:|
| 2025-01-06 | $4.79 | $4.79 |
| 2025-01-13 | $3.00 | $4.79 |
| 2025-01-20 | $4.79 | $3.00 |
| 2025-01-27 | $2.50 | $4.79 |
| 2025-02-03 | $4.79 | $2.99 |

[Grocer price history 6655](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet)

This is why identical floor/ceiling and even identical change-cadence (both change on Monday almost every week) do not imply the two retailers charge shoppers the same price at the same time — for this SKU, in most observed weeks a Papakura shopper could have saved 35-53% simply by choosing the chain showing the lower observed price that week, and which chain that was flipped roughly weekly. The pattern is consistent with each chain running its own independent weekly price-change calendar for a high-velocity SKU with a wide observed-price range, which for this SKU at these two Papakura stores happens to land on the same day of the week (Monday, in the observed series above) without the two chains showing their low price simultaneously; it is equally consistent with, and this finding cannot distinguish from, the two chains observing each other's shelf prices and deliberately alternating, or with both following a shared supplier/loyalty price-change calendar set by Coca-Cola Amatil/Europacific Partners rather than by the retailers. Whether Monday is a change-day pattern specific to this SKU/supplier or a broader NZ supermarket practice is not established here — no source for a general claim was found (see "What would change this conclusion"). No claim about which of these explanations is correct is made here. [Grocer price history 6655](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet)

### Worked example 2 — Anchor Milk Blue Top 2L: rare, near-simultaneous observed-price steps

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

The two series ended up at the identical price on five of the six dates sampled above (all but the first, 2024-12-30, where Woolworths was $5.64 against New World's $5.44), after starting a few cents apart each time. Fonterra held the Anchor consumer brand, including Anchor Milk, for most of this study's window: it agreed to sell its global Consumer business — a portfolio including Anchor, Mainland, Kāpiti and other brands — to Lactalis, and completed that sale on 31 March 2026, while agreeing to keep supplying raw milk to the divested business for a minimum of 10 years. Separately, and regardless of who owns the Anchor brand at a given point in the window, the Commerce Commission states Fonterra "retains a dominant share of the domestic raw milk supply," to the point that "there is not currently a workably competitive market process to derive" the farmgate milk price and Fonterra's price "largely determines the price other dairy processors must pay" for their raw-milk input. Given that shared upstream input-cost benchmark, simultaneous observed-price steps that converge to the same shelf price are also consistent with both retailers' milk suppliers passing through the same farmgate cost change rather than the retailers reacting to each other. Supporting that reading: PAK'nSAVE Papakura — which, per the Commerce Commission's 2024 Foodstuffs-merger decision, shares the PAK'nSAVE/New World/Four Square retail banners with New World under the Foodstuffs North Island/South Island co-operatives — tracked New World even more tightly (r = 0.996) than New World tracked Woolworths (r = 0.96) over the same window — the within-banner-group correlation is at least as strong as the cross-company one, which is what a shared-cost story predicts and does not require any cross-company coordination to explain. [Grocer price history 5452](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet); [Commerce Commission, "Our role in dairy"](https://www.comcom.govt.nz/regulated-industries/dairy/our-role-in-dairy/); [Commerce Commission, "Commerce Commission declines clearance for the proposed Foodstuffs merger"](https://www.comcom.govt.nz/news-and-media/news-and-events/2024/commerce-commission-declines-clearance-for-the-proposed-foodstuffs-merger/); [Fonterra, "Sale of consumer and associated businesses FAQs"](https://www.fonterra.com/nz/en/contact-us/sale-of-consumer-and-associated-businesses-faqs.html); [Fonterra, "Fonterra completes sale of Mainland Group to Lactalis"](https://www.fonterra.com/nz/en/our-stories/media/fonterra-completes-sale-of-mainland-group-to-lactalis.html)

### Worked example 3 — Sanitarium Weet-Bix Gluten Free 375g: no shared cycle

Woolworths Papakura ran a near-continuous cycle of observed-price changes on this SKU (11 distinct prices, 60 change events, ranging $6.70-$8.49), while New World Papakura held a near-flat price for almost the entire window (2 distinct prices — $7.49 until 10 November 2025, then $7.79 — a single change event in the full 2 years):

| Date | Woolworths Papakura | New World Papakura |
|---|---:|---:|
| 2024-08-04 | $7.30 | $7.49 |
| 2024-10-14 | $8.10 | $7.49 |
| 2025-06-30 | $7.49 | $7.49 |
| 2025-11-11 | $8.49 | $7.79 |
| 2026-06-22 | $7.79 | $7.79 |

[Grocer price history 30594](https://assets-prod.grocer.nz/public/price_history_v3/price_history_30594.parquet)

The two chains happened to coincide on price on two of the five dates shown, which the data are consistent with being a mechanical result of Woolworths' cycle occasionally passing through New World's mostly-fixed price rather than any coordinated change — but this finding has no source that establishes retailer intent either way. This is the clearest counter-example in the basket to a general "lockstep" story: the two observed series show little co-movement for this SKU (r = 0.45, driven mostly by the one shared step noted above), though whether the underlying retailer behaviour is actually independent cannot be established from price-history data alone. [Grocer price history 30594](https://assets-prod.grocer.nz/public/price_history_v3/price_history_30594.parquet)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Only 2 of 9 basket SKUs share an identical price floor and only 3 of 9 share an identical price ceiling between Woolworths and New World Papakura; the Coca-Cola example that motivated this question is one of the more extreme, not typical, cases. | [Grocer price history files, per-SKU table](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet) (and the other 8 product history files linked in the table above) | Basket-level arithmetic reproduced directly from the cited public Grocer history files in this finding; no independent second-party source exists for this specific 9-SKU comparison. | Medium — exact for this basket/window, not established as general across the wider Grocer catalogue |
| Coca-Cola 1.5L price changes at Woolworths and New World Papakura cluster on the same weekly cadence (mostly Mondays) for two years, yet the daily price levels are negatively correlated (r = -0.76) because the two chains alternate which one shows the lower observed price. | [Grocer price history 6655, Woolworths Papakura](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet) | [Grocer price history 6655, New World Papakura](https://assets-prod.grocer.nz/public/price_history_v3/price_history_6655.parquet) (same file, store_id column distinguishes the two banners) | Medium — arithmetic is exact; the "why" (independent price-change calendars vs. shared supplier calendar vs. mutual observation) is not established and is explicitly not claimed |
| For Anchor Milk Blue Top 2L, PAK'nSAVE Papakura — which shares the PAK'nSAVE/New World/Four Square retail banners with New World Papakura under the Foodstuffs North Island/South Island co-operatives — correlates more tightly with New World Papakura (r = 0.996) than New World correlates with competitor Woolworths (r = 0.96), consistent with shared-cost pass-through rather than cross-company coordination. | [Grocer price history 5452 (New World / PAK'nSAVE rows)](https://assets-prod.grocer.nz/public/price_history_v3/price_history_5452.parquet) | [Commerce Commission, "Commerce Commission declines clearance for the proposed Foodstuffs merger"](https://www.comcom.govt.nz/news-and-media/news-and-events/2024/commerce-commission-declines-clearance-for-the-proposed-foodstuffs-merger/) (establishes the shared-banner relationship only; the correlation itself is a single reproducible computation from the cited Grocer data with no independent second-party source) | Low-Medium — suggestive with only one SKU tested at three stores, not basket-wide |
| Grocer's per-product history rows record only timestamp, store and price, with no field distinguishing shelf/original/sale/club/online status, so this analysis cannot separate an ordinary price change from a promotional cycle at the row level. | [grocer-nz API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md) | [The For Good Project, "Evidence-threshold method for supermarket reference-pricing" (issue #75)](https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/supermarket-pricing-method.md) | High |
| Fonterra held the Anchor consumer brand (via its global Consumer business) for most of this study's window, selling it to Lactalis on 31 March 2026 while retaining a long-term raw-milk supply agreement; separately, Fonterra holds a dominant share of NZ's raw milk supply and its administered farmgate price largely sets the benchmark other processors pay, supporting a shared-upstream-cost explanation for the Anchor Milk co-movement described above. | [Fonterra, "Sale of consumer and associated businesses FAQs"](https://www.fonterra.com/nz/en/contact-us/sale-of-consumer-and-associated-businesses-faqs.html); [Fonterra, "Fonterra completes sale of Mainland Group to Lactalis"](https://www.fonterra.com/nz/en/our-stories/media/fonterra-completes-sale-of-mainland-group-to-lactalis.html) (brand ownership/divestment) | [Commerce Commission, "Our role in dairy"](https://www.comcom.govt.nz/regulated-industries/dairy/our-role-in-dairy/) (raw-milk market dominance; a single regulator statement, not independently cross-checked here) | Medium — brand-ownership facts are dated/sourced; the raw-milk-dominance claim is the regulator's own description of its statutory role |

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
15. Commerce Commission New Zealand. "Our role in dairy." Accessed 2026-07-07. https://www.comcom.govt.nz/regulated-industries/dairy/our-role-in-dairy/
16. Commerce Commission New Zealand. "Commerce Commission declines clearance for the proposed Foodstuffs merger." Accessed 2026-07-07 (via WebFetch; site returns a CloudFront 403 to a plain `curl` request). https://www.comcom.govt.nz/news-and-media/news-and-events/2024/commerce-commission-declines-clearance-for-the-proposed-foodstuffs-merger/
17. Fonterra Co-operative Group. "Sale of consumer and associated businesses FAQs." Accessed 2026-07-07. https://www.fonterra.com/nz/en/contact-us/sale-of-consumer-and-associated-businesses-faqs.html
18. Fonterra Co-operative Group. "Fonterra completes sale of Mainland Group to Lactalis." Accessed 2026-07-07. https://www.fonterra.com/nz/en/our-stories/media/fonterra-completes-sale-of-mainland-group-to-lactalis.html
