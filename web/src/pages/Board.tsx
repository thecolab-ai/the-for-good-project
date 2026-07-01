import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, LayoutGrid, List, Inbox } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { IssueCard } from "@/components/shared/IssueCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAGE_META, STAGE_ORDER, STATUS_META, domainLabel } from "@/lib/meta";
import type { IssueLite, Stage } from "@/lib/types";

export default function Board() {
  const { data, error, loading } = useSnapshot();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("all");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"board" | "list">("board");
  const stageParam = params.get("stage") || "all";

  const domains = useMemo(() => {
    const s = new Set<string>();
    data?.issues.forEach((i) => i.domain && s.add(i.domain));
    return [...s];
  }, [data]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const filtered = data.issues.filter((i) => !i.isPR && i.state === "open").filter((i) => {
    if (stageParam !== "all" && i.stage !== stageParam) return false;
    if (domain !== "all" && i.domain !== domain) return false;
    if (status !== "all" && i.status !== status) return false;
    if (q && !i.title.toLowerCase().includes(q.toLowerCase()) && !String(i.number).includes(q)) return false;
    return true;
  });

  const setStage = (s: string) => {
    const next = new URLSearchParams(params);
    if (s === "all") next.delete("stage"); else next.set("stage", s);
    setParams(next, { replace: true });
  };

  return (
    <div>
      <PageHeader title="The board">Every open piece of work, moving from problem to real thing. Claim one on GitHub and push it forward.</PageHeader>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search issues…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={stageParam} onValueChange={setStage}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {STAGE_ORDER.map((s) => <SelectItem key={s} value={s}>{STAGE_META[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Domain" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All domains</SelectItem>
            {domains.map((d) => <SelectItem key={d} value={d}>{domainLabel(d)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            {Object.entries(STATUS_META).filter(([k]) => k !== "none").map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex rounded-md border border-border">
          <Button variant={view === "board" ? "secondary" : "ghost"} size="icon" onClick={() => setView("board")} aria-label="Board view"><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setView("list")} aria-label="List view"><List className="h-4 w-4" /></Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing matches">Try clearing a filter, or submit a new problem.</EmptyState>
      ) : view === "list" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => <IssueCard key={i.number} issue={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STAGE_ORDER.map((stage: Stage) => {
            const items = filtered.filter((i) => i.stage === stage);
            const m = STAGE_META[stage];
            const Icon = m.icon;
            return (
              <div key={stage} className="rounded-xl border border-border/70 bg-secondary/30 p-3">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <Icon className="h-4 w-4" style={{ color: m.color }} />
                  <span className="font-serif text-sm font-semibold">{m.label}</span>
                  <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.map((i: IssueLite) => <IssueCard key={i.number} issue={i} />)}
                  {items.length === 0 ? <p className="px-1 py-4 text-center text-xs text-muted-foreground">Empty</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
