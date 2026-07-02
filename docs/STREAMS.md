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
- **Body convention** (keeps the tree, not just the tag): every child issue
  carries `Part of #<parent>` (immediate parent) and, when the parent isn't the
  root, `Stream: #<root>`.
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
depth 0 (root)      — the Discover issue. Its agent MAY open sub-issues.
depth 1             — those sub-issues. Their agents MAY open one more level.
depth 2             — leaf issues. NO further sub-issues, full stop.
```

Depth is the number of `Part of #…` hops from the root; `start_work.sh`
computes it and tells the agent explicitly whether fan-out is allowed. An
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
steward, by hand, when the stream ships or is parked. (After a framing PR
merges, clear the root's `status: in-review` label by hand — the root then
has no work-status until the drain flags it `needs-synthesis`.)

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
could support — and the root moves to `status: awaiting-direction`. The
judgement half never leaves the human: the options are unranked and
unrecommended, the draft's direction section is a literal `TODO(steward)`,
and only the steward's edit + decision + merge passes the gate.

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
| **G0** — framing | Discover → Research fans out | A maintainer confirms the problem is real and tractable before tokens are spent on it | Discover issues open with `needs-triage`; removing it **is** G0. Once the root has passed G0, *research* children within the fan-out depth bound inherit that approval and may open as `status: available` directly |
| **G1** — synthesis | Research → Ideate | The steward reads (and corrects) the drafted rollup, picks/edits/rejects its candidate outcomes, then answers: is this meaningful? is the evidence good enough? go deeper, pivot, or proceed? | Root gets `status: needs-synthesis` when the stream drains; `synthesize_work.sh` drafts the overview as a PR and moves the root to `status: awaiting-direction`; the steward's edits + **direction decision** + merge clear the gate. **No ideate issue in a stream becomes `status: available` before G1.** |
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

## 4. Decisions made (from #30's open questions)

1. **`stream:<n>` label + body convention**, not Projects/milestones — least
   friction, queryable, and the Action removes the bookkeeping burden.
2. **Stream state lives in the overview doc's frontmatter** (single source of
   truth). The label taxonomy stays small; the human work queue is driven by
   `status: needs-synthesis` / `status: awaiting-direction` on the root issue.
3. **Stewards**: trusted reviewers; maintainer co-sign for sensitive domains.
4. **Feedback channel**: WhatsApp → community bot first (that's where this
   community already is), web form later — split into its own issue.
5. **Agent-drafted synthesis**: deferred. The reviewer stays per-finding; if
   G1 proves heavy, an agent can *draft* the synthesis for the steward to
   edit — but the decision stays human.
