# Progress

## Decisions

- #789: card for host/attendee names, proposal hosts, comment authors, the 1-on-1 title and the
  booking rows; not the Liked-by list (a whole-row link that already shows the avatar). The
  directory loads on first hover (retry after an error at most every 30s); the hover card has its
  own directory query besides the directory screens' (sharing needs a refactor). `Tooltip` gained
  `interactive`, `as`, a describedby render prop, opens late content, and stacks at z-70.

- #861d: `schedule-grid.webp` and `og-image.jpg` recaptured (Gamma, so the keynote band shows).
  Release note: shared moments replaced the API highlight (organizers-only). No E2E has an attendee
  see a moment an admin made: the new event has no rooms.

- #861c: the agenda lists moments except under a search, Hidden or Clashes (`showsMoments`); My
  schedule keeps them. The text view is the Agenda view.

- #861b: day bands are absolutely positioned in the day grid (`MomentBands`), so cells keep their
  auto-placement; `DayWithSessions.moments` feeds the agenda too. The attendee guide screenshot
  `schedule-grid.webp` was not recaptured (`make screenshots`); do it at the end.

- #861a: moments have no `version`; of two admin edits at once the last wins (accepted).

## Problems

- #200: not checked in a browser at 390px (long URL, fixed vote bar); CSS read only.

## Questions

- #691: the script uses the API, not a browser, so identity requests per navigation (#1148) are
  counted as one per page load only.

- tests/unit/stats/correlation.test.ts "spearman property" failed once under fast-check in
  `make test-coverage`, passed on rerun; flaky, unrelated.

- #771: `getCurrentPhase` (earliest running phase, no production callers) and `phaseTimeline`
  (latest running) disagree where phases overlap; delete or align `getCurrentPhase`.

- #861 open questions, defaults assumed by the split (the proposal's, owner liked it): name "Shared
  moments" (owner unsure, no better one); amber `warning` colour; "During Lunch" popup line included
  in step 11; closing #465 is for the maintainer. Phase 1 admin ships before attendees see anything,
  so the changelog entry waits for step 11.

- #754: about 45 hand-written `<p role="alert" className="text-sm text-danger-fg">` errors (sign-in,
  reset-password, settings, proposal/profile forms, admin screens), the over-capacity errors in
  session-form and attendee-count-field, the avatar error in profile-form (no `role="alert"`) and
  the session-form clash box still have no icon; convert them to `FieldError` in a follow-up. The
  issue names only `FieldError`, notices and the summary.

- #1145: only Firefox is configured. Run once with Chromium enabled temporarily (config reverted):
  every assertion of the toolbar test, undo included, passed; the test then failed only on the
  console guard (a 401 from `/api/v1/me/identity` before login, which Firefox does not log).

- #969: new routes `GET /me/push-devices` and `DELETE /me/push-devices/{id}` beside the old
  endpoint-based check/forget routes (kept: the main toggle uses them). No E2E (push). Follow-up:
  `isEnabledHere` could be derived from `listDevices` (`some(current)`) and the old routes dropped.

- #684: `stats-table.tsx` keeps its own pager (client state, sizes 25/50/100, shown only above 10
  rows); `Pager` could replace it in a follow-up.

- #1169: property tests cover instants only, so DST and time zones do not apply (epoch arithmetic);
  seed is random as the issue decided, `FC_SEED` replays a failure.
- ESLint 10 (#380): `tseslint.config` is deprecated in favour of `defineConfig` (eslint.config.mjs);
  the Dockerfile runs on node 25 (odd-numbered, not an LTS line).

- #607: not converted (stay 24-hour): server-built 1-on-1 slot labels (availability form,
  candidates), admin screens, `commands/subject.ts` toasts, `scheduling-notice.ts`, and the profile
  arrival/departure. Grid axis in 12-hour shows "9 AM" on the hour, "9:30" otherwise. Playwright is
  pinned to `en-GB`. `theme.spec.ts:44` (theme-color meta strict-mode, 3 elements) failed in my
  runs; it concerns no code I touched, baseline not verified. `make test` failed only on mailpit
  (mailer tests, port 8025 down).

- Questions: `theme.spec.ts:44` fails because `SiteLoginPage` (account-pages.tsx) nests a second
  `ThemeProvider` inside `ShellProviders` (router.tsx), giving 3 theme-color meta tags. Separate
  fix.
- #607 TDD: the formatter and setting tests were written after the code (no red run).

- #993: the server returns all of the guest's live comments (no page/filter params; the screen
  filters by kind, event and text, and pages with `Pager` in the URL, as admin lists do). No access
  filter beyond authorship: comment reads in this codebase have none. `comments` is now a reserved
  event slug. Rows carry the server-built `url` (`#comment-<id>`). TDD: red run was 404 on
  `/me/comments`.

## Next step

Step 22 (#1046).
