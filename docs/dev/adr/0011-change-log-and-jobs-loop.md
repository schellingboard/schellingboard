# ADR 0011: A change log and one jobs loop

- **Status:** Accepted
- **Date:** 2026-10-03
- **Issue:** #1005

## Context

Everything that happens after a state change is done inline, in the request
that made it. Editing a session awaits one SMTP round-trip per RSVP before it
responds (#1005), and a failure partway through leaves no record of who was
already told. Reminders run on their own `setInterval` (ADR 0007). Nothing
records what changed, so "who moved this session" has no answer, and each new
consumer of a change (push, a future live schedule, a chat bot) would add
another inline call.

The [target architecture](../target-architecture/03-server.md#change-log)
replaces all of this with an append-only change log written in the same
transaction as the state ([D8](../target-architecture/08-decisions.md#d8)), and
one in-process jobs loop that turns changes into notifications and deliveries
([D10](../target-architecture/08-decisions.md#d10)).
[Step 2 of the path](../target-architecture/10-path-from-here.md) brings both
into the current app, with no change to what users see beyond the speed.

## Decision

### 1. A change log, written by the repositories

A `changes` table holds one row per logged state change: a sequence number,
the event, the type (`session.changed`), the subject, the actor, when it
happened by the actor's clock, and a JSON payload with the subject's full state
(before and after, for an edit). The change types and the functions that build
them live in `packages/domain/src/change.ts`.

A repository mutation that is logged takes the actor and time from its caller
and inserts the change inside its own transaction. If the mutation rolls back,
so does the change. It is not event sourcing: state stays in its tables and the
log is derived from it.

The log starts with what something will react to: session edits and deletions
made through the session repository, whose notifications fan out to every
RSVP. Sessions removed by a cascade (deleting their day or event) are not
logged yet, matching today's behaviour of not notifying anyone about them.

A payload is part of the log's contract. A field may be added to it; renaming
or removing one means a new type name, as the target design's versioned types
do. A reader skips types it does not know, so a rollback to an older version
does not stop at rows a newer one wrote.

Differences from the target design, all deliberate for now:

- Types are named `session.changed`, not `scheduling.SessionMoved`, and actors
  are `guest`, `admin` or `system`: the app has no persons, tokens or modules
  yet.
- A deletion carries the deleted session and the guests who had RSVPed, not
  only ids: its reaction needs them and they are gone afterwards.
- There is no audience, correlation id or command key yet. The live feed
  (step 4) and idempotent commands (step 3) add them.
- Rows are deleted, not pruned to headers, once every reaction has passed them
  and they are old enough; the log keeps guest names and ids only that long.

### 2. One jobs loop per process, holding a lease

One loop runs in each server process, started from `instrumentation.ts` like the
reminder scheduler it replaces. It does three kinds of work:

- **Reactions** read the change log after a stored cursor, one cursor per
  reaction, and advance it only after handling a change. Session-change
  notifications become one.
- **Scheduled work** runs on its own period: the attendee-count reminders,
  unchanged (ADR 0007's claim-by-due-time stays), still switched off by
  `REMINDER_DISPATCH_INTERVAL_MS=0`.
- **Deliveries** send what notification code enqueues, one per email or push.
  A failed email is retried with backoff and eventually given up; a push is
  best-effort, sent once to each device and not retried.

A request that commits a change nudges the loop, so a notification goes out
within moments without the request waiting for it. A heartbeat catches retries
and anything a nudge missed. A lease row in the database lets only one process
run the loop against a database; another process idles until the lease lapses.

A queued email is stored as the template and props to build it from, since a
built message holds a React element. As with change payloads, a template's
props may gain optional fields; anything else needs a new template name.

Delivery is at-least-once: a crash between sending and marking sent repeats
that one message on the next run. ADR 0007 chose the opposite for reminders,
because one duplicate there was the outcome its spec forbade; ordinary
notifications have no such rule, and losing one silently is worse.

## Consequences

- Sending email and push leaves the request: editing or deleting a session
  with hundreds of RSVPs costs a few inserts.
- A failed send is retried rather than logged and forgotten.
- Tests that assert on mail run the loop until it is idle instead of reading
  the mock right after the action. E2E tests already poll the mailbox.
- ADR 0007's `setInterval` is replaced by the loop; its reminder state machine
  is not.
- Repository methods that are logged need the actor and time from their
  caller, so a call site cannot leave out who made the change.
- A reaction that fails for one guest logs it and moves on; the cursor does
  not retry it. Retrying the whole change would tell the guests already told
  a second time, until a change's notices are written in one transaction.
- An edit's notices go to whoever has RSVPed when the reaction runs, a
  deletion's to who had when it was made. Edited and then deleted before the
  reaction runs, a session's attendees hear only of the deletion.
