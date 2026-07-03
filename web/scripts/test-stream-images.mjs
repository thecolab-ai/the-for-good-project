import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(webRoot, "..");
const streamsDir = path.join(repoRoot, "streams");
const snapshotPath = path.join(webRoot, "public", "data", "snapshot.json");
const summaryPath = path.join(webRoot, "public", "data", "streams-summary.json");

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
const summary = JSON.parse(readFileSync(summaryPath, "utf8"));

for (const entry of readdirSync(streamsDir).sort()) {
  if (!entry.endsWith(".md") || entry === "README.md" || entry === "TEMPLATE.md") continue;
  const { data } = matter(readFileSync(path.join(streamsDir, entry), "utf8"));
  const stream = Number(data.stream);
  const image = String(data.image || "");
  if (!image) {
    fail(`${entry}: missing image frontmatter`);
    continue;
  }
  if (!image.startsWith("/images/streams/")) {
    fail(`${entry}: image must be a public stream image path, got ${image}`);
  }
  if (!existsSync(path.join(webRoot, "public", image))) {
    fail(`${entry}: image asset does not exist at web/public${image}`);
  }

  const doc = snapshot.streamDocs?.find((d) => d.stream === stream);
  if (doc?.image !== image) fail(`${entry}: snapshot streamDoc image not propagated`);

  const fullSummary = snapshot.streamsSummary?.find((s) => s.stream === stream);
  if (fullSummary?.image !== image) fail(`${entry}: snapshot streamsSummary image not propagated`);

  const lightSummary = summary.streams?.find((s) => s.stream === stream);
  if (lightSummary?.image !== image) fail(`${entry}: streams-summary image not propagated`);
}

if (!process.exitCode) console.log("stream image data tests passed");
