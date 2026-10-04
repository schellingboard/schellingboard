// @module-tag 013-US6
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

vi.mock("@/utils/mailer", () => ({ sendMail: vi.fn() }));
vi.mock("@/utils/push", () => ({ pushToGuest: vi.fn() }));

import { sendMail } from "@/utils/mailer";
import { pushToGuest } from "@/utils/push";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import { runJobs } from "../helpers/jobs";
import { notifyGuest } from "@/utils/notifications";
import { getRepositories } from "@/db/container";
import { buildEmail, type EmailRecipe } from "@/emails/registry";

const RECIPE: EmailRecipe = {
  template: "sessionDeleted",
  props: {
    recipient: "attendee",
    title: "Workshop",
    time: "10:00 - 01 Jun",
    location: "Room A",
    eventUrl: "https://site.example/e",
  },
};
const T0 = new Date("2026-06-01T10:00:00.000Z");
const IN_APP = { text: '"Workshop" was deleted', url: "/e", at: T0 };
const minutes = (n: number) => new Date(T0.getTime() + n * 60 * 1000);

async function subscribe(guestId: string) {
  await getRepositories().push.saveSubscription({
    guestId,
    endpoint: `https://push.example/${guestId}`,
    p256dh: "p256dh",
    auth: "auth",
    createdAt: T0,
  });
}

describe("deliveries", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => {
    resetTestDb();
    vi.mocked(sendMail).mockReset();
    vi.mocked(pushToGuest).mockReset();
    vi.stubEnv("SITE_URL", "https://site.example");
  });

  it("sends email and push from the jobs, not while notifying", async () => {
    const guest = await createGuest({ email: "ari@test.example" });
    await subscribe(guest.id);

    await notifyGuest(guest.id, "rsvpChange", RECIPE, IN_APP);
    expect(sendMail).not.toHaveBeenCalled();
    expect(pushToGuest).not.toHaveBeenCalled();

    await runJobs(T0);
    expect(sendMail).toHaveBeenCalledExactlyOnceWith({
      to: "ari@test.example",
      ...buildEmail(RECIPE),
    });
    expect(pushToGuest).toHaveBeenCalledExactlyOnceWith(
      guest.id,
      { title: buildEmail(RECIPE).subject, ...IN_APP },
      T0
    );
  });

  it("enqueues no email for a guest who opted out of it", async () => {
    const guest = await createGuest({
      email: "ari@test.example",
      emailSettings: { rsvpChange: false },
    });
    await subscribe(guest.id);

    await notifyGuest(guest.id, "rsvpChange", RECIPE, IN_APP);
    await runJobs(T0);

    expect(sendMail).not.toHaveBeenCalled();
    expect(pushToGuest).toHaveBeenCalledOnce();
  });

  it("retries a failed email after a pause, and sends it once", async () => {
    const guest = await createGuest({ email: "ari@test.example" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(sendMail).mockRejectedValueOnce(new Error("SMTP down"));
    await notifyGuest(guest.id, "rsvpChange", RECIPE, IN_APP);

    await runJobs(T0);
    expect(sendMail).toHaveBeenCalledTimes(1);

    await runJobs(minutes(0.5));
    expect(sendMail).toHaveBeenCalledTimes(1);

    await runJobs(minutes(2));
    expect(sendMail).toHaveBeenCalledTimes(2);

    await runJobs(minutes(60));
    expect(sendMail).toHaveBeenCalledTimes(2);
  });

  it("gives up on an email that has failed for a day", async () => {
    const guest = await createGuest({ email: "ari@test.example" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(sendMail).mockRejectedValue(new Error("SMTP down"));
    await notifyGuest(guest.id, "rsvpChange", RECIPE, IN_APP);

    await runJobs(T0);
    await runJobs(minutes(25 * 60));
    const attempts = vi.mocked(sendMail).mock.calls.length;

    await runJobs(minutes(30 * 60));
    expect(sendMail).toHaveBeenCalledTimes(attempts);
  });

  it("queues no push for a guest without a device", async () => {
    const guest = await createGuest({ email: "ari@test.example" });

    await notifyGuest(guest.id, "rsvpChange", RECIPE, IN_APP);
    await runJobs(T0);

    expect(pushToGuest).not.toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it("mails the address the guest has when it is sent", async () => {
    const guest = await createGuest({ name: "Ari", email: "old@test.example" });
    await notifyGuest(guest.id, "rsvpChange", RECIPE, IN_APP);
    await getRepositories().guests.update(guest.id, {
      name: "Ari",
      info: { email: "new@test.example" },
    });

    await runJobs(T0);

    expect(vi.mocked(sendMail).mock.calls.map(([m]) => m.to)).toEqual([
      "new@test.example",
    ]);
  });

  it("drops what was queued for a guest who is deleted", async () => {
    const guest = await createGuest({ email: "ari@test.example" });
    await notifyGuest(guest.id, "rsvpChange", RECIPE, IN_APP);
    await getRepositories().guests.delete(guest.id);

    await runJobs(T0);

    expect(sendMail).not.toHaveBeenCalled();
  });

  it("gives up at once on an email whose template no longer exists", async () => {
    const guest = await createGuest({ email: "ari@test.example" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    await getRepositories().deliveries.enqueue({
      guestId: guest.id,
      channel: "email",
      payload: { recipe: { template: "retiredTemplate", props: {} } },
    });

    await runJobs(T0);
    await runJobs(minutes(2));

    expect(sendMail).not.toHaveBeenCalled();
    expect(
      await getRepositories().deliveries.claimDue(minutes(60), 10, 1000)
    ).toEqual([]);
  });

  it("gives up at once on an email the server refuses for its recipient", async () => {
    const guest = await createGuest({ email: "ari@test.example" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(sendMail).mockRejectedValue(
      Object.assign(new Error("Mailbox unavailable"), {
        responseCode: 550,
        command: "RCPT TO",
      })
    );
    await notifyGuest(guest.id, "rsvpChange", RECIPE, IN_APP);

    await runJobs(T0);
    await runJobs(minutes(2));

    expect(sendMail).toHaveBeenCalledOnce();
  });

  it("retries an email the server refuses for a login it rejects", async () => {
    const guest = await createGuest({ email: "ari@test.example" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(sendMail).mockRejectedValueOnce(
      Object.assign(new Error("Invalid login"), {
        responseCode: 535,
        command: "AUTH PLAIN",
      })
    );
    await notifyGuest(guest.id, "rsvpChange", RECIPE, IN_APP);

    await runJobs(T0);
    await runJobs(minutes(2));

    expect(sendMail).toHaveBeenCalledTimes(2);
  });

  it("does not hand a claimed delivery to a second run", async () => {
    const guest = await createGuest({ email: "ari@test.example" });
    await notifyGuest(guest.id, "rsvpChange", RECIPE, IN_APP);
    const { deliveries } = getRepositories();

    expect(await deliveries.claimDue(T0, 10, 5 * 60 * 1000)).toHaveLength(1);
    expect(await deliveries.claimDue(minutes(1), 10, 5 * 60 * 1000)).toEqual(
      []
    );
  });
});
