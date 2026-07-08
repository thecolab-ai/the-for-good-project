---
title: "NZ free-shipping thresholds rose over the past 2–3 years; NZ delivery-fee rise is directly evidenced only for one year (2025→2026, one vendor's survey)"
domain: "other"
issue: "#295"
confidence: "Medium"
author: "claude"
agent: "claude"
model: "claude-opus-4-8"
date: "2026-07-03"
status: "draft"
---

# Have NZ online free-shipping thresholds and delivery fees risen over the past 2–3 years, and by how much?

## Executive answer

- **Free-shipping *thresholds* have a clean multi-year (2–3 year) NZ trend: up.** The single best-documented case is **Woolworths NZ's Delivery Saver**: the minimum spend for free delivery rose from **$80 (Sept 2023) to $100 (1 Oct 2025), +25%**, and the subscription itself from **$118 to $132.99 per six months, +12.7%** — a change Woolworths said followed *five years* of no price rise ([RNZ, 1 Sep 2025](https://www.rnz.co.nz/news/business/571681/woolworths-increases-subscription-fee-minimum-spend-for-free-delivery); [RNZ, 2 Jul 2026](https://www.rnz.co.nz/news/business/653038/online-shoppers-facing-higher-delivery-costs-returns-fees)). This is the part of the question I can answer with dated end-points and independent corroboration.
- **Delivery *fees* themselves are the weaker half of the answer: the only dated NZ fee trend I found spans a *single year*, not 2–3.** Shippit's data (as reported for NZ) has average standard delivery basically flat year-on-year (**$9.70 → $10.00 (2025→2026)**, +3%) but express jumping sharply (**$14.10 → $17.42**, +24%) ([1News, 2 Jul 2026](https://www.1news.co.nz/2026/07/02/online-shoppers-facing-higher-delivery-costs-returns-fees/); [RNZ, 2 Jul 2026](https://www.rnz.co.nz/news/business/653038/online-shoppers-facing-higher-delivery-costs-returns-fees)). **The magnitude of any NZ delivery-fee rise over the full 2–3 year window is *unverified* — I have no dated 2023 NZ fee baseline to compare against, and this single-year delta is one vendor's survey.** Standard fees moving only ~3% in that year actually argues *against* a large delivery-fee climb; the sharp move is confined to express.
- **The "quietly rising" aggregate narrative is real but leans on one origin.** Most of the ANZ/NZ trend numbers — thresholds climbing, fewer retailers offering free shipping — come from **Shippit** (a delivery-software vendor). Independent anchors that don't trace to Shippit are: the Woolworths change, **New World ending nationwide free delivery**, and rising carrier costs at **NZ Post** ([b2bnews.co.nz, 1 Jul 2026](https://b2bnews.co.nz/news/free-delivery-ends-as-nz-retailers-claw-back-costs/); [NZ Post, 1 Jul 2024](https://www.nzpost.co.nz/about-us/july-2024); [NZ Post, 1 Jul 2025](https://www.nzpost.co.nz/about-us/july-2025)).
- **The underlying cost push is independently confirmed.** NZ Post raised domestic parcel prices two years running — **2024: small +5.5% / large +4%; 2025: small +2.8% / large +3.4%** — the wholesale last-mile cost retailers pass on ([NZ Post, 2024](https://www.nzpost.co.nz/about-us/july-2024); [NZ Post, 2025](https://www.nzpost.co.nz/about-us/july-2025)).
- **What I could not pin down:** a clean, multi-retailer NZ *time-series* of advertised free-shipping thresholds from independent dated snapshots. Wayback's CDX API returned truncated results in this environment (a tooling limit, not missing history), so the aggregate NZ trend rests on Shippit plus a small number of concrete, dated retailer cases rather than a broad independent sample.

**Overall confidence:** Medium — the *threshold* trend (up, over 2–3 years) is supported, but the Woolworths 2023 baseline is now treated as Medium-confidence because the primary Woolworths page body was not reproducibly retrieved; the 2025 Woolworths change and NZ Post cost-push pieces remain High-confidence. The *delivery-fee* trend is weaker: only a single-year (2025→2026) NZ delta exists, it is one vendor's survey, and the multi-year fee magnitude is **unverified** for want of a dated 2023 NZ baseline.

## Evidence

### Scope note

Issue #294 (sibling in this stream) covers **the fees as they are today** — a cross-retailer snapshot. This finding (#295) is deliberately narrowed to **the trend**: has it risen, over 2–3 years, and by how much. I therefore prioritise *dated* data points (2023 → 2026) over current levels.

### 1. Free-shipping thresholds: the Woolworths case (the cleanest NZ evidence)

Woolworths NZ's **Delivery Saver** lets customers pre-pay a subscription for free delivery, *provided each order clears a minimum spend*. Both levers moved:

| Date | Subscription (per 6 months) | Minimum spend for free delivery |
|---|---|---|
| Sept 2023 baseline | $118 | **$80** ([RNZ, 1 Sep 2025](https://www.rnz.co.nz/news/business/571681/woolworths-increases-subscription-fee-minimum-spend-for-free-delivery); [Woolworths T&C URL slug, Sept 2023](https://www.woolworths.co.nz/info/terms-and-conditions/september-2023-unlimited-free-delivery-minimum-spend-80)) |
| From 1 Oct 2025 | **$132.99** | **$100** ([RNZ, 1 Sep 2025](https://www.rnz.co.nz/news/business/571681/woolworths-increases-subscription-fee-minimum-spend-for-free-delivery)) |

That is a **+25% rise in the free-delivery threshold and +12.7% in the subscription over roughly two years.** Woolworths stated it "had not increased its Delivery Saver price in five years" before this change ([RNZ, 1 Sep 2025](https://www.rnz.co.nz/news/business/571681/woolworths-increases-subscription-fee-minimum-spend-for-free-delivery)). The change was reported again ten months later ([RNZ, 2 Jul 2026](https://www.rnz.co.nz/news/business/653038/online-shoppers-facing-higher-delivery-costs-returns-fees): "Customers now pay $132.99 per six months rather than $118 … $100 worth each time, from $80 previously") and by [1News, 2 Jul 2026](https://www.1news.co.nz/2026/07/02/online-shoppers-facing-higher-delivery-costs-returns-fees/). Woolworths' own dated terms-and-conditions URL also contains the slug `september-2023-unlimited-free-delivery-minimum-spend-80`, but I could not reproducibly retrieve a durable page body or archived copy that supports any more than the page title/slug ([Woolworths T&C, Sept 2023](https://www.woolworths.co.nz/info/terms-and-conditions/september-2023-unlimited-free-delivery-minimum-spend-80)). Therefore the **$80→$100 Delivery Saver change rests on RNZ and 1News reporting**, with the Woolworths URL treated only as weak corroboration that an $80 Woolworths free-delivery terms page existed in September 2023.

This is the one NZ threshold change I can date on both ends, but the September 2023 primary Woolworths page is only reproducible at URL/title-slug level in this environment -> **Medium confidence** for the exact 2023 baseline and **High confidence** that Woolworths lifted the threshold to $100 from 1 October 2025.

### 2. Aggregate thresholds and free-shipping availability (Shippit)

The broader "thresholds are quietly rising" claim comes from **Shippit's State of Shipping reports** (Shippit is a delivery-management software firm):

- The **2026** report puts the **average free-shipping threshold at $135, up $12 on 2025** (~$123), and finds **fewer than 1 in 10 retailers now offer free shipping with no minimum spend** ([Shippit, 2026 State of Shipping](https://www.shippit.com/state-of-shipping-report); [Inside Retail, Jun 2026](https://insideretail.com.au/business/the-state-of-shipping-in-2026-three-things-retailers-must-act-on-202606)).
- The **2024** report (Australia figures) shows free-shipping adoption **falling from 81% of retailers in 2018 to 70% in 2024**, with the average minimum spend to qualify **up ~20% over six years** ([Shippit, 2024 State of Shipping](https://www.shippit.com/press-and-media/the-state-of-shipping-report)).

**Caveat on independence:** these are ANZ-wide (Australia-heavy) and all originate with the same vendor, whose product benefits from retailers treating shipping as a managed cost. Treat the aggregate magnitudes as **Medium confidence**, indicative of direction more than precise NZ levels.

### 3. Delivery fees themselves (NZ, 2025 → 2026)

Shippit's NZ-specific 2026 figures, as reported by two NZ outlets:

| Service | ~2025 avg | 2026 avg | Change |
|---|---|---|---|
| Standard delivery | $9.70 | $10.00 | +$0.30 (+3.1%) |
| Express delivery | $14.10 | $17.42 | +$3.32 (+23.5%) |

Sources: [1News, 2 Jul 2026](https://www.1news.co.nz/2026/07/02/online-shoppers-facing-higher-delivery-costs-returns-fees/); [RNZ, 2 Jul 2026](https://www.rnz.co.nz/news/business/653038/online-shoppers-facing-higher-delivery-costs-returns-fees). Note this is a **single-year** NZ delta, and again Shippit-sourced. A separate NZ trade write-up puts **standard shipping fees "up nearly 9 percent"** and **free returns down to ~11% of retailers, from nearly half in 2018** ([b2bnews.co.nz, 1 Jul 2026](https://b2bnews.co.nz/news/free-delivery-ends-as-nz-retailers-claw-back-costs/)) — but that piece also cites Shippit among its sources, so it is not fully independent of the same survey.

### 4. The cost push behind it (independent, official)

Retailer delivery pricing tracks carrier cost, and the carrier side is independently documented:

- **NZ Post, 1 July 2024:** domestic small-parcel sending **+5.5%**, large-parcel **+4%**, Rural Surcharge **+3.6%**, boxes **+6.1%** ([NZ Post](https://www.nzpost.co.nz/about-us/july-2024)).
- **NZ Post, 1 July 2025:** domestic small-parcel **+2.8%**, large-parcel **+3.4%** ([NZ Post](https://www.nzpost.co.nz/about-us/july-2025)).

So the wholesale last-mile cost that retailers pass on rose in **two consecutive years** — a plausible, independently-sourced mechanism for retailers lifting fees or thresholds. **High confidence** on the carrier increases themselves (official NZ Post pages); Medium on the causal link to retailer-charged fees.

### 5. Concrete retailer-level moves beyond Woolworths

- **New World has ended nationwide free deliveries** ([b2bnews.co.nz, 1 Jul 2026](https://b2bnews.co.nz/news/free-delivery-ends-as-nz-retailers-claw-back-costs/)).
- Returns/restocking fees (adjacent to this stream's returns child) have appeared/risen: **PB Tech 20%, Target Furniture 15%, Fishpond 17%** change-of-mind restocking fees, attributed to Consumer NZ ([1News, 2 Jul 2026](https://www.1news.co.nz/2026/07/02/online-shoppers-facing-higher-delivery-costs-returns-fees/)).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Woolworths Delivery Saver threshold rose $80→$100 (2023→2025) | [RNZ, Sep 2025](https://www.rnz.co.nz/news/business/571681/woolworths-increases-subscription-fee-minimum-spend-for-free-delivery) | [1News, Jul 2026](https://www.1news.co.nz/2026/07/02/online-shoppers-facing-higher-delivery-costs-returns-fees/) reports the same change; [Woolworths T&C, Sep 2023](https://www.woolworths.co.nz/info/terms-and-conditions/september-2023-unlimited-free-delivery-minimum-spend-80) corroborates only at URL/title-slug level because the page body was not reproducibly retrievable | Medium |
| NZ Post raised domestic parcel prices in 2024 **and** 2025 | [NZ Post 2024](https://www.nzpost.co.nz/about-us/july-2024) | [NZ Post 2025](https://www.nzpost.co.nz/about-us/july-2025) | High |
| Average free-shipping threshold is rising (aggregate) | [Shippit 2026](https://www.shippit.com/state-of-shipping-report) | [Shippit 2024](https://www.shippit.com/press-and-media/the-state-of-shipping-report) — **same vendor, not independent** | Medium |
| NZ express delivery fee jumped ~24% (2025→2026) | [RNZ, Jul 2026](https://www.rnz.co.nz/news/business/653038/online-shoppers-facing-higher-delivery-costs-returns-fees) | [1News, Jul 2026](https://www.1news.co.nz/2026/07/02/online-shoppers-facing-higher-delivery-costs-returns-fees/) — **both re-report the same Shippit data** | Medium |

**Explicit single-origin flags:** The aggregate threshold trend and the NZ fee deltas both trace to **Shippit**. Two outlets carrying the same Shippit numbers are *not* two independent sources (per the method). The genuinely independent corroboration for "costs are rising" is the Woolworths change, the NZ Post rate cards, and New World's move — not a second survey.

## What would change this conclusion

- **A second, independent NZ threshold/fee survey** (e.g. Consumer NZ, Retail NZ, NZ Post, or a university study) that either confirmed or contradicted Shippit's magnitudes. Right now the aggregate picture is effectively one vendor's dataset re-reported.
- **Dated Wayback snapshots of 5–10 major NZ retailers' delivery pages (2023→2026)** showing their advertised free-shipping threshold at each point. I could not build this series: the Internet Archive **CDX API returned truncated responses in this environment** (a tooling/rate limit, *not* absence of history — a browser-driven Wayback pull should recover it). This is the highest-value next step and would move the aggregate claim from Medium toward High.
- **Evidence that fee rises simply track general inflation** (petrol +13.1%, electricity +12.6% over the year to April 2026 are cited as delivery inputs — [b2bnews.co.nz](https://b2bnews.co.nz/news/free-delivery-ends-as-nz-retailers-claw-back-costs/), attributing Stats NZ). If threshold/fee rises merely match CPI, "quietly rising" is real but unremarkable; if they outpace it (as the Woolworths +25% threshold and +24% express suggest), the story is stronger. I did not independently verify those Stats NZ input-cost figures.
- **A retailer reversing course** (dropping a threshold, restoring free shipping) would show the trend is cyclical, not structural.

**Needs a human / further data I could not access:** the Shippit reports' full methodology (sample size, NZ vs AU split, whether "average" is retailer-weighted or spend-weighted) sits behind a lead-capture download; a contributor who pulls the full PDFs could state the NZ sample properly. The exact date New World ended nationwide free delivery also wants a primary Foodstuffs/New World source rather than the trade write-up.

## Open follow-up questions

- **Build the Wayback threshold time-series** for major NZ retailers (The Warehouse, Warehouse Stationery, Briscoes, Mighty Ape, PB Tech, Kmart NZ) via a browser-driven Internet Archive pull — the independent aggregate evidence this finding lacks. *(Candidate research issue under #258.)*
- Do NZ delivery-fee/threshold rises **outpace CPI and carrier-cost increases**, or merely track them? (Requires Stats NZ CPI + NZ Post rate cards vs a retailer sample.)
- Foodstuffs/New World: when and why did nationwide free delivery end, and what replaced it?

## Sources

1. RNZ, "Online shoppers facing higher delivery costs, returns fees", 2 Jul 2026 — https://www.rnz.co.nz/news/business/653038/online-shoppers-facing-higher-delivery-costs-returns-fees (accessed 2026-07-03)
2. RNZ, "Woolworths increases subscription fee, minimum spend for free delivery", 1 Sep 2025 — https://www.rnz.co.nz/news/business/571681/woolworths-increases-subscription-fee-minimum-spend-for-free-delivery (accessed 2026-07-03)
3. 1News, "Online shoppers facing higher delivery costs, returns fees", 2 Jul 2026 — https://www.1news.co.nz/2026/07/02/online-shoppers-facing-higher-delivery-costs-returns-fees/ (accessed 2026-07-03)
4. Woolworths NZ, Terms & Conditions URL slug "september-2023-unlimited-free-delivery-minimum-spend-80" — https://www.woolworths.co.nz/info/terms-and-conditions/september-2023-unlimited-free-delivery-minimum-spend-80 (rechecked 2026-07-08 via the ADR-0006 fetch ladder: `node scripts/fetch.mjs` succeeded only to a generic Woolworths SPA shell via rotating proxy, so the page body is **not** treated as verified here)
5. Shippit, "2026 State of Shipping Report" — https://www.shippit.com/state-of-shipping-report (accessed 2026-07-03)
6. Shippit, "2024 State of Shipping Report" (AU figures) — https://www.shippit.com/press-and-media/the-state-of-shipping-report (accessed 2026-07-03)
7. Inside Retail Australia, "The state of shipping in 2026: Three things retailers must act on", Jun 2026 — https://insideretail.com.au/business/the-state-of-shipping-in-2026-three-things-retailers-must-act-on-202606 (accessed 2026-07-03)
8. NZ Post, "Changes to our products and services from 1 July 2024" — https://www.nzpost.co.nz/about-us/july-2024 (accessed 2026-07-03)
9. NZ Post, "Business pricing and product changes from 1 July 2025" — https://www.nzpost.co.nz/about-us/july-2025 (accessed 2026-07-03)
10. b2bnews.co.nz, "Free delivery ends as NZ retailers claw back costs", 1 Jul 2026 — https://b2bnews.co.nz/news/free-delivery-ends-as-nz-retailers-claw-back-costs/ (accessed 2026-07-03)
