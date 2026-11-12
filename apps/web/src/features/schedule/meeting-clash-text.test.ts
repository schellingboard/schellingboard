import type { MeetingClash } from "@schellingboard/domain/meeting-clash-text";
import { describe, expect, it } from "vitest";

import { slotClashText, timeClashSentences } from "./meeting-clash-text";

const clash = (over: Partial<MeetingClash>): MeetingClash => ({
  guestName: "Yuki",
  kind: "busy",
  title: null,
  isViewer: false,
  ...over,
});

describe("clashSentences", () => {
  it("says each distinct clash once", () => {
    expect(
      timeClashSentences([
        clash({}),
        clash({}),
        clash({ isViewer: true, kind: "hosting", title: "Their talk" }),
        clash({ isViewer: true, kind: "attending", title: "Rust" }),
        clash({ isViewer: true, kind: "meeting" }),
        clash({ isViewer: true }),
      ])
    ).toEqual([
      "Yuki is already booked during this time.",
      "You are hosting Their talk during this time.",
      "You are attending Rust during this time.",
      "You have another 1-on-1 during this time.",
      "You are busy during this time.",
    ]);
  });

  it("names the slot for a meeting already in the schedule", () => {
    expect(
      slotClashText([
        clash({ isViewer: true, kind: "meeting" }),
        clash({ isViewer: true }),
      ])
    ).toBe(
      "You have another 1-on-1 during this slot. You are busy during this slot."
    );
  });
});
