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
import type { AdminEvent } from "../../queries/admin-events";
import { NoticeProvider } from "../../ui/notices";
import { AdminEventsScreen } from "./events-screen";

afterEach(cleanup);

const event = (id: string, name: string, extra: Partial<AdminEvent> = {}) =>
  ({
    id,
    name,
    timezone: "Europe/Berlin",
    firstDayStart: "2030-05-01T08:00:00Z",
    lastDayStart: "2030-05-03T08:00:00Z",
    ...extra,
  }) as AdminEvent;

const setup = (
  events: AdminEvent[],
  handler: (call: FakeCall) => Response = () => problem(404, "x"),
  status: "loading" | "ready" | "error" = "ready"
) => {
  const { api, calls } = fakeApi(handler);
  const onCreated = vi.fn();
  render(
    <NoticeProvider>
      <AdminEventsScreen
        status={status}
        events={events}
        calls={adminEventCalls(api)}
        onCreated={onCreated}
      />
    </NoticeProvider>
  );
  return { calls, onCreated };
};

describe("the admin events screen", { tags: ["015-US2"] }, () => {
  it("lists each event with its dates and zone and a Manage link", () => {
    setup([
      event("e1", "Con"),
      event("e2", "Camp", { firstDayStart: null, lastDayStart: null }),
    ]);

    const [con, camp] = screen.getAllByRole("listitem");
    expect(con.textContent).toContain("Con");
    expect(con.textContent).toContain(
      "2030-05-01 - 2030-05-03 · Europe/Berlin"
    );
    expect(
      within(con).getByRole("link", { name: "Manage" }).getAttribute("href")
    ).toBe("/admin/events/e1");
    expect(camp.textContent).toContain("No days yet · Europe/Berlin");
  });

  it("says so when there are no events", () => {
    setup([]);

    expect(screen.getByText("No events yet.")).toBeTruthy();
  });

  it("creates an event with the legacy defaults and reloads the list", async () => {
    const user = userEvent.setup();
    const { calls, onCreated } = setup([], () =>
      Response.json({ id: "e9" }, { status: 201 })
    );

    await user.click(screen.getByRole("button", { name: "New event" }));
    await user.type(screen.getByLabelText(/^Name/), "Summit");
    await user.click(screen.getByRole("button", { name: "Create event" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe("/api/v1/admin/events");
    expect(calls[0].body).toEqual({
      name: "Summit",
      description: "",
      website: "",
      timezone: "UTC",
      maxSessionDuration: 60,
      breakMinutes: 10,
      slotIncrementMinutes: 30,
    });
    expect(screen.queryByRole("button", { name: "Create event" })).toBeNull();
    expect(screen.getByRole("button", { name: "New event" })).toBeTruthy();
  });

  it("shows the server's reason next to the name when the URL is taken", async () => {
    const user = userEvent.setup();
    const message = 'An event with the URL "Summit" already exists ("Summit")';
    const { onCreated } = setup([], () =>
      Response.json(
        {
          type: "about:blank",
          title: "conflict",
          status: 409,
          code: "event.slugTaken",
          detail: message,
          errors: [{ path: "name", message }],
        },
        { status: 409, headers: { "content-type": "application/problem+json" } }
      )
    );

    await user.click(screen.getByRole("button", { name: "New event" }));
    await user.type(screen.getByLabelText(/^Name/), "Summit");
    await user.click(screen.getByRole("button", { name: "Create event" }));

    expect(await screen.findAllByText(message)).not.toHaveLength(0);
    expect(screen.getByRole("button", { name: "Create event" })).toBeTruthy();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("asks for a name and a positive duration before sending anything", async () => {
    const user = userEvent.setup();
    const { calls } = setup([]);

    await user.click(screen.getByRole("button", { name: "New event" }));
    await user.click(screen.getByRole("button", { name: "Create event" }));
    expect(
      (await screen.findAllByText("Name is required")).length
    ).toBeGreaterThan(0);

    await user.type(screen.getByLabelText(/^Name/), "Summit");
    await user.clear(screen.getByLabelText(/^Max session duration/));
    await user.type(screen.getByLabelText(/^Max session duration/), "0");
    await user.click(screen.getByRole("button", { name: "Create event" }));

    expect(
      (
        await screen.findAllByText(
          "Max session duration must be a positive number"
        )
      ).length
    ).toBeGreaterThan(0);
    expect(calls).toHaveLength(0);
  });

  it("cancels the form without sending anything", async () => {
    const user = userEvent.setup();
    const { calls } = setup([]);

    await user.click(screen.getByRole("button", { name: "New event" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("button", { name: "New event" })).toBeTruthy();
    expect(calls).toHaveLength(0);
  });

  it("says why the list could not load", () => {
    setup([], undefined, "error");

    expect(screen.getByRole("alert").textContent).toContain("events");
  });
});
