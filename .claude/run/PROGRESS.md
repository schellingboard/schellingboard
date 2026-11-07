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

## Questions

None.
