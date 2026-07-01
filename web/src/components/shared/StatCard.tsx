import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, hint, accent = "#2E4057", className }:
  { label: string; value: React.ReactNode; icon: LucideIcon; hint?: string; accent?: string; className?: string }) {
  return (
    <Card className={cn("relative overflow-hidden p-5 animate-fade-in", className)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-bold font-serif tabular-nums" style={{ color: accent }}>{value}</div>
          <div className="mt-1 text-sm font-medium text-foreground">{label}</div>
          {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
        </div>
        <div className="rounded-lg p-2" style={{ backgroundColor: `${accent}14` }}>
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
      </div>
    </Card>
  );
}
