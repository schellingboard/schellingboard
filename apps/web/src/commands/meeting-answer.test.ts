// @module-tag 012-US4
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { describe, expect, it } from "vitest";
import { snapshot as fixture } from "../replica/snapshot-fixture";
import { createReplicaStore } from "../replica/store";
import { fakeApi, problem } from "./fake-api";
import { answerMeeting, cancelMeeting } from "./meeting-answer";
import { createCommandRunner, type CommandFailure } from "./runner";

const meeting = (extra = {}) => ({
  id: "m1",
  eventId: "e",
  requesterId: "kai",
  recipientId: "mia",
  slotStart: "2026-06-03T09:00:00.000Z",
  slotEnd: "2026-06-03T09:30:00.000Z",
  meetingPoint: "Coffee bar",
  message: "",
  cancelNote: "",
  status: "pending" as const,
  createdAt: "2026-06-01T10:00:00.000Z",
  respondedAt: null,
  ...extra,
});

const replica = (extra = {}): Snapshot => ({
  ...fixture,
  me: {
    ...fixture.me!,
    meetings: [meeting(extra)],
    meetingGuests: [
      {
        id: "kai",
        name: "Kai",
        avatarUrl: null,
        aboutMe: null,
        authProtected: false,
        profileVersion: 1,
      },
    ],
  },
});

function setup(snapshot: Snapshot, handler = () => Response.json({})) {
  const { api, calls } = fakeApi(handler);
  const failures: CommandFailure[] = [];
  const runner = createCommandRunner({
    store: createReplicaStore(snapshot),
    api,
    newKey: () => "k",
    onFailure: (f) => failures.push(f),
  });
  return { runner, calls, failures };
}

describe("answering and canceling a 1-on-1", () => {
  it("accepts at once and sends it", async () => {
    const { runner, calls } = setup(replica());

    const pending = runner.run(answerMeeting, {
      meetingId: "m1",
      response: "accept",
    });

    expect(runner.view().me?.meetings[0]?.status).toBe("accepted");
    expect((await pending).ok).toBe(true);
    expect(calls).toMatchObject([
      { method: "POST", path: "/api/v1/meetings/m1/accept", key: "k" },
    ]);
  });

  it("declines", async () => {
    const { runner, calls } = setup(replica());
    await runner.run(answerMeeting, { meetingId: "m1", response: "decline" });
    expect(calls[0]?.path).toBe("/api/v1/meetings/m1/decline");
  });

  it("refuses to answer one that was not asked of you, naming who and when", async () => {
    const { runner, calls, failures } = setup(
      replica({ requesterId: "mia", recipientId: "kai" })
    );

    const outcome = await runner.run(answerMeeting, {
      meetingId: "m1",
      response: "accept",
    });

    expect(outcome).toEqual({ ok: false, code: "meeting.notRecipient" });
    expect(calls).toHaveLength(0);
    expect(failures[0]?.what).toBe(
      "accept the 1-on-1 with Kai (Wed 3 Jun, 09:10 – 09:30)"
    );
  });

  it("cancels with a note", async () => {
    const { runner, calls } = setup(replica({ status: "accepted" }));

    await runner.run(cancelMeeting, { meetingId: "m1", note: "Sorry" });

    expect(runner.view().me?.meetings[0]).toMatchObject({
      status: "canceled",
      cancelNote: "Sorry",
    });
    expect(calls).toMatchObject([
      {
        method: "POST",
        path: "/api/v1/meetings/m1/cancel",
        body: { note: "Sorry" },
      },
    ]);
  });

  it("will not cancel once the slot has begun", async () => {
    const { runner, calls } = setup({
      ...replica({ status: "accepted" }),
      now: "2026-06-03T09:10:00.000Z",
    });
    const outcome = await runner.run(cancelMeeting, {
      meetingId: "m1",
      note: "",
    });
    expect(outcome).toEqual({ ok: false, code: "meeting.started" });
    expect(calls).toHaveLength(0);
  });

  it("reports the server's refusal with the person and the slot", async () => {
    const { runner, failures } = setup(replica(), () =>
      problem(409, "meeting.alreadyAnswered")
    );
    await runner.run(answerMeeting, { meetingId: "m1", response: "accept" });
    expect(failures[0]).toMatchObject({
      code: "meeting.alreadyAnswered",
      what: expect.stringContaining("Kai") as string,
    });
  });
});
