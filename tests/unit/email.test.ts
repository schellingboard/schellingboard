import { describe, it, expect } from "vitest";
import { isValidEmail } from "@/utils/email";

describe("isValidEmail", () => {
  it.each(["a@b.co", "first.last@mail.example.org", "x+tag@foocorp.com"])(
    "accepts %s",
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    }
  );

  it.each(["", "not-an-email", "a@b", "a b@c.de", "a@b@c.de", "a@.de", "a@b."])(
    "rejects %j",
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    }
  );

  it("rejects long adversarial input in linear time", () => {
    const start = performance.now();
    expect(isValidEmail("!@".repeat(50_000))).toBe(false);
    expect(isValidEmail(`a@${".".repeat(50_000)} `)).toBe(false);
    expect(performance.now() - start).toBeLessThan(1000);
  });
});
