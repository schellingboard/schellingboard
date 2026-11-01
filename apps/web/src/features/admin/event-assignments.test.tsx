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
import type { AdminGuest } from "../../queries/admin-guests";
import type { AdminLocation } from "../../queries/admin-locations";
import { NoticeProvider } from "../../ui/notices";
import type { ParamUpdates } from "./list-paging";
import { EventGuestsManager } from "./event-guests";
import { EventLocationsManager } from "./event-locations";

afterEach(cleanup);

const guest = (
  id: string,
  name: string,
  eventIds: string[] = []
): AdminGuest => ({
  id,
  name,
  email: `${id}@x.org`,
  eventIds,
  siteAdmin: false,
  hasPassword: true,
  version: 1,
});

const setupGuests = (
  guests: AdminGuest[],
  query = "",
  handler: (call: FakeCall) => Response = () =>
    new Response(null, { status: 204 })
) => {
  const { api, calls } = fakeApi(handler);
  const onParams = vi.fn<(u: ParamUpdates, o: { push: boolean }) => void>();
  const onChanged = vi.fn();
  render(
    <NoticeProvider>
      <EventGuestsManager
        eventId="e1"
        guests={guests}
        params={new URLSearchParams(query)}
        onParams={onParams}
        calls={adminEventCalls(api)}
        onChanged={onChanged}
      />
    </NoticeProvider>
  );
  return { calls, onParams, onChanged };
};

const region = () => screen.getByRole("region", { name: "Guests" });
const assignBoxes = (name: string) =>
  within(region()).getAllByRole("checkbox", { name: `Assign ${name}` });

describe(
  "join links in the event guests manager",
  { tags: ["016-US5"] },
  () => {
    const linkHandler = (call: FakeCall) =>
      call.path.endsWith("/join-link")
        ? Response.json({ token: "TOK123" }, { status: 201 })
        : Response.json({ sent: 2, withoutEmail: 1, failed: 0 });

    it("makes a link for one guest and shows it to copy", async () => {
      const { calls } = setupGuests([guest("g1", "Alice")], "", linkHandler);

      await userEvent.click(
        within(region()).getAllByRole("button", {
          name: "New link for Alice",
        })[0]
      );

      const box = await within(region()).findAllByRole("textbox", {
        name: "Join link for Alice",
      });
      expect((box[0] as HTMLInputElement).value).toBe(
        `${window.location.origin}/join/TOK123`
      );
      expect(calls[0]).toMatchObject({
        method: "POST",
        path: "/api/v1/admin/events/e1/guests/g1/join-link",
      });
      expect(
        within(region()).getAllByRole("button", { name: "Copy link for Alice" })
      ).not.toHaveLength(0);
    });

    it("explains a refusal", async () => {
      setupGuests([guest("g1", "Alice")], "", () =>
        problem(404, "guest.notFound", "User not found")
      );

      await userEvent.click(
        within(region()).getAllByRole("button", {
          name: "New link for Alice",
        })[0]
      );

      expect(await screen.findByText("User not found")).toBeTruthy();
    });

    it("mails new links to every guest of the event", async () => {
      const { calls } = setupGuests([guest("g1", "Alice")], "", linkHandler);

      await userEvent.click(
        screen.getByRole("button", { name: "Mail new links to all guests" })
      );
      expect(calls).toHaveLength(0);
      await userEvent.click(
        screen.getByRole("button", { name: "Yes, mail all guests" })
      );

      expect(await screen.findByRole("status")).toHaveProperty(
        "textContent",
        "Mailed 2 guests. 1 has no email. 0 failed."
      );
      expect(calls[0]).toMatchObject({
        path: "/api/v1/admin/events/e1/join-links/mail",
        body: {},
      });
    });

    it("mails only the selected guests", async () => {
      const { calls } = setupGuests(
        [guest("g1", "Alice"), guest("g2", "Bob")],
        "",
        linkHandler
      );

      await userEvent.click(
        screen.getAllByRole("checkbox", { name: "Select Bob" })[0]
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Mail new links to 1 selected" })
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Yes, mail 1 selected guest" })
      );

      await waitFor(() => expect(calls).toHaveLength(1));
      expect(calls[0].body).toEqual({ guestIds: ["g2"] });
    });
  }
);

describe("the event guests manager", { tags: ["016-US3"] }, () => {
  it("assigns a guest with one request and refetches", async () => {
    const { calls, onChanged } = setupGuests([guest("g1", "Alice")]);

    await userEvent.click(assignBoxes("Alice")[0]);

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/admin/events/e1/guests/assign",
      body: { guestIds: ["g1"] },
    });
  });

  it("removes an assigned guest", async () => {
    const { calls } = setupGuests([guest("g1", "Alice", ["e1"])]);

    expect((assignBoxes("Alice")[0] as HTMLInputElement).checked).toBe(true);
    await userEvent.click(assignBoxes("Alice")[0]);

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].path).toBe("/api/v1/admin/events/e1/guests/remove");
  });

  it("filters by assignment", () => {
    setupGuests(
      [guest("g1", "Alice", ["e1"]), guest("g2", "Bob"), guest("g3", "Cy")],
      "filter=not-assigned"
    );

    expect(within(region()).queryAllByText("Alice")).toHaveLength(0);
    expect(within(region()).getAllByText("Bob").length).toBeGreaterThan(0);
  });

  it("searches name and email separately, ignoring case", () => {
    const guests = [
      guest("g1", "Alice"),
      { ...guest("g2", "Bob"), email: "robert@x.org" },
      guest("g3", "Cy"),
    ];
    setupGuests(guests, "q=BO");
    expect(within(region()).getAllByText("Bob").length).toBeGreaterThan(0);
    expect(within(region()).queryAllByText("Cy")).toHaveLength(0);
    cleanup();

    setupGuests(guests, "q=robert");
    expect(within(region()).getAllByText("Bob").length).toBeGreaterThan(0);
    expect(within(region()).queryAllByText("Alice")).toHaveLength(0);
    cleanup();

    setupGuests(guests, "q=Bob x.org");
    expect(within(region()).queryAllByText("Bob")).toHaveLength(0);
  });

  it("lists guests by name, ignoring case, then id", () => {
    setupGuests([
      guest("g3", "cy"),
      guest("g2", "Bob"),
      guest("g1", "Alice"),
      guest("g0", "bob"),
    ]);

    const rows = within(region()).getAllByRole("row").slice(1);
    expect(rows.map((r) => r.textContent)).toEqual([
      expect.stringContaining("Alice"),
      expect.stringContaining("bob"),
      expect.stringContaining("Bob"),
      expect.stringContaining("cy"),
    ]);
  });

  it("asks for a filter change on the first page", async () => {
    const { onParams } = setupGuests([guest("g1", "Alice")]);

    await userEvent.click(
      within(region()).getByRole("button", { name: /^Assigned$/ })
    );

    expect(onParams).toHaveBeenCalledWith(
      { filter: "assigned", page: null },
      { push: true }
    );
  });

  it("pages 25 at a time", async () => {
    const guests = Array.from({ length: 26 }, (_, i) =>
      guest(`g${i}`, `Guest ${String(i).padStart(2, "0")}`)
    );
    const { onParams } = setupGuests(guests, "page=2");

    expect(within(region()).getAllByText("Guest 25").length).toBeGreaterThan(0);
    expect(within(region()).queryAllByText("Guest 00")).toHaveLength(0);
    await userEvent.click(
      within(region()).getByRole("button", { name: "Previous page" })
    );
    expect(onParams).toHaveBeenCalledWith({ page: null }, { push: true });
  });

  it("assigns the selected guests in one request and clears the selection", async () => {
    const { calls } = setupGuests([guest("g1", "Alice"), guest("g2", "Bob")]);

    await userEvent.click(
      within(region()).getByRole("checkbox", { name: "Select all" })
    );
    await userEvent.click(
      within(region()).getByRole("button", { name: "Assign selected" })
    );

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toEqual({ guestIds: ["g1", "g2"] });
    await waitFor(() =>
      expect(within(region()).getByText("0 selected")).toBeTruthy()
    );
  });

  it("shows why the server refused", async () => {
    setupGuests([guest("g1", "Alice")], "", () =>
      problem(404, "event.notFound")
    );

    await userEvent.click(assignBoxes("Alice")[0]);

    expect(await within(region()).findByRole("alert")).toBeTruthy();
  });
});

describe("the event locations manager", { tags: ["017-US3"] }, () => {
  it("assigns a location and shows its capacity", async () => {
    const { api, calls } = fakeApi(() => new Response(null, { status: 204 }));
    const loc: AdminLocation = {
      id: "l1",
      name: "Hall",
      description: "",
      areaDescription: null,
      capacity: 30,
      color: "slate",
      bookable: true,
      imageUrl: "",
      eventIds: [],
      sessionCount: 0,
      version: 1,
    };
    render(
      <NoticeProvider>
        <EventLocationsManager
          eventId="e1"
          locations={[loc]}
          params={new URLSearchParams()}
          onParams={vi.fn()}
          calls={adminEventCalls(api)}
          onChanged={vi.fn()}
        />
      </NoticeProvider>
    );
    const locations = screen.getByRole("region", { name: "Locations" });
    expect(within(locations).getByText("30")).toBeTruthy();

    await userEvent.click(
      within(locations).getAllByRole("checkbox", { name: "Assign Hall" })[0]
    );

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0]).toMatchObject({
      path: "/api/v1/admin/events/e1/locations/assign",
      body: { locationIds: ["l1"] },
    });
  });
});
