# Run progress

Next step: 7.

## Decisions

- Step 1: `@hono/zod-openapi` supports zod 4 (checked with `npm view` on 2026-10-04):
  1.6.3 peers on `zod ^4.0.0` and `hono >=4.10.0`, built on
  `@asteasolutions/zod-to-openapi` 9.1.0 (peer `zod ^4.0.0`). Repo zod is 4.6.5,
  hono 4.13.13. Contracts stay plain `zod`; no Hono dependency in `packages/contracts`.
- Step 1 (ADR 0012, Proposed): code under top-level `server/{kernel,http,composition.ts,
modules/<m>/{module.ts,ports.ts,application,http}}`; ports are Picks of the `db/`
  container's repositories (they stay in `db/`). Actor resolved from today's cookies
  (admin cookie, guest cookie + level) by one kernel function shared with server actions.
  Problem details: `type: about:blank`, `code` extension, contract failures `400
request.invalid` with `errors`. Idempotency: `idempotency_keys` keyed by actor + key,
  stores method/path/body hash/response; in-flight `409 idempotency.inProgress`, mismatch
  `422 idempotency.keyReused`, 5xx not stored, pruned after 24 h by the jobs loop;
  `command_key` on the change log deferred to step 4. `openapi.json` committed at
  `packages/contracts/openapi.json`; `make openapi` / `make openapi-check` (in precommit).
  Admin endpoints live under `/api/v1/admin/`, gated in `proxy.ts` like `/api/admin/*`
  (admin cookie only, no site password, cross-site check, 404 when disabled); the rest
  of `/api/v1` needs the site password. Proxy refusals there are problem details.
- Step 2: `server/kernel/result.ts` (`ok`, and `notFound`/`forbidden`/`conflict`/
  `invalid`/`gone(code, detail?)` returning a `Failure`), `server/kernel/actor.ts`
  (`resolveActor(cookies)` -> `{ admin, guest: { id, level } | null }`, cookie facts
  only). `server/http/`: `create-app.ts` (`createApp(basePath)`: OpenAPIHono with
  `request.invalid` hook, `route.notFound` 404, `server.error` 500; handlers must be set
  after `basePath`, which drops them), `problem.ts` (`problemResponse`,
  `problemFromError`, always `no-store`), `actor.ts` (middleware, `c.var.actor`),
  `app.ts` (`api`), `openapi.ts`, `health.ts`. Contract `@schellingboard/contracts/health`.
  `make openapi` / `openapi-check` run `scripts/openapi.ts` (prettier-formatted output);
  check is in precommit and the CI lint job.
- Step 2: proxy codes: `site.unauthenticated` 401; `/api/v1/admin/*` via
  `adminApiRefusal` (shared with `requireAdminAuthApi`): `admin.disabled` 404,
  `request.crossSite` 403, `admin.unauthenticated` 401. `/api/v1/health` needs the site
  password (legacy `/api/health` stays public).
- Step 2: depcruise rules added; `app/` may also import `server/kernel/` (server actions
  resolve the actor there); ADR 0012 section 2 says so (amended in step 2's review).
  `use-cases-take-only-container-types` is the one rule using `type-only`; noted in
  `docs/dev/architecture-rules.md`.
- Step 2: the mount exports `OPTIONS` to Hono on purpose, so `OPTIONS` gets the
  `route.notFound` 404, not Next's automatic `Allow` reply. A Hono-only server answers
  the same once Next leaves (step 7). No CORS: the SPA is same-origin and token clients
  are not browsers (`05-security.md`). Settled in review; do not re-raise.
- Step 2 left for step 4: the kernel "may act as guest" function (#370 rule) and
  `server/composition.ts` arrive with the first use case; `v1/[[...route]]` is in the
  mutating-surface guard's `READ_ONLY` and must move to a verifier with the first
  mutation.
- Step 3: `idempotency_keys` (PK actor + key, `created_at` index; migration 0047),
  `IdempotencyRepository.claim/complete/release/prune` in `db/` (claim is one immediate
  transaction, so concurrent requests cannot both run; a row older than 24 h counts as
  gone). `server/http/idempotency.ts`: `idempotencyMiddleware({ store, now })` after the
  actor middleware, for POST/PUT/PATCH/DELETE with the header; actor scope
  `admin|-` + `:` + guest level and id or `-` (an open cookie naming a protected guest
  does not share the verified guest's keys); path is pathname plus query; body is a
  sha256 of the raw bytes; replays status, headers (minus `set-cookie`) and body; a 5xx
  or a throw releases the key; a row still unfinished after 60 s counts as abandoned
  (its process died), so a retry runs again instead of 409 for 24 h; `complete` and
  `release` match the claim's `created_at`, so the abandoned request finishing late
  cannot touch the retry's row; a key over 255
  chars or empty is `400 request.invalid`.
  Pruned hourly by the `prune-idempotency-keys` job (`utils/jobs/idempotency.ts`).
  Expiry uses real time, not the dev fake clock (infrastructure, like the throttles).
  #141 does not fall out: the proposal form is a server action, which does not send the
  key (ADR 0012 section 5); it is closed only once the UI calls the API with a key.
- Step 3 left for step 4: declare the `Idempotency-Key` header on each mutating route's
  contract so `openapi.json` shows it; no test yet goes through the mounted `api`'s
  idempotency wiring, since no mutating route exists.
- Left for the first multipart route (avatar upload, guest import): the body hash
  covers the raw bytes, and clients pick a new multipart boundary per attempt, so a
  retry would get `422 idempotency.keyReused`; hash the parsed form there (the `-:-`
  anonymous scope was settled in step 4). Responses are stored as text, so a route
  answering binary must not be replayed as is.
- Step 4: `server/modules/sessions/` (`module.ts`, `ports.ts`, `application/`,
  `http/`); `server/composition.ts` wires use cases per call (`sessionUseCases()`;
  tests swap the container). `app/` may import `composition.ts` (depcruise rule and
  ADR 0012 section 2 amended): `composition.ts` imports each `module.ts`, so a
  `module.ts` cannot export wired use cases. Use cases are
  `(deps) => (actor, input, now)`: `now` is per request (dev fake clock), set by the
  actor middleware as `c.var.now`. Kernel `actingGuest(actor, guests)` (#370 rule):
  `guest.unselected` (no cookie or unknown guest) or `guest.protected`.
- Step 4: routes `GET/POST /sessions`, `GET/PUT/DELETE /sessions/{id}`,
  `POST /admin/sessions`, `PUT/DELETE /admin/sessions/{id}` (PUT: both edits are
  full replacements). Problems are each route's `default` response
  (`problemDefault`, `problem(error)` in `server/http/problem.ts`); contract
  `@schellingboard/contracts/problem`. `idempotencyHeaders` declared on every
  mutation. Codes: `session.notFound`, `event.notFound`, `event.notSchedulingPhase`,
  `session.dayUnknown`, `session.outsideBookingWindow`, `session.durationNotAllowed`,
  `session.hostNotInEvent`, `session.locationNotBookable`, `session.capacityInvalid`,
  `session.locationUnavailable`, `session.started`, `session.notHost`,
  `session.managedByOrganizer`, `session.timeRangeInvalid`, `admin.required`, and the
  placement codes in `@schellingboard/domain/session-booking`
  (`SESSION_PLACEMENT_CODES`; `session.clash` is 409). Legacy routes keep their
  check order (day before authorization on update) and map codes back to their old
  bodies; placement codes stay `Response.error()`. Booking rules moved from
  `app/api/session-form-utils.ts` to `packages/domain/src/session-booking.ts`.
- Step 4: anonymous idempotency: a request with neither admin nor guest has its
  `Idempotency-Key` ignored (runs, nothing stored), so anonymous clients never share
  a scope; recorded in ADR 0012 section 5. Every mutation so far refuses such a
  request anyway.
- Step 4: the legacy `session/[sessionId]/comments` route only delegates its
  session-exists check to `getSession`; listing comments moves with comments (step 6).
- Step 5: RSVPs live in the sessions module (`application/rsvps.ts`,
  `http/rsvp-routes.ts`: the target's scheduling owns `canRsvp`); votes start the
  `server/modules/proposals/` module (`proposalUseCases()`), which step 6 extends.
  Legacy RSVP and vote routes name the guest in the body, so the kernel gains
  `actingAsNamedGuest(actor, guestId, guests)`: `guest.protected` unless the actor is
  that guest verified; an unknown guest passes, the membership check refuses it
  (`guest.notInEvent`), keeping the legacy check order (ADR 0012 section 3 amended).
  Routes: `GET /sessions/{id}/rsvps`, `GET /guests/{id}/rsvps`,
  `PUT/DELETE /sessions/{id}/rsvps/{guestId}`, `DELETE /admin/sessions/{id}/rsvps/{guestId}`,
  `PUT/DELETE /proposals/{id}/votes/{guestId}` (body `{ choice }`),
  `GET /guests/{id}/votes?eventId=`; mutations answer 204. Codes: `guest.notInEvent`,
  `rsvp.ownSession`, `session.full` (409), `proposal.notFound`,
  `event.notVotingPhase`, reused `event.notSchedulingPhase`, `session.notFound`,
  `event.notFound`, `admin.required`. `listSessionRsvps` 404s an unknown session; the
  legacy `rsvps?session=` maps that back to `[]`. `listGuestVotes` takes the event by
  id or slug so the legacy route keeps privacy before the 404. `app/api/legacy.ts`:
  `legacyActor(req)` (cookies from the headers: `new NextRequest(req)` consumes the
  body) and `legacyRefusal` (old `{ error }` bodies). Route helpers (`json`, `body`,
  `idParam`, `noContent`, `App`) moved to `server/http/route-parts.ts`.
- Step 5: the vote breakdown is server-rendered from proposal data, not served by
  any route in this step; its privacy rule moves with proposals (step 6).
  `app/api/admin/create-rsvp` stays for step 10 (`admin/*` routes).
- Step 6a: the vote-breakdown rule lives in the proposals module's `presenter`
  (`application/queries.ts`): `getProposal`/`listProposals` (which take `now`) and
  every proposal the API returns carry a public `tally` (interested, maybe) and a
  `breakdown` (`proposalVoteStats`, skip votes and total included). As in the UI,
  both are `null` for everyone before the scheduling phase; from then on the tally
  is public and the breakdown is `null` unless the proposal has no host or the
  viewer hosts it. Skip and total counts never leave the breakdown. "Is the viewer
  a host" uses the #370 rule (`actingGuest`): an open cookie for an unprotected
  guest counts; a protected guest only with its verified cookie. Admins are not
  hosts (as in the UI). The API only: the proposal pages still render from the
  repository, where `view-proposal.tsx` (`canEdit`) takes the host from the cookie
  even when unverified, so the stricter host check does not reach the UI yet;
  routing the pages through the use cases is left for the UI's move to the API.
- Step 6a: routes `GET /proposals?eventId=`, `GET/PUT/DELETE /proposals/{id}`,
  `POST /proposals` (201), `POST /proposals/{id}/hosts` (join as the acting guest,
  204), `PUT/DELETE /admin/proposals/{id}`; contract
  `@schellingboard/contracts/proposal`. Vote routes moved to `http/vote-routes.ts`
  (`addVoteRoutes`). Codes: `proposal.notFound`, `event.notFound`,
  `event.proposalsClosed`, `proposal.hostNotInEvent`, `proposal.notHost`,
  `proposal.stale` (409), `proposal.alreadyHost` (409), `proposal.hostNotWanted`
  (409), `guest.notInEvent`, `admin.required`, `proposal.titleRequired`,
  `proposal.durationInvalid`, `proposal.hostUnknown`,
  `proposal.expectedUpdatedTimeInvalid`. The join notification is a port
  (`notifyProposalJoined`), wired in `composition.ts` through Next's `after()` as
  before. `createProposal` keeps its acting-guest check before parsing in the
  action (legacy order), the use case checks again.

- Step 6b: `server/modules/comments/` (`commentUseCases()`): `listComments`,
  `createComment`, `editComment`, `deleteComment`, `toggleCommentLike` (the legacy
  action) and `setCommentLike` (the API), on a subject (`kind` proposal, session or
  profile, and its `id`). The legacy has no admin moderation and no event-membership or
  profile-visibility rule (every guest's profile is public; anyone may comment on any
  subject), so neither has the API; the only author rule is "your own comment".
  Lists return what the legacy routes and UI already show: tombstones (no body or
  author) and likers (id, name, avatar). New repository method
  `comments.setLike` (insert-or-ignore / delete). Notifications go through one port,
  `notifyCommented`, wired in `composition.ts` via `after()`. Routes:
  `GET/POST /proposals/{id}/comments`, `/sessions/{id}/comments`,
  `/guests/{id}/comments` (201 on create), `PUT/DELETE /comments/{id}`,
  `PUT/DELETE /comments/{id}/like` (204); contract additions in
  `@schellingboard/contracts/comment`. Codes: `proposal.notFound`, `session.notFound`,
  `profile.notFound`, `comment.notFound` (also for tombstones), `comment.notAuthor`,
  `comment.parentInvalid`, `guest.unselected`, `guest.protected`. The actions keep
  their verified-guest check before parsing; the legacy GET routes keep their bodies,
  404 messages and `no-store`.

## Questions

- Each module's `*-use-cases.test.ts` (steps 4–6b) re-tests rules the legacy action
  tests already cover through the same use cases (e.g. `comment-use-cases.test.ts`
  vs `{proposal,session,profile}-comments` and `*-comment-likes`). Keep both tiers,
  or trim the use-case files to what only they reach (the API-only `setCommentLike`,
  admin actors) once the actions are thin?

- The proposal pages pass whole `SessionProposal`s, skip and total counts
  included, to client components in every phase, so the browser already holds
  what the API now withholds before scheduling; the voting phase's "Fewest votes
  first" order and quick voting need them. When the UI moves to the API, should
  that order be served by the API (no counts) and the counts left out of the
  page payloads?

## Log

- Step 1: ADR 0012 written (Proposed). `make precommit`: format, lint, arch, typecheck,
  test-coverage pass. Firefox E2E cannot run (Playwright CDN blocked by network policy);
  the suite is run on the preinstalled Chromium via an untracked local config instead.
  Docs-only step.
- Step 2: kernel, problem details, actor middleware, `GET /api/v1/health`, committed
  `packages/contracts/openapi.json` with `make openapi-check`, dependency-cruiser rules.
  format, lint, arch, openapi-check, typecheck, test-coverage pass. Firefox E2E cannot
  run (Playwright CDN blocked by network policy); the suite was run on the preinstalled
  Chromium: no failures beyond the known Chromium baseline except timing flakes outside
  it (`profile-comments.spec.ts:95`, `schedule-agenda.spec.ts:220`,
  `view-session.spec.ts:7` and `:45`, an admin locations test) that pass on rerun or
  `--repeat-each`, and `view-session.spec.ts:7` flakes on unchanged HEAD too.
- Step 2 review: the Chromium failures outside the baseline are not caused by step 2.
  Same five tests, `--repeat-each 5 --retries 0`, failures out of 5 on HEAD vs parent
  (36cdd84): `admin.spec.ts:1033` 5 vs 5 (baseline), `profile-comments.spec.ts:95` 2 vs
  5, `schedule-agenda.spec.ts:220` 4 vs 4, `view-session.spec.ts:7` + `:45` 5 vs 6 of 10. 16 vs 20 failed in all: they fail at least as often without the commit, which no
  test reaches (`/api/v1` only), so they are environmental timing failures.
- Step 2a: `utils/auth-cookies.ts` holds the Next-free cookie names, signing and
  checks (`readGuestCookie`, `isAdminCookieValid`, ...); `utils/auth.ts` re-exports them,
  callers unchanged. Rule renamed `kernel-reaches-no-module`, now `reachable: true`; it
  failed on the old layout (`actor.ts` -> `utils/auth.ts` -> `next/server`).
  format, lint, arch, openapi-check, typecheck, test-coverage pass. Firefox E2E cannot
  run (Playwright CDN blocked); on Chromium `user-auth`, `admin`, `update-session` pass
  except the two baseline `admin.spec.ts` failures (`:828`, `:1033`).
- Step 3: idempotency table, migration 0047, middleware, prune job; integration tests
  against a test-only app (`tests/integration/idempotency.test.ts`, use case 019-US2).
  format, lint, arch, openapi-check, typecheck, test-coverage pass. Firefox E2E cannot
  run (Playwright CDN blocked); on Chromium `user-auth.spec.ts` passes (app boots with
  the migration and the new job). No user-facing change, no CHANGELOG entry.
- Step 4: sessions module, `/api/v1` session routes (guest and admin), legacy
  `add-session`, `update-session`, `delete-session`, `admin-sessions` actions and the
  session-comments existence check delegate to the use cases; `v1/[[...route]]` moved
  to a guard verifier. format, lint, arch, openapi-check, typecheck, test-coverage
  pass. Firefox E2E cannot run (Playwright CDN blocked); full suite on Chromium: 174
  passed, failures only the known baseline plus known flakes (`schedule-agenda:220`,
  `view-session:7`/`:45`) and `kiosk.spec.ts:18`, which also fails on the parent
  commit (2 of 2); flaky `profile.spec.ts:383` passes on rerun. Session specs
  (`update-session`, `scheduling`, `rsvp`, `disabled-hints`) pass with retries 0.
  No user-facing change, no CHANGELOG entry.
- Step 5: RSVP use cases in the sessions module, vote use cases in a new proposals
  module, `/api/v1` RSVP and vote routes (guest and admin), legacy `toggle-rsvp`,
  `rsvps`, `add-vote`, `delete-vote`, `votes` and the admin RSVP action delegate to
  them with their old bodies, statuses and `no-store` headers. format, lint, arch,
  openapi-check, typecheck, test-coverage pass. Firefox E2E cannot run (Playwright CDN
  blocked); full suite on Chromium: 177 passed, 14 failed, 4 flaky, all in the known
  baseline or known flakes (`kiosk.spec.ts:18`, `schedule-agenda:220`); every rsvp,
  voting, view-session and update-session spec passed. No user-facing change, no
  CHANGELOG entry.
- Step 6a: proposal use cases (get, list, create, update, join, delete, admin
  update/delete) with the breakdown rule, `/api/v1` proposal routes, the proposal
  actions and admin proposal actions delegate. format, lint, arch, openapi-check,
  typecheck, test-coverage pass. Firefox E2E cannot run (Playwright CDN blocked);
  full suite on Chromium: 176 passed, 18 failed, 1 flaky, all in the known
  baseline or known flakes (`profile-comments:95`, `schedule-agenda:220`,
  `view-session:7`, flaky `kiosk:18`); every proposal, voting and admin-proposal
  spec passed. No user-facing change, no CHANGELOG entry.
- Step 6a review: the API sent the tally and breakdown in every phase; they are now
  `null` before scheduling, as in the UI (test added).
- Step 6b: comments module (list, create, edit, delete, like) for proposals,
  sessions and profiles, `/api/v1` comment routes, `comment-actions.ts` and the three
  legacy comment GET routes delegate. format, lint, arch, openapi-check, typecheck,
  test-coverage pass. Firefox E2E cannot run (Playwright CDN blocked); full suite on
  Chromium: 176 passed, 16 failed, 3 flaky, all in the known baseline or known flakes
  (`kiosk:18`, `schedule-agenda:220`, `view-session:7`/`:45`); every comment spec
  outside the baseline passed, `profile-comments:95` included. No user-facing change,
  no CHANGELOG entry.
