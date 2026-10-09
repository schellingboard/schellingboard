import fs from "fs";
import path from "path";

import { inject } from "vitest";

import { getRepositories, resetRepositories, restoreDb } from "@/db/container";

let _template: string | null = null;

// One database per worker process, in a directory the global setup removes:
// test files in a worker run one after another, so they can share the path.
export function setupTestDb(): void {
  const dir = path.join(inject("testDbDir"), String(process.pid));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "test.db");
  const template = path.join(dir, "template.db");
  for (const f of [file, `${file}-wal`, `${file}-shm`, template]) {
    fs.rmSync(f, { force: true });
  }
  process.env.DATABASE_URL = `file:${file}`;
  resetRepositories();
  getRepositories();
  // Closing the last connection checkpoints the WAL into the file.
  resetRepositories();
  fs.copyFileSync(file, template);
  _template = template;
  restoreDb(template);
}

export function resetTestDb(): void {
  if (!_template) throw new Error("Call setupTestDb() first");
  restoreDb(_template);
}
