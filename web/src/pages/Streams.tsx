import { Fragment, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GitBranch, GitMerge, FileText, Network, Search, Cpu, ArrowRight, Loader2, CheckCircle2, LayoutGrid, Rows3, Users, ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight, ListTree } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { DomainBadge, StageBadge, StatusBadge } from "@/components/shared/Badges";
import { StreamProgress } from "@/components/shared/StreamProgress";
import { streamStateStyle, harnessLabel, isStreamShipped, streamStageIndex, subtasksByStream } from "@/lib/streams";
import { relativeTime, cleanTitle } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StreamSummary, IssueLite } from "@/lib/types";

type Filter = "all" | "progress" | "shipped";
type View = "cards" | "table";
type SortKey = "stream" | "state" | "issues" | "findings" | "merged" | "updated";
const VIEW_KEY = "fgp-streams-view";

// Sort accessors — static, so keep them out of render.
const RANK: Record<SortKey, (s: StreamSummary) => number | string> = {
  stream: (s) => s.stream,
  state: (s) => streamStageIndex(s.state),
  issues: (s) => s.issues,
  findings: (s) => s.findings,
  merged: (s) => s.mergedPRs,
  updated: (s) => s.updated || "",
};

// localStorage can throw (private mode / blocked storage) — never let the
// view preference crash or interrupt the page.
const readView = (): View => { try { return (localStorage.getItem(VIEW_KEY) as View) || "table"; } catch { return "table"; } };
const writeView = (v: View) => { try { localStorage.setItem(VIEW_KEY, v); } catch { /* ignore */ } };

function StatePill({ state }: { state: string }) {
  if (!state) return null;
  return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize" style={{ backgroundColor: streamStateStyle(state).bg, color: streamStateStyle(state).color }}>{state}</span>;
}

function PeopleStrip({ people, steward, size = 22, max = 5 }: { people: StreamSummary["people"]; steward?: string; size?: number; max?: number }) {
  if (people.length === 0) return <span className="text-[11px] text-muted-foreground">—</span>;
  // Steward first, then ring their avatar so the person steering the stream stands out.
  const s = steward?.replace(/^@/, "");
  const ordered = s ? [...people.filter((p) => p.login === s), ...people.filter((p) => p.login !== s)] : people;
  return (
    <div className="flex -space-x-2">
      {ordered.slice(0, max).map((p) => <PersonAvatar key={p.login} login={p.login} avatar={p.avatar} size={size} className={cn(p.login === s && "rounded-full ring-2 ring-brand-cyan ring-offset-1 ring-offset-background")} />)}
      {ordered.length > max ? <span className="flex items-center pl-3 text-[11px] text-muted-foreground" style={{ height: size }}>+{ordered.length - max}</span> : null}
    </div>
  );
}

// A single subtask (child issue) with its live status. `linkable` renders the
// title as a link — only safe where the row itself isn't already an anchor
// (the table), not inside the card, which is wrapped in a <Link>.
function SubtaskRow({ it, linkable }: { it: IssueLite; linkable?: boolean }) {
  const closed = it.state === "closed";
  const title = (
    <>
      <span className="mr-1.5 font-mono text-[11px] text-muted-foreground">#{it.number}</span>
      <span className={cn(closed && "text-muted-foreground line-through decoration-border")}>{cleanTitle(it.title)}</span>
    </>
  );
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <StageBadge stage={it.stage} className="shrink-0" />
      {linkable
        ? <Link to={`/issue/${it.number}`} onClick={(e) => e.stopPropagation()} className="min-w-0 flex-1 basis-40 text-sm hover:text-brand-cyan-dark">{title}</Link>
        : <span className="min-w-0 flex-1 basis-40 text-sm">{title}</span>}
      {closed
        ? <span className="inline-flex shrink-0 items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> done</span>
        : <StatusBadge status={it.status} className="shrink-0" />}
    </div>
  );
}

function SubtaskList({ items, linkable, max }: { items: IssueLite[]; linkable?: boolean; max?: number }) {
  const shown = max ? items.slice(0, max) : items;
  return (
    <div className="space-y-1.5">
      {shown.map((it) => <SubtaskRow key={it.number} it={it} linkable={linkable} />)}
      {max && items.length > max ? <div className="pt-0.5 text-[11px] font-medium text-brand-cyan-dark">+{items.length - max} more subtask{items.length - max === 1 ? "" : "s"}</div> : null}
    </div>
  );
}

function StreamCard({ s, subtasks }: { s: StreamSummary; subtasks: IssueLite[] }) {
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

        {subtasks.length > 0 ? (
          <div className="mt-3 border-t border-border/60 pt-3">
            <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><ListTree className="h-3 w-3" /> Subtasks ({subtasks.length})</div>
            <SubtaskList items={subtasks} max={3} />
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          {s.people.length > 0 ? <PeopleStrip people={s.people} steward={s.steward} /> : <span className="text-[11px] text-muted-foreground">No contributors yet</span>}
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">{s.updated ? relativeTime(s.updated) : ""} <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" /></span>
        </div>
      </Card>
    </Link>
  );
}

function CardGrid({ streams, subtasksMap }: { streams: StreamSummary[]; subtasksMap: Map<number, IssueLite[]> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {streams.map((s) => <StreamCard key={s.stream} s={s} subtasks={subtasksMap.get(s.stream) ?? []} />)}
    </div>
  );
}

function SortHead({ label, sortKey, active, dir, onSort, className, numeric }: { label: string; sortKey: SortKey; active: boolean; dir: "asc" | "desc"; onSort: (k: SortKey) => void; className?: string; numeric?: boolean }) {
  return (
    <TableHead className={className}>
      <button type="button" onClick={() => onSort(sortKey)} className={cn("inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground", numeric && "flex-row-reverse", active && "text-foreground")}>
        {label}
        {active ? (dir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />) : <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />}
      </button>
    </TableHead>
  );
}

const COLSPAN = 10;

function StreamTable({ streams, subtasksMap, sort, onSort }: { streams: StreamSummary[]; subtasksMap: Map<number, IssueLite[]>; sort: { key: SortKey; dir: "asc" | "desc" }; onSort: (k: SortKey) => void }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggle = (n: number) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(n)) next.delete(n); else next.add(n);
    return next;
  });
  const active = (k: SortKey) => sort.key === k;
  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-8" />
            <SortHead label="#" sortKey="stream" active={active("stream")} dir={sort.dir} onSort={onSort} className="w-14" />
            <TableHead>Stream</TableHead>
            <SortHead label="State" sortKey="state" active={active("state")} dir={sort.dir} onSort={onSort} />
            <TableHead>Domain</TableHead>
            <SortHead label="Issues" sortKey="issues" active={active("issues")} dir={sort.dir} onSort={onSort} numeric className="text-right" />
            <SortHead label="Findings" sortKey="findings" active={active("findings")} dir={sort.dir} onSort={onSort} numeric className="text-right" />
            <SortHead label="Merged" sortKey="merged" active={active("merged")} dir={sort.dir} onSort={onSort} numeric className="text-right" />
            <TableHead>Team</TableHead>
            <SortHead label="Updated" sortKey="updated" active={active("updated")} dir={sort.dir} onSort={onSort} className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {streams.map((s) => {
            const subtasks = subtasksMap.get(s.stream) ?? [];
            const isOpen = expanded.has(s.stream);
            return (
              <Fragment key={s.stream}>
                <TableRow
                  className="cursor-pointer border-b-0"
                  onClick={() => navigate(`/streams/${s.stream}`)}
                  tabIndex={0}
                  // Only the row itself navigates on Enter — not inner controls
                  // (the expand button, the title link) that bubble keydown up.
                  onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) navigate(`/streams/${s.stream}`); }}
                >
                  <TableCell className="pr-0">
                    {subtasks.length > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggle(s.stream); }}
                        aria-expanded={isOpen}
                        aria-label={`${isOpen ? "Hide" : "Show"} ${subtasks.length} subtasks`}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
                      </button>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.stream}</TableCell>
                  <TableCell className="min-w-[240px] max-w-[380px]">
                    <Link to={`/streams/${s.stream}`} onClick={(e) => e.stopPropagation()} className="line-clamp-1 font-medium hover:text-brand-cyan-dark">{s.title}</Link>
                    <div className="mt-1.5 w-40"><StreamProgress state={s.state} compact /></div>
                  </TableCell>
                  <TableCell><StatePill state={s.state} /></TableCell>
                  <TableCell><DomainBadge domain={s.domain || null} /></TableCell>
                  <TableCell className="text-right tabular-nums" title="open / total"><span className="text-foreground">{s.openIssues}</span><span className="text-muted-foreground">/{s.issues}</span></TableCell>
                  <TableCell className="text-right tabular-nums">{s.findings}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.mergedPRs}</TableCell>
                  {/* Avatars are external profile links; stop clicks bubbling to the row's navigate. */}
                  <TableCell><span className="inline-flex" onClick={(e) => e.stopPropagation()}><PeopleStrip people={s.people} steward={s.steward} size={20} max={4} /></span></TableCell>
                  <TableCell className="whitespace-nowrap text-right text-xs text-muted-foreground">{s.updated ? relativeTime(s.updated) : "—"}</TableCell>
                </TableRow>
                {isOpen ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell />
                    <TableCell colSpan={COLSPAN - 1} className="pt-0">
                      <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><ListTree className="h-3 w-3" /> Subtasks ({subtasks.length})</div>
                      <SubtaskList items={subtasks} linkable />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </Card>
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

function Segmented({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex items-center gap-1 rounded-lg bg-secondary p-1">{children}</div>;
}

function SegButton({ active, onClick, title, children }: { active: boolean; onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={title} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
      {children}
    </button>
  );
}

export default function Streams() {
  const { data, error, loading } = useSnapshot();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>(readView);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "updated", dir: "desc" });
  const streams = useMemo(() => data?.streamsSummary ?? [], [data]);
  const subtasksMap = useMemo(() => subtasksByStream(data?.issues ?? []), [data]);

  const setViewPersist = (v: View) => { setView(v); writeView(v); };
  const onSort = (k: SortKey) => setSort((prev) => prev.key === k ? { key: k, dir: prev.dir === "asc" ? "desc" : "asc" } : { key: k, dir: k === "updated" ? "desc" : "asc" });

  // Cross-stream rollup for the header stats.
  const totals = useMemo(() => {
    const people = new Set<string>();
    let findings = 0, merged = 0, inProgress = 0, shipped = 0;
    for (const s of streams) {
      findings += s.findings; merged += s.mergedPRs;
      if (isStreamShipped(s.state)) shipped++; else inProgress++;
      for (const p of s.people) people.add(p.login);
    }
    return { count: streams.length, inProgress, shipped, findings, merged, people: people.size };
  }, [streams]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const matchesText = (s: StreamSummary) => !q || s.title.toLowerCase().includes(q.toLowerCase()) || String(s.stream).includes(q);
  const inProgress = streams.filter((s) => !isStreamShipped(s.state) && matchesText(s));
  const shipped = streams.filter((s) => isStreamShipped(s.state) && matchesText(s));

  const sortStreams = (list: StreamSummary[]) => [...list].sort((a, b) => {
    const av = RANK[sort.key](a), bv = RANK[sort.key](b);
    const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return sort.dir === "asc" ? cmp : -cmp;
  });

  // Table view respects the filter but renders a single sorted list.
  const tableRows = sortStreams(filter === "shipped" ? shipped : filter === "progress" ? inProgress : [...inProgress, ...shipped]);
  const showProgress = filter !== "shipped" && inProgress.length > 0;
  const showShipped = filter !== "progress" && shipped.length > 0;
  const nothing = view === "table" ? tableRows.length === 0 : (!showProgress && !showShipped);

  return (
    <div>
      <PageHeader title="Streams">
        Every problem we're working, start to finish. Each stream begins as one Discover issue and fans out into researched, reviewed, merged work. Open one to see the original problem, the research behind it, the synthesised answer, and the models, harnesses and people involved.
      </PageHeader>

      {streams.length === 0 ? (
        <EmptyState icon={Network} title="No streams yet">Submit a problem to start the first one.</EmptyState>
      ) : (
        <>
          {/* Stats */}
          <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Streams" value={totals.count} icon={Network} accent="#2E4057" />
            <StatCard label="In progress" value={totals.inProgress} icon={Loader2} accent="#0EA5E9" />
            <StatCard label="Shipped" value={totals.shipped} icon={CheckCircle2} accent="#0E8A16" />
            <StatCard label="Findings" value={totals.findings} icon={FileText} accent="#8B5CF6" />
            <StatCard label="Merged outputs" value={totals.merged} icon={GitMerge} accent="#C2410C" />
            <StatCard label="Contributors" value={totals.people} icon={Users} accent="#1D76DB" />
          </section>

          {/* Controls */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[180px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search streams…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Segmented>
              <SegButton active={filter === "all"} onClick={() => setFilter("all")}>All <span className="tabular-nums opacity-60">{inProgress.length + shipped.length}</span></SegButton>
              <SegButton active={filter === "progress"} onClick={() => setFilter("progress")}><Loader2 className="h-3.5 w-3.5" /> In progress <span className="tabular-nums opacity-60">{inProgress.length}</span></SegButton>
              <SegButton active={filter === "shipped"} onClick={() => setFilter("shipped")}><CheckCircle2 className="h-3.5 w-3.5" /> Shipped <span className="tabular-nums opacity-60">{shipped.length}</span></SegButton>
            </Segmented>
            <Segmented>
              <SegButton active={view === "cards"} onClick={() => setViewPersist("cards")} title="Card grid"><LayoutGrid className="h-4 w-4" /> Cards</SegButton>
              <SegButton active={view === "table"} onClick={() => setViewPersist("table")} title="Table view"><Rows3 className="h-4 w-4" /> Table</SegButton>
            </Segmented>
          </div>

          {nothing ? (
            <EmptyState icon={Network} title="Nothing matches">Clear the search or filter to see all streams.</EmptyState>
          ) : view === "table" ? (
            <StreamTable streams={tableRows} subtasksMap={subtasksMap} sort={sort} onSort={onSort} />
          ) : (
            <div className="space-y-10">
              {showProgress ? (
                <section>
                  <SectionHeader icon={Loader2} label="In progress" count={inProgress.length} tint="#2E4057" />
                  <CardGrid streams={inProgress} subtasksMap={subtasksMap} />
                </section>
              ) : null}
              {showShipped ? (
                <section>
                  <SectionHeader icon={CheckCircle2} label="Shipped" count={shipped.length} tint="#0E8A16" />
                  <CardGrid streams={shipped} subtasksMap={subtasksMap} />
                </section>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
