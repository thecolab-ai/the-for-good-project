import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <div className="rounded-full bg-muted p-3"><Icon className="h-6 w-6 text-muted-foreground" /></div>
      <h3 className="mt-3 font-serif text-lg">{title}</h3>
      <div className="mt-1 max-w-sm text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
