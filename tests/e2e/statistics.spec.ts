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
  const headline = page.getByRole("table", { name: "Headline numbers" });
  await expect(headline.getByRole("row", { name: /^Members/ })).toBeVisible();

  await page.getByText("Filter", { exact: true }).click();
  await page.getByRole("checkbox", { name: "Garden Terrace" }).check();
  await page.getByRole("checkbox", { name: "Yuki Tanaka" }).check();
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
