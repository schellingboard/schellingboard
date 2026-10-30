# The server and the API

`server/` holds the use cases and the `/api/v1` HTTP API in front of them. Server actions, the
legacy `/api/*` routes and `/api/v1` all call the same use cases, so a rule is written once.
[ADR 0012](adr/0012-http-api-v1.md) has the decisions; this page is how the code is laid out and how
to add to it. The user-facing description of the API is
[HTTP API](https://docs.schellingboard.org/self-hosting/api/).

## Layout

```
server/
  kernel/              Result and error kinds, Actor and resolveActor (`actorOf` binds it to the session rows), actingGuest, the unit of work
  http/                the Hono app (app.ts), middleware, problem details, OpenAPI document and its reference page (docs.ts)
  feed/                the snapshot and the SSE change feed (routes.ts), the hub of open connections, projection of a change to a viewer
  composition.ts       builds each module's use cases from the repositories and adapters
  modules/<module>/
    module.ts          the only file anything outside the module imports
    ports.ts           its dependencies: a Pick of the repository container, plus adapters
    application/       use cases and queries, gathered in use-cases.ts
    http/              route declarations and handlers
```

The modules are `sessions` (sessions, RSVPs, room unavailability, attendee counts), `proposals`
(proposals and votes), `comments`, `meetings`, `people` (profiles and the admin guest list),
`notifications`, `events` (events and days), `venue` (locations), `settings` (site settings) and
`updates` (the daily GitHub look-up of the latest release, shown to the admin).

The Next mount is `app/api/v1/[[...route]]/route.ts`; `proxy.ts` gates it like any other route (site
password or admin cookie for `/api/v1`, the admin cookie for `/api/v1/admin/`). Repositories stay in
`db/`.

`db/container.ts` opens the database in WAL mode with two connections. Repository methods named
`find…` (but not `findOrCreate…`), `list…`, `search…`, `count…` or `get…` run on a read-only
connection, which sees only committed rows. Every other method takes the in-process write lock and
runs on the write connection, so name a method that writes accordingly
([ADR 0013](adr/0013-unit-of-work.md)).

A use case writes in `deps.uow.run(async (tx) => …)` (`server/kernel/unit-of-work.ts`): one
transaction, which a throw or a failure `Result` rolls back. Inside it, read and write through `tx`,
never through `deps.repos`: their writes wait for the lock `tx` holds, and their reads do not see
its rows. `tx.record(change)` logs a change with the state, addressed to the audience `audienceOf`
(`packages/domain/src/change.ts`) gives (add a case for each new type; `none` is for changes logged
only for reactions, which no feed viewer sees) and marked with the request's `Idempotency-Key`, if
any; after commit, each change goes to the `subscribeToChanges` subscribers in `seq` order, the jobs
loop among them. Keep I/O to other systems, such as mail, out of the callback. `uow.read` runs
several reads on one consistent view.

## Reading for pages

Site pages do not call the repositories. `pageReads()` in `composition.ts` gives plain reads (no
actor: the pages sit behind the site password only). Each is a function in a module's
`application/page-reads.ts` taking a `Pick` of the repositories. `make arch` enforces it, with the
auth flows allow-listed.

## Choosing a name

`PUT /api/v1/me/identity` makes the browser act as an open guest name and `DELETE` signs it out;
`GET` answers who the browser acts as now (null for a protected name not yet logged in, the SPA's
viewer); all three set the `guest` cookie, which the route adapter builds from the use case's
`Identity` (`people/application/identity.ts`). A protected name answers `403 guest.protected`: the
SPA sends the user to the legacy login. The `selectUserAction` server action calls the same use
case.

## Signing in

`POST /api/v1/auth/login-code` emails a code, `POST /auth/login` takes the password or that code and
sets a `verified` session cookie, `POST /auth/sign-out` ends it (`people/application/sign-in.ts`).
`/auth/*` has its own per-address rate limit on top of the per-guest password limit and the daily
email cap, and a limit answers `429` (kind `limited`). Problem codes: `auth.credentialWrong` (wrong,
spent or expired password or code, indistinguishable on purpose), `auth.tooManyAttempts`,
`auth.codeRecentlySent`, `auth.codeSpent`, `auth.tooManyEmails`, `auth.mailUnavailable`,
`auth.mailFailed`. A `limited` refusal carries `Retry-After`. The proxy refuses a cross-site
`/api/v1/auth/*` request like the admin API's (403 `request.crossSite`). The per-address limit
applies only with `SB_TRUSTED_PROXIES` set; its burst is `SB_AUTH_RATE_BURST` (default 30), and
sign-out is not limited. The legacy actions in `user-auth.ts` call the same use cases.

Credentials (`people/application/credentials.ts`): `POST /auth/reset-link` emails a reset link
(`auth.linkRecentlySent`), `POST /auth/reset` sets the password and protects the name without
signing anyone in, `PUT /me/credentials/password`, `POST /me/credentials/unprotect` and
`PUT /me/credentials/username` need the acting session and, where protected, its verified level.
`/auth/login` also takes an `identifier` (email or lowercase username) for `guestId`; an unknown one
answers `auth.credentialWrong`. `GET /me/login-sessions` lists the guest's sessions and
`DELETE /me/login-sessions/{id}` ends one (`loginSession.notFound`). Also `username.taken`,
`auth.notProtected`.

## The feed and the snapshot

[ADR 0014](adr/0014-change-feed-and-snapshot.md) has the decisions.
`GET /api/v1/events/{slug}/snapshot` returns what one viewer may see of an event, with the `seq` of
the newest change it includes and the server's `now` (the dev fake clock included); the feed's
`ping` events (one as the stream opens, so the browser sees it open at once on a quiet event, then
every 25 s) carry `now` too, so a client keeps its clock offset current. A ping reads the
`time-override` cookie once, when the stream opens; changing the fake clock takes a reconnect.
`GET /api/v1/events/{slug}/feed?since=` is a Server-Sent Events stream: it replays the `changes`
table after `since`, then follows live changes registered with the hub. `project()` in
`server/feed/project.ts` turns each recorded change into the message that viewer may see, or none; a
new change type needs a case there and in `audienceOf`. The message carries the `command_key` only
for the actor who made the change.

The client applies messages to its replica in `apps/web/src/replica/`
(`packages/contracts/src/feed-apply.ts`, a pure function from replica and message to replica;
`store.ts`; `live-replica.ts` for the connection). A new message type needs a case in
`feed-apply.ts`: unknown types only move `seq`.

A cascade change that carries `tellAttendees` (day and location deletes) makes the
`changeNotifications` reaction notify the session's RSVPed guests, never its hosts; event and guest
deletes record none.

`GET /api/v1/updates` (the `updates` module) answers the admin with the running and the latest
release, and anyone else with null. The server asks GitHub at most daily; `SB_UPDATE_CHECK=false`
turns that off.

`SB_API_RATE_BURST` sets the burst of the per-address API rate limit (default 1000).

`GET /api/v1/health` also names the `version` and the `buildId` (Next's `.next/BUILD_ID`, the
version outside a production build). The SPA shell carries the build id it was served by
(`<meta name="sb-build">`, added by `serveSpaShell`); a client that sees `health` report another one
offers a reload, and a kiosk reloads by itself. It stays behind the site password.

The in-app release notes live in `packages/domain/src/release-notes.ts` so the Next footer and the
SPA import the same data.

## Pages under `/legacy`

The Next pages live in `app/legacy/` ([ADR 0015](adr/0015-spa-alongside-next.md)), so a page path in
code is written `/legacy/…` (`<a href>`, `router.push`, `redirect()`, `revalidatePath()`). `/api`
and `/media` stay at the root. `proxy.ts` rewrites every other root path to the SPA shell, whose
router owns most of them and forwards the rest to `/legacy` + path, so emails and push links keep
their root URLs ([web app](web-app.md)). The proxy applies its gates to a `/legacy` path without the
prefix.

## Keys from the UI

A server action or route that creates something runs under `idempotentAction()` from
`composition.ts`, with a key the caller made for the attempt, sent as the `Idempotency-Key` header
or an argument outside the zod schema. The SPA's command runner makes one per command and reuses it
on a retry. A success is stored and replayed for a repeat; a refusal frees the key. The changes it
records carry the key, and the feed echoes it to the sender, which is how the runner's optimistic
prediction knows its command has arrived and drops it.

## Adding a use case and its route

1. **Contract.** Add the request and response zod schemas to `packages/contracts/src/<area>.ts`;
   they are plain `zod`, with no Hono import.
2. **Use case.** In `application/`, a function of the module's deps returning
   `(actor, input, now) => Promise<Result<T>>`. Authorize first: `actor.admin` for organizer
   actions, `actingGuest` (or `actingAsNamedGuest` when the request names the guest) from
   `server/kernel/acting-guest.ts` for anything done as a guest. Refuse with `notFound`,
   `forbidden`, `conflict`, `invalid`, `gone` or `unavailable` from `server/kernel/result.ts` and a
   dotted code named for what was refused (`session.full`); `invalidFields` names several fields at
   once. Take `now` as an argument, never read the clock. Add it to the module's `use-cases.ts`; a
   new dependency goes in `ports.ts` and is wired in `composition.ts`.
3. **Route.** In `http/`, declare it with `createRoute`: the contract for the request,
   `json(schema, …)` for each success status, `...problemDefault` for problems, and
   `headers: idempotencyHeaders` on every mutation. The handler reads `c.req.valid(…)`, calls the
   use case with `c.var.actor` and `c.var.now`, and returns `problem(result.error)` on failure.
   Admin routes go under `/admin/`, or the proxy will not gate them. Register a new route function
   in `server/http/app.ts`.
4. **Callers.** A server action resolves the actor with `actorOf(await cookies())` and calls the use
   case from `server/composition.ts`. A legacy route uses `legacyActor` and `legacyRefusal` from
   `app/api/legacy.ts` and keeps its old response body.
5. **`make openapi`.** It rewrites `packages/contracts/openapi.json` and the client's types in
   `packages/api-client/src/schema.ts`; commit both. `make openapi-check`, in `make precommit` and
   CI, fails while either is stale.

`make arch` enforces the layout (see [Architecture rules](architecture-rules.md)): the kernel
reaches no module, HTTP code or framework, even indirectly; `application/` imports no HTTP,
framework or `db/` code beyond the container's types, and never calls the container; a module is
imported only through its `module.ts`, by other modules, tests and `app/` alike; `app/` reaches
`server/` only through `module.ts`, `composition.ts`, the kernel and `http/app.ts`; `server/` never
imports `app/`; `packages/api-client` imports only `openapi-fetch`.

## Testing

Two integration tiers, against the real database:

- **Behaviour on the use case** (`tests/integration/*-use-cases.test.ts`): call the use case from
  `composition.ts` with an `Actor` built in the test, and cover its rules there — who may, what is
  refused, what is stored.
- **HTTP only on the route** (`tests/integration/api-*.test.ts`): call the mount's handlers with a
  request and cookies, and check what only HTTP adds: status codes, the problem body and its `code`,
  the contract's validation, the admin gate. Do not repeat the use case's rules here.

`tests/integration/idempotency.test.ts` covers `Idempotency-Key`, and
`tests/integration/api-client.test.ts` calls the API through `@schellingboard/api-client`.
`tests/integration/mutating-surface-guard.test.ts` checks the whole mount through a single route, so
a new use case acting as a guest proves its own `guest.protected` refusal in its tests.

Two meanings of "use case" meet here: the functions in `application/`, and the user stories
catalogued in `tests/use-cases.ts` that every test is tagged with ([Testing](testing.md#use-cases)).
