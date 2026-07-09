#!/usr/bin/env bash
# refresh-web-data.sh — regenerate the site's data snapshot on the HOST.
#
# WHY: the container image bakes web/public/data/* at build time, and the
# 15-min refresh cron in .github/workflows/pages.yml only updates the GitHub
# Pages deployment — a self-hosted fleet server (STATIC_DIR serving the site)
# would drift stale forever. This script runs web/scripts/build-data.mjs in
# the repo checkout and the deployment bind-mounts web/public/data into the
# container (see docker-compose.override.yml on the deploy box), so the site
# serves a fresh snapshot without an image rebuild.
#
# Run from cron/systemd every ~10 min on the box that hosts the compose stack:
#   */10 * * * *  /path/to/repo/server/scripts/refresh-web-data.sh >> ~/.forgood/refresh-web-data.log 2>&1
#
# Auth: uses FLEET_GITHUB_TOKEN from server/.env (the fleet bot token) as
# GITHUB_TOKEN so the ~40 API calls don't run anonymous (60/h rate limit).
# Never prints the token. Findings/streams file listings come from THIS
# checkout's disk state — they refresh when the checkout does; the GitHub-API
# numbers (board, streams, contributors, PRs) are always live.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOCK="${TMPDIR:-/tmp}/fg-refresh-web-data.lock"

# Skip (don't queue) if a previous run is still going.
exec 9>"$LOCK"
flock -n 9 || { echo "$(date -Is) another refresh is running — skipping"; exit 0; }

if [ -z "${GITHUB_TOKEN:-}" ] && [ -f "$ROOT/server/.env" ]; then
  GITHUB_TOKEN="$(grep '^FLEET_GITHUB_TOKEN=' "$ROOT/server/.env" | head -1 | cut -d= -f2- || true)"
  export GITHUB_TOKEN
fi

# Write OUTSIDE the checkout (ADR-0018): the tracked web/public/data/* stays
# untouched, so the 10-min cron can never dirty the repo or bloat a commit —
# the compose override mounts this dir into the container at /app/public/data.
export DATA_OUT_DIR="${DATA_OUT_DIR:-$HOME/.forgood/web-data}"

echo "$(date -Is) refreshing web data snapshot -> $DATA_OUT_DIR"
cd "$ROOT/web"
node scripts/build-data.mjs
echo "$(date -Is) done: $(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.env.DATA_OUT_DIR + "/snapshot.json","utf8")).generatedAt)')"
