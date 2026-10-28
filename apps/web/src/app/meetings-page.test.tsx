import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { iso, snapshot } from "../replica/snapshot-fixture";
import { open, running } from "./page-test-support";

vi.mock("./hard-navigate", () => ({
  hardNavigate: vi.fn(),
  hardReload: vi.fn(),
}));

afterEach(cleanup);
beforeEach(() => {
  Element.prototype.scrollTo = vi.fn() as never;
});

const withMeeting = (base: typeof snapshot) => ({
  ...base,
  me: {
    ...base.me!,
    meetings: [
      {
        id: "m1",
        eventId: "e",
        requesterId: "kai",
        recipientId: base.me!.guestId,
        slotStart: iso(12),
        slotEnd: iso(13),
        meetingPoint: "Coffee bar",
        message: "Hello",
        cancelNote: "",
        status: "pending" as const,
        createdAt: "2026-06-01T00:00:00.000Z",
        respondedAt: null,
      },
    ],
    meetingGuests: [
      {
        id: "kai",
        name: "Kai",
        avatarUrl: null,
        aboutMe: null,
        authProtected: false,
        profileVersion: 1,
      },
    ],
  },
});
const scheduling = withMeeting(running);

describe("a 1-on-1 over the schedule", { tags: ["012-US4"] }, () => {
  it("opens from its address and answers with a command", async () => {
    const { calls } = await open({
      snapshot: scheduling,
      path: "/conf?viewMeeting=m1",
      handler: (call) =>
        call.path === "/api/v1/meetings/m1/accept"
          ? Response.json({})
          : call.path.startsWith("/api/v1/meetings?")
            ? Response.json({ meetings: [], availability: [] })
            : undefined,
    });
    const dialog = await screen.findByRole("dialog", {
      name: "1-on-1 details",
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Accept" })
    );
    await waitFor(() =>
      expect(calls.some((c) => c.path === "/api/v1/meetings/m1/accept")).toBe(
        true
      )
    );
  });

  it("closes in place when reached by its address", async () => {
    const { router } = await open({
      snapshot: scheduling,
      path: "/conf?viewMeeting=m1",
    });
    const dialog = await screen.findByRole("dialog", {
      name: "1-on-1 details",
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close" })
    );
    await waitFor(() => expect(router.history.location.search).toBe(""));
  });

  it("opens the booking dialog for a slot", async () => {
    const { calls } = await open({
      path: "/conf?bookMeeting=2026-06-15T09%3A00%3A00.000Z",
    });
    await screen.findByRole("dialog");
    await waitFor(() =>
      expect(
        calls.some((c) => c.path.startsWith("/api/v1/meeting-candidates?"))
      ).toBe(true)
    );
  });
});

describe("a 1-on-1 notification", { tags: ["012-US4"] }, () => {
  it("hands the meeting to the schedule during scheduling", async () => {
    const { router } = await open({
      snapshot: scheduling,
      path: "/conf/meetings?viewMeeting=m1",
    });
    await screen.findByRole("dialog", { name: "1-on-1 details" });
    expect(router.history.location.pathname).toBe("/conf");
  });

  it("opens it read-only outside scheduling (#952)", async () => {
    await open({
      snapshot: withMeeting(snapshot),
      path: "/conf/meetings?viewMeeting=m1",
    });
    const dialog = await screen.findByRole("dialog", {
      name: "1-on-1 details",
    });
    expect(within(dialog).queryByRole("button", { name: "Accept" })).toBeNull();
    expect(screen.getByText(/can only be answered or canceled/)).toBeTruthy();
  });

  it("tells a reader with no name chosen so, instead of redirecting", async () => {
    const { router } = await open({
      snapshot: { ...running, me: null },
      identity: null,
      path: "/conf/meetings?viewMeeting=m1",
    });
    expect(await screen.findByText(/1-on-1s/)).toBeTruthy();
    expect(router.history.location.pathname).toBe("/conf/meetings");
  });

  it("asks for the password when the chosen name is protected", async () => {
    await open({
      snapshot: { ...running, me: null },
      identity: null,
      path: "/conf/meetings?viewMeeting=m1",
      handler: (call) =>
        call.path === "/api/v1/me/identity"
          ? Response.json({ guestId: null, awaitingLogin: true })
          : undefined,
    });
    expect(await screen.findByText(/password/i)).toBeTruthy();
  });
});

describe("a 1-on-1 address without a name", { tags: ["012-US4"] }, () => {
  it("says so over the schedule", async () => {
    await open({
      snapshot: { ...running, me: null },
      identity: null,
      path: "/conf?viewMeeting=m1",
    });
    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByText(/1-on-1s/)).toBeTruthy();
  });
});
