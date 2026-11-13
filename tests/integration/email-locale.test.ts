// @module-tag 022-US2
import path from "node:path";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/mailer", () => ({ sendMail: vi.fn() }));
vi.mock("@/utils/push", () => ({ pushToGuest: vi.fn() }));
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
    ].join("\n")
  );
  return { ...actual, translatorFor: actual.createTranslators(dir) };
});

import { render } from "@react-email/render";

import type { EmailRecipe } from "@/emails/registry";
import { sendMail } from "@/utils/mailer";
import { notifyGuest } from "@/utils/notifications";

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
const IN_APP = { text: "You were added", url: "/s", at: T0 };

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
