---
title: "A 20-SKU Grocer snapshot found NZ grocery price gaps up to 5.27x, with 2x-plus gaps inside Papakura"
domain: "other"
issue: "#694"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-07"
status: "draft"
---

# A 20-SKU Grocer snapshot found NZ grocery price gaps up to 5.27x, with 2x-plus gaps inside Papakura

## Executive answer

- In a fixed 20-SKU basket queried from Grocer's public current-price files on 2026-07-07, the largest observed same-SKU spread was loose lemons: NZ$1.99 at PAK'nSAVE Palmerston N versus NZ$10.49 at New World Gate Pa, a 5.27x effective-price ratio [Grocer current price files: store 257](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_257.parquet), [store 294](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_294.parquet).
- The next largest gaps in the same 20-SKU snapshot were potatoes Vivaldi Gold 2kg at 2.75x, Chelsea white sugar 1.5kg at 2.61x, lemons prepack 1kg at 2.58x, and Coca-Cola Classic 1.5L at 2.37x [Grocer current price files used in table rows below](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet).
- The clearest few-kilometre examples were in Papakura: potatoes Vivaldi Gold 2kg were NZ$3.99 at New World Papakura versus NZ$8.99 at FreshChoice Papakura, Coca-Cola Classic 1.5L was NZ$2.69 at PAK'nSAVE Papakura versus NZ$5.89 at FreshChoice Papakura, and Chelsea white sugar 1.5kg was NZ$2.99 at PAK'nSAVE Papakura versus NZ$6.49 at FreshChoice Papakura [Grocer Papakura price files: Woolworths 118](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [FreshChoice 206](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet), [PAK'nSAVE 230](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [New World 307](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet).
- Same-banner gaps also appeared: FreshChoice Ruakaka versus FreshChoice Cuba Street had lemons prepack 1kg at NZ$3.49 versus NZ$8.99, and FreshChoice Cannons Creek versus FreshChoice Parkwood had Dole Bobby Bananas 850g at NZ$3.49 versus NZ$4.99 [Grocer current price files: store 210](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_210.parquet), [store 196](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_196.parquet), [store 192](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_192.parquet), [store 209](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_209.parquet).
- Treat these as point-in-time price observations, not breach allegations: Grocer's public data exposes current per-store price rows with original, sale, club, online, and multibuy fields, but Grocer also warns that prices can vary by location and time and does not guarantee displayed prices are accurate [Grocer skill notes](https://github.com/thecolab-ai/.skills/blob/34038374116ee537f8cb2fb8d0450d6b7dc21277/skills/grocer-nz/SKILL.md), [Grocer data-audit finding](grocer-nz-data-audit.md).

**Overall confidence:** Medium - the arithmetic is reproducible from public Grocer files, product IDs are fixed, and the Papakura examples are tight. Confidence is not High because this is a current-data snapshot from a third-party price collector; row update times vary by store/product, club prices may not be available to every shopper, and I did not independently verify each shelf price in-store.

## Evidence

### Method and basket

I answered: for a fixed 20-SKU basket of everyday products, what were the largest cheapest-versus-dearest effective-price gaps in a current Grocer per-store snapshot, and which examples were local or same-banner? The `grocer-nz` skill documents Grocer's public base catalogue, per-store current-price parquet files, product search, and current-price fields; prices are stored in NZ cents [Grocer skill notes](https://github.com/thecolab-ai/.skills/blob/34038374116ee537f8cb2fb8d0450d6b7dc21277/skills/grocer-nz/SKILL.md), [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/34038374116ee537f8cb2fb8d0450d6b7dc21277/skills/grocer-nz/references/api-notes.md).

The basket was fixed before ranking: product IDs `71`, `2279`, `4471`, `2116`, `42`, `5452`, `4081`, `7785`, `5795`, `5525`, `4085`, `20040`, `72`, `21510`, `1634`, `23717`, `6655`, `192`, `50692`, and `21610`. Product names, brands, sizes, and store IDs came from Grocer's public base catalogue and search index [Grocer base database](https://assets-prod.grocer.nz/public/base_v3.duckdb.br), [Grocer skill notes](https://github.com/thecolab-ai/.skills/blob/34038374116ee537f8cb2fb8d0450d6b7dc21277/skills/grocer-nz/SKILL.md).

The store universe was the 288 enabled store current-price files already cached by a 2026-07-07 `grocer-nz` all-store attempt before it was stopped for runtime; this covers Woolworths, New World, PAK'nSAVE, FreshChoice, Super Value, and The Warehouse store IDs in the loaded range, but it is not a complete all-enabled-store crawl [Grocer current-price file pattern documented in skill notes](https://github.com/thecolab-ai/.skills/blob/34038374116ee537f8cb2fb8d0450d6b7dc21277/skills/grocer-nz/SKILL.md).

For each product-store row I used `effective_price_cent = least(sale_price_cent, club_price_cent, online_price_cent, original_price_cent)` after ignoring nulls; I excluded multibuy prices because the unit quantity can change the interpretation of the shopper-facing price [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/34038374116ee537f8cb2fb8d0450d6b7dc21277/skills/grocer-nz/references/api-notes.md). That means the gap is "best visible current price in Grocer's row", not necessarily the non-member shelf price for every shopper [Grocer data-audit finding](grocer-nz-data-audit.md).

### Top 10 worst spreads in the 20-SKU snapshot

The table below republishes only ranked analysis and small examples, not bulk Grocer data; exact source files are linked by cheapest/dearest store ID in each row, and row update timestamps are shown in NZ time where available [Grocer data-audit finding](grocer-nz-data-audit.md).

| Rank | Product ID and SKU | Cheapest store | Dearest store | Ratio | Store rows | Distance note | Row timestamp range | Source files |
|---:|---|---|---|---:|---:|---|---|---|
| 1 | `71` Fresh Fruit Lemons (approx. 6/kg) | PAK'nSAVE Palmerston N (`257`) NZ$1.99 | New World Gate Pa (`294`) NZ$10.49 | 5.27x | 180 | Different cities; not a local-distance example | 2026-07-02 to 2026-07-07 | [257](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_257.parquet), [294](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_294.parquet) |
| 2 | `2116` Fresh Vegetable Potatoes Vivaldi Gold 2kg | New World Papakura (`307`) NZ$3.99 | Super Value Milton (`284`) NZ$10.99 | 2.75x | 263 | Different islands/regions; not local | 2026-07-01 to 2026-07-07 | [307](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [284](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_284.parquet) |
| 3 | `72` Chelsea White Sugar 1.5kg | PAK'nSAVE Alderman Dr Hen (`226`) NZ$2.49 | FreshChoice Papakura (`206`) NZ$6.49 | 2.61x | 283 | Different towns; local Papakura variant below is 2.17x | 2026-07-02 to 2026-07-07 | [226](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_226.parquet), [206](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet) |
| 4 | `2279` Fresh Fruit Lemons Prepack 1kg | FreshChoice Ruakaka (`210`) NZ$3.49 | FreshChoice Cuba Street (`196`) NZ$8.99 | 2.58x | 135 | Same banner, different regions | 2026-06-29 to 2026-07-07 | [210](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_210.parquet), [196](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_196.parquet) |
| 5 | `6655` Coca Cola Classic Soft Drink Bottle 1.5L | Woolworths Te Aroha (`155`) NZ$2.49 | FreshChoice Papakura (`206`) NZ$5.89 | 2.37x | 287 | Different towns; local Papakura variant below is 2.19x | 2026-07-01 to 2026-07-07 | [155](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_155.parquet), [206](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet) |
| 6 | `21510` Sanitarium Weet-Bix 750g | New World Papakura (`307`) NZ$3.99 | FreshChoice Papakura (`206`) NZ$7.99 | 2.00x | 286 | Same suburb; exact store distance not computed | 2026-07-02 to 2026-07-07 | [307](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [206](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet) |
| 7 | `42` Loose Red Tomatoes | PAK'nSAVE Sylvia Park (`232`) NZ$5.99 | New World Wanaka (`295`) NZ$11.49 | 1.92x | 267 | Different islands/regions; not local | 2026-07-02 to 2026-07-07 | [232](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_232.parquet), [295](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_295.parquet) |
| 8 | `23717` Wattie's Baked Beans Regular 420g | PAK'nSAVE Kilbirnie (`252`) NZ$1.79 | FreshChoice Avondale (`190`) NZ$3.25 | 1.82x | 285 | Different cities; not local | 2026-07-02 to 2026-07-07 | [252](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_252.parquet), [190](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_190.parquet) |
| 9 | `1634` Sanitarium Marmite 250g | PAK'nSAVE Manukau (`223`) NZ$3.79 | FreshChoice Papakura (`206`) NZ$6.49 | 1.71x | 286 | South Auckland; rough local area but not address-geocoded here | 2026-07-02 to 2026-07-07 | [223](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_223.parquet), [206](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet) |
| 10 | `20040` Edmonds Flour High Grade 1.5kg | New World Waihi (`302`) NZ$2.99 | FreshChoice Papakura (`206`) NZ$4.99 | 1.67x | 277 | Different towns; not local | 2026-06-30 to 2026-07-07 | [302](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_302.parquet), [206](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet) |

### Few-kilometre Papakura examples

The Papakura subset used store IDs `118`, `206`, `230`, and `307`, which the `grocer-nz` skill identifies as Woolworths Papakura, FreshChoice Papakura, PAK'nSAVE Papakura, and New World Papakura [Grocer skill notes](https://github.com/thecolab-ai/.skills/blob/34038374116ee537f8cb2fb8d0450d6b7dc21277/skills/grocer-nz/SKILL.md). Official store pages list New World Papakura at 29-31 East Street, PAK'nSAVE Papakura at 331 Great South Rd, Takanini, and Woolworths Papakura at 2 Averill Street; FreshChoice Papakura's own page resolved but did not expose a clean address in the fetched text, while local directory results list 54 Settlement Road, so I use the FreshChoice address only for rough distance context, not as a pricing source [New World Papakura](https://www.newworld.co.nz/upper-north-island/auckland/papakura), [PAK'nSAVE Papakura](https://www.paknsave.co.nz/upper-north-island/auckland/papakura), [Woolworths Papakura](https://www.woolworths.co.nz/store-finder/9144/papakura/papakura-woolworths), [FreshChoice Papakura](https://papakura.store.freshchoice.co.nz/), [Cybo FreshChoice Papakura](https://www.cybo.com/NZ-biz/freshchoice-papakura).

Using OpenStreetMap/Nominatim geocoding of the address strings, FreshChoice Papakura at 54 Settlement Road is roughly 1.0 km straight-line from Woolworths Papakura at 2 Averill Street and roughly 2.5 km from PAK'nSAVE Papakura at 331 Great South Road; Nominatim did not cleanly geocode the New World street address to a store-level point, so I do not state an exact New World-to-FreshChoice distance [Nominatim search for FreshChoice address](https://nominatim.openstreetmap.org/search?q=54+Settlement+Road%2C+Papakura%2C+Auckland%2C+New+Zealand&format=json&limit=1), [Nominatim search for Woolworths address](https://nominatim.openstreetmap.org/search?q=2+Averill+Street%2C+Papakura%2C+Auckland%2C+New+Zealand&format=json&limit=1), [Nominatim search for PAK'nSAVE address](https://nominatim.openstreetmap.org/search?q=331+Great+South+Road%2C+Takanini%2C+Auckland%2C+New+Zealand&format=json&limit=1), [OpenStreetMap copyright](https://www.openstreetmap.org/copyright).

| Product ID and SKU | Cheapest Papakura store | Dearest Papakura store | Ratio | Stores with price | Row timestamp range | Source files |
|---|---|---|---:|---:|---|---|
| `2116` Potatoes Vivaldi Gold 2kg | New World Papakura NZ$3.99 | FreshChoice Papakura NZ$8.99 | 2.25x | 4 | 2026-07-02 05:03-05:46 NZT | [307](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [206](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet) |
| `6655` Coca-Cola Classic 1.5L | PAK'nSAVE Papakura NZ$2.69 | FreshChoice Papakura NZ$5.89 | 2.19x | 4 | 2026-07-02 05:03-05:48 NZT | [230](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [206](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet) |
| `72` Chelsea White Sugar 1.5kg | PAK'nSAVE Papakura NZ$2.99 | FreshChoice Papakura NZ$6.49 | 2.17x | 4 | 2026-07-02 05:03-05:46 NZT | [230](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet), [206](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet) |
| `21510` Sanitarium Weet-Bix 750g | New World Papakura NZ$3.99 | FreshChoice Papakura NZ$7.99 | 2.00x | 4 | 2026-07-02 05:03-05:46 NZT | [307](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet), [206](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet) |
| `2279` Lemons Prepack 1kg | Woolworths Papakura NZ$4.50 | FreshChoice Papakura NZ$7.99 | 1.78x | 2 | 2026-07-02 05:32-05:46 NZT | [118](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_118.parquet), [206](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet) |

The Papakura results show the "couple of kilometres apart" effect without needing to compare distant towns: for example, Coca-Cola Classic 1.5L and Chelsea white sugar 1.5kg were both more than twice as expensive at FreshChoice Papakura as at PAK'nSAVE Papakura in Grocer's current rows, and those two stores are roughly 2.5 km apart by straight-line address geocoding [Grocer current price files 206 and 230](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet), [Nominatim searches above](https://nominatim.openstreetmap.org/search?q=331+Great+South+Road%2C+Takanini%2C+Auckland%2C+New+Zealand&format=json&limit=1).

### Same-banner cases

The strongest same-banner example in the 20-SKU basket was FreshChoice lemons prepack 1kg: NZ$3.49 at FreshChoice Ruakaka versus NZ$8.99 at FreshChoice Cuba Street, a 2.58x spread [Grocer current price files: store 210](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_210.parquet), [store 196](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_196.parquet).

Other same-banner examples were smaller but still visible: Dole Bobby Bananas 850g were NZ$3.49 at FreshChoice Cannons Creek versus NZ$4.99 at FreshChoice Parkwood, and Tegel Roast Chicken Breast Strips 400g were NZ$9.00 at Woolworths Tauranga versus NZ$12.50 at Woolworths Hastings Central [Grocer current price files: store 192](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_192.parquet), [store 209](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_209.parquet), [store 153](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_153.parquet), [store 53](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_53.parquet).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Grocer exposes current per-store price rows with product, store, timestamp, original, sale, club, online, and multibuy fields. | [Grocer skill notes](https://github.com/thecolab-ai/.skills/blob/34038374116ee537f8cb2fb8d0450d6b7dc21277/skills/grocer-nz/SKILL.md) | [Grocer data-audit finding](grocer-nz-data-audit.md) | High for data shape |
| The biggest observed 20-SKU spread was lemons at 5.27x, NZ$1.99 to NZ$10.49. | [PAK'nSAVE Palmerston N price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_257.parquet) | [New World Gate Pa price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_294.parquet) | Medium; arithmetic is clear, but shelf-price verification is not independent |
| Papakura had multiple 2x-plus same-local-area examples in this basket. | [FreshChoice Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_206.parquet) plus [PAK'nSAVE Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_230.parquet) and [New World Papakura price file](https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_307.parquet) | [Official Papakura store pages/addresses](https://www.paknsave.co.nz/upper-north-island/auckland/papakura) and [Nominatim address checks](https://nominatim.openstreetmap.org/search?q=331+Great+South+Road%2C+Takanini%2C+Auckland%2C+New+Zealand&format=json&limit=1) | Medium |
| The result should not be treated as a complete national ranking. | [This method loaded 288 cached store files, not all enabled stores](https://github.com/thecolab-ai/.skills/blob/34038374116ee537f8cb2fb8d0450d6b7dc21277/skills/grocer-nz/SKILL.md) | [Grocer data-audit finding documents 465 enabled stores on 2026-07-02](grocer-nz-data-audit.md) | High |

## What would change this conclusion

- A complete all-enabled-store crawl on the same date could change the top-ranked stores and ratios; this run used 288 cached current-price files, while the previous Grocer audit found 465 enabled stores on 2026-07-02 [Grocer data-audit finding](grocer-nz-data-audit.md).
- Independent in-store or retailer-app verification of the top examples would raise confidence from Medium to High; without that, these are Grocer current-row observations rather than independently confirmed shelf audits [Grocer terms and data-audit caveats](grocer-nz-data-audit.md).
- A different treatment of club prices could change ratios, because this finding used the lowest visible original/sale/club/online field and did not require that every shopper qualify for a member price [Grocer API notes](https://github.com/thecolab-ai/.skills/blob/34038374116ee537f8cb2fb8d0450d6b7dc21277/skills/grocer-nz/references/api-notes.md).
- Some loose produce rows have null size fields and are best read as retailer-matched product IDs, not proof that every piece of produce is like-for-like in quality, origin, or grade [Grocer base database](https://assets-prod.grocer.nz/public/base_v3.duckdb.br).
- I could not verify Grocer's upstream collection method, exact current-price refresh schedule, or whether the loaded current rows exactly matched in-store shelf labels at the time a shopper walked in [Grocer data-audit finding](grocer-nz-data-audit.md).

## Open follow-up questions

- Run a complete all-enabled-store query with a longer timeout and publish only the same small top-example table.
- Repeat the same 20-SKU basket for several days to separate temporary promotions from persistent store-level price dispersion.
- Add independent retailer-app or in-store checks for the top five examples before using them in any regulator-facing or media-facing brief.

## Sources

1. Grocer public base database, `https://assets-prod.grocer.nz/public/base_v3.duckdb.br`, accessed 2026-07-07 by `grocer-nz` skill.
2. The Colab `.skills` `grocer-nz` skill, commit `34038374116ee537f8cb2fb8d0450d6b7dc21277`, accessed 2026-07-07. https://github.com/thecolab-ai/.skills/blob/34038374116ee537f8cb2fb8d0450d6b7dc21277/skills/grocer-nz/SKILL.md
3. The Colab `.skills` `grocer-nz` API notes, commit `34038374116ee537f8cb2fb8d0450d6b7dc21277`, accessed 2026-07-07. https://github.com/thecolab-ai/.skills/blob/34038374116ee537f8cb2fb8d0450d6b7dc21277/skills/grocer-nz/references/api-notes.md
4. Grocer public current-price files for cited store IDs, URL form `https://assets-prod.grocer.nz/public/prices_per_store_v3/public_prices_<store_id>.parquet`, accessed 2026-07-07 by `grocer-nz` skill; exact store-file URLs are linked in the tables above.
5. Existing finding: `research/findings/other/grocer-nz-data-audit.md`, accessed 2026-07-07.
6. New World Papakura store page, accessed 2026-07-07 by web search/open. https://www.newworld.co.nz/upper-north-island/auckland/papakura
7. PAK'nSAVE Papakura store page, accessed 2026-07-07 by web search/open. https://www.paknsave.co.nz/upper-north-island/auckland/papakura
8. Woolworths Papakura store page, accessed 2026-07-07 by web search/open. https://www.woolworths.co.nz/store-finder/9144/papakura/papakura-woolworths
9. FreshChoice Papakura store page, accessed 2026-07-07 by web search/open. https://papakura.store.freshchoice.co.nz/
10. Cybo FreshChoice Papakura listing, accessed 2026-07-07 by web search/open for address context only. https://www.cybo.com/NZ-biz/freshchoice-papakura
11. OpenStreetMap/Nominatim address searches for Papakura distance estimates, accessed 2026-07-07 by `urllib` with a project user-agent. https://nominatim.openstreetmap.org/
12. OpenStreetMap copyright and licence page, accessed 2026-07-07. https://www.openstreetmap.org/copyright
