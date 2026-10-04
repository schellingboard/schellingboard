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

   **Done** ([ADR 0012](../adr/0012-http-api-v1.md), [#677](https://github.com/schellingboard/schellingboard/issues/677)):
   Hono under `/api/v1` as route handlers, use cases in `server/modules/`, and
   every server action and legacy route that changes data delegating to them,
   except sign-in, passwords and the dev tools (see
   [The server and the API](../server.md)). Still open: the
   [#1006](https://github.com/schellingboard/schellingboard/issues/1006) gaps (an
   admin session list, a partial session update that keeps an explicit
   capacity, a session delete reporting the RSVPs it removed, find-or-create for
   locations by name); pages that read the repositories directly instead of
   through queries; the unit of work, so a use case writing through two
   repositories is not yet atomic; pagination, rate limiting and
   `expectedVersion`; location images and the push key outside the API; and
   [#141](https://github.com/schellingboard/schellingboard/issues/141), which
   closes once the UI sends `Idempotency-Key`.

4. **Ship the feed and the snapshot.** SSE endpoint over the change log; a
   `replica` package in the Next app that the schedule page reads from. Live
   updates arrive for everyone while the rest of the UI is unchanged.
5. **Move screens to the SPA one family at a time.** Start with the schedule
   (biggest win: replica, filters, agenda, kiosk), then proposals and voting,
   people and meetings, settings, admin. Each moved screen deletes its server
   actions. A route in Next redirects to the SPA route until all are moved.
6. **Identity and roles.** Persons, participations, login sessions, assurance,
   join links; migrate protected guests to verified credentials; replace the admin
   password with a site-admin role and the bootstrap link.
7. **Retire Next.** The server serves the SPA's static files; `next` leaves
   `package.json`; the Dockerfile shrinks.

Steps 1 and 2 are valuable even if nothing else happens. Steps 3 to 5 are where the
attendee-visible wins land, and they can be paced by event calendar: the feed and
the schedule screen before the next event, the rest after.
