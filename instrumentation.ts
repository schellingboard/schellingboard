import { initMailer } from "@/utils/mailer";
import { startJobsLoop } from "@/utils/jobs/loop";

export function register() {
  // If we run this app in an edge runtime[1] in future, it won't support email.
  // So don't init in that case.
  // [1]: https://nextjs.org/docs/app/api-reference/edge
  if (process.env.NEXT_RUNTIME === "nodejs") {
    initMailer();
    // After the mailer: a pass that ran first would find it uninitialised.
    startJobsLoop();
    // Imported here so the Edge bundle, which drops this branch, never sees the database.
    void import("@/server/bootstrap-link")
      .then(({ logBootstrapLink }) => logBootstrapLink())
      .catch((err) =>
        console.error("[bootstrap] Could not create the admin link:", err)
      );
  }
}
