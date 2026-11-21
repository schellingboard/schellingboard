// @module-tag 020-US2
import { describe, expect, it } from "vitest";

import { e2eImportGraph, precommitPlan } from "@/scripts/precommit";

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

  it("runs the E2E specs that use a changed helper, also through others", () => {
    const imports = {
      "tests/e2e/rsvp.spec.ts": ["tests/e2e/helpers/admin.ts"],
      "tests/e2e/settings.spec.ts": ["tests/e2e/helpers/auth.ts"],
      "tests/e2e/voting.spec.ts": ["tests/e2e/helpers/toast.ts"],
      "tests/e2e/rsvp-mail.spec.ts": ["tests/helpers/mailpit.ts"],
      "tests/e2e/helpers/admin.ts": ["tests/e2e/helpers/auth.ts"],
    };
    expect(precommitPlan(["tests/helpers/mailpit.ts"], imports).e2e).toEqual({
      specs: ["tests/e2e/rsvp-mail.spec.ts"],
      globalsSpecs: [],
    });
    expect(precommitPlan(["tests/e2e/helpers/auth.ts"], imports).e2e).toEqual({
      specs: ["tests/e2e/rsvp.spec.ts"],
      globalsSpecs: ["tests/e2e/settings.spec.ts"],
    });
  });

  it("runs the whole E2E suite when the E2E setup changed", () => {
    for (const file of [
      "tests/e2e/init.ts",
      "playwright.config.ts",
      "set-env.ts",
      ".env.test",
    ]) {
      expect(precommitPlan([file]).e2e, file).toBe("all");
    }
  });

  it("lints everything when the lint setup or dependencies changed", () => {
    for (const file of ["eslint.config.mjs", "package.json", "bun.lock"]) {
      expect(precommitPlan([file]).lintAll, file).toBe(true);
    }
    expect(precommitPlan(["server/a.ts"]).lintAll).toBe(false);
  });

  it("formats everything when the formatter setup changed", () => {
    expect(precommitPlan([".prettierrc"]).formatAll).toBe(true);
    expect(precommitPlan(["server/a.ts"]).formatAll).toBe(false);
  });

  it("runs every vitest test when dependencies or test setup changed", () => {
    for (const file of [
      "package.json",
      "bun.lock",
      "apps/web/tsconfig.app.json",
      "vitest.config.ts",
      "apps/web/vitest.config.ts",
      "set-env.ts",
      "tests/setup.ts",
      "apps/web/src/test-setup.ts",
      "drizzle/0042_thing.sql",
    ]) {
      expect(precommitPlan([file]).testAll, file).toBe(true);
    }
  });

  it("runs only the targeted checks, not everything, for tooling changes", () => {
    for (const file of ["eslint.config.mjs", "package.json", "drizzle/1.sql"]) {
      expect(precommitPlan([file]).full, file).toBe(false);
    }
    expect(precommitPlan(["server/a.ts", "Makefile"]).full).toBe(true);
  });

  it("does nothing for no changes", () => {
    expect(precommitPlan([])).toMatchObject({
      full: false,
      formatAll: false,
      lintAll: false,
      testAll: false,
      format: [],
      lint: [],
      related: [],
      e2e: { specs: [], globalsSpecs: [] },
    });
  });
});

describe("e2eImportGraph", () => {
  it("reads the E2E files from disk, so it needs neither git nor jj", () => {
    const graph = e2eImportGraph();
    expect(graph["tests/e2e/admin.spec.ts"]).toContain(
      "tests/e2e/helpers/admin.ts"
    );
    expect(Object.keys(graph).every((file) => !file.includes("\\"))).toBe(true);
  });
});
