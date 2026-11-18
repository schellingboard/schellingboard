import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FakeCall } from "../commands/fake-api";
import { snapshot } from "../replica/snapshot-fixture";
import { open } from "./page-test-support";

vi.mock("./hard-navigate", () => ({
  hardNavigate: vi.fn(),
  hardReload: vi.fn(),
}));

afterEach(cleanup);

// Captured before the clock is faked, so real I/O (the fake IndexedDB) can finish.
const realSetTimeout = globalThis.setTimeout;
const realTick = () =>
  new Promise<void>((resolve) => realSetTimeout(resolve, 0));

const site = { title: "Unconf Hub", description: "", mapImageUrl: "" };

const withEvents =
  (...slugs: string[]) =>
  (call: FakeCall): Response | undefined => {
    if (call.path === "/api/v1/site") return Response.json(site);
    if (call.path === "/api/v1/events")
      return Response.json({
        events: slugs.map((slug) => ({
          ...snapshot.event,
          slug,
          name: `${slug} con`,
        })),
        now: snapshot.now,
      });
    return undefined;
  };

describe("the root page", { tags: ["002-US2"] }, () => {
  it("lists the events with the site's title when there are several", async () => {
    const { router } = await open({
      path: "/",
      handler: withEvents("a", "b"),
    });

    expect(
      await screen.findByRole("heading", { name: "Unconf Hub" })
    ).toBeTruthy();
    expect(await screen.findByRole("heading", { name: "a con" })).toBeTruthy();
    expect(router.state.location.pathname).toBe("/");
  });

  it("goes to the only event", async () => {
    const { router } = await open({ path: "/", handler: withEvents("solo") });

    await waitFor(() => expect(router.state.location.pathname).toBe("/solo"));
  });

  it("says so when there are no events", async () => {
    await open({ path: "/", handler: withEvents() });

    expect(await screen.findByText("No events found.")).toBeTruthy();
  });

  it("says so when the events cannot be loaded", async () => {
    await open({
      path: "/",
      handler: (call) =>
        call.path === "/api/v1/events"
          ? Response.json({ code: "boom" }, { status: 500 })
          : withEvents("a", "b")(call),
    });

    expect(
      await screen.findByText("The events could not be loaded.")
    ).toBeTruthy();
  });

  it("keeps trying after a failure and shows the events once they load", async () => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
      toFake: ["setTimeout", "clearTimeout"],
    });
    try {
      let failures = 2;
      await open({
        path: "/",
        handler: (call) => {
          if (call.path === "/api/v1/events" && failures-- > 0)
            return Response.json({ code: "boom" }, { status: 429 });
          return withEvents("a", "b")(call);
        },
      });
      await screen.findByText("The events could not be loaded.");

      for (
        let i = 0;
        i < 40 && !screen.queryByRole("heading", { name: "a con" });
        i++
      ) {
        await act(() => vi.advanceTimersByTimeAsync(3_000));
        await realTick();
      }

      expect(screen.getByRole("heading", { name: "a con" })).toBeTruthy();
      expect(screen.queryByText("The events could not be loaded.")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("tries again at once when the connection comes back", async () => {
    let failing = true;
    await open({
      path: "/",
      handler: (call) =>
        call.path === "/api/v1/events" && failing
          ? Response.json({ code: "boom" }, { status: 500 })
          : withEvents("a", "b")(call),
    });
    await screen.findByText("The events could not be loaded.");

    failing = false;
    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(await screen.findByRole("heading", { name: "a con" })).toBeTruthy();
  });

  it("lets the visitor try again by hand", async () => {
    const user = userEvent.setup();
    let failing = true;
    await open({
      path: "/",
      handler: (call) =>
        call.path === "/api/v1/events" && failing
          ? Response.json({ code: "boom" }, { status: 500 })
          : withEvents("a", "b")(call),
    });
    await screen.findByText("The events could not be loaded.");

    failing = false;
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("heading", { name: "a con" })).toBeTruthy();
  });
});
