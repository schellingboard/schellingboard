/** Which flow an emailed token belongs to (see the `authCodes` table in db/schema.ts). */
export type AuthCodePurpose = "login" | "reset";

/**
 * An emailed single-use token. `codeHash` is a digest of `salt + code`,
 * never the code.
 */
export type AuthCode = {
  id: string;
  guestId: string;
  purpose: AuthCodePurpose;
  salt: string;
  codeHash: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
};

/** What a login session proves: a picked name, or a checked credential. */
export type LoginAssurance = "claimed" | "verified";

export type LoginSession = {
  /** sha256 of the cookie's token; the token itself is never stored. */
  id: string;
  guestId: string;
  eventId: string | null;
  assurance: LoginAssurance;
  createdAt: Date;
  expiresAt: Date;
  lastSeenAt: Date;
  device: string | null;
};
