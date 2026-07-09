/**
 * Server-side secret scrubbing for the opt-in log stream (#398). The actual
 * pattern library lives in ../clients/redact-patterns.mjs — ONE source shared
 * with the harness hook clients, so client- and server-side redaction can
 * never drift apart. This runs as the second pass (defence in depth); workers
 * redact before sending. Harm-reduction, not a guarantee — the real
 * protection is that log streaming is default-off at both ends.
 */
import { redactText } from "../clients/redact-patterns.mjs";

export function redact(text: string): string {
  return redactText(text);
}

export function redactLines(lines: string[]): string[] {
  return lines.map(redactText);
}
