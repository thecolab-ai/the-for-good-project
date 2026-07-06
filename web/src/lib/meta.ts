import type { Stage, StatusKey } from "./types";
import { Compass, BookOpen, Lightbulb, Hammer, CircleDot } from "lucide-react";

export const STAGE_META: Record<Stage, { label: string; color: string; ring: string; icon: typeof Compass; blurb: string }> = {
  discover: { label: "Discover", color: "#8B5CF6", ring: "ring-violet-300", icon: Compass, blurb: "Framing a real NZ problem into researchable questions" },
  research: { label: "Research", color: "#2E4057", ring: "ring-slate-300", icon: BookOpen, blurb: "Investigating one question, with citations" },
  ideate: { label: "Ideate", color: "#0EA5E9", ring: "ring-sky-300", icon: Lightbulb, blurb: "Turning findings into feasible solutions" },
  build: { label: "Build", color: "#C2410C", ring: "ring-orange-300", icon: Hammer, blurb: "Implementing a chosen solution" },
  none: { label: "Unsorted", color: "#78716C", ring: "ring-stone-300", icon: CircleDot, blurb: "Not yet triaged" },
};

// Labels are plain language on purpose — partners and visitors see these, so
// no repo jargon ("needs-synthesis", "claimed") leaks through.
export const STATUS_META: Record<StatusKey, { label: string; color: string; text: string }> = {
  available: { label: "Open for pickup", color: "#0E8A16", text: "text-emerald-700" },
  claimed: { label: "In progress", color: "#B8860B", text: "text-amber-700" },
  "in-review": { label: "Being checked", color: "#1D76DB", text: "text-blue-700" },
  "changes-requested": { label: "Fixes requested", color: "#D93F0B", text: "text-orange-700" },
  "needs-synthesis": { label: "Being summarised", color: "#14B8A6", text: "text-teal-700" },
  "awaiting-direction": { label: "Waiting on a human decision", color: "#8250DF", text: "text-purple-700" },
  blocked: { label: "Blocked", color: "#B60205", text: "text-red-700" },
  done: { label: "Done", color: "#5319E7", text: "text-violet-700" },
  none: { label: "New", color: "#78716C", text: "text-stone-600" },
};

// Translate any raw state string (issue status label or stream doc lifecycle
// state) into a partner-friendly label; unknown states fall back to the raw
// string, capitalised.
export function statusLabel(state: string): string {
  if (!state) return "";
  const m = STATUS_META[state as StatusKey];
  if (m) return m.label;
  return state.charAt(0).toUpperCase() + state.slice(1);
}

export const DOMAIN_LABELS: Record<string, string> = {
  "child-welfare": "Child welfare",
  "grant-access": "Grant access",
  "civic-transparency": "Civic transparency",
  "ai-policy": "AI policy",
  biosecurity: "Biosecurity",
  other: "Other",
};

export function domainLabel(d: string | null | undefined): string {
  if (!d) return "Unsorted";
  return DOMAIN_LABELS[d] || d;
}

export const CONFIDENCE_COLOR: Record<string, string> = {
  High: "#0E8A16",
  Medium: "#B8860B",
  Low: "#C2410C",
  Unknown: "#78716C",
};

// Per-domain accent colour — single source of truth for coverage bars, facet
// dots, and list rails across Findings/Sources. Keep in sync with DOMAIN_LABELS.
export const DOMAIN_COLOR: Record<string, string> = {
  "child-welfare": "#DB2777",
  "grant-access": "#0E8A16",
  "civic-transparency": "#1D76DB",
  "ai-policy": "#8B5CF6",
  biosecurity: "#0EA5E9",
  other: "#78716C",
};

export function domainColor(d: string | null | undefined): string {
  return (d && DOMAIN_COLOR[d]) || "#78716C";
}

export const STAGE_ORDER: Exclude<Stage, "none">[] = ["discover", "research", "ideate", "build"];
