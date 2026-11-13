import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { attendeeCountFollowUpEmail } from "@/emails/attendee-count-followup";
import { attendeeCountHeadsUpEmail } from "@/emails/attendee-count-headsup";
import { authCodeEmail } from "@/emails/auth-code";
import { authPasswordResetEmail } from "@/emails/auth-password-reset";
import { authSecurityChangedEmail } from "@/emails/auth-security-changed";
import { joinLinkEmail, joinLinkMadeEmail } from "@/emails/join-link";
import { buildEmail, type EmailRecipe } from "@/emails/registry";
import { testEmail } from "@/emails/test-email";
import { formatTime } from "@/server/kernel/localized-text";
import { type Translate, translatorFor } from "@/server/kernel/translator";

const english = translatorFor(null);
// Every message the template translates comes out in guillemets, so any text
// left outside them is a sentence the template wrote without `t`.
const marked: Translate = Object.assign(
  (message: Parameters<Translate>[0]) => `«${english(message)}»`,
  { locale: "en" }
);

const when = {
  start: "2026-06-01T10:00:00.000Z",
  end: "2026-06-01T11:00:00.000Z",
  zone: "UTC",
};
const url = "https://site.example/x";
const recipes: EmailRecipe[] = [
  {
    template: "cohostAdded",
    props: { title: "Ttl", time: when, location: ["Rm"], sessionUrl: url },
  },
  {
    template: "comment",
    props: {
      subject: { kind: "session", title: "Ttl" },
      recipient: "commenter",
      commenterName: "Nme",
      url,
    },
  },
  {
    template: "comment",
    props: {
      subject: { kind: "profile", ownerName: "Own" },
      recipient: "responsible",
      commenterName: "Nme",
      url,
    },
  },
  {
    template: "meetingNudge",
    props: { askerName: "Nme", eventName: "Evt", url },
  },
  {
    template: "meetingNudgeAnswered",
    props: { recipientName: "Nme", eventName: "Evt", url },
  },
  {
    template: "meetingOutcome",
    props: {
      actorName: "Nme",
      outcome: "accepted",
      time: when,
      meetingPoint: "Pnt",
      url,
    },
  },
  {
    template: "meetingOutcome",
    props: {
      actorName: "Nme",
      outcome: "canceled",
      time: when,
      meetingPoint: "Pnt",
      url,
    },
  },
  {
    template: "meetingRequest",
    props: { requesterName: "Nme", time: when, meetingPoint: "Pnt", url },
  },
  {
    template: "proposalJoined",
    props: { title: "Ttl", joinerName: "Nme", proposalUrl: url },
  },
  {
    template: "sessionChanged",
    props: {
      recipient: "host",
      title: "Ttl",
      newTime: when,
      oldTime: when,
      newLocation: ["Rm"],
      oldLocation: [],
      sessionUrl: url,
    },
  },
  {
    template: "sessionDeleted",
    props: {
      recipient: "attendee",
      title: "Ttl",
      time: when,
      location: [],
      eventUrl: url,
    },
  },
  { template: "sessionLostHost", props: { title: "Ttl", sessionUrl: url } },
];
const messages = [
  ...recipes.map((recipe) => buildEmail(recipe, marked)),
  authCodeEmail(
    { name: "Nme", code: "123456", loginUrl: url, validMinutes: 10 },
    marked
  ),
  authPasswordResetEmail(
    { name: "Nme", resetUrl: url, validMinutes: 1 },
    marked
  ),
  authSecurityChangedEmail({ name: "Nme", change: "disabled" }, marked),
  joinLinkEmail({ name: "Nme", eventName: "Evt", joinUrl: url }, marked),
  joinLinkMadeEmail({ name: "Nme", eventName: "Evt" }, marked),
  testEmail({ name: "Nme" }, marked),
  attendeeCountHeadsUpEmail(
    { title: "Ttl", time: when, location: [], sessionUrl: url },
    marked
  ),
  attendeeCountFollowUpEmail(
    { title: "Ttl", time: when, recordUrl: url },
    marked
  ),
];

describe("email templates", { tags: ["022-US2"] }, () => {
  it("keep a session with no end unscheduled, and a single moment a time", () => {
    const at = { start: when.start, zone: "UTC" };
    expect(formatTime({ ...at, end: null }, english)).toBe("Unscheduled");
    expect(formatTime(at, english)).toBe("Monday 1 June, 10:00");
  });

  it("write every sentence through the recipient's translator", () => {
    for (const message of messages) {
      expect(message.subject.startsWith("«")).toBe(true);
      let text = renderToStaticMarkup(message.body).replace(/<[^>]*>/g, " ");
      // A translated phrase inside another message cannot be reordered or
      // inflected by a translator.
      expect(text).not.toMatch(/«[^»]*«/);
      text = text
        .replace(/«[^»]*»/g, " ")
        .replace(formatTime(when, english), " ")
        // Names, titles and codes are the data a template is given.
        .replace(/\b(Ttl|Nme|Own|Evt|Pnt|Rm|\d+)\b/g, " ");
      expect([message.subject, text.replace(/[\s:—–,.()?"'-]+/g, "")]).toEqual([
        message.subject,
        "",
      ]);
    }
  });
});

describe("emails about a deleted guest", { tags: ["022-US2"] }, () => {
  const german = translatorFor("de");
  const html = (recipe: EmailRecipe) => {
    const mail = buildEmail(recipe, german);
    return mail.subject + renderToStaticMarkup(<>{mail.body}</>);
  };
  const recipes: EmailRecipe[] = [
    {
      template: "meetingRequest",
      props: { requesterName: undefined, time: when, meetingPoint: "", url },
    },
    {
      template: "meetingOutcome",
      props: {
        actorName: undefined,
        outcome: "accepted",
        time: when,
        meetingPoint: "",
        url,
      },
    },
    {
      template: "meetingNudge",
      props: { askerName: undefined, eventName: "Conf", url },
    },
    {
      template: "meetingNudgeAnswered",
      props: { recipientName: undefined, eventName: "Conf", url },
    },
    {
      template: "comment",
      props: {
        subject: { kind: "session", title: "Talk" },
        recipient: "responsible",
        commenterName: undefined,
        url,
      },
    },
  ];

  it("say Jemand in German, and never the English word", () => {
    for (const recipe of recipes) {
      const text = html(recipe);
      expect(text, recipe.template).toContain("Jemand");
      expect(text, recipe.template).not.toContain("Someone");
    }
  });
});
