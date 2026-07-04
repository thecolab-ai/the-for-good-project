/**
 * Rough watcher geolocation. The contract (#398 + maintainer ask): we may use
 * a watcher's IP to derive an approximate location for the dashboard, but the
 * IP itself is never stored, never logged, and never sent to any client or
 * third party. geoip-lite resolves entirely offline from a bundled MaxMind
 * GeoLite2 snapshot, so the IP never leaves this process.
 */
import geoip from "geoip-lite";
import type { RoughLocation } from "./protocol.js";

/** Round to ~0.1 degree (≈11 km) so the location can't identify a household. */
function rough(n: number): number {
  return Math.round(n * 10) / 10;
}

export function roughLocate(ip: string | undefined): RoughLocation | null {
  if (!ip) return null;
  // Normalise IPv4-mapped IPv6 addresses ("::ffff:1.2.3.4").
  const clean = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  let hit: ReturnType<typeof geoip.lookup>;
  try {
    hit = geoip.lookup(clean);
  } catch {
    return null;
  }
  if (!hit) return null;
  const [lat, lon] = hit.ll ?? [];
  return {
    city: hit.city || undefined,
    country: hit.country || undefined,
    lat: typeof lat === "number" ? rough(lat) : undefined,
    lon: typeof lon === "number" ? rough(lon) : undefined,
  };
}

export function describeLocation(loc: RoughLocation | null): string {
  if (!loc) return "somewhere on Earth";
  const parts = [loc.city, loc.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "somewhere on Earth";
}
