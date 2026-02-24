import { NextResponse } from "next/server";
import { getDownloadCount, incrementDownloadCount } from "@/lib/download-store";

/** GET: Fetch current download count from persistent store */
export async function GET() {
  try {
    const value = await getDownloadCount();
    return NextResponse.json({ value });
  } catch {
    return NextResponse.json({ value: 0 });
  }
}

/** POST: Increment download count and persist */
export async function POST() {
  try {
    const value = await incrementDownloadCount();
    return NextResponse.json({ value }, { status: 200 });
  } catch {
    return NextResponse.json({ value: 0 }, { status: 500 });
  }
}
