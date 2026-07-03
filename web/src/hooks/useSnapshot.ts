import { useEffect, useState } from "react";
import type { Snapshot, StreamsSummaryData } from "@/lib/types";
import { loadSnapshot, loadSnapshotFresh, loadStreamsSummary } from "@/lib/data";

// Load the data snapshot. Pass `pollMs` to re-fetch a fresh copy on an interval
// (used by the live feed) — the first paint still comes from the shared cache.
export function useSnapshot(pollMs?: number) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loadSnapshot()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    if (!pollMs) return () => { alive = false; };
    const id = setInterval(() => {
      loadSnapshotFresh()
        .then((d) => alive && setData(d))
        .catch(() => { /* keep last good data on a failed poll */ });
    }, pollMs);
    return () => { alive = false; clearInterval(id); };
  }, [pollMs]);
  return { data, error, loading: !data && !error };
}

export function useStreamsSummary() {
  const [data, setData] = useState<StreamsSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loadStreamsSummary()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, []);
  return { data, error, loading: !data && !error };
}
