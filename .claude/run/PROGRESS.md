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

## Problems

None.

## Questions

- 4c2, settled by the user's rule above (2026-10-07): the event page's
  details, phases and 1-on-1 forms share one version and stay open side by
  side. A form with unsaved edits keeps them (and the version it loaded); a
  form without edits takes the new values and version when the page
  refreshes, so saving one form and then an untouched other is not refused.
- Answered by the user on 2026-10-07: the remaining forms send the version
  (step 4c); guest photo files and rows stay in sync, and a guest delete
  removes the photo (step 7a).

## Next step

5b. 4c2 waits on its question.
