import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { meetingAvailabilityCalls } from "../../commands/meeting-availability";
import { NoticeProvider } from "../../ui/notices";
import { AvailabilityForm } from "./availability-form";

afterEach(cleanup);

const days = [
  {
    id: "d1",
    label: "Mon 1 Jun",
    slots: [
      { start: "2030-06-01T09:00:00.000Z", label: "09:00" },
      { start: "2030-06-01T10:00:00.000Z", label: "10:00" },
    ],
  },
];

function setup(
  declared: string[],
  handler: FakeHandler = () => new Response(null, { status: 204 })
) {
  const { api, calls } = fakeApi(handler);
  render(
    <NoticeProvider>
      <AvailabilityForm
        eventId="e1"
        eventName="Con"
        timezone="UTC"
        days={days}
        declared={declared}
        calls={meetingAvailabilityCalls(api)}
      />
    </NoticeProvider>
  );
  return calls;
}

const save = () => screen.getByRole("button", { name: "Save availability" });

describe("declaring availability for 1-on-1s", { tags: ["012-US2"] }, () => {
  it("starts closed, and opening it marks every slot available", async () => {
    const calls = setup([]);
    expect(screen.queryByRole("checkbox", { name: "09:00" })).toBeNull();

    await userEvent.click(screen.getByLabelText(/open to 1-on-1s/));
    await userEvent.click(screen.getByRole("checkbox", { name: "10:00" }));
    await userEvent.click(save());

    expect(await screen.findByText("Saved!")).toBeTruthy();
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/meeting-availability",
      body: { eventId: "e1", slotStarts: ["2030-06-01T09:00:00.000Z"] },
    });
  });

  it("saves nothing when switched off, which clears the declaration", async () => {
    const calls = setup(["2030-06-01T09:00:00.000Z"]);

    await userEvent.click(screen.getByLabelText(/open to 1-on-1s/));
    await userEvent.click(save());

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toEqual({ eventId: "e1", slotStarts: [] });
  });

  it("selects and clears a whole day, and will not save an empty open set", async () => {
    setup(["2030-06-01T09:00:00.000Z"]);

    await userEvent.click(
      screen.getByRole("button", { name: "Clear all slots on Mon 1 Jun" })
    );

    expect(
      screen.getByText("Clearing every slot is the same as switching this off.")
    ).toBeTruthy();
    expect((save() as HTMLButtonElement).disabled).toBe(true);

    await userEvent.click(
      screen.getByRole("button", { name: "Select all slots on Mon 1 Jun" })
    );
    expect((save() as HTMLButtonElement).disabled).toBe(false);
  });

  it("says why a refused save was refused", async () => {
    setup(["2030-06-01T09:00:00.000Z"], () =>
      problem(400, "meeting.slotsUnavailable")
    );

    await userEvent.click(save());

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /no longer offered/
    );
  });
});
