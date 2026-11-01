# Run plan: identity and roles, then retire Next (path steps 6 and 7)

Goal: the root event list and the sign-in screens move to the SPA; sign-in becomes server-side login
sessions with assurance, join links and a site-admin role instead of the admin password (path step
6). Then Hono serves everything in its own Node process and `next` leaves the repository (path step
7). Then the run prepares release 5.0.0: the architecture docs describe what exists, the API gets
its last breaking changes for a long time, and the remaining v5.0.0 issues are done. Every step
leaves the app shippable.

Read first: `docs/dev/target-architecture/10-path-from-here.md`, `05-security.md` (identity,
assurance, transport), `02-domain.md` (Person, Participation), `08-decisions.md` D1, D2, D11; ADR
0014, 0015, 0016; `docs/dev/web-app.md`, `docs/dev/server.md`, `docs/dev/testing.md`,
`docs/dev/target-architecture/open-questions.md`.

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
- [ ] 19. **`next` leaves.** Dependencies, config, `app/`, `next-env.d.ts`, eslint and arch rules,
      the SPA's legacy forward (catch-all → not found), `legacy-pages.ts`, the E2E fixture's
      `/legacy` mapping, AGENTS.md's Next notice; the bundle still pulls in `next/headers` through
      `utils/dev-clock-server.ts` and `utils/action-auth.ts` (`pageReads().meetingOptions` would
      throw outside Next); `docs/dev/server.md` and `web-app.md` still say "The Next pages live in
      `app/legacy/`". Full `make test-e2e`.
- [ ] 20. **Docs: step 7 done.** ADR 0015 note, web-app, server.md, 07, 10-path, self-hosting,
      testing. The commit message asks the user to run `make test-e2e-docker` and has the footer
      `fixes #1339`.

### Current architecture

- [ ] 21. **The target architecture becomes the current architecture.** Move
      `docs/dev/target-architecture/` to `docs/dev/architecture/` and cut it from about 1500 lines
      to about 500. Each statement describes what the code does now; check it against the code. Link
      to `server.md`, `web-app.md` and `architecture-rules.md` instead of repeating them. Keep the
      one-screen summary, the glossary, the decisions (D1–D11) and the diagrams, cut to what exists.
      Delete `09-feedback-map.md` and `10-path-from-here.md` (jj history has them). Designs that are
      not built, the open questions and "Not in this run" below go to one page,
      `architecture/not-built.md`. Update every link (ADRs, `docs/dev/` pages, `documentation.md`,
      the Makefile's `LIKEC4_DIR`, this plan's "Read first"). Run `make docs-dev-validate` and
      `make arch`.

### The API for 5.0.0

- [ ] 22. **API review: ADR 0018.** Doc-only. Goal: after 5.0.0, no breaking release for a long
      time, so accept a break now where it removes a future one. Review
      `packages/contracts/openapi.json`, the snapshot and feed shapes, problem kinds, and auth. Also
      review the other things a self-hoster depends on: environment variables, public URLs, data
      paths. For each change, state the benefit and who it breaks. Start from these candidates;
      reject those that do not earn a break: - Endpoints that nothing uses now that the SPA reads
      the replica (`/updates`, `/attendees`, `/host-clashes`, `/sessions/{id}/rsvps`,
      `/guests/{id}/rsvps`): each is a promise to keep. - Verbs in paths instead of methods
      (`/me/notifications/delete`, `/me/push-subscriptions/remove`,
      `/admin/events/{id}/guests/remove`, `.../locations/remove`). - `/admin/sessions` and
      `/admin/proposals` next to `/sessions` and `/proposals`, now that the role is on the actor.
      The future organizer role must fit without a break. - Events addressed by `{id}` and by
      `{slug}`. `/dev/reminders` in the public document. - Whether the path stays `/api/v1` (check
      what 4.0.0 shipped and what `docs/public/self-hosting/api.md` promises). - Everything in "Not
      in this run" must arrive without a break. Decide now how `SITE_PASSWORD` and `/auth/site` end,
      or that they stay. API tokens must fit the auth scheme. - The contract changes that #1383 and
      #1331 need. - A written compatibility policy: what counts as breaking, how an endpoint is
      deprecated, what clients must tolerate (unknown fields, new problem kinds, new feed change
      types).

      Decide each item. Put only a real product trade-off under "Questions" in PROGRESS.md, and go
      on with the rest. Replace step 23 with one step per coherent change.

- [ ] 23. **Apply ADR 0018** (the review splits this step). Each change updates the contracts,
      `openapi.json`, the SPA, tests, `docs/public/self-hosting/api.md`, and a line in the breaking
      change note of `CHANGELOG.md`. Full `make test-e2e` after the last one.

### Issues of milestone v5.0.0

One step and one commit per issue, footer `fixes #N`. The issue text is the specification, but its
paths can be old: `app/(site)/` is now `apps/web/src/`. Read it with
`gh issue view -R schellingboard/schellingboard N` (`gh` needs `-R`: this checkout has no `.git`).
Contract changes first, so the rest build on the final API.

- [ ] 24. #1383 Hosts see the vote breakdown of their own proposals during voting; the server sends
      the counts to nobody else. E2E.
- [ ] 25. #1331 Events without email, following ADR 0017 points 4 and 9. Email is optional per
      person: `guests.email` becomes nullable, unique when set, and the contracts follow. The guest
      id is the identity; names need not be unique, and `username` is the unique sign-in name.
      Protection stays available, which replaces the issue's "disable account protection": a
      verified session with no password may set one without an emailed link (today only a reset link
      can, so this is new), and a new join link is the recovery. Only the options that need mail are
      disabled or hidden. Guest import: a row without an email matches an existing guest without an
      email by exact name, so a second import adds no duplicates.
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

Step 21 moves this list to `docs/dev/architecture/not-built.md`. These are not next steps of this
run.

- The `organizer` participation role and per-event admin rights.
- Passkeys, API tokens, QR sheet of join links.
- The read setting (ADR 0017 point 11): `public`, `link` (secret event link, rotatable, hidden from
  the root list), `participants` (default); a kiosk device link; then `SITE_PASSWORD` goes (D2).
