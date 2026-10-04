import { describe, it, expect } from "vitest";
import { problemFromError } from "@/server/http/problem";
import {
  conflict,
  forbidden,
  gone,
  invalid,
  notFound,
} from "@/server/kernel/result";

describe("problemFromError", () => {
  it.each([
    [invalid("session.tooLong"), 400, "Bad Request"],
    [forbidden("guest.protected"), 403, "Forbidden"],
    [notFound("session.notFound"), 404, "Not Found"],
    [conflict("session.clash"), 409, "Conflict"],
    [gone("feed.expired"), 410, "Gone"],
  ])("maps %o to %i", async ({ error }, status, title) => {
    const res = problemFromError(error);
    expect(res.status).toBe(status);
    expect(res.headers.get("content-type")).toBe("application/problem+json");
    expect(await res.json()).toEqual({
      type: "about:blank",
      title,
      status,
      code: error.code,
    });
  });

  it("carries the detail when the error has one", async () => {
    const { error } = notFound("session.notFound", "No such session");
    expect(await problemFromError(error).json()).toMatchObject({
      detail: "No such session",
    });
  });
});
