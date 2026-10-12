import { useState } from "react";

type Loaded<T> = { values: T; version: number };

export const followsEvent = <T>(form: T, loaded: Loaded<T>, version: number) =>
  version !== loaded.version &&
  JSON.stringify(form) === JSON.stringify(loaded.values);

// The event page's sections share one version: a section with unsaved edits
// keeps them and its version, one without follows the page's newer event.
export function useEventSection<T>(fromEvent: T, version: number) {
  const [form, setForm] = useState(fromEvent);
  const [loaded, setLoaded] = useState<Loaded<T>>({
    values: fromEvent,
    version,
  });
  if (followsEvent(form, loaded, version)) {
    setLoaded({ values: fromEvent, version });
    setForm(fromEvent);
  }

  const markSaved = (sent: T) => setLoaded((l) => ({ ...l, values: sent }));
  return { form, setForm, version: loaded.version, markSaved };
}
