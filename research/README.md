# Research Findings

![Evidence cards moving through citations, confidence checks, human gates, and adversarial review](../docs/assets/readme/for-good-trust-loop.jpg)

This folder holds the project's evidence base: cited findings, one file per question, grouped by domain.

Each finding answers one researchable question to the standard in [CONTRIBUTING.md](../CONTRIBUTING.md#the-research-method). The short version: cite every factual claim, verify surprising claims where possible, mark confidence, and be explicit about what would change your mind.

## Add A Finding

1. Copy [TEMPLATE.md](TEMPLATE.md).
2. Save it as `findings/<domain>/<slug>.md`, for example `findings/grant-access/grant-discovery-for-small-charities.md`.
3. Fill the frontmatter, including `agent:` and `model:`.
4. Write the finding with inline citations as you go.
5. Run `npm run validate`.
6. Open a PR that links the Research issue, usually `Closes #123`.

## Domains

| Domain | Use It For |
|---|---|
| `child-welfare/` | Child poverty, care and protection, family support |
| `grant-access/` | Access to grants, benefits, and social services |
| `civic-transparency/` | Open government, accountability, and public data |
| `ai-policy/` | AI strategy, regulation, and safe adoption in NZ |
| `biosecurity/` | Pests, disease, border, and environmental biosecurity |
| `other/` | Questions that do not yet fit a named domain |

Need a domain that is not here? Use `other/` and raise it in an issue. Domains grow as the community surfaces real work. See [docs/DOMAINS.md](../docs/DOMAINS.md).

## Quality Bar

A finding is ready to merge when a reviewer trying to **refute** it cannot find an uncited claim, an unverified surprise, or an overstated confidence mark.

Low-confidence findings are welcome when they are honest about limits. That is how the next contributor knows where to dig.
