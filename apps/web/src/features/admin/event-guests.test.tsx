import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { adminEventCalls } from "../../commands/admin-events";
import { adminLabelCalls } from "../../commands/admin-labels";
import { fakeApi, type FakeCall } from "../../commands/fake-api";
import type { AdminGuest } from "../../queries/admin-guests";
import type { AdminLabel } from "../../queries/admin-labels";
import { NoticeProvider } from "../../ui/notices";
import { EventGuestsManager } from "./event-guests";

afterEach(cleanup);

const guest = (id: string, name: string, eventIds: string[]): AdminGuest => ({
  id,
  name,
  email: `${id}@x.org`,
  username: "",
  eventIds,
  siteAdmin: false,
  hasPassword: true,
  version: 1,
});

const label = (id: string, name: string, guestIds: string[]): AdminLabel => ({
  id,
  eventId: "e1",
  name,
  description: "",
  color: "green",
  guestIds,
});

const setup = (handler: (call: FakeCall) => Response) => {
  const { api, calls } = fakeApi(handler);
  const onChanged = vi.fn();
  render(
    <NoticeProvider>
      <EventGuestsManager
        eventId="e1"
        guests={[guest("g1", "Alice", ["e1"]), guest("g2", "Bob", [])]}
        labels={[label("l1", "Volunteer", ["g1"]), label("l2", "Sponsor", [])]}
        params={new URLSearchParams()}
        onParams={() => {}}
        calls={{ ...adminEventCalls(api), ...adminLabelCalls(api) }}
        onChanged={onChanged}
      />
    </NoticeProvider>
  );
  return { calls, onChanged };
};

describe("an event's guest list", { tags: ["011-US7"] }, () => {
  it("gives a guest of the event a label from a searchable list", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup(() => Response.json({}));
    const [alice] = screen.getAllByRole("combobox", {
      name: "Labels of Alice",
    });
    expect(
      screen.queryAllByRole("combobox", { name: "Labels of Bob" })
    ).toEqual([]);
    await user.type(alice, "spon");
    const list = screen.getByRole("listbox");
    expect(within(list).queryByText("Volunteer")).toBeNull();
    await user.click(within(list).getByText("Sponsor"));
    expect(calls.filter((c) => c.method === "PUT")).toMatchObject([
      {
        method: "PUT",
        path: "/api/v1/admin/events/e1/guests/g1/labels",
        body: { labelIds: ["l1", "l2"] },
      },
    ]);
    expect(onChanged).toHaveBeenCalled();
  });

  it("says when a label could not be saved", async () => {
    const user = userEvent.setup();
    setup(() => new Response(null, { status: 500 }));
    const [alice] = screen.getAllByRole("button", { name: "Remove Volunteer" });
    await user.click(alice);
    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
  });
});
