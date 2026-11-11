# Progress

## Decisions

- 23b (#831): notifications load server chunks of 50 on demand, so Next stays on offer while more
  exist; "Select page" and the ticks are per page. Agenda: owner decided it stays one list (see
  docs/dev/web-app.md, "Paging long lists").
- 23d (#831): `usePaging` (ui/use-paging.tsx) bundles pageOf, handlers, ref and pager for lists;
  events, locations (reorder arrows use the absolute index) and stats tables use it. Stats tables
  keep their page in component state, not the URL: one page holds several of them, and the shared
  `page` names would collide. Event meetings has no list to page (chart points).
- 23a also added to `Pager`: `listTop` (scroll on page change), `showTotal`; `pageOf` returns
  `lastPage`, `total`; `showsPager`.

- 23a (#831): `Pager` default 50, sizes 25/50/100 (10 dropped; admin tables follow). Changing
  search, filter or sort drops `page` (`withFilter`, `withSort`, `useSearchParamText`, directory
  `withParams`); `paramsUpdater` in `list-paging.ts` adapts any param setter to `tableHandlers`.
  Pager shows only with more than one page or a non-default size. Not run: mailer tests (mailpit
  down) and the full E2E suite; the `admin.spec.ts` users paging test is adapted and passes.

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

- 22g (#1591): `PhaseBar` renders at the top of the proposals screen and in the schedule toolbar
  (not in the shell, which has no event data); hidden once the scheduling step is current or past.
  Segment width = `share` (real phase length, 20% minimum; last phase uses `schedulingPhaseEnd`).
  `scheduling-notice.ts` removed. No screenshot in `docs/` showed the old strip.

- 22h: `ListToolbar` (search | sort, chips | count at md+; search, chips, count+sort on phones).
  Count text is now "N results" (was "(N results)"), E2E regex adapted. Checked at 390/768/1440,
  light and dark, on the proposals and attendees pages: no empty corners (screenshots were
  temporary, not kept).

- 22f survey (ADR 0020: "views open in the side panel, tasks stay dialogs"; panel kinds today are
  read-only `session`, `proposal`, `meeting`, `profile`, each with a URL; non-modal, resizable
  320-800px on wide screens, full screen on phones; it already has `useDiscardGuard`). Per spot:
  - Create/edit proposal (`proposals/new`, `$id/edit`, ~360 lines): panel yes, effort M. Edit fits
    over the proposal view in the same stack; needs a new panel kind, `PanelLanding` background,
    save then close/replace instead of history Back.
  - Create/edit session (`add-session`, `edit-session?sessionID=`, ~780 lines, several inner
    dialogs): panel maybe, effort L. Keeps the grid visible (context, clash checks) but is cramped
    at 320-800px; the id is a query param, not a path. Phones are full screen either way.
  - Edit profile (`/guests/edit`, long): panel yes, effort M; clashes with the `/guests/$id`
    pattern; profile host already at the root.
  - "Need ideas?" (`ProposalHelp`, short read-only dialog, no URL): keep as a dialog per ADR, or
    panel only if the form itself is a panel (tips stay readable beside it); effort S either way.
  - Quick Voting (swipe mode, not a form): keep a page (M, little gain).
  - Event details dialog (schedule toolbar, read-only): panel yes (it is a view), effort S-M.
  - "N 1-on-1s" list dialog (meetings column): keep a dialog (short list); a panel is possible.
  - Booking 1-on-1, meeting request, confirmations, What's new, map, who-are-you, stats figure,
    Liked by: keep dialogs (ADR, short tasks). Settings, auth, notifications, my comments, admin
    (own frame and nav): keep pages. Comment edit: already inline in the panels.
  - Gaps if forms move in: `useDiscardGuard` only watches focused-and-changed text fields (not
    selects, checkboxes, dates, browser Back, `beforeunload`); the session and proposal forms do not
    use it yet.

- 22h: before/after screenshots were not kept (temporary files outside the repo).
- 22f issue: creating the GitHub issue was denied by the permission system. Body drafted (this
  survey + the 5 questions); type Feature, priority Low, `component: ui/ux`. The owner or a run with
  permission should create it.

## Problems

- #200: not checked in a browser at 390px (long URL, fixed vote bar); CSS read only.

## Questions

- 22f (owner, answered): all create/edit forms go into the panel (plan step 35); agenda stays one
  list; no 22f GitHub issue; installed-app share: text "Copy link" at the end of panel content (step
  24a).

- `profile-photo.spec.ts:9` fails without my changes too (about-me heading x 849 < 1184: the wide
  two-column layout is not reached at the default viewport). Separate fix.
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

- #1046: the nudge uses the `meetingRequest` setting, the "opened up" notice `meetingResponse` (an
  answer to your ask). "Open" means a declared slot still ahead. Changing an event's slot increment
  deletes availability, so an answered nudge then stays "Asked" (accepted). The nudge shows only
  while the guest has declared no slots; once asked it stays "Asked" even if they later clear their
  slots. The announcement to all attendees was left out, as decided. No release-notes entry (not a
  headline). Meeting-options response is now `{options, nudges}`. `MeetingBookingCalls` is the
  schedule's slice of `meetingRequestCalls`. TDD: red was `askToOpenUp is not a function`. Mailer
  tests not run (mailpit down).

- 22b: the button was "Share" (⤴) in `SidePanel`, shared by all panels, so all lost it; `shareUrl`
  prop removed everywhere. No issue, no E2E or guide mention existed.

- 24: Lingui 6 (pinned exactly) with `lingui({ macroTransform: true })` in `vite.config.ts` and
  `vitest.config.ts`, so `t`/`<Trans>` macros work. The `en` catalog is imported statically in
  `i18n/index.tsx` (works offline, no blank first paint); other locales load lazily, so step 25/7
  must make the service worker cache those chunks. Use case 022-US1.

- 25: no `PATCH /me` exists, so the language is `PUT /me/locale` (`{locale: "en"|null}`, validated
  against `LOCALES` in `packages/domain/src/locales.ts`, which now holds `resolveLocale` and
  `acceptedLanguages` for the server's later emails). `GET /me/identity` returns `locale`; the
  viewer hands it to `I18nProvider` (`useStoredLocale`, kept in `localStorage` `sb-locale`, cleared
  on sign-out). Switcher: `features/settings/language-setting.tsx`, shown when `LOCALES.length > 1`.
  Still open for step 30: service worker must cache the lazy locale chunks.

- 26 (#1328c): formatting follows `formatLocale(uiLocale, navigator.languages)`: the browser's
  regional tag when it has the app's language (en + en-GB), else the app's locale; so no visible
  change while only `en` exists. Provider sets Luxon `Settings.defaultLocale` once a locale
  activates and offers `useFormatLocale()`; Automatic time format uses `clockStyleFor(it)`.
  `formatRelativeTime` takes a locale (default `en`; "just now" waits for string externalizing).
  Domain Luxon helpers (`formatDayLabel` etc.) got no locale parameter: the web relies on Luxon's
  default; step 29 must pass the recipient's locale when the server needs it. Not converted: footer
  date (fixed `en-GB`), `formatDuration` ("25m"), the server's `Intl` use. Components that format
  without reading `useFormatLocale` or the time format re-render with a locale change only on their
  next render. Review fixes: choosing a name returns `locale` (no second GET); `acceptedLanguages`
  dropped (re-add in step 29); copy-link status region is always rendered, so the E2E `toast()`
  helper skips empty statuses. Not run: E2E, mailer tests (mailpit down); `make test` locally needs
  the env that `make` sets (plain vitest fails on AUTH_SECRET).

## Next step

No step is open. Wait for the coordinator (step 27 onwards, 35 only on request).
