// @module-tag 009-US1
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { fakeApi, problem } from "./fake-api";
import { awaitMutation, validateFields } from "./mutation";

const call = (handler: Parameters<typeof fakeApi>[0]) => {
  const { api, calls } = fakeApi(handler);
  const send = (key: string) =>
    api.PUT("/api/v1/comments/{id}", {
      params: { path: { id: "c" } },
      body: { body: "x" },
      headers: { "Idempotency-Key": key },
    });
  return { send, calls };
};

describe("awaitMutation", () => {
  it("sends the key it is given and returns the data on success", async () => {
    const { send, calls } = call(() => Response.json({ id: "c" }));

    const result = await awaitMutation(send, "key-1");

    expect(result).toMatchObject({ ok: true, data: { id: "c" } });
    expect(calls[0].key).toBe("key-1");
  });

  it("puts the server's problem details onto their fields", async () => {
    const { send } = call(() =>
      Response.json(
        {
          type: "about:blank",
          title: "invalid",
          status: 400,
          code: "validation.failed",
          errors: [
            { path: "title", message: "Title is required" },
            { path: "hosts.0", message: "Unknown host" },
          ],
        },
        { status: 400, headers: { "content-type": "application/problem+json" } }
      )
    );

    expect(await awaitMutation(send, "k")).toMatchObject({
      ok: false,
      kind: "fields",
      fields: { title: "Title is required", "hosts.0": "Unknown host" },
      message: "Please fix the highlighted fields.",
    });
  });

  it("shows a 409 as a change made by someone else", async () => {
    const { send } = call(() => problem(409, "session.versionConflict"));

    expect(await awaitMutation(send, "k")).toEqual({
      ok: false,
      kind: "conflict",
      message: "Someone else changed this while you were editing it.",
    });
  });

  it("treats a 409 that is not a version conflict as a refusal with its reason", async () => {
    const { send } = call(() => problem(409, "session.full"));

    expect(await awaitMutation(send, "k")).toEqual({
      ok: false,
      kind: "refused",
      code: "session.full",
      message: "This session is full.",
    });
  });

  it("gives the reason for any other refusal", async () => {
    const { send } = call(() => problem(403, "comment.notAuthor"));

    expect(await awaitMutation(send, "k")).toEqual({
      ok: false,
      kind: "refused",
      code: "comment.notAuthor",
      message: "Only the author can change a comment.",
    });
  });

  describe("explaining refusals", () => {
    const refusal = (code: string, detail?: unknown) =>
      call(() =>
        Response.json(
          { type: "about:blank", title: "x", status: 400, code, detail },
          {
            status: 400,
            headers: { "content-type": "application/problem+json" },
          }
        )
      ).send;

    it("passes on the server's explanation only when asked to", async () => {
      const send = refusal("day.overlap", "Days cannot overlap");

      expect(await awaitMutation(send, "k")).toMatchObject({
        message: "The server refused this. Please try again.",
      });
      expect(
        await awaitMutation(send, "k", { explainRefusals: true })
      ).toMatchObject({ kind: "refused", message: "Days cannot overlap" });
    });

    it("prefers this app's wording to the explanation", async () => {
      const send = refusal("session.full", "developer wording");

      expect(
        await awaitMutation(send, "k", { explainRefusals: true })
      ).toMatchObject({ message: "This session is full." });
    });

    it("explains a server failure that carries a reason", async () => {
      const send = call(() =>
        Response.json(
          {
            type: "about:blank",
            title: "x",
            status: 503,
            code: "mail.failed",
            detail: "Failed to send test email: connection refused",
          },
          {
            status: 503,
            headers: { "content-type": "application/problem+json" },
          }
        )
      ).send;

      expect(
        await awaitMutation(send, "k", { explainRefusals: true })
      ).toMatchObject({
        kind: "refused",
        message: "Failed to send test email: connection refused",
      });
      expect(await awaitMutation(send, "k")).toMatchObject({
        kind: "unreachable",
      });
    });

    it("falls back when the explanation is empty or not text", async () => {
      for (const detail of ["", 42, undefined])
        expect(
          await awaitMutation(refusal("day.overlap", detail), "k", {
            explainRefusals: true,
          })
        ).toMatchObject({
          message: "The server refused this. Please try again.",
        });
    });
  });

  it("says it might not have been saved when the server or network failed", async () => {
    const server = call(() => new Response(null, { status: 503 }));
    const network = call(() => {
      throw new Error("offline");
    });

    for (const { send } of [server, network])
      expect(await awaitMutation(send, "k")).toMatchObject({
        ok: false,
        kind: "unreachable",
        message: expect.stringContaining("might not have been saved") as string,
      });
  });
});

describe("validateFields", () => {
  const schema = z.object({
    title: z.string().min(1, "Title is required"),
    count: z.number().min(1, "At least one"),
  });

  it("maps each failing field to its first message", () => {
    expect(validateFields(schema, { title: "", count: 0 })).toEqual({
      title: "Title is required",
      count: "At least one",
    });
  });

  it("returns nothing for valid values", () => {
    expect(validateFields(schema, { title: "a", count: 2 })).toBeUndefined();
  });
});
