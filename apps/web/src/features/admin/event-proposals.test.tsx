import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { adminEventCalls } from "../../commands/admin-events";
import { fakeApi, type FakeCall, problem } from "../../commands/fake-api";
import type { AdminProposal } from "../../queries/admin-proposals";
import { NoticeProvider } from "../../ui/notices";
import type { DayOption } from "./admin-session-model";
import { EventProposalsManager } from "./event-proposals";
import type { ParamUpdates } from "./list-paging";

afterEach(cleanup);

const proposal = (
  id: string,
  title: string,
  extra: Partial<AdminProposal> = {}
): AdminProposal => ({
  id,
  title,
  description: "About it",
  durationMinutes: 45,
  hosts: [],
  votesCount: 2,
  sessionCount: 0,
  version: 5,
  ...extra,
});

const day: DayOption = {
  key: "d1",
  label: "Wednesday, May 1",
  start: "2030-05-01T07:00:00.000Z",
  end: "2030-05-01T17:00:00.000Z",
};
const hall = { id: "l1", name: "Hall", capacity: 30 };

const alice = { id: "g1", name: "Alice" };
const bob = { id: "g2", name: "Bob" };

const setup = (
  proposals: AdminProposal[],
  {
    query = "",
    handler = () => Response.json(proposal("p1", "Saved")),
  }: { query?: string; handler?: (call: FakeCall) => Response } = {}
) => {
  const { api, calls } = fakeApi(handler);
  const onParams = vi.fn<(u: ParamUpdates, o: { push: boolean }) => void>();
  const onChanged = vi.fn();
  render(
    <NoticeProvider>
      <EventProposalsManager
        eventId="e1"
        proposals={proposals}
        guests={[alice, bob]}
        locations={[hall]}
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
    onParams,
    onChanged,
    region: screen.getByRole("region", { name: "Proposals" }),
  };
};

describe("the event proposals manager", { tags: ["018-US1"] }, () => {
  it("lists proposals by title, ignoring case, with hosts and votes", () => {
    const { region } = setup([
      proposal("p2", "beta", { hosts: [alice], votesCount: 1 }),
      proposal("p1", "Zeta"),
      proposal("p3", "Alpha"),
    ]);

    const items = within(region).getAllByRole("listitem");
    expect(items.map((i) => i.textContent)).toEqual([
      expect.stringContaining("Alpha"),
      expect.stringContaining("beta"),
      expect.stringContaining("Zeta"),
    ]);
    expect(items[1].textContent).toContain("Hosts: Alice · 1 vote");
    expect(items[2].textContent).toContain("Hosts: — · 2 votes");
  });

  it("searches the title and the host names", () => {
    const list = [
      proposal("p1", "Talk", { hosts: [alice] }),
      proposal("p2", "Panel", { hosts: [bob] }),
    ];
    setup(list, { query: "q=ALI" });
    let region = screen.getByRole("region", { name: "Proposals" });
    expect(within(region).queryByText("Panel")).toBeNull();
    expect(within(region).getByText("Talk")).toBeTruthy();
    cleanup();

    setup(list, { query: "q=pane" });
    region = screen.getByRole("region", { name: "Proposals" });
    expect(within(region).queryByText("Talk")).toBeNull();
  });

  it("saves the edited fields against the version it showed", async () => {
    const { region, calls, onChanged } = setup([
      proposal("p1", "Talk", { hosts: [alice] }),
    ]);

    await userEvent.click(
      within(region).getByRole("button", { name: "Edit Talk" })
    );
    const title = within(region).getByLabelText(/^Title/);
    await userEvent.clear(title);
    await userEvent.type(title, "Better");
    const duration = within(region).getByLabelText(/^Duration/);
    await userEvent.clear(duration);
    await userEvent.click(within(region).getByLabelText("Hosts"));
    await userEvent.click(screen.getByRole("option", { name: /Bob/ }));
    await userEvent.click(within(region).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/admin/proposals/p1",
      body: {
        title: "Better",
        description: "About it",
        durationMinutes: null,
        hostIds: ["g1", "g2"],
        expectedVersion: 5,
      },
    });
  });

  it("refuses a fractional duration without sending", async () => {
    const { region, calls } = setup([proposal("p1", "Talk")]);

    await userEvent.click(
      within(region).getByRole("button", { name: "Edit Talk" })
    );
    const duration = within(region).getByLabelText(/^Duration/);
    await userEvent.clear(duration);
    await userEvent.type(duration, "2.5");
    await userEvent.click(within(region).getByRole("button", { name: "Save" }));

    expect(
      (await within(region).findAllByText(/non-negative whole number/)).length
    ).toBeGreaterThan(0);
    expect(calls).toHaveLength(0);
  });

  it("says when someone else changed the proposal and refetches", async () => {
    const { region, onChanged } = setup([proposal("p1", "Talk")], {
      handler: () => problem(409, "proposal.versionConflict"),
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

  it("keeps a host that is no longer assigned to the event as an option", async () => {
    const { region } = setup([
      proposal("p1", "Talk", { hosts: [{ id: "g9", name: "Gone" }] }),
    ]);

    await userEvent.click(
      within(region).getByRole("button", { name: "Edit Talk" })
    );

    expect(
      within(region).getByRole("button", { name: "Remove Gone" })
    ).toBeTruthy();
  });

  it("deletes only after the title is typed, naming what goes with it", async () => {
    const { region, calls, onChanged } = setup(
      [proposal("p1", "Talk", { hosts: [alice], sessionCount: 2 })],
      { handler: () => new Response(null, { status: 204 }) }
    );

    await userEvent.click(
      within(region).getByRole("button", { name: "Delete Talk" })
    );
    expect(
      within(region).getByText(
        /2 votes and 1 host link\. 2 derived sessions will be kept/
      )
    ).toBeTruthy();
    const confirm = within(region).getByRole("button", {
      name: "Confirm delete",
    });
    expect(confirm.hasAttribute("disabled")).toBe(true);
    await userEvent.type(
      within(region).getByLabelText("Type the proposal title to confirm"),
      "Talk"
    );
    await userEvent.click(confirm);

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "DELETE",
      path: "/api/v1/admin/proposals/p1",
    });
  });

  it("creates a session from a proposal, carrying over what it says", async () => {
    const user = userEvent.setup();
    const { calls, onChanged } = setup(
      [
        proposal("p1", "Talk", {
          description: "About it",
          hosts: [alice],
        }),
      ],
      { handler: () => Response.json({}, { status: 201 }) }
    );

    await user.click(
      screen.getByRole("button", { name: "Create session from Talk" })
    );
    const form = screen.getByRole("form", { name: "Session from Talk" });
    expect(
      within(form).getByRole<HTMLInputElement>("textbox", { name: /Title/ })
        .value
    ).toBe("Talk");
    expect(
      within(form).getByRole<HTMLTextAreaElement>("textbox", {
        name: /Description/,
      }).value
    ).toBe("About it");
    await user.click(within(form).getByRole("checkbox", { name: /Hall/ }));
    await user.click(within(form).getByRole("button", { name: "Create" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    const call = calls.find((c) => c.method === "POST");
    expect(call?.path).toBe("/api/v1/admin/sessions");
    expect(call?.body).toMatchObject({
      eventId: "e1",
      proposalId: "p1",
      title: "Talk",
      hostIds: ["g1"],
      locationIds: ["l1"],
    });
  });

  it("fills in the end from the proposal's duration, until it is typed over", async () => {
    const user = userEvent.setup();
    setup([proposal("p1", "Talk", { durationMinutes: 45 })]);
    await user.click(
      screen.getByRole("button", { name: "Create session from Talk" })
    );
    const form = screen.getByRole("form", { name: "Session from Talk" });
    await user.selectOptions(within(form).getByLabelText("Day"), "d1");
    const end = within(form).getByLabelText<HTMLInputElement>(
      /^End \(Europe\/Berlin\)/
    );

    await user.type(
      within(form).getByLabelText(/^Start \(Europe\/Berlin\)/),
      "12:00"
    );
    expect(within(form).getByText("Starts at 12:10")).toBeTruthy();
    expect(end.value).toBe("12:45");

    await user.clear(end);
    await user.type(end, "14:00");
    expect(end.value).toBe("14:00");
  });
});
