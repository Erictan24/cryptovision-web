import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";

/** GET /api/init — Create database tables (run once) */
export async function GET() {
  try {
    await initDb();
    return NextResponse.json({ ok: true, message: "Tables created" });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
