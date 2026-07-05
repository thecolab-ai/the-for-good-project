import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bot, GitPullRequest, Globe, MessageSquare, Pause, Play, Radio, Wifi, WifiOff, Wrench } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CommentFeed, ActiveStrip } from "@/components/shared/CommentFeed";
import { StatCard } from "@/components/shared/StatCard";
import { relativeTime } from "@/lib/format";
import { compactNumber, fetchAgentLogs, liveServerUrl, useLiveFleet, type AgentPresence, type LiveStatus, type LogLine } from "@/lib/live";
import { FleetPulse } from "@/components/live/FleetPulse";
import { AgentGrid } from "@/components/live/AgentGrid";
import { WatcherStrip } from "@/components/live/WatcherStrip";
import { LiveEventFeed } from "@/components/live/LiveEventFeed";

// Poll for a fresh GitHub snapshot — comment-triggered rebuilds land within a
// minute or two, so this keeps the comment feed close to real time. The fleet
// section above it is true real-time over the fleet server's WebSocket.
const POLL_MS = 45_000;

type Filter = "all" | "issues" | "prs";

function ConnectionDot({ status }: { status: LiveStatus }) {
  if (status === "online") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <Wifi className="h-3.5 w-3.5" /> fleet server connected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="relative inline-flex h-2 w-2 rounded-full bg-stone-400" />
      <WifiOff className="h-3.5 w-3.5" />
      {status === "connecting" ? "connecting to fleet server…" : "fleet server offline — showing GitHub activity only"}
    </span>
  );
}

function WorkerStream({ agent, lines, onClose }: { agent: AgentPresence; lines: LogLine[]; onClose: () => void }) {
  const s = agent.session;
  const logRef = useRef<HTMLDivElement | null>(null);
  const [followTail, setFollowTail] = useState(true);

  useEffect(() => {
    if (!followTail) return;
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [followTail, lines]);

  const jumpToBottom = () => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setFollowTail(true);
  };

  return (
    <Card className="mt-4 max-w-full overflow-hidden border-primary/30" id="worker-live-stream">
      <CardHeader className="sticky top-2 z-10 flex flex-col gap-3 border-b bg-card/95 pb-3 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">@{agent.handle} live stream</CardTitle>
          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="max-w-full truncate font-mono">{agent.model}</span>
            <span>{compactNumber(s.toolCalls)} tools</span>
            <span>{compactNumber(s.tokensIn + s.tokensOut)} tokens</span>
            <span>updated {relativeTime(agent.lastSeen)}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1 sm:flex-none">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
          <Button variant="outline" size="sm" onClick={() => setFollowTail((v) => !v)} className="flex-1 sm:flex-none">
            {followTail ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {followTail ? "Pause" : "Follow"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {Object.entries(s.tools ?? {}).length ? Object.entries(s.tools).map(([tool, count]) => (
            <span key={tool} className="max-w-full rounded-full bg-muted px-2 py-1 font-mono break-all">{tool} × {count}</span>
          )) : <span>No per-tool events yet.</span>}
        </div>
        <div className="relative min-w-0">
          <div
            ref={logRef}
            className="max-h-[70vh] min-h-64 overflow-y-auto overflow-x-hidden rounded-lg bg-stone-950 p-3 font-mono text-[11px] leading-relaxed text-stone-100 shadow-inner sm:max-h-[34rem] sm:p-4 sm:text-xs"
            onScroll={(event) => {
              const el = event.currentTarget;
              const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
              if (followTail !== atBottom) setFollowTail(atBottom);
            }}
          >
            {lines.length ? lines.map((entry, index) => (
              <div key={`${entry.at}-${index}`} className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 border-b border-white/5 py-1 last:border-0">
                <time className="select-none whitespace-nowrap text-stone-500">{new Date(entry.at).toLocaleTimeString()}</time>
                <span className="min-w-0 whitespace-pre-wrap break-words">{entry.line}</span>
              </div>
            )) : (
              <div className="whitespace-pre-wrap break-words text-stone-400">
                No stream lines yet. Start workers with STREAM_LOGS=1 for transcript/tool output.
              </div>
            )}
          </div>
          {!followTail ? (
            <Button size="sm" variant="brand" onClick={jumpToBottom} className="absolute bottom-3 right-3 shadow-lg">
              Follow latest
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

/** Real-time mission control, rendered when a fleet server is configured. */
function FleetSection() {
  const live = useLiveFleet();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [loadedLogs, setLoadedLogs] = useState<Record<string, LogLine[]>>({});
  const selectedAgent = live.agents.find((agent) => agent.id === selectedAgentId) ?? null;
  useEffect(() => {
    if (!selectedAgentId) return;
    void fetchAgentLogs(selectedAgentId).then((lines) => {
      if (lines.length) setLoadedLogs((prev) => ({ ...prev, [selectedAgentId]: lines }));
    });
  }, [selectedAgentId]);

  useEffect(() => {
    if (!selectedAgentId) return;
    window.requestAnimationFrame(() => {
      document.getElementById("worker-live-stream")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [selectedAgentId]);
  if (live.status === "unconfigured") return null;

  const totals = live.historyTotals ?? live.fleet?.totals;
  const liveTotals = live.fleet?.totals;
  const fetchTotal = (liveTotals?.fetchesOk ?? 0) + (liveTotals?.fetchesError ?? 0);

  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ConnectionDot status={live.status} />
        <WatcherStrip watchers={live.watchers} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FleetPulse fleet={live.fleet} history={live.historicalTps.length ? live.historicalTps : live.tpsHistory} />
        </div>
        <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
          <StatCard label="Workers online" value={live.agents.length} icon={Bot} accent="#0284C7"
            hint={live.agents.length ? `${live.agents.filter((a) => a.task?.kind === "review").length} reviewing` : "waiting for the fleet"} />
          <StatCard label="Tool calls" value={compactNumber(totals?.toolCalls ?? 0)} icon={Wrench} accent="#2E4057"
            hint={fetchTotal > 0 ? `${Math.round(((liveTotals?.fetchesOk ?? 0) / fetchTotal) * 100)}% of ${compactNumber(fetchTotal)} fetches ok` : "all time"} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tokens burned" value={compactNumber((totals?.tokensIn ?? 0) + (totals?.tokensOut ?? 0))} icon={Radio} accent="#C2410C" hint="all time, in + out" />
        <StatCard label="PRs opened" value={totals?.prsOpened ?? 0} icon={GitPullRequest} accent="#0284C7" hint="all time" />
        <StatCard label="Reviews done" value={totals?.reviewsCompleted ?? 0} icon={MessageSquare} accent="#7C3AED" hint="all time" />
        <StatCard label="Watchers" value={live.watchers.count} icon={Globe} accent="#2E4057" hint="right now, locations approximate" />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-serif text-lg font-semibold">The fleet</h2>
        <AgentGrid
          agents={live.agents}
          trails={live.agentTrails}
          selectedAgentId={selectedAgentId}
          onSelectAgent={(agent) => setSelectedAgentId(agent.id)}
        />
        {selectedAgent ? (
          <WorkerStream
            agent={selectedAgent}
            lines={[...(loadedLogs[selectedAgent.id] ?? []), ...(live.logs[selectedAgent.id] ?? [])].slice(-500)}
            onClose={() => setSelectedAgentId(null)}
          />
        ) : null}
      </div>

      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Fleet events</CardTitle>
        </CardHeader>
        <CardContent className="max-h-80 overflow-y-auto">
          <LiveEventFeed events={live.events} />
        </CardContent>
      </Card>
    </section>
  );
}

export default function Live() {
  const { data, error, loading } = useSnapshot(POLL_MS);
  const [filter, setFilter] = useState<Filter>("all");
  const fleetConfigured = liveServerUrl() !== null;

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
        Mission control for the worker fleet: who's connected, what they're working on, and how much
        intelligence is flowing — plus the latest comments across every issue and pull request.
      </PageHeader>

      {fleetConfigured ? <FleetSection /> : null}

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
