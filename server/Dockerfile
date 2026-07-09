# For Good fleet server — single self-contained container (state is in-memory,
# optionally snapshotted to a volume via STATE_FILE). Also builds the web
# dashboard and serves it at "/" (STATIC_DIR), so one origin is both the site
# and the telemetry endpoint.
#
# Build context is the REPO ROOT (compose sets `context: ..`), because the
# image needs both server/ and web/.
FROM node:22-alpine AS build
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/tsconfig.json ./
COPY server/src ./src
COPY server/clients ./clients
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS webbuild
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web ./
# The Pages deployment lives under /the-for-good-project/; here the site is
# the origin root.
RUN npx vite build --base=/

FROM node:22-alpine
ENV NODE_ENV=production
ENV STATIC_DIR=/app/public
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# dist/redact.js imports ../clients/redact-patterns.mjs — the shared pattern
# library used by both the server and the harness hook clients.
COPY --from=build /app/clients ./clients
COPY --from=webbuild /web/dist ./public
COPY server/package.json ./
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8787
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8787/healthz >/dev/null || exit 1
CMD ["node", "dist/index.js"]
