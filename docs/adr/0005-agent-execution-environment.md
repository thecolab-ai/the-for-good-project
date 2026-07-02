# ADR-0005: How and where we run the agents (execution environment & permission modes)

- **Status:** proposed
- **Date:** 2026-07-02
- **Deciders:** Proposed by PR (this one); accepted only if merged by a maintainer
- **Discussion:** For Good WhatsApp, 2 July 2026 (Adam: "I don't like dangerously skip perms, we should be running on auto mode… we could try to containerise it")

## Context

The runner scripts (`start_work.sh`, `review_work.sh`, `synthesize_work.sh` via
`scripts/fg-common.sh:run_agent`) currently invoke the agent CLIs with **blanket
bypass flags**:

- Claude: `--permission-mode bypassPermissions`
- Codex: `--dangerously-bypass-approvals-and-sandbox`

Two problems with that as the default:

1. **It's "dangerous mode" on the host.** It disables the CLI's own guardrails,
   so a misbehaving or prompt-injected agent has the run user's full authority.
   `bypassPermissions` also *refuses to run as root*, which caused real friction.
2. **We haven't decided where these runs should live** — a contributor's laptop,
   a container, a cloud VM, GitHub Actions, or a hosted/web agent.

Constraints that shape the answer:

- **Residential-IP sensitivity.** Research and review both fetch NZ official
  sources (Stats NZ, data.govt.nz, councils, Charities Register). Datacentre /
  cloud IP ranges are commonly throttled or bot-blocked; residential IPs are
  not. Running research from a cloud/CI IP risks silent blocks or bad data.
- **The "bring your own tokens" model.** Cost is deliberately distributed across
  contributors' own subscriptions. Anything that routes all runs through one
  cloud secret (a VM, or CI with one repo API key) re-centralises the bill.
- **Consistency & safety.** We want a repeatable environment and a real sandbox,
  without depending on every contributor's local setup.

(Findings from two research agents, 2 Jul 2026. Sources incl. Claude Code
[permission modes](https://code.claude.com/docs/en/permission-modes) &
[headless](https://code.claude.com/docs/en/headless); Codex
[sandboxing](https://developers.openai.com/codex/concepts/sandboxing) &
[CLI reference](https://developers.openai.com/codex/cli/reference); Docker
[AI governance](https://www.docker.com/blog/docker-ai-governance-unlock-agent-autonomy-safely/);
GitHub [fine-grained PATs](https://github.blog/security/application-security/introducing-fine-grained-personal-access-tokens-for-github/).)

## Decision (proposed)

**1. Treat the container as the sandbox.** Provide an official hardened image
that bundles `git`, `gh`, `jq`, and the agent CLIs. Inside a properly locked-down
container, a blanket "bypass" is *acceptable* — the blast radius is the throwaway
container, not the host. Hardening baseline: **non-root user inside**, no host
bind-mounts, dropped Linux capabilities, default seccomp, CPU/memory limits, and
(later) an egress allowlist. This is what makes "auto/bypass" safe rather than
scary.

**2. On the host (no container), default to *sandboxed auto*, not blanket bypass:**

- **Codex** → `--sandbox workspace-write --ask-for-approval never` (real
  unattended mode that *keeps* the OS sandbox; no root restriction). Replaces
  `--dangerously-bypass-approvals-and-sandbox` as the default.
- **Claude** → `--permission-mode acceptEdits` as the safer default where it
  suffices (auto-approves edits, runs as non-root); fall back to
  `bypassPermissions` **only inside the container**. Note: `acceptEdits` can
  still pause on some tool calls headless — the container path is the robust
  answer for fully-unattended Claude runs.
- Both remain overridable via the existing env hooks (`CODEX_FLAGS`,
  `CLAUDE_PERMISSION_MODE`, `HERMES_FLAGS`), so power users aren't boxed in.

**3. Where runs live:** default is **the container on a contributor's own
(residential) machine** — keeps IPs residential *and* tokens distributed.
Cloud VM / GitHub Actions are acceptable for **review** (little scraping) but
**not the default for research** (IP-block risk + centralised token cost). Prefer
**official NZ APIs** (Stats NZ Data API, Charities OData) over scraping to reduce
IP sensitivity everywhere.

**4. Credentials:** prefer a **GitHub App installation token** (short-lived,
repo-scoped) or a fine-grained PAT limited to this repo with least privilege
(`contents: read`, `pull_requests: write`, `issues: write`). **Never bake tokens
into the image**; pass via env or a mounted secret.

## Consequences

**Positive**
- No naked "dangerous" flag as the host default; safety comes from the sandbox
  (container) or a real OS sandbox (Codex), not from trusting the agent.
- Fixes the root-refusal friction.
- Portable, repeatable environment via one image; lowers setup cost for new
  contributors (Chris, JP, et al.).
- Keeps the distributed-token model and residential IPs for research.

**Negative / costs**
- Someone must build and maintain the image (Dockerfile + docs).
- `acceptEdits` may occasionally stall a headless Claude run on a tool that
  wants approval; the container (where bypass is fine) is the workaround.
- Plain Docker shares the host kernel; for reviewing *untrusted* external PRs,
  stronger isolation (gVisor / Firecracker / Kata) is worth considering later.

## Alternatives considered

- **Status quo — blanket bypass on the host.** Rejected: unsafe default, root
  friction, and the thing this ADR exists to replace.
- **Cloud VM / GitHub Actions as the default.** Rejected as default: datacentre
  IP blocks degrade research, and one shared secret re-centralises token cost.
  Fine as an *optional* review runner.
- **Hosted / web agent product.** Attractive UX, but orchestration (the bash
  runner owns status transitions) and non-residential egress are limitations
  today. Revisit if a good fit appears.

## Follow-ups (not decided here)

- Author the Dockerfile + a short "run the reviewer in a container" guide.
- Decide plain Docker vs microVM isolation for untrusted-PR review.
- Optionally stand up one opt-in hosted review runner (distinct bot identity)
  to help drain the review queue without waiting on humans.
