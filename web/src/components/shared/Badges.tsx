import { Badge } from "@/components/ui/badge";
import { STAGE_META, STATUS_META, domainLabel } from "@/lib/meta";
import type { Stage, StatusKey } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  const m = STAGE_META[stage] ?? STAGE_META.none;
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", className)}
      style={{ backgroundColor: `${m.color}1a`, color: m.color }}>
      <Icon className="h-3 w-3" /> {m.label}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: StatusKey; className?: string }) {
  const m = STATUS_META[status] ?? STATUS_META.none;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", className)}
      style={{ backgroundColor: `${m.color}1a`, color: m.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} /> {m.label}
    </span>
  );
}

export function DomainBadge({ domain, className }: { domain: string | null; className?: string }) {
  if (!domain) return null;
  return <Badge variant="outline" className={cn("font-normal", className)}>{domainLabel(domain)}</Badge>;
}
