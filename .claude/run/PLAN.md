# Run plan: identity and roles, then retire Next (path steps 6 and 7)

Goal: the root event list and the sign-in screens move to the SPA; sign-in becomes server-side login
sessions with assurance, join links and a site-admin role instead of the admin password (path step
6). Then Hono serves everything in its own Node process and `next` leaves the repository (path step
7). Then the run prepares release 5.0.0: the architecture docs describe what exists, the API gets
its last breaking changes for a long time, and the remaining v5.0.0 issues are done. Every step
leaves the app shippable.

Read first: `docs/dev/architecture/README.md`, `decisions.md` D1, D2, D11, `not-built.md`; ADR 0014,
0015, 0016; `docs/dev/web-app.md`, `docs/dev/server.md`, `docs/dev/testing.md`.

## Settled

ADR 0017 (accepted) holds the decisions: login sessions as rows (30 days from last use), no old
cookies, credentials and username, token rules, the site-admin role and bootstrap link, personal
join links, identity mode, the read setting (next plan) and retiring Next through Hono.

## How to work (every step)

- **The legacy screen and its E2E specs are the specification** for a screen move: same behaviour,
  copy and accessible names. No redesign.
- **Build unrouted, then take over** (as the last run did) where a step says so.
- **TDD**: tag the test with its use case in `tests/use-cases.ts` (add it if missing), see it fail,
  then implement. Screens get Vitest tests by role and name; takeovers adapt E2E specs only where
  URLs or markup changed. Doc and pure-move steps need no new test.
- **The server first, through use cases**: a new use case gets integration tests against the API
  (`tests/integration/api-*.test.ts`); legacy server actions that remain delegate to it until their
  screen moves.
- **One copy of everything**: rules the client predicts go to `packages/domain`; shapes to
  `packages/contracts`.
- Times in the event's zone. Every screen works at phone width.
- Update `CHANGELOG.md`, `docs/public/` (attendee guide, self-hosting) and `docs/dev/` in the step
  that changes them.
- **Checks per step**: `make format lint arch openapi-check typecheck test`; then the step's E2E
  specs (full `make test-e2e` where the step says). Doc-only steps skip E2E. Never
  `make test-e2e-docker` (the user runs it before a release; step 20 says so in its commit).
- A step whose diff grows past ~1500 lines outside tests is split in PLAN.md first.

## Steps

### The root event list

- [x] 1. The root event list is the SPA's (`app/home-page.tsx`, `features/events/`);
      `GET /api/v1/site` is open; `page.tsx` and `summary-page.tsx` are gone; post-login landings go
      to `/`.

### Identity (path step 6)

- [x] 2. ADR 0017 (identity and roles) records the decisions.
- [x] 3. Login sessions are rows (`login_sessions`, `signIn`/`signOut` in `people`, `actorOf` in
      `server/kernel/session-actor.ts`); old cookies still read; the jobs loop prunes expired rows.
- [x] 4. Sign-in API: `POST /api/v1/auth/login-code`, `/auth/login`, `/auth/sign-out`
      (`people/application/sign-in.ts`, `http/auth-routes.ts`); `user-auth.ts` delegates for code
      and login; kind `limited` (429); per-address limit on `/auth/*`.
- [x] 5. Sessions last 30 days from last use (`lastSeen` refreshed daily, expiry moves with it); old
      `open.`/`verified.` cookies are no identity; their parsing is deleted.
- [x] 6. Credentials API: `/auth/reset-link`, `/auth/reset`,
      `/me/credentials/{password,unprotect,     username}`, `/me/login-sessions`; `guests.username`
      (unique, lowercase); `/auth/login` takes `identifier`; `user-auth.ts` delegates
      (`people/application/credentials.ts`).
- [x] 7. Sign-in screens, unrouted: `features/sign-in/` (`LoginScreen`, `ResetScreen`,
      `AccountSecurityScreen`), `commands/sign-in.ts`, `queries/account-security.ts`;
      `GET /me/credentials` added for the screen.
- [x] 8. Sign-in screens taken over: the router owns `/auth/login`, `/auth/reset`,
      `/account-security` (`app/account-pages.tsx`); legacy pages, `(site)` layout, `user-auth.ts`
      and its action tests deleted (rules covered in `api-auth.test.ts`); "Send due reminders" is
      `POST /api/v1/dev/reminders` in the SPA's dev toolbar.
- [x] 9. Site password screen: SPA `/login` (open in `proxy.ts`), `POST /api/v1/auth/site`
      (`server/http/site-auth.ts`); `/api/v1/health` is open too; `(login)` group and
      `actions/auth.ts` deleted. The gate stays in `proxy.ts` until step 17.
- [x] 10. Site admin role, server side: `guests.site_admin` (protects the name through `isProtected`
      in the guests repository; `unprotect` refused); `actor.admin` is also a verified session of a
      site admin; `PUT /admin/guests/{id}/site-admin` (never the last admin); `bootstrap_tokens`
      (hashed, 24 h, replaced), `POST /auth/bootstrap`, `logBootstrapLink` at start
      (`instrumentation.ts`) and `make bootstrap-link`. Split: the SPA half is step 10b.
- [x] 10b. Site admin in the SPA: `/auth/bootstrap` (`BootstrapScreen`), "Make/Remove site admin" on
      the admin users screen, changelog, admin guide, `SB_BOOTSTRAP_LINK` in configuration,
      server.md.
- [x] 11. Site-admin sessions open the admin: `/admin` shell is served whatever `ADMIN_PASSWORD`;
      `/api/v1/admin` passes a guest cookie through to the use cases (the role check) and answers
      401 only with no cookie at all; `byAdmin(actor, at)` records the site admin's guest id
      (`Actor` admin has `id?`); `hasPassword` on the admin guest view ("No password yet" badge);
      changelog and admin-guide "Site admins". Split: the removal is step 11b.
- [x] 11b. The admin password is gone: `AdminFrame` sends a refused guest to `/auth/login?redirect=`
      (the sign-in honours `redirect`); `/legacy/admin/login`, the admin cookie, `/api/auth/login`,
      `/api/admin/*` (create-*, users, logout) and the `ADMIN_VERIFIED_HEADER` are deleted; a set
      `ADMIN_PASSWORD` logs a warning; the OpenAPI scheme is `guestAuth`; E2E signs in as the seeded
      site admin (`site-admin`, `tests/e2e/helpers/admin.ts`); docs and changelog rewritten.
- [x] 12. Join links, server side: `join_tokens`, `guests.password_set_at`, `POST /auth/join`
      (`joined: false` once a password postdates the link),
      `POST /admin/events/{id}/guests/{guestId}/join-link` (token once; the guest is emailed a
      notice) and `.../join-links/mail`; emails in `emails/join-link.tsx`; use cases 003-US6,
      016-US5. Split: the SPA half is step 12b.
- [x] 12b. Join links in the SPA: `/join/{token}` (`JoinScreen`, `JoinPage`; `join` is a reserved
      slug), "New link" and "Mail new links" on the event Guests tab
      (`features/admin/join-links.tsx`), docs, changelog, `tests/e2e/join-links.spec.ts`. Not a
      release highlight: no release-notes entry.
- [x] 13. Identity mode: `events.identity_mode` (`open`|`verified`; existing events `open`, new ones
      `verified`); `assuranceRequired` in `packages/domain`; a guest's `authProtected` also holds
      when they take part in any `verified` event (one SQL expression in the guests repository), and
      use cases on one event take its mode; admin Identity select on create and edit; use case
      015-US7.
- [x] 14. Show map in the shell: `MapButton` (`apps/web/src/app/map-button.tsx`) reads `GET /site`
      and opens the map in a dialog; the `settings.spec.ts` map test runs again.
- [x] 15. Docs: step 6 done (10-path, 05, web-app, open-questions); 02 and server.md need no change.

### Retire Next (path step 7)

- [x] 16. Legacy API routes gone: `/api/toggle-rsvp`, `add-`/`update-`/`delete-session`,
      `/api/rsvps`, `/api/meetings` (+ candidates), the comment routes, `app/api/legacy.ts`,
      `session-form-utils.ts`; the `toggleCommentLike` use case; the unused repository searches.
      Session-form tests call `/api/v1` through `tests/helpers/session-form.ts`.
- [x] 17. Hono serves everything: `server/http/web.ts` (gates in `gates.ts`) serves `/api/v1`,
      `/api/health`, logout, `/media`, public files, the manifest, `/_spa/` and the shell; Next
      keeps only `app/[[...path]]/route.ts`; `proxy.ts` and the other handlers are gone.
- [x] 18. Hono's own process: `server/main.ts` on `@hono/node-server` starts the mailer and jobs
      loop (`instrumentation.ts` gone); `scripts/build-server.ts` (esbuild) bundles it to
      `dist/server/main.mjs`; `make dev`/`start`, the E2E web server, the flake hunt and the
      Dockerfile run it. `withForwardedProto` carries `X-Forwarded-Proto` into the request URL.
- [x] 19. `next` leaves: dependencies, config, `app/`, `next-env.d.ts`, the Next eslint config (the
      react-hooks plugin stays), arch rules for `app/`, the SPA's legacy forward (the catch-all is
      "Page not found"), `/legacy` everywhere, `utils/dev-clock-server.ts`, `utils/action-auth.ts`,
      `utils/image-loader.js`, `utils/forms.ts`; `meetingOptions` takes `now`; tests use `Request`.
- [x] 20. Docs: step 7 done (ADR 0012/0015 notes, web-app, server, getting-started, testing, 07,
      10-path, 04, coding-guidelines, releasing). The user should run `make test-e2e-docker`.

### Current architecture

- [x] 21. `docs/dev/target-architecture/` is `docs/dev/architecture/` (README, glossary, decisions,
      not-built, diagrams cut to what exists; 381 lines). "Not in this run" now lives in
      `not-built.md`.

### The API for 5.0.0

- [x] 22. API review: ADR 0018 records the decisions (v1 unreleased, so `/api/v1` stays and breaks
      cost nobody; the 4.0.0 `/api/*` routes are the real break), the compatibility policy and the
      contract notes for #1383 and #1331. Steps 23a-23e apply it; each updates the contracts,
      `openapi.json`, `packages/api-client`, the SPA, tests and `docs/public/self-hosting/api.md`.
- [ ] 23a. Remove `GET /guests/{id}/rsvps` and `DELETE /me/identity` (the SPA signs out through
      `POST /auth/sign-out`); `POST /api/auth/logout` becomes `DELETE /api/v1/auth/site` (ends the
      site login and the login session; `site-session.ts` follows). Integration tests move with
      them.
- [ ] 23b. Methods for removal: `DELETE /me/notifications?ids=`,
      `DELETE /me/push-subscriptions?endpoint=`, `GET /me/push-subscriptions?endpoint=` (replaces
      `/check`). Old `POST` routes go. Tests first (use cases for notifications and push).
- [ ] 23c. `POST /dev/reminders` becomes `/api/dev/reminders`, outside `/api/v1` and `openapi.json`;
      still 404 without `SB_ENABLE_DEV_TOOLS`. The SPA's dev toolbar follows. Also `API_DOCS`
      becomes `SB_API_DOCS` (code, `.env` files, `configuration.md`, `api.md`).
- [ ] 23d. `api.md`: the command-versus-DELETE rule, the `/admin/` privilege rule, `{id}` versus
      `{slug}`, `/attendees` versus `/guests`, `Authorization` reserved for `Bearer sb_` tokens and
      ignored today, and the full Compatibility section from ADR 0018 (breaking, not breaking,
      deprecation, what clients tolerate, self-hoster promises). Mark in `configuration.md` that new
      variables are `SB_`-prefixed. `make docs-validate`.
- [ ] 23e. `CHANGELOG.md` breaking note for 5.0.0: the 4.0.0 `/api/*` routes (`/api/admin/*`,
      `toggle-rsvp`, `rsvps`, `add-`/`update-`/`delete-session`, votes, comments, meetings;
      `/api/auth/login` is already named) are gone and `/api/v1` replaces them; everyone signs in
      again once; `ADMIN_PASSWORD` warns. Keep the `SB_TRUSTED_PROXIES` line. Then run the full
      `make test-e2e`.

### Issues of milestone v5.0.0

One step and one commit per issue, footer `fixes #N`. The issue text is the specification, but its
paths can be old: `app/(site)/` is now `apps/web/src/`. Read it with
`gh issue view -R schellingboard/schellingboard N` (`gh` needs `-R`: this checkout has no `.git`).
Contract changes first, so the rest build on the final API (ADR 0018 point 15).

- [ ] 24. #1383 Hosts see the vote breakdown of their own proposals during voting; the server sends
      the counts to nobody else. No new shape: `breakdown` is already nullable and stays out of the
      snapshot and feed. E2E.
- [ ] 25. #1331 Events without email, following ADR 0017 points 4 and 9. Email is optional per
      person: `guests.email` becomes nullable, unique when set, and the contracts follow. The guest
      id is the identity; contracts per ADR 0018 point 15 (admin guest `email` nullable,
      `emailEnabled` on `GET /site`, skipped guests in the join-link mailing); names need not be
      unique, and `username` is the unique sign-in name. Protection stays available, which replaces
      the issue's "disable account protection": a verified session with no password may set one
      without an emailed link (today only a reset link can, so this is new), and a new join link is
      the recovery. Only the options that need mail are disabled or hidden. Guest import: a row
      without an email matches an existing guest without an email by exact name, so a second import
      adds no duplicates.
- [ ] 26. #1335 Admin: assign attendees to events in the add and edit forms.
- [ ] 27. #1361 Dismissing a dialog with unsaved text asks first. E2E.
- [ ] 28. #1330 Admin: a new day's booking window defaults to the day's start and end.
- [ ] 29. #1329 Admin: searchable time zone combobox on a new event.
- [ ] 30. #1334 Placeholder image for a location without an image.
- [ ] 31. #1333 Input fields do not move on focus (styling: no new test).
- [ ] 32. #1338 Proposal page says "proposal", not "session".
- [ ] 33. **Milestone check.** `gh issue list -R schellingboard/schellingboard --milestone v5.0.0`.
      An issue that no commit closes and that has no step gets a new step here. Full
      `make test-e2e`.

### Finish

- [ ] 34. **Finish**: summary in PROGRESS.md, including open Questions, then delete `.claude/run/`.
      Do not start the items in "Not in this run". Do not make the release. The commit message asks
      the user to run `make test-e2e-docker`.

## Not in this run

See `docs/dev/architecture/not-built.md`. These are not next steps of this run.
