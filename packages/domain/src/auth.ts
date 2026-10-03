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
