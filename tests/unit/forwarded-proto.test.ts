import { describe, expect, it } from "vitest";
import { withForwardedProto } from "@/server/http/forwarded";

describe("withForwardedProto", () => {
  it("takes the first scheme of the header, keeping method, headers and body", async () => {
    const out = withForwardedProto(
      new Request("http://shop.example/a?b=1", {
        method: "POST",
        body: "payload",
        headers: { "x-forwarded-proto": "https, http", "x-keep": "1" },
      })
    );
    expect(out.url).toBe("https://shop.example/a?b=1");
    expect(out.headers.get("x-keep")).toBe("1");
    expect(await out.text()).toBe("payload");
  });

  it("leaves a request alone without a usable header", () => {
    for (const value of [undefined, "ftp", ""]) {
      const req = new Request("http://shop.example/", {
        headers: value === undefined ? {} : { "x-forwarded-proto": value },
      });
      expect(withForwardedProto(req)).toBe(req);
    }
  });

  it("keeps the client's abort signal", () => {
    const controller = new AbortController();
    const out = withForwardedProto(
      new Request("http://shop.example/", {
        headers: { "x-forwarded-proto": "https" },
        signal: controller.signal,
      })
    );
    controller.abort();
    expect(out.signal.aborted).toBe(true);
  });
});
