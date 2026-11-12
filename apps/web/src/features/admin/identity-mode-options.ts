import { t } from "@lingui/core/macro";
import type { IdentityMode } from "@schellingboard/domain/event";

export const identityModeOptions = (): {
  value: IdentityMode;
  label: string;
}[] => [
  { value: "verified", label: t`Verified: attendees prove who they are` },
  { value: "open", label: t`Open: picking a name is enough` },
];

export const identityModeHint = () =>
  t`Verified events need a personal join link, an emailed code or a password. Open events let anyone act as any name.`;
