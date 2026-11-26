import { describe, expect, it } from "vitest";

import {
  guestConfigs,
  SEED_PROTECTED_PASSWORD,
} from "@/scripts/seed/data/guests";
import { demoGate } from "@/server/demo/gate";

const PAGE = "<html><head></head><body><div id=root></div></body></html>";

const respond = (body: string, type: string, status = 200) =>
  demoGate({
    inner: () =>
      new Response(body, { status, headers: { "content-type": type } }),
    nextReset: () => new Date(),
  });

const get = (gate: ReturnType<typeof demoGate>) =>
  gate(new Request("http://demo/"));

describe("the demo banner", { tags: ["024-US1"] }, () => {
  it("adds one style, one script and the notice to a page", async () => {
    const html = await (
      await get(respond(PAGE, "text/html; charset=utf-8"))
    ).text();

    expect(html.match(/<style/g)).toHaveLength(1);
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(html).toContain('role="region" aria-label="Public demo notice"');
    expect(html).toContain("site-admin");
    expect(html).toContain("abuse@schellingboard.org");
    expect(html.indexOf("demo-banner")).toBeLessThan(
      html.indexOf("<div id=root>")
    );
  });

  it("offers an admin and a regular account that the seed protects", async () => {
    const html = await (await get(respond(PAGE, "text/html"))).text();

    expect(html).toContain("<code>Site Admin</code> (<code>site-admin</code>)");
    expect(html).toContain("<code>Wei Chen</code>");
    expect(html).toContain(`<code>${SEED_PROTECTED_PASSWORD}</code>`);
    expect(guestConfigs.find((g) => g.name === "Wei Chen")?.password).toBe(
      SEED_PROTECTED_PASSWORD
    );
  });

  it.each([
    ["application/json", '{"a":1}'],
    ["text/javascript", "console.log(1)"],
  ])("leaves %s alone", async (type, body) => {
    expect(await (await get(respond(body, type))).text()).toBe(body);
  });

  it("leaves a failed page alone", async () => {
    const res = await get(respond(PAGE, "text/html", 404));

    expect(res.status).toBe(404);
    expect(await res.text()).toBe(PAGE);
  });
});
