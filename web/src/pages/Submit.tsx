import { useMemo, useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Markdown } from "@/components/shared/Markdown";
import { GitHubIcon } from "@/components/layout/Logo";
import { STAGE_META, STAGE_ORDER, DOMAIN_LABELS } from "@/lib/meta";
import type { Stage } from "@/lib/types";

const PROMPTS: Record<Exclude<Stage, "none">, { titlePrefix: string; fields: { key: string; label: string; placeholder: string; long?: boolean }[] }> = {
  discover: {
    titlePrefix: "[Discover]",
    fields: [
      { key: "problem", label: "The problem", placeholder: "What's the problem, in plain English? Who does it affect in NZ?", long: true },
      { key: "evidence", label: "Why it matters (any evidence)", placeholder: "Numbers, sources, or lived experience. Rough is fine.", long: true },
      { key: "questions", label: "Questions it raises", placeholder: "A few specific things we'd need to research.", long: true },
    ],
  },
  research: {
    titlePrefix: "[Research]",
    fields: [
      { key: "question", label: "The question", placeholder: "One specific, answerable question." },
      { key: "why", label: "Why it matters / what it informs", placeholder: "Who would use the answer, and for what?", long: true },
      { key: "leads", label: "Starting points (optional)", placeholder: "Any sources or leads to save time.", long: true },
    ],
  },
  ideate: {
    titlePrefix: "[Ideate]",
    fields: [
      { key: "idea", label: "The idea", placeholder: "What would we build or do? Be concrete.", long: true },
      { key: "findings", label: "Findings it builds on", placeholder: "Link the research this stands on.", long: true },
    ],
  },
  build: {
    titlePrefix: "[Build]",
    fields: [
      { key: "build", label: "What to build", placeholder: "The thing, and the smallest useful first version.", long: true },
      { key: "solution", label: "Solution it implements", placeholder: "Link the solution or Ideate issue." },
    ],
  },
};

export default function Submit() {
  const { data, error, loading } = useSnapshot();
  const [stage, setStage] = useState<Exclude<Stage, "none">>("discover");
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});

  const spec = PROMPTS[stage];
  const body = useMemo(() => {
    const lines: string[] = [];
    for (const f of spec.fields) {
      const v = vals[`${stage}:${f.key}`]?.trim();
      if (v) lines.push(`## ${f.label}\n\n${v}\n`);
    }
    if (domain) lines.push(`**Domain:** ${DOMAIN_LABELS[domain] || domain}`);
    lines.push(`\n---\n_Submitted via the For Good Project site._`);
    return lines.join("\n");
  }, [spec, vals, stage, domain]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const canSubmit = title.trim().length > 3;
  const fullTitle = `${spec.titlePrefix} ${title.trim()}`;
  const labels = [`stage: ${stage}`, "status: available", "needs-triage", ...(domain ? [`domain: ${domain}`] : [])];
  const url = `${data.repo.url}/issues/new?title=${encodeURIComponent(fullTitle)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent(labels.join(","))}`;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Submit to the project">
        Frame it here, then hand off to GitHub to post it (you'll need a free GitHub account). Not sure of the stage? Start with Discover.
      </PageHeader>

      {/* Stage picker */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {STAGE_ORDER.map((s) => {
          const m = STAGE_META[s];
          const Icon = m.icon;
          const active = stage === s;
          return (
            <button key={s} onClick={() => setStage(s)}
              className={`rounded-xl border p-4 text-left transition-all ${active ? "border-transparent ring-2 shadow-sm" : "border-border hover:border-foreground/20"}`}
              style={active ? { boxShadow: `0 0 0 2px ${m.color}` } : undefined}>
              <div className="rounded-lg p-1.5 w-fit" style={{ backgroundColor: `${m.color}14` }}><Icon className="h-4 w-4" style={{ color: m.color }} /></div>
              <div className="mt-2 font-serif font-semibold">{m.label}</div>
              <div className="text-xs text-muted-foreground">{m.blurb}</div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="shrink-0 rounded-md bg-muted px-2 py-2 text-sm font-mono text-muted-foreground">{spec.titlePrefix}</span>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="short, specific summary" />
            </div>
          </div>
          <div>
            <Label>Domain</Label>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose a domain (optional)" /></SelectTrigger>
              <SelectContent>
                {Object.entries(DOMAIN_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {spec.fields.map((f) => (
            <div key={f.key}>
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.long ? (
                <Textarea id={f.key} className="mt-1.5 min-h-[90px]" placeholder={f.placeholder}
                  value={vals[`${stage}:${f.key}`] || ""} onChange={(e) => setVals((v) => ({ ...v, [`${stage}:${f.key}`]: e.target.value }))} />
              ) : (
                <Input id={f.key} className="mt-1.5" placeholder={f.placeholder}
                  value={vals[`${stage}:${f.key}`] || ""} onChange={(e) => setVals((v) => ({ ...v, [`${stage}:${f.key}`]: e.target.value }))} />
              )}
            </div>
          ))}

          <a href={canSubmit ? url : undefined} target="_blank" rel="noreferrer" className={canSubmit ? "" : "pointer-events-none"}>
            <Button variant="brand" size="lg" className="w-full" disabled={!canSubmit}>
              <GitHubIcon className="h-4 w-4" /> Open on GitHub to submit <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            This opens a pre-filled GitHub issue in a new tab — nothing is posted until you press "Submit new issue" there. No backend, no tracking; the project lives entirely on GitHub.
          </p>
        </div>

        {/* Live preview */}
        <div>
          <Label className="text-muted-foreground">Preview</Label>
          <Card className="mt-1.5">
            <CardContent className="pt-6">
              <div className="mb-2 font-serif text-lg font-semibold">{title ? fullTitle : <span className="text-muted-foreground">{spec.titlePrefix} your title…</span>}</div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {labels.map((l) => <span key={l} className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-xs">{l}</span>)}
              </div>
              <Markdown>{body}</Markdown>
            </CardContent>
          </Card>
          <div className="mt-4 text-sm text-muted-foreground">
            Prefer GitHub's guided forms? {" "}
            <a href={`${data.repo.url}/issues/new/choose`} target="_blank" rel="noreferrer" className="text-brand-cyan-dark hover:underline">Use the issue templates →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
