/**
 * Persistent download count store.
 * Uses Upstash Redis when env vars are set (required for Amplify/Vercel/serverless).
 * Falls back to file-based store for local dev when env vars are not set.
 */

const KEY = "resume-downloads";

/** Upstash Redis REST API - works on serverless (Amplify, Vercel) */
async function upstashGet(): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return -1;
  try {
    const res = await fetch(`${url}/get/${KEY}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return -1;
    const json = await res.json();
    const val = json?.result;
    if (val === null || val === undefined) return 0;
    return typeof val === "string" ? parseInt(val, 10) || 0 : (val as number);
  } catch {
    return -1;
  }
}

async function upstashIncr(): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return -1;
  try {
    const res = await fetch(`${url}/incr/${KEY}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return -1;
    const json = await res.json();
    const val = json?.result;
    return typeof val === "number" ? val : -1;
  } catch {
    return -1;
  }
}

/** File-based store for local dev only (does not persist on Amplify/Vercel serverless) */
import { promises as fs } from "fs";
import path from "path";

function getDataPath(): string {
  return path.join(process.cwd(), "data", "downloads.json");
}

async function fileGet(): Promise<number> {
  try {
    const raw = await fs.readFile(getDataPath(), "utf-8");
    const json = JSON.parse(raw);
    return typeof json?.count === "number" ? json.count : 0;
  } catch {
    return 0;
  }
}

async function fileIncr(): Promise<number> {
  try {
    const p = getDataPath();
    const dir = path.dirname(p);
    await fs.mkdir(dir, { recursive: true });
    let count = 0;
    try {
      const raw = await fs.readFile(p, "utf-8");
      const json = JSON.parse(raw);
      count = typeof json?.count === "number" ? json.count : 0;
    } catch {
      /* file doesn't exist yet */
    }
    count += 1;
    await fs.writeFile(p, JSON.stringify({ count, updatedAt: new Date().toISOString() }), "utf-8");
    return count;
  } catch {
    return -1;
  }
}

/** Get current download count */
export async function getDownloadCount(): Promise<number> {
  const upstash = await upstashGet();
  if (upstash >= 0) return upstash;
  return fileGet();
}

/** Increment download count and return new value */
export async function incrementDownloadCount(): Promise<number> {
  const upstash = await upstashIncr();
  if (upstash >= 0) return upstash;
  return fileIncr();
}
