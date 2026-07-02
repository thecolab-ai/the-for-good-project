import type { Snapshot } from "./types";

let cache: Promise<Snapshot> | null = null;

const SNAPSHOT_URL = () => `${import.meta.env.BASE_URL}data/snapshot.json`;

export function loadSnapshot(): Promise<Snapshot> {
  if (!cache) {
    cache = fetch(SNAPSHOT_URL(), { cache: "no-cache" }).then((r) => {
      if (!r.ok) throw new Error(`Failed to load data (${r.status})`);
      return r.json() as Promise<Snapshot>;
    });
  }
  return cache;
}

// Bypass the module cache to pull a fresh snapshot — used by polling so the
// live feed picks up comments as new builds deploy.
export function loadSnapshotFresh(): Promise<Snapshot> {
  return fetch(SNAPSHOT_URL(), { cache: "no-store" }).then((r) => {
    if (!r.ok) throw new Error(`Failed to load data (${r.status})`);
    return r.json() as Promise<Snapshot>;
  });
}
