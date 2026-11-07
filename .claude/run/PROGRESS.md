# Progress

## Facts for this run

- No pushes, no PRs (the user's rule); commits stay local.
- No real event database is available (privacy). Old data is checked through the release-upgrade
  fixtures and the dev seed only.
- The user's past event runs 3.8.1 and is upgraded to 5.0.0 before they use the page.

- Step 1 done. New admin code goes in `admin-pages.tsx`'s module graph so it stays in the lazy
  chunk.
- Environment: fixed (26 `make arch` false violations from the .bun layout, `make lint` heap); done
  outside the plan, commit 67e4a948.
- Step 2 done: chart library is Observable Plot 0.6.19. Plot needs a ResizeObserver wrapper, token
  colours read via `getComputedStyle` for colour scales, no canvas legend under happy-dom.
- Step 3 done: decisions in ADR 0019, the figure catalogue in `docs/dev/statistics.md` (split from
  the proposal so the catalogue survives; the plan said the proposal keeps only "Later").
- Step 4 done. Import as `@schellingboard/domain/stats/<file>`. `pseudonymize` takes number rows
  only (no ids) and sorts them, so ties cannot leak an id order. `encodeCsv` guards `= + - @ tab CR`
  in text. `predictAttendance` returns null for share 0, no voters or no mean share. Use cases
  021-US1..US4 are `planned` until the UI exists; drop `planned` as steps 7+ land.
- Step 5 done. Add a section by adding tables in `application/` and fields to `EventFacts`
  (`packages/domain/src/stats/facts.ts`) and `db/repositories/sqlite/stats.ts`. Filter logic is
  `packages/domain/src/stats/filter.ts` (`applyFilter`). Percent cells are 0-100 numbers; a null
  cell is No data. The CSV route is `/stats/{file}` with `file` = `<table>.csv` (Hono cannot match
  `{table}.csv`). Hosts are listed for the filter by guest id and name (hosts are public). The
  integration test builds its event in `tests/integration/api-stats.test.ts`.
- Decisions (step 5): the filter drops proposals whose hosts are all excluded. Only session hosts
  can be excluded, so an organizer account that only proposes cannot leave the people figures;
  accepted for now. Hosts and Hosted both count excluded-host-free members who host a kept session.
- Step 6 done. Large profile only (`SEED_PROFILE=large make dev-db-seed`), so the small profile and
  E2E are unchanged. Gamma is not ended, so the attendee counts sit on its first 10 curated sessions
  although they have not happened; use the dev clock to view them as past. Shifts are origin
  `organizer`, as are the curated admin-managed sessions; the shift locations are
  `loc-volunteers-1/2`. The seed test is `tests/integration/seed-statistics.test.ts`.
- Step 7 done. Add figures by adding tables on the server: the SPA groups tables into sections by
  the id prefix before the first `-` (labels in `SECTION_LABELS` in `event-stats.tsx`, `?section=`)
  and renders any table generically. Downloads are plain `<a download>` links to the API (cookie
  auth), so the file name comes from the server (`<event>-<table>[-filtered].csv`). The filter is
  URL-only (`excludeLocations`, `excludeHosts`, `excludeOrigins`, same format as the API; absent
  origins = blockers); changing it refetches while the old figures stay on screen. `datetime` cells
  are strings the server formats in the event's zone (`YYYY-MM-DD HH:mm`, like the CSV); the SPA
  shows them as given. Per-table cards, "Show table" toggles and charts come in step 8. The E2E runs
  on the small profile (no volunteers), so it excludes Garden Terrace and Yuki Tanaka on Conference
  Gamma; it does not exercise the origin filter. The server bundle banner import was renamed in its
  own `fix:` commit (fflate broke it); run `make test-e2e-docker` in the Finish step, since the
  bundle changed.
- Step 8 done. Bind a chart to a table in `features/admin/stats-charts.tsx` (`chartFor`, by table
  id); the chart sits above its table, which stays visible (no "Show table" toggle: the table is the
  accessible detail and the contrast relief). Wrappers take plain data plus a `summary` (the
  accessible name); colours are `--chart-1..4` tokens (validated, light and dark), used as
  `var(--chart-n)` in the SVG so a theme change needs no redraw; the heatmap is one hue with the
  value as opacity. No tooltips. Plot chunk is 93 kB gzip (`ui/charts/plot.ts` re-exports only the
  marks used: add a mark there before using it); main bundle 839.6 kB (+1.2 kB since step 1, from
  earlier steps; this step adds nothing to it), admin chunk 103 kB. `Scatter` shows rho and `n < 15`
  note; `Histogram` takes bins from `stats/binning`.

## Questions

None.
