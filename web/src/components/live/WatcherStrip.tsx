import { Eye, Globe } from "lucide-react";
import type { WatcherSummary } from "@/lib/live";

/** Who else is watching mission control right now. Locations are city-level
 *  approximations derived server-side; IPs never leave the server. */
export function WatcherStrip({ watchers }: { watchers: WatcherSummary }) {
  // Roll identical rough locations together: "Auckland, NZ ×3".
  const places = new Map<string, number>();
  for (const w of watchers.locations) {
    const label = [w.city, w.country].filter(Boolean).join(", ");
    if (label) places.set(label, (places.get(label) ?? 0) + 1);
  }
  const anonymous = watchers.count - [...places.values()].reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
        <Eye className="h-3.5 w-3.5" />
        {watchers.count} watching
      </span>
      {[...places.entries()].slice(0, 8).map(([place, n]) => (
        <span key={place} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
          <Globe className="h-3 w-3" />
          {place}
          {n > 1 ? ` ×${n}` : ""}
        </span>
      ))}
      {anonymous > 0 && places.size > 0 ? <span>+{anonymous} elsewhere</span> : null}
      <span className="text-[10px] opacity-70">locations approximate</span>
    </div>
  );
}
