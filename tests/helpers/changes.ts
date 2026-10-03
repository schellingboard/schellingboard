import type { ChangeContext } from "@schellingboard/domain/change";

/** Who made a change, for tests that are not about who made it. */
export const BY_TEST: ChangeContext = {
  actor: { type: "system" },
  at: new Date("2026-01-01T00:00:00.000Z"),
};
