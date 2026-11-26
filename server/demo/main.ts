import { serve } from "@hono/node-server";

import { withForwardedProto } from "@/server/http/forwarded";
import { web } from "@/server/http/web";
import { startJobsLoop, stopJobsLoop } from "@/utils/jobs/loop";
import { initMailer } from "@/utils/mailer";

import { assertResetAt, nextReset, prepareDemoDatabase } from "./boot";

const resetAt = process.env.SB_DEMO_RESET_AT ?? "03:00";
assertResetAt(resetAt);

const outcome = await prepareDemoDatabase({
  now: new Date(),
  resetAt,
  version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
  profile: "large",
});
console.log(`[demo] database ${outcome}`);

initMailer();
startJobsLoop();

const port = Number(process.env.PORT ?? 3000);
const server = serve(
  { fetch: (req) => web.fetch(withForwardedProto(req)), port },
  () => console.log(`Listening on port ${port}`)
);

// The platform restarts the process, and boot reseeds: in-memory feed and
// rate-limit state cannot go stale that way.
const untilReset = nextReset(new Date(), resetAt).getTime() - Date.now();
setTimeout(() => {
  console.log("[demo] scheduled reset: exiting");
  stopJobsLoop();
  server.close();
  process.exit(0);
}, untilReset).unref();

for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    stopJobsLoop();
    setTimeout(() => process.exit(0), 10_000).unref();
    server.close(() => process.exit(0));
  });
