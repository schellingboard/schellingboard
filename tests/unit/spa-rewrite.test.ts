import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config.js";

describe("next.config rewrites", () => {
  it("serve /_spa/ from the SPA asset route", async () => {
    const rewrites = await nextConfig.rewrites?.();
    expect(rewrites).toEqual([
      { source: "/_spa/:path*", destination: "/api/spa/assets/:path*" },
    ]);
  });
});
