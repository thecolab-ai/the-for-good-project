/**
 * Ephemeral docker containers for orchestration tests.
 *
 * SAFETY CONTRACT (the production fleet server runs on this box):
 *  - every container we start is named `fgtest-<pid>-<random>` and started
 *    with `docker run -d -P` (ephemeral host ports — never a fixed port);
 *  - we only ever stop/remove containers whose name starts with `fgtest-`;
 *  - we never run `docker compose` at all, let alone `down`;
 *  - cleanup hooks force-remove anything a crashed or interrupted test left
 *    behind: the 'exit' hook covers normal exits and crashes that reach
 *    'exit', and SIGINT/SIGTERM handlers (Node does NOT emit 'exit' for a
 *    default-handled signal) cover Ctrl-C / kill — then re-raise so the
 *    process still dies with the correct signal status. SIGKILL remains
 *    uncoverable.
 *
 * Usage:
 *   import { dockerAvailable, startRedis, startMongo } from "./helpers/containers.mjs";
 *   if (!(await dockerAvailable())) { t.skip("docker unavailable"); return; }
 *   const redis = await startRedis();   // { name, hostPort, url, stop() }
 *   const mongo = await startMongo();   // { name, hostPort, url, stop() }
 *   ...
 *   await redis.stop(); await mongo.stop();
 */
import { execFile, execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

const NAME_PREFIX = "fgtest-";
/** Names of containers this process started and hasn't stopped yet. */
const live = new Set();

let exitHookInstalled = false;
function installExitHook() {
  if (exitHookInstalled) return;
  exitHookInstalled = true;
  const cleanup = () => {
    for (const name of live) {
      if (!name.startsWith(NAME_PREFIX)) continue; // paranoia — never touch others
      try {
        execFileSync("docker", ["rm", "-f", name], { stdio: "ignore" });
      } catch {
        /* best-effort */
      }
    }
    live.clear();
  };
  process.on("exit", cleanup);
  // Node skips the 'exit' event when the process dies to a default-handled
  // SIGINT/SIGTERM — an interrupted `npm test` would leak fgtest-* containers
  // on the box hosting the PRODUCTION fleet server. Clean up, then re-raise
  // (process.once removed the handler) so signal semantics are preserved.
  for (const sig of ["SIGINT", "SIGTERM"]) {
    process.once(sig, () => {
      cleanup();
      process.kill(process.pid, sig);
    });
  }
}

/** True when the docker CLI is present and the daemon answers. */
export async function dockerAvailable() {
  try {
    await execFileP("docker", ["info", "--format", "{{.ServerVersion}}"], { timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}

function uniqueName(kind) {
  return `${NAME_PREFIX}${process.pid}-${kind}-${randomBytes(4).toString("hex")}`;
}

/** `docker port <name> <port>/tcp` → the ephemeral host port (number). */
async function discoverHostPort(name, containerPort) {
  const { stdout } = await execFileP("docker", ["port", name, `${containerPort}/tcp`]);
  // e.g. "0.0.0.0:32768\n[::]:32768"
  const first = stdout.trim().split("\n")[0] ?? "";
  const port = Number(first.slice(first.lastIndexOf(":") + 1));
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`could not discover host port for ${name}:${containerPort} (got ${JSON.stringify(stdout)})`);
  }
  return port;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Start a container: `docker run -d -P --name fgtest-... <image> [args]`.
 *
 * @param {object} opts
 * @param {string} opts.image           e.g. "redis:7-alpine"
 * @param {number} opts.containerPort   the port to discover on the host
 * @param {string[]} [opts.args]        command args appended after the image
 * @param {(name: string, hostPort: number) => Promise<boolean>} [opts.ready]
 *   readiness probe, polled until true; defaults to "container running"
 * @param {number} [opts.timeoutMs]     readiness timeout (default 60s)
 * @returns {Promise<{name: string, hostPort: number, stop(): Promise<void>}>}
 */
export async function startContainer({ image, containerPort, args = [], ready, timeoutMs = 60_000 }) {
  installExitHook();
  const name = uniqueName(image.replace(/[^a-z0-9]+/gi, "").slice(0, 12));
  await execFileP("docker", ["run", "-d", "-P", "--name", name, image, ...args], { timeout: 120_000 });
  live.add(name);

  const stop = async () => {
    if (!live.has(name)) return;
    live.delete(name);
    if (!name.startsWith(NAME_PREFIX)) return; // paranoia
    await execFileP("docker", ["rm", "-f", name]).catch(() => undefined);
  };

  try {
    const hostPort = await discoverHostPort(name, containerPort);
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const ok = await (ready ? ready(name, hostPort).catch(() => false) : isRunning(name));
      if (ok) break;
      if (Date.now() > deadline) throw new Error(`container ${name} (${image}) not ready after ${timeoutMs}ms`);
      await sleep(250);
    }
    return { name, hostPort, stop };
  } catch (err) {
    await stop();
    throw err;
  }
}

async function isRunning(name) {
  const { stdout } = await execFileP("docker", ["inspect", "--format", "{{.State.Running}}", name]);
  return stdout.trim() === "true";
}

/** In-container probe — avoids speaking the wire protocol from here. */
async function execProbe(name, cmd) {
  const { stdout } = await execFileP("docker", ["exec", name, ...cmd], { timeout: 10_000 });
  return stdout;
}

/** Start a throwaway Redis. Returns `{ name, hostPort, url, stop() }`. */
export async function startRedis() {
  const c = await startContainer({
    image: "redis:7-alpine",
    containerPort: 6379,
    ready: async (name) => (await execProbe(name, ["redis-cli", "ping"])).trim() === "PONG",
  });
  return { ...c, url: `redis://127.0.0.1:${c.hostPort}` };
}

/** Start a throwaway MongoDB. Returns `{ name, hostPort, url, stop() }`. */
export async function startMongo() {
  const c = await startContainer({
    image: "mongo:7",
    containerPort: 27017,
    ready: async (name) =>
      (await execProbe(name, ["mongosh", "--quiet", "--eval", "db.runCommand({ping:1}).ok"])).trim() === "1",
  });
  return { ...c, url: `mongodb://127.0.0.1:${c.hostPort}` };
}
