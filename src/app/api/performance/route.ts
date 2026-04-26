import { NextResponse } from "next/server";
import { getDetailedStatsDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 60;

/** GET — detailed stats untuk Statistics page (all-time, semua trade closed). */
export async function GET() {
  try {
    const data = await getDetailedStatsDb();
    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
