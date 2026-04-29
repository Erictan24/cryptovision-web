import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pushTradeDb, getTradesDb, deleteTradeBySymbolDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function verifyHmac(secret: string, symbol: string): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
  const expected = crypto.createHmac("sha256", botToken).update(symbol || "").digest("hex");
  return secret === expected;
}

/** GET — list trades closed. Param ?hours= untuk filter window. */
export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");
  const hoursParam = req.nextUrl.searchParams.get("hours");
  const hours = hoursParam ? parseInt(hoursParam) : undefined;
  try {
    const rows = await getTradesDb(limit, hours);
    return NextResponse.json({ ok: true, trades: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/** POST — bot push new closed trade */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { secret, ...trade } = body;

  if (!verifyHmac(secret, trade.symbol || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await pushTradeDb(trade);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/**
 * DELETE — hapus trade entry yang salah ke-push (recovery race condition bug).
 * Query params:
 *   symbol   — coin symbol (wajib)
 *   secret   — HMAC dari TELEGRAM_BOT_TOKEN + symbol (wajib)
 *   hours    — window lookback (default 48)
 *   limit    — max baris yang dihapus (default 1, max 5)
 */
export async function DELETE(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") || "";
  const secret = req.nextUrl.searchParams.get("secret") || "";
  const hours = Math.max(1, parseInt(req.nextUrl.searchParams.get("hours") || "48"));
  const limit = Math.min(5, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || "1")));

  if (!verifyHmac(secret, symbol)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!symbol) {
    return NextResponse.json({ error: "missing_symbol" }, { status: 400 });
  }

  try {
    const deleted = await deleteTradeBySymbolDb(symbol, hours, limit);
    return NextResponse.json({ ok: true, deleted });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
