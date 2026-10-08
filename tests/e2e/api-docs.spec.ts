import { test, expect } from "./helpers/fixtures";
import { login } from "./helpers/auth";

test("attendee reads the API reference @019-US6", async ({ page }) => {
  await login(page);
  const origin = new URL(page.url()).origin;
  const elsewhere: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith("http") && url.origin !== origin)
      elsewhere.push(request.url());
  });

  await page.goto("/api/v1/docs");
  await expect(
    page.getByRole("heading", { name: "SchellingBoard API" })
  ).toBeVisible();
  await expect(page.getByText("/api/v1/health").first()).toBeVisible();
  expect(elsewhere).toEqual([]);
});
