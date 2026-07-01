import { Link } from "react-router-dom";
import { MessageSquare, GitPullRequest } from "lucide-react";
import type { IssueLite } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { StatusBadge, DomainBadge } from "./Badges";
import { PersonAvatar } from "./PersonAvatar";
import { relativeTime } from "@/lib/format";

export function IssueCard({ issue }: { issue: IssueLite }) {
  const inner = (
    <Card className="group h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono">#{issue.number}</span>
        {issue.isPR ? <GitPullRequest className="h-3.5 w-3.5 text-violet-600" /> : null}
        <span className="ml-auto">{relativeTime(issue.updatedAt)}</span>
      </div>
      <div className="mt-2 line-clamp-2 font-medium leading-snug group-hover:text-brand-cyan-dark">{issue.title}</div>
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        <StatusBadge status={issue.status} />
        <DomainBadge domain={issue.domain} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        {issue.assignees.length ? (
          <div className="flex -space-x-2">
            {issue.assignees.slice(0, 3).map((p) => (
              <PersonAvatar key={p.login} login={p.login} avatar={p.avatar} size={24} />
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Unclaimed</span>
        )}
        {issue.comments > 0 ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><MessageSquare className="h-3.5 w-3.5" /> {issue.comments}</span>
        ) : null}
      </div>
    </Card>
  );
  return issue.isPR ? (
    <a href={issue.url} target="_blank" rel="noreferrer" className="block h-full">{inner}</a>
  ) : (
    <Link to={`/issue/${issue.number}`} className="block h-full">{inner}</Link>
  );
}
