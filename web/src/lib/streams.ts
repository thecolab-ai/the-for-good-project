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

// The agent frontmatter value → a human harness label.
export function harnessLabel(agent: string): string {
  const a = (agent || "").toLowerCase();
  if (a === "claude") return "Claude Code";
  if (a === "codex") return "Codex";
  if (a === "hermes") return "Hermes";
  if (a === "human" || a === "" || a === "none") return "Human";
  return agent;
}
