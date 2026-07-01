import { useMemo, useState } from "react";
import { Link2, Search, ExternalLink, Database } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { domainLabel } from "@/lib/meta";
import type { SourceRef } from "@/lib/types";

export default function Sources() {
  const { data, error, loading } = useSnapshot();
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, { host: string; items: SourceRef[] }>();
    (data?.sources || []).forEach((s) => {
      if (!map.has(s.host)) map.set(s.host, { host: s.host, items: [] });
      map.get(s.host)!.items.push(s);
    });
    return [...map.values()].sort((a, b) => b.items.length - a.items.length);
  }, [data]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const filteredGroups = grouped
    .map((g) => ({ ...g, items: g.items.filter((s) => !q || s.host.includes(q.toLowerCase()) || s.label.toLowerCase().includes(q.toLowerCase())) }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <PageHeader title="Data sources">Every source cited across the research, grouped by where it comes from. This is the evidence base the findings stand on.</PageHeader>

      {data.sources.length === 0 ? (
        <EmptyState icon={Database} title="No sources yet">
          As findings get published with citations, the sources they rely on are aggregated here — a live map of the project's evidence base.
        </EmptyState>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-3">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search sources…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <span className="text-sm text-muted-foreground">{data.stats.sources} sources · {grouped.length} domains</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredGroups.map((g) => (
              <Card key={g.host}>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <img src={`https://icons.duckduckgo.com/ip3/${g.host}.ico`} alt="" className="h-4 w-4 rounded" onError={(e) => (e.currentTarget.style.display = "none")} />
                    {g.host}
                  </CardTitle>
                  <Badge variant="secondary">{g.items.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {g.items.slice(0, 8).map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 rounded-lg p-1.5 text-sm transition-colors hover:bg-secondary/60">
                      <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 group-hover:text-brand-cyan-dark">{s.label}</span>
                        <span className="text-xs text-muted-foreground">{domainLabel(s.domain)}</span>
                      </span>
                      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                    </a>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
