# ADR 0013: The unit of work

- **Status:** Proposed
- **Date:** 2026-10-06

## Context

The [target architecture](../target-architecture/03-server.md#use-cases) runs
each use case in one transaction, `uow.run(async (tx) => …)`, where `tx` holds
the repositories and `record(change)`. After commit, and before the writer lock
is released, the kernel calls `publish` for in-process subscribers (the jobs
nudge now, the feed hub later), so they see changes in `seq` order. The
snapshot reads its state and its `seq` in one read transaction.

Today repositories open their own transactions, `SqliteSessionsRepository`
logs session changes in its own (ADR 0011), so a use case that writes through two repository calls is not
atomic (ADR 0012), and session use cases call `nudgeJobs()` themselves. Facts
that constrain the replacement:

- **better-sqlite3 transactions are synchronous and per connection.**
  `db.transaction(fn)` throws if `fn` returns a promise. An async transaction
  needs a manual `BEGIN` … `COMMIT`, and while it awaits, every other request's
  statement on that connection runs inside it: it reads the uncommitted rows,
  and its writes commit or roll back with it.
- **The ports are async, the adapters are not.** Every method in
  `db/repositories/interfaces.ts` returns a promise, but every SQLite repository
  runs synchronous statements. An `await` on them still yields to other
  requests between statements.
- **better-sqlite3 blocks the event loop.** A second connection in the same
  process isolates readers from an open write transaction but runs no query in
  parallel with it.
- **The database is not in WAL mode.** `db/container.ts` opens one connection
  with the default rollback journal and sets only `foreign_keys`. The target
  ([06](../target-architecture/06-data-and-time.md#sqlite-settings)) asks for
  WAL, one write connection and a small read pool.
- **The test helpers need one in-memory connection.** `tests/helpers/db.ts`
  serializes the migrated in-memory database once and restores it from the
  buffer before each test. A second connection cannot open that database.
- **Other processes may share the file.** The jobs lease (ADR 0011) exists
  because a second process can run against the same database, so writes keep
  `BEGIN IMMEDIATE` whatever the in-process scheme is.

## Options

### (a) One writer connection behind a mutex, reads on their own connection

`uow.run` takes an in-process async mutex, opens `BEGIN IMMEDIATE` on the write
connection and publishes after `COMMIT` before it releases the mutex. Queries
and `uow.read` use a second connection, which in WAL mode sees only committed
data.

- **Isolation:** full. Reads never see an open write transaction; writes are
  serial. As in (c), a write outside `uow.run` joins the open transaction.
- **Throughput:** the same as today in one process (the event loop is the
  limit); in WAL a reader in another process no longer blocks the writer.
- **Test helpers:** a buffer cannot be shared, so each test file gets a
  database file (a migrated template copied per test). Slower than a restore
  from memory, and `restoreDb` must reopen both connections.
- **WAL in production:** required. Self-hosted databases switch on first start;
  `data.db-wal` and `-shm` sit next to the file. The documented backup uses
  SQLite's backup command, which handles WAL; a network file system does not.
- **Snapshot:** `uow.read` is a `BEGIN` on the read connection. It does not
  hold off writers, and its view stays fixed while writes commit. Two
  `uow.read`s cannot share one read connection, so it needs its own mutex or a
  pool.

### (b) Synchronous transaction callbacks

`uow.run((tx) => …)` takes a synchronous callback: `tx` holds synchronous
repositories, and the transaction is better-sqlite3's own. A use case awaits
whatever is truly async (image storage, mail) before or after it, never inside.

- **Isolation:** full, with no lock: nothing else runs while the callback runs.
  `publish` right after commit is in `seq` order for the same reason.
- **Throughput:** the same as today.
- **Test helpers:** unchanged.
- **WAL in production:** not needed now; it can follow on its own merits.
- **Snapshot:** a synchronous deferred transaction, consistent by construction.
- **Cost:** every repository the use cases call inside `tx` needs a
  synchronous interface next to, or in place of, the async port. Use cases
  stop matching the target's shape, and a Postgres adapter, which D6 keeps
  possible, would mean rewriting them. A callback that returns a promise only
  fails at run time, unless the `tx` type rules it out.

### (c) One connection, one async mutex

`uow.run(async (tx) => …)` takes the mutex, runs `BEGIN IMMEDIATE`, and
publishes after `COMMIT` before it releases the mutex. `uow.read` takes the same
mutex for multi-statement reads that must agree, such as the snapshot.
Single-statement queries take neither.

- **Isolation:** between use cases, full: they are serial. A query outside the
  mutex can run while a use case awaits, and then reads its uncommitted rows. If
  that use case rolls back, the query showed state that never existed. A write
  outside `uow.run` (a single-write path step 3 leaves alone, the jobs loop)
  joins the open transaction and rolls back with it, so the default
  repositories' writes must take the mutex too.
- **Throughput:** the same as today, provided a callback awaits no I/O outside
  the database (the target already forbids that); one that does stalls every
  other use case.
- **Test helpers:** unchanged.
- **WAL in production:** not needed.
- **Snapshot:** `uow.read` holds off writes while it assembles, a few
  milliseconds at the target's [capacity](../target-architecture/03-server.md#capacity).
- **Cost:** the least code. The kernel interface is that of (a), so moving to
  (a) later changes the kernel and the test helpers, not the use cases.

## Recommendation

(c) now, with (a) as its later form. It keeps the async ports and the target's
use-case shape, leaves the test helpers and the production journal as they
are, and gives the guarantees the feed depends on: atomic use cases, changes
published in `seq` order, a consistent snapshot, provided every write outside
`uow.run` also takes the mutex. Its remaining gap, a single-statement query
reading an open transaction's rows, closes when (a) adds WAL and a read
connection, and no use case changes for that. (b) gives the strongest guarantee
for the least locking, but at the price of a second, synchronous set of
repository interfaces that the rest of the target does not want.

## Decision

(a), chosen by the user on 2026-10-06 over the recommendation: reads must
never see a write that is still open, also outside the unit of work.

- The database runs in WAL mode with `synchronous=NORMAL`. `db/container.ts`
  opens a write connection and a read-only connection.
- Repository methods named `find…`, `list…`, `search…`, `count…` or `get…`
  run on the read connection. Every other method takes the in-process write
  lock and runs on the write connection, so a write outside `uow.run` (the
  jobs loop, a single-write path) waits for an open use case instead of
  joining its transaction.
- The lock is on `globalThis`, like the jobs nudge, so module copies under
  Next share it. `withWriter(fn)` holds it and hands `fn` the write
  connection; `uow.run` builds on it. Writes keep `BEGIN IMMEDIATE` for other
  processes.
- Test databases are files: each worker migrates a template once per test
  file and copies it before each test.

## Consequences

- A repository method that writes must not have a read name: the read
  connection is read-only, so such a method fails on its first call.
- A read sees each write as soon as it commits, and never one in progress.
- Self-hosted databases switch to WAL on first start; `data.db-wal` and
  `data.db-shm` sit next to `data.db` in the `/data` volume. The documented
  backup (`.backup`) and restore already handle them. The database must stay
  on a local file system.
- `uow.run` opens `BEGIN IMMEDIATE` on the write connection under the write
  lock and keeps it open across the callback's awaits; a repository's own
  transaction inside it becomes a savepoint. A throw or a failure `Result`
  rolls it back. `tx.record()` collects changes, which are written before
  `COMMIT` and published after it, still under the lock.
- `uow.read` has a third, read-only connection behind a lock of its own: a
  plain read on the shared read connection would otherwise join an open read
  transaction and see its older view.
- A use case inside `uow.run` must write through `tx`, never through
  `getRepositories()`: that waits for the lock it holds.
