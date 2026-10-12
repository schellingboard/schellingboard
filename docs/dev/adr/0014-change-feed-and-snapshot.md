# ADR 0014: The change feed and the snapshot

- **Status:** Proposed
- **Date:** 2026-10-07
- **Issue:** #1111

## Context

A schedule shows what the server sent at render time. Nobody sees another
person's edit or RSVP until they reload (#1111). The
[target architecture](../target-architecture/03-server.md#change-feed-and-snapshot)
solves this with a snapshot of the event and a feed of changes after it. The
browser keeps a replica: it loads the snapshot and applies each change
([04](../target-architecture/04-client.md#the-replica)).
[Step 4 of the path](../target-architecture/10-path-from-here.md) brings this to
today's schedule (grid, agenda, kiosk, session modal) in the Next app.

What exists: the change log (ADR 0011), logging only `session.changed` and
`session.deleted`, whose payloads hold reaction fields (`before`,
`rsvpGuestIds`). The unit of work (ADR 0013) records changes in the state's
transaction and publishes them in `seq` order under the write lock. There is a
`uow.read` for consistent reads. The schedule's data is `EventContext`,
assembled in `app/(site)/[eventSlug]/layout-content.tsx`. Identity is as in
ADR 0012: an admin actor, and a guest actor that is either verified or open.

## Decision (proposed)

### 1. Change types and what the feed sends

The replica needs these types. Each payload carries the subject's full state
as its audience may see it, including `version` where the row has one, so a
form opened from the replica sends the right `expectedVersion`. A deletion
carries only ids.

| Subject                | Types                                                   | Audience           |
| ---------------------- | ------------------------------------------------------- | ------------------ |
| Event                  | `event.changed`, `event.deleted`                        | event              |
| Day                    | `day.created`, `day.changed`, `day.deleted`             | event              |
| Session                | `session.created`, `session.changed`, `session.deleted` | event              |
| RSVP count             | `session.attendanceChanged` (`sessionId`, `numRsvps`)   | event              |
| Own RSVP               | `rsvp.added`, `rsvp.removed`                            | guests: the RSVPer |
| Location in this event | `location.changed`, `location.removed`                  | event              |
| Room unavailability    | `unavailability.added`, `unavailability.removed`        | event              |
| Event guest (public)   | `guest.joined`, `guest.changed`, `guest.left`           | event              |
| Meeting                | `meeting.changed`, `meeting.deleted`                    | guests: the two    |
| Own meeting slots      | `availability.changed`                                  | guests: the owner  |
| Meeting point          | `meetingPoint.changed`, `meetingPoint.deleted`          | event              |

- **Per-type projection.** The log keeps what reactions need. The feed sends
  `project(change)`, one function per type in `server/feed/`, which drops
  reaction-only fields (`before`, `rsvpGuestIds`). An unprojected type is not
  sent. The projected message is a contract in
  `packages/contracts/src/feed.ts`. OpenAPI documents it with the feed.
- **Guest payloads** carry the public profile and its `profileVersion`, never
  `version`: that one also moves on admin-only edits (email, protection).
- **Site-level subjects are recorded per event.** A location or a guest
  belongs to several events, so a change to one is recorded once for each
  event that shows it, with that `event_id`. A location taken out of an event
  is `location.removed` for that event. The feed's resume query stays
  `WHERE event_id = ? AND seq > ?`. This supersedes the target's `NULL`
  `event_id` for site-level changes
  ([06](../target-architecture/06-data-and-time.md#the-change-log-table)):
  a per-event feed cannot resume over such rows.
- **Event guests** are the guests the event shows everyone: its members and
  its sessions' hosts (a host need not be a member, and leaving keeps hosted
  sessions). `guest.joined` and `guest.left` mean entering and leaving that
  set, so `hostIds` always resolve. Meeting parties are not in it: a meeting
  request is private to its two guests. A viewer gets the other party of each
  own meeting in `me.meetingGuests`, and a meeting change carries both
  parties' lean fields, so a partner's rename shows with the next change to
  that meeting.
- **Audiences** are the three that today's model has:
  `{ kind: "event" }`, `{ kind: "guests", ids }` and `{ kind: "admins" }`.
  `event` means anyone who may open the event page today, which is anyone past
  the site password. No schedule type needs `admins` yet. The target's
  `persons` and `organizers`
  ([03](../target-architecture/03-server.md#change-log)) are deliberately not
  used: the ids are guest ids, and a stored `persons` row would name the wrong
  kind of id. Step 6 of the path maps the stored kinds when persons arrive.

### 2. Who receives guest-addressed changes

A connection's viewer is the guest that `verifiedCurrentUser` returns when the
connection opens. This is a verified cookie, or an open cookie for an
unprotected name, as the SSR snapshot decides today. An open cookie that names
a protected guest gets no `guests` changes. The viewer is fixed for the life
of the connection. When the user changes in this tab (select, log in, log
out), the client closes the feed and loads the snapshot and the feed again.

Other tabs and other devices are covered by the server:

- The hub closes every connection of a guest whose protection or credentials
  change, or who is deleted. The browser reconnects, and the cookie is checked
  again.
- The server ends every connection after 10 minutes. The browser reconnects
  with `Last-Event-ID`, so a logout or user switch in another tab ends the old
  viewer's stream within that time.

### 3. RSVPs: one change per audience

An RSVP records two changes in its transaction:

- `rsvp.added` or `rsvp.removed` for the guest;
- `session.attendanceChanged` with the new count for the event.

Rejected: one change with a projection per audience. A stored row has one
audience, which is the security model of the target design. A row whose
content depends on who reads it would make that audience a lie, and a test
cannot assert one fixed payload for it. Two rows per RSVP is cheap.

### 4. State that follows the clock

State that follows the clock is derived on the client from raw data and the
page's clock (the dev fake clock included). No job records a change for it.
A meeting that is pending at its slot start shows as expired, as
`meetingViewsFor` decides it on the server today. Phases and folded days are
derived on the client already.

A meeting's clash lines are not in the replica: they rest on the other guest's
RSVPs, which never leave the server. The meetings column fetches them through
the existing meetings query. It fetches again, debounced, after it applies a
session, RSVP or meeting change.

### 5. Old rows

Rows written before the `audience` column have none (`NULL`). They are sent to
no one. Their only reader is the reaction, as before.

### 6. Connections per tab

Each tab opens one `EventSource`. HTTP/1.1 allows six connections per origin,
so the seventh tab would hang. Two measures, both:

- A tab hidden for more than 30 seconds closes its feed. When it is visible
  again, it opens a new `EventSource` with `?since=` the replica's `seq` (a new
  `EventSource` cannot set `Last-Event-ID`) and shows "reconnecting" until it
  is live. A kiosk stays visible, so it is never affected.
- The self-hosting docs ask for HTTP/2 at the reverse proxy. Caddy and Traefik
  use it by default; nginx needs `http2 on`.

Rejected for now: one connection shared by tabs (`SharedWorker` or
`BroadcastChannel` with a leader). It is more code and a second failure mode,
for a problem that the two measures above solve.

### 7. The snapshot

The snapshot contains what `EventContext` holds today, normalized:

- `seq`: the newest `seq` (section 10);
- `event`, `days`, `locations` (this event's), `unavailability`, and `guests`
  (event guests' public fields, section 1);
- `sessions`, with `hostIds` and `locationIds` and without host names or
  counts;
- `counts`: `numRsvps` by session;
- `meetingPoints`;
- `me`, only for a viewer as in section 2: `guestId`, own RSVPs, own meetings
  (raw, without clash lines) and their other parties (`meetingGuests`), own
  meeting slots.

It is assembled in one `uow.read`, so the state and its `seq` agree.
`server/feed/snapshot.ts` builds it from module queries and the kernel's
`newestSeq`. It imports modules only through `module.ts` (an existing
dependency-cruiser rule) and no `db/` code beyond types (a new rule), so it
reaches the repositories only through `uow.read`. The repositories it may use
are typed as the ones those queries take; review, not a rule, keeps it from
calling them directly. `GET /api/v1/events/{slug}/snapshot` serves it, and the SSR layout
calls the same query. Golden-file tests cover each viewer (step 10).

### 8. Denormalized fields

These are normalized in the replica. Selectors give the components their
current shapes (a `Session` with host names and `numRsvps`).

- Host names come from `guests`, so a rename is one `guest.changed`, not one
  change per hosted session.
- `numRsvps` comes from `counts`, which `session.attendanceChanged` updates.
- Location names come from `locations`, in the same way.

### 9. Cascades

The use case that deletes a day, an event or a location records one change
for each session it removes or edits: `session.deleted` for a session removed
with its day, and `session.changed` for a session that loses a location. The
same goes for any other subject a cascade removes from the replica.

A guest delete is a cascade too. For each event of the guest it records
`session.changed` for each session they hosted, `session.attendanceChanged`
for each session they had an RSVP for, `meeting.deleted` for each of their
meetings (audience: the other guest) and `guest.left`. `apply`
stays one subject per change, and the log answers "where did this session
go". The session-notification reaction skips changes marked
`cascade: true`, so attendees are told no more than today (see Open
questions).

### 10. The feed

`GET /api/v1/events/{slug}/feed` serves `text/event-stream` through the
existing Hono mount.

- **Start.** It starts after `Last-Event-ID` if the request has one, else
  after `?since=` (the snapshot's `seq`). `Last-Event-ID` wins because the
  browser's own reconnect keeps the original `?since=`. With neither, the
  request gets `400`.
- **Stream.** Messages have `id: seq` and `event: <type>`, and their data is
  the projected change. Responses have `Cache-Control: no-store, no-transform`
  (so compression does not buffer the stream) and `X-Accel-Buffering: no`. A
  comment every 25 seconds keeps proxies from closing the stream.
- **Reset.** `EventSource` cannot read a status code, so a resume point below
  the prune watermark or above the newest `seq` (a restored backup) gets a
  `200` stream with one `event: reset` message, which then closes. The client
  closes its `EventSource` and loads the snapshot again. Any other failure
  (`401`, `404`, network) ends or retries the `EventSource`; when it is closed,
  the client loads the snapshot with `fetch`, which reads the status.
- **Newest `seq`** is the `changes` row of `sqlite_sequence`: the last `seq`
  assigned, which pruning does not lower (`max(seq)` is `NULL` once pruning
  empties the table). The snapshot and the reset check read it.
- **Watermark.** Pruning deletes by `occurred_at`, which follows the actor's
  clock, so it can leave gaps in the middle of the log. Pruning changes to:
  delete the contiguous prefix up to the newest `seq` that every reaction has
  handled and that is older than 7 days, and store that `seq` as the
  watermark (a jobs cursor row, `changes.pruned`). A row dated in the future
  by the dev fake clock stops pruning until that date; only dev builds have
  the clock.
- **Slug change.** The feed is addressed by slug. On an `event.changed` with a
  new slug, the client replaces the page URL and reopens the feed under the
  new slug with `?since=`.
- **Command keys.** A change's `command_key` is the raw `Idempotency-Key`,
  which is unique only per actor (ADR 0012 section 5). The feed sends it only
  to the connections of the actor who made the change, and the client matches
  its echo by key and actor, never by key alone.
- **Slow clients.** A connection whose unsent data passes 1 MB is closed. The
  browser reconnects with `Last-Event-ID` and replays from the table.
- **Replay, then live.** A new connection registers with the hub and buffers
  live changes. It then replays from the table up to the newest `seq`, and
  then sends the buffered changes above the last one it replayed. Order and
  completeness do not depend on timing.

### 11. The hub

The hub runs in the process and lives on `globalThis` like the change
subscribers. It subscribes with `subscribeToChanges`. Each connection holds
`{ eventId, viewer, lastSeq, send }`. For each change, the hub checks event,
audience and `seq`, then projects the change and sends it to each connection
that matches. Because publish runs under the write lock, changes arrive in
`seq` order. A connection that closes unregisters.

### 12. Where the code lives

- `apply(replica, change)` and the `Replica` type live in
  `packages/domain/src/replica.ts`. `apply` is pure: it upserts or deletes per
  type, ignores `seq ≤ replica.seq` and skips unknown types. Server tests use
  it to check that payloads are sufficient (step 11).
- Snapshot and feed message contracts live in `packages/contracts`.
- The client store lives in `app/(site)/[eventSlug]/replica/`: the store, the
  `EventSource` client and the sync state, with no React. One hook connects
  them to `EventContext`. Step 5 of the path moves the store to the SPA
  unchanged.

## Consequences

- Every use case that changes what the schedule shows records a change. Steps
  12a to 12c add them family by family, each with its `apply` case and a
  sufficiency test.
- The log grows: two rows per RSVP, and one row per event for site-level
  subjects. At the target's capacity this is a few thousand rows a day.
- The jobs loop's pruning changes from a time filter to a contiguous prefix
  with a stored watermark.
- An open connection may serve a viewer who logged out in another tab for up
  to 10 minutes.
- A protected guest who has not verified sees the schedule without their own
  RSVPs and meetings, as now.
- Hidden tabs go quiet after 30 seconds and catch up when they are shown
  again.
- Self-hosters behind HTTP/1.1 proxies should switch to HTTP/2; the docs say
  so.

## Open questions

1. **Cascades and notifications.** When an organizer deletes a day or a
   location, attendees of the affected sessions are told nothing today. This
   ADR keeps that (the reaction skips `cascade: true`). Should they be told?
2. **Hidden tabs.** Closing the feed after 30 seconds hidden is the
   recommendation. The alternative is to keep every tab connected and rely
   only on HTTP/2.
