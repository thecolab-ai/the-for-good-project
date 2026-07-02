# ADR-0004: Project analysis lives in `analysis/`

- **Status:** accepted
- **Date:** 2026-07-02
- **Deciders:** Maintainers, via PR #96 review
- **Discussion:** [#96](https://github.com/thecolab-ai/the-for-good-project/pull/96)

## Context

The repo already has clear homes for cited findings about NZ problems
(`research/`), solution proposals (`solutions/`), implementations
(`projects/`), stream overviews (`streams/`), and binding operating decisions
(`docs/adr/`). PR #96 needed a place for a different artifact: project-level
analysis of how the For Good operating model is working, where it has gaps, and
which decisions the working group might take next.

Putting that material under `research/` would blur "evidence about the world"
with "analysis of this project". Putting it only in a PR body or chat thread
would make it hard for later agents to find, cite, or refute. The same PR also
introduced a rendered PDF companion for non-technical readers, which creates a
drift risk unless the Markdown source remains canonical.

## Decision

We will add `analysis/` as the home for longer-form project-level analysis and
operating plans. Analysis documents are advisory: merging one records the
argument, but does not enact its recommendations. Substantive changes to the
pipeline, gates, governance, automation, or public commitments still need their
own PRs, gate decisions, or ADRs.

Analysis files must follow the project's cited-and-honest method: provenance in
frontmatter, inline sources for factual claims, explicit confidence and limits,
and clear separation between evidence, interpretation, and recommendation.

When an analysis is also exported for human readers, the rendered companion uses
the same kebab-case slug as the Markdown source, with the audience signalled by
extension: `analysis/example.md` and `analysis/example.pdf`. The Markdown is the
canonical source; rendered companions are read-only views and must be
regenerated or dropped when they drift.

Considered and rejected:

- **Use `research/` for project analysis** - would mix external findings with
  internal strategy and invite inappropriate domain/frontmatter requirements.
- **Keep analysis only in PR bodies or issues** - easier at first, but less
  discoverable and less durable for future contributors and agents.
- **Name files with `-human` / `-llm` suffixes** - creates duplicate document
  identities; extensions already carry the format and audience distinction.

## Consequences

- Contributors and agents get a clear place for refutable project-level
  analysis without pretending it is adopted policy.
- Human-readable exports can exist without violating the one-source-of-truth
  rule: Markdown is the database, the PDF is a view.
- Reviewers must check analysis documents under the same citation and
  provenance standard as other decision-shaping content.
- Current CI validation still checks `research/findings/` and `solutions/`
  only. This is acceptable while `analysis/` is small and review-gated, but it
  is a known cost.
- Tripwire: if a second analysis document is added, or if an analysis PR reaches
  review with missing provenance, confidence, or citations, extend
  `npm run validate` to cover `analysis/`.
