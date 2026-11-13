import { describe, expect, it } from "vitest";

import {
  filterSummaryText,
  statsColumnLabel,
  statsLabelText,
  statsTitle,
} from "./stats-text";

describe("statistics text", { tags: ["021-US1"] }, () => {
  it("turns ids into text and keeps unknown ids as they are", () => {
    expect(statsTitle("headlineNumbers")).toBe("Headline numbers");
    expect(statsColumnLabel("shareOfMembersPercent")).toBe(
      "Share of members (%)"
    );
    expect(statsLabelText("votedOnly")).toBe("Voted only");
    expect(statsLabelText("somethingNew")).toBe("somethingNew");
  });

  it("puts a raw value into the text that embeds one", () => {
    expect(statsLabelText("sessionsDay:2026-05-01")).toBe(
      "Sessions: 2026-05-01"
    );
    expect(statsLabelText("literal:Room: A")).toBe("Room: A");
  });

  it("names a contact type with the contact labels", () => {
    expect(statsLabelText("contactType:whatsapp")).toBe("WhatsApp");
    expect(statsLabelText("contactType:carrier-pigeon")).toBe("carrier-pigeon");
  });

  it("words the filter from what it leaves out", () => {
    const none = { locations: 0, hosts: 0, origins: [] as const };
    expect(filterSummaryText({ ...none, origins: [] }, "en")).toBe(
      "No exclusions"
    );
    expect(
      filterSummaryText({ locations: 1, hosts: 2, origins: ["blocker"] }, "en")
    ).toBe("Excluding 1 location, 2 hosts, blockers");
  });
});
