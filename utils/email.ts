// Dots split the domain into labels the classes cannot cross, so no input can
// be matched more than one way: \S+@\S+\.\S+ backtracked quadratically.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}
