---
stream: 61
title: "Shoppers can't tell a real supermarket deal from a manufactured one"
state: awaiting-direction
steward: ""
domain: other
updated: 2026-07-03
image: /images/streams/stream-61-supermarket-pricing.jpg
---

<!--
The Stream Overview is written for someone who will NEVER touch GitHub or a CLI.
No jargon, no repo-speak, no issue numbers in the prose (link them instead).
Keep it under two screens — this is a briefing, not an archive.
-->

# Shoppers can't tell a real supermarket deal from a manufactured one

## The problem, in plain language

Food is one of the biggest costs in a New Zealand household budget, and food prices have kept rising. Official statistics show the national *trend*, but not what a shopper actually faces on the shelf: how a specific "special" changed over time, whether a "was" price was ever the real price, and how promotion cycles are timed. Without that, people can't tell a genuine saving from a manufactured one.

## What we've learned so far

- **This affects almost every household, not a niche group.** Food is about $300 a week — nearly a fifth of average household spending — and food prices rose 3.2% in the year to May 2026. (confidence: Medium) — [framing research](../research/findings/other/supermarket-transparency-framing.md)
- **The official numbers can't answer the shopper's question.** Stats NZ's food price indexes measure national price *change*, not the actual shelf price of a product in a store — Stats NZ itself warns against reading them that way. (confidence: High, per the finding) — [shelf prices vs official index](../research/findings/civic-transparency/grocery-shelf-prices-vs-fpi.md)
- **Real shelf prices can move differently from the national trend.** A small three-item test basket at two Papakura supermarkets got about 2.5% *cheaper* over a year in which the national food index rose 3.2% — mostly because one egg product fell in price. This proves the comparison method works; it says nothing about baskets in general. (confidence: Medium for the arithmetic, Low for any generalisation) — [shelf prices vs official index](../research/findings/civic-transparency/grocery-shelf-prices-vs-fpi.md)
- **The shelf-level data we'd need exists and is publicly reachable.** A community price-tracking service (Grocer) publishes current prices for ~465 stores and ~109,000 products across the major chains, with price history reaching back to 2022 for some products — though history depth varies a lot by product. (confidence: Medium) — [data audit](../research/findings/other/grocer-nz-data-audit.md)
- **But we don't have the right to republish that data in bulk.** Grocer's terms grant no redistribution licence, supermarket terms restrict copying, and the conservative position is: publish analysis, methods and small cited examples — never bulk data — pending legal review. (confidence: Medium-Low) — [data audit](../research/findings/other/grocer-nz-data-audit.md)
- **Misleading pricing is already illegal, and enforcement is live.** The Fair Trading Act prohibits false or misleading price claims, a "was/now" comparison can mislead if the "was" price was inflated, stale or rarely charged, and major supermarkets currently face criminal charges over alleged pricing inaccuracies and misleading specials. A price *rise* on its own is lawful. (confidence: High) — [pricing law map](../research/findings/other/nz-supermarket-pricing-law.md)
- **Supermarkets now have specific, measurable price-display duties.** Larger grocery retailers must show clear, legible unit prices (price per litre, per 100g, etc.) in store since August 2024 and online since August 2025 — a concrete standard shoppers can be taught to use, enforced under the same law. (confidence: High) — [pricing law map](../research/findings/other/nz-supermarket-pricing-law.md)
- **There is a defensible way to measure "suspicious" promotions without accusing anyone.** A drafted method turns regulator guidance into measurable signals (how often was the "was" price actually charged? is the product on "special" most of the time?), with strict evidence thresholds before any retailer is ever named — though its specific numeric thresholds are untested project assumptions. (confidence: Medium) — [measurement method](../research/findings/other/supermarket-pricing-method.md)
- **Another price-comparison app is not the gap.** Three tools (Grocer, Grosave, Price Pulse) plus the supermarkets' own apps already compare prices and show some history. What's missing is a no-login, plain-English, citable layer: education on promotion mechanics and evidence packs usable by regulators, journalists or complainants. (confidence: Medium) — [tool gap analysis](../research/findings/other/supermarket-tool-transparency-gap.md)
- **There is a plausible regulator route for this kind of evidence.** The Grocery Commissioner's remit includes pricing and promotional transparency, and a new disclosure standard makes supermarkets report pricing-integrity and promotional-error complaints from 2026. (confidence: Medium — regulator focus is well evidenced; that they'd *use* our work is untested) — [tool gap analysis](../research/findings/other/supermarket-tool-transparency-gap.md), [pricing law map](../research/findings/other/nz-supermarket-pricing-law.md)

## What we're not sure about yet

- **How prevalent inflated "was/now" or continual-promotion patterns actually are.** Nobody has run the measurement method against real data yet — we have a method and a data source, but zero measured examples.
- **Whether we may publish anything derived from Grocer's data.** The no-bulk-republication conclusion is a conservative non-lawyer reading (Medium-Low confidence, single finding); no lawyer has reviewed it and Grocer has not been asked for permission. This blocks most public-facing options below.
- **Whether the data is dense enough to be defensible.** History depth varies wildly by product (four years for one milk product, weeks for seasonal items), some historical prices can't be matched to a named store, and history rows don't record whether a price was a shelf, online, or loyalty price. The method's evidence thresholds are also uncalibrated guesses.
- **A gap between two findings on data status:** the data audit treats Grocer's public files as directly verified evidence, while the tool-gap finding cautions they're documented only by our own toolkit, not an independent audit. Both agree the files exist; they weight the reliability differently.
- **What real households actually need.** No shoppers, regulators, retailers, or Grocer itself have been spoken to; how low-income, older, rural or offline shoppers use (or avoid) these tools is unknown.
- **The regulator route is plausible but unproven** — no evidence yet that the Commerce Commission would accept or act on an outside evidence pack.

## What we could do about it

- **Run the measurement method on real data (internal study, nothing published).** Calibrate the promotion-pattern signals against a representative basket and report how common suspicious patterns look, with false-positive checks. Helps: the stream itself — it converts a method into actual evidence. Effort: Medium. Supported by [measurement method](../research/findings/other/supermarket-pricing-method.md) (Medium) and [data audit](../research/findings/other/grocer-nz-data-audit.md) (Medium). Would need: enough dense product histories, and acceptance that results stay internal until rights/legal questions are resolved.
- **A plain-English education explainer on supermarket promotion mechanics.** Teach shoppers how "was/now" pricing, loyalty prices, multibuys and promo cycles work and what the law requires, citing official sources and only small quoted price examples. Helps: households trying to spot a real deal. Effort: Small–Medium. Supported by [tool gap analysis](../research/findings/other/supermarket-tool-transparency-gap.md) (High for the education gap) and [pricing law map](../research/findings/other/nz-supermarket-pricing-law.md) (High). Would need: consumer-law review of wording, and care to stay within the small-cited-examples limit from the [data audit](../research/findings/other/grocer-nz-data-audit.md) (Medium-Low on rights).
- **A resolution of the data-rights question first.** Ask Grocer for written permission (and/or get a legal opinion) before any public artifact that uses its data. Helps: every other option — it's the common blocker. Effort: Small in volunteer time, but depends on outside parties. Supported by [data audit](../research/findings/other/grocer-nz-data-audit.md) (Medium-Low) and [measurement method](../research/findings/other/supermarket-pricing-method.md) (Medium). Would need: a contactable, willing counterparty at Grocer, or pro-bono legal help.
- **A 2-page brief for the Grocery Commissioner on the shelf-vs-index transparency gap.** Present the method, the basket-vs-index demonstration, and the tool gap, mapped to the regulator's own complaint categories — evidence and method only, no breach allegations. Helps: the regulator's stated transparency work; indirectly all shoppers. Effort: Medium. Supported by [pricing law map](../research/findings/other/nz-supermarket-pricing-law.md) (High), [shelf prices vs official index](../research/findings/civic-transparency/grocery-shelf-prices-vs-fpi.md) (Medium), and [tool gap analysis](../research/findings/other/supermarket-tool-transparency-gap.md) (Medium). Would need: at least one calibrated result worth briefing, and honesty that regulator uptake is untested.

## Where this is heading

> **TODO(steward): direction decision** — go deeper / pivot / proceed / park.

Signal: every public-facing option is gated on the unresolved data-rights question — resolving it (or deciding to work regulator-/education-only) unblocks the rest.
Signal: the method exists but has produced zero measured examples; prevalence is the biggest evidence gap.
Signal: no human voices yet — no shoppers, regulator, or Grocer contact has informed the stream.

## Feedback log

Feedback from people who know this domain — captured here so it steers the work:

| Date | Who (role, not name if private) | What they said | What we did |
|---|---|---|---|
|  |  |  |  |
