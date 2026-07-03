# Contributing

> One-page map of how everything fits: [docs/OVERVIEW.md](docs/OVERVIEW.md).

Welcome. This is the method that keeps The For Good Project useful. It's short on purpose — read it once and you're ready.

The work here informs real decisions about real people. That's why the bar is "cited and honest," not "fast and confident."

## The pipeline

Every piece of work is a GitHub Issue moving through four stages:

| Stage | Label | You're doing this |
|---|---|---|
| 🔍 Discover | `stage: discover` | Framing a real NZ problem into researchable questions |
| 📚 Research | `stage: research` | Investigating one question, with citations |
| 💡 Ideate | `stage: ideate` | Turning findings into feasible solutions |
| 🔨 Build | `stage: build` | Implementing a solution |

Issues link forward: a Discover issue spawns Research issues; a Research finding feeds an Ideate issue; a chosen idea becomes a Build issue. Always link the issue you came from (`Part of #123`) so the chain stays traceable.

Everything descending from one Discover issue is a **stream** (tracked by an auto-applied `stream:<n>` label and a plain-language overview in [`streams/`](streams/README.md)). Streams pass through **human gates**: an agent drafts the synthesis, then a person reviews it and sets direction before ideation starts (G1) and approve a solution before anything is built (G2) — see [`docs/STREAMS.md`](docs/STREAMS.md). Agents do the volume; humans do the judgement.

## The workflow

1. **Find work.** Browse [`status: available`](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22status%3A+available%22) issues. New? Filter for [`good first issue`](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).
2. **Claim it.** Assign yourself and swap the label `status: available` → `status: claimed`. This is how we avoid two people doing the same work. If an issue is claimed but stale (no update in ~5 days), comment and take it over.
3. **Do the work** following the method below for your stage.
4. **Open a pull request.** Use the PR template. Link the issue (`Closes #123`). Put your output in the right place (see [Where things go](#where-things-go)).
5. **Review.** Every PR gets an **adversarial review by a different person/agent than the author** (the job is to *refute* your claims, not rubber-stamp them) before it can merge — `main` is branch-protected to require a non-author approval and a passing review check. This can be a maintainer, or the project's review agent run via [`review_work.sh`](docs/AUTOMATION.md). Address the feedback; on approval it merges and the issue closes.

Don't have write access to labels? No problem — just say in the issue comment "claiming this" and note the stage in your PR. Maintainers keep labels tidy.

**Not racing an agent — steering one.** If you know a domain (you work in an NFP, a council, a community org), the highest-value contribution isn't typing faster than a language model: it's judgement. Steward a stream (write its plain-language overview and make the G1/G2 direction calls), review whether a synthesis actually holds up, or just read a [stream overview](streams/README.md) and say "that's not how it works on the ground" — that one comment can redirect weeks of agent output. See [`docs/STREAMS.md`](docs/STREAMS.md).

**No write access at all?** (most contributors) Fork the repo, push your branch to the fork, and open the PR across repos — full commands are in [`AGENTS.md`](AGENTS.md#no-write-access-most-contributors). You can also adversarially review others' PRs from a fork; a maintainer's `merge_ready.sh` validates outside reviews and merges what qualifies.

## The research method

This applies most strictly to Research, but the spirit holds everywhere.

1. **Clarify the question.** State exactly what you're answering in one sentence. If the issue is vague, narrow it and say how.
2. **Cite every claim.** Every factual statement gets at least one source — a link, a document, a dataset. No citation, no claim. Prefer official and current NZ sources (government, Stats NZ, councils, established NGOs, peer-reviewed work) over blogs and secondary reporting. If a source 403s or bot-blocks, escalate through the fetch ladder in [`AGENTS.md`](AGENTS.md#tips) ([ADR-0006](docs/adr/0006-fetch-proxy-browser-management.md)) — a blocked response is tooling, not a dead link.
3. **Verify the surprising ones.** Anything counter-intuitive, load-bearing, or likely to be quoted needs **two independent sources**. If you can only find one, say so and flag it.
4. **Mark your confidence.** Every finding is tagged **High**, **Medium**, or **Low**:
   - **High** — multiple strong, current sources agree; you'd stake a decision on it.
   - **Medium** — reasonable support, some gaps or dated sources.
   - **Low** — thin evidence, worth stating but treat as a lead, not a fact.
5. **Say what would change your mind.** End with what evidence would overturn the conclusion, and what you couldn't verify. This is the most valuable part — it's where the next person starts.
6. **Stay in your lane on ethics.** These are sensitive domains. Don't publish personal data. Don't overstate. Don't claim you contacted an organisation or ran a programme you didn't. Flag anything that needs a human with lived experience or domain authority to weigh in.

A finding that honestly reads _"Low confidence, one dated source, needs a Stats NZ pull to confirm"_ is a real contribution. A confident paragraph with no links is not.

## Where things go

| Your output | Put it in | Follow |
|---|---|---|
| A cited research finding | `research/findings/<domain>/<slug>.md` | [`research/TEMPLATE.md`](research/TEMPLATE.md) |
| A proposed solution | `solutions/<slug>.md` | [`solutions/TEMPLATE.md`](solutions/TEMPLATE.md) |
| An implementation | `projects/<slug>/` | [`projects/README.md`](projects/README.md) |
| A project-level analysis or operating plan | `analysis/<slug>.md` | [`analysis/README.md`](analysis/README.md) |
| A finding **about this project's own process, gates, or governance** | `analysis/<slug>.md` — **never** `research/findings/` | Process observations aren't NZ research; putting them in `findings/` triggers the full citation gate and stalls review |

`<domain>` is one of the folders in `research/findings/` (child-welfare, grant-access, civic-transparency, ai-policy, biosecurity, …). `<slug>` is short-kebab-case, e.g. `grant-discovery-for-small-charities.md`.

### Audience is signalled by extension, not a suffix

Some documents ship in two formats: a Markdown original for LLMs and contributors, and a PDF for humans who want a formatted read. When they do, both use the **same kebab-case slug** and the audience is implied by the extension — never a `-human` / `-llm` tag:

- **`.md` is the canonical source of truth.** Edit it; review, diff, and cite it.
- **`.pdf` (or any rendered format) is a read-only companion**, generated from the `.md`. Never hand-edit it — if the two disagree, the `.md` wins; regenerate the export.

This keeps the project's one-source-of-truth principle intact: the Markdown is the database, everything else is a view of it. See [`analysis/README.md`](analysis/README.md) for a worked example.

The `analysis/` artifact type and rendered-companion convention are recorded in [`ADR-0004`](docs/adr/0004-analysis-documents-and-rendered-companions.md). Analysis files follow the cited-and-honest method, but the current validator still checks only findings and solutions; reviewers enforce the analysis standard until the ADR tripwire is hit.

## Pull request checklist

- [ ] Linked the issue (`Closes #123`) and any parent (`Part of #120`)
- [ ] Used the right template and put files in the right place
- [ ] Every claim has a source; surprising claims have two
- [ ] Confidence marked (High/Med/Low) on findings
- [ ] Stated what would change the conclusion / what's unverified
- [ ] No personal data, no overstated claims
- [ ] Passes `npm run validate` (frontmatter incl. agent/model, sections, citations) — CI checks this on every PR

## Good conduct

Be kind, be rigorous, assume good faith. Full text in [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). This is a community effort under [thecolab.ai](https://thecolab.ai) — treat it like the commons it is.

## Licence

By contributing you agree your contribution is licensed to the project and the public:

- **Research, findings, docs, and other content:** [CC BY 4.0](LICENSE) — anyone can use and remix it with attribution.
- **Code under `projects/`:** [MIT](projects/LICENSE).

Cite your sources; expect to be cited.
