import type { IssueLite, Finding } from "./types";

// issue number -> stream number, from the stream:<n> label.
export function issueStreamMap(issues: IssueLite[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const it of issues) {
    const l = it.labels.find((x) => /^stream:\d+$/i.test(x));
    if (l) m.set(it.number, Number(l.replace(/stream:/i, "")));
  }
  return m;
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

// The agent frontmatter value → a human harness label.
export function harnessLabel(agent: string): string {
  const a = (agent || "").toLowerCase();
  if (a === "claude") return "Claude Code";
  if (a === "codex") return "Codex";
  if (a === "hermes") return "Hermes";
  if (a === "human" || a === "" || a === "none") return "Human";
  return agent;
}
