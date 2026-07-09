/**
 * Fail-open contract tests (README: "Stores configured but unreachable at
 * boot = logged error, server boots telemetry-only (fail-open, never
 * crash-loop)"). Docker-FREE — these run even where the container-backed
 * suites skip, because the whole point is behaviour WITHOUT working stores.
 *
 *  (a) stores unset → every orchestration path answers exactly
 *      503 {ok:false,error:"orchestration disabled"}; telemetry still works.
 *  (b) stores configured but unreachable (closed ports) → the process stays
 *      alive, logs "orchestration stores unreachable", serves telemetry, and
 *      the orchestration paths answer the same 503.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import { fileURLToPath } from "node:url";

const ADMIN_TOKEN = "failopen-admin-token";
const WEBHOOK_SECRET = "failopen-webhook-secret";

/** Keep in lockstep with registerOrchestrationDisabled (src/index.ts) — a
 *  typo'd path there 404s instead of 503ing, which is what this list guards. */
const DISABLED_PATHS = [
  ["POST", "/api/v1/work/claim"],
  ["POST", "/api/v1/work/renew"],
  ["POST", "/api/v1/work/release"],
  ["GET", "/api/v1/queue"],
  ["GET", "/api/v1/board"],
  ["POST", "/api/v1/webhooks/github"],
  ["POST", "/api/v1/admin/agents"],
  ["POST", "/api/v1/admin/agents/revoke"],
  ["GET", "/api/v1/admin/agents"],
  ["POST", "/api/v1/admin/commands"],
  ["GET", "/api/v1/admin/assignments"],
  ["POST", "/api/v1/admin/lease/release"],
  ["POST", "/api/v1/admin/sync"],
];

const serverPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function bootServer(extraEnv, { readyTimeoutMs = 30_000 } = {}) {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const env = {
    ...process.env,
    PORT: String(port),
    HOST: "127.0.0.1",
    LOG_LEVEL: "info",
    ADMIN_TOKEN,
    WEBHOOK_SECRET,
    ...extraEnv,
  };
  delete env.STATE_FILE;
  delete env.HISTORY_DB_FILE;
  delete env.STATIC_DIR;
  delete env.GITHUB_TOKEN;
  if (!("REDIS_URL" in extraEnv)) delete env.REDIS_URL;
  if (!("MONGO_URL" in extraEnv)) delete env.MONGO_URL;

  const child = spawn(process.execPath, [serverPath], { env, stdio: ["ignore", "pipe", "pipe"] });
  let logs = "";
  child.stdout.on("data", (d) => (logs += d));
  child.stderr.on("data", (d) => (logs += d));

  const deadline = Date.now() + readyTimeoutMs;
  for (;;) {
    if (child.exitCode !== null) {
      throw new Error(`server exited early (code ${child.exitCode}).\n--- logs ---\n${logs}`);
    }
    const ok = await fetch(`${base}/healthz`)
      .then((r) => r.ok)
      .catch(() => false);
    if (ok) break;
    if (Date.now() > deadline) throw new Error(`server never became ready.\n--- logs ---\n${logs}`);
    await sleep(250);
  }
  return { child, base, getLogs: () => logs };
}

async function stopServer(child) {
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), sleep(5_000)]);
  if (child.exitCode === null) child.kill("SIGKILL");
}

async function assertDisabledSurface(base) {
  for (const [method, path] of DISABLED_PATHS) {
    const res = await fetch(`${base}${path}`, { method });
    assert.equal(res.status, 503, `${method} ${path} must answer 503, got ${res.status}`);
    assert.deepEqual(
      await res.json(),
      { ok: false, error: "orchestration disabled" },
      `${method} ${path} body`,
    );
  }
}

async function assertTelemetryWorks(base) {
  const res = await fetch(`${base}/api/v1/telemetry`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "failopen-worker", harness: "claude", model: "test-model" }),
  });
  assert.equal(res.status, 200, "telemetry must keep working without orchestration");
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.ok(body.agentId, "telemetry issues an agentId");
  assert.ok(!("commands" in body), "no orchestration → exactly the pre-orchestration response shape");
}

test("fail-open (a): stores unset → 503 on every orchestration path, telemetry alive", async () => {
  const { child, base } = await bootServer({});
  try {
    await assertDisabledSurface(base);
    await assertTelemetryWorks(base);
  } finally {
    await stopServer(child);
  }
});

test("fail-open (b): stores unreachable → boots telemetry-only, never crash-loops", async () => {
  // Closed ports: connect fails after the 5s driver timeouts; the server must
  // log and continue, not exit.
  const { child, base, getLogs } = await bootServer(
    { REDIS_URL: "redis://127.0.0.1:1", MONGO_URL: "mongodb://127.0.0.1:1" },
    { readyTimeoutMs: 45_000 },
  );
  try {
    assert.equal(child.exitCode, null, "process must stay alive with unreachable stores");
    assert.match(
      getLogs(),
      /orchestration stores unreachable/,
      "the unreachable-stores condition is logged, not fatal",
    );
    await assertDisabledSurface(base);
    await assertTelemetryWorks(base);
    // Still alive after everything above (no delayed crash-loop).
    await sleep(500);
    assert.equal(child.exitCode, null);
  } finally {
    await stopServer(child);
  }
});
