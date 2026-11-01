# Getting started

## Technology stack

- **Server**: Hono on Node; **web app**: React, Vite and TanStack Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: SQLite (better-sqlite3) with Drizzle ORM
- **Testing**: Vitest and Playwright
- **Package manager**: Bun

Where things live:

- **Frontend**: the single-page app in `apps/web`; see [The web app](web-app.md)
- **Database layer**: `db/` — `schema.ts`, `container.ts`, repositories in `db/repositories/sqlite/`
- **Server**: use cases in `server/modules/`, the HTTP surface in `server/http/`
- **Utils**: Shared utilities in `utils/`
- **Domain and contracts**: workspace packages — `packages/domain` (vocabulary, constants, pure
  rules) and `packages/contracts` (zod schemas); see [ADR 0010](adr/0010-workspace-packages.md)
- **Migrations**: Drizzle-managed SQL migrations in `drizzle/`

The architecture is written up separately in [Architecture](architecture/README.md); the rules the
build enforces today are in [Architecture rules](architecture-rules.md).

## Prerequisites

- **Bun** (package manager and script runner)
- **Node.js 22** (or higher), installed and on your `PATH`. Although Bun runs the app, the tooling
  shells out to a real `node` — `bun x tsx` for migrations/scripts, and Vitest's test workers — so
  `node` must be directly on your `PATH`. Check with `node -v`.

## Setup

1. Clone the repo and install dependencies:

   ```bash
   make install
   ```

2. (Optional) Create `.env.dev.local` to customize environment variables:

   ```bash
   DATABASE_URL=file:./data.db
   SITE_PASSWORD=your-password
   AUTH_SECRET=<generated via openssl rand -base64 32>
   ```

   See [Environment variables](#environment-variables) below for all options. Note: `AUTH_SECRET` is
   required only when `SITE_PASSWORD` is set or guests protect their name (it signs their session
   cookies). Omitting this file uses sensible defaults.

3. (Optional) Seed the database with test data:

   ```bash
   make dev-db-seed
   ```

   This seeds the `large` profile: the hand-curated fixtures the E2E suite uses plus a few hundred
   generated guests, proposals and sessions for realistic manual testing.
   `SEED_PROFILE=small make dev-db-seed` seeds only the curated fixtures (what the E2E suite always
   runs against).

4. Start the dev server:

   ```bash
   make dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser. That is the Vite dev server
   for the SPA; it proxies the API to the server, which runs on the next port (3001).

## Development commands

Run `make` to see all available commands:

```bash
make          # List all commands
make dev      # Start dev server
make test     # Run tests
make lint     # Lint code
make format   # Format code
```

Before committing or pushing, run:

```bash
make precommit  # Format, lint, type check, and run all tests (incl. e2e)
```

## Admin UI

A web admin UI is available at `/admin` for managing all core records: events (basic info, phases,
days), the global pools of users and locations, event↔guest and event↔location assignments,
moderation of proposals, sessions, and RSVPs, and site settings (title, description, and the
optional venue map). It is for site admins, who sign in at `/admin`; `make dev-db-seed` seeds one
(username `site-admin`, password `seed-password`), and `make bootstrap-link` prints a link that
makes another. It has its own layout, and the sign-in asks for `SITE_PASSWORD` first when one is
set.

## Dev fake clock

Set `SB_ENABLE_DEV_TOOLS=1` and visit any event page with `?dev=1` to get a toolbar for
time-traveling the app (real time / `+1h` / `+1d` / `+7d` / pick a date), so you can walk an event
through its proposal → voting → scheduling phases without editing dates in the database. It's a
request-scoped cookie, inert unless the env var is set — safe to enable on a shared staging/demo
instance. See [ADR 0004](adr/0004-dev-fake-clock.md) for details.

## Environment variables

See
[Configuration](https://docs.schellingboard.org/self-hosting/configuration/#environment-variables)
for the full list and descriptions.

For local development, `DATABASE_URL` is the only required variable — unlike Docker, no default is
provided (e.g. `file:./data.db`). `AUTH_SECRET` is additionally required when `SITE_PASSWORD` is set
or guests protect their name (it signs their session cookies); generate one with:

```bash
openssl rand -base64 32
```

A new variable a self-hoster can set has to reach three files: the reference table above,
`docker-compose.yml` (which forwards it into the container) and `.env.docker.example` (where they
fill it in). Nothing runs `docker-compose.yml` — it is the one file here whose only user is a
stranger — so `tests/unit/docker-compose-env.test.ts` compares the three and names whichever
variable fell out of step. If a variable deliberately doesn't go through compose, record the reason
in that test instead.

## Running multiple instances

Several clones or `jj` workspaces on one machine compete for the same ports. Give each clone
explicit, distinct ports in `.env.dev.local` and `.env.test.local` — see
[Running multiple instances](multiple-instances.md) for which variable does what and a worked
two-clone example.

## Database migrations

`make dev-migrate-create` (`drizzle-kit generate`) diffs `db/schema.ts` against the latest snapshot
in `drizzle/meta/` and writes a new migration plus updated meta files. When two branches each add
one, the meta files conflict — don't hand-edit them, regenerate as described in
[Database migrations](migrations.md#resolving-migration-conflicts).
