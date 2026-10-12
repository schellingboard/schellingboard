// @module-tag 019-US2
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { getRepositories } from "@/db/container";
import { commandKey } from "@/server/kernel/command-key";
import { runIdempotent } from "@/server/kernel/idempotency";
import { setupTestDb, resetTestDb } from "../helpers/db";

const T0 = new Date("2026-06-01T10:00:00.000Z");
const request = (key: string, bodyHash = "h") => ({
  actor: "-:open:g1",
  key,
  method: "POST",
  path: "/x",
  bodyHash,
});
const response = { status: 201, headers: {}, body: '{"ok":true}' };

describe("runIdempotent", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  it("passes the key to the run as its command key and returns its value", async () => {
    const repo = getRepositories().idempotency;
    const run = () => Promise.resolve({ value: commandKey(), response });
    const outcome = await runIdempotent(repo, request("k"), T0, run);
    expect(outcome).toEqual({ state: "ran", value: "k" });
  });

  it("lets a retry run again when the first run threw or had no response", async () => {
    const repo = getRepositories().idempotency;
    await expect(
      runIdempotent(repo, request("k"), T0, () =>
        Promise.reject(new Error("boom"))
      )
    ).rejects.toThrow("boom");
    const unstored = await runIdempotent(repo, request("k"), T0, () =>
      Promise.resolve({ value: "a", response: null })
    );
    expect(unstored).toEqual({ state: "ran", value: "a" });
    const again = await runIdempotent(repo, request("k"), T0, () =>
      Promise.resolve({ value: "b", response })
    );
    expect(again).toEqual({ state: "ran", value: "b" });
  });
});
