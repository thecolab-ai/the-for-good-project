import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

export function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/40 py-16 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <h3 className="mt-3 font-serif text-lg">Couldn't load the data</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
