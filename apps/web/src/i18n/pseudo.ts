import type { Messages } from "@lingui/core";

const GROWTH = 0.3;
const pad = (text: string) =>
  text + "~".repeat(Math.max(1, Math.ceil(text.length * GROWTH)));

/** Lengthens every message, as longer languages will, so overflowing layouts show. */
export function expandMessages(messages: Messages): Messages {
  return Object.fromEntries(
    Object.entries(messages).map(
      ([id, message]): [string, Messages[string]] => {
        if (typeof message === "string") return [id, pad(message)];
        if (!Array.isArray(message)) return [id, message];
        let last = message.length - 1;
        while (last >= 0 && typeof message[last] !== "string") last--;
        return [
          id,
          last < 0
            ? [...message, "~~~"]
            : message.map((part, i) =>
                i === last ? pad(part as string) : part
              ),
        ];
      }
    )
  );
}
