# IR-0001: SME review via a guided (voice-optional) AI interviewer

- **Status:** exploring
- **Date:** 2026-07-09
- **Champions:** Matt (raised it), Adam (voice-driven adaptive questionnaire), Joe Sutheran (custom-GPT interviewer with a shareable transcript)
- **Discussion:** For Good WhatsApp thread, 2026-07-09 (during the first live SME review of the #442 aged-care funding guide)
- **Relates to:** stream [#442](https://github.com/thecolab-ai/the-for-good-project/issues/442); the SME expertise network ([#878](https://github.com/thecolab-ai/the-for-good-project/issues/878), [#883](https://github.com/thecolab-ai/the-for-good-project/issues/883)); the WhatsApp→Clawd→stream feedback loop ([#38](https://github.com/thecolab-ai/the-for-good-project/issues/38))

## The spark

We just ran the project's first real expert review: a contributor drafted the
aged-care funding guide via the "Open with…" no-code loop, and it went to an
SME (an aged-care banker) as a clean PDF, with corrections coming back in
plain WhatsApp. That works — but it leans on the SME reading a document and
writing freeform feedback. **Experts have the gold and often the least time
and, sometimes, the least technical patience.** How do we make giving that
expertise as effortless as possible — even for a busy or non-technical SME?

## The idea

A **guided AI interviewer**: a purpose-built assistant (a Custom GPT, or a
Claude/ChatGPT link, ideally voice-enabled) that is pre-loaded with:

1. **exactly what needs verifying** — the specific claims, numbers and
   confidence tags from the draft (e.g. the "numbers to verify" box); and
2. **how to ask good questions** — so it draws out the *useful* answer, not a
   generic one, and **adapts the next question based on the last answer**
   (Adam's voice-questionnaire pattern).

The SME just talks or types. At the end it produces a **structured, citable
transcript of corrections and context**, which comes back into the stream —
either posted automatically, or shared by the SME via a link (Joe's pattern).

## Why it could be great

- **Meets the SME where they are** — voice or chat, no GitHub, no markdown, no
  forms. The lowest-friction way to give expertise yet.
- **Adaptive beats a static form** — it follows the thread of what the expert
  actually knows, and can gently probe ("you said the cap's wrong — what's the
  right figure, and where would a family see it?").
- **Structured output** — turns a conversation into a tidy, attributable set of
  corrections a human steward can fold straight in.
- **Scales the expertise network** — the same pattern powers every future SME
  interaction, and the transcripts become part of the consented record
  (#878/#883).

## Open questions

- **Where does the transcript land?** Auto-posted to the stream, or SME shares
  a link? Consent and attribution rules (per the partner-network ADR) apply.
- **Voice tooling** — what's the simplest voice-in/voice-out path that doesn't
  need the SME to install anything?
- **Staying aligned** — how do we keep the interviewer pinned to the *actual*
  verification list so it doesn't wander or lead the witness?
- **Privacy** — no personal/identifying data captured; the expert's identity is
  handled at their consent level, never in the public repo.
- **Build vs. reuse** — Custom GPT is quickest to prototype but locks to one
  vendor; a model-agnostic version fits the project's ethos better.

## Cheapest experiment

Build **one** interviewer for the review that's live *right now*: pre-load a
Custom GPT (or a single well-crafted prompt) with the #442 guide's "numbers to
verify" box, have it walk Jay through the figures one at a time — by voice if
he likes — and output a clean correction list. If Jay finds it easier than
red-penning the PDF, the idea's real. Total cost: an afternoon.

---
*This is an idea, not a commitment. It records thinking so it isn't lost — a
human decides if and when it graduates to an issue or an ADR.*
