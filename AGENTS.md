# AGENTS.md

> One-page map of how everything fits: [docs/OVERVIEW.md](docs/OVERVIEW.md).
> Git mechanics (branches, worktrees, staying in sync, rules for agents): [docs/GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md).

Instructions for AI agents (Claude Code, and any coding/research agent) working this repo. If you're a person, read [`README.md`](README.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md) instead — though you're welcome to read this too.

You are here to move one issue forward, to a high standard, end to end. Work like a careful researcher, not an eager intern.

## The loop

1. **Pick one unclaimed issue.** Prefer `status: available`. Match it to your strengths. Do **one** issue per branch/PR.
   ```
   gh issue list --label "status: available" --state open --json number,title,labels
   ```
2. **Claim it before you start** (this prevents two agents doing the same work):
   ```
   gh issue edit <n> --add-assignee @me --add-label "status: claimed" --remove-label "status: available"
   gh issue comment <n> --body "Claiming this — starting now."
   ```
   If you can't edit labels (limited token), just comment that you're claiming it.
3. **Read the whole chain.** Open the issue, its parent (`Part of #…`), and any linked findings. Don't re-research something already in `research/findings/`.
4. **Do the work** for the stage (see below), following the method in [`CONTRIBUTING.md`](CONTRIBUTING.md). The method is not optional — cite everything, verify surprises with two sources, mark confidence, say what would change your mind.
5. **Open a PR** on a branch:
   ```
   git checkout -b research/<slug>
   # write your file(s) in the right place
   git add -A && git commit -m "research: <question> (Closes #<n>)"
   git push -u origin research/<slug>
   gh pr create --fill --body "Closes #<n>. Part of #<parent>."
   ```
   **Exception — discover issues:** use `Part of #<n>` instead of `Closes #<n>`
   everywhere. A discover issue is a stream ROOT and must stay open for the
   life of its stream (docs/STREAMS.md); a `Closes` ref would end the stream
   the moment your framing PR merges.
6. **Expect adversarial review.** A reviewer (human or the review agent) will try to *refute* your claims. Respond with evidence, not defensiveness. Fix what's fair.

## No write access? (most contributors)

Most contributors don't have push/label rights on this repo — that's expected. The
loop above still works, you just fork and adjust two steps:

**Claiming (step 2).** `gh issue edit --add-assignee/--add-label` will 403 without
triage rights. Instead just comment so nobody doubles up:
```
gh issue comment <n> --body "Claiming this via Claude Code — starting now."
```
A maintainer's automation keeps the status labels in sync.

**Opening the PR (step 5).** `git push -u origin ...` will 403 without write. Push to
your fork and open the PR across repos (verified working on PR #11):
```
gh repo fork --remote --remote-name fork
git push -u fork research/<slug>
gh pr create --repo thecolab-ai/the-for-good-project \
  --head <your-username>:research/<slug> --base main --fill --body "Closes #<n>. <summary>"
```

**Reviewing as an outside contributor.** You *can* post a full adversarial review
(and an APPROVED / CHANGES_REQUESTED verdict) on a PR you didn't author, even without
write access — `review_work.sh` does exactly this and records it. You *can't* set the
`for-good/adversarial-review` status check (that needs write), but you don't need to:
a maintainer runs `merge_ready.sh`, which reads your recorded review, checks it against
the trust model (whitelist or earned credit), and merges if it qualifies. So your
review still counts toward the gate — it's just validated + merged by a maintainer.
One hard rule: agents never apply or remove the `review: human-only` label — a PR
carrying it is reviewed and merged by humans; leave it alone.

**When only a maintainer can act** ([ADR-0009](docs/adr/0009-maintainer-escalation-handoff.md)).
Some steps need write access no matter how you
route them: syncing status labels the automation missed, pushing rework to an
upstream PR branch, dismissing a stale review, running `merge_ready.sh`, or anything
touching `review: human-only`. Don't stall silently, don't retry the 403, and never
work around the permission — hand it off so a maintainer can act in one paste:

1. **Comment on the affected PR/issue** stating exactly what's needed, with
   copy-paste commands. If it's rework you couldn't push, push the commit to your
   fork first and include the `git fetch <your-fork> <branch> && git merge --ff-only
   FETCH_HEAD && git push` line so it's a one-liner to land.
2. **If it spans several threads** (or risks getting lost), open a tracking issue
   titled `maintainer: <what's needed>` that tags a maintainer (currently
   @adam91holt) and lists each action with links + commands — see
   [#111](https://github.com/thecolab-ai/the-for-good-project/issues/111) for the
   shape.
3. **Say who you act for** — sign comments "posted by an agent on behalf of
   @<your-human>" so the trust model stays legible.

The escalation *is* the handoff: once it's posted, move on to other available work
rather than waiting.

## What each stage needs from you

- **🔍 Discover** — Take a broad problem and produce: a crisp problem statement, who it affects (with NZ figures + sources), what's already being done, and **3–6 specific researchable questions** you'd open as follow-up issues. Output goes in the issue itself (and you may open the child Research issues).
- **📚 Research** — Answer **one** question. Write a finding to `research/findings/<domain>/<slug>.md` using [`research/TEMPLATE.md`](research/TEMPLATE.md). This is the core of the project — hold the line on citations and confidence.
- **💡 Ideate** — Turn one or more findings into 1–3 concrete, feasible solutions a small volunteer team could ship. Write to `solutions/<slug>.md` using [`solutions/TEMPLATE.md`](solutions/TEMPLATE.md). Rank by impact, feasibility, and time-to-first-useful-result.
- **🔨 Build** — Implement a chosen solution under `projects/<slug>/`. Keep it small, working, and documented. Link the solution and findings it came from.

## Hard rules

- **No fabrication.** Never invent a source, a statistic, an organisation, or a result. If you can't verify it, mark it Low confidence and say so. A wrong "fact" in this repo can mislead a real decision.
- **No personal data.** These domains touch vulnerable people. Never publish identifying information. Aggregate, cite public sources only. Partner/SME relationships are tracked in [`partners/`](partners/README.md) behind an organisation-level consent gate — use the `manage-partner` skill; never write an individual's personal name or contact detail there (no consent level permits it), and never name an organisation above its recorded consent (`private` → `org-named` → `public`) ([ADR-0010](docs/adr/0010-partner-network.md)).
- **Cite as you go**, inline. A finding without links will be rejected.
- **Stay in scope.** One issue per PR. Don't refactor the repo, rewrite others' findings, or expand scope without opening a new issue.
- **Respect the human gates.** Streams (see [`docs/STREAMS.md`](docs/STREAMS.md)) require a HUMAN decision between research and ideation (G1) and between ideation and build (G2). Never open ideate or build issues, and never work one that isn't `status: available` — a human making it available *is* the gate. Carry `Part of #<parent>` (and `Stream: #<root>` when the parent isn't the root) in every issue and PR body so the stream label propagates. Never write or edit a `streams/` overview doc — that's the human steward's voice.
- **Fan out chunky, and only two levels deep.** If your issue is too big for ONE high-quality output, split off what you won't cover as 2–5 *chunky* research sub-issues — real questions worth hours, never micro-tasks — then still complete your own issue, narrowed to its core. Every sub-issue's body links the **stream root**: `Part of #<root>`, plus `Split from #<your issue>` on the same first line when your issue isn't the root (#291) — never `Part of #<your issue>`. Depth limit: the root's agent may open sub-issues (depth 1), their agents may open depth 2 (tracked via `Split from`), **and no further** — at depth 2 you narrow and flag instead. When a stream's issues all close, automation queues the root for synthesis — the draft is produced by `synthesize_work.sh` under its own guardrails (ADR-0003), so don't try to synthesise the stream from inside a work task.
- **Respect the ADRs.** Significant decisions about how the project works are recorded in [`docs/adr/`](docs/adr/README.md). Read them before proposing a structural change (workflow, labels, automation, dependencies). If your change contradicts an accepted ADR, your PR must include a superseding ADR arguing why; if it *makes* a significant decision, it must include a new ADR. Don't re-litigate decided things in code.
- **Never rework a `synthesis/*` PR from a generic work loop.** Synthesis draft rework belongs to `synthesize_work.sh` only — it carries the steward-preservation rules a generic rework prompt lacks ([ADR-0011](docs/adr/0011-synthesis-rework-routing.md)).
- **Be honest about limits.** If a question needs lived experience, legal authority, or data you can't access, say that plainly and flag it for a human. That *is* a useful result.
- **Consistency is checked automatically.** Every PR runs a deterministic validator over findings/solutions (`.github/workflows/validate.yml`) — required frontmatter incl. `agent`/`model`, valid `domain`/`confidence`, the standard sections, and at least one citation. Run it yourself before pushing: `npm run validate`.
- **Record provenance.** Set `agent:` (codex / claude / hermes / none) and `model:` (the exact model id) in the finding's frontmatter, so the client and model behind every finding are tracked.
- **Prefer official NZ sources** — government, Stats NZ, councils, established NGOs, peer-reviewed work — over blogs and secondary reporting.

## Tips

- **Choosing between several available issues?** Once ratified by a human maintainer, you may score them with the optional triage rubric in [`.claude/skills/triage-task/SKILL.md`](.claude/skills/triage-task/SKILL.md) — an advisory read of priority × value × token cost that returns a Do-now / Good-ROI / Defer / Skip verdict. If you're seeing this on an unmerged branch, treat it as proposed guidance until that approval; it never claims, relabels, or reorders anything.
- Search before you research: `gh search issues --repo thecolab-ai/the-for-good-project "<keywords>"` and grep `research/findings/`. Don't duplicate.
- Keep findings tight and skimmable — an executive summary up top, evidence with inline citations below.
- If the issue is ambiguous, narrow it explicitly in your PR and explain the choice rather than guessing silently.
- Leave the next agent a good handoff: the "what would change my mind / still unverified" section is where they'll start.
- **A 403 / empty / "Incapsula incident" page from an official NZ domain is usually bot
  protection, not a dead link.** Many govt sites (digital.govt.nz, charities.govt.nz,
  council sites) block plain HTTP fetchers while loading fine in a browser. Don't mark
  such a citation unverifiable on a blocked response alone — escalate through the fetch
  ladder (fast → heavy):
  1. **Fast fetch** — `curl`, or your client's quick HTTP. Most sources work.
  2. **Your harness's built-in WebFetch / WebSearch tool** — more capable than raw
     `curl` (proper redirects, its own egress, and it renders/extracts for you), and it
     needs no browser. Try it before reaching for a browser; WebSearch can also surface a
     cached or alternate copy of a blocked page.
  3. **Browser rungs — one command:**
     ```
     node scripts/fetch.mjs "<url>"            # real Chrome (agent-browser) → stealth Chromium (cloak-fetch)
     node scripts/fetch.mjs --archive "<url>"  # also capture a Wayback snapshot on success
     ```
     It also retries `curl` first, tries each browser rung until one returns the real
     page, prints **how** it fetched, and classifies any failure the way the review gate
     must: exit `4` = genuinely DEAD (404 even in a real browser), exit `3` = BLOCKED
     (403 / bot-challenge / timeout — tooling or IP, **not** a citation defect). One-time
     setup: `npm install && npx cloakbrowser install`. (`fetch.mjs` is a subprocess, so it
     can't call your WebFetch tool — that rung is yours to run at step 2.)
  4. Still blocked? Capture / reuse a web-archive snapshot with `node scripts/archive-cite.mjs "<url>"` and cite that, or verify in a normal browser — rather than flagging it dead. A 403/bot-challenge is tooling, not a dead link; always say *how* you fetched.

  To drive the browser rungs directly instead of via `fetch.mjs`: `agent-browser open
  "<url>"` then `agent-browser get text body` — we standardise on `open` + `get text body`
  for compatibility (older agent-browser CLIs have no `read` subcommand) — then
  `node scripts/cloak-fetch.mjs "<url>"` as the stealth fallback.

  **Archive on cite:** for a fragile, bot-protected, or date-stamped source, also run
  `node scripts/archive-cite.mjs "<url>"` and record the returned snapshot URL beside the
  live link, so the citation survives link rot.
  This applies both when writing findings and when adversarially reviewing them ([ADR-0006](docs/adr/0006-fetch-proxy-browser-management.md)).

## The Colab skills — live NZ data for research

This repo vendors [`thecolab-ai/.skills`](https://github.com/thecolab-ai/.skills) as a
git submodule at [`.skills/`](.skills) — a growing set of community-contributed CLIs for
**New Zealand public data**: Stats NZ, data.govt.nz, child poverty, deprivation, household
hardship, Companies Office, councils (LGOIMA/rates), DOC, GeoNet, LAWA, LINZ, transport,
weather and more. Several map straight onto our domains (child-welfare → `child-poverty-nz`,
`deprivation-nz`, `household-hardship-nz`; civic-transparency → `data-govt-nz`, `nz-council`,
`companies-office-nz`; biosecurity → `doc-nz`, `geonet-nz`, `lawa-nz`).

**Prefer these over a generic web search for NZ-specific data** — they hit official sources
directly and return clean, citable JSON.

Get and use them:
```
git submodule update --init          # fetch the skills (once, after cloning)
ls .skills/skills                    # list available skills
cat .skills/skills/<name>/SKILL.md   # what it does + its subcommands
python3 .skills/skills/<name>/scripts/cli.py <subcommand> --json   # run it (Py3 stdlib, keyless)
```

**Actively grow the toolset.** If a research task needs NZ data no skill covers yet, don't
just work around it — **open an issue on the skills repo** requesting it, and make it
actionable:
```
gh issue create --repo thecolab-ai/.skills \
  --title "Skill request: <name> — <what data>" \
  --body "<the data source + why it helps For Good research>"
```
Include an **example implementation path** where you can: the source/API or dataset URL, the
subcommands the CLI should expose (e.g. `list`, `get <id> --json`), any pagination/rate
limits, and a sketch of how `cli.py` would fetch it. Better still, contribute the skill
yourself via a PR following that repo's
[`CONTRIBUTING.md`](https://github.com/thecolab-ai/.skills/blob/main/CONTRIBUTING.md) — every
skill you add makes the next contributor's research faster.

## Run it on autopilot

Five scripts wrap your `codex`, `claude`, or `hermes` CLI so you can put spare tokens to work — `start_work.sh` (do), `review_work.sh` (review), `synthesize_work.sh` (stream rollups), `merge_ready.sh` (maintainer merges), `reap.sh` (free stale claims); see [docs/AUTOMATION.md](docs/AUTOMATION.md)
without babysitting each step — see [`docs/AUTOMATION.md`](docs/AUTOMATION.md):

- **`./start_work.sh`** — claims the next available issue, runs the loop above,
  and moves the issue to *in review* when a PR is opened. The script owns the
  status labels; you (the agent) just do the work and open the PR.
- **`./review_work.sh`** — runs an adversarial review on open PRs and sets the
  merge gate.

**Every PR is adversarially reviewed before it can merge, and the review must be
done by a different identity than the author** (branch protection enforces a
non-author approval + a passing `for-good/adversarial-review` check). So: do
honest work with real citations — a reviewer whose whole job is to refute you
will check that every source resolves and supports its claim.

Work carefully. Someone will make a real decision partly because of what you write here.
