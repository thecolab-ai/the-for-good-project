---
title: "Design research: how non-GitHub people participate in the human review stage"
type: "analysis"
status: "record" # records the research behind ADR-0026; the ADR is the decision
author: "adam (request); multi-agent research run (execution)"
agent: "claude"
model: "undisclosed — this session's policy withholds the model identifier from pushed artifacts"
date: "2026-07-15"
---

# Design research: the human review system

The evidence base behind [ADR-0026](../docs/adr/0026-human-review-paper-round.md)
(the Paper Round). The question: **what is the best way to let people who don't
know how to use GitHub participate in the human review stage** — SMEs correcting
claims, stakeholders redirecting streams, outside judgement feeding the G1/G2
gates?

## Method

A structured multi-agent run (38 agents): one agent grounded the repo's
constraints; six researched independent angles with mandatory inline citations;
every load-bearing claim was then **adversarially fact-checked** by a separate
agent instructed to refute it (24 claims: 23 confirmed, 1 refuted and excluded);
three competing designs were drafted under opposed philosophies and scored by a
three-lens judge panel (non-technical reviewer friction / volunteer operability
/ trust & safety); a synthesis grafted the judges' best-of-losers picks onto the
winner. Confidence carried below is the fact-checkers', not the researchers'.

## The one hard constraint everything follows from

**GitHub has no anonymous write path.** Creating an issue or comment requires an
authenticated token; unauthenticated access is 60 read-only requests/hour
([GitHub REST docs](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api),
[issues API](https://docs.github.com/en/rest/issues/issues)) — and comment
widgets like giscus also require a GitHub sign-in
([giscus.app](https://giscus.app/)). *(Confirmed.)* So every "no-account" design
is a **proxy**: some identity we control writes on the reviewer's behalf, and
the design question is really *which proxy* — a bot behind a form, a vendor
platform, or a human. The Paper Round's answer: **the human steward is the
proxy**, because a human proxy is also the moderation queue, the consent
handler, and the PII filter, at zero infrastructure.

## What the six angles established (verified highlights)

- **GitHub-free bridges** — form→bot pipelines (a GitHub App installation token
  is rate-limited to 80 content-writes/min, 500/hr, and self-expires after 1 h —
  [docs](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation);
  *confirmed*) are viable but bring spam handling, token custody, and an
  endpoint to babysit. GitHub's own reply-by-email only works from the account
  bound to the notification address ([GitHub blog](https://github.blog/news-insights/reply-to-comments-from-email/); *confirmed*).
- **Civic-tech platforms** — Pol.is is self-hostable and NZ-proven (Scoop
  HiveMind, 1,700+ participants; a government agency used the biodiversity
  conversation for the national strategy —
  [case study](https://compdemocracy.org/case-studies/2016-new-zealand-scoop-hivemind/);
  *confirmed*), but it answers "what does a crowd think", not "is this claim
  right". Loomio (Wellington co-op) has no free production tier
  ([pricing](https://www.loomio.com/pricing/); *confirmed*). Verdict: imitate UX
  patterns, adopt nothing.
- **Expert-review UX** — structure beats freeform decisively: Elsevier's
  9-question structured review pilot got 92% full completion and raised
  reviewer agreement to 41% vs a 31% freeform baseline
  ([PeerJ](https://peerj.com/articles/17514/); *confirmed*), while Wikipedia's
  open feedback box produced ~12% useful input and was discontinued
  ([report](https://www.mediawiki.org/wiki/Article_feedback/Version_5/Report);
  *confirmed*). NZ government already runs "We asked, you said, we did"
  loop-closing on Citizen Space ([DPMC hub](https://consultation.dpmc.govt.nz/); *confirmed*).
- **Identity & consent** — magic-link auth needs server-side state
  ([Auth.js docs](https://authjs.dev/getting-started/authentication/email);
  *confirmed*) and free tiers pause or cap
  ([Supabase](https://supabase.com/pricing); *confirmed*); unguessable
  capability URLs get harvested into public scanner archives, so a link alone
  must never grant access
  ([Pulse Security](https://pulsesecurity.co.nz/articles/unguessable_url_issues);
  *confirmed*). Email to a known address sidesteps the whole class.
- **AI-guided interviews (IR-0001)** — Custom GPTs require the participant to
  sign in ([OpenAI FAQ](https://help.openai.com/en/articles/8554407-gpts-faq);
  *confirmed*), Claude Projects share only within an organisation
  ([Anthropic](https://support.claude.com/en/articles/9519189-manage-project-visibility-and-sharing);
  *confirmed*); the only genuinely account-free voice path found was an
  embedded public agent widget (e.g. ElevenLabs, ~$0.08/min
  [pricing](https://elevenlabs.io/pricing/agents); *confirmed*) — workable, but
  a vendor + cost + consent surface that doesn't belong in v1.
- **Comparable projects** — the strongest precedent is GOV.UK's SME fact-check:
  the expert **replies to an email**; a script polls the inbox and lands the
  review against the right edition
  ([publisher docs](https://docs.publishing.service.gov.uk/repos/publisher/fact-checking.html);
  *confirmed*), with reviewers bounded to factual inaccuracies — what/why/where,
  never rewrites ([guidance](https://www.gov.uk/government/publications/how-content-requests-from-government-get-published/fact-checking-content-on-govuk);
  *confirmed*). Retention evidence: personal invitations beat portals
  ([Teahouse experiment](https://www.opensym.org/wp-content/uploads/2018/07/OpenSym2018_paper_15-1.pdf);
  *confirmed*), and seeing your input published measurably retains contributors
  ([Community Notes study](https://arxiv.org/html/2510.00650v1); *confirmed*).

**Refuted and excluded:** "Decidim's API is read-only, preventing a two-way
bridge" — its GraphQL API documents write mutations
([docs](https://docs.decidim.org/en/develop/develop/api/)); no design relied on it.

## The three designs and how they scored

Judge panel: three lenses × four criteria (reviewer friction, operability,
trust & safety, repo fit), each 1–10; max 120.

| Design | Core idea | Score |
|---|---|---|
| **The Paper Round** (minimal-ops) | Steward-mediated email review; the human is the bridge; zero new infrastructure | **103** |
| Review Rooms (web-first) | Dashboard review page + fleet-server endpoint + bot filing behind a moderation queue | 78 |
| Conversation-first | The IR-0001 AI interviewer as the primary channel; forms as fallback | 60 |

The judges' consistent findings: the email journey is the only one with **zero
novel steps** for a non-technical reviewer; the web design adds an endpoint,
token, OTP login cliff, and PII custody on hobby infrastructure; the
interviewer design has the worst account/vendor constraints for v1 but is the
right *optional* rung later. Weaknesses the synthesis fixed in the winner:
pack-assembly labour (→ agent-drafted, steward-approved sheets), consent
living in an inbox (→ recorded in `partners/` via `manage-partner`, enforced
by an Action that fails closed), and an unmanaged PII trail (→
sanitize-before-agent, mechanical redaction, read-back, 30-day retention).

## What shipped (the implementing PR)

[ADR-0026](../docs/adr/0026-human-review-paper-round.md) ·
[docs/REVIEW-ROUND.md](../docs/REVIEW-ROUND.md) (SOP) ·
[streams/REVIEW-SHEET.md](../streams/REVIEW-SHEET.md) (sheet template) ·
[`draft-review-sheet` skill](../.claude/skills/draft-review-sheet/SKILL.md) ·
[feedback issue form](../.github/ISSUE_TEMPLATE/5-feedback.yml) ·
[consent validator](../scripts/check-feedback-consent.mjs) +
[workflow](../.github/workflows/feedback-consent.yml) ·
[`npm run redact-check`](../scripts/redact-check.mjs).

## Confidence & limits

- Every claim marked *confirmed* above survived an adversarial fact-check
  against its primary source by a separate agent; the one refuted claim is
  listed and was excluded from the design. Confidence in those cited facts:
  **High**.
- The judge scores are structured model judgement, not measurement — they
  triangulate three lenses but remain opinion. Confidence that the ranking is
  directionally right: **Medium-High** (the margins were large and the
  rationales consistent); confidence in the exact numbers: Low, by nature.
- The design has **not yet been proven with a real reviewer**. The acceptance
  test is running a round end-to-end on stream #442 and filling its empty
  Feedback log — until then, completion-rate claims are transferred evidence
  (GOV.UK, Elsevier), not local evidence.
- Vendor facts (pricing, account requirements) are point-in-time as of
  2026-07-15 and drift; re-verify before building any v2 rung on them.

## What would change this design

- The escalation tripwire firing (>5 rounds/30 days, machine-counted) — then
  Review Rooms comes off the shelf via a superseding ADR.
- Evidence that reviewers *don't* complete emailed sheets (track per-round
  completion in the Feedback logs) — then test the one-claim-per-screen card
  UI ([GOV.UK form-structure guidance](https://www.gov.uk/service-manual/design/form-structure)).
- A talk-first SME cohort — then pilot the IR-0001 interviewer as a capture
  rung feeding this same filing flow.
