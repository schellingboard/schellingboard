// @module-tag 007-US5
import { describe, expect, it } from "vitest";
import { createMemoryHistory } from "@tanstack/react-router";
import {
  backgroundOf,
  closePanel,
  landOnPanel,
  openPanel,
  panelOf,
  panelPath,
  replaceBackground,
} from "./panel-history";

const session = (id: string) => ({
  kind: "session" as const,
  slug: "conf",
  id,
});

const start = () =>
  createMemoryHistory({
    initialEntries: ["/conf/schedule?view=agenda&loc=a&loc=b"],
  });

describe("panel history", () => {
  it("names a session by its own address", () => {
    expect(panelPath(session("s1"))).toBe("/conf/sessions/s1");
    expect(panelPath({ ...session("s1"), record: true })).toBe(
      "/conf/sessions/s1?record=count"
    );
  });

  it("names a proposal by its own address and stacks it on a session", () => {
    const history = start();
    openPanel(history, session("s1"));
    openPanel(
      history,
      { kind: "proposal", slug: "conf", id: "p1" },
      { fromPanel: true }
    );
    expect(history.location.pathname).toBe("/conf/proposals/p1");
    expect(panelOf(history.location)).toMatchObject({ depth: 2 });
  });

  it("opens over the page, which stays the background with its query intact", () => {
    const history = start();
    openPanel(history, session("s1"));
    expect(history.location.pathname).toBe("/conf/sessions/s1");
    expect(panelOf(history.location)).toMatchObject({ depth: 1 });
    expect(backgroundOf(history.location)).toMatchObject({
      pathname: "/conf/schedule",
      search: "?view=agenda&loc=a&loc=b",
    });
  });

  it("adds an entry from inside the panel and removes it with Back", () => {
    const history = start();
    openPanel(history, session("s1"));
    openPanel(history, session("s2"), { fromPanel: true });
    expect(panelOf(history.location)).toMatchObject({ depth: 2 });
    history.back();
    expect(panelOf(history.location)).toMatchObject({
      depth: 1,
      item: { id: "s1" },
    });
  });

  it("closes a whole stack back to the page as it was left", () => {
    const history = start();
    openPanel(history, session("s1"));
    openPanel(history, session("s2"), { fromPanel: true });
    closePanel(history);
    expect(panelOf(history.location)).toBeUndefined();
    expect(history.location.pathname).toBe("/conf/schedule");
  });

  it("starts a new stack for a click on the page behind", async () => {
    const history = start();
    openPanel(history, session("s1"));
    openPanel(history, session("s2"), { fromPanel: true });
    openPanel(history, session("s3"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(panelOf(history.location)).toMatchObject({
      depth: 1,
      item: { id: "s3" },
    });
    closePanel(history);
    expect(panelOf(history.location)).toBeUndefined();
  });

  it("keeps a link's hash and ignores a stray history event while going back", async () => {
    const history = start();
    openPanel(history, session("s1"));
    openPanel(history, session("s2"), { fromPanel: true });
    openPanel(history, session("s3"), { hash: "#comment-a" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(history.location.hash).toBe("#comment-a");
    expect(panelOf(history.location)).toMatchObject({ depth: 1 });
  });

  it("rewrites the background in place without losing the panel", () => {
    const history = start();
    openPanel(history, session("s1"));
    replaceBackground(history, "?view=grid");
    expect(panelOf(history.location)).toMatchObject({ item: { id: "s1" } });
    expect(backgroundOf(history.location).search).toBe("?view=grid");
    expect(history.location.pathname).toBe("/conf/sessions/s1");
  });

  it("lands on the page with the panel over it, one Back from the page", () => {
    const history = createMemoryHistory({
      initialEntries: ["/conf/sessions/s1#comment-c1"],
    });
    landOnPanel(history, session("s1"), "/conf/schedule", "#comment-c1");
    expect(panelOf(history.location)).toMatchObject({ landed: true });
    expect(history.location.hash).toBe("#comment-c1");
    closePanel(history);
    expect(history.location.pathname).toBe("/conf/schedule");
    expect(history.length).toBe(2);
  });
});
