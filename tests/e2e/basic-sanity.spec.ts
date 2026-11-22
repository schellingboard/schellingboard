import { login } from "./helpers/auth";
import { expect, test } from "./helpers/fixtures";

test.describe("Health endpoint", () => {
  test("GET /api/health returns 200 without authentication @019-US1", async ({
    request,
  }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });
});

test.describe("Basic Sanity Checks", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("homepage loads and shows multiple events @002-US2", async ({
    page,
  }) => {
    // Should show all three test events
    await expect(
      page.getByRole("heading", { name: "Hackathon" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Open Source Summit" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Web Unconference" })
    ).toBeVisible();

    // Should show the event descriptions
    await expect(
      page.getByText(/Dev Week ends with three days of building/)
    ).toBeVisible();
    await expect(
      page.getByText(/maintaining, funding and growing open source/)
    ).toBeVisible();
    await expect(
      page.getByText(/Dev Week opens with three days/)
    ).toBeVisible();
  });

  test("can navigate to Alpha event (proposal phase) @002-US2", async ({
    page,
  }) => {
    await page
      .locator("text=Hackathon")
      .locator("..")
      .getByRole("link", { name: "View event" })
      .click();

    await expect(
      page.getByRole("heading", {
        name: /Hackathon: Session Proposals/,
      })
    ).toBeVisible();
    await expect(
      page
        .getByText("Hackathon Lightning Talks: Community Showcase")
        .locator("visible=true")
    ).toBeVisible();
  });

  test("can navigate to Beta event (voting phase) @002-US2", async ({
    page,
  }) => {
    await page
      .locator("text=Open Source Summit")
      .locator("..")
      .getByRole("link", { name: "View event" })
      .click();

    await expect(
      page.getByRole("heading", {
        name: /Open Source Summit: Session Proposals/,
      })
    ).toBeVisible();
    await expect(
      page
        .getByText("Open Source Summit Lightning Talks: Community Showcase")
        .locator("visible=true")
    ).toBeVisible();
  });

  test("can navigate to Gamma event (scheduling phase) @002-US2", async ({
    page,
  }) => {
    await page
      .locator("text=Web Unconference")
      .locator("..")
      .getByRole("link", { name: "View event" })
      .click();

    await expect(page.getByRole("button", { name: "Grid" })).toBeVisible();
    await expect(
      page.getByText("Opening Keynote - Web Unconference")
    ).toBeVisible();
  });
});

test("opens an event from the phone's menu @002-US2", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await login(page);

  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("link", { name: "Web Unconference" }).click();

  await expect(page.getByRole("button", { name: "Grid" })).toBeVisible();
});
