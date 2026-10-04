import { test, expect } from "./helpers/fixtures";
import { login } from "./helpers/auth";

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
      page.getByRole("heading", { name: "Conference Alpha" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Conference Beta" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Conference Gamma" })
    ).toBeVisible();

    // Should show phase descriptions
    await expect(
      page.getByText("Event currently in proposal phase")
    ).toBeVisible();
    await expect(
      page.getByText("Event currently in voting phase")
    ).toBeVisible();
    await expect(
      page.getByText("Event currently in scheduling phase")
    ).toBeVisible();
  });

  test("can navigate to Alpha event (proposal phase) @002-US2", async ({
    page,
  }) => {
    await page
      .locator("text=Conference Alpha")
      .locator("..")
      .getByRole("link", { name: "View event" })
      .click();

    await expect(
      page.getByRole("heading", {
        name: /Conference Alpha: Session Proposals/,
      })
    ).toBeVisible();
    await expect(
      page
        .getByText("Conference Alpha Lightning Talks: Community Showcase")
        .locator("visible=true")
    ).toBeVisible();
  });

  test("can navigate to Beta event (voting phase) @002-US2", async ({
    page,
  }) => {
    await page
      .locator("text=Conference Beta")
      .locator("..")
      .getByRole("link", { name: "View event" })
      .click();

    await expect(
      page.getByRole("heading", {
        name: /Conference Beta: Session Proposals/,
      })
    ).toBeVisible();
    await expect(
      page
        .getByText("Conference Beta Lightning Talks: Community Showcase")
        .locator("visible=true")
    ).toBeVisible();
  });

  test("can navigate to Gamma event (scheduling phase) @002-US2", async ({
    page,
  }) => {
    await page
      .locator("text=Conference Gamma")
      .locator("..")
      .getByRole("link", { name: "View event" })
      .click();

    await expect(page.getByRole("button", { name: "Grid" })).toBeVisible();
    await expect(
      page.getByText("Opening Keynote - Conference Gamma")
    ).toBeVisible();
  });
});

test("opens an event from the phone's menu @002-US2", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await login(page);

  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("link", { name: "Conference Gamma" }).click();

  await expect(page.getByRole("button", { name: "Grid" })).toBeVisible();
});
