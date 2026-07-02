---
title: "NZ grocery shopper tools already compare prices, but not regulator-ready promotion evidence"
domain: "other"
issue: "#77"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-02"
status: "draft"
---

# NZ grocery shopper tools already compare prices, but not regulator-ready promotion evidence

## Executive answer

- Existing NZ shopper tools already cover the obvious consumer job: compare current prices across supermarkets, build shopping lists or baskets, and, in Grocer, Grosave and Price Pulse, show some product price history. [Consumer NZ, 2025](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand); [Grocer on Google Play, 2025](https://play.google.com/store/apps/details?hl=en_US&id=nz.grocer.twa); [Grosave, 2026](https://grosave.co.nz/); [PricePulse, 2026](https://www.pricepulse.co.nz/)
- Retailer apps already handle the retailer-owned workflow: online ordering, current specials, loyalty offers, receipts or past orders, store-specific lists, and in-store product location, but I did not find retailer-provided price-history or cross-retailer comparison in the public app listings. [Woolworths NZ on Google Play, 2025](https://play.google.com/store/apps/details?hl=en_CA&id=nz.co.countdown.android.pickup); [New World app, 2026](https://www.newworld.co.nz/app); [PAK'nSAVE on Google Play, 2026](https://play.google.com/store/apps/details?hl=en_US&id=nz.co.paknsave.app)
- The gap for The For Good Project is not another shopping-list app. The smallest useful public-interest artifact is a transparent, citable education-and-evidence layer: explain promotion/reference-price mechanics, publish a defensible method, show selected price histories in plain language, and export evidence packs suitable for complaints, journalism, or regulator triage. [Commerce Commission, Grocery](https://www.comcom.govt.nz/regulated-industries/grocery/); [Commerce Commission, Annual Grocery Report 2025](https://www.comcom.govt.nz/assets/Uploads/Annual-Grocery-Report-2025-2-June-2026.pdf)
- Exportability, data provenance, accessibility, and methodology remain weakly evidenced in public materials. I found public claims of price history and daily/current price collection, and the vendored `grocer-nz` skill documents public Grocer assets for current prices and price-history parquet files, but I did not find a public CSV/API/export feature, WCAG statement, or published matching methodology for the shopper tools. [Grocer skill documentation, 2026](https://github.com/thecolab-ai/.skills/blob/aa2b19e02c2f8345bb0ab4dcaec99fb8cd0babf5/skills/grocer-nz/SKILL.md); [PricePulse, 2026](https://www.pricepulse.co.nz/); [Grosave on Google Play, 2026](https://play.google.com/store/apps/details?hl=en_US&id=nz.co.grosave.twa)
- Regulator need is real: the Commerce Commission says grocery work includes pricing and promotional transparency, its 2025 Annual Grocery Report says regulated grocery retailers must disclose store-level complaint/refund data for price-integrity, promotional-error and unit-pricing issues, and it says Woolworths plus two Pak'nSave stores face ongoing Fair Trading Act charges over alleged pricing inaccuracies and misleading specials. [Commerce Commission, Grocery](https://www.comcom.govt.nz/regulated-industries/grocery/); [Commerce Commission, Annual Grocery Report 2025](https://www.comcom.govt.nz/assets/Uploads/Annual-Grocery-Report-2025-2-June-2026.pdf)

**Overall confidence:** Medium - public sources consistently show current comparison and some price-history features, and official sources clearly show a regulator transparency focus. Confidence is lower on exportability, accessibility, and data provenance because several tools are dynamic apps and I did not create accounts or inspect private screens.

## Evidence

### What current comparison tools already show

Consumer NZ's December 2025 comparison covers Grocer.nz, Grosave and Price Pulse, and says all three are intended to help shoppers save money by comparing supermarket prices. [Consumer NZ, 2025](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand)

Grocer is a web/app price-comparison tool for major NZ supermarkets; its Google Play listing says it compares prices across multiple stores, shows price history over time, manages shopping lists across devices, and lets users select preferred stores. [Grocer on Google Play, 2025](https://play.google.com/store/apps/details?hl=en_US&id=nz.grocer.twa)

Consumer NZ says Grocer's free tier is limited to one shopping list, six supermarket comparisons and three months of price comparison history, while its paid Pro subscription extends this to multiple shopping lists, 30 supermarket comparisons and unlimited price history. [Consumer NZ, 2025](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand)

The Colab's vendored `grocer-nz` skill documents that Grocer exposes public static assets including a base DuckDB catalogue, per-store current price parquet files, per-product price-history parquet files, and a frontend Meilisearch product index. [Grocer skill documentation, 2026](https://github.com/thecolab-ai/.skills/blob/aa2b19e02c2f8345bb0ab4dcaec99fb8cd0babf5/skills/grocer-nz/SKILL.md)

Grosave describes itself as a grocery shopping platform that compares food prices across supermarkets, compares entire shopping lists, shows product price history, syncs lists across devices, finds nearby deals, and sends price-drop notifications. [Grosave, 2026](https://grosave.co.nz/)

Grosave's Google Play listing separately lists price goals/alerts, a product "History" tab, and cloud sync for lists and preferences. [Grosave on Google Play, 2026](https://play.google.com/store/apps/details?hl=en_US&id=nz.co.grosave.twa)

Consumer NZ says Grosave is free, has an in-built map to narrow supermarket selections, sends notifications for price drops on chosen items, and uses percentages to show how much a product has been discounted. [Consumer NZ, 2025](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand)

PricePulse describes itself as a free browser extension that compares prices across major NZ supermarkets, works while a shopper browses supermarket websites, shows how today's price compares with historical data and competing stores, compares basket costs, and uses colour-coded indicators for whether a price is a good deal or overpriced. [PricePulse, 2026](https://www.pricepulse.co.nz/)

Consumer NZ says Price Pulse is online-only, has no app, supports the three main supermarkets, provides detailed information about every product in a basket, includes a six-month price history, and is best suited to people shopping online rather than in-store. [Consumer NZ, 2025](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand)

PricePulse's own site says it collects fresh price data daily from every NZ supermarket, but I found that as a vendor claim rather than an independently audited provenance statement. [PricePulse, 2026](https://www.pricepulse.co.nz/)

### What retailer apps already show

Woolworths NZ's public app listing says its app supports online shopping, weekly specials, in-store shopping lists, product location, pick-up and delivery order management, Everyday Rewards scanning, points/vouchers, personalised Boost offers, and in-store receipts when shopping with Everyday Rewards. [Woolworths NZ on Google Play, 2025](https://play.google.com/store/apps/details?hl=en_CA&id=nz.co.countdown.android.pickup)

New World says its app supports online shopping, Club+ bonus offers and games, digital Club+ card scanning, Club+ rewards and savings visibility, product scanning into cart/list, past online and in-store orders, multiple shopping lists, recipes, latest specials, Everyday Low Price ranges, and directions to more than 140 stores. [New World app, 2026](https://www.newworld.co.nz/app)

PAK'nSAVE's public app listing says its app lets users browse products, build a shopping list, place a click-and-collect order, create/save/share multiple shopping lists, view latest deals and low prices from their local store, and scan a digital Club+ card. [PAK'nSAVE on Google Play, 2026](https://play.google.com/store/apps/details?hl=en_US&id=nz.co.paknsave.app)

I found no public retailer-app listing that claimed cross-retailer price comparison or product-level price history. [Woolworths NZ on Google Play, 2025](https://play.google.com/store/apps/details?hl=en_CA&id=nz.co.countdown.android.pickup); [New World app, 2026](https://www.newworld.co.nz/app); [PAK'nSAVE on Google Play, 2026](https://play.google.com/store/apps/details?hl=en_US&id=nz.co.paknsave.app)

### What public education and regulation already cover

Consumer Protection explains unit pricing as a way to compare the same item across sizes and packaging, says the Fair Trading Act requires many grocery items to show unit price alongside total price, and says sale or club/member deals must display a unit price. [Consumer Protection, 2026](https://www.consumerprotection.govt.nz/general-help/guide-to-buying-smart/saving-at-the-supermarket-with-unit-prices)

New World's unit-pricing explainer says unit pricing began appearing in stores from 31 August 2024 and is required online for regulated grocery products from 31 August 2025, and it gives examples for comparing promotional and non-promotional prices, bulk bins, fresh/frozen products, and convenience formats. [New World, Unit Pricing](https://www.newworld.co.nz/unitpricing)

The Commerce Commission says its grocery regulatory work includes creating pricing and promotional transparency for consumers, supply-code rules, wholesale access, monitoring grocery competition, and taking action on non-compliance under the Grocery Industry Competition Act, Fair Trading Act, and Commerce Act. [Commerce Commission, Grocery](https://www.comcom.govt.nz/regulated-industries/grocery/)

The Commerce Commission's 2025 Annual Grocery Report says the major grocery retailers' combined national market share remained 82% in 2025 and says the industry remains highly concentrated, which matters because transparency tools operate in a market the regulator does not consider strongly competitive. [Commerce Commission, Annual Grocery Report 2025](https://www.comcom.govt.nz/assets/Uploads/Annual-Grocery-Report-2025-2-June-2026.pdf)

The same report says regulatory changes include mandated display of clear unit pricing in-store and online, plus a Consumer Complaints Disclosure Standard requiring publication/display of refund policies and disclosure of price-integrity issues, promotional errors, and unit-pricing issues to the Commission. [Commerce Commission, Annual Grocery Report 2025](https://www.comcom.govt.nz/assets/Uploads/Annual-Grocery-Report-2025-2-June-2026.pdf)

The 2025 Annual Grocery Report says the Disclosure Standard requires all three regulated grocery retailers to provide disaggregated store-level complaint/refund data every six months on the number of complaints and number/value of refunds, and to publish price-integrity refund policies online, provide them to the Commission, and display one-page summaries in stores. [Commerce Commission, Annual Grocery Report 2025](https://www.comcom.govt.nz/assets/Uploads/Annual-Grocery-Report-2025-2-June-2026.pdf)

The 2025 Annual Grocery Report says two Pak'nSave stores and Woolworths face ongoing Fair Trading Act criminal charges for alleged pricing inaccuracies and misleading specials. [Commerce Commission, Annual Grocery Report 2025](https://www.comcom.govt.nz/assets/Uploads/Annual-Grocery-Report-2025-2-June-2026.pdf)

Consumer NZ's supermarket campaign timeline says it lodged a complaint with the Commerce Commission in August 2023 about potential Fair Trading Act breaches by the major supermarkets and says the Commission opened an investigation into Woolworths, Foodstuffs North Island and Foodstuffs South Island in January 2024. [Consumer NZ, Stop misleading supermarket pricing](https://campaigns.consumer.org.nz/supermarkets)

Stats NZ's Food Price Index material says the FPI measures changes in food prices faced by households over time and that food is the only CPI commodity group with a monthly index, which makes it useful as an aggregate baseline but not a shelf-level product/store history. [Stats NZ DataInfo+, Food Price Index](https://datainfoplus.stats.govt.nz/item/nz.govt.stats/749d8c27-1bed-45fb-b941-a1905aee632f)

### Feature comparison against the issue dimensions

| Dimension | What existing tools show | Remaining gap for a public-interest artifact | Confidence |
|---|---|---|---|
| Current price comparison | Grocer, Grosave and PricePulse all publicly claim cross-supermarket comparison; retailer apps expose their own current prices/specials, not cross-retailer comparison. [Consumer NZ, 2025](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand); [Woolworths NZ on Google Play, 2025](https://play.google.com/store/apps/details?hl=en_CA&id=nz.co.countdown.android.pickup) | Do not duplicate basic comparison; use comparison only as context for education/evidence. | High |
| Price-history visibility | Grocer, Grosave and PricePulse all publicly claim product price history, with Consumer NZ saying Grocer's free history is limited to three months and Price Pulse shows six months. [Consumer NZ, 2025](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand); [Grosave on Google Play, 2026](https://play.google.com/store/apps/details?hl=en_US&id=nz.co.grosave.twa) | Translate history into defensible patterns: price-before-promo windows, recurring promo cycles, and examples that are safe to cite. | Medium |
| Exportability | I found no public CSV/API/export claim for Grocer, Grosave or PricePulse; the Grocer skill documents public parquet assets but not an end-user export function. [Grocer skill documentation, 2026](https://github.com/thecolab-ai/.skills/blob/aa2b19e02c2f8345bb0ab4dcaec99fb8cd0babf5/skills/grocer-nz/SKILL.md); [Grosave, 2026](https://grosave.co.nz/); [PricePulse, 2026](https://www.pricepulse.co.nz/) | Provide downloadable, limited, source-attributed evidence packs for selected products/baskets, with dates, store, product identifiers, observed price fields, and caveats. | Medium |
| Education content | Consumer Protection and retailers explain unit pricing; PricePulse uses deal ratings; Consumer NZ explains tool pros/cons. [Consumer Protection, 2026](https://www.consumerprotection.govt.nz/general-help/guide-to-buying-smart/saving-at-the-supermarket-with-unit-prices); [PricePulse, 2026](https://www.pricepulse.co.nz/); [Consumer NZ, 2025](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand) | Explain reference pricing, "was/now" baselines, sale-frequency patterns, loyalty prices, and how to avoid overclaiming intent. | High |
| Accessibility | Public listings show mobile apps, web tools and a browser extension; Grosave's own site requires sign-up to see more daily deals and Consumer NZ says its setup included an account plus a long tutorial. [Grosave, 2026](https://grosave.co.nz/); [Consumer NZ, 2025](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand) | Build a no-login, low-bandwidth, printable/plain-English layer; test with disabled users and households that do not shop online. | Low |
| Data provenance | Grocer's public asset structure is documented by the vendored skill; PricePulse says it collects daily data; Grosave says it accesses prices from all major NZ supermarkets. [Grocer skill documentation, 2026](https://github.com/thecolab-ai/.skills/blob/aa2b19e02c2f8345bb0ab4dcaec99fb8cd0babf5/skills/grocer-nz/SKILL.md); [PricePulse, 2026](https://www.pricepulse.co.nz/); [Grosave, 2026](https://grosave.co.nz/) | Publish a method page: source, fetch time, matching rules, missing-data handling, club/online/sale price handling, and redistribution limits. | Medium |
| Regulator usefulness | The Commission now receives price-integrity, promotional-error and unit-pricing complaint/refund disclosures from regulated retailers, and grocery enforcement remains an active area. [Commerce Commission, Annual Grocery Report 2025](https://www.comcom.govt.nz/assets/Uploads/Annual-Grocery-Report-2025-2-June-2026.pdf) | Produce examples and aggregate indicators that map to regulator categories without asserting breach, intent, or legal conclusions. | High |

### Smallest useful artifact

A public-interest artifact should be a methodology-led "grocery promotion transparency explainer and evidence sampler", not a general shopper app, because Grocer, Grosave, PricePulse and retailer apps already cover most personal-shopping workflows. [Consumer NZ, 2025](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand); [Woolworths NZ on Google Play, 2025](https://play.google.com/store/apps/details?hl=en_CA&id=nz.co.countdown.android.pickup); [New World app, 2026](https://www.newworld.co.nz/app); [PAK'nSAVE on Google Play, 2026](https://play.google.com/store/apps/details?hl=en_US&id=nz.co.paknsave.app)

The first version should use a small set of representative products and stores, show each product's observed price path, explain the relevant pricing concept, and label the confidence and caveats beside the chart, because the Commerce Commission is already focused on pricing/promotional transparency and Consumer Protection already frames unit pricing as a shopper-education issue. [Commerce Commission, Grocery](https://www.comcom.govt.nz/regulated-industries/grocery/); [Consumer Protection, 2026](https://www.consumerprotection.govt.nz/general-help/guide-to-buying-smart/saving-at-the-supermarket-with-unit-prices)

The artifact should avoid claims that a retailer "inflated" a price or ran a "fake special" unless the evidence includes exact product, store, dates, observed regular/promo/club prices, source, matching method, and legal review, because the Commission's current phrasing is about alleged pricing inaccuracies and misleading specials in ongoing matters. [Commerce Commission, Annual Grocery Report 2025](https://www.comcom.govt.nz/assets/Uploads/Annual-Grocery-Report-2025-2-June-2026.pdf)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| A new For Good artifact should not duplicate basic NZ grocery comparison, because several tools already compare stores and show at least some price history. | [Consumer NZ comparison of Grocer, Grosave and Price Pulse](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand) | [Grocer, Grosave and PricePulse public feature pages/listings](https://play.google.com/store/apps/details?hl=en_US&id=nz.grocer.twa); [Grosave](https://grosave.co.nz/); [PricePulse](https://www.pricepulse.co.nz/) | High |
| The live transparency gap is methodology/export/regulator evidence, not raw visibility that "prices differ". | [Commerce Commission says grocery work includes pricing and promotional transparency](https://www.comcom.govt.nz/regulated-industries/grocery/) | [2025 Annual Grocery Report says complaint/refund disclosure covers price-integrity, promotional-error and unit-pricing issues](https://www.comcom.govt.nz/assets/Uploads/Annual-Grocery-Report-2025-2-June-2026.pdf) | Medium |
| Price-history features exist, but public evidence of end-user exportability and audited provenance is thin. | [Consumer NZ says Grocer and Price Pulse have price-history limits/features](https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand) | [Grocer skill documents public data assets, while tool pages/listings do not advertise CSV/API export](https://github.com/thecolab-ai/.skills/blob/aa2b19e02c2f8345bb0ab4dcaec99fb8cd0babf5/skills/grocer-nz/SKILL.md) | Medium |
| Official NZ consumer education already covers unit pricing, so the missing education is more specific to promotion history and reference-price interpretation. | [Consumer Protection unit-pricing guide](https://www.consumerprotection.govt.nz/general-help/guide-to-buying-smart/saving-at-the-supermarket-with-unit-prices) | [New World unit-pricing explainer](https://www.newworld.co.nz/unitpricing) | High |
| Regulator relevance is not hypothetical: grocery pricing/promotional practices are an enforcement focus and some pricing/misleading-specials charges are ongoing. | [Commerce Commission grocery page names pricing and promotional practices as a priority](https://www.comcom.govt.nz/regulated-industries/grocery/) | [2025 Annual Grocery Report records ongoing Fair Trading Act charges over alleged pricing inaccuracies and misleading specials](https://www.comcom.govt.nz/assets/Uploads/Annual-Grocery-Report-2025-2-June-2026.pdf) | High |

## What would change this conclusion

- If Grocer, Grosave, PricePulse, a retailer, Consumer NZ, or the Commerce Commission publishes a free, no-login, exportable, methodology-led price-history and promotion-analysis tool, the "do not build another tool" conclusion would narrow further to partnership, critique, or accessibility.
- If a tool already has CSV/API export, source provenance, accessibility documentation, and regulator-ready evidence workflows behind account screens, this finding understates existing capability; I did not create accounts, subscribe to Grocer Pro, or install browser/mobile apps.
- If retailer terms or Grocer/Grosave/PricePulse terms prohibit republication of derived screenshots, datasets or price histories, a For Good artifact should publish methodology and small cited examples rather than redistributing bulk price data.
- I could not verify the exact product-matching method, update frequency, error rate, accessibility conformance, or full historical coverage for Grocer, Grosave or PricePulse from public pages alone.
- I could not verify whether PricePulse's claim that it collects fresh data daily from every NZ supermarket includes FreshChoice, SuperValue, The Warehouse, Costco or independent grocers; Consumer NZ says Price Pulse supports the three main supermarkets.
- A human with consumer-law expertise should review any public wording that could imply Fair Trading Act breach, retailer intent, or misleading conduct by a named store.
- A human accessibility review with disabled shoppers, older shoppers, and households that do not shop online would materially improve the accessibility conclusion.

## Open follow-up questions

- What are the legal and practical redistribution limits for using Grocer public assets, retailer public prices, screenshots, and derived price-history charts in a public-interest artifact?
- What exact method should define a "reference-price concern" in NZ grocery data without overclaiming intent or breach?
- Which products and store pairs would make a defensible representative sample for an initial household-facing explainer?
- What information would the Commerce Commission, Consumer NZ, or a newsroom need in an evidence pack to triage a pricing/promotion concern?
- How do low-income, disabled, rural, older, and offline shoppers actually use or avoid grocery comparison tools?

## Sources

1. Consumer NZ. "The 3 best grocery price comparison tools in New Zealand." Published 12 December 2025. Accessed 2 July 2026. https://www.consumer.org.nz/shopping/supermarkets/the-3-best-grocery-price-comparison-tools-in-new-zealand
2. Grocer. Google Play listing. Updated 21 December 2025. Accessed 2 July 2026. https://play.google.com/store/apps/details?hl=en_US&id=nz.grocer.twa
3. Grocer. Apple App Store listing. Version history accessed 2 July 2026. https://apps.apple.com/us/app/grocer/id1643813830
4. The Colab skills. "`grocer-nz` skill documentation." Commit `aa2b19e02c2f8345bb0ab4dcaec99fb8cd0babf5`. Accessed 2 July 2026. https://github.com/thecolab-ai/.skills/blob/aa2b19e02c2f8345bb0ab4dcaec99fb8cd0babf5/skills/grocer-nz/SKILL.md
5. Grosave. "Grocery Price Comparison App." Accessed 2 July 2026. https://grosave.co.nz/
6. Grosave. Google Play listing. Updated 27 March 2026. Accessed 2 July 2026. https://play.google.com/store/apps/details?hl=en_US&id=nz.co.grosave.twa
7. Grosave. Apple App Store listing. Accessed 2 July 2026. https://apps.apple.com/nz/app/grosave/id6502677163
8. PricePulse. "Never Overpay for Groceries Again." Accessed 2 July 2026. https://www.pricepulse.co.nz/
9. Woolworths NZ. Google Play listing. Updated 25 November 2025. Accessed 2 July 2026. https://play.google.com/store/apps/details?hl=en_CA&id=nz.co.countdown.android.pickup
10. Woolworths NZ. Apple App Store listing. Accessed 2 July 2026. https://apps.apple.com/nz/app/woolworths-nz/id1278164689
11. New World. "New World app." Accessed 2 July 2026. https://www.newworld.co.nz/app
12. New World. Google Play listing. Updated 20 June 2026. Accessed 2 July 2026. https://play.google.com/store/apps/details?hl=en_US&id=nz.co.newworld.clubcard
13. PAK'nSAVE. Google Play listing. Updated 20 June 2026. Accessed 2 July 2026. https://play.google.com/store/apps/details?hl=en_US&id=nz.co.paknsave.app
14. Consumer Protection. "Saving at the supermarket with unit prices." Accessed 2 July 2026. https://www.consumerprotection.govt.nz/general-help/guide-to-buying-smart/saving-at-the-supermarket-with-unit-prices
15. New World. "Understanding Unit Pricing." Accessed 2 July 2026. https://www.newworld.co.nz/unitpricing
16. Commerce Commission. "Grocery." Accessed 2 July 2026. https://www.comcom.govt.nz/regulated-industries/grocery/
17. Commerce Commission. "2025 Annual Grocery Report." Published 2 June 2026. Accessed 2 July 2026. https://www.comcom.govt.nz/assets/Uploads/Annual-Grocery-Report-2025-2-June-2026.pdf
18. Consumer NZ. "Stop misleading supermarket pricing." Accessed 2 July 2026. https://campaigns.consumer.org.nz/supermarkets
19. Stats NZ DataInfo+. "Food Price Index." Accessed 2 July 2026. https://datainfoplus.stats.govt.nz/item/nz.govt.stats/749d8c27-1bed-45fb-b941-a1905aee632f
