import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

/** "25m", "1h 20m"; the long form reads "1 hour 20 minutes". */
export function formatDuration(minutes: number, long = false): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const values = { hours, minutes: rest, total: minutes };
  const text = (descriptor: MessageDescriptor) =>
    i18n._({ ...descriptor, values });
  if (hours === 0)
    return text(
      long
        ? msg({
            message: "{total, plural, one {# minute} other {# minutes}}",
          })
        : msg({ message: "{total}m" })
    );
  if (rest === 0)
    return text(
      long
        ? msg({ message: "{hours, plural, one {# hour} other {# hours}}" })
        : msg({ message: "{hours}h" })
    );
  return text(
    long
      ? msg({
          message:
            "{hours, plural, one {# hour} other {# hours}} {minutes, plural, one {# minute} other {# minutes}}",
        })
      : msg({ message: "{hours}h {minutes}m" })
  );
}
