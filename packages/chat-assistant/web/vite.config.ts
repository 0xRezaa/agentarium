import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import { viteConfigEnvSchema } from "./env.schema";

// Load the shared package-level .env instead of web/.env.
const envDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configEnv = viteConfigEnvSchema.parse(loadEnv("development", envDir, ""));

export default defineConfig({
  plugins: [react()],
  envDir,
  resolve: {
    alias: {
      "#chat-assistant/web": resolve(envDir, "web/src"),
    },
  },
  server: {
    proxy: {
      [configEnv.VITE_API_BASE_PATH]: {
        target: configEnv.API_BASE_URL,
        changeOrigin: true,
      },
    },
    port: configEnv.WEB_PORT,
  },
});
