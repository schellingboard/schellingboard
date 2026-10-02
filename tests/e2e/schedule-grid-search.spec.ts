import { DateTime } from "luxon";
import { test, expect } from "./helpers/fixtures";
import { loginAndGoto } from "./helpers/auth";
import { selectUser } from "./helpers/user";
import { filterChip, switchToView } from "./helpers/schedule";

// The grid keeps every session where it is while searching or filtering —
// an empty cell there means a free slot — and fades out what doesn't match.

const NO_MATCH = /doesn't match/;
// Seeded at today+14 (see helpers/dev-clock.ts); API Design is on day one.
const gammaDayTwo = DateTime.now()
  .setZone("Europe/Berlin")
  .plus({ days: 15 })
  .toFormat("EEEE, MMMM d");

test("searching the grid fades what doesn't match and folds days without a match", async ({
  page,
}) => {
  await loginAndGoto(page, "/guests");
  await selectUser(page, "Zanele Khumalo");
  await page.getByRole("link", { name: "Conference Gamma" }).first().click();
  const search = page.getByRole("searchbox", { name: "Search sessions" });

  // Only the API design session's description says "comparative".
  await search.fill("comparative");
  await expect(page.getByText(/^1 of \d+ match/)).toBeVisible();
  const apiDesign = page.getByRole("link", { name: /API Design/ });
  await expect(apiDesign).toBeVisible();
  await expect(apiDesign).not.toHaveAccessibleName(NO_MATCH);
  await expect(
    page.getByRole("link", { name: /Opening Keynote/ })
  ).toHaveAccessibleName(NO_MATCH);
  await expect(
    page.getByRole("button", { name: `${gammaDayTwo} · no matches · show` })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Building Scalable Web/ })
  ).toBeHidden();

  // Leilani's 1-on-1 shares its 10:10 slot with another, so the grid shows
  // the pair as one block; the 11:10 trio doesn't include her.
  await search.fill("Leilani");
  await expect(
    page.getByRole("button", { name: /^2 1-on-1s, 10:10/ })
  ).not.toHaveAccessibleName(NO_MATCH);
  await expect(
    page.getByRole("button", { name: /^3 1-on-1s, 11:10/ })
  ).toHaveAccessibleName(NO_MATCH);

  await page.getByRole("button", { name: "Show all" }).click();
  await expect(apiDesign).not.toHaveAccessibleName(NO_MATCH);
  await expect(
    page.getByRole("link", { name: /Building Scalable Web/ })
  ).toBeVisible();
});

test.describe("in a short window", () => {
  test.use({ viewport: { width: 1280, height: 600 } });

  test("stepping through the matches brings each one into view in turn", async ({
    page,
  }) => {
    await loginAndGoto(page, "/guests");
    await selectUser(page, "Zanele Khumalo");
    await page.getByRole("link", { name: "Conference Gamma" }).first().click();
    const search = page.getByRole("searchbox", { name: "Search sessions" });
    const next = page.getByRole("button", { name: "Next match" });
    const previous = page.getByRole("button", { name: "Previous match" });
    const designSystems = page.getByRole("link", { name: /Design Systems/ });
    const apiDesign = page.getByRole("link", { name: /API Design/ });
    const ux = page.getByRole("link", {
      name: /Psychology of User Experience/,
    });

    await search.fill("design");
    await expect(page.getByText(/^3 of \d+ match/)).toBeVisible();
    await expect(designSystems).not.toBeInViewport();

    await next.click();
    await expect(designSystems).toBeInViewport();
    await expect(page.getByText("1/3", { exact: true })).toBeVisible();
    await next.click();
    await expect(apiDesign).toBeInViewport();
    await expect(page.getByText("2/3", { exact: true })).toBeVisible();

    // Enter steps on too, as in a browser's find bar.
    await search.press("Enter");
    await expect(ux).toBeInViewport();
    await expect(page.getByText("3/3", { exact: true })).toBeVisible();

    await next.click();
    await expect(designSystems).toBeInViewport();
    await previous.click();
    await expect(ux).toBeInViewport();
  });
});

// Charlie hosts the React session and has an RSVP for Open Source
// Sustainability in the seed.
test("a filter chosen in the agenda carries over to the grid", async ({
  page,
}) => {
  await loginAndGoto(page, "/guests");
  await selectUser(page, "Charlie Test");
  await page.getByRole("link", { name: "Conference Gamma" }).first().click();
  await switchToView(page, "Agenda");
  await filterChip(page, "Hosting").click();

  await switchToView(page, "Grid");
  await expect(filterChip(page, "Hosting")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(
    page.getByRole("link", { name: /Building Scalable Web/ })
  ).not.toHaveAccessibleName(NO_MATCH);
  await expect(
    page.getByRole("link", { name: /Open Source Sustainability/ })
  ).toHaveAccessibleName(NO_MATCH);
});
