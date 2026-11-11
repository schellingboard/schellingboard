import { test, expect } from "./helpers/fixtures";
import { login } from "./helpers/auth";

// The theme is per device rather than per attendee, so it lives in a cookie
// and shows up as a class on <html> — the contract `styles/tokens.css` and the
// `dark` variant are written against (see docs/dev/adr/0005-dark-mode.md).
// Nothing else about the page is observable from a test: colours are the
// point, and asserting on their hex values would just restate the stylesheet.
const root = (page: import("@playwright/test").Page) => page.locator("html");

test("the footer switches the whole site between light and dark @014-US1", async ({
  page,
}) => {
  await login(page);
  await page.goto("/");

  const system = page.getByRole("button", { name: "System" });
  const dark = page.getByRole("button", { name: "Dark" });
  const light = page.getByRole("button", { name: "Light" });

  // Nothing chosen yet: the site follows the operating system, which is
  // expressed as no class at all rather than as a guess made in JavaScript.
  await expect(system).toHaveAttribute("aria-pressed", "true");
  await expect(root(page)).not.toHaveClass(/\b(light|dark)\b/);

  await dark.click();
  await expect(root(page)).toHaveClass(/\bdark\b/);
  await expect(dark).toHaveAttribute("aria-pressed", "true");
  await expect(system).toHaveAttribute("aria-pressed", "false");

  // The choice has to survive the next server render, not just this one.
  await page.reload();
  await expect(root(page)).toHaveClass(/\bdark\b/);
  await expect(page.getByRole("button", { name: "Dark" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  await light.click();
  await expect(root(page)).toHaveClass(/\blight\b/);
  await expect(root(page)).not.toHaveClass(/\bdark\b/);
});

test("the switch is on the password gate, before anyone has logged in @014-US1", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Dark" }).click();
  await expect(root(page)).toHaveClass(/\bdark\b/);
  // The class is only half of it: scrollbars, autofill and native controls
  // follow `color-scheme`, which tokens.css derives from the same class
  // rather than the layout setting it a second time.
  await expect(root(page)).toHaveCSS("color-scheme", "dark");
  // The window chrome around an installed app reads the theme-color tag,
  // which has to follow the switch too.
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#16181d"
  );

  await login(page);
  await expect(root(page)).toHaveClass(/\bdark\b/);
});

test("appearance can also be set from the settings page @014-US1", async ({
  page,
}) => {
  await login(page);
  // Reachable without picking a name first: the setting is about the device,
  // and the rest of the settings page is not.
  await page.goto("/settings");

  await page
    .getByRole("region", { name: "Appearance (this device)" })
    .getByRole("button", { name: "Dark" })
    .click();
  await expect(root(page)).toHaveClass(/\bdark\b/);
});

test("times follow the chosen 12-hour or 24-hour format @014-US7", async ({
  page,
}) => {
  await login(page);
  await page.goto("/settings");

  const format = page.getByRole("group", { name: "Time format" });
  await expect(
    format.getByRole("button", { name: "Automatic" })
  ).toHaveAttribute("aria-pressed", "true");
  await format.getByRole("button", { name: "12-hour" }).click();

  await page.goto("/");
  await page.getByRole("link", { name: "Conference Gamma" }).first().click();
  await expect(page.getByText("9 am", { exact: true }).first()).toBeVisible();

  await page.goto("/settings");
  await page
    .getByRole("group", { name: "Time format" })
    .getByRole("button", { name: "24-hour" })
    .click();
  await page.goto("/");
  await page.getByRole("link", { name: "Conference Gamma" }).first().click();
  await expect(page.getByText("09:00", { exact: true }).first()).toBeVisible();
});
