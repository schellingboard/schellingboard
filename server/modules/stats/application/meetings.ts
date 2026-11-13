import type { StatsTable } from "@schellingboard/contracts/stats";
import { histogram, median } from "@schellingboard/domain/stats/binning";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import {
  applyFilter,
  type StatsFilterInput,
} from "@schellingboard/domain/stats/filter";
import { pseudonymize } from "@schellingboard/domain/stats/pseudonyms";
import { statsRef } from "@schellingboard/domain/stats/text";
import { DateTime } from "luxon";

import { col, doublingEdges, percent } from "./cells";

const MINUTE = 60_000;

type Meeting = EventFacts["meetings"][number];

const STATUSES = ["accepted", "declined", "canceled", "pending", "expired"];

function statusOf(meeting: Meeting, now: Date) {
  if (meeting.status !== "pending") return meeting.status;
  return new Date(meeting.slotStart).getTime() <= now.getTime()
    ? "expired"
    : "pending";
}

const minutesBetween = (from: string, to: string) =>
  (new Date(to).getTime() - new Date(from).getTime()) / MINUTE;

export function meetingTables(
  facts: EventFacts,
  filter: StatsFilterInput,
  now: Date
): StatsTable[] {
  const { people } = applyFilter(facts, filter);
  const meetings = facts.meetings.filter(
    (m) => people.has(m.requesterId) && people.has(m.recipientId)
  );
  const offered = facts.meetingSlotCounts.filter((c) => people.has(c.guestId));
  const used =
    facts.meetingsEnabled || offered.length > 0 || meetings.length > 0;

  if (!used) return [];

  const slotsOffered = offered.reduce((sum, c) => sum + c.slots, 0);
  const adoption: StatsTable = {
    id: "meetings-adoption",
    titleId: "availabilityForOneOnOnes",
    columns: [
      col("figure", "figure", "label"),
      col("value", "value", "integer"),
      col("share", "shareOfMembers", "percent"),
    ],
    rows: [
      ["members", people.size, 100],
      [
        "membersWithAvailability",
        offered.length,
        percent(offered.length, people.size),
      ],
      ["slotsOffered", slotsOffered, null],
    ],
  };

  const slots: StatsTable = {
    id: "meetings-slots",
    titleId: "slotsOfferedPerPerson",
    columns: [
      col("from", "slotsFrom", "integer"),
      col("to", "slotsUpTo", "integer"),
      col("people", "people", "integer"),
    ],
    rows:
      offered.length === 0
        ? []
        : histogram(
            offered.map((c) => c.slots),
            doublingEdges(Math.max(...offered.map((c) => c.slots)))
          ).map((b) => [b.from, b.to, b.count]),
  };

  const statuses = meetings.map((m) => statusOf(m, now));
  const status: StatsTable = {
    id: "meetings-status",
    titleId: "requestsByStatus",
    columns: [
      col("status", "status", "label"),
      col("requests", "requests", "integer"),
      col("share", "shareOfRequests", "percent"),
    ],
    rows: (meetings.length === 0 ? [] : STATUSES).map((name) => {
      const n = statuses.filter((s) => s === name).length;
      return [name, n, percent(n, meetings.length)];
    }),
  };

  const requesters = new Set(meetings.map((m) => m.requesterId));
  const recipients = new Set(meetings.map((m) => m.recipientId));
  const accepted = meetings.filter((m) => m.status === "accepted");
  const meeters = new Set(
    accepted.flatMap((m) => [m.requesterId, m.recipientId])
  );
  const peopleTable: StatsTable = {
    id: "meetings-people",
    titleId: "peopleInOneOnOneRequests",
    columns: [
      col("figure", "figure", "label"),
      col("people", "people", "integer"),
      col("share", "shareOfMembers", "percent"),
    ],
    rows:
      meetings.length === 0
        ? []
        : (
            [
              ["requested", requesters],
              ["asked", recipients],
              ["withAnAcceptedMeeting", meeters],
            ] as const
          ).map(([label, set]) => [
            label,
            set.size,
            percent(set.size, people.size),
          ]),
  };

  const tally = new Map<string, [number, number, number]>();
  const of = (id: string) => {
    const t = tally.get(id) ?? [0, 0, 0];
    tally.set(id, t);
    return t;
  };
  for (const m of meetings) {
    of(m.requesterId)[0]++;
    of(m.recipientId)[1]++;
    if (m.status === "accepted") {
      of(m.requesterId)[2]++;
      of(m.recipientId)[2]++;
    }
  }
  const perPerson: StatsTable = {
    id: "meetings-per-person",
    titleId: "oneOnOneRequestsPerPerson",
    columns: [
      col("person", "person", "text"),
      col("sent", "requestsSent", "integer"),
      col("received", "requestsReceived", "integer"),
      col("accepted", "acceptedMeetings", "integer"),
    ],
    rows: pseudonymize([...tally.values()]).map(({ pseudonym, values }) => [
      pseudonym,
      ...values,
    ]),
  };

  const answered = (statuses: string[]) =>
    meetings
      .filter((m) => statuses.includes(m.status) && m.respondedAt !== null)
      .map((m) => minutesBetween(m.createdAt, m.respondedAt!));
  const responseRow = (label: string, times: number[]) => [
    label,
    times.length,
    median(times),
  ];
  const response: StatsTable = {
    id: "meetings-response",
    titleId: "responseTime",
    columns: [
      col("outcome", "outcome", "label"),
      col("requests", "requests", "integer"),
      col("median", "medianResponseTime", "minutes"),
    ],
    rows:
      answered(["accepted", "declined"]).length === 0
        ? []
        : [
            responseRow("accepted", answered(["accepted"])),
            responseRow("declined", answered(["declined"])),
            responseRow(
              "acceptedAndDeclined",
              answered(["accepted", "declined"])
            ),
          ],
  };

  const byHour = new Map<string, number>();
  for (const m of accepted) {
    const start = DateTime.fromISO(m.slotStart, { zone: facts.timezone });
    const key = `${start.toISODate()} ${start.toFormat("HH:00")}`;
    byHour.set(key, (byHour.get(key) ?? 0) + 1);
  }
  const when: StatsTable = {
    id: "meetings-when",
    titleId: "acceptedMeetingsByDayAndHour",
    columns: [
      col("day", "day", "text"),
      col("hour", "hour", "text"),
      col("meetings", "meetings", "integer"),
    ],
    rows: [...byHour]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, n]) => [key.slice(0, 10), key.slice(11), n]),
  };

  const keyOf = (name: string) => name.trim().toLowerCase();
  const pointNames = [
    ...new Map(facts.meetingPoints.map((name) => [keyOf(name), name])).values(),
  ];
  const uses = new Map(pointNames.map((name) => [keyOf(name), 0]));
  let other = 0;
  for (const m of meetings) {
    const key = keyOf(m.meetingPoint);
    if (uses.has(key)) uses.set(key, uses.get(key)! + 1);
    else other++;
  }
  const points: StatsTable = {
    id: "meetings-points",
    titleId: "meetingPoints",
    columns: [
      col("point", "meetingPoint", "label"),
      col("requests", "requests", "integer"),
      col("share", "shareOfRequests", "percent"),
    ],
    rows:
      meetings.length === 0
        ? []
        : [
            ...pointNames.map((name) => {
              const n = uses.get(keyOf(name))!;
              return [
                statsRef("literal", name),
                n,
                percent(n, meetings.length),
              ];
            }),
            ["other", other, percent(other, meetings.length)],
          ],
  };

  return [
    adoption,
    slots,
    status,
    peopleTable,
    perPerson,
    response,
    when,
    points,
  ];
}
