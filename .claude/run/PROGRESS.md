# Run progress

Next step: 13.

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

- Step 7: `server/modules/meetings/` (`meetingUseCases()`): `listMyMeetings`,
  `listMeetingCandidates`, `requestMeeting`, `respondToMeeting`, `cancelMeeting`,
  `saveMeetingAvailability`, and admin `updateEventMeetings`, `createMeetingPoint`,
  `updateMeetingPoint`, `deleteMeetingPoint`. The legacy "verified current user" is
  the #370 rule (`actingGuest`). Reads answer only for the acting guest (no guest
  parameter), with the same views the UI gets (`MeetingView`: other parties' clashes
  redacted to busy; candidates: a busy flag only). `meetingViewsFor`,
  `meetingCandidatesFor` and `loadGuestSchedules` stay in `utils/` (the UI imports
  their types) and take the use case's repositories as an optional last argument;
  moving them into the module is left for the UI's move to the API. Notifications are
  ports awaited as before (no `after()`). Routes: `GET /meetings?eventId=`,
  `GET /meeting-candidates?eventId=&slotStart=&slotCount=`, `POST /meetings` (201),
  `POST /meetings/{id}/accept|decline|cancel` (200, the meeting; cancel's `{ note }`
  body optional), `PUT /meeting-availability` (204), `PUT /admin/events/{id}/meetings`
  (204), `POST /admin/events/{id}/meeting-points` (201),
  `PUT/DELETE /admin/events/{eventId}/meeting-points/{id}`; contract additions in
  `@schellingboard/contracts/meeting`. Codes: `event.notFound`,
  `event.meetingsDisabled`, `event.notSchedulingPhase`, `guest.notInEvent`,
  `meeting.self`, `meeting.pointRequired`, `meeting.recipientNotInEvent`,
  `meeting.tooLong`, `meeting.slotUnavailable`, `meeting.slotPassed` (409),
  `meeting.recipientUnavailable` (409), `meeting.duplicate` (409),
  `meeting.tooManyOpen` (409), `meeting.notFound`, `meeting.notRecipient`,
  `meeting.notParticipant`, `meeting.started` (409), `meeting.alreadyAnswered` (409),
  `meeting.recipientMustDecline` (409), `meeting.nothingToCancel` (409),
  `meeting.slotsUnavailable`, `meeting.slotNotOpen` (404), `meeting.capInvalid`,
  `meetingPoint.nameRequired`, `meetingPoint.notFound`, `admin.required`. Actions keep
  their messages (`detail`, or their own sign-in line for `guest.*`) and check order;
  the legacy routes keep their bodies, statuses and `no-store`; `GET /api/meetings`
  maps an unknown event back to empty lists.

- Step 8: `server/modules/people/` (`peopleUseCases()`): `getProfile` (public fields
  only, via `sanitizeGuest`: no email, no email settings), `updateMyProfile`,
  `replaceMyAvatar` (authorizes, then validates through the `avatars` port: the
  existing `AvatarImageResourceRepository`, same storage paths), `removeMyAvatar`.
  `server/modules/notifications/` (`notificationUseCases()`): `listMyNotifications`
  (newest `limit`, `unreadCount`, `total`), `markNotificationsRead`,
  `deleteNotifications` (others' ids skipped), `readNotification` (the legacy
  "open"), `getMyEmailSettings`, `updateMyEmailSettings`, `subscribeToPush`,
  `unsubscribeFromPush` (someone else's device: success, nothing deleted),
  `isPushEnabledHere`. Attendee count in the sessions module: `getAttendeeCount`,
  `recordAttendeeCount` (takes the raw value and validates it after authorizing).
  Every one acts only as the acting guest (#370 rule, `actingGuest`); no route
  names another guest except the public `GET /guests/{id}`. Routes:
  `GET /guests/{id}`, `PUT /me/profile` (JSON, photo kept), `PUT /me/avatar`
  (multipart `avatar`; its description says a keyed retry must resend identical
  bytes or get 422), `DELETE /me/avatar` (204), `GET /me/notifications?limit=`
  (1–100, default 20), `POST /me/notifications/read|delete` (`{ ids }`, 204),
  `POST /me/notifications/{id}/read` (200, the notification),
  `GET/PUT /me/email-settings`, `POST /me/push-subscriptions` (204),
  `POST /me/push-subscriptions/remove|check` (endpoint in the body, never the URL;
  subscriptions are never returned), `GET/PUT /sessions/{id}/attendee-count`
  (`{ count }`). Contracts: `publicProfileSchema`, `profileBodySchema` (guest),
  `@schellingboard/contracts/notification`, `pushEndpointSchema`,
  `pushEnabledSchema`, `attendeeCountBodySchema`, `attendeeCountViewSchema`. Codes:
  `profile.notFound`, `avatar.invalid`, `notification.notFound`,
  `attendeeCount.notHost` (403, also for an unknown session),
  `attendeeCount.sessionNotFinished` (409), `attendeeCount.invalid`,
  `guest.unselected`, `guest.protected`. The profile, settings, notifications,
  push and attendee-count actions delegate with their messages and check order
  (profile and settings parse first, push keeps `requireVerifiedGuest` before
  parsing, attendee count authorizes before validating and re-derives the zod
  issues for `attendeeCount.invalid`). A body Hono cannot parse at all (bad JSON,
  bad multipart) is now `request.invalid` with its 4xx status instead of `500`.
  Left out: notification paging beyond `limit` (ADR 0012 leaves pagination out,
  #831), the VAPID public key route, and the profile and notification pages
  still read the repositories directly.

- Step 9: `server/modules/events/` (`eventUseCases()`: `listEvents`, `getEvent` (with
  its days), `createEvent`, `updateEvent`, `updateEventPhases`, `deleteEvent`,
  `createDay`, `updateDay`, `deleteDay`) and `server/modules/venue/`
  (`venueUseCases()`: `listLocations` (hidden ones and each one's `eventIds`
  included; `eventId` filters), `createLocation`, `updateLocation`, `deleteLocation`,
  `moveLocation`, `assignLocationsToEvent`, `removeLocationsFromEvent`; the image
  store is a port). Room unavailability is a reserved window, which the target
  architecture gives to scheduling, so it lives in the sessions module
  (`listLocationUnavailability`, `addLocationUnavailability`,
  `deleteLocationUnavailability`). Use cases take `Date | undefined` for dates (an
  invalid Date is refused with the legacy message), so the actions keep parsing the
  forms' UTC wall-clock strings and the API takes ISO instants with an offset;
  check order is the legacy one (update day: day lookup before parsing). Kernel:
  `AppError.errors` (`{ path, message }[]`, also sent in the problem body) and
  `invalidFields(code, errors)`, so `location.invalid` reports every field at once as
  the legacy form did; the action turns them back into issues. Event icon names
  moved to `@schellingboard/domain/event-icons` (`app/event-icons.ts` checks its map
  against them with `satisfies`). Routes: `GET/POST /admin/events`,
  `GET/PUT/DELETE /admin/events/{id}`, `PUT /admin/events/{id}/phases`,
  `POST /admin/events/{id}/days`, `PUT/DELETE /admin/days/{id}`,
  `GET/POST /admin/locations` (`?eventId=`), `PUT/DELETE /admin/locations/{id}`,
  `POST /admin/locations/{id}/move`, `POST /admin/events/{id}/locations/assign|remove`,
  `GET/POST /admin/events/{id}/location-unavailability`,
  `DELETE /admin/location-unavailability/{id}`; contract
  `@schellingboard/contracts/event` and additions to `.../location`. Codes:
  `admin.required`, `event.notFound`, `event.nameRequired`, `event.durationInvalid`,
  `event.breakInvalid`, `event.slotIncrementInvalid`, `event.iconUnknown`,
  `event.timezoneUnknown`, `event.slugEmpty`, `event.slugReserved`, `event.slugTaken` (409),
  `event.slotIncrementMisaligned` (409), `event.phaseDateInvalid`,
  `event.phasesOutOfOrder`, `day.notFound`, `day.dateInvalid`, `day.windowInvalid`,
  `day.misaligned`, `day.overlap` (409), `day.sessionsOutside` (409),
  `day.saveFailed` (409), `location.invalid` (with `errors`), `location.notFound`,
  `unavailability.timeInvalid`, `unavailability.endBeforeStart`,
  `unavailability.roomRequired`, `unavailability.roomNotInEvent`,
  `unavailability.notFound`. Left out of the API: location images (multipart, admin
  UI only). The time zone is checked (`Intl`), as the legacy `create-event` route
  did. Location event ids are de-duplicated (a repeat used to crash on the
  primary key). Every `/api/v1` response defaults to `cache-control: no-store`
  (`createApp`). `app/api/admin/create-*` routes stay for step 10.

- Step 10a: `server/modules/people/` (`peopleUseCases()`: `listGuests` (id, name,
  email, `authProtected`, `eventIds`; never the password hash or email settings),
  `createGuest` (409 on a taken email), `ensureGuest` (the legacy `create-guest`
  route's find-or-create by email with an optional event slug; no `/api/v1` route,
  `POST /admin/guests` plus an `Idempotency-Key` covers scripts), `updateGuest` (the
  UNIQUE-constraint race is still `guest.emailTaken`), `deleteGuest` (the database
  cascade, unchanged), `sendTestEmail` (mail is a port, wired to `sendMail` in
  `composition.ts`), `assignGuestsToEvent`, `removeGuestsFromEvent`, `importGuests`
  (CSV as text; every bad row is an `errors` entry with path `csv`). Site settings
  are a new `server/modules/settings/` (`settingsUseCases()`: `getSiteSettings`,
  `updateSiteSettings`; the map store is a port wired to `utils/map-image`, same
  storage paths and validation): the target's nine modules have no home for the
  site title, and the venue module's maps are per-place pins. Not `site/`, which
  `.gitignore` ignores (the generated docs site). Kernel: a sixth
  error kind `unavailable` (503, ADR 0012 section 4 amended) for `mail.failed`.
  Routes: `GET/POST /admin/guests`, `PUT/DELETE /admin/guests/{id}`,
  `POST /admin/guests/{id}/test-email` (204), `POST /admin/guests/import` (JSON
  `{ csv, eventIds }`, 200 `{ created, existing }`),
  `POST /admin/events/{id}/guests/assign|remove` (204), `GET /admin/settings`,
  `PUT /admin/settings` (multipart `title`, `description`, `image`, `removeMap`
  `true`/`on`; like `/me/avatar`, a keyed retry must resend identical bytes; hashing
  the parsed form stays open). Contracts: admin guest schemas in `.../guest`,
  `@schellingboard/contracts/settings`. Codes: `admin.required`, `guest.invalid` (with
  `errors`), `guest.emailTaken` (409, with `errors`), `guest.notFound`,
  `guest.unknown` (an assign naming an unknown guest), `event.notFound`,
  `mail.failed` (503), `guestImport.invalid` (with `errors`),
  `settings.titleRequired`, `settings.mapInvalid`. Actions keep their messages
  (field issues now carry code `custom`, as in step 9) and revalidations; the
  `create-guest` route keeps its own JSON and type checks and messages, `users`
  its body, `no-store` and 500. Use case `019-US4` added.

- Step 10b: the six `app/api/admin/create-*` seeding routes delegate. Seeding
  differences became options or admin variants: `createEvent` takes optional
  `phases` (checked after the settings, before the slug); `createDay` takes
  `eventId` or `eventSlug`; `createLocation` takes an optional `eventSlug` (404
  after the field checks); sessions module `adminSeedSession` (event by slug, no
  phase, booking-window or future gate, no co-host notification, unknown host or
  location refused, capacity defaults to the first location's, hosts and
  locations added to the event) and `adminAddRsvp` (no phase gate, hosts may RSVP,
  hard limit kept, `{ rsvp, created }`, guest added to the event); proposals
  module `adminCreateProposal` (event by id or slug, no phase gate, hosts added to
  the event). New routes only where `/api/v1` had none: `POST /admin/proposals`
  (201, the proposal) and `PUT /admin/sessions/{id}/rsvps/{guestId}` (201 new,
  200 existing, the RSVP). Events, days, locations and sessions keep their
  existing `/api/v1/admin` routes (a script there passes an explicit capacity and
  assigns hosts and rooms itself). New codes: `session.hostUnknown`,
  `session.locationUnknown`, `guest.notFound` (RSVP). Use case `019-US5` added.
  The routes keep their own JSON and type checks, bodies and statuses
  (`day.saveFailed` stays 500 there; `create-proposal` maps a missing slug's
  `event.notFound` back to "eventSlug is required", keeping its order;
  `createEvent`'s settings check refuses a non-boolean `rsvpCapacityHardLimit`
  where the route used to). One intentional behaviour change, for malformed
  requests only: `create-location` now refuses a non-boolean `bookable`
  (`location.invalid`, 400) instead of storing it in the boolean column.

- Step 11: `packages/api-client` (`@schellingboard/api-client`): `src/schema.ts` holds
  openapi-typescript 7.13.0's types for `openapi.json` (peer `typescript ^5.x`; it runs
  fine on the repo's 6.0.3, bun only warns), `src/index.ts` is `createApiClient(options)`
  over openapi-fetch 0.17.0 (`createClient<paths>`; paths carry `/api/v1`, so
  `baseUrl` is the site origin). The generated types are committed, like `openapi.json`:
  `make openapi` writes both from the same document and `make openapi-check` (precommit,
  CI lint job) fails on either being stale. Generating at build time instead would
  need a step before every `tsc`, ESLint, depcruise, Vitest and `next build` run (the
  root tsconfig includes `packages/`), the Dockerfile included, and leave editors
  without types. The root takes the package as a devDependency (tests only; nothing in
  the app imports it, so the standalone build does not carry it). Dockerfile: one
  `COPY` of the new manifest (frozen install needs every workspace's). Depcruise rule
  `api-client-imports-only-openapi-fetch`. **Deviation**: PLAN step 11 and
  `03-server.md` ("`api-client` is generated from it in the build") ask for build-time
  generation; committed output plus `openapi-check` keeps their intent (one source,
  `openapi.json`; cannot go stale). Left for step 12: reword that `03-server.md` line
  and `07-repo-and-rules.md` ("generated; do not edit" → generated, committed); ADR 0012
  section 6 still says the client comes "in a later step"; ADR 0010 and docs do not
  list the package.

- Step 12: public page `docs/public/self-hosting/api.md` (sidebar and index
  linked): signing in through `/api/auth/login` (the cookie format stays
  undocumented: it changes with tokens in target step 6), problem codes, `Idempotency-Key`, `no-store`,
  the client (private workspace package, not on npm; `openapi.json` is not
  served, readers take it from the release tag). Dev note `docs/dev/server.md`
  (layout, adding a use case and route, testing split). The target's
  03-server.md and 07-repo-and-rules.md describe the target, so they stay; the
  committed api-client types are recorded as a deviation in ADR 0012 section 6.
  ADR 0012 (still Proposed) now names the built modules (`people` holds the
  admin guest list, `settings` is extra), `now` per request, the idempotency
  scope, claim, 60 s abandonment, key length, replayed headers and multipart
  rule. Step 3's status and what remains are in `10-path-from-here.md`.
  coding-guidelines' Authorization helpers point at the new paths. CHANGELOG `Added` bullet (#677); no release-notes highlight
  (the five are attendee features an API for scripts would not displace).
  `fixes #677`: every route the issue asked for has an `/api/v1` equivalent in
  `openapi.json`, now documented. Not changed: AGENTS.md's "Bad" example cites
  comments in `app/(site)/context.tsx` that were gone before this run.

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

- #1006 is only partly served by step 9 (`issue #1006`): events with their days and
  locations with hidden ones can be read, and locations kept in sync by id. Still open
  from the issue: an admin session list, a partial admin session update that keeps an
  explicit capacity, a session delete answering the affected RSVP count, a
  find-or-create for locations by name (`no-store` on every `/api/v1` response was
  added in step 9's review). Which of these belong in this run (step 10?) and
  which stay on the issue?

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
- Step 7: meetings module (own meetings, candidates, request, accept/decline,
  cancel, availability; admin 1-on-1 settings and meeting points), `/api/v1` meeting
  routes (guest and admin), the meeting actions, `admin-meetings` actions and both
  `/api/meetings` routes delegate. format, lint, arch, openapi-check, typecheck,
  test-coverage pass. Firefox E2E cannot run (Playwright CDN blocked); full suite on
  Chromium: 178 passed, 13 failed, 4 flaky, all in the known baseline or known flakes
  (`schedule-agenda:220`, `view-session:7`); every meetings spec passed. No
  user-facing change, no CHANGELOG entry.
- Step 8: people module (public profile, own profile, photo upload and removal),
  notifications module (own notifications, email settings, push devices), attendee
  count in the sessions module; `/api/v1` routes; the profile, settings,
  notifications, push and attendee-count actions delegate. format, lint, arch,
  openapi-check, typecheck, test-coverage pass. Firefox E2E cannot run (Playwright
  CDN blocked); full suite on Chromium: 174 passed, 13 failed, 8 flaky, all in the
  known baseline or known flakes (`kiosk:18`, `schedule-agenda:220`,
  `view-session:7`/`:45`, `profile-comments:95`) except flaky `rsvp.spec.ts:235`,
  which passed 3 of 3 with `--retries 0 --repeat-each 3` (a loading-race test this
  step does not touch). Every profile, notifications and push spec outside the
  baseline passed. No user-facing change, no CHANGELOG entry.
- Step 9: events module (events, phases, days), venue module (locations, order,
  event assignment), room unavailability in the sessions module, `/api/v1/admin`
  routes for all of them (reads included), and the `admin-events`, `admin-days`,
  `admin-locations`, `admin-location-events` and `admin-location-unavailability`
  actions delegate. format, lint, arch, openapi-check, typecheck, test-coverage pass.
  Firefox E2E cannot run (Playwright CDN blocked); full suite on Chromium: 175
  passed, 17 failed, 3 flaky, all in the known baseline or known flakes (`kiosk:18`,
  `schedule-agenda:220`, `view-session:7`); every admin spec outside the baseline
  passed (the location-assignment test on retry). No user-facing change, no
  CHANGELOG entry.
- Step 10a: guests module (list, create, find-or-create, update, delete, test
  email, event assignment, CSV import) and settings module (site settings with the
  map upload), `/api/v1/admin` guest and settings routes, and the `admin-guests`,
  `admin-guest-events`, `admin-guest-import`, `admin-settings` actions and the
  `create-guest` and `users` routes delegate. format, lint, arch, openapi-check,
  typecheck, test-coverage pass. Firefox E2E cannot run (Playwright CDN blocked);
  full suite on Chromium: 178 passed, 12 failed, 5 flaky, all in the known baseline
  or known flakes (`kiosk:18`, `profile-comments:95`, `schedule-agenda:220`,
  `view-session:7`); every admin guest, import and settings spec outside the
  baseline passed. No user-facing change, no CHANGELOG entry.
- Step 10b: the six admin seeding routes (`create-event`, `create-day`,
  `create-location`, `create-session`, `create-proposal`, `create-rsvp`) delegate
  to the events, venue, sessions and proposals use cases; new
  `POST /api/v1/admin/proposals` and `PUT /api/v1/admin/sessions/{id}/rsvps/{guestId}`.
  Legacy route tests gained refusal-message and check-order cases, which pass on
  the old routes too. format, lint, arch, openapi-check, typecheck, test-coverage
  pass. Firefox E2E cannot run (Playwright CDN blocked); full suite on Chromium:
  179 passed, 12 failed, 4 flaky, all in the known baseline or known flakes
  (`kiosk:18`, `view-session:7`/`:45`). No E2E test calls these routes. No
  user-facing change, no CHANGELOG entry.
- Step 11: `packages/api-client` generated from `openapi.json` by `make openapi`,
  checked by `make openapi-check`; `tests/integration/api-client.test.ts` calls
  `GET /api/v1/admin/events` (and its 401 problem) through the client and the real
  proxy. format, lint, arch, openapi-check, typecheck,
  test-coverage pass. No app code changed, so no E2E run; `make test-e2e-docker`
  cannot run here (Dockerfile gained one manifest `COPY`). No user-facing change, no
  CHANGELOG entry.
- Step 12: API page for self-hosters, `docs/dev/server.md`, ADR 0012 matching the
  build, step 3 status, one CHANGELOG bullet, moved example paths. format, lint,
  docs-validate, docs-dev-validate, arch, openapi-check, typecheck, test-coverage
  pass. Docs only, no E2E run (Firefox cannot run: Playwright CDN blocked).
