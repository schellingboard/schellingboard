import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg, plural, t } from "@lingui/core/macro";
import type { StatsTable } from "@schellingboard/contracts/stats";
import type { ReactNode } from "react";

import {
  BinChart,
  CountBars,
  CountHistogram,
  DayTimeline,
  hasPrediction,
  MeetingsHeatmap,
  pairs,
  percentLabel,
  PopularProposals,
  PredictedVsReported,
  SupplyDemand,
  TableScatter,
  TOP_SHOWN,
  UtilizationHeatmaps,
} from "./stats-charts";

// A figure with `from` charts a table that has its own card, so it offers no
// table view or CSV of its own.
export type Figure = {
  key: string;
  table: string;
  title?: MessageDescriptor;
  help: MessageDescriptor[];
  chart?: (table: StatsTable) => ReactNode;
  hasChart?: (table: StatsTable) => boolean;
  from?: true;
  tiles?: true;
  wide?: true;
};

const CORRELATION = msg`ρ is Spearman's rank correlation, from −1 to 1: near 0 means no relation, near 1 that one rises with the other. Below 15 points it is too few to say, and a relation does not show that one caused the other.`;

const PSEUDONYMS = msg`People have no names here: P001, P002… are numbered anew in every table and every request, so rows cannot be matched to a person.`;

const AXIS = {
  members: msg({
    message: "Members",
    comment: "Chart axis: number of members",
  }),
  step: msg({
    message: "Step",
    comment: "Chart axis: one bar per funnel step",
  }),
  daysAfterFirst: msg({
    message: "Days after the first proposal",
    comment: "Chart axis: days since the first proposal was made",
  }),
  voters: msg({
    message: "Voters",
    comment: "Chart axis: number of voters",
  }),
  becameSession: msg({
    message: "Became a session (%)",
    comment: "Chart axis: share of proposals that became a session, in percent",
  }),
  proposalsByInterest: msg({
    message: "Proposals by interested votes",
    comment: "Chart axis: groups of proposals by their interested votes",
  }),
  proposalsCreated: msg({
    message: "Proposals created",
    comment: "Chart axis: number of proposals created",
  }),
  votesPerVoter: msg({
    message: "Votes per voter",
    comment: "Chart axis: number of votes one person cast",
  }),
  interestedShare: msg({
    message: "Interested votes of a voter (%)",
    comment:
      "Chart axis: share of a voter's votes that were interested, in percent",
  }),
  votes: msg({
    message: "Votes",
    comment: "Chart axis: number of votes",
  }),
  choice: msg({
    message: "Choice",
    comment: "Chart axis: one bar per vote choice",
  }),
  hosts: msg({
    message: "Hosts",
    comment: "Chart axis: number of hosts",
  }),
  proposalsHosted: msg({
    message: "Proposals hosted",
    comment: "Chart axis: number of proposals a host made",
  }),
  rsvps: msg({
    message: "RSVPs",
    comment: "Chart axis: number of RSVPs",
  }),
  session: msg({
    message: "Session",
    comment: "Chart axis: one bar per session",
  }),
  reportedAttendees: msg({
    message: "Reported attendees",
    comment: "Chart axis: people who came, as reported by the host",
  }),
  proposalInterest: msg({
    message: "Proposal interest (%)",
    comment:
      "Chart axis: share of a proposal's votes that were interested, in percent",
  }),
  parallelSessions: msg({
    message: "Parallel sessions",
    comment: "Chart axis: number of other sessions at the same time",
  }),
  sessions: msg({
    message: "Sessions",
    comment: "Chart axis: number of sessions",
  }),
  origin: msg({
    message: "Origin",
    comment: "Chart axis: how a session came about",
  }),
  medianRsvps: msg({
    message: "Median RSVPs",
    comment: "Chart axis: the median number of RSVPs",
  }),
  startHour: msg({
    message: "Start hour",
    comment: "Chart axis: hour at which sessions started",
  }),
  day: msg({
    message: "Day",
    comment: "Chart axis: day of the event",
  }),
  duration: msg({
    message: "Duration (min)",
    comment: "Chart axis: session length in minutes",
  }),
  attendeesPerRsvp: msg({
    message: "Attendees per RSVP",
    comment: "Chart axis: people who came divided by RSVPs",
  }),
  sessionsHosted: msg({
    message: "Sessions hosted",
    comment: "Chart axis: number of sessions a host ran",
  }),
  rsvpsPerAttendee: msg({
    message: "RSVPs per attendee",
    comment: "Chart axis: number of sessions one person RSVPed to",
  }),
  attendees: msg({
    message: "Attendees",
    comment: "Chart axis: number of people",
  }),
  gaps: msg({
    message: "Gaps",
    comment: "Chart axis: number of gaps between sessions",
  }),
  gapLength: msg({
    message: "Gap length",
    comment: "Chart axis: length of the free time between two sessions",
  }),
  utilization: msg({
    message: "Utilization (%)",
    comment: "Chart axis: booked share of a location's open time, in percent",
  }),
  location: msg({
    message: "Location",
    comment: "Chart axis: one row per location",
  }),
  slotsOffered: msg({
    message: "Slots offered",
    comment: "Chart axis: number of 1-on-1 time slots a person offered",
  }),
  people: msg({
    message: "People",
    comment: "Chart axis: number of people",
  }),
  requests: msg({
    message: "Requests",
    comment: "Chart axis: number of 1-on-1 requests",
  }),
  status: msg({
    message: "Status",
    comment: "Chart axis: what became of a 1-on-1 request",
  }),
  meetingPoint: msg({
    message: "Meeting point",
    comment: "Chart axis: where a 1-on-1 took place",
  }),
  field: msg({
    message: "Field",
    comment: "Chart axis: one bar per profile field",
  }),
  fieldsFilledIn: msg({
    message: "Fields filled in",
    comment: "Chart axis: number of profile fields a member filled in",
  }),
  language: msg({
    message: "Language",
    comment: "Chart axis: one bar per language",
  }),
  basedIn: msg({
    message: "Based in",
    comment: "Chart axis: place where members are based",
  }),
  contactType: msg({
    message: "Contact type",
    comment: "Chart axis: kind of contact a member gave",
  }),
  comments: msg({
    message: "Comments",
    comment: "Chart axis: number of comments",
  }),
  commentsPerAuthor: msg({
    message: "Comments per author",
    comment: "Chart axis: number of comments one person wrote",
  }),
  authors: msg({
    message: "Authors",
    comment: "Chart axis: number of people who wrote comments",
  }),
  withItOn: msg({
    message: "Members with it on (%)",
    comment: "Chart axis: share of members with a notification on, in percent",
  }),
  emailNotification: msg({
    message: "Email notification",
    comment: "Chart axis: one bar per email notification",
  }),
};

const axisLabel = (label: MessageDescriptor) => i18n._(label);

// eslint-disable-next-line lingui/no-unlocalized-strings -- vote choice names as the stats tables spell them
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
      msg`The main counts, after the filter. Members are the people on the event's guest list.`,
      msg`Active members voted, RSVPed, proposed, hosted, commented or offered 1-on-1 times.`,
    ],
  },
  {
    key: "overview-funnel",
    table: "overview-funnel",
    help: [
      msg`How many members took each step. Each bar counts the members who did that, so one member can be in several bars.`,
      msg`A big drop from Members to Active means many people never took part.`,
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="step"
        valueKey="members"
        xLabel={axisLabel(AXIS.members)}
        yLabel={axisLabel(AXIS.step)}
      />
    ),
  },
  {
    key: "overview-who-did-what",
    table: "overview-who-did-what",
    help: [
      msg`Members split by whether they voted and whether they RSVPed, with their mean number of RSVPs.`,
      msg`Compare All voters with All other members to see whether voters also take part more in the schedule.`,
    ],
  },

  {
    key: "proposals-popular",
    table: "proposals-table",
    from: true,
    wide: true,
    title: msg`Most popular proposals`,
    help: [
      msg`The ${TOP_SHOWN} proposals with the most "interested" votes, coloured by whether they became a session.`,
      msg`Every proposal is in the Proposals table.`,
    ],
    chart: (table) => <PopularProposals table={table} />,
  },
  {
    key: "proposals-lateness",
    table: "proposals-table",
    from: true,
    title: msg`Did late proposals get fewer votes?`,
    help: [
      msg`One dot per proposal: the days between the first proposal and this one (across), and the people who voted on it (up).`,
      msg`A falling trend means late proposals had too little time to collect votes: give voting more time next year.`,
      CORRELATION,
    ],
    hasChart: scatter("daysIn", "voters"),
    chart: (table) => (
      <TableScatter
        table={table}
        x="daysIn"
        y="voters"
        xLabel={axisLabel(AXIS.daysAfterFirst)}
        yLabel={axisLabel(AXIS.voters)}
        summary={(n) =>
          plural(n, {
            one: "Voters against Days after the first proposal, # proposal",
            other: "Voters against Days after the first proposal, # proposals",
          })
        }
      />
    ),
  },
  {
    key: "proposals-conversion",
    table: "proposals-conversion",
    help: [
      msg`Proposals in four groups by their interested votes, and the share of each group that became a session.`,
      msg`If the most wanted group is far from 100%, popular proposals were left out of the schedule.`,
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="group"
        valueKey="share"
        xLabel={axisLabel(AXIS.becameSession)}
        yLabel={axisLabel(AXIS.proposalsByInterest)}
        summary={(list) =>
          t({
            message: `Share that became a session: ${list}`,
            comment:
              "{list} is a comma-separated list of labels with their values",
          })
        }
        format={percentLabel}
      />
    ),
  },
  {
    key: "proposals-table",
    table: "proposals-table",
    wide: true,
    help: [
      msg`One row per proposal. Interest share is the interested votes divided by all its votes; rank 1 has the most interested votes.`,
      msg`Became a session is Yes when any session came from it, even one the filter leaves out. Session RSVPs and Reported attendees come from a session the filter keeps.`,
    ],
  },
  {
    key: "proposals-unscheduled",
    table: "proposals-unscheduled",
    help: [
      msg`Proposals in the top quarter by interested votes that never became a session: what people wanted and did not get.`,
    ],
  },
  {
    key: "proposals-over-time",
    table: "proposals-over-time",
    help: [
      msg`Proposals created per day. It shows when the proposal phase was busy, and whether a reminder or a deadline brought a rush.`,
    ],
    chart: (table) => (
      <DayTimeline
        table={table}
        valueKey="proposals"
        yLabel={axisLabel(AXIS.proposalsCreated)}
        summary={(list) =>
          t({
            message: `Proposals created per day: ${list}`,
            comment:
              "{list} is a comma-separated list of labels with their values",
          })
        }
      />
    ),
  },
  {
    key: "proposals-votes-per-voter",
    table: "proposals-voters",
    from: true,
    title: msg`How many proposals did people vote on?`,
    help: [
      msg`How many voters cast how many votes. Bars on the left are people who voted on a few proposals, bars on the right people who voted on many.`,
    ],
    chart: (table) => (
      <CountHistogram
        table={table}
        valueKey="total"
        xLabel={axisLabel(AXIS.votesPerVoter)}
        yLabel={axisLabel(AXIS.voters)}
        summary={(n) =>
          plural(n, {
            one: "Votes per voter, # voter",
            other: "Votes per voter, # voters",
          })
        }
      />
    ),
  },
  {
    key: "proposals-picky",
    table: "proposals-voters",
    from: true,
    title: msg`Picky or generous voters?`,
    help: [
      msg`For each voter, the share of their votes that were "interested". Bars on the left are picky voters, bars on the right voters who liked most proposals.`,
    ],
    chart: (table) => (
      <CountHistogram
        table={table}
        valueKey="interestedShare"
        xLabel={axisLabel(AXIS.interestedShare)}
        yLabel={axisLabel(AXIS.voters)}
        summary={(n) =>
          plural(n, {
            one: "Share interested per voter, # voter",
            other: "Share interested per voter, # voters",
          })
        }
        edges={SHARE_EDGES}
      />
    ),
  },
  {
    key: "proposals-voters",
    table: "proposals-voters",
    help: [
      msg`One row per voter: their votes by choice, and the share of all proposals they voted on.`,
      PSEUDONYMS,
    ],
  },
  {
    key: "proposals-choice-mix",
    table: "proposals-choice-mix",
    help: [msg`All votes by choice: interested, maybe and skip.`],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="figure"
        valueKey="value"
        xLabel={axisLabel(AXIS.votes)}
        yLabel={axisLabel(AXIS.choice)}
        only={VOTE_CHOICES}
      />
    ),
  },
  {
    key: "proposals-hosts",
    table: "proposals-hosts",
    help: [
      msg`Who proposed: hosts of proposals, co-hosted proposals, and how many proposals that asked for a co-host found one.`,
    ],
  },
  {
    key: "proposals-per-host",
    table: "proposals-per-host",
    help: [msg`How many hosts made one proposal, two, and so on.`],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="proposals"
        valueKey="hosts"
        xLabel={axisLabel(AXIS.hosts)}
        yLabel={axisLabel(AXIS.proposalsHosted)}
      />
    ),
  },

  {
    key: "sessions-popular",
    table: "sessions-table",
    from: true,
    wide: true,
    title: msg`Most RSVPed sessions`,
    help: [
      msg`The ${TOP_SHOWN} sessions with the most RSVPs. Every session is in the Sessions table.`,
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="title"
        valueKey="rsvps"
        xLabel={axisLabel(AXIS.rsvps)}
        yLabel={axisLabel(AXIS.session)}
        top={TOP_SHOWN}
        summary={(list) =>
          t({
            message: `Most RSVPed sessions: ${list}`,
            comment:
              "{list} is a comma-separated list of labels with their values",
          })
        }
      />
    ),
  },
  {
    key: "sessions-reports",
    table: "sessions-reports",
    help: [
      msg`Read this first: it tells how far to trust every attendance figure. Hosts type in how many people came; this counts the ended sessions with hosts that have such a report.`,
      msg`Rows split it by origin and by day, and by whether the follow-up reminder went out.`,
    ],
  },
  {
    key: "sessions-predicted",
    table: "sessions-table",
    from: true,
    title: msg`Predicted against reported attendance`,
    help: [
      msg`For sessions from proposals with a reported count: the attendance model's prediction from the votes (up) against the count the host reported (across).`,
      msg`Dots are the model's midpoint, thick bars its 50% range, thin bars its 80% range. On the dashed line the prediction was exact.`,
      msg`The model was fitted on one event with 13 sessions: a rough guide, not a forecast.`,
    ],
    hasChart: hasPrediction,
    chart: (table) => <PredictedVsReported table={table} />,
  },
  {
    key: "sessions-calibration",
    table: "sessions-calibration",
    title: msg`How often was the prediction right?`,
    help: [
      msg`How often the reported count fell inside the model's 50% and 80% ranges. A model that fits hits about 50% and 80% of the time.`,
      msg`Below 15 sessions it is too few to say.`,
    ],
  },
  {
    key: "sessions-rsvps-attendees",
    table: "sessions-table",
    from: true,
    title: msg`Did the people who RSVPed come?`,
    help: [
      msg`One dot per session with a reported count: its RSVPs (across) against the people who came (up). Dots low on the chart are sessions that fewer people attended than RSVPed.`,
      CORRELATION,
    ],
    hasChart: scatter("rsvps", "reported"),
    chart: (table) => (
      <TableScatter
        table={table}
        x="rsvps"
        y="reported"
        xLabel={axisLabel(AXIS.rsvps)}
        yLabel={axisLabel(AXIS.reportedAttendees)}
        summary={(n) =>
          plural(n, {
            one: "Reported attendees against RSVPs, # session",
            other: "Reported attendees against RSVPs, # sessions",
          })
        }
      />
    ),
  },
  {
    key: "sessions-interest-rsvps",
    table: "sessions-table",
    from: true,
    title: msg`Did votes predict RSVPs?`,
    help: [
      msg`One dot per session from a proposal: the proposal's interest share (across) against the session's RSVPs (up).`,
      CORRELATION,
    ],
    hasChart: scatter("interest", "rsvps"),
    chart: (table) => (
      <TableScatter
        table={table}
        x="interest"
        y="rsvps"
        xLabel={axisLabel(AXIS.proposalInterest)}
        yLabel={axisLabel(AXIS.rsvps)}
        summary={(n) =>
          plural(n, {
            one: "RSVPs against Proposal interest (%), # session",
            other: "RSVPs against Proposal interest (%), # sessions",
          })
        }
      />
    ),
  },
  {
    key: "sessions-parallel",
    table: "sessions-table",
    from: true,
    title: msg`Did parallel sessions take people away?`,
    help: [
      msg`One dot per session: how many other sessions ran at the same time (across) against its RSVPs (up). A falling trend means crowded slots were weaker.`,
      CORRELATION,
    ],
    hasChart: scatter("parallel", "rsvps"),
    chart: (table) => (
      <TableScatter
        table={table}
        x="parallel"
        y="rsvps"
        xLabel={axisLabel(AXIS.parallelSessions)}
        yLabel={axisLabel(AXIS.rsvps)}
        summary={(n) =>
          plural(n, {
            one: "RSVPs against Parallel sessions, # session",
            other: "RSVPs against Parallel sessions, # sessions",
          })
        }
      />
    ),
  },
  {
    key: "sessions-table",
    table: "sessions-table",
    wide: true,
    help: [
      msg`One row per session. Fill is RSVPs divided by capacity. Attendees per RSVP is the reported count divided by the RSVPs. Parallel sessions counts the others that overlap it.`,
      msg`Origin is worked out from the data: a blocker; else from a proposal; else organizer, when an admin manages it; else spontaneous. A session whose proposal was deleted counts as spontaneous.`,
      msg`The predicted columns come from the attendance model, fitted on one event: treat them as rough.`,
    ],
  },
  {
    key: "sessions-origins",
    table: "sessions-origins",
    help: [
      msg`Sessions by how they came about, with their median RSVPs, attendees and duration.`,
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="group"
        valueKey="sessions"
        xLabel={axisLabel(AXIS.sessions)}
        yLabel={axisLabel(AXIS.origin)}
      />
    ),
  },
  {
    key: "sessions-by-hour",
    table: "sessions-by-hour",
    help: [
      msg`Sessions by the hour they started, with their median RSVPs. It shows whether early or late slots drew fewer people.`,
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="group"
        valueKey="medianRsvps"
        xLabel={axisLabel(AXIS.medianRsvps)}
        yLabel={axisLabel(AXIS.startHour)}
      />
    ),
  },
  {
    key: "sessions-by-day",
    table: "sessions-by-day",
    help: [msg`Sessions per day, with their median RSVPs.`],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="group"
        valueKey="medianRsvps"
        xLabel={axisLabel(AXIS.medianRsvps)}
        yLabel={axisLabel(AXIS.day)}
      />
    ),
  },
  {
    key: "sessions-duration",
    table: "sessions-duration",
    help: [
      msg`How many sessions lasted how long, with the median RSVPs and attendees of each length.`,
    ],
    chart: (table) => (
      <BinChart
        table={table}
        xLabel={axisLabel(AXIS.duration)}
        yLabel={axisLabel(AXIS.sessions)}
        countKey="sessions"
      />
    ),
  },
  {
    key: "sessions-attendance-ratio",
    table: "sessions-attendance-ratio",
    help: [
      msg`For sessions with a reported count: the people who came divided by the RSVPs. At 1 as many came as RSVPed; below 1 fewer came; above 1 more came than RSVPed.`,
    ],
    chart: (table) => (
      <BinChart
        table={table}
        xLabel={axisLabel(AXIS.attendeesPerRsvp)}
        yLabel={axisLabel(AXIS.sessions)}
        countKey="sessions"
      />
    ),
  },
  {
    key: "sessions-hosts",
    table: "sessions-hosts",
    help: [
      msg`Who hosted: sessions, unique hosts, the share of members who hosted, and sessions with more than one host.`,
    ],
  },
  {
    key: "sessions-per-host",
    table: "sessions-per-host",
    help: [msg`How many hosts ran one session, two, and so on.`],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="sessions"
        valueKey="hosts"
        xLabel={axisLabel(AXIS.hosts)}
        yLabel={axisLabel(AXIS.sessionsHosted)}
      />
    ),
  },
  {
    key: "sessions-closed",
    table: "sessions-closed",
    help: [
      msg`Closed sessions take no more RSVPs. This compares them with the open ones.`,
    ],
  },
  {
    key: "sessions-capacity",
    table: "sessions-capacity",
    help: [
      msg`Per location: its sessions, how many had a capacity, and how many got more RSVPs than it.`,
    ],
  },

  {
    key: "attendees-rsvps",
    table: "attendees-table",
    from: true,
    title: msg`How many sessions did people RSVP to?`,
    help: [msg`How many people RSVPed to how many sessions.`],
    chart: (table) => (
      <CountHistogram
        table={table}
        valueKey="rsvps"
        xLabel={axisLabel(AXIS.rsvpsPerAttendee)}
        yLabel={axisLabel(AXIS.attendees)}
        summary={(n) =>
          plural(n, {
            one: "RSVPs per attendee, # person",
            other: "RSVPs per attendee, # people",
          })
        }
      />
    ),
  },
  {
    key: "attendees-gaps",
    table: "attendees-gaps",
    help: [
      msg`The free time between two sessions one person RSVPed to on the same day. Back to back means a gap no longer than the event's break.`,
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="gap"
        valueKey="gaps"
        xLabel={axisLabel(AXIS.gaps)}
        yLabel={axisLabel(AXIS.gapLength)}
      />
    ),
  },
  {
    key: "attendees-table",
    table: "attendees-table",
    wide: true,
    help: [
      msg`One row per person with RSVPs: sessions, days, hours booked, back-to-back pairs, overlapping pairs (double bookings) and the median gap.`,
      PSEUDONYMS,
    ],
  },
  {
    key: "attendees-double-bookings",
    table: "attendees-double-bookings",
    help: [
      msg`People who RSVPed to sessions that overlap. A sign of hedging, and that RSVPs overstate attendance.`,
    ],
  },
  {
    key: "attendees-hosts",
    table: "attendees-hosts",
    help: [msg`Hosts who also RSVPed to sessions other than their own.`],
  },

  {
    key: "locations-utilization",
    table: "locations-table",
    from: true,
    wide: true,
    title: msg`How full was each location?`,
    help: [
      msg`The booked share of each location's open time: the days' booking windows minus the times it was unavailable.`,
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="location"
        valueKey="utilization"
        xLabel={axisLabel(AXIS.utilization)}
        yLabel={axisLabel(AXIS.location)}
        summary={(list) =>
          t({
            message: `Utilization by location: ${list}`,
            comment:
              "{list} is a comma-separated list of labels with their values",
          })
        }
        format={percentLabel}
      />
    ),
  },
  {
    key: "locations-table",
    table: "locations-table",
    wide: true,
    help: [
      msg`Utilization is booked hours divided by available hours. A gap is free time inside the booking window. An unusable fragment is a gap too short to hold a session on the grid: it shows where the grid wastes time.`,
      msg`A left-out session still occupies its location, so the gaps stay true.`,
    ],
  },
  {
    key: "locations-heatmap",
    table: "locations-heatmap",
    wide: true,
    help: [
      msg`Per day, location and hour: the share of the open time that was booked. Darker is fuller; empty cells were free.`,
    ],
    chart: (table) => <UtilizationHeatmaps table={table} />,
  },
  {
    key: "locations-supply-demand",
    table: "locations-supply-demand",
    wide: true,
    help: [
      msg`Per hour: the RSVPs to the sessions running, divided by the number of sessions running. A low line means too many sessions for too few people at that hour, an input for next year's grid.`,
    ],
    chart: (table) => <SupplyDemand table={table} />,
  },

  {
    key: "meetings-adoption",
    table: "meetings-adoption",
    help: [msg`Members who offered times for 1-on-1s, and how many times.`],
  },
  {
    key: "meetings-slots",
    table: "meetings-slots",
    help: [msg`How many people offered how many 1-on-1 slots.`],
    chart: (table) => (
      <BinChart
        table={table}
        xLabel={axisLabel(AXIS.slotsOffered)}
        yLabel={axisLabel(AXIS.people)}
        countKey="people"
      />
    ),
  },
  {
    key: "meetings-status",
    table: "meetings-status",
    help: [
      msg`Requests by what became of them. A pending request whose time has passed counts as expired.`,
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="status"
        valueKey="requests"
        xLabel={axisLabel(AXIS.requests)}
        yLabel={axisLabel(AXIS.status)}
      />
    ),
  },
  {
    key: "meetings-people",
    table: "meetings-people",
    help: [
      msg`People who sent requests, people who got them, and people with at least one accepted meeting.`,
    ],
  },
  {
    key: "meetings-per-person",
    table: "meetings-per-person",
    help: [msg`Requests sent, received and accepted, per person.`, PSEUDONYMS],
  },
  {
    key: "meetings-response",
    table: "meetings-response",
    help: [
      msg`The median time from request to answer. A later cancel overwrites the time of the answer, so only requests still accepted or declined are timed.`,
    ],
  },
  {
    key: "meetings-when",
    table: "meetings-when",
    help: [msg`When accepted meetings took place. Darker is more meetings.`],
    chart: (table) => <MeetingsHeatmap table={table} />,
  },
  {
    key: "meetings-points",
    table: "meetings-points",
    help: [
      msg`Where people met. Places people typed themselves are counted as Other.`,
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="point"
        valueKey="requests"
        xLabel={axisLabel(AXIS.requests)}
        yLabel={axisLabel(AXIS.meetingPoint)}
      />
    ),
  },

  {
    key: "profiles-fields",
    table: "profiles-fields",
    help: [msg`Members who filled in each profile field.`],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="field"
        valueKey="members"
        xLabel={axisLabel(AXIS.members)}
        yLabel={axisLabel(AXIS.field)}
      />
    ),
  },
  {
    key: "profiles-filled",
    table: "profiles-filled",
    help: [msg`How many members filled in how many profile fields.`],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="filled"
        valueKey="people"
        xLabel={axisLabel(AXIS.members)}
        yLabel={axisLabel(AXIS.fieldsFilledIn)}
      />
    ),
  },
  {
    key: "profiles-languages",
    table: "profiles-languages",
    help: [
      msg`Languages members speak. A language appears only when at least 3 members share it.`,
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="value"
        valueKey="members"
        xLabel={axisLabel(AXIS.members)}
        yLabel={axisLabel(AXIS.language)}
        top={TOP_SHOWN}
      />
    ),
  },
  {
    key: "profiles-based-in",
    table: "profiles-based-in",
    help: [
      msg`Where members are based. A place appears only when at least 3 members share it.`,
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="value"
        valueKey="members"
        xLabel={axisLabel(AXIS.members)}
        yLabel={axisLabel(AXIS.basedIn)}
        top={TOP_SHOWN}
      />
    ),
  },
  {
    key: "profiles-contacts",
    table: "profiles-contacts",
    help: [
      msg`Members who gave each kind of contact. The contacts are never shown.`,
    ],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="type"
        valueKey="members"
        xLabel={axisLabel(AXIS.members)}
        yLabel={axisLabel(AXIS.contactType)}
      />
    ),
  },

  {
    key: "comments-targets",
    table: "comments-targets",
    help: [
      msg`Comments on proposals, sessions and profiles. Deleted counts comments kept as a placeholder because they had replies.`,
      msg`Profile comments have no event: on a site with several events they count in every event the member belongs to.`,
    ],
  },
  {
    key: "comments-per-day",
    table: "comments-per-day",
    help: [msg`Comments written per day.`],
    chart: (table) => (
      <DayTimeline
        table={table}
        valueKey="comments"
        yLabel={axisLabel(AXIS.comments)}
        summary={(list) =>
          t({
            message: `Comments per day: ${list}`,
            comment:
              "{list} is a comma-separated list of labels with their values",
          })
        }
      />
    ),
  },
  {
    key: "comments-per-author",
    table: "comments-per-author",
    help: [msg`How many people wrote how many comments.`],
    chart: (table) => (
      <BinChart
        table={table}
        xLabel={axisLabel(AXIS.commentsPerAuthor)}
        yLabel={axisLabel(AXIS.authors)}
        countKey="authors"
      />
    ),
  },

  {
    key: "notifications-email",
    table: "notifications-email",
    help: [msg`Members with each email notification switched on.`],
    chart: (table) => (
      <CountBars
        table={table}
        labelKey="setting"
        valueKey="share"
        xLabel={axisLabel(AXIS.withItOn)}
        yLabel={axisLabel(AXIS.emailNotification)}
        format={percentLabel}
      />
    ),
  },
  {
    key: "notifications-push",
    table: "notifications-push",
    help: [msg`Members who allowed push notifications on at least one device.`],
  },
  {
    key: "notifications-inapp",
    table: "notifications-inapp",
    help: [
      msg`In-app notifications sent per kind, and the share read. It shows which notifications people act on.`,
      msg`Notifications have no event, so this counts all events of the members; one deleted unread is not counted, so the read share is a lower bound.`,
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
