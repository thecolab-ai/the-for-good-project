# ADR-0014: Discover framing is reserved for a capability-floored runner that also opens the fan-out

- **Status:** proposed (implements the maintainer's direction in #379; accepted when the human maintainer merges the PR)
- **Date:** 2026-07-03
- **Deciders:** human maintainer (@adam91holt), via #379; drafted by an agent on his behalf
- **Discussion:** [#379](https://github.com/thecolab-ai/the-for-good-project/issues/379) · worked example [#370](https://github.com/thecolab-ai/the-for-good-project/issues/370) → framing PR [#372](https://github.com/thecolab-ai/the-for-good-project/pull/372) → children #373–#378 (opened manually that time) · related: [#368](https://github.com/thecolab-ai/the-for-good-project/issues/368) (G2 reviewer capability floor)

## Context

The first pickup of a stream root — restructuring a raw problem into a framed
set of testable questions and minting the child research issues — is the
highest-leverage, hardest-to-do-well step in the pipeline: every downstream
finding answers a question the framing chose. Stream #370 proved both the
value and the gaps. A strong model turned the founder's thesis into a cited,
hypothesis-graded framing plus a six-part research agenda (PR #372) — but
(1) any model could have claimed that root, because `start_work.sh`'s queue
treated discover like any other stage, and (2) the framing only *proposed*
the children, so the stream stalled at the fan-out gap until a human opened
#373–#378 by hand.

The constraint is the same one behind the reviewer capability floor (#368)
and the guardrails ADR (ADR-0013): model strength is not uniform across the
fleet, and the two moments where it matters most — framing a stream and
gating a merge — must not be left to whoever polls first. And per the
project's standing rule, agents grind but the *scripts* own every status
transition — so the fan-out step must be deterministic runner code, not
another thing an agent is trusted to do.

## Decision

We will route all discover-stage work through a dedicated runner with a
capability floor, and lock discover out of the general fleet:

1. **`frame_work.sh` is the only claimer of discover roots.** It picks up
   only `stage: discover` + `status: available` issues (honouring the
   `MAX_ACTIVE_STREAMS` backlog gate, which moves here from
   `start_work.sh`), runs the framing agent in a fresh worktree, and expects
   a framing analysis PR (`analysis/<slug>-framing.md`, branch
   `discover/<slug>`, `Part of #<root>` — roots never close via PR).
2. **The floor is an identity allow-list, fail closed.** `frame_work.sh`
   refuses to run unless the invoking GitHub identity is on the `framers`
   list in `.github/trusted-reviewers.json` (same file as the merge trust
   model and the `human_maintainers` list). Membership means "trusted to
   drive a top-capability model on framing"; it is edited via PR. We
   considered a model-name check instead, but a self-reported model string
   is unverifiable — an identity a human vouches for is the enforceable
   proxy, mirroring how review trust already works.
3. **The SCRIPT opens the children.** The framing agent proposes 3–6 chunky
   research questions in an uncommitted JSON side-file (the ADR-0012
   pattern); `frame_work.sh` — never the agent — opens them as
   `stage: research` / `status: available` / `stream:<n>` issues, capped at
   `FANOUT_MAX` (default 6) and deduped by title against the stream, each
   body carrying `Part of #<root>.` plus a provenance line. The stream never
   stalls at the fan-out gap.
4. **The root leaves the queue without a manual step.** After the PR and
   children exist, the script strips the root's status label entirely — the
   "researching" posture — replacing the old "clear `status: in-review` by
   hand after the framing PR merges" chore. If fan-out failed, the root
   parks at `in-review` with an explicit human callout instead.
5. **`start_work.sh` excludes discover completely** — from its claim queue
   (`STAGE=discover` now refuses to run), and from its rework paths: a
   sent-back framing PR (head branch `discover/*`) is routed to
   `frame_work.sh`'s own reconcile/rework loop, exactly as synthesis drafts
   route to `synthesize_work.sh` (ADR-0011). The capability floor applies to
   rework of a framing too. `review_work.sh` names `frame_work.sh` as the
   picker when it sends a framing back. Because that send-back flip replaces
   whatever status the root held, the post-rework restore is
   children-aware: open children → no status (researching); children all
   closed → `needs-synthesis` is put back (the drain gate's close events are
   spent and would never re-fire — without this a framing sent back after
   its stream drained would strand the stream before G1); no children →
   `in-review` with a human callout.
6. **Provenance is recorded three times**: agent + exact model in the
   framing doc's frontmatter (already enforced by `npm run validate` for
   `analysis/`), in the root's hand-off comment, and in every spawned
   child's body — so which model framed each stream is auditable.

Alternatives considered: keeping discover in `start_work.sh` behind a model
check (unverifiable, see above); having the framing agent open the child
issues itself (breaks "scripts own transitions", and #370 shows prompts
alone don't reliably produce the fan-out); a GitHub Action opening children
when a framing PR merges (couples fan-out to merge timing — the fleet would
idle for the review latency, and the runner already has the context to open
them immediately).

## Consequences

Easier: a weak model can no longer set a stream's direction — the framing
queue simply isn't visible to it; streams go from G0-approved to
fleet-workable in one framing run with no manual fan-out or label chores;
framing provenance is auditable per stream. Harder / accepted costs: framing
throughput is bounded by the small `framers` list (currently the
maintainer's own trusted identities) — G0-approved roots wait if no framer
is running; the children go `available` while the framing PR is still under
adversarial review, so a framing that review later overturns may have
already spent research tokens on its questions (bounded by the fan-out cap,
and judged worth it to keep streams moving); one more runner to operate.
One honest limit: like every runner
contract in this repo, the floor is **cooperative client-side enforcement**
— `frame_work.sh` checks the list in its own working tree, and nothing
server-side stops an identity with repo access from framing a root with raw
`gh`. The guard is against accident and default behaviour, not malice; the
audit trail (provenance in the doc, root comment, and children) is what
makes a bypass visible. Tripwires for revisiting: discover roots sitting
`available` for days because no framer ran (widen the list or schedule the
runner), or a pattern of framings overturned in review after their children
were worked (hold children until the framing PR merges instead).
