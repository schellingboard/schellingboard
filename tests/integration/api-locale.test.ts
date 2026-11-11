import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { GET, PUT } from "@/tests/helpers/v1-route";
import { getRepositories } from "@/db/container";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import { GUEST_COOKIE_NAME, openGuestValue } from "../helpers/guest-cookie";

const asGuest = (id: string) => `${GUEST_COOKIE_NAME}=${openGuestValue(id)}`;

const saveLocale = (locale: unknown, cookie?: string) =>
  PUT(
    new Request("http://test/api/v1/me/locale", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify({ locale }),
    })
  );

const whoAmI = (cookie: string) =>
  GET(new Request("http://test/api/v1/me/identity", { headers: { cookie } }));

beforeAll(() => setupTestDb());
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
});

describe("/api/v1/me/locale", { tags: ["022-US1"] }, () => {
  it("stores the guest's language and tells it with the identity", async () => {
    const ada = await createGuest();
    const cookie = asGuest(ada.id);
    expect(await (await whoAmI(cookie)).json()).toEqual({
      guestId: ada.id,
      locale: null,
    });

    const res = await saveLocale("en", cookie);

    expect(res.status).toBe(204);
    expect(await (await whoAmI(cookie)).json()).toEqual({
      guestId: ada.id,
      locale: "en",
    });
    expect((await getRepositories().guests.findById(ada.id))?.info.locale).toBe(
      "en"
    );
  });

  it("goes back to following the browser on null", async () => {
    const ada = await createGuest();
    await saveLocale("en", asGuest(ada.id));

    const res = await saveLocale(null, asGuest(ada.id));

    expect(res.status).toBe(204);
    expect(
      (await getRepositories().guests.findById(ada.id))?.info.locale
    ).toBeNull();
  });

  it("refuses a language the app does not have", async () => {
    const ada = await createGuest();

    const res = await saveLocale("tlh", asGuest(ada.id));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: "request.invalid" });
    expect(
      (await getRepositories().guests.findById(ada.id))?.info.locale
    ).toBeNull();
  });

  it("refuses nobody", async () => {
    const res = await saveLocale("en");

    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "guest.unselected" });
  });
});
