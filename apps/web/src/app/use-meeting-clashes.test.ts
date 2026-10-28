import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi } from "../commands/fake-api";
import { snapshot } from "../replica/snapshot-fixture";
import { createReplicaStore } from "../replica/store";
import { useMeetingClashes } from "./use-meeting-clashes";

afterEach(() => vi.useRealTimers());

const withMeeting = {
  ...snapshot,
  me: {
    ...snapshot.me!,
    meetings: [
      {
        id: "m1",
        eventId: "e",
        requesterId: "kai",
        recipientId: snapshot.me!.guestId,
        slotStart: "2026-06-15T09:00:00.000Z",
        slotEnd: "2026-06-15T09:30:00.000Z",
        meetingPoint: "Bar",
        message: "",
        cancelNote: "",
        status: "pending" as const,
        createdAt: "2026-06-01T00:00:00.000Z",
        respondedAt: null,
      },
    ],
  },
};
const clash = { guestName: "Mia", kind: "busy", title: null, isViewer: false };
const server = () =>
  fakeApi(() =>
    Response.json({
      meetings: [{ id: "m1", clashes: [clash] }],
      availability: [],
    })
  );

describe("the clashes hook", { tags: ["012-US5"] }, () => {
  it("fetches for a viewer with meetings, not for one without", async () => {
    vi.useFakeTimers();
    const { api, calls } = server();
    renderHook(() => useMeetingClashes(api, createReplicaStore(snapshot)));
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(calls).toHaveLength(0);

    const { result } = renderHook(() =>
      useMeetingClashes(api, createReplicaStore(withMeeting))
    );
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(calls).toHaveLength(1);
    expect(result.current.get("m1")).toEqual([clash]);
  });

  it("fetches again when another guest RSVPs", async () => {
    vi.useFakeTimers();
    const { api, calls } = server();
    const store = createReplicaStore(withMeeting);
    renderHook(() => useMeetingClashes(api, store));
    await act(() => vi.advanceTimersByTimeAsync(1000));

    act(() =>
      store.applyMessage({
        seq: withMeeting.seq + 1,
        type: "session.attendanceChanged",
        commandKey: null,
        sessionId: "s",
        numRsvps: 5,
      })
    );
    await act(() => vi.advanceTimersByTimeAsync(1000));

    expect(calls).toHaveLength(2);
  });

  it("does not fetch after it unmounts", async () => {
    vi.useFakeTimers();
    const { api, calls } = server();
    const { unmount } = renderHook(() =>
      useMeetingClashes(api, createReplicaStore(withMeeting))
    );
    unmount();
    await vi.advanceTimersByTimeAsync(1000);
    expect(calls).toHaveLength(0);
  });
});
