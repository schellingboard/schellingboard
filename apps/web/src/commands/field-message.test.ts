// @module-tag 022-US1
import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { commentCreateSchema } from "@schellingboard/contracts/comment";
import { profileSchema } from "@schellingboard/contracts/guest";
import { sessionCreateSchema } from "@schellingboard/contracts/session";
import { afterEach, describe, expect, it } from "vitest";

import { fieldMessage, isKnownFieldMessage } from "./field-message";

describe("fieldMessage", () => {
  afterEach(() => i18n.loadAndActivate({ locale: "en", messages: {} }));

  it("translates the contract's message through the catalog", () => {
    i18n.loadAndActivate({
      locale: "xx",
      messages: { [msg`Title is required`.id]: "Titel fehlt" },
    });
    expect(fieldMessage("Title is required")).toBe("Titel fehlt");
  });

  it("keeps the limit the message names", () => {
    expect(fieldMessage("At most 10 languages")).toBe("At most 10 languages");
  });

  it("covers every message the form schemas can raise", () => {
    const raised = [
      sessionCreateSchema.safeParse({
        title: " ",
        cohostWantedNote: "x".repeat(999),
      }),
      profileSchema.safeParse({
        name: "",
        basedIn: "x".repeat(101),
        prompts: [{ prompt: "p", answer: "x".repeat(501) }],
        languages: ["x".repeat(51)],
        contacts: [
          { type: "other", value: "v" },
          { type: "email", label: "x".repeat(41), value: "x".repeat(201) },
        ],
      }),
      commentCreateSchema.safeParse({ sessionId: "s", body: " " }),
      commentCreateSchema.safeParse({
        sessionId: "s",
        body: "x".repeat(99999),
      }),
    ].flatMap((r) =>
      r.success
        ? []
        : r.error.issues
            .map((i) => i.message)
            .filter((m) => !m.startsWith("Invalid input"))
    );
    expect(raised.length).toBeGreaterThan(6);
    expect(raised.filter((m) => !isKnownFieldMessage(m))).toEqual([]);
  });

  it("translates the event URL messages with their values", () => {
    expect(
      fieldMessage('An event with the URL "x" already exists ("X Con")')
    ).toBe('An event with the URL "x" already exists ("X Con")');
  });

  it("leaves a message it does not know as it is", () => {
    expect(fieldMessage("Something else")).toBe("Something else");
  });
});
