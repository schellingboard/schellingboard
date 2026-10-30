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
import type { Unavailability } from "../../queries/admin-unavailability";
import { NoticeProvider } from "../../ui/notices";
import { LocationAvailabilityManager } from "./location-availability";

afterEach(cleanup);

const rooms = [
  { id: "l1", name: "Hall" },
  { id: "l2", name: "Roof" },
];
const days = [
  {
    id: "d1",
    start: "2030-05-01T07:00:00.000Z",
    end: "2030-05-01T17:00:00.000Z",
  },
];
const period: Unavailability = {
  id: "u1",
  locationId: "l2",
  start: "2030-05-01T07:00:00.000Z",
  end: "2030-05-01T09:00:00.000Z",
};

const setup = (
  opts: {
    rooms?: typeof rooms;
    periods?: Unavailability[];
    handler?: (call: FakeCall) => Response;
  } = {}
) => {
  const { api, calls } = fakeApi(
    opts.handler ?? (() => new Response(null, { status: 204 }))
  );
  const onChanged = vi.fn();
  render(
    <NoticeProvider>
      <LocationAvailabilityManager
        eventId="e1"
        rooms={opts.rooms ?? rooms}
        days={days}
        periods={opts.periods ?? []}
        timezone="Europe/Berlin"
        calls={adminEventCalls(api)}
        onChanged={onChanged}
      />
    </NoticeProvider>
  );
  return {
    calls,
    onChanged,
    region: screen.getByRole("region", { name: "Location unavailability" }),
  };
};

describe("the location availability manager", { tags: ["017-US4"] }, () => {
  it("lists a period with its location and the event's local times", () => {
    const { region } = setup({ periods: [period] });

    const row = within(region).getByRole("listitem");
    expect(row.textContent).toContain("Roof");
    expect(row.textContent).toContain("Wed 1 May 09:00 – Wed 1 May 11:00");
  });

  it("fills in a whole day and adds the period for the checked locations", async () => {
    const { region, calls, onChanged } = setup();

    await userEvent.click(
      within(region).getByRole("checkbox", { name: "Roof" })
    );
    await userEvent.click(
      within(
        within(region).getByRole("group", { name: "Fill in a whole day" })
      ).getAllByRole("button")[0]
    );
    await userEvent.click(
      within(region).getByRole("button", { name: "Add unavailable time" })
    );

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/admin/events/e1/location-unavailability",
      body: {
        locationIds: ["l2"],
        start: "2030-05-01T07:00:00.000Z",
        end: "2030-05-01T17:00:00.000Z",
      },
    });
  });

  it("cannot add before a location is checked", () => {
    const { region } = setup();

    expect(
      within(region)
        .getByRole("button", { name: "Add unavailable time" })
        .hasAttribute("disabled")
    ).toBe(true);
  });

  it("says which time is missing instead of sending", async () => {
    const { region, calls } = setup();

    await userEvent.click(
      within(region).getByRole("checkbox", { name: "Roof" })
    );
    await userEvent.click(
      within(region).getByRole("button", { name: "Add unavailable time" })
    );

    expect(
      await within(region).findAllByText("From is required")
    ).not.toHaveLength(0);
    expect(calls).toHaveLength(0);
  });

  it("shows the server's refusal", async () => {
    const { region } = setup({
      handler: () => problem(422, "unavailability.invalid"),
    });

    await userEvent.click(
      within(region).getByRole("checkbox", { name: "Roof" })
    );
    await userEvent.click(
      within(region).getAllByRole("button", { name: /Wed 1 May|Whole/ })[0]
    );
    await userEvent.click(
      within(region).getByRole("button", { name: "Add unavailable time" })
    );

    expect(await within(region).findByRole("alert")).toBeTruthy();
  });

  it("deletes a period", async () => {
    const { region, calls, onChanged } = setup({ periods: [period] });

    await userEvent.click(
      within(region).getByRole("button", {
        name: /^Delete unavailable time Roof/,
      })
    );

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "DELETE",
      path: "/api/v1/admin/location-unavailability/u1",
    });
  });

  it("asks to assign a location first when the event has none", () => {
    const { region } = setup({ rooms: [] });

    expect(
      within(region).getByText("Assign a location to the event first.")
    ).toBeTruthy();
  });
});
