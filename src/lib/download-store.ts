/**
 * Persistent download count store using a global JSON file.
 */

import { promises as fs } from "fs";
import path from "path";

function getDataPath(): string {
  return path.join(process.cwd(), "data", "downloads.json");
}

/** Get current download count */
export async function getDownloadCount(): Promise<number> {
  try {
    const raw = await fs.readFile(getDataPath(), "utf-8");
    const json = JSON.parse(raw);
    return typeof json?.count === "number" ? json.count : 0;
  } catch {
    return 0;
  }
}

/** Increment download count and return new value */
export async function incrementDownloadCount(): Promise<number> {
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
