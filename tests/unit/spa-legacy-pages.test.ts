import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Read as text: nothing outside apps/web may import it.
const listed = [
  ...(
    /LEGACY_ROOT_PAGES = \[([^\]]*)\]/.exec(
      readFileSync(
        join(process.cwd(), "apps/web/src/app/legacy-pages.ts"),
        "utf8"
      )
    )?.[1] ?? ""
  ).matchAll(/"([a-z-]+)"/g),
].map((m) => m[1]);

const legacy = join(process.cwd(), "app/legacy");
const dirs = (path: string) =>
  readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

describe("the SPA's list of legacy root pages", () => {
  it("names every page directly under /legacy that is not an event", () => {
    const pages = [
      ...dirs(legacy).filter((name) => !name.startsWith("(")),
      ...dirs(legacy)
        .filter((name) => name.startsWith("("))
        .flatMap((group) => dirs(join(legacy, group))),
    ].filter((name) => !name.startsWith("["));
    expect([...listed].sort()).toEqual(pages.sort());
  });
});

describe("the E2E fixture's copy of that list", () => {
  it("matches", () => {
    const text = readFileSync(
      join(process.cwd(), "tests/e2e/helpers/fixtures.ts"),
      "utf8"
    );
    const block = /const LEGACY_ROOT_PAGES = \[([^\]]*)\]/.exec(text)?.[1];
    const copy = [...(block ?? "").matchAll(/"([a-z-]+)"/g)].map((m) => m[1]);
    expect(copy.sort()).toEqual([...listed].sort());
  });
});
