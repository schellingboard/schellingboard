import { Page } from "@playwright/test";
import { test, expect } from "./helpers/fixtures";
import { login } from "./helpers/auth";
import { selectUser } from "./helpers/user";
import { dayRadios, listboxButton } from "./helpers/session-form";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admintest";

async function adminLogin(page: Page) {
  await page.goto("/admin");
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Access Admin" }).click();
  await expect(page).toHaveURL(/\/admin\/events$/);
}

async function openGammaLocations(page: Page) {
  await page.goto("/admin");
  await page
    .getByRole("listitem")
    .filter({ hasText: "Conference Gamma" })
    .getByRole("link", { name: "Manage" })
    .click();
  await page
    .getByRole("navigation", { name: "Event sections" })
    .getByRole("link", { name: "Locations" })
    .click();
  return page.getByRole("region", { name: "Room availability" });
}

// No other spec books the Rooftop Terrace, so closing it for Gamma's second
// day cannot take a slot away from a parallel test.
test("a room marked unavailable cannot be booked then @017-US4", async ({
  page,
}) => {
  await adminLogin(page);
  let availability = await openGammaLocations(page);
  await availability.getByLabel("Room").selectOption("Rooftop Terrace");
  await availability
    .getByRole("group", { name: "Fill in a whole day" })
    .getByRole("button")
    .nth(1)
    .click();
  await availability
    .getByRole("button", { name: "Add unavailable time" })
    .click();
  const period = availability
    .getByRole("listitem")
    .filter({ hasText: "Rooftop Terrace" });
  await expect(period).toBeVisible();

  await login(page);
  await page.goto("/Conference-Gamma");
  await selectUser(page, /Alice Test/i);
  await page.getByRole("link", { name: "Add session" }).first().click();
  await expect(
    page.getByRole("heading", { name: /Add a session/i })
  ).toBeVisible();

  await dayRadios(page).nth(1).check();
  await listboxButton(page, /^Location/).click();
  await page.getByRole("option", { name: /Rooftop Terrace/ }).click();
  await listboxButton(page, /^Start Time/).click();
  await expect(page.getByRole("option", { name: "15:10" })).toHaveAttribute(
    "aria-disabled",
    "true"
  );
  await page.keyboard.press("Escape");

  await dayRadios(page).first().check();
  await listboxButton(page, /^Start Time/).click();
  await expect(page.getByRole("option", { name: "15:10" })).not.toHaveAttribute(
    "aria-disabled",
    "true"
  );

  availability = await openGammaLocations(page);
  await availability
    .getByRole("listitem")
    .filter({ hasText: "Rooftop Terrace" })
    .getByRole("button", { name: /^Delete/ })
    .click();
  await expect(
    availability.getByRole("listitem").filter({ hasText: "Rooftop Terrace" })
  ).toHaveCount(0);
});
