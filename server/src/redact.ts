/**
 * Best-effort secret scrubbing for the opt-in log stream (#398). Workers are
 * expected to redact before sending; this runs AGAIN server-side as defence in
 * depth. Redaction is harm-reduction, not a guarantee — the real protection is
 * that log streaming is default-off at both ends.
 */

const REDACTED = "[redacted]";

const PATTERNS: RegExp[] = [
  // GitHub tokens: ghp_/gho_/ghu_/ghs_/ghr_ and fine-grained PATs.
  /\bgh[pousr]_[A-Za-z0-9_]{16,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{16,}\b/g,
  // Anthropic / OpenAI-style API keys.
  /\bsk-[A-Za-z0-9_-]{16,}\b/g,
  // AWS access key ids and secret-looking pairs.
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\baws_secret_access_key\s*[=:]\s*\S+/gi,
  // Slack tokens.
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
  // JWTs (three base64url segments).
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}\b/g,
  // Authorization headers.
  /\b(?:bearer|basic)\s+[A-Za-z0-9._~+/=-]{16,}/gi,
  // Private key blocks.
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g,
  // .env-style assignments where the name looks secret-bearing.
  /\b[A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIALS?|API_?KEY|PRIVATE_?KEY)[A-Z0-9_]*\s*[=:]\s*[^\s"']+/gi,
];

export function redact(text: string): string {
  let out = text;
  for (const re of PATTERNS) out = out.replace(re, REDACTED);
  return out;
}

export function redactLines(lines: string[]): string[] {
  return lines.map(redact);
}
