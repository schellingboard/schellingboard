export type SessionOrigin =
  "blocker" | "proposal" | "organizer" | "spontaneous";

export function sessionOrigin(session: {
  blocker: boolean;
  proposalId: string | null;
  adminManaged: boolean;
}): SessionOrigin {
  if (session.blocker) return "blocker";
  if (session.proposalId) return "proposal";
  return session.adminManaged ? "organizer" : "spontaneous";
}
