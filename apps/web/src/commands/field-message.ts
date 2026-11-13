import type { MessageDescriptor } from "@lingui/core";
import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import {
  MAX_ATTENDEE_COUNT,
  MIN_ATTENDEE_COUNT,
} from "@schellingboard/domain/attendee-count";
import { COMMENT_MAX_LENGTH } from "@schellingboard/domain/comment";
import { MAX_CONTACTS, MAX_LANGUAGES } from "@schellingboard/domain/guest";
import { COHOST_WANTED_NOTE_MAX } from "@schellingboard/domain/session";

// The contracts' validation messages are English text; a form shows them
// after translating through this table, keyed by that text.
const known: Record<string, MessageDescriptor> = {
  "Title is required": msg`Title is required`,
  "Comment cannot be empty": msg`Comment cannot be empty`,
  [`Comment must be at most ${COMMENT_MAX_LENGTH} characters`]: msg`Comment must be at most ${COMMENT_MAX_LENGTH} characters`,
  "A user with this email already exists": msg`A user with this email already exists`,
  "Use at least 8 characters": msg`Use at least 8 characters`,
  "Name is required": msg`Name is required`,
  [`Keep it under ${COHOST_WANTED_NOTE_MAX} characters`]: msg`Keep it under ${COHOST_WANTED_NOTE_MAX} characters`,
  "Keep prompt answers under 500 characters": msg`Keep prompt answers under 500 characters`,
  "Keep contact labels under 40 characters": msg`Keep contact labels under 40 characters`,
  "Keep contact entries under 200 characters": msg`Keep contact entries under 200 characters`,
  "Give this contact a label": msg`Give this contact a label`,
  "Keep this under 100 characters": msg`Keep this under 100 characters`,
  "At most 100 prompts": msg`At most 100 prompts`,
  "Keep language names under 50 characters": msg`Keep language names under 50 characters`,
  [`At most ${MAX_LANGUAGES} languages`]: msg`At most ${MAX_LANGUAGES} languages`,
  [`At most ${MAX_CONTACTS} contacts`]: msg`At most ${MAX_CONTACTS} contacts`,
  [`Enter a whole number between ${MIN_ATTENDEE_COUNT} and ${MAX_ATTENDEE_COUNT}`]: msg`Enter a whole number between ${MIN_ATTENDEE_COUNT} and ${MAX_ATTENDEE_COUNT}`,
};

export const isKnownFieldMessage = (message: string) => message in known;

export function fieldMessage(message: string): string {
  const descriptor = known[message];
  if (descriptor) return i18n._(descriptor);
  const taken =
    /^An event with the URL "(.*)" already exists(?: \("(.*)"\))?$/s.exec(
      message
    );
  if (taken) {
    const [, slug, name] = taken;
    return name === undefined
      ? i18n._(msg`An event with the URL "${slug}" already exists`)
      : i18n._(msg`An event with the URL "${slug}" already exists ("${name}")`);
  }
  return message;
}
