import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { sessionFormCalls } from "../../commands/session-form";
import { iso, snapshot as fixture } from "../../replica/snapshot-fixture";
import { NoticeProvider } from "../../ui/notices";
import { SessionForm, type SessionPrefill } from "./session-form";

afterEach(cleanup);

const guest = (id: string, name: string) => ({
  ...fixture.guests[1],
  id,
  name,
  member: true,
});

const proposal: Snapshot["proposals"][number] = {
  id: "p",
  eventId: "e",
  title: "Rust intro",
  description: "Learn Rust",
  durationMinutes: 90,
  createdTime: iso(1),
  updatedTime: iso(1),
  hosts: [
    { id: "mia", name: "Mia" },
    { id: "bob", name: "Bob" },
  ],
  cohostWanted: false,
  cohostWantedNote: null,
  version: 1,
};

const mine: Snapshot["sessions"][number] = {
  ...fixture.sessions[0],
  id: "mine",
  title: "My talk",
  description: "About things",
  startTime: iso(14),
  endTime: new Date(Date.UTC(2026, 5, 15, 14, 50)).toISOString(),
  hostIds: ["mia"],
  version: 5,
};

const base: Snapshot = {
  ...fixture,
  guests: [guest("mia", "Mia"), guest("bob", "Bob")],
  sessions: [fixture.sessions[0], mine],
  proposals: [proposal],
  me: { ...fixture.me!, guestId: "mia" },
};

const OWN_SLOT = new Date(Date.UTC(2026, 5, 15, 13, 50)).toISOString();
const NOW = new Date(fixture.now);
const links = {
  schedule: "/conf",
  proposal: (id: string) => `/conf/proposals?viewProposal=${id}`,
  session: (id: string) => `/conf?viewSession=${id}`,
};
const saved = () => Response.json({ ...mine, id: "new" }, { status: 201 });

function setup({
  sessionId,
  prefill,
  patch = {},
  now = NOW,
  clashes = [],
  handler,
}: {
  sessionId?: string;
  prefill?: SessionPrefill;
  patch?: Partial<Snapshot>;
  now?: Date;
  clashes?: unknown[];
  handler?: FakeHandler;
} = {}) {
  const { api, calls } = fakeApi(
    (call) =>
      (call.method === "GET" ? Response.json({ clashes }) : handler?.(call)) ??
      saved()
  );
  const onDone = vi.fn();
  const actions = sessionFormCalls(api);
  render(
    <NoticeProvider>
      <SessionForm
        snapshot={{ ...base, ...patch }}
        now={now}
        sessionId={sessionId}
        prefill={prefill}
        links={links}
        actions={actions}
        onDone={onDone}
      />
    </NoticeProvider>
  );
  const writes = () => calls.filter((c) => c.method !== "GET");
  return { calls, writes, onDone };
}

const SLOT = { day: "2026-06-15", time: "10:00", location: "Room" };
const submit = () => screen.getByRole("button", { name: /Submit/ });
const settled = () =>
  waitFor(() => expect((submit() as HTMLButtonElement).disabled).toBe(false));

describe("adding a session", { tags: ["008-US1"] }, () => {
  it("opens on the picked slot with the viewer as host and books it", async () => {
    const { writes, onDone } = setup({ prefill: SLOT });
    expect((submit() as HTMLButtonElement).disabled, "a title is needed").toBe(
      true
    );

    await userEvent.type(screen.getByLabelText(/Session title/), "Kubernetes");
    await settled();
    await userEvent.click(submit());

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(writes()).toHaveLength(1);
    expect(writes()[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/sessions",
      body: {
        dayId: "d",
        title: "Kubernetes",
        closed: false,
        hostIds: ["mia"],
        startTime: "2026-06-15T10:00:00.000Z",
        durationMinutes: 60,
        capacity: 10,
        locationId: "r",
      },
    });
    expect(writes()[0].key).toBeTruthy();
    expect((await screen.findByRole("status")).textContent).toContain(
      "Your session “Kubernetes” has been added successfully!"
    );
  });

  it(
    "lets the host move the time, length and attendee limit",
    { tags: ["008-US4"] },
    async () => {
      const { writes } = setup({ prefill: SLOT });

      await userEvent.type(screen.getByLabelText(/Session title/), "Talk");
      await userEvent.selectOptions(
        screen.getByLabelText(/Start Time/),
        "10:40"
      );
      await userEvent.click(
        screen.getByRole("radio", { name: "1 hour 20 minutes" })
      );
      await userEvent.clear(screen.getByLabelText("Max attendees"));
      await userEvent.type(screen.getByLabelText("Max attendees"), "0");
      await settled();
      await userEvent.click(submit());

      await waitFor(() => expect(writes()).toHaveLength(1));
      expect(writes()[0].body).toMatchObject({
        startTime: "2026-06-15T10:30:00.000Z",
        durationMinutes: 90,
        capacity: 0,
      });
    }
  );

  it("offers no start the room is taken in, and shortens the lengths before the next session", () => {
    setup({ prefill: { day: SLOT.day, time: "13:00", location: "Room" } });

    const starts = screen.getByLabelText(/Start Time/);
    expect(
      screen.getByRole<HTMLOptionElement>("option", { name: "14:10" }).disabled,
      "My talk holds 14:00 to 14:50"
    ).toBe(true);
    expect(
      screen.getByRole<HTMLOptionElement>("option", { name: "12:10" }).disabled,
      "the room is unavailable from 12:00 to 13:00"
    ).toBe(true);
    expect((starts as HTMLSelectElement).value).toBe(
      String(Date.UTC(2026, 5, 15, 13))
    );
    expect(
      screen.queryByRole("radio", { name: "1 hour 50 minutes" }),
      "the next session starts an hour on"
    ).toBeNull();
    expect(screen.getByRole("radio", { name: "50 minutes" })).toBeTruthy();
  });

  it("fills the form from a proposal and sends it with the session", async () => {
    const { writes } = setup({ prefill: SLOT });

    await userEvent.selectOptions(
      screen.getByLabelText("Proposal"),
      "Rust intro"
    );

    expect(screen.getByLabelText<HTMLInputElement>(/Session title/).value).toBe(
      "Rust intro"
    );
    expect(
      screen.getByRole("radio", { name: "1 hour 20 minutes" })
    ).toHaveProperty("checked", true);
    await settled();
    await userEvent.click(submit());

    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(writes()[0].body).toMatchObject({
      title: "Rust intro",
      description: "Learn Rust",
      hostIds: ["mia", "bob"],
      durationMinutes: 90,
      proposalId: "p",
    });
  });

  it("starts from the proposal named in the address, and clears it on request", async () => {
    setup({ prefill: { ...SLOT, proposalId: "p" } });
    expect(screen.getByLabelText<HTMLInputElement>(/Session title/).value).toBe(
      "Rust intro"
    );

    await userEvent.selectOptions(screen.getByLabelText("Proposal"), "[none]");

    expect(screen.getByLabelText<HTMLInputElement>(/Session title/).value).toBe(
      ""
    );
  });

  it("warns when a host is busy then, and tells how the hosts were asked", async () => {
    const { calls } = setup({
      prefill: SLOT,
      clashes: [
        {
          guestId: "mia",
          guestName: "Mia",
          kind: "hosting",
          title: "Other talk",
          start: iso(16),
          end: iso(17),
        },
      ],
    });

    expect(await screen.findByText(/Warning: schedule clash/)).toBeTruthy();
    expect(
      screen.getByText("- Mia is hosting Other talk from 16:00 to 17:00")
    ).toBeTruthy();
    expect(calls[0].path).toContain("guestIds=mia");
    expect(calls[0].path).toContain("eventId=e");
  });

  it("says why the server refused it and keeps the form", async () => {
    const { onDone } = setup({
      prefill: SLOT,
      handler: () => problem(409, "session.clash"),
    });

    await userEvent.type(screen.getByLabelText(/Session title/), "Talk");
    await settled();
    await userEvent.click(submit());

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Another session already uses that room at that time."
    );
    expect(onDone).not.toHaveBeenCalled();
  });

  it("asks who you are first when nobody is selected", () => {
    setup({ patch: { me: null } });

    expect(
      screen.getByText(/select who you are before adding a session/)
    ).toBeTruthy();
    expect(screen.queryByLabelText(/Session title/)).toBeNull();
  });
});

describe("editing a session", { tags: ["008-US2"] }, () => {
  it("loads the session and replaces it against the version it was loaded at", async () => {
    const { writes, onDone } = setup({ sessionId: "mine" });

    expect(screen.getByLabelText<HTMLInputElement>(/Session title/).value).toBe(
      "My talk"
    );
    expect(screen.getByLabelText<HTMLSelectElement>(/Start Time/).value).toBe(
      String(Date.parse(OWN_SLOT))
    );
    expect(screen.getByRole("radio", { name: "50 minutes" })).toHaveProperty(
      "checked",
      true
    );
    expect(screen.queryByLabelText("Proposal")).toBeNull();

    await userEvent.type(screen.getByLabelText(/Session title/), " 2");
    await settled();
    await userEvent.click(submit());

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(writes()[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/sessions/mine",
      body: {
        title: "My talk 2",
        locationIds: ["r"],
        startTime: OWN_SLOT,
        durationMinutes: 60,
        expectedVersion: 5,
      },
    });
    expect((await screen.findByRole("status")).textContent).toContain(
      "Your session “My talk 2” has been updated successfully!"
    );
  });

  it("links the proposal a session came from", () => {
    setup({
      sessionId: "mine",
      patch: { sessions: [{ ...mine, proposalId: "p" }] },
    });

    expect(
      screen.getByRole("link", { name: "here" }).getAttribute("href")
    ).toBe("/conf/proposals?viewProposal=p");
  });

  it("keeps a started session where it is and still lets its length change", async () => {
    const { writes } = setup({
      sessionId: "mine",
      now: new Date(Date.UTC(2026, 5, 15, 14, 20)),
    });

    expect(screen.queryByLabelText(/Start Time/)).toBeNull();
    expect(
      screen.queryByRole("radio", {
        name: /Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/,
      })
    ).toBeNull();
    expect(screen.getByText(/already started/)).toBeTruthy();

    await userEvent.click(
      screen.getByRole("radio", { name: "1 hour 30 minutes" })
    );
    await settled();
    await userEvent.click(submit());

    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(writes()[0].body).toMatchObject({
      startTime: OWN_SLOT,
      durationMinutes: 100,
    });
  });

  it("keeps a session in the several rooms an organizer gave it", async () => {
    const second = { ...base.locations[0], id: "r2", name: "Hall" };
    const { writes } = setup({
      sessionId: "mine",
      patch: {
        locations: [...base.locations, second],
        sessions: [fixture.sessions[0], { ...mine, locationIds: ["r", "r2"] }],
      },
    });

    expect(screen.getByLabelText<HTMLSelectElement>(/Location/).value).toBe(
      "keep-rooms"
    );
    await settled();
    await userEvent.click(submit());

    await waitFor(() => expect(writes()).toHaveLength(1));
    expect(writes()[0].body).toMatchObject({ locationIds: ["r", "r2"] });
  });

  it("deletes after a confirmation", { tags: ["008-US3"] }, async () => {
    const { writes, onDone } = setup({
      sessionId: "mine",
      handler: () => new Response(null, { status: 204 }),
    });

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(writes()).toHaveLength(0);
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" })
    );

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(writes()[0]).toMatchObject({
      method: "DELETE",
      path: "/api/v1/sessions/mine",
    });
    expect((await screen.findByRole("status")).textContent).toContain(
      "Your session “My talk” has been deleted successfully."
    );
  });

  it("leaves the session as it is when cancelled", () => {
    setup({ sessionId: "mine" });

    expect(
      screen.getByRole("link", { name: "Cancel" }).getAttribute("href")
    ).toBe("/conf");
  });

  it("says when the session is gone", () => {
    setup({ sessionId: "nope" });

    expect(screen.getByText("Session not found.")).toBeTruthy();
  });
});
