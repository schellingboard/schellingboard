# Progress

## Decisions

- Session branch: `claude/spa-families`. No pushes (the user's rule).
- Admin (steps 19-21): `/admin/**` is the SPA's (`app/admin-pages.tsx`, `AdminSection` =
  `InAppLinks` + `AdminFrame`). `proxy.ts` serves the shell for `/admin/**` without the site
  password (404 when the admin UI is disabled); `/legacy/admin/login` and `/api/**` keep the admin
  gate. Integration tests of the old admin actions go through `tests/helpers/admin-api.ts` (an
  adapter over `/api/v1`).
- `app/legacy-pages.ts` keeps "admin" (login is legacy); the router filters it out.
- Native `<option>` is not "visible" in Firefox: E2E use `toBeAttached()` / `toBeDisabled()`.
- Do not call `runner.stop()` or `query.destroy()` in a mount effect cleanup (StrictMode).

## Known E2E flakes

`settings.spec.ts:67`, `scheduling.spec` edit/delete/cancel, `profile-comments.spec.ts:95`,
`schedule-layout.spec:252`, `user-auth.spec.ts:392`, `rsvp.spec.ts:111` (under load; rerun alone).

## Left alone (own step if wanted)

- Repository methods only the removed page reads used (`guests.search`, `searchForEventAssignment`,
  `sessions.searchByEvent`, `proposals` search, ...) and their
  `tests/integration/admin-*-search.test.ts` stay; remove them with the repositories' next cleanup.
- Legacy `/api/toggle-rsvp`, `/api/add-session`, `/api/update-session`; the `toggleCommentLike` use
  case.
- A new location whose image is refused (wrong aspect ratio) is now kept without the image and the
  form turns into "Save"; the legacy action created nothing. Accepted.
- Old `/legacy/admin/<page>` bookmarks give 404. Accepted.
- Flake seen once: `admin.spec.ts:442` (`getByText("Saved!")` count 2 after the phases save); passes
  alone in 6 runs, cause unknown.
- AGENTS.md "Misc" still names `modal-nav.ts`; the anchor MnpjIo7Y lives in `docs/dev/web-app.md`
  (needs the user's edit).

## Questions

5. The SPA shell has no "Show map" button (the uploaded site map); only legacy pages show it.
   `settings.spec.ts:67` checks it on `/legacy/account-security`. Needs a shell item and the map URL
   in `/me` or the snapshot.
6. An admin page whose mutation gets 401/403 later (session expired) shows the refusal in place;
   only the `AdminFrame` gate read sends to the login. Wanted: the same redirect.
