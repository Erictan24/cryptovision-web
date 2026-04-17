import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth";
import { setSubscription, getSubscription } from "@/lib/subscriptions";

/** GET — check subscription status for logged-in user */
export async function GET(req: NextRequest) {
  // Check if request is from bot (with userId param)
  const userId = req.nextUrl.searchParams.get("userId");
  const secret = req.nextUrl.searchParams.get("secret");

  if (userId && secret) {
    // Bot query
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    const expected = crypto
      .createHmac("sha256", botToken)
      .update(userId)
      .digest("hex");
    if (secret !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sub = getSubscription(Number(userId));
    return NextResponse.json({ subscription: sub });
  }

  // User query (from dashboard)
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const sub = getSubscription(user.id);
  return NextResponse.json({ subscription: sub });
}

/** POST — activate subscription (called by bot after /verify) */
export async function POST(req: NextRequest) {
  const { userId, plan, planName, secret } = await req.json();

  // Verify request from bot
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
  const expected = crypto
    .createHmac("sha256", botToken)
    .update(String(userId))
    .digest("hex");

  if (secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = setSubscription(userId, plan, planName);
  return NextResponse.json({ ok: true, subscription: sub });
}
