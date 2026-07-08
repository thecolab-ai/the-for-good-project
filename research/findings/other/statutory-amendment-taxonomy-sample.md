---
title: "A seeded 2025 five-cluster extraction table of NZ Amendment Acts is insertion-dominant, but not independently reproduced"
domain: "other"
issue: "#676"
confidence: "Low"
author: "codex"
agent: "codex"
model: "gpt-5"
date: "2026-07-08"
status: "draft"
---

# A seeded 2025 five-cluster extraction table of NZ Amendment Acts is insertion-dominant, but not independently reproduced

## Executive answer

- The five selected 2025 Amendment Acts have now been classified as a full five-cluster extraction table from official legislation.govt.nz text, but live XML access is intermittent in this environment and currently returns AWS WAF challenge HTML. The auditable artifact in this PR is therefore the committed per-provision table with official section anchors, plus a rollup script; the later five-cluster reconciliation artifact is only a duplicate-table consistency check, not independent corroboration. Sources: [rework fetch log](data/statutory_amendment_fetch_log.txt), [classification script](data/statutory_amendment_sample.py), [five-cluster reconciliation script](data/statutory_amendment_five_cluster.py).
- In that committed extraction table there are **142 substantive amending provisions**. Primary operation class: **insert 76 (53.5%), replace 33 (23.2%), mixed 23 (16.2%), repeal/revoke 6 (4.2%), delete 4 (2.8%)**. Insertions are the single largest class overall and in **every one of the five clusters**; narrow repeal/revoke is the smallest or near-smallest class in every cluster. This is a single manual extraction result with official row anchors, not an independently reproduced classification. Sources: [classification script](data/statutory_amendment_sample.py), [official Act pages: 2025/52](https://www.legislation.govt.nz/act/public/2025/52/en/latest/), [2025/25](https://www.legislation.govt.nz/act/public/2025/25/en/latest/), [2025/72](https://www.legislation.govt.nz/act/public/2025/72/en/latest/), [2025/58](https://www.legislation.govt.nz/act/public/2025/58/en/latest/), [2025/85](https://www.legislation.govt.nz/act/public/2025/85/en/latest/).
- The seed `fg-676-2025-amendment-act-cluster-v1` drew: Climate Change Response (ETS—Forestry Conversion) 2025/52, Social Security 2025/25, Crimes Legislation (Stalking and Harassment) 2025/72, Marine and Coastal Area (Takutai Moana) (Customary Marine Title) 2025/58, and Judicature (Timeliness) Legislation 2025/85. Bill→Act mappings were checked against official Act pages and the later five-cluster reconciliation artifact. Sources: [2025/52](https://www.legislation.govt.nz/act/public/2025/52/en/latest/), [2025/25](https://www.legislation.govt.nz/act/public/2025/25/en/latest/), [2025/72](https://www.legislation.govt.nz/act/public/2025/72/en/latest/), [2025/58](https://www.legislation.govt.nz/act/public/2025/58/en/latest/), [2025/85](https://www.legislation.govt.nz/act/public/2025/85/en/latest/), [five-cluster reconciliation script](data/statutory_amendment_five_cluster.py).
- The taxonomy holds in the extraction table: "amended" section headings routinely conceal a *mix* of insert/replace/repeal/delete instructions. 23 of 142 provisions (16.2%) carry more than one operation family, so classifying by heading alone would materially misstate this table. Sources: [classification script](data/statutory_amendment_sample.py), [official Act pages: 2025/52](https://www.legislation.govt.nz/act/public/2025/52/en/latest/), [2025/25](https://www.legislation.govt.nz/act/public/2025/25/en/latest/), [2025/72](https://www.legislation.govt.nz/act/public/2025/72/en/latest/), [2025/58](https://www.legislation.govt.nz/act/public/2025/58/en/latest/), [2025/85](https://www.legislation.govt.nz/act/public/2025/85/en/latest/).
- This is a seeded extraction table, not a census. Five clusters out of a frozen 62-row Parliament keyword frame is a small cluster sample, so the *direction* (insert-dominant, repeal-rare) should be treated as an auditable lead for this sample rather than as a population estimate for all 2025 NZ amendments. Sources: [classification script](data/statutory_amendment_sample.py), [nz-parliament skill documentation](../../../.skills/skills/nz-parliament/SKILL.md).

**Overall confidence:** Low — the insert-dominant / repeal-rare direction is internally consistent across all five sampled clusters and every row now has an official section anchor, but the classification is still a single manual extraction table rather than a live XML parser or independently reproduced classification, live XML fetching is currently blocked by AWS WAF in this environment, and five clusters is a small sample.

## Evidence

### Taxonomy used

The NZ drafting taxonomy distinguishes four operation families: **repeal/revoke** removes a whole enactment or whole provision ("revoke" for secondary legislation); **delete** removes text smaller than a subsection; **replace** removes existing text and substitutes new text in one operation; **insert** adds new text. PCO's amending-styles page describes that Repeal / Delete / Replace / Insert vocabulary, and the Law Commission's Legislation Manual independently describes amending laws as repealing, altering, substituting, or incorporating provisions. Sources: [PCO amending-styles page, Wayback snapshot](https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles), [NZLC Report 35 PDF, Appendix B](https://www.lawcom.govt.nz/assets/Publications/Reports/NZLC-R35.pdf).

Headings alone are not enough. For example, Act 2025/52 s 6 is headed "Section 4 amended (Interpretation)" but its operative text contains insert and replace instructions; Act 2025/72 s 15 is headed "Section 6 amended (Object)" but its official text contains repeal and replace instructions. I therefore classified each provision by its operative instruction text, not by whether the heading says "amended". A provision containing only one operation family is assigned that family; a provision whose instructions span two or more families is **mixed**. Sources: [2025/52 s 6](https://www.legislation.govt.nz/act/public/2025/52/en/latest/#LMS1434744), [2025/72 s 15](https://www.legislation.govt.nz/act/public/2025/72/en/latest/#LMS1015377), [classification script](data/statutory_amendment_sample.py).

### How the previously-blocked text was handled

On the 7 July run, four of the five selected Acts (2025/52, 2025/25, 2025/72, 2025/58) returned `HTTP/2 202` with `x-amzn-waf-action: challenge`, and only Act 2025/85 had been classified through browser-backed extraction. A current recheck in this worktree again returns AWS WAF challenge HTML from direct `curl`, `scripts/fetch.mjs`, and the vendored `legislation-nz get-act` XML path, while the Jina reader route can retrieve public official HTML for all five Act pages. This finding therefore does not rely on reviewers being able to live-fetch XML; the reproducible evidence is the committed per-provision table and rollups, with one official-page anchor per row and the WAF limitation recorded. Sources: [legislation-nz skill notes](../../../.skills/skills/legislation-nz/SKILL.md), [rework fetch log](data/statutory_amendment_fetch_log.txt), [classification script](data/statutory_amendment_sample.py).

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

Metadata (title, assent date, and administering agency) is retained from the committed rework artifacts and official Act pages; current local XML fetches are WAF-blocked, so the metadata is not presented as a fresh `legislation-nz get-act` rerun. Sources: [rework fetch log](data/statutory_amendment_fetch_log.txt), [five-cluster reconciliation script](data/statutory_amendment_five_cluster.py).

### Classification method

The unit is a top-level substantive amending provision in the selected Amendment Act. Title, Commencement, "Principal Act/regulations/rules" locator provisions, legislative history, administrative notes, and nested inserted/replaced text are excluded. For each counted provision, the committed table records the provision label, heading, primary operation family, every operation family present in the operative instruction, and a stable official-page fragment URL; run `python3 research/findings/other/data/statutory_amendment_sample.py --rows` to print the full 142-row audit table. A provision containing only one operation family is assigned that family; a provision whose instructions span two or more families is **mixed**. Two Social Security provisions (ss 61, 75) direct amendments "as set out in Schedule 1/3"; they are classified from the operation families in the referenced schedules. Sources: [classification script](data/statutory_amendment_sample.py), [2025/25 s 61](https://www.legislation.govt.nz/act/public/2025/25/en/latest/#LMS1014401), [2025/25 s 75](https://www.legislation.govt.nz/act/public/2025/25/en/latest/#LMS1014455).

### Per-cluster breakdown

| Act | n | insert | replace | mixed | repeal/revoke | delete | insert share |
|---|---:|---:|---:|---:|---:|---:|---:|
| 2025/52 | 16 | 11 | 3 | 1 | 1 | 0 | 68.8% |
| 2025/25 | 73 | 36 | 20 | 15 | 1 | 1 | 49.3% |
| 2025/72 | 19 | 7 | 3 | 3 | 3 | 3 | 36.8% |
| 2025/58 | 11 | 7 | 2 | 2 | 0 | 0 | 63.6% |
| 2025/85 | 23 | 15 | 5 | 2 | 1 | 0 | 65.2% |
| **All 5** | **142** | **76** | **33** | **23** | **6** | **4** | **53.5%** |

Source: [classification script](data/statutory_amendment_sample.py).

Insert is the modal (largest single) class in every cluster, including Act 2025/72, the one Act with a substantial removal component (7 insert vs 3 delete, 3 repeal/revoke). Narrow repeal/revoke never exceeds 3 provisions in any cluster and is 4.2% of the pooled total in this extraction table. Source: [classification script](data/statutory_amendment_sample.py).

### Operation-token (presence) view

If instead of a single primary class each provision is counted in *every* family its instructions touch, the overlapping operation-presence counts are: **97 contain at least one insert instruction, 55 at least one replace, 11 at least one repeal/revoke, and 6 at least one delete**. This gives the same qualitative picture under a different counting rule — insertion is pervasive, removal (delete + repeal/revoke) is a small minority — while showing that the treatment of replace/mixed operations is the real definitional lever on any headline percentage. Source: [classification script](data/statutory_amendment_sample.py).

### On population inference

This is a seeded random draw of 5 clusters from the frozen 62-row frame, fully classified into 142 provisions in the committed extraction table. Because provisions are nested within Acts, a naive provision-level confidence interval understates uncertainty; a proper cluster-aware interval over only five clusters would be wide. The defensible claim is limited to the direction in this table: statutory amendment in the sample is insertion-dominated, replacement is the clear second mode, and narrow repeal/revoke is rare. A precise 2025-population percentage would need more clusters or a full-corpus classifier. Sources: [classification script](data/statutory_amendment_sample.py), [nz-parliament skill documentation](../../../.skills/skills/nz-parliament/SKILL.md).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| The official taxonomy distinguishes repeal/revoke, delete, replace, and insert rather than treating every "amended" heading as one type. | [PCO amending-styles page, Wayback snapshot](https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles) | [NZLC Report 35 PDF, Appendix B](https://www.lawcom.govt.nz/assets/Publications/Reports/NZLC-R35.pdf) | High |
| Across the seeded five-cluster 2025 extraction table, insertions dominate (53.5% of 142 provisions) and are the modal class in every cluster. | [Classification script with row-level official anchors](data/statutory_amendment_sample.py) | No independent reproduction; [five-cluster reconciliation script](data/statutory_amendment_five_cluster.py) is only a duplicate-table consistency check | Low |
| Narrow repeal/revoke is rare in the extraction table (4.2% primary; 11 operation-presence hits). | [Classification script with row-level official anchors](data/statutory_amendment_sample.py) | No independent reproduction; official row anchors allow audit against the five Act pages | Low |
| The committed artifact is an extraction table and rollup, not a live XML parser; current local XML fetches are WAF-blocked. | [Rework fetch log](data/statutory_amendment_fetch_log.txt) | [legislation-nz skill notes](../../../.skills/skills/legislation-nz/SKILL.md) | High |
| A full-corpus classification looks technically feasible but was not completed here. | [nz-statute-book README](https://github.com/jonnonz1/nz-statute-book) | [Whiplash README](https://github.com/jonnonz1/whiplash) | Medium; both sources are from the same independent project |

## What would change this conclusion

- A full-2025 (or multi-year) classification of all enacted public Amendment Acts, rather than five sampled clusters, would replace the indicative population direction with a precise distribution and a proper confidence interval. The direction (insert-dominant, repeal-rare) would have to reverse in that larger corpus to overturn the qualitative headline.
- A reviewer might reasonably adopt a different rule for mixed provisions — counting every operation token rather than assigning one primary class per provision. The token-presence view above shows this does not change the qualitative conclusion, but it does move the headline percentages (e.g. replace rises from 23.2% primary to 55 operation-presence hits).
- The frame is title-keyword based (`Amendment`), so it may miss 2025 amending Acts whose short title lacks "Amendment" (some reform Acts amend other Acts without "Amendment" in the title) and could in principle include private/local Acts. I did not reconcile the 62-row frame against the full official 2025 public-Act list, so the frame itself carries some coverage uncertainty.
- Two Social Security provisions (ss 61, 75) direct amendments via a schedule; I classified them `mixed` from the referenced schedules' contents. Treating them differently (e.g. by their dominant schedule operation) would shift Act 2025/25's counts by at most two provisions and would not change the insert-dominant or repeal-rare sample direction.
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
6. Climate Change Response (Emissions Trading Scheme—Forestry Conversion) Amendment Act 2025 (2025/52), New Zealand Legislation. Accessed 8 July 2026. https://www.legislation.govt.nz/act/public/2025/52/en/latest/
7. Social Security Amendment Act 2025 (2025/25), New Zealand Legislation. Accessed 8 July 2026. https://www.legislation.govt.nz/act/public/2025/25/en/latest/
8. Crimes Legislation (Stalking and Harassment) Amendment Act 2025 (2025/72), New Zealand Legislation. Accessed 8 July 2026. https://www.legislation.govt.nz/act/public/2025/72/en/latest/
9. Marine and Coastal Area (Takutai Moana) (Customary Marine Title) Amendment Act 2025 (2025/58), New Zealand Legislation. Accessed 8 July 2026. https://www.legislation.govt.nz/act/public/2025/58/en/latest/
10. Judicature (Timeliness) Legislation Amendment Act 2025 (2025/85), New Zealand Legislation. Accessed 8 July 2026. https://www.legislation.govt.nz/act/public/2025/85/en/latest/
11. jonnonz1/nz-statute-book README. Accessed 8 July 2026. https://github.com/jonnonz1/nz-statute-book
12. jonnonz1/whiplash README. Accessed 8 July 2026. https://github.com/jonnonz1/whiplash
13. Reproduction + classification script for this finding. [data/statutory_amendment_sample.py](data/statutory_amendment_sample.py)
14. Rework fetch log for this finding. [data/statutory_amendment_fetch_log.txt](data/statutory_amendment_fetch_log.txt)
15. Five-cluster reconciliation script used as a duplicate-table rollup cross-check, not independent corroboration. [data/statutory_amendment_five_cluster.py](data/statutory_amendment_five_cluster.py)
