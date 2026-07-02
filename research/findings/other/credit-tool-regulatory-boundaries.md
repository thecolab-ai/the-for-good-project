---
title: "An NZ small-credit transparency tool can publish education and factual comparisons, but personalised credit-product recommendations trigger financial-advice risk"
domain: "other"
issue: "#68"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-02"
status: "draft"
---

# An NZ small-credit transparency tool can publish education and factual comparisons, but personalised credit-product recommendations trigger financial-advice risk

## Executive answer

- A credit transparency tool can safely start with factual education: loan cost components, repayment scenarios, lender-published terms, eligibility criteria, warnings about high-cost credit, and links to licensed or community help, because the CCCFA is designed to promote informed participation and transparent credit markets and requires disclosure of key credit information by lenders. [Credit Contracts and Consumer Finance Act 2003, s 3 and Schedule 1](https://www.legislation.govt.nz/act/public/2003/52/en/latest/) [Consumer Protection, "What lenders must do"](https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do)
- The tool should not say "you should take Loan A", "Loan B is best for you", or rank named consumer-credit contracts as recommendations based on a user's circumstances unless it is operating within the financial advice provider regime, because FMA guidance says financial advice includes recommendations or opinions about acquiring or disposing of a financial advice product, including a consumer credit contract. [FMA, "Financial advice given for the purpose of complying with lender responsibilities"](https://www.fma.govt.nz/assets/Information-sheets/Financial-advice-lender-exclusion.pdf) [FMA, "Talking About Money Online"](https://www.fma.govt.nz/library/articles/talking-about-money-online/)
- CoFI is mainly a duty on registered banks, licensed insurers, and licensed non-bank deposit takers, not on an independent comparison/education publisher, but it matters because covered lenders must treat consumers fairly, help consumers make informed decisions, and maintain fair conduct programmes. [FMA, "Conduct of Financial Institutions (CoFI) legislation"](https://www.fma.govt.nz/business/legislation/conduct-of-financial-institutions-cofi-legislation/) [FMA, "CoFI regime now in effect"](https://www.fma.govt.nz/news/all-releases/media-releases/cofi-regime-in-effect/)
- As at 2 July 2026, CCCFA oversight has just moved from the Commerce Commission to the FMA, so the tool should describe FMA as the current credit regulator while treating older Commerce Commission guidance as historical or transitional unless the FMA republishes or confirms it. [Commerce Commission, "Transfer of responsibility for regulation of consumer credit"](https://www.comcom.govt.nz/business/transfer-of-responsibility-for-regulation-of-consumer-credit/) [FMA, "Credit Contracts and Consumer Finance Act (CCCFA)"](https://www.fma.govt.nz/business/legislation/cccfa/)
- This is regulatory research, not legal advice; the boundary between a "reality-check" and regulated advice should be confirmed with a qualified New Zealand financial-services lawyer or directly with the FMA before launch. [FMA, "Talking About Money Online"](https://www.fma.govt.nz/library/articles/talking-about-money-online/)

**Overall confidence:** Medium — the core statutory and regulator guidance is clear, but the exact boundary for an AI-assisted "reality-check" tool is fact-specific and needs legal/regulator confirmation before relying on it operationally.

## Evidence

### CCCFA: lender duties and disclosure are the base layer

The CCCFA's purpose includes protecting consumers in connection with credit contracts, promoting confident and informed participation in credit markets, and promoting fair, efficient, and transparent credit markets. [Credit Contracts and Consumer Finance Act 2003, s 3](https://www.legislation.govt.nz/act/public/2003/52/en/latest/)

The Act says it achieves those purposes by requiring creditors to be responsible lenders, requiring disclosure of adequate information before entry into and variation of consumer credit contracts, enabling consumers to distinguish between competing credit arrangements, and providing rules about interest charges, credit fees, default fees, and payments. [Credit Contracts and Consumer Finance Act 2003, s 3](https://www.legislation.govt.nz/act/public/2003/52/en/latest/)

Consumer Protection summarises the lender-facing rule as requiring lenders to act in line with the CCCFA's responsible lending principles, and says those rules apply to mortgages, loans, agreed overdrafts, BNPL accounts, buying on credit, truck shops, consumer leases, and home buy-backs. [Consumer Protection, "What lenders must do"](https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do)

For disclosure, Schedule 1 requires key information such as the creditor's identity, unpaid balance, advances, credit limit, annual interest rate, method of charging interest, total interest charges where ascertainable, credit fees and charges, payment amounts and timing, default interest and default fees, hardship rights, dispute resolution details, and high-cost-credit warnings where applicable. [Credit Contracts and Consumer Finance Act 2003, Schedule 1](https://www.legislation.govt.nz/act/public/2003/52/en/latest/)

High-cost consumer credit has specific statutory constraints, including a 0.8% per-day maximum rate of charge and a prohibition on compound interest in high-cost consumer credit contracts. [Credit Contracts and Consumer Finance Act 2003, ss 45H-45I](https://www.legislation.govt.nz/act/public/2003/52/en/latest/)

Practical implication: a transparency tool should present lender-published facts with source dates, explain assumptions for total-cost scenarios, preserve caveats where products are not comparable, and avoid implying that a lender has met or breached CCCFA duties unless the claim is current, fully evidenced, and legally reviewed. [Credit Contracts and Consumer Finance Act 2003, s 3 and Schedule 1](https://www.legislation.govt.nz/act/public/2003/52/en/latest/) [FMA, "Fair dealing"](https://www.fma.govt.nz/business/legislation/fair-dealing/)

### Regulator position changed on 1 July 2026

The Commerce Commission says the FMA took over regulatory responsibility for the CCCFA on 1 July 2026 and became the single conduct regulator for financial markets, including consumer credit. [Commerce Commission, "Transfer of responsibility for regulation of consumer credit"](https://www.comcom.govt.nz/business/transfer-of-responsibility-for-regulation-of-consumer-credit/)

The FMA's CCCFA page says the transfer date is 1 July 2026 and records the Credit Contracts and Consumer Finance Amendment Bill's third reading on 30 May 2026. [FMA, "Credit Contracts and Consumer Finance Act (CCCFA)"](https://www.fma.govt.nz/business/legislation/cccfa/)

Practical implication: user-facing regulator explanations should say "the FMA regulates consumer credit under the CCCFA from 1 July 2026" and should avoid sending users only to the Commerce Commission for CCCFA complaints unless a particular transitional issue still belongs there. [Commerce Commission, "Transfer of responsibility for regulation of consumer credit"](https://www.comcom.govt.nz/business/transfer-of-responsibility-for-regulation-of-consumer-credit/) [FMA, "CCCFA transfer frequently asked questions"](https://www.fma.govt.nz/business/legislation/cccfa/cccfa-transfer-faq/)

### CoFI: fair conduct obligations sit on covered financial institutions

The FMA says CoFI applies to registered banks, licensed insurers, and licensed non-bank deposit takers, and requires them to be licensed by the FMA for conduct towards consumers, comply with the fair conduct principle, establish/maintain/implement a fair conduct programme, and comply with incentive regulations. [FMA, "Conduct of Financial Institutions (CoFI) legislation"](https://www.fma.govt.nz/business/legislation/conduct-of-financial-institutions-cofi-legislation/)

The fair conduct principle applies when a financial institution designs, offers, provides, or has dealings with a consumer about relevant services or products; FMA summarises fair treatment as including paying due regard to consumer interests, acting ethically and transparently, assisting informed decisions, ensuring services and products are likely to meet likely consumers' requirements and objectives, and not using unfair pressure, tactics, or undue influence. [FMA, "Conduct of Financial Institutions (CoFI) legislation"](https://www.fma.govt.nz/business/legislation/conduct-of-financial-institutions-cofi-legislation/)

The FMA announced that CoFI came into full effect on 31 March 2025 and said licensed financial institutions must establish, implement, and maintain a fair conduct programme designed to ensure compliance with the fair conduct principle. [FMA, "CoFI regime now in effect"](https://www.fma.govt.nz/news/all-releases/media-releases/cofi-regime-in-effect/)

Practical implication: an independent tool is not itself a CoFI financial institution merely because it educates consumers, but if it partners with, distributes for, or is funded by a covered lender, its product design, referral flows, incentives, disclosures, and vulnerable-customer treatment may become part of that institution's fair-conduct risk management. [FMA, "Conduct of Financial Institutions (CoFI) legislation"](https://www.fma.govt.nz/business/legislation/conduct-of-financial-institutions-cofi-legislation/) [FMA, "Fair Conduct Programme"](https://www.fma.govt.nz/business/services/financial-institutions/fair-conduct-programme/)

### Financial-advice boundary: information is safer than personalised recommendations

FMA guidance for lenders says a person gives financial advice when they make a recommendation or give an opinion about acquiring or disposing of a financial advice product, and that financial advice products include consumer credit contracts. [FMA, "Financial advice given for the purpose of complying with lender responsibilities"](https://www.fma.govt.nz/assets/Information-sheets/Financial-advice-lender-exclusion.pdf)

The FMA says regulated financial advice to retail clients can only be given by a person authorised to do so under a market services licence, and its FAP page says giving regulated financial advice to retail clients without holding or operating under a FAP licence breaches the FMC Act and can lead to enforcement action. [FMA, "Financial advice given for the purpose of complying with lender responsibilities"](https://www.fma.govt.nz/assets/Information-sheets/Financial-advice-lender-exclusion.pdf) [FMA, "Financial Advice Provider (FAP)"](https://www.fma.govt.nz/business/services/financial-advice-provider/)

FMA's online-money guidance treats general information and education about kinds of financial products, and factual information about terms, conditions, or features, as OK to share, but treats regular recommendations or opinions on specific financial products as likely regulated financial advice. [FMA, "Talking About Money Online"](https://www.fma.govt.nz/library/articles/talking-about-money-online/)

The same FMA guidance warns that disclaimers are not enough if the substance of the statement is regulated advice, and says content creators should avoid recommending or giving opinions on specific financial products unless they are appropriately licensed or exempt. [FMA, "Talking About Money Online"](https://www.fma.govt.nz/library/articles/talking-about-money-online/)

FMA's investment-planning guidance says services not focused on achieving a client's investment goals, including budgeting services, insurance planning services, credit planning services, and estate planning services, will not constitute designing an investment plan; it also says a debt-repayment or borrowing recommendation can be part of an investment plan if the plan is focused on achieving investment goals. [FMA, "Investment planning and financial advice"](https://www.fma.govt.nz/business/services/financial-adviser/investment-planning-and-financial-advice/)

Practical implication: the safest design is to show factual cost comparisons and scenario outputs, then use neutral language such as "this option has the lowest total cost under the assumptions you entered", "this repayment is X% of the income you entered", "check whether you qualify for no-interest or community support", and "consider contacting a financial mentor or licensed adviser"; higher-risk language is "you should choose this lender", "this loan is suitable for you", or "do not take that product" when based on the user's personal facts. [FMA, "Talking About Money Online"](https://www.fma.govt.nz/library/articles/talking-about-money-online/) [FMA, "Financial advice given for the purpose of complying with lender responsibilities"](https://www.fma.govt.nz/assets/Information-sheets/Financial-advice-lender-exclusion.pdf)

### The lender-responsibility exclusion does not protect an independent tool

FMA's lender-exclusion information sheet says some lender-to-borrower advice can be excluded from regulated financial advice where it is given to comply with lender responsibilities or is a reasonably incidental consequence of complying with those responsibilities, and the lender has taken reasonable steps to ensure the borrower understands the advice is not regulated financial advice and the implications of that. [FMA, "Financial advice given for the purpose of complying with lender responsibilities"](https://www.fma.govt.nz/assets/Information-sheets/Financial-advice-lender-exclusion.pdf)

The same FMA information sheet says the exclusion does not mean all advice related to consumer credit contracts is outside the financial advice regime, and advice given for a reason other than complying with lender responsibilities must comply with regulated-financial-advice requirements if it is regulated financial advice. [FMA, "Financial advice given for the purpose of complying with lender responsibilities"](https://www.fma.govt.nz/assets/Information-sheets/Financial-advice-lender-exclusion.pdf)

Practical implication: a third-party education/comparison tool should not assume it can rely on the lender-responsibility exclusion, because that exclusion is framed around advice by a lender to a borrower in relation to complying with lender responsibilities. [FMA, "Financial advice given for the purpose of complying with lender responsibilities"](https://www.fma.govt.nz/assets/Information-sheets/Financial-advice-lender-exclusion.pdf)

### Misleading or confusing presentation is a separate risk

FMA's fair-dealing guidance says Part 2 of the FMC Act prohibits misleading or deceptive conduct, false/misleading/unsubstantiated representations, and certain unsolicited offers in relation to financial products and services. [FMA, "Fair dealing"](https://www.fma.govt.nz/business/legislation/fair-dealing/)

FMA says the overall impression matters, omissions can be misleading or confusing, vulnerable audiences are more susceptible to being misled or confused, and true/verifiable statements can still mislead overall if material qualifications are hidden or omitted. [FMA, "Fair dealing"](https://www.fma.govt.nz/business/legislation/fair-dealing/)

Practical implication: the tool needs strong provenance, dated sources, assumptions shown beside calculated totals, accessible caveats, and no paid placement or referral ranking that could make a comparison look independent when it is commercially influenced. [FMA, "Fair dealing"](https://www.fma.govt.nz/business/legislation/fair-dealing/) [FMA, "Talking About Money Online"](https://www.fma.govt.nz/library/articles/talking-about-money-online/)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Consumer credit contracts can be financial advice products, so product-specific recommendations about taking or not taking a consumer credit contract can create financial-advice risk. | [FMA lender-exclusion sheet](https://www.fma.govt.nz/assets/Information-sheets/Financial-advice-lender-exclusion.pdf) | [Financial Markets Conduct Act 2013 definition excerpt via NZ Legislation PDF search result](https://www.legislation.govt.nz/act/public/2013/0069/161.0/096be8ed81cb9f9c.pdf) | High |
| CCCFA regulatory responsibility moved from the Commerce Commission to the FMA on 1 July 2026. | [Commerce Commission transfer page](https://www.comcom.govt.nz/business/transfer-of-responsibility-for-regulation-of-consumer-credit/) | [FMA CCCFA page](https://www.fma.govt.nz/business/legislation/cccfa/) | High |
| Factual education and product-feature information is materially safer than recommending a specific financial product, but disclaimers alone do not prevent a statement being financial advice. | [FMA Talking About Money Online](https://www.fma.govt.nz/library/articles/talking-about-money-online/) | [FMA lender-exclusion sheet](https://www.fma.govt.nz/assets/Information-sheets/Financial-advice-lender-exclusion.pdf) | Medium |
| A budgeting or credit-planning service is not necessarily an investment plan, but debt or loan recommendations can still be part of regulated investment planning if tied to investment goals. | [FMA investment-planning guidance](https://www.fma.govt.nz/business/services/financial-adviser/investment-planning-and-financial-advice/) | No independent official second source found; needs lawyer/FMA confirmation for product design. | Medium |

## What would change this conclusion

- A written view from the FMA, MBIE, or a qualified New Zealand financial-services lawyer that a specified AI "reality-check" flow is, or is not, regulated financial advice would materially change the risk rating for product-specific nudges. [FMA, "Talking About Money Online"](https://www.fma.govt.nz/library/articles/talking-about-money-online/)
- New FMA guidance after the 1 July 2026 CCCFA transfer could change how older Commerce Commission credit guidance should be cited, relied on, or described to users. [FMA, "Credit Contracts and Consumer Finance Act (CCCFA)"](https://www.fma.govt.nz/business/legislation/cccfa/) [Commerce Commission, "Transfer of responsibility for regulation of consumer credit"](https://www.comcom.govt.nz/business/transfer-of-responsibility-for-regulation-of-consumer-credit/)
- A partnership model where a lender, broker, financial advice provider, or community organisation controls the tool's prompts, ranking, referrals, or user handoff could change the legal analysis because CoFI, FAP, advertising, referral, privacy, or dispute-resolution obligations may attach differently. [FMA, "Conduct of Financial Institutions (CoFI) legislation"](https://www.fma.govt.nz/business/legislation/conduct-of-financial-institutions-cofi-legislation/) [FMA, "Financial Advice Provider (FAP)"](https://www.fma.govt.nz/business/services/financial-advice-provider/)
- I could not verify an official FMA example for an independent, AI-assisted consumer-credit comparison tool; this specific boundary remains Medium confidence and should be checked before launch. [FMA, "Talking About Money Online"](https://www.fma.govt.nz/library/articles/talking-about-money-online/) [FMA, "Investment planning and financial advice"](https://www.fma.govt.nz/business/services/financial-adviser/investment-planning-and-financial-advice/)
- I did not assess privacy, AML/CFT, advertising standards, referral-consent, or charity-service liability; those are separate compliance questions for the later product design stage. [FMA, "Fair dealing"](https://www.fma.govt.nz/business/legislation/fair-dealing/)

## Open follow-up questions

- What wording patterns can an AI credit "reality-check" use to flag repayment stress without becoming a recommendation or opinion about acquiring, varying, or avoiding a specific consumer credit contract? [FMA, "Financial advice given for the purpose of complying with lender responsibilities"](https://www.fma.govt.nz/assets/Information-sheets/Financial-advice-lender-exclusion.pdf)
- Which referral and consent model would let the tool hand a user to a financial mentor, budget service, or licensed adviser without implying that the referred provider or pathway is personally recommended as best for the user? [FMA, "Talking About Money Online"](https://www.fma.govt.nz/library/articles/talking-about-money-online/)
- How should paid listings, affiliate links, lender sponsorship, or partner funding be disclosed so that the tool does not create a misleading overall impression of independence? [FMA, "Fair dealing"](https://www.fma.govt.nz/business/legislation/fair-dealing/)

## Sources

1. Credit Contracts and Consumer Finance Act 2003, New Zealand Legislation, accessed 2 July 2026. https://www.legislation.govt.nz/act/public/2003/52/en/latest/
2. Consumer Protection, "What lenders must do", accessed 2 July 2026. https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do
3. Commerce Commission, "Transfer of responsibility for regulation of consumer credit", accessed 2 July 2026. https://www.comcom.govt.nz/business/transfer-of-responsibility-for-regulation-of-consumer-credit/
4. Financial Markets Authority, "Credit Contracts and Consumer Finance Act (CCCFA)", page last updated 2 June 2026, accessed 2 July 2026. https://www.fma.govt.nz/business/legislation/cccfa/
5. Financial Markets Authority, "CCCFA transfer frequently asked questions", accessed 2 July 2026. https://www.fma.govt.nz/business/legislation/cccfa/cccfa-transfer-faq/
6. Financial Markets Authority, "Conduct of Financial Institutions (CoFI) legislation", accessed 2 July 2026. https://www.fma.govt.nz/business/legislation/conduct-of-financial-institutions-cofi-legislation/
7. Financial Markets Authority, "CoFI regime now in effect", 31 March 2025, accessed 2 July 2026. https://www.fma.govt.nz/news/all-releases/media-releases/cofi-regime-in-effect/
8. Financial Markets Authority, "Fair Conduct Programme", accessed 2 July 2026. https://www.fma.govt.nz/business/services/financial-institutions/fair-conduct-programme/
9. Financial Markets Authority, "Financial advice given for the purpose of complying with lender responsibilities", first published March 2020, updated June 2021, accessed 2 July 2026. https://www.fma.govt.nz/assets/Information-sheets/Financial-advice-lender-exclusion.pdf
10. Financial Markets Authority, "Talking About Money Online", 5 February 2026, accessed 2 July 2026. https://www.fma.govt.nz/library/articles/talking-about-money-online/
11. Financial Markets Authority, "Financial Advice Provider (FAP)", accessed 2 July 2026. https://www.fma.govt.nz/business/services/financial-advice-provider/
12. Financial Markets Authority, "Investment planning and financial advice", accessed 2 July 2026. https://www.fma.govt.nz/business/services/financial-adviser/investment-planning-and-financial-advice/
13. Financial Markets Authority, "Fair dealing", page last updated 20 May 2022, accessed 2 July 2026. https://www.fma.govt.nz/business/legislation/fair-dealing/
14. Financial Markets Conduct Act 2013, New Zealand Legislation PDF version excerpt indexed by search, accessed 2 July 2026. https://www.legislation.govt.nz/act/public/2013/0069/161.0/096be8ed81cb9f9c.pdf
