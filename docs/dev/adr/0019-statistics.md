# ADR 0019: Statistics in the admin

- **Status:** Accepted
- **Date:** 2026-11-07
- **Issue:** #389

## Context

Organizers want to know, during and after an event, whether the process worked (proposals, votes,
sessions, attendance), whether the venue worked and which features people used (issue #389). The
data is in the database, but an admin sees only counts today, and the one number that measures
success, the attendee count, is kept out of every admin surface by
[ADR 0007](0007-attendee-count-and-reminder-dispatch.md) §3. The figures and their data are listed
in [Statistics: figures](../statistics.md). No real event database is available to the project
(privacy), so old data is checked through the release-upgrade fixtures and the dev seed.

## Decision

### Principles

1. **No new disclosure.** The page shows a site admin nothing the admin cannot see elsewhere, except
   as aggregates. Today an admin sees vote _counts_ per proposal, never who voted what. That stays
   true. One exception: the reported attendee count per session. This ADR supersedes the part of ADR
   0007 §3 that keeps it out of the admin read surface and of exports (see below).
2. **Names only where already public**: titles, hosts, locations. People who only voted, RSVPed or
   requested a 1-on-1 never appear by name.
3. **Per-person tables are not joinable.** A per-person table (e.g. "votes per voter") has no guest
   id, a pseudonym (`P001`…) assigned per table and per request in sorted order, and rows sorted by
   value. Two tables can therefore not be joined to rebuild a person. Relations across domains ("do
   voters RSVP more?") are computed on the server and shown as aggregates.
4. **Small numbers are suppressed in free text.** Values of free-text fields (based in, meeting
   point, languages) appear only when at least 3 people share them; the rest is "Other".
5. **Honest correlations.** A correlation shows Spearman's ρ with `n`, and below `n = 15` the text
   "too few to say". A trend line is drawn only from `n = 15` and does not imply cause. (See the
   attendance model: 13 sessions gave p ≈ 0.07.)

### Read-only, on the server

No new disclosure beyond the above, and no storage: statistics are computed on read from the current
tables: no new table, no migration, no change-log entry. A read-only module `server/modules/stats`
has one use case, `eventStatistics(actor, eventId, filter)`, for site admins only. A
`StatsRepository` read port loads the event's raw facts in a few bulk queries and the figures are
computed in TypeScript, in pure functions in `packages/domain/src/stats/` (interval math, rank
correlation, binning, pseudonyms, suppression, CSV encoding, the attendance prediction). An event is
small, so this is fast and testable. The prediction of the
[attendance model](../attendance-model/README.md) is shown next to the reported count, labelled with
its basis (one event, n = 13).

### The filter

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

An excluded session still occupies its room, so location gaps stay true.

### Session origin

Derived, a heuristic, stated on the page: `blocker` when `blocker` is set; else `proposal` when
`proposal_id` is set; else `organizer` when `admin_managed`; else `spontaneous`. A deleted proposal
turns its session into "spontaneous" (`proposal_id` is set null); an admin can untick admin-managed.

### The table contract

- **Contract**: a generic `StatsTable` (`id`, `title`, `columns: {key, label, type}[]`, `rows`),
  with column types `text | integer | number | percent | minutes | datetime | boolean`. One table
  component renders all of them; charts are bound by table id. A `datetime` cell is a string the
  server already formatted in the event's zone (`YYYY-MM-DD HH:mm`, as in the CSV), so the payload
  needs no zone and the table shows it as given.
- **API**: `GET /api/v1/admin/events/{id}/stats?{filter}` (JSON, all tables) and
  `GET /api/v1/admin/events/{id}/stats/{table}.csv?{filter}`. The server writes the CSV, so one
  encoder serves the button, a script and `curl`.
- **Download all**: `GET /api/v1/admin/events/{id}/stats.zip?{filter}`, every CSV plus `about.txt`
  (event, filter, time of export, release, the caveats). Built on the server with fflate.
- **CSV**: RFC 4180, UTF-8 with BOM (Excel), times in the event's zone as `YYYY-MM-DD HH:mm`,
  durations in minutes, plain numbers. A cell starting with `= + - @` gets a leading `'`: titles are
  user input (formula injection).
- **SPA**: a "Statistics" tab in the admin event layout (since moved to its own admin area,
  `/admin/statistics/{event}`, for the screen width), sections as sub-navigation, a filter panel,
  each figure as a card with chart, "Show table", "Download CSV".
- **Charts**: Observable Plot (next section), loaded as described there.

### The chart library

Charts needed: ranked bars with marks (capacity, attendees), histogram, scatter with ranges and a
trend, stacked bars, heatmap (location × hour), lines, small multiples per day.

Own SVG components were the first idea. The reasons do not hold up:

- _Bundle size_: a library is only a cost where it is loaded; see the loading rule below.
- _Theming and dark mode_: a library that renders SVG can take the colours of the tokens.
- _Few chart types_: true, but scales, ticks, label overlap, tooltips and resizing are most of the
  work, and a library has solved them.

Thus a library, unless the spike finds a blocker. Candidates:

| Library         | For                                                                                                                 | Against                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Observable Plot | made for statistics: bin, cell (heatmap), regression, stack, facets; plain SVG; by the D3 authors; ISC              | not React (a small wrapper with a ref); colours are attributes, CSS variables need a check |
| Recharts        | React, the most used; tooltips, legends                                                                             | no heatmap, no binning; `ResponsiveContainer` needs `ResizeObserver` in tests; larger      |
| Others          | Chart.js and ECharts draw on canvas (no CSS colours, poor accessibility); Nivo and visx: more packages, more wiring | —                                                                                          |

**Spike result**

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
colours read at render time for scales, an own legend. Loading rule: the chart wrappers in
`apps/web/src/ui/charts/` import Plot with a dynamic import, so Plot (about 94 kB gzip) is fetched
only when a Statistics tab shows a chart. Neither attendees nor the other admin pages download it.
Measured in the app: 93 kB gzip (278 kB raw) in its own chunk, because `ui/charts/plot.ts`
re-exports only the marks used.

## Consequences

- An admin can see attendance per session; the exposure is limited to site admins and travels with
  the CSV they download.
- A past event works after an upgrade: a figure the old release did not collect says "No data",
  never 0. The release-upgrade fixtures run the statistics after migration.
- Per-person tables have rows (a CSV needs them) but cannot be joined: pseudonyms differ per table
  and request.
- Plot has its own lazy chunk, fetched only when the Statistics tab shows a chart.
- Later data collection (see [the proposal](../statistics-proposal.md)) needs its own decision.
