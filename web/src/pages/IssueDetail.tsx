import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, MessageSquare, GitBranch } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StageBadge, StatusBadge, DomainBadge } from "@/components/shared/Badges";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { Markdown } from "@/components/shared/Markdown";
import { relativeTime } from "@/lib/format";
import type { Stage } from "@/lib/types";

export default function IssueDetail() {
  const { number } = useParams();
  const { data, error, loading } = useSnapshot();
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const issue = data.issues.find((i) => String(i.number) === number);
  if (!issue) return <ErrorState message={`Issue #${number} not found in the latest snapshot.`} />;

  // linked chain: issues that reference this number, and numbers this references
  const refRe = /#(\d+)/g;
  const referenced = new Set<number>();
  let m;
  while ((m = refRe.exec(issue.body))) referenced.add(Number(m[1]));
  const related = data.issues.filter((i) => i.number !== issue.number && (referenced.has(i.number) || new RegExp(`#${issue.number}\\b`).test(i.body)));

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/board" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to board
      </Link>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StageBadge stage={issue.stage} />
        <StatusBadge status={issue.status} />
        <DomainBadge domain={issue.domain} />
        <span className="ml-auto font-mono text-sm text-muted-foreground">#{issue.number}</span>
      </div>

      <h1 className="font-serif text-3xl font-bold leading-tight text-brand-navy dark:text-foreground">{issue.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {issue.author ? <span className="flex items-center gap-1.5"><PersonAvatar login={issue.author.login} avatar={issue.author.avatar} size={22} /> opened by @{issue.author.login}</span> : null}
        <span>{issue.state === "open" ? "open" : "closed"} · updated {relativeTime(issue.updatedAt)}</span>
        <a href={issue.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-cyan-dark hover:underline">
          View on GitHub <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              {issue.body ? <Markdown>{issue.body}</Markdown> : <p className="text-sm text-muted-foreground">No description.</p>}
            </CardContent>
          </Card>

          {issue.commentsList && issue.commentsList.length > 0 ? (
            <div className="mt-6">
              <h2 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold"><MessageSquare className="h-4 w-4" /> Discussion</h2>
              <div className="space-y-4">
                {issue.commentsList.map((c, i) => (
                  <Card key={i}>
                    <CardHeader className="flex-row items-center gap-2 space-y-0 py-3">
                      <PersonAvatar login={c.author} avatar={c.avatar} size={24} />
                      <span className="text-sm font-medium">@{c.author}</span>
                      <span className="text-xs text-muted-foreground">{relativeTime(c.createdAt)}</span>
                    </CardHeader>
                    <CardContent><Markdown>{c.body}</Markdown></CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">People</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Working on it</div>
                {issue.assignees.length ? (
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {issue.assignees.map((p) => <PersonAvatar key={p.login} login={p.login} avatar={p.avatar} size={30} />)}
                  </div>
                ) : <div className="mt-1 text-sm">Unclaimed — <a href={issue.url} target="_blank" rel="noreferrer" className="text-brand-cyan-dark hover:underline">claim it</a></div>}
              </div>
            </CardContent>
          </Card>

          {related.length > 0 ? (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground"><GitBranch className="h-4 w-4" /> The chain</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {related.map((r) => (
                  <Link key={r.number} to={`/issue/${r.number}`} className="block rounded-lg p-2 text-sm transition-colors hover:bg-secondary/60">
                    <span className="font-mono text-xs text-muted-foreground">#{r.number}</span>
                    <div className="line-clamp-1 font-medium">{r.title}</div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Labels</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {/* Raw repo labels get translated for visitors: status:* is hidden
                  (the StatusBadge above already says it in plain words), stage:*
                  renders as the stage badge, stream:<n> links to the stream. */}
              {issue.labels.map((l) => {
                if (/^status:/i.test(l)) return null;
                const stage = l.match(/^stage:\s*(\S+)$/i);
                if (stage) return <StageBadge key={l} stage={stage[1].toLowerCase() as Stage} />;
                const stream = l.match(/^stream:\s*(\d+)$/i);
                if (stream) {
                  return (
                    <Link key={l} to={`/streams/${stream[1]}`} className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-xs transition-colors hover:bg-secondary hover:text-brand-cyan-dark">
                      Stream #{stream[1]}
                    </Link>
                  );
                }
                return <span key={l} className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-xs">{l}</span>;
              })}
            </CardContent>
          </Card>

          <a href={issue.url} target="_blank" rel="noreferrer" className="block">
            <Button variant="brand" className="w-full">Open on GitHub to help <ExternalLink className="h-4 w-4" /></Button>
          </a>
        </div>
      </div>
    </div>
  );
}
