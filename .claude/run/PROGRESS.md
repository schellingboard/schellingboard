# Progress

## Facts for this run

- No pushes, no PRs (the user's rule); commits stay local. No real event database is available
  (privacy): old data is checked through the release-upgrade fixtures and the dev seed. The user's
  past event runs 3.8.1 and is upgraded to 5.0.0 before they use the page.
- Steps 1-15 done (see PLAN.md). How to add a figure: add tables in
  `server/modules/stats/application/<section>.ts` (helpers `col`, `percent`, `round`, `tallyVotes`
  in `cells.ts`), facts in `packages/domain/src/stats/facts.ts` and
  `db/repositories/sqlite/stats.ts`, register in `statistics.ts`. The SPA groups tables into
  sections by the id prefix before the first `-` and renders any table generically; bind a chart in
  `features/admin/stats-charts.tsx` (`chartFor`, by table id); new Plot marks go in
  `ui/charts/plot.ts` first. Column keys are read by the charts, so keep them stable.
- Conventions: percent cells are 0-100; a null cell is No data; `datetime` cells are strings
  formatted server-side in the event zone; the CSV route is `/stats/<table>.csv`; downloads are
  plain `<a download>` links; the filter is URL-only. Per-person tables use `pseudonymize` (number
  rows, sorted, no ids). The integration test event is built in
  `tests/integration/api-stats.test.ts`; large dev seed (`SEED_PROFILE=large`) has Conference Gamma
  with volunteer shifts and reports.
- Filter: sessions with all hosts / all locations excluded, or an excluded origin, leave the session
  figures; an excluded host leaves the people figures; filtered sessions and blockers still occupy
  their room in location figures; "became a session" counts any non-blocker session.
- Charts: Observable Plot 0.6.19 behind `PlotFrame`; colours are `--chart-1..4` tokens; no tooltips;
  the table always stays visible under its chart.
- Attendance model: inputs per event are N = members after the filter, P = mean concurrency of all
  non-blocker timed sessions (not filtered), s-bar = mean interest share per proposal; the report is
  a point, so "inside the range" means the count lies in it; label every use "model fitted on one
  event, n = 13". Step 9 cuts: no capacity tick on the popularity chart; a host counts as reporting
  when any ended session of theirs has a count.
- Only session hosts can be excluded in the filter (proposal-only hosts cannot). The E2E runs on the
  small profile and does not exercise the origin filter. Gamma's counts sit on sessions that have
  not happened: use the dev clock to view them as past.
- Test notes: Plot under happy-dom has no canvas legend; charts are found by role `img` and their
  `summary`. Admin code must stay in `admin-pages.tsx`'s module graph (lazy chunk).
- 1-on-1s (`meetings.ts`): a meeting with an excluded host on either side leaves all figures;
  expired = pending with slot ended; free-text meeting points are only counted as "Other" (never
  shown); empty rows = No data when no availability and no requests; hours merge across a clock
  change.
- Step 15: profile/comment tables are absent (not empty) when the event has no such data;
  notification tables show whenever members exist. Languages/based-in use `suppressSmall` (display
  casing of a group follows member order, so tests compare lowercase). Comment tombstones have no
  author, so only target filters them. `doublingEdges` lives in `cells.ts`.
- Fragment rule (locations): a gap is usable when a grid slot S >= gapStart - break fits a whole
  slot increment before the gap ends, grid anchored at the day's booking start.
- Not run yet: `make test-e2e-docker` (the bundle changed with fflate; run in the Finish step).

## Questions

- "Who did what" (Overview) can show a group of one member (e.g. "Neither: 1"). With the RSVP lists
  an admin already sees, that can reveal whether one named person voted. ADR 0019 §4 suppresses only
  free text, so it is not a violation; do you want groups under 3 suppressed?
