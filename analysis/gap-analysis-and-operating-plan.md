---
title: "The For Good Project — Gap Analysis & Operating Plan"
type: "analysis"
status: "proposal" # advisory — records analysis; does not enact it
author: "matt"
agent: "claude"
model: "claude-opus-4-8"
date: "2026-07-02"
---

# The For Good Project — Gap Analysis & Operating Plan

_From mission review to a proven, copyable loop_

> **Status — proposal, not adopted policy.** This is an advisory analysis for the working group. Its recommendations (a new mission statement, a Deliver stage, parking streams, a Te Tiriti amendment, and the operating choices in §5–§7) are decisions for the group, taken through their own PRs and the gates in [`docs/STREAMS.md`](../docs/STREAMS.md) — **merging this file records the analysis, it does not enact it.** Factual claims about the repo are cited inline; repo-state figures are a snapshot as of 2 July 2026 (see [Confidence & limits](#9-confidence--limits)).

> **"People and AI, donated to the public good. We research Aotearoa's hardest problems in the open, and carry the answers through to real impact — in a way any country can copy."**
>
> _Proposed mission statement — for ratification · 2 July 2026. **Not yet adopted:** [`README.md`](../README.md) and [`MANIFESTO.md`](../MANIFESTO.md) still carry the original wording; changing it would be an amendment per [`CONSTITUTION.md`](../CONSTITUTION.md) Article VIII. §3 sets out the comparison behind this recommendation._

Prepared for the working group · thecolab.ai · July 2026 · generated with Claude (`claude-opus-4-8`)

**Contents**

- [The For Good Project — Gap Analysis \& Operating Plan](#the-for-good-project--gap-analysis--operating-plan)
  - [1. The verdict — what the mission gets right](#1-the-verdict--what-the-mission-gets-right)
  - [2. The eight gaps](#2-the-eight-gaps)
  - [3. Mission statement — four variations compared](#3-mission-statement--four-variations-compared)
  - [4. Supply-push vs demand-pull — two operating models](#4-supply-push-vs-demand-pull--two-operating-models)
  - [5. The demand-side plan — founding partner loop](#5-the-demand-side-plan--founding-partner-loop)
  - [6. Built to be copied — kernel and instances](#6-built-to-be-copied--kernel-and-instances)
  - [7. How we collaborate — one workspace, two audiences](#7-how-we-collaborate--one-workspace-two-audiences)
  - [8. What we should action next](#8-what-we-should-action-next)
  - [9. Confidence \& limits](#9-confidence--limits)

---

## 1. The verdict — what the mission gets right

_This section is the analyst's assessment; factual claims about the repo carry inline sources, and the interpretive judgements are marked as such._

The mission is coherent and well-articulated. The core mechanism it describes is real and documented: spare AI capacity meets unworked NZ problems ([`MANIFESTO.md`](../MANIFESTO.md) — _"A lot of people have AI capacity and skill going spare. And a lot of real problems…"_), **agents grind, humans steer** ([`MANIFESTO.md`](../MANIFESTO.md), principle 1), and "done" is defined as adoption, not merge ([`MANIFESTO.md`](../MANIFESTO.md) — _"We define 'done' as adoption, not merge"_). The layering of a binding [`CONSTITUTION.md`](../CONSTITUTION.md), a spirit-level [`MANIFESTO.md`](../MANIFESTO.md), and working docs under [`docs/`](../docs) is real and explicit ([`CONSTITUTION.md`](../CONSTITUTION.md) Article IX sets their precedence). "Outcomes over outputs" is written down, not just implied ([`CONSTITUTION.md`](../CONSTITUTION.md) Article I — _"real-world good… not by work produced"_; [`MANIFESTO.md`](../MANIFESTO.md) — _"refuse the metrics that flatter us"_). _That this is unusually crisp "for a project this young" is a subjective judgement, offered as opinion._

The gap pattern is equally consistent, and it's one picture:

```
 well-designed today                              aspirational
┌─────────────────────────────────────────┐   ┌─────────────────────┐
│ Discover ──▶ Research ──▶ Ideate ──▶ Build ┈┈▶ Deliver ┈┈▶ Impact │
└─────────────────────────────────────────┘   └─────────────────────┘
  method, gates, automation,                    no stage, owner
  adversarial review                            or instrument
```

The four upstream stages (Discover → Research → Ideate → Build) are the ones the repo actually implements ([`CONTRIBUTING.md`](../CONTRIBUTING.md), the pipeline table; [`docs/METHOD.md`](../docs/METHOD.md)), with human gates and adversarial review as binding rules ([`docs/STREAMS.md`](../docs/STREAMS.md); [`CONSTITUTION.md`](../CONSTITUTION.md) Article III.4–5). **There is no "Deliver" stage and no `IMPACT.md`:** a repo-wide search on 2 July 2026 finds neither (see [Confidence & limits](#9-confidence--limits)). So the assessment: everything upstream of a merged PR is well-designed; everything between merge and a changed life — which the Manifesto names as the point ([`MANIFESTO.md`](../MANIFESTO.md), _"done = adoption"_) — has no stage, owner or instrument yet. The Manifesto names the right principles — demand-pull ([`MANIFESTO.md`](../MANIFESTO.md), principle 3), adoption-as-done, start narrow ([`MANIFESTO.md`](../MANIFESTO.md) — _"We start narrow and prove the whole loop"_) — but the repo's machinery does not yet implement them downstream of Build.

> ⚠️ The repo shows the strain: **29 open issues and 28 open PRs** (one of which is this analysis) against a handful of maintainers, as of 2 July 2026 [repo snapshot via `gh issue list` / `gh pr list` — see [Confidence & limits](#9-confidence--limits)]. _That agent output is "already outrunning human judgement capacity" is an interpretation of those counts, not a measured fact_ — but it is the failure mode the project itself names: _"volume never gets mistaken for good"_ ([`CONSTITUTION.md`](../CONSTITUTION.md) Preamble).

---

## 2. The eight gaps

Each "what's missing" below is a factual claim about the repo, with its source in brackets. Absence claims were checked by repo-wide search on 2 July 2026 (see [Confidence & limits](#9-confidence--limits)). The recommendations are proposals, not decisions.

| #   | Gap                                           | What's missing (with source)                                                                                                                                                                                                                                                                                                                                                                                             | Recommendation (proposed)                                                                                                                                                                                                |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **No demand side**                            | "Demand-pull" is a stated principle ([`MANIFESTO.md`](../MANIFESTO.md), principle 3), but no intake mechanism exists for an outside organisation to ask a question: the contributor entry points and "where things go" are all internal ([`CONTRIBUTING.md`](../CONTRIBUTING.md)); no intake form, broker role or partner path is documented.                                                                            | The founding-partner plan (§5). This is the root gap — most others flow from it.                                                                                                                                         |
| 2   | **Pipeline ends before the mission does**     | The documented pipeline's last stage is Build ([`CONTRIBUTING.md`](../CONTRIBUTING.md); [`docs/METHOD.md`](../docs/METHOD.md)); "done = adoption" ([`MANIFESTO.md`](../MANIFESTO.md)) has no stage, owner or instrument. The three declared metrics — time-to-first-useful-result, usefulness, adoption ([`MANIFESTO.md`](../MANIFESTO.md)) — have no tracking artifact (no `IMPACT.md` exists, repo search 2 Jul 2026). | Add a Deliver stage + a public `IMPACT.md` log of adoption events.                                                                                                                                                       |
| 3   | **Breadth contradicts "start narrow"**        | Five domains are declared ([`docs/DOMAINS.md`](../docs/DOMAINS.md): child-welfare, grant-access, civic-transparency, ai-policy, biosecurity) against 29 open issues / 28 open PRs (snapshot 2 Jul 2026); no stream is recorded as proven end-to-end (no `IMPACT.md`). This sits against the stated commitment to "depth before breadth" ([`MANIFESTO.md`](../MANIFESTO.md)).                                             | Publicly park all but one stream; drive it through to Deliver, then reopen.                                                                                                                                              |
| 4   | **Steward supply is the bottleneck**          | The design rests on scarce human judgement at the gates ([`docs/STREAMS.md`](../docs/STREAMS.md); [`CONSTITUTION.md`](../CONSTITUTION.md) Article IV), but no recruitment, onboarding or workload story is documented. The 28-PR backlog (snapshot 2 Jul 2026) is this pressure, visible.                                                                                                                                | Bound the ask (~1 hr/wk); recruit stewards via the partner; cap open agent work per stream.                                                                                                                              |
| 5   | **Te Tiriti & Māori data sovereignty absent** | The first-listed domain is child welfare ([`docs/DOMAINS.md`](../docs/DOMAINS.md)), yet a repo-wide search (2 Jul 2026) finds no mention of Te Tiriti, iwi partnership or Māori data sovereignty in any founding doc (`README`, `MANIFESTO`, `CONSTITUTION`, `docs/`). A legitimacy risk funders will notice.                                                                                                            | Constitutional amendment ([`CONSTITUTION.md`](../CONSTITUTION.md) Article VIII); treat "we need Māori partnership we don't have" as a valid always-human finding ([`CONSTITUTION.md`](../CONSTITUTION.md) Article IV.2). |
| 6   | **No maintenance story**                      | If an NFP relies on a tool built here, nothing documents who owns its upkeep (no maintenance/handover policy in `projects/` or `docs/`, repo search 2 Jul 2026). Abandonment does harm — against the duty to protect people and do no harm ([`CONSTITUTION.md`](../CONSTITUTION.md) Article III.3).                                                                                                                      | No G2 pass without a named maintenance plan: handover, sunset date, or maintainer.                                                                                                                                       |
| 7   | **No ecosystem positioning**                  | No founding doc states a relationship to existing civic-tech (a search on 2 Jul 2026 finds no mention of Figure.NZ, Hui E!, or community law). Risk of duplicating; those orgs are also a fast route to a partner. _(That they are the fastest route is a judgement, not a sourced fact.)_                                                                                                                               | A short `ECOSYSTEM.md`: who already works each domain, where we complement.                                                                                                                                              |
| 8   | **No definition of "proven" for replication** | The replication ambition ("in a way any country can copy") has no falsifiable "proven" criteria stated anywhere in the repo. As unfalsifiable as "done" was before the Manifesto pinned it to adoption.                                                                                                                                                                                                                  | Explicit replication-readiness criteria (§6).                                                                                                                                                                            |

Gaps 5 and 6 need their own sessions — the first-partner choice sidesteps them temporarily but doesn't resolve them. Both should land before any stream enters child welfare or ships a tool an organisation depends on; gap 5 in particular is load-bearing because it recommends blocking child-welfare work, and it touches a sensitive domain where a human with domain authority must sign off ([`CONSTITUTION.md`](../CONSTITUTION.md) Article IV.2). The replication ambition raises the bar on both: closed well once, they become kernel patterns other countries inherit (§6).

---

## 3. Mission statement — four variations compared

_A recommendation for ratification, not a record of a decision. The mission is currently the V1 wording in [`README.md`](../README.md); adopting any other is an amendment ([`CONSTITUTION.md`](../CONSTITUTION.md) Article VIII)._

The test applied to every candidate: does it carry the four load-bearing ideas — **donated** (the spare-capacity model), **open** (the commons), an arc to **real impact** (done = adoption, not merge), and **copyable** (the replication ambition)?

| Variation                                                                                                                                                                                                   | Donated | Open | Impact arc | Copyable | Sayable |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: | :--: | :--------: | :------: | :-----: |
| **V1 — Original README**<br>_"An open research commons where people and AI agents work together to solve NZ's biggest societal problems."_                                                                  |    ✗    |  ✓   |     ✗      |    ✗     |    ✓    |
| **V2 — Pipeline version**<br>_"We unite and donate our human expertise and AI capacity to identify society's greatest challenges… lasting impact for the greater good of NZ and beyond."_                   |    ✓    |  ✗   |     ✓      |    ~     |    ✗    |
| **V3 — Demand-pull version**<br>_"We donate our expertise and AI capacity to an open commons: taking real problems from NZ communities… sharing the model with the world."_                                 |    ✓    |  ✓   |     ✓      |    ✓     |    ~    |
| **V4 — Recommended ★**<br>_"People and AI, donated to the public good. We research Aotearoa's hardest problems in the open, and carry the answers through to real impact — in a way any country can copy."_ |    ✓    |  ✓   |     ✓      |    ✓     |    ✓    |

| Variation                        | Positives                                                                                                                                                                         | Negatives                                                                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **V1 — the original**            | "Open research commons" is precise and distinctive — it names the mechanism. Short enough to repeat. It is the wording currently live in [`README.md`](../README.md).             | Ends at "solve problems": activity, not outcome — the exact gap the Manifesto warns about. No donation idea, no replication.                                               |
| **V2 — the pipeline version**    | "Donate" is the standout word nobody else uses. The arc mirrors the full pipeline to impact; "and beyond" carries replication.                                                    | Forty words, five clauses. "Greatest challenges" is supply-push framing. Drops "open". "Greater good / lasting impact" are the clichés every foundation uses.              |
| **V3 — the demand-pull version** | Only variation to hard-code demand-pull and adoption into the words themselves — mission and operating model fully agree.                                                         | Quietly forecloses the supply-push exception: public-interest domains like AI policy have no community asker. Reads as a sentence, not a saying.                           |
| **V4 — recommended**             | Carries all four ideas. The opening ("People and AI, donated to the public good") works standalone as a tagline. "Carry the answers through" is the Deliver stage in plain words. | "Hardest problems" retains a supply-push flavour — acceptable if the asker-or-exploratory rule (§4) is adopted, since the mechanism then enforces what the poetry doesn't. |

---

## 4. Supply-push vs demand-pull — two operating models

The language question ("society's greatest challenges" vs "problems real organisations bring us") isn't cosmetic — each phrasing implies a different operating model, and each model builds different things. This section is analysis of the trade-off; the recommendation at the end is a proposal.

|                     | **A — Supply-push**<br>_"We identify society's greatest challenges"_<br>closest to what the repo builds today                                                                                                                                                                                        | **B — Demand-pull**<br>_"We answer questions real organisations bring us"_<br>what the Manifesto states as principle ([`MANIFESTO.md`](../MANIFESTO.md))                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **What gets built** | Broad landscape research, systemic analyses, tools for a _class_ of user designed before any specific org is at the table. The domain taxonomy ([`docs/DOMAINS.md`](../docs/DOMAINS.md)) and stream fan-out machinery ([`docs/STREAMS.md`](../docs/STREAMS.md)) are this model's infrastructure.     | Narrow, specific artifacts with a named recipient — "the answer to _this_ org's question", generalised later. Investment shifts from fan-out machinery to intake, relationship and feedback machinery.                                                                   |
| **Merits**          | Works from a cold start. Free to tackle important-but-unasked problems (AI policy, civic transparency genuinely have no "customer"). Produces wide-reach public goods. Contributors can start immediately.                                                                                           | Adoption structurally built in — the asker is waiting, so "done = adoption" ([`MANIFESTO.md`](../MANIFESTO.md)) has an obvious test. Relevance validated before tokens are spent. Impact stories write themselves. Naturally rate-limits agent output to human capacity. |
| **Negatives**       | Nobody is waiting — adoption must be _sold_ after the fact, the hardest way. "Greatest" is judged from the inside. Unfalsifiable until a user is found. Burns scarce human judgement on work with no committed beneficiary. The open-PR backlog (28, snapshot 2 Jul 2026) is this model's signature. | Cold-start dependent — no partner, no work; partner acquisition is slow human relationship-building. Scope bounded by whoever shows up; systemic problems with no natural asker get missed. Risks becoming free consultancy for one org.                                 |

> **Recommendation (proposed) — demand-anchored, with a bounded exploratory allowance.**
> Every stream must **name its asker, or explicitly declare itself exploratory** — and exploratory streams are capped (one active at a time, time-boxed, must convert to a named asker by G1 or park). Public-interest work stays possible; "nobody asked for this" becomes a visible, budgeted exception instead of the invisible default. This rule is designed to travel to any country unchanged — a kernel pattern (§6).

---

## 5. The demand-side plan — founding partner loop

_Proposed decisions, for the working group to ratify — not a record of decisions already taken. As of 2 July 2026 no broker is named and no partner charter exists in the repo (search 2 Jul 2026). The proposals below are: first partner = **one small NFP**; intake = a **named human broker** plus a **simple public form**, formalised by a lightweight **partner charter**; starting position = loose contacts requiring deliberate outreach._

```
BROKER ──▶ PARTNER ──▶ STREAM ──▶ ANSWER ──▶ IMPACT.MD
named        one small    their        delivered     what changed,
human,       NFP,         question,    in plain      in their words
owns the     signed       through      language          │
relationship charter      G0–G2            ▲             │
                │                          └── feedback ─┘
                └──── feedback re-steers the stream ──────┘
        "it missed" is a valid, valuable result
```

|                         |                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **The broker**          | A named person (a maintainer, initially) owns the relationship: finds and signs the partner, translates their pain into a well-framed Discover issue (the partner never touches GitHub), carries syntheses back in plain language, files their feedback. Proposed to be a person, not an agent, form or bot at founding stage — consistent with humans holding judgement ([`CONSTITUTION.md`](../CONSTITUTION.md) Article IV). |
| **Finding the partner** | Run as the project's own method: a Discover issue — "which NZ small NFPs have a research-shaped problem we could answer in 4–6 weeks?" Agents map the candidate landscape; humans work the loose contacts. Grant-access domain first ([`docs/DOMAINS.md`](../docs/DOMAINS.md)); deliberately **not** child welfare until the Te Tiriti gap (§2, gap 5) is closed.                                                              |
| **The charter**         | One page, plain language, not a legal contract. Partner gives: a real question, one feedback call per synthesis, honesty when we miss. Project gives: rigorous cited research free ([`CONSTITUTION.md`](../CONSTITUTION.md) Article III), no data misuse, nothing published about them without sign-off, freedom to walk away. Proposed as a public template in `docs/` — makes demand-pull auditable.                         |
| **The public form**     | "Ask us a question" on the dashboard → needs-triage Discover candidate. G0 framing already handles the noise ([`docs/STREAMS.md`](../docs/STREAMS.md)). Secondary channel — expect the founding partner to come from outreach, not the form.                                                                                                                                                                                   |

**Proposed north star for one quarter — a falsifiable target** — _success = first `IMPACT.md` entry, even if it says "partner said we missed"_

| NOW                                              | WEEKS 1–4                                                 | WEEKS 4–8                                                     | WEEKS 8–13                                                |
| ------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| Name broker · open partner issue · draft charter | Work loose contacts · map candidates · park other streams | Sign charter · frame partner stream · add Deliver + IMPACT.md | Drive stream through G1 with partner · first impact entry |

---

## 6. Built to be copied — kernel and instances

_Proposed framing and criteria, not adopted standards._ The intent to package the model for peers abroad **sharpens the analysis rather than reshaping it**. The exportable asset today would be scaffolding without evidence it produces adoption (no `IMPACT.md` yet, repo search 2 Jul 2026) — exporting that exports the failure mode at scale. The first proven stream _is_ the replication prerequisite. Resist building the franchise kit before the first store works.

```
┌───────────────────────────────┐
│ THE KERNEL (country-agnostic) │        ┌──────────────────────────────┐
│                               │ ──────▶│ NZ INSTANCE (first)          │
│ · Method + Constitution+gates │        │ Domains · partners · contacts│
│ · Broker & steward roles      │        │ Te Tiriti & Māori data       │
│ · Partner charter template    │        │ sovereignty                  │
│ · Deliver stage + IMPACT.md   │        └──────────────────────────────┘
│ · Asker-or-exploratory rule   │        ┌──────────────────────────────┐
│ · Automation scripts + ADRs   │ ┈┈┈┈┈▶ │ COUNTRY X (later)            │
│ · Legitimacy layer — required │        │ Their domains, partners,     │
│   slot                        │        │ channels, legitimacy layer   │
└───────────────────────────────┘        └──────────────────────────────┘
```

The kernel's automation and gates already exist in part — the runner scripts ([`start_work.sh`](../start_work.sh), [`synthesize_work.sh`](../synthesize_work.sh), [`review_work.sh`](../review_work.sh), [`merge_ready.sh`](../merge_ready.sh); [`docs/AUTOMATION.md`](../docs/AUTOMATION.md)) and the binding gates ([`docs/STREAMS.md`](../docs/STREAMS.md); [`CONSTITUTION.md`](../CONSTITUTION.md) Article III–IV). The Deliver stage, `IMPACT.md`, broker role, charter template and legitimacy slot are the pieces this analysis proposes adding.

**Close every gap as a kernel pattern, not an NZ patch (proposed).**

**The legitimacy layer as a design slot, not an NZ footnote (proposed).** Every country instance needs one — indigenous data sovereignty, marginalised-community partnership, whatever legitimacy demands there. The proposal: the kernel makes it a required slot — no sensitive domain opens in any instance until it's documented, consistent with the existing rule that sensitive domains need a human with domain authority ([`CONSTITUTION.md`](../CONSTITUTION.md) Article IV.2). NZ's Te Tiriti answer would become the exemplar others copy.

> **Proposed definition — "proven" means, at minimum:**
> ① one stream through Deliver end-to-end · ② `IMPACT.md` records genuine adoption events with partner feedback · ③ a written playbook a stranger could follow · ④ the kernel/instance boundary documented · ⑤ the legitimacy slot has a worked NZ example.
>
> Until then, "packaging the model" means writing artifacts as templates as you go — not a separate workstream.

---

## 7. How we collaborate — one workspace, two audiences

_Analysis and proposal. Some of this describes how the repo already works (cited); the bot, forms and private-repo rule are proposed additions, not current policy._

**The principle: GitHub is the single source of truth, and non-technical people never have to see it.** They read through rendered views and write through low-friction channels; automation and named humans bridge both directions. The moment content is mirrored into a second tool "for the non-technical folks", there are two sources of truth and one of them is lying. _(This single-source principle is the same one behind the audience-by-extension file convention — see [`analysis/README.md`](README.md).)_

```
WRITE  Partners · SMEs ──▶ ① Named humans  ② WhatsApp bot  ③ Forms ──▶ ┐
       frontline workers     broker files it   chat → issue   no account │
                                                                    GITHUB
                                                            single source of truth
READ   Same people ◀── Public dashboard ◀── Auto-render on merge ◀──────┘
       never sent a     stream permalinks     GitHub Actions
       github.com link  · impact log          · never stale
```

| Who                          | Reads                         | Writes via                                                                              |
| ---------------------------- | ----------------------------- | --------------------------------------------------------------------------------------- |
| Partner organisation         | Their stream's permalink page | The broker (calls); later the form                                                      |
| Frontline worker / SME       | Stream overviews on the site  | Steward or broker · WhatsApp bot · issue comments if willing                            |
| Stream steward               | Site + the repo               | Direct: edits overviews, makes gate decisions ([`docs/STREAMS.md`](../docs/STREAMS.md)) |
| Contributor (human or agent) | The repo                      | Direct: issues, branches, PRs ([`CONTRIBUTING.md`](../CONTRIBUTING.md))                 |
| Maintainer                   | Everything                    | Direct, plus converting tier 1–3 input into repo mechanics                              |

**Sequencing — don't build the bridge before there's traffic (proposed).** The bot and forms are themselves supply-push infrastructure, tempting to build early. Tier 1 (broker as bridge) works from day one with zero code and is all the founding-partner phase needs. Build the form alongside the demand side's public launch; build the bot when feedback volume actually strains the humans. **Proposed rule:** sensitive material (partner contacts, unsigned drafts) lives in one small private repo — _if it isn't cleared for public, it lives there_ — reconciling with "open by default" ([`CONSTITUTION.md`](../CONSTITUTION.md) Article III.6) by keeping only the not-yet-public exceptions out of the open repo.

> The portable pattern (proposed): **Read = rendered site. Write = named humans, then chat, then forms. GitHub = the database. Automation = the glue.** A country instance swaps WhatsApp for whatever channel its community lives in; everything else travels as-is.

---

## 8. What we should action next

Proposed immediate targets for the group. Each is small enough to start this week; most are PRs against the repo — arguable in the open, per [`CONSTITUTION.md`](../CONSTITUTION.md) Article VII–VIII. None is enacted by merging _this_ document.

| #   | Action                                               | Detail                                                                                                                                                                                                                   | When                  | Type         |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ------------ |
| 1   | **Ratify the mission statement**                     | PR the recommended statement (V4) into README + Manifesto ([an amendment](../CONSTITUTION.md), Article VIII), linking this analysis as the reasoning. Settles the framing everything else hangs off.                     | **This week**         | PR           |
| 2   | **Adopt the asker-or-exploratory rule**              | PR to [`docs/STREAMS.md`](../docs/STREAMS.md): every stream names its asker or declares itself exploratory; exploratory capped at one, time-boxed, converts by G1 or parks. Turns demand-pull from prose into mechanism. | **This week**         | PR           |
| 3   | **Name the broker; open the founding-partner issue** | One person owns finding + signing the first small NFP. Agents map candidates; humans work the loose contacts. Grant-access first; not child welfare.                                                                     | **This week**         | People       |
| 4   | **Draft the partner charter template**               | One page, plain language, in `docs/` as a kernel template — needed before any partner conversation gets serious.                                                                                                         | **This week**         | PR           |
| 5   | **Publicly park all streams but one**                | Pick the stream most likely to reach a real user; park the rest citing "depth before breadth" ([`MANIFESTO.md`](../MANIFESTO.md)). Reversible, honest, relieves the steward bottleneck.                                  | This month            | Decision     |
| 6   | **Triage the open-PR backlog**                       | 28 open PRs (snapshot 2 Jul 2026) is the project's own named failure mode, live in its own repo. Merge, close or park each; then cap open agent work per stream.                                                         | This month            | Housekeeping |
| 7   | **Add the Deliver stage + IMPACT.md**                | PR the fifth pipeline stage and an empty impact log with its entry format. An empty, honest impact log is itself a statement of what we measure ([`MANIFESTO.md`](../MANIFESTO.md), the three metrics).                  | This month            | PR           |
| 8   | **Open the Te Tiriti workstream**                    | State the gap plainly; begin identifying Māori advisors or partner orgs to co-author the legitimacy layer. Must land before child welfare proceeds ([`CONSTITUTION.md`](../CONSTITUTION.md) Article IV.2).               | Start now — long pole | People       |

Items 1–4 are a single week's work for a small group. Items 5–7 are housekeeping with outsized signalling value. Item 8 is the long pole — start it now so it's ready when it's needed.

**The whole game: one real person, at one real organisation, measurably better off — then again, and again, until the way we did it is worth copying.**

---

## 9. Confidence & limits

_Per [`CONSTITUTION.md`](../CONSTITUTION.md) Article III.1 and the house method ([`docs/METHOD.md`](../docs/METHOD.md)): what this analysis is confident of, what is interpretation, and what would change the conclusions._

**Method.** Sources are the repo's own documents and its live GitHub state. Claims of the form "the repo does X" are cited to the file. Claims of the form "the repo does _not_ do X" (absences) were checked by repo-wide text search on **2 July 2026** and are only as good as that snapshot.

**Repo-state snapshot (2 July 2026), the load-bearing figures:**

- **29 open issues, 28 open PRs** — via `gh issue list` / `gh pr list`. One of the 28 PRs is this analysis. **Confidence: High** at the snapshot instant; these numbers drift daily — re-run before quoting.
- **No `IMPACT.md`, no "Deliver" stage** — no file or pipeline reference found in `README`, `MANIFESTO`, `CONSTITUTION`, `docs/`, `CONTRIBUTING.md`. **Confidence: High.**
- **No Te Tiriti / Māori data-sovereignty / iwi mention in founding docs** — search of `README`, `MANIFESTO`, `CONSTITUTION`, `docs/` returned zero hits. **Confidence: High** for those files; **Medium** as a claim about the _whole_ project, which includes issues, PRs and external conversation this search did not cover.
- **No Figure.NZ / Hui E! / community-law / ecosystem positioning** — no mention found in the tracked docs. **Confidence: Medium** — same caveat as above.
- **Five domains, child-welfare first-listed** — [`docs/DOMAINS.md`](../docs/DOMAINS.md). **Confidence: High.**
- **The three metrics and "done = adoption"** — [`MANIFESTO.md`](../MANIFESTO.md). **Confidence: High.**

**What is interpretation, not fact.** The verdict that upstream is "well-designed" and downstream "aspirational"; that agent output "outruns human judgement capacity"; that "greatest challenges" is supply-push framing; the whole of §3–§7 as recommendations. These are argued positions offered to the group, not sourced facts. **Confidence: the reasoning, not the conclusions.**

**What is explicitly _not yet_ true.** The V4 mission is **not adopted** ([`README.md`](../README.md) still carries V1). The §5 "decisions" are **proposals** — no broker, charter, form or partner exists in the repo as of the snapshot. The §6 "proven" definition and §7 private-repo rule are **proposed**, not policy.

**What would change these conclusions.** A single `IMPACT.md` entry would retire the sharpest edge of gaps 1–3. A Te Tiriti reference already merged elsewhere (issue, PR, or a doc this search missed) would soften gap 5 — worth confirming before acting on it. A decision record showing the V4 mission or the §5 choices were in fact ratified would flip those from "proposal" to "cite the decision" — if one exists, link it and this framing should change accordingly.
