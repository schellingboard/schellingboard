import { NextRequest } from "next/server";
import { PUT } from "@/tests/helpers/v1-route";

type Problem = { code: string; detail?: string };
type ProfileFields = Record<string, unknown> & {
  avatar?: File;
  expectedVersion?: number;
};

/** What the edit-profile form does as a guest holding `cookies`: the photo first, then the details. */
export async function saveProfile(
  cookies: Map<string, string>,
  fields: ProfileFields
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { avatar, ...rest } = fields;
  let expectedVersion = fields.expectedVersion;
  const send = (path: string, init: { body: BodyInit; json?: boolean }) =>
    PUT(
      new NextRequest(`http://test/api/v1${path}`, {
        method: "PUT",
        headers: {
          cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join("; "),
          ...(init.json ? { "content-type": "application/json" } : {}),
        },
        body: init.body,
      })
    );
  const failed = async (res: Response) => {
    const problem = (await res.json()) as Problem;
    return { ok: false as const, error: problem.detail ?? problem.code };
  };

  if (avatar) {
    const form = new FormData();
    form.set("avatar", avatar);
    form.set("expectedVersion", String(expectedVersion));
    const res = await send("/me/avatar", { body: form });
    if (!res.ok) return failed(res);
    expectedVersion = ((await res.json()) as { version: number }).version;
  }
  const res = await send("/me/profile", {
    json: true,
    body: JSON.stringify({ ...rest, expectedVersion }),
  });
  return res.ok ? { ok: true } : failed(res);
}
