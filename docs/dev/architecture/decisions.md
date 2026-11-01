# Decisions

The decisions behind the shape, each with the alternatives that lost. The numbered ADRs in
[../adr/](../adr/README.md) record the individual steps; these are the ones that hold the whole
design together.

<a id="d1"></a>

## D1 · API server plus static SPA, no server-side rendering

**Context.** The app was Next.js with server components and server actions as the data path. Live
updates, an OpenAPI document, bots and a clear frontend/backend line all need a real HTTP API, so
the question was whether to keep server-side rendering (SSR) next to it.

**Decision.** One process serves an OpenAPI-described HTTP API, an SSE change feed and a static
React SPA built with Vite. The first HTML is a static shell. React stays.

**Why not SSR.** Its gains are small here: the app is behind a login (no search engines), and an
installed PWA opens from disk with no round trip, which SSR cannot beat and which works offline. Its
costs are real: two runtimes for one UI, hydration bugs ("which code ran where"), server-rendered
truth that live updates overwrite on load, and no offline path without the client render path
anyway.

**Alternatives.** A meta-framework rendering from the API keeps the hydration cost and still needs
the client store. Next full-stack with a side API gives two data paths.

**Consequences.** An API contract, a generated client and a client store to maintain. The cold first
load downloads the bundle.

<a id="d2"></a>

## D2 · Guests with assurance levels; picking a name stays viable

**Context.** Attendees valued having nothing to remember, but private features mean nothing if
anyone can pick a name, and some events will want everyone verified.

**Decision.** Each login session has an assurance level, _claimed_ or _verified_. An event's
identity mode sets the minimum and a guest can raise theirs by protecting their name. Verification
is passwordless first (personal join link, emailed code) with a password as one more option. Roles
are data: the site-admin role on a guest. There is no shared admin password; the site password still
gates the whole site until the read setting replaces it ([not-built.md](not-built.md)).

**Alternatives.** Verified only (friction for events with no emails). Protection as the only
mechanism (no way for an organizer to require it).

**Consequences.** Organizers distribute join links. [ADR 0017](../adr/0017-identity-and-roles.md).

<a id="d3"></a>

## D3 · A per-event replica kept current by a change feed

**Context.** The schedule must update without reloads, the views cut across sessions, RSVPs and
meetings, and venue wifi drops.

**Decision.** The client loads a snapshot of everything its viewer may see of one event and applies
changes from an SSE feed by sequence number; the replica is persisted for offline opening. Paged or
role-restricted data uses ordinary queries.

**Alternatives.** A query cache with invalidation (every cross-cutting view needs an endpoint or
client joins; offline is partial). A sync engine such as Replicache or Electric (a heavy dependency,
usually Postgres).

**Consequences.** Purpose-built sync code (`feed-apply.ts`, the feed client, persistence), a
visibility model that decides the audience at write time, and payloads that carry the full subject.
[ADR 0014](../adr/0014-change-feed-and-snapshot.md).

<a id="d4"></a>

## D4 · A Meeting is its own aggregate

**Decision.** A 1-on-1 `Meeting` has its own lifecycle (request, accept, decline, cancel) and
two-party privacy, separate from `Session`; the client merges both where a screen needs them.

**Alternative.** One calendar-item type including meetings: privacy and lifecycle become optional
fields everywhere.

<a id="d5"></a>

## D5 · Workspace packages as the boundary mechanism

**Decision.** `domain`, `contracts`, `api-client` and `apps/web` are Bun workspace packages with
TypeScript project references; dependency-cruiser and ESLint rules guard the boundaries inside
`server/` and `apps/web`. The server stays at the repository root (no `apps/server`).

**Alternative.** Directories in one package with lint rules only: less tooling, every boundary
exemptable. [ADR 0010](../adr/0010-workspace-packages.md).

<a id="d6"></a>

## D6 · SQLite only, behind ports

**Decision.** SQLite in WAL mode is the only supported database. Repositories are ports, so another
adapter is possible; it is not promised, and several replicas are a non-goal.

**Alternatives.** Both databases (double the persistence maintenance); Postgres only (a second
container for self-hosters, harder backups).

<a id="d7"></a>

## D7 · Server-Sent Events, not WebSockets

**Decision.** The feed is SSE with resume by sequence number; mutations go over HTTP.

**Why.** The client never pushes over the socket; SSE reconnects itself, passes ordinary proxies and
needs no library.

<a id="d8"></a>

## D8 · The change log as the single backbone

**Decision.** Every use case records changes in the same transaction as its state. The log serves
the feed, notifications and the reactions the jobs loop runs.

**Alternatives.** Event sourcing (a large mental-model cost for no need here); one mechanism per
concern (an email outbox, a notification table, a pub/sub for the UI).

**Consequences.** Payload shapes are part of the contract, retention is a limit, and reactions must
be idempotent. [ADR 0011](../adr/0011-change-log-and-jobs-loop.md).

<a id="d9"></a>

## D9 · Vite, TanStack Router, a small reactive store

**Decision.** Vite builds the SPA; TanStack Router gives typed routes with search params (modals as
URL state); a small store holds the replica. Tailwind and the colour tokens stay. Any equivalent
would do; the point is boring tools.

<a id="d10"></a>

## D10 · One jobs loop in the process

**Decision.** Reactions, deliveries, reminders and pruning run in one leased loop in the server
process. It reads from tables, is idempotent, and takes its time from the clock argument, so the dev
fake clock moves it too.

**Alternatives.** An external queue (something more to operate); a separate worker process (two
things to run and a second database writer).

<a id="d11"></a>

## D11 · Node in the image, Bun for tooling

**Decision.** The Docker image runs the server on Node. Bun stays the package manager and script
runner; Vitest and Playwright stay the test runners.

**Why.** The SQLite driver and `sharp` are native modules with Node as their first-class target.
Revisit yearly.
