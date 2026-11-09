// Developers open the Vite port (PORT, default 3000): it serves the SPA with
// HMR and proxies everything the server owns to the Node server one port
// higher, which restarts when the bundle is rebuilt.
import { spawn, spawnSync } from "child_process";
import {
  guestConfigs,
  SEED_PROTECTED_PASSWORD,
  SCREENSHOT_GUEST,
  SEED_SITE_ADMIN,
} from "./seed/data/guests";

const port = Number(process.env.PORT ?? 3000);
const apiPort = port + 1;
const app = `http://localhost:${port}`;

function credentials() {
  const env = process.env;
  const guest = guestConfigs.find((g) => g.name === SCREENSHOT_GUEST);
  const protectedGuest = guestConfigs.find((g) => g.password);
  const lines: [string, string | false | undefined][] = [
    ["App", `${app}  (open this one; ${apiPort} is the API server behind it)`],
    ["Site password", env.SITE_PASSWORD],
    [
      "Site admin",
      `${SEED_SITE_ADMIN.username} / ${SEED_PROTECTED_PASSWORD}  ${app}/admin`,
    ],
    [
      "Guest",
      guest &&
        `${guest.name} ${guest.password ? `/ ${guest.password}` : "(no password)"}`,
    ],
    [
      "Protected guest",
      protectedGuest && `${protectedGuest.name} / ${protectedGuest.password}`,
    ],
    [
      "Mailpit",
      env.SMTP_URL &&
        `http://localhost:${env.MAILPIT_UI_PORT ?? 8025}  (sign-in codes; needs "make mailpit" running)`,
    ],
    [
      "Dev toolbar",
      ["1", "true"].includes(env.SB_ENABLE_DEV_TOOLS ?? "") && `${app}/?dev=1`,
    ],
  ];
  const shown = lines.filter((line): line is [string, string] => !!line[1]);
  const width = Math.max(...shown.map(([label]) => label.length));
  return [
    "",
    "  Test credentials (accounts exist after `make dev-db-seed`):",
    ...shown.map(([label, value]) => `    ${label.padEnd(width)}  ${value}`),
    "",
  ].join("\n");
}

const build = spawnSync("bun", ["scripts/build-server.ts"], {
  stdio: "inherit",
});
if (build.status !== 0) process.exit(build.status ?? 1);

const color = process.stdout.isTTY ? { FORCE_COLOR: "1" } : {};

// Without --watch-preserve-output, the server's restart at startup clears the
// terminal, taking Vite's URL and the credentials with it.
const server = spawn(
  "node",
  ["--watch", "--watch-preserve-output", "dist/server/main.mjs"],
  {
    stdio: ["inherit", "pipe", "inherit"],
    env: { ...process.env, ...color, PORT: String(apiPort) },
  }
);
const vite = spawn("bun", ["x", "vite", "apps/web"], {
  stdio: ["inherit", "pipe", "inherit"],
  env: {
    ...process.env,
    ...color,
    PORT: String(port),
    API_ORIGIN: `http://localhost:${apiPort}`,
  },
});
const children = [
  spawn("bun", ["scripts/build-server.ts", "--watch"], { stdio: "inherit" }),
  server,
  vite,
];

const plain = (chunk: Buffer) =>
  chunk.toString().replace(/\x1b\[[0-9;]*m/g, "");

const ready = { server: false, vite: false, announced: false };
let settle: ReturnType<typeof setTimeout> | undefined;
function announceOnceSettled() {
  if (ready.announced || !ready.server || !ready.vite) return;
  clearTimeout(settle);
  settle = setTimeout(() => {
    ready.announced = true;
    console.log(credentials());
  }, 1000);
}
server.stdout.on("data", (chunk: Buffer) => {
  process.stdout.write(chunk);
  if (plain(chunk).includes("Listening on port")) ready.server = true;
  announceOnceSettled();
});
vite.stdout.on("data", (chunk: Buffer) => {
  process.stdout.write(chunk);
  if (plain(chunk).includes("Local:")) ready.vite = true;
  announceOnceSettled();
});

const stop = () => children.forEach((c) => c.kill());
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
for (const child of children) {
  child.on("exit", (code) => {
    stop();
    process.exit(code ?? 0);
  });
}
