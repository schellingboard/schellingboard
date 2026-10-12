import { describe, expect, it } from "vitest";
import { isLegacyPath, legacyHref } from "./legacy-href";

const at = (pathname: string, search = "", hash = "") => ({
  pathname,
  search,
  hash,
});

describe("legacyHref", () => {
  it("prefixes the path and keeps the query and hash", () => {
    expect(legacyHref(at("/conf/proposals", "?viewProposal=p1", "#top"))).toBe(
      "/legacy/conf/proposals?viewProposal=p1#top"
    );
  });

  it("sends the root to /legacy", () => {
    expect(legacyHref(at("/"))).toBe("/legacy");
  });

  it("stays on this origin for a crafted path", () => {
    for (const path of ["//evil.com", "/\\evil.com", "///evil.com/x"]) {
      expect(legacyHref(at(path)).startsWith("/legacy"), path).toBe(true);
    }
  });
});

describe("isLegacyPath", () => {
  it("matches /legacy and below, nothing that merely starts with it", () => {
    expect(isLegacyPath("/legacy")).toBe(true);
    expect(isLegacyPath("/legacy/conf")).toBe(true);
    expect(isLegacyPath("/legacy-conf")).toBe(false);
  });
});
