# Analysis

Longer-form analysis of the project itself — gap analyses, operating plans, strategy reviews. Where `research/` holds cited findings about NZ's problems, `analysis/` holds cited thinking about *how the project works and where it falls short*.

The same binding rules apply here as everywhere ([`CONSTITUTION.md`](../CONSTITUTION.md) Article III): **every factual claim carries a working source, and every agent-produced document records its provenance** (agent + model, Article V). Analysis is argument *plus* evidence — a recommendation is fine unsourced, but a claim about the world or the repo is not. Each doc opens with YAML frontmatter (`title, type: analysis, status, author, agent, model, date`) and a "Confidence & limits" section stating what is fact, what is interpretation, and what would change the conclusions.

> **These documents are advisory, not adopted policy.** Merging a file here records the analysis; it does not enact its recommendations. The substantive calls — e.g. adding a Deliver stage, parking all but one stream, a Te Tiriti constitutional amendment — are decisions for the working group, made through their own PRs, gate decisions, or governance changes. Read the "what to action next" section of any plan as *proposed*, not *done*.

## File convention — audience is signalled by extension

Each analysis document is stored **once per format, under a single kebab-case slug**. The audience is implied by the file extension — there is no separate `-human` / `-llm` tag:

| Extension | Audience | Role |
|---|---|---|
| `.md` | LLMs & contributors | **Canonical source of truth.** Edit this. Diffs, review, and citations happen here. |
| `.pdf` | Humans | **Rendered companion.** A read-only export of the `.md` for people who want a formatted document. Never edited directly. |

So a doc's `.md` and `.pdf` are the *same document* — the Markdown is the original, the PDF is generated from it.

**Rule:** if the two ever disagree, the `.md` wins. Regenerate the PDF; never hand-edit it. This keeps the project's "one source of truth" principle (see [`MANIFESTO.md`](../MANIFESTO.md)) intact — the Markdown is the database, the PDF is a view of it. When the `.md` changes substantially, re-export the PDF in the same PR (or drop it until it's re-rendered) rather than ship a companion that contradicts the source.

This convention is recorded in [`ADR-0004`](../docs/adr/0004-analysis-documents-and-rendered-companions.md). ADR-0004 named "a second analysis document is added" as the tripwire for extending `npm run validate` to cover `analysis/`; that tripwire has now been hit, and `npm run validate` checks `analysis/` frontmatter, citations, and a `Confidence & limits` section alongside `research/findings/` and `solutions/`.

## Index

| Document | Status | What it is |
|---|---|---|
| [`gap-analysis-and-operating-plan.md`](gap-analysis-and-operating-plan.md) | **Proposal** (July 2026) | Mission review → the eight gaps → founding-partner loop → replication kernel → what to action next. Recommendations for the working group; none is enacted by merging the file. |
| [`small-charity-grant-discovery-framing.md`](small-charity-grant-discovery-framing.md) | **Proposal** (July 2026) | Discovery framing for grant-access stream #2: affected population, existing grant-discovery surfaces, and follow-up research questions. |
| [`nz-angel-seed-funding-g0-remediation.md`](nz-angel-seed-funding-g0-remediation.md) | **Proposal** (July 2026) | Advisory analysis for stream #110's unresolved G0 gate violation and parked angel/seed funding research questions. |
| [`treaty-default-checklist-framing.md`](treaty-default-checklist-framing.md) | **Proposal** (July 2026) | Discovery framing for stream #104: whether Treaty consideration should become a default checklist item, what research to open now, and what must wait for G1. |
| [`treaty-consideration-as-default-lens.md`](treaty-consideration-as-default-lens.md) | **Proposal** (July 2026) | Argues the gap analysis's own framing of Te Tiriti consideration (a trigger condition for Māori-coded streams) should be a default lens applied to every stream instead. Three reusable lenses + what to action next. |
| [`flood-risk-housing-insurance-framing.md`](flood-risk-housing-insurance-framing.md) | **Proposal** (July 2026) | Discovery framing for stream #254: the flood-risk home value paradox, exposure baseline, insurance/lending cliff-edge, and managed-retreat policy — split into five child research issues. |
| [`govt-digital-spend-effectiveness-framing.md`](govt-digital-spend-effectiveness-framing.md) | **Proposal** (July 2026) | Discovery framing for stream #255: the PSC Digital Reset Plan baseline, headline savings claims, failure examples, transparency leads, and four child research issues. |
| [`electricity-affordability-dry-year-risk-framing.md`](electricity-affordability-dry-year-risk-framing.md) | **Proposal** (July 2026) | Discovery framing for stream #256: household bill components, dry-year mechanics, market structure, hardship exposure, and generation/flexibility pipeline — split into five child research issues. |
| [`nz-residential-power-energy-hardship-framing.md`](nz-residential-power-energy-hardship-framing.md) | **Proposal** (July 2026) | Discovery framing for stream #244: NZ energy-hardship baseline, existing schemes, cold-housing health cost, and a data-centre/residential-power evidence check against Ireland, PJM/Virginia, and Amsterdam comparators — split into five child research issues. |
| [`council-consenting-climate-adaptation-framing.md`](council-consenting-climate-adaptation-framing.md) | **Proposal** (July 2026) | Discovery framing for stream #370: whether NZ council planning/consent processes obstruct climate adaptation — tests four founder hypotheses against the statutory and administrative record and splits into six child research issues. |
| [`nz-council-earthquake-retrofit-debt-how-much-is-on-framing.md`](nz-council-earthquake-retrofit-debt-how-much-is-on-framing.md) | **Proposal** (July 2026) | Discovery framing for stream #432: NZ council seismic-retrofit obligations, balance-sheet visibility, climate-adaptation tradeoffs, and post-event risk — split into six child research issues. |
| [`nz-rural-internet-and-digital-exclusion-who-s-stil-framing.md`](nz-rural-internet-and-digital-exclusion-who-s-stil-framing.md) | **Proposal** (July 2026) | Discovery framing for stream #433: rural digital exclusion as a quality, affordability, resilience, and measurement problem — split into five child research issues. |
| [`nz-addiction-and-substance-harm-alcohol-methamphet-framing.md`](nz-addiction-and-substance-harm-alcohol-methamphet-framing.md) | **Proposal** (July 2026) | Discovery framing for stream #441: NZ alcohol, methamphetamine, and gambling harm burden, current interventions, and policy landscape — split into five child research issues. |
