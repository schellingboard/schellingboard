import path from "node:path";
import { lingui } from "@lingui/vite-plugin";
import { defineConfig } from "vitest/config";
import { useCases } from "../../tests/use-cases.ts";

export default defineConfig({
  plugins: [
    lingui({
      configPath: path.join(import.meta.dirname, "lingui.config.ts"),
      macroTransform: true,
    }),
  ],
  test: {
    name: "web",
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "happy-dom",
    pool: "vmThreads",
    setupFiles: ["src/test-setup.ts"],
    tags: useCases.map(({ id, title }) => ({ name: id, description: title })),
    strictTags: true,
  },
});
