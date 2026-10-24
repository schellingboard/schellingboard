import type { Page } from "@playwright/test";
import { test, expect } from "./helpers/fixtures";
import { login } from "./helpers/auth";

// The server asks GitHub for the latest release, which a test run cannot rely
// on, so the answer an admin would get is supplied.
async function adminIsBehind(page: Page) {
  await page.route("**/api/v1/updates", (route) =>
    route.fulfill({
      json: {
        current: { version: "v4.0.0", date: "2026-10-04" },
        latest: { version: "v9.9.9", date: "2030-01-02" },
        updateAvailable: true,
      },
    })
  );
}

for (const [where, path] of [
  ["the schedule", "/Conference-Gamma"],
  ["the other pages", "/"],
] as const) {
  test(`an outdated site is flagged in the footer of ${where} @014-US6`, async ({
    page,
  }) => {
    await adminIsBehind(page);
    await login(page);
    await page.goto(path);
    if (where === "the schedule")
      await expect(
        page.getByRole("link", { name: /Opening Keynote/ })
      ).toBeVisible();

    await page.getByRole("button", { name: /update available/ }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("v9.9.9, 2 January 2030");
    await expect(
      dialog.getByRole("link", { name: "How to update" })
    ).toHaveAttribute(
      "href",
      "https://docs.schellingboard.org/self-hosting/deployment/#updating"
    );
  });
}

test("a site that is up to date shows no flag @014-US6", async ({ page }) => {
  await login(page);
  await page.goto("/Conference-Gamma");

  await expect(page.getByRole("button", { name: /what's new/i })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /update available/ })
  ).toHaveCount(0);
});
