---
title: "What NZ can learn from Australia, England and OECD long-term-care models without importing their failures"
domain: "other"
issue: "#519"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5.3-codex-spark"
date: "2026-07-05"
status: "draft"
---

# What NZ can learn from Australia, England and OECD long-term-care models without importing their failures

## Executive answer

- NZ can import a **single public comparison layer** for aged-care quality: both Australia and England publish service-level evidence pathways where families can compare providers with clear quality categories, and NZ already has some provider-facing quality channels it could extend similarly. [My Aged Care home costs and fees](https://www.myagedcare.gov.au/aged-care-home-costs-and-fees), [About Star Ratings](https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/about-star-ratings), [How we reach a rating](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/reach-rating), [How we publish our findings](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/how-we-publish-our-findings)
- NZ should avoid copying both systems “as-is”: Australia has explicit **no-rating** states for data and participation gaps, and England has a formal set of service classes that are legally non-rated; both reduce apparent transparency at the margins unless the gap is explained in user-facing design. [How there is no rating](https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/how-star-ratings-works), [Services we do not rate](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/services-we-do-not-rate), [Services we do not rate](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/calculating-the-first-scores-using-our-new-approach)
- NZ should not treat means testing alone as the affordability fix; both systems (as described in OECD analysis and England’s charging framework) show residual affordability pressure among users with low assets/limited income when thresholds and subsidy depth interact with market costs. [NHS paying for your own care](https://www.nhs.uk/social-care-and-support/money-work-and-benefits/paying-for-your-own-care-self-funding/), [Social care charging circular](https://www.gov.uk/government/publications/social-care-charging-for-local-authorities-2025-to-2026/social-care-charging-for-care-and-support-2025-to-2026-local-authority-circular), [OECD report](https://www.oecd.org/en/publications/is-care-affordable-for-older-people_450ea778-en.html), [OECD PDF](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/10/is-care-affordable-for-older-people_43625a72/450ea778-en.pdf)
- NZ can learn from Australia’s stronger **explicit staffing visibility** in public ratings, but should decide whether to add a separate staffing metric before rolling out any single-score architecture. [About Star Ratings](https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/about-star-ratings)

**Overall confidence:** Medium — source set is official and directly about the three target systems, but NZ-level causal performance effects are not tested here.

## Evidence

### 1) Quality transparency and public comparability

- Australia built an explicit public rating layer with one Overall Star Rating plus four sub-categories (Residents’ Experience, Compliance, Staffing, Quality Measures), and explains these are intended for family/caller comparison. Confidence: **High**. [About Star Ratings](https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/about-star-ratings)
- Australia publishes updates at mixed intervals and recomputes aggregate ratings when new data arrives: Residents’ Experience and Staffing/Quality Measures update quarterly, while Compliance updates daily on new regulatory outcomes. Confidence: **High**. [How Star Ratings work](https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/how-star-ratings-works), [How Star Ratings are calculated](https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/how-star-ratings-works)
- England/CQC moved to an explicit scoring system from 2 Dec 2024: quality statements are scored 1–4, then aggregated to key-question percentages and key-question thresholds before service-level judgement. Confidence: **High**. [How we reach a rating](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/reach-rating)
- For rated services, CQC explicitly publishes key-question rating, score and quality statement score/summary; for non-rated services it publishes “regulations met/not met” style regulatory judgements rather than scores. Confidence: **High**. [How we publish our findings](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/how-we-publish-our-findings), [How we reach a rating](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/reach-rating), [Services we do not rate](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/services-we-do-not-rate)
- England and Australia provide guidance on assessment timing and evidence cadence that is changing from periodic inspection to more continuous assessment updates, which should be expected if NZ imports this model. Confidence: **Medium**. [How often we assess](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/how-often-we-assess), [Differences from previous model](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/differences-our-previous-model), [How Star Ratings work](https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/how-star-ratings-works)

### 2) Staffing as a metric

- Australia defines Staffing as a separate rating area and states it is measured from care-time data across registered nurses, enrolled nurses, personal care workers and assistants in nursing. Confidence: **High**. [About Star Ratings](https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/about-star-ratings)
- Australia’s Star Ratings are updated using mixed evidence streams including care minutes, residents’ experience survey, and national quality indicator/ regulatory decision data. Confidence: **High**. [How Star Ratings are calculated](https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/how-star-ratings-works), [About Star Ratings](https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/about-star-ratings)
- NZ should not assume staff detail exists as a single score in England’s model: CQC’s published structure is keyed on quality statements and evidence categories and does not map to one obvious standalone staffing-only public index. Confidence: **Medium**. [How we gather evidence](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/how-we-gather-evidence), [How we reach a rating](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/reach-rating)

### 3) Resident means testing

- Australia’s framework uses means-based categories for care and accommodation; My Aged Care states some residents pay none/partial accommodation costs depending on means and that means status is determined by income and assets. Confidence: **High**. [My Aged Care home costs and fees](https://www.myagedcare.gov.au/aged-care-home-costs-and-fees)
- Australia publishes explicit low-means thresholds and rules (for example the published income/assets guide in the page for full accommodation assistance) and separate accommodation payment options. Confidence: **Medium**. [My Aged Care home costs and fees](https://www.myagedcare.gov.au/aged-care-home-costs-and-fees)
- England’s social-care charge structure in the linked DHSC circular ties full self-funding to assets above upper capital limits and includes a taper of £1/week for each £250 of capital above the lower threshold. Confidence: **High**. [Social care charging circular](https://www.gov.uk/government/publications/social-care-charging-for-local-authorities-2025-to-2026/social-care-charging-for-care-and-support-2025-to-2026-local-authority-circular)
- NHS continuing-care guidance for England explicitly separates health-funded entitlement from local-council support via assessment outcomes, including 28-day/48-hour pathways and reassessment rules for continuing eligibility. Confidence: **High**. [NHS continuing healthcare](https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/)
- NHS self-funding guidance confirms a hard means bar for local authority support (e.g., savings above upper capital limit and ownership constraints). Confidence: **High**. [Paying for your own care (self-funding)](https://www.nhs.uk/social-care-and-support/money-work-and-benefits/paying-for-your-own-care-self-funding/)

### 4) Accommodation charges and subsidisation design

- Australia requires written written accommodation agreements before entry and separates room-payment structures (full payment, refundable/non-refundable daily options, combinations) with means-based assistance for some residents. Confidence: **High**. [My Aged Care home costs and fees](https://www.myagedcare.gov.au/aged-care-home-costs-and-fees)
- Australia includes a capped daily/lifetime contribution structure for means-tested care fees and accommodation costs, but pages also warn about changing indexation and contribution logic, meaning implementation burden is non-trivial. Confidence: **High**. [My Aged Care home costs and fees](https://www.myagedcare.gov.au/aged-care-home-costs-and-fees)
- England’s local authority charge architecture also leaves responsibility where capital is above limits, with explicit tapering rules and means-based calculations for contributions. Confidence: **High**. [Social care charging circular](https://www.gov.uk/government/publications/social-care-charging-for-local-authorities-2025-to-2026/social-care-charging-for-care-and-support-2025-to-2026-local-authority-circular)
- The NHS/England charging guidance indicates that eligibility is based on assessed need and does not directly layer a simple “asset threshold only” rule across all long-term support pathways; this is a navigation complexity that NZ should avoid if mirroring. Confidence: **Medium**. [NHS continuing healthcare](https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/)

### 5) Known implementation risks and failure modes

- Australia is explicit that some homes can show “No rating” for reasons including new ownership, data/IT issues, non-participation in annual surveys, and temporary exemptions; this is a direct implementation boundary. Confidence: **High**. [If there is no rating](https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/how-star-ratings-works)
- CQC documents model migration and notes that some service types remain legally non-rated and are assessed without key-question scores or overall ratings, so NZ should avoid publishing “no score” as “no signal.” Confidence: **High**. [How we reach a rating](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/reach-rating), [Services we do not rate](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/services-we-do-not-rate), [Differences from our previous model](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/differences-our-previous-model)
- OECD’s cross-country review repeatedly reports that public support eases but often does not fully remove individual out-of-pocket burden or poverty risk for severe need cases, so NZ should treat affordability design as a system-level budget/fairness problem, not a rating design problem alone. Confidence: **Medium**. [OECD report](https://www.oecd.org/en/publications/is-care-affordable-for-older-people_450ea778-en.html), [OECD PDF](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/10/is-care-affordable-for-older-people_43625a72/450ea778-en.pdf)

## Surprising or load-bearing claims

These claims matter most for policy design decisions and are explicitly marked for evidentiary strength.

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Public support structures in developed LTC systems can leave substantial residual poverty and out-of-pocket risk despite means testing or subsidies. | [OECD report](https://www.oecd.org/en/publications/is-care-affordable-for-older-people_450ea778-en.html) | [OECD PDF](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/10/is-care-affordable-for-older-people_43625a72/450ea778-en.pdf) | Medium |
| Australia and England both need explicit handling of “no rating”/non-rated cases, because importing public ratings without this handling creates false comparability. | [If there is no rating](https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/how-star-ratings-works) | [CQC no-rating services](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/services-we-do-not-rate) | Medium |
| NZ should not prioritise a single subsidy lever before testing its staffing and transparency layers; design choices are likely to fail on operational burden first. | [How Star Ratings are updated](https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/how-star-ratings-works) | [How often we assess](https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/how-often-we-assess) | Medium |

## What would change this conclusion

- If NZ had direct, local outcome evaluations (hospitalisation, service exit, user-reported dignity/safety outcomes, and appeals burden) tied to these designs, the conclusion would move from design-level guidance to rollout sequencing and capacity planning.
- If NZ had official pilot evidence on administrative costs and provider data-quality rates for each design element, we could better judge which features to import first.
- If England’s and Australia’s published fee pages were updated with audited post-implementation result summaries for older users and providers, we should revise all operational confidence upward or downward.
- If NZ legal/regulatory duties differ materially from the legal duty model in CQC (especially around publication rights), those differences would change whether NZ should adopt comparable transparency publication rules.

### What I could not verify from sources

- NZ-specific legal compatibility constraints for privacy, publication liability, and provider rights are not in the provided sources and would need local legal review.
- Real-world NZ equity outcomes of importing any one element (staff metric, accommodation design, means-test rules) because these would require NZ-specific administrative or partner evaluation data not publicly available in the provided source set.
- Provider-level implementation costs (IT, assessment staffing, training, and enforcement workload) for a NZ rollout.

## Open follow-up questions

- Which NZ policy layer should lead implementation: public provider comparison, staffing transparency, or accommodation/means-test architecture?
- What NZ legal text would define the minimum disclosure standard when a provider is intentionally non-rated/unrated?
- What cap-and-assistance designs in NZ can prevent high out-of-pocket burden during the first years of any transition?

## Sources

1. Australian Government, Department of Health, Disability and Ageing. "About Star Ratings". 2026. Accessed 5 July 2026. https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/about-star-ratings
2. Australian Government, Department of Health, Disability and Ageing. "How Star Ratings works". 2026. Accessed 5 July 2026. https://www.health.gov.au/our-work/star-ratings-for-residential-aged-care/how-star-ratings-works
3. My Aged Care. "Aged care home costs and fees". 2026. Accessed 5 July 2026. https://www.myagedcare.gov.au/aged-care-home-costs-and-fees
4. Care Quality Commission. "How we reach a rating". 2025. Accessed 5 July 2026. https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/reach-rating
5. Care Quality Commission. "How we publish our findings". 2025. Accessed 5 July 2026. https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/how-we-publish-our-findings
6. Care Quality Commission. "Services we do not rate". 2025. Accessed 5 July 2026. https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/services-we-do-not-rate
7. Care Quality Commission. "Differences from our previous model". 2024. Accessed 5 July 2026. https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/differences-our-previous-model
8. Care Quality Commission. "How often we assess". 2024. Accessed 5 July 2026. https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/how-often-we-assess
9. Care Quality Commission. "How we gather evidence". 2024. Accessed 5 July 2026. https://www.cqc.org.uk/guidance-regulation/providers/assessment/assessing-quality-and-performance/how-we-gather-evidence
10. NHS. "NHS continuing healthcare". 2024. Accessed 5 July 2026. https://www.nhs.uk/social-care-and-support/money-work-and-benefits/nhs-continuing-healthcare/
11. NHS. "Paying for your own care (self-funding)". 2024. Accessed 5 July 2026. https://www.nhs.uk/social-care-and-support/money-work-and-benefits/paying-for-your-own-care-self-funding/
12. UK Department for Health and Social Care. "Social care charging for care and support 2025 to 2026". 2025. Accessed 5 July 2026. https://www.gov.uk/government/publications/social-care-charging-for-local-authorities-2025-to-2026/social-care-charging-for-care-and-support-2025-to-2026-local-authority-circular
13. OECD. "Is Care Affordable for Older People?" 2024. Accessed 5 July 2026. https://www.oecd.org/en/publications/is-care-affordable-for-older-people_450ea778-en.html
14. OECD. "Is Care Affordable for Older People?" PDF. 2024. Accessed 5 July 2026. https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/10/is-care-affordable-for-older-people_43625a72/450ea778-en.pdf
