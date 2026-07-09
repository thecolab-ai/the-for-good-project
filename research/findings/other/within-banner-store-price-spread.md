---
title: "Same-banner grocery prices can vary by branch, but the pattern differs by chain and region"
domain: "other"
issue: "#697"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-07"
status: "draft"
---

# Same-banner grocery prices can vary by branch, but the pattern differs by chain and region

## Executive answer

- In a 15-SKU same-product basket across four Auckland Woolworths stores, four Auckland New World stores, and four South Auckland PAK'nSAVE stores, the within-banner branch effect ranged from **$0.00** at Woolworths to **$18.70** at New World and **$6.89** at PAK'nSAVE for the full basket, using Grocer.nz current public price files accessed on 2026-07-07. [Grocer base catalogue](https://assets-prod.grocer.nz/public/base_v3.duckdb.br); [Grocer current price files](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_316.parquet)
- The largest single-SKU within-banner spread in this basket was **$7.50** for Dove Body Wash Triple Moisturising 1l inside the PAK'nSAVE South Auckland group: PAK'nSAVE Manukau and Clendon were $9.49, while PAK'nSAVE Papakura was $16.99. [Grocer PAK'nSAVE Manukau price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_223.parquet); [Grocer PAK'nSAVE Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet)
- New World's branch effect in this small Auckland group was concentrated in one branch: New World Metro Auckland was the dearest branch for all 15 SKUs, and the other three New World stores tied at the lower basket total. [Grocer New World Metro Auckland price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_316.parquet); [Grocer New World Stonefields price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_308.parquet)
- PAK'nSAVE's higher prices did not cluster cleanly by one named branch in this basket: PAK'nSAVE Papakura had the highest basket total, but Manukau and Clendon tied for the highest price on 10 of 15 SKUs, and Ormiston had the lowest basket total. [Grocer PAK'nSAVE Ormiston price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_228.parquet); [Grocer PAK'nSAVE Clendon price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_231.parquet)

**Overall confidence:** Medium - the calculation is reproducible from public Grocer.nz assets and exact product/store IDs, but it is a one-day public-data snapshot, not a retailer-confirmed shelf audit, and Grocer row-level `updated_at` values for these stores ranged from 2026-07-01 to 2026-07-06 even though the files were accessed together on 2026-07-07. [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md); [Grocer current price files](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_9.parquet)

## Evidence

### Question and method

This finding answers the narrow question: for identical Grocer.nz product IDs in same-banner store groups, how much did the current single-unit price vary by branch in one public snapshot? Grocer.nz public assets expose a base catalogue containing stores and products, plus per-store current price parquet files under `prices_per_store_v3/public_prices_<store_id>.parquet`; the vendored `grocer-nz` skill documents those public asset paths and price fields. [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md); [Grocer base catalogue](https://assets-prod.grocer.nz/public/base_v3.duckdb.br)

I selected three same-banner store groups from the Grocer store catalogue: Woolworths Auckland Quay Street (`9`), Auckland Victoria Street West (`10`), Grey Lynn (`50`), and Newmarket (`104`); New World Metro Auckland (`316`), Newmarket (`403`), Remuera (`378`), and Stonefields (`308`); and PAK'nSAVE Manukau (`223`), Ormiston (`228`), Papakura (`230`), and Clendon (`231`). [Grocer base catalogue](https://assets-prod.grocer.nz/public/base_v3.duckdb.br)

The 15-SKU basket used only product IDs with current price rows in every selected branch: Anchor Milk Blue Top 2l (`5452`), Tip Top Bread Supersoft White Toast 700g (`4085`), Mainland Butter Natural 500g (`5654`), Cobram Estate Olive Oil Extra Virgin Classic 750ml (`27273`), Pic's Really Good Crunchy Peanut Butter 1kg (`25233`), Moccona Classic Dark Roast Instant Freeze Dried Coffee Jar 200g (`18609`), Kellogg's Coco Pops Chex Breakfast Cereal 500g (`29404`), Hellers Manuka Smoked Streaky Bacon 800g (`5803`), Tegel Take Outs Louisiana Style Free Range Chicken Tenders 500g (`21266`), Finish Ultimate All In 1 Dishwashing Tablets Lemon Sparkle 50 Pack (`32523`), Persil Laundry Powder Front & Top Loader Ultimate 2kg (`5394`), Dove Body Wash Triple Moisturising 1l (`10032`), Listerine Mouth Wash Freshburst Antiseptic 1l (`20562`), Nurofen Zavance Liquid Capsules 20s (`9038`), and Sudocrem Healing Skin Cream Tub 125g (`23333`). [Grocer base catalogue](https://assets-prod.grocer.nz/public/base_v3.duckdb.br); [Grocer current price files](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_223.parquet)

For each product/store row, I used the lowest non-null single-unit price among `original_price_cent`, `sale_price_cent`, `club_price_cent`, and `online_price_cent`, and I ignored multibuy fields because the question is a one-unit basket comparison rather than a quantity-deal comparison. [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md)

### Basket-level results

| Same-banner group | Store IDs | Cheapest branch basket | Dearest branch basket | Basket branch spread | Average SKU spread | Worst SKU spread |
|---|---:|---:|---:|---:|---:|---:|
| Woolworths Auckland | 9, 10, 50, 104 | $245.87 | $245.87 | $0.00 | $0.00 | $0.00 |
| New World Auckland | 316, 403, 378, 308 | $251.15 | $269.85 | $18.70 | $1.25 | $4.70 |
| PAK'nSAVE South Auckland | 223, 228, 230, 231 | $209.52 | $216.41 | $6.89 | $3.03 | $7.50 |

The Woolworths result means all four selected Woolworths branches had the same current effective price for all 15 selected SKUs in the accessed public files. [Grocer Woolworths Quay Street price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_9.parquet); [Grocer Woolworths Newmarket price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_104.parquet)

The New World result was a one-branch pattern: New World Metro Auckland totalled $269.85, while New World Newmarket, Remuera, and Stonefields each totalled $251.15 on the same 15-product basket. [Grocer New World Metro Auckland price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_316.parquet); [Grocer New World Newmarket price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_403.parquet); [Grocer New World Remuera price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_378.parquet); [Grocer New World Stonefields price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_308.parquet)

The PAK'nSAVE result was less spatially clean: Ormiston had the lowest basket total at $209.52, Manukau and Clendon tied at $213.30, and Papakura had the highest basket total at $216.41. [Grocer PAK'nSAVE Ormiston price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_228.parquet); [Grocer PAK'nSAVE Manukau price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_223.parquet); [Grocer PAK'nSAVE Clendon price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_231.parquet); [Grocer PAK'nSAVE Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet)

### Same-SKU spread examples

The New World basket's largest within-banner spread was Finish Ultimate All In 1 Dishwashing Tablets Lemon Sparkle 50 Pack: New World Stonefields, Remuera, and Newmarket were $37.69, while New World Metro Auckland was $42.39, a $4.70 spread. [Grocer New World Stonefields price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_308.parquet); [Grocer New World Metro Auckland price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_316.parquet)

The PAK'nSAVE basket's largest within-banner spread was Dove Body Wash Triple Moisturising 1l: PAK'nSAVE Manukau and Clendon were $9.49, while PAK'nSAVE Papakura was $16.99, a $7.50 spread. [Grocer PAK'nSAVE Manukau price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_223.parquet); [Grocer PAK'nSAVE Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet)

Every selected Woolworths branch had the same current effective price for the example staple SKUs Anchor Milk Blue Top 2l, Tip Top Bread Supersoft White Toast 700g, Mainland Butter Natural 500g, and the other 12 selected SKUs. [Grocer Woolworths Victoria Street West price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_10.parquet); [Grocer Woolworths Grey Lynn price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_50.parquet)

### Per-SKU spread summary

| Product ID | SKU | Woolworths spread | New World spread | PAK'nSAVE spread |
|---:|---|---:|---:|---:|
| 4085 | Tip Top Supersoft White Toast 700g | $0.00 | $0.00 | $0.58 |
| 5394 | Persil Laundry Powder Front & Top Loader Ultimate 2kg | $0.00 | $0.00 | $4.70 |
| 5452 | Anchor Milk Blue Top 2l | $0.00 | $0.00 | $0.06 |
| 5654 | Mainland Butter Natural 500g | $0.00 | $1.30 | $0.00 |
| 5803 | Hellers Manuka Smoked Streaky Bacon 800g | $0.00 | $0.00 | $3.97 |
| 9038 | Nurofen Zavance Liquid Capsules 20s | $0.00 | $1.70 | $0.00 |
| 10032 | Dove Body Wash Triple Moisturising 1l | $0.00 | $0.00 | $7.50 |
| 18609 | Moccona Classic Dark Roast Instant Coffee Jar 200g | $0.00 | $3.60 | $6.50 |
| 20562 | Listerine Freshburst Antiseptic Mouth Wash 1l | $0.00 | $1.70 | $2.00 |
| 21266 | Tegel Take Outs Louisiana Style Chicken Tenders 500g | $0.00 | $0.00 | $5.50 |
| 23333 | Sudocrem Healing Skin Cream Tub 125g | $0.00 | $2.00 | $3.00 |
| 25233 | Pic's Really Good Crunchy Peanut Butter 1kg | $0.00 | $2.20 | $2.40 |
| 27273 | Cobram Estate Extra Virgin Olive Oil Classic 750ml | $0.00 | $0.00 | $3.00 |
| 29404 | Kellogg's Coco Pops Chex Breakfast Cereal 500g | $0.00 | $1.50 | $4.20 |
| 32523 | Finish Ultimate All In 1 Dishwashing Tablets Lemon 50pk | $0.00 | $4.70 | $2.00 |

The table above is a derived spread table from the 12 named current price files and the Grocer base catalogue, not a republication of the full per-store price table. [Grocer base catalogue](https://assets-prod.grocer.nz/public/base_v3.duckdb.br); [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md)

### Do higher-priced branches cluster?

For this sample, the only clear cluster-like signal is New World Metro Auckland: it was the dearest of the four New World branches for all 15 SKUs, while the other three selected New World branches tied on every SKU that did not vary. [Grocer New World Metro Auckland price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_316.parquet); [Grocer New World Stonefields price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_308.parquet)

I did not geocode stores, measure distance, or use suburb deprivation/income data, so the branch-clustering statement is limited to store names and basket totals rather than a socioeconomic or geographic model. [Grocer base catalogue](https://assets-prod.grocer.nz/public/base_v3.duckdb.br)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| In this 15-SKU snapshot, a shopper choosing New World Metro Auckland rather than New World Stonefields/Remuera/Newmarket would see an $18.70 higher same-banner basket total. | [Grocer New World Metro Auckland price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_316.parquet) | [Grocer New World Stonefields price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_308.parquet), checked against [base catalogue product/store IDs](https://assets-prod.grocer.nz/public/base_v3.duckdb.br) | Medium |
| In this 15-SKU snapshot, the four selected Woolworths Auckland branches had no within-banner spread. | [Grocer Woolworths Quay Street price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_9.parquet) | [Grocer Woolworths Newmarket price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_104.parquet), checked against [base catalogue product/store IDs](https://assets-prod.grocer.nz/public/base_v3.duckdb.br) | Medium |
| The largest observed same-banner SKU spread in this basket was $7.50 inside PAK'nSAVE South Auckland. | [Grocer PAK'nSAVE Manukau price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_223.parquet) | [Grocer PAK'nSAVE Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), checked against [base catalogue product/store IDs](https://assets-prod.grocer.nz/public/base_v3.duckdb.br) | Medium |

These claims are not independently verified by retailer websites or physical shelf checks; the "two sources" are independent store price files inside the same Grocer.nz public data system, so they are reproducible but not independent of Grocer as the aggregator. [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md)

## What would change this conclusion

- A retailer-confirmed API, receipt audit, or in-store shelf audit for the same product IDs and branches on the same calendar day would raise confidence or overturn any Grocer.nz aggregation error. [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md)
- A larger basket chosen by household expenditure weights rather than by "available in all selected stores" could change the basket-level dollar spreads. [Stats NZ Selected Price Indexes methodology](https://datainfoplus.stats.govt.nz/Item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65)
- A wider store sample within Auckland, including more outer-suburb and high-income/low-income areas, could change the branch-clustering result; this finding used store names but did not geocode stores or model suburb characteristics. [Grocer base catalogue](https://assets-prod.grocer.nz/public/base_v3.duckdb.br)
- I could not verify whether Grocer's `club_price_cent` always represents a price available to every shopper without a paid or otherwise restricted membership, so the effective-price method should be treated as "lowest listed single-unit price" rather than guaranteed walk-in cash price. [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md)
- I could not establish whether the row-level `updated_at` field is the retailer's last price change time, Grocer's scrape/ingest time, or another internal timestamp; the public files were accessed together on 2026-07-07, but row timestamps in the selected rows ranged from 2026-07-01 to 2026-07-06. [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md)

## Open follow-up questions

- Does the same pattern hold for a larger, food-only basket weighted to Stats NZ grocery-food categories rather than a basket constrained by complete availability across all selected stores?
- Are New World Metro-format stores systematically dearer than non-metro New World stores for identical SKUs, or was this snapshot/store group an outlier?
- How much do within-banner spreads change when multibuy offers are converted into unit prices for realistic household quantities?

## Sources

1. Grocer public base catalogue, `https://assets-prod.grocer.nz/public/base_v3.duckdb.br`, accessed 2026-07-07; fast fetch with `curl -I -L` returned HTTP 200 and `last-modified: Mon, 06 Jul 2026 18:22:37 GMT`.
2. Grocer public current price file, Woolworths Auckland Quay Street store `9`, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_9.parquet`, accessed 2026-07-07; fast fetch with `curl -I -L` returned HTTP 200.
3. Grocer public current price file, Woolworths Auckland Victoria Street West store `10`, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_10.parquet`, accessed 2026-07-07.
4. Grocer public current price file, Woolworths Grey Lynn store `50`, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_50.parquet`, accessed 2026-07-07.
5. Grocer public current price file, Woolworths Newmarket store `104`, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_104.parquet`, accessed 2026-07-07.
6. Grocer public current price file, New World Metro Auckland store `316`, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_316.parquet`, accessed 2026-07-07; fast fetch with `curl -I -L` returned HTTP 200.
7. Grocer public current price file, New World Newmarket store `403`, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_403.parquet`, accessed 2026-07-07.
8. Grocer public current price file, New World Remuera store `378`, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_378.parquet`, accessed 2026-07-07.
9. Grocer public current price file, New World Stonefields store `308`, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_308.parquet`, accessed 2026-07-07.
10. Grocer public current price file, PAK'nSAVE Manukau store `223`, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_223.parquet`, accessed 2026-07-07; fast fetch with `curl -I -L` returned HTTP 200.
11. Grocer public current price file, PAK'nSAVE Ormiston store `228`, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_228.parquet`, accessed 2026-07-07.
12. Grocer public current price file, PAK'nSAVE Papakura store `230`, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet`, accessed 2026-07-07.
13. Grocer public current price file, PAK'nSAVE Clendon store `231`, `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_231.parquet`, accessed 2026-07-07.
14. The Colab `.skills` `grocer-nz` API notes, accessed 2026-07-07, `https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md`; local submodule commit used for the CLI was `34038374116ee537f8cb2fb8d0450d6b7dc21277`.
15. Stats NZ DataInfo+, Selected Price Indexes methodology, `https://datainfoplus.stats.govt.nz/Item/nz.govt.stats/9e9f65b8-533f-4e96-8d6e-030d37de1a65`, accessed 2026-07-07.
