import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pushTradeDb, getTradesDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET — list trades closed */
export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");
  try {
    const rows = await getTradesDb(limit);
    return NextResponse.json({ ok: true, trades: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/** POST — bot push new closed trade */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { secret, ...trade } = body;

  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
  const expected = crypto.createHmac("sha256", botToken).update(trade.symbol || "").digest("hex");
  if (secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await pushTradeDb(trade);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
