export type Actor =
  "attendee" | "host" | "organizer" | "self-hoster" | "developer";

export type Component =
  | "1-on-1s"
  | "admin"
  | "attendees"
  | "auth"
  | "infra & dev"
  | "notifications"
  | "other"
  | "proposals"
  | "scheduling"
  | "ui/ux"
  | "voting";

export type Priority = "P1" | "P2" | "P3";

export interface UseCase {
  title: string;
  actor: Actor;
  priority: Priority;
  status?: "planned" | "deprecated";
}

export interface Feature {
  slug: string;
  component: Component;
  stories: Record<string, UseCase>;
}

export const features = {
  "001": {
    slug: "session-attendance-count",
    component: "scheduling",
    stories: {
      US1: {
        title: "Host records how many people came",
        actor: "host",
        priority: "P1",
      },
      US2: {
        title: "Host is reminded before and after their session",
        actor: "host",
        priority: "P2",
      },
      US2b: {
        title: "Host gets reminders without an organizer sending them",
        actor: "host",
        priority: "P2",
      },
      US3: {
        title: "Host is not nagged by the schedule about counts",
        actor: "host",
        priority: "P3",
      },
    },
  },
  "002": {
    slug: "event-access",
    component: "auth",
    stories: {
      US1: {
        title: "Attendee unlocks the site with the shared password",
        actor: "attendee",
        priority: "P1",
      },
      US2: {
        title: "Attendee opens an event from the list of events",
        actor: "attendee",
        priority: "P1",
      },
    },
  },
  "003": {
    slug: "attendee-identity",
    component: "auth",
    stories: {
      US1: {
        title: "Attendee picks their name",
        actor: "attendee",
        priority: "P1",
      },
      US2: {
        title: "Attendee switches to another name or clears it",
        actor: "attendee",
        priority: "P2",
      },
      US3: {
        title: "Attendee protects their name with a password",
        actor: "attendee",
        priority: "P1",
      },
      US4: {
        title: "Attendee logs in to their protected name",
        actor: "attendee",
        priority: "P1",
      },
      US5: {
        title: "Attendee resets a forgotten password",
        actor: "attendee",
        priority: "P2",
      },
    },
  },
  "004": {
    slug: "proposals",
    component: "proposals",
    stories: {
      US1: {
        title: "Attendee proposes a session",
        actor: "attendee",
        priority: "P1",
      },
      US2: {
        title: "Host edits their proposal and adds co-hosts",
        actor: "host",
        priority: "P1",
      },
      US3: {
        title: "Host deletes their proposal",
        actor: "host",
        priority: "P2",
      },
      US4: {
        title: "Attendee reads a proposal's details",
        actor: "attendee",
        priority: "P1",
      },
      US5: {
        title: "Attendee searches, filters and sorts the proposals",
        actor: "attendee",
        priority: "P2",
      },
      US6: {
        title: "Attendee takes on a proposal that wants a host",
        actor: "attendee",
        priority: "P2",
      },
      US7: {
        title: "Host asks for a co-host on their proposal",
        actor: "host",
        priority: "P3",
      },
    },
  },
  "005": {
    slug: "voting",
    component: "voting",
    stories: {
      US1: {
        title: "Attendee votes on a proposal",
        actor: "attendee",
        priority: "P1",
      },
      US2: {
        title: "Attendee quick-votes through the proposals one by one",
        actor: "attendee",
        priority: "P2",
      },
      US3: {
        title: "Host sees how their proposal was voted on",
        actor: "host",
        priority: "P2",
      },
      US4: {
        title: "Host sees how many people to expect",
        actor: "host",
        priority: "P3",
      },
    },
  },
  "006": {
    slug: "event-phases",
    component: "other",
    stories: {
      US1: {
        title: "Attendee can do what the event's current phase allows",
        actor: "attendee",
        priority: "P1",
      },
      US2: {
        title: "Attendee learns why a control is greyed out",
        actor: "attendee",
        priority: "P3",
      },
    },
  },
  "007": {
    slug: "schedule",
    component: "scheduling",
    stories: {
      US1: {
        title: "Attendee browses the schedule grid by room and time",
        actor: "attendee",
        priority: "P1",
      },
      US2: {
        title: "Attendee browses the schedule as an agenda",
        actor: "attendee",
        priority: "P1",
      },
      US3: {
        title: "Attendee searches and filters the schedule",
        actor: "attendee",
        priority: "P2",
      },
      US4: {
        title: "Attendee jumps to what is on now",
        actor: "attendee",
        priority: "P2",
      },
      US5: {
        title: "Attendee opens a session's details",
        actor: "attendee",
        priority: "P1",
      },
      US6: {
        title: "Attendee looks up a room's and the event's details",
        actor: "attendee",
        priority: "P3",
      },
      US7: {
        title: "Organizer shows the schedule on a kiosk screen",
        actor: "organizer",
        priority: "P3",
      },
    },
  },
  "008": {
    slug: "session-hosting",
    component: "scheduling",
    stories: {
      US1: {
        title: "Host puts their proposal on the schedule",
        actor: "host",
        priority: "P1",
      },
      US2: {
        title: "Host edits their session",
        actor: "host",
        priority: "P1",
      },
      US3: {
        title: "Host deletes their session",
        actor: "host",
        priority: "P2",
      },
      US4: {
        title: "Host caps attendance below the room's capacity",
        actor: "host",
        priority: "P3",
      },
    },
  },
  "009": {
    slug: "rsvp",
    component: "scheduling",
    stories: {
      US1: {
        title: "Attendee RSVPs to a session and withdraws again",
        actor: "attendee",
        priority: "P1",
      },
      US2: {
        title: "Attendee cannot RSVP to a full session",
        actor: "attendee",
        priority: "P2",
      },
      US3: {
        title: "Attendee is warned when an RSVP clashes with a 1-on-1",
        actor: "attendee",
        priority: "P3",
      },
    },
  },
  "010": {
    slug: "comments",
    component: "attendees",
    stories: {
      US1: {
        title: "Attendee discusses a proposal",
        actor: "attendee",
        priority: "P2",
      },
      US2: {
        title: "Attendee discusses a session",
        actor: "attendee",
        priority: "P2",
      },
      US3: {
        title: "Attendee comments on someone's profile",
        actor: "attendee",
        priority: "P3",
      },
      US4: {
        title: "Attendee edits or deletes their own comment",
        actor: "attendee",
        priority: "P3",
      },
      US5: {
        title: "Attendee replies to a comment and links to it",
        actor: "attendee",
        priority: "P3",
      },
      US6: {
        title: "Attendee likes a comment and sees who liked it",
        actor: "attendee",
        priority: "P3",
      },
    },
  },
  "011": {
    slug: "profiles",
    component: "attendees",
    stories: {
      US1: {
        title: "Attendee fills in their profile",
        actor: "attendee",
        priority: "P1",
      },
      US2: {
        title: "Attendee uploads a profile photo",
        actor: "attendee",
        priority: "P2",
      },
      US3: {
        title: "Attendee searches, filters and sorts the attendee directory",
        actor: "attendee",
        priority: "P1",
      },
      US4: {
        title: "Attendee reads profiles one after another",
        actor: "attendee",
        priority: "P2",
      },
      US5: {
        title: "Attendee looks at someone's photo up close",
        actor: "attendee",
        priority: "P3",
      },
    },
  },
  "012": {
    slug: "one-on-ones",
    component: "1-on-1s",
    stories: {
      US1: {
        title: "Organizer offers 1-on-1s at an event",
        actor: "organizer",
        priority: "P1",
      },
      US2: {
        title: "Attendee declares when they are free for 1-on-1s",
        actor: "attendee",
        priority: "P1",
      },
      US3: {
        title: "Attendee asks someone for a 1-on-1",
        actor: "attendee",
        priority: "P1",
      },
      US4: {
        title: "Attendee answers a 1-on-1 request",
        actor: "attendee",
        priority: "P1",
      },
      US5: {
        title: "Attendee sees 1-on-1s on the schedule",
        actor: "attendee",
        priority: "P2",
      },
      US6: {
        title: "Attendee arranges a 1-on-1 from the schedule",
        actor: "attendee",
        priority: "P2",
      },
    },
  },
  "013": {
    slug: "notifications",
    component: "notifications",
    stories: {
      US1: {
        title: "Attendee is notified in the app about what concerns them",
        actor: "attendee",
        priority: "P1",
      },
      US2: {
        title: "Attendee marks notifications read",
        actor: "attendee",
        priority: "P2",
      },
      US3: {
        title: "Attendee gets notifications on their phone",
        actor: "attendee",
        priority: "P2",
      },
      US4: {
        title: "Attendee is emailed when a session of theirs changes",
        actor: "attendee",
        priority: "P2",
      },
      US5: {
        title: "Attendee chooses which emails they receive",
        actor: "attendee",
        priority: "P2",
      },
      US6: {
        title:
          "Attendee still gets their notification emails after a mail outage",
        actor: "attendee",
        priority: "P2",
      },
    },
  },
  "014": {
    slug: "app-experience",
    component: "ui/ux",
    stories: {
      US1: {
        title: "Attendee switches between light and dark",
        actor: "attendee",
        priority: "P3",
      },
      US2: {
        title: "Attendee installs the app on their phone",
        actor: "attendee",
        priority: "P2",
      },
      US3: {
        title: "Attendee reads what is new in this release",
        actor: "attendee",
        priority: "P3",
      },
    },
  },
  "015": {
    slug: "admin-setup",
    component: "admin",
    stories: {
      US1: {
        title: "Organizer logs in to the admin area",
        actor: "organizer",
        priority: "P1",
      },
      US2: {
        title: "Organizer creates, edits and deletes events",
        actor: "organizer",
        priority: "P1",
      },
      US3: {
        title: "Organizer sets an event's phase dates",
        actor: "organizer",
        priority: "P1",
      },
      US4: {
        title: "Organizer sets an event's days",
        actor: "organizer",
        priority: "P1",
      },
      US5: {
        title: "Organizer sets the site title and venue map",
        actor: "organizer",
        priority: "P3",
      },
    },
  },
  "016": {
    slug: "admin-guests",
    component: "admin",
    stories: {
      US1: {
        title: "Organizer creates, edits and deletes guests",
        actor: "organizer",
        priority: "P1",
      },
      US2: {
        title: "Organizer imports guests from a CSV file",
        actor: "organizer",
        priority: "P2",
      },
      US3: {
        title: "Organizer assigns guests to an event",
        actor: "organizer",
        priority: "P1",
      },
    },
  },
  "017": {
    slug: "admin-locations",
    component: "admin",
    stories: {
      US1: {
        title: "Organizer creates, edits, orders and deletes locations",
        actor: "organizer",
        priority: "P1",
      },
      US2: {
        title: "Organizer uploads a location image",
        actor: "organizer",
        priority: "P3",
      },
      US3: {
        title: "Organizer assigns locations to an event",
        actor: "organizer",
        priority: "P1",
      },
      US4: {
        title: "Organizer marks when a room is unavailable",
        actor: "organizer",
        priority: "P2",
      },
    },
  },
  "018": {
    slug: "admin-moderation",
    component: "admin",
    stories: {
      US1: {
        title: "Organizer creates, edits and deletes proposals",
        actor: "organizer",
        priority: "P2",
      },
      US2: {
        title: "Organizer creates, edits and deletes sessions",
        actor: "organizer",
        priority: "P1",
      },
      US3: {
        title: "Organizer adds and removes RSVPs",
        actor: "organizer",
        priority: "P3",
      },
    },
  },
  "019": {
    slug: "self-hosting",
    component: "infra & dev",
    stories: {
      US1: {
        title: "Self-hoster checks that the deployment is up",
        actor: "self-hoster",
        priority: "P2",
      },
      US2: {
        title:
          "Self-hoster's script retries an API call without it taking effect twice",
        actor: "self-hoster",
        priority: "P3",
      },
      US3: {
        title:
          "Organizer's script reads and syncs events, days and locations through the admin API",
        actor: "organizer",
        priority: "P3",
      },
      US4: {
        title:
          "Organizer's script manages guests and the site settings through the admin API",
        actor: "organizer",
        priority: "P3",
      },
      US5: {
        title:
          "Organizer's script seeds an event's proposals, sessions and RSVPs, past ones included",
        actor: "organizer",
        priority: "P3",
      },
      US6: {
        title:
          "Self-hoster reads the API reference of the running version and tries requests in the browser",
        actor: "self-hoster",
        priority: "P3",
      },
    },
  },
  "020": {
    slug: "dev-tools",
    component: "infra & dev",
    stories: {
      US1: {
        title: "Developer moves the app's clock to another time",
        actor: "developer",
        priority: "P3",
      },
    },
  },
} as const satisfies Record<string, Feature>;

type Features = typeof features;

export type UseCaseId = {
  [F in keyof Features]: `${F}-${keyof Features[F]["stories"] & string}`;
}[keyof Features];

export interface CatalogueEntry extends UseCase {
  id: UseCaseId;
  feature: keyof Features;
  slug: string;
  component: Component;
}

export const useCases: CatalogueEntry[] = Object.entries(features).flatMap(
  ([feature, { slug, component, stories }]) =>
    Object.entries(stories).map(([story, useCase]) => ({
      ...(useCase as UseCase),
      id: `${feature}-${story}` as UseCaseId,
      feature: feature as keyof Features,
      slug,
      component,
    }))
);

declare module "vitest" {
  interface TestTags {
    useCase: UseCaseId;
  }
}
