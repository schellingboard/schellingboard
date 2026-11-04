# Progress

## The last run (path step 5, steps 1–22)

Proposals and voting, people and meetings, the session forms, settings, notifications and admin
moved to `apps/web`; their Next pages, components and server actions are deleted. Proposals and own
votes are in the snapshot and feed (ADR 0016); failed commands name their subject; forms use
`useFormMutation`. Only the sign-in screens and the root event list were left as Next pages.

## Facts for this run

- Session branch: `claude/spa-families`. No pushes, no PRs (the user's rule); commits stay local.
- `/admin/**` is the SPA's (`app/admin-pages.tsx`); `proxy.ts` serves its shell without the site
  password (404 when the admin UI is disabled); `/legacy/admin/login` and `/api/**` keep the admin
  gate. `tests/helpers/admin-api.ts`, `proposal-api.ts`, `comment-api.ts` call `/api/v1` for
  integration tests.
- `app/legacy-pages.ts` keeps "admin" (login is legacy); the router filters it out.
- The SPA picker sends a protected name to `/auth/login?guest=<id>`; login lands on `/`. Account
  security is `/account-security`, linked from Settings.
- Native `<option>` is not "visible" in Firefox: E2E use `toBeAttached()` / `toBeDisabled()`.
- Do not call `runner.stop()` or `query.destroy()` in a mount effect cleanup (StrictMode).
- jj: paths with `(site)`/`[id]` need `'file:"…"'`; `jj squash` needs `-m` or
  `--use-destination-message`; no `jj split`.
- Next serves `apps/web/dist`: rebuild the SPA (`make build` or the E2E web server does) before E2E.

- Login sessions (step 3): the `guest` cookie holds a 32-byte token without dots; values with a dot
  are no identity (step 5). `LoginAssurance` (`claimed`|`verified`) replaces `open`|`verified`
  everywhere. Resolve actors with `actorOf(cookies)` / `guestOfCookie(value)`
  (`server/kernel/session-actor.ts`), never `resolveActor` directly. Each sign-in deletes the
  browser's old row and writes a new one. Sessions age in real time (`utils/real-clock.ts`).
  `eventId` and `device` exist; `device` is the user agent from `PUT /me/identity` only. Tests make
  rows with `sessionGuestValue`.

- Sign-in API (step 4): `matchToken`/`recentlyIssued` live in `people/application/auth-tokens.ts`
  (internal to the module). `PeopleDeps.loginMail` sends the code. Expired, spent and wrong
  credentials all answer `auth.credentialWrong` (the repo has no lookup of dead codes; the old
  action did the same). `/auth/*` is exempt from idempotency keys; `/auth/login*` has a per-address
  limit (30 burst, `SB_AUTH_RATE_BURST`, set high in `.env.test`), skipped when `SB_TRUSTED_PROXIES`
  is unset. The proxy refuses cross-site `/api/v1/auth/*`. First protection keeps other browsers'
  claimed rows (they are told "protected"); a password reset or change revokes all.

- Sessions (step 5): `findLive` is a pure read; `refresh` (a write) runs from `session-actor.ts` at
  most daily. Repository methods named `find*`/`get*`/`list*` go to the read-only connection, so a
  write must not carry those prefixes. The browser cookie lives 400 days; the row decides. Test
  helper `openGuestValue` inserts a row on its own connection (sync); the guest must exist.
- Credentials (step 6): `LoginMail` also sends the reset link and the security-change mail. Reset
  and change/unprotect answer `auth.credentialWrong` (403) and the password path shares the
  per-guest login limiter; an unknown login `identifier` is limited per spelling. Protecting a name
  is a reset link (no separate endpoint). Usernames: 3-32 chars `[a-z0-9._-]`, lowercased, never an
  email.
- Sign-in screens (step 7): they take `calls`, a `guest` and (security) a `state`; the router in
  step 8 supplies the guest (from the directory for the link's `?guest=`) and `reload`. The login
  form's guest is `undefined` for a plain sign-in and `null` for a link naming nobody. `getUsername`
  is back (step 6 review item 3 removed it unused; `GET /me/credentials` uses it).
- Step 6 review, minor 3-7: all fixed except 5 (`unprotect` and `resetPassword` outside one
  transaction): rejected, since unprotect needs the current password and a raced reset link only
  lets two holders of the same link each pick a password.

- Step 7 checks: all of `make precommit` green; E2E 214 passed, 1 flaky
  (`meetings-request.spec.ts:296`, known; passes alone, and `make` still exits 1 on a flaky test).
  Commit id: see the log.

- Step 7 review: all 8 findings accepted. The login form keeps the legacy copy when a guest is
  named.

- Step 8: `app/legacy/(site)/` keeps only `lock-icon.tsx` and `markdown.tsx` (imported by
  `select-hosts`/`whats-new`); `LEGACY_ROOT_PAGES` is `admin`, `login`. The `/auth/*` slug is no
  longer reserved. `settings.spec.ts` "map modal" is `test.fixme` until step 14 (the "Show map"
  button was the legacy layout's, the SPA shell has none). Checks: `make precommit` green up to E2E;
  E2E 213 passed, 1 skipped (the fixme), 1 flaky (`theme.spec.ts:11`, passes on retry; `make` exits
  1 on a flaky test). `Viewer.refresh` re-reads the identity after a reset. Commit id: see the log.
  Step 8 review: all 6 findings fixed (API tests for the deleted action rules, `Viewer.refresh`
  error handling, directory-failure states); none rejected.

- Step 9: `LEGACY_ROOT_PAGES` is `admin` only and the router has no static legacy routes left; an
  unauthenticated `/legacy/...` redirects to `/login?redirect=`. `/api/v1/health` and
  `/api/v1/auth/site` skip the site gate (not under `/legacy`). `/api/auth/logout` (Next route) is
  still how the SPA ends the site login. Checks: format, lint, arch, openapi, typecheck, test green;
  E2E 213 passed, 1 skipped (map fixme), 1 flaky (`release-notes.spec.ts:11`, passes on retry). Step
  9 review: all 3 findings fixed (the redirect check is `safeRedirectPath` in `packages/domain`,
  used by the SPA and `utils/auth.ts`); none rejected. Commit id: see the log.

- Step 10 (server half; the SPA half is 10b): `guests.site_admin`. The guests repository's
  `isProtected` (`authProtected OR siteAdmin`) is what every read returns as `authProtected`;
  `setAuthProtection`'s stored flag stays separate. `actor.admin` is also true for a verified
  session of a site admin (`SessionLookup.siteAdmin`, one extra guest read per request). Bootstrap
  link: `/auth/bootstrap?token=`, 24 h, one row in `bootstrap_tokens`, logged at start by
  `server/bootstrap-link.ts` (`instrumentation.ts`) while no site admin exists;
  `make bootstrap-link` prints a new one (dev only; the image has no scripts/ or tsx: a deployed
  site sets `SB_BOOTSTRAP_LINK=1` and restarts, which logs a link even when admins exist; 10b
  documents it in self-hosting). `POST /auth/bootstrap` takes `guestId` or `name`+`email`,
  `username`, `password`. The dev database of this checkout has orphan `login_sessions` rows, so the
  script fails its FK check there (pre-existing). Use cases: 015-US6, 016-US4. No changelog or docs
  yet (10b). Checks and commit id: see the log.

- Step 10b: the SPA half is done (`/auth/bootstrap`, role toggle; no E2E for the bootstrap page
  since a test cannot read the logged link). Recording which admin made a change is split out as
  10c. The users screen does not yet show an admin without a password as such (the admin view has no
  `hasPassword`); see Questions. Checks: all of `make precommit` green; E2E 213 passed, 1 skipped, 1
  flaky (`attendee-count.spec.ts:61`, known; `make` exits 1 on a flaky test). Commit id: see the
  log.

- Step 11 (part one of the admin sign-in; removal is 11b): the proxy cannot read the database, so
  for `/api/v1/admin` it only checks the admin cookie and the presence of a `guest` cookie; the use
  cases decide (`admin.required` 403). Without any cookie: 401 `admin.unauthenticated`, also when
  `ADMIN_PASSWORD` is unset (no more `admin.disabled`). Legacy `/api/admin/*` and `/legacy/admin`
  are unchanged. `byAdmin(actor, at)` lives only in `server/kernel/change-context.ts`; the changes
  table keeps the admin's guest in `actor_id`. No E2E for a site admin opening `/admin` (needs a
  reset-link sign-in); covered by integration tests (`api-site-admin.test.ts`, `proxy.test.ts`).
  Checks: format, lint, arch, openapi, typecheck, unit and integration green; E2E 214 passed, 1
  skipped. Change id lwyrznto (jj; stable under amend). Step 11 review: all 7 findings accepted.
  Admin routes refuse a non-admin guest (test over every `/admin` operation: 400/403/415, never
  success; validation can run before the role check). Admin logout now also calls
  `/api/v1/auth/sign-out`. Self-hosting docs corrected for 11b's full rewrite.

- Step 11b: no admin password or cookie any more; `actor.admin` is only a verified site-admin
  session. The proxy lets `/api/v1/admin` through for any request with a `guest` cookie
  (`adminApiRefusal` in `utils/auth.ts`); use cases check the role. `/api/admin/*` and
  `/api/auth/login` are deleted (step 16 no longer lists them). The seed adds a site admin outside
  `guestRows` (seeded hosts and RSVPs index modulo its length): username `site-admin`, password
  `seed-password`. E2E signs in with `adminLogin` (`tests/e2e/helpers/admin.ts`); one browser has
  one guest session, so a spec that switches to an attendee and back must sign in as the admin
  again. `login()` returns early when the site password was already entered. Integration tests get
  an admin from `tests/helpers/admin-cookie.ts` (a new "Site Admin" guest per call: list tests
  filter it). `LEGACY_ROOT_PAGES` and its unit test are gone (no legacy root page is left).

- Step 12 (server half): the join response is 200 `{guestId, eventSlug, joined}`; `joined: false`
  means sign in as `guestId` and send the token again (no session, no change). A link is trusted
  while `password_set_at` is null or not after its `created`. Creating a link for one guest mails
  the guest a notice only when the mailer is configured (best effort); "mail all" without `guestIds`
  means the event's members, and is 503 `auth.mailUnavailable` without a mailer. Mock `loginMail` in
  tests needs `sendJoinLink` and `sendJoinLinkMade`.

- Step 12b: the join page reuses the sign-in route for `joined:false`
  (`/auth/login?guest=&redirect= /join/{token}`). The E2E reads the link from the admin screen's
  read-only box. The guests table gets a "Join link" column; `AssignmentManager` takes an `extra`
  render prop. Review: "mail" asks for confirmation; the join page links to `/` on failure. Known
  limit: a guest who signs in through the emailed login-code or a password reset (no `redirect`)
  lands on `/` and must open the join link again.

- Step 13: `assuranceRequired(mode, protected)` is in `packages/domain/src/auth.ts`.
  `actingGuest(actor, guests, eventMode?)` uses it; `isProtected` (guests repository SQL: chosen OR
  site admin OR member of a verified event) feeds the flag, and the picker and snapshot use the same
  SQL. Use cases without a membership check (comment create and likes, `createSession`) pass the
  subject event's mode, so non-members need a verified login there; membership-checking use cases
  are covered by `isProtected`. The SPA does not predict the rule (the snapshot carries the flag).
  `rowToGuest` (admin views) shows chosen/admin only on purpose: that is what an admin can reset.
  Strictest wins across events, so every E2E spec that creates an event and assigns shared guests
  picks "Open" in the form; seeded events are `open`. A mode change records guest changes for the
  members in every event they attend (`recordingModeLocks`). `unprotect` keeps a verified-event
  member's session verified.

- Steps 14-15: `MapButton` fetches `GET /site` on its own (the home page does too). Open-questions
  item 9 is resolved and removed; the old item 10 is now 9.

## Known E2E flakes

`attendee-count.spec.ts:64` (fails ~half of solo runs on the base too), `settings.spec.ts:67`,
`profile-comments.spec.ts:95`, `schedule-layout.spec:252`, `user-auth.spec.ts:392`,
`rsvp.spec.ts:111`, `admin.spec.ts:442` (under load; rerun alone). `meetings-request.spec.ts:296`
fails most solo runs, at varying lines (notification list shows "Nothing yet" after `actAs`, or a
button click times out). Not a clear test race: a `page.reload()` after the wait made it pass, so
the notifications view is stale after switching name, which may be an app bug (query loaded before
the new identity). The "mid-click navigation to /admin/users" in the log is afterEach cleanup after
the timeout, not the cause. Unresolved.

## Left alone

- AGENTS.md "Misc" still names `modal-nav.ts`, and its comment examples cite deleted files
  (`app/api/rsvps/route.ts`, `fetch("/api/toggle-rsvp")`); both need the user's edit.
- `/legacy` itself has no page now; the error boundary and "Back to the events" link to `/`.

- Step 16: `/api` has only `auth/logout`, `health`, `spa/*` and `v1` left in Next. The route tests
  became `/api/v1` calls: `tests/helpers/session-form.ts` translates the old booking-form payload
  (the v1 refusals differ: 403 `session.managedByOrganizer`, 422 key reuse,
  `session.versionConflict`, `request.invalid` for a bad capacity). Meetings, candidates and
  comment-route tests were deleted (`api-meetings`, `api-comments` cover the same use cases). Rules
  the page reads had needed went with the repository searches and their four tests.

- Step 17: tests call `/api/v1` handlers without gates through `tests/helpers/v1-route.ts`
  (`api.fetch`), and with gates through `tests/helpers/through-web.ts` (`web.fetch`). The
  mutating-surface guard enumerates `web.routes` under `/api/`. Next still serves `public/` files
  itself until step 18; `app/layout.tsx` and `app/legacy` stay until step 19. E2E: 217 passed, 1
  flaky (`update-session.spec.ts:147`, 30 s timeout; passes alone in 29.6 s).

- Step 18: the server is `dist/server/main.mjs` (esbuild; `better-sqlite3` and `sharp` external,
  copied into the image with their dependencies, plus `@scalar/api-reference`'s standalone.js). It
  listens on all interfaces at `PORT`; `HOSTNAME` is ignored. The build id is
  `dist/server/BUILD_ID`. The image was built and its `/api/health`, icons and native modules
  checked by hand; `make test-e2e-docker` was not run (step 20). `next.config.js` and
  `make typecheck`'s `next typegen` still exist until step 19.

- Step 19: `app/` and `next` are gone. The Docker user is still named `nextjs` (uid 1001, renaming
  would change nothing for volumes). Root dependencies with no user left in the root code:
  `react-hook-form`, `@hookform/resolvers`, `react-markdown`, `remark-*`, `unified`, `js-cookie`,
  `lodash`, `fuse.js`, `moment-timezone`, `turndown`, `react-dom` and their `@types`;
  `utils/hooks.ts`, `utils/markdown.ts` may be dead too. Not pruned (out of step). `theme-contrast`
  now scans `apps/web/src`; `ui/dialog.tsx` uses `bg-overlay` (darker in the dark theme).

## Questions

None open. Q5 to Q8 were answered on 2026-10-29 and are in ADR 0017 and PLAN.md (map item: step 14;
401/403 to sign-in: step 11b).

- Step 10b review: fixed the button wrap, the duplicate doc comment, and the untrue changelog and
  admin-guide claims (moved to step 11 with the proxy change that makes them true). Rejected: a
  confirm step for granting or revoking the role (both are one click to undo, and the last admin is
  protected by the server). `hasPassword` and recording the admin: step 11.
