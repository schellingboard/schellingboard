# Run plan: unit of work, the rest of step 3, the change feed and snapshot

Goal: finish [step 3](../../docs/dev/target-architecture/10-path-from-here.md) and do
step 4: the schedule updates without a reload for everyone (#1111). The rest of the UI
does not change. The new architecture is the basis for future work: get each contract
right once rather than keep it compatible.

Read first: `docs/dev/target-architecture/03-server.md` (Use cases, Change log, Change
feed and snapshot), `04-client.md` (The replica), `05-security.md` (Authorization),
`06-data-and-time.md`, ADRs 0011 and 0012, `docs/dev/server.md`.

## Settled before the run

- Order: the unit of work first; then the API contract changes (versions, pagination),
  so change payloads are right from their first version; then the feed; then what
  builds on the snapshot.
- `/api/v1` may change in breaking ways. Mark each break in CHANGELOG (as 4.0.0 did),
  in the step that makes it. User-facing steps update CHANGELOG and `docs/public/` in
  their own commit; step 18 only checks them.
- The feed is SSE, served by the existing Hono mount `app/api/v1/[[...route]]`. No
  custom server, no WebSockets (D7).
- Next and SSR stay. The schedule (grid, agenda, kiosk, session modal) reads from a
  client replica seeded with the snapshot during SSR and kept current by the feed. No
  other screen changes.
- Use cases record changes with `tx.record()` in the same transaction as the state. The
  audience is computed at write time and stored. Payloads carry the subject's full
  state as the audience may see it.
- Snapshot RSVPs: per-session counts plus the viewer's own RSVPs. Protected guests' RSVP
  lists stay out of every browser; the session modal keeps fetching its attendee list.
- Identity stays as in ADR 0012: cookies, guest and admin actors. Audiences use what
  today's model has: everyone in the event, named guests, admins.
- Out of scope: the SPA, commands with predictions, IndexedDB and offline (step 5);
  proposals, votes, comments and notifications in the replica; `publicSchedule`;
  persons and roles (step 6); moving the inline `after()` notifications to reactions.

## Steps

### Unit of work

- [x] 1. **ADR 0013, unit of work** (Status: Proposed; decided (a) on 2026-10-06).
      `uow.run(async (tx) => …)`: one
      transaction per use case; `tx` holds the repositories and `record(change)`; after
      commit and before the writer lock is released, `publish` to in-process
      subscribers (the jobs nudge now, the feed hub later), so subscribers see changes
      in `seq` order. The constraint to settle: better-sqlite3 transactions are
      synchronous and per connection, the ports are async, and an `await` inside an
      open transaction lets other requests' statements on that connection join it.
      Facts that bear on it: the SQLite repositories are already synchronous behind
      async signatures; better-sqlite3 blocks the event loop, so a second connection in
      the same process gives isolation but no parallelism; the database is not in WAL
      mode today; the test helpers (`tests/helpers/db.ts`) restore an in-memory
      database from a buffer, which a second connection cannot open. Options: (a) one
      writer connection behind an in-process async mutex, queries on a separate read
      connection (needs WAL and file-backed test databases); (b) synchronous
      transaction callbacks with sync tx repositories; (c) one connection, one async
      mutex: `uow.run` for writes, `uow.read` for multi-statement reads that must be
      consistent (the snapshot), single-statement queries outside both.
      The ADR sets out the trade-offs of each (isolation, throughput, test helpers,
      WAL in production, effect on the snapshot's read transaction) for the user to
      decide; until decided, record it under Questions and continue with steps that
      do not depend on it (4 to 7).
- [x] 2. **Kernel unit of work**: as the ADR says. The user chose option (a) on
      2026-10-06; record it in ADR 0013's Decision (a new commit: step 1's is pushed).
  - [x] 2a. Connections: WAL in production, one writer connection behind an in-process
        async mutex, a read connection; file-backed test databases in
        `tests/helpers/db.ts`. Every repository write takes the mutex. Test: a read
        never sees uncommitted rows; concurrent writes serialize.
  - [x] 2b. `uow.run(async (tx) => …)` with `tx.record()` and `publish` after
        commit; `uow.read` on the read connection. Move session change logging out of
        `SqliteSessionsRepository` into the session use cases; the nudge becomes a
        subscriber. Test: a rollback writes neither state nor change.
- [ ] 3. **Atomic multi-repository use cases**: every use case that writes through more
      than one repository call runs in `uow.run`. Test each by making its second write
      fail. One commit per family; skip a family with no such use case:
  - [x] 3a. Sessions and RSVPs (admin session create with guest and location assignment,
        RSVP with event assignment).
  - [ ] 3b. Proposals, votes, comments (admin proposal create, …).
  - [ ] 3c. Events, days, venue.
  - [ ] 3d. People, meetings, notifications, settings.

### API contracts

- [ ] 4. **`expectedVersion`**: a `version` column on editable rows (sessions,
      proposals, events, days, locations, meeting points, guest profiles). A repository
      update is a compare-and-set (`WHERE version = ?`, `version = version + 1`).
  - 4a. Server: edits take `expectedVersion` (required on `/api/v1`); a mismatch is
    `409 <subject>.versionConflict` with the current state in the problem member
    `current` (recorded in ADR 0012). Responses carry `version`. Server actions pass
    the version through, optional until 4b. One commit each, each with its own
    migration; one CHANGELOG bullet, extended by each:
    - [x] 4a1. The shared conflict failure; sessions and proposals (guest and admin).
    - [ ] 4a2. Events (edit and phases) and days.
    - [ ] 4a3. Locations and meeting points.
    - [ ] 4a4. Guest profiles (`/me/profile`, `/me/avatar`, `/admin/guests/{id}`).
  - 4b. UI: the session and proposal edit forms send the version they loaded and say
    "changed by someone else".
- [ ] 5. **Pagination (#831)**: one cursor contract (`limit` and `cursor` in, `{ items,
nextCursor }` out) on every `/api/v1` list that grows with an event: sessions,
      proposals, guests (directory, admin), comments, notifications. Record the
      contract in ADR 0012. UI pagination waits for step 5 of the path.
- [ ] 6. **Location images and push key in the API**: `PUT` and `DELETE
/api/v1/admin/locations/{id}/image` (multipart, existing images port) and
      `GET /api/v1/push/key`. The admin location form and the settings page call the
      same use cases.
- [ ] 7. **Rate limiting (#679)**: in-memory token bucket per actor, else per IP; one
      kernel function used by Hono middleware and by the login server actions; strict
      limits on guest and admin password login; `429 rate.limited` with `Retry-After`.
      Read the client IP from `X-Forwarded-For` only when a documented trusted-proxy
      setting allows it.

### Change feed and snapshot (#1111)

- [ ] 8. **ADR 0014, change feed and snapshot** (Status: Proposed). Settle:
  - the change types the replica needs and their payloads (with `version`); the feed
    sends a per-type projection, so reaction-only fields (`before`, `rsvpGuestIds`)
    never reach a client;
  - who receives guest-addressed changes: the verified guest only, as
    `verifiedCurrentUser` decides today;
  - RSVP changes have two audiences: everyone gets the session's new count, only the
    guest gets their own RSVP. One change per audience, or one change with a
    per-audience projection;
  - state derived from the clock, not from a change (a meeting lapses at its slot
    start, `myMeetingsFor(…, now)`): derived on the client from raw data and the
    clock, or a scheduled job records a change;
  - change rows written before the audience column: sent to no one;
  - one `EventSource` per tab: HTTP/1.1 allows six connections per origin, so many
    tabs over HTTP/1.1 block each other. Say what self-hosters need (HTTP/2 at the
    proxy) or close the feed in hidden tabs;
  - the snapshot: today's `EventContext` (event, days, sessions, locations, room
    unavailability, event guests' public fields; `me`: own RSVPs, own meetings);
  - denormalized fields (host names on sessions, `numRsvps`): normalized in the replica,
    or changes emitted for the sessions they touch;
  - sessions removed by a day, event or location cascade: one change each, or removed by
    `apply`;
  - consistency: snapshot and its `seq` read in one read transaction;
  - the feed: `GET /api/v1/events/{slug}/feed`, `Last-Event-ID` or `?since`, 25 s
    heartbeat, `X-Accel-Buffering: no`, `410` below a prune watermark (rows are deleted
    after 7 days, and `occurred_at` follows the fake clock, so it is not monotonic); the
    viewer is fixed per connection, and a user switch reconnects;
  - the hub: in-process, on `globalThis` like `nudgeJobs`;
  - where `apply` (in `packages/domain`) and the client store live.
- [ ] 9. **Change log columns**: a migration adds `audience`, `command_key` and
      `correlation_id`. `tx.record()` computes the audience with `audienceOf` in
      `domain`. The idempotency middleware hands `Idempotency-Key` to the unit of work,
      so changes carry `command_key`. The existing session changes get audiences.
- [ ] 10. **Snapshot**: contract in `packages/contracts`; a query that assembles it
      from module queries (`server/feed/`, with a dependency-cruiser rule);
      `GET /api/v1/events/{slug}/snapshot`; `layout-content.tsx` uses the query, not
      the repositories. Golden-file tests per viewer: site password only, open guest,
      open cookie naming a protected guest, verified guest, admin.
- [ ] 11. **`apply` and the sufficiency harness**: `apply(replica, change)`, pure, in
      `packages/domain`: upsert or delete per type, ignore `seq ≤ replica.seq`, skip
      unknown types. A test helper: snapshot before, run a use case, apply the logged
      changes, compare with the snapshot after. Property test: replay is idempotent
      (see #1169).
- [ ] 12. **Log every change the schedule shows**, through `tx.record()`, each type
      with its `apply` case and a sufficiency test. Existing reactions ignore the new
      types.
  - 12a. Sessions (create, change, delete, cascades) and RSVPs (add, remove, with the
    session's new count).
  - 12b. Events, days, locations and their event assignment, room unavailability.
  - 12c. Guests joining or leaving an event, public profile edits; meetings (audience:
    the two guests) and meeting points.
- [ ] 13. **Feed endpoint and hub**: replay from the table, then live from the hub in
      `seq` order; audience filter per connection; heartbeat; `410`; cleanup on
      disconnect. OpenAPI documents it as `text/event-stream` with the message schema.
      Integration tests: resume, audience, `410`, order under concurrent writes.
- [ ] 14. **Replica on the schedule**: a client store seeded with the SSR snapshot and
      fed by `EventSource`; `EventContext` derives its values from it. A reconnect
      resumes; `410` refetches the snapshot; a user switch reloads snapshot and feed.
      The RSVP optimistic update reconciles with the feed's echo, never counts twice.
      E2E: two browser contexts; one creates, moves and deletes a session and RSVPs,
      the other sees each change without a reload. Kiosk included.
- [ ] 15. **Sync state**: an indicator on the schedule (live, reconnecting, stale), so
      a stale schedule never looks current (ADR 0006). `fixes #1111`.

### Built on the above

- [ ] 16. **Pages through queries**: pages, layouts and server actions under `app/`
      that call `getRepositories()` (34 files) call module queries or use cases; add
      queries where missing. 16a site, 16b admin, then a dependency-cruiser rule
      forbidding `app/` → `db/container`, with an allow-list for the auth flows
      (step 6 of the path).
- [ ] 17. **`Idempotency-Key` from the UI (#141)**: the create forms (proposal,
      session, comment) and the RSVP toggle send a key made per form instance; server
      actions use the same idempotency store as the middleware (its core moves to the
      kernel), so their changes carry `command_key` too. The replica then matches the RSVP
      echo by `command_key` instead of by the count (step 14). `fixes #141`.
- [ ] 18. **Docs**: ADRs 0012–0014 accepted and matching the code;
      `docs/dev/server.md`; check the public docs (live schedule; API changes;
      self-hosting: proxy buffering, timeouts and HTTP/2 for SSE, the trusted-proxy
      setting) and CHANGELOG (API breaks marked) against the code; release-notes
      highlight; `10-path-from-here.md` marks
      step 3 complete (drop the #1006 gaps, it is done) and step 4 done. Run
      `make test-e2e-docker`: streaming through the standalone build.
- [ ] 19. **Finish**: summary in PROGRESS.md for review, then delete `.claude/run/`.

## Next to plan

- Step 5: an ADR for the SPA (Vite and TanStack Router, how Next serves it during the
  move, commands with `command_key`, IndexedDB), then the screen-family order.
- Inline `after()` notifications in `server/composition.ts` onto reactions.
- Steps 6 (identity and roles) and 7 (retire Next).
