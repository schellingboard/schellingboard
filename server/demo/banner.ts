import {
  SEED_PROTECTED_PASSWORD,
  SEED_SITE_ADMIN,
} from "@/scripts/seed/data/guests";

export const CONTACT = "abuse@schellingboard.org";
const SOON_MS = 30 * 60 * 1000;
const SAMPLE_GUEST = "Wei Chen";

const STYLE = `
#demo-banner{display:flex;flex-wrap:wrap;align-items:center;gap:.25rem .75rem;padding:.5rem 1rem;background:#1f2937;color:#f9fafb;font:13px/1.35 system-ui,sans-serif}
#demo-banner[hidden]{display:none}
#demo-banner p{margin:0;flex:1 1 20rem}
#demo-banner strong{color:#fde68a}
#demo-banner code{background:rgba(255,255,255,.15);padding:0 .25rem;border-radius:.25rem}
#demo-banner a{color:#bfdbfe}
#demo-banner [data-countdown].soon{background:#fde68a;color:#78350f;font-weight:700;padding:0 .25rem;border-radius:.25rem}
#demo-banner button{flex:none;min-height:2rem;padding:0 .75rem;border:1px solid #9ca3af;border-radius:.375rem;background:transparent;color:inherit;font:inherit;cursor:pointer}
#demo-banner.short{padding-block:.125rem}
#demo-banner.short p{flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#demo-banner.short button{min-height:1.5rem}
@media (max-width:600px){#demo-banner{font-size:12px;padding-inline:.75rem}#demo-banner:not(.short) p{flex-basis:100%}}
`;

export const MARKUP = `<div id="demo-banner" role="region" aria-label="Public demo notice">
<p><strong>Public demo.</strong><span data-more> Anyone can post here: do not enter real data and do not trust links.</span> Resets in <span data-countdown>…</span>.<span data-more> Sign in as <code>${SEED_SITE_ADMIN.name}</code> (<code>${SEED_SITE_ADMIN.username}</code>) or <code>${SAMPLE_GUEST}</code> with password <code>${SEED_PROTECTED_PASSWORD}</code>. Report abuse to <a href="mailto:${CONTACT}">${CONTACT}</a>.</span></p>
<button type="button" data-close aria-label="Close demo notice">Close</button>
<button type="button" data-open hidden>Show info</button>
</div>`;

export const SCRIPT = `(function () {
  var bar = document.getElementById("demo-banner");
  if (!bar) return;
  // The app's fixed bars sit this far down, and move up as the notice scrolls away.
  function inset() {
    var px = Math.max(0, bar.offsetHeight - window.scrollY);
    document.documentElement.style.setProperty("--top-inset", px + "px");
  }
  var more = bar.querySelectorAll("[data-more]");
  var close = bar.querySelector("[data-close]");
  var reopen = bar.querySelector("[data-open]");
  var KEY = "demo-banner-closed";
  function show(open) {
    bar.classList.toggle("short", !open);
    more.forEach(function (el) { el.hidden = !open; });
    close.hidden = !open;
    reopen.hidden = open;
    inset();
  }
  // Most links load a new page, which would bring a shortened notice back.
  function choose(open) {
    try { sessionStorage.setItem(KEY, open ? "" : "1"); } catch (e) {}
    show(open);
  }
  var closed = false;
  try { closed = sessionStorage.getItem(KEY) === "1"; } catch (e) {}
  window.addEventListener("scroll", inset, { passive: true });
  new ResizeObserver(inset).observe(bar);
  show(!closed);
  close.addEventListener("click", function () {
    choose(false);
  });
  reopen.addEventListener("click", function () {
    choose(true);
  });
  var out = bar.querySelector("[data-countdown]");
  var end = null;
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    if (end === null) return;
    var left = end - Date.now();
    if (left <= 0) { out.textContent = "now"; return; }
    var s = Math.floor(left / 1000);
    out.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor((s % 3600) / 60)) + ":" + pad(s % 60);
    out.classList.toggle("soon", left < ${SOON_MS});
  }
  setInterval(tick, 1000);
  fetch("/demo/status", { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("status " + r.status);
      return r.json();
    })
    .then(function (s) {
      if (!Number.isFinite(s.msUntilReset)) throw new Error("no time");
      end = Date.now() + s.msUntilReset;
      tick();
    })
    .catch(function () { out.textContent = "soon"; });
})();`;

export const BANNER = `<style>${STYLE}</style>${MARKUP}<script>${SCRIPT}</script>`;

export function withBanner(html: string): string {
  const body = /<body[^>]*>/i.exec(html);
  if (!body) return BANNER + html;
  const at = body.index + body[0].length;
  return html.slice(0, at) + BANNER + html.slice(at);
}
