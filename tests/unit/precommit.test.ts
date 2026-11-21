// @module-tag 020-US2
import { describe, expect, it } from "vitest";

import { precommitPlan } from "@/scripts/precommit";

describe("precommitPlan", () => {
  it("formats every changed file and lints only code", () => {
    const plan = precommitPlan(["server/a.ts", "docs/x.md", "apps/web/b.tsx"]);
    expect(plan.full).toBe(false);
    expect(plan.format).toEqual(["server/a.ts", "docs/x.md", "apps/web/b.tsx"]);
    expect(plan.lint).toEqual(["server/a.ts", "apps/web/b.tsx"]);
  });

  it("runs the vitest tests related to changed code", () => {
    const plan = precommitPlan(["server/a.ts", "tests/unit/a.test.ts", "x.md"]);
    expect(plan.related).toEqual(["server/a.ts", "tests/unit/a.test.ts"]);
  });

  it("leaves E2E specs out of the vitest run", () => {
    const plan = precommitPlan(["tests/e2e/rsvp.spec.ts"]);
    expect(plan.related).toEqual([]);
  });

  it("runs only changed E2E specs, globals-mutating ones apart", () => {
    const plan = precommitPlan([
      "tests/e2e/rsvp.spec.ts",
      "tests/e2e/settings.spec.ts",
      "tests/e2e/user-settings.spec.ts",
      "server/a.ts",
    ]);
    expect(plan.e2e).toEqual({
      specs: ["tests/e2e/rsvp.spec.ts", "tests/e2e/user-settings.spec.ts"],
      globalsSpecs: ["tests/e2e/settings.spec.ts"],
    });
  });

  it("runs the whole E2E suite when a shared E2E file changed", () => {
    expect(precommitPlan(["tests/e2e/helpers/auth.ts"]).e2e).toBe("all");
    expect(precommitPlan(["tests/e2e/init.ts"]).e2e).toBe("all");
  });

  it("runs everything when tooling or test setup changed", () => {
    for (const file of [
      "package.json",
      "bun.lock",
      "Makefile",
      "eslint.config.mjs",
      ".prettierrc",
      "apps/web/tsconfig.app.json",
      "vitest.config.ts",
      "apps/web/vitest.config.ts",
      "playwright.config.ts",
      "set-env.ts",
      "tests/setup.ts",
      "drizzle/0042_thing.sql",
    ]) {
      expect(precommitPlan(["server/a.ts", file]).full, file).toBe(true);
    }
  });

  it("does nothing for no changes", () => {
    expect(precommitPlan([])).toMatchObject({
      full: false,
      format: [],
      lint: [],
      related: [],
      e2e: { specs: [], globalsSpecs: [] },
    });
  });
});
