// @module-tag 005-US1
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { fakeApi } from "../../commands/fake-api";
import { createStandingsQuery } from "../../queries/proposal-standings";
import { useStandings } from "./use-standings";

afterEach(cleanup);

describe("useStandings", () => {
  it("loads on mount and not again when the viewer votes", async () => {
    const { api, calls } = fakeApi(() =>
      Response.json({ items: [], nextCursor: null })
    );
    const query = createStandingsQuery({ api, eventId: "e" });
    const { rerender, result } = renderHook(() => useStandings(query));
    await act(async () => {});
    expect(calls).toHaveLength(1);
    expect(result.current.status).toBe("ready");

    act(() => rerender());
    await act(async () => {});
    expect(calls).toHaveLength(1);
  });
});
