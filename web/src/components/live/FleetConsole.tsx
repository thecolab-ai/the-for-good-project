import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Bot, ChevronLeft, CircleDot, Cpu, Eye, FileText, GitBranch, GitPullRequest, Globe,
  Link2, MessageSquare, Moon, Pause, Play, Radio, Signal, Sun, Wifi, WifiOff, Wrench, Zap,
} from "lucide-react";
import { LogoMark, GitHubIcon } from "@/components/layout/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { CommentFeed } from "@/components/shared/CommentFeed";
import { initials, relativeTime, shortDate } from "@/lib/format";
import { isStreamShipped } from "@/lib/streams";
import { cn } from "@/lib/utils";
import {
  compactNumber, fetchAgentLogs, useLiveFleet, type AgentPresence, type LiveStatus, type LogLine,
} from "@/lib/live";
import type { Finding, Snapshot } from "@/lib/types";
import { FleetPulse } from "./FleetPulse";
import { AgentTable } from "./AgentTable";
import { LiveEventFeed } from "./LiveEventFeed";

type CommentFilter = "all" | "issues" | "prs";
type FeedTab = "comments" | "findings";

const CONFIDENCE_STYLE: Record<string, string> = {
  High: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Low: "bg-stone-500/15 text-stone-500 dark:text-stone-400",
  Unknown: "bg-stone-500/15 text-stone-500 dark:text-stone-400",
};

// ── Chrome pieces ──────────────────────────────────────────────────────────

/** The mission clock — local time, ticking every second, monospace. */
function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hidden items-center gap-1 font-mono text-xs tabular-nums text-muted-foreground lg:inline-flex">
      <span className="text-foreground">{now.toLocaleTimeString([], { hour12: false })}</span>
    </span>
  );
}

/** A single telemetry chip in the top command bar. */
function Vital({ icon: Icon, label, value, live = false, accent }:
  { icon: typeof Bot; label: string; value: React.ReactNode; live?: boolean; accent?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/50 px-2 py-1 backdrop-blur-sm sm:px-2.5">
      <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
      <span className="font-mono text-xs font-semibold tabular-nums text-foreground">{value}</span>
      <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground md:inline">{label}</span>
      {live ? (
        <span className="relative ml-0.5 hidden h-1.5 w-1.5 sm:inline-flex" style={{ color: accent }}>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      ) : null}
    </span>
  );
}

function ConnectionPill({ status }: { status: LiveStatus }) {
  const online = status === "online";
  const connecting = status === "connecting";
  const label = online
    ? "Fleet online"
    : connecting
      ? "Connecting…"
      : status === "offline"
        ? "Fleet offline"
        : "GitHub feed";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary/60 px-2 py-1 text-xs font-medium text-muted-foreground">
      {online ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      ) : (
        <span className={cn("h-2 w-2 rounded-full", connecting ? "animate-pulse bg-amber-400" : "bg-stone-400")} />
      )}
      {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

/** A section marker: glowing tick + uppercase label + optional count + right meta. */
function PanelHead({ label, count, accent = "#0EA5E9", right, icon: Icon }:
  { label: string; count?: React.ReactNode; accent?: string; right?: React.ReactNode; icon?: typeof Bot }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span
          className="h-3.5 w-1 rounded-full"
          style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}99` }}
        />
        {Icon ? <Icon className="h-3.5 w-3.5 text-muted-foreground" /> : null}
        <span className="hud-label">{label}</span>
        {count != null ? (
          <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-foreground">
            {count}
          </span>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-2 text-[11px] text-muted-foreground">{right}</div> : null}
    </div>
  );
}

/** Compact KPI tile for the left rail — dense, mono, glanceable. */
function StatTile({ label, value, hint, icon: Icon, accent = "#2E4057" }:
  { label: string; value: React.ReactNode; hint?: string; icon: typeof Bot; accent?: string }) {
  return (
    <div className="hud-panel flex min-h-[6.25rem] flex-col justify-between overflow-hidden p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="hud-label truncate">{label}</span>
        <span className="rounded-md p-1" style={{ backgroundColor: `${accent}1f` }}>
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
        </span>
      </div>
      <div className="mt-2">
        <div className="font-sans text-[1.6rem] font-bold leading-none tabular-nums" style={{ color: accent }}>
          {value}
        </div>
        {hint ? <div className="mt-1 truncate text-[11px] text-muted-foreground">{hint}</div> : null}
      </div>
    </div>
  );
}

/** A flat counter in the repo status ribbon: icon + value + label. */
function RepoStat({ icon: Icon, value, label, accent, sub, to }:
  { icon: typeof Bot; value: React.ReactNode; label: string; accent?: string; sub?: string; to?: string }) {
  const inner = (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
      <span className="font-mono text-xs font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      {sub ? <span className="hidden font-mono text-[10px] text-muted-foreground/70 lg:inline">{sub}</span> : null}
    </span>
  );
  return to ? (
    <Link to={to} className="rounded transition-colors hover:opacity-80">{inner}</Link>
  ) : inner;
}

/** Newest research findings — the repo's actual output, streaming in. */
function FindingsFeed({ findings }: { findings: Finding[] }) {
  if (!findings.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No findings published yet.</p>;
  }
  return (
    <ul className="space-y-2.5">
      {findings.map((f) => (
        <li key={f.path} className="animate-fade-in">
          <a
            href={f.url}
            target="_blank"
            rel="noreferrer"
            className="flex gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-secondary/50"
          >
            <div className="relative shrink-0">
              <Avatar style={{ height: 32, width: 32 }} className="border border-border">
                <AvatarImage src={`https://github.com/${f.author}.png?size=64`} alt={f.author} />
                <AvatarFallback>{initials(f.author)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", CONFIDENCE_STYLE[f.confidence] ?? CONFIDENCE_STYLE.Unknown)}>
                  {f.confidence}
                </span>
                <span className="truncate rounded bg-secondary px-1.5 py-0.5 text-[10px] text-foreground/70">{f.domain}</span>
                <span className="ml-auto shrink-0">{shortDate(f.date)}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground/90">{f.title}</p>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="h-3 w-3 shrink-0" />
                <span className="truncate">{f.author}{f.issue ? ` · #${f.issue}` : ""}</span>
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

// ── Worker terminal (fills the centre column when an agent is selected) ──────

function WorkerTerminal({ agent, lines, onClose }: { agent: AgentPresence; lines: LogLine[]; onClose: () => void }) {
  const s = agent.session;
  const logRef = useRef<HTMLDivElement | null>(null);
  const [followTail, setFollowTail] = useState(true);

  useEffect(() => {
    if (!followTail) return;
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [followTail, lines]);

  return (
    <div className="hud-panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 p-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Back to fleet">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="truncate font-mono text-sm font-semibold">@{agent.handle}</span>
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">live stream</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 pl-6 text-[11px] text-muted-foreground">
            <span className="font-mono">{agent.model}</span>
            <span>{compactNumber(s.toolCalls)} tools</span>
            <span>{compactNumber(s.tokensIn + s.tokensOut)} tokens</span>
            <span>updated {relativeTime(agent.lastSeen)}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => setFollowTail((v) => !v)}>
            {followTail ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {followTail ? "Pause" : "Follow"}
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            <ArrowLeft className="h-3.5 w-3.5" /> Fleet
          </Button>
        </div>
      </div>
      {Object.entries(s.tools ?? {}).length ? (
        <div className="flex flex-wrap gap-1.5 border-b border-border/50 px-3 py-2 text-[11px] text-muted-foreground">
          {Object.entries(s.tools).map(([tool, count]) => (
            <span key={tool} className="rounded-full bg-muted px-2 py-0.5 font-mono">{tool} × {count}</span>
          ))}
        </div>
      ) : null}
      <div
        ref={logRef}
        className="console-scroll min-h-0 flex-1 overflow-y-auto bg-stone-950 p-3 font-mono text-[11px] leading-relaxed text-stone-100 sm:text-xs"
        onScroll={(event) => {
          const el = event.currentTarget;
          const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
          if (followTail !== atBottom) setFollowTail(atBottom);
        }}
      >
        {lines.length ? lines.map((entry, index) => (
          <div key={`${entry.at}-${index}`} className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 border-b border-white/5 py-1 last:border-0">
            <time className="select-none whitespace-nowrap text-stone-500">{new Date(entry.at).toLocaleTimeString([], { hour12: false })}</time>
            <span className="min-w-0 whitespace-pre-wrap break-words">{entry.line}</span>
          </div>
        )) : (
          <div className="whitespace-pre-wrap break-words text-stone-400">
            No stream lines yet. Start workers with STREAM_LOGS=1 for transcript/tool output.
          </div>
        )}
      </div>
    </div>
  );
}

// ── The console ─────────────────────────────────────────────────────────────

export function FleetConsole({ snapshot }: { snapshot: Snapshot }) {
  const live = useLiveFleet();
  const { theme, toggle } = useTheme();
  const [filter, setFilter] = useState<CommentFilter>("all");
  const [feedTab, setFeedTab] = useState<FeedTab>("comments");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [loadedLogs, setLoadedLogs] = useState<Record<string, LogLine[]>>({});

  const { comments = [], generatedAt } = snapshot;
  const repoUrl = snapshot.repo.url;
  const stats = snapshot.stats;
  const streams = snapshot.streamsSummary ?? [];
  const activeStreams = streams.filter((s) => !isStreamShipped(s.state)).length;
  const recentFindings = useMemo(
    () => [...snapshot.findings].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 40),
    [snapshot.findings],
  );
  const available = stats.byStatus?.available ?? 0;
  const inReview = stats.byStatus?.["in review"] ?? stats.byStatus?.["in-review"] ?? 0;

  const selectedAgent = live.agents.find((a) => a.id === selectedAgentId) ?? null;
  useEffect(() => {
    if (!selectedAgentId) return;
    void fetchAgentLogs(selectedAgentId).then((lines) => {
      if (lines.length) setLoadedLogs((prev) => ({ ...prev, [selectedAgentId]: lines }));
    });
  }, [selectedAgentId]);
  // A selected agent that drops off the fleet shouldn't strand the terminal.
  useEffect(() => {
    if (selectedAgentId && !live.agents.some((a) => a.id === selectedAgentId)) setSelectedAgentId(null);
  }, [live.agents, selectedAgentId]);

  const totals = live.historyTotals ?? live.fleet?.totals;
  const liveTotals = live.fleet?.totals;
  const fetchTotal = (liveTotals?.fetchesOk ?? 0) + (liveTotals?.fetchesError ?? 0);
  const currentTps = live.fleet?.tps ?? 0;
  const displayTps = currentTps > 0 ? currentTps : live.fleet?.lastTps ?? 0;
  const reviewing = live.agents.filter((a) => a.task?.kind === "review").length;

  const filteredComments = useMemo(() => {
    if (filter === "issues") return comments.filter((c) => !c.isPR);
    if (filter === "prs") return comments.filter((c) => c.isPR);
    return comments;
  }, [comments, filter]);

  return (
    <div className="hud-canvas flex min-h-[100dvh] flex-col text-foreground xl:h-[100dvh] xl:min-h-0 xl:overflow-hidden">
      {/* ── Command bar ── */}
      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background/70 px-3 backdrop-blur-md sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link to="/" className="flex items-center gap-2" aria-label="Back to The For Good Project">
            <span className="text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /></span>
            <LogoMark size={26} />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-serif text-sm font-bold tracking-tight">Fleet</span>
              <span className="hud-label text-[9px]">Mission Control</span>
            </span>
          </Link>
          <span className="mx-0.5 hidden h-6 w-px bg-border sm:block" />
          <ConnectionPill status={live.status} />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Vital icon={Cpu} label="workers" value={live.agents.length} accent="#0EA5E9" />
          <Vital icon={Zap} label="tok/s" value={compactNumber(displayTps)} accent="#C2410C" live={currentTps > 0} />
          <Vital icon={Eye} label="watching" value={live.watchers.count} accent="#7C3AED" />
          <span className="mx-0.5 hidden h-6 w-px bg-border lg:block" />
          <LiveClock />
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="h-8 w-8">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {repoUrl ? (
            <a href={repoUrl} target="_blank" rel="noreferrer" className="hidden sm:block">
              <Button variant="ghost" size="icon" aria-label="GitHub" className="h-8 w-8"><GitHubIcon className="h-4 w-4" /></Button>
            </a>
          ) : null}
        </div>
      </header>

      {/* ── Repo status ribbon ── */}
      <div className="console-scroll relative z-10 flex shrink-0 items-center gap-x-4 gap-y-1 overflow-x-auto border-b border-border/60 bg-card/40 px-3 py-2 backdrop-blur-sm sm:px-4">
        <span className="hud-label shrink-0 text-brand-cyan-dark dark:text-brand-cyan">Repo</span>
        <RepoStat icon={CircleDot} value={stats.openIssues} label="open issues" accent="#16A34A" sub={`/ ${stats.totalIssues}`} to="/board" />
        <span className="h-4 w-px shrink-0 bg-border" />
        <RepoStat icon={GitPullRequest} value={stats.openPRs} label="open PRs" accent="#0284C7" sub={`${stats.mergedPRs} merged`} to="/review" />
        <span className="h-4 w-px shrink-0 bg-border" />
        <RepoStat icon={GitBranch} value={activeStreams} label="active streams" accent="#7C3AED" sub={`/ ${streams.length}`} to="/streams" />
        <span className="h-4 w-px shrink-0 bg-border" />
        <RepoStat icon={FileText} value={stats.findings} label="findings" accent="#C2410C" to="/findings" />
        <span className="h-4 w-px shrink-0 bg-border" />
        <RepoStat icon={Link2} value={stats.sources} label="sources" accent="#2E4057" to="/sources" />
        <span className="ml-auto hidden shrink-0 items-center gap-3 md:flex">
          {available > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{available} available
            </span>
          ) : null}
          {inReview > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{inReview} in review
            </span>
          ) : null}
        </span>
      </div>

      {/* ── Grid body ── */}
      <main className="flex-1 xl:min-h-0">
        <div className="grid h-full grid-cols-1 gap-3 p-3 xl:grid-cols-[336px_minmax(0,1fr)]">
          {/* Left rail — throughput (grows) + compact KPI tiles */}
          <div className="flex min-h-0 flex-col gap-3">
            <div className="min-h-[16rem] xl:flex-1">
              <FleetPulse fleet={live.fleet} history={live.historicalTps.length ? live.historicalTps : live.tpsHistory} />
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
              <StatTile label="Workers" value={live.agents.length} icon={Cpu} accent="#0EA5E9"
                hint={live.agents.length ? `${reviewing} reviewing` : "waiting for fleet"} />
              <StatTile label="Watchers" value={live.watchers.count} icon={Globe} accent="#7C3AED" hint="right now" />
              <StatTile label="Tokens" value={compactNumber((totals?.tokensIn ?? 0) + (totals?.tokensOut ?? 0))} icon={Radio} accent="#C2410C" hint="all time, in + out" />
              <StatTile label="Tool calls" value={compactNumber(totals?.toolCalls ?? 0)} icon={Wrench} accent="#2E4057"
                hint={fetchTotal > 0 ? `${Math.round(((liveTotals?.fetchesOk ?? 0) / fetchTotal) * 100)}% fetch ok` : "all time"} />
              <StatTile label="PRs opened" value={totals?.prsOpened ?? 0} icon={GitPullRequest} accent="#0284C7" hint="all time" />
              <StatTile label="Reviews" value={totals?.reviewsCompleted ?? 0} icon={MessageSquare} accent="#7C3AED" hint="all time" />
            </div>
          </div>

          {/* Column 2 — the wide fleet on top, activity + comments/findings underneath */}
          <div className="grid min-h-0 gap-3 xl:grid-rows-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* The fleet — full-width table */}
          <section className="hud-panel flex min-h-0 flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 p-3">
              <PanelHead label="The Fleet" count={live.agents.length} icon={Bot} accent="#0EA5E9"
                right={live.agents.length ? <span className="inline-flex items-center gap-1"><Signal className="h-3 w-3 text-emerald-500" /> {reviewing} reviewing</span> : null} />
            </div>
            {selectedAgent ? (
              <div className="flex min-h-[26rem] flex-1 flex-col p-3 xl:min-h-0">
                <WorkerTerminal
                  agent={selectedAgent}
                  lines={[...(loadedLogs[selectedAgent.id] ?? []), ...(live.logs[selectedAgent.id] ?? [])].slice(-500)}
                  onClose={() => setSelectedAgentId(null)}
                />
              </div>
            ) : (
              <AgentTable
                agents={live.agents}
                trails={live.agentTrails}
                selectedAgentId={selectedAgentId}
                onSelectAgent={(agent) => setSelectedAgentId(agent.id)}
              />
            )}
          </section>

          {/* Bottom row — activity + comments/findings side by side */}
          <div className="grid min-h-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="hud-panel flex min-h-0 flex-col overflow-hidden">
              <div className="p-3 pb-2">
                <PanelHead label="Activity" icon={Radio} accent="#C2410C"
                  right={generatedAt ? <span>upd {relativeTime(generatedAt)}</span> : null} />
              </div>
              <div className="console-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                <LiveEventFeed events={live.events} />
              </div>
            </section>

            <section className="hud-panel flex min-h-0 flex-col overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 pb-2">
                <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-0.5">
                  {([
                    { k: "comments", label: "Comments", icon: MessageSquare, count: filteredComments.length },
                    { k: "findings", label: "Findings", icon: FileText, count: recentFindings.length },
                  ] as const).map(({ k, label, icon: Icon, count }) => (
                    <button
                      key={k}
                      onClick={() => setFeedTab(k)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                        feedTab === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />{label}
                      <span className="font-mono text-[10px] tabular-nums opacity-70">{count}</span>
                    </button>
                  ))}
                </div>
                {feedTab === "comments" ? (
                  <div className="flex gap-1">
                    {([
                      { k: "all", label: "All" },
                      { k: "issues", label: "Issues" },
                      { k: "prs", label: "PRs" },
                    ] as const).map(({ k, label }) => (
                      <button
                        key={k}
                        onClick={() => setFilter(k)}
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
                          filter === k ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="console-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                {feedTab === "comments" ? <CommentFeed comments={filteredComments} /> : <FindingsFeed findings={recentFindings} />}
              </div>
            </section>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
