import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { adminGuestCalls } from "../../commands/admin-guests";
import { fakeApi, problem, type FakeCall } from "../../commands/fake-api";
import type { AdminGuest } from "../../queries/admin-guests";
import { NoticeProvider } from "../../ui/notices";
import { AdminGuestsScreen } from "./guests-screen";
import type { ParamUpdates } from "./list-paging";

afterEach(cleanup);

const guest = (
  id: string,
  name: string,
  extra: Partial<AdminGuest> = {}
): AdminGuest => ({
  id,
  name,
  email: `${id}@x.org`,
  eventIds: [],
  siteAdmin: false,
  version: 3,
  ...extra,
});

const events = [{ id: "e1", name: "Conference Alpha" }];

const problemWith = (status: number, code: string, errors: unknown[]) =>
  Response.json(
    { type: "about:blank", title: code, status, code, errors },
    { status, headers: { "content-type": "application/problem+json" } }
  );

const setup = (
  guests: AdminGuest[],
  {
    query = "",
    handler = () => Response.json(guest("g9", "Saved")),
  }: { query?: string; handler?: (call: FakeCall) => Response } = {}
) => {
  const { api, calls } = fakeApi(handler);
  const onChanged = vi.fn();
  const onParams = vi.fn<(u: ParamUpdates, o: { push: boolean }) => void>();
  render(
    <NoticeProvider>
      <AdminGuestsScreen
        status="ready"
        guests={guests}
        events={events}
        params={new URLSearchParams(query)}
        onParams={onParams}
        calls={adminGuestCalls(api)}
        onChanged={onChanged}
      />
    </NoticeProvider>
  );
  return {
    calls,
    onChanged,
    onParams,
    region: screen.getByRole("region", { name: "Users" }),
  };
};

describe("the admin users screen", { tags: ["016-US1"] }, () => {
  it("lists users by name with their events and an import link", () => {
    const { region } = setup([
      guest("g2", "bob"),
      guest("g1", "Alice", { eventIds: ["e1"] }),
    ]);

    const [alice, bob] = within(region).getAllByRole("listitem");
    expect(alice.textContent).toContain("Alice");
    expect(
      within(alice)
        .getByRole("link", { name: "Conference Alpha" })
        .getAttribute("href")
    ).toBe("/admin/events/e1");
    expect(bob.textContent).toContain("bob");
    expect(
      screen.getByRole("link", { name: "Import CSV" }).getAttribute("href")
    ).toBe("/admin/users/import");
  });

  it("searches name and email", () => {
    const { region } = setup([guest("g1", "Alice"), guest("g2", "Bob")], {
      query: "q=G2%40X",
    });

    expect(within(region).queryByText("Alice")).toBeNull();
    expect(within(region).getByText("Bob")).toBeTruthy();
  });

  it("adds a user and reports a taken email on its field", async () => {
    const { region, calls, onChanged } = setup([], {
      handler: (call) =>
        call.body && (call.body as { email: string }).email === "taken@x.org"
          ? problemWith(409, "guest.emailTaken", [
              {
                path: "email",
                message: "A user with this email already exists",
              },
            ])
          : Response.json(guest("g9", "Zed"), { status: 201 }),
    });

    await userEvent.type(within(region).getByLabelText("Name"), "Zed");
    await userEvent.type(within(region).getByLabelText("Email"), "taken@x.org");
    await userEvent.click(
      within(region).getByRole("button", { name: "Add user" })
    );
    expect(
      (
        await within(region).findAllByText(
          "A user with this email already exists"
        )
      ).length
    ).toBeGreaterThan(0);

    const email = within(region).getByLabelText("Email");
    await userEvent.clear(email);
    await userEvent.type(email, "zed@x.org");
    await userEvent.click(
      within(region).getByRole("button", { name: "Add user" })
    );

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[1]).toMatchObject({
      method: "POST",
      path: "/api/v1/admin/guests",
      body: { name: "Zed", email: "zed@x.org" },
    });
    expect(within(region).getByLabelText<HTMLInputElement>("Name").value).toBe(
      ""
    );
  });

  it("saves an edit against the version shown", async () => {
    const { region, calls, onChanged } = setup([guest("g1", "Alice")]);

    await userEvent.click(within(region).getByRole("button", { name: "Edit" }));
    const name = within(region).getAllByLabelText("Name").at(-1)!;
    await userEvent.clear(name);
    await userEvent.type(name, "Alice B");
    await userEvent.click(within(region).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/admin/guests/g1",
      body: { name: "Alice B", email: "g1@x.org", expectedVersion: 3 },
    });
  });

  it("says when someone else changed the user", async () => {
    const { region, onChanged } = setup([guest("g1", "Alice")], {
      handler: () => problem(409, "guest.versionConflict"),
    });

    await userEvent.click(within(region).getByRole("button", { name: "Edit" }));
    await userEvent.click(within(region).getByRole("button", { name: "Save" }));

    expect(
      await within(region).findByText(/Someone else changed this/)
    ).toBeTruthy();
    expect(onChanged).toHaveBeenCalled();
  });

  it("deletes after a confirmation that can be cancelled", async () => {
    const { region, calls, onChanged } = setup([guest("g1", "Alice")], {
      handler: () => new Response(null, { status: 204 }),
    });

    await userEvent.click(
      within(region).getByRole("button", { name: "Delete" })
    );
    expect(within(region).getByText("Delete this user?")).toBeTruthy();
    await userEvent.click(
      within(region).getByRole("button", { name: "Cancel" })
    );
    expect(calls).toHaveLength(0);

    await userEvent.click(
      within(region).getByRole("button", { name: "Delete" })
    );
    await userEvent.click(
      within(region).getByRole("button", { name: "Confirm delete" })
    );

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "DELETE",
      path: "/api/v1/admin/guests/g1",
    });
  });

  it("sends a test email and says so", async () => {
    const { region, calls } = setup([guest("g1", "Alice")], {
      handler: () => new Response(null, { status: 204 }),
    });

    await userEvent.click(
      within(region).getByRole("button", { name: "Send test email" })
    );

    expect(await within(region).findByText("Sent!")).toBeTruthy();
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/admin/guests/g1/test-email",
    });
  });

  it("reports a test email that failed", async () => {
    const { region } = setup([guest("g1", "Alice")], {
      handler: () =>
        Response.json(
          {
            type: "about:blank",
            title: "x",
            status: 503,
            code: "mail.failed",
            detail: "Failed to send test email: connection refused",
          },
          {
            status: 503,
            headers: { "content-type": "application/problem+json" },
          }
        ),
    });

    await userEvent.click(
      within(region).getByRole("button", { name: "Send test email" })
    );

    expect((await within(region).findByRole("alert")).textContent).toContain(
      "connection refused"
    );
  });
});

describe("the site-admin role", { tags: ["016-US4"] }, () => {
  it("grants the role to a user", async () => {
    const { calls, region, onChanged } = setup([guest("g1", "Alice")]);

    await userEvent.click(
      within(region).getByRole("button", { name: "Make site admin" })
    );

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/admin/guests/g1/site-admin",
      body: { siteAdmin: true },
    });
  });

  it("marks a site admin and revokes the role", async () => {
    const { calls, region } = setup([
      guest("g1", "Alice", { siteAdmin: true }),
    ]);

    expect(within(region).getByText("Site admin")).toBeTruthy();
    await userEvent.click(
      within(region).getByRole("button", { name: "Remove site admin" })
    );

    await waitFor(() =>
      expect(calls[0]).toMatchObject({ body: { siteAdmin: false } })
    );
  });

  it("says why the last site admin cannot be removed", async () => {
    const { region } = setup([guest("g1", "Alice", { siteAdmin: true })], {
      handler: () =>
        problem(
          409,
          "siteAdmin.last",
          "This is the last site admin — make someone else one first"
        ),
    });

    await userEvent.click(
      within(region).getByRole("button", { name: "Remove site admin" })
    );

    expect((await within(region).findByRole("alert")).textContent).toContain(
      "last site admin"
    );
  });
});
