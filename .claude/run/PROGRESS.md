# Progress

## Decisions

- Session branch: `claude/spa-schedule`. No pushes (the user's rule).
- ADR 0015 accepted on 2026-10-08.

## Step 1: baseline (2026-10-08)

- `make test-e2e`: 207 passed, 1 flaky (`profile-comments.spec.ts:95`, the known
  load-only flake; passes on retry and alone). The run exits red only because
  `failOnFlakyTests` is on locally.
- `make test-e2e-docker`: 208 passed.
- No failure comes from the last run's commits; no fix step needed.

## Step 2 (2026-10-08)

- A 2 s grace (`RECONNECT_GRACE_MS`) after any drop keeps the state `live`; the
  store cannot tell a planned stream end from a failure, so the grace covers both.
  The feed sends `retry: 1000` with its first message so browsers reconnect inside
  the grace (an integration test ties the two).
- No CHANGELOG entry: the sync indicator is itself unreleased (#1111's entry).

## Step 3a (2026-10-08)

- `acting-guest` reads the auth credentials through a new `pageReads()` query.
  The dependency-cruiser rule now covers `utils/`; the helpers still to convert
  (3b, 3c) sit on its allow-list until then.

## Step 3b (2026-10-08)

- The meeting helpers and `guest-clashes` take their repositories from the caller;
  the meetings module's page reads (`pageReads().meetingViews` and the like) bind
  them for `app/`. Their integration tests call those. Server modules keep passing their own repos.

## Step 3c (2026-10-08)

- `dispatchDueReminders` takes its repositories; `dispatchReminders()` in
  `composition.ts` serves the dev action and tests, the job loop passes the
  container itself (it is allow-listed with the other job plumbing).
- Step 3 done: the rule covers `utils/` with only jobs, notifications and push allowed.

## Step 4a (2026-10-08)

- New change types `proposal.joined` and `comment.created` (all three subject
  kinds), audience `none`: logged for the reaction, projected to no one. The
  comment entry keeps only the comment's id, author and time, not its body. The
  reaction (renamed `changeNotifications`, stored name `session-notifications`
  kept so its cursor stays) handles them. Use cases no longer take
  `notifyProposalJoined` / `notifyCommented`.
- Co-hosts added belongs to the sessions family, so it moves to 4b.
- Tests that waited for `after()` tasks now call `runJobs()`.

## Step 4b (2026-10-08)

- New change type `session.cohostsAdded` (ids of the added hosts, audience `none`),
  recorded by the four paths that created or edited a session with new hosts.
  The seed path records none, so it stays silent as before. The existing reaction
  loads the session when it runs. `notifyCohostsAdded` is no longer a use-case
  dependency.

## Step 4c (2026-10-08)

- New change types `meeting.requested` and `meeting.answered` (meeting id, plus
  the outcome for the latter; audience `none`), recorded beside `meeting.changed`
  in the request, respond and cancel use cases. The existing reaction loads the
  meeting and notifies; a meeting that is gone is skipped. No use case takes a
  notify dependency any more, so step 4 is done and `composition.ts` has no `after()`.
- Tests that waited for the inline notice now call `runJobs()`.

## Step 5 (2026-10-08)

- `recordingSessionCascade` takes `{ tellAttendees }`; the day and location
  deletes set it, event and guest deletes do not. The flag rides on the
  `session.changed` / `session.deleted` payload next to `cascade`, and the
  reaction then notifies only the RSVPed guests (hosts get nothing, as settled).
  RSVP ids were already in the `session.deleted` payload. ADR 0014 open question 1
  marked answered.

## Step 6 (2026-10-08)

- `rsvpRefusal` in `packages/domain/src/rsvp-rule.ts` returns the reason code
  (guest not in event, not the scheduling phase, own session, full). The RSVP and
  withdraw use cases call it; the repository's atomic capacity insert stays as the
  guard against a race, mapping to the same `session.full`. The admin seeding path
  (no phase gate) does not use it.

## Step 7a (2026-10-08)

- `PUT /api/v1/me/identity` (choose) and `DELETE` (sign out) return `{ guestId }`
  and set the `guest` cookie. The use case returns an `Identity` and the adapters
  (route, `selectUserAction`) build the cookie. Protected names answer
  `403 guest.protected`; logging in stays on the legacy flow. The guest cookie
  builders moved to `utils/auth-cookies.ts` (Next-free) so `server/http` can use them.

## Step 7b (2026-10-08)

- Snapshot has `now` (from the request's clock, fake clock included); the feed's
  `ping` data is `{"now"}` using the cookie's offset read at connect. Health stays
  behind the site password and returns `version` plus `buildId`, read from
  `.next/BUILD_ID` (version outside a production build; untested in Docker).
- Release notes moved to `packages/domain/src/release-notes.ts`.

## Step 8 (2026-10-08)

- `basePath` was refused by this Next (root rewrites to internal paths), so the user
  chose `app/legacy/` (ADR 0015 amended in its own commit). `(login)`, `(site)` and
  `admin` pages moved there; `proxy.ts` redirects any root path other than `/api`
  and `/media` to `/legacy` + path (query kept) and runs its gates on the path
  without the prefix. Static public files and `sw.js` are excluded by the matcher.
- Notification links stay root-relative for email and push; the in-app open action
  redirects to `/legacy` + url directly (a root hop dropped the profile modal).
- Review: the proxy matcher also skips `one-on-one.webp` (root `<img>` path); unused
  `next.svg`/`vercel.svg` removed; `legacy` is a reserved event slug; the manifest keeps
  `start_url: "/"` (redirects, and the SPA will own it) and the pinned `id`. No E2E for
  the picture: it only shows when rooms have images, which no spec sets up.
- E2E fixes were URL assertions only (`/login`, `/guests`, a slug prefix).

## Step 9a (2026-10-09)

- `apps/web` (workspace `apps/*`): Vite 8.3.0, plugin-react 6.1.1, TanStack Router
  1.170.38 (code-based routes, no router plugin), `@tailwindcss/vite` 4.3.3, happy-dom
  20.14.4, all pinned exact and at least two weeks old. Built to `apps/web/dist` with
  base `/_spa/`.
- The colour tokens, `loc-*` classes and utilities moved from `app/globals.css` to
  `styles/tokens.css`, imported by both CSS entries; the contrast tests read the new file.
- Vitest uses `projects` (`server`, and `apps/web/vitest.config.ts` with happy-dom).
- `tsc -b apps/web` joins `make typecheck`; depcruise covers `apps` with four rules.
- The catch-all route replaces the location with `/legacy` + path + query + hash
  (`window.location.replace`); a path already under `/legacy` is left alone.

## Step 9b (2026-10-09)

- The proxy no longer redirects root pages: after the site gate (admin paths skip it: the forwarded `/legacy/admin` request meets the admin gate)
  it rewrites them to `/api/spa/shell`, a route handler reading `apps/web/dist/index.html`
  from `process.cwd()` on each request (`no-store`; 503 when not built). `/_spa/**` skips
  the proxy (matcher) and `next.config.js` rewrites it to `/api/spa/assets/**` (hashed,
  immutable; 404 for anything missing, `..` or the shell file, never the shell).
- The login redirect for a root path now returns to the root path; the SPA forwards it.
- The Playwright web server runs `vite build` before `next build`.

## Step 9c (2026-10-09)

- `make dev` runs `scripts/dev.ts`: Next on `PORT + 1`, Vite on `PORT` proxying `/legacy`,
  `/api`, `/media` and the other Next paths (websockets included). Not exercised here
  beyond the config; the tiers below run against the built app.
- Dockerfile builds the SPA before Next and copies `apps/web/dist` to `/app/apps/web/dist`;
  `make test-e2e-docker` shows the standalone image serves the shell and assets from disk.
- E2E: the `page.goto` fixture sends root paths to `/legacy/...` directly (through the
  shell a click could land before hydration: the profile:577 and settings map-modal
  flakes); `pwa.spec.ts` "an old root link reaches its page" (@014-US4) covers the
  shell's forward. `--repeat-each` makes user-auth:270 fail by itself (it leaves
  Ahmad protected), so it is not a measure.
- Review fixes: `<noscript>` link to `/legacy` and an inline script copying the `sb-theme`
  cookie to `<html>` (no light flash) in `index.html`; the screenshots script uses
  `/legacy/...`; ADR 0015 now says root `/admin*` skips the site gate; spa-files test uses
  a nested temp dir. Not changed: React/tailwind/@types carets (they mirror the root
  package.json, so one copy is installed); the vacuous depcruise rules (they bite once
  `apps/web` imports packages); dev-proxy prefix matching and POST 405 (harmless).
- Final E2E after the review fixes: `make test-e2e` 209 passed at low load. At high load
  (25+) schedule-layout:252 ("grid keeps its place") failed in the full run and in
  `make test-e2e-docker` (scroll 432 vs 400, same value both times; 206 passed otherwise),
  yet passed alone 9 of 9 times, with `rsvp`+`schedule-layout` together, and in the clean
  full run. Not repeatable with `--repeat-each` (it books a fixed slot, so later repeats
  fail on the taken 18:10). Judged a load flake in the legacy grid's scroll restore, not
  the shell: the spec now goes to `/legacy` directly, as before step 9.
- `app/api/spa/**` is out of scope of the mutating-surface guard (read-only static files).
- Docs: `docs/dev/web-app.md` (new), getting-started, architecture-rules, README, nav.

## Step 10a (2026-10-09)

- `apps/web/src/replica/` holds copies of `apply`, `store`, `sync-state` (grace fix
  included), `feed-client` (`retry:` coupling included), `live-replica` and
  `selectors`, with their tests moved beside them (happy-dom). Copied, not moved to a
  package: they depend only on `contracts`, but the legacy copy lives until step 16
  and a new `packages/replica` would need its own rules for one consumer. The
  `rsvp-overlay` and the React hooks are not copied (steps 11 and 12).
- `selectors.ts` defines its own `DayWithSessions` rather than reaching into `app/`.
  The web tests use their own `snapshot-fixture.ts`; delete `tests/helpers/`'s copy
  with the legacy replica at step 16.
- `apps/web` now declares `contracts`, `domain` (workspace), `fast-check` 4.10.2 and
  `fake-indexeddb` 6.2.5. The web Vitest config registers the use-case tags like the
  server project (the config may import `tests/use-cases`). depcruise: dependency-cruiser
  reads `workspaces` from the importer's own manifest, so by-name imports inside
  `apps/web` are `undetermined`; `import-packages-by-name` now accepts that type.

## Step 10b (2026-10-09)

- The store keeps a clock offset (`serverNow()`): the snapshot's `now` on construction,
  `replace` and a newer `adopt`, and the feed ping's `{now}`, each against `Date.now()`
  at receipt (latency is ignored; the error is well under a second). Step 10c must not
  observe the `now` of a persisted snapshot.

## Step 10c (2026-10-09)

- `persistence.ts`: one IndexedDB record per (event, viewer or anonymous); `save` also
  deletes the event's other viewers' records (the user-switch clearing, derived from the
  snapshot's `me`), `load` validates with `snapshotSchema` and reads every failure as
  absent. `openReplica` returns the persisted copy as a store whose link starts `stale`
  and whose clock offset ignores the old `now`, else a network snapshot; `autosaveReplica`
  saves 1 s after the last change. The feed already resumes from `store.get().seq`.
- Not wired to a screen yet: `live-replica` still takes a seed; step 12 composes
  `openReplica`, `connectFeed` and `autosaveReplica` in the SPA shell.

- Review of 10: `openReplica` discards the event's other viewers' copies and `load`
  refuses a record whose `me.guestId` is not the asked viewer (tests). Step 12 must pass
  the guest the feed will be opened for as `viewer` (from the user picker's cookie), never
  one read from the persisted copy. Kept as is: `adopt` observing `now` (the SPA only
  adopts freshly fetched snapshots, no SSR seeds) and offset 0 for a persisted store until
  the first ping or snapshot (device clock is the fallback); the shared 007-US8 tag.

## Step 11a (2026-10-09)

- `apps/web/src/commands/runner.ts`: `createCommandRunner({store, api, newKey})`.
  `run(command, input)` predicts with the command's policy (a refusal returns
  `{ok:false, code}` and sends nothing), keeps a pending projection keyed by the
  `Idempotency-Key`, and calls the API. `view()` is the replica with the projections
  applied (the replica itself when none). A pending entry ends when the feed delivers
  its key, when the response says the click changed nothing, or 3 s after the response
  once the feed has moved past the click (the legacy overlay's rules). A 4xx removes it
  and returns the problem `code`; a network error or 5xx retries with the same key
  (1, 2, 4, 8, 16 s), then rolls back as `network.unreachable`. Pending entries of a
  guest who is no longer the viewer are dropped. The RSVP count prediction applies only
  while the replica still holds the click-time count, so a feed count is never doubled.
- Tests drive a real `api-client` over a fake `fetch` (`commands/fake-api.ts`).
- The guest and fixture `now` in tests: the web fixture's `now` is before its scheduling
  phase, so command tests move `now` to `iso(10)`.

## Step 11b (2026-10-09)

- `commands/comment.ts`: `createComment` for a session, proposal or profile (guest) subject,
  with an optional parent. Comments are not in the replica, so its prediction has no
  projection: an empty or over-long body is refused (`comment.invalid`, from
  `commentCreateSchema`), and the created comment comes back as `data` for the caller
  to add to its query (11c). The same key is resent on a network error, so a retry
  makes one comment.

## Step 11c (2026-10-09)

- `queries/attendees.ts` (`createAttendeesQuery`: `refresh`, keeps the earlier list while
  reloading, `attendeeGuests` names them from the replica's guests) and
  `queries/comments.ts` (`createCommentsQuery`: `loadMore` by cursor, one request at a
  time, a failed page is asked again, `add` for a just-created comment, deduped by id).
  Both are small observable stores (`get`/`subscribe`) for step 12's React bindings.
- Decisions: retries are 1, 2, 4, 8, 16 s, then `network.unreachable`; 5xx retries like
  a network error because the key makes it safe. Pending commands are not persisted
  across a reload. `apps/web` now declares `@schellingboard/api-client`.

## Next step

13g.

## Questions

- A session that loses its only room reads `"X" moved to No location (was Room A)`
  in notices; common now with location deletes. Reword if wanted.

- `utils/guest-clashes.ts` imports `@/app/(site)/session_utils`, so `server/modules/`
  reaches `app/` transitively, which `server-does-not-reach-into-app` does not catch.
  Move the two helpers it uses to `packages/domain` or `utils/`.

## Step 12.0 (2026-10-09)

- No SPA-side viewer source existed (`snapshot.me` is per event and absent outside one).
  Added `GET /api/v1/me/identity` -> `{guestId|null}` (verified acting guest: a protected
  name without a verified cookie, or a deleted guest, reads null). The shell's viewer
  provider reads it once at start and after the picker/sign-out.

## Step 12a (2026-10-09)

- Added `@testing-library/react` 16.3.0, `dom` 10.4.0, `user-event` 14.6.1 (exact pins, old
  enough) for component tests; `src/test-setup.ts` runs `cleanup`. Primitives are plain
  elements (no headlessui/heroicons dependency in the SPA): `ui/dialog` (Escape, backdrop,
  Close button, focus in and back), `ui/button`; `app/layout` (skip link) and `app/nav-bar`
  (events as `/legacy/<slug>` links, mobile menu, trailing slot).

## Step 12b (2026-10-09)

- `app/viewer.tsx`: `ViewerProvider`/`useViewer` over `GET/PUT/DELETE /api/v1/me/identity`
  (`guestId` undefined while unknown; a network failure keeps it unknown). `app/user-menu.tsx`:
  name chip, searchable name dialog, profile/settings links to `/legacy/...`, log out reloads.
  A protected name goes to `/legacy/auth/login?guest=<id>` (the emailed-link landing page; it
  asks for password or code and returns to `/legacy`).
- Open: the picker lists whatever guests it is given. The legacy picker lists all guests; the
  SPA only has an event's snapshot guests (members and hosts) and `GET /guests` is closed to
  anonymous visitors. Step 13 passes the snapshot's guests; a non-member cannot pick their
  name in the SPA until that is decided.

## Step 12c (2026-10-09)

- `GET /api/v1/health` gained `devTools` (the SPA cannot read the server env). `app/theme.tsx`
  (cookie + class + theme-color metas, consistent with the Next one and index.html's script),
  `app/footer.tsx` (version button, release notes dialog from domain, `ui/inline-markdown`
  for bold and code only), `app/health.tsx`, `app/dev-toolbar.tsx` (time travel only).

## Step 12d (2026-10-09)

- `app/sync-indicator.tsx` (`useSyncState` on the store's link, timer at `nextChangeAt`),
  `app/error-boundary.tsx`, and `app/shell.tsx` composing all of step 12 from props. The shell
  is not mounted; the catch-all forwards as before, so nothing user-visible changed and no
  CHANGELOG entry. Step 13 must: fetch events (`GET /api/v1/events`) for the nav, pass the
  snapshot's guests to the picker, mount `Shell` for SPA-owned routes, and compose
  `openReplica` + `connectFeed` + `autosaveReplica` with `useViewer().guestId` as viewer and
  `newKey` from `app/keys.ts`. `onClockChange` should reload the replica.
- Tests were written before the code; the red run was the missing modules.

## Step 13a (2026-10-09)

- `apps/web/src/schedule/` holds the schedule's pure logic. Judged COPY, not a move to
  `packages/domain`: the utils take `MeetingView` (a server-side type in `utils/meeting-views`)
  and the legacy tests live under `tests/unit`; both legacy copies go at step 16. Copied with
  their tests: grid-layout, column (schedule-column), meeting-column, agenda, fold, filters,
  search, meeting-rules, meeting-clash-text. `meeting-view.ts` infers the type from the
  contract. New and tested: `meetings.ts` (`meetingViewsFrom(snapshot, now)`: the viewer's
  1-on-1s from `snapshot.me`, clashes always empty as the replica holds no other guest's RSVPs),
  `model.ts` (location narrowing, search/filter match, per-day entries, counts, grid and agenda
  day-fold rules), `nowScrollTop`. `apps/web` now declares `luxon`, `@types/luxon` and `zod`.

## Step 13b (2026-10-09)

- Grid in `apps/web/src/schedule/`: `context.tsx` (`ScheduleProvider`/`useSchedule`: the
  `ScheduleData` read from a snapshot at an instant, `links`, the page's search params;
  `useScheduleMatch` for ghosting), `day-grid`, `location-col`, `session-block`, `now-line`,
  `day-fold-bar`, `grid-view` (filter bar, footer and stepper are slots for 13c). `links.ts` is
  the single place that sends session, meeting, add-session and booking links to `/legacy/...`.
  Icons are copied heroicon paths in `ui/icons.tsx`; `ui/tooltip` (rest-to-open hover, focus,
  toggleable room details), `ui/plain-text` (regex markdown strip for the session tooltip; the
  server-side parser is not shipped to the browser).
- Not carried over, on purpose: the RSVP badge on a block is display only (no click-to-RSVP, no
  clash confirm, no name picker). The runner exists (11); step 15 must give the grid badge its
  click, before step 16 routes `/{slug}`.
- eslint: `@next/next/no-img-element` is off for `apps/web`.

## Step 13c (2026-10-09)

- `ScheduleScreen` (`schedule/schedule-screen.tsx`): takes `snapshot`, `now`, `links`, `params`
  (+ `onParamsChange`), a `sync` slot and a `footer` slot. The view, `filter` chips and `loc` live
  in the params (controlled by whoever owns the address bar; legacy kept filters in local state
  mirrored to the URL); the search text and the unfolded days are local. Agenda gets all rooms,
  the grid the `?loc=` ones, as in legacy. Search stepping (Enter, stepper) is grid-only, as in
  legacy. `Footer` has an `inline` copy (the page's own is hidden by CSS while the schedule frame
  is mounted, `data-site-footer`).
- Event details render the description with a small `ui/markdown` (paragraphs, bullet lists,
  bold, italics, code, http(s) links), not the server's full markdown renderer.
- Not carried over: pull-to-refresh (decided in 13d, see there).

## Step 13d (2026-10-09)

- Copied with tests: `use-drag-to-pan`, `use-scroll-restoration` (session storage per
  `{slug}:{view}`), `pull-to-refresh` (now takes `onReload`; the screen's `onReload` prop).
  `meetings-col.tsx`: the viewer's own 1-on-1s, read-only, from the replica
  (`snapshot.me.meetings`); single, stacked and summary blocks, the "Only you see these"
  header, the picture, free/blocked slots. Every link out (meeting, "Arrange a 1-on-1" in a
  free slot) goes through `links.ts` to the legacy schedule, the one place to switch. The
  hover summary's clash lines are empty: the replica holds no other guest's RSVPs.
- Legacy refetches the meetings on mount and on feed changes (`/api/meetings`); the SPA reads
  them straight from the replica, which the feed keeps current.

## Step 13e (2026-10-09)

- `replica/session.ts` (`startReplicaSession`): `openReplica` + `connectFeed` + `autosaveReplica` +
  hidden-tab (30 s) and back/forward-cache handling, tested with fake sources. `app/use-schedule-session`
  keys it by (slug, viewer from `useViewer()`, retry): a viewer change closes the feed and the runner and
  opens the event again; 404 is `missing`, other failures `failed` with a retry. `app/schedule-page.tsx`
  composes events nav (`GET /api/v1/events`), the snapshot's guests for the picker, `useServerNow`, the
  proposals redirect for a non-scheduling phase, the deleted-event message; `Shell` split into
  `ShellProviders` + `ShellFrame`. Tested through a test-local router; not routed.
- User decision (2026-10-09): no preview route or flag. The SPA takes `/{slug}` itself (13g). Because
  the session modal (15), kiosk (14) and the meeting modal are not SPA yet, 13g forwards the queries that
  need them to the legacy schedule; the Next schedule page therefore stays until step 16, and then for
  the meeting modal (`viewMeeting`) until the meetings family moves. PLAN steps 13f-g, 14, 16 changed.
- Open: the SPA picker offers only the snapshot's guests (members and hosts).

## Step 13f (2026-10-09)

- The grid block's RSVP badge is a button (`RSVP to X` / `Withdraw RSVP from X`; a host's own session
  keeps a plain badge), as in legacy: no viewer asks for a name (`NamePicker`, now exported; choosing
  one reopens the event as them, the click is not replayed), an overlapping session or accepted 1-on-1
  asks first (`schedule/rsvp-clash.ts`, copied with its test), a refusal shows its message. The page
  maps the runner's outcome code to the server's wording; `ScheduleActions` is the screen's way out.

## Step 13g (2026-10-09)

- The router owns `/{slug}` and renders the SPA schedule. `kiosk` (query or cookie), `viewSession` and
  `viewMeeting` hand the address to the legacy schedule (`app/forwards-to-legacy.ts`); a static route per
  legacy root page (`app/legacy-pages.ts`, checked against `app/legacy/` by a unit test) keeps a slug from
  shadowing `/settings` etc. Legacy links to the schedule point at `/{slug}` (`AppLink`, plain anchor);
  `POST /api/auth/logout` serves the SPA's sign-out; header links and user menu in the SPA shell.
- E2E fixture opens `/{slug}` as the SPA's own; specs that open the legacy session modal start on
  `/legacy/...` (attendee-count, rsvp, scheduling, update-session, add-session): arriving from the SPA,
  a click can land before the legacy page hydrates.
- Attendee-count after an SPA->legacy hop (reviewer 2): isolated with a probe. Host "Edit" link and the
  dev clock (15:00 UTC, +335h) are right, and the field appears within ~200 ms. Only
  `attendee-count.spec` "saving announces..." (with its `page.route`) stays red on the SPA path, so the
  cause is not the clock or `isHost`; unexplained, specs start on `/legacy/...` meanwhile (Questions).
- Saving or deleting a session still lands on `/legacy/{slug}` (reviewer 3 rejected): a hard navigation to the
  SPA drops the confirmation toast, which is client state (11 specs failed when tried). The SPA needs its own toast first.
- Final E2E: `make test-e2e-docker` 209 passed; `make test-e2e` 208 passed, 1 flaky
  (live-schedule.spec:62, passed on retry; it flaked earlier in this step too, as did voting:140 and
  live-schedule:112, specs this step does not touch).
- Questions: user-menu roles (menu/combobox) copy the legacy markup without arrow keys; left as is.
