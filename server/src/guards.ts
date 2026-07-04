/**
 * Abuse guards. Auth is parked (assumed trust, #398), so these are the cheap
 * lines of defence: bound what any one connection/IP can send, and stop
 * drive-by browser pages from opening sockets cross-origin.
 */
import type { FastifyRequest } from "fastify";
import { config } from "./config.js";

/** Token bucket: allow a burst of `perSecond`, refill continuously. */
export class RateLimiter {
  private allowance: number;
  private last = Date.now();

  constructor(private readonly perSecond: number = config.maxMessagesPerSecond) {
    this.allowance = perSecond;
  }

  allow(): boolean {
    const now = Date.now();
    this.allowance = Math.min(this.perSecond, this.allowance + ((now - this.last) / 1000) * this.perSecond);
    this.last = now;
    if (this.allowance < 1) return false;
    this.allowance -= 1;
    return true;
  }
}

/** Per-IP buckets for the HTTP routes (the WS routes get one per connection).
 *  Bounded: the whole map resets if it ever grows suspiciously large — losing
 *  rate state under attack is preferable to unbounded memory. */
export class IpRateLimiter {
  private readonly buckets = new Map<string, RateLimiter>();

  allow(ip: string): boolean {
    if (this.buckets.size > 10_000) this.buckets.clear();
    let bucket = this.buckets.get(ip);
    if (!bucket) {
      bucket = new RateLimiter();
      this.buckets.set(ip, bucket);
    }
    return bucket.allow();
  }
}

/**
 * WebSocket upgrades don't go through CORS, so enforce the same origin
 * allowlist by hand. Non-browser clients (workers, curl) send no Origin
 * header and are allowed — this guard is specifically against a malicious
 * web page using a visitor's browser to inject spoofed presence.
 */
export function originAllowed(req: FastifyRequest): boolean {
  if (config.corsOrigin === "*") return true;
  const origin = req.headers.origin;
  if (!origin) return true;
  return config.corsOrigin.split(",").some((o) => o.trim() === origin);
}
