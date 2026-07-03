import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Live from "@/pages/Live";
import Board from "@/pages/Board";
import Streams from "@/pages/Streams";
import StreamDetail from "@/pages/StreamDetail";
// Submit page kept on disk but unrouted — on-site submission is disabled for
// now; /submit redirects to the live feed (see below).
import IssueDetail from "@/pages/IssueDetail";
import Findings from "@/pages/Findings";
import FindingDetail from "@/pages/FindingDetail";
import Sources from "@/pages/Sources";
import Leaderboard from "@/pages/Leaderboard";
import Review from "@/pages/Review";
import Methodology from "@/pages/Methodology";
import Contribute from "@/pages/Contribute";
import Partners from "@/pages/Partners";
import Team from "@/pages/Team";
import Decisions from "@/pages/Decisions";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/live", element: <Live /> },
      { path: "/board", element: <Board /> },
      { path: "/streams", element: <Streams /> },
      { path: "/streams/:stream", element: <StreamDetail /> },
      { path: "/issue/:number", element: <IssueDetail /> },
      { path: "/findings", element: <Findings /> },
      { path: "/findings/*", element: <FindingDetail /> },
      { path: "/sources", element: <Sources /> },
      { path: "/leaderboard", element: <Leaderboard /> },
      { path: "/review", element: <Review /> },
      { path: "/submit", element: <Navigate to="/live" replace /> },
      { path: "/methodology", element: <Methodology /> },
      { path: "/contribute", element: <Contribute /> },
      { path: "/partners", element: <Partners /> },
      { path: "/team", element: <Team /> },
      { path: "/decisions", element: <Decisions /> },
      { path: "*", element: <NotFound /> },
    ],
  },
], {
  // Served from a GitHub Pages project subpath (see vite `base`).
  basename: import.meta.env.BASE_URL.replace(/\/$/, ""),
});
