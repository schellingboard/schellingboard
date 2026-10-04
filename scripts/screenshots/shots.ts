import { expect, type Page } from "@playwright/test";

import { DateTime } from "luxon";

import {
  ADMIN_PASSWORD,
  capture,
  openSite,
  setTheme,
  type Env,
  type Viewport,
} from "./env";

export type Shot = {
  name: string;
  take: (env: Env, png: string) => Promise<void>;
};

/** A shot that signs in as the attendee, runs `setup`, then captures. */
function shot(
  name: string,
  setup: (page: Page, env: Env) => Promise<void>,
  opts: { kind?: Viewport; timezoneId?: string } = {}
): Shot {
  return {
    name,
    async take(env, png) {
      const { page, context } = await openSite(env, opts.kind ?? "desktop", {
        timezoneId: opts.timezoneId,
      });
      try {
        await setup(page, env);
        await settle(page);
        await capture(page, png);
      } finally {
        await context.close();
      }
    },
  };
}

/** Lets images and late client renders land before the capture. */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(/^Loading/)).toHaveCount(0);
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images).map((img) =>
        img.complete ? Promise.resolve() : img.decode().catch(() => undefined)
      )
    )
  );
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await page.waitForTimeout(500);
}

const openEvent = async (page: Page, event: string) => {
  await page.getByRole("link", { name: event, exact: true }).first().click();
  await page.waitForLoadState("networkidle");
};

const openProposals = async (page: Page, event: string) => {
  await openEvent(page, event);
  // Before the scheduling phase the event's page is its proposal list.
  const tab = page.getByRole("link", { name: "Proposals", exact: true });
  const list = page.getByRole("heading", { name: /Session Proposals/ });
  await tab.or(list).first().waitFor();
  if (await tab.isVisible()) await tab.click();
  await page.waitForURL(/\/proposals/);
};

const openUserMenu = async (page: Page, item: string) => {
  await page.getByRole("button", { name: /^Your name: / }).click();
  await page.getByRole("menuitem", { name: item }).click();
};

/** Scrolls the schedule so the hour label sits just under the sticky headers. */
const scrollGridTo = async (page: Page, hour: string) => {
  await page
    .getByText(hour, { exact: true })
    .first()
    .evaluate((el) => el.scrollIntoView({ block: "start" }));
  await page.evaluate(() => window.scrollBy(0, -150));
};

const adminLogin = async (page: Page) => {
  await page.goto("/admin/login");
  const password = page.getByLabel("Password");
  await password.fill(ADMIN_PASSWORD);
  await password.press("Enter");
  await page.waitForURL(/\/admin\/events/);
};

const manageGamma = async (page: Page) => {
  await adminLogin(page);
  await page
    .getByRole("listitem")
    .filter({ hasText: "Conference Gamma" })
    .getByRole("link", { name: "Manage" })
    .click();
  await page.getByRole("heading", { name: "Conference Gamma" }).waitFor();
};

const openGammaOnPhone = async (page: Page) => {
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("link", { name: "Conference Gamma" }).click();
  await page.getByRole("group", { name: "Schedule view" }).waitFor();
};

export const shots: Shot[] = [
  shot("home-multi-event", async () => {}),
  shot("proposals-browse", (page) => openProposals(page, "Conference Alpha")),
  shot("proposals-vote", (page) => openProposals(page, "Conference Beta")),
  shot("quick-voting", async (page) => {
    await openProposals(page, "Conference Beta");
    await page.getByRole("link", { name: /Quick Voting/ }).click();
    await page.waitForURL(/quick-voting/);
    // A proposal with a discussion shows the comments below it.
    const heading = page.getByRole("heading", { name: /^[1-9]\d* comments?$/ });
    for (let i = 0; i < 25 && !(await heading.isVisible()); i++) {
      await page.getByRole("button", { name: "Skip" }).click();
      await page.waitForTimeout(700);
    }
    await expect(heading).toBeVisible();
  }),
  shot("proposal-edit", async (page) => {
    await openProposals(page, "Conference Alpha");
    await page.getByText("My proposals", { exact: true }).click();
    await page.getByRole("button", { name: "Edit" }).first().click();
    await page
      .getByRole("heading", { name: /Edit Session Proposal/ })
      .waitFor();
  }),
  shot("proposals-results", (page) => openProposals(page, "Conference Gamma")),
  shot("proposal-vote-breakdown", async (page) => {
    await openProposals(page, "Conference Gamma");
    await page.getByText("My proposals", { exact: true }).click();
    await page.getByRole("cell").first().click();
    await page.getByText("Vote breakdown").waitFor();
  }),
  shot("schedule-grid", (page) => openEvent(page, "Conference Gamma")),
  shot("session-details", async (page) => {
    await openEvent(page, "Conference Gamma");
    await page
      .getByText("Benchmarking API Versioning", { exact: false })
      .first()
      .click();
    await page.getByRole("dialog").waitFor();
  }),
  shot("add-session", async (page) => {
    await openEvent(page, "Conference Gamma");
    await page.getByRole("link", { name: /add/i }).first().click();
    await page.waitForURL(/add-session/);
  }),
  shot("attendees", async (page) => {
    await page.getByRole("link", { name: "Attendees" }).click();
    await page.getByRole("heading", { name: "Attendees" }).waitFor();
  }),
  shot("participant-profile", async (page) => {
    await page.getByRole("link", { name: "Attendees" }).click();
    await page.getByRole("heading", { name: "Attendees" }).waitFor();
    await page.getByText("Aiko Abebe").first().click();
    await page.getByText("About me").waitFor();
  }),
  shot("edit-profile", async (page) => {
    await openUserMenu(page, "Edit profile");
    await page.getByRole("heading", { name: "Edit profile" }).waitFor();
  }),
  shot("user-settings", async (page) => {
    await setTheme(page, "Dark");
    await openUserMenu(page, "Settings");
    await page.getByRole("heading", { name: "Settings" }).waitFor();
  }),
  shot("meetings-availability", async (page) => {
    await openUserMenu(page, "Settings");
    const heading = page.getByRole("heading", { name: "1-on-1s", exact: true });
    await heading.waitFor();
    await heading.evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.evaluate(() => window.scrollBy(0, -100));
  }),
  shot(
    "kiosk-mode",
    async (page) => {
      const dayOne = DateTime.now()
        .setZone("Europe/Berlin")
        .plus({ days: 14 })
        .set({ hour: 14, minute: 35, second: 0, millisecond: 0 });
      await page.goto("/Conference-Gamma?dev=1");
      await page
        .getByLabel("Pick date and time")
        .fill(dayOne.toFormat("yyyy-MM-dd'T'HH:mm"));
      await page.getByText(dayOne.toFormat("yyyy-MM-dd")).waitFor();
      await page.waitForLoadState("networkidle");
      await page.goto("/Conference-Gamma?kiosk=1");
      await page.getByTestId("now-line").waitFor();
      await page.waitForTimeout(1500);
    },
    { timezoneId: "Europe/Berlin" }
  ),
  shot("meeting-request", async (page) => {
    await page.getByRole("link", { name: "Attendees" }).click();
    await page.getByRole("heading", { name: "Attendees" }).waitFor();
    await page.getByText("Ahmad Karimi").first().click();
    await page.getByRole("button", { name: "Schedule a 1-on-1" }).click();
    const dialog = page.getByRole("dialog");
    // "Busy" and "Unavailable" slots carry that word in their name.
    await dialog
      .getByRole("button", { name: /^\d\d:\d\d – \d\d:\d\d$/ })
      .last()
      .click();
    await dialog.getByRole("button", { name: "Coffee bar" }).click();
    await dialog
      .getByLabel(/context/i)
      .fill("Would love to hear how you got developer tooling adopted.");
  }),
  shot("meeting-answer", async (page) => {
    await openEvent(page, "Conference Gamma");
    await page
      .getByRole("link", { name: /needs your reply/ })
      .first()
      .click();
    await page.getByRole("button", { name: "Accept" }).waitFor();
  }),
  shot("meetings-schedule-column", async (page) => {
    await openEvent(page, "Conference Gamma");
    await scrollGridTo(page, "12:00");
  }),
  shot("meeting-book-from-grid", async (page) => {
    await openEvent(page, "Conference Gamma");
    await scrollGridTo(page, "12:00");
    await page
      .getByRole("button", { name: /^Arrange a 1-on-1 at 14:(30|40)/ })
      .first()
      .click();
    await page.getByText(/Who.s free at/).waitFor();
  }),
  shot("admin-events", async (page) => {
    await adminLogin(page);
    await page.getByRole("heading", { name: "Events" }).waitFor();
  }),
  shot("admin-event-settings", async (page) => {
    await manageGamma(page);
  }),
  shot("admin-meetings", async (page) => {
    await manageGamma(page);
    const form = page.getByRole("form", { name: "Meetings" });
    await form.evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.evaluate(() => window.scrollBy(0, -80));
  }),
  shot("mobile-schedule", (page) => openGammaOnPhone(page), {
    kind: "mobile",
  }),
  shot(
    "mobile-session-details",
    async (page) => {
      await openGammaOnPhone(page);
      await page.getByText("Edge Rendering in Production").first().click();
      await page.getByText("Closed Session", { exact: true }).waitFor();
    },
    { kind: "mobile" }
  ),
];
