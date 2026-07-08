import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Link2, Cpu } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { useSeo } from "@/hooks/useSeo";
import { Loading, ErrorState } from "@/components/shared/States";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DomainBadge } from "@/components/shared/Badges";
import { Markdown } from "@/components/shared/Markdown";
import { CONFIDENCE_COLOR } from "@/lib/meta";

const hostOf = (u: string) => {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; }
};

export default function FindingDetail() {
  const slug = useParams()["*"];
  const { data, error, loading } = useSnapshot();
  const finding = data?.findings.find((f) => f.slug === slug);
  useSeo(
    finding
      ? { title: finding.title, description: (finding.summary || "").slice(0, 200), path: `/findings/${finding.slug}`, type: "article" }
      : { title: "Research findings", description: "Cited answers to the questions the community is working on. Every claim is sourced; confidence is marked honestly." },
  );
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  if (!finding) {
    return (
      <div className="mx-auto max-w-4xl">
        <Link to="/findings" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to findings
        </Link>
        <ErrorState message="This finding isn't in the latest snapshot. It may have been renamed or not published yet." />
      </div>
    );
  }

  const confidenceColor = CONFIDENCE_COLOR[finding.confidence] ?? CONFIDENCE_COLOR.Unknown;

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/findings" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to findings
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <DomainBadge domain={finding.domain} />
        <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: confidenceColor }}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: confidenceColor }} /> {finding.confidence} confidence
        </span>
      </div>

      <h1 className="font-serif text-3xl font-bold leading-tight text-brand-navy dark:text-foreground">{finding.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        {finding.author && finding.author !== "unknown" ? <span>by {finding.author}</span> : null}
        {finding.agent ? (
          <span className="inline-flex items-center gap-1"><Cpu className="h-3.5 w-3.5" /> {finding.agent}{finding.model ? ` · ${finding.model}` : ""}</span>
        ) : null}
        {finding.date ? <span>{finding.date}</span> : null}
        <a href={finding.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-cyan-dark hover:underline">
          View source on GitHub <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="min-w-0 md:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="min-w-0 pt-6">
              {finding.body ? <Markdown>{finding.body}</Markdown> : <p className="text-sm text-muted-foreground">No content in this finding.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
                <Link2 className="h-4 w-4" /> Sources ({finding.sources.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {finding.sources.length ? finding.sources.map((s, i) => (
                <a key={`${s.url}-${i}`} href={s.url} target="_blank" rel="noreferrer" className="block rounded-lg p-2 transition-colors hover:bg-secondary/60">
                  <div className="line-clamp-2 text-sm font-medium text-brand-cyan-dark">{s.label}</div>
                  <div className="line-clamp-1 text-xs text-muted-foreground">{hostOf(s.url)}</div>
                </a>
              )) : <p className="text-sm text-muted-foreground">No sources listed.</p>}
            </CardContent>
          </Card>

          <a href={finding.url} target="_blank" rel="noreferrer" className="block">
            <Button variant="brand" className="w-full">View source on GitHub <ExternalLink className="h-4 w-4" /></Button>
          </a>
        </div>
      </div>
    </div>
  );
}
