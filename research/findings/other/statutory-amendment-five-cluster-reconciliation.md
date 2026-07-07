---
title: "The completed five-Act official-text sample corroborates that narrow repeals are a minority of 2025 NZ amending provisions"
domain: "other"
issue: "#746"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-08"
status: "draft"
---

# The completed five-Act official-text sample corroborates that narrow repeals are a minority of 2025 NZ amending provisions

## Executive answer

- I completed the frozen five-Act sample from issue #676 using the official legislation.govt.nz text for the five selected 2025 Amendment Acts: Climate Change Response (Emissions Trading Scheme-Forestry Conversion) Amendment Act 2025, Social Security Amendment Act 2025, Crimes Legislation (Stalking and Harassment) Amendment Act 2025, Marine and Coastal Area (Takutai Moana) (Customary Marine Title) Amendment Act 2025, and Judicature (Timeliness) Legislation Amendment Act 2025 [official Act 2025/52](https://www.legislation.govt.nz/act/public/2025/52/en/latest/), [official Act 2025/25](https://www.legislation.govt.nz/act/public/2025/25/en/latest/), [official Act 2025/72](https://www.legislation.govt.nz/act/public/2025/72/en/latest/), [official Act 2025/58](https://www.legislation.govt.nz/act/public/2025/58/en/latest/), [official Act 2025/85](https://www.legislation.govt.nz/act/public/2025/85/en/latest/), [sample script](data/statutory_amendment_five_cluster.py).
- Across 142 substantive top-level amending provisions, the primary classifications were: 76 insert, 33 replace, 23 mixed, 6 repeal/revoke, and 4 delete [sample script](data/statutory_amendment_five_cluster.py). Narrow repeal/revoke is therefore 6/142, or 4.2%; repeal/revoke plus delete is 10/142, or 7.0% [sample script](data/statutory_amendment_five_cluster.py).
- Even under a broad "removal-like" rule that counts replace, mixed, repeal/revoke, and delete provisions together, the sample has 66/142 top-level provisions, or 46.5%, with a removal/replacement component; insert-only provisions remain 76/142, or 53.5% [sample script](data/statutory_amendment_five_cluster.py).
- The nz-statute-book mirror points the same way but uses a different unit: it labels consolidated target-provision effects, not top-level amending sections. Across the matching mirror commits, I counted 219 inserted, 58 amended, 34 replaced, and 10 repealed commit-body labels tied to the five sample Acts [nz-statute-book README](https://github.com/jonnonz1/nz-statute-book), [sample script](data/statutory_amendment_five_cluster.py).
- This corroborates the stream's cautious conclusion that repeals look like a minority in the sampled 2025 official text. It still does not settle the whole NZ statute book, because the sample is only five Acts from a 2025 title-keyword frame and one Act, Social Security, supplies just over half the provisions [prior #676 finding](statutory-amendment-taxonomy-sample.md), [sample script](data/statutory_amendment_five_cluster.py).

**Overall confidence:** Medium — the five selected Acts are now classified from official text, and the mirror labels independently point in the same direction; confidence is not High because the sample is small, clustered, and limited to the frozen 2025 Amendment Bill frame.

## Evidence

### Scope and method

I answered the narrow follow-up question from issue #746: complete the five selected Acts that issue #676 had already drawn and reconcile the official-text result with the nz-statute-book mirror's operation labels [issue #746](https://github.com/thecolab-ai/the-for-good-project/issues/746), [prior #676 finding](statutory-amendment-taxonomy-sample.md). I did not redraw the sample, because the prior finding had already frozen the Parliament API frame and seed after observing order drift in same-date API results [prior #676 finding](statutory-amendment-taxonomy-sample.md), [original sample script](data/statutory_amendment_sample.py).

The unit is a top-level substantive amending provision in the Amendment Act: I excluded title, commencement, principal-Act/principal-regulation locator provisions, legislative history, administrative notes, and the nested text of newly inserted provisions or schedules [sample script](data/statutory_amendment_five_cluster.py). That is the same unit used in the prior Judicature-only classification, except that delegated schedule-amendment provisions are classified by the operation families in the schedule they invoke [prior #676 finding](statutory-amendment-taxonomy-sample.md), [sample script](data/statutory_amendment_five_cluster.py).

The classification taxonomy follows the stream framing: repeal/revoke removes a whole enactment or whole provision; delete removes smaller text; replace substitutes new text for existing text; insert adds new text; mixed means a top-level provision contains more than one operation family [PCO amending-styles page, Wayback snapshot](https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles), [NZLC Report 35 PDF](https://www.lawcom.govt.nz/assets/Publications/Reports/NZLC-R35.pdf), [sample script](data/statutory_amendment_five_cluster.py).

Direct `curl`, the vendored `legislation-nz` XML path, and `scripts/fetch.mjs` still returned AWS WAF challenge or unexpected-HTML results in this worktree; the usable official text was fetched through the public Jina reader over legislation.govt.nz HTML on 8 July 2026, after the repo's fast fetch rungs failed [legislation-nz skill notes](../../../.skills/skills/legislation-nz/SKILL.md), [sample script](data/statutory_amendment_five_cluster.py). This is a tooling route to the official public URL, not a separate legal source; the cited legal source remains legislation.govt.nz [official Act 2025/52](https://www.legislation.govt.nz/act/public/2025/52/en/latest/), [official Act 2025/25](https://www.legislation.govt.nz/act/public/2025/25/en/latest/), [official Act 2025/72](https://www.legislation.govt.nz/act/public/2025/72/en/latest/), [official Act 2025/58](https://www.legislation.govt.nz/act/public/2025/58/en/latest/), [official Act 2025/85](https://www.legislation.govt.nz/act/public/2025/85/en/latest/).

### Official-text classification

The five selected Acts contain 142 substantive top-level amending provisions under this unit rule: 16 in Climate Change Response, 73 in Social Security, 19 in Crimes Legislation, 11 in Marine and Coastal Area, and 23 in Judicature [sample script](data/statutory_amendment_five_cluster.py). The official pages identify those Acts as Public Act 2025 No 52, No 25, No 72, No 58, and No 85 respectively, with assent dates matching the frozen sample [official Act 2025/52](https://www.legislation.govt.nz/act/public/2025/52/en/latest/), [official Act 2025/25](https://www.legislation.govt.nz/act/public/2025/25/en/latest/), [official Act 2025/72](https://www.legislation.govt.nz/act/public/2025/72/en/latest/), [official Act 2025/58](https://www.legislation.govt.nz/act/public/2025/58/en/latest/), [official Act 2025/85](https://www.legislation.govt.nz/act/public/2025/85/en/latest/).

| Act | Substantive provisions | Insert | Replace | Mixed | Repeal/revoke | Delete |
|---|---:|---:|---:|---:|---:|---:|
| Climate Change Response (ETS-Forestry Conversion) Amendment Act 2025 | 16 | 11 | 3 | 1 | 1 | 0 |
| Social Security Amendment Act 2025 | 73 | 36 | 20 | 15 | 1 | 1 |
| Crimes Legislation (Stalking and Harassment) Amendment Act 2025 | 19 | 7 | 3 | 3 | 3 | 3 |
| Marine and Coastal Area (Takutai Moana) (Customary Marine Title) Amendment Act 2025 | 11 | 7 | 2 | 2 | 0 | 0 |
| Judicature (Timeliness) Legislation Amendment Act 2025 | 23 | 15 | 5 | 2 | 1 | 0 |
| **Total** | **142** | **76** | **33** | **23** | **6** | **4** |

Source: [sample script](data/statutory_amendment_five_cluster.py).

On a primary-class basis, insert-only provisions are the largest group at 76/142 (53.5%), while narrow repeal/revoke provisions are 6/142 (4.2%) and repeal/revoke plus delete provisions are 10/142 (7.0%) [sample script](data/statutory_amendment_five_cluster.py). If mixed provisions are counted in every operation family they contain, the sample has 97 provisions with an insert operation, 55 with a replace operation, 11 with a repeal/revoke operation, and 6 with a delete operation; those operation-presence counts overlap and therefore sum to more than 142 [sample script](data/statutory_amendment_five_cluster.py).

The broadest plausible "repeal-like" sensitivity I tested is to treat any top-level provision whose primary class is replace, mixed, repeal/revoke, or delete as having a removal/replacement component; that yields 66/142 (46.5%) rather than a majority [sample script](data/statutory_amendment_five_cluster.py). This matters because the PCO taxonomy treats replace as distinct from repeal, but the stream framing already identified replace as the biggest definitional lever [PCO amending-styles page, Wayback snapshot](https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles), [stream framing](../../../analysis/are-most-nz-statutory-amendments-actually-repeals-framing.md).

### Mirror reconciliation

The nz-statute-book mirror is generated from PCO XML, one public Act file per Act, one consolidation commit per electronic reprint, and commit bodies list amendments effective that day [nz-statute-book README](https://github.com/jonnonz1/nz-statute-book). Its labels do not use the same unit as the official-text table above: a single top-level amending provision can create many mirror labels if it inserts a block of sections, and some official provisions that amend secondary legislation are absent because the mirror covers public Acts [nz-statute-book README](https://github.com/jonnonz1/nz-statute-book), [sample script](data/statutory_amendment_five_cluster.py).

I counted mirror operation labels by filtering commit-body lines that name each of the five selected Amendment Acts, across the relevant target-Act consolidation commits recorded in the data script [sample script](data/statutory_amendment_five_cluster.py). The mirror label totals were:

| Act | Mirror inserted | Mirror amended | Mirror replaced | Mirror repealed |
|---|---:|---:|---:|---:|
| Climate Change Response (ETS-Forestry Conversion) Amendment Act 2025 | 103 | 3 | 4 | 2 |
| Social Security Amendment Act 2025 | 45 | 34 | 22 | 2 |
| Crimes Legislation (Stalking and Harassment) Amendment Act 2025 | 8 | 12 | 0 | 5 |
| Marine and Coastal Area (Takutai Moana) (Customary Marine Title) Amendment Act 2025 | 37 | 3 | 4 | 1 |
| Judicature (Timeliness) Legislation Amendment Act 2025 | 26 | 6 | 4 | 0 |
| **Total** | **219** | **58** | **34** | **10** |

Source: [sample script](data/statutory_amendment_five_cluster.py), with commit-label source format described in the [nz-statute-book README](https://github.com/jonnonz1/nz-statute-book).

The reconciliation is directionally consistent rather than exact. The official-text sample says narrow repeal/revoke provisions are 6/142 (4.2%); the mirror says repealed target-provision labels are 10 out of 321 counted labels (3.1%) [sample script](data/statutory_amendment_five_cluster.py). The official-text sample says insertions dominate on both primary class and operation-presence views; the mirror also has inserted labels as the largest label class, 219/321 (68.2%) [sample script](data/statutory_amendment_five_cluster.py).

There are expected mismatches. The mirror labels many word-level replacements and deletions as "amended", so its "amended" bucket is not equivalent to the PCO-style replace/delete distinction used here [nz-statute-book README](https://github.com/jonnonz1/nz-statute-book), [sample script](data/statutory_amendment_five_cluster.py). The Judicature Act's official text has three High Court Rules provisions, including one revoke provision, but nz-statute-book is a public-Acts mirror and therefore does not carry those secondary-legislation effects [official Act 2025/85](https://www.legislation.govt.nz/act/public/2025/85/en/latest/), [nz-statute-book README](https://github.com/jonnonz1/nz-statute-book), [sample script](data/statutory_amendment_five_cluster.py).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Narrow repeal/revoke is small in the completed official sample: 6/142 provisions, or 4.2%. | [Official legislation.govt.nz pages for the five Acts](https://www.legislation.govt.nz/act/public/2025/52/en/latest/) | [Reproducible classification script](data/statutory_amendment_five_cluster.py) | Medium-High for the five-Act sample |
| The mirror independently points in the same direction: repealed labels are 10/321 counted operation labels. | [nz-statute-book README](https://github.com/jonnonz1/nz-statute-book) | [Reproducible mirror-label rollup](data/statutory_amendment_five_cluster.py) | Medium |
| The result does not justify a whole-statute-book estimate. | [Prior #676 finding documenting the frozen 2025 title-keyword frame](statutory-amendment-taxonomy-sample.md) | [Completed sample script showing only five Acts and 142 clustered provisions](data/statutory_amendment_five_cluster.py) | High |

## What would change this conclusion

- A larger pre-registered sample, or a full-corpus classifier over PCO XML, could move the share materially because this five-Act sample is clustered and Social Security supplies 73 of 142 provisions [sample script](data/statutory_amendment_five_cluster.py), [PCO API docs](https://api.legislation.govt.nz/docs/).
- A different headline definition could change the interpretation: counting replace and every mixed provision as repeal-like raises the sample to 66/142 (46.5%), still not a majority here, but close enough that future findings should always report both narrow and broad definitions [sample script](data/statutory_amendment_five_cluster.py), [PCO amending-styles page, Wayback snapshot](https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles).
- A direct PCO XML/API extraction could improve reproducibility and remove the Jina-reader dependency used here after local WAF blocks [legislation-nz skill notes](../../../.skills/skills/legislation-nz/SKILL.md), [PCO API docs](https://api.legislation.govt.nz/docs/).
- I could not verify whether the 2025 Parliament keyword frame captures every enacted 2025 public Amendment Act; that limitation carries over from the prior finding [prior #676 finding](statutory-amendment-taxonomy-sample.md), [original sample script](data/statutory_amendment_sample.py).
- I did not obtain legal or PCO drafting review of the classification rule. A drafting expert might split or group delegated schedule provisions differently.

## Open follow-up questions

- Can the Whiplash/nz-statute-book parser expose a stable machine-readable operation table that maps each mirror label back to the exact amending Act section?
- Should future stream summaries report three headline views: narrow repeal/revoke, delete-plus-repeal, and broad removal/replacement?
- Is a full-2025 official PCO XML classification feasible with a PCO API key or local bulk XML mirror?

## Sources

1. Parliamentary Counsel Office, "A new approach to describing how amendments are made in legislation", Wayback snapshot. Accessed 8 July 2026. https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles
2. New Zealand Law Commission, *Legislation Manual: Structure and Style*, Report 35. Accessed 8 July 2026. https://www.lawcom.govt.nz/assets/Publications/Reports/NZLC-R35.pdf
3. Climate Change Response (Emissions Trading Scheme-Forestry Conversion) Amendment Act 2025, New Zealand Legislation. Accessed 8 July 2026 via Jina reader after direct local fetches returned WAF challenge HTML. https://www.legislation.govt.nz/act/public/2025/52/en/latest/
4. Social Security Amendment Act 2025, New Zealand Legislation. Accessed 8 July 2026 via Jina reader after direct local fetches returned WAF challenge HTML. https://www.legislation.govt.nz/act/public/2025/25/en/latest/
5. Crimes Legislation (Stalking and Harassment) Amendment Act 2025, New Zealand Legislation. Accessed 8 July 2026 via Jina reader after direct local fetches returned WAF challenge HTML. https://www.legislation.govt.nz/act/public/2025/72/en/latest/
6. Marine and Coastal Area (Takutai Moana) (Customary Marine Title) Amendment Act 2025, New Zealand Legislation. Accessed 8 July 2026 via Jina reader after direct local fetches returned WAF challenge HTML. https://www.legislation.govt.nz/act/public/2025/58/en/latest/
7. Judicature (Timeliness) Legislation Amendment Act 2025, New Zealand Legislation. Accessed 8 July 2026 via Jina reader after direct local fetches returned WAF challenge HTML. https://www.legislation.govt.nz/act/public/2025/85/en/latest/
8. jonnonz1/nz-statute-book README. Accessed 8 July 2026. https://github.com/jonnonz1/nz-statute-book
9. PCO developer API docs. Accessed 8 July 2026. https://api.legislation.govt.nz/docs/
10. The For Good Project, prior issue #676 finding. [statutory-amendment-taxonomy-sample.md](statutory-amendment-taxonomy-sample.md)
11. Reproducible classification and mirror-label rollup for this finding. [data/statutory_amendment_five_cluster.py](data/statutory_amendment_five_cluster.py)
12. Original frozen sample script from issue #676. [data/statutory_amendment_sample.py](data/statutory_amendment_sample.py)
13. Vendored `legislation-nz` skill notes. [../../../.skills/skills/legislation-nz/SKILL.md](../../../.skills/skills/legislation-nz/SKILL.md)
