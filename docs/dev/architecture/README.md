# Architecture

How SchellingBoard is built, in one place to start from. The details live in the chapters it links
to: [The server and the API](../server.md), [The web app](../web-app.md) and
[Architecture rules](../architecture-rules.md). What was designed but not built is in
[not-built.md](not-built.md); the decisions behind the shape are in [decisions.md](decisions.md);
the words are in [glossary.md](glossary.md).

## The design on one screen

| Topic        | What the code does                                                                                                                                                   | Decision                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Shape        | One Node process (Hono) serves an OpenAPI-described HTTP API at `/api/v1`, an SSE change feed, uploads and a static React single-page app. No server-side rendering. | [D1](decisions.md#d1)   |
| Boundaries   | Workspace packages `domain` → `contracts` → `api-client`; `apps/web` imports only those. `server/` is split into modules, guarded by dependency-cruiser.             | [D5](decisions.md#d5)   |
| Backbone     | Every state change is committed together with a **change** in an append-only log. The log feeds the live UI, notifications and the jobs loop.                        | [D8](decisions.md#d8)   |
| Client data  | The web app keeps a **replica** of one event: a snapshot plus the change feed, persisted in IndexedDB so the schedule opens offline.                                 | [D3](decisions.md#d3)   |
| Rules        | Phase gating, RSVP, vote and booking rules are pure functions in `packages/domain`. The server decides with them and the client predicts with them.                  | [Rules](#rules)         |
| Identity     | Guests with an **assurance level** per login session (claimed or verified), an identity mode per event, personal join links and a site-admin role.                   | [D2](decisions.md#d2)   |
| Persistence  | SQLite in WAL mode, repositories behind ports in `db/`. One process, one file; several replicas are a non-goal.                                                      | [D6](decisions.md#d6)   |
| Live updates | Server-Sent Events, resumable by sequence number.                                                                                                                    | [D7](decisions.md#d7)   |
| Background   | One leased loop in the same process runs reactions to changes, deliveries (email, push), reminders and pruning.                                                      | [D10](decisions.md#d10) |

## The containers

```
 ┌──────────────────────────┐   HTTPS/JSON (OpenAPI)   ┌────────────────────────────────────┐
 │  Web app (static SPA)    │ ───────────────────────► │  Server (one Node process)         │
 │  React · Vite · PWA      │   SSE change feed        │  HTTP API · change feed · jobs     │
 │  replica of one event    │ ◄─────────────────────── │  10 modules · kernel               │
 └──────────────────────────┘                          └──────┬─────────────────┬───────────┘
                                                              │ SQL via ports   │ files
                                                       ┌──────▼──────┐   ┌──────▼──────┐
                                                       │ SQLite (WAL)│   │ uploads dir │
                                                       │ state +     │   └─────────────┘
                                                       │ change log  │
                                                       └─────────────┘
 external: SMTP · browser push services · a reverse proxy for TLS
```

The LikeC4 views `index` and `containers` in [diagrams/](diagrams/README.md) draw the same picture.

<likec4-view view-id="index"><a href="https://developers.schellingboard.org/diagrams/#/view/index">L1
system context diagram</a></likec4-view>
<likec4-view view-id="containers"><a href="https://developers.schellingboard.org/diagrams/#/view/containers">L2
container diagram</a></likec4-view>

- **Web app** (`apps/web`): static files built by Vite. It loads a snapshot, follows the feed and
  renders from the replica. Mutations are commands: predict, call the API, reconcile.
  [The web app](../web-app.md).
- **Server** (`server/`, entry `server/main.ts`): the HTTP gates and routes, the feed, the modules
  and the kernel they share. [The server and the API](../server.md).
- **Database and files** (`db/`, the uploads directory): SQLite holds state, the `changes` table and
  the job tables; uploads are re-encoded and served from `/media`.

## Packages and modules

```
packages/domain      pure TypeScript: entities, rules, change types, time helpers. No I/O.
packages/contracts   zod schemas for requests, responses, snapshot and feed; openapi.json is generated from them.
packages/api-client  generated from openapi.json. Typed fetch, nothing else.
apps/web             the SPA. Imports those three packages and nothing from the server.
server/, db/, utils/ the process, the database layer and shared server helpers, at the repository root.
```

The server has ten modules under `server/modules/`: `sessions` (sessions, RSVPs, room
unavailability, attendee counts), `proposals` (proposals and votes), `comments`, `meetings`,
`people` (guests, profiles, sign-in and join links), `notifications`, `events` (events and days),
`venue` (locations), `settings` and `updates`. A module is imported only through its `module.ts`;
its use cases depend on ports, and adapters are wired in `server/composition.ts`. The rules the
build enforces are in [Architecture rules](../architecture-rules.md).

<likec4-view view-id="server"><a href="https://developers.schellingboard.org/diagrams/#/view/server">L3
server: infrastructure components and modules</a></likec4-view>

## How a request flows

1. **The gates** (`server/http/web.ts`, `gates.ts`) check the site password and the origin of a
   mutation; `actorMiddleware` resolves the **actor** from the login session or guest cookie, then
   the rate limit applies.
2. The **route** validates the body against its contract and calls one use case.
3. The **use case** loads what it needs through ports, applies the rules from `packages/domain`, and
   writes in `uow.run`: one transaction holding the new state and the **changes** it records.
4. After commit the kernel hands each change, in `seq` order, to its subscribers: the feed hub (fan
   out to connected viewers) and the jobs loop (a nudge).
5. The response returns. The change carries the caller's `Idempotency-Key`, so the client recognises
   its own change on the feed even if the feed message arrives before the response.

<likec4-view view-id="flowRsvp" dynamic-variant="sequence"><a href="https://developers.schellingboard.org/diagrams/#/view/flowRsvp">Sequence
diagram: RSVP with optimistic update and live propagation</a></likec4-view>

Reads are the snapshot plus the feed (everything in the viewer's audience for one event) or explicit
queries for paged or role-restricted data: the guest directory, a host's vote breakdown,
notification history, admin lists.

## Why the change log is the spine

Four things are all "something happened, and someone else needs to know": the live UI, in-app
notifications, email and push delivery, and the reactions the jobs loop runs. One append-only
`changes` table, written in the same transaction as the state it describes, serves all of them. It
is not event sourcing: state lives in ordinary tables and the log is derived from operations. It is
the transactional outbox pattern with the outbox as a queryable table. Each change stores its
**audience** at write time (`audienceOf` in `packages/domain/src/change.ts`), so a later change to a
visibility rule cannot expose old changes. Changes older than seven days that the reactions have
handled are deleted; a client that resumes the feed from before that gets a `reset` message and
loads a new snapshot. [ADR 0011](../adr/0011-change-log-and-jobs-loop.md),
[ADR 0014](../adr/0014-change-feed-and-snapshot.md).

## The web app

Every screen reads the replica and writes through `commands/`. A command predicts with the same
domain rule the server will run (`rsvpRefusal`, `voteRefusal`), applies the predicted change under
the request's idempotency key, calls the API, and drops the prediction when the confirmed change
arrives on the feed or the request fails. `apply` in `packages/contracts/src/feed-apply.ts` is the
pure reducer. Admin screens are not in the replica: they load their own `queries/`. The service
worker (`public/sw.js`) caches the shell, never API responses.

<likec4-view view-id="web"><a href="https://developers.schellingboard.org/diagrams/#/view/web">L3
web app components</a></likec4-view>

## Rules

Rules sit in `packages/domain` as pure functions that take the clock as an argument: the event phase
(`phase.ts`), `rsvp-rule.ts`, `vote-rule.ts`, `session-booking.ts`, `session-overlap.ts`, meeting
slots and clashes. A rule returns a reason code, never a sentence; the SPA and the emails word it.
An ESLint rule bans `new Date()` outside the request boundary, so the dev fake clock
([ADR 0004](../adr/0004-dev-fake-clock.md)) reaches every rule.

## Time

Instants are stored and sent as ISO-8601 UTC. Every event has an IANA time zone and every day is a
local date in it; dates are formatted in the event's zone, never the process's or the browser's.

## Security in one paragraph

A visitor needs the site password; the cookie is `httpOnly`, `SameSite=Lax`. A guest acts through a
server-side login session row with an assurance level; an event's identity mode and a guest's own
protection set which level an action needs. Mutations from another origin are refused. The admin API
checks the site-admin role in its use cases. Responses go through their contracts, so a repository
row never reaches the wire. Uploads are re-encoded with sharp and served from `/media` with
`nosniff`. [ADR 0017](../adr/0017-identity-and-roles.md) has the identity decisions.
