import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { copyFileSync } from "node:fs";

// GitHub Pages has no server-side rewrite, so a deep link like
// /the-for-good-project/findings (or a refresh on it) would return a 404.
// Emitting 404.html as a byte-for-byte copy of index.html lets Pages serve
// the SPA for any unknown path; the browser router then renders the route.
function spaFallback() {
  return {
    name: "spa-404-fallback",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      copyFileSync(path.join(dist, "index.html"), path.join(dist, "404.html"));
    },
  };
}

// Project Pages site is served from /the-for-good-project/
export default defineConfig({
  base: "/the-for-good-project/",
  plugins: [react(), spaFallback()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
