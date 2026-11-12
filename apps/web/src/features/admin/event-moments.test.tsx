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
import type {
  AdminEventDay,
  AdminEventMoment,
} from "../../queries/admin-event";
import { NoticeProvider } from "../../ui/notices";
import { EventMomentsManager } from "./event-moments";

afterEach(cleanup);

const day = (id: string, date: string): AdminEventDay => ({
  id,
  eventId: "e1",
  start: `${date}T07:00:00.000Z`,
  end: `${date}T17:00:00.000Z`,
  startBookings: `${date}T08:00:00.000Z`,
  endBookings: `${date}T16:00:00.000Z`,
  version: 1,
});
const DAYS = [day("d1", "2030-05-01"), day("d2", "2030-05-02")];

const lunch = (id: string, dayId: string, date: string): AdminEventMoment => ({
  id,
  dayId,
  title: "Lunch",
  description: "Buffet in the foyer",
  start: `${date}T10:30:00.000Z`,
  end: `${date}T12:00:00.000Z`,
});

const setup = (
  moments: AdminEventMoment[],
  handler: (call: FakeCall) => Response = () => Response.json([]),
  days = DAYS
) => {
  const { api, calls } = fakeApi(handler);
  const onChanged = vi.fn();
  render(
    <NoticeProvider>
      <EventMomentsManager
        eventId="e1"
        timezone="Europe/Berlin"
        days={days}
        moments={moments}
        calls={adminEventCalls(api)}
        onChanged={onChanged}
      />
    </NoticeProvider>
  );
  return { calls, onChanged };
};

const region = () => screen.getByRole("region", { name: "Shared moments" });

describe("the shared moments manager", { tags: ["015-US9"] }, () => {
  it("lists the moments under their day, in the event's zone", () => {
    setup([lunch("m1", "d1", "2030-05-01")]);

    const list = within(region());
    expect(list.getByText("2030-05-01")).toBeTruthy();
    expect(list.getByText(/12:30–14:00/)).toBeTruthy();
    expect(list.getByText(/Buffet in the foyer/)).toBeTruthy();
    expect(list.queryByText("2030-05-02")).toBeNull();
  });

  it("adds one moment to every day, which are all ticked at first", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup([]);

    await user.click(screen.getByRole("button", { name: "Add shared moment" }));
    expect(screen.getByLabelText<HTMLInputElement>("2030-05-01").checked).toBe(
      true
    );
    await user.type(screen.getByLabelText(/^Title/), "Lunch");
    await user.type(screen.getByLabelText(/^Details/), "Buffet");
    await user.type(screen.getByLabelText(/^Start/), "12:30");
    await user.type(screen.getByLabelText(/^End/), "14:00");
    await user.click(screen.getByRole("button", { name: "Add moment" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0].path).toBe("/api/v1/admin/events/e1/moments");
    expect(calls[0].body).toEqual({
      title: "Lunch",
      description: "Buffet",
      startTime: "12:30",
      endTime: "14:00",
      dayIds: ["d1", "d2"],
    });
  });

  it("leaves out a day that is unticked", async () => {
    const user = userEvent.setup();
    const { calls } = setup([]);

    await user.click(screen.getByRole("button", { name: "Add shared moment" }));
    await user.click(screen.getByLabelText("2030-05-02"));
    await user.type(screen.getByLabelText(/^Title/), "Keynote");
    await user.type(screen.getByLabelText(/^Start/), "09:00");
    await user.type(screen.getByLabelText(/^End/), "10:00");
    await user.click(screen.getByRole("button", { name: "Add moment" }));

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toMatchObject({ dayIds: ["d1"] });
  });

  it("asks for the missing times and for a day without calling the server", async () => {
    const user = userEvent.setup();
    const { calls } = setup([]);

    await user.click(screen.getByRole("button", { name: "Add shared moment" }));
    await user.click(screen.getByLabelText("2030-05-01"));
    await user.click(screen.getByLabelText("2030-05-02"));
    await user.click(screen.getByRole("button", { name: "Add moment" }));

    expect(await screen.findAllByText("Start is required")).not.toHaveLength(0);
    expect(screen.getAllByText("End is required")).not.toHaveLength(0);
    expect(screen.getAllByText("Pick at least one day")).not.toHaveLength(0);
    expect(calls).toHaveLength(0);
  });

  it("shows the server's refusal next to the field", async () => {
    const user = userEvent.setup();
    setup([], () =>
      Response.json(
        {
          type: "about:blank",
          title: "c",
          status: 400,
          code: "moment.outsideDay",
          errors: [{ path: "startTime", message: "Outside the day" }],
        },
        { status: 400, headers: { "content-type": "application/problem+json" } }
      )
    );

    await user.click(screen.getByRole("button", { name: "Add shared moment" }));
    await user.type(screen.getByLabelText(/^Title/), "Lunch");
    await user.type(screen.getByLabelText(/^Start/), "05:00");
    await user.type(screen.getByLabelText(/^End/), "06:00");
    await user.click(screen.getByRole("button", { name: "Add moment" }));

    expect(
      (await screen.findAllByText("Outside the day")).length
    ).toBeGreaterThan(0);
  });

  it("says a day is needed first when there is none", () => {
    setup([], undefined, []);

    expect(within(region()).getByText(/Add a day first/)).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Add shared moment" })
    ).toBeNull();
  });

  it("edits one moment", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup([lunch("m1", "d1", "2030-05-01")]);

    await user.click(
      screen.getByRole("button", { name: "Edit Lunch on 2030-05-01" })
    );
    expect(screen.getByLabelText<HTMLInputElement>(/^Start/).value).toBe(
      "12:30"
    );
    const title = screen.getByLabelText(/^Title/);
    await user.clear(title);
    await user.type(title, "Brunch");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0].method).toBe("PUT");
    expect(calls[0].path).toBe("/api/v1/admin/moments/m1");
    expect(calls[0].body).toEqual({
      title: "Brunch",
      description: "Buffet in the foyer",
      startTime: "12:30",
      endTime: "14:00",
    });
  });

  it("deletes one moment after a confirmation", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup(
      [lunch("m1", "d1", "2030-05-01")],
      () => new Response(null, { status: 204 })
    );

    await user.click(
      screen.getByRole("button", { name: "Delete Lunch on 2030-05-01" })
    );
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].path).toBe("/api/v1/admin/moments/m1");
  });

  it("shows why a delete was refused", async () => {
    const user = userEvent.setup();
    const { onChanged } = setup([lunch("m1", "d1", "2030-05-01")], () =>
      problem(404, "moment.notFound")
    );

    await user.click(
      screen.getByRole("button", { name: "Delete Lunch on 2030-05-01" })
    );
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(onChanged).not.toHaveBeenCalled();
  });
});
