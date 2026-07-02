# ADR-0006: Fetch, proxy & browser management for research and citation checks

- **Status:** proposed
- **Date:** 2026-07-02
- **Deciders:** Proposed by PR (this one); accepted only if merged by a maintainer
- **Discussion:** For Good WhatsApp, 2 July 2026 (Adam: "create an ADR for proxy / browser management"). Motivating incident: [PR #81](https://github.com/thecolab-ai/the-for-good-project/pull/81).
- **Related:** [ADR-0005](0005-agent-execution-environment.md) (where/how we run agents). This ADR is the *fetch layer* that sits inside that environment.

## Context

Both halves of the pipeline live or die on fetching web sources: research **reads** them, review **verifies the citations**. Right now agents fetch with plain HTTP (`curl`/`WebFetch`), and that quietly fails on a big chunk of exactly the sources we care about:

- **Bot-protected / WAF sites** (`charities.govt.nz`, `communitymatters.govt.nz`) return **HTTP 403** to non-browser clients.
- **JS / redirect / CDN-hosted pages** (e.g. Squarespace `/data-1`) return **404** to `curl` but resolve fine in a real browser.
- **Datacentre-IP throttling/blocking** hits cloud/CI egress on official NZ data sites (see ADR-0005).

**This already caused a false outcome.** In PR #81 the finding was sound — its DIA figures were later reproduced *to the dollar* — yet it collected **four NEEDS_WORK reviews** largely because reviewers' `curl` got 404/403 and they reported "dead links." A better-equipped reviewer (browser rendering) confirmed the citations resolved and it merged **on the same commit**. So weak fetch tooling produces **false rejections** (waste, erodes trust in the gate) — and the mirror risk: a reviewer who *can't* fetch might wave through a genuinely dead link, or a researcher might cite a page they never actually read.

## Decision (proposed — Adam has design ideas to fold in)

**1. Standardise a shared fetch layer** used by both research and review, that prefers a **real browser / rendering fetch** (handles JS, redirects, cookies, WAF challenges, and PDFs) over plain HTTP. Verifying or citing a URL should go through this layer, not raw `curl`.

**2. Classify fetch failures — don't equate them:**
- **404 (not found)** → treat as a genuine dead-link problem.
- **403 / bot-challenge / timeout / TLS block** → treat as *likely tooling/IP*, **NOT** a citation defect. Must be retried via browser render and/or archive before a reviewer flags the citation. Reviewers should state *how* they fetched.

**3. Archive on cite.** When a finding cites a fragile, bot-protected, or date-stamped URL, also capture a **web-archive snapshot** (e.g. Wayback) so the citation stays verifiable and the reader has a stable copy. Prefer **official APIs** (Stats NZ Data API, Charities OData) over scraping wherever they exist.

**4. Proxy / egress management (framework here; specifics = Adam's design space).** Route fetches through egress that isn't blocked — **residential where datacentre IPs are refused** — with a per-site policy, sensible rate limits, respect for robots/ToS, and no leaking of credentials or the runner's identity/location. Exact mechanism (residential proxy pool vs run-on-residential-machine vs per-site rules, and any caching) is deliberately left open for Adam's input.

## Consequences

**Positive**
- Kills the #81 failure mode: far fewer false "dead link" rejections; the gate becomes trustworthy on bot-protected govt sites.
- Symmetric integrity: reviewers can actually confirm what a source says, so genuinely dead links get caught too.
- Stable citations (archive snapshots) survive link rot and date-stamped URLs.

**Negative / costs**
- Browser rendering + proxy infrastructure to build and maintain (fits inside the ADR-0005 container image).
- Proxies cost money and carry ethics/ToS obligations; must respect rate limits and site terms, and must not exfiltrate secrets or the server's network identity.
- A rendering fetch is slower and heavier than `curl` — fine for verification, needs sane timeouts.

## Alternatives considered

- **Status quo (plain `curl`/HTTP).** Rejected — it's the direct cause of the #81 false rejections.
- **Browser rendering only, no proxy.** Fixes JS/WAF/404-in-curl, but not datacentre-IP blocks.
- **Proxy only, no browser.** Fixes IP blocks, but not JS/redirect/challenge pages.
- Both are needed; they solve different failure modes.

## Open questions (for Adam's ideas)

- Which rendering tool / browser-fetch, and is it a shared `fetch` helper CLI in-repo?
- Proxy architecture: residential proxy provider, run-on-residential-machine, or per-site policy? Cost, ethics, and who operates it?
- Caching layer for repeated fetches, and how archive snapshots are stored/linked from findings.
- How the reviewer prompt should require "fetched via browser render / archive" evidence before flagging a link dead.
