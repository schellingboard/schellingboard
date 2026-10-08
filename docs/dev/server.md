# The server and the API

`server/` holds the use cases and the `/api/v1` HTTP API in front of them.
Server actions, the legacy `/api/*` routes and `/api/v1` all call the same use
cases, so a rule is written once. [ADR 0012](adr/0012-http-api-v1.md) has the
decisions; this page is how the code is laid out and how to add to it. The
user-facing description of the API is
[HTTP API](https://docs.schellingboard.org/self-hosting/api/).

## Layout

```
server/
  kernel/              Result and error kinds, Actor and resolveActor, actingGuest
  http/                the Hono app (app.ts), middleware, problem details, OpenAPI document and its reference page (docs.ts)
  composition.ts       builds each module's use cases from the repositories and adapters
  modules/<module>/
    module.ts          the only file anything outside the module imports
    ports.ts           its dependencies: a Pick of the repository container, plus adapters
    application/       use cases and queries, gathered in use-cases.ts
    http/              route declarations and handlers
```

The modules are `sessions` (sessions, RSVPs, room unavailability, attendee
counts), `proposals` (proposals and votes), `comments`, `meetings`, `people`
(profiles and the admin guest list), `notifications`, `events` (events and
days), `venue` (locations) and `settings` (site settings).

The Next mount is `app/api/v1/[[...route]]/route.ts`; `proxy.ts` gates it like
any other route (site password or admin cookie for `/api/v1`, the admin cookie for
`/api/v1/admin/`). Repositories stay in `db/`.

## Adding a use case and its route

1. **Contract.** Add the request and response zod schemas to
   `packages/contracts/src/<area>.ts`; they are plain `zod`, with no Hono
   import.
2. **Use case.** In `application/`, a function of the module's deps returning
   `(actor, input, now) => Promise<Result<T>>`. Authorize first: `actor.admin`
   for organizer actions, `actingGuest` (or `actingAsNamedGuest` when the
   request names the guest) from `server/kernel/acting-guest.ts` for anything
   done as a guest. Refuse with `notFound`, `forbidden`, `conflict`, `invalid`,
   `gone` or `unavailable` from `server/kernel/result.ts` and a dotted code
   named for what was refused (`session.full`); `invalidFields` names several
   fields at once. Take `now` as an argument, never read the clock. Add it to
   the module's `use-cases.ts`; a new dependency goes in `ports.ts` and is
   wired in `composition.ts`.
3. **Route.** In `http/`, declare it with `createRoute`: the contract for the
   request, `json(schema, …)` for each success status, `...problemDefault` for
   problems, and `headers: idempotencyHeaders` on every mutation. The handler
   reads `c.req.valid(…)`, calls the use case with `c.var.actor` and
   `c.var.now`, and returns `problem(result.error)` on failure. Admin routes go
   under `/admin/`, or the proxy will not gate them. Register a new route
   function in `server/http/app.ts`.
4. **Callers.** A server action resolves the actor with
   `resolveActor(await cookies())` and calls the use case from
   `server/composition.ts`. A legacy route uses `legacyActor` and
   `legacyRefusal` from `app/api/legacy.ts` and keeps its old response body.
5. **`make openapi`.** It rewrites `packages/contracts/openapi.json` and the
   client's types in `packages/api-client/src/schema.ts`; commit both.
   `make openapi-check`, in `make precommit` and CI, fails while either is stale.

`make arch` enforces the layout (see
[Architecture rules](architecture-rules.md)): the kernel reaches no module,
HTTP code or framework, even indirectly; `application/` imports no HTTP,
framework or `db/` code beyond the container's types, and never calls the
container; a module is imported only through its `module.ts`, by other
modules, tests and `app/` alike; `app/` reaches `server/` only through
`module.ts`, `composition.ts`, the kernel and `http/app.ts`; `server/` never
imports `app/`; `packages/api-client` imports only `openapi-fetch`.

## Testing

Two integration tiers, against the real database:

- **Behaviour on the use case** (`tests/integration/*-use-cases.test.ts`): call
  the use case from `composition.ts` with an `Actor` built in the test, and
  cover its rules there — who may, what is refused, what is stored.
- **HTTP only on the route** (`tests/integration/api-*.test.ts`): call the
  mount's handlers with a request and cookies, and check what only HTTP adds:
  status codes, the problem body and its `code`, the contract's validation,
  the admin gate. Do not repeat the use case's rules here.

`tests/integration/idempotency.test.ts` covers `Idempotency-Key`, and
`tests/integration/api-client.test.ts` calls the API through
`@schellingboard/api-client`. `tests/integration/mutating-surface-guard.test.ts`
checks the whole mount through a single route, so a new use case acting as a
guest proves its own `guest.protected` refusal in its tests.

Two meanings of "use case" meet here: the functions in `application/`, and the
user stories catalogued in `tests/use-cases.ts` that every test is tagged with
([Testing](testing.md#use-cases)).
