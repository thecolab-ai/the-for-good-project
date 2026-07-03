---
name: manage-partner
description: Use when adding, updating, redaction-checking, or drafting outward artifacts for a partner/SME/advisory record in partners/ — enforces the consent gate (private | org-named | public) so no individual's personal name or contact detail ever lands in the repo, and no organisation is named above its recorded consent.
---

# Manage a partner record (consent-gated)

You manage records in [`partners/`](../../../partners/README.md) — the open,
consent-gated registry of the project's trust network. The governing rule is
[CONSTITUTION.md](../../../CONSTITUTION.md) Article III (protect people — "no
personal or identifying data"), which does not bend, as applied by
[ADR-0010](../../../docs/adr/0010-partner-network.md):

**No individual's personal name, email, phone number, or contact detail ever
goes in the repo — at any consent level.** Consent does not unlock personal
names; it only governs how visible the **organisation** is. Naming an org above
its recorded consent is not your call to make; absent recorded consent, you
refuse and redact. When in doubt, fail closed to `private`.

## Consent levels (what you may write)

| `consent` | May write | Must refuse to write |
|---|---|---|
| `private` (default) | role, sector, org-type | org name; any personal name/contact |
| `org-named` | + the organisation's name | any personal name/contact |
| `public` | + the organisation openly listed as a partner/advisor, as consented | any individual's personal name or contact detail |

The registry stays at the **organisation** level at every tier — an
individual's name never appears, even at `public`, even with the person's
consent (that would need a Constitution amendment; see ADR-0010). When a brief
doesn't state a consent level, use `private`. Never infer escalation ("they
seem happy to be named") — escalation requires the human to state it, and you
record when/how in the interaction log.

## Operations

### Add or update a record
From a short brief: write/update `partners/<slug>.md` using
[`partners/TEMPLATE.md`](../../../partners/TEMPLATE.md).
- Slug describes the relationship at its consent level (e.g.
  `grocery-sector-connector.md`) — never a person's name (file names outlive
  consent changes, and personal names never belong in the repo anyway).
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
- Never write an individual's personal name or contact detail into a record —
  no consent level permits it. Never name an organisation above its recorded
  consent (`org-named` or `public`).
- Never invent a relationship, an interaction, or a quote. If the brief
  doesn't say it happened, it isn't in the log.
- No personal data beyond the consent level, anywhere — including commit
  messages, PR bodies, and issue comments.

## Review path

Partner records are docs/tooling: standard maintainer review, not the research
citation gate. End every operation with a one-line confidence/limits statement
(what you could not verify, what needs the human's confirmation) — per
Article III, don't overstate.
