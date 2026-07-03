import { ScanEye, GitPullRequest, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StageBadge, DomainBadge } from "@/components/shared/Badges";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { CONFIDENCE_COLOR } from "@/lib/meta";
import { relativeTime } from "@/lib/format";

export default function Review() {
  const { data, error, loading } = useSnapshot();
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const queue = data.reviewQueue;
  const lowConfidence = data.findings.filter((f) => f.confidence === "Low" || f.sources.length < 2);

  return (
    <div>
      <PageHeader title="Human review needed">
        The method is "cite and be honest," and every finding gets checked adversarially before it's trusted. Here's what's waiting for a human to look at.
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><div className="text-3xl font-bold tabular-nums text-blue-700">{queue.length}</div><div className="text-sm text-muted-foreground">Awaiting review</div></Card>
        <Card className="p-5"><div className="text-3xl font-bold tabular-nums text-brand-orange">{lowConfidence.length}</div><div className="text-sm text-muted-foreground">Low-confidence findings</div></Card>
        <Card className="p-5"><div className="text-3xl font-bold tabular-nums text-emerald-700">{data.stats.mergedPRs}</div><div className="text-sm text-muted-foreground">Reviewed &amp; merged</div></Card>
      </div>

      <h2 className="mb-3 flex items-center gap-2 font-serif text-xl font-semibold"><ScanEye className="h-5 w-5" /> In the review queue</h2>
      {queue.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Nothing waiting">No submitted work waiting to be checked right now. New submissions show up here for a human to check.</EmptyState>
      ) : (
        <div className="space-y-3">
          {queue.map((i) => (
            <Card key={`${i.isPR}-${i.number}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">#{i.number}</span>
                  {i.isPR ? <span className="inline-flex items-center gap-1 text-violet-600"><GitPullRequest className="h-3.5 w-3.5" /> submitted work</span> : <StageBadge stage={i.stage} />}
                  <DomainBadge domain={i.domain} />
                  <span className="ml-auto">{relativeTime(i.updatedAt)}</span>
                </div>
                <div className="mt-1 font-medium">{i.title}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  {i.author ? <PersonAvatar login={i.author.login} avatar={i.author.avatar} size={20} /> : null}
                  {i.isPR ? "Needs an adversarial review before it can merge." : "Work submitted — needs a human to verify the claims."}
                </div>
              </div>
              <a href={i.url} target="_blank" rel="noreferrer"><Button variant="outline" size="sm">Review <ExternalLink className="h-3.5 w-3.5" /></Button></a>
            </Card>
          ))}
        </div>
      )}

      {lowConfidence.length > 0 ? (
        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-xl font-semibold"><AlertCircle className="h-5 w-5 text-brand-orange" /> Findings worth a second look</h2>
          <p className="mb-3 text-sm text-muted-foreground">Published but flagged Low confidence or thin on sources — good candidates for verification.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {lowConfidence.map((f) => (
              <a key={f.path} href={f.url} target="_blank" rel="noreferrer">
                <Card className="h-full p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <DomainBadge domain={f.domain} />
                    <span className="text-xs font-medium" style={{ color: CONFIDENCE_COLOR[f.confidence] }}>{f.confidence} · {f.sources.length} src</span>
                  </div>
                  <div className="mt-2 font-medium leading-snug">{f.title}</div>
                </Card>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
