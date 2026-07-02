---
name: triage-task
description: Use when deciding what For Good work to pick up — scores a task's priority, value, and token cost and returns a Do-now / Good-ROI / Defer / Skip verdict. Invoke against an issue number, the open `queue`, or a free-text task idea. Advisory only: it never claims issues, writes labels, or changes automation.
---

# Triage a task: priority × value × token cost

Help a human or an agent decide **what's worth doing next** in The For Good Project — and whether a given task is a good use of scarce, donated tokens. This is the missing "biggest bang per token" read: today the repo's only priority signal is the binary `priority: high` label + oldest-first ordering ([`scripts/fg-common.sh`](../../../scripts/fg-common.sh)). This skill adds a transparent, judgement-based scorecard on top.

**This skill is advisory and ephemeral.** It produces a *read*, nothing more. It MUST NOT claim issues, add/remove labels, reorder the queue, edit the issue, or write any file. Those are out of scope by design (see "Non-goals"). A human or agent looks at the scorecard and decides.

## When to use

- An agent (or the `start_work.sh` autopilot operator) is choosing which issue to work.
- A contributor with spare tokens wants the best value-per-token task, not necessarily the most urgent.
- Someone has a rough problem idea and wants to sanity-check it *before* opening an issue.
- A maintainer is triaging the backlog and wants a quick, auditable ranking.

## How it's invoked

You'll be pointed at one of three things:

| Input | Do this |
|---|---|
| **An issue number** (e.g. `#123`) | Score that one task → one scorecard. |
| **`queue`** | Score every open `status: available` issue, then print a ranked table. |
| **A free-text task** (a sentence or paragraph) | Score the idea as if it were an issue; note what's unknown because it isn't written up yet. |

If the input is ambiguous, ask once which of the three is meant, then proceed.

## Step 1 — Gather context before scoring

Never score from the title alone. Read enough to justify each number:

1. **Read the issue and its chain.** Open the issue, its parent (`Part of #…`), and any linked findings.
   ```
   gh issue view <n> --repo thecolab-ai/the-for-good-project --json number,title,body,labels
   ```
2. **Check for duplicates.** Grep existing findings for overlap — this drives the "net-new" score:
   ```
   grep -rli "<key terms>" research/findings/ solutions/
   ```
3. **Check data accessibility.** Is there a `.skills/` CLI for the data this needs (Stats NZ, councils, charities, etc.)? `ls .skills/skills` (the submodule is uninitialised on a fresh clone — run `git submodule update --init` first if it's empty; see AGENTS.md). If a matching skill exists, cost drops; if it needs heavy browser-fetching of blocked govt sites, cost rises.
4. **Note the stage** (`stage: discover|research|ideate|build`) and whether `priority: high` is set.

For `queue` mode, gather the pickup-able work the same way `start_work.sh` does — **reworks first, then the available queue** — so the ranking can't miss the very items the autopilot works ahead of everything else (a `status: changes-requested` rework is the Priority anchor-5 case below). Then do a lighter pass per issue (title + body + labels + a quick dedupe grep) — you don't need to open every parent chain, but say so in the confidence line:
```
# reworks a reviewer sent back — start_work.sh picks these up before anything else
gh issue list --repo thecolab-ai/the-for-good-project --state open \
  --label "status: changes-requested" --json number,title,labels,assignees,createdAt --limit 100
# then the available queue
gh issue list --repo thecolab-ai/the-for-good-project --state open \
  --label "status: available" --json number,title,labels,createdAt --limit 100
```
Score both lists together into one ranked table; reworks naturally sort to the top via their anchor-5 priority. (Leave out `status: claimed` / `status: reviewing` / `status: in-review` — that work is already in flight.)

## Step 2 — Score the three axes

Score each sub-dimension **1–5 with a one-line justification**. The justifications matter as much as the numbers: a human must be able to overrule any single score without re-doing the whole thing. Use the anchors below to keep scores comparable between different contributors and agents.

### Priority — how much does this matter *now*?

| Score | Anchor |
|---|---|
| 5 | Rework a reviewer sent back (`status: changes-requested`, blocking a merge), **or** unblocks a human gate (G1/G2) a steward is waiting on. |
| 4 | Something else in the queue is blocked until this lands; a stream can't progress without it. |
| 3 | Normal queue item — no `priority: high`, nothing downstream blocked. |
| 2 | Useful but no time pressure; safe to sit. |
| 1 | Speculative; can wait indefinitely. |

> Floor rule: if `priority: high` is set, priority is **at least 4** (give it 5 only if it *also* matches an anchor-5 condition) — the maintainers have explicitly queue-jumped it.

### Value — is it worth doing well? (composite of four)

Score all four, then form a **holistic** value read (1–5) — usually near the average, but let a hard blocker dominate: tractability ≤ 2 or net-new ≤ 2 should drag value down regardless of the others (these also hard-override the verdict to 🔴 — see Step 3).

**a) Societal impact** — how many NZers × severity × vulnerability of the group.
- 5: large NZ population, high severity, vulnerable group (e.g. children, families missing entitlements, people in hardship).
- 3: meaningful but narrower population, or lower severity.
- 1: niche or low-stakes.

**b) Pipeline leverage** — does it move the *system*, not just itself?
- 5: unblocks a whole stream or feeds a G1/G2 gate; enables several downstream tasks.
- 3: feeds one specific downstream task.
- 1: isolated — nothing depends on it.

**c) Net-new vs duplicate** — will it survive review as additive?
- 5: genuinely new; nothing in `research/findings/` covers it.
- 3: partial overlap; meaningfully extends existing work.
- 1: largely duplicates an existing finding — likely rejected in adversarial review.

**d) Tractability / confidence** — can an agent finish it to the repo's standard?
- 5: answerable well with accessible, citable NZ sources (official data or a `.skills/` CLI).
- 3: answerable, but needs heavy verification or some hard-to-reach sources.
- 1: needs lived experience, legal authority, or data an agent can't access → **flag for a human**.

### Token cost — how much effort/tokens will a *good* result take?

Pick a band. This is an **estimate** — say so. Drivers: stage footprint, number of sources to gather and verify, how much browser-fetching of blocked sites, expected adversarial-review round-trips, and fan-out (does it need sub-issues?).

| Band | Shape | Rough magnitude |
|---|---|---|
| **S** | one narrow finding; data from one `.skills/` CLI or a few official sources; little fan-out. | a single focused session; ~one review pass. |
| **M** | standard research finding; several sources; some browser-fetching; one verification pass. | a substantial session; 1–2 review passes. |
| **L** | broad discover framing, **or** research needing heavy multi-source verification / some fan-out into sub-issues. | multiple sessions; may spawn sub-issues. |
| **XL** | a build project, **or** deep multi-source research spanning many sources; multiple review rounds likely. | many sessions; almost certainly splits into sub-issues. |

## Step 3 — Combine into a verdict

Return-on-tokens is **value relative to cost, gated by priority and hard-blocked by tractability/duplication.** These are heuristics, not a rigid formula — trust the justifications over the arithmetic, and explain any override. **Apply the rows top-down; the first match wins.**

| Verdict | Rule of thumb (checked in order) |
|---|---|
| 🔴 **Skip / needs a human** | tractability ≤ 2 (needs lived experience/legal authority/inaccessible data), **or** net-new ≤ 2 (duplicate), **or** value ≤ 2. *Checked first — a hard blocker overrides everything below.* |
| 🟢 **Do now** | value ≥ 4 **and** tractability ≥ 3 **and** (priority ≥ 4 **or** cost ≤ M); **or** priority 5 with tractability ≥ 3 (urgent rework / gate-unblocking work gets done even at moderate value). |
| 🔵 **Good ROI** | value ≥ 3 **and** cost ≤ M **and** tractability ≥ 3, not time-pressured. Ideal for spare-token contributors. |
| 🟡 **Defer / narrow** | real value but cost is L/XL **as currently scoped** — suggest a narrower slice or a sub-issue split (see [`AGENTS.md`](../../../AGENTS.md) "fan out chunky"). |

Checking 🔴 first is deliberate: a duplicate or an unanswerable question is not worth *any* tokens, however well it scores elsewhere.

**A verdict is a recommendation, not permission.** A 🟢 does not authorise skipping the claiming protocol, the `status: available` requirement, or the human gates — the normal [`AGENTS.md`](../../../AGENTS.md) flow still applies. A well-scored free-text idea still enters as a Discover/problem issue; an agent must **never** self-open an ideate or build issue (those are human gates G1/G2 — AGENTS.md forbids it).

## Step 4 — Output

### Single-task format

The header carries stage, **live status**, and the priority flag — so a reader sees at a glance whether the issue is already claimed or in review before acting on the verdict.

```
## Triage: #123 — Map which NZ councils publish rates data as open CSV
Stage: research  ·  status: available  ·  priority:high: no
(illustrative example — a fictional issue, not live repo state)

Priority    ▮▮▮▯▯  3/5 — normal queue item, nothing downstream blocked yet.
Value       ▮▮▮▮▯  4/5
  · Societal impact    4 — council transparency touches every ratepayer.
  · Pipeline leverage  4 — feeds a civic-transparency stream toward its G1 gate.
  · Net-new            4 — no existing finding maps council open-data formats.
  · Tractability       4 — council + LINZ + LGOIMA sources are public and citable.
Token cost  M — several official sources; light browser-fetching; one verification pass.

Verdict: 🔵 Good ROI
Why: strong, additive value at moderate cost; not urgent, so a great spare-token pickup.
Confidence & limits: scored from the issue body + a dedupe grep; token cost is an estimate;
  impact severity is inferred, not measured.
```

### Queue format

Score each issue, then a table sorted by verdict (🟢→🔵→🟡→🔴), then by value desc, then cost asc:

```
| Issue | Verdict | Priority | Value | Cost | One-liner |
|-------|---------|----------|-------|------|-----------|
| #124  | 🟢 Do now   | 5 | 4 | M | rework a reviewer sent back — unblocks a merge |
| #123  | 🔵 Good ROI | 3 | 4 | M | additive council open-data finding |
| ...   | ...     | ... | ... | ... | ... |
```
Follow the table with a single confidence line covering the whole pass (e.g. "light pass — titles/bodies/labels + dedupe grep, parent chains not fully opened").

## Step 5 — The honesty line is mandatory

Every scorecard (single or queue) ends with a **Confidence & limits** line. This matches the project's core rule (be honest about what you don't know — [`CONSTITUTION.md`](../../../CONSTITUTION.md) Article III). State:
- what you scored on thin information (e.g. a vague issue body),
- which numbers are estimates (token cost always is),
- anything that means a human should look before acting (especially a low tractability score).

A scorecard that says *"impact unknown — the issue doesn't say who's affected"* is more useful than a confident fake number. Do not manufacture precision.

## Non-goals (Phase 1 — do not do these)

Keep this skill purely advisory. **Do not**:
- write scores to labels or issue frontmatter,
- reorder or filter the queue for the runner scripts,
- claim, assign, or edit the issue,
- add a scoring *script* or new machinery.

Each of those is a Phase-2 change to how work is *selected* and would need its own ADR ([`docs/adr/`](../../../docs/adr/README.md)) — the priority system is deliberately simple today, and changing it is a governance decision, not a skill edit.

## Maintaining this skill (for contributors)

This rubric is meant to evolve — but keep these invariants so scores stay comparable and trustworthy across the many people and agents who'll use it:

- **Every score keeps its one-line justification.** The audit trail is the point; a bare number is not overrulable.
- **Keep the anchors concrete.** If you retune a scale, re-anchor it with an example so two agents still land close on the same task.
- **Stay advisory.** If you want scores to actually drive selection (labels, queue order, auto-claim), that's a Phase-2 automation change — open an ADR first, don't smuggle it into this skill.
- **Keep it self-contained.** No dependency on any one contributor's session or environment beyond `gh`, `grep`, and the repo itself.
- **Prefer honesty over coverage.** If a dimension can't be judged from available info, score it low-confidence and say why rather than guessing.
