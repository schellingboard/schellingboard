import type { StatsTable } from "@schellingboard/contracts/stats";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import {
  applyFilter,
  type StatsFilterInput,
} from "@schellingboard/domain/stats/filter";
import { suppressSmall } from "@schellingboard/domain/stats/suppression";
import {
  type StatsCellId,
  statsRef,
  type StatsTitleId,
} from "@schellingboard/domain/stats/text";

import { col, percent } from "./cells";

type Profile = EventFacts["profiles"][number];

const FIELDS: [StatsCellId, (p: Profile) => boolean][] = [
  ["photo", (p) => p.photo],
  ["aboutMe", (p) => p.aboutMe],
  ["pronouns", (p) => p.pronouns],
  ["basedIn", (p) => p.basedIn !== ""],
  ["languages", (p) => p.languages.length > 0],
  ["prompts", (p) => p.prompts > 0],
  ["contacts", (p) => p.contactTypes.length > 0],
];

const shownValues = (
  id: string,
  titleId: StatsTitleId,
  values: string[]
): StatsTable => ({
  id,
  titleId,
  columns: [
    col("value", "value", "text"),
    col("members", "members", "integer"),
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
    titleId: "membersWithEachProfileField",
    columns: [
      col("field", "field", "label"),
      col("members", "members", "integer"),
      col("share", "shareOfMembers", "percent"),
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
    titleId: "profileFieldsFilledInPerMember",
    columns: [
      col("filled", "fieldsFilledIn", "integer"),
      col("people", "members", "integer"),
    ],
    rows: counts.map((n, i) => [i, n]),
  };

  const contactCounts = new Map<string, number>();
  for (const p of profiles)
    for (const type of new Set(p.contactTypes))
      contactCounts.set(type, (contactCounts.get(type) ?? 0) + 1);
  const contacts: StatsTable = {
    id: "profiles-contacts",
    titleId: "contactTypesUsed",
    columns: [
      col("type", "contactType", "label"),
      col("members", "members", "integer"),
    ],
    rows: [...contactCounts]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([type, n]) => [statsRef("contactType", type), n]),
  };

  const distinct = (values: string[]) => [
    ...new Map(values.map((v) => [v.trim().toLowerCase(), v])).values(),
  ];
  return [
    fields,
    filledTable,
    shownValues(
      "profiles-languages",
      "languagesShared",
      profiles.flatMap((p) => distinct(p.languages))
    ),
    shownValues(
      "profiles-based-in",
      "basedInShared",
      profiles.map((p) => p.basedIn)
    ),
    contacts,
  ];
}
