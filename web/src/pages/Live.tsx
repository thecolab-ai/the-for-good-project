import { useSnapshot } from "@/hooks/useSnapshot";
import { Loading, ErrorState } from "@/components/shared/States";
import { FleetConsole } from "@/components/live/FleetConsole";

// Poll for a fresh GitHub snapshot — comment-triggered rebuilds land within a
// minute or two, so this keeps the comment feed close to real time. The fleet
// panels are true real-time over the fleet server's WebSocket (inside the
// console). The whole view is a full-screen mission-control dashboard rendered
// outside the marketing chrome — see App.tsx routing.
const POLL_MS = 45_000;

export default function Live() {
  const { data, error, loading } = useSnapshot(POLL_MS);

  if (loading) {
    return <div className="flex min-h-[100dvh] items-center justify-center"><Loading /></div>;
  }
  if (error || !data) {
    return <div className="flex min-h-[100dvh] items-center justify-center"><ErrorState message={error || "No data"} /></div>;
  }

  return <FleetConsole snapshot={data} />;
}
