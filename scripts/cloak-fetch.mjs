#!/usr/bin/env node
// cloak-fetch.mjs — fetch a URL through CloakBrowser (stealth Chromium) and print
// its title + visible text.
//
// Use this to VERIFY a citation when a plain HTTP fetch returns 403 from an
// official NZ site (Incapsula / Cloudflare bot protection). A 403 there usually
// means "gated", not "dead" — this loads the page like a real browser so you can
// confirm the source actually supports the claim.
//
// Setup (once):
//   npm install                 # installs the cloakbrowser package (small)
//   npx cloakbrowser install    # downloads the stealth Chromium binary (~once)
// Usage:
//   node scripts/cloak-fetch.mjs "https://…"
//   MAX_CHARS=40000 node scripts/cloak-fetch.mjs "https://…"
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const url = process.argv[2];
if (!url || !/^https?:\/\//.test(url)) {
  console.error('usage: node scripts/cloak-fetch.mjs "<http(s) url>"');
  process.exit(1);
}
const MAX = Number(process.env.MAX_CHARS || 20000);

let launchPersistentContext;
try {
  ({ launchPersistentContext } = await import("cloakbrowser"));
} catch {
  console.error("cloakbrowser isn't installed. Run:  npm install && npx cloakbrowser install");
  process.exit(1);
}

// Optional rotating proxy (ADR-0006): FETCH_PROXY / HTTPS_PROXY =
// http://user:pass@host:port. A stealth browser through a rotating residential
// IP clears the IP-reputation blocks (Incapsula/Cloudflare) the local egress
// can't. Credentials come from the env only — never hard-coded. Returns the
// Playwright proxy shape {server, username?, password?} or null.
function proxyConfig() {
  const raw = process.env.FETCH_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy || "";
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const cfg = { server: `${u.protocol}//${u.host}` };
    if (u.username) cfg.username = decodeURIComponent(u.username);
    if (u.password) cfg.password = decodeURIComponent(u.password);
    return cfg;
  } catch {
    return null;
  }
}

const profile = mkdtempSync(path.join(tmpdir(), "fg-cloak-"));
const proxy = proxyConfig();
let ctx;
try {
  // en-NZ locale + Auckland timezone + humanize help pass geo/bot checks.
  ctx = await launchPersistentContext({
    userDataDir: profile,
    headless: true,
    viewport: { width: 1365, height: 768 },
    locale: "en-NZ",
    timezone: "Pacific/Auckland",
    humanize: true,
    ...(proxy ? { proxy } : {}),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  page.setDefaultNavigationTimeout(45000);
  const response = await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000); // let any bot-check JS settle / redirect
  const status = response ? response.status() : 0; // HTTP status of the final navigation
  const title = await page.title().catch(() => "");
  const finalUrl = page.url();
  const text = await page.locator("body").innerText({ timeout: 15000 }).catch(() => "");
  const body = text.replace(/\n{3,}/g, "\n\n").trim();
  // The `# status:` line lets callers (fetch.mjs) tell a real 404 from a rendered
  // page — a branded 404 still has readable text, so text length alone can't.
  // proxy.server is host:port only (no credentials) — safe to print.
  console.log(`# ${title}\n# ${finalUrl}\n# status: ${status}${proxy ? `\n# proxy: ${proxy.server}` : ""}\n`);
  console.log(body.length > MAX ? body.slice(0, MAX) + "\n…[truncated — raise MAX_CHARS]" : body);
} catch (e) {
  console.error("Fetch failed:", e?.message || e);
  console.error("First run? Download the browser once with:  npx cloakbrowser install");
  process.exitCode = 1;
} finally {
  await ctx?.close().catch(() => {});
}
