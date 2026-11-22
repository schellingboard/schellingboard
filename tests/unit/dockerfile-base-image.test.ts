import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const dockerfile = readFileSync(
  path.join(__dirname, "../../Dockerfile"),
  "utf8"
);

describe("Dockerfile base images", () => {
  it("builds every stage on an even-numbered Node major", () => {
    const majors = [...dockerfile.matchAll(/^FROM node:(\d+)/gm)].map((m) =>
      Number(m[1])
    );

    expect(majors.length).toBeGreaterThan(0);
    expect(majors.every((major) => major % 2 === 0)).toBe(true);
  });

  it("pins the Bun image to a minor version", () => {
    const tags = [...dockerfile.matchAll(/oven\/bun:([\w.-]+)/g)].map(
      (m) => m[1]
    );

    expect(tags.length).toBeGreaterThan(0);
    expect(tags.every((tag) => /^\d+\.\d+(\.\d+)?$/.test(tag))).toBe(true);
  });

  it("installs hoisted, as the runner copies packages by top-level path", () => {
    expect(dockerfile).toMatch(/bun install .*--linker hoisted/);
  });
});
