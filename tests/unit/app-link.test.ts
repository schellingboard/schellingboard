import { describe, expect, it } from "vitest";
import { staysInNext } from "@/app/components/app-link";

describe("staysInNext", () => {
  it("is true for the legacy app, the API and anything that is not a root path", () => {
    expect(staysInNext("/legacy")).toBe(true);
    expect(staysInNext("/legacy/conf/proposals")).toBe(true);
    expect(staysInNext("/legacy?x=1")).toBe(true);
    expect(staysInNext("/api/v1/health")).toBe(true);
    expect(staysInNext("#top")).toBe(true);
    expect(staysInNext("https://example.org")).toBe(true);
  });

  it("is false for the SPA's root pages", () => {
    expect(staysInNext("/conf")).toBe(false);
    expect(staysInNext("/conf?view=agenda")).toBe(false);
    expect(staysInNext("/legacyish")).toBe(false);
  });
});
