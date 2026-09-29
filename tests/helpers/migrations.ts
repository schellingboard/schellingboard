import fs from "fs";
import path from "path";

export const MIGRATIONS = path.join(process.cwd(), "drizzle");

/** A copy of drizzle/ whose journal stops before `idx`. */
export function migrationsBefore(idx: number, into: string): string {
  const folder = path.join(into, `migrations-before-${idx}`);
  fs.mkdirSync(path.join(folder, "meta"), { recursive: true });
  const journal = JSON.parse(
    fs.readFileSync(path.join(MIGRATIONS, "meta/_journal.json"), "utf8")
  ) as { entries: { idx: number; tag: string }[] };
  journal.entries = journal.entries.filter((entry) => entry.idx < idx);
  fs.writeFileSync(
    path.join(folder, "meta/_journal.json"),
    JSON.stringify(journal)
  );
  for (const entry of journal.entries) {
    fs.copyFileSync(
      path.join(MIGRATIONS, `${entry.tag}.sql`),
      path.join(folder, `${entry.tag}.sql`)
    );
  }
  return folder;
}
