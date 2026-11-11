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
    expect(calls.find((c) => c.method === "POST")).toMatchObject({
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
      call.method === "GET" ? Response.json({ enabled: true }) : noContent()
    );

    await userEvent.click(
      await screen.findByRole("button", { name: "Turn off" })
    );

    await waitFor(() => expect(current()).toBeNull());
    expect(calls.find((c) => c.method === "DELETE")).toMatchObject({
      method: "DELETE",
      path: `/api/v1/me/push-subscriptions?endpoint=${encodeURIComponent(ENDPOINT)}`,
    });
  });

  describe("the devices that have notifications on", () => {
    const devices = {
      items: [
        {
          id: "d1",
          host: "fcm.googleapis.com",
          createdAt: "2026-10-01T10:00:00Z",
          current: true,
        },
        {
          id: "d2",
          host: "web.push.apple.com",
          createdAt: "2026-10-05T10:00:00Z",
          current: false,
        },
      ],
    };
    const server = (call: { method: string; path: string }) => {
      if (call.path.startsWith("/api/v1/me/push-devices"))
        return call.method === "GET" ? Response.json(devices) : noContent();
      return call.method === "GET"
        ? Response.json({ enabled: true })
        : noContent();
    };

    it("lists them, marks this one and asks with this browser's endpoint", async () => {
      browser({ subscribed: true });
      const calls = setup(server);

      const list = await screen.findByRole("list", {
        name: "Notifications on your devices",
      });

      expect(list.textContent).toContain("fcm.googleapis.com");
      expect(list.textContent).toContain("web.push.apple.com");
      expect(list.textContent).toContain("This device");
      expect(calls.map((c) => c.path)).toContain(
        `/api/v1/me/push-devices?endpoint=${encodeURIComponent(ENDPOINT)}`
      );
    });

    it("turns another device off by its id and leaves this browser on", async () => {
      const current = browser({ subscribed: true });
      const calls = setup(server);

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Turn off web\.push\.apple\.com/,
        })
      );

      await waitFor(() =>
        expect(calls.find((c) => c.method === "DELETE")).toMatchObject({
          path: "/api/v1/me/push-devices/d2",
        })
      );
      expect(current()).not.toBeNull();
    });

    it("says so when a device cannot be turned off", async () => {
      browser({ subscribed: true });
      setup((call) =>
        call.method === "DELETE"
          ? new Response("down", { status: 500 })
          : server(call)
      );

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Turn off web\.push\.apple\.com/,
        })
      );

      expect(await screen.findByRole("alert")).toBeTruthy();
      expect(screen.getByRole("list").textContent).toContain(
        "web.push.apple.com"
      );
    });

    it("announces a device turned off and drops its row", async () => {
      browser({ subscribed: true });
      setup(server);

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Turn off web\.push\.apple\.com/,
        })
      );

      expect(await screen.findByRole("status")).toHaveProperty(
        "textContent",
        expect.stringContaining("Turned off for web.push.apple.com")
      );
      expect(screen.getByRole("list").textContent).not.toContain(
        "web.push.apple.com"
      );
    });

    it("turning this device's row off also ends the browser subscription", async () => {
      const current = browser({ subscribed: true });
      setup(server);

      await userEvent.click(
        await screen.findByRole("button", {
          name: /Turn off fcm\.googleapis\.com/,
        })
      );

      await waitFor(() => expect(current()).toBeNull());
      expect(
        await screen.findByRole("button", { name: "Turn on for this device" })
      ).toBeTruthy();
    });
  });
});
