import { useMemo, useState } from "react";
import { Link2, Search, ExternalLink, Database, Globe, Layers, FileText, LayoutGrid, Rows3, X } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DomainBadge } from "@/components/shared/Badges";
import { domainLabel } from "@/lib/meta";
import { cn } from "@/lib/utils";
import type { SourceRef } from "@/lib/types";

type View = "hosts" | "list";
const VIEW_KEY = "fgp-sources-view";
const readView = (): View => { try { return (localStorage.getItem(VIEW_KEY) as View) || "hosts"; } catch { return "hosts"; } };
const writeView = (v: View) => { try { localStorage.setItem(VIEW_KEY, v); } catch { /* ignore */ } };

const DOMAIN_TINT: Record<string, string> = {
  "child-welfare": "#DB2777",
  "grant-access": "#0E8A16",
  "civic-transparency": "#1D76DB",
  "ai-policy": "#8B5CF6",
  biosecurity: "#0EA5E9",
  other: "#78716C",
};
const domainTint = (d: string) => DOMAIN_TINT[d] || "#78716C";

function Vital({ icon: Icon, value, label, accent = "#2E4057" }: { icon: typeof Database; value: React.ReactNode; label: string; accent?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/60 px-2.5 py-1 backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">{value}</span>
      <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">{label}</span>
    </span>
  );
}

function Facet({ label, count, active, tint, favicon, onClick }: { label: string; count: number; active: boolean; tint?: string; favicon?: string; onClick: () => void }) {
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
      {favicon ? <img src={`https://icons.duckduckgo.com/ip3/${favicon}.ico`} alt="" className="h-3.5 w-3.5 shrink-0 rounded" onError={(e) => (e.currentTarget.style.visibility = "hidden")} /> : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">{count}</span>
    </button>
  );
}

function SourceLink({ s }: { s: SourceRef }) {
  return (
    <a href={s.url} target="_blank" rel="noreferrer" className="group flex items-start gap-2 rounded-lg p-1.5 text-sm transition-colors hover:bg-secondary/60">
      <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 group-hover:text-brand-cyan-dark">{s.label}</span>
        {s.findingTitle ? <span className="line-clamp-1 text-xs text-muted-foreground">cited in {s.findingTitle}</span> : null}
      </span>
      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

export default function Sources() {
  const { data, error, loading } = useSnapshot();
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("all");
  const [host, setHost] = useState("all");
  const [view, setView] = useState<View>(readView);

  const sources = useMemo(() => data?.sources ?? [], [data]);

  const domainCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of sources) m.set(s.domain, (m.get(s.domain) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [sources]);

  const hostCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of sources) m.set(s.host, (m.get(s.host) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [sources]);

  const findingsCited = useMemo(() => new Set(sources.map((s) => s.findingPath)).size, [sources]);

  const setViewPersist = (v: View) => { setView(v); writeView(v); };

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const needle = q.toLowerCase();
  const filtered = sources.filter((s) =>
    (domain === "all" || s.domain === domain) &&
    (host === "all" || s.host === host) &&
    (!q || s.host.includes(needle) || s.label.toLowerCase().includes(needle) || (s.findingTitle || "").toLowerCase().includes(needle)),
  );

  // Grouped view: filtered items regrouped by host, biggest first.
  const groups = (() => {
    const map = new Map<string, SourceRef[]>();
    for (const s of filtered) { if (!map.has(s.host)) map.set(s.host, []); map.get(s.host)!.push(s); }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  })();

  const hasFilter = domain !== "all" || host !== "all" || q !== "";
  const clearAll = () => { setDomain("all"); setHost("all"); setQ(""); };

  if (sources.length === 0) {
    return (
      <EmptyState icon={Database} title="No sources yet">
        As findings get published with citations, the sources they rely on are aggregated here — a live map of the project's evidence base.
      </EmptyState>
    );
  }

  return (
    <div className="full-bleed px-4 md:px-6">
      {/* Command bar */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-brand-cyan-dark" />
            <h1 className="font-serif text-lg font-bold">Data sources</h1>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Vital icon={Link2} value={sources.length} label="sources" accent="#0EA5E9" />
            <Vital icon={Globe} value={hostCounts.length} label="sites" accent="#2E4057" />
            <Vital icon={Layers} value={domainCounts.length} label="domains" accent="#8B5CF6" />
            <Vital icon={FileText} value={findingsCited} label="findings cited" accent="#0E8A16" />
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search sources…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 pl-9" />
            </div>
            <div className="inline-flex items-center gap-1 rounded-lg bg-secondary p-1">
              <button type="button" onClick={() => setViewPersist("hosts")} title="Grouped by site" className={cn("rounded-md p-1.5 transition-colors", view === "hosts" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}><LayoutGrid className="h-4 w-4" /></button>
              <button type="button" onClick={() => setViewPersist("list")} title="Flat list" className={cn("rounded-md p-1.5 transition-colors", view === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}><Rows3 className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Body: facet rail + results */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-[4.75rem] space-y-5">
            <div>
              <div className="hud-label mb-2">Coverage</div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                {domainCounts.map(([d, n]) => (
                  <span key={d} title={`${domainLabel(d)}: ${n}`} style={{ width: `${(n / sources.length) * 100}%`, backgroundColor: domainTint(d) }} />
                ))}
              </div>
            </div>

            <div>
              <div className="hud-label mb-1.5">Domain</div>
              <div className="space-y-0.5">
                <Facet label="All domains" count={sources.length} active={domain === "all"} onClick={() => setDomain("all")} />
                {domainCounts.map(([d, n]) => (
                  <Facet key={d} label={domainLabel(d)} count={n} tint={domainTint(d)} active={domain === d} onClick={() => setDomain(domain === d ? "all" : d)} />
                ))}
              </div>
            </div>

            <div>
              <div className="hud-label mb-1.5">Top sites</div>
              <div className="space-y-0.5">
                {hostCounts.slice(0, 12).map(([h, n]) => (
                  <Facet key={h} label={h} count={n} favicon={h} active={host === h} onClick={() => setHost(host === h ? "all" : h)} />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-2 text-sm text-muted-foreground">
            <span><span className="font-medium text-foreground">{filtered.length}</span> {filtered.length === 1 ? "source" : "sources"}{view === "hosts" ? ` · ${groups.length} ${groups.length === 1 ? "site" : "sites"}` : ""}{hasFilter ? " matched" : ""}</span>
            {hasFilter ? <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"><X className="h-3.5 w-3.5" /> Clear filters</button> : null}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="Nothing matches">Clear the search or filters to see all sources.</EmptyState>
          ) : view === "hosts" ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {groups.map(([h, items]) => (
                <Card key={h} className="flex flex-col">
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="flex min-w-0 items-center gap-2 text-base">
                      <img src={`https://icons.duckduckgo.com/ip3/${h}.ico`} alt="" className="h-4 w-4 shrink-0 rounded" onError={(e) => (e.currentTarget.style.display = "none")} />
                      <span className="truncate">{h}</span>
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0">{items.length}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {items.map((s, i) => <SourceLink key={i} s={s} />)}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="flex items-center gap-3 border-b border-border bg-secondary/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span className="hidden w-40 shrink-0 sm:block">Site</span>
                <span className="min-w-0 flex-1">Source</span>
                <span className="hidden w-32 shrink-0 md:block">Domain</span>
                <span className="hidden w-56 shrink-0 lg:block">Cited in</span>
                <span className="w-4 shrink-0" />
              </div>
              {filtered.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 border-b border-border/60 px-3 py-2 text-sm transition-colors hover:bg-secondary/50">
                  <span className="hidden w-40 shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                    <img src={`https://icons.duckduckgo.com/ip3/${s.host}.ico`} alt="" className="h-3.5 w-3.5 shrink-0 rounded" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
                    <span className="truncate">{s.host}</span>
                  </span>
                  <span className="min-w-0 flex-1 truncate group-hover:text-brand-cyan-dark">{s.label}</span>
                  <span className="hidden w-32 shrink-0 md:block"><DomainBadge domain={s.domain} /></span>
                  <span className="hidden w-56 shrink-0 truncate text-xs text-muted-foreground lg:block">{s.findingTitle}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
