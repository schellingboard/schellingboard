# Statistics in the admin: proposal

Status: decided, implementation in progress; ADR 0019 will record the decisions. Issue #389 is the
brainstorm; this narrows it to what the data in the database supports today, and sketches what to
collect later.

## Goal

An organizer, during and after an event, answers: did the process work (proposals → votes → sessions
→ attendance), did the venue work (rooms, gaps, peak times), and which features people used
(1-on-1s, profiles, comments, notifications). Every figure is a table that downloads as CSV, and
most have a chart. The same page serves a past event after an upgrade.

## Principles

1. **No new disclosure.** The page shows a site admin nothing the admin cannot see elsewhere, except
   as aggregates. Today an admin sees vote _counts_ per proposal, never who voted what. That stays
   true. One exception: the reported attendee count per session. ADR 0007 §3 keeps it out of the
   admin read surface and of exports; decided: the statistics ADR supersedes that part.
2. **Names only where already public**: titles, hosts, locations. People who only voted, RSVPed or
   requested a 1-on-1 never appear by name.
3. **Per-person tables are not joinable.** A per-person table (e.g. "votes per voter") has no guest
   id, a pseudonym (`P001`…) assigned per table and per request in sorted order, and rows sorted by
   value. Two tables can therefore not be joined to rebuild a person. Relations across domains ("do
   voters RSVP more?") are computed on the server and shown as aggregates.
4. **Small numbers are suppressed in free text.** Values of free-text fields (based in, meeting
   point, languages) appear only when at least 3 people share them; the rest is "Other".
5. **Read-only.** Statistics compute on read from the current tables. No new table, no migration, no
   change-log entry.
6. **Honest correlations.** A correlation shows Spearman's ρ with `n`, and below `n = 15` the text
   "too few to say". No trend line implies cause. (See the attendance model: 13 sessions gave p ≈
   0.07.)

## What the data supports today

| Data                 | Has time?                     | Note                                                          |
| -------------------- | ----------------------------- | ------------------------------------------------------------- |
| proposals            | `created_time`                | proposal timeline, "late proposals get fewer votes"           |
| votes                | no                            | no voting timeline                                            |
| sessions             | start/end; no creation time   | origin derived (below)                                        |
| rsvps                | no                            | no RSVP timeline, no cancellations                            |
| attendee count       | —                             | host-reported, nullable (NULL = not reported)                 |
| comments, likes      | `created_time`                | profile comments have no event: scope by profile's membership |
| meetings             | `created_at`, `responded_at`  | `responded_at` = last status change; expired derived          |
| meeting availability | slot                          | who offered how much                                          |
| notifications        | `created_at`, `read_at`       | read rate per type; guests can delete them                    |
| email settings, push | no                            | per guest, global: report over the event's members            |
| change log           | yes, but pruned               | not a source for history                                      |
| login sessions       | yes, but expire after 30 days | not a source for history                                      |

**Session origin** (derived, a heuristic, stated on the page): `blocker` when `blocker` is set; else
`proposal` when `proposal_id` is set; else `organizer` when `admin_managed`; else `spontaneous`. A
deleted proposal turns its session into "spontaneous" (`proposal_id` is set null); an admin can
untick admin-managed.

**Past events.** An organizer upgrades an old database (e.g. 3.8.1) and opens the page. A figure
whose data an older release did not collect (attendee counts before 3.6.0, 1-on-1s before they
existed) says "No data", never 0. The release-upgrade fixtures check that the page works on every
migrated release.

## Filtering out volunteer shifts and other non-sessions

One past event: rooms "Volunteers N", every session there hosted by one organizer account. Manual
removal in a CSV does not work for the figures that matter most: unique hosts, room utilization,
parallel sessions, RSVPs per attendee. So the filter applies on the server, to every table, chart
and CSV.

Generic facets, no event-specific concept:

- **Exclude locations** (checkbox list). A session with all its locations excluded is excluded; the
  location disappears from location tables.
- **Exclude hosts** (checkbox list of hosts). A session whose hosts are all excluded is excluded.
  The host also leaves every people figure (members, voters, RSVPs, 1-on-1s, profiles): an organizer
  account is not an attendee.
- **Exclude origins**: blocker (default excluded), organizer, spontaneous, proposal.

The filter lives in the URL query only (nothing stored), so a filtered view is a link and the CSV
link carries it. The page shows the active filter in one line ("Excluding 4 locations, 1 host,
blockers"); the CSV file name carries a short form (`my-event-sessions-filtered.csv`).

Every session table keeps `locations`, `hosts` and `origin` columns, so a CSV user can filter
further by hand.

Later, when session kinds (`not-built.md`: session, shift, fixture) exist, shifts and fixtures are
excluded by default and the facets stay for the rest.

## Sections

Each section is a set of figures. A figure is: a table (sortable, CSV) and, where it helps, a chart.
**Bold** marks the figures we think matter most.

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
- **Proposals over time**: proposals created per day across the phases (bars, phase bands).
- **Votes per voter** (per-person, pseudonymous): total, interested, maybe, skip, share of proposals
  covered. Chart: histogram of totals. Also: share of voters who voted on every proposal.
- **Choice mix**: interested / maybe / skip overall, and a histogram of each voter's interested
  share ("picky vs generous" voters).
- **Hosts and proposals**: proposals per host (histogram), co-hosted proposals, cohost wanted vs
  cohost found.
- **Conversion**: proposals → sessions, by interest quartile.

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
- **Gaps**: a gap is free time inside the booking window. Gaps shorter than the slot increment plus
  break are counted apart as "unusable fragments" — they show where the grid wastes time.
- **Utilization heatmap**: location × hour, per day.
- **Supply and demand by hour**: parallel sessions per hour vs RSVPs per hour (two lines). The input
  for next year's grid: where were there too many sessions for too few people.
- Excluded sessions in a kept location count as **occupied, not as sessions**, so a room's gaps stay
  true.

### 6. 1-on-1s

Only when the event has 1-on-1s enabled.

- **Adoption**: members with availability, share; availability slots per person (histogram).
- **Requests**: total, by status (pending, accepted, declined, canceled, expired), distinct
  requesters, distinct recipients, people with at least one accepted meeting.
- **Per person** (pseudonymous): requests sent, received, accepted.
- **Response time**: median and distribution of `responded_at − created_at`, for accepted and
  declined requests only. Every status change overwrites `responded_at`, so a cancel hides the
  response time; the page says so.
- **When**: accepted meetings by hour and day.
- **Meeting points**: the organizer's points by use; free-text points only as "Other".

### 7. Profiles

Over the event's members: share with photo, about me, pronouns, based in, languages, prompts,
contacts; profile fields filled per person (histogram); top languages and based-in values (k ≥ 3);
contact types used (counts by type, never values).

### 8. Comments

Per target (proposal, session, profile): comments, distinct authors, replies, likes, edited,
deleted. Comments per day. Comments per author (histogram). The most discussed proposals and
sessions are a column in their tables, not a separate list.

### 9. Notifications

- **Email settings**: per setting, share of members with it on; members without email.
- **Push**: members with at least one push subscription.
- **In-app**: notifications sent per type and share read. Tells which notifications people act on.
  Notifications carry no event, so on a multi-event site this counts all events of the members, and
  a guest can delete one unread: the read share is a lower bound.

## Shape

- **Server**: a read-only module `server/modules/stats`. One use case,
  `eventStatistics(actor, eventId, filter)`, site admin only. A `StatsRepository` port loads the
  event's raw facts in a few bulk queries; the figures are computed in TypeScript. An event is small
  (hundreds of sessions, thousands of RSVPs), so this is fast and testable.
- **Pure functions** in `packages/domain/src/stats/`: interval math (overlap, gaps, utilization,
  concurrency), rank correlation, binning, pseudonyms, small-number suppression, CSV encoding.
- **Contract**: a generic `StatsTable` (`id`, `title`, `columns: {key, label, type}[]`, `rows`),
  with column types `text | integer | number | percent | minutes | datetime | boolean`. One table
  component renders all of them; charts are bound by table id.
- **API**: `GET /api/v1/admin/events/{id}/stats?{filter}` (JSON, all tables) and
  `GET /api/v1/admin/events/{id}/stats/{table}.csv?{filter}`. The server writes the CSV, so one
  encoder serves the button, a script and `curl`.
- **Download all**: `GET /api/v1/admin/events/{id}/stats.zip?{filter}`, every CSV plus `about.txt`
  (event, filter, time of export, release, the caveats). Built on the server with fflate.
- **CSV**: RFC 4180, UTF-8 with BOM (Excel), times in the event's zone as `YYYY-MM-DD HH:mm`,
  durations in minutes, plain numbers. A cell starting with `= + - @` gets a leading `'`: titles are
  user input (formula injection).
- **SPA**: a "Statistics" tab in the admin event layout, sections as sub-navigation, a filter panel,
  each figure as a card with chart, "Show table", "Download CSV".
- **Charts**: a mature library, chosen by a spike and recorded in an ADR (see below). The Statistics
  screen is a lazy chunk, so attendees do not download it.

### Choosing the chart library

Charts needed: ranked bars with marks (capacity, attendees), histogram, scatter with ranges and a
trend, stacked bars, heatmap (location × hour), lines, small multiples per day.

Own SVG components were the first idea. The reasons do not hold up:

- _Bundle size_: the admin pages are a lazy chunk, so a library imported from them does not reach
  attendees.
- _Theming and dark mode_: a library that renders SVG can take the colours of the tokens.
- _Few chart types_: true, but scales, ticks, label overlap, tooltips and resizing are most of the
  work, and a library has solved them.

Thus a library, unless the spike finds a blocker. Candidates:

| Library         | For                                                                                                                 | Against                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Observable Plot | made for statistics: bin, cell (heatmap), regression, stack, facets; plain SVG; by the D3 authors; ISC              | not React (a small wrapper with a ref); colours are attributes, CSS variables need a check |
| Recharts        | React, the most used; tooltips, legends                                                                             | no heatmap, no binning; `ResponsiveContainer` needs `ResizeObserver` in tests; larger      |
| Others          | Chart.js and ECharts draw on canvas (no CSS colours, poor accessibility); Nivo and visx: more packages, more wiring | —                                                                                          |

### Spike result

Both libraries drew the location × hour heatmap and the predicted-vs-real scatter (with a `y = x`
line and, in Plot, a regression line) in a scratch project outside the repo, thrown away. Plot
0.6.19 (ISC), Recharts 3.10.1 (MIT); both released within the last week. Release history (npm):
Recharts ships a minor about every one to three months (3.9.0 in June, 3.10.0 in July 2026); Plot is
slower and bursty (0.6.17 in February 2025, then 0.6.18 and 0.6.19 in November 2026), a mature API
with few breaking changes.

| Criterion          | Observable Plot                                                                                                                                                             | Recharts                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| gzip, both charts  | +94 kB over a React baseline (162 kB vs 68.6 kB; all of d3 comes with it)                                                                                                   | +107 kB (176 kB vs 68.6 kB)                                                                                |
| Heatmap            | `Plot.cell`, one line, tooltip with `tip: true`                                                                                                                             | none: a `Scatter` with a custom rect `shape`, scales and tick labels by hand                               |
| Scatter, trend     | `Plot.dot` + `Plot.linearRegressionY`, `Plot.line` for `y = x`                                                                                                              | `Scatter` + `ReferenceLine`; no regression, no binning (histogram needs a pre-binned bar chart)            |
| Dark mode, tokens  | fills and strokes accept `var(--token)`; the data-driven colour scale emits fixed rgb, so it needs token values read with `getComputedStyle`, re-rendered on a theme change | fills and strokes accept `var(--token)`; the heatmap cell colour is computed by us anyway                  |
| Vitest (happy-dom) | works; the SVG is queryable. A continuous colour `legend` needs canvas and throws, so draw the legend ourselves                                                             | works with a fixed `width`/`height`; `ResponsiveContainer` renders nothing without a `ResizeObserver` mock |
| Phone width        | `width` is a number: the wrapper measures the container with a `ResizeObserver` and re-renders                                                                              | `ResponsiveContainer` does it                                                                              |
| Tooltips           | `tip: true` on a mark: built in, plain SVG, pointer only (no keyboard)                                                                                                      | `<Tooltip />` component: built in, follows pointer and keyboard focus with `accessibilityLayer`            |
| Accessible names   | `ariaLabel` on the SVG; marks are plain SVG, so the table next to the chart carries the detail                                                                              | `accessibilityLayer` (keyboard stepping, ARIA) on by default in 3.x                                        |
| Fit                | covers every needed chart (bin, stack, facet, cell, regression); imperative, so a ~30-line React wrapper with a ref                                                         | declarative React, but heatmap and histogram are workarounds                                               |

**Choice: Observable Plot.** It is smaller, it has the statistical marks the catalogue needs
(heatmap, histogram, regression, facets for the per-day small multiples) where Recharts needs
workarounds, and nothing found blocks it. Costs to accept: the `ResizeObserver` wrapper, token
colours read at render time for scales, an own legend. The chunk is only fetched on the Statistics
tab (the admin lazy chunk), not by attendees. The ADR records this.

## Later: what to collect for better statistics

Rough; each item needs its own design and an entry in the data collection statement (#801).

- **Coarse timestamps on votes and RSVPs** (to the hour): voting and RSVP timelines, "how late do
  people RSVP". Deleted with the vote or RSVP.
- **Aggregate counters without people**: RSVP cancellations per session, notification clicks per
  type, feature use per day (schedule, map, search). No ids, no addresses, no third-party analytics.
- **Daily snapshots**: the jobs loop writes a few event-wide counts per day to a table, since the
  change log is pruned. Gives history without per-person rows.
- **Attendance confirmation**: an attendee taps "I was there" (opt-in). Better than host counts and
  RSVPs. Stored as an RSVP flag, so it goes with the RSVP.
- **Anonymous ratings after a session** (#389, #1053): store the rating without a guest id; prevent
  a second rating with a separate "rated" row per (guest, session), deleted after the event.
- **Device class** (phone, desktop) per login session, not the user agent.
- **Rules for all of it**: data minimisation (collect what a figure needs, coarsen times), no
  per-person data that outlives the person's account, k ≥ 3 for anything shown, documented purpose
  and retention, aggregates only for anything kept after the event.
