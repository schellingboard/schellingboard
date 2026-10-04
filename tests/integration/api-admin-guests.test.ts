import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import fs from "fs";
import os from "os";
import path from "path";

vi.mock("@/utils/mailer", () => ({ sendMail: vi.fn() }));

import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "@/app/api/v1/[[...route]]/route";
import { getRepositories } from "@/db/container";
import { createAdminAuthCookie } from "@/utils/auth";
import { sendMail } from "@/utils/mailer";
import { createImageFile } from "../helpers/utils";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest } from "../helpers/factories";

const VALID_SECRET = "0123456789abcdef0123456789abcdef";
const HANDLERS = { GET, POST, PUT, DELETE } as const;

let admin = "";
let uploadsDir = "";

function call(
  method: keyof typeof HANDLERS,
  path: string,
  {
    body,
    form,
    cookie = admin,
    key,
  }: { body?: unknown; form?: FormData; cookie?: string; key?: string } = {}
) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  if (key) headers["idempotency-key"] = key;
  return HANDLERS[method](
    new NextRequest(`http://test/api/v1${path}`, {
      method,
      headers,
      body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
    })
  );
}

beforeAll(() => setupTestDb());
beforeEach(async () => {
  resetTestDb();
  vi.mocked(sendMail).mockReset();
  uploadsDir = fs.mkdtempSync(path.join(os.tmpdir(), "uploads-test-"));
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
  vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
  vi.stubEnv("SB_UPLOADS_DIR", uploadsDir);
  const c = await createAdminAuthCookie();
  admin = `${c.name}=${c.value}`;
});
afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(uploadsDir, { recursive: true, force: true });
});

describe("/api/v1/admin guests and settings", () => {
  it(
    "refuses a caller without the admin cookie",
    { tags: ["019-US4"] },
    async () => {
      const guest = await createGuest();
      for (const [method, path] of [
        ["GET", "/admin/guests"],
        ["DELETE", `/admin/guests/${guest.id}`],
        ["GET", "/admin/settings"],
      ] as const) {
        const res = await call(method, path, { cookie: "" });
        expect(res.status).toBe(403);
        expect(await res.json()).toMatchObject({ code: "admin.required" });
      }
      expect(await getRepositories().guests.findById(guest.id)).toBeDefined();
    }
  );

  it(
    "creates a guest once per key, edits, assigns, lists and deletes it",
    { tags: ["019-US4", "019-US2"] },
    async () => {
      const event = await createEvent();
      const create = () =>
        call("POST", "/admin/guests", {
          body: { name: "Ada", email: "ada@x.org" },
          key: "guest-1",
        });
      const first = await create();
      expect(first.status).toBe(201);
      const guest = (await first.json()) as { id: string };
      expect(guest).toEqual({
        id: expect.any(String) as string,
        name: "Ada",
        email: "ada@x.org",
        authProtected: false,
        eventIds: [],
      });
      expect(await (await create()).json()).toEqual(guest);

      const taken = await call("POST", "/admin/guests", {
        body: { name: "Bo", email: "ADA@x.org" },
      });
      expect(taken.status).toBe(409);
      expect(await taken.json()).toMatchObject({
        code: "guest.emailTaken",
        errors: [{ path: "email" }],
      });

      const edited = await call("PUT", `/admin/guests/${guest.id}`, {
        body: { name: "Ada L.", email: "ada@x.org" },
      });
      expect(edited.status).toBe(200);
      expect(await edited.json()).toMatchObject({ name: "Ada L." });

      const assigned = await call(
        "POST",
        `/admin/events/${event.id}/guests/assign`,
        { body: { guestIds: [guest.id] } }
      );
      expect(assigned.status).toBe(204);
      const listed = await call("GET", "/admin/guests");
      expect(listed.headers.get("cache-control")).toBe("no-store");
      expect(await listed.json()).toEqual({
        guests: [{ ...guest, name: "Ada L.", eventIds: [event.id] }],
      });
      expect(
        (
          await call("POST", `/admin/events/${event.id}/guests/remove`, {
            body: { guestIds: [guest.id] },
          })
        ).status
      ).toBe(204);

      const mailed = await call("POST", `/admin/guests/${guest.id}/test-email`);
      expect(mailed.status).toBe(204);
      expect(vi.mocked(sendMail).mock.calls[0][0]).toMatchObject({
        to: "ada@x.org",
      });

      expect((await call("DELETE", `/admin/guests/${guest.id}`)).status).toBe(
        204
      );
      const gone = await call("DELETE", `/admin/guests/${guest.id}`);
      expect(gone.status).toBe(404);
      expect(await gone.json()).toMatchObject({ code: "guest.notFound" });
    }
  );

  it(
    "imports a CSV, answering every bad row at once",
    { tags: ["019-US4"] },
    async () => {
      const event = await createEvent();
      const bad = await call("POST", "/admin/guests/import", {
        body: { csv: "name,email\n,a@x.org", eventIds: [] },
      });
      expect(bad.status).toBe(400);
      expect(await bad.json()).toMatchObject({
        code: "guestImport.invalid",
        detail: "Invalid CSV file",
        errors: [{ path: "csv", message: "Line 2: name is missing" }],
      });

      const ok = await call("POST", "/admin/guests/import", {
        body: { csv: "name,email\nAda,ada@x.org", eventIds: [event.id] },
      });
      expect(ok.status).toBe(200);
      expect(await ok.json()).toEqual({ created: 1, existing: 0 });
    }
  );

  it(
    "reads and replaces the site settings with a map upload",
    { tags: ["019-US4"] },
    async () => {
      const form = new FormData();
      form.set("title", "Camp");
      form.set("description", "Welcome");
      form.set("image", await createImageFile(800, 500, "map.png"));
      const saved = await call("PUT", "/admin/settings", { form });
      expect(saved.status).toBe(200);
      const settings = (await saved.json()) as { mapImageUrl: string };
      expect(settings).toMatchObject({ title: "Camp", description: "Welcome" });
      expect(settings.mapImageUrl).toMatch(/^\/media\/site\/map\.png\?v=/);
      expect(fs.existsSync(path.join(uploadsDir, "site", "map.png"))).toBe(
        true
      );
      expect(await (await call("GET", "/admin/settings")).json()).toEqual(
        settings
      );

      const removing = new FormData();
      removing.set("title", "Camp");
      removing.set("removeMap", "true");
      const removed = await call("PUT", "/admin/settings", { form: removing });
      expect(await removed.json()).toEqual({
        title: "Camp",
        description: "",
        mapImageUrl: "",
      });

      const untitled = new FormData();
      untitled.set("title", " ");
      const refused = await call("PUT", "/admin/settings", { form: untitled });
      expect(refused.status).toBe(400);
      expect(await refused.json()).toMatchObject({
        code: "settings.titleRequired",
      });
    }
  );
});
