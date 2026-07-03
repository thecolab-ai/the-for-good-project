---
title: "Vote Estimates can reconstruct only a partial floor for recent NZ government digital/IT actuals, not a complete all-of-government total"
domain: "civic-transparency"
issue: "#319"
confidence: "Medium"
author: "Codex"
agent: "codex"
model: "gpt-5-codex"
date: "2026-07-03"
status: "draft"
---

# Vote Estimates can reconstruct only a partial floor for recent NZ government digital/IT actuals, not a complete all-of-government total

## Executive answer

- A defensible bottom-up *floor* can be reconstructed for named digital appropriations, but the Vote Estimates do not support a complete all-of-government digital/IT actuals total because major agency technology spend is often inside broad departmental capital expenditure, service-delivery, health-service, or customer-service appropriations rather than a digital/ICT line. The Estimates themselves define appropriations as legal spending authorities with scoped activities, and their 2026 guide says end-of-year performance normally appears in annual reports rather than a single cross-government technology-spend statement [Treasury, Estimates 2026/27 introduction](https://www.treasury.govt.nz/sites/default/files/2026-05/est26-v4-intro.pdf).
- The clearest central-government digital line is the Government Digital Services / Government Digital Delivery Agency function: Vote Internal Affairs' 2025/26 Government Digital Services MCA was $35.056m final budget and $32.873m estimated actual before transfer, while Vote Public Service's new Government Digital Delivery Agency appropriation showed a 2025/26 comparator total of $53.966m and a 2026/27 budget of $50.070m after adding the transferred DIA Government Digital Services and Civic Information Services comparators [Vote Internal Affairs Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-intaff.pdf); [Vote Public Service Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-pubser.pdf).
- The biggest target Votes do expose technology-adjacent proxy lines: IRD departmental capital expenditure was $27.000m estimated actual for 2025/26, of which $10.700m was intangibles after Supplementary Estimates changes; MBIE's departmental capital expenditure was $52.038m estimated actual for 2025/26, including $28.000m of intangibles; Vote Health says the output-expense growth includes the Health Digital Investment Plan and cyber-security risk work, but its annual Vote lines do not itemise those programmes as a reusable total [Vote Revenue Supplementary Estimates 2025/26](https://budget.govt.nz/budget/pdfs/suppestimates/suppest26reven.pdf); [Vote Business, Science and Innovation Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v1/est26-v1-buscin.pdf); [Vote Health Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v5/est26-v5-health.pdf).
- The government's $13b/five-year figure is a forward projection, not a measured actual-spend series: the Beehive release says centralising digital investment and procurement could save up to 30% on "projected $13 billion technology spend across the public sector in the next five years" [Beehive, 22 Sep 2025](https://www.beehive.govt.nz/release/government-digital-changes-bring-big-savings). The observed named central digital lines are tens of millions per year, so the $13b projection can only be consistent with actuals if it includes much broader agency IT operating, procurement, cloud/software, contractors, and capital spend that is not separately visible in the Vote lines reviewed here.

**Overall confidence:** Medium — the named-line extraction is high confidence where the Vote documents itemise a line, but the all-of-government conclusion is medium because the method proves non-comparability and a floor, not a complete denominator.

## Evidence

### Method and scope

This finding answers whether a multi-year digital/IT actuals total can be reconstructed from the major digital-spending Votes named in issue #319: Vote Internal Affairs, Vote Revenue, Vote Business, Science and Innovation, Vote Public Service, and Vote Health. I used the 2026/27 Estimates and 2025/26 Supplementary Estimates for those Votes, plus older Vote Internal Affairs Estimates where needed to trace the former Government Digital Services MCA [Vote Internal Affairs Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-intaff.pdf); [Vote Public Service Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-pubser.pdf); [Vote Revenue Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-reven.pdf); [Vote Business, Science and Innovation Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v1/est26-v1-buscin.pdf); [Vote Health Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v5/est26-v5-health.pdf).

The strict inclusion rule was: include a line in the reconstructed floor only when the Vote line itself is digital/ICT tagged or its scope is explicitly digital transformation, digital services, digital identity, system capabilities, digital technologies, e-invoicing/business digital enablers, or technology-capital/intangible expenditure. Broad agency output appropriations were excluded from the strict floor, even where they obviously rely on IT, because the Estimates do not expose the IT share [Treasury, Estimates 2026/27 introduction](https://www.treasury.govt.nz/sites/default/files/2026-05/est26-v4-intro.pdf).

### Strict named-line floor

The strict, named-line series below is not an all-government total. It is the sum of lines that are visible enough to cite without allocating a hidden percentage.

| Vote / line | 2022/23 | 2023/24 | 2024/25 | 2025/26 | Treatment | Confidence |
|---|---:|---:|---:|---:|---|---|
| Vote Internal Affairs, Government Digital Services MCA / Vote Public Service, Government Digital Delivery Agency comparator | $38.275m estimated actual in the 2023/24 Estimates | $42.597m estimated actual in the 2024/25 Estimates | Not cleanly extracted from the 2026 Vote line in this pass | $53.966m estimated actual comparator in Vote Public Service; this includes transferred Vote Internal Affairs Government Digital Services, Civic Information Services, and Vote Public Service GDDA lines | Include as the central digital stewardship/service floor; do not combine DIA and PSC transfer-year lines separately | High for line values; Medium for time-series comparability because of the 1 Apr 2026 transfer [Vote Internal Affairs Estimates 2023/24](https://www.treasury.govt.nz/sites/default/files/2023-06/est23-v4-intaff.pdf); [Vote Internal Affairs Estimates 2024/25](https://www.treasury.govt.nz/sites/default/files/2024-06/est24-v4-intaff.pdf); [Vote Public Service Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-pubser.pdf) |
| Vote Internal Affairs, Digital Identity Services Trust Framework category | Included inside Government Digital Services where present | $1.787m estimated actual in the 2024/25 Estimates, inside GDS | Included inside GDS where present | $2.007m estimated actual, inside DIA GDS transfer-year line | Do not add separately when using total GDS/GDDA | High [Vote Internal Affairs Estimates 2024/25](https://www.treasury.govt.nz/sites/default/files/2024-06/est24-v4-intaff.pdf); [Vote Internal Affairs Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-intaff.pdf) |
| Vote Business, Science and Innovation, Small Business Enabling Services MCA | Not reconstructed | Not reconstructed | Not reconstructed | $33.747m estimated actual; includes Business.govt.nz, Business Connect, eInvoicing, and Regional Business Partner support | Include as digital-enabled business services, but note it also funds advisory/business support, not pure IT | Medium [Vote Business, Science and Innovation Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v1/est26-v1-buscin.pdf) |
| Vote Business, Science and Innovation, Delivery and Management of Digital Technologies Sector Initiatives | Not reconstructed | Not reconstructed | Not reconstructed | Visible as a category of the Industry Transformation Plans MCA; performance text says it is intended to achieve stronger growth for the digital technologies sector | Include only as sector/digital-economy support, not government internal IT | Medium-Low because the extracted table did not yield a clean total in this pass [Vote Business, Science and Innovation Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v1/est26-v1-buscin.pdf) |
| Vote Health, named digital initiatives | Not reconstructed | Not reconstructed | Not reconstructed | Not separately itemised as an annual reusable line; the Vote narrative says output-expense growth includes the Health Digital Investment Plan and cyber-security risk-profile work | Exclude from strict total; describe as a known gap | High for existence; Low for amount [Vote Health Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v5/est26-v5-health.pdf) |

For 2025/26, the strict central floor is therefore at least $53.966m for the GDS/GDDA function and at least $87.713m if the MBIE Small Business Enabling Services MCA is added, but the second figure mixes central digital-government stewardship with business-facing digital enablers and should not be presented as "government IT spend" [Vote Public Service Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-pubser.pdf); [Vote Business, Science and Innovation Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v1/est26-v1-buscin.pdf).

### Wider proxy lines that should not be added as precise digital spend

IRD, MBIE, DIA, and Health all show technology-adjacent capital or service lines, but the public Estimates do not identify what share is digital/IT versus property, vehicles, plant, general assets, or service operations.

| Vote / proxy | 2025/26 estimated actual | Why it matters | Why it is not a precise digital/IT actual |
|---|---:|---|---|
| Vote Revenue, IRD departmental capital expenditure | $27.000m total; $10.700m intangibles in the Supplementary Estimates | IRD is one of the largest technology-dependent agencies, and the line captures asset development/purchase | The scope is all IRD assets, not IT only; intangibles are a closer proxy but still not a complete operating-plus-capital IT amount [Vote Revenue Supplementary Estimates 2025/26](https://budget.govt.nz/budget/pdfs/suppestimates/suppest26reven.pdf) |
| Vote Business, Science and Innovation, MBIE departmental capital expenditure | $52.038m total; $28.000m intangibles | MBIE operates major registers, business services, procurement systems, and digital business services | The line is the ministry's whole capital plan; intangibles are a proxy, not a full IT-spend line [Vote Business, Science and Innovation Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v1/est26-v1-buscin.pdf) |
| Vote Internal Affairs, DIA departmental capital expenditure | $65.586m total; Supplementary Estimates show $20.700m intangibles after a $26.000m downward adjustment | DIA runs identity, civic information, archives/library systems, ministerial services, and transferred digital functions | The line covers all DIA capital assets; the public line does not allocate the capital plan to systems, property, identity, archives, or other assets [Vote Internal Affairs Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-intaff.pdf); [Vote Internal Affairs Supplementary Estimates 2025/26](https://budget.govt.nz/budget/pdfs/suppestimates/suppest26intaff.pdf) |
| Vote Health, Health NZ / health capital and output expenses | Vote Health capital expenditure was $2.641b estimated actual in 2025/26; output expenses were $28.611b estimated actual | Health has large data, digital, cyber, payroll, immunisation, radiology, shared-record, and infrastructure-linked digital programmes | The annual Vote lines are dominated by health services, Holidays Act remediation, and physical health infrastructure; named digital programme amounts appear in reasons-for-change text rather than a reusable annual total [Vote Health Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v5/est26-v5-health.pdf); [Vote Health Supplementary Estimates 2025/26](https://budget.govt.nz/budget/pdfs/suppestimates/suppest26health.pdf) |

### Cross-check against the $13b/five-year projection

The Beehive announcement is explicit that $13b is a projected five-year public-sector technology spend and that the possible $3.9b saving is 30% of that projection; it does not present a historical actual-spend series [Beehive, 22 Sep 2025](https://www.beehive.govt.nz/release/government-digital-changes-bring-big-savings). The December 2025 Beehive release repeated the same $13b/30%/$3.9b formulation while announcing the GDDA transition into the Public Service Commission from 1 April 2026 [Beehive, 16 Dec 2025](https://www.beehive.govt.nz/release/public-service-digital-transformation-accelerates).

Dividing $13b over five years implies about $2.6b per year of technology spend. That is not contradicted by the Vote evidence, because the Vote evidence reviewed here exposes only a small central digital-government floor plus incomplete capital proxies; it also cannot be verified from the public Vote lines alone, because the lines omit agency operating IT, contractors, managed services, cloud/software subscriptions, embedded digital components of health and tax service delivery, and Crown entity technology spend [Vote Public Service Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-pubser.pdf); [Vote Health Estimates 2026/27](https://budget.govt.nz/budget/pdfs/estimates/v5/est26-v5-health.pdf).

The PSC Digital Reset Plan supports the transparency gap: it says the system is poorly informed about the nature and value of technology investment across government, identifies waste/duplication and poor delivery as Cabinet concerns, and recommends resetting prioritisation, repositioning the GDDA, and reforming funding and delivery settings [PSC, Digital Reset Plan 2026](https://www.publicservice.govt.nz/assets/DirectoryFile/Digital-Reset-Plan-2026.pdf). That is an independent reason not to treat the visible Vote lines as a complete actual-spend denominator [PSC, Digital Reset Plan 2026](https://www.publicservice.govt.nz/assets/DirectoryFile/Digital-Reset-Plan-2026.pdf).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| Public Vote documents can provide a named-line floor, but not a complete all-of-government digital/IT actuals total. | [Treasury Estimates guide says Votes are appropriation authorities and end-year reporting is spread across agency/ministerial reports](https://www.treasury.govt.nz/sites/default/files/2026-05/est26-v4-intro.pdf) | [PSC Digital Reset Plan says the system is poorly informed about technology investment and needs reset funding/delivery settings](https://www.publicservice.govt.nz/assets/DirectoryFile/Digital-Reset-Plan-2026.pdf) | Medium-High |
| The $13b/five-year figure is a projection, not an actuals series. | [Beehive, 22 Sep 2025, calls it projected technology spend](https://www.beehive.govt.nz/release/government-digital-changes-bring-big-savings) | [Beehive, 16 Dec 2025, repeats the same projected $13b / 30% / $3.9b framing](https://www.beehive.govt.nz/release/public-service-digital-transformation-accelerates) | High |
| The visible central digital-government lines are far below the implied $2.6b/year projection, so the projection must include broader agency and Crown-entity IT spend if it is accurate. | [Vote Public Service Estimates 2026/27 show $53.966m 2025/26 comparator and $50.070m 2026/27 GDDA budget](https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-pubser.pdf) | [Beehive, 22 Sep 2025, says projected spend is $13b across five years](https://www.beehive.govt.nz/release/government-digital-changes-bring-big-savings) | Medium |

## What would change this conclusion

- A GDDA, Treasury, Cabinet, or OIA-released dataset listing annual public-sector technology spend by agency, expense/capital type, Crown entity coverage, and category would change the conclusion from "partial floor only" to a measured actuals series.
- Agency-level general-ledger or procurement extracts for software, cloud, telecommunications, contractors, outsourced ICT, cyber, devices, data platforms, and capitalised software would allow the hidden operating component to be reconstructed.
- Health NZ data-and-digital programme actuals are the largest unresolved gap in the target Votes; the public Vote Health documents identify digital investment and cyber work but do not expose a reusable annual total.
- I could not verify the methodology behind the $13b projection, the agency coverage, whether Crown entities outside the core public service are included consistently, or whether GST/capitalisation/accounting eliminations are treated consistently.
- I fetched Budget and Treasury PDFs directly with `curl` where direct PDF URLs were available; Budget index pages were Cloudflare-blocked in plain `curl`, so I used official direct PDF URLs surfaced by web search and did not call blocked index pages dead.

## Open follow-up questions

- What agency coverage and spend categories make up the Government's $13b/five-year projection?
- Can GDDA or Treasury produce an annual actuals table for technology spend using the same definitions as the $13b projection?
- How much Health NZ data-and-digital operating and capital spend occurred in 2022/23, 2023/24, 2024/25, and 2025/26?
- Can annual-report intangible-asset additions be reconciled to Vote capital expenditure across IRD, DIA, MBIE, Health NZ, and other large agencies without double-counting?

## Sources

1. The Treasury. "The Estimates of Appropriations 2026/27 - Finance and Government Administration Sector B.5 Vol.4: Introduction." Accessed 3 July 2026. https://www.treasury.govt.nz/sites/default/files/2026-05/est26-v4-intro.pdf
2. The Treasury / Budget 2026. "Vote Internal Affairs - The Estimates of Appropriations 2026/27." Accessed 3 July 2026. https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-intaff.pdf
3. The Treasury / Budget 2026. "Vote Public Service - The Estimates of Appropriations 2026/27." Accessed 3 July 2026. https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-pubser.pdf
4. The Treasury / Budget 2026. "Vote Revenue - The Estimates of Appropriations 2026/27." Accessed 3 July 2026. https://budget.govt.nz/budget/pdfs/estimates/v4/est26-v4-reven.pdf
5. The Treasury / Budget 2026. "Vote Revenue - Supplementary Estimates of Appropriations 2025/26." Accessed 3 July 2026. https://budget.govt.nz/budget/pdfs/suppestimates/suppest26reven.pdf
6. The Treasury / Budget 2026. "Vote Business, Science and Innovation - The Estimates of Appropriations 2026/27." Accessed 3 July 2026. https://budget.govt.nz/budget/pdfs/estimates/v1/est26-v1-buscin.pdf
7. The Treasury / Budget 2026. "Vote Health - The Estimates of Appropriations 2026/27." Accessed 3 July 2026. https://budget.govt.nz/budget/pdfs/estimates/v5/est26-v5-health.pdf
8. The Treasury / Budget 2026. "Vote Health - Supplementary Estimates of Appropriations 2025/26." Accessed 3 July 2026. https://budget.govt.nz/budget/pdfs/suppestimates/suppest26health.pdf
9. The Treasury / Budget 2026. "Vote Internal Affairs - Supplementary Estimates of Appropriations 2025/26." Accessed 3 July 2026. https://budget.govt.nz/budget/pdfs/suppestimates/suppest26intaff.pdf
10. The Treasury. "Vote Internal Affairs - The Estimates of Appropriations 2024/25." Accessed 3 July 2026. https://www.treasury.govt.nz/sites/default/files/2024-06/est24-v4-intaff.pdf
11. The Treasury. "Vote Internal Affairs - The Estimates of Appropriations 2023/24." Accessed 3 July 2026. https://www.treasury.govt.nz/sites/default/files/2023-06/est23-v4-intaff.pdf
12. Beehive.govt.nz. "Government digital changes to bring big savings." 22 September 2025. Accessed 3 July 2026. https://www.beehive.govt.nz/release/government-digital-changes-bring-big-savings
13. Beehive.govt.nz. "Public service digital transformation accelerates." 16 December 2025. Accessed 3 July 2026. https://www.beehive.govt.nz/release/public-service-digital-transformation-accelerates
14. Public Service Commission. "Delivering Digital Government - Reset Plan." 2026. Accessed 3 July 2026. https://www.publicservice.govt.nz/assets/DirectoryFile/Digital-Reset-Plan-2026.pdf
