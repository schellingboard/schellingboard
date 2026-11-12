// Background load against a throwaway seeded server; see docs/dev/testing.md.

import { execFileSync, spawn, type ChildProcess } from "child_process";
import fs from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";

import Database from "better-sqlite3";

import {
  generateSessionToken,
  hashSessionToken,
} from "../../utils/login-session-token";
import { Attendee, PAGE_LOAD, type Site, type SnapshotJson } from "./attendee";
import { parseOptions, type Options } from "./options";
import { Recorder } from "./stats";

const repoRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const SITE_PASSWORD = "load-test";
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
// Attendees arrive at about 20 a second, as when an event opens, not all at once.
const ARRIVAL_MS = 50;

// Baseline at 200 attendees: steady p99 about 250 ms, page load p99 about 4 s.
// These leave headroom for a slower machine; `--check` fails above them.
const THRESHOLDS = {
  steady: { p95Ms: 500, p99Ms: 1500 },
  pageLoad: { p95Ms: 6000, p99Ms: 10_000 },
};

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const { port } = server.address() as net.AddressInfo;
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });
}

async function waitFor(url: string, server: ChildProcess) {
  for (let i = 0; i < 240; i++) {
    if (server.exitCode !== null) throw new Error("The server exited early.");
    try {
      if ((await fetch(url, { redirect: "manual" })).status < 500) return;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`${url} did not come up.`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function openSessions(dbPath: string, count: number) {
  const db = new Database(dbPath);
  try {
    const guests = db
      .prepare("SELECT id FROM guests WHERE email LIKE '%@example.net' LIMIT ?")
      .all(count) as { id: string }[];
    if (guests.length < count)
      throw new Error(`The seed has only ${guests.length} bulk guests.`);
    const insert = db.prepare(
      `INSERT INTO login_sessions
         (id, guest_id, assurance, created_at, expires_at, last_seen_at, via)
       VALUES (?, ?, 'verified', ?, ?, ?, 'password')`
    );
    const now = new Date();
    const expires = new Date(now.getTime() + SESSION_LIFETIME_MS).toISOString();
    return guests.map(({ id }) => {
      const token = generateSessionToken();
      insert.run(
        hashSessionToken(token),
        id,
        now.toISOString(),
        expires,
        now.toISOString()
      );
      return { guestId: id, token };
    });
  } finally {
    db.close();
  }
}

function dbRsvpCounts(dbPath: string) {
  const db = new Database(dbPath, { readonly: true });
  try {
    const rows = db
      .prepare(
        "SELECT session_id AS id, COUNT(*) AS n FROM rsvps GROUP BY session_id"
      )
      .all() as { id: string; n: number }[];
    return Object.fromEntries(rows.map((r) => [r.id, r.n]));
  } finally {
    db.close();
  }
}

function eventSlugs(dbPath: string) {
  const db = new Database(dbPath, { readonly: true });
  try {
    const row = (name: string) =>
      db.prepare("SELECT id, slug FROM events WHERE name = ?").get(name) as {
        id: string;
        slug: string;
      };
    const gamma = row("Conference Gamma");
    const beta = row("Conference Beta");
    return {
      gamma: { slug: gamma.slug, eventId: gamma.id },
      beta: { slug: beta.slug, eventId: beta.id },
    };
  } finally {
    db.close();
  }
}

async function assetPaths(base: string, cookie: string) {
  const html = await (await fetch(base + "/", { headers: { cookie } })).text();
  return [...html.matchAll(/(?:src|href)="(\/_spa\/[^"]+)"/g)].map((m) => m[1]);
}

function consistencyProblems(
  baseline: Record<string, number>,
  final: Record<string, number>,
  inDb: Record<string, number>,
  attendees: Attendee[]
) {
  const delta = new Map<string, number>();
  const unsure = new Set(attendees.flatMap((a) => [...a.unsure]));
  for (const a of attendees) {
    for (const id of a.initialRsvps) delta.set(id, (delta.get(id) ?? 0) - 1);
    for (const id of a.rsvps) delta.set(id, (delta.get(id) ?? 0) + 1);
  }
  const problems: string[] = [];
  const ids = new Set([
    ...Object.keys(baseline),
    ...Object.keys(final),
    ...delta.keys(),
  ]);
  for (const id of ids) {
    if (unsure.has(id)) continue;
    const expected = (baseline[id] ?? 0) + (delta.get(id) ?? 0);
    if ((final[id] ?? 0) !== expected)
      problems.push(
        `session ${id}: snapshot ${final[id] ?? 0}, confirmed ${expected}`
      );
    if ((inDb[id] ?? 0) !== (final[id] ?? 0))
      problems.push(
        `session ${id}: database ${inDb[id] ?? 0}, snapshot ${final[id] ?? 0}`
      );
  }
  return problems;
}

async function run(options: Options) {
  const work = path.join(repoRoot, "load-tmp");
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });
  const port = await freePort();
  const base = `http://localhost:${port}`;
  const dbPath = path.join(work, "load.db");
  // No SMTP or VAPID keys: mail and push deliveries are skipped, not sent.
  const env = {
    ...process.env,
    SMTP_URL: "",
    SMTP_HOST: "",
    DATABASE_URL: `file:${dbPath}`,
    SB_UPLOADS_DIR: path.join(work, "uploads") + "/",
    SITE_URL: base,
    SITE_PASSWORD,
    AUTH_SECRET: "load-test-only-not-a-secret-0123456789",
    REMINDER_DISPATCH_INTERVAL_MS: "0",
    SEED_PROFILE: "large",
    SEED_BULK_GUESTS: String(Math.max(360, options.users)),
    SB_TRUSTED_PROXIES: "0",
    APP_VERSION: "load-test",
  };
  const sh = (
    cmd: string,
    args: string[],
    extra: Record<string, string> = {}
  ) =>
    execFileSync(cmd, args, {
      cwd: repoRoot,
      env: { ...env, ...extra },
      stdio: "inherit",
    });

  let server: ChildProcess | undefined;
  const cleanUp = () => {
    if (server?.pid) {
      try {
        process.kill(-server.pid, "SIGTERM");
      } catch {
        // already gone
      }
    }
    fs.rmSync(work, { recursive: true, force: true });
  };
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.on(signal, () => {
      cleanUp();
      process.exit(130);
    });

  try {
    sh("bun", ["x", "tsx", "scripts/run-migrations.ts"]);
    sh("bun", ["x", "tsx", "scripts/seed/seed-database.ts"]);
    if (
      options.build ||
      !fs.existsSync(path.join(repoRoot, "dist/server/main.mjs"))
    ) {
      sh("bun", ["x", "vite", "build", "apps/web"], { NODE_ENV: "production" });
      sh("bun", ["scripts/build-server.ts"]);
    }
    server = spawn("node", ["dist/server/main.mjs"], {
      cwd: repoRoot,
      detached: true,
      env: { ...env, PORT: String(port) },
      stdio: ["ignore", "ignore", "pipe"],
    });
    // Every comment would otherwise print that mail is off.
    server.stderr?.on("data", (chunk: Buffer) => {
      for (const line of chunk.toString().split("\n"))
        if (line && !line.includes("SMTP is not configured"))
          console.error(`server: ${line}`);
    });
    await waitFor(`${base}/login`, server);

    const login = await fetch(`${base}/api/v1/auth/site`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: SITE_PASSWORD }),
    });
    const siteCookie = /site-auth=([^;]+)/.exec(
      login.headers.get("set-cookie") ?? ""
    )?.[1];
    if (!siteCookie) throw new Error("Could not enter the site.");

    const events = eventSlugs(dbPath);
    const sessions = openSessions(dbPath, options.users);
    const assets = await assetPaths(base, `site-auth=${siteCookie}`);
    const baselineRes = await fetch(
      `${base}/api/v1/events/${events.gamma.slug}/snapshot`,
      {
        headers: { cookie: `site-auth=${siteCookie}` },
      }
    );
    const baseline = ((await baselineRes.json()) as SnapshotJson).counts;

    const rec = new Recorder();
    let stopped = false;
    let stop!: () => void;
    const stopping = new Promise<void>((resolve) => (stop = resolve));
    const site: Site = {
      base,
      siteCookie,
      ...events,
      rec,
      rand: Math.random,
      stopped: () => stopped,
      stopping,
    };
    const attendees = sessions.map(
      (s) => new Attendee(site, s.guestId, s.token)
    );
    console.log(
      `${options.users} attendees for ${options.durationMs / 1000}s at ${base}`
    );
    console.log(`Site password: ${SITE_PASSWORD}`);

    const started = performance.now();
    const ramp = Math.min(options.users * ARRIVAL_MS, options.durationMs / 4);
    const loops = attendees.map(async (attendee, i) => {
      await sleep((i / attendees.length) * ramp);
      if (stopped) return;
      await attendee.open(assets);
      await attendee.run();
    });
    await sleep(options.durationMs);
    stopped = true;
    stop();
    attendees.forEach((a) => a.close());
    await Promise.all(loops);
    const elapsed = (performance.now() - started) / 1000;

    const finalRes = await fetch(
      `${base}/api/v1/events/${events.gamma.slug}/snapshot`,
      {
        headers: { cookie: `site-auth=${siteCookie}` },
      }
    );
    const final = ((await finalRes.json()) as SnapshotJson).counts;
    const summary = rec.summary();

    console.log(
      "\nendpoint".padEnd(46) + "count  errors  4xx   p50    p95    p99 (ms)"
    );
    for (const [name, s] of Object.entries(summary))
      console.log(
        `${name.padEnd(45)} ${String(s.count).padStart(5)} ${String(s.errors).padStart(7)} ${String(s.rejected).padStart(5)} ${s.p50.toFixed(0).padStart(5)} ${s.p95.toFixed(0).padStart(6)} ${s.p99.toFixed(0).padStart(6)}`
      );
    const identityCalls = summary[`GET /me/identity${PAGE_LOAD}`]?.count ?? 0;
    console.log(
      `\n${identityCalls} identity requests for ${options.users} page loads.`
    );

    const failures: string[] = [];
    if (rec.countWhere((s) => s === 0 || s >= 500))
      failures.push("Some requests failed (5xx or no answer).");
    if (options.check) {
      if (rec.countWhere((s) => s === 429))
        failures.push("Some requests were rate limited (429).");
      for (const [name, s] of Object.entries(summary)) {
        const limit =
          name.includes(PAGE_LOAD) || name.includes("(connect)")
            ? THRESHOLDS.pageLoad
            : THRESHOLDS.steady;
        if (s.p95 > limit.p95Ms)
          failures.push(`${name}: p95 ${s.p95.toFixed(0)} ms`);
        if (s.p99 > limit.p99Ms)
          failures.push(`${name}: p99 ${s.p99.toFixed(0)} ms`);
      }
      failures.push(
        ...consistencyProblems(baseline, final, dbRsvpCounts(dbPath), attendees)
      );
    }
    if (options.report)
      fs.writeFileSync(
        options.report,
        JSON.stringify(
          {
            users: options.users,
            seconds: elapsed,
            endpoints: summary,
            failures,
          },
          null,
          2
        )
      );
    for (const f of failures) console.error(`FAIL ${f}`);
    return failures.length ? 1 : 0;
  } finally {
    cleanUp();
  }
}

run(parseOptions(process.argv.slice(2))).then(
  (code) => process.exit(code),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
