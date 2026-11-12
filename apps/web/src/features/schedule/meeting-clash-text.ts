import { select } from "@lingui/core/macro";
import type { MeetingClash } from "@schellingboard/domain/meeting-clash-text";

/** "slot" is a meeting already in the schedule; "time" is a time someone considers. */
export type ClashContext = "slot" | "time";

function clashSentence(clash: MeetingClash, context: ClashContext): string {
  const { guestName: name, title } = clash;
  if (!clash.isViewer)
    return select(context, {
      slot: `${name} is already booked during this slot.`,
      other: `${name} is already booked during this time.`,
    });
  if (clash.kind === "meeting")
    return select(context, {
      slot: `You have another 1-on-1 during this slot.`,
      other: `You have another 1-on-1 during this time.`,
    });
  if (!title)
    return select(context, {
      slot: `You are busy during this slot.`,
      other: `You are busy during this time.`,
    });
  return clash.kind === "hosting"
    ? select(context, {
        slot: `You are hosting ${title} during this slot.`,
        other: `You are hosting ${title} during this time.`,
      })
    : select(context, {
        slot: `You are attending ${title} during this slot.`,
        other: `You are attending ${title} during this time.`,
      });
}

function clashSentences(
  clashes: MeetingClash[],
  context: ClashContext
): string[] {
  return [...new Set(clashes.map((c) => clashSentence(c, context)))];
}

export const slotClashText = (clashes: MeetingClash[]) =>
  clashSentences(clashes, "slot").join(" ");

export const timeClashSentences = (clashes: MeetingClash[]) =>
  clashSentences(clashes, "time");
