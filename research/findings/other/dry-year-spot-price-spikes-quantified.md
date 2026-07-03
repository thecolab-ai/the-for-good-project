---
title: "In a dry year, NZ wholesale spot prices jump roughly ten- to twentyfold — but households feel it lagged and buffered, not in real time"
domain: "other"
issue: "#279"
confidence: "High"   # High for the wholesale magnitude; Medium for the household pass-through translation
author: "Richard Fortune"
agent: "claude"
model: "opus"
date: "2026-07-04"
status: "draft"
---

# In a dry year, NZ wholesale spot prices jump roughly ten- to twentyfold — but households feel it lagged and buffered, not in real time

## Executive answer

- **How big is the jump? Roughly 10–20× at the monthly level, and 100×+ on the worst half-hours.** Using Electricity Authority final-pricing data, the Benmore (BEN2201) reference node averaged **$475.69/MWh (≈47.6 c/kWh)** across August 2024 — the peak of the 2024 dry spell — versus **$24.20/MWh (≈2.4 c/kWh)** just three months later in wet November 2024, a ~20× difference at the same node ([EA EMI Final Energy Prices, computed via nz-electricity skill](https://www.emi.ea.govt.nz/Wholesale/Datasets/DispatchAndPricing/FinalEnergyPrices); [EA, "What was behind high wholesale electricity prices"](https://www.ea.govt.nz/news/eye-on-electricity/what-was-behind-high-wholesale-electricity-prices/)).
- **On the single worst days it is far more extreme.** On 9 August 2024, Benmore averaged **$807.91/MWh (≈80.8 c/kWh)** across the day; individual half-hours in that month topped **$1,475/MWh at Benmore and $1,649/MWh at Otahuhu (≈$1.48–1.65/kWh)**. The EA's own summary is that prices rose "from roughly $300/MWh to over $800/MWh" between July and early August 2024 ([EA, "What was behind high wholesale electricity prices"](https://www.ea.govt.nz/news/eye-on-electricity/what-was-behind-high-wholesale-electricity-prices/); [EA EMI Final Energy Prices](https://www.emi.ea.govt.nz/Wholesale/Datasets/DispatchAndPricing/FinalEnergyPrices)).
- **For how long? Weeks, not months — and it is spiky, not a plateau.** The 2024 event's highest prices were "relatively short-lived" and "quickly dropped back to prices well below $100/MWh" once wind returned and gas was rebuilt into storage; the acute window ran roughly July to late August 2024 ([EA, "NZ's electricity system in August and November 2024"](https://www.ea.govt.nz/news/eye-on-electricity/new-zealands-electricity-system-in-august-and-november-2024/)). Dry-year risk is a *seasonal* risk that recurs (2001, 2003, 2008, 2021, 2024), not a permanent price level.
- **The mechanism is the marginal water value, and JADE is the model that estimates it.** In a dry year, hydro generators offer their limited stored water at its *opportunity cost* — the "water value" — which rises steeply as reservoirs empty and can approach the cost of shortage. The Electricity Authority publishes weekly **expected water values** computed by the **JADE** stochastic model (built and maintained by the EPOC team at the University of Auckland). Those water values are the live, forward-looking indicator of how tight the system is ([EA EMI, "JADE"](https://www.emi.ea.govt.nz/wholesale/Tools/JADE); [Energy Market Knowledgebase, "Water Values and Hydro Offers"](https://emk.energylink.co.nz/EMK:Water_Values_and_Hydro_Offers)).
- **A household does not pay the spot price in a dry week.** Prices are nodal (not one national number), and ~all households buy from a retailer on a fixed plan; retailers hedge, so a dry-year spike passes through *lagged and dampened*, showing up later as annual retail price rises rather than a spiking weekly bill. Only the small minority on spot/real-time plans feel the spike directly ([EA, "Retail power prices and power supply security"](https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/); [EA, "Spot market"](https://www.ea.govt.nz/industry/wholesale/spot-market/)).

**Overall confidence:** High for the wholesale magnitude and duration (regulator statements and independent final-pricing data agree). Medium for the household "cents/kWh" translation — the pass-through is real but lagged, buffered by hedging, and I could not obtain audited retailer pass-through figures.

## Evidence

### The core numbers: what a dry year does to the spot price

New Zealand does not have a single national spot price. Prices are calculated every half-hour at each grid location, with about 12,000 final prices per day (52 injection points, 196 exit points), so a "dry year" lifts *average nodal prices*, not a uniform national number ([EA, "Spot market"](https://www.ea.govt.nz/industry/wholesale/spot-market/)). To quantify the jump I used the Electricity Authority's published **Final Energy Prices** half-hourly dataset (via the `nz-electricity` skill), at the two ASX reference nodes — **Benmore (BEN2201)** in the South Island and **Otahuhu (OTA2201)** in the North Island ([EA EMI Final Energy Prices](https://www.emi.ea.govt.nz/Wholesale/Datasets/DispatchAndPricing/FinalEnergyPrices)).

| Node / period | What it represents | Mean $/MWh | Mean c/kWh | Max half-hour $/MWh |
|---|---|---:|---:|---:|
| BEN2201, **Aug 2024** (n=1,488) | Peak of 2024 dry spell; storage a six-year low | **475.69** | 47.6 | 1,475.23 |
| OTA2201, **Aug 2024** (n=1,488) | Same period, North Island node | 452.04 | 45.2 | 1,649.43 |
| BEN2201, **9 Aug 2024** (n=48) | Single worst day | **807.91** | 80.8 | 870.54 |
| BEN2201, **Aug 2023** (n=1,488) | A tighter-than-normal but non-crisis August | 130.69 | 13.1 | 662.89 |
| BEN2201, **Aug 2021** (n=1,488) | Earlier dry/cold winter event | 96.43 | 9.6 | **2,546.72** |
| BEN2201, **Nov 2024** (n=1,440) | Wet spring, ~3 months after the crisis | **24.20** | 2.4 | 273.40 |
| BEN2201, **20 Nov 2024** (n=48) | A wet spillage day | 1.88 | 0.19 | 8.95 |

(Source for every row: [EA EMI Final Energy Prices](https://www.emi.ea.govt.nz/Wholesale/Datasets/DispatchAndPricing/FinalEnergyPrices), half-hourly final settlement prices, retrieved 4 July 2026 via `nz-electricity` skill; figures are the min/mean/max the skill returns over each date range.)

The headline is the **ratio, not just the level**: the same Benmore node ran at **$475.69/MWh in the dry August and $24.20/MWh in the wet November** — a ~**20× swing in one quarter**. At the daily scale the swing is far larger (9 Aug 2024's $807.91 vs 20 Nov 2024's $1.88 ≈ 430×). This independently reproduces the Electricity Authority's own framing that wholesale prices rose "from roughly $300/MWh to over $800/MWh" in July–early August 2024 ([EA, "What was behind high wholesale electricity prices"](https://www.ea.govt.nz/news/eye-on-electricity/what-was-behind-high-wholesale-electricity-prices/)).

Note the **Aug 2021 vs Aug 2024 contrast**: 2021's *monthly average* was much lower ($96/MWh) yet its worst half-hour was higher ($2,547/MWh). Dry-year pricing is *spiky and episodic* — driven by the coincidence of low hydro with cold, still (low-wind) days — so a monthly mean understates the acute peaks and a single peak overstates the sustained cost.

### Why prices rise: hydro scarcity, thermal on the margin, and low wind

New Zealand's generation capacity is more than 50% hydro, so when rainfall keeps lake levels below average for weeks the system runs short of its cheapest fuel ([EA, "The difference between winter peak capacity and dry year risk"](https://www.ea.govt.nz/news/eye-on-electricity/the-difference-between-winter-peak-capacity-and-dry-year-risk/)). In August 2024 three things coincided: hydro storage hit a **six-year low** by early August; **wind was often generating below 300 MW against national capacity over 1,000 MW**; and **gas supply was tight, pushing up the price of the thermal (gas/coal) generation** that then had to run to cover the gap ([EA, "What was behind high wholesale electricity prices"](https://www.ea.govt.nz/news/eye-on-electricity/what-was-behind-high-wholesale-electricity-prices/)). Because the spot price is set by the most expensive offer needed to meet demand in each half-hour, expensive thermal (and scarcity-priced hydro) on the margin drags the whole clearing price up. MBIE's national data confirms the physical side of this: in 2024 low hydro inflows cut hydro generation, and the shortfall was covered partly by increased gas, coal and oil generation ([MBIE, Energy in New Zealand 2025 — Electricity](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-publications-and-technical-papers/energy-in-new-zealand/energy-in-new-zealand-2025/electricity), [Wayback snapshot](https://web.archive.org/web/20260602055633/https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-publications-and-technical-papers/energy-in-new-zealand/energy-in-new-zealand-2025/electricity)).

### What the marginal water value model (JADE) tells us

The issue asks specifically what "the marginal water value model (JADE)" says about current risk. The mechanism and the model are:

- **Water value = the opportunity cost of stored water.** A hydro operator with a reservoir chooses between generating now and saving water to generate later. The efficient rule is to generate whenever the nodal price meets or exceeds the water value, and to *offer* water into the market at that value: "hydro output should be offered each week at constant marginal water value" ([Energy Market Knowledgebase, "Water Values and Hydro Offers"](https://emk.energylink.co.nz/EMK:Water_Values_and_Hydro_Offers)). So the water value **is, in effect, the hydro offer price** — and it is what pushes spot prices up in a dry year.
- **Water value rises as storage falls.** Lower storage sits on higher-priced water-value contours; as reservoirs approach empty under a "1-in-N dry year security criterion," the water value climbs toward the cost of actual shortage ([Energy Market Knowledgebase, "Water Values and Hydro Offers"](https://emk.energylink.co.nz/EMK:Water_Values_and_Hydro_Offers)). This is the quantitative reason a dry year raises prices *before* any physical shortage: generators price the *risk* of running out.
- **JADE is the model that estimates it.** JADE is "a multistage stochastic optimization representing the New Zealand electricity generation sector, with a rich treatment of the hydrological aspects." It is built and maintained by the **EPOC team at the University of Auckland**, formulated in Julia (JuMP) on the **SDDP.jl** stochastic dual dynamic programming engine. Its key output is a **water-value surface** and **marginal water values for each reservoir**; the Electricity Authority publishes the inputs and **expected water values on a weekly basis** on EMI ([EA EMI, "JADE"](https://www.emi.ea.govt.nz/wholesale/Tools/JADE)).

**What this tells a consumer about *current* risk:** the weekly expected-water-value series on EMI is the market's live gauge of dry-year stress — when published water values are rising, the system is pricing in a higher probability that scarce hydro will have to be rationed by price. It is a *forward-looking* signal, not a bill. (I did not extract the current numeric water-value surface from the weekly EMI dataset — see limits.)

### The forward/hedge market moves too

Retailers and large users manage spot volatility by buying **hedges** — most visibly ASX New Zealand electricity futures, which are cash-settled against the same two reference nodes, **Otahuhu and Benmore**, in baseload and peak blocks ([EA, "An explanation of ASX forward prices"](https://www.ea.govt.nz/news/eye-on-electricity/an-explanation-of-asx-forward-prices/); [ASX, NZ electricity derivatives fact sheet](https://www.asx.com.au/content/dam/asx/markets/trade-our-derivatives-market/derivatives-market-overview/energy-derivatives/new-zealand-electricity-fact-sheet.pdf)). Forward prices are "a good indicator of what market participants think spot prices may be" over coming quarters, so dry-year fear lifts the forward curve as well as the spot. A concrete example of how a tight period raises the *cost of hedging*: a new retail entrant in 2021 reported facing hedge prices for 2022 of **$130–180/MWh at Otahuhu** (about $20/MWh lower at Benmore), well above the $92–111/MWh incumbents were paying ([EA, "An explanation of ASX forward prices"](https://www.ea.govt.nz/news/eye-on-electricity/an-explanation-of-asx-forward-prices/)). Higher hedge costs are the channel through which a sustained dry spell eventually reaches fixed retail plans.

### What a household actually pays — the honest translation

This is where the "cents/kWh" question needs care. Three facts blunt the spot spike before it reaches a normal bill:

1. **Households don't buy at spot.** "Households and smaller businesses do not pay the wholesale electricity spot price. Instead, they buy power from an electricity retailer," who "absorb risk from New Zealand's volatile electricity market, in a similar way to companies providing house or car insurance" ([EA, "Retail power prices and power supply security"](https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/)).
2. **Pass-through is lagged.** "While most consumers are protected from high wholesale spot prices, if spot prices stay higher over a longer period, retailers … will choose a higher fixed price," i.e. a *sustained* dry-year signal shows up later as a retail reprice, not an immediate weekly jump ([EA, "Retail power prices and power supply security"](https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/)).
3. **The spot number dwarfs the whole retail price, which is why it can't be pass-through 1:1.** The average residential all-in price (incl. GST, network, retail) was about **33 c/kWh in 2024** ([MBIE, Quarterly Survey of Domestic Electricity Prices, 15 Nov 2025](https://www.mbie.govt.nz/assets/qsdep-15-nov-2025.pdf)). The dry-August Benmore *wholesale energy* average alone was ~47.6 c/kWh — more than the entire normal retail price — which only makes sense because retailers hedge and average over time; no fixed-plan household paid 47.6 c/kWh of energy that month.

The households that *do* feel it directly are the minority on spot-exposed/real-time plans. Spot plans are a small share of the market and are explicitly marketed with the warning that bills rise in dry-winter conditions; adoption fell after the 2017 spot spike ([EA, "Retail power prices and power supply security"](https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/); [Pébereau & Remmy, "Barriers to real-time electricity pricing: Evidence from New Zealand"](https://kevinremmy.com/pdf/RTP_Pebereau_Remmy.pdf)). For a household on such a plan, the table above *is* roughly their marginal energy cost in the moment: ~2 c/kWh on a wet spring night, ~48 c/kWh averaged across the dry August, ~81 c/kWh across 9 August 2024, and momentary half-hours above $1.40/kWh.

### It recurs — this is a seasonal risk, not a one-off

Dry-year price events are a repeating feature: New Zealanders were asked to conserve power in the dry years of **2001, 2003 and 2008**, and recent wholesale spikes occurred in **2021** and **2024** ([EA, "What we're doing about the electricity price spike"](https://www.ea.govt.nz/news/general-news/what-were-doing-about-the-electricity-price-spike/); primary data above for 2021/2024). The 2026 fast-track approval for Meridian to draw Lake Pukaki contingent storage is explicitly framed as a dry-year buffer "through winter 2028," which tells you the risk is expected to persist over at least the medium term ([RNZ, 3 July 2026](https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon)).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Dry-year wholesale spot averaged ~$475/MWh (Benmore, Aug 2024) vs ~$24/MWh three months later — a ~20× monthly swing; peaks over $800/MWh. | [EA final-pricing data](https://www.emi.ea.govt.nz/Wholesale/Datasets/DispatchAndPricing/FinalEnergyPrices) (independent computation) | [EA, "What was behind high wholesale electricity prices"](https://www.ea.govt.nz/news/eye-on-electricity/what-was-behind-high-wholesale-electricity-prices/) (~$300→$800+/MWh) | High |
| The high prices were short-lived (weeks) and fell back below $100/MWh as wind/gas recovered. | [EA, "NZ's electricity system in Aug and Nov 2024"](https://www.ea.govt.nz/news/eye-on-electricity/new-zealands-electricity-system-in-august-and-november-2024/) | [EA final-pricing data](https://www.emi.ea.govt.nz/Wholesale/Datasets/DispatchAndPricing/FinalEnergyPrices) (Nov 2024 mean $24.20/MWh) | High |
| Prices are nodal, not a single national number; dry years lift average nodal prices (BEN and OTA differ). | [EA, "Spot market"](https://www.ea.govt.nz/industry/wholesale/spot-market/) | [EA final-pricing data](https://www.emi.ea.govt.nz/Wholesale/Datasets/DispatchAndPricing/FinalEnergyPrices) (BEN $475.69 vs OTA $452.04, Aug 2024) | High |
| The dry-year price mechanism is the marginal water value (hydro's opportunity cost), estimated by the JADE model and published weekly by the EA. | [EA EMI, "JADE"](https://www.emi.ea.govt.nz/wholesale/Tools/JADE) | [EMK, "Water Values and Hydro Offers"](https://emk.energylink.co.nz/EMK:Water_Values_and_Hydro_Offers) | High |
| Households don't pay spot; the spike passes through lagged and dampened via retailer hedging, becoming later retail rises. | [EA, "Retail power prices and power supply security"](https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/) | [EA, "An explanation of ASX forward prices"](https://www.ea.govt.nz/news/eye-on-electricity/an-explanation-of-asx-forward-prices/) (hedge-cost channel) | Medium |

## What would change this conclusion

- **Audited retailer pass-through data.** I quantified the *wholesale* spike precisely, but the household "cents/kWh" answer rests on the regulator's qualitative statement that pass-through is lagged and buffered. Firm evidence on how much of a dry-year spike lands in fixed retail prices (and after how many months) would sharpen — or overturn — the "muted for households" framing. This is squarely the job of the price-trend and gentailer-margin child issues (#277, #281).
- **The current numeric water-value surface.** I described what JADE computes and that the EA publishes expected water values weekly, but I did not download and read the current week's water-value dataset. Someone who parses the weekly EMI water-value files could state today's dry-year risk as an actual number, not just a mechanism.
- **A longer multi-year monthly series.** My primary figures are anchored on 2021, 2023 and 2024. A full CPI-context monthly wholesale series back through 2001/2008 would confirm whether 2024's ~20× swing is typical of dry years or unusually severe. The EMI final-pricing dataset supports this but I sampled representative months rather than the full history.
- **The precise share of households on spot/real-time plans.** I could establish that it is a small minority (and falls after spikes) but could not verify a single authoritative current percentage; a Consumer NZ/EA retail-market figure would firm this.
- **A person with electricity-market expertise should sanity-check the water-value and hedge wording** — nodal pricing, water values, and hedge pass-through are easy to oversimplify (a caution the stream's discover framing also flagged).

## Open follow-up questions

- What do the *current* JADE weekly expected water values imply about 2026–2028 dry-year risk in numeric terms? (Would need parsing the EMI water-value dataset.)
- How much, and with what lag, did the 2024 dry-year wholesale spike actually feed into fixed residential tariffs by retailer? (Overlaps #277/#281 — not duplicated here.)
- How did ASX forward-curve prices for winter quarters move through the 2024 event, quarter by quarter? (The forward-market magnitude, which I could only illustrate with the 2021/2022 hedge example.)

## Sources

1. Electricity Authority — EMI, "Final Energy Prices" dataset (half-hourly final settlement prices by point of connection). Primary data for all quantified price figures; retrieved 4 July 2026 via the `nz-electricity` skill (underlying monthly CSVs at `emidatasets.blob.core.windows.net/publicdata/.../FinalEnergyPrices`). https://www.emi.ea.govt.nz/Wholesale/Datasets/DispatchAndPricing/FinalEnergyPrices
2. Electricity Authority, "What was behind high wholesale electricity prices" (2024). Fetched via WebFetch, HTTP 200. https://www.ea.govt.nz/news/eye-on-electricity/what-was-behind-high-wholesale-electricity-prices/
3. Electricity Authority, "New Zealand's electricity system in August and November 2024". Fetched via WebFetch, HTTP 200. https://www.ea.govt.nz/news/eye-on-electricity/new-zealands-electricity-system-in-august-and-november-2024/
4. Electricity Authority, "Spot market". https://www.ea.govt.nz/industry/wholesale/spot-market/
5. Electricity Authority, "The difference between winter peak capacity and dry year risk" (28 May 2024). https://www.ea.govt.nz/news/eye-on-electricity/the-difference-between-winter-peak-capacity-and-dry-year-risk/
6. Electricity Authority — EMI, "JADE" (marginal water value model documentation). Fetched via WebFetch + `curl` HTTP 200. https://www.emi.ea.govt.nz/wholesale/Tools/JADE
7. Energy Market Knowledgebase (Energylink), "Water Values and Hydro Offers". Fetched via WebFetch. https://emk.energylink.co.nz/EMK:Water_Values_and_Hydro_Offers
8. Electricity Authority, "Retail power prices and power supply security". Fetched via WebFetch, HTTP 200. https://www.ea.govt.nz/news/eye-on-electricity/retail-power-prices-and-power-supply-security/
9. Electricity Authority, "An explanation of ASX forward prices". https://www.ea.govt.nz/news/eye-on-electricity/an-explanation-of-asx-forward-prices/
10. ASX, "New Zealand Electricity Derivatives" fact sheet (contract specs; Otahuhu/Benmore reference nodes). https://www.asx.com.au/content/dam/asx/markets/trade-our-derivatives-market/derivatives-market-overview/energy-derivatives/new-zealand-electricity-fact-sheet.pdf
11. MBIE, "Energy in New Zealand 2025 — Electricity". Live page (Incapsula-protected to plain fetchers) plus Wayback snapshot (2 June 2026). https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-publications-and-technical-papers/energy-in-new-zealand/energy-in-new-zealand-2025/electricity — snapshot: https://web.archive.org/web/20260602055633/https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-publications-and-technical-papers/energy-in-new-zealand/energy-in-new-zealand-2025/electricity
12. MBIE, "Quarterly Survey of Domestic Electricity Prices" (15 Nov 2025 release; ~33 c/kWh avg residential incl. GST, 2024). Fetched via `curl` HTTP 200. https://www.mbie.govt.nz/assets/qsdep-15-nov-2025.pdf
13. Pébereau & Remmy, "Barriers to real-time electricity pricing: Evidence from New Zealand" (working paper). https://kevinremmy.com/pdf/RTP_Pebereau_Remmy.pdf
14. Electricity Authority, "What we're doing about the electricity price spike". Fetched via `curl` HTTP 200. https://www.ea.govt.nz/news/general-news/what-were-doing-about-the-electricity-price-spike/
15. RNZ, "Meridian gets go-ahead to access reserve water, promises price hikes will end soon" (3 July 2026). https://www.rnz.co.nz/news/business/658613/meridian-gets-go-ahead-to-access-reserve-water-promises-price-hikes-will-end-soon
16. GitHub issue #279, "research: dry-year spot price spikes quantified", The For Good Project. https://github.com/thecolab-ai/the-for-good-project/issues/279
