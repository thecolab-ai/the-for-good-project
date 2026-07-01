import type { Snapshot } from "./types";

let cache: Promise<Snapshot> | null = null;

export function loadSnapshot(): Promise<Snapshot> {
  if (!cache) {
    const url = `${import.meta.env.BASE_URL}data/snapshot.json`;
    cache = fetch(url, { cache: "no-cache" }).then((r) => {
      if (!r.ok) throw new Error(`Failed to load data (${r.status})`);
      return r.json() as Promise<Snapshot>;
    });
  }
  return cache;
}
