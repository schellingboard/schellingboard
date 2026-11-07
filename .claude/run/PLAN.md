# Run plan: statistics in the admin

Goal: a "Statistics" tab per event in the admin. Every figure is a sortable table with a CSV
download, most with a chart. A filter removes locations, hosts and session origins (volunteer
shifts) from all figures. The same page works for a past event after an upgrade. Every step leaves
the app shippable.

Read first: `docs/dev/statistics.md` (the figure catalogue), ADR 0019, ADR 0007 (attendee count),
0012, 0017, 0018; `docs/dev/server.md`, `docs/dev/web-app.md`, `docs/dev/testing.md`;
`docs/dev/attendance-model/README.md` (why correlations need caution).

## Settled

Decided with the user; step 3 records them in ADR 0019: read-only, computed on read, no migration;
names only where already public; per-person tables have rows (CSV needs them), pseudonymous per
table and request, sorted by value, not joinable; free-text values only with k ≥ 3; the filter on
the server, in the URL only; an excluded host also leaves the people figures; CSV and ZIP (fflate)
from the server; the attendance model's prediction next to the reported attendance (site admins see
the reported count per session, which supersedes part of ADR 0007 §3); a mature chart library,
chosen by the spike in step 2, loaded by dynamic import from the chart wrappers.

No real database is available (privacy). The real data is the user's: they upgrade their 3.8.1
database and use the page themselves. The run checks old data through the release-upgrade fixtures
(`v3.6.0.sql` covers 3.8.1) and the dev seed.

## How to work (every step)

- **TDD**: tag the test with its use case in `tests/use-cases.ts` (add `0xx-USn` for statistics),
  see it fail, then implement. Pure functions get unit tests (property tests for interval math);
  each section gets integration tests against the API (`tests/integration/api-stats.test.ts`) with a
  small hand-built event whose figures are known; screens get Vitest tests by role and name.
- **One E2E spec** (`tests/e2e/statistics.spec.ts`), grown per step only for workflows: open the
  tab, read a figure, exclude a location, download a CSV. No E2E for charts.
- **Privacy check per section**: the integration test asserts that no guest id and no non-host name
  is in the JSON or CSV of a per-person table.
- Figures that need data the database does not have are left out, not faked.
- Times in the event's zone. Every screen works at phone width (tables in `overflow-x: auto`).
- Update `CHANGELOG.md`, `docs/public/organizers/admin-guide.md` and `docs/dev/` in the step that
  changes them.
- **Checks per step**: `make format lint arch openapi-check typecheck test`, then
  `statistics.spec.ts`. Full `make test-e2e` only in the last step. Never `make test-e2e-docker`.
- A step whose diff grows past ~1500 lines outside tests is split in PLAN.md first.

## Steps

### Foundation

- [x] 1. Lazy chunk: admin pages load via `lazyRouteComponent` in `router.tsx`; main bundle 930.7 kB
      -> 838.4 kB (gzip 282.0 -> 261.6), admin chunk 94.9 kB.
- [x] 2. Chart spike: Observable Plot chosen (+94 kB gzip vs Recharts +107; native heatmap,
      regression, bins); findings in ADR 0019.
- [x] 3. ADR 0019 (statistics) written; ADR 0007 §3 noted; figures moved to
      `docs/dev/statistics.md`; the proposal doc keeps only "Later".
- [x] 4. Pure functions in `packages/domain/src/stats/` (intervals, correlation, binning,
      pseudonyms, suppression, session origin, CSV, attendance prediction) with tests in
      `tests/unit/stats/`; use case 021 added.
- [x] 5. Server skeleton: `server/modules/stats`, `StatsRepository`, filter, `StatsTable` contract,
      `/stats`, `/stats/{file}` (CSV), `/stats.zip`, Overview headline and funnel, release-upgrade
      test.
- [x] 6. Dev seed (large profile, Conference Gamma): "Volunteers 1/2" locations with 12 organizer
      shifts hosted by "Olga Organizer", attendee reports on 10 sessions, 1-on-1s in every status.
- [x] 7. SPA skeleton: Statistics tab (`features/admin/event-stats.tsx`, `stats-table.tsx`,
      `queries/admin-stats.ts`), sections nav, sortable tables, CSV/ZIP links, filter panel in the
      URL, `statistics.spec.ts`.
- [x] 8. Chart wrappers in `ui/charts/` (ranked bars, histogram, scatter, stacked bars, heatmap,
      lines) over a lazily imported Plot; chart tokens; the funnel chart on the Overview.

### Sections

Each step: the section's figures from `docs/dev/statistics.md` on the server (integration tests),
then its cards in the SPA. Skip a figure whose chart adds nothing to its table.

- [ ] 9. Sessions: session table, popularity, origins, hosts, did hosts report, attendance, votes →
      RSVPs, duration, time and competition, closed, capacity.
- [ ] 10. Predicted vs real attendance: prediction columns in the session table, the scatter with
      ranges, calibration. Split from step 9 if that grows too big.
- [ ] 11. Proposals and voting: proposal funnel table, popular but never scheduled, late proposals,
      proposals over time, votes per voter, choice mix, hosts and proposals, conversion.
- [ ] 12. Attendees: RSVPs per attendee, gaps, double bookings, hosts who attend. Overview gains
      "who did what".
- [ ] 13. Locations and schedule: location table, gaps and fragments, utilization heatmap, supply
      and demand by hour; excluded sessions occupy time but are no sessions.
- [ ] 14. 1-on-1s: adoption, requests by status, per person, response time, when, meeting points.
- [ ] 15. Profiles, comments, notifications (one step: all three are counts over members).

### Finish

- [ ] 16. Docs: admin guide "Statistics" (filter, CSV, what each section means, the caveats),
      `CHANGELOG.md`, a release-notes highlight, a screenshot in `docs/screenshots/`. Full
      `make test-e2e`.
- [ ] 17. **Finish**: summary in PROGRESS.md, including open Questions, then delete `.claude/run/`.

## Not in this run

The "Later" section of `docs/dev/statistics-proposal.md` (new data to collect), session kinds,
anonymous feedback (#1053), a site-wide (all events) statistics page.
