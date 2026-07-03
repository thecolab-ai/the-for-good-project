---
name: onboard-contributor
description: Use when a new person or their AI agent wants to start contributing to The For Good Project and asks how to claim work or where to begin. Gets them from zero to a running work loop with a single paste-this-to-your-agent block. The runner scripts own claiming, labels, PR routing, and review status transitions; this skill only helps someone run one correctly.
---

# Onboard a contributor: paste-this-and-go

The runner scripts already automate contributing here, so **do not hand-claim
issues or juggle status labels.** Run `./start_work.sh`; it claims available work, runs an agent in a
fresh throwaway git worktree, and moves the issue through the status lifecycle
described in [`docs/AUTOMATION.md`](../../../docs/AUTOMATION.md). For review,
run `./review_work.sh`; it reviews open PRs in fresh worktrees and owns the
adversarial-review check.

## When to use

- Someone new says "I've got write access, now what?" or "how do I actually
  pick up work?"
- A contributor wants to lend spare tokens or compute without micromanaging
  GitHub.
- You're helping a person configure Claude Code, codex, or hermes to work the
  queue.

## Choose the right path

| You have | Do this |
|---|---|
| Write/triage access plus a terminal and AI CLI | **Autopilot**: run `./start_work.sh` — the scripts do the claiming and PR routing for you. |
| Write access but no AI CLI | **Manual claim**: use the GitHub UI to assign yourself, move `status: available` to `status: claimed`, do one issue, and open a PR that says `Closes #<n>` unless the issue is a Discover stream root. |
| No write access | **Fork + PR**: follow [`AGENTS.md`](../../../AGENTS.md#no-write-access-most-contributors). You can still contribute, but the upstream queue runner cannot claim issues without permission. |

## Prerequisites

- `git`, `gh` authenticated with `gh auth status`, and `jq` on `PATH`.
- One agent CLI: `claude` (default), `codex`, or `hermes`.
- On macOS, install GNU `timeout` as `gtimeout` with `brew install coreutils`;
  without `timeout`/`gtimeout`, `AGENT_TIMEOUT` cannot stop a hung agent.
- For adversarial review of your own PRs, a second GitHub identity or GitHub
  App token with write access, supplied as `REVIEW_GITHUB_TOKEN`.

## The paste-this-to-your-agent block

```text
You're helping me contribute to The For Good Project
(github.com/thecolab-ai/the-for-good-project), a commons where people and AI
agents research real NZ social problems to a cited, honest standard.

Do this, checking with me only if something genuinely needs a human decision:
1. Confirm my tooling: git, gh (run `gh auth status`), jq, and one of
   claude/codex/hermes on PATH.
2. If I don't have the repo, clone it and cd in:
   gh repo clone thecolab-ai/the-for-good-project && cd the-for-good-project
   If I do not have write/triage access, follow AGENTS.md's fork + PR path
   instead; the upstream runner cannot claim issues without permission.
3. Read CONTRIBUTING.md, docs/METHOD.md, AGENTS.md, and docs/AUTOMATION.md.
   Follow the project method: cite every claim, verify surprising or
   load-bearing claims with two independent sources where possible, mark
   confidence High/Medium/Low, end with what would change the conclusion, never
   invent sources or publish personal data, and respect the human gates.
4. Run the work loop:
   ./start_work.sh
   It picks up your assigned rework first, otherwise claims the next available
   issue, creates a fresh worktree, gives the issue to the agent, and moves the
   issue to in-review once the PR is open. The script owns status labels,
   assignees, rework routing, and PR detection. Do not hand-edit labels or push
   anything past the adversarial review gate.

   Common options:
   - One task then stop:       MAX=1 ./start_work.sh
   - Only one stage:           STAGE=research ./start_work.sh
   - A specific CLI:           ./start_work.sh codex
   - A specific model:         ./start_work.sh codex --model gpt-5.5
   - Stop when queue is empty: POLL_SECONDS=0 ./start_work.sh
   - Dry run:                  DRY_RUN=1 ./start_work.sh
5. When it opens a PR, show me the PR URL and a two-line summary.
```

## To review instead of produce

Adversarial review must be by a **different identity than the PR author**:
branch protection requires a non-author approval, and `review_work.sh` refuses
to review a PR authored by the reviewer identity.

```bash
REVIEW_GITHUB_TOKEN=<second-account-or-bot-PAT-with-write> ./review_work.sh
```

`review_work.sh` claims an open PR with `review: claimed`, checks out the PR
head in a fresh worktree, asks the agent to review the change, posts the
review, sets the required `for-good/adversarial-review` status check, and
merges on PASS by default. Useful options:

```bash
REVIEW_GITHUB_TOKEN=<token> ./review_work.sh codex
REVIEW_GITHUB_TOKEN=<token> ./review_work.sh hermes --model <name>
REVIEW_GITHUB_TOKEN=<token> AUTO_MERGE=0 ./review_work.sh
PR=7 ./review_work.sh
MAX=1 POLL_SECONDS=0 ./review_work.sh
```

If you run without `REVIEW_GITHUB_TOKEN`, the script reviews as the currently
authenticated `gh` user and skips PRs authored by that same identity.

## What not to do

- Do not self-review; the script refuses it and branch protection blocks it.
- Do not hand-manage labels while the loop runs; the scripts and
  `issue-status.yml` own status transitions.
- Do not bypass the adversarial review gate or admin-merge your own work.
- Do not use the agent review loop on PRs labelled `review: human-only`; those
  are for human maintainers.
- Do not run `start_work.sh` on synthesis draft rework. Synthesis branches are
  routed through `synthesize_work.sh`.

## Non-goals

This skill only onboards contributors and points them at the existing runner
scripts. It does **not** change the queue contract, runner scripts, status
labels, review requirements, merge rules, or human gates. Those are governance
and ADR-level decisions, not a skill edit.
