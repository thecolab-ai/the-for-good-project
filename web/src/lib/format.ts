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

// Resolve a repo-relative markdown href (e.g. "../research/findings/x.md")
// against the source doc's GitHub blob URL so it doesn't 404 on-site.
// Absolute URLs, anchors and root-relative paths pass through untouched.
export function resolveDocHref(href: string | undefined, base: string): string | undefined {
  if (!href || !base) return href;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("#") || href.startsWith("/")) return href;
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

// "3 Jul 2026" — the plain-words date used in forwardable briefs.
export function shortDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

export function publicAsset(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
