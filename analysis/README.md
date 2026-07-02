# Analysis

Longer-form analysis of the project itself — gap analyses, operating plans, strategy reviews. Where `research/` holds cited findings about NZ's problems, `analysis/` holds cited thinking about *how the project works and where it falls short*.

> **These documents are advisory, not adopted policy.** Merging a file here records the analysis; it does not enact its recommendations. The substantive calls — e.g. adding a Deliver stage, parking all but one stream, a Te Tiriti constitutional amendment — are decisions for the working group, made through their own PRs, gate decisions, or governance changes. Read the "what to action next" section of any plan as *proposed*, not *done*.

## File convention — audience is signalled by extension

Each analysis document is stored **once per format, under a single kebab-case slug**. The audience is implied by the file extension — there is no separate `-human` / `-llm` tag:

| Extension | Audience | Role |
|---|---|---|
| `.md` | LLMs & contributors | **Canonical source of truth.** Edit this. Diffs, review, and citations happen here. |
| `.pdf` | Humans | **Rendered companion.** A read-only export of the `.md` for people who want a formatted document. Never edited directly. |

So `gap-analysis-and-operating-plan.md` and `gap-analysis-and-operating-plan.pdf` are the *same document* — the Markdown is the original, the PDF is generated from it.

**Rule:** if the two ever disagree, the `.md` wins. Regenerate the PDF; never hand-edit it. This keeps the project's "one source of truth" principle (see [`MANIFESTO.md`](../MANIFESTO.md)) intact — the Markdown is the database, the PDF is a view of it.

## Index

| Document | What it is |
|---|---|
| [`gap-analysis-and-operating-plan.md`](gap-analysis-and-operating-plan.md) | Mission review → the eight gaps → founding-partner loop → replication kernel → what to action next (July 2026). |
