import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "web",
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "happy-dom",
  },
});
