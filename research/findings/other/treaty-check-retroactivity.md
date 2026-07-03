---
title: "A default Treaty-consideration check should apply prospectively, with a light checkpoint for in-flight streams and no blanket rewrite of merged work"
domain: "other"
issue: "#138"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5"
date: "2026-07-03"
status: "draft"
---

# A default Treaty-consideration check should apply prospectively, with a light checkpoint for in-flight streams

## Executive answer

- If the project adopts a default Treaty-consideration checklist, it should apply to **new streams from the adoption point forward**, because `analysis/treaty-consideration-as-default-lens.md` is explicitly advisory and says it does not enact a method change by being merged. [analysis/treaty-consideration-as-default-lens.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/analysis/treaty-consideration-as-default-lens.md); [analysis/README.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/analysis/README.md)
- For **in-flight streams**, the least disruptive treatment is a one-time, recorded checkpoint at the next natural human or review boundary: the root's G1 synthesis/direction, an active PR review, or a newly opened child research issue. This fits the stream model, where agents do method work and humans retain direction judgement. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md); [ADR-0001](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0001-streams-and-human-gates.md)
- For **already-merged findings**, do not reopen or rewrite them in bulk. Treat the missing checklist as a known provenance/context gap for synthesis, and only open targeted follow-up work if a steward identifies a specific Treaty, tikanga, Māori data, or cultural-impact question the existing evidence cannot answer. [ADR-0003](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0003-agent-drafted-synthesis.md); [ADR-0007](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0007-synthesis-drafts-candidate-outcomes.md)
- Stream #4 should get the strongest in-flight checkpoint because it is a live child-welfare stream, is explicitly sensitive, and currently has an open/claimed child research issue; the checkpoint should not imply the existing work is deficient, but it should ask whether Māori rights, whānau realities, tikanga/data-governance, or Oranga Tamariki/iwi-partnership context change the stream's framing or next research questions. [issue #4](https://github.com/thecolab-ai/the-for-good-project/issues/4); [issue #25](https://github.com/thecolab-ai/the-for-good-project/issues/25); [analysis/treaty-consideration-as-default-lens.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/analysis/treaty-consideration-as-default-lens.md)
- The recommendation is **Medium confidence**: repo workflow evidence strongly supports a low-disruption process, and public NZ sources support treating Treaty/data-governance questions as real, but no Māori steward, iwi partner, or lived-experience reviewer has validated this proposed retroactivity rule. [Te Ara, Treaty principles](https://teara.govt.nz/en/principles-of-the-treaty-of-waitangi-nga-matapono-o-te-tiriti-o-waitangi); [Te Mana Raraunga](https://www.temanararaunga.maori.nz/)

**Overall confidence:** Medium - the workflow recommendation is well supported by repo rules and current issue state, but the cultural-governance judgement needs Māori/domain authority before becoming binding.

## Evidence

### New-stream application

The current Treaty-default analysis is a proposal, not adopted policy: its status note says it records an argument and does not itself add a standing requirement to `CONTRIBUTING.md` or `docs/METHOD.md`; the analysis index says analysis documents are advisory and that substantive calls are made through PRs, gates, or governance changes. [analysis/treaty-consideration-as-default-lens.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/analysis/treaty-consideration-as-default-lens.md); [analysis/README.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/analysis/README.md)

The parent issue for this stream repeats that distinction: issue #104 proposes adopting the checklist as a default, and its steward triage comment accepts the stream as worth researching while explicitly saying the checklist is not yet adopted and the decision stays human at G1. [issue #104](https://github.com/thecolab-ai/the-for-good-project/issues/104)

That makes prospective application the cleanest rule: once a human adopts the checklist into the method, every later Discover framing and downstream stage can be reviewed against the same published requirement, while earlier work remains judged by the method in force when it was written. [CONTRIBUTING.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/CONTRIBUTING.md); [docs/METHOD.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/METHOD.md)

Treating the check as prospective does not weaken the substantive reason for adopting it: Te Ara summarises Treaty principles as evolving through courts, laws, Waitangi Tribunal findings, and Crown statements, including partnership, active protection, consultation, rangatiratanga, and adaptation to new circumstances. [Te Ara, Treaty principles](https://teara.govt.nz/en/principles-of-the-treaty-of-waitangi-nga-matapono-o-te-tiriti-o-waitangi)

Auckland Council's governance manual similarly describes Te Tiriti as constitutionally important, says partnership is an overarching concept at the heart of Treaty principles, and requires Māori impact statements for reports prepared for governing bodies, local boards, and committees; this supports a default "consider and record impact" pattern, not only a subject-matter trigger. [Auckland Council governance manual](https://governance.aucklandcouncil.govt.nz/6-maori-partnerships/te-tiriti-o-waitangi-co-governance-and-auckland-council)

### In-flight-stream review

The project already separates method review from stream direction: `docs/STREAMS.md` says per-finding method review is fact-checking, while synthesis and direction review are human judgement and cannot be delegated to an agent. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md)

ADR-0001 records the cost of the stream model as steward effort and names a tripwire if streams pile up at synthesis; ADR-0003 then moves the drafting burden to agents while keeping G1 direction decisions human. [ADR-0001](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0001-streams-and-human-gates.md); [ADR-0003](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0003-agent-drafted-synthesis.md)

Those rules point to a light in-flight checkpoint rather than a full retroactive rework pass: an agent can add or draft the evidence/context note, but a steward should decide whether the check changes the stream direction. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md); [ADR-0007](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0007-synthesis-drafts-candidate-outcomes.md)

The current open stream roots, checked with `gh issue list --state open --label "stage: discover"` on 3 July 2026, include streams #2, #3, #4, #60, #61, #104, and #110; among these, #2 and #60 already have stream overview files in `streams/`, #61 has an open synthesis PR, and #4 has no overview file yet. [GitHub open Discover issues query](https://github.com/thecolab-ai/the-for-good-project/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22stage%3A%20discover%22); [streams directory](https://github.com/thecolab-ai/the-for-good-project/tree/main/streams); [PR #140](https://github.com/thecolab-ai/the-for-good-project/pull/140); [issue #4](https://github.com/thecolab-ai/the-for-good-project/issues/4)

For #2 and #60, the least disruptive checkpoint is a short steward-facing note during synthesis/direction because their overview files are already drafted and still carry `TODO(steward)` direction placeholders. [stream #2 overview](https://github.com/thecolab-ai/the-for-good-project/blob/main/streams/2-small-nz-charities-miss-grants-they-re-eligible-fo.md); [stream #60 overview](https://github.com/thecolab-ai/the-for-good-project/blob/main/streams/60-consumer-credit-cost-fee-transparency-for-new-zeal.md)

For #61, the least disruptive checkpoint is review of the open synthesis PR because that PR is already the current human-editable synthesis surface for the stream. [PR #140](https://github.com/thecolab-ai/the-for-good-project/pull/140); [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md)

For #104 itself, no retroactivity rule should be enacted by this finding: issue #104's triage says adoption is a G1 human decision, and issue #138 is one child research issue in that stream. [issue #104](https://github.com/thecolab-ai/the-for-good-project/issues/104); [issue #138](https://github.com/thecolab-ai/the-for-good-project/issues/138)

### Already-merged work

Already-merged findings should remain intact because the method treats findings as cited, confidence-marked artifacts, and synthesis carries confidence forward rather than rewriting prior findings to fit a later decision. [docs/METHOD.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/METHOD.md); [ADR-0003](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0003-agent-drafted-synthesis.md)

Blanket reopening would also increase steward/reviewer load in exactly the area the stream ADRs already identify as scarce: ADR-0001 names steward effort as an accepted cost, and ADR-0003 was adopted because streams were fanning out faster than humans read. [ADR-0001](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0001-streams-and-human-gates.md); [ADR-0003](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0003-agent-drafted-synthesis.md)

The safer retroactive treatment is therefore an annotation pattern: at synthesis, record that the stream predates the checklist, run the checklist once at stream level, and open targeted research only where that check surfaces a concrete unanswered question. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md); [CONTRIBUTING.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/CONTRIBUTING.md)

This approach matches the project's confidence model: if the new check finds only a possible concern, it can be recorded as Low or Medium confidence and listed under "what would change this conclusion" rather than being treated as proof that the older finding was defective. [docs/METHOD.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/METHOD.md)

### Stream #4 treatment

Stream #4 is the strongest case for in-flight review because the root is child-welfare, its body says the domain touches vulnerable people and needs public-source/no-personal-data guardrails, and the root is currently open with a `status: changes-requested` label. [issue #4](https://github.com/thecolab-ai/the-for-good-project/issues/4)

Stream #4 also has an open child research issue (#25) asking where families discover entitlements and where the journey breaks down, so a Treaty/tikanga/data-governance checkpoint can still influence live research without reopening all prior work. [issue #25](https://github.com/thecolab-ai/the-for-good-project/issues/25)

The existing child-welfare findings in the repo answer entitlement inventory and take-up-gap questions, but they do not purport to apply the three Treaty/default-lens questions proposed in the analysis file; treating that as a scope gap is fair, while treating it as a defect would overstate the method requirement that existed when those files were written. [family-entitlements-nz.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/child-welfare/family-entitlements-nz.md); [take-up-gap-child-family-entitlements.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/child-welfare/take-up-gap-child-family-entitlements.md); [analysis/treaty-consideration-as-default-lens.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/analysis/treaty-consideration-as-default-lens.md)

The #4 checkpoint should ask, at minimum, whether the stream's framing needs Māori/whānau-specific navigation evidence, whether any proposed tool would collect or infer Māori data, whether Māori data governance applies, and whether a human with relevant Māori or child-welfare authority must decide scope before G1 proceeds. [Te Mana Raraunga](https://www.temanararaunga.maori.nz/); [data.govt.nz, Ngā Tikanga Paihere](https://data.govt.nz/toolkit/data-ethics/nga-tikanga-paihere); [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md)

Te Mana Raraunga says Māori data should be subject to Māori governance and that its purpose includes asserting Māori rights and interests in data; Ngā Tikanga Paihere says tikanga-based questions can guide safe, responsible, and culturally appropriate data use, including at the beginning of data use. [Te Mana Raraunga](https://www.temanararaunga.maori.nz/); [data.govt.nz, Ngā Tikanga Paihere](https://data.govt.nz/toolkit/data-ethics/nga-tikanga-paihere)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| The retroactive rule should not be a blanket rewrite because project governance already treats later analysis as advisory until adopted and reserves stream-direction judgement for humans. | [analysis/README.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/analysis/README.md) | [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md) plus [ADR-0001](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0001-streams-and-human-gates.md) | High for repo process; Medium for the normative recommendation |
| Stream #4 deserves a stronger checkpoint than most live streams because it is a child-welfare stream with explicit vulnerable-people guardrails and live child research still open. | [issue #4](https://github.com/thecolab-ai/the-for-good-project/issues/4) | [issue #25](https://github.com/thecolab-ai/the-for-good-project/issues/25) | Medium-High |
| Treaty/data-governance consideration is a real default concern, but depth should scale to stakes rather than forcing all existing artifacts through the same rework path. | [Te Ara, Treaty principles](https://teara.govt.nz/en/principles-of-the-treaty-of-waitangi-nga-matapono-o-te-tiriti-o-waitangi) and [Auckland Council governance manual](https://governance.aucklandcouncil.govt.nz/6-maori-partnerships/te-tiriti-o-waitangi-co-governance-and-auckland-council) | [Te Mana Raraunga](https://www.temanararaunga.maori.nz/) and [data.govt.nz, Ngā Tikanga Paihere](https://data.govt.nz/toolkit/data-ethics/nga-tikanga-paihere) | Medium |

## What would change this conclusion

- A human steward or Māori/domain-authority reviewer saying that any stream touching children, whānau, Māori data, or public-sector service navigation must be paused until a deeper Treaty/Māori-governance review is complete would override this low-disruption recommendation for that stream. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md)
- Evidence that an already-merged finding materially misframed Māori rights, whānau realities, tikanga, iwi partnership, or Māori data governance would justify targeted rework of that finding rather than a synthesis-only note. [docs/METHOD.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/METHOD.md)
- A newly adopted method PR could choose a stricter rule, such as requiring all active PRs to add a checklist section before merge; this finding should then be treated as pre-adoption research rather than the rule. [issue #104](https://github.com/thecolab-ai/the-for-good-project/issues/104)
- I could not verify private steward discussions outside GitHub, WhatsApp context beyond what has been pasted into issues, or any Māori partner position on retroactivity; those limits matter because the project itself says synthesis/direction is human judgement. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md)

## Open follow-up questions

- Should the final adopted checklist require an explicit "not material and why" sentence for low-stakes streams, or only for streams passing G1/G2? This overlaps with issue #136 and issue #137 and should not be opened as a new depth-3 issue. [issue #136](https://github.com/thecolab-ai/the-for-good-project/issues/136); [issue #137](https://github.com/thecolab-ai/the-for-good-project/issues/137)
- What exact wording should a stream-level checkpoint use so it does not imply older work was deficient? This should be decided in the #104 synthesis rather than spawned from this depth-2 issue. [issue #104](https://github.com/thecolab-ai/the-for-good-project/issues/104)
- Who has authority to validate the #4 checkpoint: a stream steward, a Māori data-governance reviewer, a child-welfare practitioner, or some combination? This needs human direction because agents should not invent consent or authority. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md)

## Sources

1. The For Good Project, `analysis/treaty-consideration-as-default-lens.md`, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/analysis/treaty-consideration-as-default-lens.md
2. The For Good Project, `analysis/README.md`, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/analysis/README.md
3. The For Good Project, issue #104, "Proposal: adopt Treaty consideration as a default checklist item, not a trigger condition", accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/104
4. The For Good Project, issue #138, "research: Decide how a default Treaty-consideration check should treat existing streams", accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/138
5. The For Good Project, `CONTRIBUTING.md`, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/CONTRIBUTING.md
6. The For Good Project, `docs/METHOD.md`, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/METHOD.md
7. The For Good Project, `docs/STREAMS.md`, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md
8. The For Good Project, ADR-0001, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0001-streams-and-human-gates.md
9. The For Good Project, ADR-0003, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0003-agent-drafted-synthesis.md
10. The For Good Project, ADR-0007, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0007-synthesis-drafts-candidate-outcomes.md
11. The For Good Project, issue #4, "[Discover] Families don't know what child & family support they qualify for", accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/4
12. The For Good Project, issue #25, "[Research] Where do NZ families go to find out what support they qualify for, and where does that break down?", accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/25
13. The For Good Project, stream #2 overview, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/streams/2-small-nz-charities-miss-grants-they-re-eligible-fo.md
14. The For Good Project, stream #60 overview, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/streams/60-consumer-credit-cost-fee-transparency-for-new-zeal.md
15. The For Good Project, PR #140, "synthesis: stream #61", accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/pull/140
16. The For Good Project, `research/findings/child-welfare/family-entitlements-nz.md`, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/child-welfare/family-entitlements-nz.md
17. The For Good Project, `research/findings/child-welfare/take-up-gap-child-family-entitlements.md`, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/research/findings/child-welfare/take-up-gap-child-family-entitlements.md
18. Janine Hayward, "Principles of the Treaty of Waitangi - ngā mātāpono o te Tiriti o Waitangi", Te Ara - the Encyclopedia of New Zealand, reviewed and revised 16 January 2023, accessed 3 July 2026. https://teara.govt.nz/en/principles-of-the-treaty-of-waitangi-nga-matapono-o-te-tiriti-o-waitangi
19. Auckland Council, "Te Tiriti o Waitangi, co-governance and Auckland Council", accessed 3 July 2026. https://governance.aucklandcouncil.govt.nz/6-maori-partnerships/te-tiriti-o-waitangi-co-governance-and-auckland-council
20. Te Mana Raraunga, "Home", accessed 3 July 2026. https://www.temanararaunga.maori.nz/
21. data.govt.nz, "Ngā Tikanga Paihere", accessed 3 July 2026. https://data.govt.nz/toolkit/data-ethics/nga-tikanga-paihere
22. The For Good Project, issue #136, "research: Place the default Treaty-consideration checklist in the project method", accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/136
23. The For Good Project, issue #137, "research: Test the steward-attention tradeoff for a default Treaty-consideration check", accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/137
24. The For Good Project, open Discover issues query, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22stage%3A%20discover%22
25. The For Good Project, `streams/` directory, accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/tree/main/streams
