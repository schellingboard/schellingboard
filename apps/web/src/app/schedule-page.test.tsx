import { beforeEach, describe, expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { fakeApi, problem } from "../commands/fake-api";
import { createReplicaPersistence } from "../replica/persistence";
import { iso, snapshot } from "../replica/snapshot-fixture";
import { hardNavigate } from "./hard-navigate";
import { createAppRouter } from "./router";
import type { AppServices } from "./services";

vi.mock("./hard-navigate", () => ({
  hardNavigate: vi.fn(),
  hardReload: vi.fn(),
}));

class FakeSource {
  closed = false;
  readyState = 1;
  constructor(readonly url: string) {}
  addEventListener() {}
  close() {
    this.closed = true;
  }
}

// The fixture's own clock is before its scheduling phase.
const running: Snapshot = { ...snapshot, now: iso(9) };

type Setup = {
  snapshot?: Snapshot | Response;
  identity?: string | null;
  path?: string;
};

async function open({
  snapshot: snap = running,
  identity = "mia",
  path = "/conf",
}: Setup = {}) {
  const sources: FakeSource[] = [];
  const { api, calls } = fakeApi((call) => {
    if (call.path === "/api/v1/health")
      return Response.json({
        status: "ok",
        version: "4.1.0",
        buildId: "b",
        devTools: false,
      });
    if (call.path === "/api/v1/me/identity" && call.method === "PUT")
      return Response.json({
        guestId: (call.body as { guestId: string }).guestId,
      });
    if (call.path === "/api/v1/me/identity")
      return Response.json({ guestId: identity });
    if (call.path === "/api/v1/events")
      return Response.json({
        events: [
          { ...snapshot.event },
          { ...snapshot.event, id: "e2", slug: "other", name: "Other con" },
        ],
      });
    if (call.path === "/api/v1/events/conf/snapshot")
      return snap instanceof Response ? snap : Response.json(snap);
    if (call.method === "DELETE" && call.path.includes("/rsvps/"))
      return new Response(null, { status: 204 });
    return problem(404, "not.found");
  });
  const services: AppServices = {
    api,
    persistence: createReplicaPersistence(new IDBFactory()),
    createSource: (url) => {
      const source = new FakeSource(url);
      sources.push(source);
      return source as unknown as EventSource;
    },
  };
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: [path] }),
    services
  );
  await router.load();
  render(<RouterProvider router={router} />);
  return { calls, sources, router };
}

beforeEach(() => {
  vi.mocked(hardNavigate).mockClear();
  Element.prototype.scrollTo = vi.fn() as never;
});

describe("the event route", () => {
  it("sends a modal, kiosk or 1-on-1 address on to the legacy schedule", async () => {
    await open({ path: "/conf?view=agenda&viewSession=s1" });
    await waitFor(() =>
      expect(hardNavigate).toHaveBeenCalledWith(
        "/legacy/conf?view=agenda&viewSession=s1"
      )
    );
    expect(screen.queryByRole("link", { name: "Talk" })).toBeNull();
  });

  it("sends kiosk mode, remembered or asked for, on to the legacy schedule", async () => {
    document.cookie = "kiosk=1; path=/";
    await open();
    await waitFor(() =>
      expect(hardNavigate).toHaveBeenCalledWith("/legacy/conf")
    );
    document.cookie = "kiosk=; path=/; max-age=0";
  });

  it("leaves a legacy page's address to the legacy app, whatever events exist", async () => {
    await open({ path: "/settings" });
    await waitFor(() =>
      expect(hardNavigate).toHaveBeenCalledWith("/legacy/settings")
    );
  });
});

describe("the schedule page", () => {
  it(
    "shows the event's schedule from the replica, with the events in the nav",
    { tags: ["007-US1"] },
    async () => {
      await open();
      expect(await screen.findByRole("link", { name: "Talk" })).toBeTruthy();
      expect(
        screen
          .getAllByRole("link", { name: "Other con" })[0]
          .getAttribute("href")
      ).toBe("/other");
      expect(screen.getByText("Live")).toBeTruthy();
      expect(
        await screen.findByRole("button", { name: /Version 4.1.0/ })
      ).toBeTruthy();
    }
  );

  it(
    "sends an RSVP withdrawn from the grid badge to the server and shows it at once",
    { tags: ["009-US1"] },
    async () => {
      const { calls } = await open();
      await userEvent.click(
        await screen.findByRole("button", { name: "Withdraw RSVP from Talk" })
      );
      expect(
        await screen.findByRole("button", { name: "RSVP to Talk" })
      ).toBeTruthy();
      expect(calls.at(-1)).toMatchObject({
        method: "DELETE",
        path: "/api/v1/sessions/s/rsvps/mia",
      });
      expect(calls.at(-1)?.key).toBeTruthy();
    }
  );

  it("keeps the view in the address", { tags: ["007-US2"] }, async () => {
    const { router } = await open();
    await userEvent.click(
      await screen.findByRole("button", { name: "Agenda" })
    );
    expect(router.history.location.search).toBe("?view=agenda");
    expect(
      await screen.findByRole("heading", { level: 2, name: /June 15/ })
    ).toBeTruthy();
  });

  it("names the people who can be picked from the event's guests", async () => {
    await open({ identity: null });
    await userEvent.click(
      await screen.findByRole("button", { name: "Your name" })
    );
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("HOST")).toBeTruthy();
  });

  it("opens the event as the new viewer when the name is switched", async () => {
    const { calls, sources } = await open({ identity: null });
    await screen.findByRole("link", { name: "Talk" });
    await userEvent.click(screen.getByRole("button", { name: "Your name" }));
    await userEvent.click(
      within(await screen.findByRole("dialog")).getByRole("option", {
        name: /HOST/,
      })
    );
    await waitFor(() => expect(sources).toHaveLength(2));
    expect(sources[0].closed).toBe(true);
    expect(calls.filter((c) => c.path.endsWith("/snapshot"))).toHaveLength(2);
  });

  it("says when the event is not there", async () => {
    await open({ snapshot: problem(404, "event.notFound") });
    expect(await screen.findByText("Event not found")).toBeTruthy();
  });

  it("sends an event still taking proposals to its proposals page", async () => {
    const proposing: Snapshot = {
      ...running,
      event: {
        ...snapshot.event,
        proposalPhaseStart: iso(0),
        proposalPhaseEnd: iso(20),
        schedulingPhaseStart: new Date(Date.UTC(2026, 6, 1)).toISOString(),
      },
    };
    await open({ snapshot: proposing });
    await waitFor(() =>
      expect(hardNavigate).toHaveBeenCalledWith("/legacy/conf/proposals")
    );
  });
});
