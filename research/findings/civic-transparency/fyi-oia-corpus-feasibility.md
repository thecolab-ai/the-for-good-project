---
title: "FYI.org.nz can support a metadata-first OIA corpus analysis, but full-text collection needs operator permission and strict de-identification"
domain: "civic-transparency"
issue: "#200"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-03"
status: "draft"
---

# FYI.org.nz can support a metadata-first OIA corpus analysis, but full-text collection needs operator permission and strict de-identification

## Executive answer

- FYI exposes request, user, authority, Atom feed, feed-JSON, and all-authorities CSV surfaces, but its own API help says it does not have a full API and is adding API-like features incrementally [FYI API help](https://fyi.org.nz/help/api); my direct tests found no request-level bulk dump, and the CSV export is authority metadata only [FYI all-authorities.csv](https://fyi.org.nz/body/all-authorities.csv).
- The reliable request-level metadata surface is each public request `.json`: for five recent requests taken from FYI's public successful-request list (IDs 34692, 34820, 34868, 34872, 34994; fetched 2026-07-03), every request JSON carried the top-level keys `title`, `public_body`, `described_state`, `display_status`, `created_at`, `updated_at`, `law_used`, `tags`, and `info_request_events` — but `tags` was an empty array in all five, so the field is available yet sparsely populated in practice [FYI successful-request list](https://fyi.org.nz/list/successful), [request 34872 JSON](https://fyi.org.nz/request/34872-appointment-of-members-of-the-electoral-commission.json), [request 34994 JSON](https://fyi.org.nz/request/34994-unlocked-and-unaccounted-for-guns-and-tasers-among-tactical-gear-lost-by-police.json).
- Atom and feed-JSON are useful for discovery and updates, but they include snippets and requester names; they should not be treated as a de-identified dataset or as a complete body export [sample request feed](https://fyi.org.nz/feed/request/34872-appointment-of-members-of-the-electoral-commission), [sample feed JSON](https://fyi.org.nz/feed/request/34872-appointment-of-members-of-the-electoral-commission.json).
- Responsible collection should be metadata-first, low-rate, and pre-agreed with FYI before any large pull: `robots.txt` blocks search/feed paths for general crawlers, blocks many named AI/bot user agents entirely, and says the blocks are mainly to reduce bot server load [FYI robots.txt](https://fyi.org.nz/robots.txt); FYI is volunteer-run and invites contact for missing API features [FYI contact](https://fyi.org.nz/help/contact), [FYI API help](https://fyi.org.nz/help/api).
- The Public Service Commission all-data CSV can be joined as an agency-period denominator where FYI authority names can be reconciled to PSC agencies, but it cannot be joined request-by-request and does not cover all FYI authorities such as local government bodies or ministers' offices [PSC OIA statistics page](https://www.publicservice.govt.nz/data/oia-statistics), [PSC all-data CSV](https://www.publicservice.govt.nz/assets/DirectoryFile/v_OIAStatisticsAllDataResults-1.csv), [FYI all-authorities.csv](https://fyi.org.nz/body/all-authorities.csv).

**Overall confidence:** Medium — the endpoint behaviour is directly verified on 2026-07-03 with low-volume fetches across five distinct public requests (the per-request field check is tabulated below), but corpus-wide completeness should not be measured until FYI has agreed to the collection method.

## Evidence

### Available FYI surfaces

FYI's API help describes four read surfaces relevant to this stream: adding `.json` to pages; Atom feeds found via `link rel="alternate"` or by adding `/feed` to the start of a URL; JSON equivalents of Atom feeds; and `all-authorities.csv` for every body in FYI [FYI API help](https://fyi.org.nz/help/api). The same page says FYI does not have a full API yet and asks developers to contact FYI if they need an API feature that is missing [FYI API help](https://fyi.org.nz/help/api). Alaveteli's upstream API documentation describes the same pattern and adds that `/api/v2/request/<id>.json` returns full information about a request, but FYI's public help page is the controlling source for this instance [Alaveteli API docs](https://alaveteli.org/docs/developers/api/), [FYI API help](https://fyi.org.nz/help/api).

The authority CSV is not a request corpus export: its header is `Name, Short name, URL name, Tags, Home page, Publication scheme, Disclosure log, Notes, Created at, Updated at, Version`, and direct fetch of the first rows on 2026-07-03 confirmed it contains authorities rather than requests [FYI all-authorities.csv](https://fyi.org.nz/body/all-authorities.csv). An authority `.json` endpoint exposes the same authority-side fields plus `id` and an `info` object where populated; a direct fetch for the PSC authority returned keys including `name`, `short_name`, `url_name`, `tags`, `home_page`, `notes`, `created_at`, and `updated_at` [FYI PSC authority JSON](https://fyi.org.nz/body/psc.json).

### Retrievable request fields and completeness

For the request `.json` surface, a direct fetch of one public request returned top-level request keys `id`, `url_title`, `title`, `created_at`, `updated_at`, `described_state`, `display_status`, `awaiting_description`, `prominence`, `law_used`, `tags`, `public_body`, `user`, and `info_request_events` [request 34872 JSON](https://fyi.org.nz/request/34872-appointment-of-members-of-the-electoral-commission.json).

To test whether that shape holds across requests rather than for one lucky sample, I took a convenience sample of five recent requests visible on FYI's public successful-request list on 2026-07-03 — not the strict top-five by date, since the list is reordered as requests update — and fetched each `.json` [FYI successful-request list](https://fyi.org.nz/list/successful). The check is reproducible with:

```
for id in 34692 34820 34868 34872 34994; do
  curl -LfsS "https://fyi.org.nz/request/${id}.json"   # 302-redirects to the slug URL and returns the request JSON
done
```

All five returned HTTP 200 and carried every one of the nine load-bearing keys, with `law_used` set to `foi` throughout; the only completeness gap is that `tags` was an empty array in all five:

| Request ID | Created (UTC+12) | `described_state` | `info_request_events` rows | `tags` populated? | All 9 keys present? |
|---|---|---|---|---|---|
| 34692 | 2026-05-13 | successful | 11 | no (`[]`) | yes |
| 34820 | 2026-05-30 | successful | 7 | no (`[]`) | yes |
| 34868 | 2026-06-07 | partially_successful | 4 | no (`[]`) | yes |
| 34872 | 2026-06-07 | successful | 6 | no (`[]`) | yes |
| 34994 | 2026-06-28 | successful | 3 | no (`[]`) | yes |

The keys named above are therefore present and populated for a pilot in every sampled request except `tags`, which exists as a field but was unpopulated in all five and so cannot be relied on for classification. This is enough to treat the metadata shape as stable for a pilot, but not enough to claim corpus-wide completeness — including how often `tags`, `law_used`, or event fields are actually filled across the full archive — without a permitted crawl [FYI robots.txt](https://fyi.org.nz/robots.txt).

For each request, `public_body` gives the authority, `described_state` and `display_status` give FYI's current classified state, and event rows give event-level `event_type`, `created_at`, `described_state`, `calculated_state`, `display_status`, `incoming_message_id`, `outgoing_message_id`, and `comment_id` [sample request JSON](https://fyi.org.nz/request/34872-appointment-of-members-of-the-electoral-commission.json). The practical mapping is: title = `title`; authority = `public_body.name` and `public_body.url_name`; status/outcome = `described_state`, `display_status`, and latest event `calculated_state`; dates = request `created_at`, `updated_at`, and event `created_at`; tags = request `tags`; category = not a separate field in the tested request JSON, and because request `tags` were empty in all five sampled requests, category analysis should lean on authority tags, search status labels, or a separately built taxonomy rather than assuming either a first-class category field or reliably populated request tags [sample request JSON](https://fyi.org.nz/request/34872-appointment-of-members-of-the-electoral-commission.json), [FYI advanced search](https://fyi.org.nz/advancedsearch).

FYI's advanced search documents status filters including `waiting_response`, `not_held`, `rejected`, `partially_successful`, `successful`, `waiting_clarification`, `gone_postal`, `internal_review`, `error_message`, `requires_admin`, and `user_withdrawn`; it also documents `latest_status`, `requested_from`, `requested_by`, `request`, `filetype`, date ranges, and `tag:` query operators [FYI advanced search](https://fyi.org.nz/advancedsearch). Those search operators are useful for manually validating classification logic, but search paths are disallowed in FYI's `robots.txt`, so they should not be used as a crawling backbone without operator permission [FYI robots.txt](https://fyi.org.nz/robots.txt).

Atom feeds expose update entries with `id`, `published`, entry `link`, `title`, and HTML `content` snippets; the request feed-JSON equivalent exposes an array of event objects with `event_type`, event dates, request metadata, public-body metadata, user metadata, and a text snippet [sample request feed](https://fyi.org.nz/feed/request/34872-appointment-of-members-of-the-electoral-commission), [sample feed JSON](https://fyi.org.nz/feed/request/34872-appointment-of-members-of-the-electoral-commission.json). Feed data is therefore good for finding changed requests, but it carries personal names and only snippets of correspondence, so it is not an ethical substitute for a de-identified analysis table [sample request feed](https://fyi.org.nz/feed/request/34872-appointment-of-members-of-the-electoral-commission), [FYI privacy](https://fyi.org.nz/help/privacy).

### Responsible collection constraints

FYI's `robots.txt` says the site blocks action pages, searches, and feed paths mainly to reduce server load from bots, and it disallows `/search/`, `/feed/`, `/profile/`, `/request/*/response/`, and other paths for `User-agent: *` [FYI robots.txt](https://fyi.org.nz/robots.txt). The same `robots.txt` lists many named AI, search, and scraping user agents and sets `Disallow: /` for that group, which means an autonomous AI-run collection should not proceed under one of those user agents [FYI robots.txt](https://fyi.org.nz/robots.txt). Google Search Central describes `robots.txt` as a crawler-traffic management mechanism whose rules depend on crawler compliance rather than hard access control, but the ethical reading here is straightforward: respect the published preference and ask before large-scale pulling [Google Search Central robots.txt introduction](https://developers.google.com/search/docs/crawling-indexing/robots/intro), [FYI robots.txt](https://fyi.org.nz/robots.txt).

I found no FYI-specific numeric rate limit in the API help, contact page, or `robots.txt` on 2026-07-03, and the only crawl-delay mention in `robots.txt` is a commented note about Bing rather than a rule [FYI API help](https://fyi.org.nz/help/api), [FYI contact](https://fyi.org.nz/help/contact), [FYI robots.txt](https://fyi.org.nz/robots.txt). Because FYI says volunteers run the service, because Open Collective describes FYI as an unincorporated organisation with hosting costs funded through donations, and because the API help invites contact for missing API features, the responsible next step is to ask FYI for permission and preferred limits before any corpus-scale pull [FYI contact](https://fyi.org.nz/help/contact), [FYI Open Collective](https://opencollective.com/fyi), [FYI API help](https://fyi.org.nz/help/api).

### De-identification pipeline

FYI's privacy page explicitly says a requester's name and request are published online, that FYI normally does not delete requests, and that FYI may remove or change names or other personal information in exceptional circumstances [FYI privacy](https://fyi.org.nz/help/privacy). The same page says sensitive personal information accidentally posted will usually be removed, and FYI's contact page directs people seeking their own personal information to the Office of the Privacy Commissioner's AboutMe tool rather than FYI [FYI privacy](https://fyi.org.nz/help/privacy), [FYI contact](https://fyi.org.nz/help/contact). This means the public archive is still personal-information rich, and a downstream project should not store or republish raw bodies, raw snippets, requester names, user URLs, third-party names, email addresses, phone numbers, postal addresses, signatures, or attachment text [FYI privacy](https://fyi.org.nz/help/privacy).

The minimum viable pipeline is:

1. Pull only allowlisted metadata needed for aggregation: request URL/title, authority URL/name, request created/updated dates, current status/outcome fields, request tags, event type/date/status fields, and attachment file-type indicators if specifically needed [sample request JSON](https://fyi.org.nz/request/34872-appointment-of-members-of-the-electoral-commission.json), [FYI advanced search](https://fyi.org.nz/advancedsearch).
2. Do not persist raw HTML, Atom `content`, feed-JSON `snippet`, correspondence body text, `user.name`, `user.url_name`, email addresses, or attachment contents in the research datastore; if topic modelling is later approved, process text in a temporary scratch store and write only non-reversible features such as classifier labels, salted one-way duplicate signatures, and aggregate counts [sample feed JSON](https://fyi.org.nz/feed/request/34872-appointment-of-members-of-the-electoral-commission.json), [FYI privacy](https://fyi.org.nz/help/privacy).
3. Build topic labels from redacted text only: strip emails, URLs where they identify people, phone numbers, postal addresses, bracketed FYI email placeholders, salutations/sign-offs, quoted previous messages, and named entities before classification; store the model output category and confidence, not the source text [FYI privacy](https://fyi.org.nz/help/privacy), [OPC Privacy Act principles](https://www.privacy.org.nz/privacy-principles/).
4. Publish only aggregates with a disclosure threshold, for example suppress or merge cells where a topic-authority-period count is below five, and manually review any small-cell examples before release; this follows the Privacy Commissioner's warning that de-identification is not a set-and-forget control and must be reviewed for re-identification risk [OPC statement on anonymisation and de-identification](https://www.privacy.org.nz/tuhono-connect/statements-media-releases/statement-in-response-to-inland-revenues-updated-hashing-information/).
5. Keep an audit log of fetched URLs, timestamps, HTTP status, user agent, and transform version, but never log raw message text or requester identifiers; this supports reproducibility while limiting stored personal data [FYI privacy](https://fyi.org.nz/help/privacy), [OPC Privacy Act principles](https://www.privacy.org.nz/privacy-principles/).

The pipeline should be implemented as an aggregate-and-redact system, not a scrape-then-clean system, because the Privacy Commissioner's public guidance says the Privacy Act principles govern collection, storage, use, and sharing of personal information, and Principle 11 generally limits disclosure to the original purpose or an allowed basis including use in a way that does not identify the person concerned [OPC Privacy Act principles](https://www.privacy.org.nz/privacy-principles/), [OPC Principle 11](https://www.privacy.org.nz/privacy-principles/11/).

### PSC denominator join

The PSC OIA statistics page says the Commission centralises collection and publication of OIA statistics to improve consistency and accessibility, and it links both half-yearly files and an all-data CSV going back to the initial 2015/16 collection period [PSC OIA statistics page](https://www.publicservice.govt.nz/data/oia-statistics). The all-data CSV columns include `OrgID`, `Agency`, `Agency_Preffered_Name`, `Agency_Type`, `SurveyPeriodEndDate`, `OIA_RequestsHandled`, `OIAs_CompletedWithinTimeframe`, `OIAs_Published`, `OIA_extension`, `OIA_transfer`, `OIA_refused`, `Ombudsman_Complaints`, `OIA_average`, `OIA_median`, and `FinalOpinionsbyOmbudsman` [PSC all-data CSV](https://www.publicservice.govt.nz/assets/DirectoryFile/v_OIAStatisticsAllDataResults-1.csv).

That CSV can provide an agency-period denominator for questions like "what share of an agency's handled OIA volume appears on FYI in the same half-year?" where FYI authorities can be mapped to PSC agency names or preferred names [PSC all-data CSV](https://www.publicservice.govt.nz/assets/DirectoryFile/v_OIAStatisticsAllDataResults-1.csv), [FYI all-authorities.csv](https://fyi.org.nz/body/all-authorities.csv). The join is partial because FYI includes local authorities, schools, ministers' offices, and other bodies, while the PSC file is a centralised agency OIA statistics collection with agency type fields rather than an all-public-authorities universe [FYI all-authorities.csv](https://fyi.org.nz/body/all-authorities.csv), [PSC OIA statistics page](https://www.publicservice.govt.nz/data/oia-statistics). The join is also aggregate-only because PSC data reports agency-period totals and outcome counts, while FYI request JSON reports public archive request/event metadata rather than PSC's internal handled-request records [sample request JSON](https://fyi.org.nz/request/34872-appointment-of-members-of-the-electoral-commission.json), [PSC all-data CSV](https://www.publicservice.govt.nz/assets/DirectoryFile/v_OIAStatisticsAllDataResults-1.csv).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| FYI has useful structured surfaces but no full request bulk dump surfaced in the public API help. | [FYI API help](https://fyi.org.nz/help/api) | [Alaveteli API docs](https://alaveteli.org/docs/developers/api/) | Medium |
| Feed/search crawling needs prior permission despite the API help mentioning feeds, because FYI's `robots.txt` disallows feed/search paths and broad AI/bot user agents. | [FYI robots.txt](https://fyi.org.nz/robots.txt) | [Google Search Central robots.txt introduction](https://developers.google.com/search/docs/crawling-indexing/robots/intro) | High |
| Request bodies and feed snippets must be treated as personal-information rich, even though they are public. | [FYI privacy](https://fyi.org.nz/help/privacy) | [OPC Privacy Act principles](https://www.privacy.org.nz/privacy-principles/) | High |
| PSC data can support denominator analysis only at agency-period level, not request level. | [PSC all-data CSV](https://www.publicservice.govt.nz/assets/DirectoryFile/v_OIAStatisticsAllDataResults-1.csv) | [sample request JSON](https://fyi.org.nz/request/34872-appointment-of-members-of-the-electoral-commission.json) | High |

## What would change this conclusion

- FYI operator approval for a bulk export, database dump, or rate-limited crawl would change the recommended acquisition path from "metadata-first pilot only" to an agreed corpus ingest [FYI API help](https://fyi.org.nz/help/api), [FYI contact](https://fyi.org.nz/help/contact).
- A full pilot crawl, run with FYI's consent, could replace the five-request key check with measured corpus-wide completeness for every field and every historical status [FYI robots.txt](https://fyi.org.nz/robots.txt).
- A maintained FYI-to-PSC authority crosswalk would improve denominator joins and would reduce manual name-matching risk between FYI authority names and PSC agency/preferred names [FYI all-authorities.csv](https://fyi.org.nz/body/all-authorities.csv), [PSC all-data CSV](https://www.publicservice.govt.nz/assets/DirectoryFile/v_OIAStatisticsAllDataResults-1.csv).
- I could not verify a FYI-specific numeric rate limit, terms-of-use page, or an operator policy for research-scale extraction; those should be confirmed by a human contacting FYI before corpus-scale work [FYI API help](https://fyi.org.nz/help/api), [FYI contact](https://fyi.org.nz/help/contact).
- I could not verify whether FYI's Open Collective, volunteers, or any named civil-liberties organisation is the current decision-maker for granting data-access permission; the safe route is to use FYI's published contact channel and ask who can approve the work [FYI contact](https://fyi.org.nz/help/contact), [FYI Open Collective](https://opencollective.com/fyi).

## Open follow-up questions

- With FYI's consent, what is the corpus-wide completeness of request JSON fields by year, authority type, and status?
- What authority crosswalk best maps FYI public bodies to PSC agency identifiers, local-government identifiers, and ministerial offices without over-matching?
- Can a redacted topic-classification pipeline produce stable "requested information category" labels without storing raw request/response text?
- What share of PSC-reported agency OIA volume appears on FYI by half-year, after excluding authorities outside the PSC collection?

## Sources

1. FYI, "About our API", fetched with `curl` on 2026-07-03: <https://fyi.org.nz/help/api>.
2. FYI, `robots.txt`, fetched with `curl` on 2026-07-03: <https://fyi.org.nz/robots.txt>.
3. FYI, "Your privacy", fetched with `curl` on 2026-07-03: <https://fyi.org.nz/help/privacy>.
4. FYI, "Contact us", fetched with `curl` on 2026-07-03: <https://fyi.org.nz/help/contact>.
5. FYI, "Advanced search", fetched with `curl` on 2026-07-03: <https://fyi.org.nz/advancedsearch>.
6. FYI, all-authorities CSV, fetched with `curl` on 2026-07-03: <https://fyi.org.nz/body/all-authorities.csv>.
7. FYI, PSC authority JSON, fetched with `curl` on 2026-07-03: <https://fyi.org.nz/body/psc.json>.
8. FYI, public successful-request list (used to select the five sampled requests), fetched with `curl` on 2026-07-03 (HTML at HTTP 200; note the `.json` variant returned HTTP 500 that day): <https://fyi.org.nz/list/successful>.
8a. FYI, sampled public request JSONs, each fetched with `curl` on 2026-07-03 (all HTTP 200):
    - <https://fyi.org.nz/request/34692-appointment-to-the-board-of-the-tertiary-education-commission.json>
    - <https://fyi.org.nz/request/34820-appointment-to-the-building-practitioners-board.json>
    - <https://fyi.org.nz/request/34868-key-to-communities-shelby-new-zealand-promotion.json>
    - <https://fyi.org.nz/request/34872-appointment-of-members-of-the-electoral-commission.json>
    - <https://fyi.org.nz/request/34994-unlocked-and-unaccounted-for-guns-and-tasers-among-tactical-gear-lost-by-police.json>
9. FYI, sample public request Atom feed, fetched with `curl` on 2026-07-03: <https://fyi.org.nz/feed/request/34872-appointment-of-members-of-the-electoral-commission>.
10. FYI, sample public request feed JSON, fetched with `curl` on 2026-07-03: <https://fyi.org.nz/feed/request/34872-appointment-of-members-of-the-electoral-commission.json>.
11. mySociety, "API | Alaveteli", fetched with built-in WebSearch/WebFetch on 2026-07-03: <https://alaveteli.org/docs/developers/api/>.
12. Google Search Central, "Robots.txt Introduction and Guide", fetched with built-in WebSearch/WebFetch on 2026-07-03: <https://developers.google.com/search/docs/crawling-indexing/robots/intro>.
13. FYI.org.nz Open Collective page, fetched with built-in WebFetch on 2026-07-03: <https://opencollective.com/fyi>.
14. Office of the Privacy Commissioner, "Privacy Act 2020", fetched with built-in WebFetch on 2026-07-03: <https://www.privacy.org.nz/privacy-principles/>.
15. Office of the Privacy Commissioner, "Principle 11 - Disclosure of personal information", fetched with built-in WebFetch on 2026-07-03: <https://www.privacy.org.nz/privacy-principles/11/>.
16. Office of the Privacy Commissioner, "Statement in response to Inland Revenue's updated hashing information", fetched with built-in WebSearch/WebFetch on 2026-07-03: <https://www.privacy.org.nz/tuhono-connect/statements-media-releases/statement-in-response-to-inland-revenues-updated-hashing-information/>.
17. Public Service Commission, "Official Information Act statistics", fetched with `curl` on 2026-07-03: <https://www.publicservice.govt.nz/data/oia-statistics>.
18. Public Service Commission, OIA Statistics all-data CSV, fetched with `curl` on 2026-07-03: <https://www.publicservice.govt.nz/assets/DirectoryFile/v_OIAStatisticsAllDataResults-1.csv>.
