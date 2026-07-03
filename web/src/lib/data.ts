import type { Snapshot, StreamsSummaryData } from "./types";

let cache: Promise<Snapshot> | null = null;
let streamsSummaryCache: Promise<StreamsSummaryData> | null = null;

const SNAPSHOT_URL = () => `${import.meta.env.BASE_URL}data/snapshot.json`;
const STREAMS_SUMMARY_URL = () => `${import.meta.env.BASE_URL}data/streams-summary.json`;

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

export function loadStreamsSummary(): Promise<StreamsSummaryData> {
  if (!streamsSummaryCache) {
    streamsSummaryCache = fetch(STREAMS_SUMMARY_URL(), { cache: "no-cache" }).then(async (r) => {
      if (r.ok) return r.json() as Promise<StreamsSummaryData>;
      if (r.status !== 404) throw new Error(`Failed to load streams summary (${r.status})`);

      const snapshot = await loadSnapshot();
      return {
        generatedAt: snapshot.generatedAt,
        streams: snapshot.streamsSummary ?? [],
      };
    });
  }
  return streamsSummaryCache;
}
