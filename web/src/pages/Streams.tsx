import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GitBranch, GitMerge, FileText, Network, Search, Cpu, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { DomainBadge } from "@/components/shared/Badges";
import { StreamProgress } from "@/components/shared/StreamProgress";
import { streamStateStyle, harnessLabel, isStreamShipped } from "@/lib/streams";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StreamSummary } from "@/lib/types";

type Filter = "all" | "progress" | "shipped";

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

        <div className="mt-3">
          <StreamProgress state={s.state} compact />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1" title="Issues (open / total)"><GitBranch className="h-3.5 w-3.5" /> {s.openIssues}/{s.issues}</span>
          <span className="inline-flex items-center gap-1" title="Merged outputs"><GitMerge className="h-3.5 w-3.5" /> {s.mergedPRs}</span>
          <span className="inline-flex items-center gap-1" title="Findings"><FileText className="h-3.5 w-3.5" /> {s.findings}</span>
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

function CardGrid({ streams }: { streams: StreamSummary[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {streams.map((s) => <StreamCard key={s.stream} s={s} />)}
    </div>
  );
}

function SectionHeader({ icon: Icon, label, count, tint }: { icon: typeof Loader2; label: string; count: number; tint: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4" style={{ color: tint }} />
      <h2 className="font-serif text-lg font-semibold">{label}</h2>
      <span className="rounded-full px-2 py-0.5 text-xs font-medium tabular-nums" style={{ backgroundColor: `${tint}1A`, color: tint }}>{count}</span>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export default function Streams() {
  const { data, error, loading } = useSnapshot();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const streams = useMemo(() => data?.streamsSummary ?? [], [data]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const matchesText = (s: StreamSummary) => !q || s.title.toLowerCase().includes(q.toLowerCase()) || String(s.stream).includes(q);
  const inProgress = streams.filter((s) => !isStreamShipped(s.state) && matchesText(s));
  const shipped = streams.filter((s) => isStreamShipped(s.state) && matchesText(s));
  const showProgress = filter !== "shipped" && inProgress.length > 0;
  const showShipped = filter !== "progress" && shipped.length > 0;
  const nothing = !showProgress && !showShipped;

  return (
    <div>
      <PageHeader title="Streams">
        Every problem we're working, start to finish. Each stream begins as one Discover issue and fans out into researched, reviewed, merged work. Open one to see the original problem, the research behind it, the synthesised answer, and the models, harnesses and people involved.
      </PageHeader>

      {streams.length === 0 ? (
        <EmptyState icon={Network} title="No streams yet">Submit a problem to start the first one.</EmptyState>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[180px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search streams…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <div className="inline-flex items-center gap-1 rounded-lg bg-secondary p-1">
              <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>All <span className="tabular-nums opacity-60">{inProgress.length + shipped.length}</span></FilterButton>
              <FilterButton active={filter === "progress"} onClick={() => setFilter("progress")}><Loader2 className="h-3.5 w-3.5" /> In progress <span className="tabular-nums opacity-60">{inProgress.length}</span></FilterButton>
              <FilterButton active={filter === "shipped"} onClick={() => setFilter("shipped")}><CheckCircle2 className="h-3.5 w-3.5" /> Shipped <span className="tabular-nums opacity-60">{shipped.length}</span></FilterButton>
            </div>
          </div>

          {nothing ? (
            <EmptyState icon={Network} title="Nothing matches">Clear the search or filter to see all streams.</EmptyState>
          ) : (
            <div className="space-y-10">
              {showProgress ? (
                <section>
                  <SectionHeader icon={Loader2} label="In progress" count={inProgress.length} tint="#2E4057" />
                  <CardGrid streams={inProgress} />
                </section>
              ) : null}
              {showShipped ? (
                <section>
                  <SectionHeader icon={CheckCircle2} label="Shipped" count={shipped.length} tint="#0E8A16" />
                  <CardGrid streams={shipped} />
                </section>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
