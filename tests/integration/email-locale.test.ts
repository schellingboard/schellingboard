// @module-tag 022-US2
import path from "node:path";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/mailer", () => ({ sendMail: vi.fn() }));
vi.mock("@/utils/push", () => ({
  pushToGuest: vi.fn(),
  generateVapidKeys: vi.fn(),
}));
vi.mock("@/server/kernel/translator", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/server/kernel/translator")>();
  const { mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(path.join(tmpdir(), "email-locales-"));
  mkdirSync(path.join(dir, "de"));
  writeFileSync(
    path.join(dir, "de", "messages.po"),
    [
      'msgid "You are now a co-host of: {title}"',
      'msgstr "Du bist jetzt Mit-Gastgeber von: {title}"',
      "",
      'msgid "Time:"',
      'msgstr "Zeit:"',
      "",
      'msgid "No location"',
      'msgstr "Kein Ort"',
      "",
      'msgid "{requesterName} asked you for a 1-on-1 on {time}"',
      'msgstr "{requesterName} möchte am {time} ein 1:1 mit dir"',
      "",
    ].join("\n")
  );
  return { ...actual, translatorFor: actual.createTranslators(dir) };
});

import { render } from "@react-email/render";

import { getRepositories } from "@/db/container";
import type { EmailRecipe } from "@/emails/registry";
import { emailTime } from "@/server/kernel/localized-text";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import { createNotificationUseCases } from "@/server/modules/notifications/module";
import { sendMail } from "@/utils/mailer";
import { meetingRequestNotice } from "@/utils/notices";
import { notifyGuest } from "@/utils/notifications";
import { pushToGuest } from "@/utils/push";

import { resetTestDb, setupTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import { runJobs } from "../helpers/jobs";

const RECIPE: EmailRecipe = {
  template: "cohostAdded",
  props: {
    title: "Workshop",
    // 22:30 UTC is already the next morning in Tokyo.
    time: {
      start: "2026-06-01T22:30:00.000Z",
      end: "2026-06-01T23:30:00.000Z",
      zone: "Asia/Tokyo",
    },
    location: [],
    sessionUrl: "https://site.example/s",
  },
};
const T0 = new Date("2026-06-01T10:00:00.000Z");
const IN_APP = {
  notice: { id: "added", message: "You were added" },
  url: "/s",
  at: T0,
};

async function mailTo(locale: string | null) {
  const guest = await createGuest({ email: "ari@test.example", locale });
  await notifyGuest(guest.id, "cohostAdd", RECIPE, IN_APP);
  await runJobs(T0);
  const message = vi.mocked(sendMail).mock.calls[0][0];
  return { subject: message.subject, html: await render(message.body) };
}

describe("emails follow the recipient's language", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    vi.mocked(sendMail).mockReset();
    vi.stubEnv("SITE_URL", "https://site.example");
  });

  it("writes the text and the day in the recipient's language and the event's zone", async () => {
    const { subject, html } = await mailTo("de");
    expect(subject).toBe("Du bist jetzt Mit-Gastgeber von: Workshop");
    expect(html).toContain("Zeit:");
    expect(html).toContain("Dienstag, 2. Juni um 07:30–08:30");
    expect(html).toContain("Kein Ort");
  });

  it.each([null, "xx"])(
    "reads as English for a locale of %s",
    async (locale) => {
      const { subject, html } = await mailTo(locale);
      expect(subject).toBe("You are now a co-host of: Workshop");
      expect(html).toContain("Tuesday 2 June, 07:30–08:30");
      expect(html).toContain("No location");
    }
  );
});

describe("notifications follow the reader's language", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    vi.mocked(pushToGuest).mockReset();
    vi.stubEnv("SITE_URL", "https://site.example");
  });

  const request = meetingRequestNotice(
    "Ada",
    emailTime(
      new Date("2026-06-01T22:30:00.000Z"),
      new Date("2026-06-01T23:00:00.000Z"),
      "Asia/Tokyo"
    )
  );
  const list = async (guestId: string) => {
    const result = await createNotificationUseCases({
      repos: getRepositories(),
      uow: unitOfWork,
      generateVapidKeys: vi.fn(),
    }).listMyNotifications({
      admin: false,
      guest: { id: guestId, level: "claimed" },
    });
    if (!result.ok) throw new Error(result.error.code);
    return result.value.notifications.map((n) => n.text);
  };

  it("reads a stored notification in the reader's language, and a row without a message as written", async () => {
    const ari = await createGuest({ locale: "de" });
    const bo = await createGuest();
    for (const guest of [ari, bo]) {
      await notifyGuest(
        guest.id,
        "meetingRequest",
        {
          template: "sessionLostHost",
          props: { title: "T", sessionUrl: "https://site.example/s" },
        },
        { notice: request, url: "/m", at: T0 }
      );
    }
    await getRepositories().notifications.create({
      guestId: ari.id,
      type: "rsvpChange",
      text: "Written before messages were stored",
      url: "/old",
      createdAt: new Date(T0.getTime() - 1000),
    });

    expect(await list(ari.id)).toEqual([
      "Ada möchte am Dienstag, 2. Juni um 07:30–08:00 ein 1:1 mit dir",
      "Written before messages were stored",
    ]);
    expect(await list(bo.id)).toEqual([
      "Ada asked you for a 1-on-1 on Tuesday 2 June, 07:30–08:00",
    ]);
  });

  it("sends a push in the recipient's language", async () => {
    const guest = await createGuest({ locale: "de" });
    await getRepositories().push.saveSubscription({
      guestId: guest.id,
      endpoint: "https://push.example/1",
      p256dh: "p",
      auth: "a",
      createdAt: T0,
    });
    await notifyGuest(guest.id, "cohostAdd", RECIPE, {
      notice: request,
      url: "/m",
      at: T0,
    });
    await runJobs(T0);

    expect(pushToGuest).toHaveBeenCalledWith(
      guest.id,
      expect.objectContaining({
        title: "Du bist jetzt Mit-Gastgeber von: Workshop",
        text: "Ada möchte am Dienstag, 2. Juni um 07:30–08:00 ein 1:1 mit dir",
      }),
      T0
    );
  });

  it("reads one notification in the reader's language", async () => {
    const guest = await createGuest({ locale: "de" });
    await notifyGuest(guest.id, "meetingRequest", RECIPE, {
      notice: request,
      url: "/m",
      at: T0,
    });
    const [stored] = await getRepositories().notifications.listByGuest(
      guest.id
    );
    const result = await createNotificationUseCases({
      repos: getRepositories(),
      uow: unitOfWork,
      generateVapidKeys: vi.fn(),
    }).readNotification(
      { admin: false, guest: { id: guest.id, level: "claimed" } },
      { id: stored.id },
      T0
    );
    if (!result.ok) throw new Error(result.error.code);
    expect(result.value.text).toBe(
      "Ada möchte am Dienstag, 2. Juni um 07:30–08:00 ein 1:1 mit dir"
    );
  });

  it("sends a push a former version queued, and one whose recipe cannot be built, with the stored text", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const guest = await createGuest({ locale: "de" });
    await getRepositories().push.saveSubscription({
      guestId: guest.id,
      endpoint: "https://push.example/1",
      p256dh: "p",
      auth: "a",
      createdAt: T0,
    });
    const stored = { title: "Stored", text: "Stored text", url: "/m" };
    await getRepositories().deliveries.enqueue({
      guestId: guest.id,
      channel: "push",
      payload: { ...stored, at: T0.toISOString() },
    });
    await getRepositories().deliveries.enqueue({
      guestId: guest.id,
      channel: "push",
      payload: {
        ...stored,
        at: T0.toISOString(),
        recipe: { template: "retiredTemplate", props: {} },
      },
    });
    await runJobs(T0);

    expect(pushToGuest).toHaveBeenCalledTimes(2);
    expect(pushToGuest).toHaveBeenCalledWith(
      guest.id,
      expect.objectContaining(stored),
      T0
    );
  });
});
