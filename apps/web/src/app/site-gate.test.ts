import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "@schellingboard/api-client";
import { sendToSiteLoginWhenGated } from "./site-gate";

function setup(response: Response, pathname = "/conf") {
  const navigate = vi.fn();
  const api = createApiClient({
    baseUrl: "http://x",
    fetch: () => Promise.resolve(response),
  });
  sendToSiteLoginWhenGated(api, { pathname, search: "?a=1" }, navigate);
  return { api, navigate };
}

const gated = () =>
  Response.json({ code: "site.unauthenticated" }, { status: 401 });

describe("site password gate", () => {
  it("sends a visitor without the site cookie to the password page, returning here after", async () => {
    const { api, navigate } = setup(gated());
    await api.GET("/api/v1/site");
    expect(navigate).toHaveBeenCalledWith("/login?redirect=%2Fconf%3Fa%3D1");
  });

  it("leaves other refusals and the password page alone", async () => {
    const other = setup(
      Response.json({ code: "admin.forbidden" }, { status: 401 })
    );
    await other.api.GET("/api/v1/site");
    const onLogin = setup(gated(), "/login");
    await onLogin.api.GET("/api/v1/site");
    expect(other.navigate).not.toHaveBeenCalled();
    expect(onLogin.navigate).not.toHaveBeenCalled();
  });
});
