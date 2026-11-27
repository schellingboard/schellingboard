import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { adminProxySignInCalls } from "../../commands/admin-proxy-sign-in";
import { fakeApi, type FakeCall, problem } from "../../commands/fake-api";
import type { ProxySignInSettings } from "../../queries/admin-proxy-sign-in";
import { NoticeProvider } from "../../ui/notices";
import { ProxySignInCard } from "./proxy-sign-in-card";

afterEach(cleanup);

const off: ProxySignInSettings = {
  enabled: false,
  headerName: "X-Forwarded-Email",
  addresses: [],
  logoutUrl: "",
  siteAdmins: false,
  secretSet: false,
  ownRequest: null,
};

const setup = (
  current: ProxySignInSettings = off,
  handler: (call: FakeCall) => Response = () =>
    Response.json({ secret: "s3cret-value" })
) => {
  const { api, calls } = fakeApi(handler);
  const onChanged = vi.fn();
  render(
    <NoticeProvider>
      <ProxySignInCard
        settings={current}
        calls={adminProxySignInCalls(api)}
        onChanged={onChanged}
      />
    </NoticeProvider>
  );
  return { calls, onChanged };
};

describe("the proxy sign-in card", { tags: ["025-US1"] }, () => {
  it("saves the options, one address per line", async () => {
    const { calls, onChanged } = setup(off, () =>
      Response.json({ ...off, enabled: true })
    );

    await userEvent.click(screen.getByLabelText("Sign in through a proxy"));
    const header = screen.getByLabelText("Header with the email");
    await userEvent.clear(header);
    await userEvent.type(header, "Remote-Email");
    await userEvent.type(
      screen.getByLabelText("Proxy addresses"),
      "10.0.0.1{Enter}172.16.0.0/12"
    );
    await userEvent.type(
      screen.getByLabelText("Sign out address"),
      "https://sso.example/logout"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Save proxy sign-in" })
    );

    expect(await screen.findByText("Proxy sign-in saved.")).toBeTruthy();
    expect(onChanged).toHaveBeenCalled();
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/admin/proxy-sign-in",
      body: {
        enabled: true,
        headerName: "Remote-Email",
        addresses: ["10.0.0.1", "172.16.0.0/12"],
        logoutUrl: "https://sso.example/logout",
        siteAdmins: false,
      },
    });
  });

  it("shows a refused address next to its field", async () => {
    setup(off, () =>
      problem(
        400,
        "settings.proxyAddressInvalid",
        "Not an IP address or range: nope"
      )
    );

    await userEvent.type(screen.getByLabelText("Proxy addresses"), "nope");
    await userEvent.click(
      screen.getByRole("button", { name: "Save proxy sign-in" })
    );

    const field = screen.getByLabelText("Proxy addresses");
    await waitFor(() =>
      expect(field.getAttribute("aria-invalid")).toBe("true")
    );
    const errorId = field.getAttribute("aria-describedby") ?? "";
    expect(
      document.getElementById(errorId.split(" ").pop() ?? "")?.textContent
    ).toContain("Not an IP address or range: nope");
  });

  it("warns while the sign-in is on with no secret and no address", () => {
    setup({ ...off, enabled: true });
    expect(screen.getByRole("alert").textContent).toContain(
      "reaches the app without the proxy"
    );
  });

  it("does not warn with a secret, an address, or while off", () => {
    setup({ ...off, enabled: true, secretSet: true });
    expect(screen.queryByRole("alert")).toBeNull();
    cleanup();
    setup({ ...off, enabled: true, addresses: ["10.0.0.1"] });
    expect(screen.queryByRole("alert")).toBeNull();
    cleanup();
    setup(off);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows a new secret once", async () => {
    const { calls, onChanged } = setup();

    await userEvent.click(screen.getByRole("button", { name: "Make secret" }));

    expect(await screen.findByText("s3cret-value")).toBeTruthy();
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/admin/proxy-sign-in/secret",
    });
    expect(onChanged).toHaveBeenCalled();
  });

  it("removes the secret", async () => {
    const { calls } = setup(
      { ...off, secretSet: true },
      () => new Response(null, { status: 204 })
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Remove secret" })
    );

    expect(await screen.findByText("Secret removed.")).toBeTruthy();
    expect(calls[0]).toMatchObject({
      method: "DELETE",
      path: "/api/v1/admin/proxy-sign-in/secret",
    });
  });

  it("says what this request carried", () => {
    setup({
      ...off,
      enabled: true,
      secretSet: true,
      ownRequest: { headerSeen: true, trusted: false },
    });
    expect(
      screen.getByText(/did not pass the secret or address check/)
    ).toBeTruthy();
    cleanup();
    setup({
      ...off,
      enabled: true,
      secretSet: true,
      ownRequest: { headerSeen: false, trusted: false },
    });
    expect(
      screen.getByText(/carried no X-Forwarded-Email header/)
    ).toBeTruthy();
    cleanup();
    setup({
      ...off,
      enabled: true,
      ownRequest: { headerSeen: true, trusted: true },
    });
    expect(screen.getByText(/carried the header and was trusted/)).toBeTruthy();
  });
});
