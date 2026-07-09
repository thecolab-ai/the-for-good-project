import { Bot, GitPullRequest, Hammer, Layers, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { compactNumber, formatSince, type AgentPresence } from "@/lib/live";
import { harnessColor, useIsDark } from "./harness";

const KIND_META = {
  work: { icon: Hammer, verb: "working" },
  review: { icon: Search, verb: "reviewing" },
  frame: { icon: Layers, verb: "framing" },
  synth: { icon: Layers, verb: "synthesising" },
  idle: { icon: Bot, verb: "idle" },
} as const;

/** A crisp, dependency-free sparkline (SVG polyline + end dot). */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) {
    return <div className="h-6 w-full text-muted-foreground/40">·····</div>;
  }
  const w = 100;
  const h = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const x = (i: number) => (i / (data.length - 1)) * w;
  const y = (v: number) => h - 2 - ((v - min) / range) * (h - 4);
  const points = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const lastX = x(data.length - 1);
  const lastY = y(data[data.length - 1]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-6 w-full overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.9}
      />
      <circle cx={lastX} cy={lastY} r={1.8} fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function AgentRow({ agent, trail, selected, onSelect }:
  { agent: AgentPresence; trail: number[]; selected: boolean; onSelect: () => void }) {
  const dark = useIsDark();
  const color = harnessColor(agent.harness, dark);
  const kind = KIND_META[agent.task?.kind ?? "idle"] ?? KIND_META.idle;
  const KindIcon = kind.icon;
  const s = agent.session;
  const displayTps = agent.tps > 0 ? agent.tps : agent.lastTps;
  const showingLast = agent.tps <= 0 && agent.lastTps > 0;
  const fetches = s.fetchesOk + s.fetchesError;

  return (
    <tr
      onClick={onSelect}
      className={cn(
        "group cursor-pointer border-l-2 align-middle transition-colors",
        selected ? "bg-secondary/70" : "border-l-transparent hover:bg-secondary/40",
      )}
      style={selected ? { borderLeftColor: color } : undefined}
    >
      {/* Worker */}
      <td className="py-2 pl-3 pr-2">
        <div className="flex items-center gap-2.5">
          <a
            href={`https://github.com/${agent.handle}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="relative shrink-0"
          >
            <Avatar className="h-7 w-7 ring-2" style={{ ["--tw-ring-color" as string]: color }}>
              <AvatarImage src={`https://github.com/${agent.handle}.png?size=56`} alt={agent.handle} />
              <AvatarFallback className="text-[10px]">{initials(agent.handle)}</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 rounded-full p-px text-white ring-2 ring-card" style={{ backgroundColor: color }}>
              <Bot className="h-2 w-2" />
            </span>
          </a>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[13px] font-medium">@{agent.handle}</div>
            <div className="truncate font-mono text-[10px] text-muted-foreground">{agent.model}</div>
          </div>
        </div>
      </td>

      {/* Working on */}
      <td className="px-2 py-2">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <KindIcon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
          <span className="shrink-0 font-medium text-foreground/80">{kind.verb}</span>
          {agent.task?.ref ? (
            <a
              href={`https://github.com/thecolab-ai/the-for-good-project/issues/${agent.task.ref.replace("#", "")}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 font-mono text-foreground hover:underline"
            >
              {agent.task.ref}
            </a>
          ) : null}
          {agent.task?.title ? <span className="truncate text-foreground/60">· {agent.task.title}</span> : null}
          {agent.task && agent.task.kind !== "idle" && agent.taskSince ? (
            <span className="shrink-0 whitespace-nowrap font-mono text-[10px] tabular-nums text-foreground/50">
              {formatSince(agent.taskSince)}
            </span>
          ) : null}
        </div>
      </td>

      {/* tok/s */}
      <td className="px-2 py-2 text-right">
        <div className="font-mono text-sm font-semibold tabular-nums leading-none" style={{ color }}>
          {compactNumber(displayTps)}
        </div>
        <div className="mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">{showingLast ? "last" : "tok/s"}</div>
      </td>

      {/* Trend */}
      <td className="w-[7rem] px-2 py-2">
        <Sparkline data={trail} color={color} />
      </td>

      {/* Tools */}
      <td className="hidden px-2 py-2 text-right font-mono text-xs tabular-nums text-muted-foreground min-[1420px]:table-cell">
        {compactNumber(s.toolCalls)}
      </td>

      {/* Tokens */}
      <td className="hidden px-2 py-2 text-right font-mono text-xs tabular-nums text-muted-foreground min-[1560px]:table-cell">
        {compactNumber(s.tokensIn + s.tokensOut)}
      </td>

      {/* Fetch ok */}
      <td className="hidden px-2 py-2 text-right font-mono text-xs tabular-nums text-muted-foreground min-[1680px]:table-cell">
        {fetches > 0 ? `${Math.round((s.fetchesOk / fetches) * 100)}%` : "—"}
      </td>

      {/* PRs */}
      <td className="hidden px-2 py-2 text-right min-[1300px]:table-cell">
        {s.prsOpened > 0 ? (
          <span className="inline-flex items-center gap-1 font-mono text-xs tabular-nums text-muted-foreground">
            <GitPullRequest className="h-3 w-3" />{s.prsOpened}
          </span>
        ) : <span className="text-muted-foreground/40">—</span>}
      </td>

      {/* Updated */}
      <td className="py-2 pl-2 pr-3 text-right">
        <span className="whitespace-nowrap text-[11px] text-muted-foreground">{relativeTime(agent.lastSeen)}</span>
      </td>
    </tr>
  );
}

export function AgentTable({ agents, trails, selectedAgentId, onSelectAgent }:
  {
    agents: AgentPresence[];
    trails: Record<string, number[]>;
    selectedAgentId?: string | null;
    onSelectAgent?: (agent: AgentPresence) => void;
  }) {
  if (!agents.length) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-sm rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No workers connected right now. The fleet reports in here the moment someone runs autopilot with
          telemetry enabled — GitHub keeps working either way.
        </div>
      </div>
    );
  }
  return (
    <div className="console-scroll min-h-0 flex-1 overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <tr className="border-b border-border/70 text-left [&>th]:px-2 [&>th]:py-2 [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-[0.14em] [&>th]:text-[10px] [&>th]:text-muted-foreground">
            <th className="pl-3">Worker</th>
            <th>Working on</th>
            <th className="text-right">tok/s</th>
            <th>Trend</th>
            <th className="hidden text-right min-[1420px]:table-cell">Tools</th>
            <th className="hidden text-right min-[1560px]:table-cell">Tokens</th>
            <th className="hidden text-right min-[1680px]:table-cell">Fetch</th>
            <th className="hidden text-right min-[1300px]:table-cell">PRs</th>
            <th className="pr-3 text-right">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {agents.map((agent) => (
            <AgentRow
              key={agent.id}
              agent={agent}
              trail={trails[agent.id] ?? []}
              selected={selectedAgentId === agent.id}
              onSelect={() => onSelectAgent?.(agent)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
