import { z } from "zod";
import type { Release } from "./application/release-check";

const LATEST_URL =
  "https://api.github.com/repos/schellingboard/schellingboard/releases/latest";

const latestRelease = z.object({
  tag_name: z.string().min(1),
  published_at: z.string().optional(),
});

const OFF = ["false", "0", "no", "off"];

export async function fetchLatestRelease(): Promise<Release | null> {
  const setting = process.env.SB_UPDATE_CHECK?.trim().toLowerCase();
  if (setting && OFF.includes(setting)) return null;
  const res = await fetch(LATEST_URL, {
    headers: { accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
  const body = latestRelease.parse(await res.json());
  return {
    version: body.tag_name,
    date: body.published_at?.slice(0, 10) ?? null,
  };
}
