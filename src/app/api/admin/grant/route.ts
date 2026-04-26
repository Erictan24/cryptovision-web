import { NextRequest, NextResponse } from "next/server";
import { setSubscriptionDb, upsertUser } from "@/lib/db";

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
    return NextResponse.json({
      ok: true,
      message: `Granted ${planName} to user ${userId}`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
