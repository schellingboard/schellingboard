import type { ReactNode } from "react";
import type { StatsTable } from "@schellingboard/contracts/stats";
import {
  BinChart,
  CountBars,
  CountHistogram,
  DayTimeline,
  MeetingsHeatmap,
  PopularProposals,
  PredictedVsReported,
  SupplyDemand,
  TOP_SHOWN,
  TableScatter,
  UtilizationHeatmaps,
  hasPrediction,
  pairs,
  percentLabel,
} from "./stats-charts";

// A figure with `from` charts a table that has its own card, so it offers no
// table view or CSV of its own.
export type Figure = {
  key: string;
  table: string;
  title?: string;
  help: string[];
  chart?: (table: StatsTable) => ReactNode;
  hasChart?: (table: StatsTable) => boolean;
  from?: true;
  tiles?: true;
  wide?: true;
};

const CORRELATION = `ρ is Spearman's rank correlation, from −1 to 1: near 0 means no relation, near 1 that one rises with the other. Below 15 points it is too few to say, and a relation does not show that one caused the other.`;

const PSEUDONYMS =
  "People have no names here: P001, P002… are numbered anew in every table and every request, so rows cannot be matched to a person.";

const VOTE_CHOICES = ["Interested", "Maybe", "Skip"];
const SHARE_EDGES = [0, 20, 40, 60, 80, 100];

const scatter =
  (x: string, y: string) =>
  (table: StatsTable): boolean =>
    pairs(table, x, y).length > 0;

export const FIGURES: Figure[] = [
  {
    key: "overview-headline",
    table: "overview-headline",
    tiles: true,
    wide: true,
    help: [
      "The main counts, after the filter. Members are the people on the event's guest list.",
      "Active members voted, RSVPed, proposed, hosted, commented or offered 1-on-1 times.",
    ],
  },
  {
    key: "overview-funnel",
    table: "overview-funnel",
    help: [
      "How many members took each step. Each bar counts the members who did that, so one member can be in several bars.",
      "A big drop from Members to Active means many people never took part.",
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="step"
        valueKey="members"
        xLabel="Members"
        yLabel="Step"
      />
    ),
  },
  {
    key: "overview-who-did-what",
    table: "overview-who-did-what",
    help: [
      "Members split by whether they voted and whether they RSVPed, with their mean number of RSVPs.",
      "Compare All voters with All other members to see whether voters also take part more in the schedule.",
    ],
  },

  {
    key: "proposals-popular",
    table: "proposals-table",
    from: true,
    wide: true,
    title: "Most popular proposals",
    help: [
      `The ${TOP_SHOWN} proposals with the most "interested" votes, coloured by whether they became a session.`,
      "Every proposal is in the Proposals table.",
    ],
    chart: (table) => <PopularProposals table={table} />,
  },
  {
    key: "proposals-lateness",
    table: "proposals-table",
    from: true,
    title: "Did late proposals get fewer votes?",
    help: [
      "One dot per proposal: the days between the first proposal and this one (across), and the people who voted on it (up).",
      "A falling trend means late proposals had too little time to collect votes: give voting more time next year.",
      CORRELATION,
    ],
    hasChart: scatter("daysIn", "voters"),
    chart: (table) => (
      <TableScatter
        table={table}
        x="daysIn"
        y="voters"
        xLabel="Days after the first proposal"
        yLabel="Voters"
        noun="proposals"
      />
    ),
  },
  {
    key: "proposals-conversion",
    table: "proposals-conversion",
    help: [
      "Proposals in four groups by their interested votes, and the share of each group that became a session.",
      "If the most wanted group is far from 100%, popular proposals were left out of the schedule.",
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="group"
        valueKey="share"
        xLabel="Became a session (%)"
        yLabel="Proposals by interested votes"
        summary="Share that became a session"
        format={percentLabel}
      />
    ),
  },
  {
    key: "proposals-table",
    table: "proposals-table",
    wide: true,
    help: [
      "One row per proposal. Interest share is the interested votes divided by all its votes; rank 1 has the most interested votes.",
      "Became a session is Yes when any session came from it, even one the filter leaves out. Session RSVPs and Reported attendees come from a session the filter keeps.",
    ],
  },
  {
    key: "proposals-unscheduled",
    table: "proposals-unscheduled",
    help: [
      "Proposals in the top quarter by interested votes that never became a session: what people wanted and did not get.",
    ],
  },
  {
    key: "proposals-over-time",
    table: "proposals-over-time",
    help: [
      "Proposals created per day. It shows when the proposal phase was busy, and whether a reminder or a deadline brought a rush.",
    ],
    chart: (table) => (
      <DayTimeline
        table={table}
        valueKey="proposals"
        yLabel="Proposals created"
        summary="Proposals created per day"
      />
    ),
  },
  {
    key: "proposals-votes-per-voter",
    table: "proposals-voters",
    from: true,
    title: "How many proposals did people vote on?",
    help: [
      "How many voters cast how many votes. Bars on the left are people who voted on a few proposals, bars on the right people who voted on many.",
    ],
    chart: (table) => (
      <CountHistogram
        table={table}
        valueKey="total"
        xLabel="Votes per voter"
        yLabel="Voters"
        summary={(n) => `Votes per voter, ${n} voters`}
      />
    ),
  },
  {
    key: "proposals-picky",
    table: "proposals-voters",
    from: true,
    title: "Picky or generous voters?",
    help: [
      `For each voter, the share of their votes that were "interested". Bars on the left are picky voters, bars on the right voters who liked most proposals.`,
    ],
    chart: (table) => (
      <CountHistogram
        table={table}
        valueKey="interestedShare"
        xLabel="Interested votes of a voter (%)"
        yLabel="Voters"
        summary={(n) => `Share interested per voter, ${n} voters`}
        edges={SHARE_EDGES}
      />
    ),
  },
  {
    key: "proposals-voters",
    table: "proposals-voters",
    help: [
      "One row per voter: their votes by choice, and the share of all proposals they voted on.",
      PSEUDONYMS,
    ],
  },
  {
    key: "proposals-choice-mix",
    table: "proposals-choice-mix",
    help: ["All votes by choice: interested, maybe and skip."],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="figure"
        valueKey="value"
        xLabel="Votes"
        yLabel="Choice"
        only={VOTE_CHOICES}
      />
    ),
  },
  {
    key: "proposals-hosts",
    table: "proposals-hosts",
    help: [
      "Who proposed: hosts of proposals, co-hosted proposals, and how many proposals that asked for a co-host found one.",
    ],
  },
  {
    key: "proposals-per-host",
    table: "proposals-per-host",
    help: ["How many hosts made one proposal, two, and so on."],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="proposals"
        valueKey="hosts"
        xLabel="Hosts"
        yLabel="Proposals hosted"
      />
    ),
  },

  {
    key: "sessions-popular",
    table: "sessions-table",
    from: true,
    wide: true,
    title: "Most RSVPed sessions",
    help: [
      `The ${TOP_SHOWN} sessions with the most RSVPs. Every session is in the Sessions table.`,
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="title"
        valueKey="rsvps"
        xLabel="RSVPs"
        yLabel="Session"
        top={TOP_SHOWN}
        summary="Most RSVPed sessions"
      />
    ),
  },
  {
    key: "sessions-reports",
    table: "sessions-reports",
    help: [
      "Read this first: it tells how far to trust every attendance figure. Hosts type in how many people came; this counts the ended sessions with hosts that have such a report.",
      "Rows split it by origin and by day, and by whether the follow-up reminder went out.",
    ],
  },
  {
    key: "sessions-predicted",
    table: "sessions-table",
    from: true,
    title: "Predicted against reported attendance",
    help: [
      "For sessions from proposals with a reported count: the attendance model's prediction from the votes (up) against the count the host reported (across).",
      "Dots are the model's midpoint, thick bars its 50% range, thin bars its 80% range. On the dashed line the prediction was exact.",
      "The model was fitted on one event with 13 sessions: a rough guide, not a forecast.",
    ],
    hasChart: hasPrediction,
    chart: (table) => <PredictedVsReported table={table} />,
  },
  {
    key: "sessions-calibration",
    table: "sessions-calibration",
    title: "How often was the prediction right?",
    help: [
      "How often the reported count fell inside the model's 50% and 80% ranges. A model that fits hits about 50% and 80% of the time.",
      "Below 15 sessions it is too few to say.",
    ],
  },
  {
    key: "sessions-rsvps-attendees",
    table: "sessions-table",
    from: true,
    title: "Did the people who RSVPed come?",
    help: [
      "One dot per session with a reported count: its RSVPs (across) against the people who came (up). Dots low on the chart are sessions that fewer people attended than RSVPed.",
      CORRELATION,
    ],
    hasChart: scatter("rsvps", "reported"),
    chart: (table) => (
      <TableScatter
        table={table}
        x="rsvps"
        y="reported"
        xLabel="RSVPs"
        yLabel="Reported attendees"
        noun="sessions"
      />
    ),
  },
  {
    key: "sessions-interest-rsvps",
    table: "sessions-table",
    from: true,
    title: "Did votes predict RSVPs?",
    help: [
      "One dot per session from a proposal: the proposal's interest share (across) against the session's RSVPs (up).",
      CORRELATION,
    ],
    hasChart: scatter("interest", "rsvps"),
    chart: (table) => (
      <TableScatter
        table={table}
        x="interest"
        y="rsvps"
        xLabel="Proposal interest (%)"
        yLabel="RSVPs"
        noun="sessions"
      />
    ),
  },
  {
    key: "sessions-parallel",
    table: "sessions-table",
    from: true,
    title: "Did parallel sessions take people away?",
    help: [
      "One dot per session: how many other sessions ran at the same time (across) against its RSVPs (up). A falling trend means crowded slots were weaker.",
      CORRELATION,
    ],
    hasChart: scatter("parallel", "rsvps"),
    chart: (table) => (
      <TableScatter
        table={table}
        x="parallel"
        y="rsvps"
        xLabel="Parallel sessions"
        yLabel="RSVPs"
        noun="sessions"
      />
    ),
  },
  {
    key: "sessions-table",
    table: "sessions-table",
    wide: true,
    help: [
      "One row per session. Fill is RSVPs divided by capacity. Attendees per RSVP is the reported count divided by the RSVPs. Parallel sessions counts the others that overlap it.",
      "Origin is worked out from the data: a blocker; else from a proposal; else organizer, when an admin manages it; else spontaneous. A session whose proposal was deleted counts as spontaneous.",
      "The predicted columns come from the attendance model, fitted on one event: treat them as rough.",
    ],
  },
  {
    key: "sessions-origins",
    table: "sessions-origins",
    help: [
      "Sessions by how they came about, with their median RSVPs, attendees and duration.",
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="group"
        valueKey="sessions"
        xLabel="Sessions"
        yLabel="Origin"
      />
    ),
  },
  {
    key: "sessions-by-hour",
    table: "sessions-by-hour",
    help: [
      "Sessions by the hour they started, with their median RSVPs. It shows whether early or late slots drew fewer people.",
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="group"
        valueKey="medianRsvps"
        xLabel="Median RSVPs"
        yLabel="Start hour"
      />
    ),
  },
  {
    key: "sessions-by-day",
    table: "sessions-by-day",
    help: ["Sessions per day, with their median RSVPs."],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="group"
        valueKey="medianRsvps"
        xLabel="Median RSVPs"
        yLabel="Day"
      />
    ),
  },
  {
    key: "sessions-duration",
    table: "sessions-duration",
    help: [
      "How many sessions lasted how long, with the median RSVPs and attendees of each length.",
    ],
    chart: (table) => (
      <BinChart
        table={table}
        xLabel="Duration (min)"
        yLabel="Sessions"
        countKey="sessions"
      />
    ),
  },
  {
    key: "sessions-attendance-ratio",
    table: "sessions-attendance-ratio",
    help: [
      "For sessions with a reported count: the people who came divided by the RSVPs. At 1 as many came as RSVPed; below 1 fewer came; above 1 more came than RSVPed.",
    ],
    chart: (table) => (
      <BinChart
        table={table}
        xLabel="Attendees per RSVP"
        yLabel="Sessions"
        countKey="sessions"
      />
    ),
  },
  {
    key: "sessions-hosts",
    table: "sessions-hosts",
    help: [
      "Who hosted: sessions, unique hosts, the share of members who hosted, and sessions with more than one host.",
    ],
  },
  {
    key: "sessions-per-host",
    table: "sessions-per-host",
    help: ["How many hosts ran one session, two, and so on."],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="sessions"
        valueKey="hosts"
        xLabel="Hosts"
        yLabel="Sessions hosted"
      />
    ),
  },
  {
    key: "sessions-closed",
    table: "sessions-closed",
    help: [
      "Closed sessions take no more RSVPs. This compares them with the open ones.",
    ],
  },
  {
    key: "sessions-capacity",
    table: "sessions-capacity",
    help: [
      "Per location: its sessions, how many had a capacity, and how many got more RSVPs than it.",
    ],
  },

  {
    key: "attendees-rsvps",
    table: "attendees-table",
    from: true,
    title: "How many sessions did people RSVP to?",
    help: ["How many people RSVPed to how many sessions."],
    chart: (table) => (
      <CountHistogram
        table={table}
        valueKey="rsvps"
        xLabel="RSVPs per attendee"
        yLabel="Attendees"
        summary={(n) => `RSVPs per attendee, ${n} people`}
      />
    ),
  },
  {
    key: "attendees-gaps",
    table: "attendees-gaps",
    help: [
      "The free time between two sessions one person RSVPed to on the same day. Back to back means a gap no longer than the event's break.",
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="gap"
        valueKey="gaps"
        xLabel="Gaps"
        yLabel="Gap length"
      />
    ),
  },
  {
    key: "attendees-table",
    table: "attendees-table",
    wide: true,
    help: [
      "One row per person with RSVPs: sessions, days, hours booked, back-to-back pairs, overlapping pairs (double bookings) and the median gap.",
      PSEUDONYMS,
    ],
  },
  {
    key: "attendees-double-bookings",
    table: "attendees-double-bookings",
    help: [
      "People who RSVPed to sessions that overlap. A sign of hedging, and that RSVPs overstate attendance.",
    ],
  },
  {
    key: "attendees-hosts",
    table: "attendees-hosts",
    help: ["Hosts who also RSVPed to sessions other than their own."],
  },

  {
    key: "locations-utilization",
    table: "locations-table",
    from: true,
    wide: true,
    title: "How full was each location?",
    help: [
      "The booked share of each location's open time: the days' booking windows minus the times it was unavailable.",
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="location"
        valueKey="utilization"
        xLabel="Utilization (%)"
        yLabel="Location"
        summary="Utilization by location"
        format={percentLabel}
      />
    ),
  },
  {
    key: "locations-table",
    table: "locations-table",
    wide: true,
    help: [
      "Utilization is booked hours divided by available hours. A gap is free time inside the booking window. An unusable fragment is a gap too short to hold a session on the grid: it shows where the grid wastes time.",
      "A left-out session still occupies its location, so the gaps stay true.",
    ],
  },
  {
    key: "locations-heatmap",
    table: "locations-heatmap",
    wide: true,
    help: [
      "Per day, location and hour: the share of the open time that was booked. Darker is fuller; empty cells were free.",
    ],
    chart: (table) => <UtilizationHeatmaps table={table} />,
  },
  {
    key: "locations-supply-demand",
    table: "locations-supply-demand",
    wide: true,
    help: [
      "Per hour: the RSVPs to the sessions running, divided by the number of sessions running. A low line means too many sessions for too few people at that hour, an input for next year's grid.",
    ],
    chart: (table) => <SupplyDemand table={table} />,
  },

  {
    key: "meetings-adoption",
    table: "meetings-adoption",
    help: ["Members who offered times for 1-on-1s, and how many times."],
  },
  {
    key: "meetings-slots",
    table: "meetings-slots",
    help: ["How many people offered how many 1-on-1 slots."],
    chart: (table) => (
      <BinChart
        table={table}
        xLabel="Slots offered"
        yLabel="People"
        countKey="people"
      />
    ),
  },
  {
    key: "meetings-status",
    table: "meetings-status",
    help: [
      "Requests by what became of them. A pending request whose time has passed counts as expired.",
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="status"
        valueKey="requests"
        xLabel="Requests"
        yLabel="Status"
      />
    ),
  },
  {
    key: "meetings-people",
    table: "meetings-people",
    help: [
      "People who sent requests, people who got them, and people with at least one accepted meeting.",
    ],
  },
  {
    key: "meetings-per-person",
    table: "meetings-per-person",
    help: ["Requests sent, received and accepted, per person.", PSEUDONYMS],
  },
  {
    key: "meetings-response",
    table: "meetings-response",
    help: [
      "The median time from request to answer. A later cancel overwrites the time of the answer, so only requests still accepted or declined are timed.",
    ],
  },
  {
    key: "meetings-when",
    table: "meetings-when",
    help: ["When accepted meetings took place. Darker is more meetings."],
    chart: (table) => <MeetingsHeatmap table={table} />,
  },
  {
    key: "meetings-points",
    table: "meetings-points",
    help: [
      "Where people met. Places people typed themselves are counted as Other.",
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="point"
        valueKey="requests"
        xLabel="Requests"
        yLabel="Meeting point"
      />
    ),
  },

  {
    key: "profiles-fields",
    table: "profiles-fields",
    help: ["Members who filled in each profile field."],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="field"
        valueKey="members"
        xLabel="Members"
        yLabel="Field"
      />
    ),
  },
  {
    key: "profiles-filled",
    table: "profiles-filled",
    help: ["How many members filled in how many profile fields."],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="filled"
        valueKey="people"
        xLabel="Members"
        yLabel="Fields filled in"
      />
    ),
  },
  {
    key: "profiles-languages",
    table: "profiles-languages",
    help: [
      "Languages members speak. A language appears only when at least 3 members share it.",
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="value"
        valueKey="members"
        xLabel="Members"
        yLabel="Language"
        top={TOP_SHOWN}
      />
    ),
  },
  {
    key: "profiles-based-in",
    table: "profiles-based-in",
    help: [
      "Where members are based. A place appears only when at least 3 members share it.",
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="value"
        valueKey="members"
        xLabel="Members"
        yLabel="Based in"
        top={TOP_SHOWN}
      />
    ),
  },
  {
    key: "profiles-contacts",
    table: "profiles-contacts",
    help: [
      "Members who gave each kind of contact. The contacts are never shown.",
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="type"
        valueKey="members"
        xLabel="Members"
        yLabel="Contact type"
      />
    ),
  },

  {
    key: "comments-targets",
    table: "comments-targets",
    help: [
      "Comments on proposals, sessions and profiles. Deleted counts comments kept as a placeholder because they had replies.",
      "Profile comments have no event: on a site with several events they count in every event the member belongs to.",
    ],
  },
  {
    key: "comments-per-day",
    table: "comments-per-day",
    help: ["Comments written per day."],
    chart: (table) => (
      <DayTimeline
        table={table}
        valueKey="comments"
        yLabel="Comments"
        summary="Comments per day"
      />
    ),
  },
  {
    key: "comments-per-author",
    table: "comments-per-author",
    help: ["How many people wrote how many comments."],
    chart: (table) => (
      <BinChart
        table={table}
        xLabel="Comments per author"
        yLabel="Authors"
        countKey="authors"
      />
    ),
  },

  {
    key: "notifications-email",
    table: "notifications-email",
    help: ["Members with each email notification switched on."],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="setting"
        valueKey="share"
        xLabel="Members with it on (%)"
        yLabel="Email notification"
        format={percentLabel}
      />
    ),
  },
  {
    key: "notifications-push",
    table: "notifications-push",
    help: ["Members who allowed push notifications on at least one device."],
  },
  {
    key: "notifications-inapp",
    table: "notifications-inapp",
    help: [
      "In-app notifications sent per kind, and the share read. It shows which notifications people act on.",
      "Notifications have no event, so this counts all events of the members; one deleted unread is not counted, so the read share is a lower bound.",
    ],
  },
];

/** The cards of the tables given, in the catalogue's order; a table it lacks gets a plain card. */
export function figuresFor(tables: StatsTable[]) {
  const ids = new Set(tables.map((t) => t.id));
  const known = new Set(FIGURES.map((f) => f.table));
  return [
    ...FIGURES.filter((figure) => ids.has(figure.table)),
    ...tables
      .filter((t) => !known.has(t.id))
      .map((t): Figure => ({ key: t.id, table: t.id, help: [] })),
  ];
}
