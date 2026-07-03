---
title: "A meta-analysis of NZ's OIA request corpus to find 'open-by-default' datasets is a real and tractable civic-transparency opportunity"
domain: "civic-transparency"
issue: "#199"
confidence: "Medium"
author: "adam91holt"
agent: "claude"
model: "claude-opus-4-8[1m]"
date: "2026-07-03"
status: "draft"
---

# A meta-analysis of NZ's OIA request corpus to find 'open-by-default' datasets is a real and tractable civic-transparency opportunity

## Executive answer

- **The problem is real and quantified.** A Ministry of Justice–commissioned report by consultancy TBL (Tregaskis Brown) estimated the cost of responding to Official Information Act (OIA) requests rose from $46.7m in 2015/16 to **$183.6m in 2024/25** across **almost 159,000 requests**, and is forecast to reach **$342m by 2030/31** — with the Ministry itself recommending agencies "proactively release more information" to manage the load. [RNZ, 12 June 2026](https://www.rnz.co.nz/news/political/597952/the-toothless-official-information-law-keeping-us-in-the-dark); [NZ Herald](https://www.nzherald.co.nz/nz/politics/ai-and-transparency-how-government-agencies-could-avoid-ballooning-oia-costs/2QH4WSXJSFDWVJCWJMYPBHOT24/)
- **The corpus is analysable without a browser scrape.** [fyi.org.nz](https://fyi.org.nz) runs on the open-source Alaveteli platform and exposes per-page `.json` endpoints, Atom `/feed` feeds on most listings, and an `all-authorities.csv` export — enough structured metadata (authority, status, dates, tags) to do a meta-analysis, though there is no single bulk dump and the operator asks you to contact them for features not yet available. [FYI API help](https://fyi.org.nz/help/api)
- **The scale is there:** FYI lists **3,184 public authorities** grouped by type (ministries, departmental agencies, councils, former DHBs, etc.), and the Public Service Commission's official half-yearly statistics show **43,183 requests completed across 102 agencies in July–December 2025 alone** — the highest since reporting began in 2016 — giving a clean official denominator to join against. [FYI authorities list](https://fyi.org.nz/body/list/all); [PSC OIA statistics, Dec 2025](https://www.publicservice.govt.nz/news/latest-oia-statistics-released-december-2025)
- **NZ already has a proactive-release regime — the value is in finding the gap.** Cabinet's 2011 Declaration on Open and Transparent Government, the Cabinet proactive-release policy (papers online within 30 business days), NZGOAL and data.govt.nz already require/enable proactive publication; the recommendation this stream should produce is *which repeatedly-requested datasets fall through that gap*, not "NZ should start releasing things." [PSC, Proactive release](https://www.publicservice.govt.nz/guidance/official-information/proactive-release); [data.govt.nz, Open data](https://www.data.govt.nz/toolkit/open-data)
- **Hard guardrail:** FYI request bodies contain real requester names and sometimes third-party names, so any analysis must work on aggregate metadata and be de-identified by construction; and the headline cost figure, while credible and multiply-reported, is a **single government-commissioned estimate** with a known Police confound — both must be handled honestly by the children before a steward relies on them.

**Overall confidence:** Medium — the problem's existence, scale, and data-tractability are well supported by official and multiple independent sources; but the load-bearing dollar figure is a single-origin estimate, the actual *repeat-request* structure of the corpus is not yet measured, and the savings claim is unquantified. Those are exactly what the four research children are scoped to resolve.

## Evidence

### The problem: OIA response costs are large, rising, and the government itself points to proactive release

The core justification for this stream is that responding to OIA requests one at a time is expensive and growing. A report by consultancy firm TBL (Tregaskis Brown), commissioned via the Ministry of Justice, put the annual cost of responding to OIA requests at $183.6m in the 2024/25 financial year against almost 159,000 requests — up from $46.7m in 2015/16, a 293% rise — and forecast it to roughly double again to $342m by 2030/31. [RNZ, 12 June 2026](https://www.rnz.co.nz/news/political/597952/the-toothless-official-information-law-keeping-us-in-the-dark)

Independent reporting attributes the same figures to Ministry of Justice modelling by Tregaskis Brown, adds a per-agency breakdown (NZ Police $50m, Health New Zealand $16.4m, Corrections $10.8m for 2024/25), and reports the Ministry's own recommendation that agencies "proactively release more information and develop strategies to handle routine queries before they become formal requests," alongside AI chatbots, automated systems, specialised portals and smart request forms. The consultants noted their estimates were likely "conservative." [NZ Herald](https://www.nzherald.co.nz/nz/politics/ai-and-transparency-how-government-agencies-could-avoid-ballooning-oia-costs/2QH4WSXJSFDWVJCWJMYPBHOT24/)

The issue text floated a "~$180m/year" figure and asked that it be verified against a real source before relying on it. The verified figure is **$183.6m for 2024/25**, sourced to the TBL/MoJ modelling and reported independently by RNZ and the NZ Herald. Note the caveat below: this is one government-commissioned estimate, not two independent measurements, and part of the rise is a Police reporting-practice change.

### The demand-side scale is confirmed by official statistics

The Public Service Commission (Te Kawa Mataaho) publishes official OIA statistics half-yearly. Its December 2025 release reports that 102 agencies completed 43,183 official information requests between July and December 2025 — an increase of 4,466 on the prior period and the highest volume since reporting began in 2016 — with 97.8% answered on time, an average 13.1 working days to respond, 5.9% extended and 8.9% refused in full (most commonly because the information did not exist or would soon be publicly available). [PSC OIA statistics, Dec 2025](https://www.publicservice.govt.nz/news/latest-oia-statistics-released-december-2025)

That "would soon be publicly available" refusal ground is itself a signal that some requested information is already destined for publication — the exact territory an open-by-default analysis targets. The PSC series (covering only public service departments and Crown entities) is also a clean official denominator to join against the broader FYI corpus. [PSC, OIA statistics](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics)

### The corpus is genuinely analysable — structured metadata exists without a fragile scrape

fyi.org.nz is New Zealand's public archive of OIA and LGOIMA requests, run on the open-source Alaveteli platform used internationally for freedom-of-information sites. [FYI, About](https://fyi.org.nz/help/about)

FYI does not offer a full API or a single bulk dump, but it exposes several machine-readable surfaces that are sufficient for a metadata meta-analysis: Atom feeds on most listing pages (append `/feed`, including on search queries); JSON versions of requests, users and authorities (append `.json`); and a downloadable `all-authorities.csv` of every listed body. The documentation invites contact for features not yet available, which is the responsible route for any larger pull. [FYI API help](https://fyi.org.nz/help/api)

The authority list shows the corpus spans the whole of the public sector: FYI lists 3,184 public authorities, grouped into categories including ministries, departmental agencies, ministers, former District Health Boards, and (per the earlier council-spending framing) local and regional councils — and the list itself is exportable as CSV. [FYI authorities list](https://fyi.org.nz/body/list/all)

### NZ already has a proactive-release regime, so the recommendation must target the gap

New Zealand is not starting from zero on open-by-default. The Public Service Commission's proactive-release guidance requires Cabinet and Cabinet-committee papers (lodged from 1 January 2019, excluding Appointments and Honours) to be released and published online within 30 business days of final decisions, with normal official-information assessments applied. [PSC, Proactive release](https://www.publicservice.govt.nz/guidance/official-information/proactive-release)

Cabinet's 2011 Declaration on Open and Transparent Government commits the government to actively releasing high-value public data, supported by the New Zealand Data and Information Management Principles (NZDIMP), the NZGOAL licensing framework, and the data.govt.nz dataset directory (live since 2009). [data.govt.nz, Open data](https://www.data.govt.nz/toolkit/open-data)

The direction of travel is long-established in policy analysis too: the Law Commission's Report 125, *The Public's Right to Know*, devotes a chapter to the trend towards proactive release and open data. [Law Commission R125, ch. 12](http://r125.publications.lawcom.govt.nz/chapter+12:+proactive+release+and+publication/chapter+12:+the+trend+towards+proactive+release+and+open+data)

The implication for this stream: the deliverable is not "NZ should proactively release information" (it already commits to that) but a **specific, evidenced shortlist of repeatedly-requested datasets that are not yet proactively released**, plus the case for each — which is what research child #203 is scoped to produce.

### Scope chosen for this discover issue

This is a stream-root discover issue. Per the project's stream rules, a root stays open for the life of the stream and its framing PR links with "Part of #199", never "Closes". [The For Good Project, Streams](https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md)

The full idea — pull the corpus, measure repeat requests, cost the baseline, and produce a shortlist — is too big for one high-quality output, so this discover pass answers the framing question (is this real and tractable, and how) and fans out four chunky research children: #200 (data scope + responsible, de-identified extraction method), #201 (which bodies/topics dominate repeat requests), #202 (the cost baseline and realistic savings), and #203 (the open-by-default candidate shortlist vs what's already open). [#200](https://github.com/thecolab-ai/the-for-good-project/issues/200); [#201](https://github.com/thecolab-ai/the-for-good-project/issues/201); [#202](https://github.com/thecolab-ai/the-for-good-project/issues/202); [#203](https://github.com/thecolab-ai/the-for-good-project/issues/203)

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Responding to OIA requests cost NZ ~$183.6m in 2024/25 across ~159,000 requests, rising toward $342m by 2030/31. | [RNZ, 12 Jun 2026](https://www.rnz.co.nz/news/political/597952/the-toothless-official-information-law-keeping-us-in-the-dark) | [NZ Herald](https://www.nzherald.co.nz/nz/politics/ai-and-transparency-how-government-agencies-could-avoid-ballooning-oia-costs/2QH4WSXJSFDWVJCWJMYPBHOT24/) | Medium — two independent outlets, but **one origin**: the TBL/MoJ modelling. Not two independent measurements. |
| The Ministry of Justice itself recommends proactive release to manage OIA cost/volume. | [NZ Herald](https://www.nzherald.co.nz/nz/politics/ai-and-transparency-how-government-agencies-could-avoid-ballooning-oia-costs/2QH4WSXJSFDWVJCWJMYPBHOT24/) | [PSC, Proactive release regime](https://www.publicservice.govt.nz/guidance/official-information/proactive-release) | Medium |
| The fyi.org.nz corpus is analysable via structured JSON/Atom/CSV surfaces, not just HTML scraping. | [FYI API help](https://fyi.org.nz/help/api) | [FYI authorities list — CSV export](https://fyi.org.nz/body/list/all) | High |
| OIA request volume is at a record high (43,183 across 102 agencies in H2 2025). | [PSC OIA statistics, Dec 2025](https://www.publicservice.govt.nz/news/latest-oia-statistics-released-december-2025) | [PSC OIA statistics index](https://www.publicservice.govt.nz/guidance/official-information/oia-statistics) | High (single official publisher; second link is the same body's index) |

## What would change this conclusion

- **A corrected cost figure would move the value case.** The $183.6m is a single government-commissioned estimate. RNZ and the TBL report itself note the spike partly followed a 2018/19 Police reporting change that counted media enquiries as OIA requests, with Police at "up to 47 percent of all requests received" — so a large share of the headline number may be reclassification, not genuine growth. If the primary TBL modelling (child #202 should obtain it) shows most cost is unavoidable case-by-case judgement rather than repeat lookups, the savings ceiling shrinks. [RNZ, 12 Jun 2026](https://www.rnz.co.nz/news/political/597952/the-toothless-official-information-law-keeping-us-in-the-dark)
- **If the corpus turns out not to contain enough repetition** — i.e. most requests are genuinely bespoke — the "open by default" thesis weakens. That is an empirical question this discover pass did **not** answer; child #201 must measure it from public metadata, and I could not verify from public sources how much of the FYI corpus is near-duplicate.
- **If the frequently-requested datasets are already proactively released** (via data.govt.nz, agency disclosure logs, or Cabinet proactive release), the recommendation has no gap to fill; child #203 maps this explicitly.
- **Access/ethics could block the method.** I verified the JSON/Atom/CSV surfaces exist but did **not** verify FYI's robots.txt, rate limits, or the operator's stance on bulk metadata collection; child #200 must confirm the responsible-use terms before any large pull, and design de-identification so no requester or third-party name is ever stored.
- **A human is needed at G1.** Recommending that specific government information become "open by default" touches privacy, commercial sensitivity, and public-interest trade-offs that an agent should not adjudicate. The stream steward must weigh the shortlist against those before it becomes a real recommendation, and any external-facing output is a human gate under the project's rules.

## Open follow-up questions

- [#200](https://github.com/thecolab-ai/the-for-good-project/issues/200): What fyi.org.nz OIA data is available, and how do we pull it responsibly and de-identified?
- [#201](https://github.com/thecolab-ai/the-for-good-project/issues/201): Which NZ bodies and topics field the most repetitive OIA requests?
- [#202](https://github.com/thecolab-ai/the-for-good-project/issues/202): What does responding to OIA requests actually cost NZ, and how much would proactive release save?
- [#203](https://github.com/thecolab-ai/the-for-good-project/issues/203): A shortlist of NZ 'open-by-default' candidate datasets — what's already released vs the gap.

## Sources

1. RNZ. "The 'toothless' official information law keeping us in the dark." 12 June 2026. Accessed 3 July 2026. https://www.rnz.co.nz/news/political/597952/the-toothless-official-information-law-keeping-us-in-the-dark
2. NZ Herald. "Government agencies urged to consider AI and more transparency to avoid ballooning OIA costs." Accessed 3 July 2026. https://www.nzherald.co.nz/nz/politics/ai-and-transparency-how-government-agencies-could-avoid-ballooning-oia-costs/2QH4WSXJSFDWVJCWJMYPBHOT24/
3. Te Kawa Mataaho Public Service Commission. "Latest OIA statistics released (December 2025)." Accessed 3 July 2026. https://www.publicservice.govt.nz/news/latest-oia-statistics-released-december-2025
4. Te Kawa Mataaho Public Service Commission. "OIA statistics." Accessed 3 July 2026. https://www.publicservice.govt.nz/guidance/official-information/oia-statistics
5. Te Kawa Mataaho Public Service Commission. "Proactive release." Accessed 3 July 2026. https://www.publicservice.govt.nz/guidance/official-information/proactive-release
6. FYI.org.nz. "About our API." Accessed 3 July 2026. https://fyi.org.nz/help/api
7. FYI.org.nz. "About." Accessed 3 July 2026. https://fyi.org.nz/help/about
8. FYI.org.nz. "Authorities." Accessed 3 July 2026. https://fyi.org.nz/body/list/all
9. data.govt.nz. "Open data." Accessed 3 July 2026. https://www.data.govt.nz/toolkit/open-data
10. Law Commission. "Report 125: The Public's Right to Know — Chapter 12: The trend towards proactive release and open data." Accessed 3 July 2026. http://r125.publications.lawcom.govt.nz/chapter+12:+proactive+release+and+publication/chapter+12:+the+trend+towards+proactive+release+and+open+data
11. The For Good Project. "Streams, human gates, and where people actually fit." Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/blob/main/docs/STREAMS.md
12. GitHub. "Issue #199: discover — make NZ govt legible: meta-analysis of OIA requests." Accessed 3 July 2026. https://github.com/thecolab-ai/the-for-good-project/issues/199
