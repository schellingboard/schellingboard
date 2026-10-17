# Progress

## Decisions

- Session branch: `claude/uow-feed`.
- Checks per step, by the user's standing instruction: `make format lint arch
openapi-check typecheck test-coverage` (or `make test`), without E2E. E2E runs
  only for UI steps; the user runs the full E2E suite at the end.
- Step 1: ADR 0013 written with options (a), (b), (c); it recommends (c). Docs
  only, so its checks were `make format` and `make docs-dev-validate`.
- User, 2026-10-06: push no further PRs; later steps stay local jj commits
  stacked on each other. (PR #1208 holds step 1.)

- Step 1 decided: the user chose ADR 0013 option (a) on 2026-10-06 (recorded
  in its Decision; Status stays Proposed until step 18).
- 2a: WAL (`synchronous=NORMAL`), a write and a read-only connection in
  `db/container.ts`. Repository methods named `find|list|search|count|get…`
  (not `findOrCreate…`) run on the reader; every other method takes the write
  lock (`db/write-lock.ts`, on `globalThis`). `withWriter(fn)` holds the lock
  and hands over the write connection: 2b's `uow.run` wraps it. Inside
  `uow.run`, writes must go through `tx`; `getRepositories()` writes would wait
  for the held lock (deadlock).
- 2a: test databases are files in a per-run temp dir (vitest `globalSetup`,
  `inject("testDbDir")`), one per worker; a migrated template is copied before
  each test, reopened with `synchronous=OFF`. `make test`: 19.4 s before,
  21.1 s after.
- 2a: `make test-e2e-docker` must run before release (step 18): WAL adds
  `-wal`/`-shm` next to the database, and E2E seeding shares the file with
  the container through a bind mount. The public backup docs already handle
  the WAL files, so no public-doc or CHANGELOG change.

- 2b: `server/kernel/unit-of-work.ts` exports `unitOfWork` (`run`, `read`)
  and the `Tx` type; `db/container.ts` holds the SQL (`writeTransaction`,
  `readTransaction`). `run` keeps a manual `BEGIN IMMEDIATE` open across awaits
  under the write lock; a repository's own transaction inside it is a
  savepoint. A throw or a failure `Result` (`ok: false`) rolls back.
  `tx.record()` collects changes; they are appended (`changes.append`) before
  `COMMIT` and published after it, under the lock.
- 2b: `uow.read` uses a third, read-only connection behind its own lock, so
  plain reads never join its older view.
- 2b: subscribers live in `server/kernel/change-subscribers.ts`, which imports
  nothing at run time (the jobs loop is bundled for Edge too). The jobs loop
  subscribes in `startJobsLoop`; `SessionDeps.nudgeJobs` is gone, replaced by
  `uow`.
- 2b: `sessions.update`/`delete` no longer take `by` or log. The sessions
  module's `changeSession`/`removeSession(tx, …)` read the state before,
  write, and record (a change only when the version went up). Tests use
  `updateLoggedSession`/`deleteLoggedSession` from `tests/helpers/changes.ts`.
  Validation reads in the session use cases still run outside `uow.run`
  (step 3a moves them in).

- 3a: the multi-write use cases of the family were `adminSeedSession`
  (session, then hosts and rooms join the event) and `adminAddRsvp` (RSVP,
  then guest joins the event); both now run whole in `uow.run`. The session
  update and delete use cases (guest and admin) moved their validation reads
  into `uow.run` too, so check and write are atomic; `notifyCohostsAdded`
  runs after commit. So do `createSession` and `adminCreateSession`: two
  concurrent bookings of one room both passed the clash check before. `rsvp`,
  `withdrawRsvp` and `adminRemoveRsvp` stay as they were (one write; the
  capacity check is atomic in the repository). No legacy route or server
  action orchestrates several writes.
- 3a: `uowFailingAt(repo, method)` in `tests/helpers/changes.ts` makes one
  `tx` method fail, for the rollback tests of 3b–3d.

- 3b: the only multi-write use case of the family was `adminCreateProposal`
  (hosts join the event, then the proposal); it now runs whole in `uow.run`.
  Every other proposal, vote and comment write runs its checks in `uow.run`
  too: before, a vote, comment or like racing a delete hit a foreign key
  error (500), an edit could revive a deleted comment's tombstone, and a
  co-host removed meanwhile could still edit. `ProposalDeps` and
  `CommentDeps` take `uow`. Views are presented and notifications sent after
  commit. Proposal to session conversion belongs to the sessions family (3a).

- 3c: multi-write use cases: `updateEvent` (event, then 1-on-1 availability
  on a new increment), `createLocation` and `updateLocation` (location, then
  its events). They run in `uow.run`, and so do the checks of `createDay`,
  `updateDay` (overlap, grid, sessions outside), `assignLocationsToEvent`,
  `addLocationUnavailability` and `createMeetingPoint` (sort index). Before,
  two overlapping days could both be saved, a day could shrink past a session
  booked meanwhile, a day off a new grid could survive an increment change,
  and a room or event deleted meanwhile gave a foreign key error (500).
  `EventDeps`, `VenueDeps` and `MeetingDeps` take `uow`.
- 3c: a new location's image is saved after the commit (it is stored by the
  location's id) and its URL set in a second `uow.run`; a failed save leaves
  the location without an image; a delete meanwhile removes the saved file.
  An edit saves the image before `uow.run` (as before): if the transaction
  then refuses or fails, the file is replaced but the row keeps the old URL.
- 3c: single-write use cases without a racing check stay as they were
  (`createEvent` relies on the unique slug, phases, the deletes, moves).
- 3c: day, event and location cascades record no session change, as before
  (the repositories and foreign keys remove the sessions or their rooms; no
  change or notification was ever sent). Recording them would start emailing
  hosts and attendees; steps 8 (ADR 0014) and 12a decide it.

- 3d: the only multi-write use case was `ensureGuest` (guest, then event
  membership). It and the checks of `updateGuest` (email uniqueness; the
  UNIQUE-error catch is gone), `deleteGuest`, `assignGuestsToEvent`,
  `removeGuestsFromEvent`, `importGuests`, the profile save (avatar file
  first, then read and write), `requestMeeting`, `respondToMeeting`,
  `cancelMeeting`, `saveMeetingAvailability`, `subscribeToPush`,
  `unsubscribeFromPush` and `readNotification` run in `uow.run`; notifications
  are sent after commit. Before, a guest or event deleted meanwhile gave a
  foreign key error (500), availability saved during an increment change kept
  off-grid slots, a profile save could revert a photo uploaded meanwhile, and
  an unsubscribe could delete a device that had just moved to another guest.
  `PeopleDeps` and `NotificationDeps` take `uow`.
- 3d: site settings need no `uow`: the update now patches the map URL only
  when it changes (the repository merges under the write lock), so a title
  save no longer drops a map uploaded meanwhile.
- 3d: the auth flows (`app/actions/user-auth.ts`) write through repositories,
  not use cases; left alone as asked (step 6 of the path).
- 3d: guest delete removes their votes, RSVPs and host links by cascade and
  records no session change, as before (like 3c's cascades; step 8 decides).
- 3d: an avatar is saved before `uow.run` (as before); a save refused because
  the guest was deleted meanwhile removes the file. If the transaction throws,
  the old file is already replaced while the row keeps the old URL, as before.

- Step 4 split into 4a1–4a4 (one commit and migration per subject family),
  then 4b.
- 4a1: `versionConflict(subject, current, detail)` in `server/kernel/result.ts`
  gives `409 <subject>.versionConflict`; `AppError.current` holds the subject as
  it is now, and a route passes its view function to `problem()` to send it as
  the problem member `current` (left out without one). `versionConflictResponse`
  declares the `409` with `current` in OpenAPI. Recorded in ADR 0012 section 4.
- 4a1: the version goes up only when the row really changes (sessions: when the
  change log records a change; proposals: when `updatedTime` moves, joins
  included). The check runs in the repository's immediate transaction, so it
  is a compare-and-set. A refused update returns undefined; the use case then
  reads the current state for the conflict.
- 4a1: proposals already had `expectedUpdatedTime`. `/api/v1` replaces it with
  `expectedVersion`; the web forms keep sending `expectedUpdatedTime` until 4b,
  which drops it. Both refusals are `proposal.versionConflict` (was
  `proposal.stale`).
- 4a1: `/api/v1` is unreleased (it is under `[Unreleased]` "Added"), so there is
  no break to mark: the existing API bullet is extended instead. 4a2–4a4 add
  their subjects to its last sentence.

- 4a2: events and days get `version` (migration 0049). The event's settings,
  phases and 1-on-1 settings share one version; the repositories bump it only
  when the re-read row differs. `PUT /admin/events/{id}`, `/phases`,
  `/meetings` and `/admin/days/{id}` require `expectedVersion` and answer
  `event.versionConflict` / `day.versionConflict` with `current`.
  `updateEventPhases` and `updateEventMeetings` now run in `uow.run`;
  `/meetings` answers `200` with the event (was `204`), so a script learns
  the new version.

- 4a3: locations and meeting points get `version` (migration 0050). A
  location's version covers its fields, its events and its place: the
  repository bumps it once per real change in `update` (which now also
  replaces the event links), `setEventIds`, `assignToEvent`/`removeFromEvent`
  (event side, seeding included) and `move` (only rows whose sortIndex
  changed) and an event delete (review: the cascade dropped links unseen).
  Assign and remove send no `expectedVersion`: a set delta overwrites
  nothing (recorded in ADR 0012 section 4; 4a4 follows it for guests).
  `createLocation` answers the version after its event links (review: it
  answered 1 while the row held 2, so the next edit got 409). Room unavailability
  is its own table: no bump. `PUT /admin/locations/{id}`, `POST …/move` and
  `PUT /admin/events/{id}/meeting-points/{id}` require `expectedVersion`;
  conflicts are `location.versionConflict` / `meetingPoint.versionConflict`
  with `current`. Move answers `200` with every location in the new order
  (was `204`), so both swapped rows' versions are known. `updateLocation`
  checks the version before saving the image too, so a stale edit replaces no
  file. `updateMeetingPoint` and `moveLocation` now run in `uow.run`. The
  updateLocation rollback test is gone: its event links are now written by
  the one `update` call.
- 4a3: the CHANGELOG API bullet now says "edits to sessions, proposals or
  event setup"; 4a4 adds profiles to that list (keep it near 40 words).
- 4a4: guests get two versions (migration 0051), one per read: `version`
  for the admin view (name, email, `authProtected`, events) and
  `profileVersion` for the public profile (its fields, photo, name); a name
  change raises both. Review: one shared version refused a profile edit after
  an admin-only change the guest could not see (ADR 0012 section 4: a change
  raises the version of the subjects whose read it changes). Each goes up once
  per real change: `updateProfile` (when `profileUpdatedAt` moves), `update`
  (name or email), `setAuthProtection` (only when the flag flips) and
  `assignToEvent`, `removeFromEvent`, `importAndAssign` and an event delete
  for each guest whose events changed. Email settings have a read of their
  own: no bump. `PUT /me/profile`, `PUT /me/avatar` (form field) and
  `DELETE /me/avatar` (query parameter) require `expectedVersion` and answer
  `profile.versionConflict` with the public profile; `PUT /admin/guests/{id}`
  answers `guest.versionConflict` with the admin view, checked before the
  email (review). `DELETE /me/avatar` answers `200` with the profile (was
  `204`). A photo upload or removal checks the version before touching the
  file; a conflict after that no longer deletes the saved file.

- 4b: the guest and admin session and proposal edit forms send the version
  they loaded (taken when the form opens, so a refresh meanwhile cannot
  advance it). Their server actions, the legacy `/api/update-session` route
  (400 without it) and the four update use cases now require it;
  `expectedUpdatedTime` is gone from the forms, the actions, the use cases and
  the proposal repository. A conflict says "Someone changed this session/
  proposal while you edited it. Copy your edits somewhere safe: reloading the
  page discards them." (`STALE_SESSION_MESSAGE`, also the API's `detail`).
  The admin forms refresh after a refused save, so the next Edit starts from
  the current version. No new E2E (review: the proposal one was never red;
  the route's 409 body has integration coverage). The other forms
  of 4a2-4a4 (event, day, location, meeting point, profile, admin guest) are
  outside 4b and still send no version (see Questions). E2E run:
  proposals, update-session, scheduling and admin specs.

- Step 5 split into 5a-5d (PLAN.md). User, 2026-10-07: the guest directory
  (no `/api/v1` route yet) gets a new route in its own commit, 5d.
- 5a: `limit` (1-1000, default 100) and `cursor` in, `{ items, nextCursor }`
  out; contract in `packages/contracts/src/cursor-page.ts` (`page.ts` is the
  admin tables' `?page=` schema), recorded in ADR 0012 section 6 (old 6 is
  now 7). `pageOf(all, query, sortKey)` in `server/http/pagination.ts` cuts
  the page from the use case's full list in the HTTP layer; the cursor is
  base64url JSON of the last item's sort key, so a delete between pages
  shifts nothing; it also names its list, and a cursor that is unreadable,
  empty, from another list or of another key shape is `400 cursor.invalid`.
  Keys ascend by code units (5c negates the time for newest first). Orders:
  sessions by id (review: a start time moves while organizers schedule, and a
  sync script would skip a moved session), proposals by creation, then id.
  `/sessions` and `/proposals` now answer `{ items, nextCursor }` (were
  `{ sessions }`/`{ proposals }`); `/api/v1` is unreleased, so the CHANGELOG
  API bullet is extended. New use case 019-US8.

- User rule, 2026-10-07, for every form that sends a version (4b, 4c1, 4c2):
  a refused save must never lose the typed edits without a warning. The form
  keeps the edits and shows the conflict message; no reset or refresh may
  overwrite them, and a message that suggests reloading warns that it
  discards them. Checked for 4b and 4c1: the session, proposal, day, location
  and meeting point forms hold their inputs in state that a refresh leaves
  alone; the guest row keeps typed values over its refresh
  (`keepDirtyValues`); the profile form does not refresh.
- 4c split into 4c1 and 4c2 (PLAN.md): the event page's three forms share one
  version and stay open side by side, which 4b's pattern does not settle.
- 4c1: the day, location, meeting point, profile and admin guest forms send
  the version their values came from; their server actions and use cases
  (and `replaceMyAvatar`/`removeMyAvatar`) require it, and a missing one is
  refused, not unchecked: `updateLocationSchema`, `updateGuestSchema` and
  the profile action's schema require it; `updateDay`, `updateMeetingPoint`
  and `moveLocation` compare it with the row they read. Repositories keep it
  optional (seeding). The day and meeting point rows reset their inputs from
  the current row when Edit is pressed (they kept the values from page load);
  the admin rows refresh after a refused save. The guest row's form follows
  the page (`values`) but keeps typed edits over a refresh
  (`keepDirtyValues`, review); its version is taken on Edit as in 4b, and a
  refused save's message is kept outside the form, whose reset clears its
  errors. A move sends the version shown. The profile, day, location,
  meeting point and guest conflicts now say to copy the edits before
  reloading (review). Review, rejected: a move raises the versions of the
  rows it reorders (4a3's decision), so an edit form open on a row that
  another row's move passed is refused; rare, and the order is part of the
  location's read. A profile save from before a photo upload is now
  refused (the 3d race test is adapted). E2E run: admin, meetings-admin,
  meetings-availability, meetings-request, profile and user-auth specs.

- 5b: `GET /admin/guests` (by id: names and emails change) and the three
  comment lists (oldest first: creation time, then id) take the cursor
  contract and answer `{ items, nextCursor }` (were `{ guests }` and
  `{ comments }`). Replies are paged with the rest in time order, not under
  their parent; `parentId` rebuilds the threads. A cursor's list name holds the
  event or subject id (review; 5a's sessions and proposals too), so one from
  another event's or subject's list is `400 cursor.invalid`. `/api/v1` is unreleased: the CHANGELOG API
  bullet already covers pages.

- 4c2: the event page's details, phases and 1-on-1 forms send the event
  version; `updateEvent`, `updateEventPhases` and `updateEventMeetings` and
  their actions require it and compare it with the row they read, so a
  missing one is refused. `useEventSection` holds each form's values and
  version: on a new version from the page, a form that still holds what it
  loaded or last sent (review: not "just saved", which dropped edits typed
  while a save was pending) takes the new values and version; one with edits
  keeps both, so its save is refused with the edits kept (user rule). The
  event conflict message (`STALE_EVENT_MESSAGE`) says to copy the edits
  before reloading.

- 5c: `GET /me/notifications` takes the cursor contract (newest first:
  negated creation time, then id ascending) and answers
  `{ items, nextCursor, unreadCount }`; its `limit`-only query (max 100,
  default 20) and `total` are gone. Review, rejected: equal-time ties go by
  id ascending, the web page's by id descending; sort keys ascend and an id
  cannot be negated, and only ties within a millisecond differ. The cursor
  names the guest's list, so another guest's cursor is `400
cursor.invalid`. The use case now returns the whole list; the
  notifications page keeps its own offset paging through the repository
  (step 16 moves it to queries).

- 5d: `GET /guests?eventId=…` answers the event's guests' public profiles
  (`PublicProfile`, as `GET /guests/{id}`), in id order, with the cursor
  contract; an unknown event is `404 event.notFound`. Review: only admins
  and the event's own guests may list it (others `403`, a non-member
  `guest.notInEvent`), since who attends which event was not public; the
  query selects public columns only. A new repository query
  (`listProfilesByEvent`) reads the whole public profile, which the lean
  `listByEvent` leaves out. No search or filters: the web directory keeps
  its own in-browser search (step 5 of the path decides the rest).

- Step 6 split into 6a (push key) and 6b (location images), one commit each.
- 6a: `GET /push/key` answers `{ publicKey }` through the notifications
  use case `getPushKey`, open to anyone past the site password (the key is
  public, and a browser needs it before it can subscribe). Key generation is
  a port (`generateVapidKeys`, web-push in `server/composition.ts`); the
  settings page calls the use case, and `vapidPublicKey` is gone.

- 6b: `PUT /admin/locations/{id}/image` (multipart `image` and
  `expectedVersion`) and `DELETE …/image?expectedVersion=` call the new venue
  use cases `replaceLocationImage` and `removeLocationImage`, which raise the
  location's version and answer `location.versionConflict` with `current`
  (the image is part of the location's read). The version is checked before
  the file is replaced; a removal deletes the file after commit. A bad file is
  `400 location.imageInvalid`. The form-text `expectedVersion` schema moved
  to `server/http/route-parts.ts` (shared with `/me/avatar`). The admin
  location form keeps uploading through `updateLocation`, one save for fields
  and image: calling the image use case separately would split one save into
  two writes that can half succeed. Step 7a revisits files and rows.
- 6b review: the version check before the file save is shared with
  `updateLocation`; a location deleted between save and write now drops the
  new file. Left for 7a2: a conflict between check and write keeps the new
  file (the row names the old URL, which 404s if the extension changed), and
  a replace committed between a removal's commit and its file delete loses
  its new file. No test for these races: they need a delete or write between
  two awaits of one request.

- Step 7 split into 7.1 (kernel bucket, client IP, logins) and 7.2 (API
  middleware).
- 7.1: `server/kernel/rate-limit.ts` holds the token buckets (`takeToken`,
  `retryAfter`), the login limits (per client 10, one back every 90 s; per
  scope 100, one every 9 s: the old 15-minute windows as rates) and the
  daily email cap (20, one back every 72 min); only failures (and sent
  mails) take tokens, as before. `utils/login-rate-limit.ts` is gone. The
  client IP comes from `X-Forwarded-For` only with `SB_TRUSTED_PROXIES=N`
  (the Nth entry from the end; default 0, then all clients share one key);
  `X-Real-IP` is no longer read. The login route's `429` carries
  `Retry-After`. The ambient-clock lint does not cover `server/`, so the
  kernel needs no exemption comments.
- 7.1 review: a bucket refills one token at a time, so a client can use
  up to about twice the capacity in the first window (~39 mails in 24 h,
  not 20; ~19 failed logins in 15 min, not 10); later it holds to the rate.
  The email message says "try again later". With `SB_TRUSTED_PROXIES`
  unset, the first request carrying `X-Forwarded-For` logs a warning, and so
  does an invalid value. The bucket map keeps at most 10,000 entries: full
  buckets go first, then the oldest. The CHANGELOG has a breaking-change
  note (coordinator's decision, 2026-10-07).
- 7.2: `server/http/rate-limit.ts` takes a token per request after the
  actor middleware: one bucket for the admin, one per verified guest, else
  per client IP (`API_LIMIT`: 300 at once, then 5 a second; my choice, the
  plan names no numbers). Past it: `429 rate.limited` with `Retry-After`.
  `/api/v1/health` is exempt (monitors would share the anonymous bucket).
  `tests/setup.ts` resets the buckets before every test. No CHANGELOG
  bullet: `/api/v1` is unreleased and its docs say it. No OpenAPI change:
  the `default` problem response covers `429`.
- 7.2 review: an open (unsigned) guest cookie no longer gets its own
  bucket, as any id would buy a fresh one; open names count by client IP.
- 7a1: each photo upload gets a file of its own (`<guestId>-<uuid>.<ext>`,
  no `?v=`: the name is the cache buster) through the avatar port's
  `saveNew`; the row then moves in the transaction. After it, the file the
  row no longer names is deleted (`deleteByUrl`, renditions too): the old
  one on success, the new one on a conflict, a missing guest or a throw. So
  the version check before the file write is gone. A guest delete deletes
  the photo after commit. A file that cannot be deleted is logged. Old
  `<guestId>.<ext>` files are deleted by URL like new ones. Photos of
  guests deleted before this change stay on disk. The admin cannot change
  a guest's photo, so "admin save and removal" is only the delete. E2E run:
  profile-photo and profile specs.
- 7a1 review: a resize (`?w=`) of the old photo still running when the
  file is deleted can write `<old>.<w>.<ext>` afterwards, and nothing
  removes it (the old `save` deleted every `<id>.` file on the next
  upload). Left for 7a2. A failed directory read while deleting is logged.
  The race test now covers only a stale upload: with no check before the
  file write, the race it guarded no longer exists.
- 7a2: the file-and-row writes were guest photos, location images (create,
  edit, replace, remove, delete) and the site map. One kernel helper,
  `withStoredFile(files, newUrl, write)` in `server/kernel/stored-files.ts`:
  the write reports the URL it replaced, and after it the unused file goes
  (the old one on success, the new one on a refusal or a throw). All three
  now store each upload under a new name (`<id>-<uuid>.<ext>`,
  `map-<uuid>.<ext>`; no `?v=`) and delete by URL, only under their own
  `/media/...` prefix, so seeded `/locations/...` assets are never touched.
  The location and map version checks before the file write are gone; the
  site settings save now runs in `uow.run` (`SettingsDeps.uow`). This
  settles 6b's conflict and removal races. A resize finishing after its
  original was deleted removes its own rendition (the delete removes the
  original before listing renditions). The old fixed-name `save`/`delete`
  adapters are gone. A test that spied on the reader's `locations.delete`
  moved to the use-case tests (`uowFailingAt`). E2E run: admin, profile,
  profile-photo, settings specs.
- 7a2 review: the helper logs a failed file delete instead of throwing
  (a committed write must not look failed); `createLocation`'s image write
  reports the URL it replaced; the map test now saves the map, then the
  title. Its unit test is gone (the use-case tests cover it). Rejected: a
  CHANGELOG line for room images and the map; a failed save losing them
  was a rare edge case, which AGENTS.md keeps out of the changelog.
- 8: ADR 0014 written (Proposed), one recommendation per PLAN bullet. Notable:
  RSVPs record two changes (own RSVP to the guest, the count to the event);
  site-level subjects (locations, guests) are recorded once per event;
  host names, counts and location names are normalized in the replica;
  cascades record one change per session (reaction skips `cascade: true`);
  meeting expiry is derived on the client, clash lines stay a server query;
  pruning moves to a contiguous prefix with a stored watermark (`410` below
  it or above the newest `seq`); hidden tabs close the feed after 30 s, and
  the docs ask for HTTP/2.
- 8 review, all accepted: resets go in-stream (`event: reset`, status 200),
  hidden tabs reopen with `?since=`; newest `seq` from `sqlite_sequence`;
  event guests include hosts and meeting guests, guest delete is a cascade;
  the hub closes a guest's connections on credential changes, and every
  connection ends after 10 min; audiences keep `guests`/`admins` and per-event
  rows, stated as superseding the target; `no-transform`, slug change, guest
  payloads carry `profileVersion`, fake-clock pruning note, 1 MB send limit.
- 9: migration 0052 adds `audience` (JSON, NULL on old rows),
  `correlation_id` (nothing sets it yet: no reaction records changes) and
  `command_key`. `Audience` and `audienceOf` live in
  `packages/domain/src/change.ts` (a separate file was a dependency cycle);
  session changes go to `event`. `uow.run` stores the audience on append. The
  idempotency middleware runs the request in `withCommandKey`
  (`server/kernel/command-key.ts`, AsyncLocalStorage), which `uow.run` reads.
  New use case 007-US8 (schedule updates without a reload).
- 9 review, all accepted: publish runs outside the request's command key
  (`withoutCommandKey`), so the jobs pass a nudge starts does not inherit it;
  ADR 0014 says the feed sends `command_key` only to the change's actor
  (keys are unique per actor only); ADR 0012 points to it; test tag added.

- Step 10 split into 10a (query), 10b (route, golden files per viewer), 10c
  (SSR layout through the query, selectors).
- 10a: `readSnapshot(uow, slug, viewerId)` in `server/feed/snapshot.ts` runs
  in one `uow.read` and returns the wire shape (`Snapshot`,
  `packages/contracts/src/snapshot.ts`), so SSR, the API and the feed share
  one JSON shape. Module queries (`application/snapshot.ts` in events,
  sessions, venue, people, meetings) return domain objects; the feed maps
  them with the modules' view functions (now exported from `module.ts`).
  Guests are the lean fields today's schedule has (`id`, `name`,
  `avatarUrl`, `aboutMe`, `authProtected`) plus `profileVersion`, from the
  new `guests.listShownByEvent` (members and hosts). Locations
  leave out `eventIds`. `me.rsvps` holds only this event's RSVPs. `seq` is
  `changes.getNewestSeq()` (`sqlite_sequence`). New dependency-cruiser rule
  `feed-reads-through-module-queries`: `server/feed/` imports no `db/` code
  beyond types.
- 10a review, accepted: the rule comment and ADR 0014 section 7 say what is
  enforced (no `db/` value imports; `q` typed as the module queries'
  repositories); `seq` comes from the kernel's `newestSeq`; view functions
  for locations, unavailability, meeting points and event guests live in
  their modules; tests check other guests' meetings and slots stay out of
  `me`. Coordinator's decision (privacy): the shared `guests` list is members
  and session hosts only; a viewer's meeting partners come only in
  `me.meetingGuests`, and meeting changes will carry both parties' lean
  fields (ADR 0014 section 1). A partner's rename reaches the viewer only
  with the next change to that meeting.
- 10b: `GET /events/{slug}/snapshot` (`server/feed/routes.ts`, mounted in
  `server/http/app.ts`, which hands it `uow` and the guest lookup). The
  viewer is `actingGuest`: an open cookie for an unprotected guest or a
  verified one, else `me` is null (as the SSR's `verifiedCurrentUser`). An
  unknown slug is `404 event.notFound`. Golden files in
  `tests/integration/golden/` (ids replaced by labels) for the five viewers;
  update them with `vitest -u`. Event guests are now ordered by name, then
  id, so the files are stable. Public API docs: one bullet under "Syncing
  from a script". No CHANGELOG line: `/api/v1` is unreleased and its bullet
  covers it.
- 10b review, accepted: `snapshotFor(uow, actor, slug)` (returns a `Result`)
  resolves the viewer with `actingGuest` inside the `uow.read`, for the
  route and for 10c's SSR; `event.notFound` says "Event not found"; the
  route's description names the `guest` cookie.
- 10c: the layout calls `eventSnapshot(actor, slug)` (`server/composition.ts`,
  since `app/` may not import `server/feed/`) and `eventContextFrom`
  (`app/(site)/[eventSlug]/replica/selectors.ts`) rebuilds today's shapes:
  host names, room names and `numRsvps` joined in, dates parsed. The
  selectors live with the client store (ADR 0014 section 12, amended), not
  in `packages/domain`, which may import nothing but itself. Snapshot guests
  gained `member` (contract, golden files, ADR section 1): the host picker
  and the attendee count in `EventContext.guests` stay members only. A host
  or room missing from the snapshot is left out of a session rather than
  shown unnamed. `myMeetings` still comes from `myMeetingsFor` (clash lines
  need other guests' RSVPs) until step 14. E2E run: scheduling,
  schedule-agenda, -grid-search, -layout, kiosk, rsvp, view-session,
  add-session, update-session, meetings-column, room-availability,
  now-line, attendee-count, voting, user-auth (71 passed).
- 10c review, accepted: free slots come from the snapshot's `me`; the
  meeting views (clash lines) still come from `meetingViewsFor`, which reads
  the meetings again outside the snapshot's read (step 14 replaces it with
  the meetings column's own fetch). The guest mapping is checked with
  `satisfies`; the ADR paragraphs are reflowed.
- 11: settled 10c's question: `apply` lives with the client store
  (`app/(site)/[eventSlug]/replica/apply.ts`) over the contracts' `Snapshot`
  and `FeedMessage` (new `packages/contracts/src/feed.ts`, the two session
  types so far); `packages/domain` would need a copy of the wire types
  (ADR 0014 section 12 amended). `reaches(audience, viewer)` is in the
  domain; `project(change, viewer)` in `server/feed/project.ts` sends
  `commandKey` to the actor only. Sessions in the snapshot and in
  `session.changed` share `toSnapshotSessionView`. The harness,
  `expectChangesSuffice(actor, slug, work)` in `tests/helpers/sufficiency.ts`,
  compares replica and snapshot without `seq` and with lists sorted by id.
  A session deletion drops the session's count; the viewer's own RSVPs to
  it wait for `rsvp.removed` (12a). `fast-check` added (dev); the property
  test uses a fixed seed (#1169). The snapshot fixture moved to
  `tests/helpers/snapshot-fixture.ts`.
- 11 review, all accepted: unit tests for `project` (command key per actor)
  and `reaches`; `apply` gives a new session a count of 0, as the snapshot
  does, and the fixture has a count per session; the property test adds seq
  gaps and duplicate deliveries; the harness takes a `viewer`. The command
  key's actor is coarser than ADR 0012's key scope (no admin id, no cookie
  level): written down in ADR 0014 section 10, not changed.
- 12a: new changes `session.created`, `session.attendanceChanged` (event),
  `rsvp.added`, `rsvp.removed` (guests: the RSVPer), each with a message, a
  `project` case, an `apply` case and a sufficiency test. Helpers in
  `sessions/application/session-changes.ts`: `addSession`, `recordRsvpAdded`
  (the RSVP row, then the new count), `removeRsvp` (no-op when absent).
  `removeSession` records `rsvp.removed` per RSVPer before `session.deleted`
  (the session's own cascade); no count change, `apply` drops the count.
  `rsvp`, `withdrawRsvp`, `adminRemoveRsvp` now run in `uow.run`;
  `adminSeedSession`, `adminAddRsvp`, `adminRemoveRsvp` take `now` (callers
  pass the request clock). The reaction ignores the new types already (it
  tests for its two). Not done, left to 12b/12c: the `cascade: true` marker
  and the cascading changes of day, location, event and guest deletes.

- 12b split in PLAN.md: every use case needs the request clock (`now`), so
  this commit covers events and days; 12c is locations, their assignment and
  room unavailability (with the session cascade of a location delete), 12d the
  old 12c. Added: `event.changed` (settings, phases, meeting settings, and a
  day edit that moves the event's first or last day), `event.deleted`,
  `day.created|changed|deleted`, all for the event. `updateEvent`,
  `updateEventPhases`, `deleteEvent`, the day use cases and
  `updateEventMeetings` take `now`. `cascade: true` is `ChangeContext.cascade`,
  stored in the session change payload; the notification reaction skips it.
  `recordingSessionCascade` (`server/kernel/session-cascade.ts`) wraps a delete
  that removes sessions as a side effect (day, event) and records, from the
  sessions before and after, `rsvp.removed` + `session.deleted` or
  `session.changed`, marked cascade: no copy of the repository's overlap rule.
  Event delete records its sessions' deletions, then `event.deleted`; `apply`
  keeps the replica as it is on `event.deleted` (step 14 shows "event gone").

- 12c: `location.changed` / `location.removed` (recorded once per event the
  location is assigned to, payload the domain `Location`), and
  `unavailability.added|removed`. Recorded by create, update (changed for its
  events, removed for those it left), image replace/remove, move (every
  location whose order or version moved), assign and remove for an event,
  delete, and the seeding session that brings a location into its event. A
  location delete wraps `recordingSessionCascade` over the sessions that use
  it (any event), and records `unavailability.removed` for its closed periods
  and `location.removed` per event. Removing a location from an event leaves
  its sessions' links alone, as the repository does; selectors skip a room
  the replica no longer holds. All venue use cases and the unavailability ones
  take `now`.
- 12c review: kept the second `location.changed` of a create with an image
  (version and image URL differ; replay is idempotent); the per-event queries
  and double `list()` in delete and move stay (admin-only, small). Selectors
  skipping a removed room are now a task of step 14.

- 12d: `guest.changed` (the lean guest plus `member`) and `guest.removed`, for
  the event; `meetingPoint.changed|removed` for the event; `meeting.changed`
  (audience: requester and recipient); `availability.changed` (the guest's
  declared slots, to the guest; not in the plan, but the snapshot's
  `me.availability` needs it). `recordingShownGuests` (`server/kernel`) diffs
  the event's shown guests (members and hosts) around any work that joins,
  removes or edits guests, so assign, remove, import, `ensureGuest`, admin
  guest edit and delete, profile edits, and the admin paths that add hosts as
  members all use it (new repo method `listShownEventIds`). `apply` also
  updates `me.meetingGuests` from `guest.changed`, and adds the other party
  of a new meeting from `guests`. Use cases that gained `now`: the guest and
  meeting-point admin ones. `byAdmin`/`byGuest` in `server/kernel`.
  Review: `addSession`/`changeSession`/`removeSession` and a day delete wrap
  `recordingShownGuests` limited to the session's hosts (admin paths can make a
  non-member a host). A guest delete runs `recordingSessionCascade` over the
  sessions they hosted or RSVP'd (it now also records host changes and
  `session.attendanceChanged`, marked cascade), then `guest.removed`, and
  `meeting.deleted` per meeting (audience: its two guests; `apply` drops the
  meeting and partners no meeting names). Meetings an event delete removes get
  no change: `event.deleted` ends the event's replica, which `apply` keeps as
  it is, so no one reads those meetings afterwards.

- Step 13 split into 13a (hub and feed core) and 13b (the route).
- 13a: `openFeed(uow, { eventId, viewer, since }, send)` in
  `server/feed/feed.ts` registers with the hub (`server/feed/hub.ts`, on
  `globalThis`, one `subscribeToChanges` subscription), buffers live changes,
  replays `listEventAfter` in batches, then flushes the buffer above the last
  `seq` with no await in between. It answers `reset` when `since` is below the
  prune watermark or above the newest `seq`. Pruning (`deleteUpTo`) now stops
  at the first change too new and stores the watermark in the `changes.pruned`
  job cursor (`getPrunedThrough`, a reader method), so what remains has no gaps.

- 13a review, accepted: after the replay `openFeed` re-reads the watermark and
  answers `reset` if pruning passed `since` meanwhile; the hub drops a
  connection whose `deliver` throws, so others still get the change.
- 13b: `GET /events/{slug}/feed` (`server/feed/routes.ts`): the viewer is
  `actingGuest` (else no guest) plus the admin flag; `Last-Event-ID` wins over
  `?since=`; neither is `400 feed.sinceMissing`, a non-number
  `feed.sinceInvalid`. A comment every 25 s, the stream ends after 10 min, and
  a client abort or cancel closes the hub registration. Split from the
  plan: 13c holds the 1 MB cap and closing connections on credential changes
  (the `publicSchedule` setting is not part of this step). Replay is written
  before the response returns, so a very long replay is held in memory first.

- 13b review, accepted: the route registers its abort listener before
  `openFeed` and closes a feed that finished while opening, starting no
  timers; the 400 test also checks `feed.sinceInvalid`.
- 13c: the response body is a `ByteLengthQueuingStrategy` of 1,000,000 bytes;
  past it the route ends the stream (also during the replay: `send` returns
  false and `openFeed` stops), which bounds the replay buffer too.
  `server/kernel/credential-changes.ts` (`credentialsChanged`, listened to by
  the hub) ends a guest's connections; it is called after the three
  `setAuthProtection` calls in `app/actions/user-auth.ts` (through
  `setProtection`) and after `deleteGuest`. The action call sites have no new
  test (the kernel signal and the guest delete do).

- 13c review: a `credentialsChanged` between the route resolving the viewer
  and `openFeed` registering is missed, so that stream keeps the old viewer
  until its 10-minute end (accepted: the window is a few reads; the cookie
  is checked again then). A replay over 1 MB is cut and resumed on each
  reconnect (about 3 s apart for the browser), so a very late resume is slow
  but complete. Listener errors in `credentialsChanged` are logged.

- Step 14 split into 14a-14d in PLAN.md. 14a: `createReplicaStore`
  (get/subscribe/applyMessage/replace) and `connectFeed` (injected
  `createSource`/`loadSnapshot`; one listener per message type, since a named
  SSE event never reaches `onmessage`; invalid data is dropped; `reset`
  closes, reloads, replaces, reopens after the new `seq`). `eventContextFrom`
  now also drops unavailability rows of a room the replica does not hold.
  Nothing on the schedule uses the store yet, so no CHANGELOG line. Left for
  14b: error handling when the `EventSource` closes for good (refetch the
  snapshot, back off), since 14a only handles `reset`.

- 14a review: accepted all but 3's change: `replace` stays unconditional
  (after a restored backup the snapshot's seq is legitimately lower; comment
  says so). Reload retries with a delay on failure; one reload at a time,
  a stale source's reset is ignored. Item 8: days and meetings do not
  reference rooms, so only sessions and unavailability apply.
- 14b: `EventProviderWrapper` takes the snapshot and builds the context with
  `useLiveReplica` (store + `connectFeed`, one `EventSource` per tab). A new
  SSR seed (page refresh) replaces the replica. A user change loads a fresh
  snapshot (`resume: false`) before opening the feed. `event.deleted` sets the
  store's `gone` flag and the wrapper shows a notice. `EventProvider`'s RSVP
  count deltas and its `/api/rsvps` fetch still exist: their reset effect now
  runs on every replica change, so a count can flicker until the echo (14c).
  CHANGELOG, release note and attendee guide updated. Deferred to 14b2:
  hidden-tab close, `EventSource` closed by 401/404, slug change. The feed
  closes on `pagehide`: Firefox otherwise logged a console error (failing the
  console guard) when a page left with the stream open; one run in seven of
  attendee-count still failed once before that settled, 4 of 4 pass after.
  The layout integration tests now read the wrapper's `snapshot` prop.

- 14b review: the hook's logic moved to `replica/live-replica.ts` (no React,
  unit-tested with fake sources; the repo has no DOM test environment).
  Accepted: a seed is adopted only at or above the replica's seq (`store.adopt`;
  a restored backup still works, since the feed's reset reloads through
  `replace`); a user switch is one path (the snapshot load) and seeds are
  dropped until it lands; `pagehide` stops the stream and a bfcache `pageshow`
  reloads; the context value is memoized. Rejected: a new use-case ID (007-US8
  exists); a translated or in-place "gone" state (the sibling "Event not
  found" states are plain English too). `myMeetings` stays the SSR value; its
  consumers already check `guestId` against the selected guest. The CHANGELOG
  line stays: only the RSVP count flickers until 14c. Slug freeze is in 14b2.

- 14b re-review: seeds are dropped when the viewer they were rendered for
  (`me.guestId`, null if none) differs from the replica's, so an old user's
  late refresh cannot overwrite the new user's data. Known gap: a server-side
  viewer change with no client user change (logout elsewhere) is also
  dropped until the stream ends. `stop()` sets a flag that an in-flight reload
  checks, so no stream opens after pagehide; `restart()` clears it. The E2E
  console exception for the feed hides a never-connecting feed until 14d's
  live-update assertions.

- 14b2: `visibilityChanged` closes the feed after 30 s hidden and resumes with `since=`
  (the server resets if too old) when the tab is visible again; a quicker return keeps the
  stream. An `error` on a source in CLOSED state (401/404) reloads the
  snapshot; reload retries now back off (2 s doubling to 60 s). The hook
  makes a new live replica when the seed's slug changes. A seed with a lower
  seq is still refused by `adopt`; with a dead stream the reload (retrying,
  or on becoming visible) replaces the replica anyway, so no extra path. A
  hard refresh builds a new store from its seed. No CHANGELOG line (no
  visible change beyond what 14b announced). Hook wiring (visibility listener,
  slug change) has no unit test: no DOM test environment; E2E is 14d and was
  not run here.
  Known gap: a rename that arrives only through the feed leaves the replica
  on the old slug; its snapshot reload then 404s and retries (60 s cap).
  Left for 14d / a later step.

- 14c: `EventProvider`'s count deltas and `/api/rsvps` fetch are gone; the
  replica (`me.rsvps`, `counts`) is the source. `useOptimisticRsvps` keeps
  pending toggles over it (`replica/rsvp-overlay.ts`, pure, unit-tested). A
  toggle ends once the replica has its RSVP and a changed count (the POST's ok
  only for a no-op toggle), so the `rsvp.*` then `attendanceChanged` order
  neither double-counts nor flickers. A failed POST drops it and the later
  toggles of that session (the revert). An answered toggle expires after 3 s,
  once the feed has moved past the seq at the click (the replica can skip the
  states it settles on; a slow stream keeps the optimistic state).
  `expirePendingRsvps` is unit-tested, the timer is not.
  Known, for step 17's `commandKey` match: another guest's count change before
  our echo turns our delta off for a moment; our add and another guest's
  remove arriving together return the count to base while we hold the RSVP, so
  the overlay adds 1 again until the toggle expires; the POST has no timeout,
  so a hung request keeps its toggle shown. A toggle made while the
  viewer lags a name switch is dropped; RSVPs are blank meanwhile.
  `meetingsRevision` (sessions, own RSVPs, own meetings) drives the meetings
  column's refetch, 500 ms debounced. Seeds do not move it; a reload does
  (it may have missed changes), so a name switch fetches once more.
  No CHANGELOG line (fixes a flicker in the unreleased live schedule). Not
  run: E2E (user's rule); wiring has no DOM test.

- 14d: `tests/e2e/live-schedule.spec.ts` (two contexts, @007-US8): Alice
  creates, moves and deletes a session and Bob's agenda follows without a
  reload; a kiosk context sees add and delete. Both pass in the full E2E run
  (204 passed). Bob's RSVP was left out: the session dialog's attendee list
  is not live for other viewers (see Questions).

- 15: `replica/sync-state.ts` derives live / reconnecting / stale from the
  store's link (connected, since). The feed client marks it up on `open`, down
  on error or reload, restarted on stop/resume/restart; stale after 15 s down
  (my choice; ADR 0006 sets no figure). Indicator in the schedule toolbar (grid,
  agenda, kiosk), CHANGELOG line folded into the live-schedule bullet, one line
  in the attendee guide. The architecture doc's "offline" state is not used
  (no persisted replica yet). The link starts connected so a fresh seed does
  not flash a warning before the stream opens. The server heartbeat is now an
  `event: ping`; the client reopens after 50 s of silence (half-open links
  raise no error). Not run: E2E (user's rule).

## Known

- 15: the server ends a stream after 10 minutes, so "Reconnecting…" flickers
  for a few seconds on a healthy connection. Left as is: a retry line on the
  stream is a server change beyond this step.

- 15: the silence watchdog reopens with no backoff, at most once per 50 s
  (once per 110 s after a browser retry error). Silence is not a refusal, so
  the failure backoff does not apply, and each reopen is one cheap request.

## Problems

None.

## Questions

- 8 (ADR 0014, open questions): should attendees be told when a day or
  location delete removes or changes their sessions (today: no; the ADR
  keeps that)? Should hidden tabs close the feed after 30 s (recommended),
  or stay connected and rely on HTTP/2 only?

- 5d: `GET /guests?eventId=…` is limited to admins and the event's guests
  (safe default, review). Widen it to anyone with the site password if the
  directory should be public like the web `/guests` page.
- 4c2, settled by the user's rule above (2026-10-07): the event page's
  details, phases and 1-on-1 forms share one version and stay open side by
  side. A form with unsaved edits keeps them (and the version it loaded); a
  form without edits takes the new values and version when the page
  refreshes, so saving one form and then an untouched other is not refused.
- Answered by the user on 2026-10-07: the remaining forms send the version
  (step 4c); guest photo files and rows stay in sync, and a guest delete
  removes the photo (step 7a).

- 14d: does the session dialog's attendee list need to update live when
  another guest RSVPs? Not covered by 14b/14c.

- Full E2E after 14d: `rsvp.spec.ts` "leaving an event page..." held
  `/api/rsvps?user=*`, removed in 14c; rewritten to hold the live feed's
  first request instead (same intent, same tag). The 2 "did not run" were
  the tests of the project depending on the failed one. `profile.spec.ts:577`
  (guest modal close on /guests, no schedule or replica) is unrelated and
  was left alone. 14d stays unticked until the full suite is green.

- Second full E2E: 207 passed, 0 failed, 0 not run; 1 flaky
  (`meetings-request.spec.ts:214`, "Saved!" never shown, passed on retry) and
  `make` exits 1 on it. Shown unrelated to 14c: the "Saved!" is on /settings
  (availability form), which has no schedule replica or meetings provider; the
  spec passed 6 of 6 run serially (`--workers=1 --repeat-each 6`), and fails
  only when repeated in parallel against one database (guests of other
  repeats crowd the name list). So 14d is ticked with that flake as the only
  non-zero cause.

## 16a

- Site pages read through `pageReads()` in `server/composition.ts`: plain,
  actor-free reads (the pages sit behind the site password only, as before),
  each a function in its module's `application/page-reads.ts` taking
  `Pick<Repositories, ...>`, like the snapshot readers. Existing use cases
  need an actor and return `Result`, which would change what a visitor
  without a name sees. Auth flows left on the repositories (allow-list in 16c).
  Not run: E2E (user's rule).

## 16b

- Admin pages read through `adminReads()` (search/paging and per-event admin
  reads) and `pageReads()` in `server/composition.ts`; per-module `page-reads.ts`
  as in 16a. Only the three auth-flow files still call `getRepositories()`.
  Not run: E2E (user's rule).

## 16c

- Rules `app-does-not-read-repositories` (auth flows allow-listed) and
  `admin-reads-only-for-admin`. depcruise cannot restrict a named export, so
  `adminReads()` moved to `server/admin-reads.ts`. The rule catches direct
  imports only; `utils/` helpers still reach the container (follow-up in PLAN.md).

## 17a

- `runIdempotent(repo, request, now, run)` in the kernel returns
  `keyReused | inProgress | replayed | ran`; `run` returns the response to
  keep or null to forget the key. `IDEMPOTENCY_TTL_MS` moved there too.
  Behaviour of the HTTP middleware is unchanged (its tests pass untouched).

## 17b1

- `runIdempotentAction` (kernel) stores only a success under `ACTION` +
  action name, scoped by the cookie actor; a refusal frees the key. The key is
  a separate argument, outside the zod schemas. Key made with
  `getRandomValues` (`randomUUID` needs a secure context). The proposal create
  action has no change type yet, so no `command_key` shows; the test checks
  one proposal per key.

- CHANGELOG: one `(#141)` bullet (double submits no longer duplicate) is added
  by 17c, when the RSVP toggle completes the feature.

## 17b2

- The three comment create actions take a key via `createOnce` (same
  `idempotentAction`); the compose box and each reply box hold a key and
  renew it after a success. Edit has no key. Not run: E2E (user's rule).

## 17b3

- `/api/add-session` reads the standard `Idempotency-Key` header and runs
  under `idempotentAction`; the session form sends one per opened form (not on
  edit). A reused key answers 409. Not run: E2E (user's rule).

## Next step

17c.
