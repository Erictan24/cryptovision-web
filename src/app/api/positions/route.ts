import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  pushPositionDb,
  getPositionsDb,
  deletePositionDb,
  updatePositionStateDb,
} from "@/lib/db";

export const dynamic = "force-dynamic";

function verifyHmac(secret: string, symbol: string): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
  const expected = crypto.createHmac("sha256", botToken).update(symbol || "").digest("hex");
  return secret === expected;
}

/** GET — list semua running positions untuk dashboard */
export async function GET() {
  try {
    const rows = await getPositionsDb();
    return NextResponse.json({ ok: true, positions: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/** POST — bot push posisi baru (saat limit fills). HMAC auth. */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { secret, ...position } = body;

  if (!verifyHmac(secret, position.symbol || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await pushPositionDb(position);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/** PATCH — bot update state posisi (TP1 hit, BEP active, SL move). */
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { secret, symbol, ...opts } = body;

  if (!verifyHmac(secret, symbol || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!symbol) {
    return NextResponse.json({ error: "missing_symbol" }, { status: 400 });
  }

  try {
    await updatePositionStateDb(symbol, opts);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/** DELETE — bot hapus posisi (saat trade close). HMAC auth via query secret. */
export async function DELETE(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") || "";
  const secret = req.nextUrl.searchParams.get("secret") || "";

  if (!verifyHmac(secret, symbol)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!symbol) {
    return NextResponse.json({ error: "missing_symbol" }, { status: 400 });
  }

  try {
    await deletePositionDb(symbol);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
