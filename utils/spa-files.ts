import { readFile } from "fs/promises";
import path from "path";

// Read relative to the working directory, as the migrations are, so the same
// path holds under `next start` and in the standalone image.
export const spaDir = () => path.join(process.cwd(), "apps/web/dist");

const TYPES: Record<string, string> = {
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
  ".map": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const NO_STORE = "no-store";

const escapeAttribute = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** The build id rides in the shell so a cached copy still says which build it is. */
export async function serveSpaShell(
  dir: string,
  buildId: string
): Promise<Response> {
  try {
    const html = (await readFile(path.join(dir, "index.html"), "utf8")).replace(
      "</head>",
      `<meta name="sb-build" content="${escapeAttribute(buildId)}"></head>`
    );
    return new Response(html, {
      headers: {
        "content-type": TYPES[".html"],
        "cache-control": NO_STORE,
      },
    });
  } catch {
    return new Response("The web app has not been built.", {
      status: 503,
      headers: { "cache-control": NO_STORE },
    });
  }
}

const notFound = () =>
  new Response("Not found", {
    status: 404,
    headers: { "cache-control": NO_STORE },
  });

// Build output is content-hashed, so a URL never changes meaning.
const IMMUTABLE = "public, max-age=31536000, immutable";

export async function serveSpaAsset(
  dir: string,
  segments: string[],
  cacheControl = IMMUTABLE
): Promise<Response> {
  const safe =
    segments.length > 0 &&
    segments.every((s) => s !== "" && s !== ".." && !/[\\/\0]/.test(s));
  if (!safe || segments.join("/") === "index.html") return notFound();
  try {
    const file = await readFile(path.join(dir, ...segments));
    return new Response(new Uint8Array(file), {
      headers: {
        "content-type":
          TYPES[path.extname(segments.at(-1)!)] ?? "application/octet-stream",
        "cache-control": cacheControl,
      },
    });
  } catch {
    return notFound();
  }
}
