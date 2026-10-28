import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import type { MeetingView } from "../schedule/meeting-view";
import { MeetingModal } from "./meeting-modal";

afterEach(cleanup);

const meeting = (extra: Partial<MeetingView> = {}): MeetingView => ({
  id: "m1",
  status: "pending",
  role: "recipient",
  otherId: "kai",
  otherName: "Kai",
  slotStart: "2026-06-03T09:00:00.000Z",
  slotEnd: "2026-06-03T09:30:00.000Z",
  dayLabel: "Wed 3 Jun",
  timeLabel: "09:10 – 09:30",
  meetingPoint: "Coffee bar",
  message: "Hello",
  cancelNote: "",
  clashes: [],
  ...extra,
});

function setup(m: MeetingView | undefined, readOnly = false) {
  const log: string[] = [];
  render(
    <MeetingModal
      meeting={m}
      now={new Date("2026-06-02T10:00:00Z")}
      readOnly={readOnly}
      profileHref={(id) => `/guests/${id}`}
      onAnswer={(r) => log.push(r)}
      onCancel={(note) => log.push(`cancel:${note}`)}
      onClose={() => log.push("closed")}
    />
  );
  return log;
}

describe("a 1-on-1 in full", { tags: ["012-US4"] }, () => {
  it("shows who, when, where, and lets the person asked answer", async () => {
    const log = setup(meeting());
    expect(screen.getByRole("dialog", { name: "1-on-1 details" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kai" }).getAttribute("href")).toBe(
      "/guests/kai"
    );
    expect(screen.getByText("Wed 3 Jun, 09:10 – 09:30")).toBeTruthy();
    expect(screen.getByText("Coffee bar")).toBeTruthy();
    expect(screen.getByText("Kai is waiting for your answer.")).toBeTruthy();
    expect(screen.getByText("Hello")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Accept" }));
    await userEvent.click(screen.getByRole("button", { name: "Decline" }));
    expect(log).toEqual(["accept", "decline"]);
  });

  it("offers no answer to the requester, but a cancel with a confirmation and a note", async () => {
    const log = setup(meeting({ role: "requester" }));
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();

    await userEvent.click(
      screen.getByRole("button", { name: "Cancel 1-on-1" })
    );
    expect(screen.getByText("Kai will be told. Cancel it?")).toBeTruthy();
    await userEvent.type(
      screen.getByLabelText("Say why, if you like (optional)"),
      "Sorry"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Yes, cancel it" })
    );
    expect(log).toEqual(["cancel:Sorry"]);
  });

  it("can keep it after all", async () => {
    const log = setup(meeting({ status: "accepted" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Cancel 1-on-1" })
    );
    await userEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(screen.getByRole("button", { name: "Cancel 1-on-1" })).toBeTruthy();
    expect(log).toEqual([]);
  });

  it("is read-only when asked, shows why a canceled one was called off, and says when missing", () => {
    setup(meeting({ status: "canceled", cancelNote: "Moved" }), true);
    expect(screen.getByText("This 1-on-1 was canceled.")).toBeTruthy();
    expect(screen.getByText("Moved")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cancel 1-on-1" })).toBeNull();
    cleanup();

    setup(meeting(), true);
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();
    cleanup();

    setup(undefined);
    expect(screen.getByText("1-on-1 not found.")).toBeTruthy();
  });
});

describe("a request that clashes", { tags: ["012-US4"] }, () => {
  it("tells the person asked what else is on during the slot", () => {
    setup(
      meeting({
        clashes: [
          { guestName: "Mia", kind: "hosting", title: "Rust", isViewer: true },
        ],
      })
    );
    expect(screen.getByText(/during this slot/)).toBeTruthy();
  });
});
