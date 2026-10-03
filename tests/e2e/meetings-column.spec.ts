import { test, expect } from "./helpers/fixtures";
import { loginAndGoto } from "./helpers/auth";
import { selectUser } from "./helpers/user";

/**
 * The viewer's 1-on-1s in the grid's column when several share a slot. The
 * fixture is seeded rather than booked through the UI here — arranging five
 * 1-on-1s takes five attendees and five user switches, and what is under test
 * is how the schedule draws them. Booking one is covered by
 * meetings-request.spec.ts.
 *
 * Conference Gamma is the seeded event in its scheduling phase, and Zanele's
 * first morning there holds two 1-on-1s in the 10:00 slot and three in the
 * 11:00 slot (scripts/seed/seed-database.ts) — shown from 10:10 and 11:10,
 * after the event's break, as sessions in those slots are.
 */
const VIEWER = "Zanele Khumalo";
const AT_TEN = ["Leilani Kahale", "Samuel Adeyemi"];

test.describe("parallel 1-on-1s on the schedule", () => {
  test("gathers a slot's 1-on-1s into one block that lists them", async ({
    page,
  }) => {
    await loginAndGoto(page, "/guests");
    await selectUser(page, VIEWER);
    await page.getByRole("link", { name: "Conference Gamma" }).first().click();

    const pair = page.getByRole("button", {
      name: "2 1-on-1s, 10:10 – 10:30 — 1 needs your reply",
    });
    await expect(pair).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "3 1-on-1s, 11:10 – 11:30 — 3 need your reply",
      })
    ).toBeVisible();

    // Each in the list opens its own 1-on-1, the request still answerable.
    await pair.click();
    const slotList = page.getByRole("dialog", {
      name: /2 1-on-1s, 10:10 – 10:30/,
    });
    for (const name of AT_TEN) {
      await expect(
        slotList.getByRole("link", { name: new RegExp(name) })
      ).toBeVisible();
    }
    await slotList.getByRole("link", { name: new RegExp(AT_TEN[1]) }).click();
    const details = page.getByRole("dialog", { name: "1-on-1 details" });
    await expect(
      details.getByRole("heading", { name: `1-on-1 with ${AT_TEN[1]}` })
    ).toBeVisible();
    await expect(details.getByRole("button", { name: "Accept" })).toBeVisible();
  });
});
