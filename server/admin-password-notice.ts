export function warnAboutAdminPassword(
  env: Record<string, string | undefined> = process.env,
  log: (message: string) => void = console.warn
): void {
  if (!env.ADMIN_PASSWORD) return;
  log(
    "[admin] ADMIN_PASSWORD no longer does anything. Sign in as a site admin instead; " +
      "set SB_BOOTSTRAP_LINK=1 for one start to get a link that makes one. " +
      "Remove ADMIN_PASSWORD from the environment."
  );
}
