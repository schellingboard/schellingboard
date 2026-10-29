import { callApi } from "./api";

type Fields = Record<string, unknown>;

/** The comment routes of /api/v1 as a guest holding `cookies` calls them. */
export function commentApi(cookies: Map<string, string>) {
  return {
    createSessionComment: (
      { sessionId, ...fields }: Fields & { sessionId: string },
      key?: string
    ) =>
      callApi(cookies, "POST", `/sessions/${sessionId}/comments`, fields, key),
    createProfileComment: (
      { profileId, ...fields }: Fields & { profileId: string },
      key?: string
    ) => callApi(cookies, "POST", `/guests/${profileId}/comments`, fields, key),
    updateComment: ({ commentId, ...fields }: Fields & { commentId: string }) =>
      callApi(cookies, "PUT", `/comments/${commentId}`, fields),
    deleteComment: ({ commentId }: { commentId: string }) =>
      callApi(cookies, "DELETE", `/comments/${commentId}`),
    likeComment: ({ commentId }: { commentId: string }) =>
      callApi(cookies, "PUT", `/comments/${commentId}/like`),
    unlikeComment: ({ commentId }: { commentId: string }) =>
      callApi(cookies, "DELETE", `/comments/${commentId}/like`),
  };
}
