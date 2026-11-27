import { adminLogin } from "./helpers/admin";
import { login } from "./helpers/auth";
import { expect, test } from "./helpers/fixtures";
import { uniqueSuffix } from "./helpers/unique";
import { openNameSwitcher } from "./helpers/user";

test("a verified event asks its attendees to sign in, an open one does not @015-US7", async ({
  page,
  browser,
}) => {
  const unique = uniqueSuffix();
  const guestName = `E2E Verified ${unique}`;
  const eventName = `E2E Identity ${unique}`;

  await adminLogin(page);
  await page.goto("/admin/users");
  await page.getByLabel("Name", { exact: true }).fill(guestName);
  await page.getByLabel("Email").fill(`e2e-identity-${unique}@test.example`);
  await page.getByRole("button", { name: "Add user" }).click();
  await expect(
    page.getByRole("listitem").filter({ hasText: guestName })
  ).toBeVisible();

  await page.goto("/admin/events");
  await page.getByRole("button", { name: "New event" }).click();
  await page.getByLabel("Name*").fill(eventName);
  await expect(page.getByLabel("Identity")).toHaveValue("verified");
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
  const row = page
    .getByRole("region", { name: "Guests" })
    .getByRole("row")
    .filter({ hasText: guestName });
  await row.getByRole("checkbox", { name: /^Assign / }).click();
  await expect(row.getByRole("checkbox", { name: /^Assign / })).toBeChecked();

  const attendee = await browser.newContext();
  const visitor = await attendee.newPage();
  await visitor.goto("/");
  await login(visitor);
  const pick = async () => {
    const nameBox = await openNameSwitcher(visitor);
    await nameBox.fill(guestName);
    await visitor.getByRole("option", { name: guestName }).click();
  };
  await pick();
  await expect(
    visitor.getByRole("heading", { name: `Log in as ${guestName}` })
  ).toBeVisible();

  await page
    .getByRole("navigation", { name: "Event sections" })
    .getByRole("link", { name: "Config" })
    .click();
  await page.getByLabel("Identity").selectOption("open");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved!")).toBeVisible();

  await visitor.goto("/");
  await pick();
  await expect(
    visitor.getByRole("button", { name: `Your name: ${guestName}` })
  ).toBeVisible();
  await attendee.close();
});

test("a verified event shows no names and signs the visitor in on their first action @025-US3", async ({
  page,
  browser,
}) => {
  const eventName = `E2E Verified Action ${uniqueSuffix()}`;
  await adminLogin(page);
  await page.goto("/admin/events");
  await page.getByRole("button", { name: "New event" }).click();
  await page.getByLabel("Name*").fill(eventName);
  await expect(page.getByLabel("Identity")).toHaveValue("verified");
  await page.getByRole("button", { name: "Create event" }).click();
  await page
    .getByRole("listitem")
    .filter({ hasText: eventName })
    .getByRole("link", { name: "Manage" })
    .click();
  await page
    .getByRole("group", { name: "Proposal phase" })
    .getByLabel("Start")
    .fill("2020-09-01T09:00");
  await page.getByRole("button", { name: "Save phases" }).click();
  await expect(page.getByText("Saved!")).toBeVisible();

  const attendee = await browser.newContext({
    viewport: { width: 375, height: 700 },
  });
  const visitor = await attendee.newPage();
  await visitor.goto("/");
  await login(visitor);
  await visitor.getByRole("button", { name: "Open menu" }).click();
  await visitor.getByRole("link", { name: eventName }).first().click();
  await expect(visitor).toHaveURL(/\/proposals$/);
  const proposalsUrl = visitor.url();

  await visitor
    .getByRole("link", { name: /Add Proposal/i })
    .first()
    .click();

  await expect(visitor.getByRole("heading", { name: "Log in" })).toBeVisible();
  await expect(visitor.getByRole("listbox", { name: "Names" })).toHaveCount(0);
  await visitor.getByLabel("Email or username").fill("site-admin");
  await visitor.getByLabel("Password or emailed code").fill("schelling");
  await visitor.getByRole("button", { name: "Log in", exact: true }).click();

  await expect(visitor).toHaveURL(proposalsUrl);
  await expect(
    visitor.getByRole("link", { name: /Add Proposal/i }).first()
  ).toBeVisible();
  await expect(visitor.getByLabel("Email or username")).toHaveCount(0);
  await attendee.close();
});
