import { Fragment } from "react";
import { Check } from "lucide-react";
import { STREAM_STAGES, streamStageIndex, streamStateStyle } from "@/lib/streams";
import { cn } from "@/lib/utils";

// A lifecycle stepper for a stream: Framing → Research → Synthesis → Ideate →
// Build → Shipped. `compact` renders a thin segmented bar for cards; the full
// variant renders labelled, connected steps for the detail header.
export function StreamProgress({ state, compact = false, className }: { state: string; compact?: boolean; className?: string }) {
  const current = streamStageIndex(state);
  const accent = streamStateStyle(state).color;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)} aria-label={`Stage ${current + 1} of ${STREAM_STAGES.length}: ${STREAM_STAGES[current]}`}>
        {STREAM_STAGES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: i <= current ? accent : undefined }}
            data-done={i <= current}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-0", className)}>
      {STREAM_STAGES.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <Fragment key={label}>
            {i > 0 ? <div className="h-px flex-1" style={{ backgroundColor: i <= current ? accent : undefined }} data-done={i <= current} /> : null}
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums",
                  !done && !active && "border-border bg-background text-muted-foreground",
                )}
                style={done || active ? { backgroundColor: active ? accent : `${accent}26`, borderColor: accent, color: active ? "#fff" : accent } : undefined}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn("whitespace-nowrap text-[10px] font-medium uppercase tracking-wide", active ? "text-foreground" : "text-muted-foreground")}
                style={active ? { color: accent } : undefined}
              >
                {label}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
