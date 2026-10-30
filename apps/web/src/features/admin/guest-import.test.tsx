import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { adminGuestCalls } from "../../commands/admin-guests";
import { fakeApi, type FakeCall } from "../../commands/fake-api";
import { NoticeProvider } from "../../ui/notices";
import { UserImportScreen } from "./guest-import";

afterEach(cleanup);

const events = [{ id: "e1", name: "Conference Alpha" }];

const setup = (handler: (call: FakeCall) => Response) => {
  const { api, calls } = fakeApi(handler);
  render(
    <NoticeProvider>
      <UserImportScreen events={events} calls={adminGuestCalls(api)} />
    </NoticeProvider>
  );
  return { calls };
};

const csvFile = (text: string) =>
  new File([text], "users.csv", { type: "text/csv" });

describe("the user import screen", { tags: ["016-US2", "016-US3"] }, () => {
  it("imports a file into the chosen events and summarises it", async () => {
    const { calls } = setup(() => Response.json({ created: 1, existing: 2 }));

    await userEvent.upload(
      screen.getByLabelText("CSV file"),
      csvFile("name,email\nA,a@x.org\n")
    );
    await userEvent.click(screen.getByLabelText("Assign to events"));
    await userEvent.click(
      await screen.findByRole("option", { name: "Conference Alpha" })
    );
    await userEvent.click(screen.getByRole("button", { name: "Import" }));

    const summary = await screen.findByRole("status");
    expect(summary.textContent).toContain("1 user created");
    expect(summary.textContent).toContain("2 users already existed");
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/admin/guests/import",
      body: { csv: "name,email\nA,a@x.org\n", eventIds: ["e1"] },
    });
  });

  it("lists every problem of a refused file", async () => {
    setup(() =>
      Response.json(
        {
          type: "about:blank",
          title: "t",
          status: 400,
          code: "guestImport.invalid",
          detail: "Invalid CSV file",
          errors: [
            { path: "csv", message: "Line 2: invalid email not-an-email" },
            { path: "csv", message: "Line 3: name is empty" },
          ],
        },
        {
          status: 400,
          headers: { "content-type": "application/problem+json" },
        }
      )
    );

    await userEvent.upload(
      screen.getByLabelText("CSV file"),
      csvFile("name,email\nBroken,not-an-email\n")
    );
    await userEvent.click(screen.getByRole("button", { name: "Import" }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Invalid CSV file");
    expect(alert.textContent).toContain("Line 2: invalid email not-an-email");
    expect(alert.textContent).toContain("Line 3: name is empty");
  });

  it("cannot import before a file is chosen", () => {
    setup(() => Response.json({ created: 0, existing: 0 }));

    expect(
      screen.getByRole("button", { name: "Import" }).hasAttribute("disabled")
    ).toBe(true);
  });
});
