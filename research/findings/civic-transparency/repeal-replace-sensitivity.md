---
title: "Counting Replace as repeal roughly doubles the repeal share in a recent NZ amendment sample, but does not make it 'mostly repeals'"
domain: "civic-transparency"
issue: "#677"
confidence: "Medium"
author: "codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-07"
status: "draft"
---

# Counting Replace as repeal roughly doubles the repeal share in a recent NZ amendment sample, but does not make it "mostly repeals"

## Executive answer

- **Answer:** In a fixed-seed sample of 120 recent NZ amendment records, the narrow repeal share is **13/120 = 10.8%** when only `repealed` records are counted, and the broad share is **28/120 = 23.3%** when `replaced` records are also counted. That is a **+12.5 percentage-point** move, or about **2.15x** the narrow share, but it does **not** flip the headline from minority to majority.
- **Method limit:** The intended core sample from issue #676 was not available when this finding was written: issue #676 was still open with no comments or PR output. I therefore used a provisional fixed-seed sample from the same public infrastructure identified in the stream framing: `jonnonz1/nz-statute-book`, whose README says it renders every public Act consolidation as git commits from PCO XML, with commit bodies listing amendments effective on that date [issue #676](https://github.com/thecolab-ai/the-for-good-project/issues/676); [jonnonz1/nz-statute-book README](https://github.com/jonnonz1/nz-statute-book).
- **Sanity check:** In the full recent extraction frame used for the sample, not just the 120 sampled records, the same scoring choice moves from **1,076/8,000 = 13.5%** narrow to **1,895/8,000 = 23.7%** broad. That supports the direction and size of the sample result, but it is still a parser-over-mirror result rather than a completed official full-corpus classification [jonnonz1/nz-statute-book README](https://github.com/jonnonz1/nz-statute-book); [jonnonz1/whiplash README](https://github.com/jonnonz1/whiplash).
- **Interpretation:** `Replace` is definition-sensitive because PCO's current amending-style page says the modern "Replace section 13 with:" form replaced the old wording "Section 13 is repealed and the following section substituted"; the Law Commission's Legislation Manual separately describes amending laws as repeal, alteration, substitution, or incorporation of new provisions [PCO amending-styles page, Wayback snapshot](https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles); [NZLC Report 35, Appendix B](https://web.archive.org/web/20241222125322/http://www.nzlii.org/nz/other/nzlc/report/R35/R35-Appendix-2.html).

**Overall confidence:** Medium — the arithmetic is reproducible and the result is stable in the extracted recent frame, but the sample is provisional because the issue #676 core sample was not yet available and because the operation labels come from a community mirror of PCO XML rather than a direct PCO API/full-corpus export.

## Evidence

### Question answered and definitions

This finding answers one narrow question from issue #677: using one documented sample, does the headline move enough to become "mostly repeals" if `Replace` operations are counted as repeal rather than excluded [issue #677](https://github.com/thecolab-ai/the-for-good-project/issues/677).

I scored two definitions:

- **Narrow repeal:** records whose operation verb is `repealed`.
- **Broad repeal:** records whose operation verb is `repealed` or `replaced`.

This maps to the PCO/NZLC taxonomy used in the stream framing: PCO distinguishes `Repeal`, `Delete`, `Replace`, and `Insert`, and specifically explains that the old substitute style stated that a section "is repealed" before the replacement text, while the new style says "Replace section 13 with:" [PCO amending-styles page, Wayback snapshot](https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles). The Law Commission's Legislation Manual independently describes amending laws as doing four broad things: repealing, altering, substituting, or incorporating new provisions [NZLC Report 35, Appendix B](https://web.archive.org/web/20241222125322/http://www.nzlii.org/nz/other/nzlc/report/R35/R35-Appendix-2.html).

### Sampling frame and reproducibility

Because the issue #676 core sample was unavailable, I used this provisional frame: amendment records listed in `jonnonz1/nz-statute-book` commit bodies from **2024-01-01 through 2026-06-06**, excluding repository housekeeping commits whose subjects are not statute-consolidation subjects. The repository README says it contains one file per public Act, one commit per electronic consolidation, and commit bodies listing the amendments effective that day; it also says it is rendered deterministically from PCO XML and that the amendment graph lives in the sibling Whiplash pipeline [jonnonz1/nz-statute-book README](https://github.com/jonnonz1/nz-statute-book). The Whiplash README describes its pipeline as a legislation mirror, `<history-note>` parser, and amendment graph, with raw PCO XML mirrored locally and a regenerable SQLite graph [jonnonz1/whiplash README](https://github.com/jonnonz1/whiplash).

I cloned `https://github.com/jonnonz1/nz-statute-book.git` and used HEAD `1273f588169084689c052a1c685f2a7ec1481720`, the repository's `main` HEAD when this finding was written [jonnonz1/nz-statute-book HEAD](https://github.com/jonnonz1/nz-statute-book/tree/1273f588169084689c052a1c685f2a7ec1481720). The exact extraction and sample command was:

```python
import subprocess, re, random

repo = "/tmp/nz-statute-book"
log = subprocess.check_output([
    "git", "log",
    "--since=2024-01-01",
    "--until=2026-06-06",
    "--format=%H%x1f%ad%x1f%s%x1f%b%x1e",
    "--date=short",
], cwd=repo, text=True)

records = []
for rec in log.strip("\x1e\n").split("\x1e"):
    if not rec.strip():
        continue
    parts = rec.lstrip("\n").split("\x1f", 3)
    if len(parts) < 4:
        continue
    commit, date, subject, body = parts
    if not subject[:4].isdigit():
        continue
    subject_match = re.match(r"(\d{4}-\d{2}-\d{2}) · ([^·]+) · (.+?) \(v([^)]+)\)", subject)
    if not subject_match:
        continue
    target_act = subject_match.group(3)
    for line in body.splitlines():
        match = re.match(r"- (amended|inserted|repealed|replaced) (.+?) — (.+)$", line.strip())
        if match:
            records.append((commit, date, target_act, match.group(1), match.group(2), match.group(3)))

sample = random.Random("fg-667-replace-sensitivity-v1").sample(records, 120)
```

That extraction produced **8,000** amendment records: **3,508 inserted**, **2,597 amended**, **1,076 repealed**, and **819 replaced**. The 120-record fixed-seed sample contained **56 inserted**, **36 amended**, **13 repealed**, and **15 replaced**. The sample rows were read from the commit bodies and spot-checked against diffs; for example, commit `37ccce3a8664dff4169431548570e67bdfa5573b` lists two `replaced` Data and Statistics Act records and one `inserted` record, and its diff shows section 12(1) text replaced plus a new section 12(1A) inserted [example commit](https://github.com/jonnonz1/nz-statute-book/commit/37ccce3a8664dff4169431548570e67bdfa5573b).

### Result

| Scoring rule | Count | Share of N=120 | Approx. 95% Wilson interval | Headline |
|---|---:|---:|---:|---|
| Narrow: `repealed` only | 13 | 10.8% | 6.4% to 17.7% | Minority |
| Broad: `repealed` + `replaced` | 28 | 23.3% | 16.7% to 31.7% | Minority |

The scoring decision therefore moves the sample by **+15 records**, **+12.5 percentage points**, or about **2.15x** the narrow share. It does not come close to a majority framing in this sample.

The full recent extraction frame gives a similar non-flip result:

| Scoring rule | Count | Share of 8,000-record recent frame | Approx. 95% Wilson interval |
|---|---:|---:|---:|
| Narrow: `repealed` only | 1,076 | 13.5% | 12.7% to 14.2% |
| Broad: `repealed` + `replaced` | 1,895 | 23.7% | 22.8% to 24.6% |

I treat the 8,000-record frame as a useful robustness check rather than the headline answer, because the stream asked for sample-based classification and because the mirror's operation labels should eventually be reconciled against PCO's official XML/history-note structure by issue #676 or #679 [issue #676](https://github.com/thecolab-ai/the-for-good-project/issues/676); [issue #679](https://github.com/thecolab-ai/the-for-good-project/issues/679).

### Sample audit list

These are the 28 sampled records counted under the broad rule; the first 13 are `repealed` records and the next 15 are `replaced` records. Each row is traceable to a public git commit in `jonnonz1/nz-statute-book`.

| Operation | Unit | Target Act | Amending Act | Date | Commit |
|---|---|---|---|---|---|
| repealed | Section 40 | Forests (Legal Harvest Assurance) Amendment Act 2023 | Forests (Log Traders and Forestry Advisers Repeal) Amendment Act 2024 | 2024-06-30 | [2fffbf6](https://github.com/jonnonz1/nz-statute-book/commit/2fffbf6f59bb) |
| repealed | Section 65H | Land Transport Management Act 2003 | Land Transport Management (Repeal of Regional Fuel Tax) Amendment Act 2024 | 2024-07-01 | [c9e248d](https://github.com/jonnonz1/nz-statute-book/commit/c9e248d41744) |
| repealed | Section 2(1) | Forests Act 1949 | Forests (Log Traders and Forestry Advisers Repeal) Amendment Act 2024 | 2024-06-30 | [6f644d2](https://github.com/jonnonz1/nz-statute-book/commit/6f644d2da676) |
| repealed | Section 63C | Forests Act 1949 | Forests (Log Traders and Forestry Advisers Repeal) Amendment Act 2024 | 2024-06-30 | [6f644d2](https://github.com/jonnonz1/nz-statute-book/commit/6f644d2da676) |
| repealed | Heading | Banking (Prudential Supervision) Act 1989 | Financial Market Infrastructures Act 2021 | 2024-03-01 | [dacfef4](https://github.com/jonnonz1/nz-statute-book/commit/dacfef476a85) |
| repealed | COVID-19 Public Health Response (Extension of Act and Reduction of Powers) Amendment Act 2022 | COVID-19 Public Health Response (Extension of Act and Reduction of Powers) Amendment Act 2022 | COVID-19 Public Health Response Act 2020 | 2024-11-26 | [9f631bd](https://github.com/jonnonz1/nz-statute-book/commit/9f631bd36966) |
| repealed | Section 5(b) | Water Services Authority--Taumata Arowai Act 2020 | Local Government (Water Services) (Repeals and Amendments) Act 2025 | 2025-08-27 | [b0a8c18](https://github.com/jonnonz1/nz-statute-book/commit/b0a8c181833b) |
| repealed | Section 16 | Forests (Legal Harvest Assurance) Amendment Act 2023 | Forests (Log Traders and Forestry Advisers Repeal) Amendment Act 2024 | 2024-06-30 | [2fffbf6](https://github.com/jonnonz1/nz-statute-book/commit/2fffbf6f59bb) |
| repealed | Section 19(4) | Crown Research Institutes Act 1992 | Regulatory Systems (Economic Development) Amendment Act 2025 | 2025-03-30 | [4a3dc79](https://github.com/jonnonz1/nz-statute-book/commit/4a3dc79f86f5) |
| repealed | Section 34 | Charities Act 2005 | Charities Amendment Act 2023 | 2024-07-05 | [8930299](https://github.com/jonnonz1/nz-statute-book/commit/8930299e9df7) |
| repealed | Section EX 55(15) heading | Income Tax Act 2007 | Taxation (Annual Rates for 2025-26, Compliance Simplification, and Remedial Measures) Act 2026 | 2026-03-31 | [6791815](https://github.com/jonnonz1/nz-statute-book/commit/6791815fb0b1) |
| repealed | Heading | Banking (Prudential Supervision) Act 1989 | Financial Market Infrastructures Act 2021 | 2024-03-01 | [dacfef4](https://github.com/jonnonz1/nz-statute-book/commit/dacfef476a85) |
| repealed | Section 215 | Climate Change Response Act 2002 | Climate Change Response (Emissions Trading Scheme Agricultural Obligations) Amendment Act 2024 | 2024-11-26 | [dc9db07](https://github.com/jonnonz1/nz-statute-book/commit/dc9db078945c) |
| replaced | Section 2A(1) | Climate Change Response Act 2002 | Climate Change Response (Emissions Trading Scheme Agricultural Obligations) Amendment Act 2024 | 2024-11-26 | [dc9db07](https://github.com/jonnonz1/nz-statute-book/commit/dc9db078945c) |
| replaced | Section 517L | Local Government Act 1974 | Water Services Acts Repeal Act 2024 | 2024-02-17 | [fbe2834](https://github.com/jonnonz1/nz-statute-book/commit/fbe283424946) |
| replaced | Section 32AA(1)(d)(i) | Resource Management Act 1991 | Resource Management (Freshwater and Other Matters) Amendment Act 2024 | 2024-10-25 | [dabe2ef](https://github.com/jonnonz1/nz-statute-book/commit/dabe2ef1d769) |
| replaced | Section 89C(lba) | Tax Administration Act 1994 | Taxation (Annual Rates for 2023-24, Multinational Tax, and Remedial Matters) Act 2024 | 2024-03-29 | [bba9842](https://github.com/jonnonz1/nz-statute-book/commit/bba98423053e) |
| replaced | Section 587(2) | Education and Training Act 2020 | Employment Relations (Pay Deductions for Partial Strikes) Amendment Act 2025 | 2025-07-01 | [6512810](https://github.com/jonnonz1/nz-statute-book/commit/651281033eb3) |
| replaced | Section 30M(2) | Bail Act 2000 | Bail (Electronic Monitoring) Amendment Act 2025 | 2025-03-13 | [91ad0e7](https://github.com/jonnonz1/nz-statute-book/commit/91ad0e75f00c) |
| replaced | Section 227F(1) | Tax Administration Act 1994 | Taxation (Annual Rates for 2023-24, Multinational Tax, and Remedial Matters) Act 2024 | 2024-03-28 | [74437c9](https://github.com/jonnonz1/nz-statute-book/commit/74437c96a4c6) |
| replaced | Section HG 11(5)(b) | Income Tax Act 2007 | Taxation (Annual Rates for 2024-25, Emergency Response, and Remedial Measures) Act 2025 | 2025-03-30 | [c9d1a4d](https://github.com/jonnonz1/nz-statute-book/commit/c9d1a4dcefb2) |
| replaced | Section 90(2)(d) | Local Government (Auckland Council) Act 2009 | Local Government (Water Services) (Repeals and Amendments) Act 2025 | 2025-08-27 | [d1b5f3b](https://github.com/jonnonz1/nz-statute-book/commit/d1b5f3b1381a) |
| replaced | Schedule 3 clause 31(2)(c) | Health and Safety at Work Act 2015 | Regulatory Systems (Immigration and Workforce) Amendment Act 2025 | 2025-03-30 | [87f27a4](https://github.com/jonnonz1/nz-statute-book/commit/87f27a4473f6) |
| replaced | Section 39 heading | Family Proceedings Act 1980 | Family Proceedings (Dissolution of Marriage or Civil Union for Family Violence) Amendment Act 2024 | 2025-10-17 | [485db31](https://github.com/jonnonz1/nz-statute-book/commit/485db31d8558) |
| replaced | Section 238 | Building Act 2004 | Building (Earthquake-prone Building Deadlines and Other Matters) Amendment Act 2024 | 2024-11-26 | [7bd2459](https://github.com/jonnonz1/nz-statute-book/commit/7bd24590916a) |
| replaced | Section HG 11(12) | Income Tax Act 2007 | Taxation (Annual Rates for 2024-25, Emergency Response, and Remedial Measures) Act 2025 | 2025-03-30 | [c9d1a4d](https://github.com/jonnonz1/nz-statute-book/commit/c9d1a4dcefb2) |
| replaced | Schedule 24 clause 2 | Education and Training Act 2020 | Education and Training Amendment Act 2025 | 2025-11-19 | [df2ed0e](https://github.com/jonnonz1/nz-statute-book/commit/df2ed0e022e7) |
| replaced | Section 13 | Children's Commissioner Act 2022 | Oversight of Oranga Tamariki System Legislation Amendment Act 2025 | 2025-08-01 | [4466252](https://github.com/jonnonz1/nz-statute-book/commit/4466252bacc0) |

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| `Replace` is a judgement call for repeal scoring because PCO's current style treats replacement separately while acknowledging the old style described it as repeal-plus-substitution. | [PCO amending-styles page, Wayback snapshot](https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles) | [NZLC Report 35, Appendix B](https://web.archive.org/web/20241222125322/http://www.nzlii.org/nz/other/nzlc/report/R35/R35-Appendix-2.html) | High |
| In this sample, counting `Replace` as repeal more than doubles the repeal share but does not produce a majority-repeals headline. | [Sample method and public mirror tree](https://github.com/jonnonz1/nz-statute-book/tree/1273f588169084689c052a1c685f2a7ec1481720) | [Spot-check commit showing replace/insert records and diff](https://github.com/jonnonz1/nz-statute-book/commit/37ccce3a8664dff4169431548570e67bdfa5573b) | Medium |
| The provisional extraction frame is not the same as a direct official full-corpus PCO classification. | [nz-statute-book README: rendered from PCO XML](https://github.com/jonnonz1/nz-statute-book) | [Whiplash README: pipeline parses history notes into an amendment graph](https://github.com/jonnonz1/whiplash) | High |

## What would change this conclusion

- **The issue #676 core sample could supersede this sample.** If #676 publishes a different documented sample, #677 should be recomputed on that exact sample; this finding should then be treated as provisional rather than final.
- **Direct PCO XML/API classification could move the counts.** I could not fetch live legislation.govt.nz or PCO pages directly in this environment: `curl` to legislation.govt.nz returned a CloudFront/WAF challenge, and `node scripts/fetch.mjs` classified the PCO amending-styles page as `BLOCKED` after plain HTTP 403 with browser rungs unavailable. A direct PCO export that labels operation type differently from the mirror commit bodies would change the numerator.
- **A wider historical frame could move the answer.** This finding samples records effective from 2024-01-01 through 2026-06-06, because the mirror was current through 2026-06-06 when accessed. It does not prove the same narrow/broad ratio for all NZ statutory amendment history.
- **A different broad definition could move the answer.** I counted only `repealed` and `replaced` as broad repeal. A looser rule that also treats some `amended` records as functional repeal, or a stricter rule that counts only whole-Act repeal rather than any `repealed` section/schedule/heading record, would produce a different headline.
- **Human/legal review is still needed for edge cases.** I did not make legal judgements about whether any individual `amended` or `replaced` item is substantively a policy repeal; this finding tests the mechanical taxonomy sensitivity only.

## Open follow-up questions

- Once issue #676 publishes the core hand-classified sample, rerun the narrow/broad calculation on that exact sample and compare it with this provisional result.
- Issue #679 should test whether the Whiplash amendment graph can classify the full corpus directly from PCO history notes, rather than using commit-body verbs as the operation label.

## Sources

1. Issue #677, "research: Test whether NZ's 'mostly repeals' headline flips depending on how 'Replace' operations are scored" — https://github.com/thecolab-ai/the-for-good-project/issues/677
2. Issue #676, "research: Draw and classify a seeded random sample of NZ statutory amendments against an explicit repeal/delete/replace/insert taxonomy" — https://github.com/thecolab-ai/the-for-good-project/issues/676
3. Parliamentary Counsel Office, "A new approach to describing how amendments are made in legislation" (Wayback snapshot dated 2026-02-01; live fetch blocked by HTTP 403 in this environment, classified as tooling/IP block) — https://web.archive.org/web/20260201011527/https://pco.govt.nz/instructing-the-pco/drafting-practice-and-model-clauses/new-amending-styles
4. New Zealand Law Commission, Report 35, Appendix B: Drafting Amending Laws (Wayback snapshot dated 2024-12-22) — https://web.archive.org/web/20241222125322/http://www.nzlii.org/nz/other/nzlc/report/R35/R35-Appendix-2.html
5. jonnonz1/nz-statute-book, GitHub repository README and tree at HEAD `1273f588169084689c052a1c685f2a7ec1481720`, accessed 2026-07-07 — https://github.com/jonnonz1/nz-statute-book
6. jonnonz1/whiplash, GitHub repository README, accessed 2026-07-07 — https://github.com/jonnonz1/whiplash
7. Example nz-statute-book commit `37ccce3a8664dff4169431548570e67bdfa5573b`, accessed 2026-07-07 — https://github.com/jonnonz1/nz-statute-book/commit/37ccce3a8664dff4169431548570e67bdfa5573b
