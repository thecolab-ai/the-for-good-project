---
stream: 60
title: "The true cost of small loans is hard for New Zealanders to see or compare"
state: awaiting-direction
steward: ""
domain: other
updated: 2026-07-02
---

<!--
The Stream Overview is written for someone who will NEVER touch GitHub or a CLI.
No jargon, no repo-speak, no issue numbers in the prose (link them instead).
Keep it under two screens — this is a briefing, not an archive.
-->

# The true cost of small loans is hard for New Zealanders to see or compare

## The problem, in plain language

When a New Zealander borrows a small amount — a personal loan, an overdraft, a
credit card, or a buy-now-pay-later purchase — the true all-in cost of that
borrowing is scattered across websites, PDFs and fine print, and is very hard
to compare. The people with the least room to absorb a surprise fee — low-income
households, people already behind on payments — are the ones hit hardest. This
stream ([tracked here](https://github.com/thecolab-ai/the-for-good-project/issues/60))
is researching whether a plain-English "help front door" — honest cost
comparison, a gentle reality-check, and a hand-off to free human help — is
feasible and safe to build.

## What we've learned so far

- **Small-credit costs only make sense as realistic scenarios, not one big
  comparison table.** A $500 short-term loan from one non-bank lender would cost
  roughly $171 in fees and interest, while the same need covered by an arranged
  bank overdraft would cost only a few dollars — but the products aren't
  interchangeable, and eligibility often decides which one a person can actually
  get. Buy-now-pay-later costs $0 if paid on time; late fees are the real
  downside. (confidence: Medium) —
  [cost scenarios](../research/findings/other/small-credit-cost-scenarios.md)
- **The cost information is public by law, but fragmented and only partly
  comparable.** Lenders must publish their standard terms and borrowing costs,
  and mostly do — but the figures live in differently-named web pages and PDFs,
  often with no visible "current as at" date, so any comparison needs careful
  record-keeping of where and when each number came from. (confidence: Medium) —
  [disclosure map](../research/findings/other/small-credit-disclosures.md)
- **The fees that hurt most are the ones charged after things go wrong.**
  Default fees, late-payment fees, and debt-collection charges pile on exactly
  when a borrower has the least room to pay, and regulators have made banks and
  finance companies repay millions for unreasonable fees. About 9% of New
  Zealanders live in material hardship, so many borrowers have no buffer at
  all. (confidence: Medium) —
  [fees and vulnerable borrowers](../research/findings/other/credit-fees-vulnerable-borrowers.md)
- **A tool can safely publish education and factual comparisons, but saying
  "you should take this loan" would likely be regulated financial advice.**
  Factual cost information and neutral reality-checks (for example "this
  repayment is a large share of the income you entered") sit on the safe side;
  personalised product recommendations need a licence, and disclaimers alone
  don't fix that. The exact line for an AI reality-check needs a lawyer or the
  regulator to confirm before launch. (confidence: Medium) —
  [regulatory boundaries](../research/findings/other/credit-tool-regulatory-boundaries.md)
- **The regulator changed on 1 July 2026.** Responsibility for consumer-credit
  law moved from the Commerce Commission to the Financial Markets Authority,
  which now regulates both consumer credit and the fair-conduct rules for banks
  and lenders — meaning one desk now owns most of this problem. (confidence:
  High) —
  [regulatory boundaries](../research/findings/other/credit-tool-regulatory-boundaries.md),
  [disclosure map](../research/findings/other/small-credit-disclosures.md)
- **MoneyTalks is a defensible, publicly-backed "human help" destination.**
  It is the government-funded front door to free financial mentoring, so a tool
  could point people there today without new agreements — but a true warm
  hand-off (passing someone's details to a mentor) would need partner
  co-design, consent, and a privacy review first. (confidence: Medium overall;
  the MoneyTalks referral route itself is High) —
  [front-door requirements](../research/findings/other/credit-help-front-door-requirements.md)

## What we're not sure about yet

- **We don't know which products money-tight borrowers actually use.** All the
  scenario work is built from product disclosures, not from data on real
  borrower choices — the cost-scenarios research flags this explicitly as a
  data gap. Financial mentors could answer it; none have been contacted yet.
- **The advice-boundary question is flagged by two findings but not settled.**
  Both the regulatory research and the front-door research conclude that
  personalised recommendations are risky, yet neither found an official ruling
  covering an interactive credit comparison tool. This is a load-bearing
  uncertainty for the whole product idea, resolvable only by legal advice or
  the regulator.
- **Existing comparison sites may already cover part of the need.** MoneyHub,
  Canstar, Sorted and others publish loan comparisons; two findings note them
  as context but neither systematically assessed whether the real gap is
  comparison, provenance, vulnerable-borrower scenarios, or the human hand-off.
- **No organisation has been asked anything.** MoneyTalks/FinCap capacity,
  referral preferences, and whether comparison-before-support could even cause
  harm are all unvalidated assumptions until a human talks to the sector.
- **The harm picture may be shifting under our feet.** Official reviews say the
  2020 rules eliminated the very-high-cost loan market, buy-now-pay-later rules
  only took effect in late 2024, and the regulator handover is days old — so
  the ranking of which harms matter most today rests on partly historical
  evidence (the vulnerable-borrowers finding rates parts of this Low
  confidence).
- **Keeping data fresh is unproven.** Several bank pages showed blank dates or
  rates when fetched automatically; nobody has verified that lender prices can
  be monitored reliably enough for public use.

## What we could do about it

- **Publish a plain-English education explainer: three or four realistic
  borrowing scenarios showing "cost if paid on time" versus "cost if a payment
  is missed", with no product recommendations.** Helps: anyone weighing up a
  small loan. Effort: Small. Supported by
  [cost scenarios](../research/findings/other/small-credit-cost-scenarios.md)
  (confidence: Medium) and
  [regulatory boundaries](../research/findings/other/credit-tool-regulatory-boundaries.md)
  (confidence: Medium). Would need: careful neutral wording, dated sources for
  every figure, and a check that this adds something existing guidance sites
  don't.
- **Build a provenance-tracked dataset of small-credit rates, fees, and
  eligibility criteria — every number stamped with its source and date.**
  Helps: this project's future work, researchers, and potentially the
  regulator. Effort: Medium–Large (ongoing upkeep is the hard part). Supported
  by [disclosure map](../research/findings/other/small-credit-disclosures.md)
  (confidence: Medium) and
  [front-door requirements](../research/findings/other/credit-help-front-door-requirements.md)
  (confidence: Medium). Would need: proof that lender pages can be monitored
  reliably, and a review of what may lawfully be republished.
- **Prototype a minimal "help front door": scenario education plus a
  self-directed button to MoneyTalks (no personal data sent), with debt-stress
  exits shown before any comparison.** Helps: people in a money-tight moment
  who would otherwise face a comparison table alone. Effort: Medium. Supported
  by [front-door requirements](../research/findings/other/credit-help-front-door-requirements.md)
  (confidence: Medium),
  [fees and vulnerable borrowers](../research/findings/other/credit-fees-vulnerable-borrowers.md)
  (confidence: Medium), and
  [regulatory boundaries](../research/findings/other/credit-tool-regulatory-boundaries.md)
  (confidence: Medium). Would need: validation with MoneyTalks/FinCap, and
  legal review of the reality-check wording before anything personalised ships.
- **Do a validation round before building anything: talk to financial mentors
  and MoneyTalks/FinCap, get a legal view on the advice boundary, and assess
  whether existing comparison sites already fill the gap.** Helps: the project,
  by de-risking every other option. Effort: Small. Supported by the open
  questions in all five findings, especially
  [front-door requirements](../research/findings/other/credit-help-front-door-requirements.md)
  (confidence: Medium) and
  [cost scenarios](../research/findings/other/small-credit-cost-scenarios.md)
  (confidence: Medium). Would need: a human steward to make the contacts —
  this can't be done from public documents alone.

## Where this is heading

> **TODO(steward): direction decision** — go deeper / pivot / proceed / park.

Signal: every finding independently calls for human validation (mentors, MoneyTalks/FinCap, or legal advice) before any borrower-facing tool is designed.
Signal: the evidence base is consistent across all five findings — no contradictions found, but almost everything sits at Medium confidence.
Signal: the 1 July 2026 regulator handover means any policy-brief audience and citations should be re-checked as FMA guidance settles.

## Feedback log

Feedback from people who know this domain — captured here so it steers the work:

| Date | Who (role, not name if private) | What they said | What we did |
|---|---|---|---|
|  |  |  |  |
