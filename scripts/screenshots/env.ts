import { expect, type Browser, BrowserContext, Page } from "@playwright/test";

import { login } from "../../tests/e2e/helpers/auth";
import { selectUser } from "../../tests/e2e/helpers/user";

export const SITE_PASSWORD = "screenshots";
export const ADMIN_PASSWORD = "admin-screenshots";
export const ATTENDEE = "Hana Kobayashi";

export type Env = { baseURL: string; browser: Browser; tmp: string };

export type Viewport = "desktop" | "mobile";

// "Laptop with touch" and "Galaxy Note 9" from Firefox's Responsive Design
// Mode. The mobile scale factor makes a capture 900px wide, the size the
// gallery needs, so no resize step is left.
const VIEWPORTS = {
  desktop: { viewport: { width: 1280, height: 950 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 360, height: 736 }, deviceScaleFactor: 2.5 },
};

/** A fresh visitor, signed in to the site and — unless `anonymous` — as the screenshot attendee. */
export async function openSite(
  env: Env,
  kind: Viewport = "desktop",
  opts: { anonymous?: boolean; timezoneId?: string } = {}
): Promise<{ page: Page; context: BrowserContext }> {
  const context = await env.browser.newContext({
    ...VIEWPORTS[kind],
    hasTouch: true,
    baseURL: env.baseURL,
    colorScheme: "light",
    timezoneId: opts.timezoneId,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);
  await page.goto("/");
  await login(page, SITE_PASSWORD);
  if (!opts.anonymous) await selectUser(page, ATTENDEE);
  await setTheme(page, "Light");
  return { page, context };
}

/** Writes the viewport to `png`, without the Next.js dev indicator. */
export async function capture(page: Page, png: string) {
  await page.screenshot({
    path: png,
    style: "nextjs-portal { display: none !important }",
  });
}

/** The footer's switch; the choice is a cookie, so it holds for the whole visit. */
export async function setTheme(page: Page, theme: "Light" | "Dark") {
  const button = page.getByRole("button", { name: theme, exact: true });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
}
