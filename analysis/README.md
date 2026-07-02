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

This convention is recorded in [`ADR-0004`](../docs/adr/0004-analysis-documents-and-rendered-companions.md). Today `npm run validate` still checks `research/findings/` and `solutions/` only, so analysis standards are enforced by review; ADR-0004 names the tripwire for extending the validator.

## Index

| Document | Status | What it is |
|---|---|---|
| [`gap-analysis-and-operating-plan.md`](gap-analysis-and-operating-plan.md) | **Proposal** (July 2026) | Mission review → the eight gaps → founding-partner loop → replication kernel → what to action next. Recommendations for the working group; none is enacted by merging the file. |
| [`treaty-consideration-as-default-lens.md`](treaty-consideration-as-default-lens.md) | **Proposal** (July 2026) | Argues the gap analysis's own framing of Te Tiriti consideration (a trigger condition for Māori-coded streams) should be a default lens applied to every stream instead. Three reusable lenses + what to action next. |
