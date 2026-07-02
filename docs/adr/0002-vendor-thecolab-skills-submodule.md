# ADR-0002: Vendor `thecolab-ai/.skills` as a git submodule

- **Status:** accepted
- **Date:** 2026-07-02 (records a decision made earlier; written down as part of adopting ADRs)
- **Deciders:** Adam (maintainer)
- **Discussion:** see `AGENTS.md` § "The Colab skills" and [thecolab-ai/.skills](https://github.com/thecolab-ai/.skills)

## Context

Research here depends on **official NZ data** (Stats NZ, data.govt.nz,
councils, Companies Office, DOC, GeoNet, LAWA, …). Generic web search gives
agents secondary sources and bot-blocked pages; the method demands primary,
citable data. The community maintains
[`thecolab-ai/.skills`](https://github.com/thecolab-ai/.skills) — keyless,
stdlib-Python CLIs that hit those official sources directly and return clean
JSON — and the skills are shared across multiple Colab projects, so they must
not fork per-repo.

## Decision

We will vendor `thecolab-ai/.skills` as a **git submodule at `.skills/`**,
and instruct agents (in `AGENTS.md`) to prefer these CLIs over web search for
NZ data, and to grow the toolset upstream (issue or PR on the skills repo)
when a needed source isn't covered.

Considered and rejected:
- **Copying the scripts into this repo** — drifts from upstream immediately;
  every other Colab project would fork its own copy.
- **A package/registry dependency** — the skills are plain-Python folders with
  SKILL.md docs, not a published package; packaging adds ceremony with no gain.
- **Fetching at runtime** — agents run offline-ish in worktrees on
  contributors' machines; a pinned submodule is reproducible and auditable.

## Consequences

- One extra step after clone (`git submodule update --init`), documented in
  `AGENTS.md`.
- The pinned commit makes research reproducible, but it means skill updates
  arrive only when someone bumps the submodule — a periodic bump is a good
  routine task.
- Improvements made for this project's research land upstream and benefit
  every other Colab project (and vice versa).
- Tripwire: if the submodule pin regularly blocks research (stale skills,
  breaking upstream changes), revisit pinning strategy (e.g. track a release
  branch).
