import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Network, Users, Cpu, Wrench, ScrollText, ExternalLink, Lightbulb, ArrowRight } from "lucide-react";
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
import { findingsForStream, streamStateStyle, harnessLabel } from "@/lib/streams";
import { cleanTitle } from "@/lib/format";

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

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const summary = data.streamsSummary?.find((s) => s.stream === streamNum);
  const doc = data.streamDocs?.find((d) => d.stream === streamNum);
  const findings = findingsForStream(streamNum, data.findings, data.issues);

  if (!summary && !group && !doc) {
    return (
      <div>
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

  return (
    <div>
      <Link to="/streams" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All streams</Link>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">Stream #{streamNum}</span>
        <h1 className="font-serif text-2xl font-bold text-brand-navy dark:text-foreground md:text-3xl">{title}</h1>
        {state ? <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize" style={{ backgroundColor: streamStateStyle(state).bg, color: streamStateStyle(state).color }}>{state}</span> : null}
        <DomainBadge domain={domain} />
      </div>

      {/* Lifecycle stepper — where this stream is in its journey */}
      <Card className="mb-6 overflow-x-auto p-5">
        <StreamProgress state={state} className="min-w-[560px]" />
      </Card>

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
          <section>
            <StepHeader n={3} icon={Lightbulb} label="The synthesised stream" />
            {hasOverview ? (
              <Card className="border-l-2 border-l-brand-cyan p-6">
                <Markdown>{doc?.body ?? ""}</Markdown>
                {doc?.url ? <a href={doc.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-brand-cyan-dark hover:underline">Overview source <ExternalLink className="h-3 w-3" /></a> : null}
              </Card>
            ) : (
              <Card className="p-6 text-sm text-muted-foreground">Not synthesised yet — this stream is still gathering research. Once a human steward reviews the findings above, the plain-language answer lands here.</Card>
            )}
          </section>
        </div>

        {/* Sidebar: provenance (sticky) */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="p-5">
            <div className="mb-3 font-serif text-base font-semibold">Provenance</div>

            <div className="grid grid-cols-3 gap-2 border-b border-border pb-3 text-center">
              <div><div className="text-lg font-bold tabular-nums">{summary?.issues ?? 0}</div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">issues</div></div>
              <div><div className="text-lg font-bold tabular-nums">{summary?.mergedPRs ?? 0}</div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">merged</div></div>
              <div><div className="text-lg font-bold tabular-nums">{summary?.findings ?? findings.length}</div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">findings</div></div>
            </div>

            {steward ? (
              <div className="mt-3">
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
