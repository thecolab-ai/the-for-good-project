import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GitBranch, GitMerge, FileText, Network, Search, Cpu, ArrowRight } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { DomainBadge } from "@/components/shared/Badges";
import { streamStateStyle, harnessLabel } from "@/lib/streams";
import { relativeTime } from "@/lib/format";
import type { StreamSummary } from "@/lib/types";

function StatePill({ state }: { state: string }) {
  if (!state) return null;
  return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize" style={{ backgroundColor: streamStateStyle(state).bg, color: streamStateStyle(state).color }}>{state}</span>;
}

function StreamCard({ s }: { s: StreamSummary }) {
  const harnesses = Object.keys(s.agents || {});
  const models = Object.keys(s.models || {});
  return (
    <Link to={`/streams/${s.stream}`}>
      <Card className="group flex h-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">#{s.stream}</span>
          <StatePill state={s.state} />
          <DomainBadge domain={s.domain || null} />
          {s.hasOverview ? <FileText className="ml-auto h-3.5 w-3.5 text-brand-cyan-dark" aria-label="Has overview" /> : null}
        </div>
        <div className="mt-2 line-clamp-2 font-serif text-base font-semibold leading-snug group-hover:text-brand-cyan-dark">{s.title}</div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" /> {s.issues}</span>
          <span className="inline-flex items-center gap-1"><GitMerge className="h-3.5 w-3.5" /> {s.mergedPRs}</span>
          <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {s.findings}</span>
        </div>

        {(harnesses.length > 0 || models.length > 0) ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {harnesses.map((h) => <span key={h} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{harnessLabel(h)}</span>)}
            {models.length > 0 ? <span className="inline-flex items-center gap-1 rounded-full bg-brand-indigo/10 px-2 py-0.5 text-[10px] font-medium text-brand-indigo"><Cpu className="h-3 w-3" />{models.length} model{models.length === 1 ? "" : "s"}</span> : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          {s.people.length > 0 ? (
            <div className="flex -space-x-2">
              {s.people.slice(0, 5).map((p) => <PersonAvatar key={p.login} login={p.login} avatar={p.avatar} size={22} />)}
              {s.people.length > 5 ? <span className="flex h-[22px] items-center pl-3 text-[11px] text-muted-foreground">+{s.people.length - 5}</span> : null}
            </div>
          ) : <span className="text-[11px] text-muted-foreground">No contributors yet</span>}
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">{s.updated ? relativeTime(s.updated) : ""} <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" /></span>
        </div>
      </Card>
    </Link>
  );
}

export default function Streams() {
  const { data, error, loading } = useSnapshot();
  const [q, setQ] = useState("");
  const [state, setState] = useState("all");
  const streams = useMemo(() => data?.streamsSummary ?? [], [data]);
  const states = useMemo(() => [...new Set(streams.map((s) => s.state).filter(Boolean))], [streams]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const filtered = streams.filter((s) => {
    if (state !== "all" && s.state !== state) return false;
    if (q && !s.title.toLowerCase().includes(q.toLowerCase()) && !String(s.stream).includes(q)) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="Streams">
        Every problem we're working, start to finish. Each stream begins as one Discover issue and fans out into researched, reviewed, merged work. Open one to see its overview, full lineage DAG, and the models, harnesses and people behind it.
      </PageHeader>

      {streams.length === 0 ? (
        <EmptyState icon={Network} title="No streams yet">Submit a problem to start the first one.</EmptyState>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search streams…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                {states.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{filtered.length} stream{filtered.length === 1 ? "" : "s"}</span>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Network} title="Nothing matches">Clear the filter to see all streams.</EmptyState>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((s) => <StreamCard key={s.stream} s={s} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
