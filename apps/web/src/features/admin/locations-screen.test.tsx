import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { adminLocationCalls } from "../../commands/admin-locations";
import { fakeApi, problem, type FakeCall } from "../../commands/fake-api";
import type { AdminLocation } from "../../queries/admin-locations";
import { NoticeProvider } from "../../ui/notices";
import { useState } from "react";
import { paramsUpdater } from "../../ui/list-paging";
import { LocationsScreen } from "./locations-screen";

afterEach(cleanup);

const location = (
  id: string,
  name: string,
  extra: Partial<AdminLocation> = {}
): AdminLocation => ({
  id,
  name,
  description: "",
  areaDescription: null,
  capacity: 0,
  color: "slate",
  bookable: false,
  imageUrl: "",
  eventIds: [],
  sessionCount: 0,
  version: 4,
  ...extra,
});

const events = [
  { id: "e1", name: "Conference Alpha" },
  { id: "e2", name: "Camp" },
];

const setup = (
  locations: AdminLocation[],
  handler: (call: FakeCall) => Response = () =>
    Response.json(location("l9", "x")),
  start = ""
) => {
  const { api, calls } = fakeApi(handler);
  const onChanged = vi.fn();
  function Page() {
    const [params, setParams] = useState(new URLSearchParams(start));
    return (
      <LocationsScreen
        status="ready"
        locations={locations}
        events={events}
        calls={adminLocationCalls(api)}
        onChanged={onChanged}
        params={params}
        onParams={paramsUpdater(params, (next) => setParams(next))}
      />
    );
  }
  render(
    <NoticeProvider>
      <Page />
    </NoticeProvider>
  );
  return {
    calls,
    onChanged,
    region: screen.getByRole("region", { name: "Locations" }),
  };
};

const png = new File(["x"], "room.png", { type: "image/png" });

describe("the admin locations screen", { tags: ["017-US1"] }, () => {
  it("lists each location with capacity, booking and events", () => {
    const { region } = setup([
      location("l1", "Hall", {
        capacity: 25,
        bookable: true,
        eventIds: ["e1"],
        imageUrl: "/media/hall.png",
      }),
      location("l2", "Store"),
    ]);
    expect(screen.getByRole("heading", { name: "Locations" })).toBeTruthy();

    const [hall, store] = within(region).getAllByRole("listitem");
    expect(hall.textContent).toContain("max 25 · bookable · Conference Alpha");
    expect(within(hall).getByRole("img", { name: "Hall" })).toBeTruthy();
    expect(store.textContent).not.toContain("max");
    expect(within(store).getByTestId("location-placeholder")).toBeTruthy();
    expect(within(hall).queryByTestId("location-placeholder")).toBeNull();
    expect(
      within(hall)
        .getByRole("button", { name: "Move Hall up" })
        .hasAttribute("disabled")
    ).toBe(true);
    expect(
      within(store)
        .getByRole("button", { name: "Move Store down" })
        .hasAttribute("disabled")
    ).toBe(true);
  });

  it("names each invalid field without calling the server", async () => {
    const { region, calls } = setup([]);

    await userEvent.click(
      within(region).getByRole("button", { name: "New location" })
    );
    await userEvent.clear(within(region).getByLabelText("Capacity"));
    await userEvent.click(
      within(region).getByRole("button", { name: "Add location" })
    );

    const problems = within(region).getAllByRole("alert");
    expect(problems.map((p) => p.textContent).join(" ")).toContain(
      "Name is required"
    );
    expect(problems.map((p) => p.textContent).join(" ")).toContain(
      "Capacity must be a non-negative whole number"
    );

    await userEvent.type(within(region).getByLabelText(/^Name/), "Half");
    await userEvent.type(within(region).getByLabelText("Capacity"), "1.5");
    await userEvent.click(
      within(region).getByRole("button", { name: "Add location" })
    );
    expect(within(region).queryByText("Name is required")).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it(
    "creates a location, then sets its image against the new version",
    { tags: ["017-US2"] },
    async () => {
      const { region, calls, onChanged } = setup([], (call) =>
        call.method === "POST"
          ? Response.json(location("l9", "Attic", { version: 1 }), {
              status: 201,
            })
          : Response.json(location("l9", "Attic", { version: 2 }))
      );

      await userEvent.click(
        within(region).getByRole("button", { name: "New location" })
      );
      await userEvent.type(within(region).getByLabelText(/^Name/), "Attic");
      await userEvent.type(within(region).getByLabelText("Capacity"), "25");
      await userEvent.click(within(region).getByLabelText("Bookable"));
      await userEvent.click(within(region).getByLabelText("Conference Alpha"));
      await userEvent.upload(within(region).getByLabelText("Image"), png);
      await userEvent.click(
        within(region).getByRole("button", { name: "Add location" })
      );

      await waitFor(() => expect(onChanged).toHaveBeenCalled());
      expect(calls).toHaveLength(2);
      expect(calls[0]).toMatchObject({
        method: "POST",
        path: "/api/v1/admin/locations",
        body: {
          name: "Attic",
          capacity: 25,
          bookable: true,
          color: "slate",
          eventIds: ["e1"],
        },
      });
      expect(calls[1]).toMatchObject({
        method: "PUT",
        path: "/api/v1/admin/locations/l9/image",
        body: { expectedVersion: "1" },
      });
    }
  );

  it(
    "keeps the saved fields and says why an image was refused",
    { tags: ["017-US2"] },
    async () => {
      const { region, calls, onChanged } = setup([], (call) =>
        call.path.endsWith("/image")
          ? Response.json(
              {
                type: "about:blank",
                title: "t",
                status: 422,
                code: "location.imageInvalid",
                detail: "Image must have a 4:3 aspect ratio (got 800×800)",
              },
              {
                status: 422,
                headers: { "content-type": "application/problem+json" },
              }
            )
          : Response.json(location("l9", "Attic", { version: 1 }), {
              status: 201,
            })
      );

      await userEvent.click(
        within(region).getByRole("button", { name: "New location" })
      );
      await userEvent.type(within(region).getByLabelText(/^Name/), "Attic");
      await userEvent.upload(within(region).getByLabelText("Image"), png);
      await userEvent.click(
        within(region).getByRole("button", { name: "Add location" })
      );

      expect(
        (await within(region).findAllByText(/4:3 aspect ratio/)).length
      ).toBeGreaterThan(0);
      expect(onChanged).toHaveBeenCalled();

      expect(
        within(region).queryByRole("button", { name: "Add location" })
      ).toBeNull();
      await userEvent.click(
        within(region).getByRole("button", { name: "Save" })
      );
      await waitFor(() => expect(calls).toHaveLength(4));
      expect(calls[2]).toMatchObject({
        method: "PUT",
        path: "/api/v1/admin/locations/l9",
        body: { expectedVersion: 1 },
      });
    }
  );

  it("saves an edit against the version shown", async () => {
    const { region, calls, onChanged } = setup([location("l1", "Hall")]);

    await userEvent.click(within(region).getByRole("button", { name: "Edit" }));
    const name = within(region).getByLabelText(/^Name/);
    await userEvent.clear(name);
    await userEvent.type(name, "Big Hall");
    await userEvent.click(within(region).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/admin/locations/l1",
      body: { name: "Big Hall", expectedVersion: 4 },
    });
  });

  it("says when someone else changed the location", async () => {
    const { region, onChanged } = setup([location("l1", "Hall")], () =>
      problem(409, "location.versionConflict")
    );

    await userEvent.click(within(region).getByRole("button", { name: "Edit" }));
    await userEvent.click(within(region).getByRole("button", { name: "Save" }));

    expect(
      await within(region).findByText(/Someone else changed this/)
    ).toBeTruthy();
    expect(onChanged).toHaveBeenCalled();
  });

  it("moves a location against its version", async () => {
    const { region, calls, onChanged } = setup(
      [location("l1", "Hall"), location("l2", "Store")],
      () => Response.json({ locations: [] })
    );

    await userEvent.click(
      within(region).getByRole("button", { name: "Move Store up" })
    );

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/admin/locations/l2/move",
      body: { direction: "up", expectedVersion: 4 },
    });
  });

  it("deletes only after the name is typed", async () => {
    const { region, calls, onChanged } = setup(
      [location("l1", "Hall", { eventIds: ["e1"], sessionCount: 2 })],
      () => new Response(null, { status: 204 })
    );

    await userEvent.click(
      within(region).getByRole("button", { name: "Delete" })
    );
    expect(
      within(region).getByText(/removes it from 2 sessions and 1 event/)
    ).toBeTruthy();
    const confirm = within(region).getByRole("button", {
      name: "Confirm delete",
    });
    expect(confirm.hasAttribute("disabled")).toBe(true);
    await userEvent.type(
      within(region).getByLabelText("Location name confirmation"),
      "Hall"
    );
    await userEvent.click(confirm);

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "DELETE",
      path: "/api/v1/admin/locations/l1",
    });
  });

  it("says when the locations could not load", () => {
    const { api } = fakeApi(() => problem(500, "x"));
    render(
      <LocationsScreen
        status="error"
        params={new URLSearchParams()}
        onParams={vi.fn()}
        locations={[]}
        events={[]}
        calls={adminLocationCalls(api)}
        onChanged={vi.fn()}
      />
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Could not load the locations"
    );
  });
});

describe("paging the admin locations", { tags: ["017-US1"] }, () => {
  const many = Array.from({ length: 120 }, (_, i) =>
    location(`l${i}`, `Room ${String(i).padStart(3, "0")}`)
  );

  it("shows 50 a page, scrolls up on a change and moves rows across the page boundary", async () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const { region } = setup(many);

    expect(within(region).getAllByRole("listitem").length).toBeGreaterThan(0);
    expect(screen.getByText("120 results")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Last page" }));

    expect(screen.getByText(/Room 100/)).toBeTruthy();
    expect(screen.queryByText(/Room 099/)).toBeNull();
    expect(scroll).toHaveBeenCalledWith({ block: "start" });
    expect(
      screen.getByRole("button", { name: "Move Room 100 up" })
    ).toHaveProperty("disabled", false);
    expect(
      screen.getByRole("button", { name: "Move Room 119 down" })
    ).toHaveProperty("disabled", true);
  });

  it("opens the last page for a page past the end, whose last row cannot move down", () => {
    setup(many, undefined, "page=99");

    expect(screen.getByText(/Room 119/)).toBeTruthy();
    expect(screen.queryByText(/Room 099/)).toBeNull();
    expect(
      screen.getByRole("button", { name: "Move Room 119 down" })
    ).toHaveProperty("disabled", true);
  });
});
