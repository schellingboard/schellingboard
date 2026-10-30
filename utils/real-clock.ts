// Login sessions age in real time: a dev clock jump must not expire live
// sessions, or revive dead ones (ADR 0004).
export function realNow(): Date {
  // eslint-disable-next-line no-restricted-syntax -- see above
  return new Date();
}
