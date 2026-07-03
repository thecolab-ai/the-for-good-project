---
title: "NZ's solar/wind/battery build-out is real and accelerating, but it lowers average and daytime prices without displacing hydro's dry-year marginal pricing"
domain: "other"
issue: "#283"
confidence: "Medium"
author: "claude"
agent: "claude"
model: "opus"
date: "2026-07-04"
status: "draft"
---

# NZ's solar/wind/battery build-out is real and accelerating, but it lowers average and daytime prices without displacing hydro's dry-year marginal pricing

## Executive answer

- **The pipeline is large and the near-term build is real.** As at October 2025 the Electricity Authority (EA) counted **288 projects / 44.3 GW** in the generation-investment pipeline, of which **~1,380 MW is "committed"** and **1,415 MW is physically under construction** for completion within ~18–24 months — more than half of it (**787 MW**) grid-connected solar ([EA, Dec 2025](https://www.ea.govt.nz/news/eye-on-electricity/new-generation-projects-flowing-through-the-investment-pipeline/)). Transpower separately reports it is delivering **17 generation-and-battery connection projects totalling 3,242 MW** as at 1 June 2026 ([Transpower, 2026](https://www.transpower.co.nz/connections/whats-latest-grid-connections)).
- **It will meaningfully cut daytime and average wholesale prices — the merit-order effect.** Solar and wind have near-zero running cost, so when the sun shines or the wind blows they displace higher-cost hydro and thermal from the margin. New grid-connected solar coming to market in 2026/27 (~783 MW) roughly **quadruples** grid solar to ~1,031 MW ([EA, 2025](https://www.ea.govt.nz/news/eye-on-electricity/new-generation-projects-flowing-through-the-investment-pipeline/)).
- **But it does not, on the current pipeline, solve the dry-year problem — which is a *seasonal energy-storage* problem, not a capacity problem.** Solar produces almost nothing in the winter-evening peak (in May 2026 solar was **~0.5%** of national generation while hydro was **~59%** — EMI data below), and the only utility-scale battery in the country, Meridian's Ruakākā BESS, stores **2 hours** (100 MW / 200 MWh), not the *weeks* a dry spell lasts ([Energy-Storage.News, 2025](https://www.energy-storage.news/meridian-brings-online-new-zealands-first-grid-scale-battery-storage-system/)).
- **So hydro keeps setting the marginal (and dry-year spike) price.** In an average period a mid-water-value hydro plant is the marginal generator; when lakes run low, hydro offers rise and expensive gas/coal set the price ([EA, 2022](https://www.ea.govt.nz/news/eye-on-electricity/how-hydro-storage-impacts-spot-prices/)). Intermittent renewables shift *how often* and *when* hydro is on the margin; they don't remove hydro from the margin during a sustained dry, calm, cold period. The seasonal-storage gap that Lake Onslow was meant to fill remains **unfilled** after that project's 2023 cancellation ([MBIE](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/low-emissions-economy/nz-battery); [RNZ, 2023](https://www.rnz.co.nz/news/national/503816/govt-confirms-it-is-dumping-hugely-wasteful-lake-onslow-battery-project)).
- **Bottom line: partially self-solving, not self-solving.** The build-out will erode average prices and reduce thermal use over 2026–2030, but the *structural dry-year exposure* — the thing that drove Meridian's 2026 reserve-water request through winter 2028 — is not closed by the intermittent-plus-short-battery pipeline now under construction.

**Overall confidence:** Medium — the pipeline figures and the price mechanism are High-confidence (official EA/Transpower/MBIE sources); the *pace of displacement* ("how quickly") is Medium because it depends on hydrology, demand growth, and firming decisions not yet made.

## Evidence

### Where the system starts: hydro-dominated, tiny solar base

Monthly EMI generation data (via the `nz-electricity` skill, `Generation_MD` dataset) for the latest available month, **May 2026**, shows the starting point the pipeline has to shift:

| Fuel | GWh (May 2026) | Share |
|---|---|---|
| Hydro | 2,104 | 58.9% |
| Geothermal | 869 | 24.3% |
| Gas | 272 | 7.6% |
| Wind | 280 | 7.8% |
| Coal | 22 | 0.6% |
| Solar | 17 | 0.5% |

Source: EMI `202605_Generation_MD` via `nz-electricity` skill (Geothermal, Wind and Solar totals combine the dataset's duplicate fuel codes; underlying file: [emidatasets…202605_Generation_MD.csv](https://emidatasets.blob.core.windows.net/publicdata/Datasets/Wholesale/Generation/Generation_MD/202605_Generation_MD.csv)). May is mid-autumn/winter, so solar's share is at a seasonal low — the point is that solar/wind are still a small slice against ~59% hydro, and the winter months when the dry-year problem bites are exactly when solar contributes least.

### How much is actually being built (not just proposed)

The distinction between the *pipeline* (aspirational) and *committed / under construction* (real) is the crux of the "how quickly" question:

- **Pipeline (mostly not yet committed):** ~288 projects, **44.3 GW**, as at October 2025; **82% of pipeline capacity is intermittent renewables** and **66% is in the North Island** ([EA, Aug/Oct 2025](https://www.ea.govt.nz/news/eye-on-electricity/generation-investment-pipeline-updates-and-current-insights/)). A pipeline nearly 4× the existing ~10.6 GW fleet is not a forecast of what will be built — most projects never reach financial commitment.
- **Committed:** **1,380 MW**, up from ~1,000 MW in June 2025 ([EA, Dec 2025](https://www.ea.govt.nz/news/eye-on-electricity/new-generation-projects-flowing-through-the-investment-pipeline/)).
- **Under construction:** **1,415 MW** for completion in ~18–24 months, **787 MW of it solar**, with two battery projects on the shortest timelines ([EA, Dec 2025](https://www.ea.govt.nz/news/eye-on-electricity/new-generation-projects-flowing-through-the-investment-pipeline/)).
- **Transpower's grid-connection view:** **17 generation-and-battery projects, 3,242 MW**, in active delivery as at 1 June 2026 ([Transpower, 2026](https://www.transpower.co.nz/connections/whats-latest-grid-connections)).
- **Lead times are long:** projects in the queue historically waited ~**3.5 years** to reach construction and ~**4.5 years** to completion ([EA, Dec 2025](https://www.ea.govt.nz/news/eye-on-electricity/new-generation-projects-flowing-through-the-investment-pipeline/)). This is why the pipeline size overstates near-term relief.

Named projects arriving now give the abstract numbers texture: Contact Energy / Lightsource's **Kōwhai Park solar farm (168 MWp)**, expected operational 2026; **Foxton Solar Farm (40 MW)**; **Lauriston (47 MW**, the South Island's largest); and Meridian's **Ruakākā Energy Park** (130 MW solar alongside its battery) ([EA solar update, Mar 2025](https://www.ea.govt.nz/news/eye-on-electricity/new-highs-being-hit-in-solar-generation/); [Meridian](https://www.meridianenergy.co.nz/new-projects/ruakaka-energy-park)). Grid solar set a then-record instantaneous peak of **128 MW at 2 pm on 6 March 2025** ([EA, Mar 2025](https://www.ea.govt.nz/news/eye-on-electricity/new-highs-being-hit-in-solar-generation/)).

### Fast-track: adds wind and firming, but on a 2027–2031 horizon

The Fast-track Approvals Act 2024 process is pulling forward large wind + solar + battery projects, but *approval* is not *energisation* — most are years from generating:

- **26 projects approved** to date, of which **6 are renewable energy**; the sixth, **Māhinerangi Wind Farm Stage 2 (Puke Kapo Hau)**, is up to **190 MW plus a 60 MW battery**, ~550 GWh/yr ([LiveNews, 3 Jul 2026](https://livenews.co.nz/2026/07/03/sixth-renewable-energy-project-fast-tracked/); [Beehive](https://www.beehive.govt.nz/release/fast-track-approved-project-could-deliver-new-zealand%E2%80%99s-largest-wind-farm)).
- **Southland Wind Farm** — up to **380 MW**, ~150,000 households, Contact Energy lodged its substantive application August 2025 ([fasttrack.govt.nz](https://www.fasttrack.govt.nz/projects/southland-wind-farm); [Wayback snapshot, Apr 2026](https://web.archive.org/web/20260402002158/https://www.fasttrack.govt.nz/projects/southland-wind-farm) — the live page bot-blocks plain fetchers).
- **Meridian's Waiinu Energy Park** — a **622 MW** wind/solar/battery project near Whanganui, *referred* for fast-track, with the full consent application signalled for late 2026 ([IndexBox summary of the referral](https://www.indexbox.io/blog/meridian-energys-waiinu-energy-park-referred-under-new-zealands-fast-track-approvals-act/)).

Fast-track matters most because it can accelerate the **wind and battery firming** that solar-heavy build-out needs — but on the EA's own lead-time evidence these deliver into the **late-2020s / early-2030s**, not into the winter-2026–2028 window that the current dry-year concern covers.

### Why the build-out lowers prices but doesn't remove hydro from the margin

The pricing mechanism is the load-bearing part of the answer. NZ's wholesale price is set by the marginal (last-dispatched) offer. The EA describes the hydro side plainly: "When reservoir levels are high, hydro storage increases and pushes the spot price of electricity down… When reservoir levels are low, spot prices tend to be higher to help conserve water," and in dry conditions "higher-cost alternatives (gas and coal)… are expensive to run" and set the price ([EA, 2022](https://www.ea.govt.nz/news/eye-on-electricity/how-hydro-storage-impacts-spot-prices/)). Hydro operators embed the **opportunity cost of stored water** ("water value") in their offers — generate now, or save the water for a scarcer, higher-priced moment ([EA, "How marginal electricity spot pricing reflects cost"](https://www.ea.govt.nz/news/eye-on-electricity/how-marginal-electricity-spot-pricing-reflects-cost/)).

Against that mechanism, new intermittent renewables do two distinct things:

1. **They lower prices *when they are generating*** (sunny middays, windy periods) by pushing zero-cost energy into the merit order — displacing hydro and thermal from the margin at those times. This is genuine and growing: solar first out-generated thermal for a full week in December 2024 ([EA, Mar 2025](https://www.ea.govt.nz/news/eye-on-electricity/new-highs-being-hit-in-solar-generation/)).
2. **They do *not* help at the binding moments** — the winter evening peak (no sun), a calm week (no wind), or a multi-week dry spell (lakes low). At those moments hydro's water value, backed by gas/coal, still sets the price. Short-duration batteries flatten *intraday* peaks (buy midday-cheap solar, sell evening-expensive) but cannot store energy across the *weeks-to-a-season* that a dry year spans.

The scale gap is stark: the dry-year problem, which the EA/MBIE frame as recurring **roughly every seven years**, was estimated to need on the order of **several terawatt-hours** of stored energy — the job Lake Onslow's pumped hydro was scoped to do before it was cancelled in 2023 ([MBIE, NZ Battery Project](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/low-emissions-economy/nz-battery); [RNZ, 2023](https://www.rnz.co.nz/news/national/503816/govt-confirms-it-is-dumping-hugely-wasteful-lake-onslow-battery-project)). Ruakākā, the country's first grid-scale battery and a genuine milestone, stores **0.0002 TWh** (200 MWh) for two hours ([Energy-Storage.News, 2025](https://www.energy-storage.news/meridian-brings-online-new-zealands-first-grid-scale-battery-storage-system/)). No quantity of 2-to-4-hour batteries in the current pipeline closes a several-TWh seasonal gap; they solve a different (daily) problem.

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| ~1,415 MW is physically under construction (≈787 MW solar), completing in ~18–24 months | [EA, Dec 2025](https://www.ea.govt.nz/news/eye-on-electricity/new-generation-projects-flowing-through-the-investment-pipeline/) | [Transpower delivering 17 projects / 3,242 MW, Jun 2026](https://www.transpower.co.nz/connections/whats-latest-grid-connections) | High |
| The pipeline is ~82% intermittent (solar/wind) — i.e. energy-limited, not firm | [EA, Aug/Oct 2025](https://www.ea.govt.nz/news/eye-on-electricity/generation-investment-pipeline-updates-and-current-insights/) | *Corroborated indirectly by the EMI generation mix + named projects being solar/wind-dominated* — single primary source for the 82% figure | Medium-High |
| NZ's only utility-scale battery stores 2 hours (100 MW / 200 MWh) — far short of seasonal storage | [Energy-Storage.News, 2025](https://www.energy-storage.news/meridian-brings-online-new-zealands-first-grid-scale-battery-storage-system/) | [Meridian Ruakākā Energy Park](https://www.meridianenergy.co.nz/new-projects/ruakaka-energy-park) | High |
| The dry-year gap is a *seasonal energy* problem (~several TWh) that intermittent + short batteries don't fill; Lake Onslow (the proposed fix) was cancelled | [MBIE, NZ Battery](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/low-emissions-economy/nz-battery) | [RNZ, 2023](https://www.rnz.co.nz/news/national/503816/govt-confirms-it-is-dumping-hugely-wasteful-lake-onslow-battery-project) | High |
| Hydro water value sets the marginal price; low storage → gas/coal set price | [EA, 2022](https://www.ea.govt.nz/news/eye-on-electricity/how-hydro-storage-impacts-spot-prices/) | [EA, marginal pricing](https://www.ea.govt.nz/news/eye-on-electricity/how-marginal-electricity-spot-pricing-reflects-cost/) | High |

## What would change this conclusion

- **A large, firm, long-duration storage commitment.** If Lake Onslow (now floated again under fast-track) or an equivalent multi-TWh pumped-hydro / long-duration scheme were committed and dated, the "structural exposure remains" conclusion would weaken materially. As of this writing it is a proposal, not a commitment.
- **Much faster wind (not just solar) delivery.** Wind is anti-correlated with hydro (windier in some dry synoptic patterns) and generates day and night. If the fast-tracked wind (Southland 380 MW, Māhinerangi, Waiinu) energises faster than the EA's ~4.5-year norm, hydro's marginal role in dry periods shrinks sooner. I could not verify firm commissioning dates for these — they are consented/referred, not energised.
- **Demand growth outrunning supply.** The EA notes ~1,780 MW of *load* projects (data centres, electrification) also in the pipeline ([EA, 2025](https://www.ea.govt.nz/news/eye-on-electricity/generation-investment-pipeline-updates-and-current-insights/)). If demand grows as fast as supply, average prices may not fall as the merit-order effect alone would suggest. I did not model the net balance.
- **What I could not verify / out of scope:** the *magnitude* of dry-year spot spikes (that is sibling issue [#279](https://github.com/thecolab-ai/the-for-good-project/issues/279)); rooftop/distributed solar uptake figures (I found grid-connected solar data but did not obtain a reliable current residential-install count — flag for a human or a dedicated pull); and precise per-project commissioning dates. The NZ Herald "renewable boom" map corroborated the qualitative build-out but is paywalled, so I relied on EA/Transpower primaries instead.
- **A number I deliberately did not assert:** the widely-repeated "dry-year prices jump 3–5×" figure surfaced in secondary summaries but I could not confirm it in a primary EA source, so it is excluded here; treat any such multiple as unverified pending #279.

## Open follow-up questions

- Distributed/rooftop solar and behind-the-meter batteries: what is current residential uptake and how fast is it growing, and does mass rooftop solar meaningfully change the *winter-evening* peak (probably little without storage)? (Good candidate for a new research issue.)
- Wind's specific correlation with dry-year hydrology in NZ: does the fast-tracked wind fleet actually generate during the synoptic patterns that cause dry years? This determines how much wind can substitute for seasonal hydro storage.
- Demand-side flexibility and managed EV/hot-water load as a cheaper partial substitute for firming — how much dry-year exposure can demand response remove without new generation?

## Sources

1. Electricity Authority — "New generation projects flowing through the investment pipeline" (Dec 2025): https://www.ea.govt.nz/news/eye-on-electricity/new-generation-projects-flowing-through-the-investment-pipeline/ (accessed 4 Jul 2026)
2. Electricity Authority — "Generation investment pipeline: updates and current insights" (Aug/Oct 2025 data): https://www.ea.govt.nz/news/eye-on-electricity/generation-investment-pipeline-updates-and-current-insights/ (accessed 4 Jul 2026)
3. Transpower — "What's the latest with grid connections?" (data as at 1 Jun 2026): https://www.transpower.co.nz/connections/whats-latest-grid-connections (accessed 4 Jul 2026)
4. Electricity Authority — "New highs being hit in solar generation" (12 Mar 2025): https://www.ea.govt.nz/news/eye-on-electricity/new-highs-being-hit-in-solar-generation/ (accessed 4 Jul 2026)
5. Electricity Authority — "How hydro storage impacts spot prices" (13 Sep 2022): https://www.ea.govt.nz/news/eye-on-electricity/how-hydro-storage-impacts-spot-prices/ (accessed 4 Jul 2026)
6. Electricity Authority — "How marginal electricity spot pricing reflects cost": https://www.ea.govt.nz/news/eye-on-electricity/how-marginal-electricity-spot-pricing-reflects-cost/ (accessed 4 Jul 2026)
7. Energy-Storage.News — "Meridian brings online New Zealand's first grid-scale battery storage system" (100 MW / 200 MWh, completed May 2025): https://www.energy-storage.news/meridian-brings-online-new-zealands-first-grid-scale-battery-storage-system/ (accessed 4 Jul 2026)
8. Meridian Energy — Ruakākā Energy Park: https://www.meridianenergy.co.nz/new-projects/ruakaka-energy-park (accessed 4 Jul 2026)
9. MBIE — NZ Battery Project (Lake Onslow): https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/low-emissions-economy/nz-battery (accessed 4 Jul 2026)
10. RNZ — "Govt confirms it is dumping 'hugely wasteful' Lake Onslow battery project" (2023): https://www.rnz.co.nz/news/national/503816/govt-confirms-it-is-dumping-hugely-wasteful-lake-onslow-battery-project (accessed 4 Jul 2026)
11. Beehive — "Fast-track approved project could deliver New Zealand's largest wind farm": https://www.beehive.govt.nz/release/fast-track-approved-project-could-deliver-new-zealand%E2%80%99s-largest-wind-farm (accessed 4 Jul 2026)
12. Fast-track Approvals — Southland Wind Farm: https://www.fasttrack.govt.nz/projects/southland-wind-farm (live page bot-blocks fetchers; Wayback snapshot: https://web.archive.org/web/20260402002158/https://www.fasttrack.govt.nz/projects/southland-wind-farm) (accessed 4 Jul 2026)
13. LiveNews — "Sixth renewable energy project fast-tracked" (Māhinerangi Stage 2, 3 Jul 2026): https://livenews.co.nz/2026/07/03/sixth-renewable-energy-project-fast-tracked/ (accessed 4 Jul 2026)
14. IndexBox — summary of Meridian Waiinu Energy Park (622 MW) fast-track referral: https://www.indexbox.io/blog/meridian-energys-waiinu-energy-park-referred-under-new-zealands-fast-track-approvals-act/ (accessed 4 Jul 2026)
15. EMI (Electricity Authority) — Generation_MD monthly dataset, May 2026, via the `nz-electricity` skill: https://emidatasets.blob.core.windows.net/publicdata/Datasets/Wholesale/Generation/Generation_MD/202605_Generation_MD.csv (accessed 4 Jul 2026)
