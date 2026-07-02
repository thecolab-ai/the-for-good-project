---
title: "Treaty Consideration as a Default Lens, Not a Trigger Condition"
type: "analysis"
status: "proposal" # advisory — records analysis; does not enact it
author: "mikeartee"
agent: "claude"
model: "claude-sonnet-4-5"
date: "2026-07-02"
---

# Treaty Consideration as a Default Lens, Not a Trigger Condition

_A framing correction to how the project scopes Te Tiriti consideration across streams_

> **Status — proposal, not adopted policy.** This document argues for a reframing; it does not adopt
> one. Whether the three lenses below become a standing part of `CONTRIBUTING.md` or `docs/METHOD.md`
> is a decision for the working group, not something this file enacts by merging. Repo-state claims
> (open issues, existing streams) are a snapshot as of 2 July 2026 — see
> [Confidence & limits](#5-confidence--limits).

Prepared for the working group · thecolab.ai · July 2026 · drafted with Claude (`claude-sonnet-4-5`)

**Contents**

- [1. The framing problem](#1-the-framing-problem)
- [2. Three lenses to run against any stream](#2-three-lenses-to-run-against-any-stream)
- [3. Current NZ landscape, for context](#3-current-nz-landscape-for-context)
- [4. What to action next](#4-what-to-action-next)
- [5. Confidence & limits](#5-confidence--limits)

---

## 1. The framing problem

The project's own gap analysis (`analysis/gap-analysis-and-operating-plan.md`, gap #5) flags "Te
Tiriti & Māori data sovereignty absent" and treats it as a *trigger condition*: Te Tiriti consideration
is something that switches on once a stream happens to touch child welfare or Māori data, and is
otherwise silent for everything else. Checked directly against the repo on 2 July 2026: no open issue
mentions Te Tiriti, Māori, iwi, or data sovereignty in any form, and the one open child-welfare stream
(#4 — family/child entitlement navigation) doesn't touch this ground either. That's consistent with a
gap that only gets noticed when a stream is already Māori-coded. _(Update, later the same day: issue
#104 was opened as the proposal arising directly from this analysis — see §4.)_

**This document argues the trigger-condition framing itself is the deeper gap.** The project operates
in Aotearoa. Every stream — grant access, consumer credit, council spending, supermarket pricing, all
of it — exists inside a bi-cultural society whether or not its subject matter looks Māori-related on
its face. New Zealand's own governance and public-sector guidance treats Treaty partnership as a
standing obligation of the Crown and its agencies generally, not something conditional on subject
matter. Auckland Council's public governance material frames partnership as "an overarching concept
considered to be at the heart of Treaty principles" — not a conditional one (cited in full in §2).

So the reframing this document proposes: **every stream should run through the lenses in §2 as a
default step**, not just the ones that trip a keyword filter for "child welfare" or "data." A
council-spending transparency tool has a Treaty dimension — who counts as a stakeholder council
reports to; whether Māori data appears in council datasets at all, and on what terms. A
supermarket-pricing tool has one too — whether Māori-owned or iwi-affiliated food retailers are
represented in the data; whether the tool's framing of "value" defaults to a non-Māori shopping
pattern without saying so. These aren't edge cases; they're the normal condition of doing this work
here.

This doesn't mean every stream needs the same depth of engagement. A grant-discovery tool and a
child-welfare data pipeline are not equally sensitive, and the Constitution's rule that some domains
need a human with relevant authority to sign off (Article IV.2) still applies where the stakes are
highest — that's about calibrating *depth of caution*, not about whether the lens gets applied at all.
The proposed default is "apply the lens and record what you found, even if the finding is low-impact,"
not "skip the lens because the topic didn't look Māori-related on its face."

---

## 2. Three lenses to run against any stream

These are domain-agnostic — they don't assume child welfare, data, or any specific problem area.

### Lens A — Treaty principles as an audit checklist

The Waitangi Tribunal has developed a recurring set of principles through decades of case law (first
given mainstream legal expression in 1987, building on nearly a decade of Tribunal work). There's no
single fixed list — summaries group them slightly differently — but the recurring ones, per Te Ara
(the government-run online Encyclopedia of New Zealand) and Auckland Council's own governance
guidance, include:

| Principle | Practical test |
|---|---|
| Partnership | Are both parties acting in good faith, with mutual obligations of reasonableness and cooperation — not just one side informing the other? |
| Reciprocity | Does the arrangement actually exchange something of value for Māori, not just extract from them? |
| Autonomy / self-determination | Does this let Māori retain tino rangatiratanga over their own affairs, rather than the project deciding for them? |
| Active protection | Has the project taken a genuinely active step to protect Māori rights and interests — not a passive non-objection? |
| Equal treatment / equity | Does this proposal quietly let a non-Māori interest override Māori interests where they conflict? |
| Redress | Where a past grievance or harm is relevant to this work, is it acknowledged, with a real expectation that reconciliation can occur — not glossed over? |

Sources: [Te Ara — Principles of the Treaty of Waitangi](https://teara.govt.nz/en/principles-of-the-treaty-of-waitangi-nga-matapono-o-te-tiriti-o-waitangi)
(see the "developed by courts," "developed by the Waitangi Tribunal," and "developed by the Crown"
pages); [Auckland Council — Te Tiriti o Waitangi, co-governance and Auckland Council](https://governance.aucklandcouncil.govt.nz/6-maori-partnerships/te-tiriti-o-waitangi-co-governance-and-auckland-council).

### Lens B — Values check, not just "be respectful"

Vague respect is easy to claim and hard to falsify. A sharper self-check: does a proposal engage any
of these concepts, and if so, has it actually been designed around them — not just decorated with them?

- **Manaakitanga** — showing respect, generosity, and care for the people a service touches, their
  whānau, and their communities, including care for their information and stories, not just their
  transactions. ([digital.govt.nz — Data Protection and Use Policy: Manaakitanga Principle](https://www.digital.govt.nz/standards-and-guidance/privacy-security-and-risk/privacy/data-protection-and-use-policy-dpup/read-the-dpup-principles/manaakitanga-principle/))
- **Whanaungatanga** — relationships and group-first thinking: does this respect whānau/hapū/iwi
  structures rather than treating people as isolated data points?
- **Kaitiakitanga** — guardianship, describable as a deep kinship between people and the natural
  world expressed through a way of managing and protecting it. Ask: who is the appropriate kaitiaki
  (steward) of whatever resource, data, or taonga is involved — and have they actually been asked, not
  assumed? ([Te Ara — Kaitiakitanga: guardianship and conservation](https://teara.govt.nz/en/kaitiakitanga-guardianship-and-conservation))

The trap to avoid: using a Māori concept, pattern, or word as decoration rather than substance. If a
proposal borrows Māori language or imagery without the underlying practice behind it, that's a red
flag, not a feature. Treat any use of these terms in a proposal as a commitment to the practice they
name, not a label applied after the fact.

### Lens C — Multiple/Quadruple Bottom Line as an evaluation frame

Treat cultural impact as its own axis, not a subset of "social impact." NZ academic literature
discusses a "Quadruple Bottom Line" (social, cultural, environmental, economic) — originally developed
in the context of Māori organisations, but the underlying point generalises: culture doesn't reduce to
the social dimension, so a good social outcome doesn't automatically mean a good cultural one. A
research finding, tool, or synthesis can be methodologically sound and socially neutral while still
landing a negative *cultural* impact — for example, a dataset or framing choice that treats Māori data
as just another input, with no consideration of who should govern it or what it means to the group it
describes, is a cultural cost even if nothing else about the work is flawed.

When evaluating a piece of research, a proposed solution, or a built tool, ask the
methodological/social/environmental/cultural questions separately, and don't let a good answer on one
axis silently stand in for a bad one on another.

Further reading (the framework was developed in a business context, but applies more broadly): Best,
R. & Love, T. — [Māori Sustainable Economic Development in New Zealand: Indigenous Practices for the
Quadruple Bottom Line](https://www.researchgate.net/publication/267971055_Maori_Sustainable_Economic_Development_in_New_Zealand_Indigenous_Practices_for_the_Quadruple_Bottom_Line);
Amoamo, M. & Ruwhiu, D. — [What Determines the Bottom Line for Māori Tourism SMEs?](https://www.researchgate.net/publication/287137920_What_Determines_the_Bottom_Line_for_Maori_Tourism_SMEs)

---

## 3. Current NZ landscape, for context

Snapshot as of 2 July 2026 — re-verify before citing any of this in an actual research finding, since
this document is scoped as a process argument, not a sourced research piece in its own right.

- **Section 7AA of the Oranga Tamariki Act was repealed** by the Oranga Tamariki (Repeal of Section
  7AA) Amendment Act 2025 (2025 No 20), which passed its third reading on 3 April 2025, received Royal
  assent on 7 April 2025, and came into force on 8 April 2025 per its own commencement clause. It
  replaces the 2019 disparity-reduction/whakapapa provision with a narrower Section 7 requiring only
  that OT's CE "develop strategic partnerships with iwi and Māori organisations."
  ([New Zealand Legislation — Oranga Tamariki (Repeal of Section 7AA) Amendment Act 2025](https://www.legislation.govt.nz/act/public/2025/0020/latest/whole.html))
- **A live privacy matter**: the Privacy Commissioner issued a public Compliance Notice to Oranga
  Tamariki on 28 May 2025, following an April 2024 independent review confirming "systemic failures in
  protecting sensitive personal information," with improvement deadlines running October 2025 through
  31 March 2026. ([Privacy Commissioner](https://www.privacy.org.nz/news/statements-media-releases/privacy-commissioner-issues-compliance-notice-to-oranga-tamariki/))
- **Frameworks any stream could draw from**: Ngā Tikanga Paihere (Stats NZ's 10-tikanga
  self-questioning framework for data practice); Te Mana Raraunga, the independent Māori-led Data
  Sovereignty Network (est. 2015, tied to UNDRIP). These are starting points, not a complete map — see
  §5 for what's unverified.

This section is illustrative context for why the reframing in §1 matters in practice, not a claim that
this document has done the research a real stream on this topic would need.

---

## 4. What to action next

Proposed, not decided — these are for the working group or relevant stewards to pick up:

1. **Adopt the three lenses as a default checklist item** in `CONTRIBUTING.md` or `docs/METHOD.md`,
   so a contributor framing any new stream is prompted to apply them, rather than needing to
   rediscover the need. This is the change that would make the reframing in §1 actually binding rather
   than just on record.
2. **Open a Discover issue** for a Te Tiriti / Māori data-governance workstream specifically, distinct
   from applying the lens to every other stream — the two are complementary, not substitutes. A
   dedicated workstream can go deeper than any individual stream's lens-check would.
3. **Revisit stream #4** (family/child entitlement navigation) and its research issues against Lens A
   and B, since it's the one live child-welfare-adjacent stream today and hasn't had this applied yet.

None of this is enacted by merging this file — each needs its own PR, issue, or gate decision per
[`docs/STREAMS.md`](../docs/STREAMS.md).

---

## 5. Confidence & limits

**What's verified.** The absence of any open issue mentioning Te Tiriti, Māori, iwi, or data
sovereignty was checked directly via `gh search issues` against the live repo on 2 July 2026 — high
confidence at that snapshot, but this will drift as new issues are opened. It already has: issue #104
was opened later the same day as the direct result of this analysis (see §1, §4). The Treaty principles in
Lens A and the value definitions in Lens B are drawn from public, government-run sources (Te Ara,
Auckland Council, digital.govt.nz) with no reproduction restriction — high confidence in the sourcing,
medium confidence that this is a *complete* list of principles, since no single canonical list exists
across the case law.

**What's interpretation, not fact.** The claim that the trigger-condition framing in the existing gap
analysis is itself the deeper problem is this document's argument, not a sourced fact — it's offered
for the working group to weigh, not presented as settled. The examples in §1 (council-spending and
supermarket-pricing Treaty dimensions) are illustrative reasoning, not findings from actual research
into those streams.

**What's unverified.** The Oranga Tamariki-related items in §3 were sourced via web search and one
direct fetch each; some related material (a 2024 data-misuse allegation involving Whānau Ora
Commissioning Agency, Waipareira Trust, and Manurewa Marae, and Cabinet Office guidance CO(19)5) could
not be independently verified due to bot-blocked fetches, and would need the browser-fetch escalation
path (per `AGENTS.md`) before being cited in a real research finding rather than background context.

**What would change this document's conclusion.** If the working group determines the existing
trigger-condition framing was intentional — e.g., a deliberate choice to concentrate limited steward
attention on the highest-stakes streams rather than spread a lighter check across all of them — that
would be a reasonable counter-argument this document doesn't fully address, and would be worth its own
response rather than a silent revision here.
