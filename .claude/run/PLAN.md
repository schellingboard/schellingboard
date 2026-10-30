# Run plan: identity and roles, then retire Next (path steps 6 and 7)

Goal: the root event list and the sign-in screens move to the SPA; sign-in becomes server-side login
sessions with assurance, join links and a site-admin role instead of the admin password (path step
6). Then Hono serves everything in its own Node process and `next` leaves the repository (path step
7). Every step leaves the app shippable.

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
- [ ] 11. **Admin sign-in in the SPA.** Also: the proxy lets `/admin` and `/api/v1/admin` through
      for a verified site-admin session, and `/admin` no longer 404s when `ADMIN_PASSWORD` is unset
      (today only the password cookie passes, so the bootstrap page's redirect to `/admin/events`
      fails); admin changes record which admin (`ChangeContext` admin gets the guest id; the 31
      `byAdmin(at)` callers pass the actor); show whether a site admin has a password
      (`hasPassword`); the changelog entry for site admins and the admin-guide "Site admins" section
      (first admin by the logged link, `SB_BOOTSTRAP_LINK=1`, Make/Remove site admin) land here.
      `AdminFrame` sends a guest without the role to the sign-in; a later 401/403 does the same.
      `/legacy/admin/login`, the admin cookie and `/api/auth/login` go; a set `ADMIN_PASSWORD` logs
      a deprecation warning; the admin UI is always on. Self-hosting docs and `api.md` rewritten.
      Full `make test-e2e`.
- [ ] 12. **Join links.** `join_tokens(hash, guest, event, created)`, no expiry, one live per guest
      and event; valid to sign in while the guest set no password after `created`, otherwise it asks
      for a sign-in as that guest. `POST /api/v1/auth/join` (verified session, joins the event); SPA
      `/join/{token}` exchanges it, replaces the history entry and opens the event. Admin guests
      screen: "new link" for one guest (copy) and "mail new links" to all or selected guests with an
      email; the guest is emailed that a new link exists. Attendee and organizer docs. Split if past
      the size limit.
- [ ] 13. **Identity mode.** `events.identity_mode` (`open`|`verified`); a guest is protected if
      they chose it, are a site admin, or take part in a `verified` event; `assuranceRequired` in
      `packages/domain` (mode, protection); every acting use case checks it; the SPA predicts it and
      the user picker offers the verification step; admin event config sets it. Full
      `make test-e2e`.
- [ ] 14. **Show map in the shell.** The SPA shell gets the "Show map" item from `GET /site`'s map
      URL (open-questions item 9). Remove the `test.fixme` from the map test in `settings.spec.ts`.
- [ ] 15. **Docs: step 6 done.** 10-path, 05 (scrypt, personal join links, the two settings), 02,
      web-app, server.md, open-questions. Doc only.

### Retire Next (path step 7)

- [ ] 16. **Legacy API routes go**: `/api/toggle-rsvp`, `add-`/`update-`/`delete-session`,
      `/api/rsvps`, `/api/meetings` (+ candidates), the comment routes, `/api/admin/create-*`; their
      tests move to `/api/v1` or go. Also the leftovers in PROGRESS.md ("Left alone").
- [ ] 17. **Hono serves everything.** The proxy's gates and header stripping become Hono middleware;
      Hono serves `/media`, `/locations`, the shell, `/_spa/`, `sw.js`, icons, manifest, and
      `/api/health`. Next keeps one catch-all route handler that calls Hono; `proxy.ts` and the
      other route handlers deleted. Port `tests/integration/proxy.test.ts` to the Hono app.
- [ ] 18. **Hono's own process.** `server/main.ts` on `@hono/node-server` starts the mailer and jobs
      loop (`instrumentation.ts` goes); a Node bundle (`bun build --target=node`, native modules
      external); `make dev` (Vite proxies to it), `make start`, the E2E web server and the
      Dockerfile run it. Full `make test-e2e`.
- [ ] 19. **`next` leaves.** Dependencies, config, `app/`, `next-env.d.ts`, eslint and arch rules,
      the SPA's legacy forward (catch-all → not found), `legacy-pages.ts`, the E2E fixture's
      `/legacy` mapping, AGENTS.md's Next notice. Full `make test-e2e`.
- [ ] 20. **Docs: step 7 done.** ADR 0015 note, web-app, server.md, 07, 10-path, self-hosting,
      testing. The commit message asks the user to run `make test-e2e-docker`.
- [ ] 21. **Finish**: summary in PROGRESS.md, then delete `.claude/run/`.

## Next to plan

- The `organizer` participation role and per-event admin rights.
- Passkeys, API tokens, QR sheet of join links.
- The read setting (ADR 0017 point 11): `public`, `link` (secret event link, rotatable, hidden from
  the root list), `participants` (default); a kiosk device link; then `SITE_PASSWORD` goes (D2).
