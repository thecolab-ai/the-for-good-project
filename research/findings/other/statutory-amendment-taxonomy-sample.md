---
title: "A seeded 2025 pilot sample found insertions, not repeals, dominated one fully classified NZ Amendment Act cluster"
domain: "other"
issue: "#676"
confidence: "Low"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-07"
status: "draft"
---

# A seeded 2025 pilot sample found insertions, not repeals, dominated one fully classified NZ Amendment Act cluster

## Executive answer

- I used the vendored `nz-parliament` skill to define a frozen 2025 sampling frame: 62 bills returned by `bills --keyword Amendment --all`, filtered to `status == "Royal Assent"` and `last_activity` in 2025. The sampled cluster list is reproduced from the embedded frame in [statutory_amendment_sample.py](data/statutory_amendment_sample.py). A fresh re-run after review returned the same normalized 62-row set but one same-date tie in a different order, so the frozen embedded frame is the sampling artifact of record; the earlier prose saying 63 rows was wrong. Sources: [New Zealand Parliament bills API item example](https://bills.parliament.nz/v/6/7ae98561-af36-4dc6-fee0-08dd98c831fd), [rework fetch log](data/statutory_amendment_fetch_log.txt).
- With seed `fg-676-2025-amendment-act-cluster-v1`, the five selected clusters were: Climate Change Response (Emissions Trading Scheme—Forestry Conversion), Social Security, Crimes Legislation (Stalking and Harassment), Marine and Coastal Area (Takutai Moana) (Customary Marine Title), and Judicature (Timeliness) Legislation Amendment Bills. The corresponding enacted legislation pages exist on legislation.govt.nz by title/Act number search. Sources: [Climate Change Response Amendment Act 2025](https://www.legislation.govt.nz/act/public/2025/52/en/latest/), [Social Security Amendment Act 2025](https://www.legislation.govt.nz/act/public/2025/25/en/latest/), [Crimes Legislation Amendment Act 2025](https://www.legislation.govt.nz/act/public/2025/72/en/latest/), [Marine and Coastal Area Amendment Act 2025](https://www.legislation.govt.nz/act/public/2025/58/en/latest/), [Judicature (Timeliness) Legislation Amendment Act 2025 PDF](https://www.legislation.govt.nz/act/public/2025/85/en/2025-12-19.pdf).
- After review, I retried the parent issue's recommended `legislation-nz get-act` path for all five selected Acts. In this PR worktree, all five XML requests still returned `upstream_unexpected_html`, direct `curl -I` requests to the official HTML/PDF pages returned `HTTP/2 202` with `x-amzn-waf-action: challenge`, and `node scripts/fetch.mjs` returned the AWS WAF JavaScript challenge body. This is a tooling/access limit in this environment, not evidence that the official pages are dead; it also does not contradict the reviewer having successful access from a different environment. Sources: [legislation-nz skill notes](../../../.skills/skills/legislation-nz/SKILL.md), [rework fetch log](data/statutory_amendment_fetch_log.txt).
- In that fully classified cluster, 15 of 23 substantive amending provisions were insertion-only, 5 were replacement-only, 1 was repeal/revoke-only, and 2 were mixed insert/replace provisions. Narrow repeal/revoke was therefore 1/23 (4.3%) inside the classified Act; counting mixed or replacement as "repeal-like" would materially change the headline, but still would not make narrow repeals dominate this cluster. Source: [classification script](data/statutory_amendment_sample.py) and [Judicature Act official PDF](https://www.legislation.govt.nz/act/public/2025/85/en/2025-12-19.pdf).
- This is a proof of method, not a general estimate for New Zealand legislation. A single accessible cluster can show that the taxonomy works and that "amended" headings conceal insert/replace/repeal operations, but it cannot support a population-level claim about all 2025 statutory amendments.

**Overall confidence:** Low — the within-Act classification is High confidence, but the population conclusion is deliberately Low because only one randomly selected cluster could be fully classified from official text in this environment.

## Evidence

### Taxonomy used

I used the current NZ drafting taxonomy established in the stream framing: **repeal/revoke** removes a whole enactment or whole provision, with "revoke" used for secondary legislation; **delete** removes text smaller than a subsection; **replace** removes existing text and substitutes new text in one operation; **insert** adds new text. PCO's amending-styles page describes that four-way Repeal / Delete / Replace / Insert vocabulary, and the Law Commission's Legislation Manual independently describes amending laws as repealing, altering, substituting, or incorporating provisions. Sources: [PCO amending-styles page, Wayback snapshot](https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles), [NZLC Report 35 PDF, Appendix B](https://www.lawcom.govt.nz/assets/Publications/Reports/NZLC-R35.pdf).

The sampled Act shows why headings alone are not enough. For example, section 4 is headed "Section 7 amended", but its text contains several `replace` instructions and one `insert` instruction; section 28 is headed "Rules 5.35A to 5.35C and cross-heading above rule 5.35A revoked", and its operative text says "Revoke rules 5.35A to 5.35C and the cross-heading above rule 5.35A." Source: [Judicature Act 2025 PDF, ss 4 and 28](https://www.legislation.govt.nz/act/public/2025/85/en/2025-12-19.pdf).

I therefore classified each sampled provision by its operative instruction text, not merely by whether the heading says "amended". If a provision contained only one operation family, I assigned that family; if it contained both insert and replace instructions, I classified it as **mixed** and recorded the operation tokens in the script. Source: [classification script](data/statutory_amendment_sample.py).

### Sampling frame and seed

The frozen frame was all rows captured from the vendored Parliament skill where the query `Amendment` found a bill, the API status was `Royal Assent`, and the `last_activity` timestamp began with `2025`. The command was:

```bash
for p in 1 2 3 4 5 6 7 8 9 10; do
  python3 .skills/skills/nz-parliament/scripts/cli.py bills \
    --keyword Amendment --all --limit 50 --page "$p" --json |
    jq -r '.results[] | select(.status=="Royal Assent" and (.last_activity|startswith("2025"))) |
      [.last_activity,.bill_number,.title,.url] | @tsv'
done
```

That produced 62 2025 Royal Assent rows in the re-run after review, but the live API order no longer exactly matched the embedded frame: for the 26 November 2025 tie, the live API returned Crimes Legislation (Stalking and Harassment) Amendment Bill (`107-2`) before Crimes (Countering Foreign Interference) Amendment Bill (`93-2`), while the frozen frame has `93-2` before `107-2`. A normalized comparison on date, bill number, and stripped title still found the same row set; the order drift matters because Python's seeded sample is position-sensitive. I therefore treat the embedded frame, not current live API order, as the reproducible sampling artifact; changing the order after observing which selected Act was classifiable would be post hoc. The earlier prose saying 63 rows was wrong. The skill documentation states that it tracks bills from the public bills.parliament.nz JSON API. Sources: [nz-parliament skill documentation](../../../.skills/skills/nz-parliament/SKILL.md), [New Zealand Parliament bills API item example](https://bills.parliament.nz/v/6/7ae98561-af36-4dc6-fee0-08dd98c831fd), [reproduction script](data/statutory_amendment_sample.py), [rework fetch log](data/statutory_amendment_fetch_log.txt).

The cluster draw used Python's `random.Random(SEED).sample(FRAME, 5)` against the frozen embedded frame with seed `fg-676-2025-amendment-act-cluster-v1`. It selected:

| Draw | Bill | Royal Assent activity date | Enacted Act checked |
|---|---|---:|---|
| 1 | Climate Change Response (Emissions Trading Scheme—Forestry Conversion) Amendment Bill | 2025-09-23 | [2025 No 52](https://www.legislation.govt.nz/act/public/2025/52/en/latest/) |
| 2 | Social Security Amendment Bill | 2025-05-21 | [2025 No 25](https://www.legislation.govt.nz/act/public/2025/25/en/latest/) |
| 3 | Crimes Legislation (Stalking and Harassment) Amendment Bill | 2025-11-26 | [2025 No 72](https://www.legislation.govt.nz/act/public/2025/72/en/latest/) |
| 4 | Marine and Coastal Area (Takutai Moana) (Customary Marine Title) Amendment Bill | 2025-10-24 | [2025 No 58](https://www.legislation.govt.nz/act/public/2025/58/en/latest/) |
| 5 | Judicature (Timeliness) Legislation Amendment Bill | 2025-12-19 | [2025 No 85 PDF](https://www.legislation.govt.nz/act/public/2025/85/en/2025-12-19.pdf) |

The enacted Act pages were resolvable through web search, but local command-line retrieval of legislation.govt.nz XML/HTML/PDF pages returned AWS WAF challenge responses rather than usable XML/text in this worktree. On rework, `legislation-nz get-act` failed with `upstream_unexpected_html` for all five selected Acts, direct `curl` received `x-amzn-waf-action: challenge`, and `scripts/fetch.mjs` returned the JavaScript challenge body for the four previously unclassified Acts. The fifth selected Act's PDF had already been fully readable in the original browser-backed extraction path, so I kept it as the only provision-level classified cluster rather than inferring classifications from search snippets or headings. Sources: [Judicature Act 2025 PDF](https://www.legislation.govt.nz/act/public/2025/85/en/2025-12-19.pdf), [rework fetch log](data/statutory_amendment_fetch_log.txt).

### Classified provisions in the accessible selected cluster

The Judicature (Timeliness) Legislation Amendment Act 2025 is Public Act 2025 No 85, assented on 19 December 2025, and its contents list amending provisions for the Senior Courts Act 2016, Criminal Procedure Act 2011, Coroners Act 2006, and High Court Rules 2016. Source: [Judicature Act 2025 PDF](https://www.legislation.govt.nz/act/public/2025/85/en/2025-12-19.pdf).

I excluded title, commencement, "Principal Act"/"Principal rules" locator provisions, schedules themselves, legislative history, and administrative information; I included the substantive numbered provisions that actually amend another enactment. Source: [Judicature Act 2025 PDF](https://www.legislation.govt.nz/act/public/2025/85/en/2025-12-19.pdf).

| Section | Heading | Primary classification | Operative basis |
|---:|---|---|---|
| 4 | Section 7 amended (Number of High Court Judges) | Mixed | Text has three `replace` instructions and one `insert` instruction. |
| 5 | Section 49 amended (Powers exercisable by Judges) | Mixed | Text inserts subsection (2A) and replaces words in subsection (3). |
| 6 | Section 81 amended (Exercise of powers of court) | Insert | Text inserts subsection (2A). |
| 7 | New sections 164A to 164C and cross-headings inserted | Insert | Text inserts new sections and cross-headings. |
| 8 | Cross-heading above section 166 replaced | Replace | Text replaces a cross-heading. |
| 9 | Schedule 5 amended | Insert | Text inserts the Part set out in Schedule 1. |
| 11 | Section 35 amended | Insert | Text inserts paragraph (d). |
| 12 | New section 156A and cross-heading inserted | Insert | Text inserts a new section and cross-heading. |
| 13 | New section 319A and cross-heading inserted | Insert | Text inserts a new section and cross-heading. |
| 14 | Schedule 1AA amended | Insert | Text inserts the Part set out in Schedule 2. |
| 16 | Section 4 amended (Coroner's role) | Replace | Text replaces section 4(1)(e)(iii). |
| 17 | Section 8 amended (Overview of this Act) | Replace | Text replaces section 8(3). |
| 18 | Section 28 amended | Insert | Text inserts paragraph (aa). |
| 19 | Section 55 amended | Insert | Text inserts paragraph (c). |
| 20 | New section 65A inserted | Insert | Text inserts a new section. |
| 21 | Section 83 amended | Replace | Text replaces section 83(4). |
| 22 | Section 94A amended | Insert | Text inserts subsection (2). |
| 23 | Section 94B amended | Insert | Text inserts subsection (3). |
| 24 | Section 118 amended | Insert | Text inserts paragraph (c). |
| 25 | Schedule 1 amended | Insert | Text inserts the Part set out in Schedule 3. |
| 27 | Rule 2.1 amended (Jurisdiction and powers) | Replace | Text replaces rule 2.1(3)(b). |
| 28 | Rules 5.35A to 5.35C and cross-heading above rule 5.35A revoked | Repeal/revoke | Text revokes rules and a cross-heading. |
| 29 | Schedule 1AA amended | Insert | Text inserts the Part set out in Schedule 4. |

Source for every row: [Judicature (Timeliness) Legislation Amendment Act 2025 PDF](https://www.legislation.govt.nz/act/public/2025/85/en/2025-12-19.pdf). Reproducible row list and counts: [classification script](data/statutory_amendment_sample.py).

### Breakdown

Within the classified accessible cluster, the primary provision-level breakdown was:

| Class | Count | Share of 23 substantive amending provisions |
|---|---:|---:|
| Insert | 15 | 65.2% |
| Replace | 5 | 21.7% |
| Repeal/revoke | 1 | 4.3% |
| Mixed insert/replace | 2 | 8.7% |
| Delete | 0 | 0.0% |

Source: [classification script](data/statutory_amendment_sample.py).

If the two mixed provisions are counted in every operation family they contain, this cluster has 17 provisions containing at least one insert instruction, 7 provisions containing at least one replace instruction, 1 provision containing repeal/revoke, and 0 provisions containing delete. That token-presence view confirms the same qualitative point for this cluster: insertions are common, narrow repeal/revoke is rare, and the treatment of replace/mixed operations is a real definitional lever. Source: [classification script](data/statutory_amendment_sample.py).

No defensible population confidence interval is reported for all NZ statutory amendments, because only one of the five selected clusters could be fully classified from official full text. If the 23 classified provisions were incorrectly treated as an independent simple random sample, the naive 95% margin of error around a 65% insertion share would be roughly +/-19 percentage points, which is too wide for a strong headline and still ignores cluster design. The right conclusion is therefore methodological: the taxonomy can be applied reproducibly, but a larger accessible corpus is needed before estimating the 2025 or all-time distribution.

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| The official taxonomy should distinguish repeal/revoke, delete, replace, and insert rather than treating every "amended" heading as one type. | [PCO amending-styles page, Wayback snapshot](https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles) | [NZLC Report 35 PDF, Appendix B](https://www.lawcom.govt.nz/assets/Publications/Reports/NZLC-R35.pdf) | High |
| The sampled Judicature cluster is dominated by insertions, not narrow repeals/revocations. | [Judicature Act official PDF](https://www.legislation.govt.nz/act/public/2025/85/en/2025-12-19.pdf) | [Reproduction script](data/statutory_amendment_sample.py) | High for this cluster only |
| The run cannot support a population-level "most NZ amendments are/are not repeals" estimate. | [Sampling script showing only one fully classified accessible cluster](data/statutory_amendment_sample.py) | [Rework fetch log showing blocked XML/HTML/PDF retrieval in this environment](data/statutory_amendment_fetch_log.txt) | High |
| A larger full-corpus classification looks technically feasible but was not completed here. | [nz-statute-book README](https://github.com/jonnonz1/nz-statute-book) | [Whiplash README](https://github.com/jonnonz1/whiplash) | Medium; both sources are from the same independent project |

## What would change this conclusion

- A successful rerun with direct access to legislation.govt.nz XML/PDF for all five selected Acts would replace this one-cluster pilot with the intended five-cluster estimate. The adversarial reviewer reported that this succeeded in their environment; my re-run in this worktree remained blocked, so this is likely environment-dependent.
- A new pre-registered draw that sorts the live Parliament frame by explicit stable keys before sampling would be cleaner for future work. I did not switch to that after review because it would change the selected Acts after observing which selected Act was classifiable.
- A PCO API key, a local mirror of the official bulk XML, or collaboration with the Whiplash/nz-statute-book pipeline could turn the same taxonomy into a full-2025 or full-corpus classifier.
- A reviewer might reasonably choose a different rule for mixed provisions, such as counting every operation token rather than assigning a primary provision class. That would not change the within-cluster observation that narrow repeal/revoke is rare here, but it would change any future headline share.
- I could not verify whether the 62-row Parliament API frame exactly equals every 2025 enacted public Amendment Act, because the query is title-keyword based and may miss amendment Acts whose bill title lacks "Amendment" or include private/local Acts depending on the API result set.
- This finding needs legal/drafting review before anyone treats the classification rule as authoritative. It is a research taxonomy applied to public text, not legal advice.

## Open follow-up questions

- Can a maintainer or collaborator with an unblocked browser/API key rerun the five selected clusters and classify all substantive amending provisions?
- Should the stream's headline metric be provision-primary class, operation-token class, or both?
- Can the Whiplash history-note parser expose repeal/delete/replace/insert operation labels directly from PCO history notes?

## Sources

1. Parliamentary Counsel Office, "A new approach to describing how amendments are made in legislation", Wayback snapshot of PCO page. Accessed 7 July 2026. https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles
2. New Zealand Law Commission, *Legislation Manual: Structure and Style*, Report 35, Appendix B. Accessed 7 July 2026. https://www.lawcom.govt.nz/assets/Publications/Reports/NZLC-R35.pdf
3. `nz-parliament` vendored skill documentation. Accessed 7 July 2026. ../../../.skills/skills/nz-parliament/SKILL.md
4. Public bills.parliament.nz API item, Judicature (Timeliness) Legislation Amendment Bill. Accessed 7 July 2026. https://bills.parliament.nz/v/6/7ae98561-af36-4dc6-fee0-08dd98c831fd
5. Climate Change Response (Emissions Trading Scheme—Forestry Conversion) Amendment Act 2025, New Zealand Legislation. Accessed 7 July 2026 by web search/open. https://www.legislation.govt.nz/act/public/2025/52/en/latest/
6. Social Security Amendment Act 2025, New Zealand Legislation. Accessed 7 July 2026 by web search/open. https://www.legislation.govt.nz/act/public/2025/25/en/latest/
7. Crimes Legislation (Stalking and Harassment) Amendment Act 2025, New Zealand Legislation. Accessed 7 July 2026 by web search/open. https://www.legislation.govt.nz/act/public/2025/72/en/latest/
8. Marine and Coastal Area (Takutai Moana) (Customary Marine Title) Amendment Act 2025, New Zealand Legislation. Accessed 7 July 2026 by web search/open. https://www.legislation.govt.nz/act/public/2025/58/en/latest/
9. Judicature (Timeliness) Legislation Amendment Act 2025, official PDF, New Zealand Legislation. Accessed 7 July 2026 by browser-backed web extraction after local command-line legislation.govt.nz fetches returned AWS WAF challenges. https://www.legislation.govt.nz/act/public/2025/85/en/2025-12-19.pdf
10. `legislation-nz` vendored skill documentation. Accessed 7 July 2026. ../../../.skills/skills/legislation-nz/SKILL.md
11. jonnonz1/nz-statute-book README. Accessed 7 July 2026. https://github.com/jonnonz1/nz-statute-book
12. jonnonz1/whiplash README. Accessed 7 July 2026. https://github.com/jonnonz1/whiplash
13. Reproduction script for this finding. [data/statutory_amendment_sample.py](data/statutory_amendment_sample.py)
14. Rework fetch log for this finding. [data/statutory_amendment_fetch_log.txt](data/statutory_amendment_fetch_log.txt)
