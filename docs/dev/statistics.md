# Statistics in the admin: figures

The design of the admin's "Statistics" area (`/admin/statistics/{event}`). The decisions (privacy
rules, filter, table contract, CSV, chart library) are in [ADR 0019](adr/0019-statistics.md); this
note lists the data and the figures.

## Goal

An organizer, during and after an event, answers: did the process work (proposals → votes → sessions
→ attendance), did the venue work (rooms, gaps, peak times), and which features people used
(1-on-1s, profiles, comments, notifications). Every figure is a table that downloads as CSV, and
most have a chart. The same page serves a past event after an upgrade.

## What the data supports today

| Data                 | Has time?                     | Note                                                               |
| -------------------- | ----------------------------- | ------------------------------------------------------------------ |
| proposals            | `created_time`                | proposal timeline, "late proposals get fewer votes"                |
| votes                | no                            | no voting timeline                                                 |
| sessions             | start/end; no creation time   | origin derived ([ADR 0019](adr/0019-statistics.md#session-origin)) |
| rsvps                | no                            | no RSVP timeline, no cancellations                                 |
| attendee count       | —                             | host-reported, nullable (NULL = not reported)                      |
| comments, likes      | `created_time`                | profile comments have no event: scope by profile's membership      |
| meetings             | `created_at`, `responded_at`  | `responded_at` = last status change; expired derived               |
| meeting availability | slot                          | who offered how much                                               |
| notifications        | `created_at`, `read_at`       | read rate per type; guests can delete them                         |
| email settings, push | no                            | per guest, global: report over the event's members                 |
| change log           | yes, but pruned               | not a source for history                                           |
| login sessions       | yes, but expire after 30 days | not a source for history                                           |

**Past events.** An organizer upgrades an old database (e.g. 3.8.1) and opens the page. A figure
whose data an older release did not collect (attendee counts before 3.6.0, 1-on-1s before they
existed) says "No data", never 0. The release-upgrade fixtures check that the page works on every
migrated release.

## Figures

Each section is a set of figures. A figure is: a table (sortable, CSV) and, where it helps, a chart.
The SPA shows each as a card with an explanation (`features/admin/stats-figures.tsx`, the
catalogue); a big table's charts get cards of their own there. **Bold** marks the figures we think
matter most.

### 1. Overview

- **Headline numbers**: members, active members (voted, RSVPed, proposed, hosted, commented or
  offered 1-on-1 times), voters, RSVPers, proposals, sessions, hosts, sessions with an attendee
  report.
- **Participation funnel** (chart: horizontal bars): members → active → voted → RSVPed → hosted.
- **Who did what** (aggregate overlap): how many members voted only, RSVPed only, both, neither;
  mean RSVPs of voters vs non-voters. This answers "do voters engage more" without a joinable table.

### 2. Proposals and voting

- **Proposal funnel table**, one row per proposal: title, hosts, created, duration, cohost wanted,
  interested / maybe / skip, voters, interest share `s`, rank, became a session, the session's
  RSVPs, reported attendees, comments. This is the "votes → RSVPs → attendance" line asked for.
  Chart: ranked bars of interest, coloured by "became a session".
- **Popular but never scheduled**: the top-quartile proposals without a session. Short list, high
  value.
- **Late proposals get fewer votes?** Scatter: created time vs voters, ρ. Tells the organizer
  whether the proposal phase or the voting phase was too short.
- **Proposals over time**: proposals created per day per day (line; no phase bands).
- **Votes per voter** (per-person, pseudonymous): total, interested, maybe, skip, share of proposals
  covered. Chart: histogram of totals. Also: share of voters who voted on every proposal.
- **Choice mix**: interested / maybe / skip overall, and a histogram of each voter's interested
  share ("picky vs generous" voters).
- **Hosts and proposals**: proposals per host (histogram), co-hosted proposals, cohost wanted vs
  cohost found.
- **Conversion**: proposals → sessions, by interest quartile. A proposal "became a session" if it
  has any session, even one the filter removes; its RSVPs and report come from a kept session only.

### 3. Sessions

- **Session table**, one row per session: title, origin, day, start, end, duration, locations,
  hosts, capacity, RSVPs, fill (RSVPs / capacity), reported attendees, attendees per RSVP, closed,
  parallel sessions (others overlapping it), proposal votes, comments.
- **Sessions by popularity**: ranked bars of RSVPs, with the capacity as a tick and reported
  attendees as a second mark.
- **Origins**: count and median RSVPs per origin (proposal / spontaneous / organizer).
- **Hosts**: sessions hosted, unique hosts, share of members who hosted, sessions per host
  (histogram), sessions with more than one host.
- **Attendance reports — did hosts report?** Ended sessions with hosts, sessions reported, share;
  the same by origin and by day; hosts asked vs hosts who reported at least once; share reported
  where the follow-up reminder went out (a `followUp` row in `session_reminders` with `sent_at` or
  `notified_at`) vs where it did not. The answer decides how much every attendance figure below can
  be trusted.
- **Attendance**: attendees vs RSVPs scatter with ρ; attendees per RSVP distribution (the "no-show"
  ratio, which can exceed 1).
- **Predicted vs real attendance**: for sessions from proposals, the attendance model's midpoint and
  50% and 80% ranges (`docs/dev/attendance-model/`) next to the reported count. Inputs per event:
  `N` = members after the filter, `P` = mean parallel sessions over the booked time, `s̄` = mean
  interest share. Figures: predicted vs real scatter with the ranges, and calibration (share of
  reports inside the 50% and 80% ranges; the model expects about 50% and 80%). Labelled "model
  fitted on one event, n = 13". Each new event's result is a test of the model.
- **Votes → RSVPs**: scatter of interest share vs RSVPs for sessions from proposals, ρ.
- **Duration**: histogram; median RSVPs and attendees per duration bucket; duration by origin.
- **Time and competition**: median RSVPs by start hour and by day; RSVPs vs parallel sessions, ρ.
  Answers "were late-night or crowded slots weaker".
- **Closed sessions**: count, and their RSVPs and attendance vs the others.
- **Capacity**: sessions where RSVPs exceeded capacity, by location.

### 4. Attendees (RSVP behaviour)

- **RSVPs per attendee** (per-person, pseudonymous): RSVPs, days with RSVPs, hours booked,
  back-to-back pairs (gap ≤ the event's break), overlapping pairs (double bookings), median gap.
  Chart: histogram of RSVPs.
- **Gaps between RSVPed sessions**: histogram of gap lengths on the same day (0, ≤ break, ≤ 30 min,
  ≤ 1 h, ≤ 2 h, more). Answers "back to back or with breaks".
- **Double bookings**: share of attendees with overlapping RSVPs. A sign of hedging, and that RSVPs
  overstate attendance.
- **Hosts attend too**: share of hosts with RSVPs to other sessions.

RSVPs are intent, not attendance; the section says so once.

### 5. Locations and schedule

- **Location table**: sessions, booked hours, available hours (the days' booking windows minus
  location unavailability), utilization, gaps, total gap time, longest gap, median RSVPs, capacity,
  sessions over capacity, bookable.
- **Gaps**: a gap is free time inside the booking window. A gap that holds no whole grid slot (a
  session booked from slot S starts at S + break, so S must be at or after the gap start minus the
  break) is counted apart as an "unusable fragment" — they show where the grid wastes time.
- **Utilization heatmap**: location × hour, per day.
- **Supply and demand by hour**: parallel sessions per hour vs RSVPs per hour (two lines). The input
  for next year's grid: where were there too many sessions for too few people.
- Excluded sessions in a kept location count as **occupied, not as sessions**, so a room's gaps stay
  true.

### 6. 1-on-1s

Only when the event has 1-on-1s enabled, or has availability or requests from when it did.

- **Adoption**: members with availability, share; availability slots per person (histogram).
- **Requests**: by status (pending, accepted, declined, canceled, expired), distinct requesters,
  distinct recipients, people with at least one accepted meeting.
- **Per person** (pseudonymous): requests sent, received, accepted.
- **Response time**: median of `responded_at − created_at`, for accepted and declined requests only.
  Every status change overwrites `responded_at`, so a cancel hides the response time; the page says
  so.
- **When**: accepted meetings by hour and day.
- **Meeting points**: the organizer's points by use; free-text points only as "Other".

A meeting with an excluded host on either side leaves every 1-on-1 figure. A pending request whose
slot has started counts as expired. Availability outside the current days is not counted. Without
availability, requests or the switch, the section has no tables.

### 7. Profiles

Over the event's members: share with photo, about me, pronouns, based in, languages, prompts,
contacts; profile fields filled per person (histogram); top languages and based-in values (k ≥ 3);
contact types used (counts by type, never values). Languages and based-in values show only when at
least 3 members share them; the rest is "Other". Section absent when nobody filled in a profile.

### 8. Comments

Per target (proposal, session, profile): comments, distinct authors, replies, likes, edited,
deleted. Comments per day. Comments per author (histogram). The most discussed proposals and
sessions are a column in their tables, not a separate list. Comments by an excluded host and
comments on filtered sessions or proposals leave; a deleted comment keeps no author, so only its
target filters it. Deleted counts only tombstones: a deleted comment without replies is removed from
the database. Profile comments have no event, so on a multi-event site they count in every event the
member belongs to. Section absent when the event has no comments.

### 9. Notifications

- **Email settings**: per setting, share of members with it on; members without email.
- **Push**: members with at least one push subscription.
- **In-app**: notifications sent per type and share read. Tells which notifications people act on.
  Notifications carry no event, so on a multi-event site this counts all events of the members, and
  a guest can delete one unread: the read share is a lower bound. Only members of the event count.
  Not built: a count of members who switched notifications off after receiving them (not stored).
