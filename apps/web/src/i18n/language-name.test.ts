import { describe, expect, it } from "vitest";

import { languageName } from "./locales";

describe("languageName", { tags: ["022-US1"] }, () => {
  it("names a language in itself, capitalised and without its region", () => {
    expect(languageName("es-ES")).toBe("Español");
    expect(languageName("pt-PT")).toBe("Português");
    expect(languageName("de")).toBe("Deutsch");
    expect(languageName("en")).toBe("English");
  });
});
