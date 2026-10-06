# ADR 0012: A versioned HTTP API in the Next process

- **Status:** Accepted
- **Date:** 2026-10-04
- **Issue:** #677

## Context

The app's write paths are server actions and about thirty hand-written routes
under `/api/*`. Each reads its own cookies, validates its own body, calls the
repositories and shapes its own error, so the same rule (who may RSVP, who may
edit a session) is written once per path, and nothing describes the routes to a
client: #677 asks for an OpenAPI document, #1006 for an admin API a script can
call.

The [target architecture](../target-architecture/03-server.md#http-api) puts a
REST API under `/api/v1` in front of use cases, typed by the zod contracts in
`packages/contracts` (ADR 0010), with RFC 9457 errors and idempotent mutations.
[Step 3 of the path](../target-architecture/10-path-from-here.md) brings that
API into today's Next process, with server actions and the legacy routes
calling the same use cases. Identity stays as it is until step 6.

## Decision

### 1. Hono, mounted by a Next catch-all route

The API is a Hono app built with `@hono/zod-openapi`, based at `/api/v1` and
mounted by one route handler, `app/api/v1/[[...route]]/route.ts`, which passes
every method to the app's `fetch`. It runs on the Node runtime and is never
statically rendered. There is no custom server: the Dockerfile, the standalone
output and `next dev` stay as they are, and `proxy.ts` gates `/api/v1` as
section 3 sets out. Every response is sent with `cache-control: no-store`
unless a route sets its own, so a browser never shows a stale read after a
reload.

`@hono/zod-openapi` supports zod 4, checked on 2026-10-04: version 1.6.3
declares the peer dependencies `zod ^4.0.0` and `hono >=4.10.0` and builds on
`@asteasolutions/zod-to-openapi` 9.1.0, which also peers on `zod ^4.0.0`. The
repo is on zod 4.6.5 and the current `hono` is 4.13.13. Contracts stay plain
zod schemas imported from `zod`; they gain no dependency on Hono, and anything
only the OpenAPI document needs is added where a route is declared.

### 2. Where the code lives

A top-level `server/` directory, next to `app/` and `db/`, follows the
[target layout](../target-architecture/03-server.md#layout) as far as today's
app allows:

```
server/
  kernel/              Result and error kinds, Actor and its resolution, actingGuest
  http/                the Hono app, middleware (actor, idempotency, problem details), OpenAPI document
  composition.ts       builds every use case from the repositories; the one place they are wired
  modules/<module>/
    module.ts          the module's public surface
    ports.ts           the repositories it needs, as a Pick of the container's
    application/       one file per use case or query
    http/              route declarations and handlers: contract in, use case, contract out
```

Modules are named after what they hold, close to the target's: `sessions`
(the target's scheduling and participation: sessions, RSVPs, room
unavailability, attendee counts), `proposals` (with votes), `comments`,
`meetings`, `people` (profiles and the admin guest list), `notifications`,
`events` (with days), `venue` (locations) and `settings` (site settings, which
the target's modules have no home for). Repositories stay in `db/` as
ADR 0010 left them: a module's `ports.ts` names the repositories it needs
instead of declaring new ones, and `composition.ts` passes in
`getRepositories()`. dependency-cruiser enforces the target's rules on this
layout: `application/` imports no `http/`, `next/*`, `hono` or `db/` code
beyond the container's types; a module is imported only through its
`module.ts`; `kernel/` imports no module; `app/` reaches `server/` only through
`module.ts` files, the use cases `composition.ts` wires, the kernel (server
actions resolve the actor there, section 3) and the mount.

A use case is a function of its dependencies taking an actor, validated
input and `now`, and returning a `Result`, as in the target. `now` is resolved
per request (the dev fake clock, ADR 0004) rather than read from a clock port. The unit of work and
`tx.record()` do not exist yet: repositories keep their own transactions and
change logging (ADR 0011), so a use case that writes through two repositories
is not atomic until a unit of work replaces them.

### 3. The actor comes from today's cookies

Middleware resolves an `Actor` once per request and hands it to the handler; a
use case never reads a cookie or a header. The actor carries the facts the
cookies prove: whether the admin cookie is valid, and which guest the guest
cookie selects and at what level (`open` or `verified`). Server actions resolve
the same `Actor` from `cookies()` through the same function.

Acting as a guest keeps today's rule, as one kernel function every use case
calls (`actingGuest`): a request may act as an unprotected guest it names, and
as a protected guest only with that guest's verified cookie (#370). It refuses
with `guest.unselected` or `guest.protected`. Where the request names the guest
in its path or body (RSVPs, votes), `actingAsNamedGuest` applies the same rule
to the named guest. Organizer actions require the admin actor. No tokens,
persons or roles: those are step 6.

`proxy.ts` gates the API as it gates the legacy routes. Endpoints that require
the admin actor live under `/api/v1/admin/`, which gets the `/api/admin/*`
branch: the admin cookie alone, without the site password (the two are
independent, as the admin guide documents), the cross-site check, and `404`
when `ADMIN_PASSWORD` is unset. The rest of `/api/v1` requires the site
password or the admin cookie, so an admin script needs one cookie. Under `/api/v1`, the proxy refuses with problem details (section 4)
instead of the login redirect or `{ error }` body the legacy routes get.

### 4. Errors are values, sent as problem details

Use cases return `Result<T>`: a value, or an error with a stable `code` and a
kind (`notFound`, `forbidden`, `conflict`, `invalid`, `gone`, and `unavailable`,
`503`, when a service the app relies on fails, such as the mail server). One function in
`server/http` maps the kind to a status and the error to an RFC 9457 body
(`application/problem+json`): `type: "about:blank"`, `title`, `status`, an
optional `detail`, and the extension member `code`. A request that fails its
contract gets `400` with code `request.invalid` and an `errors` list of paths
and messages; a use case may attach the same list to its own `invalid` error to
name every refused field at once (`location.invalid`), and a `conflict` may too
(`guest.emailTaken`). Codes are dotted, named for what was refused
(`guest.protected`, `session.notFound`); a code once shipped keeps its meaning,
and the client translates it rather than showing `detail`.

The legacy routes map the same `Result` to the `{ error }` bodies and statuses
they return today, so no existing client changes.

### 5. Idempotency-Key, stored for 24 hours

Every mutation under `/api/v1` accepts an `Idempotency-Key` header. Middleware
stores the key with the actor it was used by, the method and path, a hash of
the body, and once handled, the response's status and body. A retry with the
same key and actor:

- after the first request finished, gets the stored response without running
  the use case again;
- while it is still running, gets `409` with `idempotency.inProgress`;
- with a different method, path (query included) or body, gets `422` with
  `idempotency.keyReused`.

The actor a key is scoped to is the admin flag plus the guest's id and cookie
level, so an open cookie naming a protected guest does not share that guest's
verified keys. Claiming a key is one immediate transaction, so two concurrent
requests cannot both run. A claim still unfinished after 60 seconds counts as
abandoned (its process died), so a retry runs again rather than getting `409`
for a day. The replay carries the stored status, headers (without
`set-cookie`) and body. A key that is empty or over 255 characters is
`400 request.invalid`. A multipart body is hashed by its parsed fields (files by
name, type and content), so a retry with a new boundary still matches.

A `5xx` response or a thrown error releases the key, so a retry after a server
error runs again.
Rows older than 24 hours are deleted by the jobs loop (ADR 0011) as scheduled
work. The key is optional; without it a mutation simply runs. A request with
neither admin nor guest has no one to scope a key to, so its key is ignored
rather than shared by every anonymous client. Server actions do not use it.
Echoing the key on the change log (`command_key`) waits for the feed that reads
it, in step 4.

### 6. A committed `openapi.json` that cannot go stale

A script imports the Hono app and writes its OpenAPI 3.1 document to
`packages/contracts/openapi.json`, which is committed. `make openapi` rewrites
it; `make openapi-check` regenerates it and fails with "Regenerate and review
the API change" when it differs, and runs in `make precommit` and CI. Every
route is declared with `createRoute` and its request and response contracts,
so the document covers the whole API.

`packages/api-client` (`@schellingboard/api-client`) is a thin wrapper over
`openapi-fetch` with types that `openapi-typescript` generates from this file.
The generated types are committed too: `make openapi` writes both from the same
document and `make openapi-check` fails when either is stale. This departs from
the target ([03](../target-architecture/03-server.md#http-api): "generated from
it in the build"): generating at build time would need a step before every
`tsc`, ESLint, dependency-cruiser, Vitest and `next build` run, the Dockerfile
included, and leave editors without types. One source and no staleness, the
target's intent, hold either way. The app does not import the client, so the
standalone build does not carry it.

## Consequences

- One implementation per rule: a route under `/api/v1`, a server action and a
  legacy route that do the same thing call the same use case.
- Two new runtime dependencies, `hono` and `@hono/zod-openapi`, carried in the
  standalone build. They are the target's HTTP layer, so they stay when Next
  leaves (step 7).
- A change to a contract shows up as a diff of `openapi.json` in review.
- Admin endpoints sit under their own prefix only because the proxy gates by
  path; step 6's roles replace both the prefix and the two passwords.
- Until a unit of work exists, "one transaction per use case" holds only for
  use cases that write through one repository call.
- A new `idempotency_keys` table and migration; a retried request after a lost
  response no longer RSVPs twice or creates two proposals (#141), for clients
  that send the key. The web app's server actions do not, so #141 stays open
  until the UI calls the API.
- Pagination, rate limiting and `expectedVersion` checks from the target are
  not part of this decision; a table gains a version check only if it already
  has a version column.
