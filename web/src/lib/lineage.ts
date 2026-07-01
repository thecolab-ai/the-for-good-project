import type { IssueLite } from "./types";
import { STAGE_ORDER } from "./meta";

export interface ChainNode {
  issue: IssueLite;
  children: ChainNode[];
  /** PRs whose body closes this issue */
  prs: IssueLite[];
}

// "Part of #12" is the linking convention from AGENTS.md / the issue templates.
const PARENT_RE = /part of #(\d+)/i;
const CLOSES_RE = /\b(?:clos(?:e|es|ed)|fix(?:es|ed)?|resolv(?:e|es|ed))\s+#(\d+)/gi;

export function parentNumber(issue: IssueLite): number | null {
  const m = PARENT_RE.exec(issue.body);
  return m ? Number(m[1]) : null;
}

function closedNumbers(pr: IssueLite): number[] {
  const out: number[] = [];
  let m;
  CLOSES_RE.lastIndex = 0;
  while ((m = CLOSES_RE.exec(pr.body))) out.push(Number(m[1]));
  return out;
}

const stageRank = (issue: IssueLite) => {
  const i = STAGE_ORDER.indexOf(issue.stage as (typeof STAGE_ORDER)[number]);
  return i === -1 ? STAGE_ORDER.length : i;
};

/** Latest activity anywhere in the chain, for sorting roots. */
export function chainUpdatedAt(node: ChainNode): string {
  let latest = node.issue.updatedAt;
  for (const pr of node.prs) if (pr.updatedAt > latest) latest = pr.updatedAt;
  for (const c of node.children) {
    const t = chainUpdatedAt(c);
    if (t > latest) latest = t;
  }
  return latest;
}

export function chainSize(node: ChainNode): number {
  return 1 + node.children.reduce((n, c) => n + chainSize(c), 0);
}

/**
 * Build problem chains from all issues: every issue whose body says
 * "Part of #n" hangs under issue n; the rest are roots. PRs attach to the
 * issues they close. Unknown parents and cycles fall back to root.
 */
export function buildChains(all: IssueLite[]): ChainNode[] {
  const issues = all.filter((i) => !i.isPR);
  const prs = all.filter((i) => i.isPR);

  const nodes = new Map<number, ChainNode>();
  for (const issue of issues) nodes.set(issue.number, { issue, children: [], prs: [] });

  for (const pr of prs)
    for (const n of closedNumbers(pr)) nodes.get(n)?.prs.push(pr);

  const roots: ChainNode[] = [];
  for (const node of nodes.values()) {
    const parent = parentNumber(node.issue);
    const parentNode = parent != null && parent !== node.issue.number ? nodes.get(parent) : undefined;
    if (parentNode) parentNode.children.push(node);
    else roots.push(node);
  }

  // A cycle (a "Part of" loop) leaves its members unreachable from any root —
  // promote one member so the chain still renders.
  const reachable = new Set<number>();
  const mark = (n: ChainNode) => {
    if (reachable.has(n.issue.number)) return;
    reachable.add(n.issue.number);
    n.children.forEach(mark);
  };
  roots.forEach(mark);
  for (const node of nodes.values()) {
    if (reachable.has(node.issue.number)) continue;
    roots.push(node);
    mark(node);
  }

  const sortChildren = (n: ChainNode) => {
    n.children.sort((a, b) => stageRank(a.issue) - stageRank(b.issue) || a.issue.number - b.issue.number);
    n.children.forEach(sortChildren);
  };
  roots.forEach(sortChildren);
  roots.sort((a, b) => chainUpdatedAt(b).localeCompare(chainUpdatedAt(a)));
  return roots;
}
