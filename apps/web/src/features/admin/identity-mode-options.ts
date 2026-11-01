import type { IdentityMode } from "@schellingboard/domain/event";

export const IDENTITY_MODE_OPTIONS: { value: IdentityMode; label: string }[] = [
  { value: "verified", label: "Verified: attendees prove who they are" },
  { value: "open", label: "Open: picking a name is enough" },
];

export const IDENTITY_MODE_HINT =
  "Verified events need a personal join link, an emailed code or a password. Open events let anyone act as any name.";
