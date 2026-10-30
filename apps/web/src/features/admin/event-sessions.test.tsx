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
import type { AdminSession } from "../../queries/admin-sessions";
import { NoticeProvider } from "../../ui/notices";
import type { DayOption } from "./admin-session-model";
import { EventSessionsManager } from "./event-sessions";
import type { ParamUpdates } from "./list-paging";

afterEach(cleanup);

const day: DayOption = {
  key: "d1",
  label: "Wednesday, May 1",
  start: "2030-05-01T07:00:00.000Z",
  end: "2030-05-01T17:00:00.000Z",
};

const session = (
  id: string,
  title: string,
  extra: Partial<AdminSession> = {}
): AdminSession => ({
  id,
  title,
  description: "",
  startTime: null,
  endTime: null,
  capacity: 10,
  adminManaged: false,
  blocker: false,
  closed: false,
  hosts: [],
  locations: [],
  numRsvps: 0,
  version: 4,
  ...extra,
});

const alice = { id: "g1", name: "Alice" };
const hall = { id: "l1", name: "Hall", capacity: 30 };

const setup = (
  sessions: AdminSession[],
  {
    query = "",
    handler = () => Response.json(session("s1", "Saved")),
    loadRsvps = vi.fn().mockResolvedValue([] as string[] | null),
  }: {
    query?: string;
    handler?: (call: FakeCall) => Response;
    loadRsvps?: (id: string) => Promise<string[] | null>;
  } = {}
) => {
  const { api, calls } = fakeApi(handler);
  const onChanged = vi.fn();
  const onParams = vi.fn<(u: ParamUpdates, o: { push: boolean }) => void>();
  render(
    <NoticeProvider>
      <EventSessionsManager
        eventId="e1"
        sessions={sessions}
        guests={[alice]}
        locations={[hall]}
        guestNames={new Map([["g1", "Alice"]])}
        loadRsvps={loadRsvps}
        timezone="Europe/Berlin"
        days={[day]}
        breakMinutes={10}
        params={new URLSearchParams(query)}
        onParams={onParams}
        calls={adminEventCalls(api)}
        onChanged={onChanged}
      />
    </NoticeProvider>
  );
  return {
    calls,
    onChanged,
    onParams,
    region: screen.getByRole("region", { name: "Sessions" }),
  };
};

describe("the event sessions manager", { tags: ["018-US2"] }, () => {
  it("lists sessions by title with time, place, hosts, RSVPs and flags", () => {
    const { region } = setup([
      session("s2", "beta"),
      session("s1", "Alpha", {
        startTime: "2030-05-01T08:00:00.000Z",
        endTime: "2030-05-01T09:00:00.000Z",
        hosts: [alice],
        locations: [{ id: "l1", name: "Hall" }],
        numRsvps: 3,
        blocker: true,
        adminManaged: true,
      }),
    ]);

    const items = within(region).getAllByRole("listitem");
    expect(items[0].textContent).toContain(
      "2030-05-01T10:00 – 2030-05-01T11:00 (Europe/Berlin) · Hall"
    );
    expect(items[0].textContent).toContain(
      "Hosts: Alice · 3 RSVPs · blocker, admin-managed"
    );
    expect(items[1].textContent).toContain("Not scheduled · —");
  });

  it("searches the title and the host names", () => {
    setup([session("s1", "Talk", { hosts: [alice] }), session("s2", "Panel")], {
      query: "q=ALI",
    });
    const region = screen.getByRole("region", { name: "Sessions" });

    expect(within(region).getByText("Talk")).toBeTruthy();
    expect(within(region).queryByText("Panel")).toBeNull();
  });

  it("creates an admin-managed blocker on a day", async () => {
    const { region, calls, onChanged } = setup([]);

    await userEvent.click(
      within(region).getByRole("button", { name: "Add session" })
    );
    await userEvent.type(within(region).getByLabelText(/^Title/), "Lunch");
    await userEvent.selectOptions(within(region).getByLabelText("Day"), "d1");
    await userEvent.type(
      within(region).getByLabelText(/^Start \(Europe\/Berlin\)/),
      "12:00"
    );
    await userEvent.type(
      within(region).getByLabelText(/^End \(Europe\/Berlin\)/),
      "13:00"
    );
    await userEvent.click(within(region).getByLabelText("Blocker"));
    await userEvent.click(within(region).getByLabelText("Hall"));
    await userEvent.click(
      within(region).getByRole("button", { name: "Create" })
    );

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/admin/sessions",
      body: {
        eventId: "e1",
        title: "Lunch",
        startTime: "2030-05-01T10:00:00.000Z",
        endTime: "2030-05-01T11:00:00.000Z",
        capacity: 30,
        adminManaged: true,
        blocker: true,
        locationIds: ["l1"],
      },
    });
  });

  it("offers to start a new session after the break, not a blocker", async () => {
    const { region } = setup([]);

    await userEvent.click(
      within(region).getByRole("button", { name: "Add session" })
    );
    await userEvent.selectOptions(within(region).getByLabelText("Day"), "d1");
    await userEvent.type(
      within(region).getByLabelText(/^Start \(Europe\/Berlin\)/),
      "12:00"
    );
    expect(within(region).getByText("Starts at 12:10")).toBeTruthy();

    await userEvent.click(within(region).getByLabelText("Blocker"));
    expect(within(region).queryByText(/Break before/)).toBeNull();
  });

  it("asks for the times of a scheduled day before sending", async () => {
    const { region, calls } = setup([]);

    await userEvent.click(
      within(region).getByRole("button", { name: "Add session" })
    );
    await userEvent.selectOptions(within(region).getByLabelText("Day"), "d1");
    await userEvent.click(
      within(region).getByRole("button", { name: "Create" })
    );

    expect(
      (await within(region).findAllByText("Start is required")).length
    ).toBeGreaterThan(0);
    expect(calls).toHaveLength(0);
  });

  it("saves an edit against the version shown", async () => {
    const { region, calls } = setup([session("s1", "Talk")]);

    await userEvent.click(
      within(region).getByRole("button", { name: "Edit Talk" })
    );
    const title = within(region).getByLabelText(/^Title/);
    await userEvent.clear(title);
    await userEvent.type(title, "Better");
    await userEvent.click(within(region).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/admin/sessions/s1",
      body: { title: "Better", capacity: 10, expectedVersion: 4 },
    });
  });

  it("keeps the times of a scheduled session when only its title changes", async () => {
    const { region, calls } = setup([
      session("s1", "Talk", {
        startTime: "2030-05-01T08:00:00.000Z",
        endTime: "2030-05-01T09:00:00.000Z",
      }),
    ]);

    await userEvent.click(
      within(region).getByRole("button", { name: "Edit Talk" })
    );
    const title = within(region).getByLabelText(/^Title/);
    await userEvent.clear(title);
    await userEvent.type(title, "Better");
    await userEvent.click(within(region).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toMatchObject({
      title: "Better",
      startTime: "2030-05-01T08:00:00.000Z",
      endTime: "2030-05-01T09:00:00.000Z",
    });
  });

  it("says when someone else changed the session", async () => {
    const { region, onChanged } = setup([session("s1", "Talk")], {
      handler: () => problem(409, "session.versionConflict"),
    });

    await userEvent.click(
      within(region).getByRole("button", { name: "Edit Talk" })
    );
    await userEvent.click(within(region).getByRole("button", { name: "Save" }));

    expect(
      await within(region).findByText(/Someone else changed this/)
    ).toBeTruthy();
    expect(onChanged).toHaveBeenCalled();
  });

  it("duplicates a session as a new one", async () => {
    const { region, calls } = setup([session("s1", "Talk")]);

    await userEvent.click(
      within(region).getByRole("button", { name: "Duplicate Talk" })
    );
    expect(within(region).getByText("Copy of Talk")).toBeTruthy();
    await userEvent.click(
      within(region).getByRole("button", { name: "Create" })
    );

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/admin/sessions",
      body: { eventId: "e1", title: "Talk" },
    });
  });

  it("deletes only after the title is typed", async () => {
    const { region, calls } = setup([session("s1", "Talk", { numRsvps: 1 })], {
      handler: () => new Response(null, { status: 204 }),
    });

    await userEvent.click(
      within(region).getByRole("button", { name: "Delete Talk" })
    );
    expect(within(region).getByText(/and its 1 RSVP\./)).toBeTruthy();
    const confirm = within(region).getByRole("button", {
      name: "Confirm delete",
    });
    expect(confirm.hasAttribute("disabled")).toBe(true);
    await userEvent.type(
      within(region).getByLabelText("Type the session title to confirm"),
      "Talk"
    );
    await userEvent.click(confirm);

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0]).toMatchObject({
      method: "DELETE",
      path: "/api/v1/admin/sessions/s1",
    });
  });

  it(
    "lists who RSVPed when opened and removes one after confirming",
    {
      tags: ["018-US3"],
    },
    async () => {
      const loadRsvps = vi
        .fn<(id: string) => Promise<string[] | null>>()
        .mockResolvedValueOnce(["g1"])
        .mockResolvedValue([]);
      const { region, calls, onChanged } = setup(
        [session("s1", "Talk", { numRsvps: 1 })],
        { loadRsvps, handler: () => new Response(null, { status: 204 }) }
      );

      await userEvent.click(within(region).getByText("RSVPs (1)"));
      await userEvent.click(
        await within(region).findByRole("button", { name: "Remove RSVP Alice" })
      );
      await userEvent.click(
        within(region).getByRole("button", { name: "Confirm" })
      );

      await waitFor(() => expect(onChanged).toHaveBeenCalled());
      expect(calls[0]).toMatchObject({
        method: "DELETE",
        path: "/api/v1/admin/sessions/s1/rsvps/g1",
      });
      expect(await within(region).findByText("No RSVPs.")).toBeTruthy();
    }
  );
});
