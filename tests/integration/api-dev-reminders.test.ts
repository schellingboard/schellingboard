// @module-tag 001-US2b
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/tests/helpers/v1-route";
import { setupTestDb, resetTestDb } from "../helpers/db";

const dispatch = () =>
  POST(
    new NextRequest("http://test/api/v1/dev/reminders", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
    })
  );

describe("POST /api/v1/dev/reminders", () => {
  beforeAll(setupTestDb);
  beforeEach(resetTestDb);
  afterEach(() => vi.unstubAllEnvs());

  it("runs one reminder tick when the dev tools are on", async () => {
    vi.stubEnv("SB_ENABLE_DEV_TOOLS", "1");
    const res = await dispatch();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ sent: 0 });
  });

  it("is not there when the dev tools are off", async () => {
    vi.stubEnv("SB_ENABLE_DEV_TOOLS", "");
    const res = await dispatch();
    expect(res.status).toBe(404);
  });
});
