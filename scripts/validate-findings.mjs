#!/usr/bin/env node
// Validate consistency of research findings and solutions markdown.
// Deterministic (no AI, no tokens). Run locally: `node scripts/validate-findings.mjs`
// or `npm run validate`. Also runs in CI on every PR (.github/workflows/validate.yml).
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOMAINS = ["child-welfare", "grant-access", "civic-transparency", "ai-policy", "biosecurity", "other"];
const LEVELS = ["High", "Medium", "Low"];
const SKIP = new Set(["README.md", "TEMPLATE.md"]);

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of readdirSync(dir)) {
    const full = path.join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (e.endsWith(".md") && !SKIP.has(e)) out.push(full);
  }
  return out;
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!mm) continue;
    const raw = mm[2].trim();
    const q = raw.match(/^"([^"]*)"|^'([^']*)'/);
    fm[mm[1]] = q ? (q[1] ?? q[2]) : raw.split(/\s+#/)[0].trim();
  }
  return { fm, body: text.slice(m[0].length) };
}

const isPlaceholder = (v) => !v || /[<>]/.test(v) || /YYYY-MM-DD|exact model id|your name or handle|the question you answered/i.test(v);

// Harness artifacts and placeholder citations (#290). Agent harnesses sometimes
// leak tool-wrapper tags (XML-ish call/result envelopes) or unfilled citation
// stubs into the markdown they publish. Neither has any legitimate place in a
// finding/solution/analysis doc, so any match is a hard failure. Checked
// against the WHOLE file (frontmatter included) — leaks land anywhere.
const ARTIFACT_PATTERNS = [
  [/<\/?antml[:_][a-z]/i, "tool-wrapper artifact tag (antml:*)"],
  [/<\/?(?:function_calls?|function_results?|fnr|invoke|tool_use|tool_result|search_results?|system-reminder|automated_reminder)\b/i, "tool-wrapper artifact tag"],
  [/\[\s*(?:WebSearch|WebFetch|web search|TODO|TBD|FIXME|CITATION NEEDED)\b[^\]]*\]/i, "placeholder citation stub"],
  [/\[(?:source|citation|ref|link|url)\](?!\s*[([])/i, "bare placeholder citation stub (no href)"],
  [/\[(?:\.\.\.|…)\]/, "unfilled '[...]' placeholder"],
  [/\]\(\s*\)/, "markdown link with an EMPTY href"],
  [/\]\(\s*<?(?:url|link|href|source)>?\s*\)/i, "markdown link with a placeholder href"],
  [/\]\(\s*(?:https?:\/\/)?(?:www\.)?example\.(?:com|org|net)\b[^)]*\)/i, "markdown link pointing at example.com (placeholder)"],
];

function checkArtifacts(text, errs) {
  for (const [re, why] of ARTIFACT_PATTERNS) {
    const m = text.match(re);
    if (m) errs.push(`${why}: '${m[0].slice(0, 60)}' — harness/placeholder output must not be published (see #290)`);
  }
}
// Numbered headings (e.g. "## 5. Confidence & limits") are common in analysis/ docs —
// allow an optional leading "N. " before the section name.
const hasSection = (body, name) => new RegExp(`^#{2,3}\\s*(?:\\d+\\.\\s*)?${name}`, "mi").test(body);
const hasCitation = (body) => /\[[^\]]+\]\(https?:\/\/[^)\s]+\)/.test(body);

function checkCommon(fm, errs) {
  for (const f of ["title", "issue", "author", "agent", "model", "date"]) {
    if (isPlaceholder(fm[f])) errs.push(`frontmatter '${f}' is missing or still a placeholder`);
  }
  if (!DOMAINS.includes(fm.domain)) errs.push(`frontmatter 'domain' must be one of: ${DOMAINS.join(", ")} (got '${fm.domain ?? ""}')`);
  if (fm.issue && !/#\d+/.test(fm.issue)) errs.push(`frontmatter 'issue' should reference an issue like '#12' (got '${fm.issue}')`);
  if (fm.date && !/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) errs.push(`frontmatter 'date' must be YYYY-MM-DD (got '${fm.date}')`);
  // model may be blank only when the work was unassisted (agent: none)
  if (fm.agent && fm.agent.toLowerCase() !== "none" && isPlaceholder(fm.model))
    errs.push(`frontmatter 'model' is required unless agent is 'none'`);
}

function validateFinding(file) {
  const errs = [];
  const text = readFileSync(file, "utf8");
  const parsed = parseFrontmatter(text);
  if (!parsed) return ["no YAML frontmatter (--- block) at the top of the file"];
  const { fm, body } = parsed;
  checkCommon(fm, errs);
  checkArtifacts(text, errs);
  if (!LEVELS.includes(fm.confidence)) errs.push(`frontmatter 'confidence' must be High/Medium/Low (got '${fm.confidence ?? ""}')`);
  const folder = path.basename(path.dirname(file));
  if (DOMAINS.includes(folder) && fm.domain && fm.domain !== folder)
    errs.push(`'domain: ${fm.domain}' does not match its folder 'research/findings/${folder}/'`);
  if (!hasSection(body, "Executive answer")) errs.push("missing '## Executive answer' section");
  if (!hasSection(body, "What would change this conclusion")) errs.push("missing '## What would change this conclusion' section");
  if (!hasSection(body, "Sources")) errs.push("missing '## Sources' section");
  if (!hasCitation(body)) errs.push("no citations found — every finding needs at least one inline source link");
  return errs;
}

function validateSolution(file) {
  const errs = [];
  const text = readFileSync(file, "utf8");
  const parsed = parseFrontmatter(text);
  if (!parsed) return ["no YAML frontmatter (--- block) at the top of the file"];
  const { fm } = parsed;
  checkCommon(fm, errs);
  checkArtifacts(text, errs);
  if (!LEVELS.includes(fm.feasibility)) errs.push(`frontmatter 'feasibility' must be High/Medium/Low (got '${fm.feasibility ?? ""}')`);
  if (isPlaceholder(fm.based_on) || fm.based_on === "[]") errs.push("frontmatter 'based_on' must link the finding(s) this builds on");
  return errs;
}

// analysis/ docs (ADR-0004): project-level analysis, distinct from research
// findings/solutions. No `domain` or `confidence` frontmatter (those are
// finding-specific) — instead: title, type: analysis, status, author, agent,
// model, date; at least one inline citation; and a "Confidence & limits"
// section (numbered headings like "## 5. Confidence & limits" are allowed).
function validateAnalysis(file) {
  const errs = [];
  const text = readFileSync(file, "utf8");
  const parsed = parseFrontmatter(text);
  if (!parsed) return ["no YAML frontmatter (--- block) at the top of the file"];
  const { fm, body } = parsed;
  checkArtifacts(text, errs);
  for (const f of ["title", "author", "agent", "date"]) {
    if (isPlaceholder(fm[f])) errs.push(`frontmatter '${f}' is missing or still a placeholder`);
  }
  if (fm.type !== "analysis") errs.push(`frontmatter 'type' must be 'analysis' (got '${fm.type ?? ""}')`);
  if (isPlaceholder(fm.status)) errs.push("frontmatter 'status' is missing or still a placeholder");
  if (fm.date && !/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) errs.push(`frontmatter 'date' must be YYYY-MM-DD (got '${fm.date}')`);
  if (fm.agent && fm.agent.toLowerCase() !== "none" && isPlaceholder(fm.model))
    errs.push(`frontmatter 'model' is required unless agent is 'none'`);
  if (!hasSection(body, "Confidence\\s*&\\s*limits")) errs.push("missing '## Confidence & limits' section (required by ADR-0004)");
  if (!hasCitation(body)) errs.push("no citations found — analysis docs need at least one inline source link for factual claims (ADR-0004)");
  return errs;
}

const findings = walk(path.join(ROOT, "research", "findings"));
const solutions = walk(path.join(ROOT, "solutions"));
const analyses = walk(path.join(ROOT, "analysis"));
let failed = 0, checked = 0;
for (const [files, fn, kind] of [[findings, validateFinding, "finding"], [solutions, validateSolution, "solution"], [analyses, validateAnalysis, "analysis"]]) {
  for (const file of files) {
    checked++;
    const rel = path.relative(ROOT, file);
    const errs = fn(file);
    if (errs.length) { failed++; console.log(`\n✗ ${rel}`); for (const e of errs) console.log(`    - ${e}`); }
  }
}
if (checked === 0) { console.log("No findings, solutions, or analysis docs to validate."); process.exit(0); }
if (failed) { console.log(`\n${failed}/${checked} file(s) failed validation. Fix the items above.`); process.exit(1); }
console.log(`✓ All ${checked} finding/solution/analysis file(s) valid.`);
