---
title: "Public Grocer-derived price examples need permission or legal review; aggregate analysis is the safer default"
domain: "other"
issue: "#829"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-08"
status: "draft"
---

# Public Grocer-derived price examples need permission or legal review; aggregate analysis is the safer default

## Executive answer

- The defensible default path is to publish aggregate findings, methodology, thresholds, source descriptions, and non-row-level summary charts, while withholding public product/store/date examples until the project has either written permission or a New Zealand legal review for the specific use. Grocer's public terms describe a price-comparison service and price accuracy caveats, but I found no explicit licence to copy, redistribute, or publish product-level extracts from its public DuckDB/parquet assets [Grocer terms, fetched from active frontend bundle 2026-07-08](https://grocer.nz/terms-of-service); [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).
- A "small example citation" is not a blanket safe harbour. New Zealand copyright guidance says copyright protects expression, not mere information, and that tables and compilations of data can still qualify as literary works; fair dealing can cover criticism, review, news reporting, research or private study only where the dealing is fair and purpose-specific [MBIE copyright guidance](https://www.mbie.govt.nz/business-and-employment/business/intellectual-property/copyright/copyright-protection-in-new-zealand); [Data.govt.nz NZGOAL Guidance Note 4](https://www.data.govt.nz/toolkit/policies/nzgoal/guidance-note-4); [Copyright Licensing NZ fair dealing fact sheet](https://www.copyright.co.nz/downloads/assets/5212/1/fact-sheet%3A-fair-dealing-in-new-zealand.pdf).
- Permission is the cleanest rights path for public product-level charts: ask Grocer for a written public-interest analytics licence covering derived charts, limited examples, attribution wording, no bulk redistribution, and source-caveat language. If the examples identify Foodstuffs or Woolworths products/stores, legal review should also consider retailer website/app terms and the risk that Grocer's upstream collection does not bind retailers [Foodstuffs online shopping terms](https://www.clubplus.co.nz/terms/online-shopping); [Grocer terms](https://grocer.nz/terms-of-service).
- If permission is unavailable, a public-interest article can still be considered, but only as a lawyer-reviewed fair-dealing/news/criticism path: use the minimum necessary data points, cite the source, avoid reproducing substantial tables, avoid screenshots unless cleared separately, and frame examples as evidence of price-pattern signals rather than allegations of misleading conduct [Copyright Licensing NZ fair dealing fact sheet](https://www.copyright.co.nz/downloads/assets/5212/1/fact-sheet%3A-fair-dealing-in-new-zealand.pdf); [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/).
- The For Good Project should not publish a reusable product-level dataset, a bulk derived extract, or a retailer leaderboard from Grocer-derived rows without permission or legal sign-off, because that combines copyright/database uncertainty, website/app contract terms, and reputational/legal sensitivity around named retailer pricing claims [Data.govt.nz NZGOAL Guidance Note 4](https://www.data.govt.nz/toolkit/policies/nzgoal/guidance-note-4); [Foodstuffs online shopping terms](https://www.clubplus.co.nz/terms/online-shopping); [Consumer Protection Fair Trading Act guidance](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act).

**Overall confidence:** Medium - the conservative publication path is well supported by current public terms, NZ copyright/open-data guidance, and existing stream findings. It is not High because this is not legal advice, I did not obtain Grocer or retailer permission, and Woolworths' official terms page remained difficult to extract cleanly in this environment.

## Evidence

### Question answered

I answered the narrow question: what rights path lets The For Good Project use Grocer-derived supermarket price examples in a public-interest supermarket transparency artifact, without assuming that public availability of the files equals permission to republish product-level examples [issue #829](https://github.com/thecolab-ai/the-for-good-project/issues/829).

The `grocer-nz` skill documents public Grocer data surfaces: a public base DuckDB catalogue, per-store current-price parquet files, per-product history parquet files, and a frontend product search index; it also states the skill is read-only, public-data only, and should not be used for authenticated Pro/user/list features [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).

Existing stream work has already separated what the data can show from what may be published: the Grocer data audit found useful public price data but no safe bulk republication licence, and the wider sample finding intentionally published only derived statistics and compact examples while leaving permission/legal advice unresolved [Grocer data audit](grocer-nz-data-audit.md); [wider supermarket pricing patterns](wider-supermarket-pricing-patterns.md).

### Copyright and database risk

MBIE says copyright protects the particular way an idea or information is expressed, not mere information, ideas, schemes, or methods that can be expressed in other ways [MBIE copyright guidance](https://www.mbie.govt.nz/business-and-employment/business/intellectual-property/copyright/copyright-protection-in-new-zealand). The same MBIE page lists tables and compilations, including compilations of data, as literary works that can qualify for copyright protection, and says copyright owners control copying, publishing, issuing copies to the public, adaptations, communications to the public, and authorising others to do restricted acts [MBIE copyright guidance](https://www.mbie.govt.nz/business-and-employment/business/intellectual-property/copyright/copyright-protection-in-new-zealand).

Data.govt.nz's NZGOAL database guidance makes the same distinction at dataset level: individual facts are not protected as such, but copyright can exist in a database or dataset where sufficient labour, skill, or judgment is involved in the compilation; the guidance also warns that copying a whole database/dataset or a substantial part can infringe if the compilation is protected [Data.govt.nz NZGOAL Guidance Note 4](https://www.data.govt.nz/toolkit/policies/nzgoal/guidance-note-4).

That means a sentence such as "sampled products often cycled below their observed maximum price" is lower rights risk than publishing a table of named products, stores, exact dates, and exact prices copied or substantially derived from Grocer rows, because the former reports an analytical conclusion while the latter may reproduce a meaningful slice of the compilation [MBIE copyright guidance](https://www.mbie.govt.nz/business-and-employment/business/intellectual-property/copyright/copyright-protection-in-new-zealand); [Data.govt.nz NZGOAL Guidance Note 4](https://www.data.govt.nz/toolkit/policies/nzgoal/guidance-note-4).

### Terms and contract risk

Grocer's active frontend bundle rendered its terms text on 2026-07-08. The terms describe Grocer as a grocery price comparison service that collects and displays pricing information from retailers, say displayed prices may vary by location and time and are not guaranteed accurate, prohibit unauthorised access or disruption, provide the service as-is, and do not include an explicit bulk data, redistribution, or publication licence for third parties [Grocer terms](https://grocer.nz/terms-of-service); [Grocer active frontend bundle](https://grocer.nz/assets/index-CNI3SrFR.js).

Foodstuffs' online shopping terms say the systems and intellectual property rights relating to or supporting Foodstuffs supermarket online shopping services are owned or controlled by Foodstuffs entities; they say Foodstuffs owns or is authorised to use the IP in material accessed through its online shop, including data files and images; and they grant a non-exclusive, non-transferable, revocable right to access and use the online shopping services solely for the user's own use, while restricting copying, derivative works, republication, display, transmission, or distribution of the services [Foodstuffs online shopping terms](https://www.clubplus.co.nz/terms/online-shopping).

Foodstuffs' terms also say online prices are updated regularly, shoppers should check trolley prices before completing an order, final order value can differ from the estimated value for variable-weight items, substitutions, unavailable items, and special requests, and changed orders update to current pricing at resubmission [Foodstuffs online shopping terms](https://www.clubplus.co.nz/terms/online-shopping). Those clauses matter because public examples should not imply a Grocer row is necessarily a final transaction price for every shopper or order [Foodstuffs online shopping terms](https://www.clubplus.co.nz/terms/online-shopping).

I did not obtain a clean full-text extraction of Woolworths NZ's official terms page during this run. The official page itself resolved as a dynamic app shell through the fetch ladder, and prior stream work recorded that its search-index text restricts scraping/copying and says the terms do not grant an IP licence; because I could not independently re-extract those clauses here, Woolworths-specific reuse should remain a legal-review item rather than a stated permission path [Woolworths NZ terms page](https://www.woolworths.co.nz/info/terms-and-conditions/online-shopping-website-and-app); [Grocer data audit](grocer-nz-data-audit.md).

### Fair dealing is a possible argument, not an operating rule

Copyright Licensing New Zealand's fair-dealing fact sheet says permission is not needed for an insubstantial part of a work, but even a very small part can be substantial if it is important or distinctive [Copyright Licensing NZ fair dealing fact sheet](https://www.copyright.co.nz/downloads/assets/5212/1/fact-sheet%3A-fair-dealing-in-new-zealand.pdf).

The same fact sheet says fair dealing can permit use for research or private study, criticism or review, or reporting current events, but fairness depends on purpose, nature of the work, availability, market effect, and amount/substantiality copied; it also says criticism/review and current-event reporting require sufficient acknowledgement, with the current-event exception not applying to photographs [Copyright Licensing NZ fair dealing fact sheet](https://www.copyright.co.nz/downloads/assets/5212/1/fact-sheet%3A-fair-dealing-in-new-zealand.pdf).

Copyright Licensing New Zealand's public guidance separately warns that research/private-study fair dealing does not cover later publication of that research, and that publication would involve making multiple copies rather than the private research copy itself [Copyright Licensing NZ fair dealing article](https://support.copyright.co.nz/portal/en/kb/articles/fair-dealing-cbcghw). For this project, that means internal analysis with Grocer data is a different legal question from public release of product-level examples [Copyright Licensing NZ fair dealing article](https://support.copyright.co.nz/portal/en/kb/articles/fair-dealing-cbcghw).

Therefore, the small-example route is: obtain legal review of the specific article/chart, make the example necessary to criticism/review/news reporting, use the minimum number of copied data points, avoid screenshots unless separately cleared, include source and access-date acknowledgement, and do not publish an extract that substitutes for Grocer, retailer websites, or a paid/pro comparison feature [Copyright Licensing NZ fair dealing fact sheet](https://www.copyright.co.nz/downloads/assets/5212/1/fact-sheet%3A-fair-dealing-in-new-zealand.pdf); [IPONZ copyright overview](https://www.iponz.govt.nz/get-ip/copyright/).

### Pricing-law and reputational wording risk

New Zealand consumer-pricing law is representation-specific: the Fair Trading Act prohibits misleading or deceptive conduct, unsubstantiated representations, and false or misleading price representations, but an ordinary price rise is not automatically unlawful [Fair Trading Act 1986](https://www.legislation.govt.nz/act/public/1986/121/en/latest/whole.html); [Consumer Protection Fair Trading Act guidance](https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act).

Commerce Commission pricing guidance says "usual", "was", "normal", or "everyday" comparisons can mislead where the claimed comparison price was never charged, deliberately inflated, one of many common prices, out of date, rarely real, or where a routinely promotional price has become the usual selling price [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/).

The rights path and the pricing-law path interact: even if a small excerpt were defensible under copyright, public examples that name a retailer or store should still avoid words such as "fake", "misleading", "inflated", or "breach" unless a regulator/court has made that finding, because Grocer history shows price rows but not the full consumer-facing representation, retailer intent, stock availability, checkout outcome, or retailer evidence base [supermarket pricing method](supermarket-pricing-method.md); [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/).

### Recommended operating rule

Use this ladder for public work:

| Proposed use | Rights path | Recommended status |
|---|---|---|
| Internal analysis from public Grocer assets | Use `grocer-nz` read-only public paths, record exact asset URLs, dates, and scripts, and avoid private/authenticated features [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md). | Allowed for research. |
| Public methodology, thresholds, source descriptions, and aggregate summary statistics | Publish derived analysis that does not reproduce product-level rows or substantial dataset slices; cite Grocer assets and access dates [MBIE copyright guidance](https://www.mbie.govt.nz/business-and-employment/business/intellectual-property/copyright/copyright-protection-in-new-zealand); [Data.govt.nz NZGOAL Guidance Note 4](https://www.data.govt.nz/toolkit/policies/nzgoal/guidance-note-4). | Safest public path. |
| Public named product/store/date examples | Prefer written permission from Grocer; otherwise require New Zealand legal review for fair-dealing/news/criticism, terms, screenshots, and wording risk [Grocer terms](https://grocer.nz/terms-of-service); [Copyright Licensing NZ fair dealing fact sheet](https://www.copyright.co.nz/downloads/assets/5212/1/fact-sheet%3A-fair-dealing-in-new-zealand.pdf). | Blocked until permission or legal review. |
| Bulk row export, reusable product-level dataset, API, retailer leaderboard, or downloadable derivative table | Requires written licence/permission and legal review because it may reproduce a substantial compilation and may conflict with Grocer/retailer terms [Data.govt.nz NZGOAL Guidance Note 4](https://www.data.govt.nz/toolkit/policies/nzgoal/guidance-note-4); [Foodstuffs online shopping terms](https://www.clubplus.co.nz/terms/online-shopping). | Do not publish now. |
| Regulator or newsroom briefing with examples | Share a concise evidence memo and methodology, preferably after permission/legal review; if urgent, keep examples minimal, source-attributed, and framed as signals for review rather than legal conclusions [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/); [Copyright Licensing NZ fair dealing fact sheet](https://www.copyright.co.nz/downloads/assets/5212/1/fact-sheet%3A-fair-dealing-in-new-zealand.pdf). | Possible with human review. |

The most practical permission request is narrow: permission to publish a small number of public-interest derived charts/examples from Grocer public assets, with no raw/bulk row redistribution, clear attribution to Grocer, access dates, known accuracy caveats, product/store/date identifiers only where necessary, and an offer to link users back to Grocer for live prices [Grocer terms](https://grocer.nz/terms-of-service); [grocer-nz skill notes](https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Public availability of Grocer's price assets does not equal a public redistribution licence. | [Grocer terms have no explicit redistribution licence](https://grocer.nz/terms-of-service) | [MBIE says a licence is needed where use may infringe and no exception applies](https://www.mbie.govt.nz/business-and-employment/business/intellectual-property/copyright/copyright-protection-in-new-zealand) | Medium |
| Facts are lower risk than copied datasets, but NZ law can still protect tables/compilations/databases. | [MBIE: copyright protects expression, not mere information, and lists tables/compilations including data](https://www.mbie.govt.nz/business-and-employment/business/intellectual-property/copyright/copyright-protection-in-new-zealand) | [Data.govt.nz NZGOAL database guidance](https://www.data.govt.nz/toolkit/policies/nzgoal/guidance-note-4) | High |
| Fair dealing is not a blanket safe harbour for public product-level charts. | [Copyright Licensing NZ fact sheet: purpose-specific and fairness-specific](https://www.copyright.co.nz/downloads/assets/5212/1/fact-sheet%3A-fair-dealing-in-new-zealand.pdf) | [Copyright Licensing NZ article: research/private study does not cover later publication](https://support.copyright.co.nz/portal/en/kb/articles/fair-dealing-cbcghw) | Medium |
| Foodstuffs terms add contract/IP risk for Foodstuffs-banner examples even if the data came through Grocer rather than direct scraping in this project. | [Foodstuffs online shopping terms reserve IP and restrict copying/redistribution](https://www.clubplus.co.nz/terms/online-shopping) | [Grocer says it collects and displays retailer pricing information](https://grocer.nz/terms-of-service) | Medium |
| The safest public route today is aggregate analysis plus methodology, not public product-level examples. | [Data.govt.nz NZGOAL database guidance](https://www.data.govt.nz/toolkit/policies/nzgoal/guidance-note-4) | [Grocer terms](https://grocer.nz/terms-of-service), [Foodstuffs terms](https://www.clubplus.co.nz/terms/online-shopping), and [Copyright Licensing NZ fair dealing guidance](https://www.copyright.co.nz/downloads/assets/5212/1/fact-sheet%3A-fair-dealing-in-new-zealand.pdf) | Medium |

## What would change this conclusion

- Written permission from Grocer allowing public-interest publication of derived product/store/date charts or examples would move named examples from "blocked" to "permitted within the licence terms" [IPONZ copyright overview](https://www.iponz.govt.nz/get-ip/copyright/).
- Written permission from Foodstuffs, Woolworths NZ, or another relevant retailer would reduce retailer-terms uncertainty for examples naming that retailer's products, stores, app pages, or website captures [Foodstuffs online shopping terms](https://www.clubplus.co.nz/terms/online-shopping).
- A New Zealand IP/consumer-law lawyer's review of a specific article, chart, or evidence pack could support a fair-dealing/news/criticism route without permission; that review would need to assess amount copied, purpose, market effect, acknowledgement, screenshots, contract terms, and retailer wording risk [Copyright Licensing NZ fair dealing fact sheet](https://www.copyright.co.nz/downloads/assets/5212/1/fact-sheet%3A-fair-dealing-in-new-zealand.pdf).
- A public Grocer licence page, API terms, data-use policy, or open-data statement would change the analysis if it expressly allowed the relevant reuse [Grocer terms](https://grocer.nz/terms-of-service).
- A court decision, Commerce Commission position, or statutory change after 2026-07-08 could change the legal risk around databases, fair dealing, website terms, or supermarket price examples [MBIE copyright guidance](https://www.mbie.govt.nz/business-and-employment/business/intellectual-property/copyright/copyright-protection-in-new-zealand); [Commerce Commission pricing guidance](https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/).
- I could not verify Grocer's upstream data-collection permissions, any private permission from retailers to Grocer, a complete current Woolworths NZ terms extraction, or any legal advice specific to The For Good Project.

## Open follow-up questions

- Who should ask Grocer for permission, and what exact licence language would cover public-interest aggregate charts plus a small set of product examples?
- Would Consumer NZ, the Commerce Commission, or a newsroom accept a non-public evidence pack of exact examples where the public artifact shows only aggregate findings?
- What screenshot/archive workflow can preserve consumer-facing representations without breaching website/app terms or collecting personal data?

## Sources

1. Grocer. "Terms of Service." Last updated in active frontend bundle 8 April 2025; accessed 8 July 2026 by direct HTTP fetch of the SPA route and active bundle. https://grocer.nz/terms-of-service and https://grocer.nz/assets/index-CNI3SrFR.js
2. The Colab `.skills`. "`grocer-nz` skill notes." Accessed 8 July 2026. https://github.com/thecolab-ai/.skills/blob/main/skills/grocer-nz/SKILL.md
3. The For Good Project. "Grocer NZ exposes useful public price data, but not a safe bulk republication licence." Accessed 8 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/grocer-nz-data-audit.md
4. The For Good Project. "A wider 61-SKU, four-region Grocer sample supports promotion-cycling and price-gap screens, but weakens any blanket cross-chain lockstep claim." Accessed 8 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/wider-supermarket-pricing-patterns.md
5. MBIE. "Copyright protection in New Zealand." Accessed 8 July 2026 using built-in web open. https://www.mbie.govt.nz/business-and-employment/business/intellectual-property/copyright/copyright-protection-in-new-zealand
6. Data.govt.nz. "NZGOAL Guidance Note 4: Databases and datasets." Accessed 8 July 2026 using built-in web open after local text extraction did not return usable matches. https://www.data.govt.nz/toolkit/policies/nzgoal/guidance-note-4
7. Copyright Licensing New Zealand. "Fair dealing in New Zealand" fact sheet. November 2020; accessed 8 July 2026 using built-in web open. https://www.copyright.co.nz/downloads/assets/5212/1/fact-sheet%3A-fair-dealing-in-new-zealand.pdf
8. Copyright Licensing New Zealand. "Fair Dealing." Accessed 8 July 2026 by direct HTTP fetch and built-in web open. https://support.copyright.co.nz/portal/en/kb/articles/fair-dealing-cbcghw
9. IPONZ. "Copyright." Accessed 8 July 2026 using built-in web open. https://www.iponz.govt.nz/get-ip/copyright/
10. Foodstuffs. "Online Shopping Terms and Conditions." Last updated 18 May 2026; accessed 8 July 2026 by direct HTTP fetch. https://www.clubplus.co.nz/terms/online-shopping
11. Woolworths NZ. "Online Shopping, Website and App Terms and Conditions." Access attempted 8 July 2026 by built-in web open and repo fetch ladder; page resolved as a dynamic app shell in this environment. https://www.woolworths.co.nz/info/terms-and-conditions/online-shopping-website-and-app
12. Fair Trading Act 1986, New Zealand Legislation, latest version URL accessed 8 July 2026; direct fetch was bot-protected in this environment, so the statutory summary is corroborated with Consumer Protection and Commerce Commission guidance. https://www.legislation.govt.nz/act/public/1986/121/en/latest/whole.html
13. Consumer Protection. "Fair Trading Act." Accessed 8 July 2026. https://www.consumerprotection.govt.nz/general-help/consumer-laws/fair-trading-act
14. Commerce Commission. "Pricing your products or services." Accessed 8 July 2026. https://www.comcom.govt.nz/business/dealing-with-typical-situations/selling-goods-and-services/pricing-your-products-or-services/
15. The For Good Project. "Evidence-threshold method for supermarket reference-pricing." Accessed 8 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/other/supermarket-pricing-method.md
