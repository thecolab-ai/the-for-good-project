import { Bot, CheckCircle2, Eye, GitPullRequest, LogOut, Play, Search } from "lucide-react";
import { relativeTime } from "@/lib/format";
import type { EventItem } from "@/lib/live";
import { harnessColor, useIsDark } from "./harness";

/** Generic fallback so event kinds this build doesn't know yet (the server
 *  may be newer — e.g. orchestration kinds) still render safely. */
const FALLBACK_META = { icon: Play, label: "event" } as const;

const EVENT_META: Partial<Record<EventItem["kind"], { icon: typeof Play; label: string }>> = {
  agent_online: { icon: Bot, label: "online" },
  agent_offline: { icon: LogOut, label: "offline" },
  task_started: { icon: Play, label: "started" },
  pr_opened: { icon: GitPullRequest, label: "PR" },
  review_done: { icon: Search, label: "review" },
  task_done: { icon: CheckCircle2, label: "done" },
  watcher_joined: { icon: Eye, label: "watcher" },
};

/** The rolling fleet event stream: connects, task starts, PRs, reviews. */
export function LiveEventFeed({ events }: { events: EventItem[] }) {
  const dark = useIsDark();
  if (!events.length) {
    return <div className="p-6 text-center text-sm text-muted-foreground">No fleet events yet.</div>;
  }
  return (
    <ul className="divide-y divide-border">
      {events.map((e) => {
        const meta = EVENT_META[e.kind] ?? FALLBACK_META;
        const Icon = meta.icon;
        const color = e.harness ? harnessColor(e.harness, dark) : undefined;
        return (
          <li key={e.id} className="flex items-start gap-2.5 py-2.5 text-sm">
            <span
              className="mt-0.5 rounded-full p-1"
              style={color ? { backgroundColor: `${color}1a`, color } : undefined}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-foreground/90">{e.text}</span>
              <span className="text-xs text-muted-foreground">{relativeTime(e.at)}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
