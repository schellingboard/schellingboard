import { describe, expect, it } from "vitest";

import { renderNotice } from "@/server/kernel/notice";
import { translatorFor } from "@/server/kernel/translator";
import { commentNotice } from "@/utils/notices";

const english = translatorFor(null);
const text = (...args: Parameters<typeof commentNotice>) =>
  renderNotice(commentNotice(...args), english);

// The line a guest reads in their notification list, where the title is what
// tells one row from another.
describe("commentNotice", () => {
  it("names the session or proposal, whoever is being told", () => {
    const subject = { kind: "session", title: "Hallway Track" } as const;
    expect(text(subject, "responsible", "Rosa Diaz")).toBe(
      'Rosa Diaz commented on "Hallway Track"'
    );
    expect(text(subject, "commenter", "Rosa Diaz")).toBe(
      'Rosa Diaz commented on "Hallway Track"'
    );
    expect(
      text(
        { kind: "proposal", title: "Ask Me Anything" },
        "responsible",
        "Rosa Diaz"
      )
    ).toBe('Rosa Diaz commented on "Ask Me Anything"');
  });

  // A profile has no title, so it is said from the reader's side instead.
  it("says whose profile it was, from the reader's side", () => {
    const subject = { kind: "profile", ownerName: "Anna Kowalska" } as const;
    expect(text(subject, "responsible", "Rosa Diaz")).toBe(
      "Rosa Diaz commented on your profile"
    );
    expect(text(subject, "commenter", "Rosa Diaz")).toBe(
      "Rosa Diaz commented on Anna Kowalska's profile"
    );
  });

  describe("when the author is gone", { tags: ["022-US2"] }, () => {
    const subject = { kind: "session", title: "Hallway Track" } as const;
    const say = (
      locale: "en" | "de",
      notice = commentNotice(subject, "responsible", undefined)
    ) => renderNotice(notice, translatorFor(locale));

    it("says Someone in English, without storing the word as a value", () => {
      const notice = commentNotice(subject, "responsible", undefined);
      expect(JSON.stringify(notice.values)).not.toContain("Someone");
      expect(say("en", notice)).toBe('Someone commented on "Hallway Track"');
    });

    it("says it in German", () => {
      expect(say("de")).toBe("Jemand hat „Hallway Track“ kommentiert");
    });

    it("keeps a stored name readable in German", () => {
      const notice = commentNotice(subject, "responsible", "Rosa Diaz");
      expect(say("de", notice)).toBe(
        "Rosa Diaz hat „Hallway Track“ kommentiert"
      );
    });
  });
});
