import { NavLink, Link, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogoMark, GitHubIcon } from "./Logo";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; end?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const LINKS: NavItem[] = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/live", label: "Live" },
  { to: "/board", label: "Board" },
  { to: "/partners", label: "For partners" },
];

const GROUPS: NavGroup[] = [
  {
    label: "Research",
    items: [
      { to: "/findings", label: "Findings" },
      { to: "/sources", label: "Sources" },
      { to: "/review", label: "Review" },
    ],
  },
  {
    label: "Community",
    items: [
      { to: "/leaderboard", label: "Leaderboard" },
      { to: "/contribute", label: "Get started" },
      { to: "/methodology", label: "Method" },
      { to: "/decisions", label: "Decisions" },
    ],
  },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
  );

export function Header({ repoUrl }: { repoUrl?: string }) {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

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
          {LINKS.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={navLinkClass}>
              {n.label}
            </NavLink>
          ))}
          {GROUPS.map((group) => {
            const active = group.items.some((i) => pathname === i.to);
            return (
              <DropdownMenu key={group.label}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring data-[state=open]:bg-secondary/60",
                      active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    )}
                  >
                    {group.label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {group.items.map((i) => (
                    <DropdownMenuItem key={i.to} asChild>
                      <NavLink to={i.to} className={({ isActive }) => cn("w-full", isActive && "bg-accent text-accent-foreground")}>
                        {i.label}
                      </NavLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
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
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col py-2">
            {LINKS.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}
                className={({ isActive }) => cn("rounded-md px-3 py-2.5 text-sm font-medium", isActive ? "bg-secondary" : "text-muted-foreground")}>
                {n.label}
              </NavLink>
            ))}
            {GROUPS.map((group) => (
              <div key={group.label} className="mt-1">
                <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">{group.label}</div>
                {group.items.map((i) => (
                  <NavLink key={i.to} to={i.to} onClick={() => setOpen(false)}
                    className={({ isActive }) => cn("rounded-md px-3 py-2.5 text-sm font-medium", isActive ? "bg-secondary" : "text-muted-foreground")}>
                    {i.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
