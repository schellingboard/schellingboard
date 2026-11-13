import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { getRepositories } from "@/db/container";
import { peopleUseCases } from "@/server/composition";
import type { Actor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";

import { resetTestDb, setupTestDb } from "../helpers/db";
import { createEvent, createGuest } from "../helpers/factories";

const ADMIN: Actor = { admin: true, guest: null };
const NOBODY: Actor = { admin: false, guest: null };

function value<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error.code);
  return result.value;
}
const code = (result: Result<unknown>) =>
  result.ok ? "ok" : result.error.code;

const orga = { name: "Orga team", description: "Runs the event", color: "red" };

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

describe("attendee labels", { tags: ["011-US7"] }, () => {
  it("lets only an organizer manage labels", async () => {
    const event = await createEvent();
    const people = peopleUseCases();
    const label = value(
      await people.createLabel(ADMIN, { eventId: event.id, ...orga })
    );

    expect(
      code(await people.createLabel(NOBODY, { eventId: event.id, ...orga }))
    ).toBe("admin.required");
    expect(
      code(await people.updateLabel(NOBODY, { id: label.id, ...orga }))
    ).toBe("admin.required");
    expect(code(await people.deleteLabel(NOBODY, { id: label.id }))).toBe(
      "admin.required"
    );
    expect(code(await people.listLabels(NOBODY, { eventId: event.id }))).toBe(
      "admin.required"
    );
  });

  it("creates, lists in order, edits and deletes labels", async () => {
    const event = await createEvent();
    const people = peopleUseCases();
    const first = value(
      await people.createLabel(ADMIN, { eventId: event.id, ...orga })
    );
    await people.createLabel(ADMIN, {
      eventId: event.id,
      name: "Volunteer",
      description: "",
      color: "green",
    });

    const edited = value(
      await people.updateLabel(ADMIN, {
        id: first.id,
        name: " Orga ",
        description: "Organizers",
        color: "blue",
      })
    );
    expect(edited).toMatchObject({
      name: "Orga",
      description: "Organizers",
      color: "blue",
    });
    expect(
      value(await people.listLabels(ADMIN, { eventId: event.id })).map(
        (l) => l.name
      )
    ).toEqual(["Orga", "Volunteer"]);

    value(await people.deleteLabel(ADMIN, { id: first.id }));
    expect(
      value(await people.listLabels(ADMIN, { eventId: event.id })).map(
        (l) => l.name
      )
    ).toEqual(["Volunteer"]);
  });

  it("refuses a missing name, an unknown colour and an unknown event", async () => {
    const event = await createEvent();
    const people = peopleUseCases();

    expect(
      code(
        await people.createLabel(ADMIN, {
          eventId: event.id,
          ...orga,
          name: "  ",
        })
      )
    ).toBe("label.nameRequired");
    expect(
      code(
        await people.createLabel(ADMIN, {
          eventId: event.id,
          ...orga,
          color: "#ff0000",
        })
      )
    ).toBe("label.colorInvalid");
    expect(
      code(await people.createLabel(ADMIN, { eventId: "nope", ...orga }))
    ).toBe("event.notFound");
    expect(code(await people.updateLabel(ADMIN, { id: "nope", ...orga }))).toBe(
      "label.notFound"
    );
  });

  it("gives a guest several labels and replaces them on the next save", async () => {
    const event = await createEvent();
    const guest = await createGuest({ eventId: event.id });
    const people = peopleUseCases();
    const a = value(
      await people.createLabel(ADMIN, { eventId: event.id, ...orga })
    );
    const b = value(
      await people.createLabel(ADMIN, {
        eventId: event.id,
        ...orga,
        name: "Volunteer",
      })
    );

    value(
      await people.setGuestLabels(ADMIN, {
        eventId: event.id,
        guestId: guest.id,
        labelIds: [a.id, b.id],
      })
    );
    const both = value(await people.listLabels(ADMIN, { eventId: event.id }));
    expect(both.map((l) => l.guestIds)).toEqual([[guest.id], [guest.id]]);

    value(
      await people.setGuestLabels(ADMIN, {
        eventId: event.id,
        guestId: guest.id,
        labelIds: [b.id],
      })
    );
    const one = value(await people.listLabels(ADMIN, { eventId: event.id }));
    expect(one.map((l) => l.guestIds)).toEqual([[], [guest.id]]);
  });

  it("labels only members of the event, with that event's labels", async () => {
    const event = await createEvent();
    const other = await createEvent();
    const member = await createGuest({ eventId: event.id });
    const stranger = await createGuest();
    const people = peopleUseCases();
    const mine = value(
      await people.createLabel(ADMIN, { eventId: event.id, ...orga })
    );
    const theirs = value(
      await people.createLabel(ADMIN, { eventId: other.id, ...orga })
    );

    expect(
      code(
        await people.setGuestLabels(ADMIN, {
          eventId: event.id,
          guestId: stranger.id,
          labelIds: [mine.id],
        })
      )
    ).toBe("guest.notInEvent");
    expect(
      code(
        await people.setGuestLabels(ADMIN, {
          eventId: event.id,
          guestId: member.id,
          labelIds: [theirs.id],
        })
      )
    ).toBe("label.notFound");
    expect(
      code(
        await people.setGuestLabels(NOBODY, {
          eventId: event.id,
          guestId: member.id,
          labelIds: [],
        })
      )
    ).toBe("admin.required");
  });

  it("drops labels with their event, their guest, and when the guest leaves the event", async () => {
    const event = await createEvent();
    const staying = await createGuest({ eventId: event.id });
    const leaving = await createGuest({ eventId: event.id });
    const people = peopleUseCases();
    const label = value(
      await people.createLabel(ADMIN, { eventId: event.id, ...orga })
    );
    for (const guest of [staying, leaving])
      value(
        await people.setGuestLabels(ADMIN, {
          eventId: event.id,
          guestId: guest.id,
          labelIds: [label.id],
        })
      );

    value(
      await people.removeGuestsFromEvent(
        ADMIN,
        { eventId: event.id, guestIds: [leaving.id] },
        new Date()
      )
    );
    expect(
      value(await people.listLabels(ADMIN, { eventId: event.id }))[0].guestIds
    ).toEqual([staying.id]);

    await getRepositories().guests.delete(staying.id);
    expect(
      value(await people.listLabels(ADMIN, { eventId: event.id }))[0].guestIds
    ).toEqual([]);

    await getRepositories().events.delete(event.id);
    expect(
      await getRepositories().eventLabels.findById(label.id)
    ).toBeUndefined();
  });

  it("drops a guest's labels when editing the guest takes them out of the event", async () => {
    const event = await createEvent();
    const guest = await createGuest({ eventId: event.id });
    const people = peopleUseCases();
    const label = value(
      await people.createLabel(ADMIN, { eventId: event.id, ...orga })
    );
    value(
      await people.setGuestLabels(ADMIN, {
        eventId: event.id,
        guestId: guest.id,
        labelIds: [label.id],
      })
    );

    const current = await getRepositories().guests.findById(guest.id);
    value(
      await people.updateGuest(
        ADMIN,
        {
          id: guest.id,
          name: current!.name,
          email: current!.info.email,
          eventIds: [],
          expectedVersion: current!.version,
        },
        new Date()
      )
    );

    expect(
      value(await people.listLabels(ADMIN, { eventId: event.id }))[0].guestIds
    ).toEqual([]);
  });
});
