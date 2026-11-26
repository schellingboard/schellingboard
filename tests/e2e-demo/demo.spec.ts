import { expect, test } from "@playwright/test";

import { openNameSwitcher } from "../e2e/helpers/user";

test("the demo says what it is, refuses a password change, and signs in with the shown credentials @024-US1 @024-US2", async ({
  page,
}) => {
  await page.goto("/");
  const notice = page.getByRole("region", { name: "Public demo notice" });
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("site-admin");
  await expect(notice).toContainText(/Resets in \d\d:\d\d:\d\d/);

  const nameBox = await openNameSwitcher(page);
  await nameBox.fill("Site Admin");
  await page.getByRole("option", { name: "Site Admin" }).click();
  const field = page.getByLabel("Password or emailed code");
  await field.fill("seed-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(
    page.getByRole("button", { name: /^Your name: Site Admin/ })
  ).toBeVisible();

  await page.getByRole("button", { name: /^Your name/ }).click();
  await page.getByRole("menuitem", { name: /settings/i }).click();
  await page.getByRole("button", { name: "Change password" }).click();
  await page.getByLabel("Current password").fill("seed-password");
  await page.getByLabel(/new password/i).fill("another-password");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(
    page.getByText("This is turned off on this site.")
  ).toBeVisible();

  await page.goto("/admin/users");
  await page
    .getByRole("listitem")
    .filter({ hasText: "Alice Test" })
    .getByRole("button", { name: "Edit" })
    .click();
  await page.getByLabel("Name", { exact: true }).last().fill("Alice Renamed");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Alice Renamed")).toBeVisible();

  await notice.getByRole("button", { name: "Close demo notice" }).click();
  await expect(notice).not.toContainText("site-admin");

  await page.goto("/");
  await expect(notice).toContainText(/Resets in \d\d:\d\d:\d\d/);
  await expect(notice).not.toContainText("site-admin");
  await notice.getByRole("button", { name: "Show info" }).click();
  await expect(notice).toContainText("site-admin");
});
