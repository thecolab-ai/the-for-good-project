import type { IssueLite, Finding, Stage, StreamDoc } from "./types";
import { STAGE_ORDER, statusLabel } from "./meta";
import { resolveDocHref, shortDate } from "./format";

// issue number -> stream number, from the stream:<n> label.
export function issueStreamMap(issues: IssueLite[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const it of issues) {
    const l = it.labels.find((x) => /^stream:\d+$/i.test(x));
    if (l) m.set(it.number, Number(l.replace(/stream:/i, "")));
  }
  return m;
}

const stageRank = (stage: Stage) => {
  const i = STAGE_ORDER.indexOf(stage as Exclude<Stage, "none">);
  return i === -1 ? STAGE_ORDER.length : i;
};

// stream number -> its subtask issues (the non-PR children of the Discover
// root: research / ideate / build), ordered by stage then number. Lets the
// overview surface each stream's created subtasks and their live status
// without loading the full lineage DAG.
export function subtasksByStream(issues: IssueLite[]): Map<number, IssueLite[]> {
  const m = issueStreamMap(issues);
  const out = new Map<number, IssueLite[]>();
  for (const it of issues) {
    if (it.isPR || it.stage === "discover") continue;
    const s = m.get(it.number);
    if (s == null) continue;
    const list = out.get(s) ?? [];
    list.push(it);
    out.set(s, list);
  }
  for (const list of out.values()) list.sort((a, b) => stageRank(a.stage) - stageRank(b.stage) || a.number - b.number);
  return out;
}

export function findingsForStream(stream: number, findings: Finding[], issues: IssueLite[]): Finding[] {
  const m = issueStreamMap(issues);
  return findings.filter((f) => f.issue != null && m.get(f.issue) === stream);
}

export function streamStateStyle(state: string): { bg: string; color: string } {
  const s = (state || "").toLowerCase();
  const color =
    s.includes("ship") ? "#0E8A16" :
    s.includes("build") ? "#C2410C" :
    s.includes("ideat") ? "#0EA5E9" :
    s.includes("synth") || s.includes("direction") ? "#8250DF" :
    s.includes("research") ? "#2E4057" :
    s.includes("fram") || s.includes("discover") ? "#8B5CF6" :
    "#6B7280";
  return { bg: `${color}1A`, color };
}

// The ordered lifecycle a stream moves through, framing → shipped. Mirrors the
// pipeline in docs/STREAMS.md. Used by the progress stepper on cards + detail.
export const STREAM_STAGES = ["Framing", "Research", "Synthesis", "Ideate", "Build", "Shipped"] as const;
export type StreamStage = (typeof STREAM_STAGES)[number];

// Map a stream's free-text `state` onto a stage index (0..5). Unknown → Framing.
// `state` is the stream doc's lifecycle state when a doc exists (framing →
// shipped), otherwise the originating Discover issue's status label (available /
// claimed / needs-synthesis / awaiting-direction / in-review / …, see
// build-data.mjs). Only keywords that mean the same thing in BOTH vocabularies
// are mapped forward — notably a root status of `in-review` (framing PR under
// review, per docs/STREAMS.md) is still Framing, so we do NOT match "review".
export function streamStageIndex(state: string): number {
  const s = (state || "").toLowerCase();
  if (s.includes("ship")) return 5;
  if (s.includes("build")) return 4;
  if (s.includes("ideat")) return 3;
  if (s.includes("synth") || s.includes("direction")) return 2; // (needs-)synthesis, awaiting-direction
  if (s.includes("research")) return 1; // researching (doc lifecycle state)
  return 0; // framing / discover / available / claimed / in-review / unknown
}

// A stream is "finished" only once it has shipped; everything else is in progress.
export function isStreamShipped(state: string): boolean {
  return streamStageIndex(state) === 5;
}

// The human gate (G1/G2, docs/STREAMS.md): research is synthesised and the
// stream is parked until a human steward grades the evidence and decides the
// direction. Matches both the doc lifecycle state and the root issue status
// ("awaiting-direction"). Single source of truth for the "needs a human"
// treatment on the Streams and StreamDetail pages.
export function isAwaitingDirection(state: string): boolean {
  return (state || "").toLowerCase().includes("direction");
}

// Strip editorial scaffolding from a stream overview before showing it to a
// partner: steward TODO callouts, and a "Feedback log" section whose table
// has no filled-in rows yet.
export function stripEditorialDebris(body: string): string {
  const lines = (body || "").split("\n").filter((l) => !(/^\s*>/.test(l) && l.includes("TODO(steward)")));
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    if (/^##\s+Feedback log\s*$/i.test(lines[i])) {
      let end = lines.length;
      for (let j = i + 1; j < lines.length; j++) if (/^##\s/.test(lines[j])) { end = j; break; }
      // Table rows past the header + separator; keep the section only if any
      // cell actually has content.
      const dataRows = lines.slice(i + 1, end).filter((l) => /^\s*\|/.test(l)).slice(2);
      const hasContent = dataRows.some((r) => r.split("|").some((c) => c.trim().length > 0));
      if (hasContent) out.push(...lines.slice(i, end));
      i = end;
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out.join("\n").trim();
}

// A single "## Heading" section's body (up to the next h2), or "".
function mdSection(body: string, heading: RegExp): string {
  const lines = body.split("\n");
  const start = lines.findIndex((l) => /^##\s/.test(l) && heading.test(l));
  if (start === -1) return "";
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) if (/^##\s/.test(lines[i])) { end = i; break; }
  return lines.slice(start + 1, end).join("\n").trim();
}

// A plain-text/markdown brief a partner can forward as-is: opens with "What we
// know now" (the problem paragraph + the learned-so-far bullets), a plain-words
// date + state line, and absolute source links — no badges, harness or repo
// mechanics.
export function buildStreamBrief(doc: StreamDoc): string {
  const body = stripEditorialDebris(doc.body || "");
  // Rewrite repo-relative markdown links against the doc's GitHub blob URL so
  // every link in the brief works outside the site.
  const absolute = (md: string) => md.replace(/\]\(([^()\s]+)\)/g, (_m, href: string) => `](${resolveDocHref(href, doc.url) ?? href})`);
  const problem = mdSection(body, /problem/i);
  const learned = mdSection(body, /learned/i);
  const date = shortDate(doc.updated);
  const state = statusLabel(doc.state).toLowerCase();
  const statusLine = `${date ? `Evidence gathered as of ${date}` : "Evidence gathered to date"}${state ? ` — ${state}` : ""}.`;
  const parts: string[] = [doc.title, "", "What we know now", ""];
  if (problem) parts.push(absolute(problem), "");
  if (learned) parts.push(absolute(learned), "");
  parts.push(statusLine);
  if (doc.url) parts.push("", `Full overview: ${doc.url}`);
  return parts.join("\n");
}

// The agent frontmatter value → a human harness label.
export function harnessLabel(agent: string): string {
  const a = (agent || "").toLowerCase();
  if (a === "claude") return "Claude Code";
  if (a === "codex") return "Codex";
  if (a === "hermes") return "Hermes";
  if (a === "human" || a === "" || a === "none") return "Human";
  return agent;
}
