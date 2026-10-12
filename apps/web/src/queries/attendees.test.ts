// @module-tag 009-US1
import { describe, expect, it, vi } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { snapshot } from "../replica/snapshot-fixture";
import { attendeeGuests, createAttendeesQuery } from "./attendees";

const rsvps = [
  { id: "r1", sessionId: "s", guestId: "mia" },
  { id: "r2", sessionId: "s", guestId: "gone" },
];

describe("the attendee list", () => {
  it("loads who RSVPed and tells subscribers", async () => {
    const { api, calls } = fakeApi(() => Response.json({ rsvps }));
    const query = createAttendeesQuery({ api, sessionId: "s" });
    let notified = 0;
    query.subscribe(() => notified++);
    expect(query.get()).toEqual({ status: "idle", rsvps: [] });

    await query.refresh();

    expect(calls[0].path).toBe("/api/v1/sessions/s/rsvps");
    expect(query.get()).toEqual({ status: "ready", rsvps });
    expect(notified).toBeGreaterThanOrEqual(2);
  });

  it("keeps the earlier list while it reloads, and reports a failure", async () => {
    let fail = false;
    const { api } = fakeApi(() =>
      fail ? problem(403, "guest.forbidden") : Response.json({ rsvps })
    );
    const query = createAttendeesQuery({ api, sessionId: "s" });
    await query.refresh();

    fail = true;
    const reload = query.refresh();
    expect(query.get()).toMatchObject({ status: "loading", rsvps });
    await reload;

    expect(query.get()).toEqual({
      status: "error",
      code: "guest.forbidden",
      rsvps,
    });
  });

  it("lets the latest refresh win over an older answer", async () => {
    const answers: ((r: Response) => void)[] = [];
    const { api } = fakeApi(
      () => new Promise<Response>((resolve) => answers.push(resolve))
    );
    const query = createAttendeesQuery({ api, sessionId: "s" });
    const first = query.refresh();
    const second = query.refresh();
    await vi.waitFor(() => expect(answers).toHaveLength(2));

    answers[1](Response.json({ rsvps }));
    await second;
    answers[0](Response.json({ rsvps: [] }));
    await first;

    expect(query.get().rsvps).toEqual(rsvps);
  });

  it("names the attendees from the replica's guests, skipping those it does not hold", () => {
    expect(attendeeGuests(rsvps, snapshot.guests).map((g) => g.name)).toEqual([
      "MIA",
    ]);
  });
});
