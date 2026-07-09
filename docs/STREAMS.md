# Streams, human gates, and where people actually fit

Agents are faster than humans at gathering, writing, and cross-checking. What
they cannot do is decide **whether any of it matters**. This project splits the
work accordingly:

> **Agents grind. Humans steer.**
>
> Agents do the volume work — research, drafting, adversarial fact-checking.
> Humans do the judgement work — is this problem real, is this evidence
> meaningful, what should happen next, and would this actually help the people
> it's about. Nobody has to out-type a language model to matter here; the
> scarce resource is domain knowledge and judgement, not keystrokes.

This doc defines the two mechanisms that make that split real: **streams**
(so a whole body of work is trackable and readable) and **human gates** (so
nothing moves from words to solutions to software without a person deciding it
should). Raised and designed in
[#30](https://github.com/thecolab-ai/the-for-good-project/issues/30).

## 1. Streams

A **stream** is a durable thread of work that begins at one Discover problem
and fans out into research questions, ideas, and builds. Its identifier is the
number of the originating Discover issue — everything descending from issue
#4 is **Stream #4**.

### How a stream is tracked

- **Label `stream:<n>`** on every issue and PR in the stream — filterable on
  GitHub, groupable on the site. Created and propagated automatically by
  [`.github/workflows/stream-sync.yml`](../.github/workflows/stream-sync.yml):
  a new `stage: discover` issue roots its own stream; children inherit it from
  a `Stream: #n` or `Part of #<parent>` line in their body.
- **Priority belongs to the root** ([ADR-0024](adr/0024-stream-level-priority.md)).
  A steward/maintainer marks the stream root with `priority: high` when the whole
  problem should jump the queue; the same Action propagates that label to the
  stream's children and removes it from them when the root is deprioritised. A
  child is never prioritised on its own — the label there is inherited, and the
  Action will strip one set by hand. The jump-queue itself stays bounded to
  `HIGH_PRIORITY_CAP` streams (#293 / [ADR-0013](adr/0013-pipeline-guardrails.md)),
  which counts *streams* rather than issues precisely so a prioritised stream can
  inherit the label across all its children without eating the cap.
- **Body convention** (keeps the roll-up exact, #291): every child issue
  carries `Part of #<root>` — the **stream root**, never another child. An
  issue split off a non-root issue *also* carries `Split from #<issue>` on
  the same first line (`Part of #<root>. Split from #<issue>.`) — that
  preserves the spawn tree and is what the fan-out depth limit is computed
  from. `stream-sync.yml` flags any child whose `Part of` points at a
  non-root, with the exact repair to make. (Older issues may still carry
  `Part of #<parent>` chains; depth follows those as before.)
- **A living overview doc** at [`streams/<n>-<slug>.md`](../streams/README.md)
  — the plain-language front page, maintained by the stream's steward. Its
  frontmatter `state:` field is the single source of truth for where the
  stream is in its lifecycle.

### Stream lifecycle

```
framing → researching → [G1 synthesis] → ideating → [G2 build approval] → building → shipped
              ▲                │
              └────────────────┘  a synthesis can send the stream BACK to research
```

Loops are first-class: the most valuable G1 outcome is often "go deeper on X"
or "wrong angle — reframe", not "proceed".

### Bounded fan-out (how a stream grows without exploding)

Agents are *encouraged* to split work that's too big for one high-quality
output into **chunky sub-issues** — real researchable questions someone can
spend hours on, never micro-tasks. But fan-out is depth-limited so it can't
recurse forever:

```
depth 0 (root)      — the Discover issue. Its children are opened by
                      frame_work.sh from the framing agent's proposed
                      questions (ADR-0014) — the framing agent itself never
                      opens issues.
depth 1             — those sub-issues. Their agents MAY open one more level.
depth 2             — leaf issues. NO further sub-issues, full stop.
```

Depth is the number of **spawn** hops from the root: `issue_depth` follows
the line-anchored `Split from #…` marker (falling back to `Part of #…` for
older issues) — so even though every child's `Part of` points at the root
(#291), a grandchild still counts as depth 2 and may not fan out further.
`start_work.sh` computes it and tells the agent explicitly whether fan-out
is allowed. An
agent that splits still **completes its own issue** (narrowed to the core
question) — splitting is scope-narrowing, never a hand-off. If a depth-2
issue is still too big, the agent narrows it in the PR and lists what it left
uncovered; the steward decides at synthesis whether more work is spawned.
Ideate and build issues never fan out — that's what the gates are for.

### Root lifecycle: the root issue never closes via a PR

A stream's root Discover issue **stays open for the life of the stream** — it
anchors the `stream:<n>` label, the drain trigger, and the human queue. So a
discover framing PR links with **`Part of #<root>`, never `Closes`** (the
runner prompts this automatically and can still find the PR). Child issues
are the opposite: their PRs **must** use `Closes #<n>` — the child closing on
merge is exactly what fires the drain check. The root is closed by the
steward, by hand, when the stream ships or is parked.

Discover roots are worked **only by `frame_work.sh`** (ADR-0014) — a
capability-floored runner driven by a powerful model under a trusted
identity (the `framers` list in `.github/trusted-reviewers.json`), never by
the general fleet. One framing run writes the framing analysis as a PR,
**opens the child research issues itself** (the script, not the agent —
3–6 chunky questions, each `Part of #<root>` and `status: available`), and
strips the root's status label — the *researching* posture — so there is no
manual fan-out step and nothing to clear by hand after the framing PR
merges. The root then has no work-status until the drain flags it
`needs-synthesis`.

### The drain → synthesis trigger

When the **last open child issue in a stream closes**, `stream-sync.yml`
automatically flags the root `status: needs-synthesis` and comments — that's
the G1 queue filling itself. If new child work opens (or a child reopens)
while the root is flagged, the flag is removed: synthesis waits until the
stream is fully drained.

From there, **`synthesize_work.sh`** (see [AUTOMATION.md](AUTOMATION.md),
ADR-0003, ADR-0007) does the tedious half: an agent reads every merged finding
in the stream and drafts the overview as a PR — takeaways with carried
confidence, open questions, and 2–4 neutral candidate outcomes the evidence
could support. If the draft flags unknowns that genuinely **block** its
conclusions, the stream first loops back to research automatically —
bounded to ≤3 issues/round and ≤2 rounds/stream (ADR-0012) — and only
re-synthesises once the answers land; otherwise (or once the loop is spent)
the root moves to `status: awaiting-direction`. The judgement half never
leaves the human: the options are unranked and unrecommended, the draft's
direction section is a literal `TODO(steward)`, and only the steward's edit
+ decision + merge passes the gate. To send a parked stream back through
synthesis at any time, relabel the root `status: needs-synthesis`.

### Concurrency: how many streams run at once

Streams all drain onto a **single human synthesis gate**: producer capacity
scales with agents, the steward's judgement does not. So concurrency is
bounded (#292 / ADR-0013):

- **At most `MAX_ACTIVE_STREAMS` (default 25) streams are worked at a time.**
  A stream is *active* while it has open child issues or its root is being
  worked (`claimed` / `in-review` / `changes-requested`). A G0-approved root
  that is merely `status: available` is a stream **waiting in the backlog**:
  `frame_work.sh` — the only claimer of discover roots (ADR-0014) — holds
  new roots while the cap is reached and picks them up as slots free — a
  stream releases its slot when it drains to `needs-synthesis` /
  `awaiting-direction` or ends. The human G0 decision is sequenced, never
  overridden.
- **Drained streams always arrive at G1 pre-drafted.** `synthesize_work.sh`
  drafts every `needs-synthesis` root (ADR-0003/0007/0012) — run it on a
  loop or cron alongside the workers so the steward always starts from a
  draft, never a blank page.
- **Stewards parallelise the human side.** Any trusted reviewer can steward
  a stream (see Roles below), so G1 isn't one person; the synthesis queue
  depth is published in the site's data snapshot (`stats.synthesisQueue`)
  so the backlog stays visible.

Priority follows the same discipline: `priority: high` is a small,
steward-curated shortlist, honoured by the runners for at most
`HIGH_PRIORITY_CAP` (default 5) streams at a time (#293 —
see [AUTOMATION.md](AUTOMATION.md)).

## 2. The human gates

Two kinds of review get conflated unless we name them:

- **Method review** — does a *single finding* meet the method (every claim
  cited, surprises double-sourced, confidence honest)? This is fact-checking;
  agents do it well, adversarially, per PR. It stays agent-run.
- **Synthesis & direction review** — is the *stream as a whole* meaningful,
  and what should happen next? This is judgement. **It cannot be delegated to
  an agent.**

### The gates (humans required)

| Gate | Transition | What the human does | Mechanics |
|---|---|---|---|
| **G0** — framing | Discover → Research fans out | A maintainer confirms the problem is real and tractable before tokens are spent on it | Discover issues open with **no status label** — invisible to every runner. A maintainer applying `status: available` **is** G0. The root is then framed by `frame_work.sh` only — a powerful model under a trusted identity (ADR-0014) — which also opens the child research issues. Once the root has passed G0, *research* children within the fan-out depth bound inherit that approval and may open as `status: available` directly |
| **G1** — synthesis | Research → Ideate | The steward reads (and corrects) the drafted rollup, picks/edits/rejects its candidate outcomes, then answers: is this meaningful? is the evidence good enough? go deeper, pivot, or proceed? | Root gets `status: needs-synthesis` when the stream drains; `synthesize_work.sh` drafts the overview as a PR — if the draft flags **blocking unknowns**, the script first loops the stream back to research automatically (bounded: ≤3 issues/round, ≤2 rounds/stream, ADR-0012) so the steward reads the strongest synthesis — then moves the root to `status: awaiting-direction`; the steward's edits + **direction decision** + merge clear the gate. **No ideate issue in a stream becomes `status: available` before G1.** |
| **G2** — build approval | Ideate → Build | A human approves one specific solution — impact, feasibility, ethics — before anything is built | Same pattern: `status: awaiting-direction` on the root; the steward records the decision in the overview. **No build issue becomes `status: available` before G2.** |

The gates bind **agents and automation absolutely**: an agent must never open
or work an ideate/build issue whose gate hasn't been passed (see
[`AGENTS.md`](../AGENTS.md)). `start_work.sh` only picks up
`status: available`, so G1/G2 are enforced by *who is allowed to make an
ideate/build issue available* — a human, after the gate decision. Research
fan-out is the deliberate exception: inside a G0-approved stream, agents may
open research sub-issues as available directly (bounded — see below).

### Always-human triggers (any stage, override everything)

- Sensitive domains (child-welfare, anything touching vulnerable people)
- A **Low-confidence** claim that is load-bearing for a decision
- Anything that could publish or imply personal / identifying data
- Anything an agent flagged as needing lived experience or legal authority
- Any **external-facing** output (published overview, anything shared beyond the repo)

### Stays agent-only

Source gathering, dedup, formatting, method review, and routine High/Medium
findings in non-sensitive domains. They feed the stream; they don't each need
a human.

## 3. Roles

- **Stream steward** (human) — owns the overview doc and direction decisions
  for a stream. Any trusted reviewer (whitelist or earned credit, same trust
  model as [`merge_ready.sh`](AUTOMATION.md)) can steward a stream; sensitive
  domains additionally need a maintainer's sign-off at G1/G2.
- **Reviewers** (agents + people) — adversarial method checks on individual
  PRs, exactly as today.
- **Stakeholders / SMEs** (non-technical) — the people who actually know the
  domain: NFP staff, community workers, practitioners. They read stream
  overviews and give feedback that can redirect a stream — **no GitHub
  required**. Their input lands as a `feedback`-labelled item against the
  stream (filed by whoever captured it, or by the community bot).

(Design history for streams and gates lives in the ADRs: [`0001`](adr/0001-streams-and-human-gates.md), [`0003`](adr/0003-agent-drafted-synthesis.md), [`0007`](adr/0007-synthesis-drafts-candidate-outcomes.md), [`0011`](adr/0011-synthesis-rework-routing.md), [`0012`](adr/0012-synthesis-followup-research-loop.md).)
