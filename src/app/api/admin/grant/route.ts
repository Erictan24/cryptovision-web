import { NextRequest, NextResponse } from "next/server";
import { setSubscriptionDb, upsertUser, getSubscriptionDb, getUserEmailDb } from "@/lib/db";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";

/**
 * POST /api/admin/grant
 * Manual grant subscription untuk admin/recovery.
 *
 * Body: { adminKey, userId, plan, planName, userName? }
 * adminKey harus match env var ADMIN_API_KEY.
 *
 * Use case: restore Lifetime subscription yang hilang karena bug expiry 30 hari.
 */
export async function POST(req: NextRequest) {
  const { adminKey, userId, plan, planName, userName, username } = await req.json();

  const expected = process.env.ADMIN_API_KEY || "";
  if (!expected || adminKey !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId || !plan || !planName) {
    return NextResponse.json(
      { error: "Missing fields: userId, plan, planName required" },
      { status: 400 }
    );
  }

  try {
    await upsertUser(Number(userId), userName || "User", username);
    await setSubscriptionDb(Number(userId), plan, planName);

    // Send welcome email kalau user punya email tersimpan. Best-effort,
    // fail-silent — gagal kirim email tidak block grant.
    try {
      const email = await getUserEmailDb(Number(userId));
      const sub = await getSubscriptionDb(Number(userId));
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
        sendEmail({ to: email, subject, html }).catch((e) =>
          console.warn("[admin/grant] welcome email send failed", e)
        );
      }
    } catch (e) {
      console.warn("[admin/grant] welcome email lookup failed", e);
    }

    return NextResponse.json({
      ok: true,
      message: `Granted ${planName} to user ${userId}`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
