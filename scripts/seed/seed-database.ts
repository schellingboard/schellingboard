import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { resolveDbPath } from "@/db/migrate";

import { clearAll, type SeedProfile, seedTestData } from "./seed";

const mode = process.env.NODE_ENV ?? "dev";
const envFileLocal = path.resolve(process.cwd(), `.env.${mode}.local`);
const envFileShared = path.resolve(process.cwd(), `.env.${mode}`);
const envFile = fs.existsSync(envFileLocal)
  ? envFileLocal
  : fs.existsSync(envFileShared)
    ? envFileShared
    : null;
if (envFile) dotenv.config({ path: envFile });

if (process.env.NODE_ENV === "production") {
  throw new Error("🚨 SAFETY: Cannot reset production database!");
}

export function resolveProfile(): SeedProfile {
  const fromEnv = process.env.SEED_PROFILE;
  if (fromEnv === "small" || fromEnv === "large") return fromEnv;
  if (fromEnv) {
    throw new Error(`Invalid SEED_PROFILE "${fromEnv}" (use small or large)`);
  }
  return process.env.NODE_ENV === "test" ? "small" : "large";
}

async function resetDatabase(
  profile: SeedProfile = resolveProfile(),
  now = new Date()
) {
  try {
    console.log("🔄 Resetting test database to known state...");
    console.log(`📍 Database: ${resolveDbPath()}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "dev"}`);
    console.log(`📦 Seed profile: ${profile}`);

    clearAll();
    await seedTestData(profile, now);

    console.log("🎉 Database reset completed successfully!");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Database reset failed:", message);
    process.exit(1);
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  await resetDatabase();
}

export { resetDatabase };
