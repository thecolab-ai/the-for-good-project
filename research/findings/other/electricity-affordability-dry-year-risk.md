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

- **NZ generates ~60% of its electricity from hydro**, but only 23% of that hydro capacity can be stored in lakes, and Meridian's own lake storage equates to just 15 weeks of average generation [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon) [wayback](https://web.archive.org/web/20260702223340/https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). The EA confirms that "most electricity is provided by hydro generation" [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/security-of-supply/). Dry years directly constrain the cheapest form of generation, pushing prices up.
- **The wholesale spot market uses nodal pricing**, with prices varying by location and time. The clearing manager calculates about 12,000 final prices per day — one for each half-hour trading period at each of the 52 grid injection points and 196 grid exit points [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/spot-market/). When hydro is scarce, more expensive thermal (gas/coal) generation must be dispatched to meet demand, raising prices system-wide [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/security-of-supply/). This is a key structural driver of dry-year price increases.
- **Generation costs' share of the average household power bill has increased over the last decade**, driven by higher wholesale prices, increased peak demand, dry weather conditions, gas supply uncertainty, delays in generation investment (including from COVID-19), and uncertainty surrounding Tiwai Point's future [Electricity Authority](https://www.ea.govt.nz/your-power/bill/).
- **Four gentailers (Contact, Genesis, Meridian, Mercury) dominate** the ~80 generators and 62 retailers in the wholesale market [Electricity Authority](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/). Energy Minister Simeon Brown said gentailers' use of a "blanket price" has been unfair on customers [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon).
- **Meridian was granted 3 years of contingent storage access at Lake Pūkaki** via the Fast-track Development Agency panel, allowing it to draw water from below normal levels if security of supply is at risk, providing a buffer through to winter 2028 [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). Meridian committed to using no more than half of the 5 metres of reserve in 2026 unless risk is heightened [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon).

**Overall confidence:** Medium — the hydro share, market structure, and Meridian story are sourced from official (EA) and public broadcaster (RNZ) sources, but the 60%/23% hydro figures are single-sourced from Meridian via RNZ. Specific figures on residential price trends in real terms, hardship by decile, and spot price magnitudes during dry years are not yet quantified here — those are the research gaps the child issues will fill.

## Evidence

### Hydro dependence and the dry-year problem

New Zealand generates approximately **60% of its electricity from hydro** [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). The fundamental constraint is storage: **only 23% of that hydro capacity can be stored in lakes** [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). The rest runs through run-of-river schemes that depend on immediate inflows.

Meridian Energy — the largest hydro generator — said its own lake storage equates to **only 15 weeks of average generation** [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). This means even under normal conditions, hydro reserves are finite and seasonally managed; a dry year can exhaust them within months.

The EA confirms that **most electricity in NZ is provided by hydro generation**, and that risks to supply occur when hydro lake levels fall to critical levels [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/security-of-supply/). The natural cycle means lake inflows tend not to align with electricity demand: in winter, there tends to be more snow than rain, reducing inflows when demand is highest [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/security-of-supply/). Any change to the natural cycle, such as low snowfall or extreme La Niña conditions, affects storage for the following winter [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/security-of-supply/).

The South Island's large hydro stations (including Meridian's) generate the bulk of stored hydro power. That electricity is then transported north via the HVDC inter-island cable under Cook Strait to where the higher demand is [Electricity Authority](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/). The system's geography — big generation in the South Island, big consumption in the North — means that disruptions to South Island hydro can increase reliance on North Island thermal generation during dry periods. **This inference is based on the structural geography; specific data on North Island price exposure during dry years would strengthen this claim** (addressed in child issue #279).

### How a dry year feeds wholesale prices

The NZ wholesale spot market operates as a **nodal market**: generators bid at 52 grid injection points and buyers bid at 196 grid exit points, with prices varying by both time and location [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/spot-market/). Transpower ranks offers by price and selects the lowest-cost combination of resources to satisfy demand, also considering transmission losses and capacity constraints [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/spot-market/). The clearing manager calculates about 12,000 final prices each day — one price for each half-hour trading period at each node [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/spot-market/).

**Most NZ electricity comes from hydro generation**, and the system's ability to meet demand depends on stored water in South Island lakes [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/security-of-supply/). When inflows are low for a sustained period, or hydro storage needs to be conserved in anticipation of winter, other forms of generation (like coal and gas, which are easily storable) are increased to meet electricity demand [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/security-of-supply/).

When thermal generation is dispatched in greater volumes, the increased competition for dispatch raises offer prices across the system. This lifts spot prices at nodes across the grid, including at hydro generation sites. The effect is amplified in dry years, when the system operator may enter watch, alert, or emergency zones based on energy risk curves [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/security-of-supply/). On very rare occasions, available generation may not be enough to meet expected demand (a scarcity situation), and scarcity prices are applied to signal the need for more generation investment [Electricity Authority](https://www.ea.govt.nz/industry/wholesale/spot-market/).

The EA separately notes that increased peak demand, relatively dry weather, gas supply uncertainty, and delays in generation investment have all contributed to wholesale price rises over the last decade [Electricity Authority](https://www.ea.govt.nz/your-power/bill/).

Retailers use **financial hedges** to smooth spot price volatility for consumers, fixing prices for a specified period [Electricity Authority](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/). Hedges protect buyers against volatile spot prices, and some generators can also sell their output via hedge contracts [Electricity Authority](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/). However, spot pricing contracts remain uncommon for households [Electricity Authority](https://www.ea.govt.nz/your-power/bill/).

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

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Hydro provides ~60% of NZ electricity; only 23% of hydro capacity is lake-stored | [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon) (citing Meridian CE) | *Single source: figures come from Meridian's own statements. EA security-of-supply page confirms "most electricity is provided by hydro generation" but does not give a percentage.* | Medium |
| Generation costs' share of the bill has increased over the last decade | [EA, Your power bill](https://www.ea.govt.nz/your-power/bill/) | *Single source. The EA page states this directly, but historical bill breakdown data for cross-checking was not fetched.* | Medium |
| Four gentailers dominate the wholesale market (~80 generators, 62 retailers, 4 gentailers) | [EA, NZ electricity sector](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/) | *Single source for the exact counts. Consistent with Commerce Commission market studies but those were not fetched.* | Medium |
| Nodal pricing — ~12,000 prices per day, one per node per half-hour period | [EA, Spot market](https://www.ea.govt.nz/industry/wholesale/spot-market/) | [EA, NZ electricity sector](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/) (confirms spot prices "vary depending on supply and demand and the location on the national grid") | High |
| Dry years raise thermal dispatch and lift system-wide prices | [EA, Security of supply](https://www.ea.govt.nz/industry/wholesale/security-of-supply/) (confirms thermal generation increases when inflows are low) | [EA, Your power bill](https://www.ea.govt.nz/your-power/bill/) (lists dry weather conditions as contributor to price rises) | Medium |
| Meridian's Lake Pūkaki reserve access approved for 3 years | [RNZ, 3 Jul 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon) [wayback](https://web.archive.org/web/20260702223340/https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon) | [BusinessDesk](https://businessdesk.co.nz/article/industry/commissioner-warns-pukaki-hydro-plan-could-raise-long-term-electricity-risk) (reports on the same application and its implications) | Medium |

## What would change this conclusion

- **Actual CPI electricity series data** from Stats NZ showing whether residential prices have risen in real terms (inflation-adjusted), and by how much, would confirm or weaken the claim that households have "worn sharp power-price rises." I could not access the Stats NZ CPI calculator or selected price indexes data directly.
- **Spot price data from EA datasets** showing actual dry-year vs. wet-year average prices would quantify the dry-year price spike mechanism. The EA publishes final pricing GDX files and CSVs, but I did not parse them.
- **Hardship/disconnection data** — how many households face disconnection, and whether lower deciles spend a disproportionate share of income on power, would ground the "cost of living" framing in evidence rather than assertion.
- **Independent verification of the 60% hydro / 23% storage figures** — these come from Meridian via RNZ. Stats NZ publishes "New Zealand energy use" data; Stats NZ or the EA may publish independent generation mix statistics that would confirm or adjust these.
- **Security of supply snapshot data** from Transpower/EA would quantify lake-level risk zones and the frequency of dry-year events.
- **A human with lived experience** of energy hardship or a sector expert on the gentailer pricing model could validate whether the "blanket price is unfair" framing matches the reality of how different retail plans actually work in practice.

## Open follow-up questions (child issues for the stream)

1. **Residential price trends in real terms** — [#277](https://github.com/thecolab-ai/the-for-good-project/issues/277)
2. **Dry-year spot price spikes quantified** — [#279](https://github.com/thecolab-ai/the-for-good-project/issues/279)
3. **Gentailer market concentration and margins** — [#281](https://github.com/thecolab-ai/the-for-good-project/issues/281)
4. **Energy hardship by decile** — [#282](https://github.com/thecolab-ai/the-for-good-project/issues/282)
5. **New generation pipeline** — [#283](https://github.com/thecolab-ai/the-for-good-project/issues/283)

## Sources

1. RNZ, "Meridian gets go-ahead to access reserve water, promises price hikes will end soon", 3 Jul 2026. [Live](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon) | [Wayback](https://web.archive.org/web/20260702223340/https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon). Text extracted via Wayback Machine (RNZ is a SPA that requires JavaScript; article text was not available in the HTML source).

2. Electricity Authority, "New Zealand's electricity sector". [ea.govt.nz/your-power/new-zealands-electricity-sector](https://www.ea.govt.nz/your-power/new-zealands-electricity-sector/). Fetched via curl (HTTP 200, 3 Jul 2026). Previously fetched via Wayback Machine when live site returned 403.

3. Electricity Authority, "Your power bill" — bill breakdown. [ea.govt.nz/your-power/bill](https://www.ea.govt.nz/your-power/bill/). Fetched via curl (HTTP 200, 3 Jul 2026). Previously fetched via Wayback Machine.

4. Electricity Authority, "Wholesale spot market". [ea.govt.nz/industry/wholesale/spot-market](https://www.ea.govt.nz/industry/wholesale/spot-market/). Fetched via curl (HTTP 200, 3 Jul 2026). Previously fetched via Wayback Machine.

5. Electricity Authority, "Security of supply". [ea.govt.nz/industry/wholesale/security-of-supply](https://www.ea.govt.nz/industry/wholesale/security-of-supply/). Fetched via curl (HTTP 200, 3 Jul 2026).

6. BusinessDesk, "Commissioner warns Pūkaki hydro plan could raise long-term electricity risk". [businessdesk.co.nz](https://businessdesk.co.nz/article/industry/commissioner-warns-pukaki-hydro-plan-could-raise-long-term-electricity-risk). Referenced; article behind paywall, headline and snippet used.

7. RNZ, "Fast-track bid sparks fears for Lake Pukaki and Mackenzie's tourism industry". [rnz.co.nz/news/business/657581](https://www.rnz.co.nz/news/business/657581/fast-track-bid-sparks-fears-for-lake-pukaki-and-mackenzies-tourism-industry). Referenced as a pointer to criticism of the Pūkaki decision; article text could not be extracted (RNZ SPA, Wayback not yet archived).
