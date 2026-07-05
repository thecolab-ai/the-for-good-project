/**
 * POST /api/v1/webhooks/github (Implementer A).
 *
 * index.ts registers this ONLY when config.webhookSecret is set (unset =
 * 404) and orchestration is connected.
 *
 *  - HMAC verification of X-Hub-Signature-256 over the RAW request bytes via
 *    crypto.timingSafeEqual; 401 on bad/missing signature. The raw-body
 *    content-type parser is registered inside an encapsulated plugin scope so
 *    JSON parsing everywhere else is untouched.
 *  - Dedupe by X-GitHub-Delivery: the delivery doc's _id IS the delivery id,
 *    so a duplicate insert fails E11000 → respond 200 and skip reduce.
 *  - Store the delivery, then reduceWebhook() → optional store.addEvent for
 *    the live feed. Unknown events: stored + 202, no-op reduce. Reduce
 *    failures are logged, never surfaced to GitHub (the delivery is stored
 *    and the interval sync repairs the mirror).
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { config } from "../config.js";
import { reduceWebhook } from "../github/reduce.js";
import type { Orchestrator } from "../orchestrator/stores.js";
import type { FleetStore } from "../state.js";

/** Stored delivery (webhook_deliveries capped collection; _id = delivery id). */
interface WebhookDeliveryDoc {
  _id: string;
  event: string;
  action?: string;
  receivedAt: string;
  issueNumber?: number;
  prNumber?: number;
  sender?: string;
  payload: Record<string, unknown>;
}

/** GitHub webhook payloads regularly exceed the server's 64KB telemetry
 *  bodyLimit (issue bodies alone run to 65k chars) — allow 1MB here only. */
const WEBHOOK_BODY_LIMIT = 1024 * 1024;

/** Constant-time check of `X-Hub-Signature-256: sha256=<hex>` over the raw
 *  request bytes. Never logs or echoes any part of the signature. */
function validSignature(secret: string, raw: Buffer, header: unknown): boolean {
  if (typeof header !== "string" || !header.startsWith("sha256=")) return false;
  const presented = Buffer.from(header.slice("sha256=".length), "hex");
  const expected = createHmac("sha256", secret).update(raw).digest();
  // Length differs (including malformed hex, which Buffer.from truncates):
  // definitively not our signature — and timingSafeEqual would throw.
  if (presented.length !== expected.length) return false;
  return timingSafeEqual(presented, expected);
}

export function registerWebhookRoutes(app: FastifyInstance, store: FleetStore, orch: Orchestrator): void {
  const secret = config.webhookSecret;
  if (!secret) return; // index.ts gates on this already; stay 404 if not.

  const deliveries = () => orch.db.collection<WebhookDeliveryDoc>("webhook_deliveries");

  // Encapsulated scope: the buffer parser applies to this route only.
  void app.register(async (scope) => {
    scope.addContentTypeParser("application/json", { parseAs: "buffer" }, (_req, body, done) => {
      done(null, body);
    });

    scope.post("/api/v1/webhooks/github", { bodyLimit: WEBHOOK_BODY_LIMIT }, async (req, reply) => {
      const raw = req.body;
      if (!Buffer.isBuffer(raw) || !validSignature(secret, raw, req.headers["x-hub-signature-256"])) {
        return reply.code(401).send({ ok: false, error: "invalid signature" });
      }

      const event = req.headers["x-github-event"];
      const deliveryId = req.headers["x-github-delivery"];
      if (typeof event !== "string" || !event || typeof deliveryId !== "string" || !deliveryId) {
        return reply.code(400).send({ ok: false, error: "missing webhook headers" });
      }

      let payload: Record<string, unknown>;
      try {
        const parsed: unknown = JSON.parse(raw.toString("utf8"));
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
        payload = parsed as Record<string, unknown>;
      } catch {
        return reply.code(400).send({ ok: false, error: "invalid JSON payload" });
      }

      const action = typeof payload.action === "string" ? payload.action : undefined;
      const issue = payload.issue as { number?: unknown } | undefined;
      const pull = payload.pull_request as { number?: unknown } | undefined;
      const senderLogin = (payload.sender as { login?: unknown } | undefined)?.login;

      // Dedupe: _id = X-GitHub-Delivery. A redelivery collides → 200, no reduce.
      const doc: WebhookDeliveryDoc = {
        _id: deliveryId,
        event,
        ...(action ? { action } : {}),
        receivedAt: new Date().toISOString(),
        ...(typeof issue?.number === "number" ? { issueNumber: issue.number } : {}),
        ...(typeof pull?.number === "number" ? { prNumber: pull.number } : {}),
        ...(typeof senderLogin === "string" ? { sender: senderLogin } : {}),
        payload,
      };
      try {
        await deliveries().insertOne(doc);
      } catch (err) {
        if ((err as { code?: number }).code === 11000) {
          return reply.code(200).send({ ok: true, duplicate: true });
        }
        throw err;
      }

      try {
        const reduced = await reduceWebhook(orch, { event, action, payload });
        if (reduced) {
          store.addEvent(reduced.kind, reduced.text, { handle: reduced.handle, ref: reduced.ref });
        }
      } catch (err) {
        // Delivery is stored and sync reconciles the mirror — don't make
        // GitHub mark the hook as failing over a reduce bug.
        req.log.warn({ err, event, action }, "webhook reduce failed");
      }

      return reply.code(202).send({ ok: true });
    });
  });
}
