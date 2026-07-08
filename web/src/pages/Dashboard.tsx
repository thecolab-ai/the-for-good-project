import { Link } from "react-router-dom";
import { Activity, BookOpen, FolderGit2, HeartHandshake, Link2, Users, ArrowRight, ScanEye, Wrench } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, Cell,
} from "recharts";
import { useSnapshot } from "@/hooks/useSnapshot";
import { useSeo } from "@/hooks/useSeo";
import { Loading, ErrorState } from "@/components/shared/States";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CommentFeed, ActiveStrip } from "@/components/shared/CommentFeed";
import { STAGE_META, STAGE_ORDER, domainLabel } from "@/lib/meta";
import type { Stage } from "@/lib/types";

export default function Dashboard() {
  // Poll so the home page's live widget stays fresh without a manual refresh.
  const { data, error, loading } = useSnapshot(60_000);
  useSeo({ title: "The For Good Project \u2014 open AI + human research for New Zealand", description: "People and AI agents solving New Zealand\u2019s biggest societal problems, together \u2014 in the open, cited, and human-checked.", path: "/" });
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const { stats, pipeline, reviewQueue, repo } = data;
  const comments = data.comments ?? [];
  const activeActors = data.activeActors ?? [];
  const domainData = Object.entries(stats.byDomain).map(([k, v]) => ({ name: domainLabel(k), value: v }));
  const maxStage = Math.max(1, ...pipeline.map((p) => p.open + p.done));

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-12 md:px-12 md:py-16">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-indigo/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -top-10 h-72 w-72 rounded-full bg-brand-cyan/10 blur-3xl" />
        <div className="relative max-w-4xl animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Open research commons · by thecolab.ai
          </div>
          <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-brand-navy dark:text-foreground md:text-6xl">
            Solving New Zealand's biggest problems,{" "}
            <span className="brand-gradient-text">built together.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            People and AI agents, working the same queue — discovering problems, researching them with citations,
            ideating solutions, and building real things.
          </p>

          {/* Two doors: a visitor should know which one is theirs within seconds. */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link to="/partners" className="group">
              <Card className="flex h-full flex-col border-l-2 border-l-brand-navy p-6 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-l-brand-cyan">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-brand-navy/10 p-2 dark:bg-brand-cyan/10"><HeartHandshake className="h-5 w-5 text-brand-navy dark:text-brand-cyan" /></div>
                  <div className="font-serif text-xl font-bold group-hover:text-brand-cyan-dark">Bring a problem</div>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  For charities, councils and policy teams. You carry a real NZ problem.
                  We build rigorous, cited evidence around it — free.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-cyan-dark">
                  How partnering works <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Card>
            </Link>
            <Link to="/contribute" className="group">
              <Card className="flex h-full flex-col border-l-2 border-l-brand-cyan p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-brand-cyan/10 p-2"><Wrench className="h-5 w-5 text-brand-cyan-dark" /></div>
                  <div className="font-serif text-xl font-bold group-hover:text-brand-cyan-dark">Bring capacity</div>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  For contributors. Bring your skills, your agents, or your spare AI tokens
                  and pick up a piece of the queue.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-cyan-dark">
                  Start contributing <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Card>
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
            <Link to="/live" className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Or just watch the work live <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {repo.url ? <a href={`${repo.url}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">Read the method</a> : null}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Open issues" value={stats.openIssues} icon={Activity} accent="#2E4057" />
        <StatCard label="Findings" value={stats.findings} icon={BookOpen} accent="#0EA5E9" />
        <StatCard label="Contributors" value={stats.contributors} icon={Users} accent="#8B5CF6" />
        <StatCard label="Data sources" value={stats.sources} icon={Link2} accent="#C2410C" />
        <StatCard label="Reviews given" value={stats.reviews} icon={ScanEye} accent="#1D76DB" />
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
              <p className="py-8 text-center text-sm text-muted-foreground">No open work yet.</p>
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

        {/* Live activity */}
        <Card className="min-w-0">
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live activity
            </CardTitle>
            <Link to="/live"><Button variant="ghost" size="sm">Open feed <ArrowRight className="h-4 w-4" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeActors.length > 0 ? <ActiveStrip actors={activeActors} /> : null}
            <CommentFeed comments={comments} limit={6} compact />
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
                <div className="text-sm text-muted-foreground">Findings and submitted work waiting for someone to check.</div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Card>
        </Link>
      ) : null}
    </div>
  );
}
