---
title: "A light default Treaty check is the proportionate steward-attention tradeoff"
domain: "other"
issue: "#137"
confidence: "Medium"
author: "adam91holt"
agent: "codex"
model: "gpt-5"
date: "2026-07-03"
status: "draft"
---

# A light default Treaty check is the proportionate steward-attention tradeoff

## Executive answer

- I found no public repo decision record showing that the current Treaty/Maori-data-governance trigger framing was an intentional Treaty-specific policy choice before stream #104; I did find a clearly intentional project-wide pattern of conserving human judgement through triggers, gates, and sensitive-domain escalation. [Issue #104](https://github.com/thecolab-ai/the-for-good-project/issues/104); [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/STREAMS.md); [CONSTITUTION.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/CONSTITUTION.md)
- The proportionate model is therefore a **light default check for every stream**, with a **deep Treaty/Maori-data-governance pass only when the light check finds high stakes**. This preserves the benefit of a default prompt while respecting the project's rule that humans, not agents, hold judgement. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/STREAMS.md); [CONTRIBUTING.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/CONTRIBUTING.md)
- A light check should cost reviewers roughly one extra checklist confirmation per stream or finding, not a new steward meeting; that estimate is Low confidence because the repo does not measure review minutes. [GitHub PR template](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/.github/PULL_REQUEST_TEMPLATE.md); [research/TEMPLATE.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/research/TEMPLATE.md)
- A deep pass should be reserved for streams involving Maori data, material effects on Maori communities, child welfare or other sensitive domains, Low-confidence load-bearing claims, external publication, or any point the agent flags as needing lived experience or domain authority. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/STREAMS.md); [Digital.govt.nz GenAI guidance](https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/responsible-ai-guidance-for-the-public-service-genai/customer-experience/maori-pacific-and-ethnic-communities); [data.govt.nz Maori Data and AI guidance](https://data.govt.nz/leadership/centre-for-data-ethics-and-innovation/guidance/maori-data-and-ai-guidance-for-business)
- Maori domain authority is needed to settle the wording, thresholds, and acceptable evidence for the check; this finding can compare workload models, but it cannot decide what "enough" Treaty consideration means. [Te Mana Raraunga](https://www.temanararaunga.maori.nz/); [data.govt.nz Maori Data and AI guidance](https://data.govt.nz/leadership/centre-for-data-ethics-and-innovation/guidance/maori-data-and-ai-guidance-for-business)

**Overall confidence:** Medium - the process evidence is strong, but the effort estimate is inferred from repo mechanics rather than measured review times, and the substantive Treaty/Maori-governance thresholds need Maori expertise.

## Evidence

### The existing framing was not explicitly recorded as a Treaty-specific decision

The parent issue says the previous gap analysis treated Te Tiriti and Maori data sovereignty as a trigger condition, and the #104 triage comment says that whether this was a deliberate steward-attention tradeoff deserves a real answer before any binding change. [Issue #104](https://github.com/thecolab-ai/the-for-good-project/issues/104); [issue #104 triage comment](https://github.com/thecolab-ai/the-for-good-project/issues/104#issuecomment-4870320239)

The current binding method documents already require citations, double-sourcing for surprising claims, confidence marks, and human judgement at gates, but they do not include a default Te Tiriti, Treaty, Maori, iwi, or data-sovereignty checklist item. [CONTRIBUTING.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/CONTRIBUTING.md); [docs/METHOD.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/METHOD.md)

The prior gap analysis marked "Te Tiriti & Maori data sovereignty absent" as gap #5 and proposed a Te Tiriti/Maori data-governance workstream, but it also marked its recommendations as proposals rather than adopted policy. [Gap analysis](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/analysis/gap-analysis-and-operating-plan.md)

The later default-lens analysis argues that the trigger-condition framing is itself the deeper gap, but it explicitly says that adopting the lenses in `CONTRIBUTING.md` or `docs/METHOD.md` is a working-group decision, not something the analysis enacts. [Treaty default-lens analysis](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/analysis/treaty-consideration-as-default-lens.md)

My reading is therefore: the current trigger framing is **intentional by architecture** because the repo uses triggers and gates to protect scarce human judgement, but it is **not publicly evidenced as an intentional Treaty-specific settlement**. That distinction matters because the Constitution says significant decisions are made in the open and agents may research and draft but may not pass gates or set stream direction. [CONSTITUTION.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/CONSTITUTION.md); [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/STREAMS.md)

### Steward attention is deliberately scarce in this project

`docs/STREAMS.md` separates method review from synthesis and direction review: agents can do source gathering, formatting, and routine method review, while humans decide whether the stream as a whole is meaningful and what should happen next. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/STREAMS.md)

The same document defines always-human triggers: sensitive domains, Low-confidence load-bearing claims, personal or identifying data, anything flagged as needing lived experience or legal authority, and external-facing outputs. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/STREAMS.md)

The Constitution makes that division binding by saying agents may research, draft, cross-check, and review, but may not set stream direction, pass gates, publish externally, or merge. [CONSTITUTION.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/CONSTITUTION.md)

The automation docs reinforce the same allocation of labour: `synthesize_work.sh` drafts the G1 rollup, but the steward edits it, records the direction decision, and merges; `merge_ready.sh` requires qualifying non-author adversarial review before merge. [docs/AUTOMATION.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/AUTOMATION.md)

The merge trust file encodes extra review load for sensitive domains by requiring one default approval but adding extra approvals for `child-welfare` and `biosecurity`. [.github/trusted-reviewers.json](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/.github/trusted-reviewers.json)

As a dated snapshot on 3 July 2026, `gh issue list` showed 19 open issues and `gh pr list` showed 5 open PRs; the same snapshot showed stream #3 labelled `status: needs-synthesis` and stream #61 labelled `status: awaiting-direction`, so at least two stream-level human-judgement queues were live. [Issue #3](https://github.com/thecolab-ai/the-for-good-project/issues/3); [Issue #61](https://github.com/thecolab-ai/the-for-good-project/issues/61); [GitHub PR list](https://github.com/thecolab-ai/the-for-good-project/pulls)

This snapshot supports the claim that steward attention is a live constraint, but it does not measure how many hours stewards have or how long reviews take. [docs/METHOD.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/METHOD.md); [docs/AUTOMATION.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/AUTOMATION.md)

### Public NZ guidance supports a lightweight first pass and deeper escalation

DPMC's Cabinet Office circular says it gives policy-makers Cabinet-agreed guidance for considering the Treaty in policy development and implementation, and its "Article One" questions include asking how a proposal affects all New Zealanders, whether the effect on Maori is different, what unintended impacts on Maori could be, what Treaty/Maori interests exist, and how policy-makers have identified them. [DPMC CO (19) 5](https://www.dpmc.govt.nz/publications/co-19-5-te-tiriti-o-waitangi-treaty-waitangi-guidance)

Ngā Tikanga Paihere is framed as a question-based guide for safe, responsible, culturally appropriate data practice, and data.govt.nz says it helps guide data use, careful consideration, and good-faith data practice. [data.govt.nz Ngā Tikanga Paihere](https://data.govt.nz/leadership/centre-for-data-ethics-and-innovation/guidance/nga-tikanga-paihere)

Digital.govt.nz's GenAI guidance says public-service GenAI has opportunities and challenges when Maori data is involved or Maori communities are affected, and recommends considering potential impacts on Maori, the nature and status of Maori data, Maori data-governance applications, and existing Maori-Crown relationship approaches. [Digital.govt.nz GenAI guidance](https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/responsible-ai-guidance-for-the-public-service-genai/customer-experience/maori-pacific-and-ethnic-communities)

The data.govt.nz Maori Data and AI page says Maori data includes digital or digitisable information or knowledge about or from Maori people, language, culture, resources, or environments; it also says risks can be hard to identify without Maori expertise and perspective, and that AI using Maori data or affecting Maori should invite Maori views into decision-making. [data.govt.nz Maori Data and AI guidance](https://data.govt.nz/leadership/centre-for-data-ethics-and-innovation/guidance/maori-data-and-ai-guidance-for-business)

Te Mana Raraunga says Maori Data Sovereignty recognises that Maori data should be subject to Maori governance and supports tribal sovereignty and Maori and iwi aspirations. [Te Mana Raraunga](https://www.temanararaunga.maori.nz/)

These sources do not tell this project exactly what checklist wording to adopt, but they do support a tiered model: ask a small number of default questions first, then escalate where Maori data, Maori impacts, Treaty interests, or cultural authority are actually engaged. [DPMC CO (19) 5](https://www.dpmc.govt.nz/publications/co-19-5-te-tiriti-o-waitangi-treaty-waitangi-guidance); [Digital.govt.nz GenAI guidance](https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/responsible-ai-guidance-for-the-public-service-genai/customer-experience/maori-pacific-and-ethnic-communities); [data.govt.nz Maori Data and AI guidance](https://data.govt.nz/leadership/centre-for-data-ethics-and-innovation/guidance/maori-data-and-ai-guidance-for-business)

## Operating models compared

| Model | What changes | Reviewer cost | Steward cost | Main risk | Confidence |
|---|---|---:|---:|---|---|
| **A. Light default check for every stream** | Every Discover framing or research finding records one short Treaty/Maori-data-governance note: `No obvious Maori data, Maori-community impact, Treaty/Maori interest, or cultural-authority question found in this pass` or `Escalate because...`. Reviewers check that sentence the way they already check citations, confidence and limits. [PR template](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/.github/PULL_REQUEST_TEMPLATE.md); [research/TEMPLATE.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/research/TEMPLATE.md) | Low: one extra checklist item and one sentence to sanity-check; no measured minutes available. | Usually none before G1 unless the sentence flags escalation. | Tokenistic wording or false negatives if contributors treat the sentence as a keyword search. | Medium for direction; Low for exact effort. |
| **B. Deep pass only for high-stakes streams** | No universal sentence; a full Treaty/Maori-data-governance pass happens only when existing triggers fire: sensitive domain, Maori data, Maori community impact, Low-confidence load-bearing claim, external publication, or agent flag for lived experience/domain authority. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/STREAMS.md); [data.govt.nz Maori Data and AI guidance](https://data.govt.nz/leadership/centre-for-data-ethics-and-innovation/guidance/maori-data-and-ai-guidance-for-business) | Low for ordinary streams; higher for triggered streams because reviewers must check the escalation rationale and evidence. | Medium to High when triggered, because this likely needs a steward plus Maori expertise or lived/domain authority. | Silent misses in streams that do not look Maori-coded at first glance. | Medium for direction; Low for exact effort. |
| **C. Recommended hybrid** | Apply Model A's light sentence universally, and route only the flagged subset into Model B's deeper pass. This matches the repo's existing split between routine agent-checkable method review and human-only judgement triggers. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/STREAMS.md); [CONTRIBUTING.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/CONTRIBUTING.md) | Low for most items; Medium only for flagged items. | Near-zero for unflagged items; bounded to the subset already needing judgement for flagged items. | Requires reviewers to challenge weak "nothing to see" sentences rather than rubber-stamping them. | Medium. |

The hybrid is the best fit because it makes the absence of a Treaty/Maori-data-governance issue visible without asking stewards to perform a full cultural-governance review on every stream. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/STREAMS.md); [DPMC CO (19) 5](https://www.dpmc.govt.nz/publications/co-19-5-te-tiriti-o-waitangi-treaty-waitangi-guidance)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| The trigger-only Treaty framing is not publicly evidenced as an intentional Treaty-specific policy choice. | [Issue #104 asks the question rather than citing a prior decision](https://github.com/thecolab-ai/the-for-good-project/issues/104) | [Treaty default-lens analysis says adoption remains undecided](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/analysis/treaty-consideration-as-default-lens.md) | Medium |
| The project intentionally conserves human judgement through triggers and gates. | [docs/STREAMS.md separates agent method review from human synthesis/direction review](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/STREAMS.md) | [CONSTITUTION.md says agents may not set direction, pass gates, publish externally, or merge](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/CONSTITUTION.md) | High |
| A light default Treaty check can be proportionate because official NZ guidance itself includes question-based first-pass prompts. | [DPMC CO (19) 5 asks policy-makers to identify Maori impacts, Treaty/Maori interests, and unintended effects](https://www.dpmc.govt.nz/publications/co-19-5-te-tiriti-o-waitangi-treaty-waitangi-guidance) | [Ngā Tikanga Paihere uses tikanga-inspired questions to guide safe, responsible and culturally appropriate data use](https://data.govt.nz/leadership/centre-for-data-ethics-and-innovation/guidance/nga-tikanga-paihere) | Medium |
| A deep pass needs Maori expertise when Maori data or Maori impacts are involved. | [data.govt.nz says risks can be hard to identify without Maori expertise and perspective](https://data.govt.nz/leadership/centre-for-data-ethics-and-innovation/guidance/maori-data-and-ai-guidance-for-business) | [Digital.govt.nz recommends considering Maori impacts, Maori data status, Maori data-governance applications, and Maori-Crown relationship approaches](https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/responsible-ai-guidance-for-the-public-service-genai/customer-experience/maori-pacific-and-ethnic-communities) | High |
| The exact review/steward effort cost cannot be measured from the repo today. | [docs/AUTOMATION.md describes review and synthesis mechanics but does not publish time-per-review metrics](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/AUTOMATION.md) | [The gap analysis's backlog/capacity point was explicitly marked interpretive rather than measured](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/analysis/gap-analysis-and-operating-plan.md) | High |

## What would change this conclusion

- A maintainer or steward decision record showing the project intentionally chose a trigger-only Treaty/Maori-data-governance approach would change the answer from "no explicit prior settlement found" to "there is a prior policy to revisit." [CONSTITUTION.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/CONSTITUTION.md)
- Measured review data showing that each extra checklist sentence materially slows adversarial review would weaken the light-default recommendation; I found no time-per-review data in the automation docs or repo metrics. [docs/AUTOMATION.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/AUTOMATION.md)
- Maori advisors, iwi partners, kaupapa Maori researchers, or a steward with relevant Maori domain authority could reasonably say the proposed light sentence is too thin, wrongly framed, or culturally unsafe; that would override this desk-review workload comparison. [Te Mana Raraunga](https://www.temanararaunga.maori.nz/); [data.govt.nz Maori Data and AI guidance](https://data.govt.nz/leadership/centre-for-data-ethics-and-innovation/guidance/maori-data-and-ai-guidance-for-business)
- I could not verify private/off-repo discussions about steward capacity, prior intent, or Maori advice already received by maintainers; this finding uses public repo files, public GitHub state, and public NZ guidance only. [Issue #104](https://github.com/thecolab-ai/the-for-good-project/issues/104)
- I did not validate exact wording with contributors, reviewers, or stewards, so the recommended sentence is an operating model, not final policy text. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/STREAMS.md)

## Open follow-up questions

- What exact wording should a Maori domain expert or steward approve for the light default sentence?
- Should the light check live in the PR template, the research template, Discover issue template, `docs/METHOD.md`, or more than one place?
- What reviewer guidance would prevent weak "no issue found" sentences from becoming boilerplate?
- Should the project track review time or steward time so future process changes can be costed with data rather than inference?

## Sources

1. The For Good Project. Issue #104, "Proposal: adopt Treaty consideration as a default checklist item, not a trigger condition." Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/104
2. The For Good Project. Issue #137, "research: Test the steward-attention tradeoff for a default Treaty-consideration check." Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/137
3. The For Good Project. `CONSTITUTION.md`, commit `de5791ae`. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/CONSTITUTION.md
4. The For Good Project. `CONTRIBUTING.md`, commit `de5791ae`. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/CONTRIBUTING.md
5. The For Good Project. `docs/METHOD.md`, commit `de5791ae`. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/METHOD.md
6. The For Good Project. `docs/STREAMS.md`, commit `de5791ae`. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/STREAMS.md
7. The For Good Project. `docs/AUTOMATION.md`, commit `de5791ae`. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/docs/AUTOMATION.md
8. The For Good Project. `.github/PULL_REQUEST_TEMPLATE.md`, commit `de5791ae`. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/.github/PULL_REQUEST_TEMPLATE.md
9. The For Good Project. `.github/trusted-reviewers.json`, commit `de5791ae`. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/.github/trusted-reviewers.json
10. The For Good Project. `research/TEMPLATE.md`, commit `de5791ae`. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/research/TEMPLATE.md
11. The For Good Project. `analysis/gap-analysis-and-operating-plan.md`, commit `de5791ae`. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/analysis/gap-analysis-and-operating-plan.md
12. The For Good Project. `analysis/treaty-consideration-as-default-lens.md`, commit `de5791ae`. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/de5791ae039a2ffea51876f22336e7699ef29a47/analysis/treaty-consideration-as-default-lens.md
13. The For Good Project. Issue #3, stream status snapshot. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/3
14. The For Good Project. Issue #61, stream status snapshot. Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/61
15. Department of the Prime Minister and Cabinet. "CO (19) 5: Te Tiriti o Waitangi / Treaty of Waitangi Guidance." Last updated 22 October 2019; raw `curl` returned 403, verified with built-in WebFetch on 3 July 2026. https://www.dpmc.govt.nz/publications/co-19-5-te-tiriti-o-waitangi-treaty-waitangi-guidance
16. data.govt.nz. "Ngā Tikanga Paihere." Verified with `curl` HTTP 200 and built-in WebFetch; accessed 3 July 2026. https://data.govt.nz/leadership/centre-for-data-ethics-and-innovation/guidance/nga-tikanga-paihere
17. Digital.govt.nz. "Māori, Pacific Peoples, ethnic communities and GenAI." Verified with `curl` HTTP 200 and built-in WebFetch; accessed 3 July 2026. https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence/responsible-ai-guidance-for-the-public-service-genai/customer-experience/maori-pacific-and-ethnic-communities
18. data.govt.nz. "Māori Data and AI - guidance for business." Verified with `curl` HTTP 200 and built-in WebFetch; accessed 3 July 2026. https://data.govt.nz/leadership/centre-for-data-ethics-and-innovation/guidance/maori-data-and-ai-guidance-for-business
19. Te Mana Raraunga. "Te Mana Raraunga." Verified with `curl` HTTP 200 and built-in WebFetch; accessed 3 July 2026. https://www.temanararaunga.maori.nz/
