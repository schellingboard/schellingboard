import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { paramsUpdater } from "../../ui/list-paging";
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
  status: "loading" | "ready" | "error" = "ready",
  start = ""
) => {
  const { api, calls } = fakeApi(handler);
  const onCreated = vi.fn();
  const pushes: [Record<string, string | null>, boolean][] = [];
  function Page() {
    const [params, setParams] = useState(new URLSearchParams(start));
    const change = paramsUpdater(params, (next) => setParams(next));
    return (
      <AdminEventsScreen
        status={status}
        events={events}
        calls={adminEventCalls(api)}
        onCreated={onCreated}
        params={params}
        onParams={(updates, options) => {
          pushes.push([updates, options.push]);
          change(updates, options);
        }}
      />
    );
  }
  render(
    <NoticeProvider>
      <Page />
    </NoticeProvider>
  );
  return { calls, onCreated, pushes };
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

  it("creates an event with its defaults and reloads the list", async () => {
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
      identityMode: "verified",
    });
    expect(screen.queryByRole("button", { name: "Create event" })).toBeNull();
    expect(screen.getByRole("button", { name: "New event" })).toBeTruthy();
  });

  it("searches the time zones and sends the one picked", async () => {
    const user = userEvent.setup();
    const { calls } = setup([], () =>
      Response.json({ id: "e9" }, { status: 201 })
    );

    await user.click(screen.getByRole("button", { name: "New event" }));
    await user.type(screen.getByLabelText(/^Name/), "Summit");
    const zone = screen.getByRole("combobox", { name: /^Timezone/ });
    await user.clear(zone);
    await user.type(zone, "berlin");
    expect(screen.queryByText("Pick one or type any text")).toBeNull();
    expect(screen.queryByRole("option", { name: "Asia/Tokyo" })).toBeNull();
    await user.click(screen.getByRole("option", { name: "Europe/Berlin" }));
    await user.click(screen.getByRole("button", { name: "Create event" }));

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toMatchObject({ timezone: "Europe/Berlin" });
  });

  it("refuses a time zone that is not in the list", async () => {
    const user = userEvent.setup();
    const { calls } = setup([]);

    await user.click(screen.getByRole("button", { name: "New event" }));
    await user.type(screen.getByLabelText(/^Name/), "Summit");
    const zone = screen.getByRole("combobox", { name: /^Timezone/ });
    await user.clear(zone);
    await user.type(zone, "Nowhere");
    await user.click(screen.getByRole("button", { name: "Create event" }));

    expect(
      (await screen.findAllByText("Pick a time zone from the list")).length
    ).toBeGreaterThan(0);
    expect(calls).toHaveLength(0);
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

describe("paging the admin events", { tags: ["015-US2"] }, () => {
  const many = Array.from({ length: 120 }, (_, i) =>
    event(`e${i}`, `Con ${String(i).padStart(3, "0")}`)
  );
  const first = () => screen.getAllByRole("listitem")[0].textContent;

  it("shows 50 a page, pushes the page and scrolls to the top", async () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const { pushes } = setup(many);

    expect(screen.getAllByRole("listitem")).toHaveLength(50);
    expect(screen.getByText("120 results")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Page 3" }));

    expect(pushes.at(-1)).toEqual([{ page: "3" }, true]);
    expect(first()).toContain("Con 100");
    expect(screen.getAllByRole("listitem")).toHaveLength(20);
    expect(scroll).toHaveBeenCalledWith({ block: "start" });
  });

  it("shows the last page for a page past the end", () => {
    setup(many, undefined, "ready", "page=99");

    expect(first()).toContain("Con 100");
  });

  it("has no pager for a short list", () => {
    setup(many.slice(0, 3));

    expect(screen.queryByRole("navigation", { name: "Pagination" })).toBeNull();
  });
});
