import { Sparkles, ArrowUpRight } from "lucide-react";

// Canonical public site (matches useSeo) so the AI gets a real, shareable link.
const SITE = "https://thecolab-ai.github.io/the-for-good-project";

type Kind = "stream" | "finding";

// Build a self-contained prompt: project context + our research method + the
// specific item and a link, so a non-technical volunteer can do real, cited
// research in a plain ChatGPT/Claude chat and paste it back — no GitHub needed.
function buildPrompt(kind: Kind, title: string, summary: string, url: string): string {
  const intro =
    "You're helping with The For Good Project — an open, community-run research commons where people and AI agents tackle New Zealand's civic and social problems together. Every claim must be backed by a real, current source, and a human reviews everything before it counts.";

  const context = summary ? `\n\nContext: ${summary}` : "";

  const task =
    kind === "finding"
      ? `I'm reviewing this published research finding: "${title}".${context}\n\nRead the full finding here: ${url}\n\nHelp me pressure-test and extend it: verify the key claims against current sources, and flag anything missing, out of date, or arguable.`
      : `I'm looking at an open research stream the community is working on: "${title}".${context}\n\nSee the stream here: ${url}\n\nHelp me move it forward: gather current, cited New Zealand evidence and lay out what's known, what's contested, and what's still unanswered.`;

  const method =
    "Method (please follow it): prefer official New Zealand sources (government, Stats NZ, councils, established NGOs, peer-reviewed work); back any surprising claim with two independent sources; never invent a source, statistic or organisation; mark confidence honestly; and say plainly what you could not verify.";

  const format = [
    "Give your answer in Markdown, using EXACTLY these sections and nothing before or after them:",
    "",
    "## Summary",
    "2–3 plain-English sentences a busy person can grasp.",
    "",
    "## Key facts",
    "A bulleted list. Number your sources: the first source you cite is [1], the second [2], and so on. Every bullet MUST end with a confidence tag in brackets — (High), (Medium) or (Low) — and cite its source using a numbered marker that links to the matching entry in the Sources list below, written as [[1]](https://full-url) (a bracketed number that is itself the Markdown hyperlink). Reuse the same number whenever you cite the same source again.",
    "",
    "## Contested or unverified",
    "Anything you could not confirm, disagreements between sources, and claims that still need a second independent source. Use the same numbered [[n]](url) citation markers here too.",
    "",
    "## Sources",
    "A numbered reference list in APA style — the numbers MUST match the [n] markers used above — each ending with a working URL. Example:",
    "1. Radio New Zealand. (2026, March 11). *Article title* [News article]. RNZ. https://www.rnz.co.nz/…",
    "",
    "## Next steps for you",
    `Finish with this block, written TO me (the contributor). Tell me to copy the whole brief above and share it back to The For Good Project so a human reviewer can weigh in — either by pasting it into the For Good WhatsApp group, or as a comment on this page: ${url} — and suggest 1–3 concrete next things worth researching.`,
    "",
    "Important: do NOT end with a follow-up question or an offer to keep chatting. End with the \"Next steps for you\" block so I know exactly what to do next.",
  ].join("\n");

  return `${intro}\n\n${task}\n\n${method}\n\n${format}`;
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
