import { describe, expect, it } from "vitest";

import { demoGate, DENIED_OPERATIONS } from "@/server/demo/gate";
import { openApiDocument } from "@/server/http/openapi";

const NEXT_RESET = new Date("2026-03-11T03:00:00Z");

const gate = demoGate({
  inner: async (req) => {
    const type = req.headers.get("content-type") ?? "";
    const title = type.toLowerCase().startsWith("multipart/")
      ? ((await req.formData()).get("title") as string)
      : "inner";
    return new Response(title, { status: 200 });
  },
  nextReset: () => NEXT_RESET,
});

const call = (path: string, init?: RequestInit) =>
  gate(new Request(`http://demo${path}`, init));

describe("the demo gate", { tags: ["024-US2"] }, () => {
  it.each([
    ["PUT", "/api/v1/me/credentials/password"],
    ["POST", "/api/v1/me/credentials/password"],
    ["POST", "/api/v1/me/credentials/unprotect"],
    ["PUT", "/api/v1/me/credentials/username"],
    ["PUT", "/api/v1/admin/guests/abc123/site-admin"],
    ["PUT", "/api/v1/me/avatar"],
    ["DELETE", "/api/v1/me/avatar"],
    ["PUT", "/api/v1/admin/locations/loc1/image"],
  ])("turns away %s %s", async (method, path) => {
    const res = await call(path, { method });

    expect(res.status).toBe(403);
    expect(res.headers.get("content-type")).toContain("problem+json");
    expect(((await res.json()) as { code: string }).code).toBe(
      "site.featureDisabled"
    );
  });

  it("turns away a new site map but lets the other settings through", async () => {
    const withMap = new FormData();
    withMap.set("title", "Demo");
    withMap.set("image", new File(["x"], "map.png", { type: "image/png" }));
    const titleOnly = new FormData();
    titleOnly.set("title", "Demo");

    const denied = await call("/api/v1/admin/settings", {
      method: "PUT",
      body: withMap,
    });
    const allowed = await call("/api/v1/admin/settings", {
      method: "PUT",
      body: titleOnly,
    });

    expect(denied.status).toBe(403);
    expect(allowed.status).toBe(200);
    expect(await allowed.text()).toBe("Demo");
  });

  it("is not fooled by an encoded path or a differently cased content type", async () => {
    const withMap = new FormData();
    withMap.set("image", new File(["x"], "map.png", { type: "image/png" }));
    const request = new Request("http://demo/api/v1/admin/settings", {
      method: "PUT",
      body: withMap,
    });
    request.headers.set(
      "content-type",
      request.headers
        .get("content-type")!
        .replace("multipart/form-data", "Multipart/Form-Data")
    );

    expect((await call("/api/v1/me/%61vatar", { method: "PUT" })).status).toBe(
      403
    );
    expect((await gate(request)).status).toBe(403);
  });

  it("turns away a sign-in name change through the admin guest form", async () => {
    const put = (body: object) =>
      call("/api/v1/admin/guests/g1", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

    expect((await put({ name: "A", username: null })).status).toBe(403);
    expect((await put({ name: "A" })).status).toBe(200);
  });

  it("lets everything else through", async () => {
    for (const [method, path] of [
      ["GET", "/api/v1/me/credentials"],
      ["POST", "/api/v1/auth/login"],
      ["GET", "/"],
    ]) {
      expect((await call(path, { method })).status).toBe(200);
    }
  });

  it("asks search engines to stay away, on denials too", async () => {
    expect((await call("/")).headers.get("x-robots-tag")).toBe("noindex");
    expect(
      (await call("/api/v1/me/avatar", { method: "PUT" })).headers.get(
        "x-robots-tag"
      )
    ).toBe("noindex");
  });

  it("reports when the demo resets next", async () => {
    const res = await call("/demo/status");

    expect(await res.json()).toEqual({
      msUntilReset: 0,
    });
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("denies only operations the API documents", () => {
    const { paths = {} } = openApiDocument();
    for (const { method, path } of DENIED_OPERATIONS) {
      expect(Object.keys(paths[path] ?? {}), `${method} ${path}`).toContain(
        method
      );
    }
  });
});
