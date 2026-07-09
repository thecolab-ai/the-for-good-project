#!/usr/bin/env python3
"""Completed five-Act classification for issue #746.

The sample is the frozen issue #676 frame drawn with:
    random.Random("fg-676-2025-amendment-act-cluster-v1").sample(FRAME, 5)

Rows below classify top-level substantive amending provisions from the official
legislation.govt.nz text. Title, commencement, principal-Act locator provisions,
legislative history, administrative notes, and nested text inserted by a provision
are not counted as separate provisions.
"""

from __future__ import annotations

from collections import Counter, defaultdict

SEED = "fg-676-2025-amendment-act-cluster-v1"

ACTS = [
    {
        "short": "climate",
        "title": "Climate Change Response (Emissions Trading Scheme-Forestry Conversion) Amendment Act 2025",
        "act_no": "2025 No 52",
        "official_url": "https://www.legislation.govt.nz/act/public/2025/52/en/latest/",
        "official_fetch": "Jina reader over official HTML, 2026-07-08",
        "mirror_commits": [
            "0faeda53232d92af706148e56d437b613559119c",
            "eea7056b6198ef14094c575ffd8a2647c58ccc5f",
            "774c304e58c3110b486b3fce20f33173b25766ac",
        ],
    },
    {
        "short": "social",
        "title": "Social Security Amendment Act 2025",
        "act_no": "2025 No 25",
        "official_url": "https://www.legislation.govt.nz/act/public/2025/25/en/latest/",
        "official_fetch": "Jina reader over official HTML, 2026-07-08",
        "mirror_commits": [
            "0e628bdaab9009bf015efbd07509a2daac5ceadd",
            "78d69be8cce83c3d2ebb102b985862c39e03244f",
            "8bcf9e24d8a13629999665463dcd4b8fafe6294f",
        ],
    },
    {
        "short": "crimes",
        "title": "Crimes Legislation (Stalking and Harassment) Amendment Act 2025",
        "act_no": "2025 No 72",
        "official_url": "https://www.legislation.govt.nz/act/public/2025/72/en/latest/",
        "official_fetch": "Jina reader over official HTML, 2026-07-08",
        "mirror_commits": [
            "79de59c532b2816fb4bcb34f22fec38229b82ebb",
            "1f2363a2b0e78e5946caa6cd6b13a1bdc6b5bcf0",
            "096e81c3cd03e79ff874b2037f54d3f9d7f809c7",
            "ad818a80eed8c887a510461265e05b513bb8aa99",
            "faeb300b1670ec92eb71e6c008b370215478a746",
            "ae13a9ef6845ed48658c09c21442515a96a5e1c7",
        ],
    },
    {
        "short": "marine",
        "title": "Marine and Coastal Area (Takutai Moana) (Customary Marine Title) Amendment Act 2025",
        "act_no": "2025 No 58",
        "official_url": "https://www.legislation.govt.nz/act/public/2025/58/en/latest/",
        "official_fetch": "Jina reader over official HTML, 2026-07-08",
        "mirror_commits": [
            "1166e74caab704f3949bd67e9fab545e7c334097",
            "8e139f4d03c660e1bd205b69b577f79a3b03d2ac",
        ],
    },
    {
        "short": "judicature",
        "title": "Judicature (Timeliness) Legislation Amendment Act 2025",
        "act_no": "2025 No 85",
        "official_url": "https://www.legislation.govt.nz/act/public/2025/85/en/latest/",
        "official_fetch": "Jina reader over official HTML, 2026-07-08",
        "mirror_commits": [
            "4a618ac1360af5e09ef03585f1dd4ea5e98e19de",
            "da78011ec3ad57a23fe1db2bbe8cad9b3886187d",
            "bdb8681c7e309c7aa5f0a495a89aae581e0d1a3b",
        ],
        "mirror_note": "The mirror covers public Acts, so the High Court Rules provisions in ss 27-29 are absent from mirror counts.",
    },
]

# act, section, primary classification, operation families present, heading
PROVISIONS = [
    ("climate", 4, "insert", "insert", "Section 3A amended"),
    ("climate", 5, "insert", "insert", "Section 3B amended"),
    ("climate", 6, "mixed", "insert; replace", "Section 4 amended"),
    ("climate", 7, "replace", "replace", "Section 30M amended"),
    ("climate", 8, "insert", "insert", "Section 132 amended"),
    ("climate", 9, "insert", "insert", "Section 133 amended"),
    ("climate", 10, "insert", "insert", "Section 167 amended"),
    ("climate", 11, "insert", "insert", "New sections 167A and 167B inserted"),
    ("climate", 12, "insert", "insert", "Section 181B amended"),
    ("climate", 13, "repeal/revoke", "repeal", "Section 182 amended"),
    ("climate", 14, "insert", "insert", "New section 182AB inserted"),
    ("climate", 15, "replace", "replace", "Section 182C amended"),
    ("climate", 16, "insert", "insert", "New sections 182CA to 182CD inserted"),
    ("climate", 17, "insert", "insert", "New subparts 4A and 4B of Part 5 inserted"),
    ("climate", 18, "replace", "replace", "Section 192B amended"),
    ("climate", 19, "insert", "insert", "Schedule 1AA amended"),
    ("social", 4, "insert", "insert", "Section 5 amended"),
    ("social", 5, "repeal/revoke", "repeal", "Section 21 amended"),
    ("social", 6, "insert", "insert", "Section 119 amended"),
    ("social", 7, "insert", "insert", "Section 126 amended"),
    ("social", 8, "mixed", "insert; replace", "Section 136 amended"),
    ("social", 9, "replace", "replace", "Section 181 amended"),
    ("social", 10, "insert", "insert", "Section 183 amended"),
    ("social", 11, "insert", "insert", "New sections 183A to 183D inserted"),
    ("social", 12, "mixed", "insert; replace", "Section 230 amended"),
    ("social", 13, "mixed", "insert; replace", "Section 232 amended"),
    ("social", 14, "insert", "insert", "New section 233A inserted"),
    ("social", 15, "mixed", "insert; replace", "Section 234 amended"),
    ("social", 16, "replace", "replace", "Section 235 amended"),
    ("social", 17, "replace", "replace", "Sections 236 and 237 replaced"),
    ("social", 18, "replace", "replace", "Section 236 amended"),
    ("social", 19, "insert", "insert", "New sections 236E to 236J inserted"),
    ("social", 20, "replace", "replace", "Section 238 amended"),
    ("social", 21, "replace", "replace", "Section 239 replaced"),
    ("social", 22, "replace", "replace", "Section 242 amended"),
    ("social", 23, "insert", "insert", "New section 243AAA inserted"),
    ("social", 24, "replace", "replace", "Sections 245 to 248 replaced and amended"),
    ("social", 25, "mixed", "insert; replace", "Section 252 amended"),
    ("social", 26, "insert", "insert", "New section 252A inserted"),
    ("social", 27, "insert", "insert", "Section 254 amended"),
    ("social", 28, "mixed", "insert; replace", "Section 256 amended"),
    ("social", 29, "mixed", "insert; replace", "Section 261 amended"),
    ("social", 30, "insert", "insert", "New sections 261A and 261B inserted"),
    ("social", 31, "insert", "insert", "New sections 261C and 261D inserted"),
    ("social", 32, "replace", "replace", "Section 262 replaced"),
    ("social", 33, "replace", "replace", "Section 263 amended"),
    ("social", 34, "replace", "replace", "Section 265 amended"),
    ("social", 35, "insert", "insert", "New section 270A inserted"),
    ("social", 36, "insert", "insert", "Section 272 amended"),
    ("social", 37, "insert", "insert", "Section 276 amended"),
    ("social", 38, "insert", "insert", "Section 278 amended"),
    ("social", 39, "insert", "insert", "New section 280A inserted"),
    ("social", 40, "replace", "replace", "Section 282 amended"),
    ("social", 41, "insert", "insert", "Section 283 amended"),
    ("social", 42, "insert", "insert", "New section 285A inserted"),
    ("social", 43, "replace", "replace", "Section 287 replaced"),
    ("social", 44, "insert", "insert", "Section 298 amended"),
    ("social", 45, "insert", "insert", "Cross-heading above section 320 amended"),
    ("social", 46, "mixed", "insert; replace", "Section 320 amended"),
    ("social", 47, "insert", "insert", "Section 321 amended"),
    ("social", 48, "insert", "insert", "Section 322 amended"),
    ("social", 49, "replace", "replace", "Section 325 amended"),
    ("social", 50, "replace", "replace", "Section 332 amended"),
    ("social", 51, "replace", "replace", "Section 334 replaced"),
    ("social", 52, "insert", "insert", "Section 339 amended"),
    ("social", 53, "insert", "insert", "Section 340 amended"),
    ("social", 54, "insert", "insert", "New sections 340A and 340B inserted"),
    ("social", 55, "mixed", "insert; replace", "Section 346 amended"),
    ("social", 56, "delete", "delete", "Subpart 5A heading amended"),
    ("social", 57, "replace", "replace", "Section 363A amended"),
    ("social", 58, "insert", "insert", "Section 363A amended"),
    ("social", 59, "insert", "insert", "Section 418 amended"),
    ("social", 60, "mixed", "insert; replace", "Section 441 amended"),
    ("social", 61, "mixed", "delete; insert; replace", "Amendments to update references to money management"),
    ("social", 62, "insert", "insert", "Schedule 1 amended"),
    ("social", 63, "mixed", "insert; repeal; replace", "Schedule 2 amended"),
    ("social", 65, "insert", "insert", "Regulation 163 amended"),
    ("social", 66, "insert", "insert", "New regulations 163A and 163B inserted"),
    ("social", 67, "insert", "insert", "New regulations 163C and 163D inserted"),
    ("social", 68, "replace", "replace", "Regulation 165 amended"),
    ("social", 69, "insert", "insert", "Regulation 165 amended"),
    ("social", 70, "mixed", "replace; revoke", "Regulation 187 amended"),
    ("social", 71, "replace", "replace", "Regulation 189 replaced"),
    ("social", 72, "replace", "replace", "Regulation 190 replaced"),
    ("social", 73, "insert", "insert", "New subpart 4A of Part 6 inserted"),
    ("social", 74, "insert", "insert", "Regulation 206 amended"),
    ("social", 75, "mixed", "insert; replace", "Amendments to update references to money management"),
    ("social", 76, "insert", "insert", "Schedule 1 amended"),
    ("social", 77, "mixed", "delete; insert; replace", "Schedule 6 amended"),
    ("crimes", 4, "insert", "insert", "New sections 216O to 216S inserted"),
    ("crimes", 6, "insert", "insert", "Section 22H amended"),
    ("crimes", 7, "insert", "insert", "Section 39A amended"),
    ("crimes", 9, "insert", "insert", "Section 4 amended"),
    ("crimes", 10, "replace", "replace", "Section 95 amended"),
    ("crimes", 12, "mixed", "insert; replace", "Section 11 amended"),
    ("crimes", 14, "replace", "replace", "Long Title amended"),
    ("crimes", 15, "mixed", "repeal; replace", "Section 6 amended"),
    ("crimes", 16, "repeal/revoke", "repeal", "Part 2 repealed"),
    ("crimes", 17, "repeal/revoke", "repeal", "Section 26 amended"),
    ("crimes", 18, "delete", "delete", "Section 29 amended"),
    ("crimes", 19, "delete", "delete", "Section 30 amended"),
    ("crimes", 20, "repeal/revoke", "repeal", "Section 32 amended"),
    ("crimes", 21, "delete", "delete", "Section 42 amended"),
    ("crimes", 23, "mixed", "insert; repeal", "Section 62 amended"),
    ("crimes", 25, "insert", "insert", "Section 9 amended"),
    ("crimes", 26, "insert", "insert", "Section 106 amended"),
    ("crimes", 27, "insert", "insert", "New sections 123I and 123J inserted"),
    ("crimes", 29, "replace", "replace", "Regulation 3 amended"),
    ("marine", 4, "insert", "insert", "Preamble amended"),
    ("marine", 5, "insert", "insert", "Section 9 amended"),
    ("marine", 6, "insert", "insert", "New sections 9A to 9C inserted"),
    ("marine", 7, "replace", "replace", "Section 51 amended"),
    ("marine", 8, "insert", "insert", "New sections 57A and 57B inserted"),
    ("marine", 9, "mixed", "insert; repeal; replace", "Section 58 amended"),
    ("marine", 10, "mixed", "insert; replace", "Section 59 amended"),
    ("marine", 11, "replace", "replace", "Section 106 amended"),
    ("marine", 12, "insert", "insert", "New Schedule 1AA inserted"),
    ("marine", 14, "insert", "insert", "New section 110A inserted"),
    ("marine", 16, "insert", "insert", "New sections 59A and 59B inserted"),
    ("judicature", 4, "mixed", "insert; replace", "Section 7 amended"),
    ("judicature", 5, "mixed", "insert; replace", "Section 49 amended"),
    ("judicature", 6, "insert", "insert", "Section 81 amended"),
    ("judicature", 7, "insert", "insert", "New sections 164A to 164C inserted"),
    ("judicature", 8, "replace", "replace", "Cross-heading above section 166 replaced"),
    ("judicature", 9, "insert", "insert", "Schedule 5 amended"),
    ("judicature", 11, "insert", "insert", "Section 35 amended"),
    ("judicature", 12, "insert", "insert", "New section 156A inserted"),
    ("judicature", 13, "insert", "insert", "New section 319A inserted"),
    ("judicature", 14, "insert", "insert", "Schedule 1AA amended"),
    ("judicature", 16, "replace", "replace", "Section 4 amended"),
    ("judicature", 17, "replace", "replace", "Section 8 amended"),
    ("judicature", 18, "insert", "insert", "Section 28 amended"),
    ("judicature", 19, "insert", "insert", "Section 55 amended"),
    ("judicature", 20, "insert", "insert", "New section 65A inserted"),
    ("judicature", 21, "replace", "replace", "Section 83 amended"),
    ("judicature", 22, "insert", "insert", "Section 94A amended"),
    ("judicature", 23, "insert", "insert", "Section 94B amended"),
    ("judicature", 24, "insert", "insert", "Section 118 amended"),
    ("judicature", 25, "insert", "insert", "Schedule 1 amended"),
    ("judicature", 27, "replace", "replace", "Rule 2.1 amended"),
    ("judicature", 28, "repeal/revoke", "revoke", "Rules 5.35A to 5.35C revoked"),
    ("judicature", 29, "insert", "insert", "Schedule 1AA amended"),
]

MIRROR_LABEL_COUNTS = {
    "climate": {"inserted": 103, "replaced": 4, "amended": 3, "repealed": 2},
    "social": {"inserted": 45, "replaced": 22, "amended": 34, "repealed": 2},
    "crimes": {"inserted": 8, "amended": 12, "repealed": 5},
    "marine": {"inserted": 37, "replaced": 4, "amended": 3, "repealed": 1},
    "judicature": {"inserted": 26, "replaced": 4, "amended": 6},
}


def counts_by_act() -> dict[str, Counter[str]]:
    counts: dict[str, Counter[str]] = defaultdict(Counter)
    for act, _section, primary, _ops, _heading in PROVISIONS:
        counts[act][primary] += 1
    return counts


def main() -> None:
    print(f"Seed: {SEED}")
    print("Official text: top-level substantive amending provisions")
    total = Counter()
    operation_presence = Counter()
    for _act, _section, _primary, ops, _heading in PROVISIONS:
        for op in ops.split("; "):
            if op in {"repeal", "revoke"}:
                op = "repeal/revoke"
            operation_presence[op] += 1
    for act in ACTS:
        counts = counts_by_act()[act["short"]]
        total.update(counts)
        print(f"- {act['short']}: {sum(counts.values())} provisions; {dict(sorted(counts.items()))}")
    print(f"Total: {sum(total.values())} provisions; {dict(sorted(total.items()))}")
    print(f"Operation presence: {dict(sorted(operation_presence.items()))}")
    print()
    print("Mirror operation labels, counted from nz-statute-book commit-body lines")
    mirror_total = Counter()
    for act in ACTS:
        counts = Counter(MIRROR_LABEL_COUNTS[act["short"]])
        mirror_total.update(counts)
        print(f"- {act['short']}: {dict(sorted(counts.items()))}")
    print(f"Mirror total: {sum(mirror_total.values())} labels; {dict(sorted(mirror_total.items()))}")


if __name__ == "__main__":
    main()
