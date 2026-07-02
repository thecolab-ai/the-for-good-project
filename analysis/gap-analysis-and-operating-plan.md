# The For Good Project — Gap Analysis & Operating Plan

*From mission review to a proven, copyable loop*

> **"People and AI, donated to the public good. We research Aotearoa's hardest problems in the open, and carry the answers through to real impact — in a way any country can copy."**
>
> *Adopted mission statement · 2 July 2026*

Prepared for the working group · thecolab.ai · July 2026
Companion files: `for-good-project-gap-analysis.md`, `how-we-collaborate.md`

**Contents**

1. [The verdict — what the mission gets right](#1-the-verdict--what-the-mission-gets-right)
2. [The eight gaps](#2-the-eight-gaps)
3. [Mission statement — four variations compared](#3-mission-statement--four-variations-compared)
4. [Supply-push vs demand-pull — two operating models](#4-supply-push-vs-demand-pull--two-operating-models)
5. [The demand-side plan — founding partner loop](#5-the-demand-side-plan--founding-partner-loop)
6. [Built to be copied — kernel and instances](#6-built-to-be-copied--kernel-and-instances)
7. [How we collaborate — one workspace, two audiences](#7-how-we-collaborate--one-workspace-two-audiences)
8. [What we should action next](#8-what-we-should-action-next)

---

## 1. The verdict — what the mission gets right

The mission is coherent and unusually well-articulated for a project this young. The core mechanism — spare AI capacity meets unworked NZ problems, **agents grind, humans steer**, done means adoption — is sound, and the Constitution / Manifesto / working-docs layering is a genuine strength. Most communities never write down "outcomes over outputs" this crisply.

The gap pattern is equally consistent, and it's one picture:

```
 well-designed today                              aspirational
┌─────────────────────────────────────────┐   ┌─────────────────────┐
│ Discover ──▶ Research ──▶ Ideate ──▶ Build ┈┈▶ Deliver ┈┈▶ Impact │
└─────────────────────────────────────────┘   └─────────────────────┘
  method, gates, automation,                    no stage, owner
  adversarial review                            or instrument
```

**Everything upstream of a merged PR is well-designed; everything between merge and a changed life is aspirational.** The Manifesto names the right principles — demand-pull, adoption-as-done, start narrow — but the repo's machinery doesn't yet implement any of them.

> ⚠️ The repo proves its own point: ~29 open issues and ~27 open PRs against a handful of humans. Agent output is already outrunning human judgement capacity — exactly the failure mode the Manifesto warns against.

---

## 2. The eight gaps

| # | Gap | What's missing | Recommendation |
|---|-----|----------------|----------------|
| 1 | **No demand side** | "Demand-pull" is claimed but no mechanism exists for a real organisation to ask a question. Problems look internally invented. | The founding-partner plan (§5). This is the root gap — most others flow from it. |
| 2 | **Pipeline ends before the mission does** | Last stage is Build; "done = adoption" has no stage, owner or instrument. The three declared metrics are tracked nowhere. | Add a Deliver stage + a public `IMPACT.md` log of adoption events. |
| 3 | **Breadth contradicts "start narrow"** | Five domains, dozens of parallel items, no stream proven end-to-end. | Publicly park all but one stream; drive it through to Deliver, then reopen. |
| 4 | **Steward supply is the bottleneck** | The design rests on scarce human judgement with no recruitment, onboarding or workload story. The PR backlog is this, visible. | Bound the ask (~1 hr/wk); recruit stewards via the partner; cap open agent work per stream. |
| 5 | **Te Tiriti & Māori data sovereignty absent** | First-listed domain is child welfare, yet no founding doc mentions Te Tiriti, iwi partnership or Māori data sovereignty. A legitimacy risk funders will notice immediately. | Constitutional amendment; treat "we need Māori partnership we don't have" as a valid always-human finding. |
| 6 | **No maintenance story** | If an NFP relies on a tool built here, nobody owns its upkeep. Abandonment does harm — violating Article III. | No G2 pass without a named maintenance plan: handover, sunset date, or maintainer. |
| 7 | **No ecosystem positioning** | No stated relationship to Figure.NZ, Hui E!, community law, existing civic-tech. Risk of duplicating; those orgs are also the fastest route to a partner. | A short `ECOSYSTEM.md`: who already works each domain, where we complement. |
| 8 | **No definition of "proven" for replication** | "Once proven out" is as unfalsifiable as "done" was before it meant adoption. | Explicit replication-readiness criteria (§6). |

Gaps 5 and 6 need their own sessions — the first-partner choice sidesteps them temporarily but doesn't resolve them. Both must land before any stream enters child welfare or ships a tool an organisation depends on. The replication ambition raises the bar on both: they'll be closed as kernel patterns other countries inherit, so they're worth authoring carefully, once.

---

## 3. Mission statement — four variations compared

The test applied to every candidate: does it carry the four load-bearing ideas — **donated** (the spare-capacity model), **open** (the commons), an arc to **real impact** (done = adoption, not merge), and **copyable** (the replication ambition)?

| Variation | Donated | Open | Impact arc | Copyable | Sayable |
|-----------|:-------:|:----:|:----------:|:--------:|:-------:|
| **V1 — Original README**<br>*"An open research commons where people and AI agents work together to solve NZ's biggest societal problems."* | ✗ | ✓ | ✗ | ✗ | ✓ |
| **V2 — Pipeline version**<br>*"We unite and donate our human expertise and AI capacity to identify society's greatest challenges… lasting impact for the greater good of NZ and beyond."* | ✓ | ✗ | ✓ | ~ | ✗ |
| **V3 — Demand-pull version**<br>*"We donate our expertise and AI capacity to an open commons: taking real problems from NZ communities… sharing the model with the world."* | ✓ | ✓ | ✓ | ✓ | ~ |
| **V4 — Adopted ★**<br>*"People and AI, donated to the public good. We research Aotearoa's hardest problems in the open, and carry the answers through to real impact — in a way any country can copy."* | ✓ | ✓ | ✓ | ✓ | ✓ |

| Variation | Positives | Negatives |
|-----------|-----------|-----------|
| **V1 — the original** | "Open research commons" is precise and distinctive — it names the mechanism. Short enough to repeat. | Ends at "solve problems": activity, not outcome — the exact gap the Manifesto warns about. No donation idea, no replication. |
| **V2 — the pipeline version** | "Donate" is the standout word nobody else uses. The arc mirrors the full pipeline to impact; "and beyond" carries replication. | Forty words, five clauses. "Greatest challenges" is supply-push framing. Drops "open". "Greater good / lasting impact" are the clichés every foundation uses. |
| **V3 — the demand-pull version** | Only variation to hard-code demand-pull and adoption into the words themselves — mission and operating model fully agree. | Quietly forecloses the supply-push exception: public-interest domains like AI policy have no community asker. Reads as a sentence, not a saying. |
| **V4 — adopted** | Carries all four ideas. The opening ("People and AI, donated to the public good") works standalone as a tagline. "Carry the answers through" is the Deliver stage in plain words. | "Hardest problems" retains a supply-push flavour — acceptable if the asker-or-exploratory rule (§4) is adopted, since the mechanism then enforces what the poetry doesn't. |

---

## 4. Supply-push vs demand-pull — two operating models

The language question ("society's greatest challenges" vs "problems real organisations bring us") isn't cosmetic — each phrasing implies a different operating model, and each model builds different things. Choose consciously rather than drift.

| | **A — Supply-push**<br>*"We identify society's greatest challenges"*<br>what the repo is today, in practice | **B — Demand-pull**<br>*"We answer questions real organisations bring us"*<br>what the Manifesto claims |
|---|---|---|
| **What gets built** | Broad landscape research, systemic analyses, tools for a *class* of user designed before any specific org is at the table. The domain taxonomy and fan-out machinery are this model's infrastructure. | Narrow, specific artifacts with a named recipient — "the answer to *this* org's question", generalised later. Investment shifts from fan-out machinery to intake, relationship and feedback machinery. |
| **Merits** | Works from a cold start. Free to tackle important-but-unasked problems (AI policy, civic transparency genuinely have no "customer"). Produces wide-reach public goods. Contributors can start immediately. | Adoption structurally built in — the asker is waiting, so "done = adoption" has an obvious test. Relevance validated before tokens are spent. Impact stories write themselves. Naturally rate-limits agent output to human capacity. |
| **Negatives** | Nobody is waiting — adoption must be *sold* after the fact, the hardest way. "Greatest" is judged from the inside. Unfalsifiable until a user is found. Burns scarce human judgement on work with no committed beneficiary. The 27-PR backlog is this model's signature. | Cold-start dependent — no partner, no work; partner acquisition is slow human relationship-building. Scope bounded by whoever shows up; systemic problems with no natural asker get missed. Risks becoming free consultancy for one org. |

> **Recommendation — demand-anchored, with a bounded exploratory allowance.**
> Every stream must **name its asker, or explicitly declare itself exploratory** — and exploratory streams are capped (one active at a time, time-boxed, must convert to a named asker by G1 or park). Public-interest work stays possible; "nobody asked for this" becomes a visible, budgeted exception instead of the invisible default. This rule travels to any country unchanged — it's a kernel pattern.

---

## 5. The demand-side plan — founding partner loop

Decisions taken: first partner is **one small NFP**; intake is a **named human broker** plus a **simple public form**, formalised by a lightweight **partner charter**; starting position is loose contacts requiring deliberate outreach.

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

| | |
|---|---|
| **The broker** | A named person (a maintainer, initially) owns the relationship: finds and signs the partner, translates their pain into a well-framed Discover issue (the partner never touches GitHub), carries syntheses back in plain language, files their feedback. Cannot be an agent, form or bot at founding stage. |
| **Finding the partner** | Run as the project's own method: a Discover issue — "which NZ small NFPs have a research-shaped problem we could answer in 4–6 weeks?" Agents map the candidate landscape; humans work the loose contacts. Grant-access domain first; deliberately **not** child welfare until the Te Tiriti gap is closed. |
| **The charter** | One page, plain language, not a legal contract. Partner gives: a real question, one feedback call per synthesis, honesty when we miss. Project gives: rigorous cited research free, no data misuse, nothing published about them without sign-off, freedom to walk away. Public template in `docs/` — makes demand-pull auditable. |
| **The public form** | "Ask us a question" on the dashboard → needs-triage Discover candidate. G0 already handles the noise. Secondary channel — expect the founding partner to come from outreach, not the form. |

**One quarter to a falsifiable north star** — *success = first IMPACT.md entry, even if it says "partner said we missed"*

| NOW | WEEKS 1–4 | WEEKS 4–8 | WEEKS 8–13 |
|-----|-----------|-----------|------------|
| Name broker · open partner issue · draft charter | Work loose contacts · map candidates · park other streams | Sign charter · frame partner stream · add Deliver + IMPACT.md | Drive stream through G1 with partner · first impact entry |

---

## 6. Built to be copied — kernel and instances

The intent to package the model for peers abroad **sharpens the analysis rather than reshaping it**. The exportable asset today would be scaffolding without evidence it produces adoption — exporting that exports the failure mode at scale. The first proven stream *is* the replication prerequisite. Resist building the franchise kit before the first store works.

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

**Close every gap as a kernel pattern, not an NZ patch.**

**The legitimacy layer is a design slot, not an NZ footnote.** Every country instance needs one — indigenous data sovereignty, marginalised-community partnership, whatever legitimacy demands there. The kernel makes it a required slot: no sensitive domain opens in any instance until it's documented. NZ's Te Tiriti answer becomes the exemplar others copy — which strengthens the case for doing it properly.

> **"Proven" means, at minimum:**
> ① one stream through Deliver end-to-end · ② `IMPACT.md` records genuine adoption events with partner feedback · ③ a written playbook a stranger could follow · ④ the kernel/instance boundary documented · ⑤ the legitimacy slot has a worked NZ example.
>
> Until then, "packaging the model" means writing artifacts as templates as you go — not a separate workstream.

---

## 7. How we collaborate — one workspace, two audiences

**The principle: GitHub is the single source of truth, and non-technical people never have to see it.** They read through rendered views and write through low-friction channels; automation and named humans bridge both directions. The moment content is mirrored into a second tool "for the non-technical folks", there are two sources of truth and one of them is lying.

```
WRITE  Partners · SMEs ──▶ ① Named humans  ② WhatsApp bot  ③ Forms ──▶ ┐
       frontline workers     broker files it   chat → issue   no account │
                                                                    GITHUB
                                                            single source of truth
READ   Same people ◀── Public dashboard ◀── Auto-render on merge ◀──────┘
       never sent a     stream permalinks     GitHub Actions
       github.com link  · impact log          · never stale
```

| Who | Reads | Writes via |
|-----|-------|-----------|
| Partner organisation | Their stream's permalink page | The broker (calls); later the form |
| Frontline worker / SME | Stream overviews on the site | Steward or broker · WhatsApp bot · issue comments if willing |
| Stream steward | Site + the repo | Direct: edits overviews, makes gate decisions |
| Contributor (human or agent) | The repo | Direct: issues, branches, PRs |
| Maintainer | Everything | Direct, plus converting tier 1–3 input into repo mechanics |

**Sequencing — don't build the bridge before there's traffic.** The bot and forms are themselves supply-push infrastructure, tempting to build early. Tier 1 (broker as bridge) works from day one with zero code and is all the founding-partner phase needs. Build the form alongside the demand side's public launch; build the bot when feedback volume actually strains the humans. Sensitive material (partner contacts, unsigned drafts) lives in one small private repo — one rule: *if it isn't cleared for public, it lives there*.

> The portable pattern: **Read = rendered site. Write = named humans, then chat, then forms. GitHub = the database. Automation = the glue.** A country instance swaps WhatsApp for whatever channel its community lives in; everything else travels as-is.

---

## 8. What we should action next

Immediate targets for the group. Each is small enough to start this week; most are PRs against the repo — arguable in the open, per the Constitution.

| # | Action | Detail | When | Type |
|---|--------|--------|------|------|
| 1 | **Ratify the mission statement** | PR the adopted statement (V4) into README + Manifesto, linking this analysis as the reasoning. Settles the framing everything else hangs off. | **This week** | PR |
| 2 | **Adopt the asker-or-exploratory rule** | PR to STREAMS.md: every stream names its asker or declares itself exploratory; exploratory capped at one, time-boxed, converts by G1 or parks. Turns demand-pull from prose into mechanism. | **This week** | PR |
| 3 | **Name the broker; open the founding-partner issue** | One person owns finding + signing the first small NFP. Agents map candidates; humans work the loose contacts. Grant-access first; not child welfare. | **This week** | People |
| 4 | **Draft the partner charter template** | One page, plain language, in `docs/` as a kernel template — needed before any partner conversation gets serious. | **This week** | PR |
| 5 | **Publicly park all streams but one** | Pick the stream most likely to reach a real user; park the rest citing "depth before breadth". Reversible, honest, relieves the steward bottleneck. | This month | Decision |
| 6 | **Triage the open-PR backlog** | ~27 open PRs is the project's own named failure mode, live in its own repo. Merge, close or park each; then cap open agent work per stream. | This month | Housekeeping |
| 7 | **Add the Deliver stage + IMPACT.md** | PR the fifth pipeline stage and an empty impact log with its entry format. An empty, honest impact log is itself a statement of what we measure. | This month | PR |
| 8 | **Open the Te Tiriti workstream** | State the gap plainly; begin identifying Māori advisors or partner orgs to co-author the legitimacy layer. Must land before child welfare proceeds. | Start now — long pole | People |

Items 1–4 are a single week's work for a small group. Items 5–7 are housekeeping with outsized signalling value. Item 8 is the long pole — start it now so it's ready when it's needed.

**The whole game: one real person, at one real organisation, measurably better off — then again, and again, until the way we did it is worth copying.**
