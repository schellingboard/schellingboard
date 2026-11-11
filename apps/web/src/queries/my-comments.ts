import type { ApiClient } from "@schellingboard/api-client";
import type { myCommentsSchema } from "@schellingboard/contracts/comment";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type MyComment = (typeof myCommentsSchema)["_output"]["items"][number];

export type MyCommentsState =
  | { status: "loading" }
  /** `code` says why: a refusal such as "guest.unselected", or a status. */
  | { status: "error"; code: string }
  | { status: "ready"; items: MyComment[] };

export type MyCommentsQuery = ReturnType<typeof createMyCommentsQuery>;

/** Every comment the signed-in guest wrote, newest first; paged and filtered by the screen. */
export function createMyCommentsQuery({ api }: { api: ApiClient }) {
  const state = createObservable<MyCommentsState>({ status: "loading" });
  let destroyed = false;
  return {
    get: state.get,
    subscribe: state.subscribe,
    destroy() {
      destroyed = true;
    },
    async load() {
      try {
        const { data, error, response } = await api.GET("/api/v1/me/comments");
        if (destroyed) return;
        state.set(
          data
            ? { status: "ready", items: data.items }
            : {
                status: "error",
                code: problemCode(error, response.status),
              }
        );
      } catch {
        if (!destroyed) state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
