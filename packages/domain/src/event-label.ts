/** Tailwind palette names; the web maps each to light and dark badge colours. */
export const LABEL_COLOR_NAMES = [
  "slate",
  "red",
  "orange",
  "amber",
  "green",
  "teal",
  "blue",
  "violet",
] as const;

export type LabelColorName = (typeof LABEL_COLOR_NAMES)[number];

export function isLabelColorName(value: string): value is LabelColorName {
  return (LABEL_COLOR_NAMES as readonly string[]).includes(value);
}

/** An organizer-made badge (Orga team, Volunteer) for one event's attendees. */
export type EventLabel = {
  id: string;
  eventId: string;
  name: string;
  description: string;
  color: LabelColorName;
  guestIds: string[];
};
