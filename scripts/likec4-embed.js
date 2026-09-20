/**
 * Loads the LikeC4 web component on demand and keeps it on docmd's theme.
 *
 * docmd's `customJs` is site-wide, and the bundle is ~2.5 MB — far too much to
 * put on every page for the handful that embed a diagram. This shim is the
 * site-wide script; it pulls the bundle in only once a <likec4-view> is
 * actually in the document.
 *
 * The bundle is the one `likec4 build` drops beside the explorer, so an
 * embedded view and the explorer can never render different models.
 * Copied to dev-site/assets/js/ by scripts/build-dev-docs.sh.
 */
(function () {
  var BUNDLE = "/diagrams/likec4-views.js";
  var requested = false;

  function syncTheme() {
    var theme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    document.querySelectorAll("likec4-view").forEach(function (el) {
      el.setAttribute("color-scheme", theme);
    });
  }

  function loadBundle() {
    if (requested || !document.querySelector("likec4-view")) return;
    requested = true;
    var script = document.createElement("script");
    script.src = BUNDLE;
    script.defer = true;
    document.head.appendChild(script);
  }

  function update() {
    syncTheme();
    loadBundle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", update);
  } else {
    update();
  }
  // docmd navigates in-page when layout.spa is on, so a diagram can arrive
  // long after DOMContentLoaded.
  document.addEventListener("docmd:page-mounted", update);

  new MutationObserver(syncTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
})();
