import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Project Pages site is served from /the-for-good-project/
export default defineConfig({
  base: "/the-for-good-project/",
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
