---
title: "Where a default Treaty-consideration checklist should live in the project method"
domain: "other"
issue: "#136"
confidence: "Medium"
author: "claude"
agent: "claude"
model: "claude-opus-4-8"
date: "2026-07-03"
status: "draft"
---

# Where a default Treaty-consideration checklist should live in the project method

> **This is a research finding, not an adopted decision.** It maps placement options and
> recommends one *as a draft for human G1/steward judgement*. Changing a binding method doc
> (`CONTRIBUTING.md`, `docs/METHOD.md`, the PR template) is a method change that
> [`CONSTITUTION.md` Art. III–IV](https://github.com/thecolab-ai/the-for-good-project/blob/main/CONSTITUTION.md)
> and [`docs/STREAMS.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md)
> reserve for a human gate (this reads G0/G1-shaped) — merging this finding adopts nothing.
> Stream #104 · Part of #104.

## Executive answer

- **Recommendation (draft): put the *requirement* in one canonical place and mirror it to the one *enforcement* surface — do not scatter the three lenses across every doc.** Concretely: add one line to the method (the "five checks" in [`CONTRIBUTING.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/CONTRIBUTING.md) with its rationale in [`docs/METHOD.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/METHOD.md)) **and** a matching tick-box in **both** PR-checklist surfaces, with the *how-to* (the lenses themselves) staying in the single existing reference doc [`analysis/treaty-consideration-as-default-lens.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/analysis/treaty-consideration-as-default-lens.md) and linked, not copy-pasted.
- **Yes, it belongs in more than one place — but as *one statement referenced from several*, not several copies.** The repo already works this way: every method check exists as prose in `CONTRIBUTING.md`/`docs/METHOD.md` *and* as a tick in the PR checklist. Following that existing pattern is the least-confusing option; inventing a new home is the most confusing.
- **Watch the hidden duplication.** "The PR checklist" is physically **two** near-identical lists — one in `CONTRIBUTING.md` and one in [`.github/PULL_REQUEST_TEMPLATE.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/.github/PULL_REQUEST_TEMPLATE.md) — kept in sync by hand. Any "add it to the PR checklist" decision means editing both or they drift.
- **Validation implication: CI cannot enforce this.** The deterministic validator ([`scripts/validate-findings.mjs`](https://github.com/thecolab-ai/the-for-good-project/blob/main/scripts/validate-findings.mjs)) checks structure, not Treaty substance, so a Treaty check is enforced only by **adversarial human/agent review**. Without a short rubric it degrades into box-ticking — the exact "decoration not substance" trap the source analysis warns against.
- **This mirrors the strongest parts of NZ official Treaty-check practice:** DPMC treats Treaty analysis as a standing analytical step embedded in the policy process and keeps the detailed questions in separate Cabinet guidance; LDAC independently supports the narrower point that Treaty respect belongs in both the development process and final product, and supplies its own compact analytical questions. The stronger *"start at the very beginning / most important precisely where interests aren't obvious"* framing, and the workflow/separate-guidance split, are DPMC-specific and marked as single-sourced in the claim table below.

**Overall confidence:** Medium — the repo-structure claims (what each doc contains today) are High and directly verifiable; the *core* NZ-precedent claim (Treaty consideration as a standing step across the development process **and** the final product) is High and double-sourced across DPMC and LDAC; the DPMC-specific placement pattern (workflow requirement with detailed questions in separate guidance) and the stronger DPMC-specific framing ("very beginning" / "more important where interests aren't obvious" / not a trigger) are each single-sourced and marked that way below. The *recommendation itself* is a design judgement offered for a human steward, not a fact, so the headline is deliberately Medium.

## Evidence

### What checklist/method surfaces actually exist in the repo today

The question lists five candidate homes. Checked against the repo, here is what each one currently is:

- **`CONTRIBUTING.md`** holds two distinct things: a prose **"research method"** (five numbered checks — clarify, cite, verify surprises, mark confidence, say what would change your mind) and a separate **"Pull request checklist"** of seven tick-boxes contributors are expected to satisfy. [CONTRIBUTING.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/CONTRIBUTING.md)
- **`docs/METHOD.md`** is explicitly "the longer rationale — why the method is what it is," expanding the same five checks with reasoning. It is where a *why* lives, not a tick-box. [docs/METHOD.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/METHOD.md)
- **`docs/STREAMS.md`** defines the **human gates** (G0 framing, G1 synthesis, G2 build) and states plainly that agents must never set stream direction or edit `streams/` overviews — those are steward decisions. It is a governance doc about *who decides when*, not a per-PR checklist. [docs/STREAMS.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md)
- **The PR checklist is physically two lists.** Beyond the seven-item list in `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md` carries its own six-item **"Method checklist"** that auto-populates every PR. The two overlap but are not identical and are synchronised manually. [.github/PULL_REQUEST_TEMPLATE.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/.github/PULL_REQUEST_TEMPLATE.md)
- **Output templates** ([`research/TEMPLATE.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/research/TEMPLATE.md), `solutions/TEMPLATE.md`) shape each artifact's *sections* — a sixth candidate home the issue didn't list, but a real one, because it is where a lens *finding* could be recorded rather than merely attested.

The load-bearing structural fact: **the project already places every method obligation in exactly two coordinated spots — the prose method (`CONTRIBUTING.md` + `docs/METHOD.md` rationale) and the PR tick-box (`CONTRIBUTING.md` list + PR template).** A new obligation that follows this existing groove is legible; one that lands somewhere novel is not.

### What the source analysis and the Discover issue actually ask for

The originating analysis proposes adopting "the three lenses as a default checklist item **in `CONTRIBUTING.md` or `docs/METHOD.md`**" and is explicit that "none of this is enacted by merging this file." [analysis/treaty-consideration-as-default-lens.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/analysis/treaty-consideration-as-default-lens.md) The Discover issue #104 sharpens the same question — "`CONTRIBUTING.md`'s pull request checklist, `docs/METHOD.md`'s five checks, or both?" — and stresses it "reads like a G0/G1-shaped call, not something an agent decides alone." [Issue #104](https://github.com/thecolab-ai/the-for-good-project/issues/104) So the placement question is real and already scoped to these surfaces; the job here is to compare them, not to re-open whether the lens is worth adopting.

### How the NZ Crown places its own Treaty-consideration check (external precedent)

New Zealand official guidance gives useful precedent, but it does not all support the same design claim. DPMC gives the strongest analogous placement pattern: the **requirement** to do Treaty analysis is embedded in the policy workflow, while the detailed **how-to** questions live in referenced Cabinet guidance. LDAC independently supports a narrower process-and-product point and supplies analytical questions in its own guideline chapter, but it does not establish DPMC's workflow/separate-guidance split.

- The Department of the Prime Minister and Cabinet's Treaty of Waitangi analysis tool states the analysis means "applying the concepts and texts of the Treaty of Waitangi **at each stage** of policy development… **at the very beginning** of a policy process… through to implementation and evaluation," and that it "needs to be built into your policy process during the commissioning stage." Crucially, for "policies that don't have any immediately obvious Treaty of Waitangi / Māori interests… using the Treaty of Waitangi analysis becomes **more** important to ensure less obvious implications are not missed." The actual questions are not restated in the workflow — they live in the separate Cabinet Circular guidance (CO(19)5, based on Te Arawhiti's guidance). [DPMC — Treaty of Waitangi analysis](https://www.dpmc.govt.nz/our-programmes/policy-project/policy-tools/treaty-waitangi-analysis) ([archived 2026-06-18](https://web.archive.org/web/20260618223901/https://www.dpmc.govt.nz/our-programmes/policy-project/policy-tools/treaty-waitangi-analysis)); [DPMC — CO(19)5 Te Tiriti o Waitangi Guidance](https://www.dpmc.govt.nz/publications/co-19-5-te-tiriti-o-waitangi-treaty-waitangi-guidance)
- The Legislation Design and Advisory Committee's guidelines say "the development process of policy and legislation, **as well as the final product**, should show appropriate respect for the spirit and principles of the Treaty," and supply a compact analytical frame ("Does the proposed legislation affect, or have the potential to affect, the rights or interests of Māori under the Treaty?"; "Does the proposed legislation impact Crown commitments made under any Treaty settlement?"). [LDAC — Legislation Guidelines 2021, ch.5](https://www.ldac.org.nz/guidelines/legislation-guidelines-2021-edition/constitutional-issues-and-recognising-rights-2/chapter-5) ([archived 2025-12-25](https://web.archive.org/web/20251225090118/https://www.ldac.org.nz/guidelines/legislation-guidelines-2021-edition/constitutional-issues-and-recognising-rights-2/chapter-5/))

Two design lessons transfer, with different evidential weights: (1) place the check to bite at **both** the development/framing stage **and** the output/decision point, not one or the other (DPMC + LDAC); (2) if the project wants a workflow/checklist split, DPMC supports keeping the *requirement* in the process and the detailed *questions* in one referenced guidance doc, while the repo's own method/checklist pattern supplies the internal reason not to duplicate the full lenses everywhere.

### The four placement options, with tradeoffs

**Option A — Method line + mirrored PR tick-box (the existing "method check" pattern); lenses stay in the analysis doc.**
Add a sixth item to the five checks in `CONTRIBUTING.md` (with rationale in `docs/METHOD.md`) *and* a matching tick-box in both PR-checklist surfaces, each linking to `analysis/treaty-consideration-as-default-lens.md` for the actual lenses.
- *For:* follows the repo's own established pattern exactly, so it is the least-confusing to a contributor who already knows the method; puts the check at both framing (method prose) and output (PR tick); one canonical statement, one referenced how-to — no lens duplication. Mirrors the DPMC workflow/guidance split above.
- *Against:* touches the most files (four: `CONTRIBUTING.md`, `docs/METHOD.md`, PR template, and it presumes the analysis doc is the stable how-to home despite ADR-0004 marking analysis docs *advisory*); "the five checks" becomes six, a visible change to a load-bearing doc; requires keeping the two PR lists in sync.

**Option B — PR checklist only (lightest touch).**
One tick-box added to `.github/PULL_REQUEST_TEMPLATE.md` (and the `CONTRIBUTING.md` list to match), linking out for the how-to; no change to the method prose.
- *For:* minimal, fast, enforced on literally every PR; hard to forget because the template auto-populates.
- *Against:* a tick-box with no method-level rationale is the box-ticking / "decoration not substance" failure the source analysis explicitly warns against; gives reviewers nothing to check *against*; does not bite at framing time (a PR checklist is an output-stage artifact, and the strongest precedent — DPMC — says the check must start "at the very beginning").

**Option C — First-class method principle in `docs/METHOD.md` + a gate note in `docs/STREAMS.md`.**
Elevate it to a standing principle in the method rationale and add a line at G0/G1 that stewards apply the lens at framing and synthesis.
- *For:* strongest signal that this is default, not conditional; puts it where judgement actually happens (the gates), matching that Treaty calls are human-judgement calls under `CONSTITUTION.md` Art. IV.2.
- *Against:* heaviest; edits a governance doc; **and `docs/STREAMS.md` gate mechanics are steward/maintainer territory this research task must not pre-empt** — so C can only ever be a recommendation *to* a steward, never an agent edit. Risks two obligations (method + gate) that can drift.

**Option D — Output templates only.**
Add a short "Te Tiriti / Treaty consideration" section to `research/TEMPLATE.md` and `solutions/TEMPLATE.md` so every artifact records the lens result.
- *For:* creates a *place to write the finding down*, not just attest to it — the one thing a tick-box can't do; structural and low-friction.
- *Against:* a template section without a method obligation behind it is easy to leave blank or delete; doesn't create the top-level "you must do this" that #104 is really asking for; the validator would need a new rule to make the section mandatory, else it's optional in practice.

The options are not exclusive. A + a slim slice of D (a template section *to record* the lens outcome, backed by the A obligation) is the natural pairing and is what the recommendation reflects.

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| NZ official practice treats Treaty consideration as a **standing** step across the whole policy/legislation lifecycle — the development process **and** the final product — i.e. a default design expectation, not a one-off | [DPMC Treaty analysis tool](https://www.dpmc.govt.nz/our-programmes/policy-project/policy-tools/treaty-waitangi-analysis) ([archived](https://web.archive.org/web/20260618223901/https://www.dpmc.govt.nz/our-programmes/policy-project/policy-tools/treaty-waitangi-analysis)) — "at each stage… through to implementation and evaluation" | [LDAC Guidelines ch.5](https://www.ldac.org.nz/guidelines/legislation-guidelines-2021-edition/constitutional-issues-and-recognising-rights-2/chapter-5) ([archived](https://web.archive.org/web/20251225090118/https://www.ldac.org.nz/guidelines/legislation-guidelines-2021-edition/constitutional-issues-and-recognising-rights-2/chapter-5/)) — "the development process of policy and legislation, **as well as the final product**, should show appropriate respect for the … principles of the Treaty" | High (double-sourced) |
| **DPMC specifically:** start the analysis "**at the very beginning**," and it becomes "**more** important" precisely where Treaty/Māori interests are **not** immediately obvious — i.e. a default lens, not a trigger gated on obvious interests | [DPMC Treaty analysis tool](https://www.dpmc.govt.nz/our-programmes/policy-project/policy-tools/treaty-waitangi-analysis) ([archived](https://web.archive.org/web/20260618223901/https://www.dpmc.govt.nz/our-programmes/policy-project/policy-tools/treaty-waitangi-analysis)) | — (single authoritative primary source; **not** corroborated by LDAC, whose Part-1 test — "does the proposed legislation affect, *or have the potential to affect*" Māori interests — is itself trigger-shaped) | Medium (single-sourced, flagged) |
| **DPMC specifically:** the policy workflow page points to the separate Treaty guidance / CO(19)5 for the detailed questions, rather than carrying the full question set itself | [DPMC Treaty analysis tool](https://www.dpmc.govt.nz/our-programmes/policy-project/policy-tools/treaty-waitangi-analysis) ([archived](https://web.archive.org/web/20260618223901/https://www.dpmc.govt.nz/our-programmes/policy-project/policy-tools/treaty-waitangi-analysis)) and the referenced [DPMC CO(19)5 guidance](https://www.dpmc.govt.nz/publications/co-19-5-te-tiriti-o-waitangi-treaty-waitangi-guidance) | — (same institutional source family; not independently established by LDAC) | Medium (single-sourced, flagged) |
| "The PR checklist" is two hand-synced lists, so "add it to the PR checklist" edits two files | [CONTRIBUTING.md PR checklist](https://github.com/thecolab-ai/the-for-good-project/blob/main/CONTRIBUTING.md) | [.github/PULL_REQUEST_TEMPLATE.md](https://github.com/thecolab-ai/the-for-good-project/blob/main/.github/PULL_REQUEST_TEMPLATE.md) | High |
| CI cannot enforce a Treaty check — the validator checks structure only | [scripts/validate-findings.mjs](https://github.com/thecolab-ai/the-for-good-project/blob/main/scripts/validate-findings.mjs) | — (single source: direct code read; stated as one source) | High |

## What would change this conclusion

- **A steward decision that this is a G-level policy change, not a "checklist item."** If the human gate holds that adopting the default lens is a change to how the project *works* (plausible under `CONSTITUTION.md` Art. III.4 / Art. VIII on amending binding docs), the right first move may be a governance decision recorded in an ADR, with doc placement following it — making Option C's spirit primary and A/B/D merely the mechanics. This finding cannot make that call; a steward must.
- **Whether the lenses' stable home is really the `analysis/` doc.** Options A/B lean on `analysis/treaty-consideration-as-default-lens.md` as the linked how-to, but [ADR-0004](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0004-analysis-documents-and-rendered-companions.md) marks analysis docs *advisory*. If the project wants the how-to to be *binding*, the lenses may need to move into `docs/` — which changes what A/B link to. Needs a steward's call on canonical home.
- **The retroactivity and sensitivity-calibration questions (#104 Q2, Q4) are out of scope here and unanswered.** I did not assess whether the check applies to existing streams (e.g. #4) or how to scale depth to stakes; those affect *wording* of any checklist item and are genuine open questions for synthesis, not settled by this placement analysis.
- **What I could not verify:** the two government sources were confirmed via Wayback snapshots after live `curl`, WebFetch, and the browser ladder all returned HTTP 403 (blocked, not dead — browser tooling was not installed in this environment); the substance is quoted from those snapshots. The "validator checks structure only" claim rests on a single direct code read (flagged as one source above). The DPMC-specific framing — apply "at the very beginning" and treat it as *more* important where interests aren't obvious — is corroborated only by DPMC; LDAC supports the weaker "process and final product" version but not that stronger point (LDAC's Part-1 test is trigger-shaped), so that claim is marked single-sourced above and I did not find a genuine second source for it. I also did not find a second independent official source for the DPMC workflow/separate-guidance design split; LDAC supplies analytical questions in its own chapter, but does not show that the requirement lives in a workflow while the how-to lives in a separate referenced document. I did not survey how comparable open-source projects place cultural/ethics checklists, so the precedent set is NZ-government-only.
- **Human needed:** this is exactly a G1-shaped judgement (is this the right home, and is the wording right for the people affected?). A steward — ideally with Māori data-governance or Te Tiriti expertise, per `docs/STREAMS.md` always-human triggers — should own both the decision and the wording; an agent should not draft the binding text unreviewed.

## Open follow-up questions

- Draft the exact one-line checklist wording (and the `docs/METHOD.md` rationale paragraph) for a steward to edit — a small, concrete ideate/build task *after* G1, not now.
- Should the validator gain a rule making a template "Te Tiriti consideration" section mandatory (Option D enforcement), and does that risk box-ticking without a rubric?
- Does adopting a default method obligation warrant its own ADR (mirroring ADR-0004's pattern for the `analysis/` type), so the *why* is recorded once and the doc edits just point to it?
- #104 Q2 (retroactive to existing streams?) and Q4 (is concentrating steward attention on high-stakes streams a deliberate, reasonable tradeoff already made?) — both feed the wording and remain open.

## Sources

1. The For Good Project — [`CONTRIBUTING.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/CONTRIBUTING.md) (research method + PR checklist). Accessed 2026-07-03.
2. The For Good Project — [`docs/METHOD.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/METHOD.md). Accessed 2026-07-03.
3. The For Good Project — [`docs/STREAMS.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md) (streams, gates G0/G1/G2). Accessed 2026-07-03.
4. The For Good Project — [`CONSTITUTION.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/CONSTITUTION.md) (Art. III rules, Art. IV human-in-the-loop). Accessed 2026-07-03.
5. The For Good Project — [`.github/PULL_REQUEST_TEMPLATE.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/.github/PULL_REQUEST_TEMPLATE.md) (Method checklist). Accessed 2026-07-03.
6. The For Good Project — [`research/TEMPLATE.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/research/TEMPLATE.md). Accessed 2026-07-03.
7. The For Good Project — [`scripts/validate-findings.mjs`](https://github.com/thecolab-ai/the-for-good-project/blob/main/scripts/validate-findings.mjs) (deterministic validator). Accessed 2026-07-03.
8. The For Good Project — [`analysis/treaty-consideration-as-default-lens.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/analysis/treaty-consideration-as-default-lens.md) (source analysis, the three lenses). Accessed 2026-07-03.
9. The For Good Project — [`docs/adr/0004-analysis-documents-and-rendered-companions.md`](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/adr/0004-analysis-documents-and-rendered-companions.md) (analysis docs are advisory). Accessed 2026-07-03.
10. The For Good Project — [Issue #104](https://github.com/thecolab-ai/the-for-good-project/issues/104) (Discover: adopt Treaty consideration as a default checklist item). Accessed 2026-07-03.
11. DPMC — [Treaty of Waitangi analysis](https://www.dpmc.govt.nz/our-programmes/policy-project/policy-tools/treaty-waitangi-analysis) ([Wayback 2026-06-18](https://web.archive.org/web/20260618223901/https://www.dpmc.govt.nz/our-programmes/policy-project/policy-tools/treaty-waitangi-analysis)). Live URL 403-blocked on access 2026-07-03; quoted from snapshot.
12. DPMC — [CO(19)5: Te Tiriti o Waitangi / Treaty of Waitangi Guidance](https://www.dpmc.govt.nz/publications/co-19-5-te-tiriti-o-waitangi-treaty-waitangi-guidance). Accessed 2026-07-03.
13. Legislation Design and Advisory Committee — [Legislation Guidelines 2021, ch.5: The Treaty of Waitangi, Treaty settlements, and Māori interests](https://www.ldac.org.nz/guidelines/legislation-guidelines-2021-edition/constitutional-issues-and-recognising-rights-2/chapter-5) ([Wayback 2025-12-25](https://web.archive.org/web/20251225090118/https://www.ldac.org.nz/guidelines/legislation-guidelines-2021-edition/constitutional-issues-and-recognising-rights-2/chapter-5/)). Live URL 403-blocked on access 2026-07-03; quoted from snapshot.
