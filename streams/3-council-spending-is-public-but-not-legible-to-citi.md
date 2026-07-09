---
stream: 3
title: "Council spending is public but not legible to citizens"
state: awaiting-direction
steward: ""
domain: civic-transparency
updated: 2026-07-08
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
  auditable scan, and after a follow-up round fixed the scanning tools, none
  remain unreachable: 77 of the 78 councils have a finance, budget,
  procurement, rates, or grants page discoverable from their front door. But
  not one scan surfaced a structured, machine-readable spending file (a
  spreadsheet or data feed) at any council's front door.** The one site where
  the scan matched nothing is, tellingly, Christchurch — the very council
  whose capital-works dataset is the strongest verified example of structured
  spending data — a reminder that the scan measures what a homepage makes
  discoverable, not what a council actually publishes. Two honest caveats
  travel with it: the 17 sites recovered in the follow-up were spot-checked
  (one sample page each), so the "no structured data" result doesn't cover
  them; and the scan only checks each site's front door — files hidden behind
  search boxes or document libraries would be missed — so the "no structured
  data" part is explicitly Low confidence, a lead to test rather than a
  settled fact. The strongest verified council-published datasets remain
  narrow: Christchurch's openly licensed capital-works programme, and a stale
  2018 Wellington grants spreadsheet. (confidence: Medium for what was found;
  Low for what wasn't) —
  [78-council census finding](../research/findings/civic-transparency/council-spending-census-78.md)
- **The demand and supply pictures now connect, and the split is telling. The
  general questions — "where does my council's money go, by activity?", "is
  the water or roads service meeting its required measures?", "what are
  elected members paid?" — can be answered from what's already published,
  because the law requires exactly those disclosures. The specific ones —
  "what did this trip or rebrand cost?", "what were this contract's terms?",
  "how is this official behaving?" — were not found in the published data
  reviewed, and typically need a formal information request instead.** At
  least about a quarter of the sampled request titles (45 of 200) are of that
  specific kind — a floor, not a measure of which kind dominates. One question
  type sits in between: the formal decision record (agendas, reports, minutes)
  is legally open to everyone, but whether councils reliably publish the whole
  trail online in a usable form was not verified. (confidence: Medium; the
  "at least a quarter" share is Low) —
  [answerability finding](../research/findings/civic-transparency/council-question-answerability.md)
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

- **Which kind of question dominates real demand.** The demand-to-supply
  connection is made, but only as a floor: at least 45 of the 200 sampled
  request titles are specific questions published data can't serve, and nobody
  has measured whether that end or the answerable general end is bigger. The
  sample is also self-selecting — people motivated enough to lodge a formal
  request — so it may not reflect what residents at large want. A full
  answerability recode of the sample (ideally with a second coder), or a
  representative survey, would settle this; until then the answer-layer option
  below rests partly on an unmeasured split.
- **Whether the decision trail is actually online, council by council.** The
  law guarantees anyone may inspect meeting agendas, reports, and minutes
  without filing a request — but the answerability finding deliberately did
  not verify whether councils publish that full trail online in usable form.
  A tool cannot yet promise decision-trail answers.
- **What individual councils publish beyond the national baseline.** The
  answerability grades were made at national level. Individual councils may
  publish more — a contract register, a proactive disclosure log, project-level
  capital data, an online rates calculator — but those surfaces are flagged as
  hypotheses to check, not confirmed to exist. The same blind spot covers
  every council's document library; and although the 17 council websites that
  initially blocked the census scanner have now all been re-checked and each
  has a finance page discoverable, they were recovered only as spot checks
  (one sample page each), so the census's "no structured spending data" result
  doesn't cover them — the census itself calls that result a lead to test, not
  a settled fact.
- **Whether the "translation layer" is really necessary.** The claim that
  detailed cross-council comparison needs a mapping layer is a single finding's
  inference from official caveats — though the Taxpayers' Union's own
  methodology page independently concedes the same comparability problem. Both
  findings that touch it still recommend a council-finance practitioner review
  before it drives a build.
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
  The answerability finding therefore counts "who won the contract" as only
  partly answerable — and contract terms and delivery monitoring as not found
  in any published data reviewed.

## What we could do about it

- **Audit councils directly for what the desk scans couldn't see.** Follow up
  the front-door census with a per-council check — asking councils, or
  checking each site by hand — for structured spending data, a contract
  register, a proactive disclosure log, project-level capital data, usable
  online meeting records, and an online rates calculator, including a full
  re-scan of the 17 sites that were only spot-checked after the scanning
  tools were fixed. Helps: everyone downstream — it turns two
  Low-confidence negatives into trustworthy answers and shows where a pilot is
  actually feasible. Effort: Medium. Supported by the
  [78-council census finding](../research/findings/civic-transparency/council-spending-census-78.md)
  (confidence: Medium for method, Low for the negative it would test), which
  names asking councils as its primary follow-up, and the
  [answerability finding](../research/findings/civic-transparency/council-question-answerability.md)
  (confidence: Medium), which calls a per-council answerability audit its
  single most valuable follow-up. Would need: patience with 20-working-day
  response times, and careful request wording.
- **Build a plain-language answer layer for the questions published data can
  already answer — and honestly hand off the ones it can't.** The answerable
  half: where the money goes by activity, rates and what they fund, service
  performance against the legally required measures, and elected-member pay —
  always linking back to source documents. The unanswerable half — specific
  project costs, contract terms, conduct — would be routed to the existing
  formal-request channel (which FYI.org.nz already provides) rather than
  pretended away. Helps: residents and local journalists. Effort: Large.
  Supported by the [demand finding](../research/findings/civic-transparency/council-data-questions.md)
  (confidence: Medium; the "answers beat document dumps" framing is a
  hypothesis, not user research), the
  [answerability finding](../research/findings/civic-transparency/council-question-answerability.md)
  (confidence: Medium — it grades exactly which question types such a layer
  can serve, and warns the decision-record part needs a per-council audit
  before it can be promised), the
  [comparability finding](../research/findings/civic-transparency/council-spending-comparability.md)
  (confidence: Medium), the
  [data census finding](../research/findings/civic-transparency/council-spending-data-census.md)
  for the raw material (confidence: High that it exists; Medium on the
  procurement data), and the
  [prior-art finding](../research/findings/civic-transparency/council-spending-civic-tech-prior-art.md),
  which found this exact niche unoccupied and says the UK's failure was
  precisely the absence of such a legibility layer (confidence: Medium; the
  UK "raw dumps failed" lesson itself is High). Would need: reuse of FYI and
  the official aggregates rather than rebuilding them, evidence on which kind
  of question dominates demand, and honesty that sustained tools elsewhere had
  funding — a volunteer team would need a maintenance plan.
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
  local journalists, council finance and democracy-services staff, and
  community organisers before any build, since most findings say expert or
  user review is needed: the prior-art finding asks whether the UK's "nobody
  used the raw data" experience would repeat here, and the answerability
  finding asks a working journalist or frequent requester to sanity-check its
  grades against day-to-day reality. Helps: the stream itself, by de-risking
  everything else. Effort: Small. Supported by the
  [demand finding](../research/findings/civic-transparency/council-data-questions.md)
  (confidence: Medium), the
  [comparability finding](../research/findings/civic-transparency/council-spending-comparability.md)
  (confidence: Medium), the
  [answerability finding](../research/findings/civic-transparency/council-question-answerability.md)
  (confidence: Medium), and the
  [prior-art finding](../research/findings/civic-transparency/council-spending-civic-tech-prior-art.md)
  (confidence: Medium). Would need: access to a few willing practitioners.

## Where this is heading

> **TODO(steward): direction decision** — go deeper / pivot / proceed / park.

Signal: the blocked-website gap flagged last round is now closed — all 17 council sites the scanner couldn't reach have been re-checked and every one has a finance page discoverable — so the remaining supply-side blind spot is document libraries and spot-checked sites, not unreachable websites; the "no structured spending data" negative still stands, but remains a Low-confidence lead.
Signal: two unknowns still gate any build — whether councils publish usable decision records online, and which councils publish more than the national baseline — and two findings independently name a per-council audit as the next step.
Signal: every finding that proposes building something still asks for human practitioner or user validation first, and the prior-art finding warns that sustained tools elsewhere were funded, not volunteer-run.

## Feedback log

Feedback from people who know this domain — captured here so it steers the work:

| Date | Who (role, not name if private) | What they said | What we did |
|---|---|---|---|
|  |  |  |  |
