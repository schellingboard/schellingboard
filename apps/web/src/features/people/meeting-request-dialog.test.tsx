import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { meetingRequestCalls } from "../../commands/meeting-request";
import type { ProfileMeetingOption } from "../../queries/profile-activity";
import { NoticeProvider } from "../../ui/notices";
import { MeetingRequestDialog } from "./meeting-request-dialog";

afterEach(cleanup);

const slot = (
  start: string,
  label: string,
  state: "available" | "busy" | "unavailable" = "available"
) => ({
  start,
  label,
  state,
  clashes:
    state === "busy"
      ? [
          {
            guestName: "Cy",
            kind: "hosting" as const,
            title: "Bees",
            isViewer: true,
          },
        ]
      : [],
});

const option: ProfileMeetingOption = {
  eventId: "e1",
  eventName: "Camp",
  meetingPoints: [{ id: "m1", name: "Coffee bar", description: "By the door" }],
  lengths: [
    {
      slotCount: 1,
      minutes: 30,
      days: [
        {
          label: "Sat 9 May",
          slots: [
            slot("2026-05-09T09:10:00Z", "09:10 – 09:40"),
            slot("2026-05-09T09:40:00Z", "09:40 – 10:10", "busy"),
            slot("2026-05-09T10:10:00Z", "10:10 – 10:40", "unavailable"),
          ],
        },
      ],
    },
    {
      slotCount: 2,
      minutes: 60,
      days: [
        {
          label: "Sat 9 May",
          slots: [slot("2026-05-09T09:10:00Z", "09:10 – 10:10")],
        },
      ],
    },
  ],
};

function setup(
  handler: FakeHandler = () => Response.json({}, { status: 201 })
) {
  const { api, calls } = fakeApi(handler);
  let closed = 0;
  render(
    <NoticeProvider>
      <MeetingRequestDialog
        option={option}
        recipientId="al"
        recipientName="Al"
        actions={meetingRequestCalls(api)}
        onClose={() => closed++}
      />
    </NoticeProvider>
  );
  return { calls, closed: () => closed };
}

const send = () => screen.getByRole("button", { name: "Send request" });

describe("asking for a 1-on-1", { tags: ["012-US3"] }, () => {
  it("sends the slot, the length, the place and the line, then confirms", async () => {
    const { calls, closed } = setup();
    expect(
      screen.getByRole("heading", { name: "1-on-1 with Al" })
    ).toBeTruthy();
    expect((send() as HTMLButtonElement).disabled).toBe(true);

    await userEvent.click(screen.getByRole("button", { name: "60 min" }));
    await userEvent.click(screen.getByRole("button", { name: /^09:10/ }));
    await userEvent.click(screen.getByRole("button", { name: "Coffee bar" }));
    expect(screen.getByText("By the door")).toBeTruthy();
    await userEvent.type(
      screen.getByLabelText("Add a line of context (optional)"),
      "Hi"
    );
    await userEvent.click(send());

    expect(
      await screen.findByText(/Asked Al for 09:10 – 10:10 on Sat 9 May/)
    ).toBeTruthy();
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/api/v1/meetings",
      body: {
        eventId: "e1",
        recipientId: "al",
        slotStart: "2026-05-09T09:10:00Z",
        slotCount: 2,
        meetingPoint: "Coffee bar",
        message: "Hi",
      },
    });
    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(closed()).toBe(1);
  });

  it("needs a slot and a place, and cannot pick a slot they are unavailable at", async () => {
    setup();
    const unavailable = screen.getByRole("button", { name: /^10:10/ });
    expect((unavailable as HTMLButtonElement).disabled).toBe(true);

    await userEvent.click(screen.getByRole("button", { name: /^09:10/ }));
    expect((send() as HTMLButtonElement).disabled).toBe(true);
    await userEvent.type(screen.getByLabelText("Where to meet"), "Lobby");
    expect((send() as HTMLButtonElement).disabled).toBe(false);
  });

  it("warns about a clash but still lets them ask", async () => {
    setup();

    await userEvent.click(screen.getByRole("button", { name: /^09:40/ }));

    expect(
      screen.getByText(
        "You are hosting Bees during this time — book it anyway?"
      )
    ).toBeTruthy();
    await userEvent.type(screen.getByLabelText("Where to meet"), "Lobby");
    expect((send() as HTMLButtonElement).disabled).toBe(false);
  });

  it("says why the server refused", async () => {
    const { calls } = setup(() => problem(409, "meeting.recipientUnavailable"));

    await userEvent.click(screen.getByRole("button", { name: /^09:10/ }));
    await userEvent.type(screen.getByLabelText("Where to meet"), "Lobby");
    await userEvent.click(send());

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain(
      "They are not available at that time"
    );
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(send()).toBeTruthy();
  });
});
