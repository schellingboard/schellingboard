import type { StatsTable } from "@schellingboard/contracts/stats";
import { histogram, median } from "@schellingboard/domain/stats/binning";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import {
  applyFilter,
  type StatsFilterInput,
} from "@schellingboard/domain/stats/filter";
import { pseudonymize } from "@schellingboard/domain/stats/pseudonyms";
import { DateTime } from "luxon";
import { col, doublingEdges, percent } from "./cells";

const MINUTE = 60_000;

type Meeting = EventFacts["meetings"][number];

const STATUSES = ["Accepted", "Declined", "Canceled", "Pending", "Expired"];

function statusOf(meeting: Meeting, now: Date) {
  if (meeting.status !== "pending")
    return meeting.status[0].toUpperCase() + meeting.status.slice(1);
  return new Date(meeting.slotStart).getTime() <= now.getTime()
    ? "Expired"
    : "Pending";
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
    title: "Availability for 1-on-1s",
    columns: [
      col("figure", "Figure", "text"),
      col("value", "Value", "integer"),
      col("share", "Share of members", "percent"),
    ],
    rows: [
      ["Members", people.size, 100],
      [
        "Members with availability",
        offered.length,
        percent(offered.length, people.size),
      ],
      ["Slots offered", slotsOffered, null],
    ],
  };

  const slots: StatsTable = {
    id: "meetings-slots",
    title: "Slots offered per person",
    columns: [
      col("from", "Slots, from", "integer"),
      col("to", "Slots, up to", "integer"),
      col("people", "People", "integer"),
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
    title: "Requests by status",
    columns: [
      col("status", "Status", "text"),
      col("requests", "Requests", "integer"),
      col("share", "Share of requests", "percent"),
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
    title: "People in 1-on-1 requests",
    columns: [
      col("figure", "Figure", "text"),
      col("people", "People", "integer"),
      col("share", "Share of members", "percent"),
    ],
    rows:
      meetings.length === 0
        ? []
        : (
            [
              ["Requested", requesters],
              ["Asked", recipients],
              ["With an accepted meeting", meeters],
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
    title: "1-on-1 requests per person",
    columns: [
      col("person", "Person", "text"),
      col("sent", "Requests sent", "integer"),
      col("received", "Requests received", "integer"),
      col("accepted", "Accepted meetings", "integer"),
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
    title: "Response time (a later cancel hides the response)",
    columns: [
      col("outcome", "Outcome", "text"),
      col("requests", "Requests", "integer"),
      col("median", "Median response time", "minutes"),
    ],
    rows:
      answered(["accepted", "declined"]).length === 0
        ? []
        : [
            responseRow("Accepted", answered(["accepted"])),
            responseRow("Declined", answered(["declined"])),
            responseRow(
              "Accepted and declined",
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
    title: "Accepted meetings by day and hour",
    columns: [
      col("day", "Day", "text"),
      col("hour", "Hour", "text"),
      col("meetings", "Meetings", "integer"),
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
    title: "Meeting points",
    columns: [
      col("point", "Meeting point", "text"),
      col("requests", "Requests", "integer"),
      col("share", "Share of requests", "percent"),
    ],
    rows:
      meetings.length === 0
        ? []
        : [
            ...pointNames.map((name) => {
              const n = uses.get(keyOf(name))!;
              return [name, n, percent(n, meetings.length)];
            }),
            ["Other", other, percent(other, meetings.length)],
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
