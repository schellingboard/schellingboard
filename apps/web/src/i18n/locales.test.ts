import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, resolveLocale } from "./locales";

describe("resolveLocale", { tags: ["022-US1"] }, () => {
  it("prefers the stored locale", () => {
    expect(resolveLocale("en", ["de-DE"])).toBe("en");
  });

  it("falls back to the first supported browser language", () => {
    expect(resolveLocale(null, ["fr-FR", "en-GB", "de"])).toBe("en");
  });

  it("matches a regional browser language by its base language", () => {
    expect(resolveLocale(undefined, ["EN-us"])).toBe("en");
  });

  it("ignores a stored locale that is not supported", () => {
    expect(resolveLocale("xx", ["en"])).toBe("en");
  });

  it("falls back to the default when nothing matches", () => {
    expect(resolveLocale(null, ["fr", "ja"])).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(null, [])).toBe(DEFAULT_LOCALE);
  });
});

describe("resolveLocale with several locales", { tags: ["022-US1"] }, () => {
  const locales = ["en", "de-DE"];

  it("matches a bare or other regional tag to the supported regional locale", () => {
    expect(resolveLocale(null, ["de"], locales)).toBe("de-DE");
    expect(resolveLocale(null, ["de-AT"], locales)).toBe("de-DE");
  });

  it("prefers an exact match over a base-language match", () => {
    expect(resolveLocale(null, ["de-DE"], ["de-AT", "de-DE"])).toBe("de-DE");
  });
});
