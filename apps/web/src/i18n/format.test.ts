import { describe, expect, it } from "vitest";
import { clockStyleFor, formatLocale } from "./format";

describe("formatLocale", { tags: ["022-US1"] }, () => {
  it("keeps the region the browser asks for within the app's language", () => {
    expect(formatLocale("en", ["en-GB", "de"])).toBe("en-GB");
    expect(formatLocale("en", ["fr", "en-US"])).toBe("en-US");
  });

  it("uses the app's language when the browser asks for another", () => {
    expect(formatLocale("de-DE", ["en-GB"])).toBe("de-DE");
    expect(formatLocale("en", [])).toBe("en");
  });

  it("borrows the region of a browser in another language", () => {
    expect(formatLocale("en", ["de-DE"])).toBe("en-DE");
    expect(formatLocale("en", ["fr"])).toBe("en-FR");
  });
});

describe("clockStyleFor", { tags: ["014-US7"] }, () => {
  it("follows the conventions of the locale", () => {
    expect(clockStyleFor("en-US")).toBe("12h");
    expect(clockStyleFor("en-GB")).toBe("24h");
    expect(clockStyleFor("de-DE")).toBe("24h");
  });
});
