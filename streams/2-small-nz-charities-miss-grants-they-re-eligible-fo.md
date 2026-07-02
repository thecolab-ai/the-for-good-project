---
stream: 2
title: "Small charities miss grants they're eligible for"
state: needs-synthesis
steward: ""
domain: grant-access
updated: 2026-07-02
---

# Small charities miss grants they're eligible for

## The problem, in plain language

New Zealand has hundreds of organisations that give out grants — lottery and
government funds, pokie trusts, councils, and philanthropic trusts — but there
is no one place to see them all. Small community groups, most run entirely by
volunteers, have to hunt for funding one website at a time, and the worry is
that they miss money they qualify for simply because finding it is so hard.
One research round is now complete; it mapped the system and found the worry
is credible but not yet proven.

## What we've learned so far

- **There is no official, complete list of NZ grant funders or grant
  opportunities.** Government publishes who *received* grants, not what is on
  offer; the only published count of funders comes from one commercial
  database (1,650 funders, roughly 2,000–3,400 opportunities depending on how
  you count) (confidence: Medium) —
  [no official register of grant funders](../research/findings/grant-access/nz-grant-funder-count-and-eligibility-data.md)
- **Grant information is scattered across at least five kinds of places** —
  a government funding hub, 32 pokie-trust websites, 67 local councils, trust
  company portals, and paid databases — each with its own rules, dates, and
  forms (confidence: Medium) —
  [grant source map](../research/findings/grant-access/nz-grant-source-map.md)
- **The only tools that pull it together are commercial, and free access
  depends on where you live.** The main database is free only through council
  libraries that subscribe, and some councils sponsor free portals for their
  own residents — a postcode lottery (confidence: Medium) —
  [how small charities find grants](../research/findings/grant-access/how-small-nz-charities-find-grants.md),
  [where the workflow breaks down](../research/findings/grant-access/small-charity-grant-workflow-failures.md)
- **Even after finding a grant, the work is manual and heavy for volunteers**
  — document packs, quotes, spreadsheets of deadlines, and different paperwork
  for every funder — and in the most recent official count (2018), 89% of NZ
  non-profits had no paid staff at all (confidence: Medium) —
  [where the workflow breaks down](../research/findings/grant-access/small-charity-grant-workflow-failures.md),
  [how small charities find grants](../research/findings/grant-access/how-small-nz-charities-find-grants.md)
- **Funding is heavily concentrated:** one 2020 analysis found 9% of charities
  receive 91% of philanthropic and grant-maker giving (confidence: Medium —
  a single analysis, not independently replicated) —
  [how small charities find grants](../research/findings/grant-access/how-small-nz-charities-find-grants.md)
- **Public records could seed an open list of funders.** The Charities
  Register can identify roughly 5,600 likely charitable grantmakers, though
  the exact count is unverified and it misses councils, government, and pokie
  money (confidence: Medium overall; the specific count is Low) —
  [grantmaker census](../research/findings/grant-access/charities-register-grantmaker-census.md)
- **We cannot yet put a dollar figure on what small charities miss.** Public
  data only measures groups that *applied* — for example, one six-month pokie
  dataset shows about $70 million requested in declined applications — and
  says nothing about eligible groups that never applied (confidence: Medium) —
  [what missed funding can be measured](../research/findings/grant-access/charity-grant-underapplication-measures.md)

## What we're not sure about yet

- **The stream's core claim is still unproven.** "Small charities miss grants
  because discovery is hard" is consistent with all of the evidence, but it
  was rated Low confidence in the one finding that tested it directly — no
  survey or dataset measures it, and every finding independently says the
  missing evidence is behavioural: interviews or a survey of small charities.
- Nobody has asked charities how they search. The sector's main survey
  measures whether funding is *adequate*, not how groups *find* it.
- The database sizes are vendor claims that disagree with each other (1,200
  vs ~2,000 vs 3,361 opportunities) and cannot be audited — there is no
  ground truth.
- "Most council libraries offer free database access" is the vendor's own
  claim; no public list of which councils actually subscribe was found.
- The Charities Register funder counts and dollar totals come from a single
  data pull with no independent check, and the register cannot say whether a
  grantmaker actually accepts applications.
- Some load-bearing numbers are dated: the 89% no-paid-staff figure is from
  2018, and the 9%/91% concentration figure uses 2020 data.

## What we could do about it

- **Ask small charities directly how they find grants and where they give
  up** — a survey and interviews with charity officers, library staff, and
  grant advisers. Helps: everyone in this stream, by testing the core claim
  before anything is built. Effort: Medium. Supported by
  [where the workflow breaks down](../research/findings/grant-access/small-charity-grant-workflow-failures.md)
  (confidence: Medium),
  [what missed funding can be measured](../research/findings/grant-access/charity-grant-underapplication-measures.md)
  (confidence: Medium). Would need: access to a sample of small charities and
  a way to reach them (e.g. through sector bodies).
- **Map who actually has free access** — check each of the ~67 councils for
  library database subscriptions and sponsored grant-finder portals, and
  publish the map. Helps: groups who don't know free access exists; anyone
  deciding whether access is a real barrier. Effort: Small. Supported by
  [how small charities find grants](../research/findings/grant-access/how-small-nz-charities-find-grants.md)
  (confidence: Medium). Would need: council and library web pages to state
  their subscriptions accurately.
- **Publish an open list of NZ grant funders built from public records** —
  start from the Charities Register's ~5,600 likely grantmakers, validate
  against funder websites, and add non-charity funders (councils, pokie
  trusts, government funds). Helps: anyone building or auditing grant tools;
  researchers. Effort: Medium. Supported by
  [grantmaker census](../research/findings/grant-access/charities-register-grantmaker-census.md)
  (confidence: Medium),
  [no official register of grant funders](../research/findings/grant-access/nz-grant-funder-count-and-eligibility-data.md)
  (confidence: Medium). Would need: manual validation of a self-reported
  register, and ongoing upkeep as the register changes.
- **Assemble an open dataset of current grant opportunities with eligibility
  rules** — extracted from funder websites into the schema the research
  drafted (funder, dates, region, eligibility, exclusions, application link).
  Helps: small charities directly, and any free tool built on top. Effort:
  Large — the data lives in web pages and PDFs and goes stale quickly.
  Supported by
  [public grants data is awards history, not opportunities](../research/findings/grant-access/grants-data-schema-gaps.md)
  (confidence: Medium),
  [grant source map](../research/findings/grant-access/nz-grant-source-map.md)
  (confidence: Medium). Would need: a sustainable way to keep hundreds of
  scattered sources fresh with volunteer effort, and care around site terms.

## Where this is heading

> **TODO(steward): direction decision** — go deeper / pivot / proceed / park.

Signal: all seven findings converge on the same evidence gap — no one has measured how small charities actually search for grants or why they don't apply.
Signal: the stream's central claim ("eligible grants are missed") is currently supported only at Low confidence; two of the options above are comparatively cheap ways to test it.
Signal: the fragmentation itself is documented at High confidence within the findings — that part is not in doubt.

## Feedback log

Feedback from people who know this domain — captured here so it steers the work:

| Date | Who (role, not name if private) | What they said | What we did |
|---|---|---|---|
|  |  |  |  |
