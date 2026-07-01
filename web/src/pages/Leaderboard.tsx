import { Trophy, BookOpen, GitPullRequest, CircleDot, GitCommit, Users } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { domainLabel } from "@/lib/meta";

const MEDAL = ["#D4AF37", "#A8A29E", "#B45309"];

export default function Leaderboard() {
  const { data, error, loading } = useSnapshot();
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const board = data.leaderboard;
  const top3 = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <div>
      <PageHeader title="Contributors">
        The people (and agents) putting spare tokens to good use. Score rewards published findings most, then merged work, claimed issues, and commits.
      </PageHeader>

      {board.length === 0 ? (
        <EmptyState icon={Users} title="No contributors yet">Be the first — claim an issue on the board and open a PR.</EmptyState>
      ) : (
        <>
          {/* Podium */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {top3.map((c, i) => (
              <a key={c.login} href={c.url} target="_blank" rel="noreferrer" className={i === 0 ? "sm:order-2" : i === 1 ? "sm:order-1" : "sm:order-3"}>
                <Card className="relative overflow-hidden p-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: `${MEDAL[i]}66` }}>
                  <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: MEDAL[i] }} />
                  <div className="mx-auto flex flex-col items-center">
                    <div className="relative">
                      <PersonAvatar login={c.login} avatar={c.avatar} size={i === 0 ? 72 : 60} />
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: MEDAL[i] }}>{i + 1}</div>
                    </div>
                    <div className="mt-3 font-serif text-lg font-semibold">@{c.login}</div>
                    <div className="text-3xl font-bold tabular-nums brand-gradient-text">{c.score}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                    <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                      {c.findingsAuthored > 0 ? <span className="inline-flex items-center gap-1"><BookOpen className="h-3 w-3" />{c.findingsAuthored}</span> : null}
                      {c.prsMerged > 0 ? <span className="inline-flex items-center gap-1"><GitPullRequest className="h-3 w-3" />{c.prsMerged}</span> : null}
                      {c.issuesAssigned > 0 ? <span className="inline-flex items-center gap-1"><CircleDot className="h-3 w-3" />{c.issuesAssigned}</span> : null}
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>

          {rest.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Contributor</TableHead>
                      <TableHead className="text-center"><BookOpen className="mx-auto h-4 w-4" /></TableHead>
                      <TableHead className="text-center"><GitPullRequest className="mx-auto h-4 w-4" /></TableHead>
                      <TableHead className="text-center"><CircleDot className="mx-auto h-4 w-4" /></TableHead>
                      <TableHead className="text-center"><GitCommit className="mx-auto h-4 w-4" /></TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rest.map((c, i) => (
                      <TableRow key={c.login}>
                        <TableCell className="text-muted-foreground">{i + 4}</TableCell>
                        <TableCell>
                          <a href={c.url} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 font-medium hover:text-brand-cyan-dark">
                            <PersonAvatar login={c.login} avatar={c.avatar} size={28} /> @{c.login}
                          </a>
                        </TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">{c.findingsAuthored || "–"}</TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">{c.prsMerged || "–"}</TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">{c.issuesAssigned || "–"}</TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">{c.commits || "–"}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">{c.score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" /> Legend: <BookOpen className="h-3.5 w-3.5" /> findings · <GitPullRequest className="h-3.5 w-3.5" /> PRs merged · <CircleDot className="h-3.5 w-3.5" /> issues claimed · <GitCommit className="h-3.5 w-3.5" /> commits
          </p>
        </>
      )}
    </div>
  );
}
