#!/usr/bin/env python3
"""Reproduce the seeded 2025 five-cluster sample and the provision-level
operation-type classification for #676.

Two steps:

1. Sampling frame + seed. The frozen frame is the 62 Royal Assent results
   captured from:

       python3 .skills/skills/nz-parliament/scripts/cli.py bills \
           --keyword Amendment --all --limit 50 --page <1..10> --json

   filtered to status == "Royal Assent" and last_activity beginning "2025".
   The bills.parliament.nz API has since returned at least one same-date tie in
   a different order, so this embedded frame is the sampling artifact of record.
   With SEED it draws the same five clusters every run.

2. Classification. Each of the five selected Acts was retrieved as official
   legislation.govt.nz XML (via the vendored `legislation-nz` skill / the
   `latest.xml` endpoint) and every top-level amending provision was classified
   by its operative instruction text into one operation family
   (insert / replace / repeal-revoke / delete) or `mixed` when the provision's
   instructions span more than one family. Title, Commencement, and
   "Principal Act/regulations/rules" locator provisions are excluded, as are the
   inserted/replaced blocks themselves (the substituted content, not an
   instruction). Two Social Security provisions (ss 61, 75) direct amendments
   "as set out in Schedule 1/3"; the referenced schedules contain both insert
   and replace/delete operations, so they are recorded as `mixed`
   (schedule-directed).

   The classification here was produced by parsing the official XML
   (parse tree: top-level <prov> with no <amend>/<schedule> ancestor; families
   detected from operative verbs insert/replace/repeal/revoke/omit/delete) and
   is embedded below as the artifact of record. Re-running the parser against a
   fresh XML pull reproduces these rows.
"""

from __future__ import annotations

from collections import Counter
import random

SEED = "fg-676-2025-amendment-act-cluster-v1"

FRAME = [
    ("2025-12-19", "186-3", "Electoral Amendment Bill"),
    ("2025-12-19", "159-4", "Judicature (Timeliness) Legislation Amendment Bill"),
    ("2025-12-19", "171-2", "Overseas Investment (National Interest Test and Other Matters) Amendment Bill"),
    ("2025-12-16", "219-1", "Fast-track Approvals Amendment Bill"),
    ("2025-12-16", "232-1", "Resource Management (Duration of Consents) Amendment Bill"),
    ("2025-12-16", "229-1", "Climate Change Response (2050 Target and Other Matters) Amendment Bill"),
    ("2025-12-16", "207-1", "Animal Welfare (Regulations for Management of Pigs) Amendment Bill"),
    ("2025-11-27", "138-2", "Immigration (Fiscal Sustainability and System Integrity) Amendment Bill"),
    ("2025-11-27", "160-2", "Legal Services (Distribution of Special Fund) Amendment Bill"),
    ("2025-11-26", "80-2", "Statutes Amendment Bill"),
    ("2025-11-26", "200-1", "Defence (Workforce) Amendment Bill"),
    ("2025-11-26", "93-2", "Crimes (Countering Foreign Interference) Amendment Bill"),
    ("2025-11-26", "107-2", "Crimes Legislation (Stalking and Harassment) Amendment Bill"),
    ("2025-11-26", "191-2", "Education and Training (Early Childhood Education Reform) Amendment Bill"),
    ("2025-11-26", "196-2", "Land Transport (Clean Vehicle Standard) Amendment Bill (No 2)"),
    ("2025-11-18", "134-3", "Medicines Amendment Bill"),
    ("2025-11-18", "140-3", "Education and Training Amendment Bill (No 2)"),
    ("2025-11-18", "18-3", "Companies (Address Information) Amendment Bill"),
    ("2025-11-18", "113-3", "Land Transport Management (Time of Use Charging) Amendment Bill"),
    ("2025-10-24", "98-2", "Disputes Tribunal Amendment Bill"),
    ("2025-10-24", "166-3", "Building and Construction (Small Stand-alone Dwellings) Amendment Bill"),
    ("2025-10-24", "97-3", "Responding to Abuse in Care Legislation Amendment Bill"),
    ("2025-10-24", "83-3", "Marine and Coastal Area (Takutai Moana) (Customary Marine Title) Amendment Bill"),
    ("2025-10-21", "150-3", "Education and Training (Vocational Education and Training System) Amendment Bill"),
    ("2025-10-16", "111-1", "Broadcasting (Repeal of Advertising Restrictions) Amendment Bill"),
    ("2025-09-23", "203-1", "Income Tax (FamilyBoost) Amendment Bill"),
    ("2025-09-23", "292-3", "Privacy Amendment Bill"),
    ("2025-09-23", "112-1", "Customs (Levies and Other Matters) Amendment Bill"),
    ("2025-09-23", "174-2", "Climate Change Response (Emissions Trading Scheme—Forestry Conversion) Amendment Bill"),
    ("2025-09-17", "206-1", "Adoption Amendment Bill"),
    ("2025-08-26", "32-2", "Employment Relations (Employee Remuneration Disclosure) Amendment Bill"),
    ("2025-08-26", "149-3", "Public Works (Critical Infrastructure) Amendment Bill"),
    ("2025-08-26", "30-2", "Evidence (Giving Family Violence Evidence in Family Court Proceedings) Amendment Bill"),
    ("2025-08-20", "105-3", "Resource Management (Consenting and Other System Changes) Amendment Bill"),
    ("2025-08-05", "82-3", "Crown Minerals Amendment Bill"),
    ("2025-08-05", "91-2", "Auckland Harbour Board and Takapuna Borough Council Empowering Amendment Bill"),
    ("2025-07-30", "81-3", "Budapest Convention and Related Matters Legislation Amendment Bill"),
    ("2025-07-25", "141-1", "United Arab Emirates Comprehensive Economic Partnership Agreement Legislation Amendment Bill"),
    ("2025-07-25", "185-1", "Outer Space and High-altitude Activities Amendment Bill"),
    ("2025-06-30", "104-2", "Employment Relations (Pay Deductions for Partial Strikes) Amendment Bill"),
    ("2025-06-30", "92-2", "Oversight of Oranga Tamariki System Legislation Amendment Bill"),
    ("2025-06-27", "101-3", "Racing Industry Amendment Bill"),
    ("2025-06-27", "162-1", "Rates Rebate Amendment Bill"),
    ("2025-06-27", "158-1", "Social Security (Mandatory Reviews) Amendment Bill"),
    ("2025-05-29", "167-1", "Social Assistance Legislation (Accommodation Supplement and Income-related Rent) Amendment Bill"),
    ("2025-05-21", "103-3", "Social Security Amendment Bill"),
    ("2025-05-13", "146-1", "Wildlife (Authorisations) Amendment Bill"),
    ("2025-05-13", "147-1", "Equal Pay Amendment Bill"),
    ("2025-04-07", "43-2", "Oranga Tamariki (Repeal of Section 7AA) Amendment Bill"),
    ("2025-04-07", "76-2", "Building (Overseas Building Products, Standards, and Certification Schemes) Amendment Bill"),
    ("2025-03-29", "77-2", "Sentencing (Reform) Amendment Bill"),
    ("2025-03-29", "49-2", "Regulatory Systems (Immigration and Workforce) Amendment Bill"),
    ("2025-03-29", "63-2", "Social Workers Registration Amendment Bill"),
    ("2025-03-29", "50-2", "Regulatory Systems (Economic Development) Amendment Bill"),
    ("2025-03-29", "88-2", "Dairy Industry Restructuring (Export Licences Allocation) Amendment Bill"),
    ("2025-03-29", "69-3", "Land Transport (Drug Driving) Amendment Bill"),
    ("2025-03-29", "263-2", "Fisheries (International Fishing and Other Matters) Amendment Bill"),
    ("2025-03-29", "85-2", "Arms (Shooting Clubs, Shooting Ranges, and Other Matters) Amendment Bill"),
    ("2025-03-13", "245-3", "Crimes (Theft by Employer) Amendment Bill"),
    ("2025-03-12", "78-1", "District Court (District Court Judges) Amendment Bill"),
    ("2025-03-12", "130-1", "Bail (Electronic Monitoring) Amendment Bill"),
    ("2025-02-24", "61-2", "Overseas Investment (Build-to-rent and Similar Rental Developments) Amendment Bill"),
]

# Bill -> enacted public Act (year/number), confirmed by title match on the
# official legislation.govt.nz XML metadata (get-act).
SELECTED_ACTS = {
    "174-2": ("2025/52", "Climate Change Response (Emissions Trading Scheme—Forestry Conversion) Amendment Act 2025", "2025-09-23"),
    "103-3": ("2025/25", "Social Security Amendment Act 2025", "2025-05-21"),
    "107-2": ("2025/72", "Crimes Legislation (Stalking and Harassment) Amendment Act 2025", "2025-11-26"),
    "83-3": ("2025/58", "Marine and Coastal Area (Takutai Moana) (Customary Marine Title) Amendment Act 2025", "2025-10-24"),
    "159-4": ("2025/85", "Judicature (Timeliness) Legislation Amendment Act 2025", "2025-12-19"),
}

# Provision-level classification of every substantive amending provision in each
# selected Act, parsed from official legislation.govt.nz XML. Fields:
# (provision label, primary class, operation tokens present, heading).
# Primary class: one family if the provision's instructions are single-family;
# "mixed" if they span >1 family. Locator/title/commencement provisions excluded.
CLASSIFIED = {
    "2025/52": [
        ("4", "insert", "insert", "Section 3A amended (Treaty of Waitangi (Te Tiriti o Waitangi))"),
        ("5", "insert", "insert", "Section 3B amended (Consultation about certain regulations, orders, and notices)"),
        ("6", "mixed", "insert/replace", "Section 4 amended (Interpretation)"),
        ("7", "replace", "replace", "Section 30M amended (Regulations about infringement offences)"),
        ("8", "insert", "insert", "Section 132 amended (Other offences)"),
        ("9", "insert", "insert", "Section 133 amended (Evasion or similar offences)"),
        ("10", "insert", "insert", "Section 167 amended (Regulations relating to fees and charges)"),
        ("11", "insert", "insert", "New sections 167A and 167B inserted"),
        ("12", "insert", "insert", "Section 181B amended (Criteria for P90 offset application)"),
        ("13", "repeal/revoke", "repeal/revoke", "Section 182 amended (Standard and permanent forestry on post-1989 forest land)"),
        ("14", "insert", "insert", "New section 182AB inserted (Restriction on registration as participant)"),
        ("15", "replace", "replace", "Section 182C amended (Registration as participant in standard or permanent forestry)"),
        ("16", "insert", "insert", "New sections 182CA to 182CD inserted"),
        ("17", "insert", "insert", "New subparts 4A and 4B of Part 5 inserted"),
        ("18", "replace", "replace", "Section 192B amended (Criteria for P89 offset application)"),
        ("19", "insert", "insert", "Schedule 1AA amended"),
    ],
    "2025/25": [
        ("4", "insert", "insert", "Section 5 amended (Guide to this Act)"),
        ("5", "repeal/revoke", "repeal/revoke", "Section 21 amended (What is work gap)"),
        ("6", "insert", "insert", "Section 119 amended"),
        ("7", "insert", "insert", "Section 126 amended"),
        ("8", "mixed", "insert/replace", "Section 136 amended"),
        ("9", "replace", "replace", "Section 181 amended (Application of health and safety legislation, etc)"),
        ("10", "insert", "insert", "Section 183 amended (What this Part does)"),
        ("11", "insert", "insert", "New sections 183A to 183D and cross-heading inserted"),
        ("12", "mixed", "insert/replace", "Section 230 amended"),
        ("13", "mixed", "insert/replace", "Section 232 amended (Sanctions for failure to comply)"),
        ("14", "insert", "insert", "New section 233A inserted"),
        ("15", "mixed", "insert/replace", "Section 234 amended (Hierarchy of sanctions)"),
        ("16", "replace", "replace", "Section 235 amended"),
        ("17", "replace", "replace", "Sections 236 and 237 replaced"),
        ("18", "replace", "replace", "Section 236 amended (Sanction for first failure)"),
        ("19", "insert", "insert", "New sections 236E to 236J inserted"),
        ("20", "replace", "replace", "Section 238 amended (Sanction for third failure)"),
        ("21", "mixed", "insert/replace", "Section 239 replaced"),
        ("22", "replace", "replace", "Section 242 amended (Failures that cannot be counted)"),
        ("23", "insert", "insert", "New section 243AAA inserted"),
        ("24", "replace", "replace", "Sections 245 to 248 replaced and amended"),
        ("25", "mixed", "insert/replace", "Section 252 amended (MSD must give notice of sanction)"),
        ("26", "mixed", "insert/replace", "New section 252A inserted"),
        ("27", "insert", "insert", "Section 254 amended"),
        ("28", "mixed", "insert/replace", "Section 256 amended"),
        ("29", "mixed", "insert/replace", "Section 261 amended"),
        ("30", "insert", "insert", "New sections 261A and 261B inserted"),
        ("31", "insert", "insert", "New sections 261C and 261D inserted"),
        ("32", "replace", "replace", "Section 262 replaced"),
        ("33", "replace", "replace", "Section 263 amended"),
        ("34", "replace", "replace", "Section 265 amended"),
        ("35", "insert", "insert", "New section 270A inserted"),
        ("36", "insert", "insert", "Section 272 amended"),
        ("37", "insert", "insert", "Section 276 amended"),
        ("38", "insert", "insert", "Section 278 amended"),
        ("39", "insert", "insert", "New section 280A inserted"),
        ("40", "replace", "replace", "Section 282 amended"),
        ("41", "insert", "insert", "Section 283 amended"),
        ("42", "insert", "insert", "New section 285A and cross-heading inserted"),
        ("43", "replace", "replace", "Section 287 replaced"),
        ("44", "insert", "insert", "Section 298 amended"),
        ("45", "insert", "insert", "Cross-heading above section 320 amended"),
        ("46", "mixed", "insert/replace", "Section 320 amended"),
        ("47", "insert", "insert", "Section 321 amended"),
        ("48", "insert", "insert", "Section 322 amended"),
        ("49", "replace", "replace", "Section 325 amended"),
        ("50", "replace", "replace", "Section 332 amended (General rule)"),
        ("51", "replace", "replace", "Section 334 replaced (Exemptions)"),
        ("52", "insert", "insert", "Section 339 amended"),
        ("53", "insert", "insert", "Section 340 amended"),
        ("54", "insert", "insert", "New sections 340A and 340B inserted"),
        ("55", "mixed", "insert/replace", "Section 346 amended"),
        ("56", "delete", "delete", "Subpart 5A heading in Part 6 amended"),
        ("57", "replace", "replace", "Section 363A amended"),
        ("58", "insert", "insert", "Section 363A amended"),
        ("59", "insert", "insert", "Section 418 amended (Regulations: general)"),
        ("60", "mixed", "insert/replace", "Section 441 amended (Regulations: expiry and regrant)"),
        ("61", "mixed", "schedule-directed", "Amendments to update references to money management (Schedule 1)"),
        ("62", "insert", "insert", "Schedule 1 amended"),
        ("63", "mixed", "insert/repeal-revoke/replace", "Schedule 2 amended"),
        ("65", "insert", "insert", "Regulation 163 amended"),
        ("66", "insert", "insert", "New regulations 163A and 163B inserted"),
        ("67", "insert", "insert", "New regulations 163C and 163D inserted"),
        ("68", "replace", "replace", "Regulation 165 amended"),
        ("69", "insert", "insert", "Regulation 165 amended"),
        ("70", "mixed", "repeal-revoke/replace", "Regulation 187 amended (Expiry date for jobseeker support)"),
        ("71", "replace", "replace", "Regulation 189 replaced"),
        ("72", "replace", "replace", "Regulation 190 replaced"),
        ("73", "insert", "insert", "New subpart 4A of Part 6 inserted"),
        ("74", "insert", "insert", "Regulation 206 amended (Debts due to the Crown)"),
        ("75", "mixed", "schedule-directed", "Amendments to update references to money management (Schedule 3)"),
        ("76", "insert", "insert", "Schedule 1 amended"),
        ("77", "delete", "delete", "Schedule 6 amended"),
    ],
    "2025/72": [
        ("4", "insert", "insert", "New sections 216O to 216S and cross-heading inserted"),
        ("6", "insert", "insert", "Section 22H amended (Persons disqualified from holding firearms licence)"),
        ("7", "insert", "insert", "Section 39A amended (When FPO may be made)"),
        ("9", "insert", "insert", "Section 4 amended (Interpretation)"),
        ("10", "replace", "replace", "Section 95 amended (Restrictions on cross-examination)"),
        ("12", "mixed", "insert/replace", "Section 11 amended (Meaning of psychological abuse)"),
        ("14", "delete", "delete", "Long Title amended"),
        ("15", "mixed", "delete/repeal-revoke", "Section 6 amended (Object)"),
        ("16", "repeal/revoke", "repeal/revoke", "Part 2 repealed"),
        ("17", "repeal/revoke", "repeal/revoke", "Section 26 amended (Power to require person to supply name and address)"),
        ("18", "delete", "delete", "Section 29 amended (Standard of proof)"),
        ("19", "delete", "delete", "Section 30 amended (Admission of evidence)"),
        ("20", "repeal/revoke", "repeal/revoke", "Section 32 amended (Vexatious proceedings)"),
        ("21", "delete", "delete", "Section 42 amended (Rules of court)"),
        ("23", "mixed", "delete/insert", "Section 62 amended (Grounds of disqualification)"),
        ("25", "insert", "insert", "Section 9 amended (Aggravating and mitigating factors)"),
        ("26", "insert", "insert", "Section 106 amended (Discharge without conviction)"),
        ("27", "insert", "insert", "New sections 123I and 123J and cross-headings inserted"),
        ("29", "replace", "replace", "Regulation 3 amended (Interpretation)"),
    ],
    "2025/58": [
        ("4", "insert", "insert", "Preamble amended"),
        ("5", "insert", "insert", "Section 9 amended (Interpretation)"),
        ("6", "insert", "insert", "New sections 9A to 9C inserted"),
        ("7", "replace", "replace", "Section 51 amended (Meaning of protected customary rights)"),
        ("8", "insert", "insert", "New sections 57A and 57B and cross-heading inserted"),
        ("9", "mixed", "insert/repeal-revoke/replace", "Section 58 amended (Customary marine title)"),
        ("10", "mixed", "insert/replace", "Section 59 amended (Matters relevant to whether CMT exists)"),
        ("11", "replace", "replace", "Section 106 amended (Burden of proof)"),
        ("12", "insert", "insert", "New Schedule 1AA inserted"),
        ("14", "insert", "insert", "New section 110A inserted"),
        ("16", "insert", "insert", "New sections 59A and 59B inserted"),
    ],
    "2025/85": [
        ("4", "mixed", "insert/replace", "Section 7 amended (Number of High Court Judges)"),
        ("5", "mixed", "insert/replace", "Section 49 amended (Powers exercisable by Judges)"),
        ("6", "insert", "insert", "Section 81 amended (Exercise of powers of court)"),
        ("7", "insert", "insert", "New sections 164A to 164C and cross-headings inserted"),
        ("8", "replace", "replace", "Cross-heading above section 166 replaced"),
        ("9", "insert", "insert", "Schedule 5 amended"),
        ("11", "insert", "insert", "Section 35 amended"),
        ("12", "insert", "insert", "New section 156A and cross-heading inserted"),
        ("13", "insert", "insert", "New section 319A and cross-heading inserted"),
        ("14", "insert", "insert", "Schedule 1AA amended"),
        ("16", "replace", "replace", "Section 4 amended (Coroner's role)"),
        ("17", "replace", "replace", "Section 8 amended (Overview of this Act)"),
        ("18", "insert", "insert", "Section 28 amended"),
        ("19", "insert", "insert", "Section 55 amended"),
        ("20", "insert", "insert", "New section 65A inserted"),
        ("21", "replace", "replace", "Section 83 amended"),
        ("22", "insert", "insert", "Section 94A amended"),
        ("23", "insert", "insert", "Section 94B amended"),
        ("24", "insert", "insert", "Section 118 amended"),
        ("25", "insert", "insert", "Schedule 1 amended"),
        ("27", "replace", "replace", "Rule 2.1 amended (Jurisdiction and powers)"),
        ("28", "repeal/revoke", "repeal/revoke", "Rules 5.35A to 5.35C and cross-heading revoked"),
        ("29", "insert", "insert", "Schedule 1AA amended"),
    ],
}


def main() -> None:
    sample = random.Random(SEED).sample(FRAME, 5)
    print(f"Seed: {SEED}")
    print("Five selected clusters (bill -> enacted Act):")
    for date, bill_no, title in sample:
        act_id, act_title, assent = SELECTED_ACTS[bill_no]
        print(f"- {date} {bill_no} -> {act_id} ({assent}) {act_title}")

    overall = Counter()
    print("\nPer-cluster primary classification:")
    for act_id, rows in CLASSIFIED.items():
        c = Counter(primary for _, primary, _, _ in rows)
        overall.update(c)
        print(f"  {act_id}: n={len(rows)} {dict(c)}")

    total = sum(overall.values())
    print(f"\nAggregate across all five clusters (n={total} substantive amending provisions):")
    for key in ["insert", "replace", "mixed", "repeal/revoke", "delete"]:
        print(f"  {key}: {overall[key]} ({100 * overall[key] / total:.1f}%)")


if __name__ == "__main__":
    main()
