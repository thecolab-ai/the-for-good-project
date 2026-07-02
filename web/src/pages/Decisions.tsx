import { ScrollText, ExternalLink } from "lucide-react";
import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Markdown } from "@/components/shared/Markdown";
import type { Adr } from "@/lib/types";

function statusStyle(status: string): { bg: string; color: string } {
  const s = status.toLowerCase();
  if (s.includes("accept")) return { bg: "#0E8A1618", color: "#0E8A16" };
  if (s.includes("propos")) return { bg: "#B8860B18", color: "#B8860B" };
  if (s.includes("supersed") || s.includes("deprecat")) return { bg: "#B6020518", color: "#B60205" };
  return { bg: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" };
}

// Drop the H1 title + metadata bullet block; the card header shows those.
function bodyFromContext(body: string): string {
  const i = body.indexOf("\n## ");
  return i >= 0 ? body.slice(i + 1) : body;
}

export default function Decisions() {
  const { data, error, loading } = useSnapshot();
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "No data"} />;

  const adrs: Adr[] = [...(data.adrs ?? [])].sort((a, b) => a.number.localeCompare(b.number));

  return (
    <div>
      <PageHeader title="Decisions">
        Architecture Decision Records — the durable <em>why</em> behind how this project works. Many humans and agents work this repo across many contexts; decisions that live only in a chat thread get silently re-litigated. Each significant one gets a small, numbered, immutable record here.
      </PageHeader>

      {adrs.length === 0 ? (
        <EmptyState icon={ScrollText} title="No decision records yet">
          They'll appear here on the next data build. In the meantime, browse them in the repo under <code>docs/adr/</code>.
        </EmptyState>
      ) : (
        <div className="space-y-5">
          {adrs.map((a) => {
            const st = statusStyle(a.status);
            return (
              <Card key={a.slug} className="p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">ADR-{a.number}</span>
                  {a.status ? (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize" style={{ backgroundColor: st.bg, color: st.color }}>
                      {a.status}
                    </span>
                  ) : null}
                  {a.date ? <span className="text-xs text-muted-foreground">{a.date}</span> : null}
                  <a href={a.url} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-xs text-brand-cyan-dark hover:underline">
                    View on GitHub <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <h2 className="font-serif text-xl font-semibold text-brand-navy dark:text-foreground">{a.title}</h2>
                <div className="mt-2">
                  <Markdown>{bodyFromContext(a.body)}</Markdown>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
