#!/usr/bin/env node
/**
 * Fleet simulator — connects fake agents over the real WS protocol so you can
 * develop the dashboard (and demo the server) without live workers.
 *
 *   node scripts/simulate.mjs                # 5 agents against localhost
 *   AGENTS=12 SERVER=ws://host:8787 node scripts/simulate.mjs
 *
 * Uses Node's built-in WebSocket client (Node >= 22, matching this package's
 * engines floor) — no dependencies.
 */
if (typeof WebSocket === "undefined") {
  console.error("simulate.mjs needs the global WebSocket client (Node >= 21; this package requires Node >= 22).");
  console.error(`You are running Node ${process.version} — upgrade, or use Docker: docker compose up`);
  process.exit(1);
}

const SERVER = process.env.SERVER ?? "ws://127.0.0.1:8787";
const AGENT_COUNT = Number(process.env.AGENTS ?? 5);

const HANDLES = ["adam91holt", "gligorkot", "thecolab-clawd", "kea-worker", "tui-worker", "ruru-worker", "moa-worker", "weka-worker", "kaka-worker", "kiwi-worker", "takahe-worker", "hihi-worker"];
const HARNESSES = ["claude", "codex", "hermes"];
const MODELS = {
  claude: ["claude-fable-5", "claude-opus-4-8", "claude-sonnet-5"],
  codex: ["gpt-5.3-codex", "o5-mini"],
  hermes: ["hermes-4-405b"],
};
const TASKS = [
  { kind: "work", ref: "#231", title: "School attendance interventions — what works in NZ" },
  { kind: "work", ref: "#312", title: "Foodbank demand vs supply data, 2020-2025" },
  { kind: "review", ref: "#405", title: "review: rental WOF pilot outcomes" },
  { kind: "work", ref: "#287", title: "Kea population trend synthesis" },
  { kind: "review", ref: "#399", title: "review: civic-transparency LGOIMA response times" },
  { kind: "frame", ref: "#410", title: "framing: youth mental health waitlists" },
  { kind: "work", ref: "#356", title: "Predator Free 2050 progress audit" },
  { kind: "synth", ref: "#120", title: "stream synthesis: housing quality" },
];
const TOOLS = ["bash", "edit", "read", "webfetch", "gh", "grep"];
const SKILLS = ["child-poverty-nz", "deprivation-nz", "data-govt-nz", "geonet-nz", "lawa-nz"];

// Rough worldwide worker locations so the globe is populated in local/dev
// (localhost has no IP geo). The server prefers real IP geo and only uses this
// self-reported fallback when the lookup fails.
const CITIES = [
  { city: "Auckland", country: "NZ", lat: -36.8, lon: 174.8 },
  { city: "Wellington", country: "NZ", lat: -41.3, lon: 174.8 },
  { city: "Christchurch", country: "NZ", lat: -43.5, lon: 172.6 },
  { city: "Sydney", country: "AU", lat: -33.9, lon: 151.2 },
  { city: "Melbourne", country: "AU", lat: -37.8, lon: 145.0 },
  { city: "Singapore", country: "SG", lat: 1.35, lon: 103.8 },
  { city: "London", country: "GB", lat: 51.5, lon: -0.1 },
  { city: "Berlin", country: "DE", lat: 52.5, lon: 13.4 },
  { city: "San Francisco", country: "US", lat: 37.8, lon: -122.4 },
  { city: "New York", country: "US", lat: 40.7, lon: -74.0 },
  { city: "Toronto", country: "CA", lat: 43.7, lon: -79.4 },
  { city: "Bengaluru", country: "IN", lat: 13.0, lon: 77.6 },
  { city: "Tokyo", country: "JP", lat: 35.7, lon: 139.7 },
  { city: "São Paulo", country: "BR", lat: -23.5, lon: -46.6 },
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function startAgent(i) {
  const handle = HANDLES[i % HANDLES.length];
  const harness = pick(HARNESSES);
  const model = pick(MODELS[harness]);
  const location = CITIES[i % CITIES.length];
  const ws = new WebSocket(`${SERVER}/ws/agent`);
  let timer;

  ws.addEventListener("open", () => {
    ws.send(JSON.stringify({ type: "hello", handle, harness, model, task: pick(TASKS), location, version: "sim-0.1", session: `sim-${i}` }));
    console.log(`[sim] ${handle} online (${harness} · ${model})`);
    timer = setInterval(() => {
      // A plausible working rhythm: bursts of tokens, occasional milestones.
      const busy = Math.random() > 0.25;
      const hb = {
        type: "heartbeat",
        tokensIn: busy ? Math.floor(Math.random() * 4000) : 0,
        tokensOut: busy ? Math.floor(Math.random() * 1500) : 0,
        toolCalls: busy ? Math.floor(Math.random() * 6) : 0,
        tools: busy ? { [pick(TOOLS)]: 1 + Math.floor(Math.random() * 3) } : {},
        fetchesOk: Math.random() > 0.6 ? 1 : 0,
        fetchesError: Math.random() > 0.93 ? 1 : 0,
        skills: Math.random() > 0.85 ? { [pick(SKILLS)]: 1 } : {},
        errors: Math.random() > 0.97 ? 1 : 0,
        prsOpened: Math.random() > 0.985 ? 1 : 0,
        reviewsCompleted: Math.random() > 0.985 ? 1 : 0,
        tasksCompleted: Math.random() > 0.99 ? 1 : 0,
      };
      if (Math.random() > 0.97) hb.task = pick(TASKS);
      ws.send(JSON.stringify(hb));
    }, 3000 + Math.random() * 3000);
  });

  ws.addEventListener("close", () => {
    clearInterval(timer);
    console.log(`[sim] ${handle} disconnected — reconnecting in 5s`);
    setTimeout(() => startAgent(i), 5000);
  });
  ws.addEventListener("error", () => ws.close());
}

console.log(`[sim] starting ${AGENT_COUNT} fake agents against ${SERVER}`);
for (let i = 0; i < AGENT_COUNT; i++) setTimeout(() => startAgent(i), i * 800);
