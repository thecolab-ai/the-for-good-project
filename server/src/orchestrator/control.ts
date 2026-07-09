/**
 * Control plane (Implementer E).
 *
 * Maintainer commands (pause / resume / stop / abort) delivered to agents
 * piggybacked on telemetry heartbeat responses (HTTP) and pushed over the
 * agent WebSocket. Commands are supersede-semantics (the latest command for a
 * target wins), stored as sticky keys and delivered exactly once per
 * CONSUMER — a handle can legitimately have several concurrent runners
 * (one minted token shared across machines/harnesses), and a drain must
 * reach all of them, not just whichever heartbeats first:
 *
 *  - per-handle: `cmd:<handle>` (current command JSON) + `cmd:<handle>:seen`
 *    (consumer ids already given it);
 *  - fleet-wide: `fleet:cmd` + `fleet:cmd:seen` (members are
 *    `<handle>:<consumer>`).
 *
 * One-shot drain kinds (stop/abort) carry a TTL (config.fleetCmdTtlSeconds)
 * so a stale drain can never one-shot-kill a runner enrolled or restarted
 * long after the incident; pause/resume represent state and persist. A
 * fleet-wide command is additionally never delivered to a handle minted
 * AFTER it was issued (registry createdAt cutoff). Every issued command is
 * recorded in Mongo `commands` with deliveredTo/deliveredAt updated on
 * delivery.
 *
 * Semantics (ADR-0017): pause = stop claiming new work, keep heartbeating,
 * wait for resume; stop = finish current task, release done, exit loop;
 * abort = abandon current work ASAP (release abandoned, exit). v1 delivers
 * abort at the same checkpoints as stop.
 */
import { ObjectId } from "mongodb";
import { config } from "../config.js";
import { commandSchema, type CommandKind, type FleetCommand } from "../protocol.js";
import {
  commandKey,
  commandSeenKey,
  FLEET_COMMAND_KEY,
  FLEET_COMMAND_SEEN_KEY,
  type Orchestrator,
} from "./stores.js";

/** Target for a command: a single handle, or "*" for the whole fleet. */
export const FLEET_TARGET = "*";

/** Seen-sets are bounded in time so they can't grow forever. */
const SEEN_TTL_SECONDS = 24 * 60 * 60;

/** Kinds that are point-in-time one-shots — they expire rather than persist. */
const EXPIRING_KINDS: readonly CommandKind[] = ["stop", "abort"];

/**
 * Atomically read a sticky command and mark it seen for one consumer —
 * returns the command JSON only the FIRST time this consumer asks (SADD's
 * return value is the exactly-once guard). A single Lua script so a
 * concurrent `enqueueCommand` (SET + DEL seen, in a MULTI) can never
 * interleave between the read and the mark — both blocks serialize, so a
 * consumer can neither miss a fresh command nor receive one twice.
 */
const POP_SCRIPT = `
local cmd = redis.call('GET', KEYS[1])
if not cmd then return false end
local added = redis.call('SADD', KEYS[2], ARGV[1])
redis.call('EXPIRE', KEYS[2], ARGV[2])
if added == 1 then return cmd end
return false
`;

/**
 * Enqueue a command for `target` (handle, or "*" = fleet-wide drain): set the
 * sticky command key, clear its seen-set — atomically — and record it in
 * Mongo `commands`. stop/abort get an expiry (see module doc). Returns the
 * command as it will be delivered.
 */
export async function enqueueCommand(
  orch: Orchestrator,
  target: string,
  kind: CommandKind,
  reason: string | undefined,
  issuedBy: string,
): Promise<FleetCommand> {
  // The Mongo doc's ObjectId doubles as the wire command id, so delivery
  // bookkeeping can find its way back to the audit doc without a second key.
  const _id = new ObjectId();
  const command: FleetCommand = {
    id: _id.toHexString(),
    kind,
    issuedAt: new Date().toISOString(),
    ...(reason ? { reason } : {}),
  };

  // Audit first, deliver second: a Redis failure leaves a recorded command
  // with an empty deliveredTo (visible, retriable) rather than a delivered
  // command with no record.
  await orch.db.collection("commands").insertOne({
    _id,
    target,
    kind,
    ...(reason ? { reason } : {}),
    issuedBy,
    issuedAt: command.issuedAt,
    deliveredTo: [] as string[],
  });

  const json = JSON.stringify(command);
  const cmdKey = target === FLEET_TARGET ? FLEET_COMMAND_KEY : commandKey(target);
  const seenKey = target === FLEET_TARGET ? FLEET_COMMAND_SEEN_KEY : commandSeenKey(target);
  const multi = orch.redis.multi();
  if (EXPIRING_KINDS.includes(kind)) multi.set(cmdKey, json, "EX", config.fleetCmdTtlSeconds);
  else multi.set(cmdKey, json);
  multi.del(seenKey);
  await multi.exec();
  return command;
}

/**
 * Deliver pending commands for a handle to ONE consumer (an agent session —
 * the telemetry agentId, or a WS socket's id; defaults to the handle when the
 * caller has no session identity): the handle's sticky command plus the
 * fleet-wide command, each exactly once per consumer. A fleet command issued
 * before the handle's registry createdAt is dropped — a handle minted after a
 * drain was never its target. Updates `commands.deliveredTo/deliveredAt`.
 * Returns [] when nothing is pending.
 */
export async function popCommands(
  orch: Orchestrator,
  handle: string,
  consumerId?: string,
): Promise<FleetCommand[]> {
  const consumer = consumerId && consumerId.length > 0 ? consumerId : handle;
  const commands: FleetCommand[] = [];

  const handleRaw = (await orch.redis.eval(
    POP_SCRIPT,
    2,
    commandKey(handle),
    commandSeenKey(handle),
    consumer,
    String(SEEN_TTL_SECONDS),
  )) as string | null;
  if (handleRaw) {
    const cmd = parseCommand(handleRaw);
    if (cmd) commands.push(cmd);
  }

  const fleetRaw = (await orch.redis.eval(
    POP_SCRIPT,
    2,
    FLEET_COMMAND_KEY,
    FLEET_COMMAND_SEEN_KEY,
    `${handle}:${consumer}`,
    String(SEEN_TTL_SECONDS),
  )) as string | null;
  if (fleetRaw) {
    const cmd = parseCommand(fleetRaw);
    if (cmd && !(await issuedBeforeHandleExisted(orch, handle, cmd))) commands.push(cmd);
  }

  // Delivery bookkeeping is best-effort: the commands are already popped, so
  // a Mongo hiccup must not make the caller drop them.
  if (commands.length > 0) {
    await recordDelivery(orch, commands, handle).catch(() => undefined);
  }
  return commands;
}

/** True when a fleet-wide command predates the handle's registry doc — it was
 *  never aimed at this handle. Unregistered handles (tests, legacy) deliver. */
async function issuedBeforeHandleExisted(
  orch: Orchestrator,
  handle: string,
  cmd: FleetCommand,
): Promise<boolean> {
  try {
    const doc = await orch.db
      .collection<{ createdAt?: Date | string }>("agents_registry")
      .findOne({ handle }, { projection: { createdAt: 1 } });
    if (!doc?.createdAt) return false;
    return Date.parse(cmd.issuedAt) < new Date(doc.createdAt).getTime();
  } catch {
    return false; // fail open: an audit lookup blip must not eat a drain
  }
}

/** Parse a stored JSON command; malformed entries are dropped, not thrown. */
function parseCommand(raw: string): FleetCommand | null {
  try {
    const parsed = commandSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function recordDelivery(
  orch: Orchestrator,
  commands: FleetCommand[],
  handle: string,
): Promise<void> {
  const ids: ObjectId[] = [];
  for (const cmd of commands) {
    if (ObjectId.isValid(cmd.id)) ids.push(new ObjectId(cmd.id));
  }
  if (ids.length === 0) return;
  await orch.db.collection("commands").updateMany(
    { _id: { $in: ids } },
    { $addToSet: { deliveredTo: handle }, $set: { deliveredAt: new Date().toISOString() } },
  );
}
