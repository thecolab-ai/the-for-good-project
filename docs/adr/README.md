# Architecture Decision Records (ADRs)

This repo is worked by many humans and many agents, across many context
windows. Decisions that live only in a chat thread, an issue comment, or
someone's memory get silently re-litigated — usually by an agent that can't
know the decision was ever made. ADRs fix that: **every significant decision
about how this project works gets a small, numbered, immutable record here.**

## When an ADR is required

Write one when a decision:

- changes **how the project itself works** — the pipeline, the gates, the
  review/merge model, the automation scripts' contracts, label taxonomy;
- adds or removes a **structural dependency** (a submodule, a required
  service, a data source the method depends on);
- would make a future contributor (human or agent) ask **"why is it like
  this?"** and not find the answer in the code.

Not required for: individual findings/solutions (the method covers those),
routine fixes, copy changes, or web styling.

## The rules

1. **Numbered and immutable.** `NNNN-short-slug.md`, next number in sequence.
   Once accepted, don't edit the decision — **supersede it** with a new ADR
   and mark the old one `Superseded by ADR-NNNN`.
2. **Short.** Context → Decision → Consequences. One screen is ideal. Link
   the discussion (issue/PR) rather than reproducing it.
3. **Proposed via PR** like everything else. An ADR merges under the same
   review gate as any change; `Status: accepted` once merged.
4. **Agents:** before proposing a structural change, read this directory. If
   your change contradicts an accepted ADR, your PR must include a
   superseding ADR that argues why — otherwise expect the review to refuse it.

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-streams-and-human-gates.md) | Streams + human gates: agents grind, humans steer | Accepted |
| [0002](0002-vendor-thecolab-skills-submodule.md) | Vendor `thecolab-ai/.skills` as a git submodule | Accepted |
| [0003](0003-agent-drafted-synthesis.md) | Agents draft the G1 synthesis; humans keep the decision | Accepted |
| [0004](0004-analysis-documents-and-rendered-companions.md) | Project analysis lives in `analysis/` | Accepted |
| [0005](0005-agent-execution-environment.md) | How & where we run the agents (containerise + sandboxed auto modes) | Accepted |
| [0006](0006-fetch-proxy-browser-management.md) | Fetch, proxy & browser management for research + citation checks | Accepted |
| [0007](0007-synthesis-drafts-candidate-outcomes.md) | Synthesis drafts candidate outcomes; the direction stays human | Accepted |
| [0008](0008-rework-handoff-and-runner-interrupts.md) | Rework hand-off routes by worked issue; reviewer crashes retry; runner interrupts stop the run | Accepted |
| [0009](0009-maintainer-escalation-handoff.md) | Agents hand off write-gated actions to maintainers via a documented escalation path | Accepted |
| [0010](0010-partner-network.md) | Track the partner / SME / advisory network in the open, behind a consent gate | Accepted |
| [0011](0011-synthesis-rework-routing.md) | Synthesis draft rework belongs to synthesize_work.sh; generic runners must not touch synthesis PRs | Accepted |
| [0012](0012-synthesis-followup-research-loop.md) | Blocking unknowns loop back to research automatically — bounded — before the G1 human gate | Accepted |
| [0013](0013-pipeline-guardrails.md) | Pipeline guardrails: bounded agent loops, one status at a time, human-held levers | Accepted |
| [0014](0014-discover-framing-capability-floor.md) | Discover framing is reserved for a capability-floored runner (frame_work.sh) that also opens the fan-out | Proposed |
| [0015](0015-autopilot-alternates-review-and-work.md) | autopilot.sh — one command alternates review and work, detects idle, and pulls latest main each cycle | Proposed |
| [0016](0016-fleet-telemetry-defaults-and-merge-heal.md) | Fleet telemetry counters on by default (logs opt-in at every client) + deterministic index-cascade merge-healing in the runners | Proposed |
| [0017](0017-server-orchestrated-pull-claim.md) | The fleet server arbitrates work claims for enrolled agents (pull-claim v1) | Proposed |
| [0018](0018-mirror-backed-runner-reads.md) | Runner queue reads come from the fleet server's mirror, not GitHub | Proposed |
| [0019](0019-orchestrated-review-dispatch.md) | The fleet server dispatches PR reviews to enrolled reviewers (kind: review) | Proposed |
| [0020](0020-adopt-stale-rework.md) | A stale changes-requested PR is adopted by a different worker (kind: rework) | Proposed |
| [0021](0021-author-agnostic-rework-reconcile.md) | reap routes ANY unaddressed change-request back to changes-requested, regardless of author | Proposed |
| [0022](0022-worker-injection-hardening-and-sandbox-defaults.md) | Harden worker prompts against injection + implement ADR-0005's sandboxed run defaults (Codex workspace-write+network, Claude auto) | Proposed |
| [0023](0023-self-report-is-a-claim.md) | A party's statement about itself is a claim, not confirmation (method check 3) | Proposed |
| [0024](0024-stream-level-priority.md) | Priority is a stream-level decision inherited by children | Proposed |

Start from [`TEMPLATE.md`](TEMPLATE.md).
