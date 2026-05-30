import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";

// Load the shared package-level .env instead of web/.env.
const envDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig({
  plugins: [react()],
  envDir,
});
