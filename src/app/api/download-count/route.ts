import { NextResponse } from "next/server";

const COUNTAPI_HIT =
  process.env.NEXT_PUBLIC_TRACK_DOWNLOAD_URL ?? "https://api.countapi.xyz/hit/resume-project/downloads";
const COUNTAPI_GET = COUNTAPI_HIT.replace("/hit/", "/get/");

/** GET: Fetch current download count (proxies CountAPI to avoid CORS on deployed domains) */
export async function GET() {
  try {
    const res = await fetch(COUNTAPI_GET);
    if (!res.ok) return NextResponse.json({ value: 0 });
    const json = await res.json();
    return NextResponse.json({ value: typeof json?.value === "number" ? json.value : 0 });
  } catch {
    return NextResponse.json({ value: 0 });
  }
}

/** POST: Increment download count (proxies CountAPI hit to avoid CORS) */
export async function POST() {
  try {
    await fetch(COUNTAPI_HIT);
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
