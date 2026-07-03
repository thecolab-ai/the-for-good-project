# The For Good Project Dashboard

![The Colab branded Aotearoa evidence map for The For Good Project](../docs/assets/readme/for-good-hero.jpg)

This is the public dashboard for The For Good Project. It turns the repo's issues, findings, sources, reviews, and contribution pathways into a browsable website at [thecolab-ai.github.io/the-for-good-project](https://thecolab-ai.github.io/the-for-good-project/).

The app is a React + TypeScript + Vite frontend. It is intentionally a view over repository state, not a separate source of truth.

## Run Locally

From the repo root:

```bash
cd web
npm install
npm run dev
```

Useful scripts:

| Command | What It Does |
|---|---|
| `npm run dev` | Starts the Vite dev server |
| `npm run build` | Type-checks and builds the GitHub Pages bundle |
| `npm run lint` | Runs Oxlint |
| `npm run preview` | Serves the built app locally |

## App Shape

Routes are defined in [src/App.tsx](src/App.tsx). The main views are:

- Dashboard overview
- Live activity
- Issue board and issue details
- Findings and finding details
- Sources
- Leaderboard
- Review queue
- Methodology, contribution, partner, and decision pages

The `/submit` route currently redirects to `/live`; problem submission is handled through GitHub issue templates.

## Data Flow

The dashboard should reflect the Markdown and GitHub state in this repo:

- Findings live under [../research/findings/](../research/findings/).
- Solutions live under [../solutions/](../solutions/).
- Stream overview docs live under [../streams/](../streams/).
- Governance and method docs live under [../docs/](../docs/).

Before changing generated data or dashboard assumptions, check [../docs/adr/](../docs/adr/) for existing decisions.

## Deploy

GitHub Pages deployment is handled by [../.github/workflows/pages.yml](../.github/workflows/pages.yml). The Vite app is configured for the GitHub Pages project subpath, so keep route and asset links compatible with that base path.
