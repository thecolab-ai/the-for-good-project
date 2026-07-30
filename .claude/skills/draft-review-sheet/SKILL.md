---
name: draft-review-sheet
description: Use when a steward asks for a review sheet (a Paper Round pack) for a stream — drafts the SME-facing email from the stream overview using streams/REVIEW-SHEET.md, quoting 5–8 claims verbatim with confidence tags, bounded to factual verification plus two judgement questions. The steward edits, approves, and sends; the agent never contacts a reviewer and never files feedback itself.
---

# Draft a review sheet (steward approves, agent drafts)

You draft the email a non-technical domain expert receives in a review round
([ADR-0026](../../../docs/adr/0026-human-review-paper-round.md), SOP:
[docs/REVIEW-ROUND.md](../../../docs/REVIEW-ROUND.md)). Your output is a
**draft for the steward to edit** — never send it, never file it, never put it
anywhere but in front of the steward.

## Inputs

A stream number or overview path (`streams/<n>-<slug>.md`). Read the overview
and, where a claim's origin matters, the linked findings in
`research/findings/`. If the steward names the reviewer's domain (e.g. "he's a
banker — funding claims only"), select claims accordingly.

## What to produce

Fill [`streams/REVIEW-SHEET.md`](../../../streams/REVIEW-SHEET.md) exactly:

1. **5–8 claims, quoted verbatim** from the overview's "What we've learned so
   far" (or the findings behind it), each with its **confidence tag carried
   unchanged**. Prefer claims that are load-bearing, surprising, Low/Medium
   confidence, or squarely inside this reviewer's expertise. Never paraphrase
   a claim you're asking someone to verify.
2. Each claim answerable **Right / Wrong / Can't say**, with the
   what/why/where-would-we-check prompt when wrong. Factual verification only
   — never ask for rewrites, never ask them to read the repo.
3. **Exactly two judgement questions** at the end: "worth pursuing?" and a
   choice between the overview's candidate outcomes (use its real options;
   leave `TODO(steward)` if the overview has none yet).
4. The attribution ask, unchanged from the template — role-only / org-named /
   org-credited. **Never offer personal-name attribution; no consent tier
   permits it** (ADR-0010).

## Hard rules

- **Neutral phrasing — don't lead the witness.** "Right / Wrong / Can't say",
  never "we believe X, do you agree?".
- **Plain language, under two screens on a phone.** No jargon, no issue
  numbers, no links into GitHub.
- **You draft; the human decides.** Do not edit `streams/` overview docs, do
  not open issues, do not email anyone. Hand the draft to the steward and
  state which claims you left out and why, so the steward can overrule you.
- If the overview has fewer than 5 solid claims, say so and draft with what
  exists rather than padding with weak ones.
