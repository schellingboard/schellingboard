import { defineConfig } from "vitest/config";
import { useCases } from "../../tests/use-cases.ts";

export default defineConfig({
  test: {
    name: "web",
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "happy-dom",
    setupFiles: ["src/test-setup.ts"],
    tags: useCases.map(({ id, title }) => ({ name: id, description: title })),
    strictTags: true,
  },
});
