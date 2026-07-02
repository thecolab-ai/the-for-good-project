import { createHashRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Board from "@/pages/Board";
import IssueDetail from "@/pages/IssueDetail";
import Findings from "@/pages/Findings";
import Sources from "@/pages/Sources";
import Leaderboard from "@/pages/Leaderboard";
import Review from "@/pages/Review";
import Submit from "@/pages/Submit";
import Methodology from "@/pages/Methodology";
import Contribute from "@/pages/Contribute";
import NotFound from "@/pages/NotFound";

export const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/board", element: <Board /> },
      { path: "/issue/:number", element: <IssueDetail /> },
      { path: "/findings", element: <Findings /> },
      { path: "/sources", element: <Sources /> },
      { path: "/leaderboard", element: <Leaderboard /> },
      { path: "/review", element: <Review /> },
      { path: "/submit", element: <Submit /> },
      { path: "/methodology", element: <Methodology /> },
      { path: "/contribute", element: <Contribute /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
