import { test, expect } from "./helpers/fixtures";
import { adminLogin } from "./helpers/admin";
import { login } from "./helpers/auth";
import { uniqueSuffix } from "./helpers/unique";

test("an organizer's personal link signs a guest in and opens the event @003-US6 @016-US5", async ({
  page,
  browser,
}) => {
  await adminLogin(page);
  await page.goto("/admin/events");
  const eventName = `E2E Join ${uniqueSuffix()}`;
  await page.getByRole("button", { name: "New event" }).click();
  await page.getByLabel("Name*").fill(eventName);
  await page.getByLabel("Identity").selectOption("open");
  await page.getByRole("button", { name: "Create event" }).click();
  await page
    .getByRole("listitem")
    .filter({ hasText: eventName })
    .getByRole("link", { name: "Manage" })
    .click();
  await page
    .getByRole("navigation", { name: "Event sections" })
    .getByRole("link", { name: "Guests" })
    .click();

  const guests = page.getByRole("region", { name: "Guests" });
  const row = guests.getByRole("row").filter({ hasText: "Alice Test" });
  await row.getByRole("button", { name: "New link for Alice Test" }).click();
  const first = await row
    .getByRole("textbox", { name: "Join link for Alice Test" })
    .inputValue();
  expect(first).toContain("/join/");

  const attendee = await browser.newContext();
  const visitor = await attendee.newPage();
  await visitor.goto(first);
  await login(visitor);
  await expect(
    visitor.getByRole("button", { name: /^Your name: Alice Test/ })
  ).toBeVisible();
  await expect(visitor).not.toHaveURL(/\/join\//);
  await expect(visitor.getByText(eventName).first()).toBeVisible();

  // A second link ends the first.
  await page.reload();
  await page
    .getByRole("region", { name: "Guests" })
    .getByRole("row")
    .filter({ hasText: "Alice Test" })
    .getByRole("button", { name: "New link for Alice Test" })
    .click();
  const other = await attendee.newPage();
  await other.goto(first);
  await expect(other.getByRole("alert")).toContainText("no longer works");
  await attendee.close();
});

test("a guest without an email gets a link from the organizer and sets a password @016-US1 @003-US3", async ({
  page,
  browser,
}) => {
  const unique = uniqueSuffix();
  const guestName = `E2E No Mail ${unique}`;
  const eventName = `E2E No Mail Event ${unique}`;

  await adminLogin(page);
  await page.goto("/admin/users");
  await page.getByLabel("Name", { exact: true }).fill(guestName);
  await page
    .getByLabel("Username", { exact: true })
    .fill(`nm-${Date.now().toString(36)}-${process.pid}`);
  await page.getByRole("button", { name: "Add user" }).click();
  const row = page.getByRole("listitem").filter({ hasText: guestName });
  await expect(row.getByText("No email")).toBeVisible();
  await expect(
    row.getByRole("button", { name: "Send test email" })
  ).toBeDisabled();

  await page.goto("/admin/events");
  await page.getByRole("button", { name: "New event" }).click();
  await page.getByLabel("Name*").fill(eventName);
  await page.getByLabel("Identity").selectOption("open");
  await page.getByRole("button", { name: "Create event" }).click();
  await page
    .getByRole("listitem")
    .filter({ hasText: eventName })
    .getByRole("link", { name: "Manage" })
    .click();
  await page
    .getByRole("navigation", { name: "Event sections" })
    .getByRole("link", { name: "Guests" })
    .click();
  const guests = page.getByRole("region", { name: "Guests" });
  await guests.getByPlaceholder("Search name or email…").fill(guestName);
  const eventRow = guests.getByRole("row").filter({ hasText: guestName });
  const assign = eventRow.getByRole("checkbox", { name: /^Assign / });
  await assign.click();
  await expect(assign).toBeChecked();
  await eventRow
    .getByRole("button", { name: `New link for ${guestName}` })
    .click();
  const link = await eventRow
    .getByRole("textbox", { name: `Join link for ${guestName}` })
    .inputValue();

  const attendee = await browser.newContext();
  const visitor = await attendee.newPage();
  await visitor.goto(link);
  await login(visitor);
  await expect(
    visitor.getByRole("button", {
      name: new RegExp(`^Your name: ${guestName}`),
    })
  ).toBeVisible();

  await visitor.getByRole("button", { name: /your name/i }).click();
  await visitor.getByRole("menuitem", { name: /settings/i }).click();
  await visitor.getByRole("link", { name: "Account security" }).click();
  await visitor.getByRole("button", { name: "Set a password" }).click();
  await visitor
    .getByLabel("New password (at least 8 characters)")
    .fill("a long enough password");
  await visitor.getByRole("button", { name: "Set password" }).click();
  await expect(visitor.getByRole("status")).toHaveText("Password set");
  await attendee.close();
});
