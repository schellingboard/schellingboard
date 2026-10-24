# 10 · A path from the current code

The design ignores the current layout on purpose. This page is the shortest honest
route from here to there, in steps that each leave the app shippable. It is a
sketch, not a plan; each step would get its own issue and ADR.

1. **Extract `domain` and `contracts` as packages.** Move `model/` and the pure
   parts of `utils/` into `packages/domain`; move the zod schemas from server
   actions and routes into `packages/contracts`. Finish [#965](https://github.com/schellingboard/schellingboard/issues/965) in the process. The
   Next app keeps working; the boundary becomes physical.
2. **Introduce the change log and the jobs loop inside the Next app.** Add the
   `changes` table and `tx.record()` to the repositories; move reminders and email
   dispatch onto the loop (this is [#1005](https://github.com/schellingboard/schellingboard/issues/1005) done the target way). No UI change.
3. **Stand up the API in the same process.** Mount a Hono app under `/api/v1` in a
   custom server (or as route handlers) that calls the same repositories; declare
   contracts, generate `openapi.json` and `api-client`. Server actions start
   delegating to use cases so both paths share one implementation.

   **Done** ([ADR 0012](../adr/0012-http-api-v1.md),
   [ADR 0013](../adr/0013-unit-of-work.md),
   [#677](https://github.com/schellingboard/schellingboard/issues/677),
   [#1006](https://github.com/schellingboard/schellingboard/issues/1006),
   [#141](https://github.com/schellingboard/schellingboard/issues/141)): Hono
   under `/api/v1` as route handlers, use cases in `server/modules/`, and every
   server action and legacy route that changes data delegating to them, except
   sign-in, passwords and the dev tools (see [The server and the API](../server.md)).
   A use case writing through several repositories is atomic (the unit of work),
   pages read through page reads, lists are paged, edits carry
   `expectedVersion`, and the UI sends `Idempotency-Key`. Still open: location
   images and the push key outside the API.

4. **Ship the feed and the snapshot.** SSE endpoint over the change log; a
   `replica` package in the Next app that the schedule page reads from. Live
   updates arrive for everyone while the rest of the UI is unchanged.

   **Done** ([ADR 0014](../adr/0014-change-feed-and-snapshot.md),
   [#1111](https://github.com/schellingboard/schellingboard/issues/1111)): the
   feed and the snapshot are served under `/api/v1`, and the schedule, agenda
   and kiosk read from a replica in `app/legacy/(site)/[eventSlug]/replica/`.

5. **Move screens to the SPA one family at a time.** Start with the schedule
   (biggest win: replica, filters, agenda, kiosk), then proposals and voting,
   people and meetings, settings, admin. Each moved screen deletes its server
   actions.

   **Started** ([ADR 0015](../adr/0015-spa-alongside-next.md)): the SPA owns
   every URL and Next moves under `/legacy` until all screens have moved. The
   schedule is moved: grid, agenda, filters, kiosk, the session modal with RSVPs,
   attendee counts and comments, and the schedule opening offline with a reload offer
   after an upgrade. Proposals and voting, people and meetings, settings and admin
   are still Next pages.

6. **Identity and roles.** Persons, participations, login sessions, assurance,
   join links; migrate protected guests to verified credentials; replace the admin
   password with a site-admin role and the bootstrap link.
7. **Retire Next.** The server serves the SPA's static files; `next` leaves
   `package.json`; the Dockerfile shrinks.

Steps 1 and 2 are valuable even if nothing else happens. Steps 3 to 5 are where the
attendee-visible wins land, and they can be paced by event calendar: the feed and
the schedule screen before the next event, the rest after.
