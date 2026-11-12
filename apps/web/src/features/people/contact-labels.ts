import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { ContactType } from "@schellingboard/domain/guest";

const CONTACT_LABEL: Record<ContactType, MessageDescriptor> = {
  email: msg`Email`,
  phone: msg`Phone`,
  whatsapp: msg`WhatsApp`,
  signal: msg`Signal`,
  telegram: msg`Telegram`,
  discord: msg`Discord`,
  website: msg`Website`,
  other: msg({
    message: "Other",
    comment: "Kind of contact detail that is none of the listed ones",
  }),
};

export function contactLabel(type: ContactType): string {
  return i18n._(CONTACT_LABEL[type]);
}
