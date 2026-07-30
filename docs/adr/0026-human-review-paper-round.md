# ADR-0026: The human review stage runs as a steward-mediated email round ("the Paper Round") — no GitHub required of the reviewer

- **Status:** proposed
- **Date:** 2026-07-15
- **Deciders:** maintainer (on merge); researched and drafted by agents at the maintainer's request
- **Discussion:** direct maintainer request; design research recorded in [`analysis/human-review-system-design.md`](../../analysis/human-review-system-design.md)

## Context

The people whose judgement the project most needs — SMEs, practitioners, affected
communities — will never use GitHub, markdown, or a CLI ([`docs/STREAMS.md`](../STREAMS.md)
§Roles says exactly this, and promises "no GitHub required"). Today that promise has no
mechanism: the first real SME review (stream #442, recorded in
[IR-0001](../ideas/0001-sme-review-via-guided-ai-interviewer.md)) ran as a PDF out and
freeform WhatsApp back, its consent trail lived in one person's inbox, and the #442
Feedback log is still empty. The `feedback` label exists (`.github/labels.yml`) but nothing
defines how a non-GitHub person's input reaches it.

A multi-agent research pass (six angles, load-bearing claims adversarially fact-checked —
23 of 24 confirmed; full record in the analysis doc) established the hard constraints:
GitHub has **no anonymous write path** — every account-less design is some proxy writing
under an identity we control ([GitHub REST docs](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)) —
and the strongest precedent at national scale is GOV.UK's fact-check flow, where the
expert's entire job is **replying to an email** and a script/human lands it in the CMS
([GOV.UK publisher docs](https://docs.publishing.service.gov.uk/repos/publisher/fact-checking.html)).
Structured, bounded questions measurably beat open feedback boxes
([Elsevier structured-review pilot: 92% completion](https://peerj.com/articles/17514/) vs
[Wikipedia's discontinued ~12%-useful feedback tool](https://www.mediawiki.org/wiki/Article_feedback/Version_5/Report)).
Three designs were drafted and judged through reviewer-friction / operability /
trust-safety lenses; steward-mediated email won decisively over a web review surface and
an AI-interviewer-first design (scores and rationale in the analysis doc). ADR-0010's
consent gate binds absolutely: no individual's name or contact detail in the repo at any
tier; organisations named only at their recorded consent.

## Decision

We will run the human review stage as **the Paper Round**: a steward-mediated email
review round, hardened with mechanical consent enforcement and a privacy SOP. The
reviewer's entire job is *reading a short review sheet and replying to an email from
someone they know* — the only journey with zero novel steps for a non-technical expert.
The **human steward is the bridge into GitHub**; no new servers, tokens, or endpoints.

Components (all shipped by this ADR's implementing PR):

1. **A bounded review sheet** ([`streams/REVIEW-SHEET.md`](../../streams/REVIEW-SHEET.md)):
   5–8 claims quoted verbatim with their confidence tags, each answerable
   *Right / Wrong / Can't say* (+ what/why/where-to-check when wrong — GOV.UK's
   fact-check bounding), plus at most two judgement questions. Never a rewrite request,
   never one big open box.
2. **An agent-drafted, steward-approved sheet** ([`draft-review-sheet` skill](../../.claude/skills/draft-review-sheet/SKILL.md)):
   the agent only drafts from the stream overview; the steward edits, approves, and
   sends. Judgement stays human (ADR-0001/0003/0007).
3. **A structured landing form** ([`.github/ISSUE_TEMPLATE/5-feedback.yml`](../../.github/ISSUE_TEMPLATE/5-feedback.yml)):
   the steward (or whoever captured the feedback) files one `feedback`-labelled issue per
   reviewer per round, carrying the verdicts, a required **consent-tier field**, a
   `Stream: #<n>` line for label propagation, and a provenance footer saying who filed on
   whose behalf.
4. **Mechanical consent enforcement** ([`scripts/check-feedback-consent.mjs`](../../scripts/check-feedback-consent.mjs)
   via [`.github/workflows/feedback-consent.yml`](../../.github/workflows/feedback-consent.yml)):
   on every `feedback` issue, validate the consent tier, org-naming against the
   `partners/` registry, and scan for emails/phone numbers/secrets — **failing closed**
   with the exact fix. The same workflow counts rounds per 30 days so the escalation
   trigger below is observable, not self-reported.
5. **A privacy SOP** ([`docs/REVIEW-ROUND.md`](../REVIEW-ROUND.md)): sanitize-before-agent
   (raw PII never enters an LLM context), a read-back step before filing, a 30-day
   retention rule for raw replies, and an NZ Privacy Act IPP3 notice that names every
   channel recipient (including Meta when WhatsApp is used).
6. **A redaction wrapper** (`npm run redact-check`) reusing the fleet's existing
   [`server/clients/redact-patterns.mjs`](../../server/clients/redact-patterns.mjs) plus
   email/phone detection, run before any feedback text is filed.

Consent is recorded per round in the durable `partners/` record via the `manage-partner`
skill (timestamped, surviving steward handover), never only in an inbox. Attribution
ceiling per ADR-0010: **role + organisation-at-consent-tier, never a personal name** — no
tier permits one, so the system doesn't offer it.

Options seriously considered and rejected:

- **A web review surface** ("Review Rooms": dashboard page + fleet-server endpoint + bot
  filing) — rejected for v1: new endpoint/token/moderation surface to babysit, OTP login
  cliff for the least technical users, PII on hobby infrastructure. It is the
  **pre-agreed v2** once volume demands it (tripwire below), reusing this ADR's
  `feedback.yml` structure.
- **AI-interviewer-first** (IR-0001 as the primary channel) — rejected as the *default*:
  every no-account voice path adds a vendor, cost, and consent complexity, and Custom
  GPT / Claude links require reviewer accounts ([OpenAI](https://help.openai.com/en/articles/8554407-gpts-faq),
  [Anthropic](https://support.claude.com/en/articles/9519189-manage-project-visibility-and-sharing)).
  It stays a v2 rung for talk-first SMEs (e.g. an ElevenLabs widget needs no reviewer
  account — [docs](https://elevenlabs.io/docs/eleven-agents/customization/widget)), feeding
  the same sheet and filing flow.
- **Per-reviewer capability URLs** — rejected: unguessable links get harvested into public
  scanner archives; possession of a URL must not grant access
  ([Pulse Security](https://pulsesecurity.co.nz/articles/unguessable_url_issues)). Email to
  a known address avoids the class entirely.
- **This is not a change of channel decision:** ADR-0001 recorded "WhatsApp/community bot
  first" (#38). The Paper Round is that decision's *manual v1* — the #38 bridge, when
  built, feeds the same `feedback.yml` structure and SOP rather than replacing them.

## Consequences

Easier: an SME can shape a stream from their phone with zero new skills; feedback gains a
durable, labelled, stream-linked home with an auditable consent trail; the steward's pack
assembly drops from ~20 minutes to a ~5-minute edit pass; $0/month and nothing that can
break in front of a reviewer. Harder / accepted costs: the steward is a human bottleneck
(~15 min/round) and a bus factor — mitigated by the agent draft, a named deputy in the
SOP, and consent trails that survive handover; mechanical checks cannot catch every
disclosure (a personal name in prose passes the regexes) — the SOP's sanitize + read-back
steps and non-author adversarial review remain the real guard; raw replies live briefly
in a private inbox — bounded by the 30-day deletion rule.

Tripwire: when the consent workflow's counter shows **more than 5 rounds in 30 days**, or
more than 3 stewards run rounds concurrently, the email round is saturating — that is the
signal to take "Review Rooms" (v2) off the shelf via a superseding ADR, solving its OTP
and data-custody problems first.
