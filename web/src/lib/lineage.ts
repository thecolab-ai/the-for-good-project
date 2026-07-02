import { STAGE_ORDER } from "./meta";
import type { IssueLite } from "./types";

export interface ChainNode {
  issue: IssueLite;
  children: ChainNode[];
  prs: IssueLite[];
}

export interface StreamChainGroup {
  stream: number;
  roots: ChainNode[];
  updatedAt: string;
}

const STREAM_RE = /^stream:(\d+)$/i;
const PARENT_RE = /^\s*(?:part of|closes|fixes|resolves)\s+#(\d+)\b/im;
const CLOSING_RE = /^\s*(?:closes|fixes|resolves)\s+#(\d+)\b/gim;
const PART_OF_RE = /^\s*part of\s+#(\d+)\b/gim;

export function streamNumber(issue: IssueLite): number | null {
  for (const label of issue.labels) {
    const match = STREAM_RE.exec(label.trim());
    if (match) return Number(match[1]);
  }
  return null;
}

export function parentNumber(issue: IssueLite): number | null {
  const match = PARENT_RE.exec(issue.body);
  return match ? Number(match[1]) : null;
}

function referencedNumbers(body: string, re: RegExp): number[] {
  const out: number[] = [];
  re.lastIndex = 0;
  let match;
  while ((match = re.exec(body))) out.push(Number(match[1]));
  return [...new Set(out)];
}

function prTargetNumbers(pr: IssueLite): number[] {
  const closing = referencedNumbers(pr.body, CLOSING_RE);
  if (closing.length > 0) return closing;
  return referencedNumbers(pr.body, PART_OF_RE);
}

function parentChainCycle(start: number, parentByIssue: Map<number, number>): number[] | null {
  const path: number[] = [];
  const pathIndex = new Map<number, number>();
  let current: number | undefined = start;

  while (current != null) {
    const index = pathIndex.get(current);
    if (index != null) return path.slice(index);
    pathIndex.set(current, path.length);
    path.push(current);
    current = parentByIssue.get(current);
  }

  return null;
}

function detachFromParent(node: ChainNode, parentByIssue: Map<number, number>, nodes: Map<number, ChainNode>) {
  const parent = parentByIssue.get(node.issue.number);
  const parentNode = parent == null ? undefined : nodes.get(parent);
  if (!parentNode) return;
  parentNode.children = parentNode.children.filter((child) => child.issue.number !== node.issue.number);
  parentByIssue.delete(node.issue.number);
}

export function chainPrCount(node: ChainNode, seenIssues = new Set<number>(), seenPrs = new Set<number>()): number {
  if (seenIssues.has(node.issue.number)) return seenPrs.size;
  seenIssues.add(node.issue.number);
  for (const pr of node.prs) seenPrs.add(pr.number);
  for (const child of node.children) chainPrCount(child, seenIssues, seenPrs);
  return seenPrs.size;
}

function stageRank(issue: IssueLite) {
  const rank = STAGE_ORDER.indexOf(issue.stage as (typeof STAGE_ORDER)[number]);
  return rank === -1 ? STAGE_ORDER.length : rank;
}

export function chainUpdatedAt(node: ChainNode, seen = new Set<number>()): string {
  if (seen.has(node.issue.number)) return node.issue.updatedAt;
  seen.add(node.issue.number);

  let latest = node.issue.updatedAt;
  for (const pr of node.prs) if (pr.updatedAt > latest) latest = pr.updatedAt;
  for (const child of node.children) {
    const updatedAt = chainUpdatedAt(child, seen);
    if (updatedAt > latest) latest = updatedAt;
  }
  return latest;
}

export function chainSize(node: ChainNode, seen = new Set<number>()): number {
  if (seen.has(node.issue.number)) return 0;
  seen.add(node.issue.number);
  return 1 + node.children.reduce((total, child) => total + chainSize(child, seen), 0);
}

function sortChildren(node: ChainNode, path = new Set<number>()) {
  if (path.has(node.issue.number)) {
    node.children = [];
    return;
  }

  path.add(node.issue.number);
  node.children = node.children
    .filter((child) => !path.has(child.issue.number))
    .sort((a, b) => stageRank(a.issue) - stageRank(b.issue) || a.issue.number - b.issue.number);
  for (const child of node.children) sortChildren(child, new Set(path));
}

function buildStreamRoots(issues: IssueLite[], prs: IssueLite[]): ChainNode[] {
  const nodes = new Map<number, ChainNode>();
  for (const issue of issues) nodes.set(issue.number, { issue, children: [], prs: [] });

  for (const pr of prs) {
    for (const number of prTargetNumbers(pr)) nodes.get(number)?.prs.push(pr);
  }

  const roots: ChainNode[] = [];
  const parentByIssue = new Map<number, number>();
  for (const node of nodes.values()) {
    const parent = parentNumber(node.issue);
    const parentNode = parent != null && parent !== node.issue.number ? nodes.get(parent) : undefined;
    if (parentNode) {
      parentByIssue.set(node.issue.number, parentNode.issue.number);
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const reachable = new Set<number>();
  const mark = (node: ChainNode, path = new Set<number>()) => {
    if (reachable.has(node.issue.number) || path.has(node.issue.number)) return;
    reachable.add(node.issue.number);
    path.add(node.issue.number);
    for (const child of node.children) mark(child, new Set(path));
  };
  for (const root of roots) mark(root);

  const promotedCycles = new Set<string>();
  for (const node of nodes.values()) {
    if (reachable.has(node.issue.number)) continue;
    const cycle = parentChainCycle(node.issue.number, parentByIssue);
    if (cycle) {
      const key = [...cycle].sort((a, b) => a - b).join(",");
      if (promotedCycles.has(key)) continue;
      promotedCycles.add(key);

      const representative = nodes.get(cycle[0]);
      if (!representative) continue;
      detachFromParent(representative, parentByIssue, nodes);
      roots.push(representative);
      mark(representative);
      continue;
    }

    detachFromParent(node, parentByIssue, nodes);
    roots.push(node);
    mark(node);
  }

  for (const root of roots) sortChildren(root);
  roots.sort((a, b) => chainUpdatedAt(b).localeCompare(chainUpdatedAt(a)));
  return roots;
}

export function buildStreamChains(all: IssueLite[]): StreamChainGroup[] {
  const grouped = new Map<number, { issues: IssueLite[]; prs: IssueLite[] }>();

  for (const item of all) {
    const stream = streamNumber(item);
    if (stream == null) continue;
    if (!grouped.has(stream)) grouped.set(stream, { issues: [], prs: [] });
    const group = grouped.get(stream);
    if (!group) continue;
    if (item.isPR) group.prs.push(item);
    else group.issues.push(item);
  }

  return [...grouped.entries()]
    .map(([stream, group]) => {
      const roots = buildStreamRoots(group.issues, group.prs);
      const updatedAt = roots.reduce((latest, root) => {
        const next = chainUpdatedAt(root);
        return next > latest ? next : latest;
      }, "");
      return {
        stream,
        roots,
        updatedAt,
      };
    })
    .filter((group) => group.roots.length > 0)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.stream - b.stream);
}
