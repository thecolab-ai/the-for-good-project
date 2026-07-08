---
title: "A seeded 2025 five-cluster sample of NZ Amendment Acts is dominated by insertions, with narrow repeals rare across all five clusters"
domain: "other"
issue: "#676"
confidence: "Medium"
author: "claude"
agent: "claude"
model: "claude-fable-5"
date: "2026-07-08"
status: "draft"
---

# A seeded 2025 five-cluster sample of NZ Amendment Acts is dominated by insertions, with narrow repeals rare across all five clusters

## Executive answer

- Re-running this study after the 8 July 2026 fetch-ladder upgrade, all five randomly selected 2025 Amendment Acts are now retrievable as official legislation.govt.nz XML (the four that returned AWS WAF challenges on 7 July no longer do). Every substantive amending provision in all five clusters is classified from official full text, so the intended **five-cluster** distribution is delivered — not the one-cluster proof-of-method the block had forced. Sources: [rework fetch log](data/statutory_amendment_fetch_log.txt), [classification script](data/statutory_amendment_sample.py).
- Across the five clusters there are **142 substantive amending provisions**. Primary operation class: **insert 75 (52.8%), replace 31 (21.8%), mixed 24 (16.9%), repeal/revoke 6 (4.2%), delete 6 (4.2%)**. Insertions are the single largest class overall and in **every one of the five clusters**; narrow repeal/revoke is the smallest or near-smallest class in every cluster. Source: [classification script](data/statutory_amendment_sample.py).
- The seed `fg-676-2025-amendment-act-cluster-v1` drew: Climate Change Response (ETS—Forestry Conversion) 2025/52, Social Security 2025/25, Crimes Legislation (Stalking and Harassment) 2025/72, Marine and Coastal Area (Takutai Moana) (Customary Marine Title) 2025/58, and Judicature (Timeliness) Legislation 2025/85. Bill→Act mappings were confirmed by title match on official XML metadata. Sources: [2025/52](https://www.legislation.govt.nz/act/public/2025/52/en/latest/), [2025/25](https://www.legislation.govt.nz/act/public/2025/25/en/latest/), [2025/72](https://www.legislation.govt.nz/act/public/2025/72/en/latest/), [2025/58](https://www.legislation.govt.nz/act/public/2025/58/en/latest/), [2025/85](https://www.legislation.govt.nz/act/public/2025/85/en/latest/).
- The taxonomy holds: "amended" section headings routinely conceal a *mix* of insert/replace/repeal/delete instructions. 24 of 142 provisions (16.9%) carry more than one operation family, so classifying by heading alone would materially misstate the picture. The method reproduces the earlier browser-backed classification of Act 2025/85 exactly (15 insert / 5 replace / 1 repeal-revoke / 2 mixed), validating the parser. Sources: [classification script](data/statutory_amendment_sample.py), [Judicature Act 2025 XML](https://www.legislation.govt.nz/act/public/2025/85/en/latest.xml/).
- This is a defensible seeded sample, not a census. Five clusters out of 62 enacted 2025 Amendment Acts is a small cluster sample, so the *direction* (insert-dominant, repeal-rare) is well-supported but a tight population percentage for all 2025 NZ amendments should be treated as indicative.

**Overall confidence:** Medium — the per-Act classifications are High confidence (official XML, reproducible, method-validated), and the insert-dominant / repeal-rare direction is consistent across all five independently drawn clusters; but five clusters is a small sample and cluster design widens any population interval, so the exact distribution is indicative rather than precise.

## Evidence

### Taxonomy used

The NZ drafting taxonomy distinguishes four operation families: **repeal/revoke** removes a whole enactment or whole provision ("revoke" for secondary legislation); **delete** removes text smaller than a subsection; **replace** removes existing text and substitutes new text in one operation; **insert** adds new text. PCO's amending-styles page describes that Repeal / Delete / Replace / Insert vocabulary, and the Law Commission's Legislation Manual independently describes amending laws as repealing, altering, substituting, or incorporating provisions. Sources: [PCO amending-styles page, Wayback snapshot](https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles), [NZLC Report 35 PDF, Appendix B](https://www.lawcom.govt.nz/assets/Publications/Reports/NZLC-R35.pdf).

Headings alone are not enough. For example, Act 2025/52 s 6 is headed "Section 4 amended (Interpretation)" but its operative text contains one insert instruction and three replace instructions; Act 2025/72 s 15 is headed "Section 6 amended (Object)" but repeals subsection (2)(a) and deletes words from (2)(c). I therefore classified each provision by its operative instruction text, not by whether the heading says "amended". A provision containing only one operation family is assigned that family; a provision whose instructions span two or more families is **mixed**. Source: [classification script](data/statutory_amendment_sample.py).

### How the previously-blocked text was recovered

On the 7 July run, four of the five selected Acts (2025/52, 2025/25, 2025/72, 2025/58) returned `HTTP/2 202` with `x-amzn-waf-action: challenge` to every fetch rung, and only Act 2025/85 had been classified (via a browser-backed extraction). On 8 July, after the fetch-ladder upgrade, the vendored `legislation-nz get-act` returns `status: ok` for all five, and the official `latest.xml` endpoint returns real legislation XML (root `<act …>`) for all five with no WAF challenge — via `scripts/fetch.mjs` (plain HTTP) for the three smaller Acts and a direct `curl` to file for the two larger ones (a display-length cap in `fetch.mjs`, not an access block). Every source below was fetched this way. Sources: [legislation-nz skill notes](../../../.skills/skills/legislation-nz/SKILL.md), [rework fetch log](data/statutory_amendment_fetch_log.txt).

### Sampling frame and seed

The frozen frame is the 62 rows captured from the vendored Parliament skill where the query `Amendment` found a bill, the API status was `Royal Assent`, and `last_activity` began "2025". The command was:

```bash
for p in 1 2 3 4 5 6 7 8 9 10; do
  python3 .skills/skills/nz-parliament/scripts/cli.py bills \
    --keyword Amendment --all --limit 50 --page "$p" --json |
    jq -r '.results[] | select(.status=="Royal Assent" and (.last_activity|startswith("2025"))) |
      [.last_activity,.bill_number,.title,.url] | @tsv'
done
```

A same-date tie can reorder in the live API, and Python's seeded sample is position-sensitive, so the embedded frame in the script (not live API order) is the reproducible sampling artifact of record; changing the order after observing which Acts were classifiable would be post hoc. The cluster draw used `random.Random(SEED).sample(FRAME, 5)`. Sources: [nz-parliament skill documentation](../../../.skills/skills/nz-parliament/SKILL.md), [Parliament bills API item example](https://bills.parliament.nz/v/6/7ae98561-af36-4dc6-fee0-08dd98c831fd), [reproduction script](data/statutory_amendment_sample.py).

| Draw | Enacted Act | Assent | Administered by | Substantive amending provisions |
|---|---|---|---|---:|
| 1 | [Climate Change Response (ETS—Forestry Conversion) Amendment Act 2025 (2025/52)](https://www.legislation.govt.nz/act/public/2025/52/en/latest/) | 2025-09-23 | Ministry for the Environment | 16 |
| 2 | [Social Security Amendment Act 2025 (2025/25)](https://www.legislation.govt.nz/act/public/2025/25/en/latest/) | 2025-05-21 | Ministry of Social Development | 73 |
| 3 | [Crimes Legislation (Stalking and Harassment) Amendment Act 2025 (2025/72)](https://www.legislation.govt.nz/act/public/2025/72/en/latest/) | 2025-11-26 | Ministry of Justice | 19 |
| 4 | [Marine and Coastal Area (Takutai Moana) (Customary Marine Title) Amendment Act 2025 (2025/58)](https://www.legislation.govt.nz/act/public/2025/58/en/latest/) | 2025-10-24 | Office of Treaty Settlements and Takutai Moana | 11 |
| 5 | [Judicature (Timeliness) Legislation Amendment Act 2025 (2025/85)](https://www.legislation.govt.nz/act/public/2025/85/en/latest/) | 2025-12-19 | Ministry of Justice | 23 |

Metadata (title, assent, administering agency) is from the official XML retrieved via `legislation-nz get-act`. Source: [rework fetch log](data/statutory_amendment_fetch_log.txt).

### Classification method

Each Act's XML was parsed with Python's `xml.etree.ElementTree`. Top-level amending provisions were taken as `<prov>` elements with no `<amend>` or `<schedule>` ancestor — this correctly excludes the inserted/replaced content blocks (which live inside `<amend>`) so they are not double-counted as amendments. Title, Commencement, and "Principal Act/regulations/rules" locator provisions were excluded. For each remaining provision, the operative instruction text (all text not inside an `<amend>` block) was scanned for the operation verbs insert / replace / repeal / revoke / omit / delete. Two Social Security provisions (ss 61, 75) direct amendments "as set out in Schedule 1/3"; the referenced schedules contain insert plus replace/delete operations, so they are recorded as `mixed` (schedule-directed). Full per-provision results are embedded in the script. Source: [classification script](data/statutory_amendment_sample.py).

Running this parser against Act 2025/85 reproduced the exact 15 insert / 5 replace / 1 repeal-revoke / 2 mixed split recorded by the earlier independent browser-backed classification of that Act — an internal validation of the automated method. Sources: [Judicature Act 2025 XML](https://www.legislation.govt.nz/act/public/2025/85/en/latest.xml/), [classification script](data/statutory_amendment_sample.py).

### Per-cluster breakdown

| Act | n | insert | replace | mixed | repeal/revoke | delete | insert share |
|---|---:|---:|---:|---:|---:|---:|---:|
| 2025/52 | 16 | 11 | 3 | 1 | 1 | 0 | 68.8% |
| 2025/25 | 73 | 35 | 19 | 16 | 1 | 2 | 47.9% |
| 2025/72 | 19 | 7 | 2 | 3 | 3 | 4 | 36.8% |
| 2025/58 | 11 | 7 | 2 | 2 | 0 | 0 | 63.6% |
| 2025/85 | 23 | 15 | 5 | 2 | 1 | 0 | 65.2% |
| **All 5** | **142** | **75** | **31** | **24** | **6** | **6** | **52.8%** |

Source: [classification script](data/statutory_amendment_sample.py).

Insert is the modal (largest single) class in every cluster, including Act 2025/72, the one Act with a substantial removal component (7 insert vs 4 delete, 3 repeal/revoke). Narrow repeal/revoke never exceeds 3 provisions in any cluster and is 4.2% of the pooled total. Source: [classification script](data/statutory_amendment_sample.py).

### Operation-token (presence) view

If instead of a single primary class each provision is counted in *every* family its instructions touch, then across the 140 provisions with explicit instruction text (excluding the two schedule-directed pointers): **95 contain at least one insert instruction, 51 at least one replace, 10 at least one repeal/revoke, and 8 at least one delete**. This confirms the same qualitative picture under a different counting rule — insertion is pervasive, removal (delete + repeal/revoke) is a small minority — while showing that the treatment of replace/mixed operations is the real definitional lever on any headline percentage. Source: [classification script](data/statutory_amendment_sample.py).

### On population inference

This is a seeded random draw of 5 clusters from the 62-Act frame, fully classified into 142 provisions. Because provisions are nested within Acts, a naive provision-level confidence interval understates uncertainty; a proper cluster-aware interval over only five clusters would be wide. The robust, defensible claim is the *direction*, which is consistent across all five independently drawn clusters: 2025 NZ statutory amendment is insertion-dominated, replacement is the clear second mode, and narrow repeal/revoke is rare. A precise 2025-population percentage would need more clusters or a full-corpus classifier. Source: [classification script](data/statutory_amendment_sample.py).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| The official taxonomy distinguishes repeal/revoke, delete, replace, and insert rather than treating every "amended" heading as one type. | [PCO amending-styles page, Wayback snapshot](https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles) | [NZLC Report 35 PDF, Appendix B](https://www.lawcom.govt.nz/assets/Publications/Reports/NZLC-R35.pdf) | High |
| Across the seeded five-cluster 2025 sample, insertions dominate (52.8% of 142 provisions) and are the modal class in every cluster. | [Classification script](data/statutory_amendment_sample.py) | [Act 2025/25 XML](https://www.legislation.govt.nz/act/public/2025/25/en/latest.xml/) | High for this sample |
| Narrow repeal/revoke is rare (4.2% primary; 10 of 140 provisions by token presence). | [Classification script](data/statutory_amendment_sample.py) | [Act 2025/72 XML](https://www.legislation.govt.nz/act/public/2025/72/en/latest.xml/) | High for this sample |
| The automated XML parser reproduces the earlier browser-backed classification of Act 2025/85 exactly (15/5/1/2). | [Classification script](data/statutory_amendment_sample.py) | [Act 2025/85 XML](https://www.legislation.govt.nz/act/public/2025/85/en/latest.xml/) | High |
| A full-corpus classification looks technically feasible but was not completed here. | [nz-statute-book README](https://github.com/jonnonz1/nz-statute-book) | [Whiplash README](https://github.com/jonnonz1/whiplash) | Medium; both sources are from the same independent project |

## What would change this conclusion

- A full-2025 (or multi-year) classification of all enacted public Amendment Acts, rather than five sampled clusters, would replace the indicative population direction with a precise distribution and a proper confidence interval. The direction (insert-dominant, repeal-rare) would have to reverse in that larger corpus to overturn the qualitative headline.
- A reviewer might reasonably adopt a different rule for mixed provisions — counting every operation token rather than assigning one primary class per provision. The token-presence view above shows this does not change the qualitative conclusion, but it does move the headline percentages (e.g. replace rises from 21.8% primary to 51 of 140 provisions by presence).
- The frame is title-keyword based (`Amendment`), so it may miss 2025 amending Acts whose short title lacks "Amendment" (some reform Acts amend other Acts without "Amendment" in the title) and could in principle include private/local Acts. I did not reconcile the 62-row frame against the full official 2025 public-Act list, so the frame itself carries some coverage uncertainty.
- Two Social Security provisions (ss 61, 75) direct amendments via a schedule; I classified them `mixed` from the referenced schedules' contents. Treating them differently (e.g. by their dominant schedule operation) would shift Act 2025/25's counts by at most two provisions and would not change any headline.
- This is a research taxonomy applied to public text, not legal advice. Before the classification rule is treated as authoritative it should have legal/drafting review.

## Open follow-up questions

- Should the stream's headline metric be provision-primary class, operation-token presence, or both reported side by side?
- Is a full-2025 (or full-corpus) classifier worth building — e.g. by extending the `legislation-nz` skill or the Whiplash/nz-statute-book pipeline to emit repeal/delete/replace/insert labels directly from the XML?
- Does the insert-dominant pattern hold across earlier years, or is it specific to the 2025 legislative programme?

## Sources

1. Parliamentary Counsel Office, "A new approach to describing how amendments are made in legislation", Wayback snapshot. Accessed 8 July 2026. https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles
2. New Zealand Law Commission, *Legislation Manual: Structure and Style*, Report 35, Appendix B. Accessed 8 July 2026. https://www.lawcom.govt.nz/assets/Publications/Reports/NZLC-R35.pdf
3. `nz-parliament` vendored skill documentation. Accessed 8 July 2026. ../../../.skills/skills/nz-parliament/SKILL.md
4. `legislation-nz` vendored skill documentation. Accessed 8 July 2026. ../../../.skills/skills/legislation-nz/SKILL.md
5. Public bills.parliament.nz API item, Judicature (Timeliness) Legislation Amendment Bill. Accessed 8 July 2026. https://bills.parliament.nz/v/6/7ae98561-af36-4dc6-fee0-08dd98c831fd
6. Climate Change Response (Emissions Trading Scheme—Forestry Conversion) Amendment Act 2025 (2025/52), New Zealand Legislation (HTML and `latest.xml`). Accessed 8 July 2026. https://www.legislation.govt.nz/act/public/2025/52/en/latest/
7. Social Security Amendment Act 2025 (2025/25), New Zealand Legislation. Accessed 8 July 2026. https://www.legislation.govt.nz/act/public/2025/25/en/latest/
8. Crimes Legislation (Stalking and Harassment) Amendment Act 2025 (2025/72), New Zealand Legislation. Accessed 8 July 2026. https://www.legislation.govt.nz/act/public/2025/72/en/latest/
9. Marine and Coastal Area (Takutai Moana) (Customary Marine Title) Amendment Act 2025 (2025/58), New Zealand Legislation. Accessed 8 July 2026. https://www.legislation.govt.nz/act/public/2025/58/en/latest/
10. Judicature (Timeliness) Legislation Amendment Act 2025 (2025/85), New Zealand Legislation. Accessed 8 July 2026. https://www.legislation.govt.nz/act/public/2025/85/en/latest/
11. jonnonz1/nz-statute-book README. Accessed 8 July 2026. https://github.com/jonnonz1/nz-statute-book
12. jonnonz1/whiplash README. Accessed 8 July 2026. https://github.com/jonnonz1/whiplash
13. Reproduction + classification script for this finding. [data/statutory_amendment_sample.py](data/statutory_amendment_sample.py)
14. Rework fetch log for this finding. [data/statutory_amendment_fetch_log.txt](data/statutory_amendment_fetch_log.txt)
