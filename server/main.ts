import { serve } from "@hono/node-server";
import { warnAboutAdminPassword } from "@/server/admin-password-notice";
import { logBootstrapLink } from "@/server/bootstrap-link";
import { withForwardedProto } from "@/server/http/forwarded";
import { web } from "@/server/http/web";
import { startJobsLoop, stopJobsLoop } from "@/utils/jobs/loop";
import { initMailer } from "@/utils/mailer";

warnAboutAdminPassword();
initMailer();
// After the mailer: a pass that ran first would find it uninitialised.
startJobsLoop();
logBootstrapLink().catch((err) =>
  console.error("[bootstrap] Could not create the admin link:", err)
);

const port = Number(process.env.PORT ?? 3000);
const server = serve(
  { fetch: (req) => web.fetch(withForwardedProto(req)), port },
  () => console.log(`Listening on port ${port}`)
);

for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    stopJobsLoop();
    setTimeout(() => process.exit(0), 10_000).unref();
    server.close(() => process.exit(0));
  });
