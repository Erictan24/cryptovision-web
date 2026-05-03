import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth";
import { setSubscriptionDb, getSubscriptionDb, upsertUser, getUserEmailDb } from "@/lib/db";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";

/** GET — check subscription status */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const secret = req.nextUrl.searchParams.get("secret");

  if (userId && secret) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    const expected = crypto.createHmac("sha256", botToken).update(userId).digest("hex");
    if (secret !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const sub = await getSubscriptionDb(Number(userId));
    return NextResponse.json({ subscription: sub });
  }

  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const sub = await getSubscriptionDb(user.id);
  return NextResponse.json({ subscription: sub });
}

/** POST — activate subscription (called by bot after /verify) */
export async function POST(req: NextRequest) {
  const { userId, plan, planName, secret, userName, username } = await req.json();
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
  const expected = crypto.createHmac("sha256", botToken).update(String(userId)).digest("hex");
  if (secret !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ensure user exists in DB
  await upsertUser(userId, userName || "User", username);

  await setSubscriptionDb(userId, plan, planName);
  const sub = await getSubscriptionDb(userId);

  // Send welcome email kalau user input email saat checkout. Best-effort,
  // fail-silent (RESEND_API_KEY tidak set / error tidak block subscription).
  try {
    const email = await getUserEmailDb(userId);
    if (email && sub) {
      const expiresStr = new Date(sub.expires_at).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
      });
      const { subject, html } = welcomeEmailHtml({
        userName: userName || "User",
        planName: planName,
        expiresAt: expiresStr,
        locale: "id",
      });
      // Fire and forget — response cepat, email async
      sendEmail({ to: email, subject, html }).catch((e) =>
        console.warn("[subscription] welcome email send failed", e)
      );
    }
  } catch (e) {
    console.warn("[subscription] welcome email lookup failed", e);
  }

  return NextResponse.json({ ok: true, subscription: sub });
}
