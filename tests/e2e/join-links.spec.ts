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
