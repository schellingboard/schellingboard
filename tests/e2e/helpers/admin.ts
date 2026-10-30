import { Page, expect } from "@playwright/test";
import { login } from "./auth";

// The seeded site admin (scripts/seed/data/guests.ts).
const ADMIN_USERNAME = "site-admin";
const ADMIN_PASSWORD = "seed-password";

/** Enters the site password on the page /admin sent a new visitor to. */
export async function enterSitePassword(page: Page) {
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await login(page);
}

/**
 * Opens /admin as the seeded site admin, signing in on the way, past the site
 * password if the browser has not entered it yet. Ends on the events list.
 */
export async function adminLogin(page: Page) {
  await page.goto("/admin");
  const identifier = page.getByLabel("Email or username");
  const sitePassword = page.getByLabel("Password", { exact: true });
  const events = page.getByRole("heading", { name: "Events" });
  await expect(identifier.or(sitePassword).or(events)).toBeVisible();
  if (await sitePassword.isVisible()) await login(page);

  await expect(identifier.or(events)).toBeVisible();
  if (await identifier.isVisible()) {
    const submit = page.getByRole("button", { name: "Log in" });
    // Filled twice: a value typed before hydration shows in the field but not
    // in the form's state, and filling it again unchanged sends no event.
    await expect(async () => {
      await identifier.fill("");
      await identifier.fill(ADMIN_USERNAME);
      const password = page.getByLabel("Password or emailed code");
      await password.fill("");
      await password.fill(ADMIN_PASSWORD);
      await expect(submit).toBeEnabled({ timeout: 2000 });
    }).toPass();
    await submit.click();
  }
  await expect(page).toHaveURL(/\/admin\/events$/);
  await expect(events).toBeVisible();
}
