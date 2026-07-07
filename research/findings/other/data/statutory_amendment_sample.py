#!/usr/bin/env python3
"""Reproduce the seeded pilot sample and classified provision breakdown for #676.

The frame is the 63 Royal Assent results from:

    python3 .skills/skills/nz-parliament/scripts/cli.py bills \
        --keyword Amendment --all --limit 50 --page <1..10> --json

filtered to status == "Royal Assent" and last_activity beginning "2025".
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
    ("2025-09-23", "174-2", "Climate Change Response (Emissions Trading Scheme-Forestry Conversion) Amendment Bill"),
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

CLASSIFIED_PROVISIONS = [
    ("4", "Section 7 amended (Number of High Court Judges)", "mixed", "replace; insert"),
    ("5", "Section 49 amended (Powers exercisable by Judges)", "mixed", "insert; replace"),
    ("6", "Section 81 amended (Exercise of powers of court)", "insert", "insert"),
    ("7", "New sections 164A to 164C and cross-headings inserted", "insert", "insert"),
    ("8", "Cross-heading above section 166 replaced", "replace", "replace"),
    ("9", "Schedule 5 amended", "insert", "insert"),
    ("11", "Section 35 amended (Court dealing with proceeding before trial or transfer for trial: categories 1 to 3)", "insert", "insert"),
    ("12", "New section 156A and cross-heading inserted", "insert", "insert"),
    ("13", "New section 319A and cross-heading inserted", "insert", "insert"),
    ("14", "Schedule 1AA amended", "insert", "insert"),
    ("16", "Section 4 amended (Coroner's role)", "replace", "replace"),
    ("17", "Section 8 amended (Overview of this Act)", "replace", "replace"),
    ("18", "Section 28 amended (Any person may access specified certificates and notices)", "insert", "insert"),
    ("19", "Section 55 amended (Return on request of retained parts and samples)", "insert", "insert"),
    ("20", "New section 65A inserted (Coroner may close inquiry despite initial decision)", "insert", "insert"),
    ("21", "Section 83 amended (Specialist advisers to sit with and help coroners)", "replace", "replace"),
    ("22", "Section 94A amended (Chief coroner to monitor inquiries not completed within 1 year)", "insert", "insert"),
    ("23", "Section 94B amended (Chief coroner to publish information regarding certain inquiries for which findings not completed)", "insert", "insert"),
    ("24", "Section 118 amended (Coroner may call for investigations or examinations or commission reports)", "insert", "insert"),
    ("25", "Schedule 1 amended", "insert", "insert"),
    ("27", "Rule 2.1 amended (Jurisdiction and powers)", "replace", "replace"),
    ("28", "Rules 5.35A to 5.35C and cross-heading above rule 5.35A revoked", "repeal/revoke", "revoke"),
    ("29", "Schedule 1AA amended", "insert", "insert"),
]


def main() -> None:
    sample = random.Random(SEED).sample(FRAME, 5)
    print(f"Seed: {SEED}")
    print("Five selected clusters:")
    for row in sample:
        print(f"- {row[0]} {row[1]} {row[2]}")

    print("\nClassified provisions in the accessible selected cluster:")
    for section, heading, primary, operations in CLASSIFIED_PROVISIONS:
        print(f"{section}\t{primary}\t{operations}\t{heading}")

    counts = Counter(primary for _, _, primary, _ in CLASSIFIED_PROVISIONS)
    print("\nPrimary classification counts:")
    for key, count in sorted(counts.items()):
        print(f"{key}: {count}/{len(CLASSIFIED_PROVISIONS)}")


if __name__ == "__main__":
    main()
