---
title: "Small NZ consumer-credit costs are scenario-specific, not product-table comparable"
domain: "other"
issue: "#67"
parent: "#60"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5"
date: "2026-07-02"
status: "draft"
---

# Small NZ consumer-credit costs are scenario-specific, not product-table comparable

Part of #60. Stream: #60.

## Executive answer

- Public NZ data supports comparing small-credit products by scenario, not as one flat table: the CCCFA framework covers loans, agreed overdrafts, BNPL accounts and buying on credit, while RBNZ publishes personal consumer lending and credit-card balances as separate statistical series. [Consumer Protection, accessed 2 Jul 2026](https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do); [RBNZ C5, released 30 Jun 2026](https://www.rbnz.govt.nz/statistics/series/lending-and-monetary/registered-banks-and-non-bank-lending-institutions-sector-lending); [RBNZ C12, released 22 Jun 2026](https://www.rbnz.govt.nz/statistics/series/lending-and-monetary/credit-card-balances)
- A first transparency artifact could use four illustrative scenarios: a $200 retail purchase repaid over six weeks, a $500 cash-flow gap repaid within 30-90 days, a $2,000-$3,000 unsecured personal loan over 12 months, and a $500-$2,000 personal-loan scenario for borrowers who may not meet mainstream-bank criteria. This is my scenario-design recommendation from the issue scope and product disclosures, not a claim that public data proves these are the most common pathways for money-tight borrowers. [Issue #67, accessed 2 Jul 2026](https://github.com/thecolab-ai/the-for-good-project/issues/67); [Consumer Protection, accessed 2 Jul 2026](https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do)
- BNPL late-fee caps are the main borrower-facing cost risk in the examples here: Afterpay discloses no interest and no fees when paid on time, with late fees capped at the lower of 25% of the order value or $68; Zip Pay in 4 discloses no interest or establishment/admin/account fees and caps late fees at $40 per agreement. [Afterpay NZ terms, effective 17 Oct 2024, accessed 2 Jul 2026](https://www.afterpay.com/en-nz/terms-of-service); [Zip NZ Pay in 4 terms, accessed 2 Jul 2026](https://zip.co/nz/pay-in-4-terms-conditions/)
- Bank overdrafts and credit cards can be cheaper than non-bank instalment loans for short cash needs if the borrower already qualifies and repays quickly, but they are not interchangeable with BNPL because they can provide cash and revolving credit while BNPL is tied to participating purchases. [Kiwibank overdraft page, accessed 2 Jul 2026](https://www.kiwibank.co.nz/personal-banking/overdraft/); [Kiwibank credit-card rates page, accessed 2 Jul 2026](https://www.kiwibank.co.nz/personal-banking/credit-cards/rates-and-fees/)
- Overall, the total-cost comparison should show both "on-time cost" and "stress cost if a payment is missed", because late/default fees and eligibility exclusions change the result more than headline interest rates for very small amounts. It should also show no-interest community finance separately where a borrower and need are eligible, because those loans are not interchangeable with cash loans or urgent day-to-day living costs. [Consumer Protection, accessed 2 Jul 2026](https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do); [MSD microfinance page, accessed 2 Jul 2026](https://www.msd.govt.nz/what-we-can-do/providers/building-financial-capability/microfinance-debt-solutions.html); [Good Shepherd NZ no-interest loans, accessed 2 Jul 2026](https://goodshepherd.org.nz/get-support/our-services/loans/)

**Overall confidence:** Medium - product-level costs are calculable from public disclosures, but public data does not show exactly which products "money-tight" borrowers choose in each situation.

## Evidence

### What product types belong in scope

The relevant product universe is broader than bank personal loans: Consumer Protection says CCCFA responsible-lending rules apply to mortgages, loans, agreed overdrafts, BNPL accounts, buying on credit, truck shops, consumer leases and home buy-backs. [Consumer Protection, accessed 2 Jul 2026](https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do)

RBNZ's C5 sector-lending series summarises lending by banks and non-bank lending institutions across housing, personal, business and agricultural lending; RBNZ's statistical-series data-file index lists an `hc5.xlsx` file for that series. I removed the earlier exact May 2026 dollar figures because I could not re-download the spreadsheet in this rework environment without hitting RBNZ access blocking. [RBNZ C5, released 30 Jun 2026](https://www.rbnz.govt.nz/statistics/series/lending-and-monetary/registered-banks-and-non-bank-lending-institutions-sector-lending); [RBNZ data-file index, accessed 2 Jul 2026](https://www.rbnz.govt.nz/statistics/series/data-file-index-page)

RBNZ's C12 credit-card-balances series covers New Zealand credit-card balances and average interest rates; the data-file index lists separate C12 daily-average and month-end spreadsheets. RBNZ defines credit cards as revolving credit facilities that can be used for transactions up to a pre-arranged limit. [RBNZ C12, released 22 Jun 2026](https://www.rbnz.govt.nz/statistics/series/lending-and-monetary/credit-card-balances); [RBNZ data-file index, accessed 2 Jul 2026](https://www.rbnz.govt.nz/statistics/series/data-file-index-page)

BNPL is in scope because MBIE says new BNPL consumer protections took effect from 2 September 2024, and Afterpay's NZ terms describe its agreement as a revolving credit contract under the Credit Contracts and Consumer Finance Act 2003. [MBIE BNPL, accessed 2 Jul 2026](https://www.mbie.govt.nz/business-and-employment/consumer-protection/buy-now-pay-later); [Afterpay NZ terms, effective 17 Oct 2024, accessed 2 Jul 2026](https://www.afterpay.com/en-nz/terms-of-service)

The Commerce Commission's personal-banking market-study page says its final report was published on 20 August 2024 and found New Zealand's four largest banks - ANZ, ASB, BNZ and Westpac - do not face strong competition in personal banking. This is a scope-setting reason to include bank products in the comparison, but it is single-sourced here and not needed for any worked total-cost calculation. [Commerce Commission, accessed 2 Jul 2026](https://www.comcom.govt.nz/regulated-industries/projects/market-study-into-personal-banking-services/)

### Scenario 1: $200 retail purchase, repaid over six weeks

Comparable products: BNPL pay-in-4 and a credit-card purchase are comparable only for a purchase from a merchant that accepts the relevant product; an overdraft or personal loan is not like-for-like because it provides cash rather than point-of-sale purchase credit. [Afterpay NZ terms, effective 17 Oct 2024, accessed 2 Jul 2026](https://www.afterpay.com/en-nz/terms-of-service); [Kiwibank credit-card rates page, accessed 2 Jul 2026](https://www.kiwibank.co.nz/personal-banking/credit-cards/rates-and-fees/)

| Product example | Public terms used | On-time total cost on $200 | Stress cost if late | Eligibility caveat |
|---|---:|---:|---:|---|
| Afterpay Pay in 4 | Four instalments; no interest; other fees nil; late fees capped at lower of 25% of order value or $68. | $0 | Up to $50, because 25% of $200 is below the $68 cap. | Must meet identification and eligibility criteria, be at least 18, hold an eligible card, and each order is subject to approval. |
| Zip Pay in 4 | 25% charged at purchase; no interest, establishment, admin, processing, monthly, weekly or account fee; late fees capped at $40. | $0 | Up to $40, plus any bank failed-payment fees. | Spending limit depends on third-party information, Zip repayment history, merchant and outstanding Zip payments. |
| Kiwibank Zero Visa purchase | Kiwibank rates API lists Zero Visa purchase rate at 12.90% p.a.; interest-free period applies only if the whole balance is paid by due date. | $0 if the full statement balance is paid by the due date; about $2.97 if the $200 is interest-bearing for 42 days at 12.90% simple daily interest. | Not modelled because late-payment/default terms vary by card contract. | Requires an approved credit-card account and available limit. |

Sources for the table: [Afterpay NZ terms, effective 17 Oct 2024, accessed 2 Jul 2026](https://www.afterpay.com/en-nz/terms-of-service); [Zip NZ Pay in 4 terms, accessed 2 Jul 2026](https://zip.co/nz/pay-in-4-terms-conditions/); [Kiwibank credit-card rates page, accessed 2 Jul 2026](https://www.kiwibank.co.nz/personal-banking/credit-cards/rates-and-fees/); [Kiwibank public rates API, accessed 2 Jul 2026](https://rates.kiwibank.co.nz/api/v1/rates)

### Scenario 2: $500 cash-flow gap, repaid within 30-90 days

Comparable products: an arranged overdraft and a credit-card cash advance are comparable because both can provide cash or cash-equivalent access; BNPL is not comparable because it is purchase-linked; most bank personal loans are not comparable at $500 because public bank examples commonly have higher minimum loan amounts. [Kiwibank overdraft page, accessed 2 Jul 2026](https://www.kiwibank.co.nz/personal-banking/overdraft/); [Kiwibank credit-card rates page, accessed 2 Jul 2026](https://www.kiwibank.co.nz/personal-banking/credit-cards/rates-and-fees/); [ASB personal loans, accessed 2 Jul 2026](https://www.asb.co.nz/personal-loans)

| Product example | Public terms used | Approximate total cost |
|---|---:|---:|
| Kiwibank arranged overdraft | No account-management fee and no application fee; Kiwibank public rates API lists authorised overdraft at 16.90% p.a. | About $6.95 for 30 days or $20.84 for 90 days on $500 using simple daily interest. |
| Kiwibank unauthorised overdraft | Kiwibank public rates API lists unauthorised overdraft at 22.00% p.a.; Kiwibank says unauthorised rate applies if the account goes negative or exceeds an agreed limit. | About $9.04 for 30 days or $27.12 for 90 days on $500 using simple daily interest, before any service fees. |
| Kiwibank Zero Visa cash advance | Kiwibank's credit-card rates page labels the relevant row "interest rate on purchases and cash advances"; the page's rate feed lists Zero Visa cash advances at 12.90% p.a.; Kiwibank says interest-free periods do not apply to cash advances. | Interest component only: about $5.30 for 30 days or $15.90 for 90 days on $500 using simple daily interest, before any cash-advance transaction or service fees not captured by the rate feed. This should not be ranked against an overdraft without the full transaction-fee schedule. |

Sources for the table: [Kiwibank overdraft page, accessed 2 Jul 2026](https://www.kiwibank.co.nz/personal-banking/overdraft/); [Kiwibank credit-card rates page, accessed 2 Jul 2026](https://www.kiwibank.co.nz/personal-banking/credit-cards/rates-and-fees/); [Kiwibank public rates API, accessed 2 Jul 2026](https://rates.kiwibank.co.nz/api/v1/rates)

Kiwibank's overdraft page says overdraft applicants must be 18 or over, meet residency or eligible work-visa conditions, and have good credit history; it defines good credit history as not having been declared bankrupt and having no unpaid defaults or collections. [Kiwibank overdraft page, accessed 2 Jul 2026](https://www.kiwibank.co.nz/personal-banking/overdraft/)

### Scenario 3: $2,000-$3,000 unsecured bank personal loan over 12 months

Comparable products: unsecured bank personal loans are comparable to each other only when loan amount, term, fees, repayment frequency and borrower eligibility are aligned; they are not comparable to BNPL because they fund cash needs and have different minimum amounts and terms. [ASB personal loans, accessed 2 Jul 2026](https://www.asb.co.nz/personal-loans); [ANZ personal loans, accessed 2 Jul 2026](https://www.anz.co.nz/personal/loans/)

ASB discloses a fixed personal-loan rate of 13.90% p.a., no loan processing fee, no early repayment charges or fees for extra online payments, a minimum unsecured/debt-consolidation loan amount of $2,000, and a 6-month to 7-year term range. [ASB personal loans, accessed 2 Jul 2026](https://www.asb.co.nz/personal-loans); [ASB personal loan rates and fees, accessed 2 Jul 2026](https://www.asb.co.nz/personal-loans/interest-rates-and-fees.html)

ANZ discloses personal-loan amounts of $3,000-$50,000, terms of 6 months to 7 years, no application fee, no fees for changing repayment amount or paying the loan off early, and eligibility requirements including regular income and enough money left after expenses to meet repayments. [ANZ personal loans, accessed 2 Jul 2026](https://www.anz.co.nz/personal/loans/)

Using a standard weekly amortisation formula, a $2,000 ASB loan over 52 weeks at 13.90% p.a. and no loan-processing fee would require about $41.25 per week and total about $2,144.89, for about $144.89 interest cost. [ASB personal loans, accessed 2 Jul 2026](https://www.asb.co.nz/personal-loans)

The ASB calculation is more comparable to another no-fee bank personal loan than to a $500 emergency loan, because ASB's disclosed minimum amount is $2,000 and ANZ's disclosed standard minimum amount is $3,000. [ASB personal loans, accessed 2 Jul 2026](https://www.asb.co.nz/personal-loans); [ANZ personal loans, accessed 2 Jul 2026](https://www.anz.co.nz/personal/loans/)

### Scenario 4: $500-$2,000 non-bank personal loan where bank eligibility may fail

Comparable products: non-bank personal loans can be compared with bank personal loans for the same amount and term, but the comparison must disclose that rate, security and approval criteria may differ materially. The scenario also needs a caveat for no-interest community finance and credit-union products, because those can be materially cheaper for eligible borrowers but have different eligibility, purpose and timing constraints. [Consumer Protection, accessed 2 Jul 2026](https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do); [Instant Finance personal loan, accessed 2 Jul 2026](https://instantfinance.co.nz/personal-loan/); [MSD microfinance page, accessed 2 Jul 2026](https://www.msd.govt.nz/what-we-can-do/providers/building-financial-capability/microfinance-debt-solutions.html); [Unity personal loans, accessed 2 Jul 2026](https://unitymoney.co.nz/get-a-loan/personal-loans/)

Instant Finance discloses personal loans from $500 to $50,000 depending on income, expenses and credit history, and says secured or unsecured loan type depends on circumstances, affordability, available security, credit record and responsible borrowing. [Instant Finance personal loan, accessed 2 Jul 2026](https://instantfinance.co.nz/personal-loan/)

Instant Finance discloses annual interest rates from 9.95% to 29.95%, a loan establishment fee from $100 to $220 depending on new money borrowed, a $7.70 remote digital and biometric ID verification fee, and a $3 administration fee per instalment. [Instant Finance application/rates page, accessed 2 Jul 2026](https://instantfinance.co.nz/how-to-get-a-loan/)

Using the disclosed Instant Finance calculator fee band for $200-$500, a $500 loan over 13 weekly instalments at 29.95% p.a. with $107.70 establishment/ID setup fees financed into the balance and a $3 weekly administration fee would total about $671.48, for about $171.48 in interest and fees above the $500 borrowed. Fee decomposition: $107.70 setup fee, $39 administration fees, and about $24.78 interest under the weekly-amortisation assumption below. [Instant Finance application/rates page, accessed 2 Jul 2026](https://instantfinance.co.nz/how-to-get-a-loan/)

Using the same method and the disclosed Instant Finance calculator fee band for $500.01-$5,000, a $2,000 loan over 52 weekly instalments at 29.95% p.a. with $227.70 establishment/ID setup fees financed into the balance and a $3 weekly administration fee would total about $2,740.29, for about $740.29 in interest and fees above the $2,000 borrowed. Fee decomposition: $227.70 setup fee, $156 administration fees, and about $356.59 interest under the weekly-amortisation assumption below. [Instant Finance application/rates page, accessed 2 Jul 2026](https://instantfinance.co.nz/how-to-get-a-loan/)

No-interest community finance is a material counterexample to treating commercial non-bank loans as the cheapest reachable option for every borrower who may fail bank criteria. MSD says Good Shepherd provides no-interest, fee-free Good Loans for people on low incomes for uses such as debt consolidation, car purchase and essential items/services, and that Ngā Tāngata Microfinance provides interest-free loans of up to $5,000; Good Shepherd says Good Loans cannot be used for cash, day-to-day living costs, urgent needs, rent arrears or overdue bills, and Ngā Tāngata says its loans are a last-resort pathway for high-interest debt, essential items, family wellbeing and asset purchases through financial mentors. [MSD microfinance page, accessed 2 Jul 2026](https://www.msd.govt.nz/what-we-can-do/providers/building-financial-capability/microfinance-debt-solutions.html); [Good Shepherd NZ no-interest loans, accessed 2 Jul 2026](https://goodshepherd.org.nz/get-support/our-services/loans/); [Ngā Tāngata Microfinance, accessed 2 Jul 2026](https://www.ngatangatamicrofinance.org.nz/do-i-qualify/)

Credit unions are another non-bank comparator rather than an automatic fit for the commercial-lender scenario: Unity discloses personal-loan amounts from $2,000 for secured and unsecured loans, unsecured floating interest rates of 12.90%-22.90% p.a., a $200 approval fee, and loan terms of 1-7 years. [Unity personal loans, accessed 2 Jul 2026](https://unitymoney.co.nz/get-a-loan/personal-loans/)

High-cost lending should be treated as a separate warning scenario rather than blended into ordinary personal loans: MBIE says the CCCFA defines high-cost consumer credit contracts as contracts with an average annual interest rate of 50% or greater, or where combined annual interest and default rate are likely to be 50% or more; MBIE also lists a total cost cap equal to the first loan advance, a 0.8% maximum daily rate cap, a presumption that default fees over $30 are unreasonable, a ban on compound interest, and repeat-borrower restrictions. [MBIE high-cost credit review page, last updated 22 May 2024, accessed 2 Jul 2026](https://www.mbie.govt.nz/business-and-employment/business/financial-markets-conduct-regulation/2024-financial-services-reforms/fit-for-purpose-consumer-credit-legislation-high-cost-credit-contracts-provisions)

### Calculation assumptions

The simple-interest examples use `amount * annual_rate * days / 365`, and the instalment-loan examples use weekly amortisation with weekly rate `annual_rate / 52`; these are transparent arithmetic assumptions, not lender quotes. In the Instant Finance examples, disclosed setup fees are modelled as financed into the loan balance and per-instalment administration fees are added outside the amortised payment.

Fees included in the calculations are only fees expressly disclosed in the cited product pages; bank dishonour fees, debt-collection costs, default interest and hardship arrangements are excluded unless the scenario states otherwise. [Consumer Protection, accessed 2 Jul 2026](https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| A flat product table would be misleading because the legal/product universe includes loans, agreed overdrafts, BNPL and buying on credit, while official RBNZ data separates personal consumer lending and credit-card balances. | [Consumer Protection](https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do) | [RBNZ C5](https://www.rbnz.govt.nz/statistics/series/lending-and-monetary/registered-banks-and-non-bank-lending-institutions-sector-lending) and [RBNZ C12](https://www.rbnz.govt.nz/statistics/series/lending-and-monetary/credit-card-balances) | High |
| BNPL on-time cost can be $0 while late fees dominate the realistic downside for a small purchase. | [Afterpay NZ terms](https://www.afterpay.com/en-nz/terms-of-service) | [Zip NZ Pay in 4 terms](https://zip.co/nz/pay-in-4-terms-conditions/) | High |
| Public data found for this issue does not prove which products specifically "money-tight" borrowers use for each small-credit need. This is explicitly a data-gap claim, not a two-source positive finding. | [RBNZ C5](https://www.rbnz.govt.nz/statistics/series/lending-and-monetary/registered-banks-and-non-bank-lending-institutions-sector-lending) and [RBNZ C12](https://www.rbnz.govt.nz/statistics/series/lending-and-monetary/credit-card-balances) show aggregate product series from one source family. | [FinCap Voices 2025](https://fincap.org.nz/images/fincap-voices-report-2025.pdf?_cchid=d38904d07c9a450c991dfc33fc4c7994) says financial-mentor client data gives hardship insights beyond regular national data sources, but it does not provide a public product-choice distribution for the scenarios here. | Medium |
| A $500 non-bank instalment loan can cost far more than a short arranged overdraft, but eligibility and security differences prevent a clean substitution claim. | [Kiwibank overdraft page](https://www.kiwibank.co.nz/personal-banking/overdraft/) | [Instant Finance application/rates page](https://instantfinance.co.nz/how-to-get-a-loan/) | Medium |
| The Commerce Commission's finding that the four largest banks do not face strong competition is relevant context for comparison work, but it is not independently verified in this finding. | [Commerce Commission market-study page](https://www.comcom.govt.nz/regulated-industries/projects/market-study-into-personal-banking-services/) | Not independently corroborated here; the claim is single-sourced and not used in the arithmetic. | Medium |

## What would change this conclusion

- Borrower-level NZ data showing which small-credit products low-income or financially stressed borrowers actually use by need type would change the scenario weights; I found aggregate product data and financial-mentor hardship context, but not a current public borrower-level product-mix dataset for these scenarios. [RBNZ C5, released 30 Jun 2026](https://www.rbnz.govt.nz/statistics/series/lending-and-monetary/registered-banks-and-non-bank-lending-institutions-sector-lending); [RBNZ C12, released 22 Jun 2026](https://www.rbnz.govt.nz/statistics/series/lending-and-monetary/credit-card-balances); [FinCap Voices 2025, accessed 2 Jul 2026](https://fincap.org.nz/images/fincap-voices-report-2025.pdf?_cchid=d38904d07c9a450c991dfc33fc4c7994)
- Lender-provided representative disclosure statements for the exact same amount, term and repayment frequency would improve the instalment-loan calculations; the calculations here use public rates/fees and standard amortisation rather than binding quotes. [Consumer Protection, accessed 2 Jul 2026](https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do)
- A human financial mentor or budgeting-service practitioner should review whether the four scenarios match real client pathways, because public webpages cannot show what people do after being declined by a bank or BNPL provider.
- The scenario set should be expanded or reprioritised if follow-up research shows credit unions, no-interest community lenders, high-cost lenders, earned-wage-access products, wage advances or truck-shop/deferred-payment products are more common in real client pathways than the examples used here. [MSD microfinance page, accessed 2 Jul 2026](https://www.msd.govt.nz/what-we-can-do/providers/building-financial-capability/microfinance-debt-solutions.html); [Unity personal loans, accessed 2 Jul 2026](https://unitymoney.co.nz/get-a-loan/personal-loans/)
- I could not re-download RBNZ's `hc5.xlsx` or C12 spreadsheets in this environment because the RBNZ media-file URLs returned an access-restricted HTML page instead of spreadsheets. I therefore removed the earlier exact May 2026 dollar figures and only use RBNZ here for the existence and scope of the statistical series. [RBNZ data-file index, accessed 2 Jul 2026](https://www.rbnz.govt.nz/statistics/series/data-file-index-page)
- I could not verify Westpac credit-card rates in this environment because the relevant Westpac pages returned a 403 response to command-line fetches; I therefore used Kiwibank's public rates API for the worked card examples.
- I could not extract Kiwibank's current credit-card terms PDF locally because the document link returned an HTML placeholder to command-line fetches. The Kiwibank credit-card rates page itself confirms the interest-rate row applies to purchases and cash advances and that interest-free periods do not apply to cash advances; transaction fees outside the rate table are not included in the cash-advance arithmetic. [Kiwibank credit-card rates page, accessed 2 Jul 2026](https://www.kiwibank.co.nz/personal-banking/credit-cards/rates-and-fees/)
- I could not extract the Commerce Commission final-report PDF locally because `pdfinfo` and `pdftotext` were unavailable, so I cited the Commission's readable market-study page rather than making PDF-only claims.

## Open follow-up questions

- Which NZ hardship, budgeting and financial-mentoring services see BNPL, overdraft, credit-card, bank-loan and non-bank-loan debts most often, and what referral path would they consider useful?
- Which lender disclosure documents provide machine-readable total-cost examples for identical $500, $2,000 and $3,000 scenarios?
- How should a transparency artifact present missed-payment scenarios without nudging borrowers toward products for which they are unlikely to qualify?
- Which no-interest community-finance, credit-union, high-cost credit, earned-wage-access and wage-advance products should be modelled in the next comparison pass?

## Sources

1. Consumer Protection, "What lenders must do", accessed 2 July 2026. https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do
2. Reserve Bank of New Zealand, "Registered banks and non-bank lending institutions: Sector lending (C5)", released 30 June 2026, accessed 2 July 2026. https://www.rbnz.govt.nz/statistics/series/lending-and-monetary/registered-banks-and-non-bank-lending-institutions-sector-lending
3. Reserve Bank of New Zealand, "Credit card balances (C12)", released 22 June 2026, accessed 2 July 2026. https://www.rbnz.govt.nz/statistics/series/lending-and-monetary/credit-card-balances
4. Reserve Bank of New Zealand, "Statistical series data files page", accessed 2 July 2026. https://www.rbnz.govt.nz/statistics/series/data-file-index-page
5. Commerce Commission, "Market study into personal banking services", accessed 2 July 2026. https://www.comcom.govt.nz/regulated-industries/projects/market-study-into-personal-banking-services/
6. MBIE, "Buy Now Pay Later", accessed 2 July 2026. https://www.mbie.govt.nz/business-and-employment/consumer-protection/buy-now-pay-later
7. MBIE, "Fit for purpose consumer credit legislation - high-cost credit contracts provisions", last updated 22 May 2024, accessed 2 July 2026. https://www.mbie.govt.nz/business-and-employment/business/financial-markets-conduct-regulation/2024-financial-services-reforms/fit-for-purpose-consumer-credit-legislation-high-cost-credit-contracts-provisions
8. Afterpay, "Afterpay Terms - New Zealand", effective 17 October 2024, accessed 2 July 2026. https://www.afterpay.com/en-nz/terms-of-service
9. Zip, "Pay in 4 Terms and Conditions", accessed 2 July 2026. https://zip.co/nz/pay-in-4-terms-conditions/
10. Kiwibank, "Overdrafts", accessed 2 July 2026. https://www.kiwibank.co.nz/personal-banking/overdraft/
11. Kiwibank, "Compare credit card rates & fees", accessed 2 July 2026. https://www.kiwibank.co.nz/personal-banking/credit-cards/rates-and-fees/
12. Kiwibank, public rates API, accessed 2 July 2026. https://rates.kiwibank.co.nz/api/v1/rates
13. ASB, "Personal loans", accessed 2 July 2026. https://www.asb.co.nz/personal-loans
14. ASB, "Personal loan interest rates and fees", accessed 2 July 2026. https://www.asb.co.nz/personal-loans/interest-rates-and-fees.html
15. ANZ, "Personal loans", accessed 2 July 2026. https://www.anz.co.nz/personal/loans/
16. Instant Finance, "Personal Loans NZ - Fast, Flexible & Fair", accessed 2 July 2026. https://instantfinance.co.nz/personal-loan/
17. Instant Finance, "Apply for a Personal Loan", accessed 2 July 2026. https://instantfinance.co.nz/how-to-get-a-loan/
18. Ministry of Social Development, "Microfinance loans and problem debt", accessed 2 July 2026. https://www.msd.govt.nz/what-we-can-do/providers/building-financial-capability/microfinance-debt-solutions.html
19. Good Shepherd NZ, "No-interest loans", accessed 2 July 2026. https://goodshepherd.org.nz/get-support/our-services/loans/
20. Ngā Tāngata Microfinance, "Do I qualify?", accessed 2 July 2026. https://www.ngatangatamicrofinance.org.nz/do-i-qualify/
21. Unity, "Personal Loans in NZ", accessed 2 July 2026. https://unitymoney.co.nz/get-a-loan/personal-loans/
22. FinCap, "Voices 2025", accessed 2 July 2026. https://fincap.org.nz/images/fincap-voices-report-2025.pdf?_cchid=d38904d07c9a450c991dfc33fc4c7994
