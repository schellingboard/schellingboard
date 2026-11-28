import { adminLogin } from "./helpers/admin";
import { login } from "./helpers/auth";
import { expect, test } from "./helpers/fixtures";
import { uniqueSuffix } from "./helpers/unique";

test("a new site admin without an email sets a password from a copied link and uses admin @016-US6", async ({
  page,
  browser,
}) => {
  const name = `E2E New Admin ${uniqueSuffix()}`;
  const username = `na-${Date.now().toString(36)}-${process.pid}`;
  const password = "a long enough password";

  await adminLogin(page);
  await page.goto("/admin/users");
  await page.getByLabel("Name", { exact: true }).fill(name);
  await page.getByLabel("Username", { exact: true }).fill(username);
  await page.getByRole("button", { name: "Add user" }).click();
  await page.getByPlaceholder("Search name or email…").fill(name);
  const row = page.getByRole("listitem").filter({ hasText: name });
  await row.getByRole("button", { name: "Make site admin" }).click();
  const dialog = page.getByRole("dialog", {
    name: `Make ${name} a site admin?`,
  });
  await dialog.getByRole("button", { name: "Copy password link" }).click();
  const link = await dialog
    .getByRole("textbox", { name: `Password link for ${name}` })
    .inputValue();

  const context = await browser.newContext();
  const visitor = await context.newPage();
  await visitor.goto(link);
  await login(visitor);
  await visitor
    .getByLabel("New password (at least 8 characters)")
    .fill(password);
  await visitor.getByRole("button", { name: "Set password" }).click();
  await visitor.getByRole("link", { name: "Go to sign in" }).click();
  await visitor.getByLabel("Password or emailed code").fill(password);
  await visitor.getByRole("button", { name: "Log in" }).click();
  await expect(
    visitor.getByRole("button", { name: new RegExp(`^Your name: ${name}`) })
  ).toBeVisible();

  await visitor.goto("/admin");
  await expect(visitor.getByRole("heading", { name: "Events" })).toBeVisible();

  const second = await context.newPage();
  await second.goto(link);
  await second
    .getByLabel("New password (at least 8 characters)")
    .fill("another long password");
  await second.getByRole("button", { name: "Set password" }).click();
  await expect(second.getByRole("alert")).toHaveText(
    "This link no longer works. Request a new one, or ask an admin."
  );
  await context.close();
});
