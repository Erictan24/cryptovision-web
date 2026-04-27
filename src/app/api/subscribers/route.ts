import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getActiveSubscriberIdsDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET — list telegram_id active subscribers. Auth via HMAC.
 *  Bot pakai endpoint ini untuk tahu siapa yang dapat notif signal. */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") || "";
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
  // HMAC of literal string "subscribers" — fixed identifier
  const expected = crypto.createHmac("sha256", botToken).update("subscribers").digest("hex");

  if (secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ids = await getActiveSubscriberIdsDb();
    return NextResponse.json({ ok: true, subscriber_ids: ids });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
