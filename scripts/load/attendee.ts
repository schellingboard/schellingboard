import { pickWeighted } from "./options";
import type { Recorder } from "./stats";

// Think time between actions, and how often each kind happens.
const REQUEST_TIMEOUT_MS = 30_000;
export const THINK_MS = { min: 5_000, max: 30_000 };
export const ACTION_WEIGHTS = { read: 90, write: 8, comment: 2 };
const READ_WEIGHTS = {
  snapshot: 20,
  session: 30,
  proposal: 30,
  proposals: 10,
  profile: 10,
};
const WRITE_WEIGHTS = { rsvp: 60, vote: 40 };
/** Suffix of the endpoints hit on opening the app: judged apart from steady use. */
export const PAGE_LOAD = " (page load)";
const VOTE_CHOICES = ["interested", "maybe", "skip"];

type SnapshotSession = {
  id: string;
  startTime: string | null;
  closed: boolean;
};
export type SnapshotJson = {
  seq: number;
  event: { id: string };
  sessions: SnapshotSession[];
  counts: Record<string, number>;
  proposals: { id: string }[];
  guests: { id: string }[];
  me: { rsvps: { sessionId: string }[] } | null;
};

// Stands in for a snapshot that failed to load; the failure is already recorded.
const EMPTY_SNAPSHOT: SnapshotJson = {
  seq: 0,
  event: { id: "" },
  sessions: [],
  counts: {},
  proposals: [],
  guests: [],
  me: null,
};

export type Site = {
  base: string;
  siteCookie: string;
  gamma: { slug: string; eventId: string };
  beta: { slug: string; eventId: string };
  rec: Recorder;
  rand: () => number;
  stopped: () => boolean;
  stopping: Promise<void>;
};

export class Attendee {
  /** The RSVPs this attendee holds at the end, for the consistency check. */
  rsvps = new Set<string>();
  initialRsvps = new Set<string>();
  /** Sessions where a toggle got no answer, so the server may or may not hold it. */
  unsure = new Set<string>();
  private gamma!: SnapshotJson;
  private beta!: SnapshotJson;
  private feeds: AbortController[] = [];

  constructor(
    private site: Site,
    readonly guestId: string,
    private token: string
  ) {}

  private get cookie() {
    return `site-auth=${this.site.siteCookie}; guest=${this.token}`;
  }

  private async call(
    name: string,
    method: string,
    path: string,
    body?: unknown
  ): Promise<{ status: number; json: unknown }> {
    const headers: Record<string, string> = { cookie: this.cookie };
    if (body !== undefined) headers["content-type"] = "application/json";
    if (method !== "GET") headers["idempotency-key"] = crypto.randomUUID();
    const started = performance.now();
    let status = 0;
    let json: unknown = null;
    try {
      const res = await fetch(this.site.base + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      status = res.status;
      json = await res.json().catch(() => null);
    } catch {
      // recorded as status 0
    }
    this.site.rec.record(name, performance.now() - started, status);
    return { status, json };
  }

  private async snapshot(
    event: "gamma" | "beta",
    label = ""
  ): Promise<SnapshotJson> {
    const { slug } = this.site[event];
    const res = await this.call(
      `GET /events/{slug}/snapshot${label}`,
      "GET",
      `/api/v1/events/${slug}/snapshot`
    );
    return (res.json as SnapshotJson | null) ?? EMPTY_SNAPSHOT;
  }

  /** The page load: the shell, its assets, the identity and the snapshot. */
  async open(assets: string[]) {
    await Promise.all([
      this.plain(`GET /{page}${PAGE_LOAD}`, "/"),
      ...assets.map((a) => this.plain(`GET /_spa/*${PAGE_LOAD}`, a)),
    ]);
    await this.call(
      `GET /me/identity${PAGE_LOAD}`,
      "GET",
      "/api/v1/me/identity"
    );
    this.gamma = await this.snapshot("gamma", PAGE_LOAD);
    this.beta = await this.snapshot("beta", PAGE_LOAD);
    for (const r of this.gamma.me?.rsvps ?? []) this.rsvps.add(r.sessionId);
    this.initialRsvps = new Set(this.rsvps);
    void this.holdFeed("gamma");
  }

  private async plain(name: string, path: string) {
    const started = performance.now();
    let status = 0;
    try {
      const res = await fetch(this.site.base + path, {
        headers: { cookie: this.cookie },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      await res.arrayBuffer();
      status = res.status;
    } catch {
      // recorded as status 0
    }
    this.site.rec.record(name, performance.now() - started, status);
  }

  // Like the browser's EventSource: reads the stream and reconnects when the
  // server ends it. Only the connect is timed; the stream itself is endless.
  private async holdFeed(event: "gamma") {
    const { slug } = this.site[event];
    let since = this.gamma.seq;
    while (!this.site.stopped()) {
      const controller = new AbortController();
      this.feeds.push(controller);
      const started = performance.now();
      let connected = false;
      try {
        const res = await fetch(
          `${this.site.base}/api/v1/events/${slug}/feed?since=${since}`,
          { headers: { cookie: this.cookie }, signal: controller.signal }
        );
        connected = true;
        this.site.rec.record(
          "GET /events/{slug}/feed (connect)",
          performance.now() - started,
          res.status
        );
        if (!res.body || !res.ok) return;
        for await (const chunk of res.body) {
          const ids = [
            ...new TextDecoder().decode(chunk).matchAll(/^id: (\d+)/gm),
          ];
          if (ids.length) since = Number(ids[ids.length - 1][1]);
        }
      } catch {
        if (this.site.stopped()) return;
        if (!connected)
          this.site.rec.record(
            "GET /events/{slug}/feed (connect)",
            performance.now() - started,
            0
          );
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  async run() {
    while (!this.site.stopped()) {
      const { min, max } = THINK_MS;
      await Promise.race([
        new Promise((r) => setTimeout(r, min + this.site.rand() * (max - min))),
        this.site.stopping,
      ]);
      if (this.site.stopped()) return;
      await this.act();
    }
  }

  private pick<T>(items: T[]): T | undefined {
    return items[Math.floor(this.site.rand() * items.length)];
  }

  private async act() {
    const kind = pickWeighted(ACTION_WEIGHTS, this.site.rand());
    if (kind === "read") return this.read();
    if (kind === "comment") return this.comment();
    return pickWeighted(WRITE_WEIGHTS, this.site.rand()) === "rsvp"
      ? this.toggleRsvp()
      : this.vote();
  }

  private async read() {
    const what = pickWeighted(READ_WEIGHTS, this.site.rand());
    if (what === "snapshot") {
      this.gamma = await this.snapshot("gamma");
      return;
    }
    if (what === "proposals") {
      await this.call(
        "GET /proposals",
        "GET",
        `/api/v1/proposals?eventId=${this.beta.event.id}&limit=50`
      );
      return;
    }
    const id =
      what === "session"
        ? this.pick(this.gamma.sessions)?.id
        : what === "proposal"
          ? this.pick(this.beta.proposals)?.id
          : this.pick(this.gamma.guests)?.id;
    if (!id) return;
    const path = {
      session: "sessions",
      proposal: "proposals",
      profile: "guests",
    }[what];
    await this.call(`GET /${path}/{id}`, "GET", `/api/v1/${path}/${id}`);
  }

  private async toggleRsvp() {
    const session = this.pick(
      this.gamma.sessions.filter((s) => s.startTime && !s.closed)
    );
    if (!session) return;
    const held = this.rsvps.has(session.id);
    const res = await this.call(
      "PUT|DELETE /sessions/{id}/rsvps/{guestId}",
      held ? "DELETE" : "PUT",
      `/api/v1/sessions/${session.id}/rsvps/${this.guestId}`
    );
    if (res.status === 0) this.unsure.add(session.id);
    if (res.status < 200 || res.status >= 300) return;
    if (held) this.rsvps.delete(session.id);
    else this.rsvps.add(session.id);
  }

  private async vote() {
    const proposal = this.pick(this.beta.proposals);
    if (!proposal) return;
    await this.call(
      "PUT /proposals/{id}/votes/{guestId}",
      "PUT",
      `/api/v1/proposals/${proposal.id}/votes/${this.guestId}`,
      { choice: this.pick(VOTE_CHOICES) }
    );
  }

  private async comment() {
    const session = this.pick(this.gamma.sessions);
    if (!session) return;
    await this.call(
      "POST /sessions/{id}/comments",
      "POST",
      `/api/v1/sessions/${session.id}/comments`,
      { body: "Looking forward to this one." }
    );
  }

  close() {
    for (const feed of this.feeds) feed.abort();
  }
}
