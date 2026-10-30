import { peopleUseCases } from "@/server/composition";
import { siteUrl } from "@/utils/site-url";

const linkOf = (token: string) =>
  `${siteUrl() ?? ""}/auth/bootstrap?token=${encodeURIComponent(token)}`;

/**
 * Logs a link at start while the site has no admin. SB_BOOTSTRAP_LINK=1 logs
 * one anyway, for a site whose admins can no longer sign in.
 */
export async function logBootstrapLink(): Promise<void> {
  const issued = await peopleUseCases().announceBootstrap(
    process.env.SB_BOOTSTRAP_LINK === "1"
  );
  if (!issued) return;
  const where = siteUrl() ? "" : " (put your site's address in front of it)";
  console.log(
    `[bootstrap] Open this link within 24 hours to become a site admin${where}: ${linkOf(issued.token)}`
  );
}

/** For the dev script: always a new link, even when admins exist. */
export async function newBootstrapLink(): Promise<string> {
  return linkOf((await peopleUseCases().issueBootstrapToken()).token);
}
