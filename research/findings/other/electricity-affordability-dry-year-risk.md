---
title: "Electricity affordability and dry-year risk — baseline on NZ power price drivers"
domain: "other"
issue: "#256"
confidence: "Medium"
author: "gligor-ai"
agent: "hermes"
model: "hf:Qwen/Qwen3.6-27B"
date: "2026-07-03"
status: "draft"
---

# Electricity affordability and dry-year risk — baseline on NZ power price drivers

## Executive answer

- **NZ generates ~60% of its electricity from hydro**, but only 23% of that hydro capacity can be stored in lakes, and Meridian's own lake storage equates to just 15 weeks of average generation [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon) [wayback](https://web.archive.org/web/20260702223340/https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). Dry years directly constrain the cheapest form of generation, pushing prices up.
- **The wholesale spot market sets a single half-hourly price for the whole grid**, calculated by Transpower from ranked generator offers [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/spot-market/). When hydro is scarce, thermal (gas/coal) generators set the marginal price — and all generators get that price, not just the marginal one. This is the structural engine of dry-year price spikes.
- **Generation costs' share of the average household power bill has increased over the last decade**, driven by higher wholesale prices, increased peak demand, dry weather conditions, gas supply uncertainty, delays in generation investment (including from COVID-19), and uncertainty surrounding Tiwai Point's future [Electricity Authority](https://www.ea.govt.nz/your-power/bill/).
- **Four gentailers (Contact, Genesis, Meridian, Mercury) dominate** the ~80 generators and 62 retailers in the wholesale market [Electricity Authority](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/). Energy Minister Simeon Brown said gentailers' use of a "blanket price" has been unfair on customers [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon).
- **Meridian was granted 3 years of contingent storage access at Lake Pūkaki** via the Fast-track Development Agency panel, allowing it to draw water from below normal levels if security of supply is at risk, providing a buffer through to winter 2028 [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). Meridian committed to using no more than half of the 5 metres of reserve in 2026 unless risk is heightened [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon).

**Overall confidence:** Medium — the hydro share, market structure, and Meridian story are well-sourced from official (EA) and public broadcaster (RNZ) sources. Specific figures on residential price trends in real terms, hardship by decile, and spot price magnitudes during dry years are not yet quantified here — those are the research gaps the child issues will fill.

## Evidence

### Hydro dependence and the dry-year problem

New Zealand generates approximately **60% of its electricity from hydro** [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). The fundamental constraint is storage: **only 23% of that hydro capacity can be stored in lakes** [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). The rest runs through run-of-river schemes that depend on immediate inflows.

Meridian Energy — the largest hydro generator — said its own lake storage equates to **only 15 weeks of average generation** [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). This means even under normal conditions, hydro reserves are finite and seasonally managed; a dry year can exhaust them within months.

The South Island's large hydro stations (including Meridian's) generate the bulk of stored hydro power. That electricity is then transported north via the HVDC inter-island cable under Cook Strait to where the higher demand is [Electricity Authority](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/). The system's geography — big generation in the South Island, big consumption in the North — means the North Island is particularly exposed when South Island hydro storage runs low.

### How a dry year feeds wholesale prices

The NZ wholesale electricity market uses a **uniform marginal pricing mechanism** (the "spot market"): Transpower ranks all generator offers by price and selects the cheapest combination to meet demand [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/spot-market/). The price of the highest-cost generator that is needed to satisfy demand sets the **single spot price** for all generators in that half-hour trading period [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/spot-market/).

This has two consequences:
1. **In normal (wet) conditions**, cheap hydro sets the price, and all generators receive the low hydro-marginal price — even thermal generators who could have sold at a higher price. This is sometimes called the "hydro subsidy."
2. **In dry conditions**, hydro generation is constrained, and more expensive gas or coal generators must run to meet demand. These thermal generators set the marginal price, and the spot price rises. All generators — including hydro, which is now scarce — receive the higher thermal price. This is the **dry-year price spike mechanism**.

Prices are calculated every 30 minutes (real-time pricing since 1 November 2022) and vary by location across 52 grid injection points and 196 grid exit points [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/spot-market/). Prices are generally higher at locations further from main power stations [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/spot-market/).

Retailers use **financial hedges** to smooth spot price volatility for consumers, fixing prices for a specified period [Electricity Authority](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/). However, the EA notes that increased peak demand, relatively dry weather, gas supply uncertainty, and generation investment delays have all contributed to price rises over the last decade [Electricity Authority](https://www.ea.govt.nz/your-power/bill/).

### What's in a power bill

The Electricity Authority breaks down the average monthly household power bill into seven cost categories [Electricity Authority](https://www.ea.govt.nz/your-power/bill/):

1. **Generation** — cost of producing electricity. The EA states this proportion has **increased over the last decade**, reflecting higher wholesale prices. Contributors include increased peak demand, dry weather, gas supply uncertainty, delays in generation investment (including COVID-19), and uncertainty around Tiwai Point's future [Electricity Authority](https://www.ea.govt.nz/your-power/bill/).
2. **Distribution** — cost of building and maintaining local power lines. Pass-through from lines companies [Electricity Authority](https://www.ea.govt.nz/your-power/bill/).
3. **Transmission** — cost of the national grid (owned by Transpower). Grid and distributor revenues were **recently reset at a time with higher interest rates**, and these costs are now being passed through to consumers [Electricity Authority](https://www.ea.govt.nz/your-power/bill/).
4. **Retail** — power company operating costs. The EA notes this proportion has **reduced slightly** over the last decade, though the exact cause is unknown [Electricity Authority](https://www.ea.govt.nz/your-power/bill/).
5. **GST** — tax [Electricity Authority](https://www.ea.govt.nz/your-power/bill/).
6. **Metering** — reading and maintaining electricity meters. Has **increased slightly**, possibly due to smart meter uptake [Electricity Authority](https://www.ea.govt.nz/your-power/bill/).
7. **Government levies** — operating and regulating the wholesale market [Electricity Authority](https://www.ea.govt.nz/your-power/bill/).

There are **no requirements for bills to be presented in the same way**, so not all power bills look identical [Electricity Authority](https://www.ea.govt.nz/your-power/bill/).

### Market structure — the gentailer model

The NZ wholesale market has approximately **80 generation companies, 62 retailers, and four gentailers** (Contact Energy, Genesis Energy, Meridian Energy, and Mercury Energy) [Electricity Authority](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/). Gentailers both generate and retail electricity, creating a potential conflict: the same companies that set wholesale prices through their generation also sell to consumers at retail prices.

Energy Minister Simeon Brown recently said gentailers' use of a **blanket price** has been **unfair on customers** [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). The EA is running an **Energy Competition Task Force** to investigate competition in the market [Electricity Authority](https://www.ea.govt.nz/projects/all/energy-competition-task-force/).

There are **29 lines companies** (distribution companies) that own the local networks, mostly owned by consumer trusts or local councils [Electricity Authority](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/). These are regulated by the Commerce Commission.

### The Meridian / Lake Pūkaki decision — what it means for households

On 3 July 2026, Meridian announced it received final approval from the government's **Fast-track Development Agency** panel to access **contingent storage at Lake Pūkaki for three years** [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). This allows Meridian to draw water from below the level it would normally be permitted to access.

Key commitments [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon):
- The reserve would be used **only** if there is heightened risk to security of supply.
- Given current lake levels, Meridian **does not expect to use more than half of the 5 metres available in 2026**.
- Meridian's CE Mike Roan said this provides a buffer for dry years and that price hikes should ease **through to winter 2028**.
- The decision also granted permission for permanent rock armouring at Pūkaki Dam against wave erosion.

The decision has attracted criticism from environmental and tourism groups concerned about the impact on Lake Pūkaki [RNZ](https://www.rnz.co.nz/news/business/657581/fast-track-bid-sparks-fears-for-lake-pukaki-and-mackenzies-tourism-industry); [BusinessDesk](https://businessdesk.co.nz/article/industry/commissioner-warns-pukaki-hydro-plan-could-raise-long-term-electricity-risk). A commissioner warned the Pūkaki hydro plan could raise long-term electricity risk [BusinessDesk](https://businessdesk.co.nz/article/industry/commissioner-warns-pukaki-hydro-plan-could-raise-long-term-electricity-risk).

### What's changing — new generation

The EA notes the electricity system is **transforming to electrify NZ and reach net zero carbon by 2050**, with a shift to more renewable intermittent generation (wind and solar), distributed energy resources (rooftop solar, batteries), and two-way power flows [Electricity Authority](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/). The EA is working on **improving visibility of generation investment** [Electricity Authority](https://www.ea.govt.nz/projects/all/improving-visibility-of-generation-investment/) and **future security and resilience** [Electricity Authority](https://www.ea.govt.nz/projects/all/future-security-and-resilience/).

Google News reported that **Bluecurrent** (a rooftop solar company) said **hundreds of thousands of households have an underused resource** — likely rooftop solar potential [Google News, 3 Jul 2026](https://news.google.com/rss/search?q=meridian+energy+reserve+water+pukaki+price+hikes&hl=en-NZ&gl=NZ&ceid=NZ:en).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Hydro provides ~60% of NZ electricity; only 23% of hydro capacity is lake-stored | [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon) (citing Meridian CE) | *Single source: the 60%/23% figures come from Meridian's own statements via RNZ. Meridian has incentives to frame storage constraints to justify the Pūkaki application.* | Medium |
| Generation costs' share of the bill has increased over the last decade | [EA, Your power bill](https://www.ea.govt.nz/your-power/bill/) | *Could be cross-checked against EA historical bill breakdown data or CPI series, but the EA page is the primary published source.* | Medium |
| Four gentailers dominate the wholesale market | [EA, NZ electricity sector](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/) | *Consistent with Commerce Commission market studies, but the specific "80 generators, 62 retailers" count is from EA only.* | Medium |
| Uniform marginal pricing means all generators receive the highest dispatched price | [EA, Spot market](https://www.ea.govt.nz/industry/wholesale/spot-market/) | *This is a well-documented feature of the NZ electricity market design; also documented in academic literature on marginal pricing.* | High |
| Meridian's Lake Pūkaki reserve access approved for 3 years | [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon) [wayback](https://web.archive.org/web/20260702223340/https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon) | [Google News aggregation](https://news.google.com/rss/search?q=meridian+energy+reserve+water+pukaki+price+hikes&hl=en-NZ&gl=NZ&ceid=NZ:en) (multiple outlets reporting same story) | High |

## What would change this conclusion

- **Actual CPI electricity series data** from Stats NZ showing whether residential prices have risen in real terms (inflation-adjusted), and by how much, would confirm or weaken the claim that households have "worn sharp power-price rises." I could not access the Stats NZ CPI calculator or selected price indexes data directly.
- **Spot price data from EA datasets** showing actual dry-year vs. wet-year average prices would quantify the dry-year price spike mechanism. The EA publishes final pricing GDX files and CSVs, but I did not parse them.
- **Hardship/disconnection data** — how many households face disconnection, and whether lower deciles spend a disproportionate share of income on power, would ground the "cost of living" framing in evidence rather than assertion.
- **Independent verification of the 60% hydro / 23% storage figures** — these come from Meridian via RNZ. Stats NZ or the EA may publish independent generation mix statistics that would confirm or adjust these.
- **A human with lived experience** of energy hardship or a sector expert on the gentailer pricing model could validate whether the "blanket price is unfair" framing matches the reality of how different retail plans actually work in practice.

## Open follow-up questions (child issues for the stream)

1. **Residential price trends in real terms** — [#277](https://github.com/thecolab-ai/the-for-good-project/issues/277)
2. **Dry-year spot price spikes quantified** — [#279](https://github.com/thecolab-ai/the-for-good-project/issues/279)
3. **Gentailer market concentration and margins** — [#281](https://github.com/thecolab-ai/the-for-good-project/issues/281)
4. **Energy hardship by decile** — [#282](https://github.com/thecolab-ai/the-for-good-project/issues/282)
5. **New generation pipeline** — [#283](https://github.com/thecolab-ai/the-for-good-project/issues/283)

## Sources

1. RNZ, "Meridian gets go-ahead to access reserve water, promises price hikes will end soon", 3 Jul 2026. [Live](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon) | [Wayback](https://web.archive.org/web/20260702223340/https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). Text extracted via Wayback Machine (RNZ is a SPA that requires JavaScript; article text was not available in the HTML source).

2. Electricity Authority, "New Zealand's electricity sector". [ea.govt.nz/your-power/new-zealands-electricity-sector](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/). Fetched via Wayback Machine (live site returned 403 to curl; Wayback snapshot from 2026-02-17 used).

3. Electricity Authority, "Your power bill" — bill breakdown. [ea.govt.nz/your-power/bill](https://www.ea.govt.nz/your-power/bill/). Fetched via Wayback Machine (same access pattern as above).

4. Electricity Authority, "Wholesale spot market". [ea.govt.nz/industry/wholesale/spot-market](https://www.ea.govt.nz/industry/wholesale/spot-market/). Fetched via Wayback Machine (same access pattern).

5. Electricity Authority, "Review of structure, conduct and performance — Wholesale electricity market" (PDF). [ea.govt.nz/documents/6673](https://www.ea.govt.nz/documents/6673/Information_paper_-_Review_of_structure_conduct_and_performance_-_Wholesale_el_vHrNwSE.pdf). PDF downloaded but not parsed (binary format).

6. Electricity Authority, "Review of structure, conduct and performance — Summary paper" (PDF). [ea.govt.nz/documents/6674](https://www.ea.govt.nz/documents/6674/Summary_paper_-_Review_of_structure_conduct_and_performance_in_the_wholesale_e_jLClK9L.pdf). Not accessed.

7. Google News RSS, search for "meridian energy reserve water pukaki price hikes", 3 Jul 2026. [news.google.com/rss](https://news.google.com/rss/search?q=meridian+energy+reserve+water+pukaki+price+hikes&hl=en-NZ&gl=NZ&ceid=NZ:en). Confirmed multiple outlets reported the same story.

8. RNZ, "Fast-track bid sparks fears for Lake Pukaki and Mackenzie's tourism industry". [rnz.co.nz/news/business/657581](https://www.rnz.co.nz/news/business/657581/fast-track-bid-sparks-fears-for-lake-pukaki-and-mackenzies-tourism-industry). Referenced but article text not extracted (Wayback not yet archived).

9. BusinessDesk, "Commissioner warns Pūkaki hydro plan could raise long-term electricity risk". [businessdesk.co.nz](https://businessdesk.co.nz/article/industry/commissioner-warns-pukaki-hydro-plan-could-raise-long-term-electricity-risk). Referenced via Google News; article behind paywall, text not extracted.
