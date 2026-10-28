import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeApi } from "../commands/fake-api";
import { createCommandRunner } from "../commands/runner";
import { snapshot } from "../replica/snapshot-fixture";
import { createReplicaStore } from "../replica/store";
import { likerFrom, useCommentSource } from "./use-comment-actions";

describe("the comment source", () => {
  it(
    "likes with the reader it was given, with no event replica behind it",
    { tags: ["010-US6"] },
    async () => {
      const { api, calls } = fakeApi(() => Response.json({}));
      const runner = createCommandRunner({
        store: createReplicaStore(snapshot),
        api,
        newKey: () => "k",
        retryDelays: [],
      });
      const liker = { id: "bob", name: "Bob", avatarUrl: null };
      const { result } = renderHook(() => useCommentSource(api, runner, liker));

      const { controller } = result.current({
        kind: "profile",
        id: "g",
        name: "Ada",
      });
      const outcome = await controller.setLiked("c", true);

      expect(outcome.ok).toBe(true);
      expect(calls.some((c) => c.method === "PUT")).toBe(true);
    }
  );

  it("has no reader when the replica does not know the viewer", () => {
    expect(likerFrom({ ...snapshot, me: null })).toBeNull();
  });
});
