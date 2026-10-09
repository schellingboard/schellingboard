import fs from "fs";
import os from "os";
import path from "path";

import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    testDbDir: string;
  }
}

export default function setup(project: TestProject) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sb-test-db-"));
  project.provide("testDbDir", dir);
  return () => fs.rmSync(dir, { recursive: true, force: true });
}
