import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, FileText, Network, Users, Cpu, Wrench, ScrollText, ExternalLink, Lightbulb, ArrowRight, UserCheck, GitBranch, GitMerge } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Markdown } from "@/components/shared/Markdown";
import { ChainTree } from "@/components/shared/ChainTree";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { DomainBadge } from "@/components/shared/Badges";
import { StreamProgress } from "@/components/shared/StreamProgress";
import { buildStreamChains, type ChainNode } from "@/lib/lineage";
import { findingsForStream, streamStateStyle, harnessLabel, isAwaitingDirection, stripEditorialDebris, buildStreamBrief } from "@/lib/streams";
import { statusLabel } from "@/lib/meta";
import { cleanTitle, publicAsset } from "@/lib/format";
import type { StreamDoc } from "@/lib/types";

const alwaysMatches = () => true;

// A short plain-language excerpt of an issue body for the "problem" card —
// drops markdown headings/links/formatting, keeps the first couple of sentences.
function excerpt(body: string, max = 320): string {
  const text = (body || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*(?:part of|stream|closes|fixes|resolves)\s*#\d+\s*$/gim, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_>`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

// Builds the forwardable plain-text brief and puts it on the clipboard —
// something a partner can paste straight into an email.
function CopyBriefButton({ doc }: { doc: StreamDoc }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildStreamBrief(doc));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable (permissions / insecure context) — nothing to do */
    }
  };
  return (
    <button type="button" onClick={onCopy} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary">
      {copied ? <><Check className="h-3.5 w-3.5 text-emerald-600" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy brief</>}
    </button>
  );
}

// A dense KPI chip for the command bar — matches Findings/Sources/Streams.
function Vital({ icon: Icon, value, label, accent = "#2E4057" }: { icon: typeof FileText; value: React.ReactNode; label: string; accent?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/60 px-2.5 py-1 backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">{value}</span>
      <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">{label}</span>
    </span>
  );
}

function StepHeader({ n, icon: Icon, label }: { n: number; icon: typeof FileText; label: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy text-[11px] font-bold text-white dark:bg-brand-cyan-dark">{n}</span>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h2 className="font-serif text-lg font-semibold">{label}</h2>
    </div>
  );
}

function Chips({ counts, tint }: { counts: Record<string, number>; tint?: boolean }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return <p className="text-xs text-muted-foreground">None recorded yet.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([k, n]) => (
        <span key={k} className={tint ? "inline-flex items-center gap-1 rounded-full bg-brand-indigo/10 px-2 py-0.5 text-[11px] font-medium text-brand-indigo" : "inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground/80"}>
          {k}{n > 1 ? <span className="opacity-60">×{n}</span> : null}
        </span>
      ))}
    </div>
  );
}

export default function StreamDetail() {
  const { stream } = useParams();
  const streamNum = Number(stream);
  const { data, error, loading } = useSnapshot();

  const group = useMemo(() => (data ? buildStreamChains(data.issues).find((g) => g.stream === streamNum) : undefined), [data, streamNum]);

  if (loading) return <div className="px-4 py-8 md:px-6"><Loading /></div>;
  if (error || !data) return <div className="px-4 py-8 md:px-6"><ErrorState message={error || "No data"} /></div>;

  const summary = data.streamsSummary?.find((s) => s.stream === streamNum);
  const doc = data.streamDocs?.find((d) => d.stream === streamNum);
  const findings = findingsForStream(streamNum, data.findings, data.issues);

  if (!summary && !group && !doc) {
    return (
      <div className="px-4 py-8 md:px-6">
        <Link to="/streams" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All streams</Link>
        <EmptyState icon={Network} title={`Stream #${streamNum} not found`}>It may not exist yet, or the data hasn't rebuilt. Head back to all streams.</EmptyState>
      </div>
    );
  }

  const roots: ChainNode[] = group?.roots ?? [];
  // The originating issue is the Discover root; a stream's number IS its Discover
  // issue number. Roots are sorted by recency, so fall back to the root matching
  // the stream number, then the lowest-numbered root — never "most recent".
  const rootIssue = (
    roots.find((r) => r.issue.stage === "discover") ??
    roots.find((r) => r.issue.number === streamNum) ??
    [...roots].sort((a, b) => a.issue.number - b.issue.number)[0]
  )?.issue;
  const rootExcerpt = rootIssue ? excerpt(rootIssue.body) : "";
  const title = doc?.title || summary?.title || (rootIssue ? cleanTitle(rootIssue.title) : "") || `Stream #${streamNum}`;
  const state = doc?.state || summary?.state || "";
  const domain = summary?.domain || doc?.domain || rootIssue?.domain || null;
  const people = summary?.people ?? [];
  const steward = doc?.steward?.replace(/^@/, "") || summary?.steward?.replace(/^@/, "") || "";
  const hasOverview = !!doc?.body?.trim();
  const image = doc?.image || summary?.image || "";

  return (
    <div className="px-4 py-8 md:px-6">
      {/* Sticky command bar — keeps title, status & key stats in view while scrolling */}
      <div className="sticky top-16 z-20 -mx-4 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <Link to="/streams" className="mb-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> All streams</Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono text-xs text-muted-foreground">#{streamNum}</span>
          <h1 className="min-w-0 flex-1 basis-full font-serif text-lg font-bold leading-tight text-brand-navy dark:text-foreground md:basis-auto md:text-xl">{title}</h1>
          {state ? <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: streamStateStyle(state).bg, color: streamStateStyle(state).color }}>{statusLabel(state)}</span> : null}
          <DomainBadge domain={domain} />
          <div className="ml-auto flex items-center gap-1.5">
            {hasOverview && doc ? <CopyBriefButton doc={doc} /> : null}
          </div>
        </div>
        {/* Vitals strip */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <Vital icon={GitBranch} value={`${summary?.openIssues ?? 0}/${summary?.issues ?? 0}`} label="issues" accent="#2E4057" />
          <Vital icon={GitMerge} value={summary?.mergedPRs ?? 0} label="accepted" accent="#C2410C" />
          <Vital icon={FileText} value={summary?.findings ?? findings.length} label="findings" accent="#8B5CF6" />
          <Vital icon={Users} value={people.length} label="people" accent="#1D76DB" />
        </div>
      </div>

      {image ? (
        <figure className="mt-5 overflow-hidden rounded-lg border border-border bg-secondary">
          <img src={publicAsset(image)} alt={`Overview illustration for ${title}`} className="aspect-[21/9] w-full object-cover" />
        </figure>
      ) : null}

      {/* Lifecycle stepper — where this stream is in its journey */}
      <Card className="mb-6 mt-5 overflow-x-auto p-5">
        <StreamProgress state={state} className="min-w-[560px]" />
      </Card>

      {/* The human gate (G1, docs/STREAMS.md): the machines are done — a
          person now grades the evidence and sets the direction. */}
      {isAwaitingDirection(state) ? (
        <Card className="mb-6 border-amber-500/40 bg-amber-500/5 p-5 ring-1 ring-amber-500/30">
          <div className="flex flex-wrap items-start gap-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
              <UserCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </span>
            <div className="min-w-0 flex-1 basis-64">
              <div className="font-serif text-base font-semibold">Waiting on a human decision</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                The research is done and synthesised below, with candidate outcomes drawn from the evidence.
                A human steward now grades the evidence, edits or rejects those options, and decides the
                direction: <span className="font-medium text-foreground">go deeper, pivot, proceed, or park</span>.
                Nothing gets built until a person makes that call.
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                {steward
                  ? <>Steward: <a href={`https://github.com/${steward}`} target="_blank" rel="noreferrer" className="font-medium text-foreground hover:text-brand-cyan-dark">@{steward}</a></>
                  : <>No steward has claimed this decision yet — it's open to any maintainer.</>}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              {hasOverview ? (
                <a href="#synthesis" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-secondary">
                  <Lightbulb className="h-3.5 w-3.5" /> Read the overview
                </a>
              ) : null}
              {rootIssue ? (
                <a href={rootIssue.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700">
                  Make the direction call <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main: the journey — problem → research → synthesis */}
        <div className="space-y-8 lg:col-span-2">
          {/* 1 — the original problem */}
          <section>
            <StepHeader n={1} icon={FileText} label="The problem" />
            {rootIssue ? (
              <Card className="border-l-2 border-l-brand-cyan p-6">
                <Link to={`/issue/${rootIssue.number}`} className="font-serif text-lg font-semibold leading-snug hover:text-brand-cyan-dark">
                  {cleanTitle(rootIssue.title)}
                </Link>
                {rootExcerpt ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rootExcerpt}</p> : null}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                  <Link to={`/issue/${rootIssue.number}`} className="inline-flex items-center gap-1 font-medium text-brand-cyan-dark hover:underline">Open the original issue <ArrowRight className="h-3 w-3" /></Link>
                  <a href={rootIssue.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">#{rootIssue.number} on GitHub <ExternalLink className="h-3 w-3" /></a>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-sm text-muted-foreground">The originating Discover issue isn't linked yet.</Card>
            )}
          </section>

          {/* 2 — the research */}
          <section>
            <StepHeader n={2} icon={ScrollText} label="The research" />
            {findings.length > 0 ? (
              <Card className="p-5">
                <div className="space-y-3">
                  {findings.map((f) => (
                    <div key={f.path} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                      <a href={f.url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-brand-cyan-dark">{f.title}</a>
                      {f.summary ? <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{f.summary}</p> : null}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px]">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">{harnessLabel(f.agent)}</span>
                        {f.model ? <span className="rounded-full bg-brand-indigo/10 px-2 py-0.5 text-brand-indigo">{f.model}</span> : null}
                        {f.author && f.author !== "unknown" ? <span className="text-muted-foreground">· @{f.author.replace(/^@/, "")}</span> : null}
                        {f.confidence ? <span className="text-muted-foreground">· {f.confidence} confidence</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-sm text-muted-foreground">No merged findings yet — the research tasks below are still in flight.</Card>
            )}

            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"><Network className="h-3.5 w-3.5" /> Research tasks &amp; full lineage</div>
              {group ? (
                <div className="space-y-3">{roots.map((r) => <ChainTree key={r.issue.number} root={r} matches={alwaysMatches} />)}</div>
              ) : <p className="text-sm text-muted-foreground">No linked issues found for this stream.</p>}
            </div>
          </section>

          {/* 3 — the synthesis */}
          <section id="synthesis" className="scroll-mt-20">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <StepHeader n={3} icon={Lightbulb} label="The synthesised stream" />
              {hasOverview && doc ? <CopyBriefButton doc={doc} /> : null}
            </div>
            {hasOverview ? (
              <Card className="border-l-2 border-l-brand-cyan p-6">
                <Markdown linkBase={doc?.url}>{stripEditorialDebris(doc?.body ?? "")}</Markdown>
                {doc?.url ? <a href={doc.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-brand-cyan-dark hover:underline">Overview source <ExternalLink className="h-3 w-3" /></a> : null}
              </Card>
            ) : (
              <Card className="p-6 text-sm text-muted-foreground">Not synthesised yet — this stream is still gathering research. Once a human steward reviews the findings above, the plain-language answer lands here.</Card>
            )}
          </section>
        </div>

        {/* Sidebar: provenance (sticky) */}
        <aside className="lg:sticky lg:top-[8rem] lg:self-start">
          <Card className="p-5">
            <div className="mb-3 font-serif text-base font-semibold">Provenance</div>

            {steward ? (
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Steward</div>
                <a href={`https://github.com/${steward}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm hover:text-brand-cyan-dark">
                  <PersonAvatar login={steward} avatar={`https://github.com/${steward}.png`} size={22} /> @{steward}
                </a>
              </div>
            ) : null}

            <div className="mt-4">
              <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><Wrench className="h-3 w-3" /> Harness</div>
              <Chips counts={Object.fromEntries(Object.entries(summary?.agents ?? {}).map(([k, v]) => [harnessLabel(k), v]))} />
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><Cpu className="h-3 w-3" /> Models</div>
              <Chips counts={summary?.models ?? {}} tint />
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><Users className="h-3 w-3" /> Contributors ({people.length})</div>
              <div className="space-y-1.5">
                {people.length === 0 ? <p className="text-xs text-muted-foreground">None yet.</p> : people.map((p) => (
                  <a key={p.login} href={p.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-brand-cyan-dark">
                    <PersonAvatar login={p.login} avatar={p.avatar} size={20} /> @{p.login}
                  </a>
                ))}
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
