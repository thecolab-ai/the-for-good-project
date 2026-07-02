import { Bot, GitPullRequest, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { initials, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActiveActor, FeedComment } from "@/lib/types";

// An actor is "active now" if we last saw them within this window.
const ACTIVE_WINDOW_MS = 30 * 60 * 1000;

function isRecent(iso: string) {
  return Date.now() - new Date(iso).getTime() < ACTIVE_WINDOW_MS;
}

/** Overlapping avatars of who's been active recently; agents get a bot glyph
 *  and a coloured ring, fresh activity gets a pulsing dot. */
export function ActiveStrip({ actors }: { actors: ActiveActor[] }) {
  if (!actors.length) return null;
  const liveCount = actors.filter((a) => isRecent(a.at)).length;
  const agentLive = actors.filter((a) => a.isAgent && isRecent(a.at)).length;

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {actors.slice(0, 8).map((a) => {
          const live = isRecent(a.at);
          return (
            <Tooltip key={a.login}>
              <TooltipTrigger asChild>
                <a href={`https://github.com/${a.login}`} target="_blank" rel="noreferrer" className="relative inline-block">
                  <Avatar
                    style={{ height: 30, width: 30 }}
                    className={cn(
                      "border-2 border-background ring-2",
                      a.isAgent ? "ring-brand-cyan" : live ? "ring-emerald-400" : "ring-transparent",
                    )}
                  >
                    {a.avatar ? <AvatarImage src={a.avatar} alt={a.login} /> : null}
                    <AvatarFallback>{initials(a.login)}</AvatarFallback>
                  </Avatar>
                  {a.isAgent ? (
                    <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-brand-cyan p-0.5 text-white ring-2 ring-background">
                      <Bot className="h-2.5 w-2.5" />
                    </span>
                  ) : live ? (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                    </span>
                  ) : null}
                </a>
              </TooltipTrigger>
              <TooltipContent>
                @{a.login}{a.isAgent ? " · agent" : ""} · {relativeTime(a.at)}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <div className="text-xs text-muted-foreground">
        {liveCount > 0 ? (
          <span className="font-medium text-foreground">{liveCount} active now</span>
        ) : (
          <span>{actors.length} recently active</span>
        )}
        {agentLive > 0 ? <span className="text-brand-cyan"> · {agentLive} agent{agentLive > 1 ? "s" : ""} working</span> : null}
      </div>
    </div>
  );
}

/** Newest-first stream of comments across every issue and PR. */
export function CommentFeed({
  comments,
  limit,
  compact = false,
}: {
  comments: FeedComment[];
  limit?: number;
  compact?: boolean;
}) {
  const items = limit ? comments.slice(0, limit) : comments;
  if (!items.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No comments yet — the conversation starts here.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((c) => (
        // Keyed by comment identity so React animates genuinely new entries in
        // on each poll rather than reusing a positional node.
        <li key={`${c.url}-${c.createdAt}`} className="animate-fade-in">
          <a
            href={c.url}
            target="_blank"
            rel="noreferrer"
            className="flex gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-secondary/50"
          >
            <div className="relative shrink-0">
              <Avatar style={{ height: 32, width: 32 }} className={cn("border border-border", c.isAgent && "ring-2 ring-brand-cyan/60")}>
                {c.avatar ? <AvatarImage src={c.avatar} alt={c.author} /> : null}
                <AvatarFallback>{initials(c.author)}</AvatarFallback>
              </Avatar>
              {c.isAgent ? (
                <span className="absolute -bottom-1 -right-1 rounded-full bg-brand-cyan p-0.5 text-white ring-2 ring-background">
                  <Bot className="h-2.5 w-2.5" />
                </span>
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{c.author}</span>
                {c.isAgent ? <span className="rounded bg-brand-cyan/10 px-1 font-medium text-brand-cyan">agent</span> : null}
                <span>· {relativeTime(c.createdAt)}</span>
              </div>
              {!compact ? <p className="mt-0.5 line-clamp-2 text-sm text-foreground/90">{c.body || <span className="italic text-muted-foreground">(no text)</span>}</p> : null}
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {c.isPR ? <GitPullRequest className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                <span className="truncate">
                  {c.isPR ? "PR" : "issue"} #{c.issueNumber} · {c.issueTitle}
                </span>
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
