---
stream: 3
title: "Council spending is public but not legible to citizens"
state: needs-synthesis
steward: ""
domain: civic-transparency
updated: 2026-07-03
---

# Council spending is public but not legible to citizens

## The problem, in plain language

New Zealand's 78 councils are legally required to publish where their money
goes, and anyone can request more detail under official-information law. But
the information is spread across audited reports, plans, and portals that each
council organises differently — so a resident or local journalist who asks a
simple question like "what did that project cost?" or "who got the contract?"
often can't answer it from what's published. The barrier is usability, not
secrecy, which is what makes this worth working on.

## What we've learned so far

- **Council finances are genuinely public — the law requires annual reports and
  audited statements, and official-information requests are a fallback — but
  officials themselves say each council plans and reports differently, so
  "public" hasn't meant "easy to understand or compare".** (confidence: Medium)
  — [framing finding](../research/findings/civic-transparency/council-spending-legibility-framing.md)
- **You can compare councils at a high level (total spending, debt, rates)
  because national standards and official datasets exist for that, but there is
  no shared national system for classifying detailed spending — so comparing
  two councils' consultant bills or parks budgets would need painstaking
  council-by-council translation work.** (confidence: Medium — the high-level
  part is well sourced; the "translation layer needed" part is an inference from
  official caveats) — [comparability finding](../research/findings/civic-transparency/council-spending-comparability.md)
- **What people actually ask councils clusters into recognisable question
  types: how rates and fees will change, what projects cost, who won contracts,
  what documents explain a decision, whether services and assets are performing,
  and how staff and elected members are behaving.** These types recur across
  public information requests and local journalism, but nobody has measured
  which matters most. (confidence: Medium) —
  [demand finding](../research/findings/civic-transparency/council-data-questions.md)
- **Machine-readable finance data exists nationally, but only in aggregate:
  Stats NZ and the Department of Internal Affairs publish spreadsheet-format
  finance data covering all councils, while the three big-city open-data
  portals checked (Auckland, Wellington, Christchurch) are mostly maps and
  geography, with only two spending-related datasets found — one useful
  (Christchurch's capital works programme), one stale (a Wellington grants
  spreadsheet last updated in 2018).** (confidence: Medium for what was found;
  Low for what wasn't — only three of 78 councils were checked) —
  [data census finding](../research/findings/civic-transparency/council-spending-data-census.md)

## What we're not sure about yet

- **What the other 75 councils publish.** The supply-side scan covered national
  datasets plus just three council portals. Claims about what councils *don't*
  publish rest on that small sample and are explicitly Low confidence — a full
  council-by-council census is the biggest outstanding piece of research.
- **Which citizen questions can already be answered from published data.** We
  have a demand-side picture (what people ask) and a partial supply-side
  picture (what's published), but no finding yet connects the two.
- **Whether the "translation layer" is really necessary.** The claim that
  detailed cross-council comparison needs a mapping layer is a single finding's
  inference from official caveats, not something a council finance practitioner
  or auditor has confirmed. Both findings that touch it recommend a human
  expert review before it drives a build.
- **What residents at large actually want.** The demand evidence comes from
  people motivated enough to lodge formal information requests, and from local
  journalism — a self-selecting slice. There is no representative survey, and
  the question types are deliberately not ranked. The one Low-confidence data
  point (roughly a quarter to a third of sampled request titles were too vague
  to classify) is single-coder judgement.
- **What has already been tried.** The framing finding notes existing efforts
  (the Taxpayers' Union's Ratepayers' Report, FYI.org.nz, Figure.NZ, a UK
  transaction-disclosure law as overseas context), but the planned research on
  prior civic-tech attempts and lessons has not produced a finding in this
  round.

## What we could do about it

- **Finish the council-by-council data census** — a systematic check of all 78
  councils recording what spending, budget, and procurement data each publishes,
  in what format, how current, and under what terms. Helps: everyone downstream
  — every other option depends on knowing this. Effort: Medium. Supported by
  the [data census finding](../research/findings/civic-transparency/council-spending-data-census.md)
  (confidence: Medium for method, Low for current national picture), which
  explicitly names this as its primary follow-up. Would need: a repeatable
  search method so negative results are trustworthy.
- **Build a plain-language answer tool for the recurring question types, using
  the aggregate data that already exists** — rates-to-services, project costs,
  contracts, decision trails, service performance — always linking back to the
  source documents. Helps: residents and local journalists. Effort: Large.
  Supported by the [demand finding](../research/findings/civic-transparency/council-data-questions.md)
  (confidence: Medium; the "answers beat document dumps" framing is a
  hypothesis, not user research) and the
  [comparability finding](../research/findings/civic-transparency/council-spending-comparability.md)
  (confidence: Medium). Would need: evidence that the questions are answerable
  from published data, and expert review of any cross-council comparisons.
- **Pilot with the data that's already good** — for example, a project-cost
  view built on Christchurch's openly licensed capital-works dataset, testing
  whether its structure could seed a cross-council standard. Helps: residents
  of the pilot council first, then others if it generalises. Effort: Medium.
  Supported by the [data census finding](../research/findings/civic-transparency/council-spending-data-census.md)
  (confidence: High that the dataset exists with project, budget-band, and date
  fields; Low that it is the best available — only three portals were checked).
  Would need: the dataset to stay maintained, and honesty about its budget
  figures being broad bands, not exact amounts.
- **Validate the demand and comparability assumptions with people** — talk to
  local journalists, council finance staff, and community organisers before any
  build, since three of four findings say expert or user review is needed.
  Helps: the stream itself, by de-risking everything else. Effort: Small.
  Supported by the [demand finding](../research/findings/civic-transparency/council-data-questions.md)
  (confidence: Medium) and the
  [comparability finding](../research/findings/civic-transparency/council-spending-comparability.md)
  (confidence: Medium). Would need: access to a few willing practitioners.

## Where this is heading

> **TODO(steward): direction decision** — go deeper / pivot / proceed / park.

Signal: all four findings sit at Medium overall confidence, and the supply-side picture covers only 3 of 78 councils.
Signal: the planned research on prior civic-tech efforts has no finding yet, so duplication risk is unassessed.
Signal: every finding that proposes building something also asks for human practitioner or user validation first.

## Feedback log

Feedback from people who know this domain — captured here so it steers the work:

| Date | Who (role, not name if private) | What they said | What we did |
|---|---|---|---|
|  |  |  |  |
