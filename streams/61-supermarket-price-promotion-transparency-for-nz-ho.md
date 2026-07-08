---
stream: 61
title: "Shoppers can't tell a real supermarket deal from a manufactured one"
state: awaiting-direction
steward: ""
domain: other
updated: 2026-07-08
image: /images/streams/stream-61-supermarket-pricing.jpg
---

<!--
The Stream Overview is written for someone who will NEVER touch GitHub or a CLI.
No jargon, no repo-speak, no issue numbers in the prose (link them instead).
Keep it under two screens — this is a briefing, not an archive.
-->

# Shoppers can't tell a real supermarket deal from a manufactured one

## The problem, in plain language

Food takes a large share of many household budgets, but official price statistics do not show the day-to-day shelf reality a shopper faces. A family can see a "special", a loyalty price, a smaller pack, or a different branch price, but still not know whether it is a real saving, a routine cycle, or just a different way of showing the same cost.

## What we've learned so far

- **Official food-price indexes and shelf prices answer different questions.** Stats NZ is useful for national price movement, but a small Papakura basket moved differently from the national food index, showing why a household needs exact product and store context as well. (confidence: Medium) — [shelf prices vs official index](../research/findings/civic-transparency/grocery-shelf-prices-vs-fpi.md), [framing research](../research/findings/other/supermarket-transparency-framing.md)
- **The shelf-level data exists, but public reuse is constrained — and the safe path is now mapped.** Grocer's public data can support current prices, store coverage, and product histories, but its terms grant no explicit permission to republish product-level extracts, and New Zealand copyright guidance says compiled data tables can be protected even where individual facts are not. The defensible default is to publish methods and aggregate analysis; naming specific products, stores, and dates in public needs Grocer's written permission or a New Zealand legal review first, and bulk republication is off the table without both. This is a careful non-lawyer reading, not legal advice. (confidence: Medium) — [data audit](../research/findings/other/grocer-nz-data-audit.md), [data-rights path](../research/findings/other/grocer-price-rights-path.md)
- **High "regular" prices are often not the price people usually face.** A two-store staples basket found every item spent less than half its time at the exact maximum observed price, and a wider 61-product, four-region sample found most product/store histories spent much of their time below their own near-ceiling price. This is a pricing pattern, not proof of misleading conduct. (confidence: Medium) — [staples promotion cycling](../research/findings/other/staples-promo-cycling.md), [wider pricing patterns](../research/findings/other/wider-supermarket-pricing-patterns.md)
- **The chains do not simply move together.** Some products show alternating cheap weeks between banners, but the wider sample weakens any blanket "lockstep" story: cross-chain correlations were mostly near zero, and strict alternation appeared only in a minority of product-region pairs. (confidence: Medium) — [cross-chain comparison](../research/findings/other/supermarket-cross-chain-price-lockstep.md), [wider pricing patterns](../research/findings/other/wider-supermarket-pricing-patterns.md)
- **Where a shopper buys can matter, even inside one area or banner.** Current-price checks found same-day gaps, PAK'nSAVE winning one Papakura basket without winning every item, and same-banner branch spreads that differed by chain. These are useful shopper signals, but they are one-source current snapshots that can go stale quickly. (confidence: Medium) — [same-day price gaps](../research/findings/other/same-day-grocery-price-gaps.md), [cheapest-basket check](../research/findings/other/paknsave-cheapest-basket.md), [within-banner price spread](../research/findings/other/within-banner-store-price-spread.md)
- **Smaller packs can hide a unit-price rise.** In a small sample, Consumer NZ size-change examples matched Grocer histories where juice and toilet paper kept the same observed shelf-price ceiling while the price per litre or per sheet rose; unit pricing is the practical defence. (confidence: Medium for examples; High for unit-pricing rules) — [shrinkflation and unit prices](../research/findings/other/shrinkflation-pack-size-unit-price.md), [pricing law map](../research/findings/other/nz-supermarket-pricing-law.md)
- **Misleading price claims are already illegal, but high prices are not.** The legal line is the representation: shelf versus checkout price, "was/now", "usual", multibuy, unit price, or a stated reason for a change. The Commerce Commission and Grocery Commissioner are live regulator routes, but a public artifact must avoid declaring breach or intent. (confidence: High) — [pricing law map](../research/findings/other/nz-supermarket-pricing-law.md), [tool gap analysis](../research/findings/other/supermarket-tool-transparency-gap.md)
- **The gap is not another price-comparison app.** Existing tools already compare prices and show some history; the missing public-interest layer is no-login, plain-English education and evidence packs that explain promotion mechanics, cite sources, and avoid overclaiming. (confidence: Medium) — [tool gap analysis](../research/findings/other/supermarket-tool-transparency-gap.md), [measurement method](../research/findings/other/supermarket-pricing-method.md)
- **A defensible named example needs a photo of what the shopper was actually shown, not just the price history.** The law turns on the representation — the shelf ticket, the "was/now" wording, the unit price, the checkout charge — and price-history rows alone can't reconstruct it. There is now a designed recipe for a privacy-safe "evidence pack": a cropped capture of only the ticket or screen (no people, no loyalty or payment details), matched to the same product and store's price history, with integrity checks and a private original kept for reviewers. The recipe is cited from official guidance but has not yet been tested in a real store. (confidence: Medium) — [evidence-capture protocol](../research/findings/other/supermarket-evidence-capture.md), [pricing law map](../research/findings/other/nz-supermarket-pricing-law.md)

## What we're not sure about yet

- **Whether public outputs can safely use examples based on Grocer data.** The path is now clearer — ask Grocer for a narrow written permission, or get a New Zealand lawyer to review a specific article — but neither has happened, both rights findings are careful non-lawyer readings, and Woolworths' own terms could not be fully re-checked. This still limits every public page or brief that names a product, store, and date.
- **What the shopper actually saw at the shelf or online.** Historical price rows usually show date, store, and price, not the displayed "was", "now", loyalty, multibuy, shelf-ticket wording, or checkout result. There is now a designed capture-and-match protocol to fill this gap, but it is untested in the field: nobody has confirmed that stores permit the photography, measured how error-prone the matching is, or checked whether a regulator would accept the resulting pack.
- **How representative the measured patterns are.** The newer wider sample is much better than the early Papakura-only work, but it is still a selected public-data sample, not a national random audit or a basket weighted by what people actually buy.
- **Why prices move.** The evidence can show cycling, gaps, same-week alternation, and branch differences, but not retailer intent, supplier funding, or internal promotion calendars.
- **Whether the regulator, a newsroom, or households would use the output.** The law and transparency need are well evidenced, but nobody has tested the format with shoppers, Grocer, Consumer NZ, retailers, or the Commerce Commission.

## What we could do about it

- **Resolve the data-permission question before any public product-level page or brief.** Helps: the project team and any future partner. Effort: Small in project time, but dependent on Grocer, legal help, or both. Supported by [data audit](../research/findings/other/grocer-nz-data-audit.md) (confidence: Medium), [data-rights path](../research/findings/other/grocer-price-rights-path.md) (confidence: Medium), and [measurement method](../research/findings/other/supermarket-pricing-method.md) (confidence: Medium). The specific ask is now drafted: a narrow written permission from Grocer covering a small number of public-interest derived charts and examples, with attribution and no bulk redistribution — or, failing that, a lawyer's review of the specific article. Would need: a reply from Grocer, legal help, or a decision to publish only aggregate methods.
- **Publish a plain-English supermarket-deals explainer using limited examples.** Helps: households trying to understand "was/now", loyalty prices, promotion cycles, cheapest-store claims, and unit prices. Effort: Small-Medium. Supported by [tool gap analysis](../research/findings/other/supermarket-tool-transparency-gap.md) (confidence: Medium), [pricing law map](../research/findings/other/nz-supermarket-pricing-law.md) (confidence: High), [staples promotion cycling](../research/findings/other/staples-promo-cycling.md) (confidence: Medium), [shrinkflation and unit prices](../research/findings/other/shrinkflation-pack-size-unit-price.md) (confidence: Medium), and [cheapest-basket check](../research/findings/other/paknsave-cheapest-basket.md) (confidence: Medium). Would need: careful wording, no bulk data, no implication that any named retailer broke the law — and, per the [data-rights path](../research/findings/other/grocer-price-rights-path.md) (confidence: Medium), any named product/store/date example held back until permission or legal review clears it.
- **Build an internal evidence method and sample pack for a regulator or newsroom conversation.** Helps: the Grocery Commissioner, journalists, or advocates decide whether the patterns merit formal attention. Effort: Medium. Supported by [measurement method](../research/findings/other/supermarket-pricing-method.md) (confidence: Medium), [evidence-capture protocol](../research/findings/other/supermarket-evidence-capture.md) (confidence: Medium), [wider pricing patterns](../research/findings/other/wider-supermarket-pricing-patterns.md) (confidence: Medium), [same-day price gaps](../research/findings/other/same-day-grocery-price-gaps.md) (confidence: Medium), and [pricing law map](../research/findings/other/nz-supermarket-pricing-law.md) (confidence: High). The capture-and-match recipe now exists on paper — privacy-safe photos of shelf tickets or screens matched to price histories, with integrity checks. Would need: a small real-world pilot of the capture protocol, second-review reproduction, and a clear "pattern, not allegation" frame.
- **Run a fuller representative-basket study only after the above constraints are settled.** Helps: funders, councils, consumer advocates, and households understand whether the patterns hold beyond selected examples. Effort: Large. Supported by [shelf prices vs official index](../research/findings/civic-transparency/grocery-shelf-prices-vs-fpi.md) (confidence: Medium), [wider pricing patterns](../research/findings/other/wider-supermarket-pricing-patterns.md) (confidence: Medium), [within-banner price spread](../research/findings/other/within-banner-store-price-spread.md) (confidence: Medium), and [data audit](../research/findings/other/grocer-nz-data-audit.md) (confidence: Medium). Would need: defensible basket design, regional coverage, date-refresh discipline, and data-rights clearance.

## Where this is heading

> **TODO(steward): direction decision** — go deeper / pivot / proceed / park.

Signal: the evidence is now broader than one suburb, but still not a national audit based on what people actually buy.
Signal: the two blockers for public product-level examples — data permission and captured shelf claims — now each have a mapped path, but neither the permission ask nor a field pilot has been carried out.
Signal: the most defensible near-term outputs are education and method/evidence packs, not breach allegations.

## Feedback log

Feedback from people who know this domain — captured here so it steers the work:

| Date | Who (role, not name if private) | What they said | What we did |
|---|---|---|---|
|  |  |  |  |
