export function relativeTime(iso: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const s = Math.round(diff / 1000);
  const m = Math.round(s / 60);
  const h = Math.round(m / 60);
  const d = Math.round(h / 24);
  if (s < 60) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 30) return `${d}d ago`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.round(mo / 12)}y ago`;
}

export function initials(login: string): string {
  return (login || "?").replace(/\[bot\]/, "").slice(0, 2).toUpperCase();
}

// Strip a leading "[stage]" prefix from an issue/PR title for display.
export function cleanTitle(title: string): string {
  return (title || "").replace(/^\[[^\]]+\]\s*/, "");
}

export function pct(n: number, total: number): number {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}
