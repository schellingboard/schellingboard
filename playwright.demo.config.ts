import { defineConfig, devices } from "@playwright/test";

// Points at a running demo container (scripts/e2e-demo.sh); no server, no seeding.
if (!process.env.E2E_PORT) {
  throw new Error("E2E_PORT is the port the running demo listens on");
}

export default defineConfig({
  testDir: "./tests/e2e-demo",
  reporter: "list",
  use: {
    baseURL: `http://localhost:${process.env.E2E_PORT}`,
    locale: "en-GB",
  },
  projects: [{ name: "firefox", use: { ...devices["Desktop Firefox"] } }],
  expect: { timeout: 10_000 },
});
