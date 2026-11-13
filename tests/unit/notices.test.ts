import { describe, expect, it } from "vitest";

import { emailTime } from "@/server/kernel/localized-text";
import { renderNotice } from "@/server/kernel/notice";
import { translatorFor } from "@/server/kernel/translator";
import {
  meetingNudgeAnsweredNotice,
  meetingNudgeNotice,
  meetingOutcomeNotice,
  meetingRequestNotice,
  reminderNotice,
  sessionChangedNotice,
} from "@/utils/notices";

const english = translatorFor(null);
const say = (notice: Parameters<typeof renderNotice>[0]) =>
  renderNotice(notice, english);
const at = (iso: string) =>
  emailTime(new Date(iso), new Date(new Date(iso).getTime() + 3600_000), "UTC");

describe("notices in English", { tags: ["022-US2"] }, () => {
  it("say what changed, with the old values", () => {
    const change = {
      newTime: at("2026-06-01T10:00:00Z"),
      oldTime: at("2026-06-01T09:00:00Z"),
      newLocation: ["Room B"],
      oldLocation: [],
    };
    expect(say(sessionChangedNotice("host", "Talk", change))).toBe(
      'Your session "Talk" is now Monday 1 June, 10:00–11:00, Room B (was Monday 1 June, 09:00–10:00, no location)'
    );
    expect(
      say(
        sessionChangedNotice("attendee", "Talk", {
          ...change,
          oldTime: undefined,
        })
      )
    ).toBe('"Talk" moved to Room B (was no location)');
  });

  it("say unscheduled inside the sentence", () => {
    const unscheduled = emailTime(null, null, "UTC");
    expect(
      say(
        sessionChangedNotice("attendee", "Talk", {
          newTime: unscheduled,
          oldTime: at("2026-06-01T09:00:00Z"),
          newLocation: [],
        })
      )
    ).toBe('"Talk" moved to unscheduled (was Monday 1 June, 09:00–10:00)');
  });

  it("name the outcome and the reminder", () => {
    expect(
      say(meetingOutcomeNotice("Ada", "declined", at("2026-06-01T10:00:00Z")))
    ).toBe("Ada declined your 1-on-1 request for Monday 1 June, 10:00–11:00");
    expect(say(reminderNotice("followUp", "Talk"))).toBe(
      'How many people came to "Talk"?'
    );
  });
});

describe("notices about a deleted guest", { tags: ["022-US2"] }, () => {
  const german = translatorFor("de");
  const when = at("2026-06-01T10:00:00Z");
  const notices = [
    meetingRequestNotice(undefined, when),
    meetingOutcomeNotice(undefined, "accepted", when),
    meetingOutcomeNotice(undefined, "declined", when),
    meetingOutcomeNotice(undefined, "canceled", when),
    meetingNudgeNotice(undefined, "Conf"),
    meetingNudgeAnsweredNotice(undefined, "Conf"),
  ];

  it("do not store an English placeholder as a value", () => {
    for (const notice of notices) {
      expect(JSON.stringify(notice.values)).not.toContain("Someone");
    }
  });

  it("start with Someone in English and Jemand in German", () => {
    for (const notice of notices) {
      expect(renderNotice(notice, english)).toMatch(/^Someone /);
      expect(renderNotice(notice, german)).toMatch(/^Jemand /);
    }
  });
});
