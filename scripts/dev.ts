// Developers open the Vite port (PORT, default 3000): it serves the SPA with
// HMR and proxies everything Next owns to a Next dev server one port higher.
import { spawn } from "child_process";

const port = Number(process.env.PORT ?? 3000);
const nextPort = port + 1;

const children = [
  spawn("bun", ["x", "next", "dev", "-p", String(nextPort)], {
    stdio: "inherit",
  }),
  spawn("bun", ["x", "vite", "apps/web"], {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: String(port),
      NEXT_ORIGIN: `http://localhost:${nextPort}`,
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
