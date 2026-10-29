import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi, type FakeHandler } from "../../commands/fake-api";
import { settingsCalls } from "../../commands/settings";
import { PushNotifications } from "./push-notifications";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const ENDPOINT = "https://push.example/abc";

function browser({
  permission = "default",
  subscribed = false,
}: { permission?: NotificationPermission; subscribed?: boolean } = {}) {
  let subscription: object | null = subscribed ? sub() : null;
  function sub() {
    return {
      endpoint: ENDPOINT,
      toJSON: () => ({ keys: { p256dh: "p", auth: "a" } }),
      unsubscribe: vi.fn(() => {
        subscription = null;
        return Promise.resolve(true);
      }),
    };
  }
  const pushManager = {
    getSubscription: () => Promise.resolve(subscription),
    subscribe: () => Promise.resolve((subscription = sub())),
  };
  const registration = { pushManager };
  vi.stubGlobal("PushManager", class {});
  vi.stubGlobal("Notification", {
    permission,
    requestPermission: () => Promise.resolve("granted"),
  });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      getRegistration: () =>
        Promise.resolve(subscription ? registration : undefined),
      register: () => Promise.resolve(registration),
      ready: Promise.resolve(registration),
    },
  });
  return () => subscription;
}

function setup(handler: FakeHandler) {
  const { api, calls } = fakeApi(handler);
  render(<PushNotifications publicKey="AQAB" calls={settingsCalls(api)} />);
  return calls;
}

const noContent = () => new Response(null, { status: 204 });

describe("notifications on this device", { tags: ["013-US3"] }, () => {
  it("says so when the browser cannot show notifications", async () => {
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: undefined,
    });
    vi.stubGlobal("PushManager", undefined);
    // `in` needs the key gone, not undefined.
    delete (window as unknown as Record<string, unknown>).PushManager;
    delete (navigator as unknown as Record<string, unknown>).serviceWorker;

    setup(noContent);

    expect(await screen.findByText(/can.t show notifications/)).toBeTruthy();
  });

  it("explains a blocked permission", async () => {
    browser({ permission: "denied" });

    setup(noContent);

    expect(await screen.findByText(/blocked for this site/)).toBeTruthy();
  });

  it("turns on for this device and tells the server", async () => {
    browser();
    const calls = setup(noContent);

    await userEvent.click(
      await screen.findByRole("button", { name: "Turn on for this device" })
    );

    expect(await screen.findByText("On for this device.")).toBeTruthy();
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/me/push-subscriptions",
      body: { endpoint: ENDPOINT, p256dh: "p", auth: "a" },
    });
  });

  it("ends a browser subscription the server does not know as the guest's", async () => {
    const current = browser({ subscribed: true });

    setup(() => Response.json({ enabled: false }));

    expect(
      await screen.findByRole("button", { name: "Turn on for this device" })
    ).toBeTruthy();
    expect(current()).toBeNull();
  });

  it("keeps the browser subscription when the server cannot answer", async () => {
    const current = browser({ subscribed: true });

    setup(() => new Response("down", { status: 500 }));

    expect(
      await screen.findByRole("button", { name: "Turn on for this device" })
    ).toBeTruthy();
    expect(current()).not.toBeNull();
  });

  it("turns off: the server first, then the browser", async () => {
    const current = browser({ subscribed: true });
    const calls = setup((call) =>
      call.path.endsWith("/check")
        ? Response.json({ enabled: true })
        : noContent()
    );

    await userEvent.click(
      await screen.findByRole("button", { name: "Turn off" })
    );

    await waitFor(() => expect(current()).toBeNull());
    expect(calls[1]).toMatchObject({
      path: "/api/v1/me/push-subscriptions/remove",
      body: { endpoint: ENDPOINT },
    });
  });
});
