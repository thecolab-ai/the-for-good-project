#!/usr/bin/env node
// Consent + PII validator for `feedback`-labelled issues (ADR-0026).
//
// Usage:
//   ISSUE_BODY="$(gh issue view N --json body --jq .body)" node scripts/check-feedback-consent.mjs
//   node scripts/check-feedback-consent.mjs --body-file body.md
//
// Prints a markdown report to stdout. Exit 0 = pass, 1 = fail (fail closed).
//
// What it enforces mechanically:
//   1. a `Stream: #<n>` line (stream-sync.yml propagates the label from it)
//   2. a valid consent tier (private | org-named | public — ADR-0010)
//   3. org-naming consistent with the tier AND with the org's own recorded
//      consent in partners/ (attribution sections fail closed; org names in
//      the verdict content only warn — they may be subject matter)
//   4. no emails / phone numbers / secret-shaped content anywhere in the body
//   5. the form's "Before you file" gates are all ticked
//
// What it can NOT check (the SOP's job — docs/REVIEW-ROUND.md): a personal
// name in prose, whether read-back really happened, whether consent was
// really given. The report says so rather than pretending otherwise.

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scanText } from "./redact-check.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TIERS = ["private", "org-named", "public"];
const NO_RESPONSE = /^_no response_$/i;

// ---------- input ----------
let body = process.env.ISSUE_BODY ?? "";
const fileFlag = process.argv.indexOf("--body-file");
if (fileFlag !== -1) body = readFileSync(process.argv[fileFlag + 1], "utf8");
if (!body.trim()) {
  console.error("no issue body: set ISSUE_BODY or pass --body-file <path>");
  process.exit(2);
}

// ---------- parse the issue-form sections (### Heading\n\nvalue) ----------
function sections(text) {
  const out = {};
  const re = /^### (.+)$/gm;
  const heads = [...text.matchAll(re)];
  heads.forEach((h, i) => {
    const start = h.index + h[0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index : text.length;
    out[h[1].trim()] = text.slice(start, end).trim();
  });
  return out;
}
const secs = sections(body);
const sec = (prefix) => {
  const key = Object.keys(secs).find((k) => k.toLowerCase().startsWith(prefix.toLowerCase()));
  return key ? secs[key] : undefined;
};
const val = (prefix) => {
  const v = sec(prefix);
  return v === undefined || NO_RESPONSE.test(v.trim()) ? "" : v.trim();
};

// ---------- load the partners registry (org name -> recorded consent) ----------
function partnerOrgs() {
  const dir = join(ROOT, "partners");
  const orgs = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".md") || ["TEMPLATE.md", "README.md", "ASKS.md"].includes(f)) continue;
    const text = readFileSync(join(dir, f), "utf8");
    const fm = text.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const org = fm[1].match(/^org:\s*"?([^"\n#]*?)"?\s*(?:#.*)?$/m)?.[1]?.trim();
    const consent = fm[1].match(/^consent:\s*([\w-]+)/m)?.[1]?.trim() ?? "private";
    if (org) orgs.push({ org, consent, file: `partners/${f}` });
  }
  return orgs;
}

// ---------- checks ----------
const failures = [];
const warnings = [];

// 1. Stream line
if (!/^\s*stream:\s*#\d+/im.test(body)) {
  failures.push(
    "No `Stream: #<n>` line found. Put the stream root in the **Stream** field exactly as `Stream: #442` — that line is what propagates the `stream:<n>` label (see `.github/workflows/stream-sync.yml`)."
  );
}

// 2. Consent tier
const tierRaw = val("Consent tier");
const tier = TIERS.find((t) => tierRaw.toLowerCase().startsWith(t));
if (!tier) {
  failures.push(
    "Missing or invalid **Consent tier**. It must be one of `private`, `org-named`, `public` (ADR-0010). Use the feedback issue form (`.github/ISSUE_TEMPLATE/5-feedback.yml`) — it has the dropdown."
  );
}

// 3. Organisation attribution vs tier vs registry
const orgField = val("Organisation");
const registry = partnerOrgs();
if (orgField) {
  if (tier === "private") {
    failures.push(
      `The **Organisation** field names "${orgField}" but the consent tier is \`private\` (role + sector only). Either the reviewer consented to org-naming — set the tier accordingly — or remove the organisation.`
    );
  } else if (tier) {
    const rec = registry.find((r) => r.org.toLowerCase() === orgField.toLowerCase());
    if (!rec) {
      failures.push(
        `The **Organisation** field names "${orgField}", but no \`partners/\` record carries that org name. Record the relationship (and its consent) first via the \`manage-partner\` skill — consent must live in the durable registry, not an inbox.`
      );
    } else if (tier === "public" && rec.consent !== "public") {
      failures.push(
        `The tier is \`public\` but ${rec.file} records "${rec.org}" at \`${rec.consent}\`. An organisation is credited publicly only after its recorded consent says so — escalate the record first (logged, via \`manage-partner\`) or lower the tier.`
      );
    }
  }
}
// Attribution sections must not smuggle a registry org name past a private tier.
if (tier === "private") {
  const attributionText = [val("Reviewer"), val("Provenance")].join("\n");
  for (const r of registry) {
    if (attributionText.toLowerCase().includes(r.org.toLowerCase())) {
      failures.push(
        `The reviewer/provenance text names "${r.org}" while the tier is \`private\`. Describe the reviewer by role + sector only, or set the tier the reviewer actually consented to.`
      );
    }
  }
  // In the verdict content an org name may be subject matter, not attribution — warn only.
  const contentText = [val("What the reviewer said"), val("Judgement answers")].join("\n");
  for (const r of registry) {
    if (contentText.toLowerCase().includes(r.org.toLowerCase())) {
      warnings.push(
        `The feedback content mentions "${r.org}" (a \`partners/\` org) while the reviewer's tier is \`private\`. Fine if it's subject matter; a problem if it identifies the reviewer — steward to confirm.`
      );
    }
  }
}

// 4. PII / secrets anywhere in the body
for (const f of scanText(body)) {
  failures.push(`Line ${f.line}: ${f.kind} — \`${f.match}\`. No personal contact detail or secret may land in the repo at any tier; sanitize and re-file (\`npm run redact-check\`).`);
}

// 5. The SOP's hard gates
const gates = sec("Before you file");
if (gates === undefined) {
  failures.push("The **Before you file** checklist is missing — file feedback through the issue form (`.github/ISSUE_TEMPLATE/5-feedback.yml`), which carries the SOP's hard gates.");
} else {
  for (const m of gates.matchAll(/^\s*-\s*\[ \]\s*(.+)$/gm)) {
    failures.push(`Unticked gate: "${m[1].slice(0, 80)}…" — the SOP (docs/REVIEW-ROUND.md) requires it before filing.`);
  }
}

// ---------- report ----------
const lines = [];
if (failures.length) {
  lines.push(`### ❌ Feedback filing failed the consent/PII validator (${failures.length} problem${failures.length > 1 ? "s" : ""})`, "");
  failures.forEach((f) => lines.push(`- ${f}`));
} else {
  lines.push("### ✅ Feedback filing passes the consent/PII validator");
}
if (warnings.length) {
  lines.push("", "**Warnings (not blocking — steward judgement):**");
  warnings.forEach((w) => lines.push(`- ${w}`));
}
lines.push(
  "",
  "_Mechanical checks only: stream link, consent tier, org-naming vs `partners/`, emails/phones/secrets, SOP gates. A personal name in prose, real read-back, and real consent are the steward's responsibility — see [docs/REVIEW-ROUND.md](../blob/main/docs/REVIEW-ROUND.md) (ADR-0026)._"
);
console.log(lines.join("\n"));
process.exit(failures.length ? 1 : 0);
