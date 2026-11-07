import type { StatsTable } from "@schellingboard/contracts/stats";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import {
  applyFilter,
  type StatsFilterInput,
} from "@schellingboard/domain/stats/filter";
import type { EmailSettings } from "@schellingboard/domain/guest";
import { col, percent } from "./cells";

const SETTINGS: [keyof EmailSettings, string, string][] = [
  ["rsvpChange", "RSVP changes", "RSVP changes"],
  ["hostChange", "Changes to my sessions", "Changes to my sessions"],
  ["cohostAdd", "Added as co-host", "Added as co-host"],
  ["proposalJoin", "Someone joins my proposal", "Someone joins my proposal"],
  ["proposalComment", "Comment on my proposal", "Comment on a proposal"],
  ["sessionComment", "Comment on my session", "Comment on a session"],
  ["profileComment", "Comment on my profile", "Comment on a profile"],
  ["commentThread", "Replies in a thread", "Replies in a thread"],
  ["meetingRequest", "1-on-1 request", "1-on-1 request"],
  ["meetingResponse", "1-on-1 response", "1-on-1 response"],
  [
    "sessionHeadsUp",
    "Heads-up before my session",
    "Heads-up before my session",
  ],
  [
    "attendeeCountReminder",
    "Attendee count reminder",
    "Attendee count reminder",
  ],
];

export function notificationTables(
  facts: EventFacts,
  filter: StatsFilterInput
): StatsTable[] {
  const { people } = applyFilter(facts, filter);
  if (facts.members.length === 0) return [];
  const settings = facts.emailSettings.filter((s) => people.has(s.guestId));

  const email: StatsTable = {
    id: "notifications-email",
    title: "Members with each email notification on",
    columns: [
      col("setting", "Notification", "text"),
      col("members", "Members", "integer"),
      col("share", "Share of members", "percent"),
    ],
    rows: [
      ...SETTINGS.map(([key, label]) => {
        const n = settings.filter((s) => s.on.includes(key)).length;
        return [label, n, percent(n, people.size)];
      }),
      (() => {
        const n = settings.filter((s) => !s.hasEmail).length;
        return ["Members without an email address", n, percent(n, people.size)];
      })(),
    ],
  };

  const pushed = facts.pushGuestIds.filter((id) => people.has(id)).length;
  const push: StatsTable = {
    id: "notifications-push",
    title: "Push notifications",
    columns: [
      col("figure", "Figure", "text"),
      col("members", "Members", "integer"),
      col("share", "Share of members", "percent"),
    ],
    rows: [["Members with push", pushed, percent(pushed, people.size)]],
  };

  const sent = facts.notifications.filter((n) => people.has(n.guestId));
  const inApp: StatsTable = {
    id: "notifications-inapp",
    title: "In-app notifications read (a deleted unread one is not counted)",
    columns: [
      col("type", "Notification", "text"),
      col("sent", "Sent", "integer"),
      col("read", "Read", "integer"),
      col("share", "Share read", "percent"),
    ],
    rows: SETTINGS.flatMap(([key, , label]) => {
      const mine = sent.filter((n) => n.type === key);
      const read = mine.filter((n) => n.read).length;
      return mine.length === 0
        ? []
        : [[label, mine.length, read, percent(read, mine.length)]];
    }),
  };

  return [email, push, inApp];
}
