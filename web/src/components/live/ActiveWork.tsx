import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { formatSince, type ActiveWorkItem } from "@/lib/live";
import { harnessColor, useIsDark } from "./harness";

const REPO_URL = "https://github.com/thecolab-ai/the-for-good-project";

/** Lease health: the claim auto-renews on heartbeats, so a shrinking TTL
 *  means the worker has gone quiet — the sweeper reaps it at zero. */
function leaseHealth(secondsLeft: number): { color: string; label: string } {
  if (secondsLeft <= 0) return { color: "bg-red-500", label: "stalled — lease expired, requeuing" };
  if (secondsLeft < 300) return { color: "bg-amber-500", label: `lease ${Math.floor(secondsLeft / 60)}m — worker quiet` };
  return { color: "bg-emerald-500", label: "lease healthy (renewing on heartbeats)" };
}

/** "Claims" feed: who is working on what via the orchestrator, since when,
 *  and whether their lease is healthy. Server-claimed work only — label-path
 *  workers appear in the fleet table via their self-reported task instead. */
export function ActiveWorkFeed({ work }: { work: ActiveWorkItem[] }) {
  const dark = useIsDark();
  if (!work.length) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
        No server-orchestrated claims right now. Rows appear the moment a worker
        claims an issue through the fleet server.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border/50">
      {work.map((w) => {
        const color = harnessColor(w.harness ?? "unknown", dark);
        const lease = leaseHealth(w.leaseSecondsLeft);
        return (
          <li key={`${w.issue}-${w.handle}-${w.claimedAt}`} className="flex items-center gap-2.5 py-2">
            <a href={`https://github.com/${w.handle}`} target="_blank" rel="noreferrer" className="shrink-0">
              <Avatar className="h-7 w-7 ring-2" style={{ ["--tw-ring-color" as string]: color }}>
                <AvatarImage src={`https://github.com/${w.handle}.png?size=56`} alt={w.handle} />
                <AvatarFallback className="text-[10px]">{initials(w.handle)}</AvatarFallback>
              </Avatar>
            </a>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="flex min-w-0 items-baseline gap-1.5 text-[13px]">
                <span className="shrink-0 font-medium">@{w.handle}</span>
                <span className="shrink-0 text-muted-foreground">·</span>
                <a
                  href={`${REPO_URL}/issues/${w.issue}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 font-mono text-foreground hover:underline"
                >
                  #{w.issue}
                </a>
                {w.title ? <span className="truncate text-foreground/60">{w.title}</span> : null}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                {w.stage ? (
                  <span className="rounded-full bg-secondary/70 px-1.5 py-px font-medium">{w.stage}</span>
                ) : null}
                {w.harness ? <span className="font-mono" style={{ color }}>{w.harness}</span> : null}
                <span>
                  working for <span className="font-mono font-semibold text-foreground">{formatSince(w.claimedAt)}</span>
                </span>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground" title={lease.label}>
              <span className={`h-2 w-2 rounded-full ${lease.color}`} />
              lease
            </span>
          </li>
        );
      })}
    </ul>
  );
}
