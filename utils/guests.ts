import type { Guest, CompleteGuest } from "@schellingboard/domain/guest";

export function sanitizeGuest(guest: CompleteGuest): Guest {
  const out = { ...guest, info: undefined };
  delete out.info;
  return out;
}
