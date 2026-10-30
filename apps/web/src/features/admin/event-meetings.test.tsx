import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { adminEventCalls } from "../../commands/admin-events";
import { fakeApi, problem, type FakeCall } from "../../commands/fake-api";
import type { AdminEvent } from "../../queries/admin-events";
import type { MeetingPoint } from "../../queries/admin-meeting-points";
import { NoticeProvider } from "../../ui/notices";
import { EventMeetingsForm } from "./event-meetings";

afterEach(cleanup);

const event = (extra: Partial<AdminEvent> = {}) =>
  ({
    id: "e1",
    meetingsEnabled: false,
    maxOpenMeetingRequests: 5,
    version: 2,
    ...extra,
  }) as AdminEvent;

const point = (id: string, name: string, description = ""): MeetingPoint => ({
  id,
  eventId: "e1",
  name,
  description,
  sortIndex: 0,
  version: 7,
});

const setup = (
  ev: AdminEvent,
  points: MeetingPoint[] = [],
  handler: (call: FakeCall) => Response = () => Response.json(point("p9", "x"))
) => {
  const { api, calls } = fakeApi(handler);
  const onChanged = vi.fn();
  const onPointsChanged = vi.fn();
  render(
    <NoticeProvider>
      <EventMeetingsForm
        event={ev}
        points={points}
        calls={adminEventCalls(api)}
        onChanged={onChanged}
        onPointsChanged={onPointsChanged}
      />
    </NoticeProvider>
  );
  return { calls, onChanged, onPointsChanged };
};

describe("the meetings form", { tags: ["012-US1"] }, () => {
  it("hides the points and the cap while meetings are off", () => {
    setup(event());

    expect(screen.queryByText("Suggested meeting points")).toBeNull();
    expect(screen.queryByLabelText(/^Maximum open requests/)).toBeNull();
  });

  it("switches meetings off without sending the cap", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup(event({ meetingsEnabled: true }));

    await user.click(screen.getByLabelText("Enable meetings"));
    await user.click(screen.getByRole("button", { name: "Save meetings" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0].path).toBe("/api/v1/admin/events/e1/meetings");
    expect(calls[0].body).toEqual({
      meetingsEnabled: false,
      expectedVersion: 2,
    });
    expect(await screen.findByText("Saved!")).toBeTruthy();
  });

  it("saves the cap when meetings are on", async () => {
    const user = userEvent.setup();
    const { calls } = setup(event());

    await user.click(screen.getByLabelText("Enable meetings"));
    const cap = screen.getByLabelText(/^Maximum open requests/);
    await user.clear(cap);
    await user.type(cap, "3");
    await user.click(screen.getByRole("button", { name: "Save meetings" }));

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toEqual({
      meetingsEnabled: true,
      maxOpenMeetingRequests: 3,
      expectedVersion: 2,
    });
  });

  it("shows the server's reason for a refused cap", async () => {
    const user = userEvent.setup();
    setup(event({ meetingsEnabled: true }), [], () =>
      Response.json(
        {
          type: "about:blank",
          title: "x",
          status: 400,
          code: "meeting.capInvalid",
          detail: "Maximum open requests must be at least 1",
        },
        { status: 400, headers: { "content-type": "application/problem+json" } }
      )
    );

    await user.click(screen.getByRole("button", { name: "Save meetings" }));

    expect(
      await screen.findByText("Maximum open requests must be at least 1")
    ).toBeTruthy();
  });

  it("adds a meeting point and reloads the points", async () => {
    const user = userEvent.setup();
    const { calls, onPointsChanged } = setup(event({ meetingsEnabled: true }));

    await user.click(
      screen.getByRole("button", { name: "+ Add meeting point" })
    );
    await user.type(screen.getByLabelText(/^Name/), "Coffee bar");
    await user.type(screen.getByLabelText("Description"), "By reception");
    await user.keyboard("{Enter}");

    await waitFor(() => expect(onPointsChanged).toHaveBeenCalled());
    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe("/api/v1/admin/events/e1/meeting-points");
    expect(calls[0].body).toEqual({
      name: "Coffee bar",
      description: "By reception",
    });
    expect(
      screen.queryByRole("button", { name: "Add meeting point" })
    ).toBeNull();
  });

  it("edits a point with its version, and Enter does not save the settings", async () => {
    const user = userEvent.setup();
    const { calls, onPointsChanged } = setup(event({ meetingsEnabled: true }), [
      point("p1", "Lobby", "Ground floor"),
    ]);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const name = screen.getByLabelText("Name of Lobby");
    await user.clear(name);
    await user.type(name, "Terrace{Enter}");

    await waitFor(() => expect(onPointsChanged).toHaveBeenCalled());
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe("PUT");
    expect(calls[0].path).toBe("/api/v1/admin/events/e1/meeting-points/p1");
    expect(calls[0].body).toEqual({
      name: "Terrace",
      description: "Ground floor",
      expectedVersion: 7,
    });
    expect(screen.getByText("Lobby")).toBeTruthy();
  });

  it("deletes a point only after confirming", async () => {
    const user = userEvent.setup();
    const { calls, onPointsChanged } = setup(
      event({ meetingsEnabled: true }),
      [point("p1", "Lobby")],
      () => new Response(null, { status: 204 })
    );

    await user.click(screen.getByRole("button", { name: "Delete Lobby" }));
    expect(calls).toHaveLength(0);
    await user.click(
      screen.getByRole("button", { name: "Confirm delete Lobby" })
    );

    await waitFor(() => expect(onPointsChanged).toHaveBeenCalled());
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].path).toBe("/api/v1/admin/events/e1/meeting-points/p1");
  });

  it("shows why a point could not be saved", async () => {
    const user = userEvent.setup();
    const { onPointsChanged } = setup(
      event({ meetingsEnabled: true }),
      [point("p1", "Lobby")],
      () => problem(404, "meetingPoint.notFound")
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(onPointsChanged).not.toHaveBeenCalled();
  });
});
