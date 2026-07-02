# ADR-0006: Fetch, proxy & browser management for research and citation checks

- **Status:** accepted
- **Date:** 2026-07-02
- **Deciders:** Maintainers (Adam Holt), 2026-07-02
- **Discussion:** For Good WhatsApp, 2 July 2026 ("create an ADR for proxy / browser management") — [PR #100](https://github.com/thecolab-ai/the-for-good-project/pull/100). Motivating incident: [PR #81](https://github.com/thecolab-ai/the-for-good-project/pull/81).
- **Related:** [ADR-0005](0005-agent-execution-environment.md) (where/how we run agents). This ADR is the *fetch layer* that sits inside that environment.

## Context

Both halves of the pipeline live or die on fetching web sources: research
**reads** them, review **verifies the citations**. Agents currently fetch with
plain HTTP (`curl`/`WebFetch`), and that quietly fails on a big chunk of exactly
the sources we care about:

- **Bot-protected / WAF sites** (`charities.govt.nz`, `communitymatters.govt.nz`)
  return **HTTP 403** to non-browser clients.
- **JS / redirect / CDN-hosted pages** (e.g. Squarespace `/data-1`) return
  **404** to `curl` but resolve fine in a real browser.
- **Datacentre-IP throttling/blocking** hits cloud/CI egress on official NZ data
  sites (see ADR-0005).

**This already caused a false outcome.** In [PR #81](https://github.com/thecolab-ai/the-for-good-project/pull/81)
the finding was sound — its DIA figures were later reproduced *to the dollar* —
yet it collected **four NEEDS_WORK reviews** largely because reviewers' `curl`
got 404/403 and they reported "dead links." A browser-rendering reviewer
confirmed the citations resolved and it merged **on the same commit**. So weak
fetch tooling produces **false rejections** (waste, erodes trust in the gate) —
and the mirror risk: a reviewer who *can't* fetch might wave through a genuinely
dead link, or a researcher might cite a page they never actually read.

## Decision

**1. Standardise a shared fetch layer** used by both research and review that
prefers a **real browser / rendering fetch** (handles JS, redirects, cookies,
WAF challenges, and PDFs) over plain HTTP. Verifying or citing a URL should go
through this layer, not raw `curl`. **Agents that run in the cloud especially
must ship a real browser** — a headless cloud agent with only `curl` will
mis-report live government sources as dead.

**2. Classify fetch failures — don't equate them:**
- **404 (not found)** → treat as a genuine dead-link problem.
- **403 / bot-challenge / timeout / TLS block** → treat as *likely tooling/IP*,
  **NOT** a citation defect. Retry via browser render and/or archive before a
  reviewer flags the citation. Reviewers state *how* they fetched.

**3. Archive on cite.** When a finding cites a fragile, bot-protected, or
date-stamped URL, also capture a **web-archive snapshot** (e.g. Wayback) so the
citation stays verifiable and the reader has a stable copy. Prefer **official
APIs** (Stats NZ Data API, Charities OData) over scraping wherever they exist.

**4. Proxy / egress management (framework here; specifics tracked as follow-up).**
Route fetches through egress that isn't blocked — **residential where datacentre
IPs are refused** — with a per-site policy, sensible rate limits, respect for
robots/ToS, and no leaking of credentials or the runner's identity/location.
The exact mechanism (residential proxy pool vs run-on-residential-machine vs
per-site rules, and any caching) is a follow-up, not fixed by this ADR.

## Consequences

**Positive**
- Kills the #81 failure mode: far fewer false "dead link" rejections; the gate
  becomes trustworthy on bot-protected govt sites.
- Symmetric integrity: reviewers can actually confirm what a source says, so
  genuinely dead links still get caught.
- Stable citations (archive snapshots) survive link rot and date-stamped URLs.

**Negative / costs**
- Browser rendering + proxy infrastructure to build and maintain (fits inside
  the ADR-0005 container image).
- Proxies cost money and carry ethics/ToS obligations; must respect rate limits
  and site terms, and must not exfiltrate secrets or the server's network
  identity.
- A rendering fetch is slower and heavier than `curl` — fine for verification,
  needs sane timeouts.

## Alternatives considered

- **Status quo (plain `curl`/HTTP).** Rejected — the direct cause of the #81
  false rejections.
- **Browser rendering only, no proxy.** Fixes JS/WAF/404-in-curl, but not
  datacentre-IP blocks.
- **Proxy only, no browser.** Fixes IP blocks, but not JS/redirect/challenge
  pages. Both are needed; they solve different failure modes.

## Implementation status (updated 2026-07-03)

**Shipped:**
- **Shared fetch ladder as one CLI** — [`scripts/fetch.mjs`](../../scripts/fetch.mjs)
  runs curl → agent-browser (real Chrome) → CloakBrowser (stealth Chromium) in
  order, returns the first real page, and prints *how* it fetched. It refuses to
  pass a rendered bot-challenge as a successful read.
- **Failure classification (§2)** — `fetch.mjs` exits `4` for genuinely DEAD
  (404 even in a browser) and `3` for BLOCKED (403 / bot-challenge / timeout →
  tooling/IP, not a defect). The researcher and reviewer prompts in
  `start_work.sh` / `review_work.sh` and [`AGENTS.md`](../../AGENTS.md) now point
  at this command and require stating how a source was fetched.
- **Archive on cite (§3)** — [`scripts/archive-cite.mjs`](../../scripts/archive-cite.mjs)
  finds a recent Wayback snapshot (CDX API) or captures a fresh one and prints
  the snapshot URL; `fetch.mjs --archive` snapshots on success.

**Still open (tracked separately):**
- **Proxy / egress management (§4, Decision 4)** — datacentre-IP blocking is
  unaddressed; needs a residential-egress decision (cost/ethics/operator). See
  the tracking issue (#118).
- **Caching layer** for repeated fetches, and a convention for how archive
  snapshots are stored/linked in a finding's frontmatter (today it's a URL
  beside the live link).

## Follow-ups (not fixed here)

- Proxy architecture: residential proxy provider, run-on-residential-machine, or
  per-site policy? Cost, ethics, and who operates it. **(open — #118)**
- Caching layer for repeated fetches, and how archive snapshots are stored and
  linked from findings. **(open)**
- ~~Which rendering tool / browser-fetch, and whether it's a shared `fetch` helper CLI.~~ **(done — `scripts/fetch.mjs`)**
- ~~Update the reviewer prompt to require "fetched via browser render / archive" evidence before a link is flagged dead.~~ **(done)**
