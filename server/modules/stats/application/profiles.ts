import type { StatsTable } from "@schellingboard/contracts/stats";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import {
  applyFilter,
  type StatsFilterInput,
} from "@schellingboard/domain/stats/filter";
import { suppressSmall } from "@schellingboard/domain/stats/suppression";
import {
  CONTACT_TYPE_LABELS,
  type ContactType,
} from "@schellingboard/domain/guest";
import { col, percent } from "./cells";

type Profile = EventFacts["profiles"][number];

const FIELDS: [string, (p: Profile) => boolean][] = [
  ["Photo", (p) => p.photo],
  ["About me", (p) => p.aboutMe],
  ["Pronouns", (p) => p.pronouns],
  ["Based in", (p) => p.basedIn !== ""],
  ["Languages", (p) => p.languages.length > 0],
  ["Prompts", (p) => p.prompts > 0],
  ["Contacts", (p) => p.contactTypes.length > 0],
];

const shownValues = (
  id: string,
  title: string,
  values: string[]
): StatsTable => ({
  id,
  title,
  columns: [
    col("value", "Value", "text"),
    col("members", "Members", "integer"),
  ],
  rows: suppressSmall(values).map((g) => [g.value, g.count]),
});

export function profileTables(
  facts: EventFacts,
  filter: StatsFilterInput
): StatsTable[] {
  if (!facts.profiles.some((p) => FIELDS.some(([, filled]) => filled(p))))
    return [];
  const { people } = applyFilter(facts, filter);
  const profiles = facts.profiles.filter((p) => people.has(p.guestId));

  const fields: StatsTable = {
    id: "profiles-fields",
    title: "Members with each profile field",
    columns: [
      col("field", "Field", "text"),
      col("members", "Members", "integer"),
      col("share", "Share of members", "percent"),
    ],
    rows: FIELDS.map(([label, filled]) => {
      const n = profiles.filter(filled).length;
      return [label, n, percent(n, people.size)];
    }),
  };

  const counts = Array.from({ length: FIELDS.length + 1 }, () => 0);
  for (const p of profiles)
    counts[FIELDS.filter(([, filled]) => filled(p)).length]++;
  const filledTable: StatsTable = {
    id: "profiles-filled",
    title: "Profile fields filled in per member",
    columns: [
      col("filled", "Fields filled in", "integer"),
      col("people", "Members", "integer"),
    ],
    rows: counts.map((n, i) => [i, n]),
  };

  const contactCounts = new Map<string, number>();
  for (const p of profiles)
    for (const type of new Set(p.contactTypes))
      contactCounts.set(type, (contactCounts.get(type) ?? 0) + 1);
  const contacts: StatsTable = {
    id: "profiles-contacts",
    title: "Contact types used",
    columns: [
      col("type", "Contact type", "text"),
      col("members", "Members", "integer"),
    ],
    rows: [...contactCounts]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([type, n]) => [
        CONTACT_TYPE_LABELS[type as ContactType] ?? type,
        n,
      ]),
  };

  const distinct = (values: string[]) => [
    ...new Map(values.map((v) => [v.trim().toLowerCase(), v])).values(),
  ];
  return [
    fields,
    filledTable,
    shownValues(
      "profiles-languages",
      "Languages (shared by at least 3 members)",
      profiles.flatMap((p) => distinct(p.languages))
    ),
    shownValues(
      "profiles-based-in",
      "Based in (shared by at least 3 members)",
      profiles.map((p) => p.basedIn)
    ),
    contacts,
  ];
}
