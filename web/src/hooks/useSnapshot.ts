import { useEffect, useState } from "react";
import type { Snapshot } from "@/lib/types";
import { loadSnapshot } from "@/lib/data";

export function useSnapshot() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loadSnapshot()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, []);
  return { data, error, loading: !data && !error };
}
