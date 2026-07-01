import { Trophy, BookOpen, GitPullRequest, CircleDot, GitCommit, Users, ScanEye, FlaskConical } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { relativeTime } from "@/lib/format";
import type { Contributor } from "@/lib/types";

const MEDAL = ["#D4AF37", "#A8A29E", "#B45309"];

function roles(c: Contributor): { label: string; color: string }[] {
  const out: { label: string; color: string }[] = [];
  if (c.researchScore > 0) out.push({ label: "Researcher", color: "#0EA5E9" });
  if (c.reviewsGiven > 0) out.push({ label: "Reviewer", color: "#1D76DB" });
  if (out.length === 0) out.push({ label: "Contributor", color: "#8B5CF6" });
  return out;
}

function lastActive(iso: string | null): string {
  if (!iso) return "—";
  const rel = relativeTime(iso);
  return rel || "—";
}

export default function Leaderboard() {
  const { data, error, loading } = useSnapshot();
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const board = [...data.leaderboard].filter((c) => c.score > 0).sort((a, b) => b.score - a.score);

  return (
    <div>
      <PageHeader title="Contributors">
        Everyone moving the queue forward, ranked by points. Two ways to climb: <strong>research</strong> the problems, or <strong>review</strong> others' work — reviewing is how the queue stays honest.
      </PageHeader>

      {board.length === 0 ? (
        <EmptyState icon={Users} title="No contributors yet">Be the first — claim an issue on the board and open a PR.</EmptyState>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {board.map((c, i) => {
                const medal = i < 3 ? MEDAL[i] : null;
                return (
                  <li key={c.login}>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-4 transition-colors hover:bg-secondary/50 sm:gap-4 sm:px-5"
                    >
                      {/* Rank */}
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums"
                        style={medal ? { backgroundColor: medal, color: "#fff" } : { color: "hsl(var(--muted-foreground))" }}
                      >
                        {i + 1}
                      </div>

                      <PersonAvatar login={c.login} avatar={c.avatar} size={40} />

                      {/* Name + roles + last active */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">@{c.login}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {roles(c).map((r) => (
                            <span
                              key={r.label}
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                              style={{ backgroundColor: `${r.color}1A`, color: r.color }}
                            >
                              {r.label}
                            </span>
                          ))}
                          <span className="text-xs text-muted-foreground">· active {lastActive(c.lastActivity)}</span>
                        </div>
                      </div>

                      {/* Stats — hidden on the smallest screens */}
                      <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
                        {c.findingsAuthored > 0 ? <span className="inline-flex items-center gap-1" title="Findings authored"><BookOpen className="h-3.5 w-3.5" />{c.findingsAuthored}</span> : null}
                        {c.reviewsGiven > 0 ? <span className="inline-flex items-center gap-1" title="Reviews given"><ScanEye className="h-3.5 w-3.5" />{c.reviewsGiven}</span> : null}
                        {c.prsMerged > 0 ? <span className="inline-flex items-center gap-1" title="PRs merged"><GitPullRequest className="h-3.5 w-3.5" />{c.prsMerged}</span> : null}
                        {c.issuesAssigned > 0 ? <span className="inline-flex items-center gap-1" title="Issues claimed"><CircleDot className="h-3.5 w-3.5" />{c.issuesAssigned}</span> : null}
                      </div>

                      {/* Points */}
                      <div className="shrink-0 text-right">
                        <div className="text-xl font-bold tabular-nums brand-gradient-text sm:text-2xl">{c.score}</div>
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">pts</div>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Trophy className="h-3.5 w-3.5" /> Points: findings <BookOpen className="h-3.5 w-3.5" />×5 · PRs merged <GitPullRequest className="h-3.5 w-3.5" />×3 · issues claimed <CircleDot className="h-3.5 w-3.5" />×2 · reviews given <ScanEye className="h-3.5 w-3.5" />×4 · commits <GitCommit className="h-3.5 w-3.5" />
        <span className="inline-flex items-center gap-1"><FlaskConical className="h-3.5 w-3.5" /> research + review combined.</span>
      </p>
    </div>
  );
}
