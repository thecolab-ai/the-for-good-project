---
title: "Post-FTA EU/UK export growth is mostly additive new trade, not redirected China-bound goods — and where dollars suggest redirection, physical volume shows it is 3-7x smaller than it looks"
domain: "other"
issue: "#725"
confidence: "Medium"
author: "claude"
agent: "claude"
model: "claude-sonnet-5"
date: "2026-07-07"
status: "draft"
---

# Post-FTA EU/UK export growth is mostly additive new trade, not redirected China-bound goods — and where dollars suggest redirection, physical volume shows it is 3-7x smaller than it looks

Part of #438. Stream: #438. This answers #725, opened by the stream's synthesis because both #501 and #502 flagged that they could not distinguish redirection (the same product moving from a China buyer to an EU/UK buyer) from additive growth (new trade that isn't replacing anything). The question this file answers: **for the specific commodities where NZ's China exposure is concentrated, did the post-FTA rise in EU/UK exports (2021-2025) come out of a falling China trade, or did it happen alongside a stable-or-growing China trade?**

**Narrowing:** this is a product-level (HS code) analysis for the ten commodity lines already profiled in #502 (milk powder, butter, cheese, sheepmeat, beef, edible offal, casings, logs, kiwifruit, apples) — chosen so this finding composes directly with that one rather than introducing a new product list. It does not cover manufactured/industrial goods, wine, or seafood (MFAT's cited "$1,191m industrial products" EU growth in #501 is out of scope here), and it does not attempt a full 90-plus-HS-chapter economy-wide redirection model — see "Open follow-up questions".

## Executive answer

- **At the whole-of-goods level, this is additive growth, not redirection.** Total NZ goods exports to China were essentially flat from calendar 2021 ($20.04b) to calendar 2025 ($19.79b, -1.3%), while exports to the EU+UK combined grew 60.7% ($5.47b → $8.80b, +$3.32b) over the same span, computed directly from Stats NZ's official HS10-by-country-by-port export datasets [Stats NZ, Overseas merchandise trade datasets](https://www.stats.govt.nz/large-datasets/csv-files-for-download/overseas-merchandise-trade-datasets/). Because China's own export total did not shrink over the full period, the EU/UK's $3.32b of growth cannot mechanically be "redirected" China volume — there was no equivalent China-side decline to redirect from. (China's *share* of a growing total pie fell from 31.6% to 24.8% over the same years — a figure that independently reproduces sibling finding #499's own computation from the same raw dataset [china-share-decade-movement.md](china-share-decade-movement.md), which is a useful cross-check of both scripts, though both ultimately trace to the same Stats NZ source rather than being fully independent.)
- **Product by product, the pattern splits three ways.** For **milk powder, logs/wood, and edible offal**, China genuinely fell in dollar terms (2021→2025: milk powder -45.0%, logs -12.8%, offal -28.9%), but EU+UK growth in the same product covers only **1.8%, -0.03%, and 73.7%** of that dollar loss respectively — and when measured in physical kilograms rather than dollars, the offal "redirection" all but disappears (3.6% of the lost volume, not 73.7% of the lost dollars). For **butter, cheese, and casings**, China itself *grew* over the period (+99%, +71%, +24%), so there is no China decline for EU/UK growth to be redirecting from at all — these are purely additive. For **sheepmeat, beef, and kiwifruit** the picture is genuinely mixed with real redirection-shaped movement, detailed below. **Apples move the other way entirely**: China grew 108.6% while EU+UK fell 57.4% — concentration toward China, not diversification away from it.
- **Where redirection looks real in dollars, it is much smaller in physical volume — because EU/UK realise a large per-kg price premium on the same commodity.** Sheepmeat: China's dollar loss (-$1,133m) looks 45.5% offset by EU+UK's dollar gain (+$515m), but in physical kilograms only 6.2% of China's lost sheepmeat volume shows up as extra EU/UK volume. Beef: the dollar-offset ratio is 35.4%, but the kilogram-offset ratio is 16.4%. This gap exists because EU/UK sheepmeat and beef sell at roughly 2.5-3x China's per-kg price — a mechanism already documented in #502 (EU sheepmeat NZ$20.05/kg vs China NZ$7.04/kg; MIA 2025 [MIA, 2025 red meat export release](https://mia.co.nz/new-zealand-red-meat-exports-reached-record-levels-during-2025/)) — so a modest volume shift produces an outsized dollar-redirection number. **A dollar-only redirection analysis (as in #501/#502) systematically overstates real product redirection by roughly 3-7x for meat.**
- **For beef specifically, the US — not the EU or UK — is the larger beneficiary of China's decline.** US beef exports (HS 0201+0202 combined) rose $340.7m from 2021 to 2025, exceeding the EU+UK's combined $314.7m gain, verified directly from the same country-level Stats NZ rows used throughout this analysis.
- **Kiwifruit initially looked like a case of EU decline, but that was a data-labelling artefact I had to correct.** Stats NZ records a large share of kiwifruit exports under the literal country label "Destination Unknown - EU" (likely reflecting consolidated shipment/customs-declaration practice through Zespri's European distribution hub) rather than under an EU member-state name. Once that bucket is included in the EU total, EU kiwifruit exports actually *grew* 30.8% (2021→2025, $795.5m→$1,040.6m) in step with China's 45.2% growth ($655.6m→$951.8m) — both markets expanding together, which is additive growth, not one substituting for the other.

**Overall confidence:** Medium. The underlying dataset (Stats NZ's official monthly HS10-by-country-by-port export files) is a High-confidence primary source and the same one sibling finding #499 used independently. The specific redirection-ratio arithmetic is my own reproducible computation (methodology below) rather than a Stats NZ-published statistic, so I mark it Medium; the qualitative pattern (additive vs redirective vs reverse) is more robust than the exact percentages, which are sensitive to which two calendar years are compared.

## Evidence

### Method

I downloaded Stats NZ's official monthly "HS10 by Country by Port" export CSV datasets for January 2021 through May 2026 (65 files, ~19,000-20,000 rows each) from the zipped archives linked on the [Overseas merchandise trade datasets page](https://www.stats.govt.nz/large-datasets/csv-files-for-download/overseas-merchandise-trade-datasets/) (page itself is JS-rendered and returns only a navigation skeleton to a plain fetch; the underlying `www3.stats.govt.nz` zip download links are static files fetched directly by `curl` with a browser user-agent, HTTP 200). Each row carries a 10-digit Harmonised System code, destination country, NZ port, "Total Exports ($NZD fob)" value, and "Total Gross Weight" (kilograms, consistent across rows regardless of the row's own unit-of-quantity field — verified against HS chapters using KGM, LTR, and MTQ unit-of-quantity codes).

I wrote a Python script to sum, by calendar year, the value and weight of exports matching each target HS heading, grouped into four destination buckets: **China** ("China, People's Republic of" only — Hong Kong and Taiwan are counted separately, matching the convention in #498-#502), **EU27** (all 27 current member-state names as coded by Stats NZ, see note below), **UK** ("United Kingdom"), and **Other** (everything else, including the US, Hong Kong, Taiwan, Japan, and Southeast Asia). The ten HS headings match #502's product list: milk powder (0402), butter (0405), cheese (0406), sheepmeat (0204), beef fresh/chilled+frozen (0201+0202), edible offal (0206), casings/guts/bladders (0504), wood in the rough/logs (4403), kiwifruit (0810.50), and apples (0808.10).

**Data-quality note on the "EU" grouping.** Stats NZ's country field includes a literal value "Destination Unknown - EU" that I initially missed on a first pass — it is used almost exclusively for kiwifruit (HS 0810: $1.04b of a $1.22b total across all products in 2025) with negligible presence elsewhere (confirmed by a full 2025 breakdown by HS chapter). I have included it in the EU27 total throughout this finding; omitting it would make it look as though EU kiwifruit exports collapsed after 2021, which is not correct — it is a customs/consolidated-shipment labelling artefact, not a real decline. This is flagged because it changes the kiwifruit conclusion from "EU declining while China grows" to "both growing together," and because I cannot fully explain *why* Stats NZ uses this label for one product only (see "What would change this conclusion").

Comparison years are calendar 2021 (before the UK FTA, in force 31 May 2023, and well before the EU FTA, in force 1 May 2024) and calendar 2025 (the first calendar year in which both FTAs were in force for their full 12 months). January-May 2026 data was pulled and checked for directional consistency but is not used for the headline percentages because it is a partial year.

### Full results table (dollar value, NZD, calendar years)

| Product (HS heading) | China 2021 | China 2025 | China Δ | EU+UK 2021 | EU+UK 2025 | EU+UK Δ | $ "redirection ratio"¹ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Milk powder (0402) | $4,888.7m | $2,686.6m | -45.0% | $3.5m | $43.1m | +1,115.9% | 1.8% |
| Butter (0405) | $746.6m | $1,488.3m | +99.3% | $36.2m | $282.3m | +679.0% | n/a — China grew |
| Cheese (0406) | $527.5m | $899.6m | +70.5% | $0.003m | $74.5m | +2,374,670% | n/a — China grew |
| Sheepmeat (0204) | $2,021.1m | $887.6m | -56.1% | $1,012.3m | $1,527.6m | +50.9% | 45.5% |
| Beef (0201+0202) | $1,586.9m | $698.1m | -56.0% | $59.4m | $374.1m | +529.7% | 35.4% |
| Edible offal (0206) | $67.3m | $47.9m | -28.9% | $29.8m | $44.2m | +48.1% | 73.7% |
| Casings (0504) | $201.6m | $250.8m | +24.4% | $28.2m | $27.6m | -2.0% | n/a — China grew |
| Logs/wood (4403) | $3,468.0m | $3,024.8m | -12.8% | $0.31m | $0.27m | -12.9% | -0.03% |
| Kiwifruit (0810.50) | $655.6m | $951.8m | +45.2% | $795.5m | $1,040.6m | +30.8% | n/a — China grew |
| Apples (0808.10) | $127.5m | $266.0m | +108.6% | $167.6m | $71.5m | -57.4% | negative — reverse direction |

¹ "$ redirection ratio" = (EU+UK dollar gain) ÷ (China dollar loss), only meaningful where China fell. It is an upper-bound plausibility check, not a causal estimate — it says "the EU/UK gain could explain at most this much of the China loss if every dollar of it came from displaced China-bound product," which the volume figures below show is not what happened for meat.

*Source for this table: my own aggregation of Stats NZ's HS10-by-country-by-port monthly export files, 2021 and 2025 (see Sources). All figures are "Total Exports ($NZD fob)" summed across all NZ ports and, for EU27, all 27 member-state country labels plus "Destination Unknown - EU".*

### Physical-volume cross-check (kilograms, calendar years)

Dollar figures mix a real quantity effect with a price effect. I re-ran the same aggregation on "Total Gross Weight" (kilograms) to isolate whether the *product itself* moved, independent of price:

| Product | China 2021 (kg) | China 2025 (kg) | China Δ | EU+UK 2021 (kg) | EU+UK 2025 (kg) | EU+UK Δ | kg redirection ratio |
|---|---:|---:|---:|---:|---:|---:|---:|
| Milk powder | 984.5m | 463.2m | -53.0% | 0.83m | 6.6m | +699.4% | 1.1% |
| Sheepmeat | 245.8m | 127.5m | -48.1% | 80.6m | 87.9m | +9.0% | 6.2% |
| Beef | 217.1m | 92.8m | -57.2% | 4.5m | 25.0m | +450.7% | 16.4% |
| Edible offal | 11.03m | 7.40m | -33.0% | 7.08m | 7.21m | +1.9% | 3.6% |
| Logs/wood | 19,485.1m | 19,079.1m | -2.1% | 0.03m | 0.07m | +154.4% | ~0.0% |
| Kiwifruit | 137.7m | 171.8m | +24.7% | 271.2m | 259.3m | -4.4% | n/a — both moved, China grew |
| Apples | 39.3m | 68.7m | +74.7% | 101.3m | 37.2m | -63.3% | reverse direction, confirmed by volume too |

*Source: same Stats NZ dataset, "Total Gross Weight" field, kilograms confirmed as the consistent unit regardless of each row's own quantity-unit code (KGM for meat/dairy rows, MTQ cubic-metres for logs — gross weight is still reported in kg for all).*

**Reading the two tables together:**
- **Milk powder, logs, offal:** the kg ratios (1.1%, ~0%, 3.6%) track closely with or are lower than the dollar ratios, confirming these are genuinely not being redirected to the EU/UK in any meaningful sense — whatever dollar "gain" exists is a small, mostly price-driven blip on a tiny base. This matches and sharpens #502's separate finding that the EU dairy quota is capped far below China's dairy volume and that logs have essentially no EU/UK market at all.
- **Sheepmeat and beef:** the kg ratios (6.2%, 16.4%) are markedly lower than the dollar ratios (45.5%, 35.4%) — roughly 4-7x smaller. This is the clearest quantitative evidence in this analysis that #501/#502's dollar-based "diversification is real" reading needs a substantial discount: most of the *apparent* redirection in these two products is EU/UK's much higher per-kg price, not NZ meat physically moving from a Chinese buyer to a European one.
- **Apples:** both dollar and kg tables agree — this is real, physical concentration toward China and away from the EU/UK, the opposite of the diversification narrative for this one product.
- **Kiwifruit:** dollar value rose in both markets while EU physical weight was essentially flat (-4.4%) as EU dollar value rose 30.8% — implying EU per-kg kiwifruit prices rose substantially over the period, consistent with #502's finding on Zespri's SunGold-driven pricing power, but the EU volume itself did not come from a China shortfall (China's own kiwifruit volume grew at the same time).

### Country-level verification of the beef "who benefited" question

Because the aggregate "Other" bucket for beef grew more ($530.7m) than the EU+UK combined ($314.7m), I checked which country actually accounts for that: US beef exports (HS 0201 fresh/chilled + 0202 frozen) rose from $1,332.2m (2021: $124.8m + $1,207.4m) to $1,672.9m (2025: $202.9m + $1,470.0m), a gain of $340.7m — larger than the EU+UK's combined $314.7m gain, and consistent with #502's separate finding that the US is already NZ's largest red-meat market by value.

### Aggregate all-goods check

Summing all HS codes (not just the ten above) by destination for the same two years: China $20,039.9m (2021) → $19,787.4m (2025), essentially flat (-1.3%); EU27+UK $5,473.7m (2021) → $8,796.5m (2025), +60.7% (+$3,322.8m); total NZ goods exports $63.46b → $79.92b, +25.9%. China's *share* of total goods exports over these same two years (31.6% → 24.8%) reproduces sibling finding #499's independently-computed figure from the same underlying Stats NZ dataset [china-share-decade-movement.md](china-share-decade-movement.md) — a useful cross-check that both aggregation scripts (built independently, by different agents, on different dates) agree, though both ultimately draw on the same root data rather than being fully independent sources. This aggregate check is the strongest evidence in this finding for the headline conclusion: China's total export value did not shrink enough, over 2021-2025, to mechanically account for the EU/UK's $3.32b of growth — most of that growth has to be additive.

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| EU+UK dollar gain in milk powder ($40m) covers only 1.8% of China's $2.2b dollar loss (2021-2025) | My aggregation of [Stats NZ HS10-by-country-by-port export datasets](https://www.stats.govt.nz/large-datasets/csv-files-for-download/overseas-merchandise-trade-datasets/) | Consistent with the mechanism already documented in #502: the EU-FTA milk-powder quota caps at only 15,000 tonnes by 2031 against roughly 700,000 tonnes/year of China-bound milk powder [MFAT, NZ-EU FTA Key Outcomes PDF](https://www.mfat.govt.nz/assets/Trade-agreements/EU-NZ-FTA/NZ-EU-FTA-Key-Outcomes-.pdf) | Medium-High |
| Physical-volume sheepmeat/beef redirection (6.2%/16.4%) is 4-7x smaller than the dollar-based ratio (45.5%/35.4%) because EU/UK realise a much higher per-kg price | My own kg vs $ computation from the same Stats NZ dataset | The ~3x EU-vs-China per-kg sheepmeat price gap that explains this mechanism is independently documented in #502 from [MIA, 2025 red meat export release](https://mia.co.nz/new-zealand-red-meat-exports-reached-record-levels-during-2025/) ($20.05/kg EU vs $7.04/kg China sheepmeat) | Medium-High |
| The US, not the EU or UK, is the larger single beneficiary of China's beef export decline (+$340.7m vs +$314.7m, 2021-2025) | My aggregation of the same Stats NZ dataset, country-level breakdown | Single dataset (Stats NZ) but cross-checked across two separate HS codes (0201 fresh/chilled, 0202 frozen) that both show the same US-first pattern; qualitatively consistent with #502's note that the US is already NZ's largest red-meat market by value | Medium |
| "Destination Unknown - EU" is a Stats NZ country-field label used almost exclusively for kiwifruit (HS 0810), and omitting it makes EU kiwifruit exports look like they collapsed when they did not | My own direct inspection of the raw Stats NZ dataset (full 2025 HS-chapter breakdown of that one country label) | **Only one source found** — this is an artefact of Stats NZ's own customs-recording practice, not independently documented elsewhere that I could find; flagged as a methodology note rather than a load-bearing external fact | Medium |
| China's share of NZ goods exports fell from 31.6% (2021) to 24.8% (2025) | My own aggregation of the Stats NZ HS10-by-country-by-port dataset | Independently reproduces sibling finding #499's separately-computed 31.6%→24.8% figure [china-share-decade-movement.md](china-share-decade-movement.md), built by a different agent from the same root Stats NZ files on a different date | High for direction/magnitude; both ultimately trace to one Stats NZ source family |

## What would change this conclusion

- **A full HS-chapter (not just ten agri/wood lines) version of this analysis** would confirm whether the "additive, not redirective" aggregate pattern holds for manufactured/industrial goods too — #501 cites EU industrial-product growth of 44% to $1,191m that this finding does not examine at the product level. My all-goods aggregate check (China flat, EU+UK +60.7%) is suggestive that the pattern holds economy-wide, but it is not a product-by-product confirmation outside the ten lines analysed here.
- **A Laspeyres/Paasche-style price-and-volume-separated trade index**, built properly rather than via my ad hoc dollar-vs-kilogram comparison, would give defensible price-adjusted redirection ratios instead of the illustrative ones here. My kg-based ratios are a reasonable proxy but conflate "price" with "product mix" (e.g., a shift toward higher-value cuts within the same HS heading would look like a price effect in my method but is really a mix effect).
- **Confirmation of exactly why Stats NZ uses "Destination Unknown - EU"** — if it turns out to be an artefact specific to one shipping/consolidation arrangement (e.g., Zespri's Antwerp hub) rather than a general EU customs practice, it would change how much to trust the EU totals for *other* high-value perishables that might use similar consolidated shipping routes but weren't checked here (I only confirmed the label is immaterial for the other nine products in this analysis, in 2025 data).
- **A cleaner test window.** Using 2021 vs 2025 mixes a genuine mid-period China demand contraction (documented in #501: China exports fell in 2023 and 2024 before recovering in 2025) with the FTA-driven EU/UK growth. If the analysis were re-run using 2019 (last pre-COVID year) as the baseline instead of 2021 (a COVID-distorted high point for China), some of these ratios would likely change, particularly for products where the 2021 China figure was itself an outlier.
- **Confidentiality-suppressed rows.** Stats NZ runs an "Annual confidentiality review" that can mask small counts in trade data; none of the rows I sampled showed a suppression flag (all showed status "Final"), but I did not check every month/product combination for suppression, so very small country-product cells (e.g., a single exporter's shipment) could in principle be masked and slightly understate a small destination's total.

**What I could not verify:** whether the same "additive not redirective" conclusion holds for services trade or non-goods flows (out of scope for HS-code trade data); whether the physical-volume redirection I measured for sheepmeat/beef reflects genuinely displaced China-bound product versus separately-grown/processed new volume aimed at the EU/UK from the start (my method cannot distinguish "this exact shipment would otherwise have gone to China" from "this is new production capacity aimed at Europe"); and the precise mechanism behind the "Destination Unknown - EU" label, which I flagged but did not resolve.

## Open follow-up questions

- Does the "additive, not redirective" pattern hold for NZ's non-agricultural exports to the EU/UK (machinery, wine, seafood, industrial products)? This finding only checked the ten agri/wood lines shared with #502.
- What would a proper price/volume-separated trade index (rather than the dollar-vs-kilogram proxy used here) show for the true redirection share of sheepmeat and beef?
- Using 2019 (pre-COVID) rather than 2021 (COVID-distorted China peak) as the baseline year, does the redirection-vs-additive pattern change for any of the ten products?
- Why does Stats NZ label such a large share of kiwifruit exports "Destination Unknown - EU" specifically, and does an equivalent unresolved-destination label exist for other high-value perishables not checked in this pass?

## Sources

All URLs accessed 2026-07-07. Fetch method: the Stats NZ overseas-merchandise-trade landing page is JS-rendered (blocked to a plain fetch, returns navigation only); the underlying `www3.stats.govt.nz` zip files linked from it are static and were fetched directly with `curl` (browser user-agent, HTTP 200) — no browser automation was needed for the actual data files, only for confirming the download-page contents.

1. Stats NZ, *Overseas merchandise trade datasets* (landing page listing all HS10-by-country-by-port monthly export/import files) — https://www.stats.govt.nz/large-datasets/csv-files-for-download/overseas-merchandise-trade-datasets/
2. Stats NZ, monthly HS10-by-Country-by-Port export CSV files, January 2021 - May 2026, parsed locally (65 files): 2021 — https://www3.stats.govt.nz/HS10_by_country/2021_HS10_by_Country_by_Port.zip ; 2022 — https://www3.stats.govt.nz/HS10_by_country/2022_HS10_by_Country_by_Port.zip ; 2023 — https://www3.stats.govt.nz/HS10_by_country/2023_HS10_by_Country_by_Port.zip ; 2024 — https://www3.stats.govt.nz/HS10_by_country/2024_HS10_by_Country_by_Port.zip ; 2025 — https://www3.stats.govt.nz/HS10_by_country/2025_HS10_by_Country_by_Port.zip ; 2026 (Jan-May) — https://www3.stats.govt.nz/HS10_by_country/2026_HS10_by_Country_by_Port.zip
3. This project, sibling finding #499, *NZ's China export share rose to a 2021 goods peak, then fell back* — [research/findings/other/china-share-decade-movement.md](china-share-decade-movement.md) (cross-checked against, same root dataset, independent computation)
4. This project, sibling finding #502, *Logs and meat by-products are NZ's hardest China exposure to substitute* — [research/findings/other/china-export-substitutability-goods.md](china-export-substitutability-goods.md) (source of the per-kg price and quota figures used to explain the dollar-vs-volume gap)
5. Meat Industry Association of New Zealand, *New Zealand red meat exports reached record levels during 2025* (per-kg price figures, cited via #502) — https://mia.co.nz/new-zealand-red-meat-exports-reached-record-levels-during-2025/
6. MFAT, *NZ-EU FTA — Key Outcomes* (PDF; milk powder quota cap, cited via #502) — https://www.mfat.govt.nz/assets/Trade-agreements/EU-NZ-FTA/NZ-EU-FTA-Key-Outcomes-.pdf
