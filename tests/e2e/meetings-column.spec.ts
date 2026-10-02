import { test, expect } from "./helpers/fixtures";
import { switchToView } from "./helpers/schedule";
import { loginAndGoto } from "./helpers/auth";
import { selectUser } from "./helpers/user";

/**
 * The viewer's 1-on-1s on the schedule: the grid's column when several share a
 * slot, and the text views. The fixture is seeded rather than booked through
 * the UI here — arranging five 1-on-1s takes five attendees and five user
 * switches, and what is under test is how the schedule draws them. Booking one
 * is covered by meetings-request.spec.ts.
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

// The Text and RSVP'd views used to list sessions only, so switching to either
// made the viewer's own 1-on-1s vanish from the schedule (#1023).
test.describe("1-on-1s in the Text and RSVP'd views", () => {
  test("Text lists them all, RSVP'd only the confirmed", async ({ page }) => {
    await loginAndGoto(page, "/guests");
    await selectUser(page, VIEWER);
    await page.getByRole("link", { name: "Conference Gamma" }).first().click();

    const [confirmed, waiting] = AT_TEN.map((name) =>
      page.getByRole("link", { name: `1-on-1 with ${name}`, exact: true })
    );
    const details = page.getByRole("dialog", { name: "1-on-1 details" });

    await switchToView(page, "Text");
    await expect(confirmed).toBeVisible();
    await expect(waiting).toBeVisible();
    await waiting.click();
    await expect(
      details.getByRole("heading", { name: `1-on-1 with ${AT_TEN[1]}` })
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(details).toBeHidden();

    // Waiting on an answer is no commitment yet; its going also shows the
    // Text view has given way.
    await page.getByRole("button", { name: "RSVP'd" }).click();
    await expect(waiting).toBeHidden();
    await expect(confirmed).toBeVisible();
    await confirmed.click();
    await expect(
      details.getByRole("heading", { name: `1-on-1 with ${AT_TEN[0]}` })
    ).toBeVisible();
  });
});
