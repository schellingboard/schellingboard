import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { toEvent } from "../replica/selectors";
import { snapshot } from "../replica/snapshot-fixture";
import { PhaseBar } from "./phase-bar";

afterEach(cleanup);

const now = new Date(Date.UTC(2026, 0, 1));
const beforeScheduling = (meetingsEnabled: boolean) =>
  toEvent({
    ...snapshot.event,
    meetingsEnabled,
    proposalPhaseStart: new Date(Date.UTC(2025, 11, 1)).toISOString(),
    proposalPhaseEnd: new Date(Date.UTC(2026, 0, 10)).toISOString(),
    schedulingPhaseStart: new Date(Date.UTC(2026, 0, 20)).toISOString(),
  });

async function schedulingHint(meetingsEnabled: boolean) {
  render(
    <PhaseBar
      event={beforeScheduling(meetingsEnabled)}
      now={now}
      localZone={null}
    />
  );
  await userEvent.hover(screen.getByRole("button", { name: /Scheduling/ }));
  return (await screen.findByRole("tooltip")).textContent;
}

describe("the phase bar", () => {
  it(
    "names 1-on-1s in the scheduling phase only where the event offers them",
    { tags: ["012-US1"] },
    async () => {
      expect(await schedulingHint(false)).not.toMatch(/1-on-1/);
      cleanup();
      expect(await schedulingHint(true)).toMatch(/book 1-on-1s/);
    }
  );

  it(
    "says when the current phase ends and when the next ones start, date first",
    { tags: ["006-US3"] },
    () => {
      const event = toEvent({
        ...snapshot.event,
        timezone: "UTC",
        proposalPhaseStart: new Date(Date.UTC(2025, 11, 1, 9)).toISOString(),
        proposalPhaseEnd: null,
        votingPhaseStart: new Date(Date.UTC(2026, 0, 10, 9)).toISOString(),
        votingPhaseEnd: null,
        schedulingPhaseStart: new Date(
          Date.UTC(2026, 0, 20, 14, 30)
        ).toISOString(),
      });
      render(
        <PhaseBar
          event={event}
          now={now}
          localZone={null}
          timeFormat="h:mm a"
        />
      );
      const steps = screen.getAllByRole("listitem").map((li) => li.textContent);
      expect(steps[0]).toContain("Ends 10 Jan, 9:00 AM");
      expect(steps[1]).toContain("Starts 10 Jan, 9:00 AM");
      expect(steps[2]).toContain("Starts 20 Jan, 2:30 PM");
    }
  );
});
