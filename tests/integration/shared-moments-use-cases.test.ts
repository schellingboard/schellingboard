import { describe, it, expect, beforeAll, beforeEach } from "vitest";

import { isoDay } from "../helpers/dates";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createDay, createEvent } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import { createEventUseCases } from "@/server/modules/events/module";
import type { Actor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";

const ADMIN: Actor = { admin: true, guest: null };
const NOBODY: Actor = { admin: false, guest: null };
const NOW = new Date();
const events = () =>
  createEventUseCases({ repos: getRepositories(), uow: unitOfWork });

function value<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error.code);
  return result.value;
}
const code = (result: Result<unknown>) =>
  result.ok ? "ok" : result.error.code;

const lunch = {
  title: "Lunch",
  description: "Buffet in the foyer",
  startTime: "12:30",
  endTime: "14:00",
};

async function twoDays() {
  const event = await createEvent();
  const day = (offset: number) => {
    const d = new Date(`${isoDay(offset)}T08:00:00Z`);
    return createDay(event.id, {
      start: d,
      end: new Date(`${isoDay(offset)}T18:00:00Z`),
      startBookings: new Date(`${isoDay(offset)}T09:00:00Z`),
      endBookings: new Date(`${isoDay(offset)}T17:00:00Z`),
    });
  };
  return { event, first: await day(30), second: await day(31) };
}

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

describe("shared moments", () => {
  it("refuses everyone but an organizer", { tags: ["015-US9"] }, async () => {
    const { event, first } = await twoDays();
    const moment = value(
      await events().createMoments(
        ADMIN,
        {
          eventId: event.id,
          dayIds: [first.id],
          ...lunch,
        },
        NOW
      )
    )[0];
    const refusals = [
      await events().createMoments(
        NOBODY,
        {
          eventId: event.id,
          dayIds: [first.id],
          ...lunch,
        },
        NOW
      ),
      await events().updateMoment(NOBODY, { id: moment.id, ...lunch }, NOW),
      await events().deleteMoment(NOBODY, { id: moment.id }, NOW),
    ];
    expect(refusals.map(code)).toEqual(Array(3).fill("admin.required"));
  });

  it(
    "creates one moment per ticked day and lists them with the event",
    { tags: ["015-US9"] },
    async () => {
      const { event, first, second } = await twoDays();
      const created = value(
        await events().createMoments(
          ADMIN,
          {
            eventId: event.id,
            dayIds: [first.id, second.id],
            ...lunch,
          },
          NOW
        )
      );
      expect(created.map((m) => m.dayId)).toEqual([first.id, second.id]);
      expect(created[0]).toMatchObject({
        title: "Lunch",
        description: "Buffet in the foyer",
        start: new Date(`${isoDay(30)}T12:30:00Z`),
        end: new Date(`${isoDay(30)}T14:00:00Z`),
      });
      expect(
        value(await events().getEvent(NOBODY, { id: event.id })).moments
      ).toEqual(created);
    }
  );

  it(
    "reads the times in the event's time zone",
    { tags: ["015-US9"] },
    async () => {
      const { event, first } = await twoDays();
      await getRepositories().events.update(event.id, {
        timezone: "Asia/Tokyo",
      });
      const [moment] = value(
        await events().createMoments(
          ADMIN,
          {
            eventId: event.id,
            dayIds: [first.id],
            ...lunch,
            startTime: "18:00",
            endTime: "19:00",
          },
          NOW
        )
      );
      expect(moment.start).toEqual(new Date(`${isoDay(30)}T09:00:00Z`));
      expect(moment.end).toEqual(new Date(`${isoDay(30)}T10:00:00Z`));
    }
  );

  it(
    "refuses an end that is not after the start, a time outside the day, a blank title and a foreign day",
    { tags: ["015-US9"] },
    async () => {
      const { event, first } = await twoDays();
      const other = await createEvent();
      const foreign = await createDay(other.id);
      const create = (over: Partial<typeof lunch>, dayId = first.id) =>
        events().createMoments(
          ADMIN,
          {
            eventId: event.id,
            dayIds: [dayId],
            ...lunch,
            ...over,
          },
          NOW
        );
      expect(code(await create({ endTime: "12:30" }))).toBe(
        "moment.windowInvalid"
      );
      expect(code(await create({ startTime: "07:00" }))).toBe(
        "moment.outsideDay"
      );
      expect(code(await create({ endTime: "18:30" }))).toBe(
        "moment.outsideDay"
      );
      expect(code(await create({ title: "  " }))).toBe("moment.titleRequired");
      expect(code(await create({}, foreign.id))).toBe("day.notFound");
      expect(
        code(
          await events().createMoments(
            ADMIN,
            {
              eventId: event.id,
              dayIds: [],
              ...lunch,
            },
            NOW
          )
        )
      ).toBe("moment.daysRequired");
      expect(
        await getRepositories().sharedMoments.listByEvent(event.id)
      ).toEqual([]);
    }
  );

  it(
    "creates nothing when one of the days refuses the times",
    { tags: ["015-US9"] },
    async () => {
      const { event, first } = await twoDays();
      const short = await createDay(event.id, {
        start: new Date(`${isoDay(40)}T08:00:00Z`),
        end: new Date(`${isoDay(40)}T13:00:00Z`),
        startBookings: new Date(`${isoDay(40)}T08:00:00Z`),
        endBookings: new Date(`${isoDay(40)}T13:00:00Z`),
      });
      const result = await events().createMoments(
        ADMIN,
        {
          eventId: event.id,
          dayIds: [first.id, short.id],
          ...lunch,
        },
        NOW
      );
      expect(code(result)).toBe("moment.outsideDay");
      expect(
        await getRepositories().sharedMoments.listByEvent(event.id)
      ).toEqual([]);
    }
  );

  it("edits and deletes one moment", { tags: ["015-US9"] }, async () => {
    const { event, first, second } = await twoDays();
    const [one, two] = value(
      await events().createMoments(
        ADMIN,
        {
          eventId: event.id,
          dayIds: [first.id, second.id],
          ...lunch,
        },
        NOW
      )
    );
    const edited = value(
      await events().updateMoment(
        ADMIN,
        {
          id: one.id,
          title: "Brunch",
          description: "",
          startTime: "11:00",
          endTime: "12:00",
        },
        NOW
      )
    );
    expect(edited).toMatchObject({
      id: one.id,
      dayId: first.id,
      title: "Brunch",
      description: "",
      start: new Date(`${isoDay(30)}T11:00:00Z`),
    });
    expect(
      code(
        await events().updateMoment(
          ADMIN,
          {
            id: one.id,
            ...lunch,
            endTime: "19:00",
          },
          NOW
        )
      )
    ).toBe("moment.outsideDay");
    expect(
      code(await events().updateMoment(ADMIN, { id: "nope", ...lunch }, NOW))
    ).toBe("moment.notFound");

    value(await events().deleteMoment(ADMIN, { id: one.id }, NOW));
    expect(code(await events().deleteMoment(ADMIN, { id: one.id }, NOW))).toBe(
      "moment.notFound"
    );
    expect(
      (await getRepositories().sharedMoments.listByEvent(event.id)).map(
        (m) => m.id
      )
    ).toEqual([two.id]);
  });

  it(
    "refuses to resize a day that would leave a moment outside it",
    { tags: ["015-US9"] },
    async () => {
      const { event, first } = await twoDays();
      await events().createMoments(
        ADMIN,
        {
          eventId: event.id,
          dayIds: [first.id],
          ...lunch,
        },
        NOW
      );
      const resize = (end: string) =>
        events().updateDay(
          ADMIN,
          {
            id: first.id,
            expectedVersion: first.version,
            start: first.start,
            end: new Date(`${isoDay(30)}T${end}:00Z`),
            startBookings: first.startBookings,
            endBookings: new Date(`${isoDay(30)}T${end}:00Z`),
          },
          NOW
        );
      expect(code(await resize("13:00"))).toBe("day.momentsOutside");
      expect(code(await resize("16:00"))).toBe("ok");
    }
  );

  it(
    "points at the end when only the end is outside the day",
    { tags: ["015-US9"] },
    async () => {
      const { event, first } = await twoDays();
      const result = await events().createMoments(
        ADMIN,
        {
          eventId: event.id,
          dayIds: [first.id],
          ...lunch,
          endTime: "18:30",
        },
        NOW
      );
      expect(!result.ok && result.error.errors?.[0].path).toBe("endTime");
    }
  );

  it(
    "deletes a day's moments with the day",
    { tags: ["015-US9"] },
    async () => {
      const { event, first, second } = await twoDays();
      await events().createMoments(
        ADMIN,
        {
          eventId: event.id,
          dayIds: [first.id, second.id],
          ...lunch,
        },
        NOW
      );
      value(await events().deleteDay(ADMIN, { id: first.id }, NOW));
      expect(
        (await getRepositories().sharedMoments.listByEvent(event.id)).map(
          (m) => m.dayId
        )
      ).toEqual([second.id]);
    }
  );
});
