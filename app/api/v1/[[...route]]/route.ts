import { api } from "@/server/http/app";

export const dynamic = "force-dynamic";

const handle = (request: Request) => api.fetch(request);

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
// Hono answers OPTIONS (404), as it will once Next is gone. Add hono/cors to the
// app in server/http/ only when a browser client on another origin needs the API.
export const OPTIONS = handle;
export const HEAD = handle;
