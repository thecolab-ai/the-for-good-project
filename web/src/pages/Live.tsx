import { useMemo, useState } from "react";
import { Radio, GitPullRequest, MessageSquare } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CommentFeed, ActiveStrip } from "@/components/shared/CommentFeed";
import { relativeTime } from "@/lib/format";

// Poll for a fresh snapshot on the live page — comment-triggered rebuilds land
// within a minute or two, so this keeps the feed close to real time.
const POLL_MS = 45_000;

type Filter = "all" | "issues" | "prs";

export default function Live() {
  const { data, error, loading } = useSnapshot(POLL_MS);
  const [filter, setFilter] = useState<Filter>("all");

  const comments = useMemo(() => {
    const all = data?.comments ?? [];
    if (filter === "issues") return all.filter((c) => !c.isPR);
    if (filter === "prs") return all.filter((c) => c.isPR);
    return all;
  }, [data, filter]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const active = data.activeActors ?? [];

  return (
    <div>
      <PageHeader title="Live activity">
        The latest comments across every issue and pull request, as people and agents work the queue.
        Updates automatically.
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <ActiveStrip actors={active} />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Radio className="h-3.5 w-3.5" /> Live
          </span>
          <span>· updated {relativeTime(data.generatedAt)}</span>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {([
          { k: "all", label: "All", icon: null },
          { k: "issues", label: "Issues", icon: MessageSquare },
          { k: "prs", label: "Pull requests", icon: GitPullRequest },
        ] as const).map(({ k, label, icon: Icon }) => (
          <Button key={k} variant={filter === k ? "brand" : "outline"} size="sm" onClick={() => setFilter(k)}>
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null} {label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comment stream</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentFeed comments={comments} />
        </CardContent>
      </Card>
    </div>
  );
}
