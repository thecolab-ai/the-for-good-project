import { FileText, GitBranch, Layers, Combine, Lightbulb, Hammer, ChevronRight, ChevronDown, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

type Phase = {
  n: string;
  title: string;
  icon: typeof FileText;
  color: string;
  body: string;
  human?: boolean;
};

const PHASES: Phase[] = [
  { n: "1", title: "A real problem", icon: FileText, color: "#8B5CF6", body: "Someone files one genuine NZ problem as an issue." },
  { n: "2", title: "Becomes a stream", icon: GitBranch, color: "#2E4057", body: "The problem opens a “stream” — a whole thread of work that gets broken down into researchable questions." },
  { n: "3", title: "Synthesise", icon: Combine, color: "#0EA5E9", body: "Once the research is in, it’s rolled up into one plain-English overview of what we now know.", human: true },
  { n: "4", title: "Ideate", icon: Lightbulb, color: "#B8860B", body: "Humans decide: go deeper, change direction, or turn the findings into feasible solutions.", human: true },
  { n: "5", title: "Build", icon: Hammer, color: "#C2410C", body: "The chosen solution gets built — a real tool, guide, or brief people can use.", human: true },
];

export function SystemDiagram() {
  return (
    <div>
      {/* The linear flow */}
      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-stretch">
        {PHASES.map((p, i) => (
          <div key={p.n} className="flex flex-col items-stretch gap-3 lg:flex-1 lg:flex-row">
            <Card className="relative flex-1 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${p.color}18` }}>
                  <p.icon className="h-4 w-4" style={{ color: p.color }} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Step {p.n}</span>
                {p.human ? (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                    <UserCheck className="h-3 w-3" /> human
                  </span>
                ) : null}
              </div>
              <div className="mt-2 font-serif text-base font-semibold">{p.title}</div>
              <p className="mt-1 text-xs text-muted-foreground">{p.body}</p>
            </Card>
            {i < PHASES.length - 1 ? (
              <div className="flex items-center justify-center text-muted-foreground/50">
                <ChevronRight className="hidden h-5 w-5 lg:block" />
                <ChevronDown className="h-5 w-5 lg:hidden" />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* The "broken down, then broken down again" detail under the stream */}
      <Card className="mt-5 border-dashed p-5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-brand-navy dark:text-foreground" />
          <span className="font-serif text-sm font-semibold">Inside a stream: broken down, then broken down again</span>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand-navy px-2.5 py-1 text-xs font-semibold text-white">The problem</span>
          </div>
          <div className="ml-3 border-l border-border pl-4">
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs">Research question A</span>
              <span className="rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs">Research question B</span>
              <span className="rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs">Research question C</span>
            </div>
            <div className="ml-3 border-l border-dashed border-border pl-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">sub-question B1</span>
                <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">sub-question B2</span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          A big question can be split into chunky pieces — up to two levels deep, then it stops. Every piece is researched to the same standard (cited, independently checked) before it feeds the synthesis.
        </p>
      </Card>

      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600"><UserCheck className="h-3 w-3" /> human</span>
        = a person must decide before the work moves on. AI does the volume; people decide what matters.
      </p>
    </div>
  );
}
