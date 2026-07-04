import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { compactNumber, type FleetMetrics, type TpsPoint } from "@/lib/live";
import { harnessColor, harnessOrder, useIsDark } from "./harness";

/**
 * The fleet's heartbeat: one hero figure (tokens/sec across every connected
 * worker, hash-rate style) over a live area chart, with the per-harness split
 * as a direct-labeled legend row underneath.
 */
export function FleetPulse({ fleet, history }: { fleet: FleetMetrics | null; history: TpsPoint[] }) {
  const dark = useIsDark();
  const accent = harnessColor("claude", dark);
  const tps = fleet?.tps ?? 0;
  const harnesses = harnessOrder(Object.keys(fleet?.tpsByHarness ?? {}));

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="text-sm font-medium text-muted-foreground">Fleet throughput</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-sans text-5xl font-semibold tabular-nums leading-none">{compactNumber(tps)}</span>
          <span className="text-sm text-muted-foreground">tokens/sec</span>
          {tps > 0 ? (
            <span className="relative ml-1 flex h-2 w-2 self-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: accent }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
            </span>
          ) : null}
        </div>

        <div className="mt-3 h-24">
          {history.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="tpsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={[0, "auto"]} />
                <Tooltip
                  cursor={{ stroke: accent, strokeWidth: 1, strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as TpsPoint;
                    return (
                      <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md">
                        <div className="font-medium tabular-nums">{compactNumber(p.tps)} tok/s</div>
                        <div className="text-muted-foreground">{new Date(p.t).toLocaleTimeString()}</div>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="tps" stroke={accent} strokeWidth={2} fill="url(#tpsFill)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              gathering ticks…
            </div>
          )}
        </div>

        {harnesses.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {harnesses.map((h) => (
              <span key={h} className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: harnessColor(h, dark) }} />
                {h} <span className="font-medium tabular-nums text-foreground">{compactNumber(fleet?.tpsByHarness[h] ?? 0)}</span> tok/s
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
