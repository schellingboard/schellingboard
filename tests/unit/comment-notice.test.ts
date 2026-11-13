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
});
