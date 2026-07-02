---
title: "Evidence-threshold method for supermarket reference-pricing"
domain: "other"
issue: "#75"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-02"
status: "draft"
---

# Evidence-threshold method for supermarket reference-pricing

## Executive answer

- This project should measure supermarket reference-pricing and promotion-cycle patterns as observable price-history signals, not as claims about a retailer's motive or legal breach. New Zealand's Fair Trading Act prohibits misleading or deceptive conduct, unsubstantiated representations, and false or misleading price representations, but whether a specific promotion breaches the Act is a legal/regulatory conclusion. [Fair Trading Act 1986, ss 9, 12A, 13](https://www.legislation.govt.nz/act/public/1986/121/en/latest/); [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act)
- Use the Commerce Commission's pricing concepts as the measurement frame: compare advertised discount, "was", "usual", "normal" or "everyday" prices against recent actual prices; treat continual promotional pricing as evidence that the promotional price may have become the usual selling price; and avoid claiming a saving from an older higher price when a more recent lower price exists. The Commission business-guidance page and open-letter PDF returned 403 to plain `curl`, but `agent-browser read` resolved the business-guidance page on 2 July 2026 and the repository browser/PDF reader extracted the same PDF text. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/); [Commerce Commission, misleading-pricing open letter](https://www.comcom.govt.nz/assets/pdf_file/0019/90073/Misleading-pricing-An-open-letter-to-New-Zealand-retailers-11-May-2017.pdf)
- The core metrics should be: reference-price support days, current-price support days, immediate prior price, lowest and modal prices in the lookback window, promotion-duty cycle, multibuy-duty cycle, spike-to-promotion sequence, and percent difference between the advertised "now" price and the pre-spike usual-price proxy. These metrics map to documented grocer-nz fields: current per-store `original_price_cent`, `sale_price_cent`, `club_price_cent`, `online_price_cent`, multibuy fields, and history rows with `updated_at`, `store_id`, and `price_cent`. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)
- Minimum publication standard: never publish a named retailer/product/store/date example unless the project has a captured shelf or online representation, matching grocer-nz history for the same product and store, product identity checked through barcode/metadata/redirects where available, at least 90 days of adequately dense lookback observations before the representation, and a plain-language caveat that the finding is a possible reference-pricing pattern, not an allegation of intent or a legal finding. No external publication should occur until a separate terms/legal review confirms that grocer.nz-derived analysis and any retailer screenshots may be republished. [Consumer Protection, misleading prices or advertising](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising); [Grocer, terms of service](https://grocer.nz/terms-of-service)

**Overall confidence:** Medium - the legal framing is strongly supported by current NZ legislation and official guidance, and the grocer-nz field mapping is documented and smoke-checked. The confidence is not High because the numeric screening thresholds are uncalibrated project assumptions, grocer.nz product-history coverage and terms require separate review, and the grocer-nz documentation/API notes are sibling project sources rather than independent evidence.

## Evidence

### Legal and publication frame

The Fair Trading Act 1986 says a person must not, in trade, engage in conduct that is misleading or deceptive or likely to mislead or deceive, must not make an unsubstantiated representation, and must not make a false or misleading representation with respect to the price of goods or services. [Fair Trading Act 1986, ss 9, 12A, 13](https://www.legislation.govt.nz/act/public/1986/121/en/latest/)

Consumer Protection says the Fair Trading Act covers incorrect or misleading prices, fake discounts, misleading "was/now" promotions, hidden costs, and false or unsubstantiated claims; it also says intent is not required for a misleading-conduct issue. [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act)

The Commerce Commission says price representations must be clear, accurate and unambiguous; its discount guidance says a business may mislead consumers if it never charged the claimed usual price, deliberately inflates the usual price, uses a claimed usual price that is one of many common selling prices, or relies on a claimed usual price that is out of date or rarely real. The same page says that, if businesses routinely sell products at a promotional price, the promotional price becomes the usual selling price; it also says a "was $15 now $10" comparison may be misleading if the product was more recently offered for $12. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)

The Commission's 2017 open letter gives the same continual-promotion example: continually selling at an advertised promotional price can give consumers the misleading impression that the promotional price is below the usual price, and if a business continually sells a product at a promotional price then that price becomes the usual selling price. [Commerce Commission, misleading-pricing open letter](https://www.comcom.govt.nz/assets/pdf_file/0019/90073/Misleading-pricing-An-open-letter-to-New-Zealand-retailers-11-May-2017.pdf)

MBIE's Consumer Protection guidance says New Zealand businesses are free to set prices and that increasing prices above previous levels is not itself illegal, while the Fair Trading Act still prohibits misleading and deceptive conduct and false representations. [Consumer Protection, misleading prices or advertising](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising)

For this project, that means the defensible unit of analysis is an evidence-backed statement such as "the displayed 'was' price had limited support in the available history window" or "the 'now' price exceeded the modal pre-spike price", not "the retailer inflated the price to mislead shoppers". [Fair Trading Act 1986, ss 9, 12A, 13](https://www.legislation.govt.nz/act/public/1986/121/en/latest/); [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act)

### Data frame

The grocer-nz skill is documented as a read-only query tool for public grocer.nz supermarket data, including store lookup, product search, current per-store prices, and historical per-product price rows for New Zealand grocery retailers. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

The documented current-price fields are `updated_at`, `store_id`, `product_id`, `original_price_cent`, `sale_price_cent`, `club_price_cent`, `online_price_cent`, `multibuy_price_cent`, `multibuy_quantity`, `club_multibuy_price_cent`, and `club_multibuy_quantity`; the documented history fields are `updated_at`, `store_id`, and `price_cent`, with prices stored in New Zealand cents. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

The documented history schema is leaner than the current-price schema, so history alone cannot prove whether an earlier row was a shelf "original", sale, club, online, or multibuy price unless another captured representation or source records that status. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

Product identity needs explicit checking. The grocer-nz API notes document `public_products.redirected_to` and `public_barcodes`, so a grocer product ID should be treated as an internal identifier, not as standalone proof that two observations are the same physical product through time. Publication-ready examples should check barcode matches where available, follow `redirected_to` values, and compare product name, brand, size, and unit before joining current prices, history, and captured shelf/online claims. [grocer-nz API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md)

### Smoke-check receipt

I reran the grocer-nz smoke checks on 2 July 2026 in a temporary Python virtual environment with `duckdb`, `pytz`, `requests`, `pyarrow`, and `pandas` installed, because the base environment did not have `duckdb`. The purpose was only schema and availability verification, not a publishable product example.

Commands run:

```bash
/tmp/grocer-smoke-venv/bin/python .skills/skills/grocer-nz/scripts/cli.py stores --query Papakura --json
/tmp/grocer-smoke-venv/bin/python .skills/skills/grocer-nz/scripts/cli.py prices 5461 --store-query Papakura --limit 3 --json
/tmp/grocer-smoke-venv/bin/python .skills/skills/grocer-nz/scripts/cli.py history 5461 --store-query Papakura --limit 3 --json
```

The store command returned Fresh Choice Papakura (`206`), New World Papakura (`307`), PAK'nSAVE Papakura (`230`), and Woolworths Papakura (`118`). The current-price command returned product `5461` rows for Anchor Milk Lite 98.5% Fat Free 2L with fields including `updated_at`, `store_id`, `product_id`, `original_price_cent`, `sale_price_cent`, `club_price_cent`, `online_price_cent`, `multibuy_price_cent`, `multibuy_quantity`, and `effective_price_cent`. The history command returned rows with `updated_at`, `store_id`, `vendor_id`, `store_name`, and `price_cent`. These rows are only a live tool receipt and should not be treated as an example of supermarket conduct. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

### Proposed metrics

Use `effective_price_cent` only for shopper-cost analysis, and use the component price fields for promotion analysis. The grocer-nz documentation says its effective price is a conservative minimum of original, sale, club, and online prices, while multibuy needs human interpretation because quantity matters. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

Classify multibuy separately. A standard promotion-duty-cycle metric should count single-unit sale, club, or online prices only; multibuy rows should feed a separate multibuy-duty-cycle metric unless the captured representation itself is a multibuy claim. This avoids treating a quantity-dependent offer as the same thing as a single-unit "special". [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

For a captured promotion on product `p`, store `s`, and representation date `t`, calculate these metrics over 30, 60, 90, and 180 calendar-day lookback windows when observation density permits:

- **Coverage:** number of distinct observation days, observations per calendar week, longest gap, first observation date, last observation date, and whether the observation cadence changed materially. This is required because grocer-nz warns that historical availability varies by product and store. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)
- **Immediate prior price:** the last observed history price before `t`; this tests the Commerce Commission's example that an older "was" price may mislead if a lower price was offered more recently. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)
- **Usual-price proxy:** modal price, median price, and days-at-price distribution in the lookback window; no single statistic should be called "the usual price" unless the days-at-price distribution is shown. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)
- **Reference-price support:** number and share of observed days in the lookback window at the displayed "was"/"usual"/"normal"/"everyday" price, plus whether those days occurred recently or only early in the window. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)
- **Promotion-duty cycle:** number and share of observed days in the lookback window at or below the advertised single-unit "now" price; if that share is high, the case should be labelled as a continual-promotion signal rather than a one-off discount signal. [Commerce Commission, misleading-pricing open letter](https://www.comcom.govt.nz/assets/pdf_file/0019/90073/Misleading-pricing-An-open-letter-to-New-Zealand-retailers-11-May-2017.pdf)
- **Multibuy-duty cycle:** number and share of observed current-price rows with quantity-dependent multibuy fields, reported separately from the single-unit promotion-duty cycle. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)
- **Spike-to-promotion sequence:** whether the price rose, stayed high briefly, and was then advertised as a discount or "special" at a price equal to or above the prior usual-price proxy. The specific 10% and 7-to-35-day thresholds below are untested project screening assumptions, not New Zealand legal thresholds and not ACCC thresholds. The ACCC comparison only supports the general pattern type: its Australian proceedings alleged at least 15% increases after at least 180 days at regular prices, with two public examples lasting 22 and 28 days. [ACCC, Coles/Woolworths proceedings media release](https://www.accc.gov.au/media-release/accc-takes-woolworths-and-coles-to-court-over-alleged-misleading-prices-dropped-and-down-down-claims)
- **Saving gap:** advertised saving versus saving measured from the immediate prior price, modal lookback price, and lowest recent non-promotion price; if the "now" price is higher than the modal pre-spike price, say so without asserting why. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/); [ACCC, Coles/Woolworths proceedings media release](https://www.accc.gov.au/media-release/accc-takes-woolworths-and-coles-to-court-over-alleged-misleading-prices-dropped-and-down-down-claims)

### Evidence thresholds and confidence labels

Use three internal evidence levels before publication:

| Level | Required evidence | Allowed wording | Not allowed |
|---|---|---|---|
| Screening signal | At least 30 observed days in the prior 60 calendar days for the same product and store, with no unexplained gap longer than 14 days, and a price pattern matching one metric above. | "This product/store has a price-history signal worth review." | Naming the retailer publicly or implying misleading conduct. |
| Review-ready pattern | At least 90 observed days in the prior 120 calendar days; observation density reported; no unexplained gap longer than 14 days; same-store product identity checked through barcode/metadata/redirects where possible; current representation captured; metrics reproduced by a second reviewer or script. | "The available history is consistent with a possible reference-pricing or continual-promotion pattern." | "Fake discount", "inflated was price", or claims about intent. |
| Publication-ready example | Review-ready evidence plus a saved screenshot/photo or archived page of the displayed claim, exact product/store/date, component current-price fields where relevant, stated limitations, terms/legal review, and legal-sensitivity review by a human. | "On [date], this captured representation said X; in grocer-nz history, Y of Z observed days in the prior window were at the displayed reference price." | Any statement that the retailer breached the Fair Trading Act unless a regulator or court has made that finding. |

Overall confidence for a published example should be **High** only when the display claim is captured, the same product and store are unambiguous, there are at least 120 observed days across a 180-day lookback, observation density is high enough for the claimed window, the pattern is robust under 60/90/180-day windows, terms/legal review is complete, and the finding has two-source support where a factual claim is load-bearing. [The For Good Project, CONTRIBUTING.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/CONTRIBUTING.md); [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act)

Overall confidence should be **Medium** when the exact product/store/date and price history are clear but the captured representation is incomplete, the lookback is 60 to 119 observed days, product identity relies on name/brand/size rather than barcode, or the result is sensitive to a single window choice. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

Overall confidence should be **Low** when the pattern comes from history alone, product identity could have changed through redirects or packaging changes, the history has large gaps or low observation density, multibuy is not separable from single-unit prices, or the only evidence is a current "special" field without a saved consumer-facing representation. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

### Date-window rules

Use the representation date as the anchor date because the Fair Trading Act's unsubstantiated-representation rule turns on whether a representation had reasonable grounds when it was made. [Fair Trading Act 1986, s 12A](https://www.legislation.govt.nz/act/public/1986/121/en/latest/)

The default lookback should be 90 calendar days because it is long enough to distinguish a one-week special from a repeated cycle but short enough to remain relevant to current grocery prices; report 30, 60, and 180-day sensitivity windows when coverage exists, and do not claim a "usual" price if the conclusion flips across windows. This 90-day default is a project rule rather than a regulator-stated legal safe harbour; I did not find a current NZ regulator rule that defines a fixed number of days required to establish a "usual" supermarket price. [Commerce Commission, pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/)

Observation density matters as much as calendar span. A 90-calendar-day lookback with only a few observation days should be labelled Low confidence or excluded from publication, because sparse rows cannot show whether a price was usual, rare, or merely missing from the dataset. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md)

For short-lived price increases, flag a screening signal only when all of these are true: the pre-increase price was the modal observed price for at least 30 observed days in the prior 90 calendar days; the higher price lasted 7 to 35 calendar days; the later promoted price was equal to or above the pre-increase modal price; and there is a captured representation using a discount, special, "was/now", "prices dropped", or equivalent value-impression claim. These are deliberately conservative, uncalibrated project thresholds; they should be changed after testing against real grocer-nz distributions and false-positive review. [Consumer Protection, misleading prices or advertising](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising); [ACCC, Coles/Woolworths proceedings media release](https://www.accc.gov.au/media-release/accc-takes-woolworths-and-coles-to-court-over-alleged-misleading-prices-dropped-and-down-down-claims)

For continual-promotion patterns, flag a screening signal only when the product was at or below the advertised single-unit "now"/"special" price on more than 50% of observed days in the prior 90 calendar days, or when repeated single-unit promotions leave fewer than 21 observed non-promotion days in the prior 90 calendar days. These are project thresholds designed to operationalise the Commerce Commission's statement that a routinely promotional price can become the usual selling price, not legal thresholds. [Commerce Commission, misleading-pricing open letter](https://www.comcom.govt.nz/assets/pdf_file/0019/90073/Misleading-pricing-An-open-letter-to-New-Zealand-retailers-11-May-2017.pdf)

### Publication standard for exact examples

Each exact example should publish a compact evidence table with: product name, brand, size, grocer product ID, barcode if available, redirect status, store ID, store name, retailer banner, representation date and capture URL or image filename, displayed claim, current component prices on the capture date, history coverage, observation density, immediate prior price, modal 90-day price, days at displayed reference price, single-unit days at advertised now price, multibuy days where relevant, and sensitivity result across 30/60/90/180-day windows. [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md); [grocer-nz API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md)

Before naming a retailer, require a second reviewer to reproduce the metrics from raw data or saved extracts, check that the exact product/store/date match the captured representation, check grocer.nz and retailer terms, and remove words that imply motive unless there is public regulator or court evidence for that motive. The ACCC's Australian proceedings show why this distinction matters: the ACCC used compulsory powers and pleaded allegations about planned temporary price spikes, but this project will not have those powers or internal retailer documents. [ACCC, supermarket inquiry page](https://www.accc.gov.au/inquiries-and-consultations/finalised-inquiries-and-monitoring/supermarkets-inquiry-2024-25); [ACCC, Coles/Woolworths proceedings media release](https://www.accc.gov.au/media-release/accc-takes-woolworths-and-coles-to-court-over-alleged-misleading-prices-dropped-and-down-down-claims)

Grocer's public terms route is available at `/terms-of-service`; its bundled terms text says Grocer provides grocery price comparison services, cannot guarantee all displayed prices, and provides the service "as is". I did not find an explicit public-data republication licence in that terms text, so this finding does not authorise publishing grocer.nz-derived price-history tables or retailer examples externally. [Grocer, terms of service](https://grocer.nz/terms-of-service)

Use neutral captions such as "possible reference-pricing signal", "limited support for displayed reference price in available history", "short-lived increase before promotion", or "promotion-cycle pattern". Avoid captions such as "fake special", "price gouging", "deceptive", "bait", "inflated was price", or "misleading pricing" unless quoting a regulator, court, or the retailer's own words. [Fair Trading Act 1986, ss 9, 13](https://www.legislation.govt.nz/act/public/1986/121/en/latest/); [Consumer Protection, Fair Trading Act](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| A retailer's price increase is not automatically unlawful in New Zealand, so this project must not treat price rises alone as misconduct. | [Consumer Protection: price increases](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising) | [Fair Trading Act 1986: focuses on misleading conduct, unsubstantiated representations, and false or misleading price representations](https://www.legislation.govt.nz/act/public/1986/121/en/latest/) | High |
| A "usual", "was", "normal" or "everyday" price can be misleading if it was never charged, rarely real, out of date, deliberately inflated, or only one of many common prices; a routinely promotional price can become the usual selling price. | [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/) | [Commerce Commission misleading-pricing open letter](https://www.comcom.govt.nz/assets/pdf_file/0019/90073/Misleading-pricing-An-open-letter-to-New-Zealand-retailers-11-May-2017.pdf) | High |
| grocer-nz history is enough to detect price-pattern signals but not enough by itself to prove what a shelf ticket represented, because historical rows are lean and may only include date, store, and price. | [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md) | [2 July 2026 smoke-check receipt in this finding; not independent of the tool and not a consumer-facing representation] | Medium |
| The 90-day default, 50% promotion-duty-cycle threshold, 10% spike screen, and 7-to-35-day spike window are project screening assumptions, not NZ regulator safe harbours. | [Commerce Commission pricing guidance does not state fixed day thresholds](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/) | [ACCC proceedings support only an analogous Australian pattern type, with alleged 15% increases after at least 180 days and public examples lasting 22 and 28 days](https://www.accc.gov.au/media-release/accc-takes-woolworths-and-coles-to-court-over-alleged-misleading-prices-dropped-and-down-down-claims) | Medium |
| Product identity cannot rely on grocer product ID alone for publication-ready examples because the documented schema includes product redirects and barcodes. | [grocer-nz API notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/references/api-notes.md) | [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md) | Medium |
| Australian ACCC supermarket material is useful for method design but should not be cited as New Zealand law. | [ACCC supermarket inquiry page: Australian inquiry under Australian law](https://www.accc.gov.au/inquiries-and-consultations/finalised-inquiries-and-monitoring/supermarkets-inquiry-2024-25) | [Fair Trading Act 1986: New Zealand statute](https://www.legislation.govt.nz/act/public/1986/121/en/latest/) | High |

## What would change this conclusion

- A new Commerce Commission or MBIE guidance note that defines fixed day-count rules for "usual", "was", "normal", "everyday", "special", or supermarket reference prices would replace the project thresholds above.
- A court decision or Commerce Commission enforcement outcome on New Zealand supermarket "was/now" or promotional-cycle claims would provide a stronger local benchmark than the Australian ACCC comparison.
- Calibration against actual grocer-nz data distributions could change the 10% spike threshold, 7-to-35-day spike window, 50% promotion-duty threshold, 90-day default lookback, and minimum observation-density rules.
- Direct retailer records, supplier funding records, or regulator findings could support stronger statements about intent or planning, but this project should not infer those matters from public price history alone.
- Better data that preserves historical `original_price_cent`, `sale_price_cent`, `club_price_cent`, `online_price_cent`, multibuy status, shelf-ticket text, and page captures for every observation would allow more precise separation between ordinary price changes, sales, loyalty pricing, and multibuy promotions.
- I could not verify grocer.nz's full historical coverage, update frequency, product-retirement behaviour, or redistribution terms from the skill documentation alone. No publication-ready named example should be produced until separate data-coverage and terms/legal findings resolve those questions.
- This finding is not legal advice. A lawyer or the Commerce Commission should review any external publication that names a retailer and discusses possible Fair Trading Act implications.

## Open follow-up questions

- What is the actual product/store/date coverage, update cadence, and missingness profile of grocer-nz history across Woolworths, New World, PAK'nSAVE, Fresh Choice, Super Value, and The Warehouse?
- What are grocer.nz's and the retailers' terms for republishing derived price-history tables, screenshots, or store/product examples?
- How often do the proposed screening metrics flag stable price cycles in a representative basket, and what false-positive rate appears after human review?
- Which barcode, redirect, name, brand, size, and unit checks best identify the same physical product across stores and across product-retirement events?
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
10. Grocer. "Terms of Service." Last updated 8 April 2025. Accessed 2 July 2026. https://grocer.nz/terms-of-service
