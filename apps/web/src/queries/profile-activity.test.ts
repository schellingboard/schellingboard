import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createProfileActivityQuery } from "./profile-activity";

const activity = {
  hosting: [{ id: "s1", title: "Talk", eventSlug: "Camp" }],
  proposals: [],
};
const options = [
  { eventId: "e", eventName: "Camp", meetingPoints: [], lengths: [] },
];

describe("the profile activity", () => {
  it(
    "reads what the guest hosts and proposes, and what the viewer may book",
    { tags: ["011-US1", "012-US3"] },
    async () => {
      const { api, calls } = fakeApi(({ path }) =>
        Response.json(path.endsWith("/activity") ? activity : { options })
      );
      const query = createProfileActivityQuery({ api, guestId: "g 1" });

      await query.refresh();

      expect(calls.map((c) => c.path).sort()).toEqual([
        "/api/v1/guests/g%201/activity",
        "/api/v1/guests/g%201/meeting-options",
      ]);
      expect(query.get()).toEqual({
        status: "ready",
        hosting: activity.hosting,
        proposals: [],
        meetingOptions: options,
      });
    }
  );

  it(
    "reports a failure of the activity read",
    { tags: ["011-US1"] },
    async () => {
      const { api } = fakeApi(({ path }) =>
        path.endsWith("/activity")
          ? problem(500, "server.error")
          : Response.json({ options })
      );
      const query = createProfileActivityQuery({ api, guestId: "g" });

      await query.refresh();

      expect(query.get()).toMatchObject({
        status: "error",
        code: "server.error",
      });
    }
  );

  it(
    "keeps what they host when only the 1-on-1 options fail",
    { tags: ["011-US1"] },
    async () => {
      const { api } = fakeApi(({ path }) =>
        path.endsWith("/activity")
          ? Response.json(activity)
          : problem(500, "server.error")
      );
      const query = createProfileActivityQuery({ api, guestId: "g" });

      await query.refresh();

      expect(query.get()).toMatchObject({
        status: "ready",
        hosting: activity.hosting,
        meetingOptions: [],
      });
    }
  );

  it(
    "ignores an answer that arrives after it was destroyed",
    { tags: ["011-US1"] },
    async () => {
      const { api } = fakeApi(() => Response.json({ options, ...activity }));
      const query = createProfileActivityQuery({ api, guestId: "g" });

      const pending = query.refresh();
      query.destroy();
      await pending;

      expect(query.get().status).toBe("loading");
    }
  );
});
