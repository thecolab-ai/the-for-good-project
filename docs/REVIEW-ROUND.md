# Running a review round (the Paper Round)

How a person who will never touch GitHub reviews our work — and how their
judgement lands in the repo safely. This is the operating procedure for
[ADR-0026](adr/0026-human-review-paper-round.md). The reviewer's entire job is
**reading a short sheet and replying to an email from someone they know**.
Everything else is yours (the steward's).

> **Roles.** *Reviewer*: the SME / practitioner / community member giving
> judgement — no GitHub, no markdown, no account, ever. *Steward*: the human
> running the round and bridging it into GitHub. *Agent*: drafts and checks
> under your approval; it never contacts the reviewer and never files without
> your sign-off.
>
> **Named responsibilities** (fill these in — an SOP with unnamed owners is a
> wish): privacy officer: `TODO(maintainer)`; deputy steward: `TODO(maintainer)`.
> Even community groups need a privacy officer under the
> [NZ Privacy Act](https://www.privacy.org.nz/responsibilities/your-obligations/).

## The round, step by step

### 1. Draft the review sheet (~5 min)

Run the [`draft-review-sheet`](../.claude/skills/draft-review-sheet/SKILL.md)
skill against the stream's overview (`streams/<n>-<slug>.md`). It extracts 5–8
claims **verbatim, with their confidence tags**, into the
[`streams/REVIEW-SHEET.md`](../streams/REVIEW-SHEET.md) format. **Edit and
approve it yourself** — cut claims the reviewer can't speak to, fix the two
judgement questions, keep it under two screens. The agent drafts; you decide.

Bound it like GOV.UK bounds fact-checks
([guidance](https://www.gov.uk/government/publications/how-content-requests-from-government-get-published/fact-checking-content-on-govuk)):
factual verification — *what's wrong, why, where would we check* — never a
rewrite request.

### 2. Send it — email by default

Email the sheet body (not an attachment) from your own address to the
reviewer's known address. Include the **privacy notice** (below) the first time
you review with someone, and the consent ask every round. Use WhatsApp only
where it's already the reviewer's proven channel — and then the notice must
name **Meta** as a recipient of the message content.

If the reviewer would rather talk, phone them and fill the sheet yourself
during the call — NZ's written-first, oral-follow-up consultation norm
([govt.nz](https://www.govt.nz/browse/engaging-with-government/consultations-have-your-say/give-feedback-on-a-bill-before-parliament/)).

### 3. Receive the reply

Inline answers to the numbered items are ideal; **a half-structured blob is
fine by design** — the numbered sheet makes even a blob parseable against known
claims. Don't send it back for reformatting; that's your job, not theirs.

### 4. Sanitize, then transcribe (~10 min)

Your inbox is the moderation queue: nothing reaches the repo unread by a human.

**Hard rule — sanitize before any agent sees the text.** Strip email headers,
signature, personal names, and contact details *first*; only then may an agent
help you transcribe the sanitized text into the
[feedback issue form](../.github/ISSUE_TEMPLATE/5-feedback.yml). Raw PII never
enters an LLM context. If the reply mentions **third parties** (a colleague, a
named client), strip that detail too (IPP3A — collection from the individual
concerned, [in force May 2026](https://www.justice.govt.nz/about/news-and-media/news/new-privacy-information-principle-in/)).

Before filing, run the mechanical redaction pass over your draft body:

```
npm run redact-check -- draft.md
```

It flags emails, phone numbers, and anything shaped like a secret (reusing the
fleet's [`redact-patterns.mjs`](../server/clients/redact-patterns.mjs)). It
cannot spot a personal name in prose — that's what this step and step 5 are for.

### 5. Read back

Email the reviewer the transcribed verdicts before filing: *"Here's what I'll
record — reply if I've misquoted you."* The reviewer sees their words before
they're public. No filing until they've confirmed (or corrected).

### 6. File it

Open one **[💬 Stakeholder feedback](../.github/ISSUE_TEMPLATE/5-feedback.yml)**
issue per reviewer per round. It carries: the `Stream: #<n>` line (which
propagates the stream label automatically), the verdict table, the reviewer as
**role + sector only**, the **consent tier**, and a provenance footer — who
filed, on whose behalf, and where consent is recorded.

The [`feedback-consent` workflow](../.github/workflows/feedback-consent.yml)
then validates it mechanically and **fails closed**: missing consent tier,
an organisation named above its recorded consent in [`partners/`](../partners/README.md),
or any email/phone/secret in the body gets the issue flagged
`feedback: needs-fix` with the exact repair. Record the consent (tier + date +
how it was given) in the reviewer's `partners/` record via the
`manage-partner` skill — durable and auditable, not trapped in your inbox.

### 7. Close the loop

- Fold accepted corrections into findings via normal PRs (they get non-author
  adversarial review like everything else).
- Add the row to the stream overview's **Feedback log**
  (`Date | Who (role, not name) | What they said | What we did`) — the overview
  is yours alone to edit; automation never touches `streams/`.
- Reply to the reviewer with the public link to what changed. "We asked, you
  said, we did" ([DPMC's pattern](https://consultation.dpmc.govt.nz/)) is what
  keeps reviewers coming back — unpublished feedback drives contributors away
  ([Community Notes retention evidence](https://arxiv.org/html/2510.00650v1)).
  The round is not done until the "What we did" cell is filled and the outcome
  email is sent.

### 8. Retention

Delete the raw reply email once the round closes (read-back confirmed, consent
recorded in `partners/`) — **30 days maximum**. The inbox must not become an
unmanaged store of expert PII. What survives: the sanitized issue, the
Feedback-log row, and the consent trail in `partners/`.

## The privacy notice (IPP3)

Include this (adapted) the first time you review with someone — the
[Privacy Act's collection notice](https://www.privacy.org.nz/responsibilities/collecting/)
duties apply to us like anyone else:

> We're collecting your review comments to improve published research at The
> For Good Project. Your answers may appear publicly in summarised form. Your
> personal name and contact details are **never published, at any level** —
> you choose whether we describe you by role only (e.g. "an aged-care banker"),
> name your organisation, or credit your organisation publicly, and you can
> change your mind later (we'll redact). This exchange travels over email
> [**and WhatsApp, which means Meta processes the message content**], and is
> deleted within 30 days of the round closing. Questions or corrections:
> contact `TODO(maintainer: privacy officer contact)`.

## Consent tiers (ADR-0010 — the ceiling does not move)

| Tier | What the repo may say | What it may never say |
|---|---|---|
| `private` (default) | "an aged-care banker (15 yrs)" | any org name; any personal name/contact |
| `org-named` | "a banker at {Org}" | any personal name/contact |
| `public` | the organisation openly credited | any personal name/contact |

Revocation (IPP7): the reviewer can ask at any time; the steward edits/redacts
the issue and updates the `partners/` record. When in doubt, fail closed to
`private`.

## When this SOP is no longer enough

The consent workflow counts rounds automatically. **More than 5 rounds in 30
days, or more than 3 stewards running rounds** = the email round is saturating.
That's the pre-agreed trigger (ADR-0026) to bring up the v2 web review surface
— don't improvise infrastructure before the trigger fires.
