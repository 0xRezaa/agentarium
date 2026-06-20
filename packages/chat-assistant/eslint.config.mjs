import { defineConfig } from "eslint/config";
import baseConfig from "../../eslint.base.mjs";

export default defineConfig(...baseConfig, {
  ignores: [
    "server/src/db/kysely-generated.ts",
    "web/src/api/openapi-generated.ts",
  ],
});
