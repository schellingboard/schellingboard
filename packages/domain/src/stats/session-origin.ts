export const SESSION_ORIGINS = [
  "blocker",
  "proposal",
  "organizer",
  "spontaneous",
] as const;

export type SessionOrigin = (typeof SESSION_ORIGINS)[number];

export function sessionOrigin(session: {
  blocker: boolean;
  proposalId: string | null;
  adminManaged: boolean;
}): SessionOrigin {
  if (session.blocker) return "blocker";
  if (session.proposalId) return "proposal";
  return session.adminManaged ? "organizer" : "spontaneous";
}
