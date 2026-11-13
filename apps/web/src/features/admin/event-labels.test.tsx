import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { adminLabelCalls } from "../../commands/admin-labels";
import { fakeApi, type FakeCall } from "../../commands/fake-api";
import type { AdminLabel } from "../../queries/admin-labels";
import { NoticeProvider } from "../../ui/notices";
import { EventLabelsManager } from "./event-labels";

afterEach(cleanup);

const volunteer: AdminLabel = {
  id: "l1",
  eventId: "e1",
  name: "Volunteer",
  description: "Helps on site",
  color: "green",
  guestIds: ["g1", "g2"],
};

const setup = (
  labels: AdminLabel[],
  handler: (call: FakeCall) => Response = () => Response.json(volunteer)
) => {
  const { api, calls } = fakeApi(handler);
  const onChanged = vi.fn();
  render(
    <NoticeProvider>
      <EventLabelsManager
        eventId="e1"
        labels={labels}
        calls={adminLabelCalls(api)}
        onChanged={onChanged}
      />
    </NoticeProvider>
  );
  return { calls, onChanged };
};

const region = () => screen.getByRole("region", { name: "Labels" });

describe("the event labels manager", { tags: ["011-US7"] }, () => {
  it("lists the labels with their description and how many wear them", () => {
    setup([volunteer]);

    const row = within(region()).getByRole("listitem");
    expect(row.textContent).toContain("Volunteer");
    expect(row.textContent).toContain("Helps on site");
    expect(row.textContent).toContain("2 attendees");
  });

  it("adds a label with a colour", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup([]);

    await user.click(screen.getByRole("button", { name: "Add label" }));
    await user.type(screen.getByLabelText(/^Name/), "Sponsor");
    await user.type(screen.getByLabelText(/^Description/), "Pays the bills");
    await user.selectOptions(screen.getByLabelText(/^Colour/), "violet");
    await user.click(screen.getByRole("button", { name: "Save label" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0].path).toBe("/api/v1/admin/events/e1/labels");
    expect(calls[0].body).toEqual({
      name: "Sponsor",
      description: "Pays the bills",
      color: "violet",
    });
  });

  it("asks for a name without calling the server", async () => {
    const user = userEvent.setup();
    const { calls } = setup([]);

    await user.click(screen.getByRole("button", { name: "Add label" }));
    await user.click(screen.getByRole("button", { name: "Save label" }));

    expect(await screen.findAllByText("Name is required")).not.toHaveLength(0);
    expect(calls).toHaveLength(0);
  });

  it("edits a label", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup([volunteer]);

    await user.click(screen.getByRole("button", { name: "Edit Volunteer" }));
    const name = screen.getByLabelText(/^Name/);
    await user.clear(name);
    await user.type(name, "Helper");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0].method).toBe("PUT");
    expect(calls[0].path).toBe("/api/v1/admin/labels/l1");
    expect(calls[0].body).toMatchObject({ name: "Helper", color: "green" });
  });

  it("deletes a label after asking", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup([volunteer]);

    await user.click(screen.getByRole("button", { name: "Delete Volunteer" }));
    expect(calls).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0].method).toBe("DELETE");
    expect(calls[0].path).toBe("/api/v1/admin/labels/l1");
  });
});
