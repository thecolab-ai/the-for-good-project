---
title: "Discover framing: Treaty consideration as a default checklist item"
type: "analysis"
issue: "#104"
author: "adam91holt"
agent: "codex"
model: "gpt-5"
date: "2026-07-03"
status: "proposal"
---

# Discover framing: Treaty consideration as a default checklist item

> **Status - discover framing, not adopted policy.** This document frames stream #104 and opens research questions for a human steward to use at G1. It does not change `CONTRIBUTING.md`, `docs/METHOD.md`, or any binding project rule; the Constitution says agents may research and draft but may not set stream direction or pass gates, and `docs/STREAMS.md` says G1 direction is human judgement. [CONSTITUTION.md](../CONSTITUTION.md); [docs/STREAMS.md](../docs/STREAMS.md)

## Executive answer

- **Problem statement:** the project has a live, steward-accepted proposal to make Treaty consideration a default checklist item for every stream, but the binding method docs have not yet decided where such a check belongs, how much work it should require, whether it applies retroactively, or how it should trade off against scarce steward attention. [Issue #104](https://github.com/thecolab-ai/the-for-good-project/issues/104); [CONTRIBUTING.md](../CONTRIBUTING.md); [docs/METHOD.md](../docs/METHOD.md)
- **Who is affected:** the immediate users are contributors, reviewers, maintainers and stream stewards who follow the project's workflow; the downstream stake is wider because the project says it works on Aotearoa New Zealand's societal problems, and Stats NZ's 2023 Census release reports 887,493 people identifying with the Maori ethnic group and 978,246 people of Maori descent in New Zealand's census usually resident population. [CONSTITUTION.md](../CONSTITUTION.md); [CONTRIBUTING.md](../CONTRIBUTING.md); [Stats NZ 2023 Census population counts](https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/)
- **What is already being done:** `analysis/treaty-consideration-as-default-lens.md` has already proposed three reusable lenses, and the issue #104 triage comment accepted the reframing in principle as worth a Discover stream while explicitly reserving adoption for human judgement. [analysis/treaty-consideration-as-default-lens.md](treaty-consideration-as-default-lens.md); [issue #104 triage comment](https://github.com/thecolab-ai/the-for-good-project/issues/104#issuecomment-4870320239)
- **The current docs support the need for a decision but do not decide it:** the Constitution and method already require cited, honest, human-gated work; `docs/STREAMS.md` already lists sensitive domains and lived-experience/legal-authority limits as always-human triggers; `CONTRIBUTING.md` and `docs/METHOD.md` do not currently include a default Te Tiriti/Maori-data-governance checklist item in the PR checklist or five checks. [CONSTITUTION.md](../CONSTITUTION.md); [docs/STREAMS.md](../docs/STREAMS.md); [CONTRIBUTING.md](../CONTRIBUTING.md); [docs/METHOD.md](../docs/METHOD.md)
- **Fan-out decision:** three research issues are now open: checklist placement (#136), retroactivity (#138), and the light-default-versus-high-stakes-focus tradeoff (#137). Do not open a separate Te Tiriti/Maori-data-governance Discover issue from this pass, because the steward triage comment says that should be scoped but not opened until G1. [issue #104 triage comment](https://github.com/thecolab-ai/the-for-good-project/issues/104#issuecomment-4870320239); [issue #136](https://github.com/thecolab-ai/the-for-good-project/issues/136); [issue #137](https://github.com/thecolab-ai/the-for-good-project/issues/137); [issue #138](https://github.com/thecolab-ai/the-for-good-project/issues/138); [docs/STREAMS.md](../docs/STREAMS.md)

**Overall confidence:** Medium. The repo-process facts are high confidence because they come from the current repository and issue thread; the recommendation to fan out three child questions is medium confidence because it follows steward triage but still depends on human judgement at G1. [issue #104 triage comment](https://github.com/thecolab-ai/the-for-good-project/issues/104#issuecomment-4870320239); [docs/STREAMS.md](../docs/STREAMS.md)

## Evidence

### Why this is a Discover stream, not an adoption PR

`CONTRIBUTING.md` defines Discover as framing a real New Zealand problem into researchable questions, and says issue chains link forward from Discover to Research, Ideate and Build. [CONTRIBUTING.md](../CONTRIBUTING.md)

`docs/STREAMS.md` says a root Discover issue anchors a stream, research children can be opened within the fan-out depth bound after G0, and a root Discover PR must use `Part of #<root>` rather than `Closes`. [docs/STREAMS.md](../docs/STREAMS.md)

Issue #104's triage comment records the human disposition for this issue: accepted as a Discover stream, with the adoption decision staying human; it also says Q4 should be first-class, Q1 and Q2 are decidable questions an agent can research, and Q3 should be scoped but not opened as its own Discover issue until G1. [issue #104 triage comment](https://github.com/thecolab-ai/the-for-good-project/issues/104#issuecomment-4870320239)

The Constitution says agents may research, draft, cross-check and review, but may not set a stream's direction, pass gates, publish externally or merge. [CONSTITUTION.md](../CONSTITUTION.md)

### Why the default-lens question is real

`analysis/gap-analysis-and-operating-plan.md` names "Te Tiriti & Maori data sovereignty absent" as gap #5 and recommends a Te Tiriti/Maori data-governance workstream as a proposal rather than a decision. [analysis/gap-analysis-and-operating-plan.md](gap-analysis-and-operating-plan.md)

`analysis/treaty-consideration-as-default-lens.md` argues that the conditional trigger framing is the deeper gap and proposes three domain-agnostic lenses: Treaty principles, a values check, and a Quadruple Bottom Line evaluation frame. [analysis/treaty-consideration-as-default-lens.md](treaty-consideration-as-default-lens.md)

The external public-source basis for those lenses is credible enough to research but not enough to enact policy without the gate: Te Ara describes principles of the Treaty of Waitangi as developed by courts, the Waitangi Tribunal and the Crown; data.govt.nz publishes Ngā Tikanga Paihere as guidance for safe, responsible and culturally appropriate data use; Digital.govt.nz's Public Service AI Framework lists Te Tiriti o Waitangi among relevant public-service obligations for AI use. [Te Ara Treaty principles](https://teara.govt.nz/en/principles-of-the-treaty-of-waitangi-nga-matapono-o-te-tiriti-o-waitangi); [data.govt.nz Ngā Tikanga Paihere](https://data.govt.nz/toolkit/data-ethics/nga-tikanga-paihere/); [Digital.govt.nz Public Service AI Framework](https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/public-service-artificial-intelligence-framework)

There is already related, narrower project research in the AI-policy domain: the merged finding on NZ public-sector AI guidance says the Public Service AI Framework lists Te Tiriti o Waitangi in its policy context, and that the GenAI guidance for Maori, Pacific Peoples and ethnic communities recommends considering purpose, impacts on Maori, the nature and status of Maori data, Maori data-governance applications, and existing Maori-Crown relationship approaches. [research/findings/ai-policy/nz-public-sector-ai-guidance.md](../research/findings/ai-policy/nz-public-sector-ai-guidance.md); [Digital.govt.nz Maori, Pacific Peoples, ethnic communities and GenAI](https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/responsible-ai-guidance-for-the-public-service-genai/customer-experience/maori-pacific-and-ethnic-communities)

That prior AI-policy finding is not a substitute for #104 because it answers a domain question about public-sector AI guidance, while #104 asks whether this project's own working method should include a default checklist item. [research/findings/ai-policy/nz-public-sector-ai-guidance.md](../research/findings/ai-policy/nz-public-sector-ai-guidance.md); [Issue #104](https://github.com/thecolab-ai/the-for-good-project/issues/104)

### Current repo state checked in this pass

As of 3 July 2026, `CONTRIBUTING.md` contains a pull request checklist but no default Te Tiriti, Treaty, Maori, iwi or data-sovereignty checklist item; `docs/METHOD.md` contains five checks but no such default item. This was checked by reading both files and by repo search for those terms. [CONTRIBUTING.md](../CONTRIBUTING.md); [docs/METHOD.md](../docs/METHOD.md)

As of 3 July 2026, GitHub search for open issues in this repo returned issue #104 for "Te Tiriti", "Treaty", and "data sovereignty"; it returned issues #104 and #110 for "Māori". Issue #110 is a separate discover issue about early-stage founder funding access, so it does not resolve #104's checklist-placement question. [Issue #104](https://github.com/thecolab-ai/the-for-good-project/issues/104); [Issue #110](https://github.com/thecolab-ai/the-for-good-project/issues/110)

Several official NZ web pages used here returned bot-protection or placeholder responses to raw `curl`, then loaded through the built-in WebFetch/WebSearch path: Te Ara returned a Cloudflare challenge to `curl`, while data.govt.nz and Digital.govt.nz returned short Imperva placeholder pages to `curl`; those pages were therefore verified at the WebFetch rung rather than marked dead. [ADR-0006](../docs/adr/0006-fetch-proxy-browser-management.md); [Te Ara Treaty principles](https://teara.govt.nz/en/principles-of-the-treaty-of-waitangi-nga-matapono-o-te-tiriti-o-waitangi); [data.govt.nz Ngā Tikanga Paihere](https://data.govt.nz/toolkit/data-ethics/nga-tikanga-paihere/); [Digital.govt.nz Public Service AI Framework](https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/public-service-artificial-intelligence-framework)

## Surprising or load-bearing claims

| Claim | Support | Independence / confidence |
|---|---|---|
| The adoption decision should not be made by this PR. | The Constitution says agents cannot set stream direction or pass gates, and `docs/STREAMS.md` reserves G1 direction for human judgement. [CONSTITUTION.md](../CONSTITUTION.md); [docs/STREAMS.md](../docs/STREAMS.md) | High; two binding repo documents agree. |
| The issue should fan out into research rather than directly editing the method docs. | `CONTRIBUTING.md` defines Discover as framing researchable questions, and the #104 triage comment accepts the issue as a Discover stream while reserving adoption for humans. [CONTRIBUTING.md](../CONTRIBUTING.md); [issue #104 triage comment](https://github.com/thecolab-ai/the-for-good-project/issues/104#issuecomment-4870320239) | High for process; the triage comment is a human steward instruction. |
| There is enough public NZ material to make a default Treaty-consideration lens researchable. | Te Ara, data.govt.nz and Digital.govt.nz all publish relevant public guidance or context. [Te Ara Treaty principles](https://teara.govt.nz/en/principles-of-the-treaty-of-waitangi-nga-matapono-o-te-tiriti-o-waitangi); [data.govt.nz Ngā Tikanga Paihere](https://data.govt.nz/toolkit/data-ethics/nga-tikanga-paihere/); [Digital.govt.nz Public Service AI Framework](https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/public-service-artificial-intelligence-framework) | Medium; the sources support researchability, not this project's final policy choice. |
| The affected population is broader than contributors because the project works on Aotearoa New Zealand societal problems and Maori are a substantial population in that society. | The Constitution states the project works on Aotearoa New Zealand societal problems, and Stats NZ reports 887,493 people identifying with the Maori ethnic group and 978,246 people of Maori descent in the 2023 Census. [CONSTITUTION.md](../CONSTITUTION.md); [Stats NZ 2023 Census population counts](https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/) | Medium; strong sources, but the link from population scale to this specific checklist is a normative judgement. |
| A separate dedicated Te Tiriti/Maori-data-governance Discover issue should not be opened in this pass. | The #104 triage comment says Q3 should be scoped but not opened until G1, and `docs/STREAMS.md` makes G1 a human direction gate. [issue #104 triage comment](https://github.com/thecolab-ai/the-for-good-project/issues/104#issuecomment-4870320239); [docs/STREAMS.md](../docs/STREAMS.md) | High for process; the substantive need for that future stream remains untested. |

## Follow-up questions opened from this discovery

1. [#136](https://github.com/thecolab-ai/the-for-good-project/issues/136): Where should a default Treaty-consideration checklist live: `CONTRIBUTING.md`, `docs/METHOD.md`, `docs/STREAMS.md`, or more than one place?
2. [#138](https://github.com/thecolab-ai/the-for-good-project/issues/138): If adopted, should a default Treaty-consideration check apply retroactively to existing streams, and what is the least disruptive way to handle stream #4 and other live work?
3. [#137](https://github.com/thecolab-ai/the-for-good-project/issues/137): Was the existing trigger-condition framing an intentional steward-attention tradeoff, and what would a proportionate default check cost in reviewer/steward effort?

## Question scoped but not opened

A separate Te Tiriti/Maori-data-governance Discover stream may still be needed, because `analysis/gap-analysis-and-operating-plan.md` and `analysis/treaty-consideration-as-default-lens.md` both identify it as a possible distinct workstream. This pass does not open that stream because the #104 triage comment says it should wait until G1. [analysis/gap-analysis-and-operating-plan.md](gap-analysis-and-operating-plan.md); [analysis/treaty-consideration-as-default-lens.md](treaty-consideration-as-default-lens.md); [issue #104 triage comment](https://github.com/thecolab-ai/the-for-good-project/issues/104#issuecomment-4870320239)

## Confidence & limits

**What is fact:** the cited repo files define the current workflow, gates and method; issue #104's triage comment accepts this as a Discover stream and reserves adoption for human judgement; issues #136, #137 and #138 were opened from this pass. [CONSTITUTION.md](../CONSTITUTION.md); [CONTRIBUTING.md](../CONTRIBUTING.md); [docs/STREAMS.md](../docs/STREAMS.md); [issue #104 triage comment](https://github.com/thecolab-ai/the-for-good-project/issues/104#issuecomment-4870320239); [issue #136](https://github.com/thecolab-ai/the-for-good-project/issues/136); [issue #137](https://github.com/thecolab-ai/the-for-good-project/issues/137); [issue #138](https://github.com/thecolab-ai/the-for-good-project/issues/138)

**What is interpretation:** that these three research issues are the right minimum fan-out for G1, and that a separate dedicated Te Tiriti/Maori-data-governance Discover issue should wait rather than being opened by this agent pass. [issue #104 triage comment](https://github.com/thecolab-ai/the-for-good-project/issues/104#issuecomment-4870320239); [docs/STREAMS.md](../docs/STREAMS.md)

**Overall confidence:** Medium. The process evidence is strong, but the final policy choice needs human judgement and should include Maori domain expertise before becoming binding. [CONSTITUTION.md](../CONSTITUTION.md); [docs/STREAMS.md](../docs/STREAMS.md)

- A maintainer or steward decision record showing that the project intentionally chose a trigger-only approach would change the research emphasis from "should this be default?" to "what evidence would justify changing the prior decision?".
- A human steward decision at G1 could decide that one lightweight checklist item is enough, that only sensitive streams should receive the full three-lens pass, or that no method-doc change should happen yet.
- Evidence from Maori advisors, iwi partners, kaupapa Maori researchers, or a steward with relevant domain authority could materially change both the checklist wording and the depth required by stream type.
- I could not verify any private or off-repo discussions about why the current method docs omit this default check; this document relies only on public repo files, public issue comments, and public external sources.
- I did not test exact checklist wording with contributors or reviewers, so the effort cost and failure modes need the Q4 research issue before a binding change is proposed.

## Sources

1. The For Good Project. `CONSTITUTION.md`. Accessed 3 July 2026. [CONSTITUTION.md](../CONSTITUTION.md)
2. The For Good Project. `CONTRIBUTING.md`. Accessed 3 July 2026. [CONTRIBUTING.md](../CONTRIBUTING.md)
3. The For Good Project. `docs/METHOD.md`. Accessed 3 July 2026. [docs/METHOD.md](../docs/METHOD.md)
4. The For Good Project. `docs/STREAMS.md`. Accessed 3 July 2026. [docs/STREAMS.md](../docs/STREAMS.md)
5. The For Good Project. ADR-0006. Accessed 3 July 2026. [docs/adr/0006-fetch-proxy-browser-management.md](../docs/adr/0006-fetch-proxy-browser-management.md)
6. The For Good Project. Issue #104, including triage comment. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/104
7. The For Good Project. Issue #110. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/110
8. The For Good Project. Issue #136. Created 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/136
9. The For Good Project. Issue #137. Created 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/137
10. The For Good Project. Issue #138. Created 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/138
11. The For Good Project. `analysis/gap-analysis-and-operating-plan.md`. Accessed 3 July 2026. [analysis/gap-analysis-and-operating-plan.md](gap-analysis-and-operating-plan.md)
12. The For Good Project. `analysis/treaty-consideration-as-default-lens.md`. Accessed 3 July 2026. [analysis/treaty-consideration-as-default-lens.md](treaty-consideration-as-default-lens.md)
13. The For Good Project. `research/findings/ai-policy/nz-public-sector-ai-guidance.md`. Accessed 3 July 2026. [research/findings/ai-policy/nz-public-sector-ai-guidance.md](../research/findings/ai-policy/nz-public-sector-ai-guidance.md)
14. Stats NZ. "2023 Census population counts (by ethnic group, age, and Maori descent) and dwelling counts." Released 29 May 2024; accessed 3 July 2026. https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/
15. Te Ara. "Principles of the Treaty of Waitangi - ngā mātāpono o te Tiriti o Waitangi." Verified by WebFetch after raw `curl` returned a Cloudflare challenge; accessed 3 July 2026. https://teara.govt.nz/en/principles-of-the-treaty-of-waitangi-nga-matapono-o-te-tiriti-o-waitangi
16. data.govt.nz. "Ngā Tikanga Paihere." Verified by WebFetch after raw `curl` returned an Imperva placeholder; accessed 3 July 2026. https://data.govt.nz/toolkit/data-ethics/nga-tikanga-paihere/
17. Digital.govt.nz. "Public Service AI Framework." Verified by WebFetch after raw `curl` returned an Imperva placeholder; accessed 3 July 2026. https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/public-service-artificial-intelligence-framework
18. Digital.govt.nz. "Māori, Pacific Peoples, ethnic communities and GenAI." Verified by WebFetch; accessed 3 July 2026. https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/responsible-ai-guidance-for-the-public-service-genai/customer-experience/maori-pacific-and-ethnic-communities
