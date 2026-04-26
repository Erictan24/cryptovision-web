import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pushSignalDb, getSignalsDb, updateSignalStatusDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function verifyHmac(secret: string, symbol: string): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
  const expected = crypto.createHmac("sha256", botToken).update(symbol || "").digest("hex");
  return secret === expected;
}

/** GET — list signals untuk dashboard */
export async function GET(req: NextRequest) {
  const limit  = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  const status = req.nextUrl.searchParams.get("status") || undefined;
  try {
    const rows = await getSignalsDb(limit, status);
    return NextResponse.json({ ok: true, signals: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/** POST — bot push new signal. Auth via HMAC dengan TELEGRAM_BOT_TOKEN. */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { secret, ...signal } = body;

  if (!verifyHmac(secret, signal.symbol || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await pushSignalDb(signal);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/** PATCH — bot update status signal (pending → filled / closed / cancelled). */
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { secret, symbol, status } = body;

  if (!verifyHmac(secret, symbol || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!symbol || !status) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    await updateSignalStatusDb(symbol, status);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
