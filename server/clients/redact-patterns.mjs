/**
 * THE single source of truth for secret redaction — imported by both the
 * server (src/redact.ts) and the harness hook clients (fleet-common.mjs), so
 * the two can never drift. Plain Node stdlib, no dependencies.
 *
 * Philosophy: redact aggressively on unambiguous secret SHAPES (vendor
 * prefixes, key blocks, URL credentials) and on secret-bearing NAMES
 * (FOO_TOKEN=…), and accept some over-redaction — a false positive costs a
 * garbled feed line; a false negative costs someone's credentials. This is
 * still harm-reduction, not a guarantee: the real protection is that log
 * streaming is default-off at both ends (#398).
 */

export const REDACTED = "[redacted]";

// URL userinfo credentials ("postgres://user:s3cr3t@host") — covers Postgres,
// MySQL, MongoDB (incl. +srv), Redis, AMQP, SMTP, and any scheme://user:pass@.
// Applied first and keeps scheme+user so the line stays readable.
const URL_CREDS = /\b([a-z][a-z0-9+.-]*:\/\/[^\s/:@]+):([^\s/@]+)@/gi;

const PATTERNS = [
  // --- key/cert blocks (multi-line, may be truncated mid-stream) ----------
  // RSA/EC/DSA/OPENSSH/PGP private keys and PGP block variant.
  /-----BEGIN [A-Z ]*PRIVATE KEY(?: BLOCK)?-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY(?: BLOCK)?-----|$)/g,
  /\bAGE-SECRET-KEY-1[A-Z0-9]{20,}\b/g,

  // --- AWS -----------------------------------------------------------------
  // Access key ids (all documented prefixes) — the id alone aids pairing
  // attacks, so scrub it too.
  /\b(?:AKIA|ASIA|ABIA|ACCA|AGPA|AIDA|AIPA|ANPA|ANVA|AROA)[0-9A-Z]{16}\b/g,
  /\baws_?(?:secret_?access_?key|session_?token)\b"?\s*[=:]\s*("[^"]*"|'[^']*'|\S+)/gi,

  // --- GitHub / GitLab -------------------------------------------------------
  /\bgh[pousr]_[A-Za-z0-9_]{16,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{16,}\b/g,
  /\bglpat-[A-Za-z0-9_-]{16,}\b/g,

  // --- OpenAI / Anthropic / AI platforms ------------------------------------
  // sk- covers OpenAI (sk-, sk-proj-), Anthropic (sk-ant-), Stripe secret
  // keys (sk_live_/sk_test_ via the underscore variant below).
  /\bsk-[A-Za-z0-9_-]{16,}\b/g,
  /\bhf_[A-Za-z0-9]{20,}\b/g,
  /\bgsk_[A-Za-z0-9]{20,}\b/g,

  // --- Stripe ---------------------------------------------------------------
  /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
  /\bwhsec_[A-Za-z0-9]{16,}\b/g,

  // --- Google Cloud -----------------------------------------------------------
  /\bAIza[0-9A-Za-z_-]{35}\b/g,
  /\bya29\.[0-9A-Za-z_-]{20,}\b/g,

  // --- Azure ------------------------------------------------------------------
  // Storage/Service Bus connection strings and SAS signatures.
  /\b(?:Account|SharedAccess)Key=[A-Za-z0-9+/=]{16,}/gi,
  /[?&]sig=[A-Za-z0-9%+/=]{20,}/gi,

  // --- Chat/webhook URLs (the URL IS the credential) ---------------------------
  /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/_-]+/g,
  /https:\/\/(?:\w+\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+/g,
  /\bxox[baprse]-[A-Za-z0-9-]{10,}\b/g,
  /\b\d{8,10}:AA[A-Za-z0-9_-]{30,}\b/g, // Telegram bot tokens

  // --- Package registries / dev SaaS -------------------------------------------
  /\bnpm_[A-Za-z0-9]{30,}\b/g,
  /\bpypi-[A-Za-z0-9_-]{16,}\b/g,
  /\bdop_v1_[a-f0-9]{40,}\b/g, // DigitalOcean
  /\bdoo_v1_[a-f0-9]{40,}\b/g,
  /\bshp(?:at|ss|ca)_[a-f0-9]{16,}\b/g, // Shopify
  /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/g, // SendGrid
  /\bkey-[0-9a-f]{32}\b/g, // Mailgun
  /\bdapi[0-9a-f]{32}\b/g, // Databricks
  /\blin_api_[A-Za-z0-9]{20,}\b/g, // Linear
  /\bntn_[A-Za-z0-9]{20,}\b/g, // Notion
  /\bpat[A-Za-z0-9]{14}\.[a-f0-9]{64}\b/g, // Airtable PAT
  /\bSK[0-9a-f]{32}\b/g, // Twilio API key SID

  // --- JWTs (three base64url segments) ------------------------------------------
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}\b/g,

  // --- Authorization headers ------------------------------------------------------
  /\b(?:bearer|basic)\s+[A-Za-z0-9._~+/=-]{16,}/gi,

  // --- Generic secret-bearing NAME = value (env/JSON/YAML/CLI) --------------------
  // Catches quoted and unquoted values. _PWD requires the underscore so
  // ordinary shell `PWD=/home/x` lines survive. Runs LAST — vendor patterns
  // above give more precise replacements first.
  /\b[A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|PASSWD|PASSPHRASE|CREDENTIALS?|API_?KEY|PRIVATE_?KEY|ACCESS_?KEY|SECRET_?KEY|SIGNING_?KEY|ENCRYPTION_?KEY|MASTER_?KEY|SSH_?KEY|LICENSE_?KEY|_PWD|_DSN)[A-Z0-9_]*"?\s*[=:]\s*("[^"]*"|'[^']*'|\S+)/gi,
];

export function redactText(text) {
  let out = String(text).replace(URL_CREDS, `$1:${REDACTED}@`);
  for (const re of PATTERNS) out = out.replace(re, REDACTED);
  return out;
}
