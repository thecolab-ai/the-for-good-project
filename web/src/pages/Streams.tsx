import { GitBranch, FileText, Users, GitMerge, ExternalLink, Network } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Markdown } from "@/components/shared/Markdown";
import { ChainTree } from "@/components/shared/ChainTree";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { DomainBadge } from "@/components/shared/Badges";
import { buildStreamChains, chainSize, chainMergedPrCount, collectActors } from "@/lib/lineage";
import type { StreamDoc } from "@/lib/types";

const alwaysMatches = () => true;

function statePill(state: string) {
  const s = state.toLowerCase();
  const color =
    s.includes("ship") ? "#0E8A16" :
    s.includes("build") ? "#C2410C" :
    s.includes("ideat") ? "#0EA5E9" :
    s.includes("synth") || s.includes("direction") ? "#8250DF" :
    s.includes("research") ? "#2E4057" : "#8B5CF6";
  return { backgroundColor: `${color}1A`, color };
}

export default function Streams() {
  const { data, error, loading } = useSnapshot();
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const groups = buildStreamChains(data.issues);
  const docByStream = new Map<number, StreamDoc>((data.streamDocs ?? []).map((d) => [d.stream, d]));

  return (
    <div>
      <PageHeader title="Streams">
        Every stream, start to finish. A problem enters as one Discover issue, fans out into researchable questions, and each is answered, reviewed and merged — the full lineage and audit trail of who did what, like a DAG. When a stream drains, a human synthesises it into the plain-language overview shown here.
      </PageHeader>

      {groups.length === 0 ? (
        <EmptyState icon={Network} title="No streams yet">Submit a problem to start the first one.</EmptyState>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            const root = group.roots[0];
            const doc = docByStream.get(group.stream);
            const issueCount = group.roots.reduce((t, r) => t + chainSize(r), 0);
            const mergedCount = group.roots.reduce((t, r) => t + chainMergedPrCount(r), 0);
            const actors = group.roots.flatMap((r) => collectActors(r))
              .filter((a, i, arr) => arr.findIndex((x) => x.login === a.login) === i);
            const title = doc?.title || root?.issue.title.replace(/^\[[^\]]+\]\s*/, "") || `Stream #${group.stream}`;
            const state = doc?.state || root?.issue.status || "";

            return (
              <section key={group.stream}>
                {/* Stream header */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">Stream #{group.stream}</span>
                  <h2 className="font-serif text-xl font-bold text-brand-navy dark:text-foreground">{title}</h2>
                  {state ? (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize" style={statePill(state)}>{state}</span>
                  ) : null}
                  {root ? <DomainBadge domain={root.issue.domain} /> : null}
                </div>

                {/* Stats + contributors */}
                <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" /> {issueCount} issue{issueCount === 1 ? "" : "s"}</span>
                  <span className="inline-flex items-center gap-1"><GitMerge className="h-3.5 w-3.5" /> {mergedCount} merged</span>
                  {actors.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span className="flex -space-x-2">
                        {actors.slice(0, 8).map((a) => <PersonAvatar key={a.login} login={a.login} avatar={a.avatar} size={22} />)}
                      </span>
                      {actors.length > 8 ? <span>+{actors.length - 8}</span> : null}
                    </span>
                  ) : null}
                  {doc ? (
                    <a href={doc.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-cyan-dark hover:underline">Overview source <ExternalLink className="h-3 w-3" /></a>
                  ) : null}
                </div>

                {/* The output: plain-language overview (if the stream has been synthesised) */}
                {doc?.body?.trim() ? (
                  <Card className="mb-3 border-l-2 border-l-brand-cyan p-5">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" /> Stream overview
                    </div>
                    <Markdown>{doc.body}</Markdown>
                  </Card>
                ) : (
                  <p className="mb-3 text-sm text-muted-foreground">No synthesised overview yet — this stream is still being researched. The lineage below is the live audit trail.</p>
                )}

                {/* The DAG: full lineage fan-out */}
                <div className="space-y-3">
                  {group.roots.map((r) => <ChainTree key={r.issue.number} root={r} matches={alwaysMatches} />)}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
