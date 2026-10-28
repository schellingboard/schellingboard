import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { meetingRequestCalls } from "../../commands/meeting-request";
import { createMeetingCandidatesQuery } from "../../queries/meeting-candidates";
import { NoticeProvider } from "../../ui/notices";
import { BookMeeting } from "./book-meeting";

afterEach(cleanup);

const person = (id: string, name: string, extra = {}) => ({
  id,
  name,
  pronouns: null,
  basedIn: null,
  avatarUrl: null,
  isHost: false,
  busy: false,
  ...extra,
});

const found = (slotCount = 1) => ({
  eventName: "Camp",
  dayLabel: "Sat 9 May",
  slotLabel: slotCount === 1 ? "09:10 – 09:40" : "09:10 – 10:10",
  slotCount,
  lengths: [
    { slotCount: 1, minutes: 30 },
    { slotCount: 2, minutes: 60 },
  ],
  meetingPoints: [{ id: "m1", name: "Coffee bar", description: "" }],
  yourClashes: [],
  candidates: [
    person("al", "Al", { pronouns: "she/her", isHost: true }),
    person("bo", "Bo", { busy: true }),
  ],
});

function setup(handler?: FakeHandler) {
  const { api, calls } = fakeApi(
    handler ??
      (({ path, method }) =>
        method === "POST"
          ? Response.json({}, { status: 201 })
          : Response.json(
              found(
                new URL(`http://x${path}`).searchParams.get("slotCount") === "2"
                  ? 2
                  : 1
              )
            ))
  );
  const events: string[] = [];
  render(
    <NoticeProvider>
      <BookMeeting
        query={createMeetingCandidatesQuery({
          api,
          eventId: "e1",
          slotStart: "2026-05-09T09:10:00.000Z",
        })}
        calls={meetingRequestCalls(api)}
        profileHref={(id) => `/guests/${id}`}
        onBooked={() => events.push("booked")}
        onClose={() => events.push("closed")}
      />
    </NoticeProvider>
  );
  return { calls, events };
}

describe("booking a 1-on-1 from a slot", { tags: ["012-US6"] }, () => {
  it("lists who is free, then asks the one chosen", async () => {
    const { calls, events } = setup();

    expect(await screen.findByText("Who's free at 09:10?")).toBeTruthy();
    expect(screen.getByText("Session host")).toBeTruthy();
    expect(screen.getByText("Already booked at this time")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Al" }).getAttribute("href")).toBe(
      "/guests/al"
    );

    await userEvent.click(screen.getByRole("button", { name: "Ask Al" }));
    await userEvent.click(screen.getByRole("button", { name: "Coffee bar" }));
    await userEvent.click(screen.getByRole("button", { name: "Send request" }));

    expect(
      await screen.findByText(/Asked Al for 09:10 – 09:40 on Sat 9 May/)
    ).toBeTruthy();
    expect(calls.at(-1)).toMatchObject({
      method: "POST",
      path: "/api/v1/meetings",
      body: {
        eventId: "e1",
        recipientId: "al",
        slotStart: "2026-05-09T09:10:00.000Z",
        slotCount: 1,
        meetingPoint: "Coffee bar",
      },
    });
    expect(events).toEqual(["booked"]);
  });

  it("lists again for another length, and goes back to choose someone else", async () => {
    setup();
    await screen.findByText("Who's free at 09:10?");

    await userEvent.click(screen.getByRole("button", { name: "60 min" }));
    expect(await screen.findByText(/09:10 – 10:10/)).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Ask Bo" }));
    expect(screen.getByText(/Bo is already booked/)).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Someone else" }));
    expect(screen.getByRole("button", { name: "Ask Al" })).toBeTruthy();
  });

  it("names the person and the slot when the request is refused", async () => {
    setup(({ method }) =>
      method === "POST"
        ? problem(409, "meeting.recipientUnavailable")
        : Response.json(found())
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Ask Al" })
    );
    await userEvent.click(screen.getByRole("button", { name: "Coffee bar" }));
    await userEvent.click(screen.getByRole("button", { name: "Send request" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain(
      "Could not ask Al for 09:10 – 09:40 on Sat 9 May."
    );
    expect(alert.textContent).toContain("They are not available at that time");
  });

  it("says when nobody is free, and when the slot is gone", async () => {
    setup(() => Response.json({ ...found(), candidates: [] }));
    expect(
      await screen.findByText("Nobody has marked this time free.")
    ).toBeTruthy();
    cleanup();

    setup(() => problem(404, "meeting.slotUnavailable"));
    await waitFor(() =>
      expect(
        screen.getByText("That slot is no longer open for 1-on-1s.")
      ).toBeTruthy()
    );
  });

  it("does not say it failed when the answer never arrived", async () => {
    setup(({ method }) => {
      if (method === "POST") throw new Error("offline");
      return Response.json(found());
    });
    await userEvent.click(
      await screen.findByRole("button", { name: "Ask Al" })
    );
    await userEvent.click(screen.getByRole("button", { name: "Coffee bar" }));
    await userEvent.click(screen.getByRole("button", { name: "Send request" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Al for 09:10 – 09:40 on Sat 9 May");
    expect(alert.textContent).toContain("might not have been saved");
    expect(alert.textContent).not.toContain("Could not");
  });
});
