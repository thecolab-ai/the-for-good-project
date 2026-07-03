---
stream: 3
title: "Council spending is public but not legible to citizens"
state: awaiting-direction
steward: ""
domain: civic-transparency
updated: 2026-07-03
image: /images/streams/stream-3-council-spending.jpg
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
  and how staff and elected members are behaving.** The 200 sampled request
  titles behind this are preserved in full, with each title's category, so
  anyone can audit the coding. Two honest caveats travel with it: about a
  quarter of titles were too vague to classify (Low confidence, one coder's
  judgement), and a distinct cluster of CCTV-and-camera surveillance requests
  recurs across five of the eight councils sampled. Nobody has measured which
  question type matters most. (confidence: Medium) —
  [demand finding](../research/findings/civic-transparency/council-data-questions.md)
- **Machine-readable finance data exists nationally, but only in aggregate or
  fragments: Stats NZ publishes spreadsheet-format actual finances for all
  councils, the Department of Internal Affairs publishes all councils'
  long-term-plan budget tables (though the series stops at 2018–28), and MBIE
  publishes contract award notices from the government tender system — with an
  official warning not to treat those as consolidated financial data.**
  (confidence: Medium) —
  [data census finding](../research/findings/civic-transparency/council-spending-data-census.md)
- **All 78 council websites have now been checked with a repeatable,
  auditable scan. Most councils (60 of 78) have finance, budget, procurement,
  or grants pages discoverable from their front door — but not one scan
  surfaced a structured, machine-readable spending file (a spreadsheet or data
  feed) at any council's front door.** Seventeen sites blocked the scanner, so
  they are unknowns rather than negatives, and the scan only checks each site's
  front door — files hidden behind search boxes or document libraries would be
  missed, so the "no structured data" part is explicitly Low confidence. The
  strongest verified council-published datasets remain narrow: Christchurch's
  openly licensed capital-works programme, and a stale 2018 Wellington grants
  spreadsheet. (confidence: Medium for what was found; Low for what wasn't) —
  [78-council census finding](../research/findings/civic-transparency/council-spending-census-78.md)
- **Nobody has already built the thing this stream contemplates, but the
  history of similar efforts carries a strong warning: publishing raw spending
  data is not enough.** In New Zealand, the existing pieces each cover a slice
  — FYI.org.nz for public information requests, the Taxpayers' Union's
  advocacy-framed council league tables, Figure.NZ's charts of official
  aggregates — and no plain-language council-spending answer tool was found
  (within the search's scope, which did not audit all 78 councils for local
  tools). Internationally, the UK forced every council to publish every
  transaction over £500 and promised an "army of armchair auditors"; multiple
  independent studies found that army never appeared (High confidence on that
  lesson). The spending-transparency tools that lasted were government-run or
  commercially funded, not volunteer-run, and independent volunteer aggregators
  have tended to shut down. (confidence: Medium overall) —
  [prior-art finding](../research/findings/civic-transparency/council-spending-civic-tech-prior-art.md)

## What we're not sure about yet

- **Which citizen questions can already be answered from published data.** We
  now have a demand-side picture (what people ask) and a national supply-side
  picture (what's published), but no finding yet connects the two — and the
  main build option below rests on that connection.
- **What sits behind the 18 unknown council websites and everyone's document
  libraries.** The census scanned front doors only; 17 councils blocked the
  scanner and one showed nothing, and structured files behind search boxes
  would be missed everywhere. The census finding itself says its "no structured
  spending data" result is a lead to test (for example by asking councils
  directly), not a settled fact.
- **Whether the "translation layer" is really necessary.** The claim that
  detailed cross-council comparison needs a mapping layer is a single finding's
  inference from official caveats — though the Taxpayers' Union's own
  methodology page independently concedes the same comparability problem. Both
  findings that touch it still recommend a council-finance practitioner review
  before it drives a build.
- **What residents at large actually want.** The demand evidence comes from
  people motivated enough to lodge formal information requests, and from local
  journalism — a self-selecting slice. There is no representative survey, and
  the question types are deliberately not ranked. The "quarter of titles too
  vague to classify" data point is single-coder judgement (Low confidence),
  though the full coded sample is published so anyone can check it.
- **Whether the UK lesson transfers to New Zealand.** "Raw data dumps didn't
  create citizen auditors" is well evidenced for the UK, but whether New
  Zealanders would behave the same way is judgement, not evidence — the
  prior-art finding flags this as needing someone with local-journalism or
  community-organising experience.
- **How much the existing NZ pieces are actually used.** No evidence was found
  on how often FYI.org.nz or the Ratepayers' Report are used for spending
  questions specifically — the space could be more saturated, or more open,
  than existence alone implies.
- **Whether national procurement data actually covers councils.** MBIE's
  contract award notices only include councils that use the central tender
  system, nobody has checked how consistently they do, and the publisher
  itself warns the data must not be treated as consolidated financial records.

## What we could do about it

- **Test what the census couldn't see: ask councils directly.** Follow up the
  front-door census with targeted confirmation — email or formal information
  requests to a sample of councils (starting with the 17 the scanner couldn't
  reach) asking what structured spending, procurement, or grants data they
  publish and under what terms. Helps: everyone downstream — it turns the
  census's Low-confidence "nothing found" into a trustworthy answer. Effort:
  Medium. Supported by the [78-council census finding](../research/findings/civic-transparency/council-spending-census-78.md)
  (confidence: Medium for method, Low for the negative it would test), which
  names this as its primary follow-up. Would need: patience with 20-working-day
  response times, and careful request wording.
- **Build a plain-language answer layer for the recurring question types,
  using the aggregate data that already exists** — rates-to-services, project
  costs, contracts, decision trails, service performance — always linking back
  to source documents. Helps: residents and local journalists. Effort: Large.
  Supported by the [demand finding](../research/findings/civic-transparency/council-data-questions.md)
  (confidence: Medium; the "answers beat document dumps" framing is a
  hypothesis, not user research), the
  [comparability finding](../research/findings/civic-transparency/council-spending-comparability.md)
  (confidence: Medium), the
  [data census finding](../research/findings/civic-transparency/council-spending-data-census.md)
  for the raw material (confidence: High that it exists; Medium on the
  procurement data), and now the
  [prior-art finding](../research/findings/civic-transparency/council-spending-civic-tech-prior-art.md),
  which found this exact niche unoccupied and says the UK's failure was
  precisely the absence of such a legibility layer (confidence: Medium; the
  UK "raw dumps failed" lesson itself is High). Would need: evidence that the
  questions are answerable from published data, reuse of FYI and the official
  aggregates rather than rebuilding them, and honesty that sustained tools
  elsewhere had funding — a volunteer team would need a maintenance plan.
- **Pilot with the data that's already good** — for example, a project-cost
  view built on Christchurch's openly licensed capital-works dataset, testing
  whether its structure could seed a cross-council standard. Helps: residents
  of the pilot council first, then others if it generalises. Effort: Medium.
  Supported by the [data census finding](../research/findings/civic-transparency/council-spending-data-census.md)
  and the [78-council census finding](../research/findings/civic-transparency/council-spending-census-78.md),
  which after checking all 78 front doors still names Christchurch's dataset
  as the strongest verified council-published example (confidence: High that
  it exists with project, budget-band, and date fields; Medium that it is the
  strongest available). Would need: the dataset to stay maintained, and honesty
  about its budget figures being broad bands, not exact amounts.
- **Validate the demand and comparability assumptions with people** — talk to
  local journalists, council finance staff, and community organisers before any
  build, since most findings say expert or user review is needed, and the
  prior-art finding specifically asks whether the UK's "nobody used the raw
  data" experience would repeat here. Helps: the stream itself, by de-risking
  everything else. Effort: Small. Supported by the
  [demand finding](../research/findings/civic-transparency/council-data-questions.md)
  (confidence: Medium), the
  [comparability finding](../research/findings/civic-transparency/council-spending-comparability.md)
  (confidence: Medium), and the
  [prior-art finding](../research/findings/civic-transparency/council-spending-civic-tech-prior-art.md)
  (confidence: Medium). Would need: access to a few willing practitioners.

## Where this is heading

> **TODO(steward): direction decision** — go deeper / pivot / proceed / park.

Signal: the two gaps flagged last round — the 78-council census and the prior-art review — are now filled, and both point the same way: the data gap is real, and raw disclosure alone has failed elsewhere.
Signal: the strongest remaining unknown is whether the recurring citizen questions can actually be answered from what's published — the main build option depends on it.
Signal: every finding that proposes building something still asks for human practitioner or user validation first, and the prior-art finding warns that sustained tools elsewhere were funded, not volunteer-run.

## Feedback log

Feedback from people who know this domain — captured here so it steers the work:

| Date | Who (role, not name if private) | What they said | What we did |
|---|---|---|---|
|  |  |  |  |
