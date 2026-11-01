import { Locator, Page, expect } from "@playwright/test";

// A notification is written by the jobs loop after the request has answered,
// and the list reads once per load, so a row can be missing until a reload.
export async function openNotifications(page: Page, row: Locator) {
  await page.getByRole("link", { name: /^Notifications/ }).click();
  await expect(
    page.getByRole("heading", { name: "Notifications" })
  ).toBeVisible();
  await expect(async () => {
    if (!(await row.first().isVisible())) await page.reload();
    await expect(row.first()).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 20_000 });
}
