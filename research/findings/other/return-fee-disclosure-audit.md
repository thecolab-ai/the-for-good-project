---
title: "NZ retailers usually disclose change-of-mind return costs before payment, but mostly in policy pages rather than at the buying moment"
domain: "other"
issue: "#583"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-05"
status: "draft"
---

# NZ retailers usually disclose change-of-mind return costs before payment, but mostly in policy pages rather than at the buying moment

## Executive answer

- In this 12-retailer public-page audit, change-of-mind return fees, return-postage rules, non-refundable delivery charges, or restocking conditions were generally available before checkout, but usually in a help, FAQ, or returns-policy page rather than beside the product price or the checkout button [PB Tech returns policy](https://www.pbtech.co.nz/help/article/63/returns-process--policy), [Bunnings shop-online FAQ](https://www.bunnings.co.nz/help-centre/shop-online), [Farmers returns policy](https://www.farmers.co.nz/help/returns-policy).
- The clearest early disclosure found was The Warehouse, where a sampled product page itself included delivery-cost detail and a "Returns Policy" section saying the 60-day money-back policy requires a resalable condition unless faulty, with restrictions and conditions linked before the cart step [The Warehouse product page](https://www.thewarehouse.co.nz/p/schooltex-balmoral-intermediate-beanie-with-embroidery/RM110112660_NAV-1M.html).
- Restocking percentages were uncommon in the sampled public consumer pages: PB Tech was the only sampled general consumer retailer page found with a specific restocking percentage, saying opened change-of-mind returns may be accepted in special cases with a 20% restocking fee and that online return courier charges usually fall on the customer [PB Tech returns policy](https://www.pbtech.co.nz/help/article/63/returns-process--policy).
- Several retailers disclosed no percentage fee but did disclose a shopper cost: Kmart says delivery fees are non-refundable for change-of-mind returns; Bunnings, Harvey Norman, Hallensteins, and Kathmandu put change-of-mind return shipping on the customer; Mitre 10 excludes handling, delivery, and return costs from refunds; Farmers may charge to return rejected out-of-policy items back to the customer [Kmart returns FAQ](https://www.kmart.co.nz/faq/exchanges-returns/), [Bunnings shop-online FAQ](https://www.bunnings.co.nz/help-centre/shop-online), [Harvey Norman returns policy](https://www.harveynorman.co.nz/corporate-information/returns-policy.html), [Hallensteins returns FAQ](https://www.hallensteins.com/faqs/returns), [Kathmandu returns policy](https://help.kathmandu.co.nz/support/solutions/articles/51000056241-returns-policy), [Mitre 10 delivery and returns](https://www.mitre10.co.nz/delivery-returns), [Farmers returns policy](https://www.farmers.co.nz/help/returns-policy).
- This supports a cautious synthesis claim: shoppers *can often find* change-of-mind return costs before paying, but the sample does not prove that retailers consistently *surface* those costs in checkout without the shopper seeking out policy text [Consumer NZ](https://www.consumer.org.nz/shopping/everyday-shopping/can-shops-charge-a-return-fee), [Consumer Protection](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/change-of-mind).

**Overall confidence:** Medium - the sampled retailer pages were current public pages fetched on 5 July 2026 and support the table, but I did not run a controlled logged-in checkout audit, did not test mobile app flows, and did not archive every product-page variant.

## Evidence

### Scope and scoring

I treated "before checkout" as public information a shopper could reach before entering payment details, because issue #583 asks whether shoppers can see return fees and restocking conditions in time to avoid them and the stream already separates this transparency question from a full live-cart checkout audit [Issue #583](https://github.com/thecolab-ai/the-for-good-project/issues/583), [stream #258 overview](../../../streams/258-discover-the-creeping-cost-of-online-shopping-deli.md). I scored disclosure as:

| Score | Meaning |
|---|---|
| **A - buying-page visible** | The audited product, delivery, or buying page itself stated the relevant return-cost condition or linked the return terms in the product-page flow before cart/payment. |
| **B - policy-page visible** | The relevant fee or condition was stated on a public returns/help/FAQ page before checkout, but I did not verify it was surfaced on the sampled product or cart page. |
| **C - unclear/late** | I could not verify a public pre-checkout statement of the relevant fee or condition. |

This is a selected snapshot of 12 NZ-facing retailers already prominent in the stream's delivery-fee evidence, not a market-share-weighted survey of all NZ online retail [online retailer delivery-fee snapshot](online-retailer-delivery-fees-snapshot.md). I counted only change-of-mind terms and voluntary-return costs, because MBIE and the Commerce Commission state that change-of-mind returns are not an automatic Consumer Guarantees Act right and depend on the store policy, while faulty-goods rights cannot be reduced by a return-fee policy [Consumer Protection](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/change-of-mind), [Commerce Commission](https://www.comcom.govt.nz/consumers/dealing-with-typical-situations/returns-and-refunds/).

### Retailer snapshot

| Retailer | What was disclosed before checkout | Where it appeared | Score | Confidence |
|---|---|---|---|---|
| The Warehouse | The sampled product page showed delivery-cost mechanics and a Returns Policy section saying the 60-day money-back policy requires a resalable condition unless faulty, with restrictions and conditions applying [The Warehouse product page](https://www.thewarehouse.co.nz/p/schooltex-balmoral-intermediate-beanie-with-embroidery/RM110112660_NAV-1M.html). | Product page before cart/payment [The Warehouse product page](https://www.thewarehouse.co.nz/p/schooltex-balmoral-intermediate-beanie-with-embroidery/RM110112660_NAV-1M.html). | A | Medium - one product page; third-party and excluded categories can vary. |
| PB Tech | PB Tech states that opened change-of-mind returns are usually not accepted but may be accepted in special cases subject to a 20% restocking fee, and says online returns usually require the customer to pay courier costs except in certain or legally required situations [PB Tech returns policy](https://www.pbtech.co.nz/help/article/63/returns-process--policy). | Help/returns policy before checkout [PB Tech returns policy](https://www.pbtech.co.nz/help/article/63/returns-process--policy). | B | High for the 20% policy text; Medium for placement because I did not verify live product/cart prominence. |
| Kmart NZ | Kmart's returns FAQ says delivery fees are non-refundable for change-of-mind returns and points change-of-mind return questions to its returns policy [Kmart returns FAQ](https://www.kmart.co.nz/faq/exchanges-returns/). | FAQ before checkout [Kmart returns FAQ](https://www.kmart.co.nz/faq/exchanges-returns/). | B | Medium - clear FAQ, but not a product/cart audit. |
| Mitre 10 | Mitre 10 says courier returns go back to the dispatching store and refunds can exclude handling, delivery, and return costs [Mitre 10 delivery and returns](https://www.mitre10.co.nz/delivery-returns). | Delivery and returns page before checkout [Mitre 10 delivery and returns](https://www.mitre10.co.nz/delivery-returns). | B | High for policy wording; Medium for checkout placement. |
| Bunnings NZ | Bunnings says change-of-mind shoppers who cannot return to a local store must cover return postage/delivery, while Bunnings covers return cost for damaged or faulty items [Bunnings shop-online FAQ](https://www.bunnings.co.nz/help-centre/shop-online). | Help-centre FAQ before checkout [Bunnings shop-online FAQ](https://www.bunnings.co.nz/help-centre/shop-online). | B | High for policy wording; Medium for checkout placement. |
| Briscoes | Briscoes says change-of-mind returns are accepted within its stated conditions and return postage is complimentary if arranged through customer service or the self-return portal, while other courier costs are not reimbursed [Briscoes FAQ](https://www.briscoes.co.nz/faqs/). | FAQ before checkout [Briscoes FAQ](https://www.briscoes.co.nz/faqs/). | B | High for policy wording; Medium for checkout placement. |
| Rebel Sport | Rebel Sport says return postage is complimentary if arranged through customer service or the self-return portal, while other courier costs are not reimbursed [Rebel Sport FAQ](https://www.rebelsport.co.nz/faqs/). | FAQ before checkout [Rebel Sport FAQ](https://www.rebelsport.co.nz/faqs/). | B | High for policy wording; Medium for checkout placement. |
| Farmers | Farmers says it does not refund change-of-mind purchases, offers exchanges or gift cards within policy limits, excludes beds/furniture/whiteware/electronics from change-of-mind returns, and may charge to send back items returned outside its conditions [Farmers returns policy](https://www.farmers.co.nz/help/returns-policy). | Returns policy before checkout [Farmers returns policy](https://www.farmers.co.nz/help/returns-policy). | B | Medium - clear policy page, but policy-page placement only. |
| Harvey Norman NZ | Harvey Norman says change-of-mind refunds exclude delivery charges, the product must be returned to a store, the customer covers delivery/other return costs for change-of-mind returns, and Customer Direct products are excluded [Harvey Norman returns policy](https://www.harveynorman.co.nz/corporate-information/returns-policy.html). | Returns policy before checkout [Harvey Norman returns policy](https://www.harveynorman.co.nz/corporate-information/returns-policy.html). | B | Medium - clear policy page, but product/category pages can vary. |
| Hallensteins | Hallensteins says returns are at the purchaser's cost and original shipping is not refunded for change-of-mind returns or exchanges, while faulty-item postage should be arranged with customer service first [Hallensteins returns FAQ](https://www.hallensteins.com/faqs/returns). | Returns FAQ before checkout [Hallensteins returns FAQ](https://www.hallensteins.com/faqs/returns). | B | High for policy wording; Medium for checkout placement. |
| Kathmandu | Kathmandu says original delivery charges are not refunded for online-purchase returns and change-of-mind postal returns require the customer to cover postage back to the warehouse [Kathmandu returns policy](https://help.kathmandu.co.nz/support/solutions/articles/51000056241-returns-policy). | Help-centre returns policy before checkout [Kathmandu returns policy](https://help.kathmandu.co.nz/support/solutions/articles/51000056241-returns-policy). | B | High for policy wording; Medium for checkout placement. |
| Chemist Warehouse NZ | Chemist Warehouse's NZ returns page says change-of-mind returns are available only if conditions are met and lists excluded categories; its FAQ separately says post-dispatch cancellations can be posted back at the customer's cost with a refund less postage [Chemist Warehouse returns policy](https://www.chemistwarehouse.co.nz/aboutus/returnspolicy), [Chemist Warehouse FAQ](https://www.chemistwarehouse.co.nz/aboutus/faq). | Returns policy and FAQ before checkout [Chemist Warehouse returns policy](https://www.chemistwarehouse.co.nz/aboutus/returnspolicy), [Chemist Warehouse FAQ](https://www.chemistwarehouse.co.nz/aboutus/faq). | B | Medium - public pages conflict with an older `/refundpolicy` page that says no change-of-mind refunds, so the current returns-policy page should be preferred but live checkout was not tested. |

### Pattern

The sampled retailers mostly make the relevant costs discoverable before payment, but the information is often separated from the product-price comparison task: PB Tech's restocking percentage appears in a help/returns page, Kmart's non-refundable delivery rule appears in an exchanges/returns FAQ, and Bunnings' return-postage rule appears in a shop-online FAQ [PB Tech returns policy](https://www.pbtech.co.nz/help/article/63/returns-process--policy), [Kmart returns FAQ](https://www.kmart.co.nz/faq/exchanges-returns/), [Bunnings shop-online FAQ](https://www.bunnings.co.nz/help-centre/shop-online). That matters because Consumer NZ says change-of-mind return fees can be charged only if the store is upfront, and specifically warns that discovering the fee only after it is deducted is unfair [Consumer NZ](https://www.consumer.org.nz/shopping/everyday-shopping/can-shops-charge-a-return-fee).

The strongest "early and clear" example in this audit is The Warehouse because the sampled product page itself displayed delivery information and a returns-policy section before the shopper entered the cart flow [The Warehouse product page](https://www.thewarehouse.co.nz/p/schooltex-balmoral-intermediate-beanie-with-embroidery/RM110112660_NAV-1M.html). The strongest "clear but not at the buying moment" example is PB Tech because the 20% restocking condition and online-return courier-cost rule are unambiguous on the returns page, but this audit did not verify that the 20% condition appears on every product page or in the cart before payment [PB Tech returns policy](https://www.pbtech.co.nz/help/article/63/returns-process--policy).

I found no sampled retailer that disclosed a hidden fee only after checkout, but this is not proof that checkout disclosure is consistently good, because I did not place products into carts across desktop/mobile, did not log in, and did not proceed to payment pages [Issue #583](https://github.com/thecolab-ai/the-for-good-project/issues/583). A stronger version of this finding would need a reproducible checkout script or screenshot set for the same basket and addresses across the sample [online retailer delivery-fee snapshot](online-retailer-delivery-fees-snapshot.md).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Change-of-mind return rules are retailer policy, not an automatic CGA right, so disclosure quality matters before purchase. | [Consumer Protection](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/change-of-mind) | [Commerce Commission](https://www.comcom.govt.nz/consumers/dealing-with-typical-situations/returns-and-refunds/) | High |
| Consumer NZ's practical standard is that a change-of-mind return fee can be charged only if the store is upfront, and a fee discovered after bank deduction is unfair. | [Consumer NZ](https://www.consumer.org.nz/shopping/everyday-shopping/can-shops-charge-a-return-fee) | Single-origin for this exact "upfront" standard; official sources confirm only that store policy governs change-of-mind returns [Consumer Protection](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/change-of-mind) | Medium |
| In this sample, a specific restocking percentage was visible on PB Tech's public consumer returns page but not commonly across the other sampled consumer pages. | [PB Tech returns policy](https://www.pbtech.co.nz/help/article/63/returns-process--policy) | Cross-check against sampled retailer pages in the table above | Medium |
| Several retailers disclose customer-paid return postage or non-refundable original delivery for change-of-mind returns before checkout, but mostly on policy/FAQ pages. | [Bunnings shop-online FAQ](https://www.bunnings.co.nz/help-centre/shop-online) | [Kathmandu returns policy](https://help.kathmandu.co.nz/support/solutions/articles/51000056241-returns-policy) | Medium |
| The sampled evidence supports "often findable before checkout" more strongly than "clearly surfaced during checkout." | [The Warehouse product page](https://www.thewarehouse.co.nz/p/schooltex-balmoral-intermediate-beanie-with-embroidery/RM110112660_NAV-1M.html) | [PB Tech returns policy](https://www.pbtech.co.nz/help/article/63/returns-process--policy) | Medium |

## What would change this conclusion

- A controlled checkout audit with screenshots, using the same small-item and bulky-item baskets across desktop and mobile, could upgrade or overturn the placement conclusion by showing whether return fees are surfaced in cart, delivery selection, or final payment review rather than only in policy pages.
- A larger, market-share-weighted sample could change the "usually policy-page visible" conclusion, because this audit deliberately reused retailers already prominent in stream #258 rather than all NZ retail categories [stream #258 overview](../../../streams/258-discover-the-creeping-cost-of-online-shopping-deli.md).
- Archived retailer-page snapshots would make the finding more durable, because retailer policy pages and promotional return terms can change quickly; I used live pages and WebSearch/WebFetch-style extraction on 5 July 2026.
- A human consumer-law reviewer should test whether each retailer's placement would satisfy the "upfront" standard in a real dispute; this finding describes disclosure placement, not legal compliance [Consumer NZ](https://www.consumer.org.nz/shopping/everyday-shopping/can-shops-charge-a-return-fee).
- I could not verify app-only flows, logged-in loyalty-account flows, marketplace-seller variants, or post-purchase return-portal wording.

## Open follow-up questions

- How do the same retailers disclose return fees in the actual cart and final payment-review screen for a standard product, bulky product, rural address, and marketplace/third-party seller where applicable?
- How often do retailer return-fee terms change over time, and do archived pages show a trend toward more customer-paid return costs?
- Do shoppers notice policy-page-only disclosure, or do they need product-page/cart-level wording to make a different purchase decision?

## Sources

1. Consumer Protection. "Change of mind." Accessed 5 July 2026. https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/change-of-mind
2. Commerce Commission. "Returns and refunds." Accessed 5 July 2026. https://www.comcom.govt.nz/consumers/dealing-with-typical-situations/returns-and-refunds/
3. Consumer NZ. "Can shops charge a return fee?" 27 February 2026, accessed 5 July 2026. https://www.consumer.org.nz/shopping/everyday-shopping/can-shops-charge-a-return-fee
4. The Warehouse. Sample product page, "Schooltex Balmoral Intermediate Beanie with Embroidery." Accessed 5 July 2026. https://www.thewarehouse.co.nz/p/schooltex-balmoral-intermediate-beanie-with-embroidery/RM110112660_NAV-1M.html
5. PB Tech. "Returns Process & Policy." Accessed 5 July 2026. https://www.pbtech.co.nz/help/article/63/returns-process--policy
6. Kmart NZ. "FAQ: exchanges returns." Accessed 5 July 2026. https://www.kmart.co.nz/faq/exchanges-returns/
7. Mitre 10. "Delivery & returns." Accessed 5 July 2026. https://www.mitre10.co.nz/delivery-returns
8. Bunnings NZ. "Shop Online." Accessed 5 July 2026. https://www.bunnings.co.nz/help-centre/shop-online
9. Briscoes. "FAQs." Accessed 5 July 2026. https://www.briscoes.co.nz/faqs/
10. Rebel Sport. "FAQs." Accessed 5 July 2026. https://www.rebelsport.co.nz/faqs/
11. Farmers. "Returns Policy." Accessed 5 July 2026. https://www.farmers.co.nz/help/returns-policy
12. Harvey Norman NZ. "Returns Policy." Accessed 5 July 2026. https://www.harveynorman.co.nz/corporate-information/returns-policy.html
13. Hallensteins. "FAQs: Returns." Accessed 5 July 2026. https://www.hallensteins.com/faqs/returns
14. Kathmandu Help Centre. "Returns Policy." Accessed 5 July 2026. https://help.kathmandu.co.nz/support/solutions/articles/51000056241-returns-policy
15. Chemist Warehouse NZ. "Returns Policy." Accessed 5 July 2026. https://www.chemistwarehouse.co.nz/aboutus/returnspolicy
16. Chemist Warehouse NZ. "FAQ." Accessed 5 July 2026. https://www.chemistwarehouse.co.nz/aboutus/faq
17. Existing project finding: "Selected NZ online retailers publish a mixed delivery-fee picture." Accessed locally 5 July 2026. [online-retailer-delivery-fees-snapshot.md](online-retailer-delivery-fees-snapshot.md)
18. Stream #258 overview. Accessed locally 5 July 2026. [streams/258-discover-the-creeping-cost-of-online-shopping-deli.md](../../../streams/258-discover-the-creeping-cost-of-online-shopping-deli.md)
