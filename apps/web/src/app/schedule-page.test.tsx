import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { problem } from "../commands/fake-api";
import { iso, snapshot } from "../replica/snapshot-fixture";
import { hardNavigate } from "./hard-navigate";
import { open, running } from "./page-test-support";

vi.mock("./hard-navigate", () => ({
  hardNavigate: vi.fn(),
  hardReload: vi.fn(),
}));

afterEach(() => {
  cleanup();
  document.cookie = "kiosk=; path=/; max-age=0";
});

beforeEach(() => {
  vi.mocked(hardNavigate).mockClear();
  Element.prototype.scrollTo = vi.fn() as never;
});

describe("the event route", () => {
  it(
    "opens a session on a new history entry, which Back closes",
    { tags: ["007-US1"] },
    async () => {
      const { router } = await open();
      await userEvent.click(await screen.findByRole("link", { name: "Talk" }));
      expect(
        await screen.findByRole("dialog", { name: "Session details" })
      ).toBeTruthy();
      expect(router.history.location.search).toBe("?viewSession=s");
      router.history.back();
      await waitFor(() =>
        expect(
          screen.queryByRole("dialog", { name: "Session details" })
        ).toBeNull()
      );
      expect(router.history.location.search).toBe("");
    }
  );

  it(
    "closes a session reached by its address in place",
    { tags: ["007-US1"] },
    async () => {
      const { router } = await open({ path: "/conf?viewSession=s" });
      const dialog = await screen.findByRole("dialog", {
        name: "Session details",
      });
      await userEvent.click(
        within(dialog).getByRole("button", { name: "Close" })
      );
      await waitFor(() =>
        expect(
          screen.queryByRole("dialog", { name: "Session details" })
        ).toBeNull()
      );
      expect(router.history.location.search).toBe("");
      expect(router.history.length).toBe(1);
    }
  );

  it(
    "keeps a comment's hash when a session is reached by its address",
    { tags: ["010-US5"] },
    async () => {
      const { router } = await open({ path: "/conf?viewSession=s#comment-c1" });
      await screen.findByRole("dialog", { name: "Session details" });
      expect(router.history.location.hash).toBe("#comment-c1");
    }
  );

  it("shows kiosk mode, asked for or remembered, itself", async () => {
    document.cookie = "kiosk=1; path=/";
    await open();
    expect(await screen.findByRole("link", { name: "Talk" })).toBeTruthy();
    expect(hardNavigate).not.toHaveBeenCalled();
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
        (await screen.findAllByRole("button", { name: /Version 4.1.0/ })).length
      ).toBeGreaterThan(0);
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
    const { router } = await open({ snapshot: proposing });
    await waitFor(() =>
      expect(router.history.location.pathname).toBe("/conf/proposals")
    );
    expect(
      await screen.findByRole("heading", { name: "Conf: Session Proposals" })
    ).toBeTruthy();
  });
});
