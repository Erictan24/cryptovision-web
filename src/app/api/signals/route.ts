import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pushSignalDb, getSignalsDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET — list signals untuk dashboard */
export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  try {
    const rows = await getSignalsDb(limit);
    return NextResponse.json({ ok: true, signals: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/** POST — bot push new signal. Auth via HMAC dengan TELEGRAM_BOT_TOKEN. */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { secret, ...signal } = body;

  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
  const expected = crypto.createHmac("sha256", botToken).update(signal.symbol || "").digest("hex");
  if (secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await pushSignalDb(signal);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
