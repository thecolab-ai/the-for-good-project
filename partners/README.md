# Partners — the open trust network

This directory is the durable record of the project's **demand side**: the
regulators, agencies, funders, NFPs, community organisations, academics and
subject-matter experts (SMEs) who tell us the right questions to ask, act as
early use cases, and help the work land where it can matter. One markdown file
per organisation/relationship. Decided in
[ADR-0010](../docs/adr/0010-partner-network.md); proposed in
[issue #123](https://github.com/thecolab-ai/the-for-good-project/issues/123).

It exists because of a tension we refuse to resolve quietly: this project is
built completely in the open, but it tracks real people at real organisations.
[CONSTITUTION.md](../CONSTITUTION.md) Article III (protect people) wins. The
resolution is a **consent gate** on every record.

## The consent rule (hard rule)

**No personal names, emails, or contact details go in this repo until that
person has explicitly consented.** Until then, records are *role +
organisation-type only* ("a senior analyst at [a statistics agency]").

Every record carries a `consent:` level in its frontmatter. **The safe default
everywhere is `private`.** Escalating a record's visibility is a deliberate,
logged act — note it, dated, in the record's interaction log.

| `consent` | What the record may say | What it must never say |
|---|---|---|
| `private` (default) | Role + sector + org-type only — "a policy lead at a regulator" | The organisation's name; any individual's name or contact detail |
| `org-named` | The organisation by name; roles within it | Any individual's name or contact detail |
| `fully-public` | A named individual, *because they explicitly said yes* (record when/how consent was given) | Contact details beyond what the person approved |

If you're unsure which level applies, it's `private`.

## How the network works

Each relationship moves through stages, carried in the record's `status:`
frontmatter — a lightweight CRM in GitHub:

```
exploring → intro-made → in-conversation → committed → active
```

- **Registry (this directory)** — the settled state of each relationship.
- **Pipeline** — the `partner` and `sme` issue labels track related work;
  `status:` in frontmatter tracks the relationship stage.
- **Conversation** — GitHub Discussions ("Partners & advisory", "Questions
  from the field") is where the open dialogue happens. Discussions is the
  talking; the registry is the settled state.

Roles a partner can play (a record's `role:` field): **connector** (opens
doors), **sme** (checks our work against reality), **early-user** (takes the
output and uses it), **advisory** (shapes what we ask), **data-provider**.

## What every partner gets (our promise)

The same promise as the public [partners page](https://thecolab-ai.github.io/the-for-good-project/#/partners):
rigorous, cited work; nothing published about them or their people without
their sign-off; review of anything involving them before anyone else sees it;
and the freedom to walk away at any point, no questions asked.

And the ask is deliberately small and low-pressure. Many resource-scarce
organisations have never been asked *"what problem would you want solved if
capacity were free?"* — that question, plus a little expert time to
sanity-check our work, is usually the whole ask.

## How to add or update a record

1. Copy [`TEMPLATE.md`](TEMPLATE.md) to `partners/<slug>.md` — slug describes
   the relationship at its consent level (e.g. `statistics-agency-analyst.md`,
   not a person's name).
2. Fill the frontmatter. `consent: private` unless there is explicit,
   recordable consent for more.
3. Link the streams (issue numbers) this partner informs or could use.
4. Before committing, run the redaction check in the
   [`manage-partner` skill](../.claude/skills/manage-partner/SKILL.md) — or
   manually scan for names/emails/phone numbers above the consent level.
5. Standard maintainer review (docs/tooling) via PR — not the research
   citation gate.

Agents: use the `manage-partner` skill for all of the above; it enforces the
consent gate mechanically.
