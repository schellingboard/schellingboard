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
import { EventConfigTab } from "./event-config";
import { AdminEventLayout } from "./event-layout";

afterEach(cleanup);

const event = (extra: Partial<AdminEvent> = {}) =>
  ({
    id: "e1",
    slug: "con",
    name: "Con",
    description: "About",
    website: "",
    timezone: "Europe/Berlin",
    maxSessionDuration: 60,
    breakMinutes: 10,
    slotIncrementMinutes: 30,
    rsvpCapacityHardLimit: false,
    icon: null,
    proposalPhaseStart: "2030-05-01T08:00:00.000Z",
    proposalPhaseEnd: null,
    votingPhaseStart: null,
    votingPhaseEnd: null,
    schedulingPhaseStart: null,
    schedulingPhaseEnd: null,
    version: 3,
    ...extra,
  }) as AdminEvent;

const versionConflict = () =>
  Response.json(
    {
      type: "about:blank",
      title: "conflict",
      status: 409,
      code: "event.versionConflict",
    },
    { status: 409, headers: { "content-type": "application/problem+json" } }
  );

const setup = (
  handler: (call: FakeCall) => Response = () => Response.json(event()),
  ev = event()
) => {
  const { api, calls } = fakeApi(handler);
  const onChanged = vi.fn();
  const onDeleted = vi.fn();
  render(
    <NoticeProvider>
      <EventConfigTab
        event={ev}
        calls={adminEventCalls(api)}
        onChanged={onChanged}
        onDeleted={onDeleted}
      />
    </NoticeProvider>
  );
  return { calls, onChanged, onDeleted };
};

describe("the admin event layout", { tags: ["015-US2"] }, () => {
  it("shows the name, a back link and the section tabs with the current one marked", () => {
    render(
      <AdminEventLayout
        status="ready"
        event={event()}
        currentPath="/admin/events/e1/guests"
      >
        <p>body</p>
      </AdminEventLayout>
    );

    expect(screen.getByRole("heading", { name: "Con" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /Events/ }).getAttribute("href")
    ).toBe("/admin/events");
    const tabs = within(
      screen.getByRole("navigation", { name: "Event sections" })
    ).getAllByRole("link");
    expect([...tabs].map((a) => a.textContent)).toEqual([
      "Config",
      "Guests",
      "Locations",
      "Proposals",
      "Sessions",
    ]);
    expect(tabs[1].getAttribute("href")).toBe("/admin/events/e1/guests");
    expect(
      [...tabs].filter((a) => a.getAttribute("aria-current") === "page")
    ).toEqual([tabs[1]]);
    expect(screen.getByText("body")).toBeTruthy();
  });

  it("marks Config only on the event's own address", () => {
    render(
      <AdminEventLayout
        status="ready"
        event={event()}
        currentPath="/admin/events/e1"
      >
        <p>body</p>
      </AdminEventLayout>
    );

    expect(
      screen.getByRole("link", { name: "Config" }).getAttribute("aria-current")
    ).toBe("page");
  });

  it("says when the event is missing", () => {
    render(
      <AdminEventLayout status="error" currentPath="/admin/events/x">
        <p>body</p>
      </AdminEventLayout>
    );

    expect(screen.getByRole("alert").textContent).toContain("Could not load");
    expect(screen.queryByText("body")).toBeNull();
  });
});

describe("the event details form", { tags: ["015-US2"] }, () => {
  it("saves the edited fields with the version they were made from", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup();

    await user.clear(screen.getByLabelText(/^Name/));
    await user.type(screen.getByLabelText(/^Name/), "Con 2");
    await user.clear(screen.getByLabelText(/^Break before each session/));
    await user.type(screen.getByLabelText(/^Break before each session/), "5");
    await user.selectOptions(
      screen.getByLabelText("Schedule increment (min)"),
      "15"
    );
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0].method).toBe("PUT");
    expect(calls[0].path).toBe("/api/v1/admin/events/e1");
    expect(calls[0].body).toEqual({
      name: "Con 2",
      description: "About",
      website: "",
      timezone: "Europe/Berlin",
      maxSessionDuration: 60,
      breakMinutes: 5,
      slotIncrementMinutes: 15,
      rsvpCapacityHardLimit: false,
      icon: null,
      expectedVersion: 3,
    });
    expect(await screen.findByText("Saved!")).toBeTruthy();
  });

  it("picks and clears the icon", async () => {
    const user = userEvent.setup();
    const { calls } = setup();

    await user.click(screen.getByRole("radio", { name: "Rocket Launch" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toMatchObject({ icon: "RocketLaunchIcon" });

    await user.click(screen.getByRole("radio", { name: "No icon" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(calls).toHaveLength(2));
    expect(calls[1].body).toMatchObject({ icon: null });
  });

  it("shows the server's reason next to the name", async () => {
    const user = userEvent.setup();
    const message = 'An event with the URL "Con" already exists';
    const { onChanged } = setup(() =>
      Response.json(
        {
          type: "about:blank",
          title: "conflict",
          status: 409,
          code: "event.slugTaken",
          errors: [{ path: "name", message }],
        },
        { status: 409, headers: { "content-type": "application/problem+json" } }
      )
    );

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findAllByText(message)).not.toHaveLength(0);
    expect(onChanged).not.toHaveBeenCalled();
    expect(screen.queryByText("Saved!")).toBeNull();
  });

  it("tells that someone else changed the event, and reloads it", async () => {
    const user = userEvent.setup();
    const { onChanged } = setup(versionConflict);

    await user.clear(screen.getByLabelText(/^Name/));
    await user.type(screen.getByLabelText(/^Name/), "Con 2");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText(/Someone changed this event while you edited it/)
    ).toBeTruthy();
    expect(onChanged).toHaveBeenCalled();
    expect(screen.getByLabelText<HTMLInputElement>(/^Name/).value).toBe(
      "Con 2"
    );
  });
});

describe("the phases form", { tags: ["015-US2"] }, () => {
  it("shows the phase times in the event's zone and saves them as instants", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup();

    const start = screen.getAllByLabelText("Start")[0] as HTMLInputElement;
    expect(start.value).toBe("2030-05-01T10:00");
    await user.clear(screen.getAllByLabelText("End")[1]);
    await user.type(screen.getAllByLabelText("End")[1], "2030-05-02T12:00");
    await user.click(screen.getByRole("button", { name: "Save phases" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0].path).toBe("/api/v1/admin/events/e1/phases");
    expect(calls[0].body).toEqual({
      proposalPhaseStart: "2030-05-01T08:00:00.000Z",
      proposalPhaseEnd: null,
      votingPhaseStart: null,
      votingPhaseEnd: "2030-05-02T10:00:00.000Z",
      schedulingPhaseStart: null,
      schedulingPhaseEnd: null,
      expectedVersion: 3,
    });
    expect(await screen.findByText("Saved!")).toBeTruthy();
  });

  it("sends null for a field that was cleared", async () => {
    const user = userEvent.setup();
    const { calls } = setup();

    await user.clear(screen.getAllByLabelText("Start")[0]);
    await user.click(screen.getByRole("button", { name: "Save phases" }));

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toMatchObject({ proposalPhaseStart: null });
  });

  it("shows a refusal and does not reload", async () => {
    const user = userEvent.setup();
    const { onChanged } = setup(() => problem(400, "invalid"));

    await user.click(screen.getByRole("button", { name: "Save phases" }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(onChanged).not.toHaveBeenCalled();
  });
});

describe("the danger zone", { tags: ["015-US2"] }, () => {
  it("deletes only once the event's name is typed", async () => {
    const user = userEvent.setup();
    const { calls, onDeleted } = setup(
      () => new Response(null, { status: 204 })
    );

    await user.click(screen.getByRole("button", { name: "Delete event" }));
    const confirm = screen.getByRole("button", { name: "Confirm delete" });
    expect((confirm as HTMLButtonElement).disabled).toBe(true);
    await user.type(
      screen.getByLabelText("Type the event name to confirm"),
      "Con"
    );
    await user.click(confirm);

    await waitFor(() => expect(onDeleted).toHaveBeenCalled());
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].path).toBe("/api/v1/admin/events/e1");
  });

  it("can be cancelled and shows why a delete was refused", async () => {
    const user = userEvent.setup();
    const { onDeleted } = setup(() => problem(404, "event.notFound"));

    await user.click(screen.getByRole("button", { name: "Delete event" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByLabelText("Type the event name to confirm")
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "Delete event" }));
    await user.type(
      screen.getByLabelText("Type the event name to confirm"),
      "Con"
    );
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(onDeleted).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Delete event" }));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
