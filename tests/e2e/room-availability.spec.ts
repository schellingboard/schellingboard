import { Page } from "@playwright/test";
import { test, expect } from "./helpers/fixtures";
import { login } from "./helpers/auth";
import { selectUser } from "./helpers/user";
import {
  dayRadios,
  startTimeOption,
  selectOption,
} from "./helpers/session-form";
import { adminLogin } from "./helpers/admin";

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
  return page.getByRole("region", { name: "Location unavailability" });
}

// No other spec books the Rooftop Terrace, so closing it for Gamma's second
// day cannot take a slot away from a parallel test.
test("a room marked unavailable cannot be booked then @017-US4", async ({
  page,
}) => {
  await adminLogin(page);
  let availability = await openGammaLocations(page);
  await availability.getByRole("checkbox", { name: "Rooftop Terrace" }).check();
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

  // The form is server-rendered: a day checked before hydration is undone
  // by the next render. The listbox opens only once hydrated.
  await selectOption(page, /^Location/, /Rooftop Terrace/);
  await dayRadios(page).nth(1).check();
  await expect(startTimeOption(page, "15:10")).toBeDisabled();

  await dayRadios(page).first().check();
  await expect(startTimeOption(page, "15:10")).not.toBeDisabled();

  await adminLogin(page);
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
