// Build-time data snapshot for The For Good Project site.
// Fetches issues/PRs/contributors from the GitHub API and parses research
// findings from disk, then writes web/public/data/snapshot.json. Runs in the
// deploy Action (authenticated via GITHUB_TOKEN) and locally for testing.
//
// Auth: prefers $GITHUB_TOKEN / $GH_TOKEN (what the deploy Action sets), and
// falls back to your local `gh` login via `gh auth token`. That fallback is
// deliberate — it means you NEVER have to put a token on the command line
// (`GITHUB_TOKEN=gho_… node scripts/build-data.mjs`). Doing that once leaked a
// live token into a public PR comment and it had to be revoked (PR #585). Just
// run `node scripts/build-data.mjs`; if you're logged in with `gh`, it's
// authenticated, and if not it still runs — just rate-limited, not broken.
import { writeFileSync, mkdirSync, readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import path from "node:path";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(WEB_DIR, "..");
// DATA_OUT_DIR: self-hosted deployments write the live snapshot to an
// UNTRACKED dir (mounted into the serving container) so the 10-min refresh
// cron never dirties the checkout (ADR-0018). Default: the tracked path,
// exactly as before (CI/Pages and local dev unchanged).
const OUT_DIR = process.env.DATA_OUT_DIR || path.join(WEB_DIR, "public", "data");

const REPO = process.env.FOR_GOOD_REPO || "thecolab-ai/the-for-good-project";
const [OWNER, NAME] = REPO.split("/");

// Fall back to the local gh login so nobody ever has to inline a token (see the
// header note). Never throws: if gh is absent or logged out we run unauthenticated.
function ghAuthToken() {
  try {
    return execFileSync("gh", ["auth", "token"], {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "";
  }
}
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ghAuthToken();
const API = "https://api.github.com";

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "for-good-site-builder",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gh(url, attempt = 0) {
  const res = await fetch(url.startsWith("http") ? url : `${API}${url}`, { headers });
  if (!res.ok) {
    // GitHub throttling (403 secondary-rate-limit / 429) and 5xx blips are
    // transient — retry with backoff rather than failing the whole deploy.
    if ((res.status === 403 || res.status === 429 || res.status >= 500) && attempt < 5) {
      const ra = Number(res.headers.get("retry-after"));
      const wait = ra > 0 ? ra * 1000 : Math.min(60000, 2000 * 2 ** attempt);
      console.warn(`GitHub API ${res.status} for ${url} — retry ${attempt + 1}/5 in ${Math.round(wait / 1000)}s`);
      await sleep(wait);
      return gh(url, attempt + 1);
    }
    throw new Error(`GitHub API ${res.status} for ${url}: ${await res.text()}`);
  }
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

// Fold known alternate author spellings onto one canonical GitHub login, so a
// contributor who ran an agent under different git credentials (e.g. an
// overnight run with no GH creds) doesn't split into several leaderboard
// people. Keyed by lowercased alias. Add a row here when it recurs.
const AUTHOR_ALIASES = {
  "richard-fortune": "richardofortune",
  "richard fortune": "richardofortune",
};
function canonicalAuthor(a) {
  const s = String(a || "").replace(/^@/, "").trim();
  return AUTHOR_ALIASES[s.toLowerCase()] || s;
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

  const pullMetaByNumber = new Map(rawPulls.map((p) => [p.number, {
    headRefName: p.head?.ref || "",
  }]));
  const mergedByNumber = new Map(rawPulls.map((p) => [p.number, !!p.merged_at]));

  // PR reviews (who reviewed whose PR) — used for review credit. A review counts
  // only if it's a substantive verdict (APPROVED / CHANGES_REQUESTED) and the
  // reviewer is not the PR author. Counted once per (reviewer, PR).
  const reviewsGiven = new Map();  // login -> Set(prNumbers)
  const reviewLast = new Map();    // login -> most recent review ISO timestamp
  const reviewPeopleByPr = new Map(); // pr number -> Map(login -> Person)
  const pathToAuthor = new Map(); // repo file path -> { login, merged, mergedAt } of the PR that added/last-touched it
  const nameVotes = new Map();    // login -> Map(display name -> count), from commit author names
  try {
    let after = null;
    for (let i = 0; i < 10; i++) {
      const q = `query($cursor:String){repository(owner:"${OWNER}",name:"${NAME}"){pullRequests(first:50,after:$cursor,states:[OPEN,MERGED,CLOSED]){pageInfo{hasNextPage endCursor} nodes{number mergedAt author{login} files(first:100){nodes{path}} commits(last:1){nodes{commit{author{name}}}} reviews(first:50){nodes{author{login avatarUrl url} state submittedAt}}}}}}`;
      const gres = await fetch(`${API}/graphql`, { method: "POST", headers, body: JSON.stringify({ query: q, variables: { cursor: after } }) });
      if (!gres.ok) { console.warn("reviews graphql:", gres.status); break; }
      const data = (await gres.json())?.data?.repository?.pullRequests;
      if (!data) break;
      for (const pr of data.nodes) {
        const prAuthor = pr.author?.login;
        if (prAuthor) {
          // Which GitHub user added/last-touched each file — the reliable author
          // identity, independent of git user.name or finding frontmatter.
          for (const fn of pr.files?.nodes || []) {
            const p = fn.path, prev = pathToAuthor.get(p), merged = !!pr.mergedAt;
            if (!prev || (merged && (!prev.merged || (pr.mergedAt || "") > (prev.mergedAt || "")))) {
              pathToAuthor.set(p, { login: prAuthor, merged, mergedAt: pr.mergedAt });
            }
          }
          // Vote for this user's display name from their commit's author name.
          const nm = pr.commits?.nodes?.[0]?.commit?.author?.name;
          if (nm) { const mv = nameVotes.get(prAuthor) || new Map(); mv.set(nm, (mv.get(nm) || 0) + 1); nameVotes.set(prAuthor, mv); }
        }
        for (const rv of pr.reviews.nodes) {
          const who = rv.author?.login;
          if (!who || who === prAuthor) continue;
          if (rv.state !== "APPROVED" && rv.state !== "CHANGES_REQUESTED") continue;
          if (!reviewsGiven.has(who)) reviewsGiven.set(who, new Set());
          reviewsGiven.get(who).add(pr.number);
          if (!reviewPeopleByPr.has(pr.number)) reviewPeopleByPr.set(pr.number, new Map());
          reviewPeopleByPr.get(pr.number).set(who, { login: who, avatar: rv.author?.avatarUrl || "", url: rv.author?.url || `https://github.com/${who}` });
          const at = rv.submittedAt;
          if (at && (!reviewLast.has(who) || new Date(at) > new Date(reviewLast.get(who)))) reviewLast.set(who, at);
        }
      }
      if (!data.pageInfo.hasNextPage) break;
      after = data.pageInfo.endCursor;
    }
  } catch (e) { console.warn("reviews unavailable:", e.message); }

  // Harness/agent tokens that sometimes land in a finding's `author:` field —
  // never real people, so they must not become leaderboard entries.
  const HARNESS = new Set(["codex", "claude", "hermes", "hermes-agent", "none", "unknown", "human"]);
  // The most common display name a GitHub user has committed under (e.g. Adam
  // has no GitHub profile name but commits as "Adam Holt"). Falls back to login.
  const mostCommonName = (login) => {
    const mv = nameVotes.get(login);
    if (!mv || mv.size === 0) return null;
    return [...mv.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
  };

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
          url: c.html_url,
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
      ...(isPR ? { headRefName: pullMetaByNumber.get(it.number)?.headRefName || "" } : {}),
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
        issue: Number(String(data.issue ?? "").replace(/[^0-9]/g, "")) || null,
        date: data.date ? String(data.date) : "",
        url: `${repoMeta.html_url}/blob/${repoMeta.default_branch}/${rel}`,
        summary,
        body: content,
        sources: fSources,
      });
    }
  };
  walk(findingsDir);

  // --- ADRs (architecture decision records) from disk ---
  const adrDir = path.join(REPO_ROOT, "docs", "adr");
  const adrs = [];
  if (existsSync(adrDir)) {
    for (const entry of readdirSync(adrDir).sort()) {
      if (!entry.endsWith(".md") || ["README.md", "TEMPLATE.md"].includes(entry)) continue;
      const raw = readFileSync(path.join(adrDir, entry), "utf8");
      adrs.push({
        number: (raw.match(/#\s*ADR-(\d+)/) || [])[1] || (entry.match(/^(\d+)/) || [])[1] || "",
        slug: entry.replace(/\.md$/, ""),
        title: (raw.match(/^#\s*ADR-\d+:\s*(.+)$/m) || [])[1]?.trim() || entry.replace(/\.md$/, ""),
        status: (raw.match(/\*\*Status:\*\*\s*(.+)$/m) || [])[1]?.trim() || "",
        date: (raw.match(/\*\*Date:\*\*\s*(.+)$/m) || [])[1]?.trim() || "",
        body: raw,
        url: `${repoMeta.html_url}/blob/${repoMeta.default_branch}/docs/adr/${entry}`,
      });
    }
    adrs.sort((a, b) => a.number.localeCompare(b.number));
  }

  // --- stream overview docs (the plain-language "output" of a stream) ---
  const streamsDir = path.join(REPO_ROOT, "streams");
  const streamDocs = [];
  if (existsSync(streamsDir)) {
    for (const entry of readdirSync(streamsDir).sort()) {
      if (!entry.endsWith(".md") || ["README.md", "TEMPLATE.md"].includes(entry)) continue;
      const { data, content } = matter(readFileSync(path.join(streamsDir, entry), "utf8"));
      streamDocs.push({
        stream: Number(data.stream ?? (entry.match(/^(\d+)/) || [])[1] ?? 0),
        title: data.title || "",
        state: data.state || "",
        steward: data.steward || "",
        domain: data.domain || "",
        updated: data.updated ? String(data.updated) : "",
        image: data.image || "",
        body: content,
        url: `${repoMeta.html_url}/blob/${repoMeta.default_branch}/streams/${entry}`,
      });
    }
  }

  // --- per-stream summary (light index layer) + provenance rollup ---
  // Provenance comes from the .md frontmatter (agent = harness, model, author),
  // plus GitHub actors (issue authors/assignees, PR authors). stream:<n> labels
  // (applied to issues AND PRs by stream-sync) are the grouping key.
  const streamLabelOf = (item) => {
    const l = (item.labels || []).find((x) => /^stream:\d+$/i.test(x));
    return l ? Number(l.replace(/stream:/i, "")) : null;
  };
  const issueStream = new Map();
  for (const it of issues) { const s = streamLabelOf(it); if (s) issueStream.set(it.number, s); }
  const streamAgg = new Map();
  const ensureStream = (s) => {
    if (!streamAgg.has(s)) streamAgg.set(s, { stream: s, title: "", domain: "", state: "", steward: "", updated: "", image: "",
      issues: 0, openIssues: 0, mergedPRs: 0, findings: 0, agents: {}, models: {}, people: new Map() });
    return streamAgg.get(s);
  };
  const addStreamPerson = (agg, p) => { if (p && p.login && !agg.people.has(p.login)) agg.people.set(p.login, { login: p.login, avatar: p.avatar, url: p.url }); };
  for (const it of realIssues) {
    const s = streamLabelOf(it); if (!s) continue;
    const a = ensureStream(s);
    a.issues++; if (it.state === "open") a.openIssues++;
    if (it.updatedAt > a.updated) a.updated = it.updatedAt;
    if (it.stage === "discover") { if (!a.title) a.title = it.title.replace(/^\[[^\]]+\]\s*/, ""); if (!a.state) a.state = it.status; }
    if (!a.domain && it.domain) a.domain = it.domain;
    addStreamPerson(a, it.author); (it.assignees || []).forEach((p) => addStreamPerson(a, p));
  }
  for (const p of prs) {
    const s = streamLabelOf(p); if (!s) continue;
    const a = ensureStream(s);
    if (p.merged) a.mergedPRs++;
    if (p.updatedAt > a.updated) a.updated = p.updatedAt;
    addStreamPerson(a, p.author);
    for (const reviewer of reviewPeopleByPr.get(p.number)?.values() ?? []) addStreamPerson(a, reviewer);
  }
  for (const f of findings) {
    const s = f.issue ? issueStream.get(f.issue) : null; if (!s) continue;
    const a = ensureStream(s);
    a.findings++;
    const harness = f.agent || "human";
    a.agents[harness] = (a.agents[harness] || 0) + 1;
    if (f.model) a.models[f.model] = (a.models[f.model] || 0) + 1;
    const login = canonicalAuthor(f.author);
    if (login && login !== "unknown" && !a.people.has(login)) a.people.set(login, { login, avatar: `https://github.com/${login}.png`, url: `https://github.com/${login}` });
  }
  for (const d of streamDocs) {
    const a = ensureStream(d.stream);
    if (d.title) a.title = d.title;
    if (d.state) a.state = d.state;
    if (d.steward) {
      a.steward = d.steward;
      const login = String(d.steward).replace(/^@/, "");
      if (login) addStreamPerson(a, { login, avatar: `https://github.com/${login}.png`, url: `https://github.com/${login}` });
    }
    if (!a.domain && d.domain) a.domain = d.domain;
    if (d.image) a.image = d.image;
  }
  const streamsSummary = [...streamAgg.values()].map((a) => ({
    stream: a.stream, title: a.title || `Stream #${a.stream}`, domain: a.domain, state: a.state, steward: a.steward, updated: a.updated, image: a.image,
    issues: a.issues, openIssues: a.openIssues, mergedPRs: a.mergedPRs, findings: a.findings,
    agents: a.agents, models: a.models, people: [...a.people.values()],
    hasOverview: streamDocs.some((d) => d.stream === a.stream && (d.body || "").trim().length > 0),
  })).sort((x, y) => (y.updated || "").localeCompare(x.updated || "") || x.stream - y.stream);

  // --- leaderboard ---
  const people = new Map();
  const newPerson = (login, avatar, url) => ({ login, avatar, url, issuesAssigned: 0, prsMerged: 0, prsOpened: 0, findingsAuthored: 0, synthesesAuthored: 0, commits: 0, reviewsGiven: 0, score: 0, lastActivity: null, domains: new Set() });
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
    // Attribute a finding to the GitHub user who OPENED THE PR that added it —
    // the reliable identity. Fall back to the frontmatter author only if no PR
    // maps to the file, and never credit a harness name (codex/claude/…).
    let login = pathToAuthor.get(f.path)?.login || null;
    if (!login && f.author && f.author !== "unknown") {
      const c = canonicalAuthor(f.author);
      if (c && !HARNESS.has(c.toLowerCase())) login = c;
    }
    if (!login) continue;
    if (!people.has(login)) people.set(login, newPerson(login, `https://github.com/${login}.png`, `https://github.com/${login}`));
    const r = people.get(login); r.findingsAuthored++; if (f.domain) r.domains.add(f.domain); bumpActivity(r, f.date);
  }
  for (const p of prs) {
    // Synthesis credit is keyed to the merged synthesis PR, not merely the
    // latest edit to a stream overview file. That keeps typo/steward edits from
    // taking credit for the synthesis while still counting re-synthesis PRs.
    if (!p.merged || !String(p.headRefName || "").startsWith("synthesis/")) continue;
    const r = ensure(p.author);
    if (!r) continue;
    r.synthesesAuthored++;
    bumpActivity(r, p.updatedAt);
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
      const synthesisScore = p.synthesesAuthored * 5;
      const reviewScore = p.reviewsGiven * 4;
      // `score` is the display total (research + synthesis + review). `trustCredit`
      // is what the merge gate consumes (scripts/merge_ready.sh) and is deliberately
      // research + review only: earning merge-gate trust is a governance decision,
      // so synthesis credit stays display-only until the trust model is changed by
      // a maintainer. Keeping them separate lets the leaderboard reward synthesis
      // without silently lowering the bar to gate other people's merges.
      const trustCredit = researchScore + reviewScore;
      return { ...p, name: mostCommonName(p.login), domains: [...p.domains], researchScore, synthesisScore, reviewScore, trustCredit, score: researchScore + synthesisScore + reviewScore };
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

  // --- live comment feed + active actors ---
  // A flat, newest-first stream of comments across every issue and PR, plus a
  // short list of who's been active recently — powering the /live feed and the
  // dashboard's "Live activity" widget. Fully static: the client polls this
  // snapshot, and a new comment triggers a rebuild (see pages.yml).
  //
  // Every active contributor on this project is currently an agent — humans are
  // the judgement layer (they review and steward), while the volume of commits,
  // comments and PRs is produced by agents running on contributors' own tokens.
  // So we simply treat all non-bookkeeping-bot actors as agents. When humans
  // start participating directly (commenting/committing as themselves), restore
  // per-actor detection here (a [bot] check + an AGENT_LOGINS allowlist).
  const isAgent = (login) => !!login && !BOTS.has(login);

  // Strip markdown/URLs down to a readable one-line snippet for the feed.
  const snippet = (s) =>
    (s || "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/[#>*`_~|]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 240);

  const comments = [];
  for (const it of issues) {
    if (!it.commentsList) continue;
    for (const c of it.commentsList) {
      if (BOTS.has(c.author)) continue; // drop label/dependency bookkeeping noise
      comments.push({
        author: c.author,
        avatar: c.avatar,
        isAgent: isAgent(c.author),
        body: snippet(c.body),
        createdAt: c.createdAt,
        url: c.url || it.url,
        issueNumber: it.number,
        issueTitle: it.title,
        isPR: it.isPR,
      });
    }
  }
  comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const recentComments = comments.slice(0, 60);

  // Distinct actors seen recently (comments + issue/PR updates), newest first.
  const actorSeen = new Map();
  const noteActor = (login, avatar, at) => {
    if (!login || BOTS.has(login) || !at) return;
    const t = new Date(at).getTime();
    if (Number.isNaN(t)) return;
    const cur = actorSeen.get(login);
    if (!cur || t > new Date(cur.at).getTime()) {
      actorSeen.set(login, { login, avatar: avatar || cur?.avatar || "", isAgent: isAgent(login), at: new Date(at).toISOString() });
    }
  };
  for (const c of comments) noteActor(c.author, c.avatar, c.createdAt);
  for (const it of issues) noteActor(it.author?.login, it.author?.avatar, it.updatedAt);
  const activeActors = [...actorSeen.values()].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12);

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
      // Synthesis-gate visibility (#292): drained streams queued for (or
      // parked at) the human G1 gate — the site surfaces backlog depth.
      synthesisQueue: openIssues.filter((i) => i.status === "needs-synthesis").length,
      awaitingDirection: openIssues.filter((i) => i.status === "awaiting-direction").length,
      byDomain: count(openIssues, "domain"),
    },
    pipeline,
    issues,
    reviewQueue,
    leaderboard,
    findings,
    sources,
    activity,
    comments: recentComments,
    activeActors,
    adrs,
    streamDocs,
    streamsSummary,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, "snapshot.json"), JSON.stringify(snapshot, null, 2));
  // Light, standalone streams index — the overview page can fetch this instead
  // of the full snapshot as the number of streams grows.
  writeFileSync(path.join(OUT_DIR, "streams-summary.json"), JSON.stringify({ generatedAt: snapshot.generatedAt, streams: streamsSummary }, null, 2));
  console.log(`Wrote snapshot: ${realIssues.length} issues, ${prs.length} PRs, ${findings.length} findings, ${leaderboard.length} contributors, ${snapshot.stats.sources} sources, ${recentComments.length} recent comments, ${activeActors.length} active actors.`);

  // SEO: regenerate sitemap.xml from live content so new findings/streams are crawlable.
  try {
    const SITE = "https://thecolab-ai.github.io/the-for-good-project";
    const lastmod = (snapshot.generatedAt || new Date().toISOString()).slice(0, 10);
    const urls = new Set(["/", "/streams", "/findings", "/sources", "/partners", "/methodology", "/leaderboard", "/board", "/contribute", "/team", "/live"]);
    for (const f of findings) if (f.slug) urls.add(`/findings/${f.slug}`);
    for (const s of streamsSummary) if (s.stream != null) urls.add(`/streams/${s.stream}`);
    const freq = (u) => (u === "/" || u === "/findings" || u === "/streams" || u === "/live" ? "daily" : "weekly");
    const body = [...urls].map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${lastmod}</lastmod><changefreq>${freq(u)}</changefreq></url>`).join("\n");
    writeFileSync(path.join(WEB_DIR, "public", "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
    console.log(`Wrote sitemap.xml: ${urls.size} URLs.`);
  } catch (e) {
    console.warn("sitemap generation skipped:", e && e.message);
  }
}

main().catch((e) => {
  console.error("build-data failed:", e?.message || e);
  // Don't take the whole site deploy down over a transient GitHub API failure
  // (secondary rate limits are common under heavy agent activity). If a
  // previous snapshot exists (it's committed), keep it and let the build ship
  // last-known-good data; only hard-fail if there's nothing to fall back to.
  if (existsSync(path.join(OUT_DIR, "snapshot.json"))) {
    console.warn("Keeping previous snapshot.json so the site still deploys with last-known-good data.");
    process.exit(0);
  }
  process.exit(1);
});
