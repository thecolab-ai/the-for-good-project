import { Outlet, ScrollRestoration } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useSnapshot } from "@/hooks/useSnapshot";

export function AppLayout() {
  const { data } = useSnapshot();
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen flex-col">
        <Header repoUrl={data?.repo.url} />
        {/* Unconstrained on purpose: `.container` caps at 1400px past the 2xl
            breakpoint, and full-bleed pages escaping that cap via negative
            margins would get clipped back down by overflow-x-clip on this
            element. Width/padding now live one level down, per route. */}
        <main className="flex-1 overflow-x-clip">
          <Outlet />
        </main>
        <Footer repoUrl={data?.repo.url} generatedAt={data?.generatedAt} />
      </div>
      <ScrollRestoration />
    </TooltipProvider>
  );
}
