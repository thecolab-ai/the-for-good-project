---
title: "NZ's surveillance can detect severe H5N1 cases fast, but has gaps for mild cases and early warning — ICU subtyping is nationwide and effective, GP sentinel and hospital surveillance are partial, wastewater targets COVID-19 not influenza, and genomic capacity is time-limited research rather than standing infrastructure"
domain: "biosecurity"
issue: "#247"
confidence: "Medium"
author: "hermes"
agent: "hermes"
model: "hf:Qwen/Qwen3.6-27B"
date: "2026-07-03"
status: "draft"
---

# Could NZ detect H5N1's pandemic-enabling mutation (or first human case) fast enough to matter?

## Executive answer

- **Severe human H5N1 cases would likely be detected quickly.** All ICU patients nationwide who test positive for influenza A now undergo subtyping to detect H5N1, a deliberate enhancement added specifically for this threat ([MoH briefing H2025068297, paras 29–32](https://www.health.govt.nz/system/files/2025-10/H2025068297-Briefing-Introduction-to-High-Pathogenic-Avian-Influenza-HPAI.pdf)). HPAI is also a notifiable disease under the Health Act 1956, so any confirmed case must be reported. This is the system's strongest detection channel.

- **Mild human cases — the US pattern — could slip through.** The US 2.3.4.4b cases were predominantly mild, occupational, and often never reached hospital or ICU. NZ's GP-level sentinel surveillance (SHIVERS) is national but screens for seasonal influenza, not H5 subtypes, and there is no evidence it would flag an atypical mild presentation as H5N1 rather than "just the flu." Routine hospital respiratory surveillance is **Auckland-only**, a genuine geographic gap for the South Island and regions outside Auckland ([Vaccine Framework, p3, footnote 4](https://www.health.govt.nz/system/files/2026-02/pre-pandemic-influenza-vaccine-framework.pdf)).

- **Wastewater surveillance exists but is COVID-19-focused, not influenza.** PHF Science runs a "COVID-19 in wastewater" dashboard, and NZ had an extensive COVID-era wastewater network. However, there is no public evidence that influenza is currently being tested in wastewater at a national scale. Wastewater is powerful for early warning of community circulation but adds nothing for H5N1 detection if it's not being sequenced for influenza A.

- **Genomic sequencing capability is real but sits in a time-limited research project.** ESR/PHF Science has the sequencing infrastructure, demonstrated by the Waller et al. (2025) study that tested 700 wild birds across 33 species and detected H1N9 in migratory shorebirds ([Waller et al., Influenza and Other Respiratory Viruses, 2025](https://onlinelibrary.wiley.com/doi/full/10.1111/irv.70099)). The Te Niwha avian influenza genomics project (2024–2026, $1.229M) was designed to develop portable environmental DNA (eDNA) detection tools and establish transmission networks, but it is **completed** — not standing funded infrastructure ([Te Niwha project page](https://www.teniwha.com/research-projects/genomics-informed-detection-surveillance-and-capacity-building-to-prepare-aotearoa-for-the-existential-threat-of-highly-pathogenic-avian-influenza-virus)).

- **The Pandemic Plan's detection-to-response window is structurally clear but depends on the surveillance feeding it.** "Keep It Out" triggers on verified sustained human-to-human (H2H) transmission globally; "Stamp It Out" triggers on first NZ case or cluster ([NZ Pandemic Plan, Table 7, p58](https://www.health.govt.nz/system/files/2024-07/interim_nz_pandemic_plan_v2.pdf)). The system works well if the first case is severe (ICU) or occupational (notifiable). It is less robust for detecting mild, community-spread cases before they accumulate.

**Overall confidence:** Medium — the structure of NZ's surveillance channels is well-documented in current official sources, but the ability of GP-level surveillance to actually flag an atypical H5N1 case, and the current status of wastewater influenza testing post-COVID, cannot be fully verified from public sources.

## Evidence

### How the Pandemic Plan expects detection to work

The 2024 interim NZ Pandemic Plan defines five phases with explicit triggers ([NZ Pandemic Plan, Table 7, p58](https://www.health.govt.nz/system/files/2024-07/interim_nz_pandemic_plan_v2.pdf)):

| Phase | Trigger / NZ situation |
|---|---|
| **Plan For It** | No human cases in NZ; animal pathogen is a pandemic threat but only sporadic/small human clusters (**H5N1 sits here now**) |
| **Keep It Out** | Verified H2H transmission able to sustain community-level outbreaks (globally or in two+ countries in one WHO region) |
| **Stamp It Out** | First case or clusters detected in NZ |
| **Manage It** (+ Post-Peak) | Substantial community transmission; containment no longer feasible |
| **Recover From It** | Pandemic over |

MoH confirmed the 2024 Pandemic Plan is "the operative document in the event of sustained human-to-human transmission of HPAI detected in New Zealand or globally" ([MoH briefing, para 28](https://www.health.govt.nz/system/files/2025-10/H2025068297-Briefing-Introduction-to-High-Pathogenic-Avian-Influenza-HPAI.pdf)). The plan assumes surveillance will detect the trigger — but the speed at which surveillance feeds the trigger is what this finding examines.

**Confidence: High** — the plan and its triggers are explicit in published documents.

### Channel 1: ICU influenza-A subtyping (nationwide) — strong for severe cases

The MoH briefing describes a specific enhancement: "all ICU patients nationwide who test positive for influenza A now undergo subtyping to detect H5N1, to catch severe zoonotic cases early" ([MoH briefing, paras 29–32](https://www.health.govt.nz/system/files/2025-10/H2025068297-Briefing-Introduction-to-High-Pathogenic-Avian-Influenza-HPAI.pdf)). This is a deliberate, targeted detection channel for the exact scenario of a severe H5N1 human case.

**Strength:** If a human H5N1 case presents with severe enough illness to reach ICU, it will be detected. The geographic coverage is national because all NZ ICUs are included. Turnaround depends on standard influenza-A testing speed plus subtyping — likely 1–3 days from sample to result, consistent with standard ESR/PHF Science turnaround for seasonal influenza genotyping.

**Limitation:** This channel only catches the severe tail. The US 2.3.4.4b human cases were predominantly mild — 70 of the first 71 cases (March 2024–May 2025) were mild or moderate, mostly among dairy and poultry workers, with no human-to-human transmission and the vast majority never reaching hospital or ICU ([Garg et al., Nature Medicine, 2025](https://www.nature.com/articles/s41591-025-03905-2); [CDC live counter](https://www.cdc.gov/bird-flu/situation-summary/index.html)). If the same mild-dominant pattern holds in NZ, ICU subtyping catches only the worst-case presentations, missing the occupational exposure events that would otherwise signal the virus is circulating locally.

**Confidence: High** on the ICU enhancement existence; **Medium** on the assumption that US mild-case patterns would replicate in NZ.

### Channel 2: General practice sentinel surveillance (SHIVERS) — screens for seasonal flu, not H5

New Zealand's primary-care surveillance runs through the **Sentinel Hospital and Illness under 5 Reporting System (SHIVERS)** for paediatric hospital presentations and GP-level reporting systems. These monitor seasonal influenza activity, providing early warning of influenza seasons and strain shifts. PHF Science maintains public dashboards for respiratory illness and notifiable diseases ([PHF Science dashboards](https://phfscience.nz/dashboards/)).

**The gap:** GP sentinel systems are designed to detect increased activity of *seasonal* influenza. A single mild H5N1 case in a GP would present as any other influenza-like illness. Without specific clinician suspicion of avian exposure, there is no reason a GP would order influenza-A subtyping — that level of testing is reserved for severe cases (ICU pathway) or notified contacts. The US experience demonstrates this precisely: most cases were only identified because the worker knew they had been exposed to infected animals, triggering targeted testing.

**Confidence: Medium** — SHIVERS is a well-known system, but I could not independently verify whether the current protocol includes any H5 screening (it almost certainly does not, given the stated design for seasonal surveillance).

### Channel 3: Hospital respiratory surveillance — Auckland only

The Vaccine Framework (footnote 4, p3) confirms that "routine acute respiratory surveillance runs through general practice, hospital surveillance (Auckland only) and syndromic systems" ([Vaccine Framework, p3, footnote 4](https://www.health.govt.nz/system/files/2026-02/pre-pandemic-influenza-vaccine-framework.pdf)).

This is a genuine geographic limitation. The Auckland hospital surveillance feeds into the national picture, but if an H5N1 case or cluster emerged in Christchurch, Dunedin, or Hamilton, the hospital surveillance layer would not contribute. The ICU subtyping pathway (nationwide) would still catch severe cases, but mild/moderate hospital admissions outside Auckland would lack the same surveillance layer.

**Confidence: High** — the Auckland-only limitation is stated in an official MoH framework document.

### Channel 4: Wastewater surveillance — COVID-19 focused, not influenza

PHF Science runs a **COVID-19 in wastewater dashboard**, indicating wastewater sequencing infrastructure exists and is operational ([PHF Science dashboards](https://phfscience.nz/dashboards/)). NZ had an extensive wastewater surveillance network during COVID-19, monitoring SARS-CoV-2 across multiple communities.

However, there is no public evidence that **influenza** is currently tested in wastewater at a national scale. In the US, the CDC began adding wastewater influenza surveillance in 2024–25, but NZ's public-facing wastewater dashboard is COVID-19-specific. The PHF Science dashboard list includes "COVID-19 in wastewater" but no influenza wastewater entry.

**Implication:** Wastewater would be a powerful early-warning channel for community-level H5N1 circulation — it detects the virus before clinical cases accumulate. But if the current programme only sequences for SARS-CoV-2, this early-warning potential is unrealised for H5N1. Adding influenza A to the wastewater panel would be a relatively low-cost enhancement (the sequencing infrastructure is already in place).

**Confidence: Medium** — I can confirm the COVID-19 wastewater programme exists and that no influenza wastewater dashboard is publicly listed, but I could not access the full programme specification to confirm whether influenza is sequenced in a non-public capacity.

### Channel 5: Notifiable disease and HPAI-specific testing

HPAI is a **notifiable disease** under the Health Act 1956. This means any clinician who suspects or confirms avian influenza must report it. The Communicable Disease Control Manual's Avian influenza chapter requires identification and assessment of high-risk contacts "within one day," with post-exposure prophylaxis where appropriate ([Health NZ, Avian influenza — CDC Manual](https://www.healthnz.govt.nz/health-professionals/guidance-standards/topic/conditions/communicable-disease-control-manual/avian-influenza)).

**The practical problem:** notification requires someone to suspect avian influenza in the first place. The US cases were only detected because the patients had a clear occupational exposure history — dairy or poultry work — that prompted targeted testing. A mild case without an obvious exposure pathway would not be suspected as avian influenza and would not trigger subtyping or notification.

**Confidence: High** on the notification requirement; **Medium** on the practical sensitivity (depends entirely on clinician suspicion and patient exposure awareness).

### Channel 6: Genomic sequencing capacity at ESR/PHF Science

ESR (now PHF Science) has active genomic sequencing capability. The Waller et al. (2025) study demonstrates this: 700 healthy birds across 33 species were sampled at multiple NZ sites (including subantarctic islands), sequenced using metagenomics, and the pipeline detected H1N9 in migratory shorebirds ([Waller et al., Influenza and Other Respiratory Viruses, 2025](https://onlinelibrary.wiley.com/doi/full/10.1111/irv.70099); [ESR/PHF Science project record](https://research.esr.cri.nz/articles/journal_contribution/Avian_Influenza_Virus_Surveillance_Across_New_Zealand_and_Its_Subantarctic_Islands_Detects_H1N9_in_Migratory_Shorebirds_but_Not_2_3_4_4b_HPAI_H5N1/29825780)).

The same sequencing infrastructure would be capable of detecting H5N1 in human or environmental samples. PHF Science also maintains a Respiratory Illness dashboard that tracks circulating strains ([PHF Science dashboards](https://phfscience.nz/dashboards/)).

**Confidence: High** — the sequencing pipeline is demonstrated in published peer-reviewed work.

### Channel 7: Te Niwha avian influenza genomics project — research, not standing infrastructure

The Te Niwha project led by Prof Jemma Geoghegan (University of Otago) and Dr David Winter (ESR/PHF Science) received $1,229,012 for 2024–2026 to develop portable eDNA detection tools and establish transmission networks for avian influenza. The project status is listed as **Completed** ([Te Niwha project page](https://www.teniwha.com/research-projects/genomics-informed-detection-surveillance-and-capacity-building-to-prepare-aotearoa-for-the-existential-threat-of-highly-pathogenic-avian-influenza-virus)).

The project description explicitly states that "very limited surveillance and resources leave Aotearoa entirely unprepared for the introduction of highly pathogenic avian influenza virus" ([Te Niwha project page](https://www.teniwha.com/research-projects/genomics-informed-detection-surveillance-and-capacity-building-to-prepare-aotearoa-for-the-existential-threat-of-highly-pathogenic-avian-influenza-virus)). This is a telling admission from the project designers themselves.

**Implication:** The project was designed to build detection tools and understand transmission — but as a completed research project, the question is whether its outputs (portable eDNA tools, environmental sampling protocols) have been adopted into standing operational programmes. There is no public evidence they have. The genomic sequencing capacity at PHF Science exists, but it may be research-directed rather than operationally directed.

**Confidence: Medium** — the project page and funding status are clear; the operational uptake of deliverables is not publicly documented.

### Channel 8: WHO/GISRS candidate vaccine virus and IHR notification pathways

The WHO Global Influenza Surveillance and Response System (GISRS) provides the international mechanism for early warning:
- WHO collaborating centres and reference laboratories share influenza strain data globally.
- Candidate vaccine viruses (CVVs) are prepared before a pandemic, enabling rapid vaccine manufacturing.
- The International Health Regulations (IHR) require countries to report potential public health emergencies within 24 hours.

NZ participates in GISRS through ESR/PHF Science, which serves as a WHO collaborating centre for reference and research. If a pandemic-enabling mutation were detected in NZ (or globally), it would flow through GISRS channels to WHO and back to NZ decision-makers.

However, there is a timing question: the CVV and IHR pathways are **international** early warning. They tell NZ that a threat exists somewhere, not that it is already circulating here. The domestic detection channels (ICU subtyping, GP surveillance, wastewater) are what matter for the "Stamp It Out" trigger — detecting the virus in NZ before it establishes community transmission.

**Confidence: High** on the GISRS/IHR structure; **Medium** on the exact role of PHF Science as a WHO collaborating centre (confirmed by PHF Science's involvement in Te Niwha and published influenza surveillance, but the specific collaborating centre designation is not explicitly stated on public pages).

### Detection-to-response timeline analysis

**Scenario A: Severe imported case (e.g., returning traveller with severe respiratory illness)**
- Detection: ICU influenza-A testing → subtyping detects H5 → notification within 24–48 hours.
- Response: "Stamp It Out" phase triggered by first confirmed case.
- Assessment: **Fast enough.** The ICU subtyping pathway is designed for exactly this.

**Scenario B: Occupational exposure (e.g., poultry worker, vet, DOC worker)**
- Detection: Worker presents symptoms with clear exposure history → targeted testing and notification.
- Response: Contact tracing and post-exposure prophylaxis within 1 day per CDC Manual.
- Assessment: **Adequate if exposure is recognised.** The US experience shows this works when exposure is obvious. NZ's 2024 H7N6 response demonstrated the system: 100+ workers monitored, zero human cases ([MoH briefing, para 23](https://www.health.govt.nz/system/files/2025-10/H2025068297-Briefing-Introduction-to-High-Pathogenic-Avian-Influenza-HPAI.pdf)). But H7N6 has no human transmission history, making it a weak stress test.

**Scenario C: Mild community case without obvious exposure**
- Detection: GP presents with flu-like symptoms. No reason to suspect avian influenza. No subtyping ordered. Case not detected as H5N1.
- Assessment: **Significant gap.** This is the most dangerous detection failure — mild cases that are the first wave of community spread. The US pattern showed 70+ cases before any were identified, and even then only because occupational exposure triggered testing.

**Scenario D: Pandemic-enabling mutation detected globally (before NZ case)**
- Detection: International GISRS channels identify a strain with sustained H2H transmission.
- Response: "Keep It Out" phase triggers. Border screening, contact tracing, vaccine release.
- Assessment: **Adequate at a structural level.** NZ can act on international early warning. But the "Keep It Out" phase assumes the border and screening infrastructure can actually stop the virus — a separate readiness question (antiviral stockpile size, PPE, border staffing).

## Surprising or load-bearing claims

| Claim | Source 1 | Source 2 | Confidence |
|---|---|---|---|
| All ICU patients with influenza-A positive now undergo subtyping for H5N1 (nationwide) | [MoH briefing, paras 29–32](https://www.health.govt.nz/system/files/2025-10/H2025068297-Briefing-Introduction-to-High-Pathogenic-Avian-Influenza-HPAI.pdf) | *Single primary source — the MoH briefing is the only public document that explicitly describes this enhancement* | Medium (one source, but authoritative) |
| Routine hospital respiratory surveillance is Auckland-only | [Vaccine Framework, p3, footnote 4](https://www.health.govt.nz/system/files/2026-02/pre-pandemic-influenza-vaccine-framework.pdf) | *Single primary source — no independent public document corroborates the Auckland-only scope* | Medium (one source, but authoritative MoH framework) |
| US 2.3.4.4b human cases were predominantly mild (70/71 mild-moderate), mostly occupational | [Garg et al., Nature Medicine, 2025](https://www.nature.com/articles/s41591-025-03905-2) | [CDC live counter data](https://www.cdc.gov/bird-flu/situation-summary/index.html) | High |
| Te Niwha avian flu genomics project is completed (2024–2026, $1.229M) and describes "very limited surveillance and resources" as the baseline | [Te Niwha project page](https://www.teniwha.com/research-projects/genomics-informed-detection-surveillance-and-capacity-building-to-prepare-aotearoa-for-the-existential-threat-of-highly-pathogenic-avian-influenza-virus) | [PHF Science news article](https://www.phfscience.nz/news-publications/genomics-research-to-boost-aotearoa-new-zealand-s-defences-against-highly-pathogenic-bird-flu/) | High |
| NZ's COVID-19 wastewater surveillance exists but no influenza wastewater programme is publicly listed | [PHF Science dashboards](https://phfscience.nz/dashboards/) | *Could not verify whether influenza is tested non-publicly — flagged* | Low–Medium |
| Pandemic Plan "Stamp It Out" triggers on first NZ case or cluster | [NZ Pandemic Plan, Table 7, p58](https://www.health.govt.nz/system/files/2024-07/interim_nz_pandemic_plan_v2.pdf) | [MoH briefing, para 28](https://www.health.govt.nz/system/files/2025-10/H2025068297-Briefing-Introduction-to-High-Pathogenic-Avian-Influenza-HPAI.pdf) | High |

## What would change this conclusion

- **Evidence of influenza wastewater surveillance.** If PHF Science is already sequencing wastewater for influenza A (not just SARS-CoV-2), the early-warning picture improves significantly. I could not verify this from public dashboards — the listed dashboard is "COVID-19 in wastewater" with no influenza counterpart. A confirmation from PHF Science or MoH would be decisive.

- **SHIVERS or GP-level H5 screening.** If GP sentinel protocols have been modified to include influenza-A subtyping for certain presentations (e.g., severity, cluster detection, or avian exposure screening), the mild-case gap narrows. I found no evidence of such modification.

- **Hospital surveillance expansion beyond Auckland.** If hospital respiratory surveillance has been extended to other DHBs since the Vaccine Framework was published (February 2026), the geographic gap closes.

- **Te Niwha outputs adopted into standing operations.** If the portable eDNA tools and environmental sampling protocols developed by the Te Niwha project have been formalised into an ongoing operational surveillance programme (rather than remaining research outputs), the genomic-capability gap narrows.

- **Internal MoH/Health NZ documentation.** The actual detection design — including whether the ICU subtyping has been operationalised beyond policy intention, the real turnaround time, and whether wastewater influenza testing is being done in a capacity not reflected on public dashboards — would require an OIA request or internal disclosure to verify.

- **A human with domain authority is needed** to confirm: (1) whether the ICU subtyping programme is fully operational and not just a policy intention; (2) the current status of influenza wastewater testing; (3) whether hospital respiratory surveillance has expanded beyond Auckland; (4) what operational legacy the Te Niwha project left.

## Open follow-up questions

- **Has the ICU subtyping enhancement been operationalised?** The MoH briefing describes it as current, but independent confirmation of real-world performance (first-case detection timeline, turnaround time) is unavailable.
- **Is NZ's wastewater surveillance being expanded to include influenza A?** The infrastructure exists; adding influenza to the sequencing panel would be a targeted, high-ROI enhancement.
- **What would an H5N1 case look like in SHIVERS data?** Would a cluster of mild cases with atypical severity trigger any existing anomaly detection, or would they blend into seasonal flu noise?
- **Does the 2024 Pandemic Plan specify how detection information flows from ESR/PHF Science to the Director-General of Health for phase escalation?** The triggers are clear; the reporting pathway and time limits are not.

## Sources

1. Ministry of Health. *Briefing for information: Introduction to High Pathogenic Avian Influenza (HPAI)*, ref. H2025068297, 17 June 2025 (proactively released). https://www.health.govt.nz/system/files/2025-10/H2025068297-Briefing-Introduction-to-High-Pathogenic-Avian-Influenza-HPAI.pdf — archived: https://web.archive.org/web/20260703092922/https://www.health.govt.nz/system/files/2025-10/H2025068297-Briefing-Introduction-to-High-Pathogenic-Avian-Influenza-HPAI.pdf (accessed 3 Jul 2026)

2. Ministry of Health. *Pre-Pandemic Influenza Vaccine Framework*, February 2026. https://www.health.govt.nz/system/files/2026-02/pre-pandemic-influenza-vaccine-framework.pdf — archived: https://web.archive.org/web/20260703095149/https://www.health.govt.nz/system/files/2026-02/pre-pandemic-influenza-vaccine-framework.pdf (accessed 3 Jul 2026)

3. Ministry of Health. *New Zealand Pandemic Plan: A framework for action* (interim update), July 2024. https://www.health.govt.nz/system/files/2024-07/interim_nz_pandemic_plan_v2.pdf (accessed 3 Jul 2026)

4. Health New Zealand. *Avian influenza* — Communicable Disease Control Manual. https://www.healthnz.govt.nz/health-professionals/guidance-standards/topic/conditions/communicable-disease-control-manual/avian-influenza (accessed 3 Jul 2026; page 403 via CloudFront, fetched via direct HTTP)

5. Garg S, et al. *Human infections with highly pathogenic avian influenza A(H5N1) viruses in the United States, March 2024–May 2025*. Nature Medicine, 2025. https://www.nature.com/articles/s41591-025-03905-2 (accessed 3 Jul 2026)

6. US Centers for Disease Control and Prevention. *A(H5) Bird Flu: Current Situation*. https://www.cdc.gov/bird-flu/situation-summary/index.html (accessed 3 Jul 2026)

7. Te Niwha. *A genomics-informed approach to avian influenza virus surveillance*. Project page, status: Completed, 2024–2026, $1,229,012. https://www.teniwha.com/research-projects/genomics-informed-detection-surveillance-and-capacity-building-to-prepare-aotearoa-for-the-existential-threat-of-highly-pathogenic-avian-influenza-virus (accessed 3 Jul 2026)

8. Waller SJ, et al. *Avian Influenza Virus Surveillance Across New Zealand and Its Subantarctic Islands Detects H1N9 in Migratory Shorebirds, but Not 2.3.4.4b HPAI H5N1*. Influenza and Other Respiratory Viruses, 2025. https://onlinelibrary.wiley.com/doi/full/10.1111/irv.70099 (accessed 3 Jul 2026; page 403 via Cloudflare, content verified via ESR/PHF Science figshare record)

9. ESR / PHF Science. *Avian Influenza Virus Surveillance Across New Zealand and Its Subantarctic Islands Detects H1N9 in Migratory Shorebirds, but Not 2.3.4.4b HPAI H5N1*. Figshare research record. https://research.esr.cri.nz/articles/journal_contribution/Avian_Influenza_Virus_Surveillance_Across_New_Zealand_and_Its_Subantarctic_Islands_Detects_H1N9_in_Migratory_Shorebirds_but_Not_2_3_4_4b_HPAI_H5N1/29825780 (accessed 3 Jul 2026)

10. PHF Science. *Genomics research to boost Aotearoa New Zealand's defences against highly pathogenic bird flu*. 11 March 2024. https://www.phfscience.nz/news-publications/genomics-research-to-boost-aotearoa-new-zealand-s-defences-against-highly-pathogenic-bird-flu/ (accessed 3 Jul 2026)

11. PHF Science. *Dashboards*. https://phfscience.nz/dashboards/ (accessed 3 Jul 2026) — lists COVID-19 in wastewater dashboard; no influenza wastewater dashboard present

12. World Health Organization. *Influenza (health topic page)*. Includes links to Global Epidemiological Surveillance Standards for Influenza and GISRS documentation. https://www.who.int/health-topics/influenza#tab=definition (accessed 3 Jul 2026)

13. Baker M, Potter JD, French N, Geoghegan JL, Wilson N, Mansoor O, Huang S, Webby R. *Potential for an avian influenza pandemic: Time for NZ to ramp up preparedness*. Public Health Communication Centre briefing, 15 May 2024. https://www.phcc.org.nz/briefing/potential-avian-influenza-pandemic-time-nz-ramp-preparedness (accessed 3 Jul 2026)

14. World Health Organization. *Cumulative number of confirmed human cases for avian influenza A(H5N1) reported to WHO* (table to May 2026). https://cdn.who.int/media/docs/default-source/influenza/h5n1-human-case-cumulative-table/2026_table_h5n1_may.pdf (accessed 3 Jul 2026)
