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
});
