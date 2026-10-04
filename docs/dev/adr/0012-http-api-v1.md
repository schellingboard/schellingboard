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
section 3 sets out.

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
  kernel/              Result, error codes, Actor and its resolution, the clock port
  http/                the Hono app, middleware (actor, idempotency, problem details), OpenAPI document
  composition.ts       builds every use case from the repositories; the one place they are wired
  modules/<module>/
    module.ts          the module's public surface
    ports.ts           the repositories it needs, as a Pick of the container's
    application/       one file per use case or query
    http/              route declarations and handlers: contract in, use case, contract out
```

Modules follow the target's names (scheduling, participation, proposals,
meetings, people, notifications, events). Repositories stay in `db/` as
ADR 0010 left them: a module's `ports.ts` names the repositories it needs
instead of declaring new ones, and `composition.ts` passes in
`getRepositories()`. dependency-cruiser enforces the target's rules on this
layout: `application/` imports no `http/`, `next/*`, `hono` or `db/` code
beyond the container's types; a module is imported only through its
`module.ts`; `kernel/` imports no module; `app/` reaches `server/` only through
`module.ts` files, the use cases `composition.ts` wires, the kernel (server
actions resolve the actor there, section 3) and the mount.

A use case is a function of its dependencies taking an actor and validated
input and returning a `Result`, as in the target. The unit of work and
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
with `guest.unselected` or `guest.protected`. Organizer actions require
the admin actor. No tokens, persons or roles: those are step 6.

`proxy.ts` gates the API as it gates the legacy routes. Endpoints that require
the admin actor live under `/api/v1/admin/`, which gets the `/api/admin/*`
branch: the admin cookie alone, without the site password (the two are
independent, as the admin guide documents), the cross-site check, and `404`
when `ADMIN_PASSWORD` is unset. The rest of `/api/v1` requires the site
password. Under `/api/v1`, the proxy refuses with problem details (section 4)
instead of the login redirect or `{ error }` body the legacy routes get.

### 4. Errors are values, sent as problem details

Use cases return `Result<T>`: a value, or an error with a stable `code` and a
kind (`notFound`, `forbidden`, `conflict`, `invalid`, `gone`). One function in
`server/http` maps the kind to a status and the error to an RFC 9457 body
(`application/problem+json`): `type: "about:blank"`, `title`, `status`, an
optional `detail`, and the extension member `code`. A request that fails its
contract gets `400` with code `request.invalid` and an `errors` list of paths
and messages. Codes are dotted, named for what was refused
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
- with a different method, path or body, gets `422` with
  `idempotency.keyReused`.

A `5xx` response is not stored, so a retry after a server error runs again.
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
so the document covers the whole API. The generated `api-client` is built from
this file (a later step of this run).

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
  that send the key.
- Pagination, rate limiting and `expectedVersion` checks from the target are
  not part of this decision; a table gains a version check only if it already
  has a version column.
