# ADR-0005: How and where we run the agents (execution environment & permission modes)

- **Status:** accepted
- **Date:** 2026-07-02
- **Deciders:** Maintainers (Adam Holt), 2026-07-02
- **Discussion:** For Good WhatsApp, 2 July 2026 ("I don't like dangerously skip perms, we should be running on auto mode… we could try to containerise it") — [PR #99](https://github.com/thecolab-ai/the-for-good-project/pull/99)

## Context

The runner scripts (`start_work.sh`, `review_work.sh`, `synthesize_work.sh` via
`scripts/fg-common.sh:run_agent`) invoke the agent CLIs with **blanket bypass
flags**: Claude `--permission-mode bypassPermissions`, Codex
`--dangerously-bypass-approvals-and-sandbox`.

Two problems with that as the default:

1. **It's "dangerous mode" on the host.** It disables the CLI's own guardrails,
   so a misbehaving or prompt-injected agent has the run user's full authority.
   `bypassPermissions` also *refuses to run as root*, which caused real friction.
2. **We hadn't decided where these runs should live** — a contributor's laptop,
   a container, a cloud VM, GitHub Actions, or a hosted/web agent.

Constraints that shape the answer:

- **Residential-IP sensitivity.** Research and review both fetch NZ official
  sources (Stats NZ, data.govt.nz, councils, Charities Register). Datacentre /
  cloud IP ranges are commonly throttled or bot-blocked; residential IPs are
  not. Running from a cloud/CI IP risks silent blocks or bad data.
- **The "bring your own tokens" model.** Cost is deliberately distributed across
  contributors' own subscriptions. Routing all runs through one cloud secret (a
  VM, or CI with one repo key) re-centralises the bill.
- **Consistency & safety.** We want a repeatable environment and a real sandbox
  without depending on every contributor's local setup.

## Decision

**1. Treat the container as the sandbox.** Provide an official hardened image
that bundles `git`, `gh`, `jq`, and the agent CLIs. Inside a properly
locked-down container, a blanket "bypass" is *acceptable* — the blast radius is
the throwaway container, not the host. Hardening baseline: **non-root user
inside**, no host bind-mounts, dropped Linux capabilities, default seccomp,
CPU/memory limits, and (later) an egress allowlist.

**2. On the host (no container), default to *sandboxed auto*, not blanket bypass:**

- **Codex** → `--sandbox workspace-write --ask-for-approval never` (real
  unattended mode that *keeps* the OS sandbox; no root restriction).
- **Claude** → `--permission-mode acceptEdits` as the safer default where it
  suffices (auto-approves edits, runs as non-root); fall back to
  `bypassPermissions` **only inside the container**, since `acceptEdits` can
  still pause on some tool calls headless.
- Both remain overridable via the existing env hooks (`CODEX_FLAGS`,
  `CLAUDE_PERMISSION_MODE`, `HERMES_FLAGS`).

**3. Where runs live:** default is **the container on a contributor's own
(residential) machine** — keeps IPs residential *and* tokens distributed.
Cloud VM / GitHub Actions are acceptable for **review** (little scraping) but
**not the default for research** (IP-block risk + centralised token cost).
Prefer **official NZ APIs** over scraping to reduce IP sensitivity.

**4. Credentials:** prefer a **GitHub App installation token** (short-lived,
repo-scoped) or a fine-grained PAT limited to this repo with least privilege
(`contents: read`, `pull_requests: write`, `issues: write`). **Never bake tokens
into the image**; pass via env or a mounted secret.

## Consequences

**Positive**
- No naked "dangerous" flag as the host default; safety comes from the sandbox
  (container) or a real OS sandbox (Codex), not from trusting the agent.
- Fixes the root-refusal friction; lowers setup cost for new contributors.
- Keeps the distributed-token model and residential IPs for research.

**Negative / costs**
- Someone must build and maintain the image (Dockerfile + docs).
- `acceptEdits` may occasionally stall a headless Claude run on a tool that
  wants approval; the container (where bypass is fine) is the workaround.
- Plain Docker shares the host kernel; for reviewing *untrusted* external PRs,
  stronger isolation (gVisor / Firecracker / Kata) is worth considering later.

## Alternatives considered

- **Status quo — blanket bypass on the host.** Rejected: unsafe default, root
  friction — the thing this ADR replaces.
- **Cloud VM / GitHub Actions as the default.** Rejected as default: datacentre
  IP blocks degrade research and one shared secret re-centralises token cost.
  Fine as an *optional* review runner.
- **Hosted / web agent product.** Attractive UX, but orchestration (the bash
  runner owns status transitions) and non-residential egress are limitations
  today. Revisit if a good fit appears.

## Follow-ups (tracked separately)

- Author the Dockerfile + a short "run the reviewer in a container" guide.
- Decide plain Docker vs microVM isolation for untrusted-PR review.
- Optionally stand up one opt-in hosted review runner (distinct bot identity).
- The fetch layer inside this environment is [ADR-0006](0006-fetch-proxy-browser-management.md).
