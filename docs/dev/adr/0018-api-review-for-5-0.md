# ADR 0018: The API review for 5.0.0

- **Status:** Accepted
- **Date:** 2026-11-01

## Context

Release 5.0.0 should be the last that breaks an API or a self-hoster for a long time, so a break is
accepted now wherever it removes a later one. This ADR reviews `packages/contracts/openapi.json`,
the snapshot and feed, problem codes, auth, and what a self-hoster depends on.

What 4.0.0 shipped, checked in the tag: no `/api/v1`, no OpenAPI document and no API docs. It had
the ad hoc routes `/api/admin/*` (seeding), `/api/toggle-rsvp`, `/api/add-session` and the like,
`/api/auth/login` and `/api/health`. The 5.0.0 steps already deleted all of them except
`/api/health` and `POST /api/auth/logout` (point 4). So **`/api/v1` has never been released**: any
change to it breaks nobody, and the one break that does reach users (the 4.0.0 routes are gone) is
not yet in the `CHANGELOG.md` breaking note.

## Decision

### The path

1. **`/api/v1` stays.** It is unreleased, so the name costs nothing, and the policy below says what
   a `v2` would take. `/api/health` stays beside `/api/v1/health` as the probe for monitors and the
   Docker healthcheck; it is not versioned and never changes meaning.

### Endpoints

Benefit and who breaks are given for each change. Since `/api/v1` is unreleased, "breaks" means
"changes what the SPA calls" unless stated.

2. **Remove `GET /guests/{id}/rsvps`.** Nothing calls it; the snapshot's `me.rsvps` and
   `GET /sessions/{id}/rsvps` answer the same questions. Benefit: one promise fewer. Breaks nobody.
3. **Remove `DELETE /me/identity`.** `POST /auth/sign-out` does the same and also ends a verified
   session. Benefit: one way to end a login session. Breaks nobody (the SPA moves to
   `/auth/sign-out`).
4. **`POST /api/auth/logout` becomes `DELETE /api/v1/auth/site`.** It is a third sign-out path,
   outside the versioned API and unlisted in the document; the SPA uses it to end the site-password
   login and the login session together. As a method on the site-login resource it is documented
   beside `POST /auth/site`. Breaks nobody (unreleased; only the SPA calls it).
5. **Keep `GET /updates`, `GET /attendees`, `GET /host-clashes` and `GET /sessions/{id}/rsvps`.**
   The candidate list said nothing uses them; the SPA does (footer, people directory, session form,
   admin RSVP list). They answer what the replica cannot: the release status, the site-wide
   directory, a private-aware clash check, and who RSVPed. `/attendees` (every guest of the site)
   and `/guests` (one event's guests) keep their names; the docs say how they differ.
6. **Methods, not verbs, for removing one thing.** `POST /me/notifications/delete` becomes
   `DELETE /me/notifications?ids=…`; `POST /me/push-subscriptions/remove` becomes
   `DELETE /me/push-subscriptions?endpoint=…`; `POST /me/push-subscriptions/check` becomes
   `GET /me/push-subscriptions?endpoint=…` (it changes nothing). Benefit: HTTP methods say what
   happens, so proxies, clients and the retry rules treat them right. Breaks nobody.
7. **Keep the command pairs `…/guests/assign|remove` and `…/locations/assign|remove`** under an
   event. They set membership from a list in one transaction; `remove` as `DELETE` would need a
   body. The rule written into `api.md`: a `POST` with a verb is a command that is not a plain
   create, update or removal of one resource (`accept`, `decline`, `cancel`, `move`, `assign`,
   `remove`, `read`); a removal of one resource is `DELETE`.
8. **`/admin/…` is a promise about privilege, not about the role.** `/admin/sessions` and
   `/admin/proposals` differ from `/sessions` and `/proposals` in what they do (any phase, on behalf
   of hosts, `adminManaged`), not only in who may call them, so they stay. Today they need a site
   admin; a later `organizer` role may be allowed on the per-event ones. **Widening who may call an
   endpoint is not a break; narrowing is.** The role is checked in the use case and shows in the
   endpoint's description, never in a path, so the organizer role fits without a change.
9. **Events: `{id}` for resources, `{slug}` for the schedule.** Both are immutable after creation
   (an event update cannot change the slug), so both are stable keys. The snapshot and feed use the
   slug because it is the address people see; everything else uses the id. Documented, not changed.
10. **`POST /dev/reminders` leaves the API.** It moves to `/api/dev/reminders`, outside `/api/v1`
    and outside `openapi.json`, still answering 404 unless `SB_ENABLE_DEV_TOOLS` is set. Benefit:
    the public document promises only what operators and scripts may use. Breaks nobody.

### Auth

11. **`SITE_PASSWORD` and `POST /auth/site` stay for all of 5.x.** The read setting (ADR 0017
    point 11) later makes the gate unnecessary: then `SITE_PASSWORD` logs a deprecation warning and
    keeps working, and `/auth/site` keeps answering, until a major release removes them.
12. **API tokens use `Authorization: Bearer sb_…`**, resolved by the actor middleware into the same
    actor as a cookie with the token's scopes; cookie-only checks (Origin, CSRF) apply to cookies
    only, and a valid token passes the site-password gate and the admin gate's cookie check, since
    it is a credential of its own (the gates in `server/http/gates.ts` read cookies); rate limits
    and idempotency keys are per token. The server **ignores** `Authorization` today and never
    interprets `Basic`, because a reverse proxy with basic auth may forward it. Adding tokens is
    additive.
13. **Cookie names and values are not part of the API.** Clients use a cookie jar.

### Configuration

13. **`API_DOCS` becomes `SB_API_DOCS`.** It is unreleased and breaks nobody, and the policy below
    gives every new variable the `SB_` prefix. `configuration.md` follows.

### Shapes

14. **`Problem` keeps `type: "about:blank"` and a machine `code`.** Clients branch on `code`, never
    on `detail`. Translation later changes only what the SPA shows, not codes.
15. **Contract changes for the milestone issues.** #1383 changes no shape: `breakdown` is already
    nullable on the proposal read; it is now set for a proposal's hosts during voting and stays null
    for everyone else, and neither the snapshot nor the feed carries it. #1331 makes the guest
    `email` nullable in the admin guest view and optional in create and import, adds `username`,
    reports skipped (no-email) guests when mailing join links, and adds `emailEnabled` to
    `GET /site` so the SPA can hide what needs mail. These land in 5.0.0, before the policy applies.

### What the unbuilt designs need

15. Each arrives without a break, because it adds a field, a value, a resource or an endpoint:
    session `kind` (shift, fixture) as a field that defaults to `session`; private marks as
    `/me/marks`, never in a shared read; booking rules as errors with new problem codes; `Place`
    beside `locations` and `meeting-points`, which are deprecated only once places serve all their
    fields; roles as in point 8; the read setting by relaxing a 401 to 200 and an event link as a
    new path; account export and deletion as `GET /me/export` and `DELETE /me`, with a deleted
    guest's references allowed to point at nobody (clients show "deleted guest"); scheduled jobs and
    chat channels are internal.

## Compatibility policy

From the 5.0.0 release the rules below bind `/api/v1`, the snapshot and the feed. They go into
`docs/public/self-hosting/api.md` as written here.

**Not breaking** (any release): a new endpoint, method, query parameter or optional request field; a
new response field; a new value of an enum a response already has; a new problem `code`; a new feed
change `type`; a new error status for a new condition; wider access (point 8); a changed rate limit;
a different `detail` text; ordering that was not documented.

**Breaking** (a new major path, `/api/v2`, served beside `/api/v1` for at least one more major
release): removing or renaming an endpoint, field, enum value or problem `code`; making an optional
field required or a nullable one non-null; changing a type, an id format or what a field means;
narrowing access; changing the meaning of an existing status; ending a documented behaviour.

**Deprecating.** An endpoint or field to be removed is marked `deprecated` in `openapi.json`, named
in the changelog, answered with `Deprecation` and `Sunset` headers, and kept for at least one major
release. `SITE_PASSWORD` and `ADMIN_PASSWORD` follow the same rule: they log a warning until the
major that removes them.

**Clients must tolerate:** unknown response fields; unknown enum values (treat as "other"); unknown
problem `code`s (fall back to the status); unknown feed `type`s (ignore, and read the snapshot again
on the next `seq` gap); a reference to a guest that no longer exists; nullable fields becoming set.
They must not parse `detail`. The server, for its part, never adds a feed type whose data an
existing type must now also carry.

**Self-hosters.** Environment variables keep their names and meaning within a major release; a new
one is prefixed `SB_`, and the existing unprefixed names stay (renaming them would break every
compose file for tidiness). The data paths (`DATABASE_URL`, `/data/uploads`) and the URLs people
hold, such as `/join/{token}`, `/auth/reset` and event addresses, keep working for the life of the
data; so do `/api/v1/docs`, `/api/v1/openapi.json`, `/legacy/…` (old links keep redirecting),
`/media/…` and `/locations/…` file addresses (images people have linked or cached): a join link has
no expiry, so its URL cannot change.

## Consequences

- The 5.0.0 changelog breaking note names the removed 4.0.0 routes and what replaces them; the new
  steps in the plan carry that and every other change above.
- The API docs gain a compatibility section; clients that follow it survive every change listed in
  point 16.
- Two small costs: `/attendees` and `/guests` keep two names for two lists, and the command verbs
  stay a convention rather than a rule a tool checks.

## Alternatives

- **`/api/v2` for 5.0.0.** The path is unreleased; a new number would only tell scripts that nothing
  older exists.
- **Rename every unprefixed environment variable to `SB_…`.** Tidy, but breaks every deployment.
- **Merge `/attendees` into `/guests`.** The audiences and access rules differ; one path with two
  rule sets is harder to document than two names.
- **Reject `Authorization` today to reserve it.** A proxy that forwards basic-auth headers would
  turn working sites into 401s.
- **Move `/admin/…` endpoints under their resource** (`/sessions` with an `admin` flag). The
  operation differs, not just the caller, and a path would hide that.
