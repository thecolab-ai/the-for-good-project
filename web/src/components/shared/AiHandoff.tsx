import { Sparkles, ArrowUpRight } from "lucide-react";

// Canonical public site (matches useSeo) so the AI gets a real, shareable link.
const SITE = "https://thecolab-ai.github.io/the-for-good-project";

type Kind = "stream" | "finding";

// Build a self-contained prompt: project context + our research method + the
// specific item and a link, so a non-technical volunteer can do real, cited
// research in a plain ChatGPT/Claude chat and paste it back — no GitHub needed.
function buildPrompt(kind: Kind, title: string, summary: string, url: string): string {
  const intro =
    "You're helping with The For Good Project — an open, community-run research commons where people and AI agents tackle New Zealand's civic and social problems together. Every claim must be backed by a real, current source, and a human reviews everything before it counts.\n\n" +
    "Please follow this method: cite every claim with a link; back any surprising claim with two independent sources; prefer official New Zealand sources (government, Stats NZ, councils, established NGOs, peer-reviewed work); mark your confidence as High, Medium or Low; never invent a source, statistic or organisation; and say plainly what you could not verify and what would change your mind.";

  const context = summary ? `\n\nContext: ${summary}` : "";

  const task =
    kind === "finding"
      ? `I'm reviewing this published research finding: "${title}".${context}\n\nRead the full finding here: ${url}\n\n` +
        "Please help me pressure-test and extend it: verify the key claims against current sources, flag anything that's missing, out of date or arguable, and surface follow-up questions worth researching. Then give me a short, plain-English, fully-sourced summary I can paste back into the project for a human to weigh in on."
      : `I'm looking at this research stream — an open problem the community is working on: "${title}".${context}\n\nSee the stream here: ${url}\n\n` +
        "Please help me move it forward: identify the most important unanswered questions, gather current, cited New Zealand evidence, and draft a short, plain-English, fully-sourced summary I can paste back into the stream for a human reviewer.";

  return `${intro}\n\n${task}`;
}

export function AiHandoff({ kind, title, summary = "", path }: { kind: Kind; title: string; summary?: string; path: string }) {
  const url = `${SITE}${path}`;
  const q = encodeURIComponent(buildPrompt(kind, title, summary, url));
  const chatgpt = `https://chatgpt.com/?q=${q}`;
  const claude = `https://claude.ai/new?q=${q}`;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-brand-navy dark:text-foreground">
        <Sparkles className="h-4 w-4 text-brand-cyan-dark" /> Take this further with AI
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        No GitHub needed — opens a chat pre-loaded with the project context and our research method. Do the digging, then post what you find back to the {kind} for a human to weigh in.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <a
          href={chatgpt}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-brand-cyan/50 hover:bg-secondary/70"
        >
          Open with ChatGPT <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
        </a>
        <a
          href={claude}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-brand-orange/50 hover:bg-secondary/70"
        >
          Open with Claude <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
        </a>
      </div>
    </div>
  );
}
