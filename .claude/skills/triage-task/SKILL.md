---
name: triage-task
description: Use when deciding what For Good work to pick up — ranks available streams first, then ranks children within a chosen stream by dependency and value-per-token. Advisory only: it never claims issues, writes labels, or changes automation.
---

# Triage work: stream priority, value, and token cost

Help a human or an agent decide **which stream is worth capacity next**, and
then which child inside that stream is the best pickup. The repo's executable
queue contract stays deliberately simple: `start_work.sh` sorts issues with
`priority: high` before oldest-first via [`scripts/fg-common.sh`](../../../scripts/fg-common.sh).
That label is now a **stream-root priority** inherited by children, not a
reason to compare siblings against each other.

**This skill is advisory and ephemeral.** It produces a *read*, nothing more.
It MUST NOT claim issues, add/remove labels, reorder the queue, edit the issue,
or write any file. A human or agent looks at the scorecard and decides.

**Ratification guard.** Adding or materially changing this rubric is project
workflow guidance, so an agent review alone does not adopt it. Treat the
rubric as proposed until the PR introducing or changing it has explicit human
maintainer approval. Even after ratification, it remains optional advice; it
does not change the queue contract, labels, runner scripts, or human gates.

## When to use

- An agent or `start_work.sh` operator is choosing which work to pick up.
- A contributor with spare tokens wants the best value-per-token stream, not
  necessarily the oldest issue.
- A maintainer is triaging streams and wants a quick, auditable ranking.
- Someone has a rough problem idea and wants to sanity-check it before opening
  an issue.

## How it's invoked

You'll be pointed at one of four things:

| Input | Do this |
|---|---|
| **`queue`** | Default stream mode: rank pickup-able streams against each other, and show each stream's next best child. |
| **A stream** (e.g. `stream:4` or `Stream #4`) | Within-stream mode: rank that stream's pickup-able children by dependency, then value-per-token. |
| **An issue number** (e.g. `#123`) | Score that one task using its stream's inherited priority; do not compare it to siblings unless asked. |
| **A free-text task** | Score the idea as if it were an issue; note what's unknown because it isn't written up yet. |

If the input is ambiguous, ask once which of the four is meant, then proceed.

## Step 1 — Gather context before scoring

Never score from the title alone. Read enough to justify each number:

1. **Read the issue and its chain.** Open the issue, its parent (`Part of #…`),
   its stream root (`stream:<n>`), and any linked findings.
   ```
   gh issue view <n> --repo thecolab-ai/the-for-good-project --json number,title,body,labels
   ```
2. **Read the stream root before judging priority.** Priority is set on the
   Discover/root issue and inherited by children via `stream-sync.yml`. A child
   may carry `priority: high`, but that is an inherited stream signal, not its
   own private score.
3. **Check for duplicates.** Grep existing findings and solutions for overlap:
   ```
   grep -rli "<key terms>" research/findings/ solutions/
   ```
4. **Check data accessibility.** Is there a `.skills/` CLI for the data this
   needs (Stats NZ, councils, charities, etc.)? If a matching skill exists,
   cost drops; if it needs heavy browser-fetching of blocked government sites,
   cost rises.
5. **Note the stage and status** (`stage: discover|research|ideate|build`,
   `status:*`) and whether the issue is a rework assigned to you.

For `queue` mode, gather pickup-able work the same way `start_work.sh` does:
your assigned `status: changes-requested` reworks first, then every open
`status: available` issue.

```
# your reworks a reviewer sent back — start_work.sh picks these up first
gh issue list --repo thecolab-ai/the-for-good-project --state open \
  --label "status: changes-requested" --assignee "@me" \
  --json number,title,body,labels,assignees,createdAt --limit 100

# then the available queue
gh issue list --repo thecolab-ai/the-for-good-project --state open \
  --label "status: available" \
  --json number,title,body,labels,createdAt --limit 100
```

Group non-rework issues by `stream:<n>`. If an otherwise eligible issue lacks a
stream label, score it as an "unstreamed" item and flag the missing bookkeeping
in the confidence line. For queue mode, a light pass is acceptable (title,
body, labels, root, quick dedupe grep); say so.

## Step 2 — Score the axes

Score each sub-dimension **1-5 with a one-line justification**. The
justifications matter as much as the numbers: a human must be able to overrule
any score without re-doing the whole thing.

### Priority — the stream-level urgency signal

Priority is a **stream property**. All siblings in a stream inherit the same
priority, so `#151` and `#152` in Stream #4 cannot be separated on this axis.
Use dependency and value-per-token to break sibling ties.

Assigned rework is the one operational override: it is already blocking a PR
you authored, so it stays ahead of fresh work even though it is not a stream
priority decision.

| Score | Anchor |
|---|---|
| 5 | Your assigned rework a reviewer sent back (`status: changes-requested`), or work unblocking a human gate a steward is waiting on. |
| 4 | The stream root carries `priority: high`, or this stream is otherwise blocking multiple downstream tasks. |
| 3 | Normal stream — no root `priority: high`, nothing downstream blocked. |
| 2 | Useful stream, but no time pressure; safe to sit. |
| 1 | Speculative or not yet ratified as a stream. |

> Floor rule: if the **stream root** has `priority: high`, every child in that
> stream has priority at least 4. Give an individual child 5 only for the
> operational override above.

### Value — is this worth doing well?

For **stream mode**, score the stream as a whole. For **within-stream mode**,
score each child, but keep the priority value inherited from the root.

Score all four, then form a **holistic** value read (1-5). Usually it is near
the average, but let a hard blocker dominate: tractability <= 2 or net-new <= 2
should drag value down regardless of the others.

**a) Societal impact** — how many NZers x severity x vulnerability.
- 5: large NZ population, high severity, vulnerable group.
- 3: meaningful but narrower population, or lower severity.
- 1: niche or low-stakes.

**b) Pipeline leverage** — does it move the system, not just itself?
- 5: unblocks a whole stream, a G1/G2 gate, or several downstream tasks.
- 3: feeds one specific downstream task.
- 1: isolated — nothing depends on it.

**c) Net-new vs duplicate** — will it survive review as additive?
- 5: genuinely new; nothing in `research/findings/` or `solutions/` covers it.
- 3: partial overlap; meaningfully extends existing work.
- 1: largely duplicates existing work — likely rejected in adversarial review.

**d) Tractability / confidence** — can an agent finish it to standard?
- 5: answerable well with accessible, citable NZ sources or a `.skills/` CLI.
- 3: answerable, but needs heavy verification or hard-to-reach sources.
- 1: needs lived experience, legal authority, or inaccessible data — flag for a human.

### Token cost — what will a good result take?

In stream mode, estimate **whole-stream cost**: how much work remains before the
next meaningful gate or result. In within-stream mode, estimate the child issue
cost. Cost is always an estimate; say so.

| Band | Shape | Rough magnitude |
|---|---|---|
| **S** | One narrow finding or small workflow/doc change; few sources; little fan-out. | A single focused session; about one review pass. |
| **M** | Standard research finding or moderate workflow change; several sources/files; one verification pass. | A substantial session; 1-2 review passes. |
| **L** | Broad discover framing, multi-source research, or work likely to split into chunky sub-issues. | Multiple sessions; may spawn sub-issues. |
| **XL** | Build project or deep multi-source research with several review rounds likely. | Many sessions; almost certainly needs splitting. |

## Step 3 — Combine into a verdict

Return-on-tokens is **value relative to cost**, gated by stream priority and
hard-blocked by tractability/duplication. These are heuristics, not a rigid
formula. Apply rows top-down; the first match wins.

| Verdict | Rule of thumb |
|---|---|
| 🔴 **Skip / needs a human** | tractability <= 2, net-new <= 2, or value <= 2. A hard blocker overrides priority. |
| 🟢 **Do now** | value >= 4 and tractability >= 3 and (priority >= 4 or cost <= M); or assigned rework with tractability >= 3. |
| 🔵 **Good ROI** | value >= 3 and cost <= M and tractability >= 3, not time-pressured. |
| 🟡 **Defer / narrow** | real value but cost is L/XL as currently scoped — suggest a narrower slice or chunky split. |

A verdict is a recommendation, not permission. A 🟢 does not authorise skipping
the claiming protocol, pickup eligibility, or the human gates. A well-scored
free-text idea still enters as a Discover/problem issue; an agent must never
self-open an ideate or build issue.

## Step 4 — Output

### Stream queue format

For `queue`, output assigned reworks first if any, then a stream-ranked table
sorted by verdict (🟢 -> 🔵 -> 🟡 -> 🔴), then value desc, then cost asc.

```
Assigned reworks:

| Issue | Status | Verdict | Priority | Value | Cost | One-liner |
|-------|--------|---------|----------|-------|------|-----------|
| #124  | changes-requested (@me) | 🟢 Do now | 5 | 4 | M | assigned rework — unblocks a merge |

Available streams:

| Stream | Root priority | Verdict | Priority | Value | Whole-stream cost | Next best child | One-liner |
|--------|---------------|---------|----------|-------|-------------------|-----------------|-----------|
| #60 | high | 🟢 Do now | 4 | 4 | M | #143 | prioritised stream; next child has clear data path |
| #4  | normal | 🔵 Good ROI | 3 | 4 | L | #152 | meaningful child-welfare stream, but heavier verification |
```

Follow the table with a single confidence line covering the whole pass.

### Within-stream format

For a chosen stream, keep priority fixed and rank children by:

1. dependency: what unblocks the rest,
2. value-per-token,
3. oldest-created if still tied.

```
## Stream #4 — child/family support navigation
Stream priority: 3/5 — root has no `priority: high`; siblings share this.

| Issue | Status | Rank reason | Value | Cost | One-liner |
|-------|--------|-------------|-------|------|-----------|
| #151 | done | dependency first | 4 | M | safe-to-automate variables constrain any product path |
| #152 | claimed | value next | 4 | M/L | estimates aggregate unclaimed value once eligibility scope is clearer |

Resolution of #151 vs #152: they are same-stream siblings, so priority is a
tie by definition. Pick #151 first if both are available because the safety
constraints shape what an entitlement pre-check may ask; then pick #152 for
the value estimate.
```

### Single-task format

The header carries stage, live status, stream, and inherited priority.

```
## Triage: #123 — Map which NZ councils publish rates data as open CSV
Stage: research · status: available · stream: #60 · stream priority: high
(illustrative example — a fictional issue, not live repo state)

Priority    4/5 — Stream #60 root has `priority: high`; this child inherits it.
Value       4/5
  · Societal impact    4 — council transparency touches every ratepayer.
  · Pipeline leverage  4 — feeds a civic-transparency stream toward its gate.
  · Net-new            4 — no existing finding maps council open-data formats.
  · Tractability       4 — council + LINZ + LGOIMA sources are public and citable.
Token cost  M — several official sources; light browser-fetching; one verification pass.

Verdict: 🔵 Good ROI
Why: strong, additive value at moderate cost; not urgent outside its stream.
Confidence & limits: scored from the issue body + root labels + dedupe grep;
  token cost is an estimate; impact severity is inferred, not measured.
```

## Step 5 — The honesty line is mandatory

Every scorecard ends with a **Confidence & limits** line. State:

- what you scored on thin information,
- which numbers are estimates (token cost always is),
- whether parent/root chains were fully read,
- anything that means a human should look before acting.

A scorecard that says "impact unknown — the issue doesn't say who's affected"
is more useful than a confident fake number.

## Non-goals

Keep this skill purely advisory. **Do not**:

- write scores to labels or issue frontmatter,
- reorder or filter the queue for the runner scripts,
- claim, assign, or edit the issue,
- add a scoring script or new machinery.

Each of those would be a separate automation/governance change needing its own
ADR. The current design relies on root priority labels, stream-sync
propagation, and the existing runner sort.

## Maintaining this skill

Keep these invariants so scores stay comparable and trustworthy:

- **Every score keeps its one-line justification.**
- **Priority remains stream-level.** Siblings never differ on priority; they
  differ on dependency, value, tractability, and cost.
- **Keep the anchors concrete.**
- **Stay advisory.**
- **Keep it self-contained.** No dependency beyond `gh`, `grep`, and the repo.
- **Prefer honesty over coverage.**
