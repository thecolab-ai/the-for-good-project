# Working the project with agents

Four scripts let people put spare AI subscription tokens to work — one to *do*
the work, one to *review* it, one to *draft a stream's synthesis* for human
sign-off, and one for maintainers to *merge* what's passed. All are thin,
deterministic wrappers around your own `codex`, `claude`, or `hermes` CLI:
**the scripts own every status change and the merge gate; the agent only does
the actual work.** That's deliberate — it's why tracking stays correct no
matter which agent runs or how it behaves.

## The status lifecycle

```
status: available ──claim──▶ status: claimed ──PR opened──▶ status: in-review ──review passes + merge──▶ status: done
        ▲                                                       │        ▲
        │                                                review says     │ author's next loop
        │                                                NEEDS_WORK      │ pushes the rework
        │                                                       ▼        │
        │                                              status: changes-requested
        └───────────── agent opened no PR (released) ◀─────────┘ (PR closed / gone)
```

`start_work.sh` moves `available → claimed → in-review` (and
`changes-requested → in-review` after rework). `review_work.sh` records reviews
and flips `in-review → changes-requested` on a NEEDS_WORK verdict, which routes
the work back to its **author**: the issue stays assigned to them, and their
next `start_work.sh` loop picks it up before any new issue. `merge_ready.sh`
(maintainer) merges what qualifies → `done`. No agent is trusted to set these
itself.

### Worktrees & fresh main

Every task — new work, rework, and review — runs in a **throwaway git worktree**
created at that moment from a fresh `git fetch` (from `origin/main` for new
work, from the PR head for rework/review). Your clone is never checked out,
reset, or dirtied, and every loop starts from up-to-date `main` by
construction. Worktrees are removed when the task finishes.

## `start_work.sh` — do the work

Works your queue in priority order: **first any of your own PRs a reviewer sent
back** (`status: changes-requested`, assigned to you), then the next available
issue. Runs your agent on it following the project method, and moves it to
**in review** once the agent opens (or updates) a PR.

```bash
./start_work.sh                 # work the queue until it's empty (default agent: claude)
./start_work.sh codex           # use `codex exec` instead
./start_work.sh hermes          # use `hermes chat` instead
./start_work.sh --model <name>  # override the agent model
./start_work.sh codex --model gpt-5.5
HERMES_PROFILE=reviewer ./start_work.sh hermes
STAGE=research ./start_work.sh  # only pick up research-stage issues
MAX=1 ./start_work.sh           # one issue, then stop
DRY_RUN=1 ./start_work.sh       # show what it would do, change nothing
```

The agent can be given as a positional word (`claude`, `codex`, or `hermes`)
and the model via `--model <name>`; both override the `AGENT` / `MODEL` env
vars. `claude` is the default. Hermes also honours `PROVIDER`,
`HERMES_PROFILE`, and `HERMES_FLAGS`.

For a **new issue** it claims (assigns you + `status: claimed`), creates a fresh
worktree from `origin/main`, hands the issue to the agent with the method baked
into the prompt, then finds the PR the agent opened (via GitHub's closing-issue
link) and flips the issue to `status: in-review`. If the agent opened no PR,
the issue is released back to `available`.

For **rework** it checks out the PR branch in a fresh worktree, feeds the agent
the reviewer's feedback (review bodies + inline comments), and — once the agent
has pushed to the same branch — flips the issue back to `status: in-review` so
a reviewer picks it up again. If the agent pushed nothing, the issue stays
`changes-requested` and is retried next loop.

Each loop also **reconciles the rework queue** first (ADR-0008): any open PR
you authored whose *current* latest review is a change-request (no commits
pushed after it) but whose worked issue still sits `in-review` gets flipped to
`changes-requested` — so reviews posted outside `review_work.sh` (a human,
another bot) or a hand-off lost to a reviewer crash still route back to you.
A freshly reworked PR awaiting re-review is left alone.

## `review_work.sh` — review before merge

**Every PR must pass an adversarial review, and the review may NOT be done by the
PR's author** — anyone else can pick it up. This script runs an agent (in a
fresh worktree of the PR head) whose job is to *refute* the work against the
method, then posts the review and sets the required
`for-good/adversarial-review` status check.

On **NEEDS_WORK** it requests changes on the PR *and* flips the linked issue to
`status: changes-requested`, sending it back to the author's own work loop. The
issue is resolved via the PR's closing ref **or** its `Closes`/`Part of #n`
body link (ADR-0008), so discover PRs — which deliberately have no closing ref
— are routed too. A PR that already failed review at its current revision is
skipped until the author pushes rework (`FORCE=1` to re-review anyway); once
new commits land, the next reviewer loop picks it up again.

If the review agent **crashes before writing a review**, that's a reviewer
tooling failure, not a PR verdict: the merge check is left unset (merge is
still blocked — the check never went green) so a later loop simply retries,
and at most one diagnostic comment is posted per head SHA (ADR-0008).

```bash
REVIEW_GITHUB_TOKEN=<bot-pat> ./review_work.sh              # review all open PRs
REVIEW_GITHUB_TOKEN=<bot-pat> AGENT=claude ./review_work.sh
REVIEW_GITHUB_TOKEN=<bot-pat> AGENT=hermes ./review_work.sh
REVIEW_GITHUB_TOKEN=<bot-pat> HERMES_PROFILE=reviewer AGENT=hermes ./review_work.sh
REVIEW_GITHUB_TOKEN=<bot-pat> AUTO_MERGE=1 ./review_work.sh # merge on PASS
PR=7 ./review_work.sh                                       # one PR
```

### `review: human-only` — keep a PR out of the agent loop

Some PRs must be reviewed by a **human maintainer**, not picked up by
`review_work.sh` runners: pipeline, governance, and other meta changes (the
review scripts themselves, merge rules, ADR statuses). Label them
`review: human-only` — agent reviewers skip the PR entirely (including the
`PR=<n>` path), and `merge_ready.sh` leaves it alone. The maintainer reviews
it and merges it themselves — as admin, or by setting the
`for-good/adversarial-review` check by hand. The label must be applied
**deliberately by a maintainer, never by a work agent**.

### The different-identity rule (important)

You cannot adversarially review your own work. The script **refuses** to review a
PR whose author is the reviewer identity, and branch protection **requires a
non-author approval** (GitHub blocks approving your own PR). So the reviewer has
to be a *distinct GitHub identity*. Pick one:

- **A bot / second GitHub account** with write access to the repo. Put its token
  in `REVIEW_GITHUB_TOKEN`; the script posts the review and approval as that
  account. This is the simplest local setup.
- **A GitHub App** installation token (App reviews count as a distinct actor).

> Note: running the reviewer in **CI** would work identity-wise (it'd review as
> `github-actions[bot]`, not the author), but the model tokens would then come
> from **one** secret on the repo — i.e. the owner pays for every review. That
> breaks the whole "collective's spare tokens" model, so review runs locally on
> contributors' own machines instead.

If you run `review_work.sh` with no `REVIEW_GITHUB_TOKEN`, it reviews as *you* and
skips any PR you authored — safe, but it won't help on your own PRs.

## `synthesize_work.sh` — draft the G1 rollup for a human

When a stream's last child issue closes, automation flags the root
`status: needs-synthesis` (see [`docs/STREAMS.md`](STREAMS.md)). This script
does the tedious half of that gate: it reads **every merged finding in the
stream** (found on disk via each finding's `issue:` frontmatter) and drafts
the plain-language overview in `streams/` — **as a PR for a human steward to
edit, decide direction on, and merge.**

```bash
./synthesize_work.sh                  # draft every flagged stream (default agent: claude)
./synthesize_work.sh codex            # use `codex exec` instead
STREAM=4 ./synthesize_work.sh         # target one stream root
MAX=1 ./synthesize_work.sh            # one stream, then stop
DRY_RUN=1 ./synthesize_work.sh        # print target + evidence + prompt, change nothing
```

The judgement stays human, structurally:

- The draft carries every takeaway's **confidence straight from its finding**
  (a Low is never laundered into a confident claim), and the *direction
  decision* is left as a literal `TODO(steward)` placeholder — the agent may
  add clearly non-binding "Signal:" bullets, nothing more.
- The draft also includes **2–4 candidate outcomes** ("What we could do about
  it", ADR-0007) — options derived strictly from the merged evidence, each
  linking its findings with carried confidence — presented **unranked and
  unrecommended**. Picking, editing, or rejecting them is the steward's
  direction decision.
- The PR links `Part of #<root>` (never `Closes` — the root stays open), and
  the **script** then moves the root `needs-synthesis → awaiting-direction`
  with a comment linking the draft.
- On a **re-synthesis** (stream drained again after more research) it updates
  the existing overview, preserving the steward, the feedback log, and prior
  dated direction entries.
- If there are **no merged findings on disk** it refuses to draft a hollow doc
  and asks a human on the root instead.

The steward finishes the gate by hand: edit the takeaways, fix any overreach,
**write the direction decision**, set `steward:`, merge — and if proceeding,
open the ideate issue as `status: available` (that act *is* passing G1).

## How a PR merges

The problem: GitHub only counts a review toward its native merge gate if the
reviewer has **write access** — which would mean non-admin contributors could
never get merged, and would push all the review cost onto admins. So the merge
decision doesn't live in GitHub's approval gate. It lives in **`merge_ready.sh`**,
a maintainer tool that reads the real review records plus a trust model.

The flow:

1. **Anyone** (any GitHub identity that isn't the author) runs `review_work.sh`
   on a PR → it submits a formal **APPROVED / CHANGES_REQUESTED** review with their
   own tokens. A read-only forker's review is *recorded* even though it doesn't
   count toward GitHub's native gate.
2. A **maintainer runs `merge_ready.sh`** — it scans open PRs and merges the ones
   that have enough *qualifying* reviews. No per-PR babysitting; it just merges the
   ready ones and reports the rest.

### `merge_ready.sh` — the merge gate

```bash
./merge_ready.sh            # dry run: report every PR's status, merge nothing
MERGE=1 ./merge_ready.sh    # merge the ones that qualify
PR=12 MERGE=1 ./merge_ready.sh
```

A PR qualifies when it has **≥ N** reviews where each review is:
- state **APPROVED**, and
- from someone who is **not** the author, and
- from a **trusted** reviewer — on the whitelist **OR** whose leaderboard credit
  (research + review points) is ≥ `min_reviewer_credit`.

Any CHANGES_REQUESTED from a trusted reviewer blocks it. `N` is `required_approvals`
(default 1), raised for sensitive domains. All of this is configured in
[`.github/trusted-reviewers.json`](../.github/trusted-reviewers.json) — edit it via PR:

```json
{
  "whitelist": ["alice", "the-review-bot"],
  "min_reviewer_credit": 15,
  "required_approvals": 1,
  "extra_approvals_for_domains": { "child-welfare": 2, "biosecurity": 2 }
}
```

This is the **whitelist-or-credit** model: a small trusted core plus anyone who's
earned enough credit can gate merges — so the reviewer pool grows with the
community, using the collective's own tokens, at no central cost. Nobody needs
write access to *review*; only maintainers (who run `merge_ready.sh`) need it to
*merge*, and the script makes that a one-command sweep, not a manual vetting job.

### Branch protection (the backstop)

`main` requires the `for-good/adversarial-review` status check and blocks direct
pushes. A write-access reviewer's `review_work.sh` sets that check on PASS (so
their PRs can auto-merge immediately); for everyone else, `merge_ready.sh` sets it
when it validates the trusted reviews and merges. Either way, nothing lands on
`main` without a recorded, non-author adversarial review behind it.

### Research credit vs review credit

The leaderboard scores two distinct things, so reviewing (the chore) is rewarded,
not just researching (the fun part):

- **Research** — findings authored, PRs merged, issues claimed, commits.
- **Review** — adversarial reviews given on PRs you did **not** author.

Both feed an overall total, but the Researchers and Reviewers boards are ranked
separately. If nobody reviews, the queue jams — so review points are how the
collective keeps itself unblocked.

## Cost & safety notes

- The agent runs with your local CLI auth (your subscription/tokens). `codex`
  runs with `--dangerously-bypass-approvals-and-sandbox`, `claude` with
  `--permission-mode bypassPermissions`, and `hermes` with `--yolo --source tool`
  by default so it can use git/gh unattended — run these on a repo clone you
  trust, not arbitrary input. Use `HERMES_PROFILE` to run a named Hermes profile,
  override additional Hermes options with `HERMES_FLAGS`, and use `MODEL` /
  `PROVIDER` to select a model or provider where supported.
- The reviewer fails **closed**: a review whose verdict isn't a clear
  `VERDICT: PASS` sets the check to failure. (A reviewer *crash* that produces
  no review at all leaves the check unset so a later loop retries — merge is
  still blocked either way; ADR-0008.)
- Set `AGENT_TIMEOUT` (seconds) to cap a runaway agent; `MODEL` to pick a model.
