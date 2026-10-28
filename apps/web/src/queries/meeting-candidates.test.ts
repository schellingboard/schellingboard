import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createMeetingCandidatesQuery } from "./meeting-candidates";

const found = {
  eventName: "Camp",
  dayLabel: "Sat 9 May",
  slotLabel: "09:10 – 09:40",
  slotCount: 1,
  lengths: [],
  meetingPoints: [],
  yourClashes: [],
  candidates: [],
};

const make = (handler: Parameters<typeof fakeApi>[0]) => {
  const { api, calls } = fakeApi(handler);
  return {
    calls,
    query: createMeetingCandidatesQuery({
      api,
      eventId: "e 1",
      slotStart: "2026-05-09T09:10:00.000Z",
    }),
  };
};

describe("who is free at a slot", { tags: ["012-US6"] }, () => {
  it("asks for the slot and the length", async () => {
    const { query, calls } = make(() => Response.json(found));

    await query.load(2);

    const url = new URL(`http://x${calls[0].path}`);
    expect(url.pathname).toBe("/api/v1/meeting-candidates");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      eventId: "e 1",
      slotStart: "2026-05-09T09:10:00.000Z",
      slotCount: "2",
    });
    expect(query.get()).toEqual({ status: "ready", found });
  });

  it("says the slot is gone on a 404, and failed on anything else", async () => {
    const gone = make(() => problem(404, "meeting.slotUnavailable"));
    await gone.query.load(1);
    expect(gone.query.get().status).toBe("gone");

    const down = make(() => problem(500, "server.error"));
    await down.query.load(1);
    expect(down.query.get().status).toBe("error");
  });

  it("keeps the last answer while another length loads, and drops a stale reply", async () => {
    const replies: ((r: Response) => void)[] = [];
    const { query } = make(
      () => new Promise<Response>((resolve) => replies.push(resolve))
    );
    const first = query.load(1);
    await new Promise((r) => setTimeout(r, 0));
    replies[0](Response.json(found));
    await first;

    const slow = query.load(2);
    const fast = query.load(3);
    await new Promise((r) => setTimeout(r, 0));
    expect(query.get()).toMatchObject({ status: "loading", found });
    replies[2](Response.json({ ...found, slotCount: 3 }));
    await fast;
    replies[1](Response.json({ ...found, slotCount: 2 }));
    await slow;

    expect(query.get().found?.slotCount).toBe(3);
  });
});
