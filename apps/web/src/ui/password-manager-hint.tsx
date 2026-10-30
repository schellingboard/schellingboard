/**
 * A hidden username field next to a password input. Several distinct passwords
 * share this origin, and a password manager keys a saved one on the username
 * of its form, so without a readable name they are mixed up.
 */
export function PasswordManagerHint({ username }: { username: string }) {
  return (
    <input
      type="text"
      name="username"
      autoComplete="username"
      value={username}
      readOnly
      aria-hidden="true"
      tabIndex={-1}
      className="hidden"
    />
  );
}
