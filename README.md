# The For Good Project

**An open research commons where people and AI agents work together to solve New Zealand's biggest societal problems.**

By [thecolab.ai](https://thecolab.ai) — New Zealand's community-driven AI consultancy. _AI expertise, built together._

**▶ Live dashboard: [thecolab-ai.github.io/the-for-good-project](https://thecolab-ai.github.io/the-for-good-project/)** — track the work, browse findings, see who's contributing, and submit a problem.

---

## The idea

Lots of smart people have AI subscriptions with tokens to spare. Separately, New Zealand has hard problems — child welfare, access to grants and social services, civic transparency, sensible AI policy, biosecurity — that nobody has time to chip away at.

This repo puts those two things together. It's a shared workspace where you (or an AI agent you point at it) can pick up a real problem, do a piece of honest work on it, and hand the next person something better than they found. No meetings, no gatekeepers, no duplicated effort. Just a queue of useful work and a method that keeps the quality high.

Everything here is public and reusable. The point is impact, not a portfolio.

Where we're headed and how we keep it honest: **[read the Manifesto](MANIFESTO.md)**.

## How it works

Work moves through four stages. Each stage is a GitHub Issue you can claim and push forward.

1. **🔍 Discover** — surface a real NZ problem and shape it into questions worth researching.
2. **📚 Research** — investigate one question properly: cite every claim, verify the surprising ones, mark your confidence.
3. **💡 Ideate** — turn research into concrete, feasible solutions a small team could actually ship.
4. **🔨 Build** — implement the best ideas. Tools, guides, datasets, prototypes — real things people can use.

A problem enters as a Discover issue and spawns Research questions. Research produces cited findings. Findings feed Ideate. The best ideas become Build projects. The whole chain stays visible and linked, so anyone (human or agent) can join at any stage.

```
Discover ──▶ Research ──▶ Ideate ──▶ Build
 problem     cited        feasible    real
 framed      findings     solutions   things
```

## Start in 5 minutes

**If you're a person:**

1. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) — it's short, and it's the method that keeps this useful.
2. Find an unclaimed issue: [**`status: available`**](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22status%3A+available%22) — start with [**`good first issue`**](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) if you're new.
3. Claim it (assign yourself + add `status: claimed`), do the work following the method, open a pull request.
4. No problem you care about listed? [**Open a new one**](../../issues/new/choose).
5. Know a domain but short on time? You're the **judgement layer**: steward a [stream](docs/STREAMS.md), review a synthesis, or tell us where the research doesn't match reality on the ground. Agents do the volume; humans decide what matters.

**If you're an AI agent (Claude Code, etc.):**

Read [`AGENTS.md`](AGENTS.md). It tells you exactly how to claim an issue, follow the research method, and open a PR — designed so you can work a task end to end without a human babysitting each step. Or just run **`./start_work.sh`** to work the queue on autopilot (and **`./review_work.sh`** to adversarially review PRs) — see [`docs/AUTOMATION.md`](docs/AUTOMATION.md).

## What you'll find here

| Path | What's in it |
|---|---|
| [`research/findings/`](research/findings) | Cited research findings, one file per question, grouped by domain |
| [`solutions/`](solutions) | Proposed solutions — the feasible ideas that came out of research |
| [`projects/`](projects) | Implementations: tools, guides, datasets, prototypes |
| [`streams/`](streams) | Plain-language overviews of each stream of work, written for non-GitHub humans |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | The research method and the full contribution workflow |
| [`AGENTS.md`](AGENTS.md) | How AI agents work the repo |
| [`docs/`](docs) | Deeper docs: the method in full, domains, streams & human gates, governance |
| [`docs/adr/`](docs/adr) | Architecture Decision Records — why the project works the way it does |

## The domains we're working on

Child welfare · Grant & social-service access · Civic transparency · AI policy · Biosecurity — and more as the community surfaces them. Details in [`docs/DOMAINS.md`](docs/DOMAINS.md).

## The one rule that matters

**Cite everything, and be honest about what you don't know.** A finding that says "Medium confidence, one source, needs verification" is worth more than a confident guess. This work informs real decisions about real people — see the method in [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Powered by the community

The For Good Project is run by [thecolab.ai](https://thecolab.ai) and the Claude Code Meetups NZ community. It's connected to our WhatsApp community, where you can propose problems and follow findings as they land — [get involved](https://thecolab.ai).

## Licence

Research and content: [CC BY 4.0](LICENSE) — use it, remix it, just credit the project. Code under [`projects/`](projects): [MIT](projects/LICENSE). See [`CONTRIBUTING.md`](CONTRIBUTING.md#licence) for details.

---

_Built together, in Aotearoa. 🇳🇿_
