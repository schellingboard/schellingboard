import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { proposalFormCalls } from "../../commands/proposal-form";
import { iso, snapshot as fixture } from "../../replica/snapshot-fixture";
import { NoticeProvider } from "../../ui/notices";
import { proposalLinks } from "./links";
import { ProposalForm } from "./proposal-form";

afterEach(cleanup);

const guest = (id: string, name: string, member = true) => ({
  ...fixture.guests[1],
  id,
  name,
  member,
});

const existing: Snapshot["proposals"][number] = {
  id: "p",
  eventId: "e",
  title: "Rust intro",
  description: "Learn Rust",
  durationMinutes: 60,
  createdTime: iso(1),
  updatedTime: iso(1),
  hosts: [{ id: "mia", name: "Mia" }],
  cohostWanted: false,
  cohostWantedNote: null,
  version: 4,
};

const base: Snapshot = {
  ...fixture,
  guests: [
    guest("mia", "Mia"),
    guest("alice", "Alice Test"),
    guest("bob", "Bob Test"),
    guest("gone", "Gone Host", false),
  ],
  proposals: [existing],
  me: { ...fixture.me!, guestId: "mia" },
};

const created = Response.json({ ...existing, id: "new" }, { status: 201 });

function setup(
  proposalId: string | undefined,
  {
    handler = () => created.clone(),
    patch = {},
  }: { handler?: FakeHandler; patch?: Partial<Snapshot> } = {}
) {
  const { api, calls } = fakeApi(handler);
  const onDone = vi.fn();
  const element = (snapshot: Snapshot) => (
    <NoticeProvider>
      <ProposalForm
        proposalId={proposalId}
        snapshot={snapshot}
        links={proposalLinks("conf")}
        actions={proposalFormCalls(api)}
        onDone={onDone}
      />
    </NoticeProvider>
  );
  const { rerender } = render(element({ ...base, ...patch }));
  return {
    calls,
    onDone,
    update: (next: Partial<Snapshot>) =>
      rerender(element({ ...base, ...patch, ...next })),
  };
}

const submit = () => screen.getByRole("button", { name: /Submit/ });

describe("a new proposal", { tags: ["004-US1"] }, () => {
  it("starts on the title, with the viewer as host, and sends what was typed", async () => {
    const { calls, onDone } = setup(undefined);
    expect(document.activeElement).toBe(screen.getByLabelText(/Title/));
    expect(
      (submit() as HTMLButtonElement).disabled,
      "an empty title cannot be submitted"
    ).toBe(true);

    await userEvent.type(screen.getByLabelText(/Title/), "Kubernetes");
    await userEvent.type(screen.getByLabelText("Description"), "Pods");
    await userEvent.click(screen.getByRole("radio", { name: "50 minutes" }));
    await userEvent.click(submit());

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/proposals",
      body: {
        eventId: "e",
        title: "Kubernetes",
        description: "Pods",
        hostIds: ["mia"],
        durationMinutes: 60,
        cohostWanted: false,
      },
    });
    expect(calls[0].key).toBeTruthy();
  });

  it("leaves the duration undecided by default", async () => {
    const { calls } = setup(undefined);

    await userEvent.type(screen.getByLabelText(/Title/), "A");
    await userEvent.click(submit());

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(
      (calls[0].body as { durationMinutes?: number }).durationMinutes
    ).toBeUndefined();
    expect(
      screen.getByRole<HTMLInputElement>("radio", { name: "Undecided" }).checked
    ).toBe(true);
  });

  it("asks for a co-host with a note, and adding a host withdraws the request", async () => {
    const { calls } = setup(undefined);

    await userEvent.type(screen.getByLabelText(/Title/), "A");
    await userEvent.click(screen.getByLabelText(/Looking for a co-host/));
    await userEvent.type(
      screen.getByLabelText("Who are you looking for?"),
      "A demo runner"
    );
    await userEvent.click(submit());
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toMatchObject({
      cohostWanted: true,
      cohostWantedNote: "A demo runner",
    });

    await userEvent.click(screen.getByLabelText("Host(s)"));
    await userEvent.click(screen.getByRole("option", { name: /Alice Test/ }));
    expect(
      screen.getByRole<HTMLInputElement>("checkbox", {
        name: /Looking for a co-host/,
      }).checked
    ).toBe(false);
  });

  it("offers no co-host request without a host", async () => {
    setup(undefined);

    await userEvent.click(screen.getByRole("button", { name: "Remove Mia" }));

    expect(screen.queryByLabelText(/Looking for a co-host/)).toBeNull();
  });

  it("only offers the event's guests as hosts", async () => {
    setup(undefined);

    await userEvent.click(screen.getByLabelText("Host(s)"));

    expect(
      screen.getAllByRole("option").map((o) => o.textContent)
    ).not.toContain("Gone Host");
  });

  it("lists every problem the server found and jumps to the field of one", async () => {
    const { calls } = setup(undefined, {
      handler: () =>
        Response.json(
          {
            type: "x",
            title: "x",
            status: 400,
            code: "validation.failed",
            errors: [{ path: "title", message: "Title is required" }],
          },
          { status: 400 }
        ),
    });

    await userEvent.type(screen.getByLabelText(/Title/), "A");
    await userEvent.click(submit());

    const summary = await screen.findByText(/There is a problem to fix/);
    expect(summary).toBeTruthy();
    expect(calls).toHaveLength(1);
    (document.activeElement as HTMLElement).blur();
    const jump = screen
      .getAllByRole("button", { name: "Title is required" })
      .at(0)!;
    await userEvent.click(jump);
    expect(document.activeElement).toBe(screen.getByLabelText(/Title/));
  });

  it("refuses a blank title before sending anything", async () => {
    const { calls } = setup(undefined);

    await userEvent.type(screen.getByLabelText(/Title/), "   ");
    await userEvent.click(submit());

    expect(calls).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: "Title is required" })
    ).toBeTruthy();
  });

  it("tells a refusal's reason and keeps what was typed", async () => {
    setup(undefined, { handler: () => problem(403, "event.proposalsClosed") });

    await userEvent.type(screen.getByLabelText(/Title/), "Late idea");
    await userEvent.click(submit());

    expect(await screen.findByText(/The proposal phase is over/)).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      "Late idea"
    );
  });

  it("says a save might not have happened, and a repeat carries the same key", async () => {
    let answer = 503;
    const { calls, onDone } = setup(undefined, {
      handler: () =>
        answer === 503 ? new Response(null, { status: 503 }) : created.clone(),
    });

    await userEvent.type(screen.getByLabelText(/Title/), "A");
    await userEvent.click(submit());
    expect(await screen.findByText(/might not have been saved/)).toBeTruthy();
    answer = 201;
    await userEvent.click(submit());

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(calls[0].key).toBe(calls[1].key);
  });

  it("asks who you are when nobody is chosen", () => {
    setup(undefined, { patch: { me: null } });

    expect(screen.getByText(/select who you are/)).toBeTruthy();
    expect(screen.queryByLabelText(/Title/)).toBeNull();
  });
});

describe("editing a proposal", { tags: ["004-US2"] }, () => {
  it("fills the form in and replaces the proposal from the version it loaded", async () => {
    const { calls, onDone, update } = setup("p");
    expect(
      screen.getByRole("heading", { name: "Edit Session Proposal" })
    ).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      "Rust intro"
    );
    expect(
      screen.getByRole<HTMLInputElement>("radio", { name: "50 minutes" })
        .checked
    ).toBe(true);

    update({ proposals: [{ ...existing, version: 5, title: "Newer" }] });
    await userEvent.type(screen.getByLabelText(/Title/), "!");
    await userEvent.click(submit());

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/proposals/p",
      body: { title: "Rust intro!", expectedVersion: 4, hostIds: ["mia"] },
    });
  });

  it("says someone else changed it on a version conflict", async () => {
    setup("p", { handler: () => problem(409, "proposal.versionConflict") });

    await userEvent.click(submit());

    expect(await screen.findByText(/Someone else changed this/)).toBeTruthy();
  });

  it("links to the sessions already made from it", () => {
    setup("p", {
      patch: {
        sessions: fixture.sessions.map((s) =>
          s.id === "s" ? { ...s, proposalId: "p" } : s
        ),
      },
    });

    const link = screen.getByRole("link", { name: /Monday 09:00 in Room/ });
    expect(link.getAttribute("href")).toBe("/conf?viewSession=s");
    expect(
      screen.getByText(/Changes here do not reach the schedule/)
    ).toBeTruthy();
  });

  it("is for the hosts only", () => {
    setup("p", { patch: { me: { ...base.me!, guestId: "bob" } } });

    expect(
      screen.getByText(/Only a host of this proposal can edit it/)
    ).toBeTruthy();
    expect(screen.queryByLabelText(/Title/)).toBeNull();
  });

  it("is open to anyone while nobody hosts it", () => {
    setup("p", {
      patch: {
        proposals: [{ ...existing, hosts: [] }],
        me: { ...base.me!, guestId: "bob" },
      },
    });

    expect(screen.getByLabelText(/Title/)).toBeTruthy();
  });

  it("says when the proposal is gone", () => {
    setup("nope");

    expect(screen.getByText(/Proposal not found/)).toBeTruthy();
  });
});

describe("deleting a proposal", { tags: ["004-US3"] }, () => {
  it("deletes after a confirmation", async () => {
    const { calls, onDone } = setup("p", {
      handler: () => new Response(null, { status: 204 }),
    });

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText("Delete session proposal?")).toBeTruthy();
    await userEvent.click(
      screen.getAllByRole("button", { name: "Delete" }).at(-1)!
    );

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "DELETE",
      path: "/api/v1/proposals/p",
    });
  });

  it("shows a refused deletion even after an earlier failed save", async () => {
    let calls = 0;
    setup("p", {
      handler: () =>
        calls++ === 0
          ? problem(409, "proposal.versionConflict")
          : problem(403, "proposal.notHost"),
    });

    await userEvent.click(submit());
    await screen.findByText(/Someone else changed this/);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[1]);

    expect(
      await screen.findByText(/Only a host of this proposal can change it/)
    ).toBeTruthy();
    expect(screen.queryByText(/Someone else changed this/)).toBeNull();
  });

  it("clears a field's problem once it is fixed", async () => {
    setup(undefined);
    await userEvent.type(screen.getByLabelText(/Title/), "   ");
    await userEvent.click(submit());
    expect(
      screen.getByRole("button", { name: "Title is required" })
    ).toBeTruthy();

    await userEvent.type(screen.getByLabelText(/Title/), "Real");

    expect(
      screen.queryByRole("button", { name: "Title is required" })
    ).toBeNull();
  });

  it("keeps the proposal when the deletion is cancelled or refused", async () => {
    const { calls, onDone } = setup("p", {
      handler: () => problem(403, "proposal.notHost"),
    });

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(calls).toHaveLength(0);

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[1]);

    expect(
      await screen.findByText(/Only a host of this proposal can change it/)
    ).toBeTruthy();
    expect(onDone).not.toHaveBeenCalled();
  });
});
