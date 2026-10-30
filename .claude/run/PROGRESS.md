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

## Known E2E flakes

`attendee-count.spec.ts:64` (fails ~half of solo runs on the base too), `settings.spec.ts:67`,
`profile-comments.spec.ts:95`, `schedule-layout.spec:252`, `user-auth.spec.ts:392`,
`rsvp.spec.ts:111`, `admin.spec.ts:442` (under load; rerun alone). `meetings-request.spec.ts:296`
fails most solo runs, at varying lines (notification list shows "Nothing yet" after `actAs`, or a
button click times out). Not a clear test race: a `page.reload()` after the wait made it pass, so
the notifications view is stale after switching name, which may be an app bug (query loaded before
the new identity). The "mid-click navigation to /admin/users" in the log is afterEach cleanup after
the timeout, not the cause. Unresolved.

## Left alone (step 16 removes them)

- Repository methods only removed page reads used (`guests.search`, `searchForEventAssignment`,
  `sessions.searchByEvent`, `proposals` search, ...) and `tests/integration/admin-*-search.test.ts`.
- Legacy `/api/toggle-rsvp`, `/api/add-session`, `/api/update-session`; the `toggleCommentLike` use
  case.
- AGENTS.md "Misc" still names `modal-nav.ts`; the anchor MnpjIo7Y lives in `docs/dev/web-app.md`
  (needs the user's edit).

- `/legacy` itself has no page now; the error boundary and "Back to the events" link to `/`.

## Questions

Open: should the admin users view show whether a site admin has set a password (needs a
`hasPassword` field)? Otherwise none. Q5 to Q8 were answered on 2026-10-29 and are in ADR 0017 and
PLAN.md (map item: step 14; 401/403 to sign-in: step 11).

- Step 10b review: fixed the button wrap, the duplicate doc comment, and the untrue changelog and
  admin-guide claims (moved to step 11 with the proxy change that makes them true). Rejected: a
  confirm step for granting or revoking the role (both are one click to undo, and the last admin is
  protected by the server). `hasPassword` and recording the admin: step 11.
