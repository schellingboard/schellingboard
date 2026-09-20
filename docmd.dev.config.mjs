import fs from "fs";
import path from "path";

const SRC = "docs/dev";

// Breadcrumbs, the sidebar's active trail and prev/next are all derived from
// `navigation` alone, so a page left out of it reads as if it sat nowhere.
function pagesIn(dir) {
  const entries = fs.readdirSync(path.join(SRC, dir), { withFileTypes: true });

  return entries
    .flatMap((entry) => {
      if (entry.isDirectory()) {
        const readme = path.join(SRC, dir, entry.name, "README.md");
        return fs.existsSync(readme)
          ? [{ slug: entry.name, file: readme }]
          : [];
      }
      if (!entry.name.endsWith(".md") || entry.name === "README.md") return [];
      return [
        {
          slug: entry.name.slice(0, -".md".length),
          file: path.join(SRC, dir, entry.name),
        },
      ];
    })
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map(({ slug, file }) => ({
      title: titleOf(file),
      path: `/${dir}/${slug}/`,
    }));
}

function titleOf(file) {
  const h1 = fs.readFileSync(file, "utf-8").match(/^#\s+(.+?)\s*$/m);
  return (h1 ? h1[1] : path.basename(file, ".md")).replace(/^ADR\s+/, "");
}

export default {
  title: "SchellingBoard Developers",
  url: "https://developers.schellingboard.org",
  src: SRC,
  out: "dev-site",
  logo: {
    light: "logo/logo.svg",
    dark: "logo/logo-reversed.svg",
    alt: "SchellingBoard",
    height: "1.5rem",
  },
  favicon: "logo/favicon.svg",
  engine: "js",
  markdown: {
    breaks: false,
  },
  layout: {
    spa: true,
    header: {
      enabled: true,
    },
    sidebar: {
      collapsible: true,
      defaultCollapsed: false,
    },
    optionsMenu: {
      position: "sidebar-top",
      components: {
        search: true,
        themeSwitch: true,
      },
    },
    footer: {
      style: "minimal",
      content:
        "Developer documentation, built from `main` — [user documentation](https://docs.schellingboard.org) is published from release tags. [Source on GitHub](https://github.com/schellingboard/schellingboard).",
      branding: true,
    },
  },
  theme: {
    name: "default",
    appearance: "system",
    codeHighlight: true,
  },
  customJs: ["assets/js/likec4-embed.js"],
  minify: true,
  autoTitleFromH1: true,
  copyCode: true,
  pageNavigation: true,
  navigation: [
    { title: "Overview", path: "/", icon: "home" },
    {
      title: "Getting started",
      path: "/getting-started/",
      icon: "rocket",
    },
    {
      title: "Coding guidelines",
      path: "/coding-guidelines/",
      icon: "code",
    },
    { title: "Testing", path: "/testing/", icon: "flask-conical" },
    {
      title: "Version control",
      path: "/version-control/",
      icon: "git-branch",
    },
    { title: "Changelog", path: "/changelog/", icon: "list" },
    {
      title: "Reference",
      icon: "book-open",
      collapsible: false,
      children: [
        {
          title: "Architecture rules",
          path: "/architecture-rules/",
          icon: "shield-check",
        },
        {
          title: "Database migrations",
          path: "/migrations/",
          icon: "database",
        },
        {
          title: "Running multiple instances",
          path: "/multiple-instances/",
          icon: "copy",
        },
        {
          title: "Documentation",
          path: "/documentation/",
          icon: "file-text",
        },
        { title: "Releasing", path: "/releasing/", icon: "package" },
        {
          title: "GitHub issues",
          path: "/github-issues/",
          icon: "circle-dot",
        },
      ],
    },
    {
      title: "Design",
      icon: "drafting-compass",
      collapsible: false,
      children: [
        {
          title: "Decision records",
          path: "/adr/",
          icon: "gavel",
          children: pagesIn("adr"),
        },
        {
          title: "Target architecture",
          path: "/target-architecture/",
          icon: "layers",
          children: pagesIn("target-architecture"),
        },
        {
          title: "Diagram explorer",
          path: "/diagrams/",
          icon: "workflow",
          external: true,
        },
        {
          title: "Attendance model",
          path: "/attendance-model/",
          icon: "chart-line",
          children: pagesIn("attendance-model"),
        },
        {
          title: "Matrix chat feasibility",
          path: "/exploration/matrix-chat/",
          icon: "message-circle",
        },
      ],
    },
    {
      title: "GitHub",
      path: "https://github.com/schellingboard/schellingboard",
      icon: "github",
      external: true,
    },
  ],
  plugins: {
    ai: {
      enabled: false,
    },
    git: {
      commitHistory: true,
      maxCommits: 5,
    },
    "./scripts/docmd-git-history.js": {},
    seo: {
      defaultDescription:
        "Developer documentation for SchellingBoard: setup, coding and testing guidelines, architecture decisions and the release process.",
    },
  },
};
