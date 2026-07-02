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
        <main className="container flex-1 overflow-x-hidden py-8">
          <Outlet />
        </main>
        <Footer repoUrl={data?.repo.url} generatedAt={data?.generatedAt} />
      </div>
      <ScrollRestoration />
    </TooltipProvider>
  );
}
