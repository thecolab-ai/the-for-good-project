# For Good fleet server — single self-contained container (state is in-memory,
# optionally snapshotted to a volume via STATE_FILE).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY clients ./clients
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# dist/redact.js imports ../clients/redact-patterns.mjs — the shared pattern
# library used by both the server and the harness hook clients.
COPY --from=build /app/clients ./clients
COPY package.json ./
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8787
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8787/healthz >/dev/null || exit 1
CMD ["node", "dist/index.js"]
