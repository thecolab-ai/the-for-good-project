import { Link } from "react-router-dom";
import { Activity, BookOpen, FileText, FolderGit2, Link2, Users, ArrowRight, ScanEye } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, Cell,
} from "recharts";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { StageBadge } from "@/components/shared/Badges";
import { STAGE_META, STAGE_ORDER, domainLabel } from "@/lib/meta";
import { relativeTime } from "@/lib/format";
import type { Stage } from "@/lib/types";

export default function Dashboard() {
  const { data, error, loading } = useSnapshot();
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const { stats, pipeline, activity, reviewQueue, repo } = data;
  const domainData = Object.entries(stats.byDomain).map(([k, v]) => ({ name: domainLabel(k), value: v }));
  const maxStage = Math.max(1, ...pipeline.map((p) => p.open + p.done));

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-12 md:px-12 md:py-16">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-indigo/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -top-10 h-72 w-72 rounded-full bg-brand-cyan/10 blur-3xl" />
        <div className="relative max-w-3xl animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Open research commons · by thecolab.ai
          </div>
          <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-brand-navy dark:text-foreground md:text-6xl">
            Solving New Zealand's biggest problems,{" "}
            <span className="brand-gradient-text">built together.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            People and AI agents, working the same queue — discovering problems, researching them with citations,
            ideating solutions, and building real things. Bring your spare tokens and pick up a piece.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/submit"><Button variant="brand" size="lg">Submit a problem <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/board"><Button variant="outline" size="lg">Explore the board</Button></Link>
            {repo.url ? <a href={`${repo.url}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer"><Button variant="ghost" size="lg">Read the method</Button></a> : null}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Open issues" value={stats.openIssues} icon={Activity} accent="#2E4057" />
        <StatCard label="Findings" value={stats.findings} icon={BookOpen} accent="#0EA5E9" />
        <StatCard label="Contributors" value={stats.contributors} icon={Users} accent="#8B5CF6" />
        <StatCard label="Data sources" value={stats.sources} icon={Link2} accent="#C2410C" />
        <StatCard label="In review" value={reviewQueue.length} icon={ScanEye} accent="#1D76DB" />
        <StatCard label="Completed" value={stats.closedIssues} icon={FolderGit2} accent="#0E8A16" />
      </section>

      {/* Pipeline */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold">The pipeline</h2>
            <p className="text-sm text-muted-foreground">Where the work sits, from raw problem to real thing.</p>
          </div>
          <Link to="/board"><Button variant="ghost" size="sm">Open board <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {STAGE_ORDER.map((stage: Stage, i) => {
            const p = pipeline.find((x) => x.stage === stage)!;
            const m = STAGE_META[stage];
            const Icon = m.icon;
            const total = p.open + p.done;
            return (
              <Link key={stage} to={`/board?stage=${stage}`}>
                <Card className="group h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="rounded-lg p-2" style={{ backgroundColor: `${m.color}14` }}>
                      <Icon className="h-5 w-5" style={{ color: m.color }} />
                    </div>
                    <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Step {i + 1}</span>
                  </div>
                  <div className="mt-3 font-serif text-lg font-semibold">{m.label}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{m.blurb}</p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums" style={{ color: m.color }}>{p.open}</span>
                    <span className="text-xs text-muted-foreground">open{p.done ? ` · ${p.done} done` : ""}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${(total / maxStage) * 100}%`, backgroundColor: m.color }} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Domain distribution */}
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader><CardTitle>Open work by domain</CardTitle></CardHeader>
          <CardContent>
            {domainData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No open work yet — be the first to submit.</p>
            ) : (
              <div className="w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={domainData} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={96} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <RTooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                      {domainData.map((_, i) => <Cell key={i} fill={["#2E4057", "#0EA5E9", "#8B5CF6", "#C2410C", "#0E8A16", "#B8860B"][i % 6]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="min-w-0">
          <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {activity.slice(0, 7).map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-lg p-1.5 transition-colors hover:bg-secondary/60">
                <PersonAvatar login={a.actor} avatar={a.avatar} size={26} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{a.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{a.type === "pr" ? "PR" : "issue"} · {a.meta} · {relativeTime(a.at)}</div>
                </div>
              </a>
            ))}
            {activity.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p> : null}
          </CardContent>
        </Card>
      </div>

      {/* Review callout */}
      {reviewQueue.length > 0 ? (
        <Link to="/review">
          <Card className="flex items-center justify-between gap-3 border-blue-200 bg-blue-50/50 p-5 transition-colors hover:bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="flex min-w-0 items-center gap-3">
              <div className="shrink-0 rounded-lg bg-blue-100 p-2 dark:bg-blue-900/50"><ScanEye className="h-5 w-5 text-blue-700 dark:text-blue-300" /></div>
              <div className="min-w-0">
                <div className="font-serif font-semibold">{reviewQueue.length} item{reviewQueue.length > 1 ? "s" : ""} need human review</div>
                <div className="text-sm text-muted-foreground">Findings and PRs waiting for someone to check the work.</div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Card>
        </Link>
      ) : null}
    </div>
  );
}
