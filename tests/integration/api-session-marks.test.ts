import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { PUT, DELETE } from "@/tests/helpers/v1-route";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createSession } from "../helpers/factories";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
});
afterEach(() => vi.unstubAllEnvs());

async function call(method: string, guestKnown: boolean, body?: unknown) {
  const event = await createEvent({ phase: "proposal" });
  const guest = await createGuest({ eventId: event.id });
  const session = await createSession(event.id);
  return new Request(
    `http://test/api/v1/sessions/${session.id}/marks/${guest.id}`,
    {
      method,
      headers: {
        "content-type": "application/json",
        ...(guestKnown
          ? { cookie: `${GUEST_COOKIE_NAME}=${openGuestValue(guest.id)}` }
          : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }
  );
}

describe("/api/v1 session marks", () => {
  it("marks and clears", { tags: ["007-US9"] }, async () => {
    expect(
      (await PUT(await call("PUT", true, { kind: "bookmark" }))).status
    ).toBe(204);
    expect((await DELETE(await call("DELETE", true))).status).toBe(204);
  });

  it("rejects a kind it does not know", { tags: ["007-US9"] }, async () => {
    expect((await PUT(await call("PUT", true, { kind: "x" }))).status).toBe(
      400
    );
  });

  it(
    "answers an unknown session with its problem code",
    { tags: ["007-US9"] },
    async () => {
      const event = await createEvent({ phase: "proposal" });
      const guest = await createGuest({ eventId: event.id });
      const res = await PUT(
        new Request(`http://test/api/v1/sessions/nope/marks/${guest.id}`, {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            cookie: `${GUEST_COOKIE_NAME}=${openGuestValue(guest.id)}`,
          },
          body: JSON.stringify({ kind: "bookmark" }),
        })
      );
      expect(res.status).toBe(404);
      expect(await res.json()).toMatchObject({ code: "session.notFound" });
    }
  );
});
