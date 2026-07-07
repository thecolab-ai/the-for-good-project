# ADR-0022: Harden worker prompts against injection and implement sandboxed run defaults

- **Status:** proposed
- **Date:** 2026-07-07
- **Deciders:** Maintainers (Adam Holt)
- **Discussion:** [#686](https://github.com/thecolab-ai/the-for-good-project/issues/686) (security review of the fleet as public contributors onboard). Implements the host-default half of [ADR-0005](0005-agent-execution-environment.md).

## Context

This is a public repository. Anyone can open an issue or a fork PR, and that
text is read by the autonomous fleet. Two things made that dangerous:

1. **Untrusted text reached agents with no data/instruction boundary.** The
   worker prompt (`start_work.sh:work_prompt`) and the framing prompt
   (`frame_work.sh:framing_prompt`) spliced the issue title/body **raw** into the
   prompt, with no "this is data, not instructions" warning — even though the
   worker is the agent that holds write credentials and runs `git push` /
   `gh pr create` / `gh issue create`. The reviewer prompt already had that
   warning; the worker, the higher-privilege agent, did not.
2. **The agents ran with their own guardrails disabled.** `run_agent`
   (`fg-common.sh`) invoked Codex with `--dangerously-bypass-approvals-and-sandbox`
   and Claude with `--permission-mode bypassPermissions`, inheriting the launching
   user's full environment. A successful injection had the run user's full
   authority — including reading `~/.ssh`, the ambient `gh` token, and model keys,
   and exfiltrating them over the (necessarily open) research network.

[ADR-0005](0005-agent-execution-environment.md) already decided the fix for (2)
— "on the host, default to *sandboxed auto*, not blanket bypass" — but that
decision was never implemented in the runner; the code kept the bypass flags.
The one constraint ADR-0005 did not spell out: **research and review both need
network egress** (NZ official sources via the ADR-0006 fetch ladder), and
Codex's `workspace-write` sandbox disables network by default.

## Decision

**1. Fence untrusted input in every worker prompt.** `work_prompt`,
`framing_prompt`, and the two rework prompts now precede the quoted
issue/PR/review text with an explicit instruction that everything inside the
`== … ==` fences is PUBLIC, UNTRUSTED DATA — never instructions — and must not
be obeyed if it tries to change labels, merge, exfiltrate a token, or edit
`scripts/`, `.github/`, `AGENTS.md`, or an ADR. This mirrors the wording the
reviewer prompt already uses. Prompt-level defence is not a hard control, but it
brings the high-privilege worker up to at least the reviewer's bar and is free.

**2. Implement ADR-0005's host sandbox defaults in `run_agent`**, both
overridable via the existing env hooks:

- **Codex** → `--sandbox workspace-write --ask-for-approval never -c
  sandbox_workspace_write.network_access=true` (was
  `--dangerously-bypass-approvals-and-sandbox`). This is exactly ADR-0005's
  chosen flags, plus the `network_access=true` config the ADR omitted — without
  it, `workspace-write` blocks the network and research/citation fetches break.
  Writes are confined to the worktree + tmp; the sandbox is on. Override with
  `CODEX_FLAGS=`. Hook trust (`--dangerously-bypass-hook-trust`, ADR-0016) is a
  separate flag and is unchanged.
- **Claude** → `--permission-mode auto` (was `bypassPermissions`). `auto` was
  the maintainer's originally stated intent in ADR-0005's discussion ("we should
  be running on auto mode"); it was unavailable/unreliable then, so 0005 landed
  on `acceptEdits`. It is now available and is the better fit: it replaces
  per-action prompts with a classifier that blocks actions escalating beyond the
  request or "driven by hostile content Claude read" — the injection path here —
  while keeping the network, and without the headless hangs `acceptEdits` can
  hit. Override with `CLAUDE_PERMISSION_MODE=`.

We chose `auto` over `acceptEdits` (ADR-0005's fallback) because `auto` is
injection-aware and does not stall headless; we keep `bypassPermissions` as the
documented in-container override, where blast radius is the throwaway container.

## Consequences

**Positive**
- The worker and framing agents no longer take unfenced instructions from public
  text; all four privileged prompts now carry the same untrusted-data boundary.
- No naked "dangerous" flag as the host default. An injected Codex worker can no
  longer write outside the worktree or run unsandboxed; an injected Claude worker
  is checked by the `auto` classifier. Research network egress still works.
- Implements a decision (ADR-0005) that had been accepted but not shipped.

**Negative / costs**
- Prompt fencing is defence-in-depth, not a hard boundary — a sufficiently clever
  injection can still try. The real containment is the container + credential
  scoping still tracked in ADR-0005 and issue #686; this ADR does not deliver
  that.
- `auto` mode is fail-closed: it may occasionally block a legitimate action,
  reducing task completion. It's overridable per run.
- The Codex flags follow OpenAI's documented sandbox interface but were not
  runnable on the authoring machine (local Codex binary broken); they need a
  smoke-test on a working-Codex host before the new default is trusted fleet-wide.
  The `CODEX_FLAGS=` override is the fallback if a platform's container runtime
  can't provide Landlock.

**Tripwire** — revisit if `auto` mode blocks enough legitimate work that
contributors routinely set `CLAUDE_PERMISSION_MODE=bypassPermissions` outside a
container (defeating the purpose), or if the Codex network config key changes.

## Follow-ups (tracked in #686, not here)

- Containerise the worker (non-root, no host mounts, `HOME` scoped to the
  worktree) and minimise credentials injected into it — the ADR-0005 container
  half, the real blast-radius limiter.
- Path guard / CODEOWNERS forcing human review of PRs that touch `scripts/`,
  `.github/`, `AGENTS.md`, or `docs/adr/`.
- Gate `AUTO_MERGE` on author trust; stop fan-out sub-issues being born
  `status: available`.
