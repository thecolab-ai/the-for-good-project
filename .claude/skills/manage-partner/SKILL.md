---
name: manage-partner
description: Use when adding, updating, redaction-checking, or drafting outward artifacts for a partner/SME/advisory record in partners/ — enforces the consent gate (private | org-named | fully-public) so no personal name or contact detail ever lands in the repo without explicit consent.
---

# Manage a partner record (consent-gated)

You manage records in [`partners/`](../../../partners/README.md) — the open,
consent-gated registry of the project's trust network. The governing rule is
[CONSTITUTION.md](../../../CONSTITUTION.md) Article III (protect people) as
applied by [ADR-0010](../../../docs/adr/0010-partner-network.md):

**No personal names, emails, phone numbers, or contact details in the repo
unless the record's frontmatter says `consent: fully-public` — explicitly, and
with the consent noted in the interaction log. This is not your call to make;
absent recorded consent, you refuse and redact.**

## Consent levels (what you may write)

| `consent` | May write | Must refuse to write |
|---|---|---|
| `private` (default) | role, sector, org-type | org name; any personal name/contact |
| `org-named` | + the organisation's name | any personal name/contact |
| `fully-public` | + the named individual, as consented | contact details beyond what was approved |

When a brief doesn't state a consent level, use `private`. Never infer
escalation ("they seem happy to be named") — escalation requires the human to
state it, and you record when/how in the interaction log.

## Operations

### Add or update a record
From a short brief: write/update `partners/<slug>.md` using
[`partners/TEMPLATE.md`](../../../partners/TEMPLATE.md).
- Slug describes the relationship at its consent level (e.g.
  `grocery-sector-connector.md`) — never a person's name, even at
  `fully-public` (file names outlive consent changes).
- Fill frontmatter exactly (org, org-type, sector, role, status, consent,
  streams, updated — today's date).
- If the brief contains detail above the consent level, **write the record
  without it** and tell the human exactly what you dropped and why.

### Redaction check
Scan a draft record (or any `partners/` file) for content exceeding its stated
consent level, before commit:
- personal names (including in the interaction log), email addresses, phone
  numbers, and org names on `private` records;
- quasi-identifiers that make a person findable ("the only Māori data lead at
  the agency") — treat those as names.
Report each violation with file, line, and the minimal redaction. Do not
commit a file that fails this check.

### Map to streams
Keep `streams:` in sync with the issues the partner informs or could use.
When updating, check the issue numbers exist (`gh issue view <n>`) and add a
line to "What they can help with" saying *how* they inform each stream.

### Draft outward artifacts
- **Partner charter** (one page, plain language): the ask + our promise
  (rigorous cited work, nothing published about them without sign-off, review
  before anyone else sees it, freedom to walk away).
- **Call-prep brief**: what we know at the record's consent level, what we
  want from the conversation, the low-pressure question ("what problem would
  you want solved if capacity were free?").
Both are **name-free unless consent allows**, and drafts go to the human — you
never send them.

## Non-goals (never)

- Never contact anyone, on any channel.
- Never publish a name without `consent: fully-public` recorded in the file.
- Never invent a relationship, an interaction, or a quote. If the brief
  doesn't say it happened, it isn't in the log.
- No personal data beyond the consent level, anywhere — including commit
  messages, PR bodies, and issue comments.

## Review path

Partner records are docs/tooling: standard maintainer review, not the research
citation gate. End every operation with a one-line confidence/limits statement
(what you could not verify, what needs the human's confirmation) — per
Article III, don't overstate.
