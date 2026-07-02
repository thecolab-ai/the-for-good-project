import { ArrowRight, ArrowDown, ScanEye, GitMerge, Send, ShieldCheck } from "lucide-react";
import { STAGE_META, STAGE_ORDER } from "@/lib/meta";

function StageNode({ stage, index }: { stage: (typeof STAGE_ORDER)[number]; index: number }) {
  const m = STAGE_META[stage];
  const Icon = m.icon;
  return (
    <div className="flex flex-1 flex-col items-center rounded-2xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${m.color}16` }}>
        <Icon className="h-6 w-6" style={{ color: m.color }} />
      </div>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Step {index + 1}</div>
      <div className="font-serif text-base font-semibold">{m.label}</div>
      <div className="mt-1 text-xs leading-snug text-muted-foreground">{m.blurb}</div>
    </div>
  );
}

const LIFECYCLE = [
  { label: "Submitted", color: "#78716C", desc: "A problem or question enters the queue" },
  { label: "Claimed", color: "#B8860B", desc: "A person or agent picks it up" },
  { label: "In review", color: "#1D76DB", desc: "Work done, a PR is opened" },
  { label: "Merged", color: "#5319E7", desc: "Published to the commons" },
];

export function WorkflowDiagram() {
  return (
    <div className="space-y-10">
      {/* The four stages */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="font-serif text-lg font-semibold">1 · The pipeline</span>
          <span className="text-sm text-muted-foreground">— every problem flows from raw idea to real thing</span>
        </div>
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          {STAGE_ORDER.map((stage, i) => (
            <div key={stage} className="flex flex-col items-center gap-3 md:flex-1 md:flex-row">
              <StageNode stage={stage} index={i} />
              {i < STAGE_ORDER.length - 1 ? (
                <>
                  <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground md:block" />
                  <ArrowDown className="h-5 w-5 shrink-0 text-muted-foreground md:hidden" />
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* The lifecycle + review gate */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="font-serif text-lg font-semibold">2 · Every piece of work travels this path</span>
        </div>
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-stretch">
          {LIFECYCLE.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center gap-3 lg:flex-1 lg:flex-row">
              <div className="w-full flex-1 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="font-semibold">{s.label}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>
              </div>
              {i < LIFECYCLE.length - 1 ? (
                <>
                  <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground lg:block" />
                  <ArrowDown className="h-5 w-5 shrink-0 text-muted-foreground lg:hidden" />
                </>
              ) : null}
            </div>
          ))}
        </div>

        {/* Review gate callout */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-brand-cyan/50 bg-brand-cyan/5 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/15">
            <ScanEye className="h-5 w-5 text-brand-cyan-dark" />
          </div>
          <div className="text-sm">
            <div className="font-semibold">The gate between <span className="text-brand-cyan-dark">In review</span> and <span style={{ color: "#5319E7" }}>Merged</span></div>
            <p className="mt-0.5 text-muted-foreground">
              Nothing merges until it passes an <strong>adversarial review — done by someone other than the author</strong>, whose job is to
              refute the work: check every citation resolves and supports its claim, that surprises have two sources, and that confidence isn't inflated.
              Trusted reviewers (a whitelist, plus anyone who's earned enough credit) do the reviewing; maintainers run a one-command sweep to merge what's passed.
            </p>
          </div>
        </div>
      </div>

      {/* Who + what powers it */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Send, title: "People + agents", desc: "Anyone — or an AI agent they point at the repo — works the same queue, bringing their own spare tokens." },
          { icon: ShieldCheck, title: "A method, enforced", desc: "Cite everything, verify surprises, mark confidence — checked adversarially before anything is trusted." },
          { icon: GitMerge, title: "A public commons", desc: "Every cited finding merges into an open, reusable body of work anyone can build on." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-card p-4">
            <c.icon className="h-5 w-5 text-brand-indigo" />
            <div className="mt-2 font-serif font-semibold">{c.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
