export const CONTACT_TYPES = [
  "email",
  "phone",
  "whatsapp",
  "signal",
  "telegram",
  "discord",
  "website",
  "other",
] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
  signal: "Signal",
  telegram: "Telegram",
  discord: "Discord",
  website: "Website",
  other: "Other",
};

// Entry caps keep profiles and the edit form scannable.
export const MAX_LANGUAGES = 10;
export const MAX_CONTACTS = 10;
