import { defineConfig } from "vitest/config";
import path from "path";
import { useCases } from "./tests/use-cases.ts";

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "server",
          include: [
            "tests/unit/**/*.test.{ts,tsx}",
            "tests/integration/**/*.test.{ts,tsx}",
          ],
          environment: "node",
          globalSetup: ["tests/global-setup.ts"],
          setupFiles: ["tests/setup.ts"],
          pool: "forks",
          tags: useCases.map(({ id, title }) => ({
            name: id,
            description: title,
          })),
          strictTags: true,
        },
      },
      "apps/web/vitest.config.ts",
    ],
    silent: "passed-only",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      exclude: ["tests/**"],
      // Slightly below actual coverage (see `make test-coverage`) so real
      // regressions fail while small refactors don't. Ratchet up over time.
      thresholds: {
        statements: 85,
        branches: 84,
        functions: 80,
        lines: 85,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
