import { NextResponse } from "next/server";
import { getPerformanceStatsDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 60;

/** GET — public stats untuk landing page widget */
export async function GET() {
  try {
    const stats = await getPerformanceStatsDb();
    return NextResponse.json({ ok: true, stats });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
