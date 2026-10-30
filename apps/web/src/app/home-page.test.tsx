import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import type { FakeCall } from "../commands/fake-api";
import { snapshot } from "../replica/snapshot-fixture";
import { open } from "./page-test-support";

vi.mock("./hard-navigate", () => ({
  hardNavigate: vi.fn(),
  hardReload: vi.fn(),
}));

afterEach(cleanup);

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
});
