import type { MessageDescriptor } from "@lingui/core";
import type { NoticeMessage } from "@schellingboard/domain/notification";

import {
  type EmailTime,
  formatPlaces,
  formatTime,
  type PlacesProp,
} from "./localized-text";
import type { Translate } from "./translator";

const isTime = (value: unknown): value is EmailTime =>
  typeof value === "object" && value !== null && "zone" in value;

/** What a `msg` descriptor holds once stored: plain data, nothing a React tree or a function. */
export function toNotice(descriptor: MessageDescriptor): NoticeMessage {
  return JSON.parse(JSON.stringify(descriptor)) as NoticeMessage;
}

/** Times and place lists in the values are written in the reader's language and the event's zone. */
export function renderNotice(notice: NoticeMessage, t: Translate): string {
  const values = Object.fromEntries(
    Object.entries(notice.values ?? {}).map(([name, value]) => [
      name,
      isTime(value)
        ? formatTime(value, t)
        : Array.isArray(value)
          ? formatPlaces(value as PlacesProp, t)
          : value,
    ])
  );
  return t({ ...notice, values });
}
