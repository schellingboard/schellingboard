// Developers open the Vite port (PORT, default 3000): it serves the SPA with
// HMR and proxies everything the server owns to the Node server one port
// higher, which restarts when the bundle is rebuilt.
import { spawn, spawnSync } from "child_process";

const port = Number(process.env.PORT ?? 3000);
const apiPort = port + 1;

const build = spawnSync("bun", ["scripts/build-server.ts"], {
  stdio: "inherit",
});
if (build.status !== 0) process.exit(build.status ?? 1);

const children = [
  spawn("bun", ["scripts/build-server.ts", "--watch"], { stdio: "inherit" }),
  spawn("node", ["--watch", "dist/server/main.mjs"], {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: String(apiPort),
    },
  }),
  spawn("bun", ["x", "vite", "apps/web"], {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: String(port),
      API_ORIGIN: `http://localhost:${apiPort}`,
    },
  }),
];

const stop = () => children.forEach((c) => c.kill());
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
for (const child of children) {
  child.on("exit", (code) => {
    stop();
    process.exit(code ?? 0);
  });
}
