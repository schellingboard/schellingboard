// @module-tag 009-US1
import { act, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NoticeProvider } from "../ui/notices";
import { fakeApi, problem } from "./fake-api";
import { useFormMutation } from "./use-form-mutation";

function setup(
  handler: Parameters<typeof fakeApi>[0],
  successMessage?: string,
  fieldNames?: string[]
) {
  const { api, calls } = fakeApi(handler);
  const hook = renderHook(
    () =>
      useFormMutation({
        call: (key) =>
          api.PUT("/api/v1/comments/{id}", {
            params: { path: { id: "c" } },
            body: { body: "x" },
            headers: { "Idempotency-Key": key },
          }),
        successMessage,
        fieldNames,
      }),
    { wrapper: NoticeProvider }
  );
  return { ...hook, calls };
}

describe("useFormMutation", () => {
  it("keeps the key until a save succeeds, so a repeat is not applied twice", async () => {
    let status = 503;
    const { result, calls } = setup(() =>
      status === 503 ? new Response(null, { status }) : Response.json({})
    );

    await act(() => result.current.submit());
    status = 200;
    await act(() => result.current.submit());
    await act(() => result.current.submit());

    expect(calls[0].key).toBe(calls[1].key);
    expect(calls[2].key).not.toBe(calls[1].key);
  });

  it("holds the field errors and clears them on the next submit", async () => {
    let refuse = true;
    const { result } = setup(() =>
      refuse
        ? Response.json(
            {
              type: "x",
              title: "x",
              status: 400,
              code: "validation.failed",
              errors: [{ path: "body", message: "Too long" }],
            },
            { status: 400 }
          )
        : Response.json({})
    );

    await act(() => result.current.submit());
    expect(result.current.fields).toEqual({ body: "Too long" });
    expect(result.current.error).toBe("Please fix the highlighted fields.");

    refuse = false;
    await act(() => result.current.submit());
    expect(result.current.fields).toEqual({});
    expect(result.current.error).toBeNull();
  });

  it("is pending while the call is in flight", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const { result } = setup(async () => {
      await gate;
      return Response.json({});
    });

    let done!: Promise<unknown>;
    act(() => {
      done = result.current.submit();
    });
    expect(result.current.pending).toBe(true);
    release();
    await act(() => done);
    expect(result.current.pending).toBe(false);
  });

  it("confirms a save through the notice region", async () => {
    const { result } = setup(() => Response.json({}), "Comment saved");

    await act(() => result.current.submit());

    expect(screen.getByRole("status").textContent).toContain("Comment saved");
  });

  it("uses a new key after the server answered, as it stores every answer but a 5xx", async () => {
    let status = 400;
    const { result, calls } = setup(() => problem(status, "validation.failed"));

    await act(() => result.current.submit());
    status = 403;
    await act(() => result.current.submit());

    expect(calls[0].key).not.toBe(calls[1].key);
  });

  it("ignores a second submit while the first is in flight", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const { result, calls } = setup(async () => {
      await gate;
      return Response.json({});
    });

    let first!: Promise<unknown>;
    act(() => {
      first = result.current.submit();
      void result.current.submit();
    });
    release();
    await act(() => first);

    expect(calls).toHaveLength(1);
  });

  it("shows server errors on no known field in the form error", async () => {
    const { result } = setup(
      () =>
        Response.json(
          {
            type: "x",
            title: "x",
            status: 400,
            code: "validation.failed",
            errors: [
              { path: "body", message: "Too long" },
              { path: "Idempotency-Key", message: "Key is malformed" },
            ],
          },
          { status: 400 }
        ),
      undefined,
      ["body"]
    );

    await act(() => result.current.submit());

    expect(result.current.fields).toEqual({ body: "Too long" });
    expect(result.current.error).toBe("Key is malformed");
  });
});
