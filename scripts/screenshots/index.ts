// Recaptures docs/screenshots/*.webp against a throwaway large-profile
// database and server, so nothing here touches `make dev`'s data.
//
//   make screenshots                      # all of them
//   make screenshots ARGS="schedule-grid" # only the named ones
//   make screenshots ARGS="--serve"       # just run the seeded server
//
// What each shot shows is in docs/screenshots/README.md; how it is reached is
// in shots.ts.

import { execFileSync, spawn, type ChildProcess } from "child_process";
import fs from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";

import { firefox, type Browser } from "@playwright/test";
import sharp from "sharp";

import { shots, type Shot } from "./shots";
import { ADMIN_PASSWORD, SITE_PASSWORD, type Env } from "./env";

const repoRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const outDir = path.join(repoRoot, "docs/screenshots");

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

/** WebP, not PNG: see docs/screenshots/README.md. */
async function toWebp(png: string, name: string) {
  await sharp(png)
    .webp({ quality: 80 })
    .toFile(path.join(outDir, `${name}.webp`));
}

function newestChangelogVersion(): string {
  const changelog = fs.readFileSync(
    path.join(repoRoot, "CHANGELOG.md"),
    "utf8"
  );
  const match = /^## \[(\d+\.\d+\.\d+)\]/m.exec(changelog);
  if (!match) throw new Error("No released version in CHANGELOG.md");
  return `v${match[1]}`;
}

async function main() {
  const args = process.argv.slice(2);
  const serveOnly = args.includes("--serve");
  const names = args.filter((a) => !a.startsWith("--"));
  const unknown = names.filter((n) => !shots.some((s) => s.name === n));
  if (unknown.length) throw new Error(`Unknown shot(s): ${unknown.join(", ")}`);
  const selected: Shot[] = names.length
    ? shots.filter((s) => names.includes(s.name))
    : shots;

  // Inside the repo: the seed script refuses to clear an uploads directory
  // anywhere else.
  const work = path.join(repoRoot, "screenshots-tmp");
  // A server left running by `--serve`, to try a shot without reseeding.
  const existing = process.env.SCREENSHOTS_URL;
  if (!existing) {
    fs.rmSync(work, { recursive: true, force: true });
  }
  fs.mkdirSync(work, { recursive: true });
  const port = existing ? 0 : await freePort();
  const baseURL = existing ?? `http://localhost:${port}`;
  const serverEnv = {
    ...process.env,
    DATABASE_URL: `file:${path.join(work, "screenshots.db")}`,
    SB_UPLOADS_DIR: path.join(work, "uploads") + "/",
    SITE_URL: baseURL,
    SITE_PASSWORD,
    ADMIN_PASSWORD,
    AUTH_SECRET: "screenshots-only-not-a-secret-0123456789",
    SB_ENABLE_DEV_TOOLS: "1",
    REMINDER_DISPATCH_INTERVAL_MS: "0",
    SEED_PROFILE: "large",
    // The footer shows this; the working tree's own version would say "…-dirty".
    APP_VERSION: process.env.APP_VERSION ?? newestChangelogVersion(),
    NEXT_TELEMETRY_DISABLED: "1",
  };

  const run = (script: string) =>
    execFileSync("bun", ["x", "tsx", script], {
      cwd: repoRoot,
      env: serverEnv,
      stdio: "inherit",
    });

  const spawnServer = () =>
    spawn("bun", ["x", "next", "dev", "-p", String(port)], {
      cwd: repoRoot,
      detached: true,
      env: serverEnv,
      stdio: ["ignore", "ignore", "inherit"],
    });

  let server: ChildProcess | undefined;
  let browser: Browser | undefined;
  // The server runs in its own process group, which a Ctrl+C in the terminal
  // does not reach, so stop it here or it outlives us.
  const cleanUp = () => {
    if (server?.pid) {
      try {
        process.kill(-server.pid, "SIGTERM");
      } catch {
        // already gone
      }
    }
    if (!existing) fs.rmSync(work, { recursive: true, force: true });
  };
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      cleanUp();
      process.exit(130);
    });
  }
  try {
    if (!existing) {
      run("scripts/run-migrations.ts");
      run("scripts/seed/seed-database.ts");
      server = spawnServer();
      await waitFor(`${baseURL}/login`, server);
    }
    console.log(`Server ready at ${baseURL} (site password: ${SITE_PASSWORD})`);

    if (serveOnly) {
      await new Promise(() => {});
    }

    browser = await firefox.launch();
    const env: Env = { baseURL, browser, tmp: work };
    for (const shot of selected) {
      process.stdout.write(`${shot.name} … `);
      const png = path.join(work, `${shot.name}.png`);
      await shot.take(env, png);
      await toWebp(png, shot.name);
      console.log("ok");
    }
    if (selected.some((s) => s.name === "schedule-grid")) {
      await sharp(path.join(outDir, "schedule-grid.webp"))
        .jpeg({ quality: 85 })
        .toFile(path.join(repoRoot, "www/og-image.jpg"));
    }
  } finally {
    await browser?.close();
    cleanUp();
  }
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
