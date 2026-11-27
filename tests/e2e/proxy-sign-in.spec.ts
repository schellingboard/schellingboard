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
    const create = card.getByLabel("Create people the site does not know");
    if ((await enabled.isChecked()) || (await create.isChecked())) {
      await enabled.uncheck();
      await create.uncheck();
      await card.getByRole("button", { name: "Save proxy sign-in" }).click();
      await expect(card.getByText("Proxy sign-in saved.")).toBeVisible();
    }
    if (await card.getByRole("button", { name: "Remove secret" }).isVisible()) {
      await card.getByRole("button", { name: "Remove secret" }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Remove secret" })
        .click();
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
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Remove secret" })
      .click();
    await expect(card.getByText("Secret removed.")).toBeVisible();
    await card.getByLabel("Sign in through a proxy").uncheck();
    await card.getByRole("button", { name: "Save proxy sign-in" }).click();
    await expect(card.getByText("Proxy sign-in saved.")).toBeVisible();
  });

  test("a person behind the proxy has a fixed name and a Log out link @025-US2", async ({
    page,
    browser,
  }) => {
    await adminLogin(page);
    await page
      .getByRole("navigation", { name: "Admin" })
      .getByRole("link", { name: "Settings" })
      .click();
    const card = page.getByRole("region", { name: "Sign-in through a proxy" });
    await card.getByLabel("Sign in through a proxy").check();
    await card
      .getByLabel("Sign out address")
      .fill("https://sso.example/logout");
    await card.getByRole("button", { name: "Save proxy sign-in" }).click();
    await expect(card.getByText("Proxy sign-in saved.")).toBeVisible();

    const context = await browser.newContext({
      extraHTTPHeaders: { "X-Forwarded-Email": "alice@test.com" },
    });
    const person = await context.newPage();
    await person.goto("/Hackathon");
    await person.getByRole("button", { name: /^Your name: Alice/ }).click();
    await expect(
      person.getByRole("menuitem", { name: "Log out" })
    ).toHaveAttribute("href", "https://sso.example/logout");

    await person.getByRole("menuitem", { name: "Settings" }).click();
    await expect(person.getByText(/Email me when/)).toBeVisible();
    await expect(
      person.getByRole("heading", { name: "Account security" })
    ).toHaveCount(0);
    await context.close();
  });

  test("a person made from an unknown email confirms the name @025-US2", async ({
    browser,
  }) => {
    test.slow();
    // The admin's own request must not carry the person-making header.
    const adminContext = await browser.newContext({
      extraHTTPHeaders: { "X-Forwarded-Email": "" },
    });
    const page = await adminContext.newPage();
    await adminLogin(page);
    await page
      .getByRole("navigation", { name: "Admin" })
      .getByRole("link", { name: "Settings" })
      .click();
    const card = page.getByRole("region", { name: "Sign-in through a proxy" });
    await card.getByLabel("Sign in through a proxy").check();
    await card.getByRole("button", { name: "Save proxy sign-in" }).click();
    await expect(card.getByText("Proxy sign-in saved.")).toBeVisible();

    const context = await browser.newContext({
      extraHTTPHeaders: {
        "X-Forwarded-Email": "grace@proxy.test",
        "X-Forwarded-Name": "Grace Hopper",
      },
    });
    const person = await context.newPage();
    await card.getByLabel("Create people the site does not know").check();
    await card.getByLabel("Header with the name").fill("X-Forwarded-Name");
    await card.getByRole("button", { name: "Save proxy sign-in" }).click();
    await expect(card.getByText("Proxy sign-in saved.")).toBeVisible();

    await person.goto("/Hackathon");
    const dialog = person.getByRole("dialog", { name: "Your name" });
    await expect(dialog.getByRole("textbox", { name: /Name/ })).toHaveValue(
      "Grace Hopper"
    );
    await person.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Save" }).click();
    await expect(dialog).toHaveCount(0);
    await person.reload();
    await expect(person.getByRole("main")).toBeVisible();
    await expect(person.getByRole("dialog")).toHaveCount(0);
    await context.close();

    await card.getByLabel("Create people the site does not know").uncheck();
    await card.getByRole("button", { name: "Save proxy sign-in" }).click();
    await expect(card.getByText("Proxy sign-in saved.")).toBeVisible();
    await adminContext.close();
  });
});
