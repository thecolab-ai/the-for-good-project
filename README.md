# The For Good Project

![Aotearoa evidence map showing people and AI agents collaborating on public-good research](docs/assets/readme/for-good-hero.jpg)

**An open research commons where people and AI agents work together on New Zealand's biggest societal problems.**

By [thecolab.ai](https://thecolab.ai), New Zealand's community-driven AI consultancy: _AI expertise, built together._

**Live dashboard:** [thecolab-ai.github.io/the-for-good-project](https://thecolab-ai.github.io/the-for-good-project/) - track issues, browse findings, follow review, and see what is moving.

---

## What This Is

The For Good Project turns spare AI capacity and human judgement into a public queue of useful work.

New Zealand has hard civic problems: child welfare, access to grants and social services, civic transparency, sensible AI policy, biosecurity, and more. Plenty of people have the tools to help, but useful work gets lost when every contributor starts from scratch.

This repo gives the work a shared shape:

- Problems are framed as GitHub issues.
- Research is written as cited findings.
- Findings become feasible solution ideas.
- The best ideas become small working projects.
- Human stewards and adversarial reviewers keep the chain honest.

Everything is public and reusable. The aim is impact, not portfolio theatre.

Read the [Manifesto](MANIFESTO.md) for the spirit and the [Constitution](CONSTITUTION.md) for the binding rules.

## How Work Moves

![Four-stage workflow from problem discovery through research, ideation, and build](docs/assets/readme/for-good-workflow.jpg)

Every piece of work moves through four stages. Each stage is an issue someone can claim and move forward.

| Stage | Output | What Good Looks Like |
|---|---|---|
| Discover | A crisp problem statement and researchable questions | The problem affects real people in NZ, has enough evidence to investigate, and is narrow enough to hand off |
| Research | One cited finding in `research/findings/` | Every factual claim is sourced, surprising claims are checked, confidence is marked, and limits are explicit |
| Ideate | One feasible solution in `solutions/` | The idea names a small first version, who it helps, risks, and the next concrete action |
| Build | A usable artifact in `projects/` | A tool, guide, dataset, or prototype someone can actually run or apply |

A Discover issue starts a stream. Research issues answer pieces of it. Human gates sit between research and ideation, and again before build, so agents can produce volume without deciding direction alone.

## Why The Quality Bar Is High

![Evidence cards moving through citations, confidence checks, human gates, and adversarial review](docs/assets/readme/for-good-trust-loop.jpg)

This repo is designed for adversarial review. A reviewer should be able to try to refute a finding and still see where every claim came from.

The core rule is simple: **cite everything, and be honest about what you do not know.**

That means:

- Prefer official NZ sources, established NGOs, councils, Stats NZ, and peer-reviewed work.
- Mark confidence as High, Medium, or Low.
- Use two sources for load-bearing or surprising claims where possible.
- Say what would change your mind.
- Do not publish personal data.
- Do not let generated output outrun evidence or lived reality.

A low-confidence finding with clear limits is useful. An uncited confident answer is not.

## Start In 5 Minutes

### If You Are A Person

1. Read [CONTRIBUTING.md](CONTRIBUTING.md). It is the method that keeps this useful.
2. Find an open [`status: available`](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22status%3A+available%22) issue. Start with [`good first issue`](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) if you are new.
3. Claim it, do one piece of work, and open a pull request.
4. If no listed problem matches what you know, [open a new problem](../../issues/new/choose).
5. If you know the domain but are short on time, be the judgement layer: steward a [stream](docs/STREAMS.md), review a synthesis, or tell us where the research does not match reality on the ground.

### If You Are An AI Agent

Read [AGENTS.md](AGENTS.md). It explains how to claim an issue, follow the research method, cite sources, and open a PR.

For unattended queue work:

```bash
./start_work.sh
```

For adversarial PR review:

```bash
./review_work.sh
```

See [docs/AUTOMATION.md](docs/AUTOMATION.md) for the wrapper scripts.

## Where Things Live

| Path | Purpose |
|---|---|
| [research/findings/](research/findings) | Cited research findings, one file per question, grouped by domain |
| [solutions/](solutions) | Proposed solutions that came out of research |
| [projects/](projects) | Implementations: tools, guides, datasets, and prototypes |
| [streams/](streams) | Plain-language stream overviews maintained by human stewards |
| [analysis/](analysis) | Longer project analysis, operating plans, and strategy reviews |
| [web/](web) | The public dashboard application |
| [docs/](docs) | Method, governance, domains, streams, automation, and ADRs |
| [AGENTS.md](AGENTS.md) | Repo operating instructions for coding and research agents |
| [CONTRIBUTING.md](CONTRIBUTING.md) | The human contribution workflow and research method |

## Current Domains

Child welfare, grant and social-service access, civic transparency, AI policy, biosecurity, and other public-good questions surfaced by the community.

See [docs/DOMAINS.md](docs/DOMAINS.md) for the current domain list.

## Community

The For Good Project is run by [thecolab.ai](https://thecolab.ai) and the Claude Code Meetups NZ community. It is connected to the wider The Colab community, where people propose problems, review findings, and help decide what should happen next.

## Licence

Research, findings, and docs are licensed under [CC BY 4.0](LICENSE). Code under [projects/](projects) is licensed under [MIT](projects/LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md#licence) for details.

---

_Built together, in Aotearoa._
