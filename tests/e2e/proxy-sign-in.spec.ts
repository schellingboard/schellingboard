import { adminLogin } from "./helpers/admin";
import { expect, test } from "./helpers/fixtures";

// Runs serially: these tests mutate the singleton site-settings row.
test.describe.configure({ mode: "serial" });

test.use({ extraHTTPHeaders: { "X-Forwarded-Email": "nobody@proxy.test" } });

test.describe("Admin proxy sign-in", () => {
  test.afterEach(async ({ page }) => {
    await adminLogin(page);
    await page
      .getByRole("navigation", { name: "Admin" })
      .getByRole("link", { name: "Settings" })
      .click();
    const card = page.getByRole("region", { name: "Sign-in through a proxy" });
    const enabled = card.getByLabel("Sign in through a proxy");
    if (await enabled.isChecked()) {
      await enabled.uncheck();
      await card.getByRole("button", { name: "Save proxy sign-in" }).click();
      await expect(card.getByText("Proxy sign-in saved.")).toBeVisible();
    }
    if (await card.getByRole("button", { name: "Remove secret" }).isVisible()) {
      await card.getByRole("button", { name: "Remove secret" }).click();
      await expect(card.getByText("Secret removed.")).toBeVisible();
    }
  });

  test("turns on and shows what the admin's own request carried @025-US1", async ({
    page,
  }) => {
    await adminLogin(page);
    await page
      .getByRole("navigation", { name: "Admin" })
      .getByRole("link", { name: "Settings" })
      .click();
    const card = page.getByRole("region", { name: "Sign-in through a proxy" });
    await expect(card).toBeVisible();
    await expect(card.getByRole("alert")).toHaveCount(0);

    await card.getByLabel("Sign in through a proxy").check();
    await card.getByRole("button", { name: "Save proxy sign-in" }).click();
    await expect(card.getByText("Proxy sign-in saved.")).toBeVisible();
    await expect(card.getByRole("alert")).toContainText(
      "reaches the app without the proxy"
    );
    await expect(
      card.getByText(/carried the header and was trusted/)
    ).toBeVisible();

    await card.getByRole("button", { name: "Make secret" }).click();
    await expect(card.getByText(/shown only once/)).toBeVisible();
    await expect(card.getByRole("alert")).toHaveCount(0);
    await expect(
      card.getByText(/did not pass the secret or address check/)
    ).toBeVisible();

    await card.getByRole("button", { name: "Remove secret" }).click();
    await expect(card.getByText("Secret removed.")).toBeVisible();
    await card.getByLabel("Sign in through a proxy").uncheck();
    await card.getByRole("button", { name: "Save proxy sign-in" }).click();
    await expect(card.getByText("Proxy sign-in saved.")).toBeVisible();
  });
});
