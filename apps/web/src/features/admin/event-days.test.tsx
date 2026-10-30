import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { adminEventCalls } from "../../commands/admin-events";
import { fakeApi, problem, type FakeCall } from "../../commands/fake-api";
import type { AdminEventDay } from "../../queries/admin-event";
import type { ScheduledSession } from "../../queries/admin-sessions";
import { NoticeProvider } from "../../ui/notices";
import { EventDaysManager } from "./event-days";

afterEach(cleanup);

const day = (id: string, extra: Partial<AdminEventDay> = {}) => ({
  id,
  eventId: "e1",
  start: "2030-05-01T07:00:00.000Z",
  end: "2030-05-01T17:00:00.000Z",
  startBookings: "2030-05-01T08:00:00.000Z",
  endBookings: "2030-05-01T16:00:00.000Z",
  version: 4,
  ...extra,
});

const setup = (
  days: AdminEventDay[],
  handler: (call: FakeCall) => Response = () => Response.json(day("d1")),
  sessions: ScheduledSession[] = []
) => {
  const { api, calls } = fakeApi(handler);
  const onChanged = vi.fn();
  render(
    <NoticeProvider>
      <EventDaysManager
        eventId="e1"
        timezone="Europe/Berlin"
        days={days}
        sessions={sessions}
        calls={adminEventCalls(api)}
        onChanged={onChanged}
      />
    </NoticeProvider>
  );
  return { calls, onChanged };
};

const LABEL = "2030-05-01T09:00 – 2030-05-01T19:00 (Europe/Berlin)";

describe("the days manager", { tags: ["015-US4"] }, () => {
  it("lists each day in the event's zone", () => {
    setup([day("d1")]);

    expect(
      within(screen.getByRole("region", { name: "Days" })).getByText(LABEL)
    ).toBeTruthy();
  });

  it("adds a day, sending instants, and reloads", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup([]);

    await user.click(screen.getByRole("button", { name: "Add day" }));
    await user.type(screen.getByLabelText(/^Start/), "2030-06-01T09:00");
    await user.type(screen.getByLabelText(/^End/), "2030-06-01T19:00");
    await user.type(
      screen.getByLabelText(/^Bookings open/),
      "2030-06-01T10:00"
    );
    await user.type(
      screen.getByLabelText(/^Bookings close/),
      "2030-06-01T18:00"
    );
    await user.click(screen.getAllByRole("button", { name: "Add day" })[0]);

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0].path).toBe("/api/v1/admin/events/e1/days");
    expect(calls[0].body).toEqual({
      start: "2030-06-01T07:00:00.000Z",
      end: "2030-06-01T17:00:00.000Z",
      startBookings: "2030-06-01T08:00:00.000Z",
      endBookings: "2030-06-01T16:00:00.000Z",
    });
    expect(screen.queryByText("New day")).toBeNull();
  });

  it("asks for the missing fields without calling the server", async () => {
    const user = userEvent.setup();
    const { calls } = setup([]);

    await user.click(screen.getByRole("button", { name: "Add day" }));
    await user.click(screen.getAllByRole("button", { name: "Add day" })[0]);

    expect(await screen.findAllByText("Start is required")).not.toHaveLength(0);
    expect(calls).toHaveLength(0);
  });

  it("edits a day with the version it was opened at", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup([day("d1")]);

    await user.click(screen.getByRole("button", { name: `Edit day ${LABEL}` }));
    const end = screen.getByLabelText(/^End/);
    await user.clear(end);
    await user.type(end, "2030-05-01T20:00");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0].method).toBe("PUT");
    expect(calls[0].path).toBe("/api/v1/admin/days/d1");
    expect(calls[0].body).toEqual({
      start: "2030-05-01T07:00:00.000Z",
      end: "2030-05-01T18:00:00.000Z",
      startBookings: "2030-05-01T08:00:00.000Z",
      endBookings: "2030-05-01T16:00:00.000Z",
      expectedVersion: 4,
    });
  });

  it("keeps the edit open, tells why, and reloads when the day changed meanwhile", async () => {
    const user = userEvent.setup();
    const { onChanged } = setup([day("d1")], () =>
      Response.json(
        {
          type: "about:blank",
          title: "c",
          status: 409,
          code: "day.versionConflict",
        },
        { status: 409, headers: { "content-type": "application/problem+json" } }
      )
    );

    await user.click(screen.getByRole("button", { name: `Edit day ${LABEL}` }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(onChanged).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  it("names the scheduled sessions a deleted day takes with it", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup(
      [day("d1")],
      () => new Response(null, { status: 204 }),
      [
        {
          title: "Opening",
          startTime: "2030-05-01T08:00:00.000Z",
          endTime: "2030-05-01T09:00:00.000Z",
        },
        {
          title: "Next week",
          startTime: "2030-05-08T08:00:00.000Z",
          endTime: "2030-05-08T09:00:00.000Z",
        },
      ]
    );

    await user.click(
      screen.getByRole("button", { name: `Delete day ${LABEL}` })
    );

    expect(
      screen.getByText(
        "Delete this day? The following session scheduled within its time window will also be deleted:"
      )
    ).toBeTruthy();
    expect(screen.getByText("Opening")).toBeTruthy();
    expect(screen.queryByText("Next week")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Confirm delete" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].path).toBe("/api/v1/admin/days/d1");
  });

  it("says when no session is affected and can be cancelled", async () => {
    const user = userEvent.setup();
    setup([day("d1")]);

    await user.click(
      screen.getByRole("button", { name: `Delete day ${LABEL}` })
    );
    expect(
      screen.getByText(
        "Delete this day? No scheduled sessions fall within its time window."
      )
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.getByRole("button", { name: `Edit day ${LABEL}` })
    ).toBeTruthy();
  });

  it("shows why a delete was refused", async () => {
    const user = userEvent.setup();
    const { onChanged } = setup([day("d1")], () =>
      problem(404, "day.notFound")
    );

    await user.click(
      screen.getByRole("button", { name: `Delete day ${LABEL}` })
    );
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(onChanged).not.toHaveBeenCalled();
  });
});
