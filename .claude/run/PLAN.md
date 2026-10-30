# Run plan: identity and roles, then retire Next (path steps 6 and 7)

Goal: the root event list and the sign-in screens move to the SPA; sign-in becomes server-side login
sessions with assurance, join links and a site-admin role instead of the admin password (path step
6). Then Hono serves everything in its own Node process and `next` leaves the repository (path step
7). Every step leaves the app shippable.

Read first: `docs/dev/target-architecture/10-path-from-here.md`, `05-security.md` (identity,
assurance, transport), `02-domain.md` (Person, Participation), `08-decisions.md` D1, D2, D11; ADR
0014, 0015, 0016; `docs/dev/web-app.md`, `docs/dev/server.md`, `docs/dev/testing.md`,
`docs/dev/target-architecture/open-questions.md`.

## Settled by the planner (the user may override)

- **No rename.** `guests` stays the person table and `event_guests` the participation; the code
  keeps the word "guest". The glossary's terms are used in docs only.
- **Login sessions are rows**:
  `login_sessions(id hash, guest, assurance, created, expires, lastSeen, device)`. The `guest`
  cookie holds only the opaque id. Picking a name creates a `claimed` row; a code, password or join
  link a `verified` one. Old `open.`/`verified.` cookies are honoured until they expire (7 days at
  most); their reader goes in step 16.
- **Credentials**: password (scrypt stays: `node:crypto`, no native module; amend 05, which says
  argon2id), emailed login code, reset link, join link. Passkeys and API tokens wait for a later
  plan.
- **Sign-in API** under `/api/v1/auth/` (code, password, reset, sign-out) and
  `/api/v1/me/credentials`, `/api/v1/me/login-sessions`; strict rate limits; Origin checks as the
  admin API has them. ADR 0016 point 4 ("no API for passwords") ends with step 6.
- **Roles**: `siteAdmin` on the guest. The `organizer` participation role waits for a later plan:
  what an organizer may do per event is a product question of its own.
- **Join links**: per guest per event, single-use, expiring (05). The organizer gets them as a CSV
  from the admin guests screen. QR sheet and bulk email wait.
- **Identity mode**: a column on events. Existing events migrate to `open` (behaviour unchanged);
  new events default to `verified` (product decision, 08).
- **Retiring Next goes through Hono first**: the proxy, media and SPA serving move into the Hono app
  while Next still runs it from one catch-all route; then a Node entry replaces Next. `/api/health`
  stays as an alias of `/api/v1/health` (monitors and the Docker healthcheck call it).

## Open (see PROGRESS.md Questions)

Steps 8 to 10 need Q7 (admin bootstrap) and Q8 (site password). Steps 1 to 7 and 11 to 15 do not.

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
  `make test-e2e-docker` (the user runs it before a release; step 18 says so in its commit).
- A step whose diff grows past ~1500 lines outside tests is split in PLAN.md first.

## Steps

### The root event list

- [x] 1. The root event list is the SPA's (`app/home-page.tsx`, `features/events/`);
      `GET /api/v1/site` is open; `page.tsx` and `summary-page.tsx` are gone; post-login landings go
      to `/`.

### Identity (path step 6)

- [x] 2. ADR 0017 (identity and roles) records the decisions, with Q7 and Q8 as proposed.
- [x] 3. Login sessions are rows (`login_sessions`, `signIn`/`signOut` in `people`, `actorOf` in
      `server/kernel/session-actor.ts`); old cookies still read; the jobs loop prunes expired rows.
- [ ] 4. **Sign-in API**: request a login code, log in with code or password, sign out; use cases in
      `server/modules/people` (or a new `identity` module if the arch rules prefer it), moved out of
      `app/actions/user-auth.ts`, which delegates. Rate limits; problem codes for wrong code,
      expired, too many attempts.
- [ ] 5. **Credentials API**: request a reset link, set a password with it, change it, protect and
      unprotect a name, list and revoke own login sessions (`/me/login-sessions`). The rest of
      `user-auth.ts` delegates.
- [ ] 6. **Sign-in screens, unrouted**: guest login (code, password, forgot), reset, account
      security (protection, password, login sessions with "sign out"). `features/sign-in/`, forms
      through `useFormMutation`.
- [ ] 7. **Takeover: sign-in screens.** Router owns `/auth/login`, `/auth/reset`,
      `/account-security`; `UserMenu` and Settings link in-app; legacy pages, forms and
      `user-auth.ts` deleted, their tests on the API. Adapt `user-auth.spec.ts`, `settings.spec.ts`.
      Full `make test-e2e`.
- [ ] 8. **Site password screen** (needs Q8). If kept: `POST /api/v1/auth/site` and an SPA `/login`
      exempt from the gate; the `(login)` group and `app/actions/auth.ts` deleted. The gate stays in
      `proxy.ts` until step 15.
- [ ] 9. **Site admin role and bootstrap link** (needs Q7). `guests.site_admin`; the actor is admin
      only through a verified session of a site admin; a single-use bootstrap token (hashed, 24 h)
      logged at start while no site admin exists, and a script that prints a new one; the bootstrap
      page signs the visitor in as a chosen or new guest, asks for a password, grants the role.
      Admin users screen grants and revokes it (never the last one).
- [ ] 10. **Admin sign-in in the SPA** (needs Q7). `AdminFrame` sends a guest without the role to
      the sign-in; a later 401/403 does the same (Q6, if the user agrees). `/legacy/admin/login`,
      the admin cookie, `ADMIN_PASSWORD` and `/api/auth/login` go; self-hosting docs and `api.md`
      rewritten. Full `make test-e2e`.
- [ ] 11. **Join links.** `join_tokens` table; `POST /api/v1/auth/join` (verified session, joins the
      event); SPA `/join/{token}` exchanges it, replaces the history entry and opens the event;
      admin guests screen issues links and exports them as CSV. Attendee and organizer docs.
- [ ] 12. **Identity mode.** `events.identity_mode`; `assuranceRequired` in `packages/domain` (mode,
      raised by protection); every acting use case checks it; the SPA predicts it and the user
      picker offers the verification step; admin event config sets it. Full `make test-e2e`.
- [ ] 13. **Docs: step 6 done.** 10-path, 05, 02, web-app, server.md, open-questions. Doc only.

### Retire Next (path step 7)

- [ ] 14. **Legacy API routes go**: `/api/toggle-rsvp`, `add-`/`update-`/`delete-session`,
      `/api/rsvps`, `/api/meetings` (+ candidates), the comment routes, `/api/admin/create-*`; their
      tests move to `/api/v1` or go. Also the leftovers in PROGRESS.md ("Left alone").
- [ ] 15. **Hono serves everything.** The proxy's gates and header stripping become Hono middleware;
      Hono serves `/media`, `/locations`, the shell, `/_spa/`, `sw.js`, icons, manifest, and
      `/api/health`. Next keeps one catch-all route handler that calls Hono; `proxy.ts` and the
      other route handlers deleted. Port `tests/integration/proxy.test.ts` to the Hono app.
- [ ] 16. **Hono's own process.** `server/main.ts` on `@hono/node-server` starts the mailer and jobs
      loop (`instrumentation.ts` goes); a Node bundle (`bun build --target=node`, native modules
      external); `make dev` (Vite proxies to it), `make start`, the E2E web server and the
      Dockerfile run it. The old cookie reader goes. Full `make test-e2e`.
- [ ] 17. **`next` leaves.** Dependencies, config, `app/`, `next-env.d.ts`, eslint and arch rules,
      the SPA's legacy forward (catch-all → not found), `legacy-pages.ts`, the E2E fixture's
      `/legacy` mapping, AGENTS.md's Next notice. Full `make test-e2e`.
- [ ] 18. **Docs: step 7 done.** ADR 0015 note, web-app, server.md, 07, 10-path, self-hosting,
      testing. The commit message asks the user to run `make test-e2e-docker`.
- [ ] 19. **Finish**: summary in PROGRESS.md, then delete `.claude/run/`.

## Next to plan

- The `organizer` participation role and per-event admin rights.
- Passkeys, API tokens, QR sheet and bulk email of join links.
- Participation-gated reads and the `publicSchedule` setting (05), and then whether the site
  password can go (D2).
