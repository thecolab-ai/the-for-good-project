# CLAUDE.md — The For Good Project

Guidance for Claude Code working in this repo. The full agent contract lives in
[`AGENTS.md`](AGENTS.md) — read it first; this file only adds repo-level pointers.

## What this repo is

A community pipeline turning real NZ problems into cited research, feasible
solutions, and small builds. Work flows Discover → Research → Ideate → Build as
GitHub issues; everything descending from one Discover issue is a **stream**
([`docs/STREAMS.md`](docs/STREAMS.md)).

## Non-negotiables

- **The method** ([`CONTRIBUTING.md`](CONTRIBUTING.md)): cite every claim,
  two sources for surprising ones, honest confidence marks, never fabricate.
- **Human gates**: never open or work ideate/build issues that a human hasn't
  made `status: available`; never touch `streams/` overview docs (human
  steward's voice). See ADR-0001.
- **ADRs** ([`docs/adr/`](docs/adr/README.md)): decisions about how the
  project works are recorded there and are binding. Structural changes need a
  new or superseding ADR in the same PR. Check them before proposing changes
  to workflow, labels, automation, or dependencies.
- **Adversarial review**: every PR is reviewed by a different identity than
  its author before merge ([`docs/AUTOMATION.md`](docs/AUTOMATION.md)).

## Working here

- Autopilot: `./start_work.sh` (work the queue), `./review_work.sh` (review
  PRs), `./merge_ready.sh` (maintainers). All run agents in throwaway git
  worktrees pulled fresh from `main`.
- Validate content before pushing: `npm run validate`.
- NZ data: prefer the vendored [`.skills/`](.skills) CLIs over web search
  (`git submodule update --init` first). See ADR-0002.
- Website lives in `web/` (React + Vite, pnpm not required — npm):
  `cd web && npm run build` must pass before a web PR.
