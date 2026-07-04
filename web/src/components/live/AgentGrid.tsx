import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { Bot, GitPullRequest, Hammer, Layers, Search, Wrench } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { initials, relativeTime } from "@/lib/format";
import { compactNumber, type AgentPresence } from "@/lib/live";
import { harnessColor, useIsDark } from "./harness";

const KIND_META = {
  work: { icon: Hammer, verb: "working on" },
  review: { icon: Search, verb: "reviewing" },
  frame: { icon: Layers, verb: "framing" },
  synth: { icon: Layers, verb: "synthesising" },
  idle: { icon: Bot, verb: "idle" },
} as const;

function AgentCard({ agent, trail, selected, onSelect }: { agent: AgentPresence; trail: number[]; selected: boolean; onSelect: () => void }) {
  const dark = useIsDark();
  const color = harnessColor(agent.harness, dark);
  const kind = KIND_META[agent.task?.kind ?? "idle"] ?? KIND_META.idle;
  const KindIcon = kind.icon;
  const s = agent.session;
  const displayTps = agent.tps > 0 ? agent.tps : agent.lastTps;
  const showingLast = agent.tps <= 0 && agent.lastTps > 0;
  const fetches = s.fetchesOk + s.fetchesError;
  const trailData = trail.map((tps, i) => ({ i, tps }));

  return (
    <Card
      className={`animate-fade-in cursor-pointer transition ring-offset-background hover:ring-2 hover:ring-ring ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <a
            href={`https://github.com/${agent.handle}`}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center gap-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="relative inline-block shrink-0">
              <Avatar className="h-9 w-9 ring-2" style={{ ["--tw-ring-color" as string]: color }}>
                <AvatarImage src={`https://github.com/${agent.handle}.png?size=72`} alt={agent.handle} />
                <AvatarFallback>{initials(agent.handle)}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 rounded-full p-0.5 text-white ring-2 ring-background" style={{ backgroundColor: color }}>
                <Bot className="h-2.5 w-2.5" />
              </span>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">@{agent.handle}</span>
              <span className="block truncate font-mono text-[11px] text-muted-foreground">{agent.model}</span>
            </span>
          </a>
          <div className="shrink-0 text-right">
            <div className="text-lg font-semibold tabular-nums leading-tight">{compactNumber(displayTps)}</div>
            <div className="text-[10px] text-muted-foreground">{showingLast ? "last tok/s" : "tok/s"}</div>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <KindIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color }} />
          <span className="min-w-0">
            {kind.verb}{" "}
            {agent.task?.ref ? (
              <a
                href={`https://github.com/thecolab-ai/the-for-good-project/issues/${agent.task.ref.replace("#", "")}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                {agent.task.ref}
              </a>
            ) : null}
            {agent.task?.title ? <span className="block truncate text-foreground/80">{agent.task.title}</span> : null}
          </span>
        </div>

        {trailData.length > 2 ? (
          <div className="mt-2 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trailData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
                <YAxis hide domain={[0, "auto"]} />
                <Line type="monotone" dataKey="tps" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Wrench className="h-3 w-3" /> {compactNumber(s.toolCalls)} tool calls
          </span>
          <span className="tabular-nums">{compactNumber(s.tokensIn + s.tokensOut)} tokens</span>
          {fetches > 0 ? <span className="tabular-nums">{Math.round((s.fetchesOk / fetches) * 100)}% fetch ok</span> : null}
          {s.prsOpened > 0 ? (
            <span className="inline-flex items-center gap-1">
              <GitPullRequest className="h-3 w-3" /> {s.prsOpened}
            </span>
          ) : null}
          <span className="ml-auto">{relativeTime(agent.lastSeen)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function AgentGrid({
  agents,
  trails,
  selectedAgentId,
  onSelectAgent,
}: {
  agents: AgentPresence[];
  trails: Record<string, number[]>;
  selectedAgentId?: string | null;
  onSelectAgent?: (agent: AgentPresence) => void;
}) {
  if (!agents.length) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No workers connected right now. The fleet reports in here the moment someone runs autopilot with
        telemetry enabled — GitHub keeps working either way.
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          trail={trails[agent.id] ?? []}
          selected={selectedAgentId === agent.id}
          onSelect={() => onSelectAgent?.(agent)}
        />
      ))}
    </div>
  );
}
