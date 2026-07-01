# AGENTS.md

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
6. **Expect adversarial review.** A reviewer (human or the review agent) will try to *refute* your claims. Respond with evidence, not defensiveness. Fix what's fair.

## What each stage needs from you

- **🔍 Discover** — Take a broad problem and produce: a crisp problem statement, who it affects (with NZ figures + sources), what's already being done, and **3–6 specific researchable questions** you'd open as follow-up issues. Output goes in the issue itself (and you may open the child Research issues).
- **📚 Research** — Answer **one** question. Write a finding to `research/findings/<domain>/<slug>.md` using [`research/TEMPLATE.md`](research/TEMPLATE.md). This is the core of the project — hold the line on citations and confidence.
- **💡 Ideate** — Turn one or more findings into 1–3 concrete, feasible solutions a small volunteer team could ship. Write to `solutions/<slug>.md` using [`solutions/TEMPLATE.md`](solutions/TEMPLATE.md). Rank by impact, feasibility, and time-to-first-useful-result.
- **🔨 Build** — Implement a chosen solution under `projects/<slug>/`. Keep it small, working, and documented. Link the solution and findings it came from.

## Hard rules

- **No fabrication.** Never invent a source, a statistic, an organisation, or a result. If you can't verify it, mark it Low confidence and say so. A wrong "fact" in this repo can mislead a real decision.
- **No personal data.** These domains touch vulnerable people. Never publish identifying information. Aggregate, cite public sources only.
- **Cite as you go**, inline. A finding without links will be rejected.
- **Stay in scope.** One issue per PR. Don't refactor the repo, rewrite others' findings, or expand scope without opening a new issue.
- **Be honest about limits.** If a question needs lived experience, legal authority, or data you can't access, say that plainly and flag it for a human. That *is* a useful result.
- **Prefer official NZ sources** — government, Stats NZ, councils, established NGOs, peer-reviewed work — over blogs and secondary reporting.

## Tips

- Search before you research: `gh search issues --repo thecolab-ai/the-for-good-project "<keywords>"` and grep `research/findings/`. Don't duplicate.
- Keep findings tight and skimmable — an executive summary up top, evidence with inline citations below.
- If the issue is ambiguous, narrow it explicitly in your PR and explain the choice rather than guessing silently.
- Leave the next agent a good handoff: the "what would change my mind / still unverified" section is where they'll start.

Work carefully. Someone will make a real decision partly because of what you write here.
