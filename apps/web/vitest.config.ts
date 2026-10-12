import { defineConfig } from "vitest/config";
import { useCases } from "../../tests/use-cases";

export default defineConfig({
  test: {
    name: "web",
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "happy-dom",
    tags: useCases.map(({ id, title }) => ({ name: id, description: title })),
    strictTags: true,
  },
});
