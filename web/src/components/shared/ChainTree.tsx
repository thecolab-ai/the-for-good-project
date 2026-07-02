import { Link } from "react-router-dom";
import { CheckCircle2, GitMerge, GitPullRequest } from "lucide-react";
import type { ChainNode } from "@/lib/lineage";
import type { IssueLite } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DomainBadge, StageBadge, StatusBadge } from "./Badges";
import { PersonAvatar } from "./PersonAvatar";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

function PrChip({ pr }: { pr: IssueLite }) {
  const merged = pr.merged;
  const closed = pr.state === "closed" && !merged;
  return (
    <a
      href={pr.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
        merged
          ? "border-violet-300/50 text-violet-600 hover:bg-violet-500/10"
          : closed
            ? "border-border text-muted-foreground hover:bg-secondary"
          : "border-emerald-300/50 text-emerald-600 hover:bg-emerald-500/10",
      )}
    >
      {merged ? <GitMerge className="h-3 w-3" /> : <GitPullRequest className="h-3 w-3" />}
      PR #{pr.number}{merged ? " merged" : closed ? " closed" : " open"}
    </a>
  );
}

function NodeRow({ node, dimmed }: { node: ChainNode; dimmed: boolean }) {
  const { issue } = node;
  const closed = issue.state === "closed";

  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/60", dimmed && "opacity-50")}>
      <StageBadge stage={issue.stage} />
      <Link to={`/issue/${issue.number}`} className="min-w-0 flex-1 basis-56">
        <span className="mr-1.5 font-mono text-xs text-muted-foreground">#{issue.number}</span>
        <span className={cn("text-sm font-medium hover:text-brand-cyan-dark", closed && "text-muted-foreground line-through decoration-border")}>
          {issue.title.replace(/^\[[^\]]+\]\s*/, "")}
        </span>
      </Link>
      {node.prs.map((pr) => <PrChip key={pr.number} pr={pr} />)}
      {closed ? (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> done</span>
      ) : (
        <StatusBadge status={issue.status} />
      )}
      {issue.assignees.length > 0 ? (
        <div className="flex -space-x-2">
          {issue.assignees.slice(0, 3).map((person) => <PersonAvatar key={person.login} login={person.login} avatar={person.avatar} size={20} />)}
        </div>
      ) : null}
    </div>
  );
}

function Branches({ nodes, matches }: { nodes: ChainNode[]; matches: (issue: IssueLite) => boolean }) {
  return (
    <div className="ml-4 space-y-1 border-l border-border/80 pl-3">
      {nodes.map((node) => (
        <div key={node.issue.number}>
          <NodeRow node={node} dimmed={!matches(node.issue)} />
          {node.children.length > 0 ? <Branches nodes={node.children} matches={matches} /> : null}
        </div>
      ))}
    </div>
  );
}

export function ChainTree({ root, matches }: { root: ChainNode; matches: (issue: IssueLite) => boolean }) {
  return (
    <Card className="p-4">
      <div className="mb-1 flex items-center justify-between gap-2 px-2">
        <DomainBadge domain={root.issue.domain} />
        <span className="text-xs text-muted-foreground">updated {relativeTime(root.issue.updatedAt)}</span>
      </div>
      <NodeRow node={root} dimmed={!matches(root.issue)} />
      {root.children.length > 0 ? (
        <Branches nodes={root.children} matches={matches} />
      ) : (
        <p className="ml-4 border-l border-border/80 py-1 pl-3 text-xs text-muted-foreground">
          No linked child issues yet.
        </p>
      )}
    </Card>
  );
}
