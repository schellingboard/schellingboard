import type { ChangeContext } from "@schellingboard/domain/change";

export const byAdmin = (at: Date): ChangeContext => ({
  actor: { type: "admin" },
  at,
});

export const byGuest = (id: string, at: Date): ChangeContext => ({
  actor: { type: "guest", id },
  at,
});
