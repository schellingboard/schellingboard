import fs from "fs";
import { test, expect } from "./helpers/fixtures";
import { adminLogin } from "./helpers/admin";

// Read-only on the seeded Conference Gamma, so it can run beside the other specs.
test("reads the statistics, leaves a location and a host out and downloads the tables @021-US1 @021-US2 @021-US3", async ({
  page,
}) => {
  await adminLogin(page);
  await page
    .getByRole("navigation", { name: "Admin" })
    .getByRole("link", { name: "Statistics" })
    .click();
  await page
    .getByRole("combobox", { name: "Event" })
    .selectOption({ label: "Conference Gamma" });

  await expect(page.getByText("Excluding blockers")).toBeVisible();
  const headline = page.getByRole("list", { name: "Headline numbers" });
  await expect(
    headline.getByRole("listitem").filter({ hasText: "Members" }).first()
  ).toBeVisible();

  await page
    .getByRole("button", { name: "About Participation funnel" })
    .click();
  const about = page.getByRole("dialog", { name: "Participation funnel" });
  await expect(about.getByText(/took each step/)).toBeVisible();
  await about.getByRole("button", { name: "Close" }).click();

  await page
    .getByRole("combobox", { name: "Locations to leave out" })
    .fill("garden");
  await page.getByRole("option", { name: "Garden Terrace" }).click();
  await page.getByRole("combobox", { name: "Hosts to leave out" }).fill("yuki");
  await page.getByRole("option", { name: "Yuki Tanaka" }).click();
  await expect(
    page.getByText("Excluding 1 location, 1 host, blockers")
  ).toBeVisible();
  await expect(page).toHaveURL(/excludeLocations=/);
  await expect(page).toHaveURL(/excludeHosts=/);

  const csv = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Download CSV of Headline numbers" })
    .click();
  const csvFile = await csv;
  expect(csvFile.suggestedFilename()).toMatch(
    /overview-headline-filtered\.csv$/
  );
  const text = fs.readFileSync(await csvFile.path(), "utf8");
  expect(text.split("\n")[0]).toContain("Figure");
  expect(text).toContain("Members");

  const zip = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download all" }).click();
  expect((await zip).suggestedFilename()).toMatch(/\.zip$/);
});
