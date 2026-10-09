import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import * as schema from "./schema";
import { resolveDbPath, runMigrations } from "./migrate";
import { createLock, withWriteLock, type Lock } from "./write-lock";
import { SqliteAuthCodesRepository } from "./repositories/sqlite/auth-codes";
import { SqliteChangesRepository } from "./repositories/sqlite/changes";
import {
  SqliteCommentsRepository,
  sqliteSubjectCommentsRepository,
} from "./repositories/sqlite/comments";
import { SqliteDaysRepository } from "./repositories/sqlite/days";
import { SqliteDeliveriesRepository } from "./repositories/sqlite/deliveries";
import { SqliteEventsRepository } from "./repositories/sqlite/events";
import { SqliteGuestsRepository } from "./repositories/sqlite/guests";
import { SqliteIdempotencyRepository } from "./repositories/sqlite/idempotency";
import { SqliteJobsRepository } from "./repositories/sqlite/jobs";
import { SqliteLocationsRepository } from "./repositories/sqlite/locations";
import { SqliteLocationUnavailabilityRepository } from "./repositories/sqlite/location-unavailability";
import { SqliteMeetingAvailabilityRepository } from "./repositories/sqlite/meeting-availability";
import { SqliteMeetingPointsRepository } from "./repositories/sqlite/meeting-points";
import { SqliteMeetingsRepository } from "./repositories/sqlite/meetings";
import { SqliteNotificationsRepository } from "./repositories/sqlite/notifications";
import { SqlitePushRepository } from "./repositories/sqlite/push";
import { SqliteRemindersRepository } from "./repositories/sqlite/reminders";
import { SqliteRsvpsRepository } from "./repositories/sqlite/rsvps";
import { SqliteSettingsRepository } from "./repositories/sqlite/settings";
import { SqliteSessionProposalsRepository } from "./repositories/sqlite/session-proposals";
import { SqliteSessionsRepository } from "./repositories/sqlite/sessions";
import { SqliteVotesRepository } from "./repositories/sqlite/votes";
import type {
  AuthCodesRepository,
  ChangesRepository,
  CommentsRepository,
  DaysRepository,
  DeliveriesRepository,
  EventsRepository,
  GuestsRepository,
  IdempotencyRepository,
  JobsRepository,
  LocationsRepository,
  LocationUnavailabilityRepository,
  MeetingAvailabilityRepository,
  MeetingPointsRepository,
  MeetingsRepository,
  NotificationsRepository,
  PushRepository,
  RemindersRepository,
  RsvpsRepository,
  SettingsRepository,
  SessionProposalsRepository,
  SessionsRepository,
  SubjectCommentsRepository,
  VotesRepository,
} from "./repositories/interfaces";

export type Repositories = {
  authCodes: AuthCodesRepository;
  changes: ChangesRepository;
  /** Scope-agnostic comment operations (find, edit, like, delete). */
  comments: CommentsRepository;
  proposalComments: SubjectCommentsRepository;
  sessionComments: SubjectCommentsRepository;
  profileComments: SubjectCommentsRepository;
  days: DaysRepository;
  deliveries: DeliveriesRepository;
  events: EventsRepository;
  guests: GuestsRepository;
  idempotency: IdempotencyRepository;
  jobs: JobsRepository;
  locations: LocationsRepository;
  locationUnavailability: LocationUnavailabilityRepository;
  meetingPoints: MeetingPointsRepository;
  meetingAvailability: MeetingAvailabilityRepository;
  meetings: MeetingsRepository;
  notifications: NotificationsRepository;
  push: PushRepository;
  sessions: SessionsRepository;
  reminders: RemindersRepository;
  rsvps: RsvpsRepository;
  settings: SettingsRepository;
  sessionProposals: SessionProposalsRepository;
  votes: VotesRepository;
};

type Connections = {
  writer: Database.Database;
  reader: Database.Database;
  /** For read transactions only, so a plain read never joins one's older view. */
  snapshot: Database.Database;
  snapshotLock: Lock;
  repositories: Repositories;
  writes: Repositories;
  snapshotReads: Repositories;
};

let _connections: Connections | null = null;

function buildRepositories(sqlite: Database.Database): Repositories {
  const db = drizzle(sqlite, { schema });
  return {
    authCodes: new SqliteAuthCodesRepository(db),
    changes: new SqliteChangesRepository(db),
    comments: new SqliteCommentsRepository(db),
    proposalComments: sqliteSubjectCommentsRepository(db, "proposal"),
    sessionComments: sqliteSubjectCommentsRepository(db, "session"),
    profileComments: sqliteSubjectCommentsRepository(db, "profile"),
    days: new SqliteDaysRepository(db),
    deliveries: new SqliteDeliveriesRepository(db),
    events: new SqliteEventsRepository(db),
    guests: new SqliteGuestsRepository(db),
    idempotency: new SqliteIdempotencyRepository(db),
    jobs: new SqliteJobsRepository(db),
    locations: new SqliteLocationsRepository(db),
    locationUnavailability: new SqliteLocationUnavailabilityRepository(db),
    meetingPoints: new SqliteMeetingPointsRepository(db),
    meetingAvailability: new SqliteMeetingAvailabilityRepository(db),
    meetings: new SqliteMeetingsRepository(db),
    notifications: new SqliteNotificationsRepository(db),
    push: new SqlitePushRepository(db),
    sessions: new SqliteSessionsRepository(db),
    reminders: new SqliteRemindersRepository(db),
    rsvps: new SqliteRsvpsRepository(db),
    settings: new SqliteSettingsRepository(db),
    sessionProposals: new SqliteSessionProposalsRepository(db),
    votes: new SqliteVotesRepository(db),
  };
}

const READ_METHOD = /^(find(?!OrCreate)|list|search|count|get)/;

type AnyMethod = (...args: unknown[]) => unknown;

function methodNames(repository: object): string[] {
  const names = new Set<string>();
  for (
    let o: object | null = repository;
    o && o !== Object.prototype;
    o = Object.getPrototypeOf(o) as object | null
  ) {
    for (const name of Object.getOwnPropertyNames(o)) {
      if (name !== "constructor") names.add(name);
    }
  }
  return [...names].filter(
    (name) => typeof Reflect.get(repository, name) === "function"
  );
}

// Reads see only committed rows; every other call takes the write lock, so it
// never joins a transaction that someone else holds open on the writer.
function route<R extends object>(reads: R, writes: R): R {
  return Object.fromEntries(
    methodNames(writes).map((name) => {
      if (READ_METHOD.test(name)) {
        const read = Reflect.get(reads, name) as AnyMethod;
        return [name, read.bind(reads)];
      }
      const write = (Reflect.get(writes, name) as AnyMethod).bind(writes);
      return [
        name,
        (...args: unknown[]) => withWriteLock(() => write(...args)),
      ];
    })
  ) as R;
}

function routeAll(reads: Repositories, writes: Repositories): Repositories {
  return Object.fromEntries(
    Object.entries(writes).map(([name, repository]) => [
      name,
      route(reads[name as keyof Repositories], repository),
    ])
  ) as Repositories;
}

function open(
  file: string,
  { migrate, durable }: { migrate: boolean; durable: boolean }
): Connections {
  const writer = new Database(file);
  const readers: Database.Database[] = [];
  try {
    // Enforce foreign keys on every connection. better-sqlite3 happens to
    // compile SQLite with SQLITE_DEFAULT_FOREIGN_KEYS=1, but set it explicitly
    // so our ON DELETE CASCADE / SET NULL behaviour never depends on that
    // build default. runMigrations toggles it off and back on internally.
    writer.pragma("foreign_keys = ON");
    const mode = writer.pragma("journal_mode = WAL", { simple: true });
    if (mode !== "wal") {
      throw new Error(
        `${file}: journal mode is ${String(mode)}, not wal; the read connection needs a database file`
      );
    }
    writer.pragma(`synchronous = ${durable ? "NORMAL" : "OFF"}`);
    if (migrate) runMigrations(writer, path.join(process.cwd(), "drizzle"));
    const reader = new Database(file, { readonly: true });
    readers.push(reader);
    const snapshot = new Database(file, { readonly: true });
    readers.push(snapshot);
    const writes = buildRepositories(writer);
    return {
      writer,
      reader,
      snapshot,
      snapshotLock: createLock(),
      repositories: routeAll(buildRepositories(reader), writes),
      writes,
      snapshotReads: buildRepositories(snapshot),
    };
  } catch (e) {
    for (const reader of readers) reader.close();
    writer.close();
    throw e;
  }
}

function connections(): Connections {
  _connections ??= open(resolveDbPath(), { migrate: true, durable: true });
  return _connections;
}

export function getRepositories(): Repositories {
  return connections().repositories;
}

/**
 * Runs `fn` with the write connection while holding the write lock, so no
 * repository write runs until `fn` settles.
 */
export function withWriter<T>(
  fn: (writer: Database.Database) => T | Promise<T>
): Promise<T> {
  return withWriteLock(() => fn(connections().writer));
}

/**
 * Runs `work` in one transaction on the write connection, holding the write
 * lock until `afterCommit` has run. A throw rolls the transaction back.
 */
export function writeTransaction<T>(
  work: (repositories: Repositories) => Promise<T>,
  afterCommit: () => void
): Promise<T> {
  return withWriteLock(async () => {
    const { writer, writes } = connections();
    // Immediate: a deferred transaction that reads first cannot wait for
    // another process's write, and fails with SQLITE_BUSY instead.
    writer.exec("BEGIN IMMEDIATE");
    let value: T;
    try {
      value = await work(writes);
      writer.exec("COMMIT");
    } catch (e) {
      if (writer.inTransaction) writer.exec("ROLLBACK");
      throw e;
    }
    afterCommit();
    return value;
  });
}

/** Runs `work` in one read transaction: every read sees the same commit. */
export function readTransaction<T>(
  work: (repositories: Repositories) => Promise<T>
): Promise<T> {
  const { snapshot, snapshotLock, snapshotReads } = connections();
  return snapshotLock(async () => {
    snapshot.exec("BEGIN");
    try {
      return await work(snapshotReads);
    } finally {
      if (snapshot.inTransaction) snapshot.exec("COMMIT");
    }
  });
}

export function resetRepositories(): void {
  _connections?.snapshot.close();
  _connections?.reader.close();
  _connections?.writer.close();
  _connections = null;
}

// For tests: reopens on a copy of the closed, migrated `template`, without the
// fsyncs a disposable copy does not need (they made each reset ~40 ms slower).
export function restoreDb(template: string): void {
  resetRepositories();
  const file = resolveDbPath();
  for (const suffix of ["-wal", "-shm"]) {
    fs.rmSync(file + suffix, { force: true });
  }
  fs.copyFileSync(template, file);
  _connections = open(file, { migrate: false, durable: false });
}
