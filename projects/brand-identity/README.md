---
title: "Brand identity — name, visual identity & the “Who we are” page"
agent: 'claude'
model: 'claude-opus-4-8[1m]'
issue: 185
status: prototype
confidence: High
---

# Brand identity: name, visual identity & "Who we are"

**What it is:** the project's brand kit and the "Who we are" team page — so a
partner (a charity GM, a policy analyst) meets a named, credible, human team
rather than an anonymous AI experiment.

**Who it's for:** anyone deciding whether to trust or partner with the project,
and any contributor who needs to keep the look, name, and voice consistent.

**Where it came from:** community demand-side feedback captured in
[issue #185](https://github.com/thecolab-ai/the-for-good-project/issues/185),
which surfaced trust as the deciding factor for the people we want to serve.
It extends the promises already made on the
[For partners page](https://thecolab-ai.github.io/the-for-good-project/#/partners).

## Why this matters (the load-bearing claim)

Trust is the whole game. Two things make it concrete, and both are well
evidenced:

1. **Showing the real people behind a site is a recognised marker of
   credibility.** The Nielsen Norman Group finds that team/executive photos
   "literally show the faces behind the organization," and that "credibility is
   a major issue on the Web" for visitors deciding whether to engage
   ([NN/g, *Great Summaries on 'About Us' Pages*](https://www.nngroup.com/articles/about-us-summaries/)).
   Independently, the Stanford Web Credibility Guidelines — drawn from research
   with 4,500+ people — advise sites to "show that there is a real organization
   behind your site" and "show that honest, trustworthy people stand behind your
   site" ([Stanford Web Credibility Project](https://credibility.stanford.edu/guidelines/index.html)).
   *Two independent authorities agree → High confidence.*

2. **In Aotearoa, trust in the charitable sector is actively measured and
   earned, not assumed.** Charities Services (Ngā Ratonga Kaupapa Atawhai, part
   of the Department of Internal Affairs) commissions regular Public Trust and
   Confidence surveys and states that transparency "builds trust… and supports
   better policy and funding decisions"
   ([Charities Services, *Research into charities*](https://www.charities.govt.nz/charities-in-new-zealand/research-into-charities)
   · [Wayback snapshot, 2026-06-21](http://web.archive.org/web/20260621225225/https://www.charities.govt.nz/charities-in-new-zealand/research-into-charities)).
   *Official NZ government source → High confidence.* (The live page 403s to
   automated fetchers — a bot block, not a dead link — so the archived snapshot
   is cited beside it per [ADR-0006](../../docs/adr/0006-fetch-proxy-browser-management.md).)

**Confidence: High** for both. See "What would change this" below.

## 1. Name & positioning

The project's name is **The For Good Project**, by **thecolab.ai**. It is
already carried across the site header, footer, and metadata
([`web/index.html`](../../web/index.html),
[`web/src/components/layout/Footer.tsx`](../../web/src/components/layout/Footer.tsx)),
so this issue **formalises the existing name rather than inventing a new one** —
a rename is a brand-level decision that belongs with a human steward, not an
agent (see the human gate in [docs/STREAMS.md](../../docs/STREAMS.md)).

- **Name:** The For Good Project
- **By-line (always paired):** by thecolab.ai
- **Positioning line (primary):** *An open research commons where New
  Zealanders and AI work our hardest public problems to a standard a real
  decision can rest on.*
- **Short tagline options** (for a human to pick one as the default):
  - "People and AI, working for good — in the open."
  - "Serious, cited evidence for Aotearoa's hardest problems."
  - "Agents grind. Humans steer. New Zealand benefits."

Voice: plain-English, honest about uncertainty, never overstated — the same
standard as the research method ([CONTRIBUTING.md](../../CONTRIBUTING.md)).

## 2. Visual identity

Consistent with The Colab's brand — **warm off-white, editorial serif
headings, navy/blue accents** ([thecolab.ai](https://thecolab.ai)). The system
is already implemented as design tokens; this documents it so it stays
consistent. Source of truth:
[`web/src/index.css`](../../web/src/index.css) and
[`web/tailwind.config.js`](../../web/tailwind.config.js).

**Colour**

| Role | Token / hex | Notes |
|---|---|---|
| Background (warm off-white) | `--background` · `#FBF9F6` cream | Editorial, low-glare |
| Ink / navy | `brand-navy` · `#1C1917` | Headings, primary buttons |
| Deep blue | `brand-indigo` · `#2E4057` | Gradients, secondary marks |
| Accent blue | `brand-cyan` · `#0EA5E9` (dark `#0284C7`) | Links, focus ring, highlights |
| Warm accent | `brand-orange` · `#C2410C` | Sparingly — "the ask", build stage |

A dark theme is defined in the same file (deep-navy background, cream text).

**Type**
- Headings: **Playfair Display** (editorial serif), `font-serif`.
- Body / UI: **Inter**, `font-sans`.
- Code / data: **JetBrains Mono**, `font-mono`.

**Logo** — the `LogoMark` in
[`web/src/components/layout/Logo.tsx`](../../web/src/components/layout/Logo.tsx):
three overlapping circles (people collaborating) in an indigo→cyan gradient,
always paired with the wordmark and "by thecolab.ai".

**Signature gradient:** indigo → cyan (`brand-gradient` utility) for hero
panels and calls to action.

## 3. The "Who we are" page

A live page at **`/team`** ("Who we are") — implemented, in the site:

- Page: [`web/src/pages/Team.tsx`](../../web/src/pages/Team.tsx)
- Data: [`web/src/lib/team.ts`](../../web/src/lib/team.ts)
- Routed in [`web/src/App.tsx`](../../web/src/App.tsx); linked from the top nav
  and reciprocally from the For partners page.

It presents the team as role cards (photo, name, role, one line of focus), an
explicit consent note, and a short "why we put our faces to it" section that
ties back to the trust evidence above.

### Human gate / consent (hard rule)

A real name or face is personal data. Under
[CONSTITUTION.md](../../CONSTITUTION.md) Article III and the same consent model
the [partners registry](../../partners/README.md) uses, **no individual's name
or photo goes in the repo or on the site without that person's explicit,
recorded consent.**

What the agent did (allowed) vs. what a human must do (gated):

| Agent drafted | Human supplies & signs off |
|---|---|
| Page layout, copy, role slots, placeholder avatars | The actual people, real names, and photos |
| The consent mechanism & this doc | The recorded consent for each person |

Until a person consents, their slot in `team.ts` keeps `name: null` /
`photo: null` and the page renders a dignified "added with consent" placeholder
— so the site is always **honest about who has actually signed off**. The
process to add a real person is in
[`CONSENT.md`](CONSENT.md) and in the header comment of `team.ts`.

## How to run

The page ships as part of the site. From the repo root:

```bash
cd web
npm install
npm run dev     # http://localhost:5173  → open /team
npm run build   # type-check + production build (passes)
```

## Status

**Prototype.** The brand kit and the page are built and building green. What's
**deliberately missing pending a human**:

- Real names and photos for the team (human-gated — the whole point of the
  consent rule). Until then the page shows placeholder slots.
- A human steward to confirm the positioning line / tagline choice and whether
  the five role slots match the real team shape.
- Optional: a favicon/OG image refresh if the steward wants beyond the current
  mark.

## What would change this conclusion

- If a steward decides the project should be **renamed** or **re-scoped**, the
  name/positioning section is superseded (that's a human call, not this doc's).
- If usability testing with actual partners showed the placeholder state reads
  as "unfinished/untrustworthy," the page should hide un-consented slots
  entirely rather than show placeholders.
- The credibility claim rests on NN/g + Stanford (web-credibility research) and
  Charities Services (NZ sector trust). It would weaken if newer NZ-specific
  evidence showed team pages *don't* move partner trust — I found no such
  evidence, but I did not locate an NZ-specific study isolating that effect.

**Could not verify:** a precise current NZ "trust score" figure — the
Charities Services survey PDFs (2014/2016/2019) sit behind a bot block; the
research page confirms the surveys exist and that transparency builds trust,
which is all this claim needs.

## Sources

- Nielsen Norman Group — *Great Summaries on 'About Us' Pages Engage Users and Build Credibility*: https://www.nngroup.com/articles/about-us-summaries/
- Stanford Web Credibility Project — *Guidelines*: https://credibility.stanford.edu/guidelines/index.html
- Charities Services — *Research into charities* (Public Trust and Confidence surveys): https://www.charities.govt.nz/charities-in-new-zealand/research-into-charities (archived: http://web.archive.org/web/20260621225225/https://www.charities.govt.nz/charities-in-new-zealand/research-into-charities)
- The Colab — brand reference: https://thecolab.ai
- In-repo design tokens: [`web/src/index.css`](../../web/src/index.css), [`web/tailwind.config.js`](../../web/tailwind.config.js)
