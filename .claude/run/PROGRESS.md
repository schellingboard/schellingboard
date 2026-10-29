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
- The SPA picker sends a protected name to `/legacy/auth/login?guest=<id>`; login lands on `/`.
  Account security is `/legacy/account-security`, linked from Settings.
- Native `<option>` is not "visible" in Firefox: E2E use `toBeAttached()` / `toBeDisabled()`.
- Do not call `runner.stop()` or `query.destroy()` in a mount effect cleanup (StrictMode).
- jj: paths with `(site)`/`[id]` need `'file:"…"'`; `jj squash` needs `-m` or
  `--use-destination-message`; no `jj split`.
- Next serves `apps/web/dist`: rebuild the SPA (`make build` or the E2E web server does) before E2E.

- Login sessions (step 3): the `guest` cookie holds a 32-byte token without dots; values with a dot
  are legacy. `LoginAssurance` (`claimed`|`verified`) replaces `open`|`verified` everywhere. Resolve
  actors with `actorOf(cookies)` / `guestOfCookie(value)` (`server/kernel/session-actor.ts`), never
  `resolveActor` directly. Each sign-in deletes the browser's old row and writes a new one. Sessions
  age in real time (`utils/real-clock.ts`). `eventId` and `device` exist; `device` is the user agent
  from `PUT /me/identity` only. Tests make rows with `sessionGuestValue`.

- Sign-in API (step 4): `matchToken`/`recentlyIssued` live in `people/application/auth-tokens.ts`
  (exported by the module for `setPasswordWithTokenAction` until step 5). `PeopleDeps.loginMail`
  sends the code. Expired, spent and wrong credentials all answer `auth.credentialWrong` (the repo
  has no lookup of dead codes; the old action did the same). `/auth/*` is exempt from idempotency
  keys; `/auth/login*` has a per-address limit (30 burst, `SB_AUTH_RATE_BURST`, set high in
  `.env.test`), skipped when `SB_TRUSTED_PROXIES` is unset. The proxy refuses cross-site
  `/api/v1/auth/*`. First protection keeps other browsers' claimed rows (they are told "protected");
  a password reset or change revokes all.

## Known E2E flakes

`settings.spec.ts:67`, `profile-comments.spec.ts:95`, `schedule-layout.spec:252`,
`user-auth.spec.ts:392`, `rsvp.spec.ts:111`, `admin.spec.ts:442` (under load; rerun alone).
`meetings-request.spec.ts:296` fails most solo runs, at varying lines (notification list shows
"Nothing yet" after `actAs`, or a button click times out). Not a clear test race: a `page.reload()`
after the wait made it pass, so the notifications view is stale after switching name, which may be
an app bug (query loaded before the new identity). The "mid-click navigation to /admin/users" in the
log is afterEach cleanup after the timeout, not the cause. Unresolved.

## Left alone (step 14 removes them)

- Repository methods only removed page reads used (`guests.search`, `searchForEventAssignment`,
  `sessions.searchByEvent`, `proposals` search, ...) and `tests/integration/admin-*-search.test.ts`.
- Legacy `/api/toggle-rsvp`, `/api/add-session`, `/api/update-session`; the `toggleCommentLike` use
  case.
- AGENTS.md "Misc" still names `modal-nav.ts`; the anchor MnpjIo7Y lives in `docs/dev/web-app.md`
  (needs the user's edit).

- `/legacy` itself has no page now; the error boundary and "Back to the events" link to `/`.

- ADR 0017 is `Proposed`: set it to `Accepted` when the user answers Q7 and Q8 (before step 8).

## Questions

5. The SPA shell has no "Show map" button (open-questions item 9). `GET /site` (step 1) carries the
   map URL; the button needs the user's yes. Recommendation: a shell item.
6. An admin mutation refused with 401/403 later (session expired) shows the refusal in place
   (open-questions item 10). Recommendation: send to the sign-in as the gate does; step 10.
7. **Admin bootstrap** (steps 9, 10). Recommendation: `ADMIN_PASSWORD` goes. While no site admin
   exists, the server logs a single-use bootstrap link at start (24 h; a script prints a new one for
   recovery, e.g. `docker exec … node scripts/admin-link.js`); a set `ADMIN_PASSWORD` only logs a
   deprecation warning. The admin UI is then always on (no 404 when unset).
8. **Site password** (step 8). D2 says no shared site password, but nothing replaces it until reads
   need a participation. Recommendation: keep `SITE_PASSWORD` as an optional gate through step 7,
   its screen in the SPA, the gate in Hono; decide removal with participation-gated reads.
