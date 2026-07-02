---
title: "Supermarket reference-pricing analysis should report evidence thresholds, not retailer intent"
domain: "other"
issue: "#75"
confidence: "High"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-02"
status: "draft"
---

# Supermarket reference-pricing analysis should report evidence thresholds, not retailer intent

## Executive answer

- This project should measure supermarket reference-pricing and promotion-cycle patterns as observable price-history signals, not as claims about a retailer's motive or legal breach. New Zealand's Fair Trading Act prohibits misleading or deceptive conduct, unsubstantiated representations, and false or misleading price representations, but whether a specific promotion breaches the Act is a legal/regulatory conclusion. [Fair Trading Act 1986, ss 9, 12A, 13](https://www.legislation.govt.nz/act/public/1986/121/en/latest/); [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)
- Use the Commerce Commission's own pricing concepts as the measurement frame: compare advertised discount, "was", "usual", "normal" or "everyday" prices against recent actual prices; treat continual promotional pricing as evidence that the promotional price may have become the usual selling price; and avoid claiming a saving from an older higher price when a more recent lower price exists. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)
- The core metrics should be: reference-price support days, current-price support days, immediate prior price, lowest and modal prices in the lookback window, promotion-duty cycle, spike-to-promotion sequence, and percent difference between the advertised "now" price and the pre-spike usual-price proxy. These metrics map directly to the available grocer-nz fields: current per-store `original_price_cent`, `sale_price_cent`, `club_price_cent`, `online_price_cent`, multibuy fields, and history rows with `updated_at`, `store_id`, and `price_cent`. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)
- Minimum publication standard: never publish a named retailer/product/store/date example unless the project has a captured shelf or online representation, matching grocer-nz history for the same product and store, at least 90 days of lookback coverage before the representation, and a plain-language caveat that the finding is a possible reference-pricing pattern, not an allegation of intent or a legal finding. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/); [Consumer Protection, misleading prices or advertising](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising)

**Overall confidence:** High - the legal framing is supported by current NZ legislation and official regulator guidance, and the data-method recommendations are constrained to fields the grocer-nz tool documents and live smoke checks confirmed on 2 July 2026.

## Evidence

### Legal and publication frame

The Fair Trading Act 1986 says a person must not, in trade, engage in conduct that is misleading or deceptive or likely to mislead or deceive, must not make an unsubstantiated representation, and must not make a false or misleading representation with respect to the price of goods or services. [Fair Trading Act 1986, ss 9, 12A, 13](https://www.legislation.govt.nz/act/public/1986/121/en/latest/)

The Commerce Commission says price representations must be clear, accurate and unambiguous; its discount guidance says a business may mislead consumers if it never charged the claimed usual price, deliberately inflates the usual price, uses a claimed usual price that is one of many common selling prices, or relies on a claimed usual price that is out of date or rarely real. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)

The Commission's same page says that, if businesses routinely sell products at a promotional price, the promotional price becomes the usual selling price; it also says a "was $15 now $10" comparison may be misleading if the product was more recently offered for $12. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)

MBIE's Consumer Protection guidance says New Zealand businesses are free to set prices and that increasing prices above previous levels is not itself illegal, while the Fair Trading Act still prohibits misleading and deceptive conduct and false representations. [Consumer Protection, misleading prices or advertising](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising)

For this project, that means the defensible unit of analysis is an evidence-backed statement such as "the displayed 'was' price had limited support in the available history window" or "the 'now' price exceeded the modal pre-spike price", not "the retailer inflated the price to mislead shoppers". [Fair Trading Act 1986, ss 9, 12A, 13](https://www.legislation.govt.nz/act/public/1986/121/en/latest/); [Commerce Commission, misleading-pricing open letter](https://www.comcom.govt.nz/assets/pdf_file/0019/90073/Misleading-pricing-An-open-letter-to-New-Zealand-retailers-11-May-2017.pdf)

### Data frame

The grocer-nz skill is documented as a read-only query tool for public grocer.nz supermarket data, including store lookup, product search, current per-store prices, and historical per-product price rows for New Zealand grocery retailers. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

The documented current-price fields are `updated_at`, `store_id`, `product_id`, `original_price_cent`, `sale_price_cent`, `club_price_cent`, `online_price_cent`, and multibuy fields; the documented history fields are `updated_at`, `store_id`, and `price_cent`, with prices stored in New Zealand cents. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

The documented history schema is leaner than the current-price schema, so history alone cannot prove whether an earlier row was a shelf "original", sale, club, online, or multibuy price unless another captured representation or source records that status. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

I ran live smoke checks on 2 July 2026 in an isolated Python virtual environment because the host had neither `duckdb` nor `uv` available for the documented bootstrap path. The checks returned Papakura store rows, current price rows for product 5461, and history rows for product 5461 with the documented fields, but those rows are only a schema/availability check and should not be treated as a published product example. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

### Proposed metrics

Use `effective_price_cent` only for shopper-cost analysis, and use the component price fields for promotion analysis. The grocer-nz documentation says its effective price is a conservative minimum of original, sale, club, and online prices, while multibuy needs human interpretation because quantity matters. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

For a captured promotion on product `p`, store `s`, and representation date `t`, calculate these metrics over 30, 60, 90, and 180 calendar-day lookback windows when coverage permits:

- **Coverage:** number of distinct observation days, longest gap, first observation date, last observation date, and whether the observation cadence changed materially. This is required because grocer-nz warns that historical availability varies by product and store. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)
- **Immediate prior price:** the last observed history price before `t`; this tests the Commerce Commission's example that an older "was" price may mislead if a lower price was offered more recently. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)
- **Usual-price proxy:** modal price, median price, and days-at-price distribution in the lookback window; no single statistic should be called "the usual price" unless the days-at-price distribution is shown. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)
- **Reference-price support:** number and share of observed days in the lookback window at the displayed "was"/"usual"/"normal"/"everyday" price, plus whether those days occurred recently or only early in the window. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)
- **Promotion-duty cycle:** number and share of observed days in the lookback window at or below the advertised "now" price; if that share is high, the case should be labelled as a continual-promotion signal rather than a one-off discount signal. [Commerce Commission, misleading-pricing open letter](https://www.comcom.govt.nz/assets/pdf_file/0019/90073/Misleading-pricing-An-open-letter-to-New-Zealand-retailers-11-May-2017.pdf)
- **Spike-to-promotion sequence:** whether the price rose by at least 10%, stayed high for 7 to 35 days, and was then advertised as a discount or "special" at a price equal to or above the prior usual-price proxy. The 10% and 7-to-35-day thresholds are project screening thresholds, not New Zealand legal thresholds; they are inspired by the ACCC's supermarket proceedings, which alleged at least 15% increases after long regular-price periods and short later price-spike periods in Australian cases. [ACCC, Coles/Woolworths proceedings media release](https://www.accc.gov.au/media-release/accc-takes-woolworths-and-coles-to-court-over-alleged-misleading-prices-dropped-and-down-down-claims)
- **Saving gap:** advertised saving versus saving measured from the immediate prior price, modal lookback price, and lowest recent non-promotion price; if the "now" price is higher than the modal pre-spike price, say so without asserting why. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/); [ACCC, Coles/Woolworths proceedings media release](https://www.accc.gov.au/media-release/accc-takes-woolworths-and-coles-to-court-over-alleged-misleading-prices-dropped-and-down-down-claims)

### Evidence thresholds and confidence labels

Use three internal evidence levels before publication:

| Level | Required evidence | Allowed wording | Not allowed |
|---|---|---|---|
| Screening signal | At least 30 observed days in the prior 60 days for the same product and store, with a price pattern matching one metric above. | "This product/store has a price-history signal worth review." | Naming the retailer publicly or implying misleading conduct. |
| Review-ready pattern | At least 90 observed days in the prior 120 days; no unexplained gap longer than 14 days; same-store product identity checked; current representation captured; metrics reproduced by a second reviewer or script. | "The available history is consistent with a possible reference-pricing or continual-promotion pattern." | "Fake discount", "inflated was price", or claims about intent. |
| Publication-ready example | Review-ready evidence plus a saved screenshot/photo or archived page of the displayed claim, exact product/store/date, component current-price fields where relevant, stated limitations, and legal-sensitivity review by a human. | "On [date], this captured representation said X; in grocer-nz history, Y of Z observed days in the prior window were at the displayed reference price." | Any statement that the retailer breached the Fair Trading Act unless a regulator or court has made that finding. |

Overall confidence for a published example should be **High** only when the display claim is captured, the same product and store are unambiguous, there are at least 120 observed days across a 180-day lookback, the pattern is robust under 60/90/180-day windows, and the finding has two-source support where a factual claim is load-bearing. [The For Good Project, CONTRIBUTING.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/CONTRIBUTING.md); [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)

Overall confidence should be **Medium** when the exact product/store/date and price history are clear but the captured representation is incomplete, the lookback is 60 to 119 observed days, or the result is sensitive to a single window choice. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

Overall confidence should be **Low** when the pattern comes from history alone, product identity could have changed through redirects or packaging changes, the history has large gaps, or the only evidence is a current "special" field without a saved consumer-facing representation. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

### Date-window rules

Use the representation date as the anchor date because the Fair Trading Act's unsubstantiated-representation rule turns on whether a representation had reasonable grounds when it was made. [Fair Trading Act 1986, s 12A](https://www.legislation.govt.nz/act/public/1986/121/en/latest/)

The default lookback should be 90 days because it is long enough to distinguish a one-week special from a repeated cycle but short enough to remain relevant to current grocery prices; report 30, 60, and 180-day sensitivity windows when coverage exists, and do not claim a "usual" price if the conclusion flips across windows. This 90-day default is a project rule rather than a regulator-stated legal safe harbour; I did not find a current NZ regulator rule that defines a fixed number of days required to establish a "usual" supermarket price. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)

For short-lived price increases, flag a screening signal only when all of these are true: the pre-increase price was the modal observed price for at least 30 observed days in the prior 90 days; the higher price lasted 7 to 35 days; the later promoted price was equal to or above the pre-increase modal price; and there is a captured representation using a discount, special, "was/now", "prices dropped", or equivalent value-impression claim. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/); [ACCC, Coles/Woolworths proceedings media release](https://www.accc.gov.au/media-release/accc-takes-woolworths-and-coles-to-court-over-alleged-misleading-prices-dropped-and-down-down-claims)

For continual-promotion patterns, flag a screening signal only when the product was at or below the advertised "now"/"special" price on more than 50% of observed days in the prior 90 days, or when repeated promotions leave fewer than 21 observed non-promotion days in the prior 90 days. These are project thresholds designed to operationalise the Commerce Commission's statement that a routinely promotional price can become the usual selling price, not a legal threshold. [Commerce Commission, misleading-pricing open letter](https://www.comcom.govt.nz/assets/pdf_file/0019/90073/Misleading-pricing-An-open-letter-to-New-Zealand-retailers-11-May-2017.pdf)

### Publication standard for exact examples

Each exact example should publish a compact evidence table with: product name, brand, size, grocer product ID, store ID, store name, retailer banner, representation date and capture URL or image filename, displayed claim, current component prices on the capture date, history coverage, immediate prior price, modal 90-day price, days at displayed reference price, days at advertised now price, and sensitivity result across 30/60/90/180-day windows. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md); [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)

Before naming a retailer, require a second reviewer to reproduce the metrics from raw data or saved extracts, check that the exact product/store/date match the captured representation, and remove words that imply motive unless there is public regulator or court evidence for that motive. The ACCC's Australian proceedings show why this distinction matters: the ACCC used compulsory powers and pleaded allegations about planned temporary price spikes, but this project will not have those powers or internal retailer documents. [ACCC, supermarket inquiry page](https://www.accc.gov.au/inquiries-and-consultations/finalised-inquiries-and-monitoring/supermarkets-inquiry-2024-25); [ACCC, Coles/Woolworths proceedings media release](https://www.accc.gov.au/media-release/accc-takes-woolworths-and-coles-to-court-over-alleged-misleading-prices-dropped-and-down-down-claims)

Use neutral captions such as "possible reference-pricing signal", "limited support for displayed reference price in available history", "short-lived increase before promotion", or "promotion-cycle pattern". Avoid captions such as "fake special", "price gouging", "deceptive", "bait", "inflated was price", or "misleading pricing" unless quoting a regulator, court, or the retailer's own words. [Fair Trading Act 1986, ss 9, 13](https://www.legislation.govt.nz/act/public/1986/121/en/latest/); [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| A retailer's price increase is not automatically unlawful in New Zealand, so this project must not treat price rises alone as misconduct. | [Consumer Protection: price increases](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising) | [Fair Trading Act 1986: focuses on misleading conduct, unsubstantiated representations, and false or misleading price representations](https://www.legislation.govt.nz/act/public/1986/121/en/latest/) | High |
| A "usual", "was", "normal" or "everyday" price can be misleading if it was never charged, rarely real, out of date, deliberately inflated, or only one of many common prices. | [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/) | [Commerce Commission misleading-pricing open letter](https://www.comcom.govt.nz/assets/pdf_file/0019/90073/Misleading-pricing-An-open-letter-to-New-Zealand-retailers-11-May-2017.pdf) | High |
| grocer-nz history is enough to detect price-pattern signals but not enough by itself to prove what a shelf ticket represented, because historical rows are lean and may only include date, store, and price. | [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md) | [grocer-nz API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md) | High |
| The 90-day default, 50% promotion-duty-cycle threshold, and 7-to-35-day spike window are project rules for conservative screening, not NZ regulator safe harbours. | [Commerce Commission pricing guidance: no fixed day threshold found](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/) | [ACCC proceedings: analogous Australian allegations used specific long regular-price periods, short spike periods, and at least 15% increases](https://www.accc.gov.au/media-release/accc-takes-woolworths-and-coles-to-court-over-alleged-misleading-prices-dropped-and-down-down-claims) | Medium |
| Australian ACCC supermarket material is useful for method design but should not be cited as New Zealand law. | [ACCC supermarket inquiry page: Australian inquiry under Australian law](https://www.accc.gov.au/inquiries-and-consultations/finalised-inquiries-and-monitoring/supermarkets-inquiry-2024-25) | [Fair Trading Act 1986: New Zealand statute](https://www.legislation.govt.nz/act/public/1986/121/en/latest/) | High |

## What would change this conclusion

- A new Commerce Commission or MBIE guidance note that defines fixed day-count rules for "usual", "was", "normal", "everyday", "special", or supermarket reference prices would replace the project thresholds above.
- A court decision or Commerce Commission enforcement outcome on New Zealand supermarket "was/now" or promotional-cycle claims would provide a stronger local benchmark than the Australian ACCC comparison.
- Direct retailer records, supplier funding records, or regulator findings could support stronger statements about intent or planning, but this project should not infer those matters from public price history alone.
- Better data that preserves historical `original_price_cent`, `sale_price_cent`, `club_price_cent`, `online_price_cent`, multibuy status, shelf-ticket text, and page captures for every observation would allow more precise separation between ordinary price changes, sales, loyalty pricing, and multibuy promotions.
- I could not verify grocer.nz's full historical coverage, update frequency, product-retirement behaviour, or redistribution terms from the skill documentation alone. A separate data-coverage and terms finding should resolve those questions before bulk publication.
- This finding is not legal advice. A lawyer or the Commerce Commission should review any external publication that names a retailer and discusses possible Fair Trading Act implications.

## Open follow-up questions

- What is the actual product/store/date coverage, update cadence, and missingness profile of grocer-nz history across Woolworths, New World, PAK'nSAVE, Fresh Choice, Super Value, and The Warehouse?
- What are grocer.nz's and the retailers' terms for republishing derived price-history tables, screenshots, or store/product examples?
- How often do the proposed screening metrics flag stable price cycles in a representative basket, and what false-positive rate appears after human review?
- What screenshot/archive workflow can reliably preserve shelf or online representations without collecting personal data or breaching website terms?

## Sources

1. Commerce Commission. "Pricing your products or services." Accessed 2 July 2026. https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/
2. Commerce Commission. "Misleading pricing: An open letter to New Zealand retailers." 11 May 2017. Accessed 2 July 2026. https://www.comcom.govt.nz/assets/pdf_file/0019/90073/Misleading-pricing-An-open-letter-to-New-Zealand-retailers-11-May-2017.pdf
3. Consumer Protection. "Misleading prices or advertising." Accessed 2 July 2026. https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising
4. Consumer Protection. "Fair Trading Act." Accessed 2 July 2026. https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act
5. New Zealand Legislation. "Fair Trading Act 1986." Accessed 2 July 2026. https://www.legislation.govt.nz/act/public/1986/121/en/latest/
6. The Colab AI .skills. "grocer-nz SKILL.md." Accessed 2 July 2026. https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md
7. The Colab AI .skills. "grocer-nz API / asset notes." Accessed 2 July 2026. https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md
8. Australian Competition and Consumer Commission. "ACCC takes Woolworths and Coles to court over alleged misleading 'Prices Dropped' and 'Down Down' claims." 23 September 2024. Accessed 2 July 2026. https://www.accc.gov.au/media-release/accc-takes-woolworths-and-coles-to-court-over-alleged-misleading-prices-dropped-and-down-down-claims
9. Australian Competition and Consumer Commission. "Supermarkets inquiry 2024-25." Accessed 2 July 2026. https://www.accc.gov.au/inquiries-and-consultations/finalised-inquiries-and-monitoring/supermarkets-inquiry-2024-25
