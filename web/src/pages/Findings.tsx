import { useMemo, useState } from "react";
import { BookOpen, ExternalLink, Link2, Search } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DomainBadge } from "@/components/shared/Badges";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CONFIDENCE_COLOR, domainLabel } from "@/lib/meta";

export default function Findings() {
  const { data, error, loading } = useSnapshot();
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("all");

  const domains = useMemo(() => [...new Set(data?.findings.map((f) => f.domain) || [])], [data]);
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const findings = data.findings.filter((f) => (domain === "all" || f.domain === domain) && (!q || f.title.toLowerCase().includes(q.toLowerCase()) || f.summary.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <PageHeader title="Research findings">Cited answers to the questions the community is working on. Every claim is sourced; confidence is marked honestly.</PageHeader>

      {data.findings.length === 0 ? (
        <EmptyState icon={BookOpen} title="No findings published yet">
          Findings land here as research issues get answered and merged. Pick a research question on the board to write the first one.
        </EmptyState>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search findings…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Domain" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All domains</SelectItem>
                {domains.map((d) => <SelectItem key={d} value={d}>{domainLabel(d)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {findings.map((f) => (
              <a key={f.path} href={f.url} target="_blank" rel="noreferrer">
                <Card className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <DomainBadge domain={f.domain} />
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: CONFIDENCE_COLOR[f.confidence] }}>
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CONFIDENCE_COLOR[f.confidence] }} /> {f.confidence} confidence
                      </span>
                    </div>
                    <div className="mt-2 font-serif text-lg font-semibold leading-snug group-hover:text-brand-cyan-dark">{f.title}</div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{f.summary}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{f.author && f.author !== "unknown" ? `by ${f.author}` : ""}{f.date ? ` · ${f.date}` : ""}</span>
                      <span className="inline-flex items-center gap-1"><Link2 className="h-3.5 w-3.5" /> {f.sources.length} source{f.sources.length === 1 ? "" : "s"} <ExternalLink className="ml-1 h-3.5 w-3.5" /></span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
