// Build-time data snapshot for The For Good Project site.
// Fetches issues/PRs/contributors from the GitHub API and parses research
// findings from disk, then writes web/public/data/snapshot.json. Runs in the
// deploy Action (authenticated via GITHUB_TOKEN) and locally for testing.
import { writeFileSync, mkdirSync, readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(WEB_DIR, "..");
const OUT_DIR = path.join(WEB_DIR, "public", "data");

const REPO = process.env.FOR_GOOD_REPO || "thecolab-ai/the-for-good-project";
const [OWNER, NAME] = REPO.split("/");
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const API = "https://api.github.com";

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "for-good-site-builder",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function gh(url) {
  const res = await fetch(url.startsWith("http") ? url : `${API}${url}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${url}: ${await res.text()}`);
  return res;
}

async function ghPaged(pathname) {
  const out = [];
  let url = `${API}${pathname}${pathname.includes("?") ? "&" : "?"}per_page=100`;
  for (let i = 0; i < 20 && url; i++) {
    const res = await gh(url);
    out.push(...(await res.json()));
    const link = res.headers.get("link") || "";
    const next = link.split(",").find((s) => s.includes('rel="next"'));
    url = next ? next.slice(next.indexOf("<") + 1, next.indexOf(">")) : null;
  }
  return out;
}

function labelNames(issue) {
  return (issue.labels || []).map((l) => (typeof l === "string" ? l : l.name));
}
function pick(labels, prefix) {
  const l = labels.find((n) => n.startsWith(prefix));
  return l ? l.slice(prefix.length).trim() : null;
}
function person(u) {
  return u ? { login: u.login, avatar: u.avatar_url, url: u.html_url } : null;
}

async function main() {
  console.log(`Building snapshot for ${REPO}${TOKEN ? " (authenticated)" : " (unauthenticated)"}`);

  const repoMeta = await (await gh(`/repos/${OWNER}/${NAME}`)).json();
  const rawIssues = await ghPaged(`/repos/${OWNER}/${NAME}/issues?state=all`);
  const rawPulls = await ghPaged(`/repos/${OWNER}/${NAME}/pulls?state=all`);
  let commitContributors = [];
  try {
    commitContributors = await ghPaged(`/repos/${OWNER}/${NAME}/contributors`);
  } catch (e) {
    console.warn("contributors unavailable:", e.message);
  }

  const mergedByNumber = new Map(rawPulls.map((p) => [p.number, !!p.merged_at]));

  // PR reviews (who reviewed whose PR) — used for review credit. A review counts
  // only if it's a substantive verdict (APPROVED / CHANGES_REQUESTED) and the
  // reviewer is not the PR author. Counted once per (reviewer, PR).
  const reviewsGiven = new Map();  // login -> Set(prNumbers)
  const reviewLast = new Map();    // login -> most recent review ISO timestamp
  try {
    let after = null;
    for (let i = 0; i < 10; i++) {
      const q = `query($cursor:String){repository(owner:"${OWNER}",name:"${NAME}"){pullRequests(first:50,after:$cursor,states:[OPEN,MERGED,CLOSED]){pageInfo{hasNextPage endCursor} nodes{number author{login} reviews(first:50){nodes{author{login} state submittedAt}}}}}}`;
      const gres = await fetch(`${API}/graphql`, { method: "POST", headers, body: JSON.stringify({ query: q, variables: { cursor: after } }) });
      if (!gres.ok) { console.warn("reviews graphql:", gres.status); break; }
      const data = (await gres.json())?.data?.repository?.pullRequests;
      if (!data) break;
      for (const pr of data.nodes) {
        const prAuthor = pr.author?.login;
        for (const rv of pr.reviews.nodes) {
          const who = rv.author?.login;
          if (!who || who === prAuthor) continue;
          if (rv.state !== "APPROVED" && rv.state !== "CHANGES_REQUESTED") continue;
          if (!reviewsGiven.has(who)) reviewsGiven.set(who, new Set());
          reviewsGiven.get(who).add(pr.number);
          const at = rv.submittedAt;
          if (at && (!reviewLast.has(who) || new Date(at) > new Date(reviewLast.get(who)))) reviewLast.set(who, at);
        }
      }
      if (!data.pageInfo.hasNextPage) break;
      after = data.pageInfo.endCursor;
    }
  } catch (e) { console.warn("reviews unavailable:", e.message); }

  // --- issues + PRs ---
  const issues = [];
  for (const it of rawIssues) {
    const labels = labelNames(it);
    const isPR = !!it.pull_request;
    const stage = pick(labels, "stage:") || "none";
    const status = pick(labels, "status:") || "none";
    const domain = pick(labels, "domain:");
    let commentsList;
    if (it.comments > 0 && it.comments <= 60) {
      try {
        const cs = await ghPaged(`/repos/${OWNER}/${NAME}/issues/${it.number}/comments`);
        commentsList = cs.map((c) => ({
          author: c.user?.login || "unknown",
          avatar: c.user?.avatar_url || "",
          body: c.body || "",
          createdAt: c.created_at,
        }));
      } catch { /* ignore */ }
    }
    issues.push({
      number: it.number,
      title: it.title,
      state: it.state,
      isPR,
      merged: isPR ? !!mergedByNumber.get(it.number) : undefined,
      url: it.html_url,
      body: it.body || "",
      stage,
      status,
      domain,
      labels,
      author: person(it.user),
      assignees: (it.assignees || []).map(person),
      createdAt: it.created_at,
      updatedAt: it.updated_at,
      comments: it.comments,
      commentsList,
      reactions: it.reactions?.total_count || 0,
    });
  }

  const realIssues = issues.filter((i) => !i.isPR);
  const prs = issues.filter((i) => i.isPR);

  // --- findings from disk ---
  const findingsDir = path.join(REPO_ROOT, "research", "findings");
  const findings = [];
  const sources = [];
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (!entry.endsWith(".md")) continue;
      if (["README.md", "TEMPLATE.md"].includes(entry)) continue;
      const rel = path.relative(REPO_ROOT, full).replace(/\\/g, "/");
      const raw = readFileSync(full, "utf8");
      const { data, content } = matter(raw);
      const domain = data.domain || path.basename(path.dirname(full));
      // sources: markdown links anywhere, de-duped
      const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
      const seen = new Set();
      const fSources = [];
      let m;
      while ((m = linkRe.exec(raw))) {
        const url = m[2];
        if (seen.has(url)) continue;
        seen.add(url);
        const label = m[1].slice(0, 120);
        fSources.push({ label, url });
        let host = "link";
        try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { /* */ }
        sources.push({ url, host, label, domain, findingPath: rel, findingTitle: data.title || entry });
      }
      const summary = (content.match(/## Executive answer\s+([\s\S]*?)(?=\n## |$)/)?.[1] || content)
        .replace(/[#>*`-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 280);
      findings.push({
        path: rel,
        // Stable, URL-safe id for the in-app detail route (/findings/<slug>),
        // e.g. research/findings/ai-policy/foo.md -> ai-policy/foo
        slug: rel.replace(/^research\/findings\//, "").replace(/\.md$/, ""),
        title: data.title || entry.replace(/\.md$/, ""),
        domain,
        confidence: data.confidence || "Unknown",
        author: data.author || "unknown",
        agent: data.agent && data.agent !== "none" ? String(data.agent) : "",
        model: data.model ? String(data.model) : "",
        date: data.date ? String(data.date) : "",
        url: `${repoMeta.html_url}/blob/${repoMeta.default_branch}/${rel}`,
        summary,
        body: content,
        sources: fSources,
      });
    }
  };
  walk(findingsDir);

  // --- leaderboard ---
  const people = new Map();
  const newPerson = (login, avatar, url) => ({ login, avatar, url, issuesAssigned: 0, prsMerged: 0, prsOpened: 0, findingsAuthored: 0, commits: 0, reviewsGiven: 0, score: 0, lastActivity: null, domains: new Set() });
  const bumpActivity = (r, iso) => {
    if (!r || !iso) return;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return;
    if (!r.lastActivity || t > new Date(r.lastActivity).getTime()) r.lastActivity = new Date(iso).toISOString();
  };
  const ensure = (p) => {
    if (!p) return null;
    if (!people.has(p.login)) people.set(p.login, newPerson(p.login, p.avatar, p.url));
    return people.get(p.login);
  };
  for (const i of realIssues) for (const a of i.assignees) { const r = ensure(a); if (r && i.domain) r.domains.add(i.domain); if (r) { r.issuesAssigned++; bumpActivity(r, i.updatedAt); } }
  for (const p of prs) { const r = ensure(p.author); if (r) { r.prsOpened++; if (p.merged) r.prsMerged++; bumpActivity(r, p.updatedAt); } }
  for (const c of commitContributors) { const r = ensure(person(c)); if (r) r.commits += c.contributions || 0; }
  for (const f of findings) {
    const login = f.author && f.author !== "unknown" ? f.author.replace(/^@/, "") : null;
    if (!login) continue;
    if (!people.has(login)) people.set(login, newPerson(login, `https://github.com/${login}.png`, `https://github.com/${login}`));
    const r = people.get(login); r.findingsAuthored++; if (f.domain) r.domains.add(f.domain); bumpActivity(r, f.date);
  }
  for (const [login, prset] of reviewsGiven) {
    if (!people.has(login)) people.set(login, newPerson(login, `https://github.com/${login}.png`, `https://github.com/${login}`));
    people.get(login).reviewsGiven = prset.size;
    bumpActivity(people.get(login), reviewLast.get(login));
  }
  const BOTS = new Set(["github-actions[bot]", "dependabot[bot]"]);
  const leaderboard = [...people.values()]
    .filter((p) => !BOTS.has(p.login))
    .map((p) => {
      const researchScore = p.findingsAuthored * 5 + p.prsMerged * 3 + p.issuesAssigned * 2 + p.prsOpened + Math.min(p.commits, 50);
      const reviewScore = p.reviewsGiven * 4;
      return { ...p, domains: [...p.domains], researchScore, reviewScore, score: researchScore + reviewScore };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);

  // --- aggregates ---
  const count = (arr, key) => arr.reduce((acc, x) => { const k = x[key]; if (k && k !== "none") acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  const openIssues = realIssues.filter((i) => i.state === "open");
  const STAGES = [
    { stage: "discover", label: "Discover" },
    { stage: "research", label: "Research" },
    { stage: "ideate", label: "Ideate" },
    { stage: "build", label: "Build" },
  ];
  const pipeline = STAGES.map((s) => ({
    ...s,
    open: realIssues.filter((i) => i.stage === s.stage && i.state === "open").length,
    done: realIssues.filter((i) => i.stage === s.stage && i.state === "closed").length,
  }));

  const reviewQueue = [
    ...realIssues.filter((i) => i.state === "open" && i.status === "in-review"),
    ...prs.filter((p) => p.state === "open"),
  ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const activity = [...issues]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 20)
    .map((i) => ({
      type: i.isPR ? "pr" : "issue",
      title: i.title,
      url: i.url,
      actor: i.author?.login || "unknown",
      avatar: i.author?.avatar || "",
      at: i.updatedAt,
      meta: i.isPR ? (i.merged ? "merged" : i.state) : i.stage !== "none" ? i.stage : i.state,
    }));

  const snapshot = {
    generatedAt: new Date().toISOString(),
    repo: { owner: OWNER, name: NAME, url: repoMeta.html_url, description: repoMeta.description || "", homepage: repoMeta.homepage || "" },
    stats: {
      totalIssues: realIssues.length,
      openIssues: openIssues.length,
      closedIssues: realIssues.length - openIssues.length,
      totalPRs: prs.length,
      openPRs: prs.filter((p) => p.state === "open").length,
      mergedPRs: prs.filter((p) => p.merged).length,
      findings: findings.length,
      contributors: leaderboard.length,
      reviews: [...reviewsGiven.values()].reduce((n, s) => n + s.size, 0),
      sources: new Set(sources.map((s) => s.url)).size,
      byStage: count(openIssues, "stage"),
      byStatus: count(openIssues, "status"),
      byDomain: count(openIssues, "domain"),
    },
    pipeline,
    issues,
    reviewQueue,
    leaderboard,
    findings,
    sources,
    activity,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, "snapshot.json"), JSON.stringify(snapshot, null, 2));
  console.log(`Wrote snapshot: ${realIssues.length} issues, ${prs.length} PRs, ${findings.length} findings, ${leaderboard.length} contributors, ${snapshot.stats.sources} sources.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
