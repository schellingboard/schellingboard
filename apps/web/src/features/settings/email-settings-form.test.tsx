import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { settingsCalls } from "../../commands/settings";
import { NoticeProvider } from "../../ui/notices";
import { EmailSettingsForm } from "./email-settings-form";

afterEach(cleanup);

const initial = {
  rsvpChange: true,
  hostChange: true,
  cohostAdd: true,
  proposalJoin: true,
  proposalComment: true,
  sessionComment: true,
  profileComment: true,
  commentThread: false,
  meetingRequest: true,
  meetingResponse: true,
  sessionHeadsUp: true,
  attendeeCountReminder: true,
};

function setup(
  handler: FakeHandler = () => new Response(null, { status: 204 })
) {
  const { api, calls } = fakeApi(handler);
  render(
    <NoticeProvider>
      <EmailSettingsForm initial={initial} calls={settingsCalls(api)} />
    </NoticeProvider>
  );
  return calls;
}

describe("email settings", { tags: ["013-US5"] }, () => {
  it("shows what is stored, saves the changes and confirms until edited again", async () => {
    const calls = setup();
    const rsvp = screen.getByLabelText(/RSVP.d to changes time or location/);
    expect((rsvp as HTMLInputElement).checked).toBe(true);
    expect(
      screen.getByLabelText<HTMLInputElement>(/I.ve commented on/).checked
    ).toBe(false);

    await userEvent.click(rsvp);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("status")).toHaveProperty(
      "textContent",
      "Saved"
    );
    expect(calls[0]).toMatchObject({
      method: "PUT",
      path: "/api/v1/me/email-settings",
      body: { ...initial, rsvpChange: false },
    });

    await userEvent.click(screen.getByLabelText(/hosting changes time/));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("says what the server refused", async () => {
    setup(() => problem(403, "guest.unselected"));

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect((await screen.findByRole("alert")).textContent).toMatch(/^Error: /);
    expect(screen.queryByRole("status")).toBeNull();
  });
});
