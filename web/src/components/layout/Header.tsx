import { NavLink, Link } from "react-router-dom";
import { Moon, Sun, Plus, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogoMark, GitHubIcon } from "./Logo";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/board", label: "Board" },
  { to: "/contribute", label: "Get started" },
  { to: "/findings", label: "Findings" },
  { to: "/sources", label: "Sources" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/review", label: "Review" },
  { to: "/methodology", label: "Method" },
];

export function Header({ repoUrl }: { repoUrl?: string }) {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 rounded-none border-x-0 border-t-0 border-b border-border bg-background/80 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.06)] backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <LogoMark />
          <div className="leading-none">
            <div className="font-serif text-base font-bold tracking-tight text-brand-navy dark:text-foreground">The For Good Project</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">by thecolab.ai</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => cn("rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60")}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {repoUrl ? (
            <a href={repoUrl} target="_blank" rel="noreferrer" className="hidden sm:block">
              <Button variant="ghost" size="icon" aria-label="GitHub"><GitHubIcon className="h-4 w-4" /></Button>
            </a>
          ) : null}
          <Link to="/submit" className="hidden sm:block">
            <Button variant="brand" size="sm"><Plus className="h-4 w-4" /> Submit</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col py-2">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}
                className={({ isActive }) => cn("rounded-md px-3 py-2.5 text-sm font-medium", isActive ? "bg-secondary" : "text-muted-foreground")}>
                {n.label}
              </NavLink>
            ))}
            <Link to="/submit" onClick={() => setOpen(false)} className="mt-1">
              <Button variant="brand" className="w-full"><Plus className="h-4 w-4" /> Submit an issue</Button>
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
