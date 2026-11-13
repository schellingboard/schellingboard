import type { StatsTable } from "@schellingboard/contracts/stats";
import {
  STATS_COLUMNS,
  statsCellEnglish,
} from "@schellingboard/domain/stats/text";

export type EnglishTable = Omit<StatsTable, "columns"> & {
  columns: (StatsTable["columns"][number] & { label: string })[];
};

/** Reads label ids as their English text, so tests can name rows and columns plainly. */
export function inEnglish<T extends { tables: StatsTable[] }>(
  stats: T
): Omit<T, "tables"> & { tables: EnglishTable[] } {
  return {
    ...stats,
    tables: stats.tables.map((table) => ({
      ...table,
      columns: table.columns.map((c) => ({
        ...c,
        label: (STATS_COLUMNS as Record<string, string>)[c.labelId],
      })),
      rows: table.rows.map((row) =>
        row.map((cell, i) =>
          table.columns[i].type === "label" && typeof cell === "string"
            ? statsCellEnglish(cell)
            : cell
        )
      ),
    })),
  };
}
