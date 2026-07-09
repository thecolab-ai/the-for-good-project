---
stream: 199
title: "New Zealanders keep asking government the same questions — some answers should just be public"
state: awaiting-direction
steward: ""
domain: civic-transparency
updated: 2026-07-04
image: /images/streams/stream-199-oia-open-by-default.jpg
---

<!--
The Stream Overview is written for someone who will NEVER touch GitHub or a CLI.
No jargon, no repo-speak, no issue numbers in the prose (link them instead).
Keep it under two screens — this is a briefing, not an archive.
-->

# New Zealanders keep asking government the same questions — some answers should just be public

## The problem, in plain language

Anyone in New Zealand can ask a government body for information under the
Official Information Act (OIA), and each request is answered by hand, one at a
time. That work now costs an estimated $184 million a year and is growing.
Many requests ask for the same *kinds* of information — spending, staffing,
contracts, ministerial briefings — which suggests some of it should simply be
published for everyone, by default, instead of answered over and over. This
stream ([tracked here](https://github.com/thecolab-ai/the-for-good-project/issues/199))
researched whether that idea holds up: what the request archive actually
shows, what answering requests really costs, and which datasets are the
strongest candidates to be open by default. A round of research is now
complete and a human steward needs to decide where it goes next.

## What we've learned so far

- **The cost is real and officially estimated at about $183.6 million for
  2024/25, across roughly 159,000 completed requests, forecast to reach
  $342 million by 2030/31 — but that figure is a workload baseline, not a
  "savings available" number.** It comes from one government-commissioned
  model, and the underlying statistics don't record whether requests repeat
  already-published information. (confidence: Medium) —
  [cost baseline](../research/findings/civic-transparency/oia-cost-proactive-release.md)
- **Request volume is extremely concentrated: Police alone completed about
  42% of central-government requests in 2025, and the top three bodies —
  Police, the Natural Hazards Commission (the former EQC), and Corrections —
  about 66%.** The concentration itself is well evidenced from official data,
  but that 66% is a share of request *volume* only — it says nothing about
  what kinds of requests those are. (confidence: High for the concentration) —
  [which bodies and topics repeat](../research/findings/civic-transparency/repetitive-oia-requests-bodies-topics.md)
- **The follow-up check on those three high-volume bodies confirmed the
  "mostly personal records" explanation in direction for only one of them —
  and found it can't currently be measured for the other two.** The Natural
  Hazards Commission states itself that its most common request is claims
  information about a specific property — an individual record no open
  dataset could replace. Corrections runs a separate channel for requests
  from prisoners but doesn't record what type of requests they are, and
  Police divert "information about yourself" requests to a different law
  entirely, so what actually makes up Police's huge OIA count is unknown. No
  agency publishes a request-type breakdown, so how much of the headline
  volume open data could ever address cannot be measured from public sources
  today. (confidence: Medium for what each agency's channels show; Low for
  any claim that personal records *dominate* Police or Corrections volume) —
  [what the biggest requestees actually handle](../research/findings/civic-transparency/oia-request-types-police-corrections-nhc.md)
- **The topics that recur in the public archive are the accountability
  staples: spending and budgets, staffing, contracts and consultants, policy
  advice, and ministerial briefings — about 44% of a committed sample of
  request titles matched at least one such theme.** But strictly duplicated
  requests were rare in that sample (~2% of titles), so how *much* repetition
  exists is genuinely unknown; the clearest verified repetition is identical
  requests sent to many bodies at once. (confidence: Medium for the topic
  mix; Low for any repetition rate) —
  [which bodies and topics repeat](../research/findings/civic-transparency/repetitive-oia-requests-bodies-topics.md)
- **A dollar case for proactive release can only be scenario arithmetic
  today: each 1,000 routine requests avoided would be worth roughly $0.35
  million, and each 1,000 complex requests roughly $3.5 million — but nobody
  measures how many requests any given release would actually avoid.**
  (confidence: Medium) —
  [cost baseline](../research/findings/civic-transparency/oia-cost-proactive-release.md)
- **New Zealand already has an open-by-default policy regime, so the
  opportunity is filling specific gaps, and six candidate datasets have been
  shortlisted:** a central index of released OIA responses, all-agency
  registers of advice titles, richer procurement and contract-spend data,
  more detailed workforce and contractor data, council project and service
  data, and public registers of CCTV/number-plate cameras. The first — a
  central index of what's already been released — is also the measurement
  layer that would let the savings finally be counted. (confidence: Medium) —
  [open-by-default shortlist](../research/findings/civic-transparency/open-by-default-dataset-shortlist.md)
- **The public request archive at fyi.org.nz can support this analysis using
  aggregate metadata only — but a full-corpus pull needs the volunteer
  operators' permission first, and strict de-identification throughout,
  because requests carry people's real names.** The site's own rules ask
  crawlers to stay away from key pages, and the responsible route is to ask
  before pulling. (confidence: Medium) —
  [archive feasibility](../research/findings/civic-transparency/fyi-oia-corpus-feasibility.md)
- **The overall idea survives scrutiny: the problem is real, the data is
  tractable, and government's own advisers recommend proactive release** —
  though the original "~$180m/year" community figure checked out at $183.6m,
  with the caveat that it is a single-origin estimate. (confidence: Medium) —
  [stream framing](../research/findings/civic-transparency/oia-meta-analysis-open-by-default.md)

## What we're not sure about yet

- **How much repetition actually exists — the load-bearing number for the
  whole idea — is unmeasured.** An early estimate of ~23% near-duplicate
  requests was withdrawn as unreproducible; the honest committed figure is
  ~2% of sampled titles, with the true rate "unknown but plausibly higher"
  because measuring it properly needs request *text*, which contains personal
  data and needs the archive operator's consent to process safely.
- **There is a tension between the headline cost and where open data can
  help — now sharper, but still unresolved.** The $184m baseline is dominated
  by three high-volume bodies. A dedicated follow-up tested whether their
  requests are mostly personal records no published dataset would replace:
  the answer is yes-in-direction for the Natural Hazards Commission (by its
  own account), unknowable for Corrections (the agency doesn't collect
  request-type data — its own oversight review calls that a lost
  opportunity), and unknown for Police (whose residual OIA mix is visibly
  varied and unpublished). If those bodies in fact field many policy
  requests, the addressable savings picture changes materially, in either
  direction — and the one reliable way to settle it is now clear: asking the
  agencies themselves for their internal request-category counts, since the
  answer exists nowhere in public.
- **No per-dataset saving can be stated.** Every shortlisted candidate
  carries a mechanism ("this kind of release avoids this kind of request")
  but no measured count of avoidable requests; the government's own follow-up
  research, due in 2026, may fill this.
- **Several load-bearing numbers are single-sourced:** the $183.6m baseline
  and its forecast come from one commissioned model; the exact 42%/66%
  concentration shares come from one official dataset (though the direction
  is corroborated); the topic-mix percentages come from one committed sample;
  and the Natural Hazards Commission's "most common request type" is the
  agency's own self-description, with no published percentage behind it.
- **Nobody has asked fyi.org.nz yet.** Permission for a larger pull, the
  site's preferred limits, and even who can grant approval are all unknown —
  a human conversation, not more desk research.
- **Local councils are a blind spot.** They answer under a separate law, are
  absent from the official statistics, and the central-government cost model
  does not transfer to them — yet they are heavily represented in the public
  archive.

## What we could do about it

- **Publish a plain-English public report: what OIA answering costs, which
  topics people ask about again and again, and the six-dataset open-by-default
  shortlist with the honest caveats.** Helps: journalists, civil-society
  groups, officials, and anyone arguing for proactive release. Effort: Small.
  Supported by the
  [cost baseline](../research/findings/civic-transparency/oia-cost-proactive-release.md)
  (confidence: Medium), the
  [shortlist](../research/findings/civic-transparency/open-by-default-dataset-shortlist.md)
  (confidence: Medium), and the
  [repeat-request analysis](../research/findings/civic-transparency/repetitive-oia-requests-bodies-topics.md)
  (confidence: Medium). Would need: careful wording so unmeasured savings are
  never presented as measured, and a human review before anything is
  published externally.
- **Measure the two numbers everything else depends on: ask the fyi.org.nz
  volunteers for permission to run a consented, de-identified analysis of the
  full archive (how much repetition exists), and ask Police, Corrections and
  the Natural Hazards Commission — using the OIA itself — for their internal
  request-category counts (how much of their volume is personal-record
  work).** Helps: this stream (it replaces its two weakest numbers) and the
  archive operators themselves. Effort: Medium. Supported by the
  [feasibility study](../research/findings/civic-transparency/fyi-oia-corpus-feasibility.md)
  (confidence: Medium), which sets out the metadata-first method, the privacy
  pipeline, and the contact route, and by the
  [request-type check](../research/findings/civic-transparency/oia-request-types-police-corrections-nhc.md)
  (confidence: Medium), which found no agency publishes the split and names
  asking the agencies as the one reliable way to get it. Would need: the
  archive operators' agreement, the privacy safeguards already designed
  (aggregate-only, no names or request text stored), and a human to make and
  sign the requests to the agencies.
- **Champion one shortlist candidate — a central, machine-readable index of
  OIA responses agencies have already published — as a concrete proposal to
  government.** Helps: requesters (find answers before asking), agencies
  (deflect repeats), and researchers (it creates the missing measurement
  layer every savings claim depends on). Effort: Medium for the proposal;
  Large if the team prototyped the index itself. Supported by the
  [shortlist](../research/findings/civic-transparency/open-by-default-dataset-shortlist.md)
  (confidence: Medium) and the
  [cost baseline](../research/findings/civic-transparency/oia-cost-proactive-release.md)
  (confidence: Medium). Would need: engagement with the Public Service
  Commission or agencies, and a schema that excludes personal information.
- **Run a council-focused round: which councils field repeat requests, for
  what, and what a council-side open-by-default shortlist looks like.**
  Helps: ratepayers and local journalists in a space the official statistics
  don't cover at all. Effort: Medium. Supported by the
  [repeat-request analysis](../research/findings/civic-transparency/repetitive-oia-requests-bodies-topics.md)
  (confidence: Medium for councils' prominence in the archive) and the
  [shortlist](../research/findings/civic-transparency/open-by-default-dataset-shortlist.md)
  (confidence: Medium). Would need: council disclosure logs and archive data,
  since the central-government cost model doesn't apply.

## Where this is heading

> **TODO(steward): direction decision** — go deeper / pivot / proceed / park.

Signal: the findings are mutually consistent — the newest one refines rather than contradicts the earlier round — but the stream's two central quantities (how much repetition exists, and how much of the high-volume agencies' work is personal records) remain unmeasured, and every finding sits at Medium overall confidence.
Signal: the newest finding shows the remaining unknowns cannot be closed by more desk research — they need human actions: contacting the fyi.org.nz volunteers, and OIA requests to the agencies themselves for their internal request-category counts.
Signal: the government's own 2026 follow-up cost research (surveying ~40 agencies) may soon answer the repeat-request question for free; timing a decision around it may matter.

## Feedback log

Feedback from people who know this domain — captured here so it steers the work:

| Date | Who (role, not name if private) | What they said | What we did |
|---|---|---|---|
|  |  |  |  |
