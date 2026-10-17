// @module-tag 015-US2
import { describe, it, expect } from "vitest";
import { followsEvent } from "@/app/legacy/admin/events/[id]/use-event-section";

const loaded = { values: { name: "Sent" }, version: 2 };

describe("an event page section after the event changes", () => {
  it("follows the event when the form still holds what it loaded or sent", () => {
    expect(followsEvent({ name: "Sent" }, loaded, 3)).toBe(true);
  });

  it("keeps edits typed after the last load or save", () => {
    expect(followsEvent({ name: "Sent, then more" }, loaded, 3)).toBe(false);
  });

  it("does nothing while the event is unchanged", () => {
    expect(followsEvent({ name: "Sent" }, loaded, 2)).toBe(false);
  });
});
