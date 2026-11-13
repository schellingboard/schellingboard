import { login } from "./helpers/auth";
import { expect, test } from "./helpers/fixtures";
import { selectUser } from "./helpers/user";

// Chiara Bianchi is used by no other spec, so her language can change without
// racing parallel test files.
test("an attendee switches the app to German and back @022-US1", async ({
  page,
}) => {
  await login(page);
  await page.goto("/Conference-Alpha/proposals");
  await selectUser(page, /Chiara Bianchi/i);
  await page.getByRole("button", { name: /your name/i }).click();
  await page.getByRole("menuitem", { name: /settings/i }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  try {
    await page.getByRole("combobox", { name: "Language" }).selectOption("de");
    await expect(
      page.getByRole("heading", { name: "Einstellungen" })
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "de");

    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Einstellungen" })
    ).toBeVisible();

    await page.getByRole("combobox", { name: "Sprache" }).selectOption("");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  } finally {
    // A failed run must not leave her in German for the next one.
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption("");
  }
});
