import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Link2, Search, Cpu, LayoutGrid, Rows3, Layers, ShieldCheck, ArrowUpDown, X } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DomainBadge } from "@/components/shared/Badges";
import { CONFIDENCE_COLOR, domainLabel, domainColor } from "@/lib/meta";
import { cn } from "@/lib/utils";
import type { Finding } from "@/lib/types";

type View = "grid" | "list";
type SortKey = "recent" | "sources" | "confidence";

const VIEW_KEY = "fgp-findings-view";
const readView = (): View => { try { return (localStorage.getItem(VIEW_KEY) as View) || "grid"; } catch { return "grid"; } };
const writeView = (v: View) => { try { localStorage.setItem(VIEW_KEY, v); } catch { /* ignore */ } };

const CONF_RANK: Record<string, number> = { High: 3, Medium: 2, Low: 1, Unknown: 0 };

// A compact confidence dot + label used across both views.
function Confidence({ value, showLabel = true }: { value: string; showLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: CONFIDENCE_COLOR[value] }}>
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: CONFIDENCE_COLOR[value] }} />
      {showLabel ? `${value} confidence` : null}
    </span>
  );
}

// A dense KPI chip for the command bar.
function Vital({ icon: Icon, value, label, accent = "#2E4057" }: { icon: typeof BookOpen; value: React.ReactNode; label: string; accent?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/60 px-2.5 py-1 backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">{value}</span>
      <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">{label}</span>
    </span>
  );
}

// A clickable facet row: label + count, active state, own tint dot.
function Facet({ label, count, active, tint, onClick }: { label: string; count: number; active: boolean; tint?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        active ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
      )}
    >
      {tint ? <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tint }} /> : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">{count}</span>
    </button>
  );
}

function GridCard({ f }: { f: Finding }) {
  return (
    <Link to={`/findings/${f.slug}`}>
      <Card className="group h-full transition-all hover:-translate-y-0.5 hover:border-brand-cyan/40 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <DomainBadge domain={f.domain} />
            <Confidence value={f.confidence} showLabel={false} />
          </div>
          <div className="mt-2 line-clamp-2 font-serif text-base font-semibold leading-snug group-hover:text-brand-cyan-dark">{f.title}</div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">{f.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {f.agent ? <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2 py-0.5 font-medium"><Cpu className="h-3 w-3" /> {f.agent}</span> : null}
            {f.date ? <span>{f.date}</span> : null}
            <span className="ml-auto inline-flex items-center gap-1"><Link2 className="h-3.5 w-3.5" /> {f.sources.length}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ListRow({ f }: { f: Finding }) {
  return (
    <Link
      to={`/findings/${f.slug}`}
      className="group flex items-center gap-3 border-b border-border/60 px-3 py-2.5 transition-colors hover:bg-secondary/50 sm:gap-4"
    >
      <span className="h-8 w-1 shrink-0 rounded-full" title={domainLabel(f.domain)} style={{ backgroundColor: domainColor(f.domain) }} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium leading-snug group-hover:text-brand-cyan-dark" title={f.title}>{f.title}</div>
        <div className="truncate text-xs text-muted-foreground">{f.summary}</div>
      </div>
      <div className="hidden w-32 shrink-0 md:block"><DomainBadge domain={f.domain} /></div>
      <div className="hidden w-28 shrink-0 lg:flex"><Confidence value={f.confidence} /></div>
      <div className="hidden w-24 shrink-0 items-center gap-1 text-xs text-muted-foreground xl:flex" title={f.model || f.agent}>
        {f.agent ? <><Cpu className="h-3.5 w-3.5" /> <span className="truncate">{f.agent}</span></> : null}
      </div>
      <div className="w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground"><span className="inline-flex items-center gap-1"><Link2 className="h-3.5 w-3.5" />{f.sources.length}</span></div>
      <div className="hidden w-20 shrink-0 text-right text-xs text-muted-foreground sm:block">{f.date}</div>
    </Link>
  );
}

export default function Findings() {
  const { data, error, loading } = useSnapshot();
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("all");
  const [conf, setConf] = useState("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<View>(readView);

  const all = useMemo(() => data?.findings ?? [], [data]);

  // Facet counts computed over the full set so they stay stable as you filter.
  const domainCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of all) m.set(f.domain, (m.get(f.domain) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [all]);
  const confCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of all) m.set(f.confidence, (m.get(f.confidence) || 0) + 1);
    return m;
  }, [all]);
  const totalSources = useMemo(() => all.reduce((n, f) => n + f.sources.length, 0), [all]);
  const highPct = all.length ? Math.round(((confCounts.get("High") || 0) / all.length) * 100) : 0;

  const setViewPersist = (v: View) => { setView(v); writeView(v); };

  if (loading) return <div className="px-4 py-8 md:px-6"><Loading /></div>;
  if (error || !data) return <div className="px-4 py-8 md:px-6"><ErrorState message={error || "No data"} /></div>;

  const needle = q.toLowerCase();
  const filtered = all
    .filter((f) => (domain === "all" || f.domain === domain) && (conf === "all" || f.confidence === conf) && (!q || f.title.toLowerCase().includes(needle) || f.summary.toLowerCase().includes(needle)))
    .sort((a, b) => {
      if (sort === "sources") return b.sources.length - a.sources.length;
      if (sort === "confidence") return (CONF_RANK[b.confidence] || 0) - (CONF_RANK[a.confidence] || 0);
      return (b.date || "").localeCompare(a.date || "");
    });

  const hasFilter = domain !== "all" || conf !== "all" || q !== "";
  const clearAll = () => { setDomain("all"); setConf("all"); setQ(""); };

  if (all.length === 0) {
    return (
      <div className="px-4 py-8 md:px-6">
        <EmptyState icon={BookOpen} title="No findings published yet">
          Findings land here as research issues get answered and merged. Pick a research question on the board to write the first one.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 md:px-6">
      {/* Command bar — sticky, dense, app-console feel */}
      <div className="sticky top-16 z-20 -mx-4 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-cyan-dark" />
            <h1 className="font-serif text-lg font-bold">Research findings</h1>
          </div>
          <div className="hidden flex-wrap items-center gap-1.5 md:flex">
            <Vital icon={BookOpen} value={all.length} label="findings" accent="#2E4057" />
            <Vital icon={Layers} value={domainCounts.length} label="domains" accent="#8B5CF6" />
            <Vital icon={Link2} value={totalSources} label="sources" accent="#0EA5E9" />
            <Vital icon={ShieldCheck} value={`${highPct}%`} label="high conf" accent="#0E8A16" />
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input aria-label="Search findings" placeholder="Search findings…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 pl-9" />
            </div>
            <div className="inline-flex items-center gap-1 rounded-lg bg-secondary p-1">
              {([["recent", "Recent"], ["sources", "Sources"], ["confidence", "Confidence"]] as [SortKey, string][]).map(([k, lbl]) => (
                <button key={k} type="button" onClick={() => setSort(k)} aria-pressed={sort === k} className={cn("inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors", sort === k ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  {k === "recent" ? null : <ArrowUpDown className="h-3 w-3" />}{lbl}
                </button>
              ))}
            </div>
            <div className="inline-flex items-center gap-1 rounded-lg bg-secondary p-1">
              <button type="button" onClick={() => setViewPersist("grid")} aria-label="Grid view" aria-pressed={view === "grid"} title="Grid" className={cn("rounded-md p-1.5 transition-colors", view === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}><LayoutGrid className="h-4 w-4" /></button>
              <button type="button" onClick={() => setViewPersist("list")} aria-label="List view" aria-pressed={view === "list"} title="List" className={cn("rounded-md p-1.5 transition-colors", view === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}><Rows3 className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Body: facet rail + results */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Facet rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-[8rem] space-y-5">
            {/* Domain distribution bar */}
            {domainCounts.length > 1 ? (
              <div>
                <div className="hud-label mb-2">Coverage</div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  {domainCounts.map(([d, n]) => (
                    <span key={d} title={`${domainLabel(d)}: ${n}`} style={{ width: `${(n / all.length) * 100}%`, backgroundColor: domainColor(d) }} />
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <div className="hud-label mb-1.5">Domain</div>
              <div className="space-y-0.5">
                <Facet label="All domains" count={all.length} active={domain === "all"} onClick={() => setDomain("all")} />
                {domainCounts.map(([d, n]) => (
                  <Facet key={d} label={domainLabel(d)} count={n} tint={domainColor(d)} active={domain === d} onClick={() => setDomain(domain === d ? "all" : d)} />
                ))}
              </div>
            </div>

            <div>
              <div className="hud-label mb-1.5">Confidence</div>
              <div className="space-y-0.5">
                <Facet label="Any confidence" count={all.length} active={conf === "all"} onClick={() => setConf("all")} />
                {["High", "Medium", "Low", "Unknown"].filter((c) => confCounts.get(c)).map((c) => (
                  <Facet key={c} label={c} count={confCounts.get(c) || 0} tint={CONFIDENCE_COLOR[c]} active={conf === c} onClick={() => setConf(conf === c ? "all" : c)} />
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="min-w-0">
          {/* Mobile domain filter — the facet rail is desktop-only, so surface
              domain filtering here below lg. */}
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
            <button type="button" onClick={() => setDomain("all")} aria-pressed={domain === "all"} className={cn("shrink-0 rounded-full border px-3 py-1 text-xs font-medium", domain === "all" ? "border-transparent bg-secondary text-foreground" : "border-border text-muted-foreground")}>All</button>
            {domainCounts.map(([d, n]) => (
              <button key={d} type="button" onClick={() => setDomain(domain === d ? "all" : d)} aria-pressed={domain === d} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium", domain === d ? "border-transparent bg-secondary text-foreground" : "border-border text-muted-foreground")}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: domainColor(d) }} />{domainLabel(d)} <span className="tabular-nums opacity-60">{n}</span>
              </button>
            ))}
          </div>

          <div className="mb-3 flex items-center justify-between gap-2 text-sm text-muted-foreground">
            <span><span className="font-medium text-foreground">{filtered.length}</span> {filtered.length === 1 ? "finding" : "findings"}{hasFilter ? " matched" : ""}</span>
            {hasFilter ? <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"><X className="h-3.5 w-3.5" /> Clear filters</button> : null}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="Nothing matches">Clear the search or filters to see all findings.</EmptyState>
          ) : view === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((f) => <GridCard key={f.path} f={f} />)}
            </div>
          ) : (
            <Card className="overflow-hidden p-0">
              {/* Column header for the list */}
              <div className="flex items-center gap-3 border-b border-border bg-secondary/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:gap-4">
                <span className="w-1 shrink-0" />
                <span className="min-w-0 flex-1">Finding</span>
                <span className="hidden w-32 shrink-0 md:block">Domain</span>
                <span className="hidden w-28 shrink-0 lg:block">Confidence</span>
                <span className="hidden w-24 shrink-0 xl:block">Agent</span>
                <span className="w-14 shrink-0 text-right">Src</span>
                <span className="hidden w-20 shrink-0 text-right sm:block">Date</span>
              </div>
              {filtered.map((f) => <ListRow key={f.path} f={f} />)}
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
