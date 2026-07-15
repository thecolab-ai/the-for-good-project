#!/usr/bin/env node
// Redaction pre-flight for feedback text (ADR-0026, docs/REVIEW-ROUND.md §4).
//
// Usage:  npm run redact-check -- <file>     (or pipe text on stdin)
//
// Flags, with line numbers: email addresses, phone-shaped numbers, and
// anything the fleet's shared secret patterns would redact
// (server/clients/redact-patterns.mjs — the ONE pattern library, ADR-0016).
// Exit 0 = clean, 1 = findings, 2 = usage error.
//
// Honest limit: this cannot recognise a personal NAME in prose. The
// sanitize-before-agent and read-back steps of the SOP are the guard for
// that — this script only makes the mechanical part mechanical.

import { readFileSync } from "node:fs";
import { redactText, REDACTED } from "../server/clients/redact-patterns.mjs";

export const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
// Phone shapes seen in NZ correspondence: +64 21 123 4567, 021 234 5678,
// (04) 472-1234, 0800 123 456. Anchored to +64 / leading-0 prefixes and 7+
// further digits so plain statistics ("45,000 people") don't false-positive.
export const PHONE_RE = /(?:\+64|\(0[2-9]\)|\b0[2-9]0?)(?:[\s-]?\d){7,10}\b/g;

export function scanText(text) {
  const findings = [];
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    for (const m of line.match(EMAIL_RE) ?? [])
      findings.push({ line: i + 1, kind: "email address", match: m });
    for (const m of line.match(PHONE_RE) ?? [])
      findings.push({ line: i + 1, kind: "phone-shaped number", match: m });
    if (redactText(line) !== line)
      findings.push({ line: i + 1, kind: "secret-shaped content", match: redactText(line).includes(REDACTED) ? "(matched the fleet secret patterns)" : "(rewritten by redaction)" });
  });
  return findings;
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());
if (isMain) {
  const arg = process.argv[2];
  let text;
  try {
    text = arg ? readFileSync(arg, "utf8") : readFileSync(0, "utf8");
  } catch (e) {
    console.error(`usage: npm run redact-check -- <file>   (or pipe on stdin)\n${e.message}`);
    process.exit(2);
  }
  const findings = scanText(text);
  if (findings.length === 0) {
    console.log("✅ redact-check: no emails, phone numbers, or secret-shaped content found.");
    console.log("   (This can't spot a personal name in prose — that's the SOP's sanitize + read-back steps.)");
    process.exit(0);
  }
  console.error(`❌ redact-check: ${findings.length} finding(s) — remove these before filing:\n`);
  for (const f of findings) console.error(`  line ${f.line}: ${f.kind} — ${f.match}`);
  process.exit(1);
}
