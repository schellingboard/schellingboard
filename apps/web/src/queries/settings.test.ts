import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createSettingsQuery } from "./settings";

const emailSettings = { rsvpChange: true, hostChange: false };
const forms = [
  { eventId: "e1", eventName: "Con", timezone: "UTC", days: [], declared: [] },
];

const answer = (path: string) => {
  if (path.endsWith("/me/email-settings")) return Response.json(emailSettings);
  if (path.endsWith("/meeting-availability")) return Response.json({ forms });
  return Response.json({ publicKey: "key" });
};

describe("the settings page's data", { tags: ["013-US5"] }, () => {
  it("is ready once the settings, the forms and the push key are in", async () => {
    const { api } = fakeApi((call) => answer(call.path));
    const query = createSettingsQuery({ api });
    expect(query.get().status).toBe("loading");

    await query.load();

    expect(query.get()).toEqual({
      status: "ready",
      emailSettings,
      forms,
      publicKey: "key",
    });
  });

  it("reports why the viewer cannot have settings", async () => {
    const { api } = fakeApi((call) =>
      call.path.endsWith("/me/email-settings")
        ? problem(403, "guest.unselected")
        : answer(call.path)
    );
    const query = createSettingsQuery({ api });

    await query.load();

    expect(query.get()).toEqual({ status: "error", code: "guest.unselected" });
  });
});
