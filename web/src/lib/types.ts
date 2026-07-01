export type Stage = "discover" | "research" | "ideate" | "build" | "none";
export type StatusKey = "available" | "claimed" | "in-review" | "blocked" | "done" | "none";

export interface Person {
  login: string;
  avatar: string;
  url: string;
}

export interface Comment {
  author: string;
  avatar: string;
  body: string;
  createdAt: string;
}

export interface IssueLite {
  number: number;
  title: string;
  state: "open" | "closed";
  isPR: boolean;
  merged?: boolean;
  url: string;
  body: string;
  stage: Stage;
  status: StatusKey;
  domain: string | null;
  labels: string[];
  author: Person | null;
  assignees: Person[];
  createdAt: string;
  updatedAt: string;
  comments: number;
  commentsList?: Comment[];
  reactions?: number;
}

export interface Contributor {
  login: string;
  avatar: string;
  url: string;
  issuesAssigned: number;
  prsMerged: number;
  prsOpened: number;
  findingsAuthored: number;
  commits: number;
  reviewsGiven: number;
  researchScore: number;
  reviewScore: number;
  score: number;
  lastActivity: string | null;
  domains: string[];
}

export interface FindingSource {
  label: string;
  url: string;
}

export interface Finding {
  path: string;
  title: string;
  domain: string;
  confidence: "High" | "Medium" | "Low" | "Unknown";
  author: string;
  date: string;
  url: string;
  summary: string;
  sources: FindingSource[];
}

export interface SourceRef {
  url: string;
  host: string;
  label: string;
  domain: string;
  findingPath: string;
  findingTitle: string;
}

export interface ActivityItem {
  type: "issue" | "pr" | "finding";
  title: string;
  url: string;
  actor: string;
  avatar: string;
  at: string;
  meta?: string;
}

export interface Snapshot {
  generatedAt: string;
  repo: { owner: string; name: string; url: string; description: string; homepage: string };
  stats: {
    totalIssues: number;
    openIssues: number;
    closedIssues: number;
    totalPRs: number;
    openPRs: number;
    mergedPRs: number;
    findings: number;
    contributors: number;
    reviews: number;
    sources: number;
    byStage: Record<string, number>;
    byStatus: Record<string, number>;
    byDomain: Record<string, number>;
  };
  pipeline: { stage: Stage; label: string; open: number; done: number }[];
  issues: IssueLite[];
  reviewQueue: IssueLite[];
  leaderboard: Contributor[];
  findings: Finding[];
  sources: SourceRef[];
  activity: ActivityItem[];
}
