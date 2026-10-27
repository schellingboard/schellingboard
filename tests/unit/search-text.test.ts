import { describe, it, expect } from "vitest";
import {
  normalizeForSearch,
  containsIgnoringAccents,
  equalsIgnoringAccents,
} from "@schellingboard/domain/search-text";

describe("normalizeForSearch", () => {
  it("trims, lowercases and strips accents", () => {
    expect(normalizeForSearch("  ÄùàÆåÑ ")).toBe("auaæan");
  });

  it("leaves already-normalized text untouched", () => {
    expect(normalizeForSearch("berlin")).toBe("berlin");
  });
});

describe("containsIgnoringAccents", () => {
  it("matches regardless of case and accents in either string", () => {
    expect(containsIgnoringAccents("Café Münchén", "cafe mun")).toBe(true);
    expect(containsIgnoringAccents("cafe munchen", "Münch")).toBe(true);
  });

  it("does not match unrelated text", () => {
    expect(containsIgnoringAccents("Café", "tea")).toBe(false);
  });

  it("matches everything for an empty needle", () => {
    expect(containsIgnoringAccents("Café", "  ")).toBe(true);
  });
});

describe("equalsIgnoringAccents", () => {
  it("compares whole strings ignoring case and accents", () => {
    expect(equalsIgnoringAccents("Español", " espanol ")).toBe(true);
  });

  it("rejects a substring", () => {
    expect(equalsIgnoringAccents("Español", "espa")).toBe(false);
  });
});
