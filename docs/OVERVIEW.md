# How it all fits — on one page

The For Good Project points spare AI capacity at real New Zealand problems,
with humans steering. This page is the map; every detail links out.

## The idea in one paragraph

Someone surfaces a real NZ problem (a **Discover** issue). Agents fan it out
into cited **research**, an agent **synthesises** what was learned into a
plain-language overview, and a **human steward** decides the direction —
go deeper, pivot, proceed to solutions, or park. Nothing is ideated or built
without that human decision, and everything merged has survived an
**adversarial review** by a different identity than its author.

## The pipeline

```
Discover ──G0──▶ Research (agents, cited) ──drain──▶ Synthesis (agent drafts)
                     ▲                                      │
                     └── blocking unknowns loop back ◀──────┤ (automatic, bounded — ADR-0012)
                         (≤3 issues × ≤2 rounds)            ▼
                                            G1: human steward sets direction
                                                            │
                                             Ideate ──G2──▶ Build ──▶ Shipped
```

- **G0** — a maintainer applies `status: available` to a new Discover issue.
  Until then it's invisible to every runner.
- **G1** — the steward reads the drafted overview, grades the evidence,
  edits/rejects the candidate outcomes, writes the direction. ([docs/STREAMS.md](STREAMS.md))
- **G2** — a human approves one specific solution before anything is built.

## Who does what

| Actor | Does | Never does |
|---|---|---|
| **Agents** (via the five scripts) | research, drafts, reviews, synthesis rollups, bounded follow-up questions | direction decisions, ideate/build issues, `streams/` overview edits, label changes |
| **Scripts** (`start_work` / `review_work` / `synthesize_work` / `merge_ready` / `reap`) | every status transition, claims, queues, merges | judgement |
| **Maintainers / stewards** | G0 triage, G1 direction, G2 build approval, governance PRs (`review: human-only`) | — |

## The labels, in one line each

One `status:` label per issue, always (see the canonical table in
[docs/AUTOMATION.md](AUTOMATION.md)): `available` (up for grabs — the only
status runners take) → `claimed` → `in-review` → `changes-requested` (rework)
→ `done`. Stream roots additionally cycle `needs-synthesis` (drained,
awaiting a rollup) and `awaiting-direction` (parked for the human steward).
`review: claimed` / `review: human-only` mark PRs, not issues.
`do-not-automate` parks anything away from every queue. `priority: high`
jumps queues.

## Where the truth lives

| Question | Doc |
|---|---|
| How do I contribute / what's the method? | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| How does git / version control work here? | [docs/GIT-WORKFLOW.md](GIT-WORKFLOW.md) |
| What do the scripts and labels do, exactly? | [docs/AUTOMATION.md](AUTOMATION.md) |
| How do streams and the human gates work? | [docs/STREAMS.md](STREAMS.md) |
| Why is it like this? | [docs/adr/](adr/README.md) |
| What are agents allowed to do? | [AGENTS.md](../AGENTS.md) |
| What do we stand for? | [CONSTITUTION.md](../CONSTITUTION.md) |
