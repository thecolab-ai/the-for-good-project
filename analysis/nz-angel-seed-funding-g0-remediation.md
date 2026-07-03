---
title: "NZ angel and seed funding stream #110 needs G0 remediation before its research children are treated as valid"
type: "analysis"
issue: "#110"
author: "adam91holt"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-03"
status: "proposal"
---

# NZ angel and seed funding stream #110 needs G0 remediation before its research children are treated as valid

> **Status - advisory analysis, not a research finding.** Merging this file would record the process and evidence analysis below; it would **not** clear G0, ratify the already-closed child issues, enact a stream direction, or make the parked questions available. Those decisions remain with a maintainer or human steward under [`docs/STREAMS.md`](../docs/STREAMS.md).

## Executive answer

- Stream root [#110](https://github.com/thecolab-ai/the-for-good-project/issues/110) is still open with `needs-triage` as of 3 July 2026, while research children [#141](https://github.com/thecolab-ai/the-for-good-project/issues/141), [#142](https://github.com/thecolab-ai/the-for-good-project/issues/142), [#143](https://github.com/thecolab-ai/the-for-good-project/issues/143), [#144](https://github.com/thecolab-ai/the-for-good-project/issues/144), and [#145](https://github.com/thecolab-ai/the-for-good-project/issues/145) are closed with `status: done`.
- That state conflicts with the stream rule that Discover roots pass G0 when `needs-triage` is removed, after which research children may inherit approval within the depth limit. [`docs/STREAMS.md`](../docs/STREAMS.md)
- The right remediation is human-only: either clear G0 for [#110](https://github.com/thecolab-ai/the-for-good-project/issues/110) and explicitly accept the existing child work into the stream record, or park/reconcile the premature children before any stream overview, synthesis, ideation, or build direction relies on them. [`docs/STREAMS.md`](../docs/STREAMS.md)
- The funding facts still justify a research stream if G0 is cleared: public reporting of the Young Company Finance/AANZ/NZGCP dataset says 2025 startup investment was about $754m, up 61%, while only 47 genuinely new companies received investment and expansion-stage rounds took 83% of capital. [NZ Herald](https://www.nzherald.co.nz/business/personal-finance/investment/start-up-company-investment-surged-to-754m-in-2025-after-deal-activity-jumped/5B4X67OA4FANLGYZIUCXHTDLGI/); [b2bnews / Young Company Finance](https://b2bnews.co.nz/news/nz-startup-investment-hits-754m-but-new-company-pipeline-shrinks/)
- The central causal claim remains unproven: the evidence supports a narrowing early-stage pipeline and a fragmented ecosystem, but it does not yet show that discovery/access, rather than capital scarcity, investor appetite, or founder readiness, is the binding constraint for sub-$250k founders. [MBIE access-to-growth-capital briefing](https://www.mbie.govt.nz/dmsdocument/31135-access-growth-capital); [Upstart Nation](https://www.mbie.govt.nz/assets/upstart-nation.pdf)

## Confidence & limits

**Overall confidence:** Medium. The GitHub issue state and stream rule are directly checkable, the Catalist angel-market figures are primary-source-backed, and the headline YCF/AANZ/NZGCP figures are corroborated by two public reports that appear to trace to the same underlying dataset. The causal access-vs-scarcity claim remains Low-confidence until tested by the parked research questions.

**What is fact:** the current labels/states visible on [#110](https://github.com/thecolab-ai/the-for-good-project/issues/110) and [#141](https://github.com/thecolab-ai/the-for-good-project/issues/141)-[#145](https://github.com/thecolab-ai/the-for-good-project/issues/145); the G0 rule in [`docs/STREAMS.md`](../docs/STREAMS.md); and the cited public funding figures.

**What is interpretation:** that the current state should be remediated before PR #147 is relied on for any stream decision, and that the most useful research framing is "test the access hypothesis" rather than "assume a marketplace is needed."

**What would change the conclusion:** a maintainer or steward clearing G0 for [#110](https://github.com/thecolab-ai/the-for-good-project/issues/110) and explicitly accepting the existing children into the stream record; reopening/parking/reconciling [#141](https://github.com/thecolab-ai/the-for-good-project/issues/141)-[#145](https://github.com/thecolab-ai/the-for-good-project/issues/145); or new evidence that the root no longer carries `needs-triage`.

## Evidence

### Gate state and remediation

The stream rule is explicit: Discover issues open with `needs-triage`; removing that label is G0; once the root has passed G0, research children within the bounded fan-out rule may open as `status: available` directly. [`docs/STREAMS.md`](../docs/STREAMS.md)

A live issue-state check during this revision showed [#110](https://github.com/thecolab-ai/the-for-good-project/issues/110) still carrying `needs-triage`, `stage: discover`, and `stream:110`; transient review-status labels are runner-managed and may change during review. The five research children linked from this PR are not open available questions: [#141](https://github.com/thecolab-ai/the-for-good-project/issues/141), [#142](https://github.com/thecolab-ai/the-for-good-project/issues/142), [#143](https://github.com/thecolab-ai/the-for-good-project/issues/143), [#144](https://github.com/thecolab-ai/the-for-good-project/issues/144), and [#145](https://github.com/thecolab-ai/the-for-good-project/issues/145) are closed and labelled `status: done`.

This means the child issues should be referenced as a process incident until a human remediates them. This document therefore does not call them approved fan-out, does not list them as open follow-up questions, and does not treat their closure as evidence that G0 has passed.

### Funding landscape worth testing

Public reporting of the Young Company Finance report, produced with NZGCP and Angel Association NZ, says New Zealand startup investment reached about $754m in 2025, up 61% year-on-year. [b2bnews](https://b2bnews.co.nz/news/nz-startup-investment-hits-754m-but-new-company-pipeline-shrinks/); [NZ Herald](https://www.nzherald.co.nz/business/personal-finance/investment/start-up-company-investment-surged-to-754m-in-2025-after-deal-activity-jumped/5B4X67OA4FANLGYZIUCXHTDLGI/)

The same reporting says only 47 genuinely new companies received investment in 2025, compared with 46 in 2024 and 51 in 2023, and that early-expansion and expansion-stage rounds were 49% of funded rounds but 83% of capital. [NZ Herald](https://www.nzherald.co.nz/business/personal-finance/investment/start-up-company-investment-surged-to-754m-in-2025-after-deal-activity-jumped/5B4X67OA4FANLGYZIUCXHTDLGI/); [b2bnews](https://b2bnews.co.nz/news/nz-startup-investment-hits-754m-but-new-company-pipeline-shrinks/)

Catalist's 2025 annual angel-market report records $13,914,788 invested through the tracked angel-market dataset in 2025, up 2.7% on 2024, across 167 angel-group deals, 81 businesses, and 455 active angels. [Catalist FY25 report](https://cdn.catalist.co.nz/Documents/Reports/2025+Annual+New+Zealand+Angel+Market+Report.pdf)

The Catalist methodology is narrower than a whole-market angel census but broader than "only angel-group members." The report says it is based on six active AANZ angel groups using Catalist and also includes direct Catalist-platform investments by non-members where those investments are made alongside those groups. [Catalist FY25 report](https://cdn.catalist.co.nz/Documents/Reports/2025+Annual+New+Zealand+Angel+Market+Report.pdf)

The correct coverage caveat is therefore: angels entirely outside Catalist, and Catalist non-member investments not made alongside the tracked groups, are uncounted by this report. The report does not establish the size of solo/off-platform angel investment, and it does not publish a company-level cheque-size distribution. [Catalist FY25 report](https://cdn.catalist.co.nz/Documents/Reports/2025+Annual+New+Zealand+Angel+Market+Report.pdf)

### Discovery infrastructure: preliminary search scope, not an absence conclusion

This PR should not claim that no maintained, open, machine-readable NZ founder-investor dataset exists. The narrower statement supported here is that a preliminary pass checked several visible surfaces and found partial discovery infrastructure, not a complete stage/region/cheque-size matchable dataset.

The checked surfaces were: Angel Association NZ, which offers a founder-facing investor-finding route and member directory; NZGCP's start-up investor list; Enterprise Angels and its AngelEquity consolidation page; and public ecosystem reporting through Upstart Nation. [Angel Association NZ](https://www.angelassociation.co.nz/); [NZGCP start-up investors](https://www.nzgcp.co.nz/start-up-resources/start-up-investors); [Enterprise Angels](https://www.enterpriseangels.co.nz/); [AngelEquity](https://www.enterpriseangels.co.nz/angelequity/); [Upstart Nation](https://www.mbie.govt.nz/assets/upstart-nation.pdf)

Those sources support a hypothesis worth testing: founders can find lists, networks, and pathways, but the public surfaces checked here do not obviously expose a maintained open dataset that a founder can filter by stage, region, cheque size, and approach route. That is a search-audit lead, not a proved absence claim.

### Fragmentation and co-investment are distinct from the access hypothesis

The Startup Advisors Council's 2023 Upstart Nation report says New Zealand's startup ecosystem is noisy, fragmented, disconnected, and difficult for founders to navigate, with government support spread across multiple agencies. [Upstart Nation](https://www.mbie.govt.nz/assets/upstart-nation.pdf)

MBIE's 9 May 2025 access-to-growth-capital briefing records "regression in the seed funding market due to recent economic conditions" and connects that to a review of Aspire policy settings. [MBIE access-to-growth-capital briefing](https://www.mbie.govt.nz/dmsdocument/31135-access-growth-capital)

Those are related but not interchangeable claims. Upstart Nation supports an ecosystem-fragmentation framing; MBIE supports a seed-market-regression framing; neither proves that a founder-investor marketplace would solve the binding constraint for sub-$250k founders.

NZGCP's Aspire FAQ says the fund always co-invests with private investors and generally expects to take around 20-25% of an initial investment round, with proof-of-concept investments generally limited to $50,000-$100,000, pre-seed roughly double that, and seed generally around $250,000-$500,000. [NZGCP Aspire FAQ](https://www.nzgcp.co.nz/assets/NZGCP-Aspire-FAQ_Nov22.pdf)

Aspire therefore overlaps the sub-$250k range, but its co-investment model still presumes the founder has private investors in the round. That supports an access question, not a conclusion that discovery is the binding constraint. [NZGCP Aspire FAQ](https://www.nzgcp.co.nz/assets/NZGCP-Aspire-FAQ_Nov22.pdf)

## Parked questions pending human remediation

These are **not** open follow-up issues from approved fan-out. They are the questions a human steward or maintainer could choose to accept, park, reopen, supersede, or reconcile after G0 remediation for [#110](https://github.com/thecolab-ai/the-for-good-project/issues/110).

| Existing issue | Parked question | Status to treat it as |
|---|---|---|
| [#141](https://github.com/thecolab-ai/the-for-good-project/issues/141) | How many NZ startups seek angel/seed funding each year, how many fail to raise, and is discovery/access, capital scarcity, or investment-readiness the binding constraint? | Closed child opened before G0; process-incident reference unless accepted by a human. |
| [#142](https://github.com/thecolab-ai/the-for-good-project/issues/142) | Who writes the $10k-$200k cheques, including off-network solo angels, and how discoverable are sub-$250k pathways today? | Closed child opened before G0; process-incident reference unless accepted by a human. |
| [#143](https://github.com/thecolab-ai/the-for-good-project/issues/143) | What free or low-cost founder-investor connection models work overseas, and what transfers to New Zealand? | Closed child opened before G0; process-incident reference unless accepted by a human. |
| [#144](https://github.com/thecolab-ai/the-for-good-project/issues/144) | Would NZ investors participate in open formats or maintain an open directory, and what stops them? | Closed child opened before G0; process-incident reference unless accepted by a human. |
| [#145](https://github.com/thecolab-ai/the-for-good-project/issues/145) | Who is structurally locked out of NZ angel/seed access, and what does the distributional data show? | Closed child opened before G0; process-incident reference unless accepted by a human. |

## What to action next

1. A maintainer or human steward should decide whether [#110](https://github.com/thecolab-ai/the-for-good-project/issues/110) passes G0.
2. If G0 passes, the same human should explicitly state whether [#141](https://github.com/thecolab-ai/the-for-good-project/issues/141)-[#145](https://github.com/thecolab-ai/the-for-good-project/issues/145) are accepted into the stream record despite being opened early, or whether they should be superseded by new validly spawned research issues.
3. If G0 does not pass, the premature child work should remain parked as non-precedential process history and should not drive synthesis, ideation, or build decisions.
4. Any future stream framing should test the access hypothesis instead of assuming it, and any claim about an absent machine-readable dataset should include a documented search audit.

## Sources

1. The For Good Project. Issue #110, "[Discover] Early-stage NZ founders can't reach angel & seed funding - discovery is fragmented, gated, and pay-to-play." Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/110
2. The For Good Project. Issue #141, "research: How many NZ startups seek angel/seed funding each year, how many fail to raise, and is discovery/access (vs capital scarcity) the binding constraint?" Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/141
3. The For Good Project. Issue #142, "research: Who writes the $10k-$200k angel cheques in NZ, and how discoverable are sub-$250k funding pathways today?" Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/142
4. The For Good Project. Issue #143, "research: What free/low-cost founder-investor connection models work overseas (open demo days, office hours, matching platforms), and what transfers to NZ?" Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/143
5. The For Good Project. Issue #144, "research: Would NZ investors participate in open founder-investor formats and contribute to/maintain an open funder directory - and what stops them?" Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/144
6. The For Good Project. Issue #145, "research: Who is structurally locked out of NZ angel/seed access - first-timers, founders outside Auckland/Wellington, Maori & Pasifika, women - and what does the data show?" Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/145
7. The For Good Project. "Streams, human gates, and where people actually fit." Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md
8. NZ Herald. "Start-up company investment surged to $754m in 2025 after deal activity jumped." Accessed 3 July 2026. https://www.nzherald.co.nz/business/personal-finance/investment/start-up-company-investment-surged-to-754m-in-2025-after-deal-activity-jumped/5B4X67OA4FANLGYZIUCXHTDLGI/
9. b2bnews. "NZ startup investment hits $754m but new company pipeline shrinks." Accessed 3 July 2026. https://b2bnews.co.nz/news/nz-startup-investment-hits-754m-but-new-company-pipeline-shrinks/
10. Catalist. "2025 Annual New Zealand Angel Market Report." Accessed 3 July 2026. https://cdn.catalist.co.nz/Documents/Reports/2025+Annual+New+Zealand+Angel+Market+Report.pdf
11. Angel Association New Zealand. Home page / founder-investor discovery surface. Accessed 3 July 2026. https://www.angelassociation.co.nz/
12. NZGCP. "Start-up Investors." Accessed 3 July 2026. https://www.nzgcp.co.nz/start-up-resources/start-up-investors
13. Enterprise Angels. Home page. Accessed 3 July 2026. https://www.enterpriseangels.co.nz/
14. Enterprise Angels. "AngelEquity." Accessed 3 July 2026. https://www.enterpriseangels.co.nz/angelequity/
15. Startup Advisors Council / MBIE. "Upstart Nation." 2023. Accessed 3 July 2026. https://www.mbie.govt.nz/assets/upstart-nation.pdf
16. MBIE. "Briefing: Access to growth capital." 9 May 2025. Accessed 3 July 2026. https://www.mbie.govt.nz/dmsdocument/31135-access-growth-capital
17. NZGCP. "Aspire NZ Seed Fund - FAQs." Accessed 3 July 2026. https://www.nzgcp.co.nz/assets/NZGCP-Aspire-FAQ_Nov22.pdf
