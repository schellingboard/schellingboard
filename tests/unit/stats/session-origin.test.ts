import { describe, expect, it } from "vitest";
import { sessionOrigin } from "@schellingboard/domain/stats/session-origin";

describe("sessionOrigin", { tags: ["021-US3"] }, () => {
  const base = { blocker: false, proposalId: null, adminManaged: false };

  it("is blocker before anything else", () => {
    expect(
      sessionOrigin({ blocker: true, proposalId: "p", adminManaged: true })
    ).toBe("blocker");
  });

  it("is proposal when a proposal is linked", () => {
    expect(
      sessionOrigin({ ...base, proposalId: "p", adminManaged: true })
    ).toBe("proposal");
  });

  it("is organizer when admin-managed without a proposal", () => {
    expect(sessionOrigin({ ...base, adminManaged: true })).toBe("organizer");
  });

  it("is spontaneous otherwise", () => {
    expect(sessionOrigin(base)).toBe("spontaneous");
  });
});
