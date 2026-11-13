import type { StatsTable } from "@schellingboard/contracts/stats";
import type { EmailSettings } from "@schellingboard/domain/guest";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import {
  applyFilter,
  type StatsFilterInput,
} from "@schellingboard/domain/stats/filter";
import type { StatsCellId } from "@schellingboard/domain/stats/text";

import { col, percent } from "./cells";

const SETTINGS: [keyof EmailSettings, StatsCellId, StatsCellId][] = [
  ["rsvpChange", "rsvpChange", "rsvpChange"],
  ["hostChange", "hostChange", "hostChange"],
  ["cohostAdd", "cohostAdd", "cohostAdd"],
  ["proposalJoin", "proposalJoin", "proposalJoin"],
  ["proposalComment", "proposalComment", "inAppProposalComment"],
  ["sessionComment", "sessionComment", "inAppSessionComment"],
  ["profileComment", "profileComment", "inAppProfileComment"],
  ["commentThread", "commentThread", "commentThread"],
  ["meetingRequest", "meetingRequest", "meetingRequest"],
  ["meetingResponse", "meetingResponse", "meetingResponse"],
  ["sessionHeadsUp", "sessionHeadsUp", "sessionHeadsUp"],
  ["attendeeCountReminder", "attendeeCountReminder", "attendeeCountReminder"],
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
    titleId: "membersWithEachEmailNotificationOn",
    columns: [
      col("setting", "notification", "label"),
      col("members", "members", "integer"),
      col("share", "shareOfMembers", "percent"),
    ],
    rows: [
      ...SETTINGS.map(([key, label]) => {
        const n = settings.filter((s) => s.on.includes(key)).length;
        return [label, n, percent(n, people.size)];
      }),
      (() => {
        const n = settings.filter((s) => !s.hasEmail).length;
        return ["membersWithoutAnEmailAddress", n, percent(n, people.size)];
      })(),
    ],
  };

  const pushed = facts.pushGuestIds.filter((id) => people.has(id)).length;
  const push: StatsTable = {
    id: "notifications-push",
    titleId: "pushNotifications",
    columns: [
      col("figure", "figure", "label"),
      col("members", "members", "integer"),
      col("share", "shareOfMembers", "percent"),
    ],
    rows: [["membersWithPush", pushed, percent(pushed, people.size)]],
  };

  const sent = facts.notifications.filter((n) => people.has(n.guestId));
  const inApp: StatsTable = {
    id: "notifications-inapp",
    titleId: "inAppNotificationsRead",
    columns: [
      col("type", "notification", "label"),
      col("sent", "sent", "integer"),
      col("read", "read", "integer"),
      col("share", "shareRead", "percent"),
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
